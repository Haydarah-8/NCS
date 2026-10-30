/* Demonstration data for showing the Business Studio before the company
   authorises real information. Every row is marked sample = true and every
   name says "(sample)", so it can't be mistaken for a real client, and
   "Remove sample data" takes it all away again. Website analytics are never
   faked: those only ever show real visits. */

import type { Sql } from "./db";

const LEADS = [
  { name: "Sarah Whitfield (sample)", email: "sarah@example.com", phone: "07700 900123", company: "Example Leisure Ltd (sample)", site: "Door Supervision", location: "Talbot Road, Blackpool", page: "/services/door-supervision", message: "We need two SIA door supervisors for Friday and Saturday nights at our venue from November. Could you quote?", status: "new", kind: "sales", days: 1, follow: 1 },
  { name: "Mark Hughes (sample)", email: "mark@example.com", phone: "", company: "Example Construction (sample)", site: "Site Security", location: "Preston", page: "/services/site-security", message: "Looking for 24/7 static guarding and a CCTV tower for a new compound near Preston from 1 December.", status: "contacted", kind: "sales", days: 3, follow: 0 },
  { name: "Priya Shah (sample)", email: "priya@example.com", phone: "01253 555014", company: "Example Dental Practice (sample)", site: "Key Holding", location: "Lytham St Annes", page: "/services/key-holding", message: "Could you take over key holding and alarm response for our two practices?", status: "quoted", kind: "sales", days: 6, follow: -1 },
  { name: "Jordan Carter (sample)", email: "jordan@example.com", phone: "07700 900456", company: "", site: "Security Officer", location: "Blackpool", page: "/careers", message: "I hold a current SIA door supervisor licence and would like to apply for weekend shifts.", status: "new", kind: "recruitment", days: 2, follow: 3 },
];

const LOCATIONS = [
  { name: "Concept House (head office)", category: "office", address: "283 Church Street, Blackpool", postcode: "FY1 3PG", lat: 53.8193, lng: -3.0479, radius: 40, pub: true },
  { name: "Blackpool and the Fylde", category: "coverage", address: "", postcode: "", lat: 53.8175, lng: -3.0357, radius: 18, pub: true },
  { name: "Preston", category: "coverage", address: "", postcode: "", lat: 53.7632, lng: -2.7031, radius: 15, pub: true },
  { name: "Lancaster", category: "coverage", address: "", postcode: "", lat: 54.0466, lng: -2.8007, radius: 12, pub: true },
  { name: "Wigan", category: "coverage", address: "", postcode: "", lat: 53.545, lng: -2.6325, radius: 12, pub: true },
  { name: "Example retail park (sample site)", category: "site", address: "Example Way, Preston", postcode: "PR2 0AA", lat: 53.7801, lng: -2.7235, radius: null, pub: false, contact: "Site manager (sample)", phone: "01772 000000" },
  { name: "Example construction compound (sample site)", category: "site", address: "Example Lane, Blackburn", postcode: "BB1 0AA", lat: 53.7486, lng: -2.4875, radius: null, pub: false },
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
    for (const x of LOCATIONS) {
      await sql`insert into locations (name, category, address, postcode, lat, lng, radius_km, contact, phone, public, sample) values (${x.name}, ${x.category}, ${x.address}, ${x.postcode}, ${x.lat}, ${x.lng}, ${x.radius}, ${x.contact || ""}, ${x.phone || ""}, ${x.pub}, true)`;
    }
    for (const c of CAMPAIGNS) {
      await sql`insert into campaigns (name, slug, source, medium, destination, goal, sample) values (${c.name}, ${c.slug}, ${c.source}, ${c.medium}, ${c.destination}, ${c.goal}, true) on conflict (slug) do nothing`;
    }
    const [lead] = await sql`select id from leads where sample and kind = 'sales' and status = 'quoted' limit 1`;
    await sql`insert into documents (kind, title, status, data, lead_id, sample) values ('proposal', 'Key holding proposal: Example Dental Practice (sample)', 'reviewed',
      ${JSON.stringify({ client: "Example Dental Practice (sample)", contact: "Priya Shah (sample)", services: ["key-holding", "lock-and-unlock"], sample: true })}::jsonb, ${lead?.id || null}, true)`;
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
