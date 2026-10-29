/* Creates the admin panel's tables. Safe to run again: it only adds what
   is missing. Works with Supabase (or any Postgres) and with Neon. Admins
   sign in with Supabase email and password; see scripts/add-admin.mjs.

     npm run db:setup
*/

import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { SCHEMA } from "../lib/server/schema.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env (see .env.example).");
  process.exit(1);
}
if (!process.env.ADMIN_SECRET) console.warn("Note: ADMIN_SECRET is not set; sign-in will not work until it is (see .env.example).");

let run, end;
if (/\.neon\.tech/.test(url)) {
  const sql = neon(url);
  run = (text, params = []) => sql.query(text, params);
  end = async () => {};
} else {
  // JSON goes in as text already; don't let postgres.js stringify it twice (see lib/server/db.ts).
  const types = { json: { to: 3802, from: [114, 3802], serialize: (x) => (typeof x === "string" ? x : JSON.stringify(x)), parse: (x) => JSON.parse(x) } };
  const sql = postgres(url, { prepare: false, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require", max: 1, types });
  run = (text, params = []) => sql.unsafe(text, params);
  end = () => sql.end({ timeout: 5 });
}

try {
  for (const statement of SCHEMA) await run(statement);
  console.log("tables ready, row level security on");

  // Access codes are gone; sign-in is by Supabase email and password.
  await run("delete from settings where key like 'access_code%'");
} finally {
  await end();
}
