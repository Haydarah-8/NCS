/* Demonstration data for showing the Business Studio before the company
   authorises real information. Every row is marked sample = true and every
   name says "(sample)", so it can't be mistaken for a real client, and
   "Remove sample data" takes it all away again. Website analytics are never
   faked: those only ever show real visits. */

import type { Sql } from "./db";

const LEADS = [
  { name: "Sarah Whitfield (sample)", email: "sarah@example.com", phone: "07700 900123", company: "Example Leisure Ltd (sample)", site: "Security Personnel", location: "Talbot Road, Blackpool", page: "/services/security-personnel", message: "We need two SIA licensed security officers for Friday and Saturday nights at our premises from November. Could you quote?", status: "new", kind: "sales", days: 1, follow: 1 },
  { name: "Mark Hughes (sample)", email: "mark@example.com", phone: "", company: "Example Construction (sample)", site: "Site Security", location: "Preston", page: "/services/site-security", message: "Looking for 24/7 static guarding and a CCTV tower for a new compound near Preston from 1 December.", status: "contacted", kind: "sales", days: 3, follow: 0 },
  { name: "Priya Shah (sample)", email: "priya@example.com", phone: "01253 555014", company: "Example Dental Practice (sample)", site: "Key Holding", location: "Lytham St Annes", page: "/services/key-holding", message: "Could you take over key holding and alarm response for our two practices?", status: "quoted", kind: "sales", days: 6, follow: -1 },
  { name: "Jordan Carter (sample)", email: "jordan@example.com", phone: "07700 900456", company: "", site: "Security Officer", location: "Blackpool", page: "/careers", message: "I hold a current SIA security guarding licence and would like to apply for weekend shifts.", status: "new", kind: "recruitment", days: 2, follow: 3 },
];

const CAMPAIGNS = [
  { name: "Autumn recruitment (sample)", slug: "autumn-recruitment-sample", source: "facebook", medium: "social", destination: "/careers", goal: "Applications from SIA licensed officers" },
  { name: "Construction mailshot (sample)", slug: "construction-mailshot-sample", source: "email", medium: "email", destination: "/services/site-security", goal: "Site survey requests" },
];

export const SAMPLE = {
  async load(sql: Sql) {
    await this.remove(sql);
    for (const l of LEADS) {
      await sql`insert into leads (ts, name, email, phone, company, site, location, message, source, status, kind, page, follow_up, visitor, sample)
        values (now() - make_interval(days => ${l.days}), ${l.name}, ${l.email}, ${l.phone}, ${l.company}, ${l.site}, ${l.location}, ${l.message}, 'contact', ${l.status}, ${l.kind}, ${l.page},
                (now() at time zone 'Europe/London')::date + ${l.follow}::int, 'sample', true)`;
    }
    for (const c of CAMPAIGNS) {
      await sql`insert into campaigns (name, slug, source, medium, destination, goal, sample) values (${c.name}, ${c.slug}, ${c.source}, ${c.medium}, ${c.destination}, ${c.goal}, true) on conflict (slug) do nothing`;
    }
  },
  async remove(sql: Sql) {
    await sql.transaction([
      sql`delete from leads where sample`,
      sql`delete from documents where sample`,
      sql`delete from library where sample`, // from before the Library was removed
      sql`delete from locations where sample`,
      sql`delete from campaigns where sample`,
    ]);
  },
};
