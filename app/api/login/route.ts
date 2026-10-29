/* Sign in with the admin access code. Eight wrong codes
   from one address in fifteen minutes locks that address out for the rest
   of the window. */

import { checkCode } from "@/lib/server/codes.mjs";
import { getSql } from "@/lib/server/db";
import { audit, clip, guard, ipKey, isAdmin, json, readBody } from "@/lib/server/http";
import { cookieHeader, secret, sign, type Role } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const role = await isAdmin(request);
  return json({ signedIn: Boolean(role), role: role || null });
}

export function POST(request: Request) {
  return guard(async () => {
    if (!secret()) return json({ error: "Sign-in is not set up yet (ADMIN_SECRET)." }, 503);
    const sql = await getSql();
    const { code } = await readBody(request);
    const [{ fails }] = await sql`
      select count(*)::int as fails from admin_log
      where action = 'sign in' and ok = false and ip = ${ipKey(request)} and ts > now() - interval '15 minutes'`;
    if (fails >= 8) return json({ error: "Too many wrong codes. Try again in 15 minutes." }, 429);

    const [row] = await sql`select value from settings where key = 'access_code'`;
    const role: Role | null = typeof code === "string" && code.length <= 100 && (await checkCode(code, row?.value)) ? "admin" : null;
    await audit("sign in", Boolean(role), request, `${role || "refused"} · ${clip(request.headers.get("user-agent"), 100)}`);
    if (!role) return json({ error: "That code isn’t right." }, 401);

    return json({ ok: true, role }, 200, { "set-cookie": cookieHeader(await sign(role)) });
  });
}
