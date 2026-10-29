/* The admin panel's tables. Every statement is safe to run again: it only
   adds what is missing. Used by scripts/setup-db.mjs and by the local
   development database. */

export const SCHEMA = [
  /* One row per page view. ttfb, lcp and load are the page's real speed for
     that visitor, in milliseconds, sent once the page has finished loading. */
  `create table if not exists views (
    id bigint generated always as identity primary key,
    ts timestamptz not null default now(),
    path text not null, title text, referrer text,
    utm_source text, utm_medium text, utm_campaign text,
    country text, city text, device text, browser text, os text,
    visitor text not null, duration int)`,
  `alter table views add column if not exists ttfb int`,
  `alter table views add column if not exists lcp int`,
  `alter table views add column if not exists load int`,
  `create index if not exists views_ts on views (ts)`,
  `create index if not exists views_visitor on views (visitor, ts)`,
  /* Calls, emails, outbound links and enquiries: the conversions. */
  `create table if not exists events (
    id bigint generated always as identity primary key,
    ts timestamptz not null default now(),
    name text not null, path text, label text, visitor text, country text, device text)`,
  `create index if not exists events_ts on events (ts)`,
  `create table if not exists posts (
    id bigint generated always as identity primary key,
    slug text not null unique, title text not null, dek text, topic text, cover text, body text,
    status text not null default 'draft', published_at timestamptz,
    created_at timestamptz not null default now(), updated_at timestamptz not null default now())`,
  `alter table posts add column if not exists meta jsonb not null default '{}'`,
  `create table if not exists leads (
    id bigint generated always as identity primary key,
    ts timestamptz not null default now(),
    name text, email text, phone text, company text, site text, location text, cover_when text, message text,
    source text, status text not null default 'new', notes text, visitor text, country text, updated_at timestamptz)`,
  `alter table leads add column if not exists meta jsonb not null default '{}'`,
  `alter table leads add column if not exists page text`,
  `create index if not exists leads_ts on leads (ts)`,
  `create index if not exists leads_visitor on leads (visitor, ts)`,
  /* The home page fetched on a schedule: was it up, and how quickly. */
  `create table if not exists uptime_checks (
    id bigint generated always as identity primary key,
    ts timestamptz not null default now(),
    url text not null, ok boolean not null, status int, ms int, source text)`,
  `create index if not exists uptime_checks_ts on uptime_checks (ts)`,
  `create table if not exists settings (key text primary key, value jsonb not null, updated_at timestamptz not null default now())`,
  `create table if not exists admin_log (
    id bigint generated always as identity primary key,
    ts timestamptz not null default now(),
    action text not null, ok boolean not null, ip text, detail text)`,
  `create index if not exists admin_log_ts on admin_log (action, ip, ts)`,
  `insert into settings (key, value) values ('announcement', '{"on": false}') on conflict (key) do nothing`,
  /* Supabase publishes every table in "public" through its Data API, where
     the anon key can reach it. Row level security with no policies shuts
     that door: only the server, signed in as the database owner, can read
     or write. (On plain Postgres it changes nothing.) */
  ...["views", "events", "posts", "leads", "uptime_checks", "settings", "admin_log"].map((t) => `alter table ${t} enable row level security`),
];
