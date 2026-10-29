/* Admin sign-in with Supabase Auth: email and password.

   Supabase checks the password; this panel then checks that the account is
   an admin, which only the server can grant (app_metadata.ncs_admin, set by
   scripts/add-admin.mjs with the service role key). Anyone else with a
   Supabase account for this project is turned away. After that the panel
   keeps its own signed session cookie (lib/server/session.ts). */

type User = { id: string; email?: string; app_metadata?: Record<string, unknown> };
type Result = { user: User } | { error: string; status: number };

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") || "";
const key = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const authConfigured = () => Boolean(url() && key());
export const isNcsAdmin = (user: User) => user.app_metadata?.ncs_admin === true;

async function call(path: string, init: RequestInit & { token?: string } = {}) {
  const res = await fetch(`${url()}/auth/v1${path}`, {
    ...init,
    headers: { apikey: key(), "content-type": "application/json", ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

const message = (data: Record<string, unknown>) => String(data.error_description || data.msg || data.message || data.error || "");

export async function signInWithPassword(email: string, password: string): Promise<Result> {
  const { res, data } = await call("/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
  if (res.ok && data.user) return { user: data.user };
  if (res.status === 400 || res.status === 401) {
    return { error: /confirm/i.test(message(data)) ? "Confirm your email address first, using the link we sent you." : "That email and password don't match.", status: 401 };
  }
  if (res.status === 429) return { error: "Too many attempts. Try again in a few minutes.", status: 429 };
  return { error: "Sign-in isn't available right now. Try again shortly.", status: 503 };
}

/* Sends a password reset email; the link comes back to the sign-in page. */
export async function sendReset(email: string, redirectTo: string) {
  await call(`/recover?redirect_to=${encodeURIComponent(redirectTo)}`, { method: "POST", body: JSON.stringify({ email }) });
}

/* Sets a new password with the one-time token from a reset or invite link. */
export async function setPassword(accessToken: string, password: string): Promise<Result> {
  const { res, data } = await call("/user", { method: "PUT", token: accessToken, body: JSON.stringify({ password }) });
  if (res.ok && data.id) return { user: data };
  if (res.status === 401 || res.status === 403) return { error: "That link has expired. Ask for a new one.", status: 401 };
  if (res.status === 422) return { error: message(data) || "Choose a stronger password.", status: 400 };
  return { error: "That didn't work. Try again shortly.", status: 503 };
}
