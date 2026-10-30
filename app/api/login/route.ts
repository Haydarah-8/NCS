/* Admin sign-in, by ?action=:
     (none)        sign in with email and password
     forgot        email a password reset link
     set-password  choose a password from a reset link, then sign in
   Supabase checks the password; the accounts table decides whether the
   person may come in and what they can open. Ten failed attempts from one
   address in fifteen minutes locks it out for the rest of the window. */

import { sectionsFor } from "@/lib/server/access";
import { authConfigured, sendReset, setPassword, signInWithPassword } from "@/lib/server/auth";
import { getSql, type Row, type Sql } from "@/lib/server/db";
import { audit, clip, guard, ipKey, isAdmin, json, readBody } from "@/lib/server/http";
import { cookieHeader, secret, sign } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_DEV = () => process.env.NODE_ENV === "development" && !authConfigured();
const NO_ACCESS = "This account doesn't have access to the admin panel.";
const SWITCHED_OFF = "This account has been switched off. Ask your administrator.";

async function signedIn(sql: Sql, a: Row) {
  await sql`update accounts set last_seen = now() where id = ${a.id}`;
  const token = await sign({ id: Number(a.id), role: a.role, sections: sectionsFor(a.role, a.access) });
  return json({ ok: true, mustChange: Boolean(a.must_change) }, 200, { "set-cookie": cookieHeader(token) });
}

/* The account for a Supabase user: by its id, or by email the first time
   (when the link is made). */
async function accountFor(sql: Sql, authId: string, email: string) {
  const [a] = await sql`select * from accounts where auth_id = ${authId} or lower(email) = ${email} order by (auth_id = ${authId}) desc limit 1`;
  if (a && !a.auth_id) await sql`update accounts set auth_id = ${authId} where id = ${a.id}`;
  return a;
}

export async function GET(request: Request) {
  const s = await isAdmin(request);
  return json({ signedIn: Boolean(s), localDev: LOCAL_DEV() });
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
    // Attempts on the developer's email stay out of everyone else's log.
    const [knownRow] = email ? await sql`select id, role from accounts where lower(email) = ${email}` : [];
    const known = knownRow ? { id: Number(knownRow.id), role: String(knownRow.role) } : null;

    if (action === "forgot") {
      if (!email.includes("@")) return json({ error: "Enter your email address." }, 400);
      if (authConfigured() && known) await sendReset(email, `${new URL(request.url).origin}/admin/login.html`);
      await audit("password reset", true, request, email, known);
      // The same answer whether or not the account exists.
      return json({ ok: true });
    }

    if (action === "set-password") {
      const password = typeof d.password === "string" ? d.password : "";
      if (password.length < 10) return json({ error: "Use at least 10 characters." }, 400);
      const r = await setPassword(clip(d.access_token, 4000), password);
      if ("error" in r) return json({ error: r.error }, r.status);
      const a = await accountFor(sql, r.user.id, (r.user.email || "").toLowerCase());
      if (!a) return json({ error: NO_ACCESS }, 403);
      if (!a.active) return json({ error: SWITCHED_OFF }, 403);
      await sql`update accounts set must_change = false where id = ${a.id}`;
      await audit("sign in", true, request, `${a.email} · new password`, a as { id: number; role: string });
      return signedIn(sql, { ...a, must_change: false });
    }

    // Local development with no Supabase project: any email opens the panel.
    // The first one becomes the developer; later ones sign in as themselves.
    if (LOCAL_DEV()) {
      if (!email) return json({ error: "Enter any email address (local development)." }, 400);
      let [a] = await sql`select * from accounts where lower(email) = ${email}`;
      if (!a) {
        const [{ n }] = await sql`select count(*)::int as n from accounts`;
        [a] = await sql`insert into accounts (email, name, role) values (${email}, ${email.split("@")[0]}, ${n ? "employee" : "developer"}) returning *`;
      }
      if (!a.active) return json({ error: SWITCHED_OFF }, 403);
      await audit("sign in", true, request, `${email} · local development`, a as { id: number; role: string });
      return signedIn(sql, a);
    }

    const password = typeof d.password === "string" ? d.password : "";
    if (!email || !password) return json({ error: "Enter your email and password." }, 400);
    const r = await signInWithPassword(email, password);
    if ("error" in r) {
      await audit("sign in", false, request, `${email} · ${ua}`, known);
      return json({ error: r.error }, r.status);
    }
    const a = await accountFor(sql, r.user.id, email);
    if (!a) {
      await audit("sign in", false, request, `${email} · no account`);
      return json({ error: NO_ACCESS }, 403);
    }
    if (!a.active) {
      await audit("sign in", false, request, `${email} · switched off`, a as { id: number; role: string });
      return json({ error: SWITCHED_OFF }, 403);
    }
    await audit("sign in", true, request, `${email} · ${ua}`, a as { id: number; role: string });
    return signedIn(sql, a);
  });
}
