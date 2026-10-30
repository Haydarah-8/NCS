import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Mail, Phone, Smartphone } from "lucide-react";
import { company, getService, services } from "@/src/data";
import CtaPanel from "@/components/CtaPanel";
import LocalNav from "@/components/LocalNav";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import { btnPrimary, btnSecondary, container, narrow } from "@/lib/styles";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  return { title: service ? service.title : "Service", description: service?.summary };
}

function FeatureGrid({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <li key={item}>
          <Reveal delay={(index % 3) * 60} className="flex h-full flex-col rounded-none bg-[#f5f5f7] p-6 md:p-7">
            <span className="grid size-8 place-items-center rounded-none bg-[#a01010] text-white">
              <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="mt-5 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[#1d1d1f] md:text-[19px]">
              {item}
            </span>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = services.filter((item) => item.group === service.group && item.slug !== service.slug);
  const more = related.length > 0 ? related : services.filter((item) => item.slug !== service.slug).slice(0, 4);
  const [lead, ...rest] = service.paragraphs;
  const quote = `/our-details?service=${encodeURIComponent(service.title)}#enquiry`;
  const hasDetails = Boolean(service.points || service.groups || service.sections);

  return (
    <article className="bg-white text-[#1d1d1f]">
      <LocalNav
        title={service.title}
        href={`/services/${service.slug}`}
        links={[
          { href: "#overview", label: "Overview" },
          ...(hasDetails ? [{ href: "#details", label: "Details" }] : []),
          { href: "#contact", label: "Contact" },
        ]}
        cta={{ href: quote, label: "Get a quote" }}
      />

      <PageHero
        eyebrow={service.title}
        title={service.headline ?? service.title}
        intro={service.summary}
        image={service.image}
        imageAlt={service.imageAlt}
      >
        <Link href={quote} className={btnPrimary}>
          Get a quote
        </Link>
        <a href={company.phoneHref} className={btnSecondary}>
          Call {company.phone}
        </a>
      </PageHero>

      <section id="overview" className="scroll-mt-28 border-t border-[#e8e8ed] py-20 md:py-28">
        <div className={narrow}>
          <Reveal>
            <p className="text-[17px] font-semibold text-[#a01010] md:text-[19px]">Overview</p>
            <p className="mt-4 text-[21px] font-semibold leading-[1.35] tracking-[-0.015em] md:text-[27px]">{lead}</p>
          </Reveal>
          {rest.length > 0 && (
            <Reveal delay={100}>
              <div className="mt-10 gap-12 space-y-5 text-[17px] leading-[1.6] text-[#6e6e73] md:columns-2 md:space-y-0 md:text-[19px] [&>p]:mb-5 [&>p]:break-inside-avoid">
                {rest.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {hasDetails && (
        <section id="details" className="scroll-mt-28 pb-20 md:pb-28">
          <div className={container}>
            {service.points && (
              <div>
                <Reveal>
                  <SectionHeading align="left" title="At a glance." />
                </Reveal>
                <div className="mt-10">
                  <FeatureGrid items={service.points} />
                </div>
              </div>
            )}
            {service.groups?.map((group) => (
              <div key={group.heading} className="mt-20 first:mt-0">
                <Reveal>
                  <SectionHeading align="left" title={`${group.heading}.`} />
                </Reveal>
                <div className="mt-10">
                  <FeatureGrid items={group.items} />
                </div>
              </div>
            ))}
          </div>
          {service.sections?.map((section, index) => (
            <div
              key={section.heading}
              className={`mt-20 py-20 md:mt-28 md:py-28 ${index % 2 === 0 ? "bg-[#f5f5f7]" : "bg-black text-white"}`}
            >
              <div className={`${narrow} grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16`}>
                <Reveal>
                  <h2 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[48px]">
                    {section.heading}.
                  </h2>
                </Reveal>
                <Reveal delay={100}>
                  <div
                    className={`space-y-5 text-[17px] leading-[1.6] md:text-[19px] ${
                      index % 2 === 0 ? "text-[#6e6e73]" : "text-white/70"
                    }`}
                  >
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          ))}
        </section>
      )}

      {service.posters && (
        <section className="bg-[#f5f5f7] py-20 md:py-28">
          <div className={container}>
            <Reveal>
              <SectionHeading title="Take a closer look." />
            </Reveal>
            <div className={`mt-12 grid gap-6 ${service.posters.length > 1 ? "lg:grid-cols-2" : "mx-auto max-w-[1000px]"}`}>
              {service.posters.map((poster, index) => (
                <Reveal key={poster.src} delay={index * 100}>
                  <img
                    src={poster.src}
                    alt={poster.alt}
                    className="h-auto w-full"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="scroll-mt-28 py-20 md:py-28">
        <div className={container}>
          <Reveal>
            <SectionHeading
              title="Speak to the team."
              intro={`Full details on ${service.title.toLowerCase()}, and how we can help you in particular.`}
            />
          </Reveal>
          <ul className="mx-auto mt-12 grid max-w-[1000px] gap-3 md:grid-cols-3">
            {[
              { icon: Phone, label: "Head office", value: company.phone, href: company.phoneHref, note: "Control room, 24/7" },
              { icon: Smartphone, label: "Managers", value: company.mobile, href: company.mobileHref, note: "Talk through your site" },
              { icon: Mail, label: "Email", value: "Send an email", href: `mailto:${company.email}`, note: company.email },
            ].map((item, index) => (
              <li key={item.label}>
                <Reveal delay={index * 80} className="h-full">
                  <a
                    href={item.href}
                    className="group flex h-full flex-col items-center rounded-none bg-[#f5f5f7] px-6 py-9 text-center transition hover:bg-[#ebebef]"
                  >
                    <item.icon className="size-7 text-[#a01010]" strokeWidth={1.5} aria-hidden="true" />
                    <span className="mt-4 text-[14px] text-[#6e6e73]">{item.label}</span>
                    <span className="mt-1 text-[21px] font-semibold tracking-[-0.01em] group-hover:text-[#a01010]">
                      {item.value}
                    </span>
                    <span className="mt-1 break-all text-[13px] text-[#86868b]">{item.note}</span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="related-services" className="bg-[#f5f5f7] pb-12 pt-20 md:pt-28">
        <div className={`${container} flex justify-center text-center`}>
          <Reveal>
            <h2 className="text-[30px] font-semibold tracking-[-0.02em] md:text-[40px]">
              {related.length > 0 ? `Also in ${service.group}.` : "Explore more services."}
            </h2>
          </Reveal>
        </div>
        <ul className="mt-10 grid w-full auto-cols-fr grid-flow-col gap-2 px-3 sm:gap-4 sm:px-6 md:mt-14 xl:gap-6 xl:px-10">
          {more.map((item) => (
            <li key={item.slug} className="min-w-0">
              <ServiceCard service={item} large className="text-center" />
            </li>
          ))}
        </ul>
      </section>

      <CtaPanel title={`Get a quote for ${service.title.toLowerCase()}.`} quote={quote} />
    </article>
  );
}
