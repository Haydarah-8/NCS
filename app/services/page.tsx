import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { company, groupIntros, serviceGroups, services } from "@/src/data";
import CtaPanel from "@/components/CtaPanel";
import LocalNav from "@/components/LocalNav";
import Reveal from "@/components/Reveal";
import ServiceCard from "@/components/ServiceCard";
import ServiceIcon from "@/components/ServiceIcon";
import { container, linkMore } from "@/lib/styles";
import { groupAnchor } from "@/lib/utils";

export const metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <article className="bg-[#f5f5f7] text-[#1d1d1f]">
      <LocalNav
        title="Services"
        href="/services"
        links={serviceGroups.map((group) => ({ href: `#${groupAnchor(group)}`, label: group }))}
        cta={{ href: "/our-details#enquiry", label: "Get a quote" }}
      />

      <header className={`${container} grid gap-6 pb-10 pt-16 md:grid-cols-[1fr_auto] md:items-end md:pt-24`}>
        <Reveal>
          <h1 className="max-w-[20ch] text-[44px] font-semibold leading-[1.05] tracking-[-0.025em] md:text-[72px]">
            Services.{" "}
            <span className="text-[#86868b]">Every solution, built around your site.</span>
          </h1>
        </Reveal>
        <Reveal className="text-[15px] leading-relaxed text-[#1d1d1f] md:max-w-[15rem] md:pb-3" delay={100}>
          <p className="font-semibold">Need help choosing?</p>
          <a href={company.mobileHref} className={`${linkMore} text-[15px]`}>
            Talk to a manager <ChevronRight className="size-4" aria-hidden="true" />
          </a>
        </Reveal>
      </header>

      <Reveal delay={150}>
        <ul
          className="no-scrollbar flex gap-6 overflow-x-auto pb-10 pt-4 md:gap-8"
          style={{ paddingLeft: "max(1.25rem, calc((100vw - 1136px) / 2))", paddingRight: "1.25rem" }}
        >
          {services.map((service) => (
            <li key={service.slug} className="shrink-0">
              <Link href={`/services/${service.slug}`} className="group flex w-[88px] flex-col items-center text-center">
                <span className="grid size-[60px] place-items-center rounded-full bg-white text-[#1d1d1f] shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition duration-300 group-hover:bg-[#a01010] group-hover:text-white">
                  <ServiceIcon slug={service.slug} className="size-6" />
                </span>
                <span className="mt-2.5 text-[12px] font-semibold leading-tight">{service.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>

      {serviceGroups.map((group) => {
        const items = services.filter((service) => service.group === group);
        return (
          <section key={group} id={groupAnchor(group)} className="scroll-mt-28 pb-16 pt-10 md:pb-20">
            <Reveal className={container}>
              <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[40px]">
                {group}. <span className="text-[#86868b]">{groupIntros[group]}</span>
              </h2>
            </Reveal>
            <div
              className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-8 pt-2"
              style={{
                paddingLeft: "max(1.25rem, calc((100vw - 1136px) / 2))",
                paddingRight: "1.25rem",
                scrollPaddingLeft: "max(1.25rem, calc((100vw - 1136px) / 2))",
              }}
            >
              {items.map((service) => (
                <ServiceCard
                  key={service.slug}
                  service={service}
                  className="w-[min(82vw,360px)] shrink-0 snap-start"
                />
              ))}
            </div>
          </section>
        );
      })}

      <CtaPanel
        title="Not sure what you need?"
        intro="Every package is bespoke. Talk it through with a manager and we will survey the site first."
      />
    </article>
  );
}
