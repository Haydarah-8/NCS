/* What every API route shares: JSON replies, the session check, and what
   can be learnt about a visitor without keeping anything personal. */

import { createHash } from "node:crypto";
import { geolocation, ipAddress } from "@vercel/functions";
import { DatabaseTimeout, getSql, NotConfigured } from "./db";
import { readCookie, secret, verify } from "./session";

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readBody(request: Request): Promise<Record<string, any>> {
  try {
    const text = await request.text();
    const body = text.length > 200_000 ? {} : JSON.parse(text || "{}");
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

/* The signed-in role ("admin", "manager" or "officer"), or false. */
export const isAdmin = (request: Request) => verify(readCookie(request));

/* A string from the visitor, trimmed and cut to length. */
export function clip(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/* Runs a handler, turning a missing database into a plain 503. */
export async function guard(work: () => Promise<Response>) {
  try {
    return await work();
  } catch (error) {
    if (error instanceof NotConfigured) {
      return json({ error: "The admin database is not set up yet (DATABASE_URL and ADMIN_SECRET)." }, 503);
    }
    if (error instanceof DatabaseTimeout) return json({ error: "The database didn't answer in time. Try again in a moment." }, 504);
    console.error(error);
    return json({ error: "Something went wrong." }, 500);
  }
}

/* ---------- The visitor, anonymously ---------- */

const short = (text: string) => createHash("sha256").update(text).digest("hex").slice(0, 16);
const ip = (request: Request) => ipAddress(request) || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "?";

/* The same person on the same day gives the same hash; tomorrow it changes,
   and the address it came from is never stored. No cookies, no storage. */
export function visitorId(request: Request) {
  const day = new Date().toISOString().slice(0, 10);
  return short(`${secret()}|${day}|${ip(request)}|${request.headers.get("user-agent") || ""}`);
}

export const ipKey = (request: Request) => short(`${secret()}|ip|${ip(request)}`);

export function place(request: Request) {
  const g = geolocation(request) || {};
  const decode = (s?: string) => {
    try {
      return s ? decodeURIComponent(s) : null;
    } catch {
      return s || null;
    }
  };
  return { country: g.country || null, city: decode(g.city) };
}

export function device(ua = "") {
  const kind = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua) ? "Tablet" : /Mobi|iPhone|iPod|Android/i.test(ua) ? "Mobile" : "Desktop";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS/.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Other";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Android/.test(ua)
          ? "Android"
          : /CrOS/.test(ua)
            ? "ChromeOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "Other";
  return { kind, browser, os };
}

export const isBot = (ua = "") =>
  !ua || /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|curl|wget|python|node-fetch|axios|monitor/i.test(ua);

export async function audit(action: string, ok: boolean, request: Request, detail = "") {
  const sql = await getSql();
  await sql`insert into admin_log (action, ok, ip, detail) values (${action}, ${ok}, ${ipKey(request)}, ${clip(detail, 200)})`;
}
