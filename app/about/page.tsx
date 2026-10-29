import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Clock,
  Gauge,
  MapPinned,
  ShieldCheck,
  Truck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { company, promises, strengths } from "@/src/data";
import CtaPanel from "@/components/CtaPanel";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import TrustStats from "@/components/TrustStats";
import { btnPrimary, btnSecondary, container, narrow } from "@/lib/styles";

export const metadata = { title: "About" };

const strengthIcons: LucideIcon[] = [BadgeCheck, UserCheck, Building2, Clock, Truck, Gauge, MapPinned, ShieldCheck];

export default function AboutPage() {
  return (
    <article className="bg-white text-[#1d1d1f]">
      <PageHero
        eyebrow="About New Concept Security"
        title="The new generation of security."
        intro="The North West's leading provider of security services. Based in Blackpool, with a national footprint."
        image="/images/art/fleet-night.svg"
        imageAlt="New Concept Security vans lined up outside Concept House at night"
      >
        <Link href="/services" className={btnPrimary}>
          Our services
        </Link>
        <Link href="/careers" className={btnSecondary}>
          Work with us
        </Link>
      </PageHero>

      <section className="pb-28 pt-8 md:pb-40">
        <Reveal className={narrow}>
          <p className="text-[17px] font-semibold text-[#a01010] md:text-[19px]">Our story</p>
          <p className="mt-4 text-[28px] font-semibold leading-[1.22] tracking-[-0.02em] md:text-[44px]">
            Founded in {company.founded} with one mission: raise standards in the private security industry.{" "}
            <span className="text-[#86868b]">
              From local contracts in Blackpool, we now provide security and facility services throughout the UK,
              and have become one of the leading suppliers in the North West.
            </span>
          </p>
          <div className="mt-12 grid gap-8 text-[17px] leading-[1.6] text-[#6e6e73] md:grid-cols-2 md:text-[19px]">
            <p>
              The work is built around reacting quickly and delivering at scale. Every recommendation is specific to
              the site. If a smaller service will do the job, that is the one that gets quoted.
            </p>
            <p>
              The control room at Concept House runs 24 hours a day, 365 days a year, and the liveried vans go out
              from there. Company number {company.number}.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="bg-[#f5f5f7] py-24 md:py-32">
        <div className={container}>
          <Reveal>
            <SectionHeading title="The numbers behind the name." />
          </Reveal>
          <Reveal className="mt-16" delay={100}>
            <TrustStats />
          </Reveal>
          <Reveal className="mt-16 border-t border-[#d2d2d7] pt-16" delay={150}>
            <TrustStats items={promises} />
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className={container}>
          <Reveal>
            <SectionHeading
              title="What sets us apart."
              intro="A can-do culture, with the systems and the people to back it up."
            />
          </Reveal>
          <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((item, index) => {
              const Icon = strengthIcons[index] ?? ShieldCheck;
              return (
                <li key={item}>
                  <Reveal delay={(index % 4) * 60} className="flex h-full flex-col rounded-[22px] bg-[#f5f5f7] p-7">
                    <Icon className="size-8 text-[#a01010]" strokeWidth={1.5} aria-hidden="true" />
                    <p className="mt-6 text-[17px] font-semibold leading-snug tracking-[-0.01em] md:text-[19px]">{item}</p>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="bg-black py-24 text-white md:py-32">
        <div className={container}>
          <Reveal>
            <SectionHeading
              tone="dark"
              eyebrow="Accreditation"
              title="SIA Approved Contractor."
              intro={`${company.legal} holds Approved Contractor Scheme status for Security Guarding, Door Supervision and Key Holding. Officers are SIA licensed. Contractor reference ${company.acsCode}.`}
            />
          </Reveal>
          <Reveal className="mt-8 flex justify-center" delay={80}>
            <a href={company.acs} target="_blank" rel="noreferrer" className={btnPrimary}>
              View the ACS register
            </a>
          </Reveal>
          <Reveal className="mx-auto mt-14 max-w-[1000px]" delay={140}>
            <img
              src="/images/art/approved-contractor-dark.svg"
              alt="SIA Approved Contractor. The objective of the scheme is to raise performance standards and to assist the private security industry in developing new opportunities."
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <Reveal className={container}>
          <img
            src="/images/art/generation.svg"
            alt="The new generation of security. The North West leading provider of security services."
            className="h-auto w-full"
          />
        </Reveal>
      </section>

      <section className="bg-black py-20 text-center md:py-24">
        <Reveal className={container}>
          <img src="/images/brand-mark.png" alt="New Concept Security NW" className="mx-auto w-full max-w-[280px]" />
          <p className="mx-auto mt-6 max-w-[34rem] text-[17px] leading-relaxed text-white/60 md:text-[19px]">
            Security for premises that treat protection as seriously as the work behind it.
          </p>
        </Reveal>
      </section>

      <CtaPanel />
    </article>
  );
}
