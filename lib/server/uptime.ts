/* One uptime check: fetch the home page, note whether it answered and how
   quickly, and keep the result. Run by the scheduled job (app/api/uptime)
   and by "Check now" in the admin panel. */

import { getSql } from "./db";

export function siteUrl(request: Request) {
  const fromEnv = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return (fromEnv || new URL(request.url).origin).replace(/\/+$/, "") + "/";
}

export async function checkUptime(url: string, source: string) {
  const started = Date.now();
  let status = 0;
  try {
    const res = await fetch(url, { cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(10_000), headers: { "user-agent": "NCS uptime monitor" } });
    status = res.status;
    await res.arrayBuffer();
  } catch {
    status = 0;
  }
  const ms = Date.now() - started;
  const ok = status >= 200 && status < 400;
  const sql = await getSql();
  const [row] = await sql`insert into uptime_checks (url, ok, status, ms, source) values (${url}, ${ok}, ${status || null}, ${ms}, ${source}) returning ts, url, ok, status, ms, source`;
  return row;
}
