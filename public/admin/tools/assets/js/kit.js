/* New Concept Security: the design kit. Letterhead,
   officer ID badge, training certificate and visitor pass, all
   in the brand and all from one small engine: the form on the left edits a
   state object, the item on the right is drawn from it at its printed size,
   and it downloads as a PDF or PNG or goes to the printer. Drafts stay in
   this browser. The page picks the item from ?type= (letterhead,
   badge, certificate, pass). Site signs have their own studio (sign.js). */

const W_PATH = "M210 8L297.35 95.35V301.72L148.09 69.91ZM210 412L122.65 324.65V118.28L271.91 350.09Z";
const R_PATHS =
  '<path d="M10.18 210L68.05 152.13V267.87ZM409.82 210L351.95 152.13V267.87Z"/>';

const PALETTES = {
  black: { label: "Black", main: "#0A0A0A", accent: "#C41616" },
  red: { label: "NCS Red", main: "#A01010", accent: "#1D1D1F" },
  charcoal: { label: "Charcoal", main: "#2C2C2E", accent: "#C41616" },
  steel: { label: "Steel", main: "#353B42", accent: "#C41616" },
  oxblood: { label: "Oxblood", main: "#4A0E0E", accent: "#C41616" },
  ink: { label: "Ink", main: "#1D1D1F", accent: "#A01010" },
};
const FONTS = ["Geist", "Inter", "Manrope", "DM Sans", "Montserrat", "Space Grotesk", "Playfair Display", "Fraunces"];
const ROLES = ["Security officer", "Static guard", "Gatehouse officer", "Mobile patrol officer", "CCTV operator", "Key holder", "Supervisor", "Operations manager"];
const STORE = "ncs-kit";

/* Each item: its size on screen (CSS px) and on paper (PDF points, print
   size), its designs, its sample content, and the form that edits it. */
const CARD = { w: 340, h: 539, pt: [153.07, 242.65], print: "54mm 85.6mm" };
const TYPES = {
  letterhead: {
    label: "Letterhead",
    w: 794,
    h: 1123,
    pt: [595.28, 841.89],
    print: "A4",
    designs: { classic: "Classic", band: "Band", rule: "Side rule", minimal: "Minimal", corner: "Corner", centered: "Centred", monogram: "Monogram", bar: "Top bar" },
    sample: {
      design: "classic",
      letter: true,
      date: "",
      ref: "Our ref: NCS/QTE-5512",
      recipient: "Ms A. Patel\nSite Manager\nRiverside Development Ltd\nUnit 4, Quay Road\nLondon E14 9QQ",
      salutation: "Dear Ms Patel,",
      subject: "Night cover for the Riverside compound",
      body: "Thank you for walking the site with us on Tuesday. As agreed, we will place one licensed officer at the main gate from 18:00 to 06:00 every night, with two randomised patrol visits and remote monitoring of the new camera tower.\n\nYou will receive a written report by 07:00 each morning. The officer's assignment instructions are attached for your approval, and we can start on Monday 3 November.\n\nIf anything changes on site, call the control room at any hour and we will adjust the cover the same night.",
      signoff: "Yours sincerely,",
      signer: "NCS Operations",
      title: "Director, New Concept Security",
    },
    fields: [
      { k: "letter", label: "Include a letter (untick for blank headed paper)", type: "check", wide: true },
      { k: "date", label: "Date (blank = today)", type: "date" },
      { k: "ref", label: "Reference" },
      { k: "recipient", label: "To", type: "textarea", wide: true },
      { k: "subject", label: "Subject line", wide: true },
      { k: "salutation", label: "Greeting" },
      { k: "signoff", label: "Sign-off" },
      { k: "body", label: "Letter", type: "textarea", rows: 9, wide: true },
      { k: "signer", label: "Signed by" },
      { k: "title", label: "Their title" },
    ],
  },
  badge: {
    label: "ID badge",
    ...CARD,
    faces: 2,
    designs: { navy: "Black", light: "Light", stripe: "Stripe", minimal: "Minimal", portrait: "Portrait", dark: "Night", bar: "Side bar" },
    sample: {
      design: "navy",
      name: "Jordan Carter",
      role: "Security officer",
      number: "NCS-0142",
      licence: "1012 3456 7890 1234",
      licenceType: "Security guarding",
      expiry: "",
      issued: "",
      photo: "",
      qr: true,
      back: "This card remains the property of New Concept Security and must be returned on request. The holder is authorised to work on client sites on our behalf.",
    },
    fields: [
      { k: "photo", label: "Photograph", type: "photo", wide: true },
      { k: "name", label: "Name" },
      { k: "role", label: "Role", type: "select", options: ROLES },
      { k: "number", label: "Staff number" },
      { k: "licence", label: "Licence number" },
      { k: "licenceType", label: "Licence type", type: "select", options: ["Security guarding", "Door supervision", "CCTV (public space)", "Key holding", "Close protection"] },
      { k: "expiry", label: "Licence expires", type: "date" },
      { k: "issued", label: "Card issued (blank = today)", type: "date" },
      { k: "qr", label: "QR code on the back", type: "check" },
      { k: "back", label: "Back of the card", type: "textarea", wide: true },
    ],
  },
  certificate: {
    label: "Certificate",
    w: 1123,
    h: 794,
    pt: [841.89, 595.28],
    print: "A4 landscape",
    designs: { classic: "Classic", modern: "Modern", seal: "Seal", elegant: "Elegant", dark: "Dark", bars: "Bars", monogram: "Monogram" },
    sample: {
      design: "classic",
      heading: "Certificate of completion",
      name: "Jordan Carter",
      line: "has successfully completed",
      course: "Conflict management and de-escalation",
      details: "Six hours of classroom and practical training, assessed on site",
      date: "",
      number: "CERT-2026-0417",
      signer1: "NCS Operations",
      role1: "Director",
      signer2: "Priya Shah",
      role2: "Training lead",
    },
    fields: [
      { k: "heading", label: "Heading", wide: true },
      { k: "name", label: "Awarded to", wide: true },
      { k: "line", label: "Line under the name", wide: true },
      { k: "course", label: "Course or achievement", wide: true },
      { k: "details", label: "Details", wide: true },
      { k: "date", label: "Date (blank = today)", type: "date" },
      { k: "number", label: "Certificate number" },
      { k: "signer1", label: "First signature" },
      { k: "role1", label: "Their role" },
      { k: "signer2", label: "Second signature (optional)" },
      { k: "role2", label: "Their role" },
    ],
  },
  pass: {
    label: "Visitor pass",
    ...CARD,
    faces: 2,
    designs: { bold: "Bold", minimal: "Minimal", escort: "Escort required", contractor: "Contractor", vertical: "Vertical", dark: "Night", stripe: "Stripes" },
    sample: {
      design: "bold",
      number: "V-0318",
      name: "Sam Okafor",
      company: "Northline Electrical",
      host: "Site office, A. Patel",
      site: "Riverside compound",
      date: "",
      until: "17:00",
      vehicle: "",
      colour: "#C41616",
      rules: "Wear this pass where it can be seen.\nStay with your host at all times.\nFollow the officer's instructions in an emergency.\nHand this pass back at the gate when you leave.",
    },
    fields: [
      { k: "number", label: "Pass number" },
      { k: "colour", label: "Colour of the day", type: "color" },
      { k: "name", label: "Visitor" },
      { k: "company", label: "Company" },
      { k: "host", label: "Visiting" },
      { k: "site", label: "Site" },
      { k: "date", label: "Date (blank = today)", type: "date" },
      { k: "until", label: "Valid until", type: "time" },
      { k: "vehicle", label: "Vehicle registration" },
      { k: "rules", label: "Rules on the back", type: "textarea", rows: 5, wide: true },
    ],
  },
};


/* ---------- State ---------- */

function sample() {
  return {
    type: "letterhead",
    palette: "black",
    main: PALETTES.black.main,
    accent: PALETTES.black.accent,
    font: "Montserrat",
    from: {
      name: "New Concept Security",
      address: "Concept House, 283 Church Street\nBlackpool, FY1 3PG",
      phone: "01253 982211",
      email: "mattbaron@newconceptsecurity.co.uk",
      web: "newconceptsecurity.co.uk",
      reg: "Registered in England and Wales",
    },
    items: Object.fromEntries(Object.entries(TYPES).map(([k, t]) => [k, { ...t.sample }])),
  };
}

let state = load();

function load() {
  const base = sample();
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved) {
      base.palette = saved.palette || base.palette;
      base.main = saved.main || base.main;
      base.accent = saved.accent || base.accent;
      base.font = saved.font || base.font;
      base.from = { ...base.from, ...(saved.from || {}) };
      for (const k of Object.keys(TYPES)) base.items[k] = { ...base.items[k], ...((saved.items || {})[k] || {}) };
      base.type = saved.type;
    }
  } catch {}
  const asked = new URLSearchParams(location.search).get("type");
  base.type = TYPES[asked] ? asked : TYPES[base.type] ? base.type : "letterhead";
  return base;
}

function persist() {
  try {
    localStorage.setItem(STORE, JSON.stringify(state));
  } catch {}
}

const item = () => state.items[state.type];
const T = () => TYPES[state.type];

/* ---------- Helpers ---------- */

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const lines = (v) => esc(v).replace(/\n/g, "<br>");
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fmt = (iso, opts = { day: "numeric", month: "long", year: "numeric" }) => {
  const d = new Date(`${iso || todayIso()}T12:00:00`);
  return Number.isNaN(+d) ? "" : d.toLocaleDateString("en-GB", opts);
};
const addYears = (iso, n) => {
  const d = new Date(`${iso || todayIso()}T12:00:00`);
  d.setFullYear(d.getFullYear() + n);
  return d.toISOString().slice(0, 10);
};

/* Real colours, not CSS variables: the PNG and PDF renderer draws each SVG
   on its own, away from the page's variables. */
function mark(w = state.main, r = state.accent) {
  return `<svg class="kit-mark" viewBox="0 0 420 420" aria-hidden="true"><path fill="${w}" d="${W_PATH}"/><g fill="${r}">${R_PATHS}</g></svg>`;
}

function brand(onDark = false, small = false) {
  return `<div class="kit-brand${small ? " is-small" : ""}">${mark(onDark ? "#FFFFFF" : state.main)}<div><b class="ncs-word"><b>NEW</b><span style="color:${onDark ? "#FFFFFF" : state.accent}">CONCEPT</span></b><small>SECURITY</small></div></div>`;
}

const contactLine = (sep = "  ·  ") => {
  const f = state.from;
  return [f.address.replace(/\n/g, ", "), f.phone, f.email, f.web].filter((v) => v && v.trim()).map(esc).join(sep);
};

let qrPending = null;
function qr(text, size = 80, dark = "#1D1D1F") {
  if (!window.qrcode) {
    if (!qrPending) qrPending = window.NCSExport.load("https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js").then(render).catch(() => (qrPending = null));
    return "";
  }
  const code = window.qrcode(0, "M");
  code.addData(text);
  code.make();
  const n = code.getModuleCount();
  const cell = size / (n + 2);
  let d = "";
  for (let r = 0; r < n; r += 1) for (let c = 0; c < n; c += 1) if (code.isDark(r, c)) d += `M${((c + 1) * cell).toFixed(2)} ${((r + 1) * cell).toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><rect width="${size}" height="${size}" fill="#FFFFFF"/><path d="${d}" fill="${dark}"/></svg>`;
}

const ICONS = {
  camera: '<path d="M18 40h62l10 8v16l-10 8H18z" fill="currentColor"/><path d="M30 72l-6 22h-8v-8" stroke="currentColor" stroke-width="7" fill="none" stroke-linejoin="round"/><circle cx="86" cy="56" r="3" fill="#fff"/><path d="M92 50l14-8v28l-14-8z" fill="currentColor"/>',
  shield: '<path d="M60 10l38 14v30c0 26-17 42-38 52-21-10-38-26-38-52V24z" fill="currentColor"/><path d="M42 58l12 12 24-26" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  noentry: '<circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" stroke-width="12"/><path d="M29 29l62 62" stroke="currentColor" stroke-width="12"/><circle cx="60" cy="42" r="7" fill="#1D1D1F"/><path d="M60 52v26M60 78l-9 18M60 78l9 18M48 62h24" stroke="#1D1D1F" stroke-width="6" stroke-linecap="round"/>',
  patrol: '<path d="M14 72l8-22c2-6 6-8 12-8h52c6 0 10 2 12 8l8 22v18H14z" fill="currentColor"/><rect x="48" y="30" width="24" height="10" rx="3" fill="currentColor"/><circle cx="34" cy="90" r="9" fill="#fff" stroke="currentColor" stroke-width="5"/><circle cx="86" cy="90" r="9" fill="#fff" stroke="currentColor" stroke-width="5"/><path d="M30 52h60l5 14H25z" fill="#fff" opacity="0.85"/>',
  dog: '<path d="M30 46l8-18 10 14h22l18-10 10 6-4 14-12 6v34h-10V74H50v18H40V70l-12-8z" fill="currentColor"/><circle cx="84" cy="42" r="2.5" fill="#fff"/>',
  bell: '<path d="M60 16c-18 0-28 14-28 30v20l-10 12h76L88 66V46c0-16-10-30-28-30z" fill="currentColor"/><path d="M50 84a10 10 0 0 0 20 0" fill="currentColor"/><path d="M18 34c2-8 6-14 12-18M102 34c-2-8-6-14-12-18" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/>',
  eye: '<path d="M10 60s18-32 50-32 50 32 50 32-18 32-50 32S10 60 10 60z" fill="currentColor"/><circle cx="60" cy="60" r="18" fill="#fff"/><circle cx="60" cy="60" r="9" fill="currentColor"/>',
  person: '<circle cx="60" cy="24" r="12" fill="currentColor"/><path d="M42 44h36l6 34H74l-2 34H48l-2-34H36z" fill="currentColor"/>',
  vest: '<path d="M38 14h12l10 14 10-14h12l14 18-8 12v62H20V44l-8-12z" fill="currentColor"/><path d="M20 70h80M20 84h80" stroke="#fff" stroke-width="6" opacity="0.85"/>',
};

/* ---------- The items ---------- */

function letterBody(it) {
  if (!it.letter) return "";
  return `<div class="kit-letter">
    <div class="kit-letter-top"><p>${lines(it.recipient)}</p><p class="kit-letter-meta">${esc(fmt(it.date))}${it.ref ? `<br>${esc(it.ref)}` : ""}</p></div>
    ${it.subject ? `<p class="kit-letter-subject">${esc(it.subject)}</p>` : ""}
    <p>${esc(it.salutation)}</p>
    ${String(it.body || "").split(/\n{2,}/).map((p) => `<p>${lines(p)}</p>`).join("")}
    <p class="kit-letter-off">${esc(it.signoff)}</p><p class="kit-letter-sig">${esc(it.signer)}</p><p class="kit-letter-title">${esc(it.title)}</p>
  </div>`;
}

/* The mark, large and faint, behind the page. */
function watermark() {
  return `<div class="kit-wm" aria-hidden="true">${mark(state.main, state.main)}</div>`;
}

/* Diagonal stripes as an SVG pattern, so downloads draw them exactly. */
let stripeIds = 0;
function stripes(a, b, w) {
  const id = `ks${(stripeIds += 1)}`;
  return `<svg class="kit-stripes" aria-hidden="true"><defs><pattern id="${id}" width="${w * 2}" height="${w * 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${w}" height="${w * 2}" fill="${esc(a)}"/><rect x="${w}" width="${w}" height="${w * 2}" fill="${esc(b)}"/></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
}

function corner(size) {
  return `<svg class="kit-corner" style="width:${size}px;height:${size}px" viewBox="0 0 300 300" aria-hidden="true"><path d="M300 0V300A300 300 0 0 1 0 0Z" fill="${state.main}"/><path d="M300 236A236 236 0 0 1 64 0" fill="none" stroke="${state.accent}" stroke-width="5"/><g transform="translate(166 40) scale(0.15)"><path fill="#FFFFFF" d="${W_PATH}"/><g fill="${state.accent}">${R_PATHS}</g></g></svg>`;
}

const DRAW = {
  letterhead(it) {
    const f = state.from;
    const contact = `<p class="kit-lh-contact">${[f.phone, f.email, f.web].filter((v) => v && v.trim()).map(esc).join("<br>")}</p>`;
    const footer = `<footer class="kit-lh-foot"><span>${esc(f.name)}</span><span>${esc(f.address.replace(/\n/g, ", "))}</span><span>${esc(f.reg)}</span></footer>`;
    if (it.design === "band") {
      return [`<header class="kit-lh-band">${brand(true)}<p class="kit-lh-contact">${[f.phone, f.email, f.web].filter((v) => v && v.trim()).map(esc).join("<br>")}</p></header><div class="kit-lh-accent"></div><div class="kit-lh-in">${letterBody(it)}</div>${footer}`];
    }
    if (it.design === "rule") {
      return [`<aside class="kit-lh-rail">${brand(false, true)}<div class="kit-lh-rail-in"><p class="kit-label">Address</p><p>${lines(f.address)}</p><p class="kit-label">Phone</p><p>${esc(f.phone)}</p><p class="kit-label">Email</p><p>${esc(f.email)}</p><p class="kit-label">Web</p><p>${esc(f.web)}</p></div><p class="kit-lh-reg">${esc(f.reg)}</p></aside><div class="kit-lh-in is-rail">${letterBody(it)}</div>`];
    }
    if (it.design === "monogram") return [`${watermark()}<header class="kit-lh-classic">${brand()}${contact}</header><div class="kit-lh-in">${letterBody(it)}</div>${footer}`];
    if (it.design === "bar") return [`<div class="kit-topbar"></div><header class="kit-lh-classic">${brand()}${contact}</header><div class="kit-lh-in">${letterBody(it)}</div>${footer}`];
    if (it.design === "corner") {
      return [`${corner(250)}<header class="kit-lh-cornerhead"><b>${esc(f.name)}</b><p class="kit-lh-contact">${[f.address.replace(/\n/g, ", "), f.phone, f.email, f.web].filter((v) => v && v.trim()).map(esc).join("<br>")}</p></header><div class="kit-lh-in">${letterBody(it)}</div>${footer}`];
    }
    if (it.design === "centered") {
      return [`<header class="kit-lh-center">${brand()}<p>${contactLine()}</p></header><div class="kit-lh-in">${letterBody(it)}</div><footer class="kit-lh-bottom"><span></span>${esc(f.reg)}<span></span></footer>`];
    }
    if (it.design === "minimal") {
      return [`<header class="kit-lh-min">${mark()}<p>${esc(f.name.toUpperCase())}</p></header><div class="kit-lh-in">${letterBody(it)}</div><footer class="kit-lh-foot is-line"><span>${contactLine()}</span></footer>`];
    }
    return [`<header class="kit-lh-classic">${brand()}${contact}</header><div class="kit-lh-rule"><span></span></div><div class="kit-lh-in">${letterBody(it)}</div>${footer}`];
  },


  badge(it) {
    const f = state.from;
    const photo = it.photo ? `<img src="${it.photo}" alt="">` : `<svg viewBox="0 0 100 100" aria-hidden="true" style="color:#b0b0b8"><circle cx="50" cy="38" r="18" fill="currentColor"/><path d="M14 96c2-22 16-32 36-32s34 10 36 32z" fill="currentColor"/></svg>`;
    const expiry = it.expiry ? fmt(it.expiry, { month: "short", year: "numeric" }) : fmt(addYears(it.issued, 3), { month: "short", year: "numeric" });
    const facts = `<dl class="kit-badge-facts"><dt>Staff no.</dt><dd>${esc(it.number)}</dd><dt>Licence</dt><dd>${esc(it.licence)}</dd><dt>Type</dt><dd>${esc(it.licenceType)}</dd><dt>Expires</dt><dd>${esc(expiry)}</dd></dl>`;
    const front = it.design === "minimal"
      ? `<div class="kit-badge-mtop">${mark()}<span>${esc(it.number)}</span></div><div class="kit-badge-photo is-square">${photo}</div><h1 class="kit-badge-name is-left">${esc(it.name)}</h1><p class="kit-badge-role is-left">${esc(it.role)}</p>${facts}<div class="kit-badge-mbar"></div>`
      : it.design === "portrait"
        ? `<div class="kit-badge-hero">${photo}<div class="kit-badge-shade"></div><div class="kit-badge-over">${brand(true, true)}<h1>${esc(it.name)}</h1><p>${esc(it.role)}</p></div></div>${facts}<div class="kit-badge-foot">AUTHORISED OFFICER</div>`
        : `<div class="kit-badge-head">${brand(!["light", "bar"].includes(it.design), true)}</div>${it.design === "stripe" ? '<div class="kit-badge-stripes"><span></span><span></span></div>' : ""}
      <div class="kit-badge-photo">${photo}</div><h1 class="kit-badge-name">${esc(it.name)}</h1><p class="kit-badge-role">${esc(it.role)}</p>${facts}<div class="kit-badge-foot">AUTHORISED OFFICER</div>`;
    const web = f.web.trim() ? (/^https?:/i.test(f.web) ? f.web : `https://${f.web}`) : "";
    const code = it.qr && web ? qr(`${web.replace(/\/$/, "")}/?verify=${encodeURIComponent(it.number)}`, 92) : "";
    const back = `<div class="kit-badge-back">${mark()}<p class="kit-label">If found, please return to</p><p class="kit-badge-addr"><b>${esc(f.name)}</b><br>${lines(f.address)}<br>${esc(f.phone)}</p>
      ${code ? `<div class="kit-badge-qr">${code}<small>Scan to check this card</small></div>` : ""}
      <p class="kit-badge-terms">${esc(it.back)}</p><div class="kit-badge-sign"><span>Holder's signature</span></div><p class="kit-badge-issued">Issued ${esc(fmt(it.issued, { day: "numeric", month: "short", year: "numeric" }))}</p></div>`;
    return [front, back];
  },

  certificate(it) {
    const sig = (n, r) => (n ? `<div class="kit-cert-sig"><span class="kit-cert-hand">${esc(n)}</span><i></i><b>${esc(n)}</b><small>${esc(r)}</small></div>` : "");
    const seal = `<svg class="kit-cert-seal" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92" fill="${state.accent}"/><circle cx="100" cy="100" r="80" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="3 5"/><circle cx="100" cy="100" r="64" fill="${state.main}"/><g transform="translate(58 76) scale(0.135)"><path fill="#FFFFFF" d="${W_PATH}"/><g fill="${state.accent}">${R_PATHS}</g></g><text x="100" y="146" text-anchor="middle" fill="#FFFFFF" font-size="10" letter-spacing="2" font-family="Arial, sans-serif">CERTIFIED</text></svg>`;
    const inner = `${it.design === "modern" ? "" : `<div class="kit-cert-brand">${brand(it.design === "dark")}</div>`}
      <p class="kit-cert-heading">${esc(it.heading)}</p><p class="kit-cert-pre">This is to certify that</p><h1 class="kit-cert-name">${esc(it.name)}</h1>
      <p class="kit-cert-line">${esc(it.line)}</p><h2 class="kit-cert-course">${esc(it.course)}</h2><p class="kit-cert-details">${esc(it.details)}</p>
      <div class="kit-cert-bottom">${sig(it.signer1, it.role1)}<div class="kit-cert-meta"><span>${esc(fmt(it.date))}</span><small>${esc(it.number)}</small></div>${sig(it.signer2, it.role2)}</div>`;
    if (it.design === "modern") return [`<aside class="kit-cert-band">${brand(true)}<p>${esc(state.from.web)}</p></aside><div class="kit-cert-in is-left">${inner}</div>`];
    if (it.design === "seal") return [`<div class="kit-cert-in is-left is-seal">${inner}</div>${seal}<div class="kit-cert-edge"></div>`];
    if (it.design === "bars") return [`<div class="kit-cert-bars"><i></i><i></i></div><div class="kit-cert-in">${inner}</div>`];
    if (it.design === "monogram") return [`${watermark()}<div class="kit-cert-frame is-thin"><div class="kit-cert-in">${inner}</div></div>`];
    if (it.design === "elegant") return [`<div class="kit-cert-frame is-elegant"><i></i><i></i><i></i><i></i><div class="kit-cert-in">${inner}</div></div>`];
    if (it.design === "dark") return [`<div class="kit-cert-frame is-dark"><div class="kit-cert-in">${inner}</div></div>`];
    return [`<div class="kit-cert-frame"><div class="kit-cert-in">${inner}</div></div>`];
  },

  pass(it) {
    const escort = it.design === "escort";
    const word = escort ? "ESCORT" : it.design === "contractor" ? "CONTRACTOR" : "VISITOR";
    const front = `<div class="kit-pass-top">${brand(it.design !== "minimal", true)}<span>${esc(it.number)}</span></div>
      ${it.design === "stripe" ? `<div class="kit-pass-word is-stripes">${stripes(it.colour, "#FFFFFF", 14)}<b>${word}</b></div>` : it.design === "vertical" ? `<div class="kit-pass-side" style="background:${esc(it.colour)}"><svg viewBox="0 0 64 440" aria-hidden="true"><text x="-220" y="47" transform="rotate(-90)" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="800" letter-spacing="6" fill="#1D1D1F">${word}</text></svg></div>` : `<div class="kit-pass-word" style="--day:${esc(it.colour)}"><b>${word}</b>${escort ? "<small>MUST BE ACCOMPANIED</small>" : it.design === "contractor" ? "<small>WORKING ON SITE</small>" : ""}</div>`}
      <h1 class="kit-pass-name">${esc(it.name)}</h1><p class="kit-pass-co">${esc(it.company)}</p>
      <dl class="kit-pass-facts"><dt>Visiting</dt><dd>${esc(it.host)}</dd><dt>Site</dt><dd>${esc(it.site)}</dd><dt>Date</dt><dd>${esc(fmt(it.date, { weekday: "short", day: "numeric", month: "short" }))}</dd><dt>Valid until</dt><dd>${esc(it.until)}</dd>${it.vehicle ? `<dt>Vehicle</dt><dd>${esc(it.vehicle)}</dd>` : ""}</dl>
      <p class="kit-pass-wear">${escort ? "Stay with your escort" : "Wear this pass at all times"}</p><div class="kit-pass-day" style="background:${esc(it.colour)}"></div>`;
    const back = `<div class="kit-pass-back">${mark()}<p class="kit-label">While you are on site</p><ol>${String(it.rules || "").split("\n").filter((l) => l.trim()).map((l) => `<li>${esc(l)}</li>`).join("")}</ol>
      <p class="kit-pass-emergency"><b>Emergency</b><br>${esc(state.from.phone)}</p><p class="kit-pass-out">Signed out at ______ by ________</p></div>`;
    return [front, back];
  },
};

function faces(type = state.type, it = state.items[type], design = it.design) {
  const t = TYPES[type];
  const style = `--a:${state.main};--a2:${state.accent};--kit-font:'${state.font}'`;
  return DRAW[type]({ ...it, design }).map((html, i) => `<div class="kit kit-${type} d-${design}${i ? " is-back" : ""}" style="${style};width:${t.w}px;height:${t.h}px">${html}</div>`);
}

/* ---------- The editor ---------- */

const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), state);
function set(path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  keys.reduce((o, k) => o[k], state)[last] = value;
}

function control(f, base) {
  const key = `${base}.${f.k}`;
  const cls = `dc-field${f.wide ? " is-wide" : ""}`;
  if (f.type === "check") return `<label class="dc-check${f.wide ? " is-wide" : ""}"><input type="checkbox" data-k="${key}"> ${f.label}</label>`;
  if (f.type === "textarea") return `<label class="${cls}">${f.label}<textarea data-k="${key}" rows="${f.rows || 3}"></textarea></label>`;
  if (f.type === "select") return `<label class="${cls}">${f.label}<select data-k="${key}">${f.options.map((o) => (Array.isArray(o) ? o : [o, o])).map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")}</select></label>`;
  if (f.type === "photo") return `<div class="${cls} kit-photo-row"><span>${f.label}</span><div><button class="ds-btn is-outline" type="button" data-photo>Upload a photo</button> <button class="dc-link" type="button" data-photo-clear>Remove</button><input type="file" accept="image/*" data-photo-file hidden></div></div>`;
  return `<label class="${cls}">${f.label}<input type="${f.type || "text"}" data-k="${key}"></label>`;
}

function editorHtml() {
  const t = T();
  const base = `items.${state.type}`;
  const swatches = Object.entries(PALETTES)
    .map(([id, p]) => `<label class="dc-swatch" title="${p.label}"><input type="radio" name="kit-palette" value="${id}" data-palette aria-label="${p.label}"><span style="background:linear-gradient(160deg, ${p.main}, ${p.main} 60%, ${p.accent} 60%)"></span></label>`)
    .join("");
  return `<section class="dc-card"><h2>Design</h2>
    <div class="kit-designs">${Object.entries(t.designs).slice(0, 5).map(([id, name]) => `<button class="kit-design" type="button" data-design="${id}" aria-pressed="false"><span class="kit-thumb" data-thumb="${id}"></span>${name}</button>`).join("")}</div>
    ${Object.keys(t.designs).length > 5 ? `<p class="dc-sub">More designs</p><div class="kit-more">${Object.entries(t.designs).slice(5).map(([id, name]) => `<button class="kit-design is-mini" type="button" data-design="${id}" aria-pressed="false"><span class="kit-thumb" data-thumb="${id}" data-mini></span><span>${name}</span></button>`).join("")}</div>` : ""}
    <p class="dc-sub">Colour</p><div class="dc-swatches">${swatches}</div>
    <div class="dc-grid">
      <label class="dc-field">Main colour<input type="color" data-k="main"></label>
      <label class="dc-field">Accent<input type="color" data-k="accent"></label>
      <label class="dc-field is-wide">Font<select data-k="font">${FONTS.map((f) => `<option>${f}</option>`).join("")}</select></label>
    </div></section>
  <section class="dc-card"><h2>${t.label}</h2><div class="dc-grid">${t.fields.map((f) => control(f, base)).join("")}</div></section>
  <section class="dc-card"><h2>Your business <small>shared by every item</small></h2><div class="dc-grid">
    ${control({ k: "name", label: "Business name", wide: true }, "from")}
    ${control({ k: "address", label: "Address", type: "textarea", wide: true }, "from")}
    ${control({ k: "phone", label: "Phone" }, "from")}
    ${control({ k: "email", label: "Email", type: "email" }, "from")}
    ${control({ k: "web", label: "Website" }, "from")}
    ${control({ k: "reg", label: "Company registration line" }, "from")}
  </div></section>`;
}

function fill() {
  document.querySelectorAll("[data-k]").forEach((el) => {
    const v = get(el.dataset.k);
    if (el.type === "checkbox") el.checked = Boolean(v);
    else el.value = v ?? "";
  });
  document.querySelectorAll("[data-palette]").forEach((r) => (r.checked = r.value === state.palette));
  document.querySelectorAll("[data-design]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.design === item().design)));
}

/* ---------- Drawing ---------- */

const stage = () => document.querySelector(".kit-stage");

function render() {
  const t = T();
  const box = stage();
  box.innerHTML = `<div class="kit-scaler">${faces().join("")}</div>`;
  fit();
  document.querySelectorAll("[data-thumb]").forEach((el) => {
    const design = el.dataset.thumb;
    const k = (el.hasAttribute("data-mini") ? 46 : 120) / t.w;
    el.style.height = `${Math.round(t.h * k)}px`;
    el.innerHTML = `<div style="transform:scale(${k});transform-origin:0 0;width:${t.w}px">${faces(state.type, item(), design)[0]}</div>`;
  });
  const it = item();
  const paper = state.type === "sign" ? (it.paper === "a3" ? "A3" : "A4") : { letterhead: "A4", badge: "Card, 54 × 85.6 mm, front and back", certificate: "A4 landscape", pass: "Card, 54 × 85.6 mm, front and back" }[state.type];
  document.querySelector("[data-meta]").textContent = `${t.label} · ${paper}`;
  persist();
}

function fit() {
  const box = stage();
  const scaler = box.querySelector(".kit-scaler");
  const t = T();
  const n = t.faces || 1;
  const gap = 24;
  const natural = t.w * n + gap * (n - 1);
  const avail = box.clientWidth - 48;
  const k = Math.min(n > 1 ? 1.25 : 1, avail / natural);
  scaler.style.width = `${natural}px`;
  scaler.style.transform = `scale(${k})`;
  box.style.height = `${t.h * k + 48}px`;
}

/* ---------- Export ---------- */


/* Exports go through the shared engine (exporter.js): sharp pictures, an
   invisible text layer so the PDF can be searched and copied, live links. */
const fileName = (ext) => window.NCSExport.fileName([T().label, item().name || item().headline || item().recipient, state.from.name], ext);

function pagePt() {
  if (state.type === "sign" && item().paper === "a3") return [841.89, 1190.55];
  return T().pt;
}

const scaleFor = () => (state.type === "sign" && item().paper === "a3" ? 3.5 : T().faces ? 4 : 3);

async function exportPng() {
  const canvases = await window.NCSExport.pngOf({ html: faces().join(""), selector: ".kit", scale: scaleFor() });
  await window.NCSExport.png(canvases, fileName("png"));
}

async function exportPdf() {
  const { blob } = await window.NCSExport.pagesPdf({
    html: faces().join(""),
    selector: ".kit",
    pt: pagePt(),
    scale: scaleFor(),
    meta: { title: `${T().label}${item().name ? `: ${item().name}` : ""}`, subject: `${T().label} by ${state.from.name}`, author: state.from.name, keywords: [T().label, state.from.name].join(", ") },
  });
  window.NCSExport.save(blob, fileName("pdf"));
}

/* Cards print nine to an A4 sheet, fronts then backs; everything else
   prints at its own size. */
function printItem() {
  const t = T();
  const box = document.querySelector(".dc-print");
  let css;
  if (t.faces) {
    const k = 204.09 / t.w;
    const sheet = (html) => `<div class="kit-sheet">${Array.from({ length: 9 }, () => `<div class="kit-sheet-card"><div style="transform:scale(${k});transform-origin:0 0">${html}</div></div>`).join("")}</div>`;
    const [front, back] = faces();
    box.innerHTML = sheet(front) + sheet(back);
    css = "@page { size: A4; margin: 10mm; }";
  } else {
    box.innerHTML = faces().join("");
    const a3 = state.type === "sign" && item().paper === "a3";
    css = `@page { size: ${a3 ? "A3" : t.print}; margin: 0; }${a3 ? " .dc-print .kit { zoom: 1.4142; }" : ""}`;
  }
  let style = document.getElementById("kit-page");
  if (!style) {
    style = Object.assign(document.createElement("style"), { id: "kit-page" });
    document.head.append(style);
  }
  style.textContent = css;
  window.print();
}

async function busy(button, task) {
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "Preparing…";
  try {
    await task();
  } catch (error) {
    console.error(error);
    toast("That download could not be prepared. Check your connection and try again.");
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

function toast(message) {
  let el = document.querySelector(".dc-toast");
  if (!el) {
    el = Object.assign(document.createElement("div"), { className: "dc-toast" });
    el.setAttribute("role", "status");
    document.body.append(el);
  }
  el.textContent = message;
  el.classList.add("is-on");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("is-on"), 2200);
}

/* A photo is cut to a square and kept small, so drafts stay light. */
function readPhoto(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const c = Object.assign(document.createElement("canvas"), { width: 420, height: 420 });
      c.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 420, 420);
      item().photo = c.toDataURL("image/jpeg", 0.86);
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* ---------- Wiring ---------- */

function build() {
  document.querySelectorAll("[data-type]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.type === state.type)));
  document.querySelector("[data-editor]").innerHTML = editorHtml();
  document.querySelector(".dc-title").textContent = `${T().label}.`;
  document.title = `${T().label} · New Concept Security`;
  fill();
  render();
}

function init() {
  document.querySelector("[data-types]").innerHTML = Object.entries(TYPES).map(([id, t]) => `<button type="button" data-type="${id}" aria-pressed="false">${t.label}</button>`).join("");
  document.addEventListener("click", (e) => {
    const type = e.target.closest("[data-type]");
    if (type) {
      state.type = type.dataset.type;
      history.replaceState(null, "", `?type=${state.type}`);
      return build();
    }
    const design = e.target.closest("[data-design]");
    if (design) {
      item().design = design.dataset.design;
      fill();
      return render();
    }
    if (e.target.closest("[data-photo]")) return document.querySelector("[data-photo-file]").click();
    if (e.target.closest("[data-photo-clear]")) {
      item().photo = "";
      return render();
    }
    const exp = e.target.closest("[data-export]");
    if (exp) {
      if (exp.dataset.export === "print") return printItem();
      return busy(exp, exp.dataset.export === "pdf" ? exportPdf : exportPng);
    }
    if (e.target.closest("[data-reset]") && window.confirm(`Put the ${T().label.toLowerCase()} back to the sample? Your business details are kept.`)) {
      state.items[state.type] = { ...T().sample };
      fill();
      render();
    }
  });
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.matches("[data-palette]")) {
      const p = PALETTES[el.value];
      Object.assign(state, { palette: el.value, main: p.main, accent: p.accent });
      fill();
      return render();
    }
    if (!el.dataset.k) return;
    set(el.dataset.k, el.type === "checkbox" ? el.checked : el.value);
    if (el.dataset.k === "main" || el.dataset.k === "accent") state.palette = "custom";
    render();
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-photo-file]") && e.target.files[0]) readPhoto(e.target.files[0]);
  });
  window.addEventListener("resize", fit);
  document.fonts?.ready.then(render);
  build();
}

init();
