/* Admin accounts: who is signed in, what they can open, and the Supabase
   Auth side of making, changing and removing a sign-in. The accounts table
   decides access; Supabase only checks passwords. Creating or changing a
   sign-in uses SUPABASE_SERVICE_ROLE_KEY, which never leaves the server. */

import { randomInt } from "node:crypto";
import { sectionsFor, type Role, type Section } from "./access";
import { authConfigured } from "./auth";
import { getSql, type Row } from "./db";
import { json } from "./http";
import { readCookie, verify } from "./session";

export type Account = {
  id: number;
  auth_id: string | null;
  email: string;
  name: string;
  title: string;
  phone: string;
  role: Role;
  access: Section[];
  active: boolean;
  must_change: boolean;
  version: number;
  created_at: string;
  last_seen: string | null;
};

export const sectionsOf = (a: Pick<Account, "role" | "access">) => sectionsFor(a.role, a.access);

/* What the panel is told about an account. */
export const publicAccount = (a: Row) => ({
  id: Number(a.id),
  email: a.email,
  name: a.name,
  title: a.title,
  phone: a.phone,
  role: a.role,
  access: a.access || [],
  sections: sectionsFor(a.role, a.access),
  active: a.active,
  must_change: a.must_change,
  created_at: a.created_at,
  last_seen: a.last_seen,
});

/* The signed-in account, fresh from the database, or null. */
export async function sessionAccount(request: Request): Promise<Account | null> {
  const s = await verify(readCookie(request));
  if (!s) return null;
  const sql = await getSql();
  const [a] = await sql`select * from accounts where id = ${s.id}`;
  return a && a.active ? (a as Account) : null;
}

/* The signed-in account if it may open `section` (or just is signed in),
   otherwise the response to send instead. */
export async function requireAccount(request: Request, section?: Section): Promise<{ account: Account } | { response: Response }> {
  const account = await sessionAccount(request);
  if (!account) return { response: json({ error: "Signed out" }, 401) };
  if (section && !sectionsOf(account).includes(section)) return { response: json({ error: "You don't have access to this." }, 403) };
  return { account };
}

/* Same-site check for anything that changes data. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") || new URL(request.url).host;
  return !origin || new URL(origin).host === host;
}

/* ---------- Supabase Auth, with the service role ---------- */

const base = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") || "";
const service = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const canMakeSignIns = () => Boolean(base() && service());

async function admin(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${base()}/auth/v1${path}`, {
    method,
    headers: { apikey: service(), authorization: `Bearer ${service()}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(String(data.msg || data.message || data.error_description || `Supabase answered ${res.status}`));
  return data;
}

async function findAuthUser(email: string) {
  for (let page = 1; page < 20; page++) {
    const { users = [] } = await admin(`/admin/users?page=${page}&per_page=200`);
    const hit = users.find((u: { email?: string }) => u.email?.toLowerCase() === email);
    if (hit || users.length < 200) return hit as { id: string } | undefined;
  }
}

/* A password that's easy to read out and type: no 0/O or 1/l. */
export function tempPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const pick = (n: number) => Array.from({ length: n }, () => chars[randomInt(chars.length)]).join("");
  return `${pick(4)}-${pick(4)}-${pick(4)}`;
}

/* Makes (or reuses) the Supabase sign-in for an email, with this password.
   Returns the auth user id, or null in local development without Supabase. */
export async function upsertSignIn(email: string, password: string): Promise<string | null> {
  if (!authConfigured()) return null;
  if (!canMakeSignIns()) throw new Error("Accounts can't be created yet: SUPABASE_SERVICE_ROLE_KEY isn't set on the server.");
  const existing = await findAuthUser(email);
  if (existing) {
    await admin(`/admin/users/${existing.id}`, "PUT", { password, email_confirm: true, app_metadata: { ncs_admin: true } });
    return existing.id;
  }
  const user = await admin("/admin/users", "POST", { email, password, email_confirm: true, app_metadata: { ncs_admin: true } });
  return user.id;
}

export async function setSignInPassword(authId: string | null, password: string) {
  if (!authId || !authConfigured()) return;
  if (!canMakeSignIns()) throw new Error("Passwords can't be changed yet: SUPABASE_SERVICE_ROLE_KEY isn't set on the server.");
  await admin(`/admin/users/${authId}`, "PUT", { password });
}

export async function removeSignIn(authId: string | null) {
  if (!authId || !canMakeSignIns()) return;
  await admin(`/admin/users/${authId}`, "DELETE").catch(() => {});
}
