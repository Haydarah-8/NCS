/* Admin sign-in, by ?action=:
     (none)        sign in with email and password
     forgot        email a password reset link
     set-password  choose a password from a reset or invite link, then sign in
   Ten failed attempts from one address in fifteen minutes locks it out for
   the rest of the window. */

import { authConfigured, isNcsAdmin, sendReset, setPassword, signInWithPassword } from "@/lib/server/auth";
import { getSql } from "@/lib/server/db";
import { audit, clip, guard, ipKey, isAdmin, json, readBody } from "@/lib/server/http";
import { cookieHeader, secret, sign } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_DEV = () => process.env.NODE_ENV === "development" && !authConfigured();
const signedIn = async () => json({ ok: true }, 200, { "set-cookie": cookieHeader(await sign("admin")) });
const NOT_ADMIN = "This account doesn't have access to the admin panel.";

export async function GET(request: Request) {
  const role = await isAdmin(request);
  return json({ signedIn: Boolean(role), localDev: LOCAL_DEV() });
}

export function POST(request: Request) {
  return guard(async () => {
    if (!secret()) return json({ error: "Sign-in is not set up yet (ADMIN_SECRET)." }, 503);
    const action = new URL(request.url).searchParams.get("action");
    const d = await readBody(request);
    const email = clip(d.email, 200).toLowerCase();
    const ua = clip(request.headers.get("user-agent"), 80);

    const sql = await getSql();
    const [{ fails }] = await sql`
      select count(*)::int as fails from admin_log
      where action = 'sign in' and ok = false and ip = ${ipKey(request)} and ts > now() - interval '15 minutes'`;
    if (fails >= 10) return json({ error: "Too many attempts. Try again in 15 minutes." }, 429);

    if (action === "forgot") {
      if (!email.includes("@")) return json({ error: "Enter your email address." }, 400);
      if (authConfigured()) await sendReset(email, `${new URL(request.url).origin}/admin/login.html`);
      await audit("password reset", true, request, email);
      // The same answer whether or not the account exists.
      return json({ ok: true });
    }

    if (action === "set-password") {
      const password = typeof d.password === "string" ? d.password : "";
      if (password.length < 10) return json({ error: "Use at least 10 characters." }, 400);
      const r = await setPassword(clip(d.access_token, 4000), password);
      if ("error" in r) return json({ error: r.error }, r.status);
      const ok = isNcsAdmin(r.user);
      await audit("sign in", ok, request, `${r.user.email} · new password${ok ? "" : " · not an admin"}`);
      return ok ? signedIn() : json({ error: NOT_ADMIN }, 403);
    }

    // Local development with no Supabase project set: any email opens the panel.
    if (LOCAL_DEV()) {
      if (!email) return json({ error: "Enter any email address (local development)." }, 400);
      await audit("sign in", true, request, `${email} · local development`);
      return signedIn();
    }

    const password = typeof d.password === "string" ? d.password : "";
    if (!email || !password) return json({ error: "Enter your email and password." }, 400);
    const r = await signInWithPassword(email, password);
    if ("error" in r) {
      await audit("sign in", false, request, `${email} · ${ua}`);
      return json({ error: r.error }, r.status);
    }
    if (!isNcsAdmin(r.user)) {
      await audit("sign in", false, request, `${email} · not an admin`);
      return json({ error: NOT_ADMIN }, 403);
    }
    await audit("sign in", true, request, `${email} · ${ua}`);
    return signedIn();
  });
}
