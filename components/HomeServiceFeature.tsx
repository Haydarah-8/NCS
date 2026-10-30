import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { artSrc } from "@/lib/art";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  href: string;
  image: string;
  imageAlt: string;
  tone?: "light" | "dark";
  featured?: boolean;
};

export default function HomeServiceFeature({ eyebrow, title, intro, href, image, imageAlt, tone = "light", featured = false }: Props) {
  const dark = tone === "dark";
  return (
    <section id={`feature-${href.split("/").pop()}`} className={`overflow-hidden ${dark ? "bg-[#111113] text-white" : "bg-[#f5f5f7] text-[#1d1d1f]"}`}>
      <div className={`mx-auto grid h-full items-center gap-2 sm:grid-cols-[1.1fr_1fr] ${featured ? "max-w-[1120px]" : ""}`}>
        <Reveal className={`px-8 pb-4 pt-11 sm:py-14 ${featured ? "sm:px-10" : "sm:pl-7 sm:pr-0"}`}>
          <p className={`text-[12px] font-medium ${dark ? "text-[#ff7777]" : "text-[#a01010]"}`}>{eyebrow}</p>
          <h2 className={`mt-2 max-w-[22ch] font-semibold leading-[1.12] tracking-[-0.025em] ${featured ? "text-[40px] md:text-[54px]" : "text-[34px] xl:text-[40px]"}`}>{title}</h2>
          <p className={`mt-3 max-w-[38ch] text-[17px] leading-relaxed ${dark ? "text-white/65" : "text-[#6e6e73]"}`}>{intro}</p>
          <Link href={href} aria-label={`Learn more about ${eyebrow.toLowerCase()}`} className={`mt-5 inline-flex items-center gap-2 text-[15px] font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 ${dark ? "text-[#ff7777]" : "text-[#a01010]"}`}>Learn more <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
        </Reveal>
        <Reveal delay={80} className="flex items-center justify-center px-5 pb-5 sm:py-7">
          <img src={artSrc(image, tone)} alt={imageAlt} loading="lazy" className={`h-auto w-full object-contain ${featured ? "max-h-[360px] max-w-[600px]" : "max-h-[285px] max-w-[390px]"}`} />
        </Reveal>
      </div>
    </section>
  );
}
