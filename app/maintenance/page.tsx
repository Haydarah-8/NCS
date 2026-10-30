/* What visitors see while development mode is on (middleware.ts sends them
   here). It covers the whole window, keeps the phone number in reach for
   anyone who needs cover now, and tells search engines to come back later. */

import { withDefaults } from "@/lib/server/brandkit";
import { getSql } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Back soon", robots: { index: false, follow: false } };

async function details() {
  try {
    const sql = await getSql();
    const rows = await sql`select key, value from settings where key in ('devmode', 'brandkit')`;
    const get = (k: string) => rows.find((r) => r.key === k)?.value || {};
    const kit = withDefaults(get("brandkit"));
    return { message: String(get("devmode").message || ""), phone: kit.company.phone, email: kit.company.email, name: kit.company.name };
  } catch {
    return { message: "", phone: "01253 982211", email: "", name: "New Concept Security" };
  }
}

export default async function Maintenance() {
  const d = await details();
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-[#0a0a0a] px-6 text-white">
      <div className="max-w-[34rem] text-center">
        <svg viewBox="0 0 420 420" className="mx-auto h-14 w-14" aria-hidden="true">
          <path fill="#ffffff" d="M210 8L297.35 95.35V301.72L148.09 69.91ZM210 412L122.65 324.65V118.28L271.91 350.09Z" />
          <path fill="#c41616" d="M10.18 210L68.05 152.13V267.87ZM409.82 210L351.95 152.13V267.87Z" />
        </svg>
        <p className="mt-8 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c41616]">{d.name}</p>
        <h1 className="mt-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.03em]">We&rsquo;re making improvements.</h1>
        <p className="mt-5 text-[18px] leading-[1.55] text-white/70">
          {d.message || "The website will be back shortly. Our control room is open as usual."}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href={`tel:${d.phone.replace(/[^\d+]/g, "")}`} className="ncs-button rounded-none bg-[#a01010] px-6 py-3 text-[15px] font-semibold hover:bg-[#c41616]">
            Call {d.phone}
          </a>
          {d.email ? (
            <a href={`mailto:${d.email}`} className="ncs-button rounded-none border border-white/25 px-6 py-3 text-[15px] font-semibold hover:border-white/60">
              Email us
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
