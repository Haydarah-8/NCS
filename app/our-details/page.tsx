import Link from "next/link";
import { ChevronRight, Clock, Mail, MapPin, Phone, Smartphone } from "lucide-react";
import { company } from "@/src/data";
import ContactForm from "@/components/ContactForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { container, linkMore, linkMoreDark } from "@/lib/styles";

export const metadata = { title: "Contact" };

type PageProps = { searchParams: Promise<{ service?: string }> };

export default async function OurDetailsPage({ searchParams }: PageProps) {
  const { service } = await searchParams;
  const methods = [
    { icon: Phone, label: "Head office", value: company.phone, href: company.phoneHref, note: "Control room answers 24/7" },
    { icon: Smartphone, label: "Managers", value: company.mobile, href: company.mobileHref, note: "Talk through a service" },
    { icon: Mail, label: "Email", value: "Send an email", href: `mailto:${company.email}`, note: company.email },
    {
      icon: MapPin,
      label: "Office",
      value: "Concept House",
      href: company.maps,
      note: company.address.slice(1).join(", "),
      external: true,
    },
  ];

  return (
    <article className="bg-white text-[#1d1d1f]">
      <PageHero
        compact
        eyebrow="Contact"
        title="Don't hesitate to contact us."
        intro="Call us or send an enquiry for a security consultation or a quotation."
      />

      <section className="pb-20 md:pb-24">
        <ul className={`${container} grid gap-3 sm:grid-cols-2 lg:grid-cols-4`}>
          {methods.map((method, index) => (
            <li key={method.label}>
              <Reveal delay={index * 70} className="h-full">
                <a
                  href={method.href}
                  target={method.external ? "_blank" : undefined}
                  rel={method.external ? "noreferrer" : undefined}
                  className="group flex h-full flex-col items-center rounded-none bg-[#f5f5f7] px-6 py-9 text-center transition hover:bg-[#ebebef]"
                >
                  <method.icon className="size-7 text-[#a01010]" strokeWidth={1.5} aria-hidden="true" />
                  <span className="mt-4 text-[14px] text-[#6e6e73]">{method.label}</span>
                  <span className="mt-1 text-[21px] font-semibold tracking-[-0.01em] group-hover:text-[#a01010]">
                    {method.value}
                  </span>
                  <span className="mt-1 break-all text-[13px] text-[#86868b]">{method.note}</span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section id="enquiry" className="scroll-mt-20 bg-[#f5f5f7] py-20 md:py-28">
        <div className={`${container} grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16`}>
          <Reveal>
            <p className="text-[17px] font-semibold text-[#a01010] md:text-[19px]">Request a quote</p>
            <h2 className="mt-1.5 text-[36px] font-semibold leading-[1.08] tracking-[-0.02em] md:text-[52px]">
              Tell us about your site.
            </h2>
            <p className="mt-4 text-[19px] leading-[1.45] text-[#6e6e73]">
              What you need covering, where and when. A manager will be in touch with a no-obligation quote.
            </p>
            <dl className="mt-10 space-y-6 border-t border-[#d2d2d7] pt-8 text-[17px]">
              <div className="flex gap-4">
                <Clock className="mt-0.5 size-5 shrink-0 text-[#a01010]" aria-hidden="true" />
                <div>
                  <dt className="font-semibold">Opening hours</dt>
                  <dd className="text-[#6e6e73]">
                    Office: {company.hoursOffice}
                    <br />
                    {company.hoursControl}
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-[#a01010]" aria-hidden="true" />
                <div>
                  <dt className="font-semibold">Visit the office</dt>
                  <dd className="text-[#6e6e73]">{company.address.join(", ")}</dd>
                  <dd>
                    <a href={company.maps} target="_blank" rel="noreferrer" className={`${linkMore} mt-1 text-[15px]`}>
                      Open in Maps <ChevronRight className="size-4" aria-hidden="true" />
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={100} className="rounded-none bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-10">
            <ContactForm defaultService={service} />
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className={container}>
          <Reveal className="grid items-center overflow-hidden rounded-none bg-black text-white md:grid-cols-2">
            <div className="p-10 md:p-14">
              <p className="text-[17px] font-semibold text-[#ff5a5a]">Careers</p>
              <h2 className="mt-1.5 text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[40px]">
                Careers with New Concept Security.
              </h2>
              <p className="mt-3 text-[17px] leading-relaxed text-white/65">
                Looking for a career in security or additional contract work? Follow the link to start.
              </p>
              <Link href="/careers" className={`${linkMoreDark} mt-6`}>
                Join New Concept Security <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <img
              src="/images/art/security-personnel-dark.svg"
              alt="Start your career in security with New Concept"
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </section>
    </article>
  );
}
