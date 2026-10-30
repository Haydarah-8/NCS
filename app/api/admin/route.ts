/* Website analytics, enquiries and the site announcement, by ?action=.
   Every request loads the signed-in account and checks it may open the
   section the action belongs to, whatever the middleware did.

   GET    stats, page, speed, uptime        (overview or insights)
          leads                              (enquiries)
          settings                           (announcement)
          counts                             (anyone signed in)
          export                             (enquiries or insights)
   POST   lead-save, lead-delete             (enquiries)
          settings-save                      (announcement) */

import type { Section } from "@/lib/server/access";
import { requireAccount, sameOrigin, sectionsOf, type Account } from "@/lib/server/accounts";
import { getSql, type Row, type Sql } from "@/lib/server/db";
import { audit, clip, guard, json, readBody } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAYS = [1, 7, 30, 90, 365];
const LEAD_STATES = new Set(["new", "contacted", "quoted", "won", "lost"]);
const today = () => new Date().toISOString().slice(0, 10);
const daysOf = (p: URLSearchParams) => (DAYS.includes(Number(p.get("days"))) ? Number(p.get("days")) : 30);

/* The start of the period: midnight in London, `$1` days ago (today = 1),
   and the period before it, for the comparisons. */
const SINCE = `(((now() at time zone 'Europe/London')::date - ($1::int - 1))::timestamp at time zone 'Europe/London')`;
const PREV = `(((now() at time zone 'Europe/London')::date - (2 * $1::int - 1))::timestamp at time zone 'Europe/London')`;
const DAY = `(ts at time zone 'Europe/London')::date`;

/* Where a visit came from, in the groups people think in. */
const CHANNEL = `case
  when lower(coalesce(utm_medium, '')) in ('cpc', 'ppc', 'paid', 'paidsearch', 'paid_social') then 'Paid'
  when utm_campaign is not null or utm_source is not null then 'Campaigns'
  when referrer is null then 'Direct'
  when referrer ~ '(^|\\.)(google|bing|duckduckgo|yahoo|ecosia|baidu|yandex|startpage)\\.' then 'Search'
  when referrer ~ '(facebook|instagram|linkedin|twitter|x\\.com|t\\.co|tiktok|youtube|reddit|pinterest|threads|whatsapp|nextdoor)' then 'Social'
  when referrer ~ '(mail\\.|outlook|gmail)' then 'Email'
  else 'Referral' end`;

/* The day-by-day (or, for today, hour-by-hour) line. */
function series(days: number, extra = "") {
  return days === 1
    ? `select h::text as label, count(v.id)::int as views, count(distinct v.visitor)::int as visitors
       from generate_series(0, 23) h
       left join views v on v.ts >= ${SINCE} and extract(hour from v.ts at time zone 'Europe/London') = h ${extra}
       group by h order by h`
    : `select to_char(d, 'YYYY-MM-DD') as label, count(v.id)::int as views, count(distinct v.visitor)::int as visitors
       from generate_series((now() at time zone 'Europe/London')::date - ($1::int - 1), (now() at time zone 'Europe/London')::date, interval '1 day') d
       left join views v on (v.ts at time zone 'Europe/London')::date = d::date ${extra}
       group by d order by d`;
}

async function stats(sql: Sql, days: number) {
  const q = (text: string) => sql.query(text, [days]);
  const totals = (from: string, to = "") =>
    q(`select count(*)::int as views, count(distinct visitor)::int as visitors,
         count(distinct visitor || ${DAY})::int as visits,
         coalesce(round(avg(duration) filter (where duration > 0)), 0)::int as seconds
       from views where ts >= ${from} ${to}`);
  const top = (column: string, label: string, limit = 10, where = "") =>
    q(`select coalesce(${column}, '${label}') as name, count(*)::int as views, count(distinct visitor)::int as visitors
       from views where ts >= ${SINCE} ${where} group by 1 order by 3 desc, 2 desc limit ${limit}`);
  const firstOrLast = (order: "asc" | "desc") =>
    q(`select path as name, count(*)::int as visitors from (
         select distinct on (visitor, ${DAY}) path from views
         where ts >= ${SINCE} order by visitor, ${DAY}, ts ${order}) t
       group by path order by 2 desc limit 10`);
  const [now, before, single, line, pages, channels, channelsBefore, referrers, campaigns, countries, devices, browsers, systems, hours, weekdays, entries, exits, events, eventsBefore, leads, leadLine, live, recent] =
    await sql.transaction([
      totals(SINCE),
      totals(PREV, `and ts < ${SINCE}`),
      q(`select count(*) filter (where n = 1)::int as single, count(*)::int as total
         from (select visitor, ${DAY}, count(*) as n from views where ts >= ${SINCE} group by 1, 2) t`),
      q(series(days)),
      q(`select path as name, max(title) as title, count(*)::int as views, count(distinct visitor)::int as visitors,
           coalesce(round(avg(duration) filter (where duration > 0)), 0)::int as seconds
         from views where ts >= ${SINCE} group by path order by views desc limit 30`),
      q(`select ${CHANNEL} as name, count(*)::int as views, count(distinct visitor)::int as visitors from views where ts >= ${SINCE} group by 1 order by 3 desc`),
      q(`select ${CHANNEL} as name, count(distinct visitor)::int as visitors from views where ts >= ${PREV} and ts < ${SINCE} group by 1`),
      top("referrer", "Direct or unknown", 15, "and referrer is not null"),
      q(`select utm_campaign as name, max(utm_source) as source, max(utm_medium) as medium,
           count(*)::int as views, count(distinct visitor)::int as visitors
         from views where ts >= ${SINCE} and utm_campaign is not null group by utm_campaign order by visitors desc limit 20`),
      top("country", "Unknown", 12),
      top("device", "Unknown", 5),
      top("browser", "Unknown", 8),
      top("os", "Unknown", 8),
      q(`select extract(hour from ts at time zone 'Europe/London')::int as hour, count(*)::int as views
         from views where ts >= ${SINCE} group by 1 order by 1`),
      q(`select extract(isodow from ts at time zone 'Europe/London')::int as dow, count(*)::int as views
         from views where ts >= ${SINCE} group by 1 order by 1`),
      firstOrLast("asc"),
      firstOrLast("desc"),
      q(`select name, count(*)::int as count from events where ts >= ${SINCE} group by name`),
      q(`select name, count(*)::int as count from events where ts >= ${PREV} and ts < ${SINCE} group by name`),
      q(`select count(*) filter (where ts >= ${SINCE})::int as now,
                count(*) filter (where ts >= ${PREV} and ts < ${SINCE})::int as before from leads`),
      days === 1
        ? q(`select h::text as label, count(l.id)::int as leads from generate_series(0, 23) h
             left join leads l on l.ts >= ${SINCE} and extract(hour from l.ts at time zone 'Europe/London') = h group by h order by h`)
        : q(`select to_char(d, 'YYYY-MM-DD') as label, count(l.id)::int as leads
             from generate_series((now() at time zone 'Europe/London')::date - ($1::int - 1), (now() at time zone 'Europe/London')::date, interval '1 day') d
             left join leads l on (l.ts at time zone 'Europe/London')::date = d::date group by d order by d`),
      sql`select count(distinct visitor)::int as now from views where ts > now() - interval '5 minutes'`,
      sql`select ts, path, title, country, city, device, browser, referrer from views order by ts desc limit 12`,
    ]);
  const bounce = single[0].total ? Math.round((single[0].single / single[0].total) * 100) : 0;
  const count = (rows: Row[]) => Object.fromEntries(rows.map((e) => [e.name, e.count]));
  const before0 = Object.fromEntries(channelsBefore.map((c) => [c.name, c.visitors]));
  return {
    days,
    totals: { ...now[0], bounce, leads: leads[0].now, events: count(events) },
    previous: { ...before[0], leads: leads[0].before, events: count(eventsBefore) },
    series: line.map((r, i) => ({ ...r, leads: leadLine[i]?.leads || 0 })),
    pages,
    channels: channels.map((c) => ({ ...c, before: before0[c.name] || 0 })),
    referrers,
    campaigns,
    countries,
    devices,
    browsers,
    systems,
    hours,
    weekdays,
    entries,
    exits,
    live: { now: live[0].now, recent },
  };
}

/* One page over the period. */
async function pageStats(sql: Sql, path: string, days: number) {
  const [line, refs, totals] = await sql.transaction([
    sql.query(series(days, "and v.path = $2"), [days, path]),
    sql.query(
      `select coalesce(referrer, 'Direct or unknown') as name, count(distinct visitor)::int as visitors
       from views where path = $2 and ts >= ${SINCE} group by 1 order by 2 desc limit 8`,
      [days, path],
    ),
    sql.query(
      `select count(*)::int as views, count(distinct visitor)::int as visitors,
         coalesce(round(avg(duration) filter (where duration > 0)), 0)::int as seconds,
         percentile_disc(0.75) within group (order by lcp) as lcp
       from views where path = $2 and ts >= ${SINCE}`,
      [days, path],
    ),
  ]);
  return { path, days, series: line, referrers: refs, totals: totals[0] };
}

/* How fast pages load for real visitors: the 75th percentile, as Google's
   Core Web Vitals measure it, overall, by day, by page and by device. */
async function speed(sql: Sql, days: number) {
  const q = (text: string) => sql.query(text, [days]);
  const p75 = (c: string) => `percentile_disc(0.75) within group (order by ${c})`;
  const [overall, line, pages, devices] = await sql.transaction([
    q(`select count(lcp)::int as samples, ${p75("lcp")} as lcp, ${p75("ttfb")} as ttfb, ${p75("load")} as load,
         count(*) filter (where lcp <= 2500)::int as good, count(*) filter (where lcp > 2500 and lcp <= 4000)::int as fair,
         count(*) filter (where lcp > 4000)::int as poor
       from views where ts >= ${SINCE} and lcp is not null`),
    q(`select to_char(${DAY}, 'YYYY-MM-DD') as label, ${p75("lcp")} as lcp, ${p75("ttfb")} as ttfb
       from views where ts >= ${SINCE} and lcp is not null group by 1 order by 1`),
    q(`select path as name, count(lcp)::int as samples, ${p75("lcp")} as lcp, ${p75("ttfb")} as ttfb
       from views where ts >= ${SINCE} and lcp is not null group by path order by lcp desc limit 15`),
    q(`select coalesce(device, 'Unknown') as name, count(lcp)::int as samples, ${p75("lcp")} as lcp
       from views where ts >= ${SINCE} and lcp is not null group by 1 order by 2 desc`),
  ]);
  return { days, overall: overall[0], series: line, pages, devices };
}

async function uptime(sql: Sql, days: number) {
  const q = (text: string) => sql.query(text, [days]);
  const [summary, line, recent] = await sql.transaction([
    q(`select count(*)::int as checks, count(*) filter (where ok)::int as up,
         coalesce(round(avg(ms) filter (where ok)), 0)::int as ms
       from uptime_checks where ts >= ${SINCE}`),
    q(`select to_char(${DAY}, 'YYYY-MM-DD') as label, count(*)::int as checks, count(*) filter (where ok)::int as up
       from uptime_checks where ts >= ${SINCE} group by 1 order by 1`),
    sql`select ts, url, ok, status, ms, source from uptime_checks order by ts desc limit 25`,
  ]);
  return { days, ...summary[0], series: line, recent };
}

function csv(rows: Row[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    const s = v instanceof Date ? v.toISOString() : v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
}

function download(body: string, type: string, name: string) {
  return new Response(body, {
    headers: { "content-type": `${type}; charset=utf-8`, "content-disposition": `attachment; filename="${name}"`, "cache-control": "no-store" },
  });
}

async function get(sql: Sql, action: string | null, p: URLSearchParams) {
  switch (action) {
    case "stats":
      return json(await stats(sql, daysOf(p)));
    case "page":
      return json(await pageStats(sql, String(p.get("path") || "/").slice(0, 300), daysOf(p)));
    case "speed":
      return json(await speed(sql, daysOf(p)));
    case "uptime":
      return json(await uptime(sql, daysOf(p)));
    case "leads":
      return json({ leads: await sql`select * from leads order by ts desc limit 500` });
    case "settings": {
      const rows = await sql`select key, value from settings`;
      return json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
    }
    case "counts": {
      const [c] = await sql`select
          (select count(*)::int from leads where status = 'new') as new_leads,
          (select count(distinct visitor)::int from views where ts > now() - interval '5 minutes') as live`;
      return json(c);
    }
    case "export": {
      const what = p.get("what");
      const rows =
        what === "leads"
          ? await sql`select ts, name, email, phone, company, site, page, message, source, status, notes from leads order by ts desc`
          : what === "events"
            ? await sql`select ts, name, path, label, country, device from events where ts > now() - interval '365 days' order by ts desc`
            : await sql`select ts, path, title, referrer, utm_source, utm_medium, utm_campaign, country, city, device, browser, os, duration, ttfb, lcp, load from views where ts > now() - interval '365 days' order by ts desc`;
      return download(csv(rows), "text/csv", `ncs-${what === "leads" || what === "events" ? what : "views"}-${today()}.csv`);
    }
    default:
      return json({ error: "Unknown action" }, 400);
  }
}

const validDate = (v: unknown) => {
  const d = v ? new Date(String(v)) : null;
  return d && !Number.isNaN(+d) ? d.toISOString() : null;
};
const jsonOf = (v: unknown) => JSON.stringify(v && typeof v === "object" ? v : {});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function post(sql: Sql, me: Account, action: string | null, d: Record<string, any>, request: Request) {
  switch (action) {
    case "lead-save": {
      const status = LEAD_STATES.has(d.status) ? d.status : "new";
      const [row] = await sql`update leads set status = ${status}, notes = ${clip(d.notes, 5000)}, updated_at = now() where id = ${Number(d.id)} returning *`;
      return row ? json({ lead: row }) : json({ error: "That enquiry no longer exists." }, 404);
    }
    case "lead-delete": {
      const [row] = await sql`delete from leads where id = ${Number(d.id)} returning name`;
      await audit("delete enquiry", Boolean(row), request, row?.name, me);
      return json({ ok: Boolean(row) });
    }
    case "settings-save": {
      if (d.key !== "announcement") return json({ error: "Unknown setting" }, 400);
      const a = d.value || {};
      const value = { on: Boolean(a.on), text: clip(a.text, 200), link: clip(a.link, 300), label: clip(a.label, 40), until: clip(a.until, 30) };
      await sql`insert into settings (key, value) values ('announcement', ${jsonOf(value)}::jsonb)
        on conflict (key) do update set value = excluded.value, updated_at = now()`;
      await audit("announcement", true, request, value.on ? value.text : "off", me);
      return json({ value });
    }
    default:
      return json({ error: "Unknown action" }, 400);
  }
}

/* The section each action belongs to. Analytics open from the overview or
   insights; an export follows what it exports. */
function allowed(account: Account, action: string | null, p?: URLSearchParams) {
  const has = (s: Section) => sectionsOf(account).includes(s);
  switch (action) {
    case "stats":
    case "page":
    case "speed":
    case "uptime":
      return has("overview") || has("insights");
    case "leads":
    case "lead-save":
    case "lead-delete":
      return has("enquiries");
    case "settings":
    case "settings-save":
      return has("announcement");
    case "export":
      return p?.get("what") === "leads" ? has("enquiries") : has("insights");
    case "counts":
      return true;
    default:
      return false;
  }
}

export function GET(request: Request) {
  return guard(async () => {
    const r = await requireAccount(request);
    if ("response" in r) return r.response;
    const params = new URL(request.url).searchParams;
    const action = params.get("action");
    if (!allowed(r.account, action, params)) return json({ error: "You don't have access to this." }, 403);
    return get(await getSql(), action, params);
  });
}

export function POST(request: Request) {
  return guard(async () => {
    const r = await requireAccount(request);
    if ("response" in r) return r.response;
    /* Same-site check: a form on another site can't act as the admin. */
    if (!sameOrigin(request)) return json({ error: "Wrong origin" }, 403);
    const action = new URL(request.url).searchParams.get("action");
    if (!allowed(r.account, action)) return json({ error: "You don't have access to this." }, 403);
    return post(await getSql(), r.account, action, await readBody(request), request);
  });
}
