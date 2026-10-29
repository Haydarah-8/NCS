/* Site analytics. Each public page sends a "view" when it opens, a "leave"
   with the seconds spent on it when it closes, and an "event" for the things
   that matter (a call, an email, an enquiry, an outbound link), and a
   "vitals" with how quickly the page loaded.

   Nothing personal is kept: no cookies, no addresses, just a visitor hash
   that changes every day (see visitorId). Robots and the signed-in admin are
   not counted. The reply carries the site announcement, so a page needs
   only the one request. */

import { getSql, type Sql } from "@/lib/server/db";
import { clip, device, guard, isAdmin, isBot, json, place, readBody, visitorId } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVENTS = new Set(["call", "email", "outbound", "enquiry"]);

async function announcement(sql: Sql) {
  const [row] = await sql`select value from settings where key = 'announcement'`;
  const a = row?.value;
  if (!a?.on || !a.text) return null;
  if (a.until && new Date(a.until) < new Date()) return null;
  return { text: a.text, link: a.link || "", label: a.label || "" };
}

function referrerHost(ref: string, own: string) {
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    return host && host !== own ? host : null;
  } catch {
    return null;
  }
}

export function POST(request: Request) {
  return guard(async () => {
    const sql = await getSql();
    const ua = request.headers.get("user-agent") || "";
    const data = await readBody(request);
    const skip = isBot(ua) || Boolean(await isAdmin(request));
    const visitor = visitorId(request);

    if (data.type === "leave") {
      const id = Number(data.id);
      const seconds = Math.max(0, Math.min(3600, Math.round(Number(data.seconds) || 0)));
      if (!skip && Number.isInteger(id) && id > 0) {
        await sql`update views set duration = ${seconds} where id = ${id} and visitor = ${visitor}`;
      }
      return new Response(null, { status: 204 });
    }

    /* The page's real speed for this visitor, once it has loaded. */
    if (data.type === "vitals") {
      const id = Number(data.id);
      const ms = (v: unknown) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.min(120_000, Math.round(Number(v))) : null);
      if (!skip && Number.isInteger(id) && id > 0) {
        await sql`update views set ttfb = ${ms(data.ttfb)}, lcp = ${ms(data.lcp)}, load = ${ms(data.load)} where id = ${id} and visitor = ${visitor}`;
      }
      return new Response(null, { status: 204 });
    }

    if (data.type === "event") {
      const name = clip(data.name, 40);
      if (!skip && EVENTS.has(name)) {
        const { country } = place(request);
        await sql`insert into events (name, path, label, visitor, country, device)
          values (${name}, ${clip(data.path, 300)}, ${clip(data.label, 200)}, ${visitor}, ${country}, ${device(ua).kind})`;
      }
      return new Response(null, { status: 204 });
    }

    const note = await announcement(sql);
    if (skip || data.type !== "view") return json({ announcement: note });

    const path = clip(data.path, 300);
    if (!path.startsWith("/") || /^\/(admin|manage|officer|api)(\/|$)/.test(path)) return json({ announcement: note });
    const own = new URL(request.url).hostname.replace(/^www\./, "");
    const { country, city } = place(request);
    const d = device(ua);
    const [row] = await sql`
      insert into views (path, title, referrer, utm_source, utm_medium, utm_campaign, country, city, device, browser, os, visitor)
      values (${path}, ${clip(data.title, 200)}, ${referrerHost(clip(data.referrer, 500), own)},
              ${clip(data.utm_source, 100) || null}, ${clip(data.utm_medium, 100) || null}, ${clip(data.utm_campaign, 100) || null},
              ${country}, ${city}, ${d.kind}, ${d.browser}, ${d.os}, ${visitor})
      returning id`;
    return json({ id: row.id, announcement: note });
  });
}
