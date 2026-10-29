/* The admin session: a cookie holding an expiry time and a role
   (administrator, management or officer) signed with ADMIN_SECRET
   (HMAC-SHA256). Web Crypto only, so the same code runs in the middleware
   and in the route handlers. */

export const COOKIE = "ncs_admin";
export const HOURS = 12;
export const ROLES = ["admin", "manager", "officer"] as const;
export type Role = (typeof ROLES)[number];

/* In local development without a secret, a fixed one stands in, so the
   panel can be tried before anything is configured. Never in production. */
export function secret() {
  return process.env.ADMIN_SECRET || (process.env.NODE_ENV === "development" ? "ncs-local-development-only" : "");
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(text: string, key: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", k, enc.encode(text)));
}

/* Equal-time comparison, so a wrong signature takes as long as a right one. */
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function sign(role: Role = "admin", hours = HOURS) {
  const body = `${Math.floor(Date.now() / 1000) + hours * 3600}.${b64url(crypto.getRandomValues(new Uint8Array(9)))}.${ROLES.includes(role) ? role : "officer"}`;
  return `${body}.${await hmac(body, secret())}`;
}

/* The session's role, or false when there is no valid session. */
export async function verify(token: string | undefined | null): Promise<Role | false> {
  const key = secret();
  if (!token || !key) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const sig = parts.pop()!;
  const [exp, , role] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000 || !ROLES.includes(role as Role)) return false;
  return same(sig, await hmac(parts.join("."), key)) ? (role as Role) : false;
}

export function readCookie(request: Request, name = COOKIE) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return "";
}

/* Secure cookies are refused on plain http://localhost by some browsers, so
   the flag is left off in development only. */
export function cookieHeader(token: string, maxAge = HOURS * 3600) {
  const secure = process.env.NODE_ENV === "development" ? "" : " Secure;";
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly;${secure} SameSite=Strict; Max-Age=${maxAge}`;
}
