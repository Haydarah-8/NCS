import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CtaPanel from "@/components/CtaPanel";
import { coverSrc, longDate, publishedPost, TOPICS } from "@/lib/server/blog";
import { narrow } from "@/lib/styles";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await publishedPost(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await load((await params).slug);
  return post ? { title: post.title, description: post.dek || undefined } : { title: "Post not found" };
}

export default async function PostPage({ params }: Props) {
  const post = await load((await params).slug);
  if (!post) notFound();
  const src = coverSrc(post.cover);
  return (
    <article className="bg-white text-[#1d1d1f]">
      <header className={`${narrow} pb-10 pt-14 text-center md:pt-20`}>
        <p className="text-[15px] text-[#86868b]">
          <Link href="/blog" className="hover:text-[#a01010]">News</Link> ·{" "}
          <span className="font-semibold text-[#a01010]">{TOPICS[post.topic]}</span>
        </p>
        <h1 className="mx-auto mt-3 max-w-[20ch] text-[40px] font-semibold leading-[1.06] tracking-[-0.025em] sm:text-[56px]">{post.title}</h1>
        {post.dek && <p className="mx-auto mt-5 max-w-[38rem] text-[20px] leading-[1.4] text-[#6e6e73]">{post.dek}</p>}
        <p className="mt-6 text-[15px] text-[#86868b]">
          {longDate(post.published_at)} · {post.minutes} min read
        </p>
      </header>
      {src && (
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
          <img src={src} alt="" className="aspect-[21/9] w-full rounded-[28px] object-cover" />
        </div>
      )}
      <div className={`${narrow} grid gap-10 py-14 lg:grid-cols-[200px_1fr]`}>
        {post.toc.length > 1 ? (
          <nav aria-label="Contents" className="hidden lg:block">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">Contents</p>
            <ul className="sticky top-[calc(var(--header-h)+24px)] mt-3 grid gap-2 text-[15px]">
              {post.toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="text-[#6e6e73] hover:text-[#a01010]" dangerouslySetInnerHTML={{ __html: t.text }} />
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <div className="hidden lg:block" />
        )}
        <div
          className="max-w-[44rem] text-[19px] leading-[1.6] [&_a]:text-[#a01010] [&_a]:underline [&_blockquote]:my-8 [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#a01010] [&_blockquote]:pl-5 [&_blockquote]:text-[22px] [&_code]:rounded [&_code]:bg-[#f5f5f7] [&_code]:px-1.5 [&_h2]:mt-12 [&_h2]:scroll-mt-[calc(var(--header-h)+24px)] [&_h2]:text-[30px] [&_h2]:font-semibold [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.02em] [&_h3]:mt-8 [&_h3]:text-[22px] [&_h3]:font-semibold [&_li]:mt-2 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-5 [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </div>
      <CtaPanel title="Need cover like this?" />
    </article>
  );
}
