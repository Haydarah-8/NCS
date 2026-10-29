import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { company } from "@/src/data";
import { btnPrimary, btnSecondary, narrow } from "@/lib/styles";

export default function CtaPanel({
  title = "Talk to us about your site.",
  intro = "No-obligation quotes for every service. The control room answers 24 hours a day, 365 days a year.",
  quote = "/our-details#enquiry",
  children,
}: {
  title?: string;
  intro?: string;
  quote?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-white py-24 md:py-32">
      <Reveal className={`${narrow} text-center`}>
        <h2 className="mx-auto max-w-[18ch] text-[36px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#1d1d1f] md:text-[56px]">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-[34rem] text-[19px] leading-[1.45] text-[#6e6e73] md:text-[21px]">{intro}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          {children ?? (
            <>
              <Link href={quote} className={btnPrimary}>
                Get a quote
              </Link>
              <a href={company.phoneHref} className={btnSecondary}>
                Call {company.phone}
              </a>
            </>
          )}
        </div>
      </Reveal>
    </section>
  );
}
