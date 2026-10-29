import Link from "next/link";
import Reveal from "@/components/Reveal";
import { artSrc } from "@/lib/art";
import { btnPrimary, btnSecondary, btnSecondaryDark } from "@/lib/styles";

/** Apple-style promo tile: centred copy, two actions, and the illustration rising from the bottom edge. */
export default function Tile({
  eyebrow,
  title,
  intro,
  href,
  quote,
  image,
  imageAlt = "",
  tone = "light",
  size = "half",
}: {
  eyebrow: string;
  title: string;
  intro: string;
  href: string;
  quote: string;
  image: string;
  imageAlt?: string;
  tone?: "light" | "dark";
  size?: "full" | "half";
}) {
  const dark = tone === "dark";
  const full = size === "full";
  return (
    <section
      className={`flex flex-col overflow-hidden text-center ${dark ? "bg-black text-white" : "bg-[#f5f5f7] text-[#1d1d1f]"} ${
        full ? "pt-14 md:pt-[72px]" : "pt-12 md:pt-14"
      }`}
    >
      <Reveal className="px-6">
        <p className={`text-[17px] font-semibold md:text-[19px] ${dark ? "text-[#ff5a5a]" : "text-[#a01010]"}`}>
          {eyebrow}
        </p>
        <h2
          className={`mx-auto mt-1 max-w-[18ch] font-semibold leading-[1.07] tracking-[-0.02em] ${
            full ? "text-[38px] md:text-[56px]" : "text-[32px] md:text-[40px]"
          }`}
        >
          {title}
        </h2>
        <p
          className={`mx-auto mt-2 max-w-[34rem] ${full ? "text-[19px] md:text-[24px]" : "text-[17px] md:text-[19px]"} ${
            dark ? "text-white/75" : "text-[#1d1d1f]/75"
          }`}
        >
          {intro}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3.5">
          <Link href={href} className={btnPrimary}>
            Learn more
          </Link>
          <Link href={quote} className={dark ? btnSecondaryDark : btnSecondary}>
            Get a quote
          </Link>
        </div>
      </Reveal>
      <Reveal className={`mt-auto w-full pt-6 ${full ? "md:px-12" : "md:px-8"}`} delay={120}>
        <img
          src={artSrc(image, tone)}
          alt={imageAlt}
          className={`mx-auto h-auto w-full ${full ? "max-w-[1080px]" : "max-w-[640px]"} max-md:-mx-[10%] max-md:w-[120%] max-md:max-w-none`}
        />
      </Reveal>
    </section>
  );
}
