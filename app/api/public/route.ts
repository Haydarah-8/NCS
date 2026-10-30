/* Public, cached reads.
     (none)       published blog posts, for the blog page; a minute at the edge
     ?action=mode whether development mode is on, for the middleware; ten
                  seconds at the edge, so turning it on or off is quick */

import { publishedPosts, TOPICS } from "@/lib/server/blog";
import { getSql } from "@/lib/server/db";
import { guard, json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return guard(async () => {
    if (new URL(request.url).searchParams.get("action") === "mode") {
      const sql = await getSql();
      const [row] = await sql`select value from settings where key = 'devmode'`;
      const v = row?.value || {};
      return json({ devmode: { on: Boolean(v.on), message: String(v.message || "") } }, 200, { "cache-control": "public, s-maxage=10, stale-while-revalidate=20" });
    }
    return json({ posts: await publishedPosts(), topics: TOPICS }, 200, { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" });
  });
}
