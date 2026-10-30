/* The brand kit: the company's details, entered once, inherited by every
   document and design. Stored in settings under "brandkit". These defaults
   come from the public website; the staff and the description are clearly
   marked as samples until the company replaces them. */

export type Staff = { id: string; name: string; role: string; phone: string; email: string; sample?: boolean };
export type Service = { id: string; name: string; summary: string };
export type Credential = { id: string; name: string; reference: string; verified: boolean };

export type BrandKit = {
  version: number;
  company: { name: string; legal: string; number: string; vat: string; address: string; phone: string; email: string; web: string; hours: string; region: string };
  socials: { facebook: string; linkedin: string; instagram: string; x: string };
  colours: { primary: string; accent: string; ink: string; paper: string };
  fonts: { heading: string; body: string };
  logos: { light: string; dark: string; mark: string };
  tagline: string;
  description: string;
  footer: string;
  credentials: Credential[];
  services: Service[];
  staff: Staff[];
  locked: { colours: boolean; fonts: boolean; logos: boolean; footer: boolean };
};

const SERVICES: [string, string, string][] = [
  ["security-personnel", "Security Personnel", "Bespoke security teams for premises and people, so assets are protected and you can relax."],
  ["guarding", "Guarding", "SIA-licensed officers for gatehouse, corporate access, patrols, CCTV monitoring and concierge duties."],
  ["static-guards", "Static Guards", "On-site officers for construction, car parks, commercial buildings, retail and corporate premises."],
  ["mobile-security", "Mobile Security", "Mobile patrols in liveried vans: a practical, lower-cost security presence."],
  ["retail-guarding", "Retail Guarding", "Uniformed officers trained in loss prevention, organised retail crime and merchant detention law."],
  ["site-security", "Site Security", "Surveys, on-site CCTV and perimeter patrols to deter theft and damage on construction sites."],
  ["personal-security", "Personal Security", "Close protection and static officers for executives, public figures and commercial sites."],
  ["healthcare", "Health Care Services", "Hospital security, patient watch and portering for the NHS, care homes and private healthcare."],
  ["key-holding", "Key Holding", "Secure off-site key holding, alarm response, lock and unlock, and vacant property inspections."],
  ["lock-and-unlock", "Lock and Unlock", "Officers open and close the premises, so the keys are not left with one member of staff."],
  ["cctv-and-alarms", "CCTV & Alarms", "CCTV, wireless systems and access control, surveyed and installed by our own team."],
  ["standalone-cameras", "Stand Alone Cameras", "Solar-powered camera units for outdoor sites with no broadband, mains or generator."],
  ["fire-services", "Fire Services", "Waking watch and fire marshal patrols for commercial buildings, with real-time reports."],
];

export const DEFAULT_BRAND: BrandKit = {
  version: 1,
  company: {
    name: "New Concept Security",
    legal: "New Concept Security Ltd",
    number: "10664067",
    vat: "",
    address: "Concept House, 283 Church Street, Blackpool FY1 3PG",
    phone: "01253 982211",
    email: "mattbaron@newconceptsecurity.co.uk",
    web: "newconceptsecurity.co.uk",
    hours: "Office Monday to Friday, 08:00 to 17:00 · Control room 24 hours, 365 days",
    region: "Blackpool, Preston and the North West · National coverage",
  },
  socials: { facebook: "https://www.facebook.com/NCSNW", linkedin: "", instagram: "", x: "" },
  colours: { primary: "#0A0A0A", accent: "#A01010", ink: "#1D1D1F", paper: "#FFFFFF" },
  fonts: { heading: "Montserrat", body: "Inter" },
  logos: { light: "/images/logo.png", dark: "/images/logo-light.png", mark: "/admin/tools/assets/img/logo/ncs-mark.svg" },
  tagline: "SIA Approved Contractor",
  description:
    "New Concept Security is an SIA Approved Contractor based in Blackpool, providing manned guarding, site security, healthcare security, key holding and CCTV across the North West and nationally. Every officer is SIA licensed and trained, backed by a control room staffed 24 hours a day, 365 days a year.",
  footer: "New Concept Security Ltd · Registered in England and Wales no. 10664067 · Concept House, 283 Church Street, Blackpool FY1 3PG",
  credentials: [{ id: "sia-acs", name: "SIA Approved Contractor Scheme", reference: "NECOSESC01", verified: true }],
  services: SERVICES.map(([id, name, summary]) => ({ id, name, summary })),
  staff: [
    { id: "s1", name: "Matt Baron", role: "Operations Manager", phone: "07496 320245", email: "mattbaron@newconceptsecurity.co.uk", sample: true },
    { id: "s2", name: "Sample Person", role: "Account Manager", phone: "01253 982211", email: "office@newconceptsecurity.co.uk", sample: true },
  ],
  locked: { colours: true, fonts: true, logos: true, footer: true },
};

/* Fills in anything a saved kit is missing (new fields added later). */
export function withDefaults(saved: Partial<BrandKit> | null | undefined): BrandKit {
  const s = (saved || {}) as Partial<BrandKit>;
  return {
    ...DEFAULT_BRAND,
    ...s,
    company: { ...DEFAULT_BRAND.company, ...(s.company || {}) },
    socials: { ...DEFAULT_BRAND.socials, ...(s.socials || {}) },
    colours: { ...DEFAULT_BRAND.colours, ...(s.colours || {}) },
    fonts: { ...DEFAULT_BRAND.fonts, ...(s.fonts || {}) },
    logos: { ...DEFAULT_BRAND.logos, ...(s.logos || {}) },
    locked: { ...DEFAULT_BRAND.locked, ...(s.locked || {}) },
    credentials: Array.isArray(s.credentials) ? s.credentials : DEFAULT_BRAND.credentials,
    services: Array.isArray(s.services) ? s.services : DEFAULT_BRAND.services,
    staff: Array.isArray(s.staff) ? s.staff : DEFAULT_BRAND.staff,
  };
}
