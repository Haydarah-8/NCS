/* Blog posts written in the admin panel: the topics, the list and one post.
   Rendered with lib/md.js, the same renderer as the admin editor's preview,
   so what you see while writing is what gets published. */

import { render } from "@/lib/md.js";
import { getSql } from "./db";

export const TOPICS: Record<string, string> = {
  guarding: "Guarding",
  construction: "Construction",
  venues: "Venues and events",
  healthcare: "Healthcare",
  technology: "CCTV and technology",
  news: "Company news",
};

export type PostSummary = { slug: string; title: string; dek: string | null; topic: string; cover: string | null; published_at: string; minutes: number };

const minutes = (body: unknown) => Math.max(2, Math.ceil(String(body || "").split(/\s+/).length / 220));
const topicOf = (t: unknown) => (typeof t === "string" && TOPICS[t] ? t : "news");
/* Covers are photographs from /images, by name. */
export const coverSrc = (cover: unknown) => (typeof cover === "string" && /^[a-z0-9-]+$/.test(cover) ? `/images/${cover}.jpg` : null);

export async function publishedPosts(): Promise<PostSummary[]> {
  const sql = await getSql();
  const rows = await sql`
    select slug, title, dek, topic, cover, published_at, body
    from posts where status = 'published' and published_at <= now()
    order by published_at desc limit 50`;
  return rows.map(({ body, ...p }) => ({ ...p, topic: topicOf(p.topic), minutes: minutes(body) }) as PostSummary);
}

export async function publishedPost(slug: string) {
  const sql = await getSql();
  const [post] = await sql`
    select slug, title, dek, topic, cover, body, published_at from posts
    where slug = ${slug} and status = 'published' and published_at <= now()`;
  if (!post) return null;
  const { html, toc, minutes: min } = render(post.body);
  return {
    slug: post.slug as string,
    title: post.title as string,
    dek: post.dek as string | null,
    cover: post.cover as string | null,
    published_at: post.published_at as string,
    topic: topicOf(post.topic),
    html: html as string,
    toc: toc as { id: string; text: string }[],
    minutes: min as number,
  };
}

export const longDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
