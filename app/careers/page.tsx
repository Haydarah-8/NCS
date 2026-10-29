import {
  Check,
  Clock,
  DoorOpen,
  HeartPulse,
  ShieldCheck,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { company, roles } from "@/src/data";
import CtaPanel from "@/components/CtaPanel";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { btnPrimary, btnSecondary, btnSecondaryDark, container } from "@/lib/styles";

export const metadata = { title: "Careers" };

const roleIcons: LucideIcon[] = [ShieldCheck, Truck, DoorOpen, Users, HeartPulse, Clock];

const requirements = [
  "A valid SIA licence for the role",
  "An enhanced DBS check for patient watch",
  "Restraint training for patient watch",
  "Vetting before you are deployed",
];

export default function CareersPage() {
  return (
    <article className="bg-white text-[#1d1d1f]">
      <PageHero
        tone="dark"
        eyebrow="Careers"
        title="Start your career in security."
        intro="Looking for a career in security, or additional contract work? Concept House is recruiting."
        image="/images/art/event-security.svg"
        imageAlt="Event security stewards in high-visibility vests facing a crowd"
      >
        <a href={company.careers} target="_blank" rel="noreferrer" className={btnPrimary}>
          Apply now
        </a>
        <a href={company.staffLogin} target="_blank" rel="noreferrer" className={btnSecondaryDark}>
          Staff login
        </a>
      </PageHero>

      <section className="py-24 md:py-32">
        <div className={container}>
          <Reveal>
            <SectionHeading
              title="Where you could work."
              intro="Posts cover static guarding, mobile patrols, door supervision, events, healthcare and key holding."
            />
          </Reveal>
          <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role, index) => {
              const Icon = roleIcons[index] ?? ShieldCheck;
              return (
                <li key={role.title}>
                  <Reveal delay={(index % 3) * 60} className="flex h-full flex-col rounded-[22px] bg-[#f5f5f7] p-8">
                    <Icon className="size-8 text-[#a01010]" strokeWidth={1.5} aria-hidden="true" />
                    <h3 className="mt-6 text-[21px] font-semibold tracking-[-0.015em]">{role.title}</h3>
                    <p className="mt-2 text-[17px] leading-relaxed text-[#6e6e73]">{role.body}</p>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="bg-[#f5f5f7] py-24 md:py-32">
        <div className={`${container} grid items-center gap-14 lg:grid-cols-2 lg:gap-20`}>
          <Reveal>
            <img
              src="/images/art/careers-banner.svg"
              alt="Start your career in security with New Concept"
              className="h-auto w-full"
            />
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading align="left" title="What you'll need." />
            <ul className="mt-8 space-y-4">
              {requirements.map((item) => (
                <li key={item} className="flex items-center gap-4 text-[19px] font-semibold tracking-[-0.01em]">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#a01010] text-white">
                    <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[17px] leading-relaxed text-[#6e6e73]">
              The office on Church Street runs the control room through the night, and the vans go out from there.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className={container}>
          <Reveal>
            <SectionHeading title="Three steps to your first shift." />
          </Reveal>
          <ol className="mt-14 grid gap-3 md:grid-cols-3">
            {[
              ["Apply online", "Fill in the New Concept Security application form. It only takes a few minutes."],
              ["Talk to the office", "Questions about a role? Call or email the office in Blackpool."],
              ["Start your shifts", "Staff manage their shifts through the staff portal."],
            ].map(([title, body], index) => (
              <li key={title}>
                <Reveal delay={index * 80} className="h-full rounded-[22px] bg-black p-8 text-white">
                  <span className="text-[48px] font-semibold leading-none tracking-[-0.03em] text-[#ff5a5a]">
                    {index + 1}
                  </span>
                  <h3 className="mt-6 text-[21px] font-semibold tracking-[-0.015em]">{title}</h3>
                  <p className="mt-2 text-[17px] leading-relaxed text-white/60">{body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="border-t border-[#e8e8ed]">
        <CtaPanel
          title="Ready to apply?"
          intro={`Questions go to the office on ${company.phone}, or email ${company.email}.`}
        >
          <a href={company.careers} target="_blank" rel="noreferrer" className={btnPrimary}>
            Start your application
          </a>
          <a href={company.phoneHref} className={btnSecondary}>
            Call the office
          </a>
        </CtaPanel>
      </div>
    </article>
  );
}
