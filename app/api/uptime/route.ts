/* The scheduled uptime check (vercel.json "crons"). Vercel calls it with
   "Authorization: Bearer <CRON_SECRET>"; the signed-in admin may call it
   too, which is what "Check now" does. */

import { guard, isAdmin, json } from "@/lib/server/http";
import { checkUptime, siteUrl } from "@/lib/server/uptime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return guard(async () => {
    const cron = process.env.CRON_SECRET && request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
    if (!cron && !(await isAdmin(request))) return json({ error: "Signed out" }, 401);
    return json({ check: await checkUptime(siteUrl(request), cron ? "schedule" : "manual") });
  });
}
