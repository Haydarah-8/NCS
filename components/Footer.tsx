import Link from "next/link";
import { company, serviceGroups, services } from "@/src/data";
import { narrow } from "@/lib/styles";

const link = "text-[#424245] hover:text-[#1d1d1f] hover:underline";
const heading = "font-semibold text-[#1d1d1f]";

export default function Footer() {
  return (
    <footer className="bg-[#f5f5f7] text-[12px] leading-[1.6] text-[#6e6e73]">
      <div className={narrow}>
        <div className="space-y-2 border-b border-[#d2d2d7] py-5">
          <p>
            {company.legal} holds SIA Approved Contractor Scheme status for Security Guarding, Door Supervision and
            Key Holding, contractor reference{" "}
            <a href={company.acs} target="_blank" rel="noreferrer" className="text-[#a01010] hover:underline">
              {company.acsCode}
            </a>
            . All officers are SIA licensed.
          </p>
          <p>
            The control room at Concept House is open 24 hours a day, 365 days a year. Office hours are{" "}
            {company.hoursOffice.toLowerCase()}.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 sm:grid-cols-3 lg:grid-cols-5">
          {serviceGroups.map((group) => (
            <div key={group}>
              <h3 className={heading}>{group}</h3>
              <ul className="mt-2.5 space-y-2">
                {services
                  .filter((service) => service.group === group)
                  .map((service) => (
                    <li key={service.slug}>
                      <Link href={`/services/${service.slug}`} className={link}>
                        {service.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className={heading}>New Concept</h3>
            <ul className="mt-2.5 space-y-2">
              {[
                ["/about", "About us"],
                ["/careers", "Careers"],
                ["/faq", "FAQ"],
                ["/our-details", "Contact"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className={link}>
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={company.staffLogin} target="_blank" rel="noreferrer" className={link}>
                  Staff login
                </a>
              </li>
              <li>
                <a href={company.facebook} target="_blank" rel="noreferrer" className={link}>
                  Facebook
                </a>
              </li>
            </ul>
            <h3 className={`${heading} mt-6`}>Contact</h3>
            <ul className="mt-2.5 space-y-2">
              <li>
                <a href={company.phoneHref} className={link}>
                  {company.phone}
                </a>
              </li>
              <li>
                <a href={company.mobileHref} className={link}>
                  Managers {company.mobile}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className={`${link} break-all`}>
                  Email us
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="flex flex-col gap-2 border-t border-[#d2d2d7] py-5 md:flex-row md:items-center md:justify-between">
          <p>
            Copyright © {new Date().getFullYear()} {company.legal}. All rights reserved. Company No. {company.number}.
            Registered in England and Wales.
          </p>
          <p className="flex flex-wrap gap-x-3">
            <Link href="/privacy-policy" className={link}>
              Privacy Policy
            </Link>
            <span aria-hidden="true">|</span>
            <span>{company.address.join(", ")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
