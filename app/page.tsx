import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { company, faqs, promises, services } from "@/src/data";
import CtaPanel from "@/components/CtaPanel";
import FaqList from "@/components/FaqList";
import LogoMarquee from "@/components/LogoMarquee";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ServiceMarquee from "@/components/ServiceMarquee";
import Tile from "@/components/Tile";
import HomeServiceFeature from "@/components/HomeServiceFeature";
import TrustStats from "@/components/TrustStats";
import { btnPrimary, btnSecondaryDark, container, linkMore, narrow } from "@/lib/styles";

const halfTiles = [
  {
    slug: "mobile-security",
    title: "Security on the move.",
    intro: "Nationwide patrols, backed by our 24-hour control room.",
    tone: "dark",
  },
  {
    slug: "key-holding",
    title: "Your keys. Our responsibility.",
    intro: "Secure key holding and alarm response, from £3 per week.",
    tone: "light",
  },
  {
    slug: "healthcare",
    title: "A safer place to care.",
    intro: "Hospital security, patient watch and portering.",
    tone: "light",
  },
  {
    slug: "cctv-and-alarms",
    title: "Keep watch. Stay in control.",
    intro: "CCTV, wireless systems and access control for your premises.",
    tone: "dark",
  },
] as const;

export default function HomePage() {
  const bySlug = Object.fromEntries(services.map((service) => [service.slug, service]));

  return (
    <div className="bg-white text-[#1d1d1f]">
      <section className="relative -mt-[var(--header-h)] flex h-svh items-center overflow-hidden bg-black pt-[var(--header-h)] text-white">
        <img
          src="/images/hero-skyline-hd.jpg"
          alt="Glass towers viewed from below, with the New Concept Security mark"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto w-full max-w-[1120px] px-6 text-center">
          <div className="mx-auto max-w-[760px]">
            <p className="text-[17px] text-white/70">A Leading Security Supplier</p>
            <h1 className="mt-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-[72px]">
              Welcome to
              <br />
              New Concept Security
            </h1>
            <div className="mx-auto mt-6 h-[3px] w-24 bg-[#a01010]" />
            <p className="mx-auto mt-6 max-w-[40rem] text-[19px] leading-snug text-white/80 md:text-[21px]">
              New Concept Security are raising standards in the private security industry, while providing a
              range of security services to the public and private sector.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
              <Link
                href="/our-details"
                className="inline-flex h-12 items-center ncs-button rounded-none bg-[#a01010] px-8 text-[17px] font-medium text-white hover:bg-[#c41616]"
              >
                Get Started
              </Link>
              <Link href="#introducing" className="text-[19px] text-[#ff5a5a] hover:underline">
                Read more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-3 p-3">
        <Tile
          size="full"
          eyebrow="Security Personnel"
          title="Security staff to suit your needs."
          intro="Bespoke teams for premises and people, in a uniform that gets the right image for your brand."
          href="/services/security-personnel"          image="/images/art/security-personnel.svg"
          imageAlt="Two New Concept Security officers in a building reception"
        />
        <HomeServiceFeature
          featured
          tone="dark"
          eyebrow="Site Security"
          title="Every site, surveyed first."
          intro="Site surveys, CCTV and perimeter patrols. Protection built around your premises."
          href="/services/site-security"
          image="/images/art/site-security.svg"
          imageAlt="Construction site with keep out and CCTV signs on perimeter fencing"
        />
        <div className="grid gap-3 lg:grid-cols-2">
          {halfTiles.map((tile) => {
            const service = bySlug[tile.slug];
            return (
              <HomeServiceFeature
                key={tile.slug}
                tone={tile.tone}
                eyebrow={service.title}
                title={tile.title}
                intro={tile.intro}
                href={`/services/${service.slug}`}                image={service.image}
                imageAlt={service.imageAlt}
              />
            );
          })}
        </div>
      </div>

      <section id="introducing" className="py-28 md:py-40">
        <Reveal className={narrow}>
          <p className="text-[17px] font-semibold text-[#a01010] md:text-[19px]">About New Concept Security</p>
          <p className="mt-4 text-[30px] font-semibold leading-[1.18] tracking-[-0.02em] md:text-[48px]">
            Founded in Blackpool in {company.founded} to raise standards in private security.{" "}
            <span className="text-[#86868b]">
              Today we provide bespoke security and facility services throughout the UK, with a can-do culture
              that reacts and delivers at speed and at scale.
            </span>
          </p>
          <Link href="/about" className={`${linkMore} mt-8 md:text-[19px]`}>
            More about us <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      <section className="bg-[#f5f5f7] py-24 md:py-32">
        <div className={container}>
          <Reveal>
            <SectionHeading
              title="Trusted across the North West."
              intro="One of the leading security suppliers in the region, meeting the demands of an ever changing marketplace."
            />
          </Reveal>
          <Reveal className="mt-16 md:mt-20" delay={100}>
            <TrustStats />
          </Reveal>
        </div>
      </section>

      <section className="overflow-hidden bg-black py-24 text-white md:py-32">
        <Reveal className={`${narrow} text-center`}>
          <p className="text-[17px] font-semibold text-[#ff5a5a] md:text-[19px]">We are ready 24 hours for you</p>
          <h2 className="mx-auto mt-2 max-w-[16ch] text-[38px] font-semibold leading-[1.07] tracking-[-0.02em] md:text-[64px]">
            Our protection is always there, 24 hours.
          </h2>
          <p className="mx-auto mt-5 max-w-[34rem] text-[19px] leading-[1.45] text-white/75 md:text-[21px]">
            Working throughout the UK to keep your business and your staff safe.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <a href={company.phoneHref} className={btnPrimary}>
              Call {company.phone}
            </a>
            <a href={company.acs} target="_blank" rel="noreferrer" className={btnSecondaryDark}>
              View our ACS listing
            </a>
          </div>
        </Reveal>
        <Reveal className={`${container} mt-14 md:mt-20`} delay={120}>
          <img
            src="/images/art/fleet-night-dark.svg"
            alt="New Concept Security vans outside Concept House at night"
            className="mx-auto h-auto w-full max-w-[1200px] max-md:-mx-[10%] max-md:w-[120%] max-md:max-w-none"
          />
        </Reveal>
        <Reveal className={`${narrow} mt-16 md:mt-20`} delay={160}>
          <TrustStats items={promises} tone="dark" size="md" />
        </Reveal>
      </section>

      <section id="services" className="bg-[#f5f5f7] py-24 md:py-32">
        <div className={container}>
          <Reveal>
            <SectionHeading
              title="Every service we provide."
              intro="Every security solution we recommend is entirely bespoke. If a more cost-effective service will do the job, we will tell you."
            />
          </Reveal>

        </div>
        <ServiceMarquee services={services.filter((service) => service.slug !== "personal-security")} />
      </section>

      <section className="py-24 md:py-28">
        <Reveal className={container}>
          <SectionHeading
            title="Hundreds of secure locations."
            intro="From businesses to NHS providers and commercial premises, throughout the UK."
          />
        </Reveal>
        <div className="mt-14">
          <LogoMarquee />
        </div>
      </section>

      <section className="bg-[#f5f5f7] py-24 md:py-32">
        <div className={narrow}>
          <Reveal>
            <SectionHeading title="Questions? Answers." />
          </Reveal>
          <Reveal className="mt-12" delay={100}>
            <FaqList items={faqs.slice(0, 5)} />
            <Link href="/faq" className={`${linkMore} mt-8`}>
              See all questions <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaPanel />
    </div>
  );
}
