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
  /* Enquiries: who is following up, when, and whether it's sales or a job
     application (kept apart: different information, different access).
     sample = demonstration data, removable in one go. */
  `alter table leads add column if not exists kind text not null default 'sales'`,
  `alter table leads add column if not exists assigned text`,
  `alter table leads add column if not exists follow_up date`,
  `alter table leads add column if not exists sample boolean not null default false`,
  `alter table posts add column if not exists sample boolean not null default false`,
  /* Document Studio: every document keeps the brand it was made with, so a
     change to the brand kit never rewrites work already issued. */
  `create table if not exists documents (
    id bigint generated always as identity primary key,
    kind text not null, title text not null, status text not null default 'draft',
    data jsonb not null default '{}', brand jsonb not null default '{}',
    lead_id bigint, sample boolean not null default false, favourite boolean not null default false,
    created_at timestamptz not null default now(), updated_at timestamptz not null default now())`,
  `create index if not exists documents_updated on documents (updated_at)`,
  `create table if not exists document_versions (
    id bigint generated always as identity primary key,
    document_id bigint not null references documents(id) on delete cascade,
    ts timestamptz not null default now(), status text, note text, data jsonb not null)`,
  `create index if not exists document_versions_doc on document_versions (document_id, ts)`,
  /* Library: approved logos, photos, words, templates and credentials, each
     with an owner, a review date and an approval status. */
  `create table if not exists library (
    id bigint generated always as identity primary key,
    type text not null, title text not null, body text, file text, mime text, tags text,
    owner text, review_date date, status text not null default 'approved', sample boolean not null default false,
    created_at timestamptz not null default now(), updated_at timestamptz not null default now())`,
  /* Locations and coverage: offices, sites and the towns we cover. */
  `create table if not exists locations (
    id bigint generated always as identity primary key,
    name text not null, category text not null default 'site', address text, postcode text,
    lat double precision, lng double precision, radius_km double precision,
    contact text, phone text, notes text, public boolean not null default false, sample boolean not null default false,
    created_at timestamptz not null default now(), updated_at timestamptz not null default now())`,
  /* Campaign links: a tagged address and QR code, and the visits it brought. */
  `create table if not exists campaigns (
    id bigint generated always as identity primary key,
    name text not null, slug text not null unique, source text, medium text, destination text not null,
    goal text, sample boolean not null default false, created_at timestamptz not null default now())`,
  /* Accounts: everyone who can sign in to the admin, their role, title and
     the sections they can open. auth_id links to the Supabase Auth user. */
  `create table if not exists accounts (
    id bigint generated always as identity primary key,
    auth_id uuid unique,
    email text not null unique,
    name text not null default '',
    title text not null default '',
    phone text not null default '',
    role text not null default 'employee' check (role in ('developer', 'administrator', 'employee')),
    access jsonb not null default '[]',
    active boolean not null default true,
    must_change boolean not null default false,
    version int not null default 1,
    created_by bigint,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    last_seen timestamptz)`,
  /* Who did what; hidden rows (the developer's) are shown only to them. */
  `alter table admin_log add column if not exists account_id bigint`,
  `alter table admin_log add column if not exists hidden boolean not null default false`,
  `insert into settings (key, value) values ('devmode', '{"on": false}') on conflict (key) do nothing`,
  /* Supabase publishes every table in "public" through its Data API, where
     the anon key can reach it. Row level security with no policies shuts
     that door: only the server, signed in as the database owner, can read
     or write. (On plain Postgres it changes nothing.) */
  ...["views", "events", "posts", "leads", "uptime_checks", "settings", "admin_log", "documents", "document_versions", "library", "locations", "campaigns", "accounts"].map((t) => `alter table ${t} enable row level security`),
];
