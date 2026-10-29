/* Published blog posts, for the blog page and anything else that lists
   them. Cached at the edge for a minute. */

import { publishedPosts, TOPICS } from "@/lib/server/blog";
import { guard, json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return guard(async () =>
    json({ posts: await publishedPosts(), topics: TOPICS }, 200, { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" }),
  );
}
