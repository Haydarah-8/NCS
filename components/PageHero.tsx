import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { artSrc } from "@/lib/art";
import { container, narrow } from "@/lib/styles";

/** Centred, typography-led page opener with an optional wide image underneath. */
export default function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt = "",
  children,
  tone = "light",
  compact = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
  tone?: "light" | "dark";
  compact?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <header className={`overflow-hidden ${dark ? "bg-black text-white" : "bg-white text-[#1d1d1f]"}`}>
      <Reveal className={`${narrow} text-center ${compact ? "pb-10 pt-14 md:pb-14 md:pt-20" : "pb-12 pt-16 md:pb-16 md:pt-24"}`}>
        {eyebrow && (
          <p className={`text-[19px] font-semibold md:text-[21px] ${dark ? "text-[#ff5a5a]" : "text-[#a01010]"}`}>
            {eyebrow}
          </p>
        )}
        <h1 className="mx-auto mt-2 max-w-[17ch] text-[44px] font-semibold leading-[1.05] tracking-[-0.025em] sm:text-[60px] lg:text-[76px]">
          {title}
        </h1>
        {intro && (
          <p
            className={`mx-auto mt-5 max-w-[38rem] text-[19px] leading-[1.4] md:text-[23px] ${
              dark ? "text-white/70" : "text-[#6e6e73]"
            }`}
          >
            {intro}
          </p>
        )}
        {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-4">{children}</div>}
      </Reveal>
      {image && (
        <Reveal className={`${container} pb-10 md:pb-16`}>
          <img src={artSrc(image, tone)} alt={imageAlt} className="mx-auto h-auto w-full max-w-[1100px] max-md:-mx-[10%] max-md:w-[120%] max-md:max-w-none" />
        </Reveal>
      )}
    </header>
  );
}
