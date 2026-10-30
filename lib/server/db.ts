/* The database, behind one small interface: tagged queries,
   sql.query(text, params) and sql.transaction([...]). The same SQL runs on
   all three:
   - Supabase, or any Postgres (DATABASE_URL), through postgres.js. On
     Vercel use Supabase's transaction pooler (port 6543): the direct
     address is IPv6 only.
   - Neon (a DATABASE_URL on neon.tech), through its HTTP driver.
   - In local development without DATABASE_URL, PGlite: a real Postgres
     running inside the dev server, kept in .ncs-dev/pg. */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { SCHEMA } from "./schema.mjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export type Query = PromiseLike<Row[]>;
export interface Sql {
  (strings: TemplateStringsArray, ...values: unknown[]): Query;
  query(text: string, params?: unknown[]): Query;
  transaction(queries: Query[]): Promise<Row[][]>;
}

export class NotConfigured extends Error {}

const LOCAL_DIR = path.join(process.cwd(), ".ncs-dev");
export const isLocal = () => !process.env.DATABASE_URL && process.env.NODE_ENV === "development";

/* A query that runs when awaited, on whichever connection is given it. */
class LocalQuery implements Query {
  constructor(
    readonly text: string,
    readonly params: unknown[],
    private readonly run: (text: string, params: unknown[]) => Promise<Row[]>,
  ) {}
  then<A = Row[], B = never>(ok?: ((v: Row[]) => A | PromiseLike<A>) | null, fail?: ((e: unknown) => B | PromiseLike<B>) | null) {
    return withTimeout(this.run(this.text, this.params)).then(ok, fail);
  }
}

/* A database that doesn't answer fails the request instead of hanging it. */
export class DatabaseTimeout extends Error {}
const LIMIT = 20_000;
function withTimeout<T>(work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const late = new Promise<never>((_, no) => (timer = setTimeout(() => no(new DatabaseTimeout("The database didn't answer in time.")), LIMIT)));
  return Promise.race([work, late]).finally(() => clearTimeout(timer));
}

/* Neon sends a JS array as a Postgres array; the others are given the literal. */
const param = (v: unknown) => (Array.isArray(v) ? `{${v.map((x) => JSON.stringify(x)).join(",")}}` : v);

/* ---------- Supabase, or any Postgres ---------- */

/* The queries pass JSON already as text ("${JSON.stringify(x)}::jsonb"), as
   Neon expects; postgres.js would stringify it a second time and store a
   string, so JSON parameters go through as they are. */
const JSON_TEXT = {
  to: 3802,
  from: [114, 3802],
  serialize: (x: unknown) => (typeof x === "string" ? x : JSON.stringify(x)),
  parse: (x: string) => JSON.parse(x),
};

/* A query that times out usually means a dead connection (the network
   dropped, or the pooler closed it). The whole pool is thrown away so the
   next request connects afresh instead of queueing behind it. */
function resetPool(db: postgres.Sql) {
  g.__ncsSql = undefined;
  db.end({ timeout: 0 }).catch(() => {});
}
const healing = <T>(db: postgres.Sql, work: Promise<T>) =>
  withTimeout(work).catch((error) => {
    if (error instanceof DatabaseTimeout) resetPool(db);
    throw error;
  });

function postgresSql(url: string): Sql {
  // prepare: false, because Supabase's transaction pooler can't keep prepared statements.
  // max_lifetime: connections are renewed every few minutes, before the pooler drops them.
  const db = postgres(url, { prepare: false, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require", max: 3, idle_timeout: 20, max_lifetime: 300, connect_timeout: 10, types: { json: JSON_TEXT } });
  const on = (client: postgres.Sql | postgres.TransactionSql) => async (text: string, params: unknown[]) =>
    [...(await client.unsafe(text, params.map(param) as postgres.ParameterOrJSON<never>[]))] as Row[];
  const run = (text: string, params: unknown[]) => healing(db, on(db)(text, params));
  const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
    new LocalQuery(strings.reduce((t, s, i) => `${t}$${i}${s}`), values, run)) as unknown as Sql;
  sql.query = (text, params = []) => new LocalQuery(text, params, run);
  sql.transaction = (queries) =>
    healing(
      db,
      db.begin(async (tx) => {
        const out: Row[][] = [];
        for (const q of queries as LocalQuery[]) out.push(await on(tx)(q.text, q.params));
        return out;
      }) as Promise<Row[][]>,
    );
  return sql;
}

/* ---------- PGlite, for local development ---------- */

async function localSql(): Promise<Sql> {
  const { PGlite } = await import("@electric-sql/pglite");
  await mkdir(LOCAL_DIR, { recursive: true });
  // int8 comes back as a string, as it does from Neon.
  const db = new PGlite(path.join(LOCAL_DIR, "pg"), { parsers: { 20: (v: string) => v } });
  await db.waitReady;
  for (const statement of SCHEMA) await db.exec(statement);

  const run = async (text: string, params: unknown[]) => (await db.query<Row>(text, params.map(param))).rows;
  const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
    new LocalQuery(strings.reduce((t, s, i) => `${t}$${i}${s}`), values, run)) as unknown as Sql;
  sql.query = (text, params = []) => new LocalQuery(text, params, run);
  sql.transaction = (queries) =>
    db.transaction(async (tx) => {
      const out: Row[][] = [];
      for (const q of queries as LocalQuery[]) out.push((await tx.query<Row>(q.text, q.params.map(param))).rows);
      return out;
    });

  return sql;
}

/* ---------- The one connection ---------- */

/* Kept across reloads in development, but rebuilt whenever the address or
   this code's driver changes, so a running dev server never holds on to a
   connection made for another database. */
const DRIVER = "postgres.js-2";
const g = globalThis as unknown as { __ncsSql?: Promise<Sql>; __ncsSqlKey?: string };

export function getSql(): Promise<Sql> {
  const url = process.env.DATABASE_URL;
  const key = `${DRIVER}|${url || "local"}`;
  if (g.__ncsSqlKey !== key) {
    g.__ncsSql = undefined;
    g.__ncsSqlKey = key;
  }
  if (url) return (g.__ncsSql ??= Promise.resolve(/\.neon\.tech/.test(url) ? (neon(url) as unknown as Sql) : postgresSql(url)));
  if (isLocal()) {
    g.__ncsSql ??= localSql().catch((error) => {
      g.__ncsSql = undefined;
      throw error;
    });
    return g.__ncsSql;
  }
  return Promise.reject(new NotConfigured("DATABASE_URL is not set."));
}
