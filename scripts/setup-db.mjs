/* Creates the admin panel's tables, and the access code if there isn't one
   yet. Safe to run again: it only adds what is missing. The code is printed
   once, here, and only its scrypt hash is stored. Works with Supabase (or
   any Postgres) and with Neon.

     npm run db:setup        set up
     npm run db:new-code     replace the code
*/

import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { hashCode, newCode } from "../lib/server/codes.mjs";
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

  const [existing] = await run("select 1 from settings where key = 'access_code'");
  if (!existing || process.argv.includes("--new-code")) {
    const code = newCode();
    await run(
      `insert into settings (key, value) values ('access_code', $1::jsonb)
       on conflict (key) do update set value = excluded.value, updated_at = now()`,
      [JSON.stringify(await hashCode(code))],
    );
    console.log(`access code: ${code}`);
  } else {
    console.log("access code already set (use npm run db:new-code to replace it)");
  }
} finally {
  await end();
}
