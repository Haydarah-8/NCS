/* An enquiry from the contact form. It is saved for the admin panel's
   inbox; the visitor's email app still opens with the message, so nothing
   depends on this succeeding. A hidden field catches robots, and one
   visitor can send five an hour. */

import { getSql } from "@/lib/server/db";
import { clip, guard, isBot, json, place, readBody, visitorId } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return guard(async () => {
    const ua = request.headers.get("user-agent") || "";
    const d = await readBody(request);
    if (isBot(ua) || clip(d.website)) return json({ ok: true });

    const lead = {
      name: clip(d.name, 120),
      email: clip(d.email, 200),
      phone: clip(d.phone, 60),
      company: clip(d.company, 160),
      site: clip(d.site, 80),
      location: clip(d.location, 200),
      cover_when: clip(d.when, 80),
      message: clip(d.message, 5000),
      source: clip(d.source, 40) || "contact",
      page: clip(d.page, 300) || null,
    };
    if (!lead.name || !(lead.email || lead.phone) || !lead.message) return json({ error: "Name, a way to reply and a message are needed." }, 400);

    const sql = await getSql();
    const visitor = visitorId(request);
    const [{ recent }] = await sql`select count(*)::int as recent from leads where visitor = ${visitor} and ts > now() - interval '1 hour'`;
    if (recent >= 5) return json({ error: "Too many enquiries at once. Please call us instead." }, 429);

    const { country } = place(request);
    await sql.transaction([
      sql`insert into leads (name, email, phone, company, site, location, cover_when, message, source, page, visitor, country)
        values (${lead.name}, ${lead.email}, ${lead.phone}, ${lead.company}, ${lead.site}, ${lead.location},
                ${lead.cover_when}, ${lead.message}, ${lead.source}, ${lead.page}, ${visitor}, ${country})`,
      // Counted with the calls and emails as a conversion.
      sql`insert into events (name, path, label, visitor, country, device) values ('enquiry', ${lead.page}, ${lead.site}, ${visitor}, ${country}, ${null})`,
    ]);
    return json({ ok: true });
  });
}
