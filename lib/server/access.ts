/* Who can see what in the admin. Plain data and pure functions, so the
   middleware, the route handlers and the panel all follow the same rules.

   Roles
   - developer: everything, including the developer console. Hidden: never
     listed, counted or shown in activity to anyone else.
   - administrator: every section, and can add, change and remove employees.
   - employee: only the sections their administrator ticks, under whatever
     title they're given. */

export const SECTIONS = [
  { key: "overview", label: "Overview", group: "Business", hint: "Visitors, enquiries and follow-ups at a glance" },
  { key: "enquiries", label: "Enquiries", group: "Business", hint: "Read, assign and follow up enquiries and job applications" },
  { key: "insights", label: "Website insights", group: "Business", hint: "Traffic, sources, campaigns and speed" },
  { key: "announcement", label: "Announcement", group: "Website", hint: "The banner across the top of the website" },
  { key: "business-card", label: "Business cards", group: "Tools", hint: "Staff cards, print-ready PDF" },
  { key: "letterhead", label: "Letterhead", group: "Tools", hint: "Headed paper, letters, Word template" },
  { key: "id-badge", label: "ID badges", group: "Tools", hint: "Officer cards with licence checks" },
  { key: "visitor-pass", label: "Visitor passes", group: "Tools", hint: "Day passes and numbered sheets" },
  { key: "email", label: "Email templates", group: "Tools", hint: "Business emails and signatures" },
] as const;

export type Section = (typeof SECTIONS)[number]["key"];
export const SECTION_KEYS = SECTIONS.map((s) => s.key) as Section[];

export const ROLES = ["developer", "administrator", "employee"] as const;
export type Role = (typeof ROLES)[number];
export const ROLE_NAMES: Record<Role, string> = { developer: "Web developer", administrator: "Administrator", employee: "Employee" };

export const isRole = (v: unknown): v is Role => ROLES.includes(v as Role);
export const isSection = (v: unknown): v is Section => SECTION_KEYS.includes(v as Section);

/* The sections someone can open. */
export function sectionsFor(role: Role, access: unknown): Section[] {
  if (role === "developer" || role === "administrator") return [...SECTION_KEYS];
  return Array.isArray(access) ? SECTION_KEYS.filter((k) => access.includes(k)) : [];
}

/* Whether `actor` may create, change or remove someone with `target` role. */
export function canManage(actor: Role, target: Role) {
  if (actor === "developer") return true;
  return actor === "administrator" && target === "employee";
}

/* The roles `actor` may hand out. */
export const grantable = (actor: Role): Role[] => ROLES.filter((r) => canManage(actor, r));

/* Sections as a short hex number, for the signed session cookie. */
export function toBits(sections: Section[]) {
  return SECTION_KEYS.reduce((n, k, i) => (sections.includes(k) ? n | (1 << i) : n), 0).toString(16);
}
export function fromBits(bits: string): Section[] {
  const n = parseInt(bits, 16);
  return Number.isNaN(n) ? [] : SECTION_KEYS.filter((_, i) => n & (1 << i));
}

/* The tool pages under /admin/tools, and the section each belongs to. */
export const TOOL_PAGES: Record<string, Section> = {
  "business-card.html": "business-card",
  "letterhead.html": "letterhead",
  "id-badge.html": "id-badge",
  "visitor-pass.html": "visitor-pass",
  "email.html": "email",
};
