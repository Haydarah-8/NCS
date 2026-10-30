/* The Business Studio's data, by ?action=. Admin only, like /api/admin.

   GET   brand, documents, document, locations, campaigns, questions, home,
         search
   POST  brand-save, document-save, document-duplicate, document-delete,
         document-restore, location-save, location-delete, campaign-save,
         campaign-delete, lead-update, sample-load, sample-remove */

import { slugify } from "@/lib/md.js";
import { DEFAULT_BRAND, withDefaults } from "@/lib/server/brandkit";
import { getSql, type Row, type Sql } from "@/lib/server/db";
import { audit, clip, guard, isAdmin, json, readBody } from "@/lib/server/http";
import { SAMPLE } from "@/lib/server/sample";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOC_STATES = new Set(["draft", "reviewed", "approved"]);
const LEAD_STATES = new Set(["new", "contacted", "quoted", "won", "closed", "lost"]);
const daysOf = (p: URLSearchParams) => ([7, 30, 90, 365].includes(Number(p.get("days"))) ? Number(p.get("days")) : 30);
const SINCE = `(((now() at time zone 'Europe/London')::date - ($1::int - 1))::timestamp at time zone 'Europe/London')`;
const num = (v: unknown) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));
const jsonOf = (v: unknown) => JSON.stringify(v && typeof v === "object" ? v : {});

async function brand(sql: Sql) {
  const [row] = await sql`select value from settings where key = 'brandkit'`;
  return withDefaults(row?.value);
}

async function get(sql: Sql, action: string | null, p: URLSearchParams) {
  switch (action) {
    case "brand":
      return json({ brand: await brand(sql), defaults: DEFAULT_BRAND });
    case "integrations": {
      const url = process.env.DATABASE_URL || "";
      return json({
        database: url ? (/supabase/.test(url) ? "pooler connection" : /neon\.tech/.test(url) ? "Neon" : "Postgres") : "",
        auth: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)),
        cron: Boolean(process.env.CRON_SECRET),
        ai: Boolean(process.env.ANTHROPIC_API_KEY),
      });
    }
    case "documents":
      return json({ documents: await sql`select id, kind, title, status, lead_id, sample, favourite, created_at, updated_at, data->>'client' as client from documents order by updated_at desc limit 300` });
    case "document": {
      const id = Number(p.get("id"));
      const [doc] = await sql`select * from documents where id = ${id}`;
      if (!doc) return json({ error: "That document no longer exists." }, 404);
      const versions = await sql`select id, ts, status, note from document_versions where document_id = ${id} order by ts desc limit 50`;
      return json({ document: doc, versions });
    }
    case "locations":
      return json({ locations: await sql`select * from locations order by category, name` });
    case "campaigns": {
      const days = daysOf(p);
      const rows = await sql`select * from campaigns order by created_at desc`;
      // Visits: page views carrying the campaign tag. Enquiries: leads from a
      // visitor who arrived through the campaign that same day (the visitor
      // hash changes daily, so attribution is same-day only).
      const stats = await sql.query(
        `select v.utm_campaign as slug, count(*)::int as views, count(distinct v.visitor)::int as visitors,
           (select count(*)::int from leads l where l.visitor in (select visitor from views w where w.utm_campaign = v.utm_campaign and w.ts >= ${SINCE})) as enquiries
         from views v where v.utm_campaign is not null and v.ts >= ${SINCE} group by v.utm_campaign`,
        [days],
      );
      const by = Object.fromEntries(stats.map((s) => [s.slug, s]));
      return json({ campaigns: rows.map((c) => ({ ...c, views: by[c.slug]?.views || 0, visitors: by[c.slug]?.visitors || 0, enquiries: by[c.slug]?.enquiries || 0 })) });
    }
    case "questions": {
      const days = daysOf(p);
      const q = (text: string) => sql.query(text, [days]);
      const [services, byService, sources, funnel, byPage] = await sql.transaction([
        q(`select path, max(title) as title, count(distinct visitor)::int as visitors from views where ts >= ${SINCE} and path like '/services/%' group by path order by 3 desc limit 15`),
        q(`select coalesce(nullif(site, ''), 'Not given') as name, count(*)::int as enquiries from leads where ts >= ${SINCE} and kind = 'sales' group by 1 order by 2 desc`),
        q(`select coalesce((select case when v.utm_campaign is not null then 'Campaign: ' || v.utm_campaign when v.referrer is null then 'Direct' when v.referrer ~ '(google|bing|duckduckgo|yahoo|ecosia)' then 'Search' when v.referrer ~ '(facebook|instagram|linkedin|twitter|x\\.com|t\\.co|tiktok)' then 'Social' else 'Referral: ' || v.referrer end
             from views v where v.visitor = l.visitor order by v.ts asc limit 1), 'Unknown') as name, count(*)::int as enquiries
           from leads l where l.ts >= ${SINCE} group by 1 order by 2 desc limit 12`),
        q(`select count(distinct visitor)::int as visitors,
             count(distinct visitor) filter (where path in ('/our-details', '/contact') or path like '/services/%')::int as interested,
             count(distinct visitor) filter (where path in ('/our-details', '/contact'))::int as contact_page,
             (select count(*)::int from leads where ts >= ${SINCE}) as enquiries
           from views where ts >= ${SINCE}`),
        q(`select coalesce(page, 'Unknown') as name, count(*)::int as enquiries from leads where ts >= ${SINCE} group by 1 order by 2 desc limit 10`),
      ]);
      return json({ days, services, byService, sources, funnel: funnel[0], byPage });
    }
    case "home": {
      const [docs, due] = await sql.transaction([
        sql`select id, kind, title, status, favourite, updated_at from documents order by favourite desc, updated_at desc limit 8`,
        sql`select id, name, company, site, follow_up, status from leads where follow_up is not null and follow_up <= (now() at time zone 'Europe/London')::date + 2 and status not in ('won', 'closed', 'lost') order by follow_up limit 8`,
      ]);
      return json({ documents: docs, followUps: due });
    }
    case "search": {
      const term = `%${clip(p.get("q"), 60).toLowerCase()}%`;
      if (term.length < 4) return json({ results: [] });
      const [docs, leads, locs] = await sql.transaction([
        sql`select id, title, kind from documents where lower(title) like ${term} or lower(data::text) like ${term} order by updated_at desc limit 6`,
        sql`select id, name, company from leads where lower(coalesce(name,'') || ' ' || coalesce(company,'') || ' ' || coalesce(email,'') || ' ' || coalesce(message,'')) like ${term} order by ts desc limit 6`,
        sql`select id, name, category from locations where lower(name || ' ' || coalesce(address,'') || ' ' || coalesce(postcode,'')) like ${term} limit 6`,
      ]);
      return json({ results: [...docs.map((d) => ({ type: "document", ...d })), ...leads.map((l) => ({ type: "enquiry", ...l })), ...locs.map((x) => ({ type: "location", ...x }))] });
    }
    default:
      return json({ error: "Unknown action" }, 400);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function post(sql: Sql, action: string | null, d: Record<string, any>, request: Request) {
  switch (action) {
    case "brand-save": {
      const current = await brand(sql);
      const next = withDefaults({ ...current, ...(d.brand || {}), version: current.version + 1 });
      const text = JSON.stringify(next);
      if (text.length > 200_000) return json({ error: "The brand kit is too large. Use smaller pictures." }, 413);
      await sql`insert into settings (key, value) values ('brandkit', ${text}::jsonb) on conflict (key) do update set value = excluded.value, updated_at = now()`;
      await audit("brand kit", true, request, `version ${next.version}`);
      return json({ brand: next });
    }
    case "document-save": {
      const status = DOC_STATES.has(d.status) ? d.status : "draft";
      const title = clip(d.title, 160) || "Untitled document";
      const data = jsonOf(d.data);
      if (data.length > 1_500_000) return json({ error: "This document is too large to save." }, 413);
      let row: Row | undefined;
      if (d.id) {
        const [before] = await sql`select status from documents where id = ${Number(d.id)}`;
        if (!before) return json({ error: "That document no longer exists." }, 404);
        [row] = await sql`update documents set title = ${title}, status = ${status}, data = ${data}::jsonb, favourite = ${Boolean(d.favourite)}, updated_at = now() where id = ${Number(d.id)} returning *`;
        // A version on every status change, or when asked for one.
        if (before.status !== status || d.version) {
          await sql`insert into document_versions (document_id, status, note, data) values (${row.id}, ${status}, ${clip(d.note, 200) || (before.status !== status ? `Marked ${status}` : "Saved a version")}, ${data}::jsonb)`;
          await sql`delete from document_versions where document_id = ${row.id} and id not in (select id from document_versions where document_id = ${row.id} order by ts desc limit 50)`;
        }
      } else {
        const kit = JSON.stringify(await brand(sql));
        [row] = await sql`insert into documents (kind, title, status, data, brand, lead_id) values (${clip(d.kind, 40) || "letter"}, ${title}, ${status}, ${data}::jsonb, ${kit}::jsonb, ${num(d.lead_id)}) returning *`;
        await sql`insert into document_versions (document_id, status, note, data) values (${row.id}, ${status}, 'Created', ${data}::jsonb)`;
        if (d.lead_id) await sql`update leads set status = case when status in ('new', 'contacted') then 'quoted' else status end, updated_at = now() where id = ${Number(d.lead_id)}`;
      }
      return json({ document: row });
    }
    case "document-duplicate": {
      const [row] = await sql`insert into documents (kind, title, status, data, brand, lead_id)
        select kind, title || ' (copy)', 'draft', data, ${JSON.stringify(await brand(sql))}::jsonb, lead_id from documents where id = ${Number(d.id)} returning *`;
      if (!row) return json({ error: "That document no longer exists." }, 404);
      await sql`insert into document_versions (document_id, status, note, data) values (${row.id}, 'draft', 'Duplicated', ${JSON.stringify(row.data)}::jsonb)`;
      return json({ document: row });
    }
    case "document-rebrand": {
      const [row] = await sql`update documents set brand = ${JSON.stringify(await brand(sql))}::jsonb, updated_at = now() where id = ${Number(d.id)} returning id`;
      return row ? json({ ok: true }) : json({ error: "That document no longer exists." }, 404);
    }
    case "document-delete": {
      const [row] = await sql`delete from documents where id = ${Number(d.id)} returning title`;
      await audit("delete document", Boolean(row), request, row?.title);
      return json({ ok: Boolean(row) });
    }
    case "document-restore": {
      const [v] = await sql`select document_id, data from document_versions where id = ${Number(d.version)}`;
      if (!v) return json({ error: "That version no longer exists." }, 404);
      const [row] = await sql`update documents set data = ${JSON.stringify(v.data)}::jsonb, status = 'draft', updated_at = now() where id = ${v.document_id} returning *`;
      await sql`insert into document_versions (document_id, status, note, data) values (${v.document_id}, 'draft', 'Restored an earlier version', ${JSON.stringify(v.data)}::jsonb)`;
      return json({ document: row });
    }
    case "location-save": {
      const f = {
        name: clip(d.name, 120) || "Untitled location",
        category: ["office", "site", "coverage", "partner", "other"].includes(d.category) ? d.category : "site",
        address: clip(d.address, 300),
        postcode: clip(d.postcode, 12).toUpperCase(),
        lat: num(d.lat),
        lng: num(d.lng),
        radius: num(d.radius_km),
        contact: clip(d.contact, 120),
        phone: clip(d.phone, 40),
        notes: clip(d.notes, 2000),
        pub: Boolean(d.public),
      };
      const [row] = d.id
        ? await sql`update locations set name = ${f.name}, category = ${f.category}, address = ${f.address}, postcode = ${f.postcode}, lat = ${f.lat}, lng = ${f.lng}, radius_km = ${f.radius}, contact = ${f.contact}, phone = ${f.phone}, notes = ${f.notes}, public = ${f.pub}, updated_at = now() where id = ${Number(d.id)} returning *`
        : await sql`insert into locations (name, category, address, postcode, lat, lng, radius_km, contact, phone, notes, public) values (${f.name}, ${f.category}, ${f.address}, ${f.postcode}, ${f.lat}, ${f.lng}, ${f.radius}, ${f.contact}, ${f.phone}, ${f.notes}, ${f.pub}) returning *`;
      return json({ location: row });
    }
    case "location-delete":
      await sql`delete from locations where id = ${Number(d.id)}`;
      return json({ ok: true });
    case "campaign-save": {
      const name = clip(d.name, 120);
      if (!name) return json({ error: "Give the campaign a name." }, 400);
      const slug = slugify(d.slug || name);
      const dest = clip(d.destination, 300) || "/";
      const [clash] = await sql`select id from campaigns where slug = ${slug} and id <> ${Number(d.id) || 0}`;
      if (clash) return json({ error: "Another campaign already uses that tag." }, 409);
      const [row] = d.id
        ? await sql`update campaigns set name = ${name}, slug = ${slug}, source = ${clip(d.source, 60)}, medium = ${clip(d.medium, 60)}, destination = ${dest}, goal = ${clip(d.goal, 200)} where id = ${Number(d.id)} returning *`
        : await sql`insert into campaigns (name, slug, source, medium, destination, goal) values (${name}, ${slug}, ${clip(d.source, 60)}, ${clip(d.medium, 60)}, ${dest}, ${clip(d.goal, 200)}) returning *`;
      return json({ campaign: row });
    }
    case "campaign-delete":
      await sql`delete from campaigns where id = ${Number(d.id)}`;
      return json({ ok: true });
    case "lead-update": {
      const status = LEAD_STATES.has(d.status) ? d.status : null;
      const kind = d.kind === "recruitment" ? "recruitment" : d.kind === "sales" ? "sales" : null;
      const [row] = await sql`update leads set
          status = coalesce(${status}, status), kind = coalesce(${kind}, kind),
          assigned = ${clip(d.assigned, 80) || null}, follow_up = ${clip(d.follow_up, 10) || null},
          notes = ${clip(d.notes, 5000)}, updated_at = now()
        where id = ${Number(d.id)} returning *`;
      return row ? json({ lead: row }) : json({ error: "That enquiry no longer exists." }, 404);
    }
    case "sample-load":
      await SAMPLE.load(sql);
      await audit("sample data", true, request, "loaded");
      return json({ ok: true });
    case "sample-remove":
      await SAMPLE.remove(sql);
      await audit("sample data", true, request, "removed");
      return json({ ok: true });
    default:
      return json({ error: "Unknown action" }, 400);
  }
}

export function GET(request: Request) {
  return guard(async () => {
    if ((await isAdmin(request)) !== "admin") return json({ error: "Signed out" }, 401);
    const p = new URL(request.url).searchParams;
    return get(await getSql(), p.get("action"), p);
  });
}

export function POST(request: Request) {
  return guard(async () => {
    if ((await isAdmin(request)) !== "admin") return json({ error: "Signed out" }, 401);
    const origin = request.headers.get("origin");
    const host = request.headers.get("host") || new URL(request.url).host;
    if (origin && new URL(origin).host !== host) return json({ error: "Wrong origin" }, 403);
    return post(await getSql(), new URL(request.url).searchParams.get("action"), await readBody(request), request);
  });
}
