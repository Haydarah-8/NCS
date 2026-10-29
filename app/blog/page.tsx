import Link from "next/link";
import CtaPanel from "@/components/CtaPanel";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { coverSrc, longDate, publishedPosts, TOPICS, type PostSummary } from "@/lib/server/blog";
import { container } from "@/lib/styles";

export const metadata = { title: "News and insights" };
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: PostSummary[] = [];
  try {
    posts = await publishedPosts();
  } catch {
    // No database yet: the page still renders, just without posts.
  }
  return (
    <article className="bg-white text-[#1d1d1f]">
      <PageHero compact eyebrow="News" title="News and insights." intro="Updates from the control room, the sites we look after, and advice on keeping people and property safe." />
      <Reveal className={`${container} pb-20`}>
        {posts.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => {
              const src = coverSrc(p.cover);
              return (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="group block overflow-hidden rounded-[28px] bg-[#f5f5f7] transition hover:bg-[#ececee]">
                    <div className="aspect-[16/10] overflow-hidden bg-black">
                      {src && <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />}
                    </div>
                    <div className="p-6">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#a01010]">{TOPICS[p.topic]}</p>
                      <h2 className="mt-2 text-[22px] font-semibold leading-[1.2] tracking-[-0.015em]">{p.title}</h2>
                      {p.dek && <p className="mt-2 line-clamp-3 text-[16px] leading-[1.45] text-[#6e6e73]">{p.dek}</p>}
                      <p className="mt-4 text-[14px] text-[#86868b]">
                        {longDate(p.published_at)} · {p.minutes} min read
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-10 text-center text-[19px] text-[#6e6e73]">No posts yet. Check back soon.</p>
        )}
      </Reveal>
      <CtaPanel title="Talk to the office." />
    </article>
  );
}
