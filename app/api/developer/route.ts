/* The developer console, by ?action=. Only the developer's account gets an
   answer; to anyone else this route doesn't exist (404).

   GET   status   configuration, the deployment, row counts, development mode
         log      the whole activity log, hidden lines included
         backup   everything in the database worth keeping, as JSON
   POST  devmode  turn development mode on or off, with a message and
                  whether website tracking pauses meanwhile
         reset    clear chosen groups of data (type RESET to confirm)
         sample   load or remove the labelled sample data */

import { canMakeSignIns, requireAccount, sameOrigin } from "@/lib/server/accounts";
import { authConfigured } from "@/lib/server/auth";
import { getSql, type Sql } from "@/lib/server/db";
import { audit, clip, guard, json, readBody } from "@/lib/server/http";
import { SAMPLE } from "@/lib/server/sample";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* What a reset can clear. Accounts, the company details and the published
   blog are never part of it unless named. */
const GROUPS: Record<string, { label: string; tables: string[] }> = {
  analytics: { label: "Website analytics (visits, events, speed and uptime checks)", tables: ["views", "events", "uptime_checks"] },
  enquiries: { label: "Enquiries and job applications", tables: ["leads"] },
  activity: { label: "Activity log", tables: ["admin_log"] },
  campaigns: { label: "Campaign links", tables: ["campaigns"] },
  studio: { label: "Old studio data (documents, versions, library, locations)", tables: ["document_versions", "documents", "library", "locations"] },
  posts: { label: "Blog posts on the website", tables: ["posts"] },
};
const COUNTED = ["views", "events", "uptime_checks", "leads", "admin_log", "campaigns", "documents", "library", "locations", "posts", "accounts"];

const notFound = () => json({ error: "Not found" }, 404);

async function setting(sql: Sql, key: string) {
  const [row] = await sql`select value from settings where key = ${key}`;
  return row?.value || {};
}

async function get(sql: Sql, action: string | null) {
  switch (action) {
    case "status": {
      const counts = await sql.query(`select ${COUNTED.map((t) => `(select count(*)::int from ${t}) as ${t}`).join(", ")}`);
      const url = process.env.DATABASE_URL || "";
      return json({
        counts: counts[0],
        groups: Object.entries(GROUPS).map(([key, g]) => ({ key, ...g })),
        devmode: await setting(sql, "devmode"),
        config: {
          database: url ? (/supabase/.test(url) ? "Supabase (pooler)" : "Postgres") : "Local (PGlite)",
          signIn: authConfigured() ? "Supabase Auth" : "Local development (any email)",
          makeAccounts: canMakeSignIns() || !authConfigured(),
          cron: Boolean(process.env.CRON_SECRET),
          ai: Boolean(process.env.ANTHROPIC_API_KEY),
        },
        deployment: {
          env: process.env.VERCEL_ENV || process.env.NODE_ENV || "",
          commit: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7),
          message: clip(process.env.VERCEL_GIT_COMMIT_MESSAGE, 120),
          region: process.env.VERCEL_REGION || "",
          node: process.version,
        },
        time: new Date().toISOString(),
      });
    }
    case "log":
      return json({ log: await sql`select l.ts, l.action, l.ok, l.detail, l.hidden, a.name, a.role from admin_log l left join accounts a on a.id = l.account_id order by l.ts desc limit 300` });
    case "backup": {
      const tables = ["accounts", "settings", "posts", "leads", "campaigns", "admin_log"];
      const out: Record<string, unknown> = { made: new Date().toISOString() };
      for (const t of tables) out[t] = await sql.query(`select * from ${t} order by 1`);
      return new Response(JSON.stringify(out, null, 1), {
        headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="ncs-backup-${new Date().toISOString().slice(0, 10)}.json"`, "cache-control": "no-store" },
      });
    }
    default:
      return json({ error: "Unknown action" }, 400);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function post(sql: Sql, me: { id: number; role: string }, action: string | null, d: Record<string, any>, request: Request) {
  switch (action) {
    case "devmode": {
      const value = { on: Boolean(d.on), message: clip(d.message, 240), pauseTracking: d.pauseTracking !== false, since: d.on ? new Date().toISOString() : null };
      await sql`insert into settings (key, value) values ('devmode', ${JSON.stringify(value)}::jsonb)
        on conflict (key) do update set value = excluded.value, updated_at = now()`;
      await audit("development mode", true, request, value.on ? "on" : "off", me);
      return json({ devmode: value });
    }
    case "reset": {
      if (d.confirm !== "RESET") return json({ error: "Type RESET to confirm." }, 400);
      const chosen = (Array.isArray(d.groups) ? d.groups : []).filter((g: string) => GROUPS[g]);
      if (!chosen.length) return json({ error: "Choose what to clear." }, 400);
      const cleared: Record<string, number> = {};
      for (const g of chosen) {
        for (const t of GROUPS[g].tables) {
          const [{ n }] = await sql.query(`select count(*)::int as n from ${t}`);
          await sql.query(`delete from ${t}`);
          cleared[t] = n;
        }
      }
      if (d.announcement) await sql`update settings set value = '{"on": false}'::jsonb, updated_at = now() where key = 'announcement'`;
      await audit("reset", true, request, chosen.join(", "), me);
      return json({ cleared });
    }
    case "sample": {
      if (d.load) await SAMPLE.load(sql);
      else await SAMPLE.remove(sql);
      await audit(d.load ? "load sample data" : "remove sample data", true, request, "", me);
      return json({ ok: true });
    }
    default:
      return json({ error: "Unknown action" }, 400);
  }
}

export function GET(request: Request) {
  return guard(async () => {
    const r = await requireAccount(request);
    if ("response" in r || r.account.role !== "developer") return notFound();
    return get(await getSql(), new URL(request.url).searchParams.get("action"));
  });
}

export function POST(request: Request) {
  return guard(async () => {
    const r = await requireAccount(request);
    if ("response" in r || r.account.role !== "developer") return notFound();
    if (!sameOrigin(request)) return json({ error: "Wrong origin" }, 403);
    return post(await getSql(), r.account, new URL(request.url).searchParams.get("action"), await readBody(request), request);
  });
}
