/* New Concept Security: the document studio. Invoice, receipt,
   quote, timesheet, credit note, purchase order, statement, pro-forma
   invoice, debit note, delivery note, remittance advice, job sheet and
   payslip share one engine (the page says which, in
   body[data-doc]). The form on the left edits a plain state object; the page
   on the right is drawn from it as HTML at its printed size. Drafts are kept
   in this browser; saved documents can be reopened. Exports: PDF and PNG
   (drawn from the page), or the browser's own print and Save as PDF. */

const TYPE = document.body.dataset.doc || "invoice";

const W_PATH = "M210 8L297.35 95.35V301.72L148.09 69.91ZM210 412L122.65 324.65V118.28L271.91 350.09Z";
const R_PATHS =
  '<path d="M10.18 210L68.05 152.13V267.87ZM409.82 210L351.95 152.13V267.87Z"/>';

const KINDS = {
  invoice: { title: "Invoice", prefix: "INV", date: "Invoice date", second: { key: "due", label: "Due date" }, to: "Bill to" },
  receipt: { title: "Receipt", prefix: "RCT", date: "Payment date", second: null, to: "Received from" },
  quote: { title: "Quote", prefix: "QTE", date: "Quote date", second: { key: "valid", label: "Valid until" }, to: "Prepared for" },
  timesheet: { title: "Timesheet", prefix: "TS", date: "Issued", second: null, to: "Client and site" },
  credit: { title: "Credit note", prefix: "CRN", date: "Credit date", second: null, to: "Credit to" },
  po: { title: "Purchase order", prefix: "PO", date: "Order date", second: { key: "due", label: "Deliver by" }, to: "Supplier" },
  statement: { title: "Statement", prefix: "STM", date: "Statement date", second: { key: "due", label: "Pay by" }, to: "Account" },
  proforma: { title: "Pro-forma invoice", prefix: "PRO", date: "Date", second: { key: "valid", label: "Valid until" }, to: "Bill to" },
  debit: { title: "Debit note", prefix: "DBN", date: "Date", second: { key: "due", label: "Due date" }, to: "Bill to" },
  delivery: { title: "Delivery note", prefix: "DN", date: "Delivery date", second: null, to: "Deliver to" },
  remittance: { title: "Remittance advice", prefix: "RA", date: "Payment date", second: null, to: "Paid to" },
  jobsheet: { title: "Job sheet", prefix: "JOB", date: "Date", second: null, to: "Client and site" },
  payslip: { title: "Payslip", prefix: "PAY", date: "Pay date", second: null, to: "Employee" },
};
const KIND = KINDS[TYPE];
/* The documents that ask to be paid: they show payment details and a balance. */
const BILL = ["invoice", "proforma", "statement", "debit"].includes(TYPE);
/* Delivery notes carry no prices; remittances and statements list invoices; payslips add up pay and deductions. */
const NO_PRICES = TYPE === "delivery";
const INVOICE_LIST = ["statement", "remittance"].includes(TYPE);
const REF_LABEL = { quote: "Reference", credit: "Original invoice", debit: "Original invoice", po: "Your quote reference", statement: "Account number", delivery: "Order reference", remittance: "Our reference", jobsheet: "Job reference", payslip: "Pay period" }[TYPE] || "PO / reference";

/* Page styles: five document layouts, then the business card's designs. */
const TEMPLATES = {
  classic: "Classic",
  modern: "Modern",
  minimal: "Minimal",
  sidebar: "Sidebar",
  compact: "Compact",
  monogram: "Monogram",
  split: "Split",
  diagonal: "Diagonal",
  executive: "Executive",
  badge: "Badge",
  hivis: "Hi-vis",
  blueprint: "Blueprint",
  night: "Night",
  wordmark: "Wordmark",
  ledger: "Ledger",
  frame: "Frame",
  column: "Column",
  stripe: "Stripe",
  letterhead: "Letterhead",
  corner: "Corner",
  hairline: "Hairline",
  poster: "Poster",
  seal: "Seal",
  ribbon: "Ribbon",
  banner: "Banner",
  elegant: "Elegant",
  block: "Block",
  underline: "Underline",
  tab: "Tab",
  grid: "Grid",
};

/* The business card's colour themes. `main` colours the bands and titles;
   `ink` is the type on a band; `r` the R of the mark on a band. */
const PALETTES = {
  black: { label: "Black", main: "#0A0A0A", accent: "#C41616", r: "#C41616", swatch: ["#1C1C1E", "#000000"] },
  red: { label: "NCS Red", main: "#A01010", accent: "#1D1D1F", ink: "#FFFFFF", r: "#FFFFFF", swatch: ["#C41616", "#7A0A0A"] },
  charcoal: { label: "Charcoal", main: "#2C2C2E", accent: "#C41616", swatch: ["#3A3A3C", "#1C1C1E"] },
  steel: { label: "Steel", main: "#353B42", accent: "#C41616", swatch: ["#4B535C", "#22272D"] },
  oxblood: { label: "Oxblood", main: "#4A0E0E", accent: "#C41616", swatch: ["#5E1414", "#250505"] },
  silver: { label: "Silver", main: "#48484A", accent: "#A01010", swatch: ["#F4F4F6", "#D4D4D9"] },
  bone: { label: "Bone", main: "#3A3631", accent: "#A01010", page: "#FBFAF7", swatch: ["#F5F3EE", "#E3DFD6"] },
  paper: { label: "Paper", main: "#1D1D1F", accent: "#A01010", swatch: ["#FFFFFF", "#ECECEE"] },
};

const FORMATS = { log: "Shift log", grid: "Weekly grid", signin: "Sign-in sheet (print and fill in)", officer: "By officer (payroll)" };

const CURRENCIES = {
  USD: "en-US",
  GBP: "en-GB",
  EUR: "en-IE",
  CAD: "en-CA",
  AUD: "en-AU",
  NZD: "en-NZ",
  ZAR: "en-ZA",
  AED: "en-AE",
  NGN: "en-NG",
  INR: "en-IN",
};

const FONTS = ["Geist", "Inter", "Manrope", "DM Sans", "Montserrat", "Space Grotesk", "Playfair Display", "Fraunces"];

const PAGES = {
  a4: { w: 794, h: 1123, label: "A4", pt: [595.28, 841.89], print: "A4" },
  letter: { w: 816, h: 1056, label: "Letter", pt: [612, 792], print: "letter" },
  a4l: { w: 1123, h: 794, label: "A4 landscape", pt: [841.89, 595.28], print: "A4 landscape" },
  letterl: { w: 1056, h: 816, label: "Letter landscape", pt: [792, 612], print: "letter landscape" },
  thermal: { w: 302, h: 0, label: "80 mm till roll" },
};

/* Timesheet rate types, each with its own hourly rate. */
const RATE_TYPES = { standard: "Standard", night: "Night", weekend: "Weekend", overtime: "Overtime", holiday: "Bank holiday" };
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STORE = `ncs-doc-${TYPE}`;
const SAVED = `ncs-docs-${TYPE}`;

/* ---------- Defaults ---------- */

function today(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* This week's Monday, plus some days. */
function monday(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset);
  return iso(d);
}

function addDays(dateIso, n) {
  const d = new Date(`${dateIso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return iso(d);
}

const toMins = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm || "").trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/* Weekends take the weekend rate; shifts that run past midnight or start late, the night rate. */
function autoType(dateIso, start, end) {
  const day = new Date(`${dateIso}T00:00:00`).getDay();
  if (day === 0 || day === 6) return "weekend";
  const a = toMins(start);
  const b = toMins(end);
  if (a != null && b != null && (b <= a || a >= 19 * 60)) return "night";
  return "standard";
}

function sampleEntries() {
  const out = [];
  for (let d = 0; d < 7; d += 1) {
    const date = monday(d);
    out.push({ date, officer: "J. Carter", post: "Main gate", start: "18:00", end: "06:00", brk: 30, type: autoType(date, "18:00", "06:00"), notes: "" });
    if (d < 5) out.push({ date, officer: "S. Ahmed", post: "Gatehouse", start: "07:00", end: "17:00", brk: 45, type: "standard", notes: d === 2 ? "Covered deliveries until 17:30" : "" });
  }
  return out;
}

const SAMPLE_ITEMS = {
  invoice: [
    { desc: "Static guarding, night shifts", detail: "Main gate, 18:00 to 06:00, 7 nights", qty: 84, unit: "hours", rate: 24, tax: 0 },
    { desc: "Mobile patrol visits", detail: "Randomised, checkpoints scanned and logged", qty: 14, unit: "visits", rate: 35, tax: 0 },
    { desc: "Remote CCTV monitoring", detail: "Solar tower, monitored 18:00 to 07:00", qty: 1, unit: "week", rate: 260, tax: 0 },
    { desc: "Alarm response call-out", detail: "Attended, site secured, report sent", qty: 1, unit: "call-out", rate: 75, tax: 0 },
  ],
  receipt: [
    { desc: "Static guarding, weekend cover", detail: "Saturday and Sunday, 24 hours", qty: 48, unit: "hours", rate: 24, tax: 0 },
    { desc: "Key holding", detail: "Monthly fee", qty: 1, unit: "month", rate: 45, tax: 0 },
  ],
  quote: [
    { desc: "Static guarding, nights", detail: "One officer, 18:00 to 06:00", qty: 30, unit: "nights", rate: 288, tax: 0 },
    { desc: "Gatehouse officer, days", detail: "Vehicle checks and visitor log, 07:00 to 17:00", qty: 22, unit: "days", rate: 240, tax: 0 },
    { desc: "Solar CCTV tower with monitoring", detail: "Supply, install and live monitoring", qty: 1, unit: "month", rate: 950, tax: 0 },
    { desc: "Mobile patrol, two visits a night", detail: "Randomised times, checkpoint scans", qty: 30, unit: "nights", rate: 60, tax: 0 },
  ],
  credit: [
    { desc: "Patrol visits not made", detail: "Site closed 14 to 16 October, agreed with the site manager", qty: 6, unit: "visits", rate: 35, tax: 0 },
    { desc: "Night shift cancelled at short notice", detail: "Main gate, 18 October", qty: 12, unit: "hours", rate: 24, tax: 0 },
  ],
  po: [
    { desc: "Hi-vis jackets, class 2, black and yellow", detail: "Sizes M to XL, embroidered logo", qty: 12, unit: "jackets", rate: 18.5, tax: 0 },
    { desc: "Two-way radios with chargers", detail: "Licence-free, IP67", qty: 6, unit: "radios", rate: 64, tax: 0 },
    { desc: "Body-worn cameras", detail: "With 12 months of cloud storage", qty: 4, unit: "cameras", rate: 189, tax: 0 },
    { desc: "Rechargeable patrol torches", detail: "1,000 lumens", qty: 8, unit: "torches", rate: 29, tax: 0 },
  ],
  statement: [
    { desc: "INV-0028", detail: "1 August · Static guarding, July", qty: 1, unit: "", rate: 2940, tax: 0 },
    { desc: "INV-0031", detail: "1 September · Static guarding and patrols, August", qty: 1, unit: "", rate: 3315, tax: 0 },
    { desc: "INV-0034", detail: "1 October · Static guarding, CCTV tower, September", qty: 1, unit: "", rate: 3720, tax: 0 },
  ],
  debit: [
    { desc: "Extra night cover, as requested", detail: "Main gate, 18 and 19 October, 18:00 to 06:00", qty: 24, unit: "hours", rate: 24, tax: 0 },
    { desc: "Additional patrol visits", detail: "Two extra visits a night during the plant hire", qty: 8, unit: "visits", rate: 35, tax: 0 },
  ],
  delivery: [
    { desc: "Hi-vis jackets, class 2", detail: "Sizes M to XL, embroidered logo", qty: 12, unit: "jackets", rate: 0, tax: 0 },
    { desc: "Two-way radios with chargers", detail: "Boxed, with spare batteries", qty: 6, unit: "radios", rate: 0, tax: 0 },
    { desc: "Rechargeable patrol torches", detail: "", qty: 8, unit: "torches", rate: 0, tax: 0 },
    { desc: "Site sign, CCTV in operation, A3", detail: "Rigid board with fixings", qty: 4, unit: "signs", rate: 0, tax: 0 },
  ],
  remittance: [
    { desc: "INV-2231", detail: "1 October · Uniform order, September", qty: 1, unit: "", rate: 1240, tax: 0 },
    { desc: "INV-2240", detail: "8 October · Radio repairs", qty: 1, unit: "", rate: 186, tax: 0 },
    { desc: "INV-2247", detail: "15 October · Fuel cards, September", qty: 1, unit: "", rate: 612.4, tax: 0 },
  ],
  jobsheet: [
    { desc: "Install solar CCTV tower", detail: "Positioned to cover the north gate and the plant yard", qty: 3, unit: "hours", rate: 45, tax: 0 },
    { desc: "Test the monitoring link", detail: "Alarm and live view tested with the control room", qty: 1, unit: "hour", rate: 45, tax: 0 },
    { desc: "Brief the site manager", detail: "How to arm, disarm and report a fault", qty: 0.5, unit: "hours", rate: 45, tax: 0 },
  ],
  payslip: [
    { desc: "Basic hours", detail: "1 to 31 October", qty: 120, unit: "hours", rate: 12.6, tax: 0 },
    { desc: "Night premium", detail: "Hours between 22:00 and 06:00", qty: 48, unit: "hours", rate: 1.5, tax: 0 },
    { desc: "Holiday pay", detail: "", qty: 1, unit: "", rate: 182.4, tax: 0 },
    { desc: "Income tax", detail: "Tax code 1257L", qty: 1, unit: "", rate: -198.2, tax: 0 },
    { desc: "National Insurance", detail: "", qty: 1, unit: "", rate: -96.75, tax: 0 },
    { desc: "Pension, employee", detail: "5% of qualifying earnings", qty: 1, unit: "", rate: -60.48, tax: 0 },
  ],
  proforma: [
    { desc: "Static guarding, first month", detail: "One officer, 18:00 to 06:00, every night", qty: 30, unit: "nights", rate: 288, tax: 0 },
    { desc: "Solar CCTV tower, set-up and first month", detail: "Supply, install and live monitoring", qty: 1, unit: "month", rate: 950, tax: 0 },
  ],
};

const NOTES = {
  timesheet: "Hours are taken from the shift log and patrol scans. Please approve and return by the Monday after the period ends.",
  invoice: "Thank you for trusting us with your site. Shift reports for this period are available on request.",
  receipt: "Thank you. This receipt confirms payment in full for the services listed.",
  quote: "Prices include uniformed, licensed officers, equipment, patrol logging and a written report after every shift. We will walk the site with you before the cover starts.",
  credit: "This credit has been taken off your account. It will be set against your next invoice unless you ask for a refund.",
  po: "Please confirm the order and the delivery date by email. Deliver to the site office between 08:00 and 16:00, quoting the order number.",
  statement: "Thank you for your business. If your records differ from this statement, please let us know within 14 days.",
  proforma: "This is a pro-forma invoice, sent so the cover can be paid for before it starts. A full invoice follows once payment is received.",
  debit: "This debit note adds the charges above to your account. They will appear on your next statement.",
  delivery: "Please check the goods against this note and sign for them. Report anything missing or damaged within 48 hours.",
  remittance: "Payment for the invoices above has been sent today by bank transfer. Please allow up to two working days.",
  jobsheet: "Work completed as described. Any further visits will be charged at the same rate.",
  payslip: "Questions about your pay? Speak to the office within 14 days of the pay date.",
};

const TERMS = {
  timesheet: "",
  invoice: "Payment due within 14 days. Please quote the invoice number with your payment. Late payments may incur interest under the Late Payment of Commercial Debts (Interest) Act 1998.",
  receipt: "",
  quote: "This quote is valid until the date shown. Cover starts once the quote is accepted and the site survey is complete.",
  credit: "",
  po: "Prices as quoted. Invoices must show this order number to be paid.",
  statement: "Please pay the balance by the date shown, quoting the account number.",
  proforma: "Payment is due before the start date. Prices are valid until the date shown.",
  debit: "Payment due within 14 days. Please quote the debit note number.",
  delivery: "",
  remittance: "",
  jobsheet: "",
  payslip: "",
};

const VAT_TYPES = new Set(["invoice", "quote", "proforma", "credit", "debit", "po", "receipt"]);

function defaults() {
  return {
    template: { quote: "modern", receipt: "minimal", timesheet: "compact", credit: "ledger", po: "frame", statement: "column", proforma: "stripe", debit: "underline", delivery: "grid", remittance: "hairline", jobsheet: "tab", payslip: "poster" }[TYPE] || "classic",
    accent: "#0A0A0A",
    accent2: "#C41616",
    palette: "black",
    font: "Montserrat",
    logoScale: 100,
    tagline: "SIA Approved Contractor · Manned guarding · Key holding · CCTV",
    showTagline: false,
    qr: "none",
    format: "log",
    blankRows: 16,
    signinPrefill: true,
    paper: "a4",
    currency: "GBP",
    number: `${KIND.prefix}-0001`,
    date: today(),
    due: today(14),
    valid: today(30),
    reference: { quote: "", credit: "INV-0034", debit: "INV-0034", po: "QTE-5512", statement: "ACC-1043", delivery: "PO-0012", remittance: "PAY-0912", jobsheet: "Riverside compound", payslip: "1 to 31 October" }[TYPE] ?? "PO-2210",
    periodStart: monday(0),
    periodEnd: monday(6),
    site: "Main compound, Riverside development",
    showRates: true,
    rates: { standard: 24, night: 27, weekend: 30, overtime: 36, holiday: 48 },
    entries: TYPE === "timesheet" ? sampleEntries() : [],
    gen: { officers: "J. Carter\nS. Ahmed", post: "Main gate", days: [true, true, true, true, true, false, false], start: "07:00", end: "17:00", brk: 30, type: "auto", mode: "add" },
    stamp: TYPE === "receipt" ? "paid" : "none",
    showLogo: true,
    logo: "",
    from: {
      name: "New Concept Security",
      address: "Concept House, 283 Church Street\nBlackpool, FY1 3PG",
      phone: "01253 982211",
      email: "mattbaron@newconceptsecurity.co.uk",
      web: "newconceptsecurity.co.uk",
      taxId: "Company no. 10664067 · SIA ACS NECOSESC01",
    },
    to: {
      name: "Client company",
      contact: "Site manager",
      address: "Site address\nCity, Region, Postcode",
      email: "",
    },
    // UK VAT at the standard 20% on anything billed; payslips and notes without prices keep none.
    items: (SAMPLE_ITEMS[TYPE] || []).map((it) => ({ ...it, tax: VAT_TYPES.has(TYPE) ? 20 : it.tax })),
    taxLabel: "VAT",
    taxRate: VAT_TYPES.has(TYPE) ? 20 : 0,
    discountType: "percent",
    discount: 0,
    otherLabel: "Other charges",
    other: 0,
    paid: 0,
    paidInFull: true,
    method: "Bank transfer",
    txn: "",
    signature: true,
    notes: NOTES[TYPE],
    terms: TERMS[TYPE],
    pay: {
      bank: "Your bank",
      accountName: "New Concept Security",
      account: "",
      sort: "",
      iban: "",
      swift: "",
      link: "",
    },
  };
}

let state = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved) return merge(defaults(), saved);
  } catch {
    /* No storage: start fresh. */
  }
  return defaults();
}

function merge(base, extra) {
  const out = { ...base, ...extra };
  out.from = { ...base.from, ...(extra.from || {}) };
  out.to = { ...base.to, ...(extra.to || {}) };
  out.pay = { ...base.pay, ...(extra.pay || {}) };
  out.items = Array.isArray(extra.items) ? extra.items : base.items;
  out.entries = Array.isArray(extra.entries) ? extra.entries : base.entries;
  out.rates = { ...base.rates, ...(extra.rates || {}) };
  out.gen = { ...base.gen, ...(extra.gen || {}) };
  return out;
}

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      /* Storage full or blocked: the editor still works. */
    }
  }, 250);
}

/* ---------- Helpers ---------- */

const esc = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const num = (v) => {
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

function money(n) {
  const locale = CURRENCIES[state.currency] || "en-US";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency: state.currency }).format(n);
  } catch {
    return n.toFixed(2);
  }
}

const qty = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, ""));

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(CURRENCIES[state.currency] || "en-US", { day: "numeric", month: "short", year: "numeric" });
}

function get(path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), state);
}

function set(path, value) {
  const keys = path.split(".");
  let o = state;
  keys.slice(0, -1).forEach((k) => {
    o = o[k];
  });
  o[keys[keys.length - 1]] = value;
}

const hoursOf = (e) => {
  const a = toMins(e.start);
  const b = toMins(e.end);
  if (a == null || b == null) return 0;
  let d = b - a;
  if (d <= 0) d += 1440;
  return Math.max(0, (d - num(e.brk)) / 60);
};

const hrs = (h) => (Math.round(h * 100) / 100).toFixed(2).replace(/\.?0+$/, "") || "0";

function dayLabel(dateIso) {
  if (!dateIso) return "";
  const d = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(CURRENCIES[state.currency] || "en-US", { weekday: "short", day: "numeric", month: "short" });
}

function tsTotals(s = state) {
  const lines = s.entries.map((e) => {
    const hours = hoursOf(e);
    const rate = num(s.rates[e.type]);
    return { ...e, hours, rate, amount: hours * rate };
  });
  const byType = {};
  const byOfficer = {};
  lines.forEach((l) => {
    const t = (byType[l.type] = byType[l.type] || { hours: 0, amount: 0 });
    t.hours += l.hours;
    t.amount += l.amount;
    const name = l.officer || "Unnamed";
    const o = (byOfficer[name] = byOfficer[name] || { hours: 0, shifts: 0 });
    o.hours += l.hours;
    o.shifts += 1;
  });
  const hours = lines.reduce((a, l) => a + l.hours, 0);
  const amount = lines.reduce((a, l) => a + l.amount, 0);
  return { lines, hours, amount, byType, byOfficer, subtotal: amount, discount: 0, tax: 0, other: 0, total: amount, paid: 0, due: amount };
}

function totals(s = state) {
  if (TYPE === "timesheet") return tsTotals(s);
  const lines = s.items.map((it) => ({ ...it, amount: num(it.qty) * num(it.rate) }));
  const subtotal = lines.reduce((a, l) => a + l.amount, 0);
  const discount = Math.min(subtotal, s.discountType === "percent" ? (subtotal * num(s.discount)) / 100 : num(s.discount));
  const ratio = subtotal ? (subtotal - discount) / subtotal : 0;
  const tax = lines.reduce((a, l) => a + (l.amount * ratio * num(l.tax)) / 100, 0);
  const other = num(s.other);
  const total = subtotal - discount + tax + other;
  const paid = TYPE === "receipt" && s.paidInFull ? total : num(s.paid);
  return { lines, subtotal, discount, tax, other, total, paid, due: total - paid };
}

/* ---------- The page ---------- */

function lum(hex) {
  const n = parseInt(String(hex).replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/* The page's colours: the theme's, or the custom pair. */
function colors() {
  const p = PALETTES[state.palette];
  const main = state.accent;
  const accent = state.accent2;
  const light = lum(main) > 0.45;
  return {
    main,
    accent,
    ink: (p && p.ink) || (light ? "#1D1D1F" : "#FFFFFF"),
    r: (p && p.r) || accent,
    page: (p && p.page) || "#FFFFFF",
    dark: mixHex(main, "#000000", 0.4),
    soft: mixHex(main, "#FFFFFF", 0.14),
  };
}

function applyPalette(id) {
  const p = PALETTES[id];
  state.palette = id;
  if (p) {
    state.accent = p.main;
    state.accent2 = p.accent;
  }
}

/* The mark, drawn on the page or on a band of the main colour. */
function mark(onBand) {
  const c = colors();
  const w = onBand ? c.ink : c.main;
  const r = onBand ? c.r : c.accent;
  return `<svg viewBox="0 0 420 420" aria-hidden="true"><path fill="${w}" d="${W_PATH}"/><g fill="${r}">${R_PATHS}</g></svg>`;
}

function tagline() {
  return state.showTagline && state.tagline.trim() ? `<span class="doc-tagline">${esc(state.tagline)}</span>` : "";
}

function logo(onDark = false) {
  if (!state.showLogo) {
    return `<div class="doc-logo"><div class="doc-logo-name">${esc(state.from.name)}${tagline()}</div></div>`;
  }
  const art = state.logo ? `<img src="${state.logo}" alt="">` : mark(onDark);
  const words = state.logo ? (tagline() ? `<div class="doc-logo-name">${tagline()}</div>` : "") : `<div class="doc-logo-name"><span class="ncs-word"><b>NEW</b><span>CONCEPT</span></span><small>SECURITY</small>${tagline()}</div>`;
  return `<div class="doc-logo">${art}${words}</div>`;
}

/* A QR code to the website or the payment link, drawn as vector modules. */
let qrPending = null;
function qrSvg(text, size = 92) {
  if (!window.qrcode) {
    if (!qrPending) {
      qrPending = loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js").then(() => renderPreview()).catch(() => {
        qrPending = null;
      });
    }
    return "";
  }
  const code = window.qrcode(0, "M");
  code.addData(text);
  code.make();
  const n = code.getModuleCount();
  const cell = size / (n + 4);
  let d = "";
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (code.isDark(r, c)) d += `M${((c + 2) * cell).toFixed(2)} ${((r + 2) * cell).toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`;
    }
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><rect width="${size}" height="${size}" fill="#FFFFFF"/><path d="${d}" fill="#1D1D1F"/></svg>`;
}

function qrBlock() {
  if (!state.qr || state.qr === "none") return "";
  const web = state.from.web.trim();
  const site = web ? (/^https?:/i.test(web) ? web : `https://${web}`) : "";
  const target = state.qr === "pay" ? state.pay.link.trim() || site : site;
  if (!target) return "";
  const art = qrSvg(target);
  if (!art) return "";
  return `<div class="doc-qr">${art}<small>${state.qr === "pay" && state.pay.link.trim() ? "Scan to pay" : "Scan to visit us"}</small></div>`;
}

function fromBlock(label = "From") {
  const f = state.from;
  const lines = [f.address, f.phone, f.email, f.web, f.taxId && (/[a-z]/i.test(f.taxId) ? f.taxId : `Company no. ${f.taxId}`)].filter((v) => v && String(v).trim());
  return `<div><p class="doc-label">${label}</p><p class="doc-block"><strong>${esc(f.name)}</strong>${esc(lines.join("\n"))}</p></div>`;
}

function toBlock() {
  const t = state.to;
  const lines = [t.contact, t.address, t.email].filter((v) => v && String(v).trim());
  return `<div><p class="doc-label">${KIND.to}</p><p class="doc-block"><strong>${esc(t.name)}</strong>${esc(lines.join("\n"))}</p></div>`;
}

function facts() {
  if (TYPE === "timesheet") {
    const rows = [
      ["Timesheet no.", state.number],
      ["Period", `${fmtDate(state.periodStart)} to ${fmtDate(state.periodEnd)}`],
      ["Issued", fmtDate(state.date)],
    ];
    if (state.site) rows.push(["Site", state.site]);
    if (state.reference) rows.push(["PO / reference", state.reference]);
    return `<dl class="doc-facts">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`;
  }
  const rows = [
    [`${KIND.title} no.`, state.number],
    [KIND.date, fmtDate(state.date)],
  ];
  if (KIND.second) rows.push([KIND.second.label, fmtDate(state[KIND.second.key])]);
  if (state.reference) rows.push([REF_LABEL, state.reference]);
  if (TYPE === "receipt") {
    rows.push(["Paid by", state.method]);
    if (state.txn) rows.push(["Transaction", state.txn]);
  }
  return `<dl class="doc-facts">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`;
}

function tsTable(t) {
  const cost = state.showRates;
  const head = `<thead><tr><th>Date</th><th>Officer</th><th>Post</th><th class="is-num">Start</th><th class="is-num">End</th><th class="is-num">Break</th><th class="is-num">Hours</th><th>Rate</th>${cost ? '<th class="is-num">Per hour</th><th class="is-num">Amount</th>' : ""}</tr></thead>`;
  const rows = t.lines
    .map(
      (l) =>
        `<tr><td style="white-space:nowrap">${esc(dayLabel(l.date))}</td><td>${esc(l.officer)}</td><td>${esc(l.post)}${l.notes ? `<small>${esc(l.notes)}</small>` : ""}</td><td class="is-num">${esc(l.start)}</td><td class="is-num">${esc(l.end)}</td><td class="is-num">${num(l.brk) ? `${num(l.brk)} min` : "–"}</td><td class="is-num"><strong>${hrs(l.hours)}</strong></td><td>${esc(RATE_TYPES[l.type] || l.type)}</td>${cost ? `<td class="is-num">${money(l.rate)}</td><td class="is-num">${money(l.amount)}</td>` : ""}</tr>`,
    )
    .join("");
  return `<table class="doc-table is-ts">${head}<tbody>${rows}</tbody></table>`;
}

function periodDays() {
  const out = [];
  const end = new Date(`${state.periodEnd}T00:00:00`);
  for (const d = new Date(`${state.periodStart}T00:00:00`); d <= end && out.length < 31; d.setDate(d.getDate() + 1)) out.push(iso(d));
  return out;
}

/* Weekly grid: officers down the side, the days of the period across. */
function tsGrid(t) {
  const days = periodDays();
  const officers = [...new Set(t.lines.map((l) => l.officer || "Unnamed"))];
  const cell = (o, d) => t.lines.filter((l) => (l.officer || "Unnamed") === o && l.date === d).reduce((a, l) => a + l.hours, 0);
  const locale = CURRENCIES[state.currency] || "en-US";
  const head = days
    .map((d) => {
      const date = new Date(`${d}T00:00:00`);
      return `<th class="is-num">${date.toLocaleDateString(locale, { weekday: "short" })}<br><span>${date.getDate()}</span></th>`;
    })
    .join("");
  const rows = officers
    .map((o) => {
      const cells = days.map((d) => {
        const h = cell(o, d);
        return `<td class="is-num">${h ? hrs(h) : '<span class="doc-dash">–</span>'}</td>`;
      });
      const total = days.reduce((a, d) => a + cell(o, d), 0);
      return `<tr><td>${esc(o)}</td>${cells.join("")}<td class="is-num"><strong>${hrs(total)}</strong></td></tr>`;
    })
    .join("");
  const foot = days.map((d) => `<td class="is-num">${hrs(officers.reduce((a, o) => a + cell(o, d), 0))}</td>`).join("");
  return `<table class="doc-table is-ts is-grid${days.length > 10 ? " is-dense" : ""}"><thead><tr><th>Officer</th>${head}<th class="is-num">Total</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td>Day total</td>${foot}<td class="is-num"><strong>${hrs(t.hours)}</strong></td></tr></tfoot></table>`;
}

/* Sign-in sheet: printed for officers to fill in and sign by hand. */
function tsSignin(t) {
  const locale = CURRENCIES[state.currency] || "en-US";
  const short = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString(locale, { weekday: "short", day: "numeric" }) : "");
  const rows = [];
  if (state.signinPrefill) {
    t.lines.forEach((l) => rows.push([short(l.date), l.officer, l.post, `${l.start}–${l.end}`]));
  }
  const blanks = state.signinPrefill ? Math.max(3, num(state.blankRows) - rows.length) : Math.max(1, Math.min(60, num(state.blankRows) || 18));
  for (let i = 0; i < blanks; i += 1) rows.push(["", "", "", ""]);
  const body = rows
    .map(([d, o, p, plan]) => `<tr><td>${esc(d)}</td><td>${esc(o)}</td><td>${esc(p)}</td><td class="is-plan">${esc(plan)}</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`)
    .join("");
  const cols = `<colgroup><col style="width:8%"><col style="width:12%"><col style="width:11%"><col style="width:13%"><col style="width:7%"><col style="width:12%"><col style="width:7%"><col style="width:12%"><col style="width:7%"><col style="width:11%"></colgroup>`;
  return `<table class="doc-table is-ts is-signin">${cols}<thead><tr><th>Date</th><th>Officer</th><th>Post</th><th>Shift</th><th>In</th><th>Signature</th><th>Out</th><th>Signature</th><th>Hours</th><th>Supervisor</th></tr></thead><tbody>${body}</tbody></table>`;
}

/* By officer: each officer's shifts together, with a subtotal, for payroll. */
function tsByOfficer(t) {
  const cost = state.showRates;
  const span = cost ? 9 : 7;
  const groups = {};
  t.lines.forEach((l) => (groups[l.officer || "Unnamed"] = groups[l.officer || "Unnamed"] || []).push(l));
  const rows = Object.entries(groups)
    .map(([name, lines]) => {
      const h = lines.reduce((a, l) => a + l.hours, 0);
      const amount = lines.reduce((a, l) => a + l.amount, 0);
      const shifts = lines
        .map(
          (l) =>
            `<tr><td style="white-space:nowrap">${esc(dayLabel(l.date))}</td><td>${esc(l.post)}${l.notes ? `<small>${esc(l.notes)}</small>` : ""}</td><td class="is-num">${esc(l.start)}</td><td class="is-num">${esc(l.end)}</td><td class="is-num">${num(l.brk) ? `${num(l.brk)} min` : "–"}</td><td class="is-num">${hrs(l.hours)}</td><td>${esc(RATE_TYPES[l.type] || l.type)}</td>${cost ? `<td class="is-num">${money(l.rate)}</td><td class="is-num">${money(l.amount)}</td>` : ""}</tr>`,
        )
        .join("");
      return `<tr class="is-group"><td colspan="${span}">${esc(name)}</td></tr>${shifts}<tr class="is-sub"><td colspan="5">${lines.length} shift${lines.length === 1 ? "" : "s"}</td><td class="is-num">${hrs(h)}</td><td></td>${cost ? `<td></td><td class="is-num">${money(amount)}</td>` : ""}</tr>`;
    })
    .join("");
  return `<table class="doc-table is-ts is-byofficer"><thead><tr><th>Date</th><th>Post</th><th class="is-num">Start</th><th class="is-num">End</th><th class="is-num">Break</th><th class="is-num">Hours</th><th>Rate</th>${cost ? '<th class="is-num">Per hour</th><th class="is-num">Amount</th>' : ""}</tr></thead><tbody>${rows}</tbody></table>`;
}

function tsSummary(t) {
  if (state.format === "signin") {
    return `<div class="doc-signin-total"><span>Total hours</span><span></span><span>Checked by</span><span></span></div>`;
  }
  const cost = state.showRates;
  const officers = Object.entries(t.byOfficer)
    .map(([name, o]) => `<tr><td>${esc(name)}</td><td class="is-num">${o.shifts}</td><td class="is-num">${hrs(o.hours)}</td></tr>`)
    .join("");
  const types = Object.entries(t.byType)
    .map(([type, v]) => `<tr><td>${esc(RATE_TYPES[type] || type)}</td><td class="is-num">${hrs(v.hours)}</td>${cost ? `<td class="is-num">${money(num(state.rates[type]))}</td><td class="is-num">${money(v.amount)}</td>` : ""}</tr>`)
    .join("");
  const grand = `<dl class="doc-totals"><dt class="is-grand">Total hours</dt><dd class="is-grand">${hrs(t.hours)}</dd>${cost ? `<dt class="is-due">Total</dt><dd class="is-due">${money(t.amount)}</dd>` : ""}</dl>`;
  return `<div class="doc-ts-sum">
<div><p class="doc-label">By officer</p><table class="doc-mini"><thead><tr><th>Officer</th><th class="is-num">Shifts</th><th class="is-num">Hours</th></tr></thead><tbody>${officers}</tbody></table>
<div class="doc-sum">${stamp()}${grand}</div></div>
<div><p class="doc-label">By rate</p><table class="doc-mini"><thead><tr><th>Rate</th><th class="is-num">Hours</th>${cost ? '<th class="is-num">Per hour</th><th class="is-num">Amount</th>' : ""}</tr></thead><tbody>${types}</tbody></table></div>
</div>`;
}

function table(t) {
  if (TYPE === "timesheet") {
    if (state.format === "grid") return tsGrid(t);
    if (state.format === "signin") return tsSignin(t);
    if (state.format === "officer") return tsByOfficer(t);
    return tsTable(t);
  }
  if (NO_PRICES) {
    const rows = t.lines
      .filter((l) => l.desc)
      .map((l) => `<tr><td>${esc(l.desc)}${l.detail ? `<small>${esc(l.detail)}</small>` : ""}</td><td class="is-num">${qty(num(l.qty))}</td><td>${esc(l.unit || "")}</td><td class="is-num"><span class="doc-tick"></span></td></tr>`)
      .join("");
    return `<table class="doc-table"><thead><tr><th>Description</th><th class="is-num">Qty</th><th>Unit</th><th class="is-num">Checked</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  if (INVOICE_LIST) {
    const rows = t.lines
      .filter((l) => l.desc || l.amount)
      .map((l) => `<tr><td class="is-ref">${esc(l.desc)}</td><td>${esc(l.detail)}</td><td class="is-num">${money(l.amount)}</td></tr>`)
      .join("");
    return `<table class="doc-table"><thead><tr><th>Invoice</th><th>Date and details</th><th class="is-num">Amount</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  const showTax = t.lines.some((l) => num(l.tax) > 0);
  const head = `<thead><tr><th>Description</th><th class="is-num">${TYPE === "payslip" ? "Units" : "Qty"}</th><th class="is-num">${TYPE === "payslip" ? "Rate" : "Unit price"}</th>${showTax ? `<th class="is-num">${esc(state.taxLabel)}</th>` : ""}<th class="is-num">Amount</th></tr></thead>`;
  const rows = t.lines
    .filter((l) => l.desc || l.amount)
    .map(
      (l) =>
        `<tr><td>${esc(l.desc)}${l.detail ? `<small>${esc(l.detail)}</small>` : ""}</td><td class="is-num">${qty(num(l.qty))}${l.unit ? ` <span style="color:#86868b">${esc(l.unit)}</span>` : ""}</td><td class="is-num">${money(num(l.rate))}</td>${showTax ? `<td class="is-num">${qty(num(l.tax))}%</td>` : ""}<td class="is-num">${money(l.amount)}</td></tr>`,
    )
    .join("");
  return `<table class="doc-table">${head}<tbody>${rows}</tbody></table>`;
}

function totalsBlock(t) {
  if (TYPE === "timesheet") return tsSummary(t);
  if (NO_PRICES) {
    const items = t.lines.filter((l) => l.desc);
    return `<div class="doc-sum">${stamp()}<dl class="doc-totals"><dt>Lines</dt><dd>${items.length}</dd><dt class="is-grand">Items</dt><dd class="is-grand">${qty(items.reduce((a, l) => a + num(l.qty), 0))}</dd></dl></div>`;
  }
  if (TYPE === "payslip") {
    const gross = t.lines.filter((l) => l.amount > 0).reduce((a, l) => a + l.amount, 0);
    const deductions = t.lines.filter((l) => l.amount < 0).reduce((a, l) => a + l.amount, 0);
    return `<div class="doc-sum">${stamp()}<dl class="doc-totals"><dt>Gross pay</dt><dd>${money(gross)}</dd><dt>Deductions</dt><dd>−${money(-deductions)}</dd><dt class="is-grand">Net pay</dt><dd class="is-grand">${money(gross + deductions)}</dd></dl></div>`;
  }
  const rows = [["Subtotal", money(t.subtotal)]];
  if (t.discount > 0) rows.push([state.discountType === "percent" ? `Discount (${qty(num(state.discount))}%)` : "Discount", `−${money(t.discount)}`]);
  if (t.tax > 0) rows.push([state.taxLabel, money(t.tax)]);
  if (t.other) rows.push([state.otherLabel || "Other charges", money(t.other)]);
  let out = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join("");
  const grand = { credit: "Total credit", po: "Order total", statement: "Total invoiced", remittance: "Total paid", jobsheet: "Job total", debit: "Total to pay" }[TYPE] || "Total";
  out += `<dt class="is-grand">${grand}</dt><dd class="is-grand">${TYPE === "credit" ? "−" : ""}${money(t.total)}</dd>`;
  if (BILL && (t.paid || TYPE === "statement")) {
    out += `<dt>${TYPE === "statement" ? "Payments received" : "Paid"}</dt><dd>${t.paid ? "−" : ""}${money(t.paid)}</dd><dt class="is-due">Balance due</dt><dd class="is-due">${money(t.due)}</dd>`;
  }
  if (TYPE === "receipt") {
    out += `<dt class="is-due">Amount paid</dt><dd class="is-due">${money(t.paid)}</dd>`;
    if (Math.abs(t.due) > 0.004) out += `<dt>Balance</dt><dd>${money(t.due)}</dd>`;
  }
  // The stamp sits beside the totals, where the eye lands last.
  return `<div class="doc-sum">${stamp()}<dl class="doc-totals">${out}</dl></div>`;
}

function payBlock(compact = false) {
  if (!BILL) return "";
  const p = state.pay;
  const rows = [
    ["Bank", p.bank],
    ["Account name", p.accountName],
    ["Account no.", p.account],
    ["Sort / routing", p.sort],
    ["IBAN", p.iban],
    ["SWIFT / BIC", p.swift],
    ["Pay online", p.link],
  ].filter(([, v]) => v && String(v).trim());
  if (!rows.length) return "";
  return `<div><p class="doc-label">Payment details</p><dl class="doc-pay">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></div>`;
}

function notesBlock(withPay = true) {
  const parts = [];
  if (state.notes.trim()) parts.push(`<div><p class="doc-label">Notes</p><p>${esc(state.notes)}</p></div>`);
  if (state.terms.trim()) parts.push(`<div><p class="doc-label">Terms</p><p>${esc(state.terms)}</p></div>`);
  if (withPay) parts.push(payBlock());
  parts.push(qrBlock());
  const body = parts.filter(Boolean);
  return body.length ? `<div class="doc-row doc-notes">${body.join("")}</div>` : "";
}

function signBlock() {
  if (TYPE === "timesheet" && state.signature) {
    return `<div class="doc-sign"><div><span>Officer</span></div><div><span>Supervisor</span></div><div><span>Client approval (name, signature, date)</span></div></div>`;
  }
  const who = { quote: "Accepted by (name and signature)", po: "Authorised by (name and signature)", delivery: "Received by (name and signature)", jobsheet: "Work accepted by (name and signature)" }[TYPE];
  if (!who || !state.signature) return "";
  return `<div class="doc-sign"><div><span>${who}</span></div><div style="flex:0.5"><span>Date</span></div></div>`;
}

function stamp() {
  const s = state.stamp;
  if (!s || s === "none") return "";
  const label = { paid: "PAID", overdue: "OVERDUE", draft: "DRAFT", accepted: "ACCEPTED", approved: "APPROVED", credited: "CREDITED", delivered: "DELIVERED", completed: "COMPLETED" }[s] || s.toUpperCase();
  return `<div class="doc-stamp is-${s}">${label}</div>`;
}

function foot() {
  const f = state.from;
  const bits = [f.name, f.web, f.email].filter((v) => v && v.trim());
  return `<p class="doc-foot">${esc(bits.join("  ·  "))}</p>`;
}

function head() {
  return `<div class="doc-row">${logo()}<div><h1 class="doc-kind">${KIND.title}</h1><p class="doc-number">${esc(state.number)}</p></div></div>`;
}

/* What every page style shares under its header. */
function body(t, parties) {
  return `<div class="doc-row doc-parties">${parties || `${fromBlock()}${toBlock()}${facts()}`}</div>
${table(t)}${totalsBlock(t)}${notesBlock()}${signBlock()}${foot()}`;
}

const kind = (align = "right") =>
  `<div class="doc-title" style="text-align:${align}"><h1 class="doc-kind" style="text-align:${align}">${KIND.title}</h1><p class="doc-number" style="text-align:${align}">${esc(state.number)}</p></div>`;

/* The wordmark styles fall back to the logo when a custom one is uploaded. */
const ownLogo = () => Boolean(state.logo) || !state.showLogo;

let svgIds = 0;

function shield(cx, cy, k, stroke, sw) {
  return `<path d="M${cx - 130 * k} ${cy - 150 * k}H${cx + 130 * k}V${cy - 8 * k}C${cx + 130 * k} ${cy + 92 * k} ${cx + 44 * k} ${cy + 140 * k} ${cx} ${cy + 162 * k}C${cx - 44 * k} ${cy + 140 * k} ${cx - 130 * k} ${cy + 92 * k} ${cx - 130 * k} ${cy - 8 * k}Z" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}

/* The one figure a reader wants first, for the styles that lead with it. */
function headline(t) {
  if (TYPE === "timesheet") return ["Total hours", `${hrs(t.hours)} h`];
  if (TYPE === "receipt") return ["Amount paid", money(t.paid)];
  if (TYPE === "credit") return ["Total credit", money(t.total)];
  if (TYPE === "po") return ["Order total", money(t.total)];
  if (TYPE === "quote") return ["Quote total", money(t.total)];
  if (NO_PRICES) return ["Items", qty(t.lines.reduce((a, l) => a + num(l.qty), 0))];
  if (TYPE === "remittance") return ["Total paid", money(t.total)];
  if (TYPE === "jobsheet") return ["Job total", money(t.total)];
  if (TYPE === "payslip") return ["Net pay", money(t.total)];
  return ["Balance due", money(t.due)];
}

const LAYOUTS = {
  monogram(t) {
    const c = colors();
    const brand = ownLogo()
      ? logo()
      : `<div class="doc-mono">${mark(false)}<p class="doc-mono-name"><span class="ncs-word"><b>NEW</b><span>CONCEPT</span></span></p><p class="doc-mono-sub">SECURITY</p>${tagline()}</div>`;
    return `<div class="doc-edge" style="background:${c.accent}"></div><div class="doc-watermark"><svg viewBox="0 0 420 420"><path fill="${c.main}" d="${W_PATH}"/><g fill="${c.main}">${R_PATHS}</g></svg></div>
<div class="doc-in"><div class="doc-row">${brand}${kind()}</div>${body(t)}</div>`;
  },
  split(t) {
    const c = colors();
    return `<div class="doc-split" style="background:linear-gradient(90deg, ${c.main} 0 38%, transparent 38%)"><div class="doc-split-left" style="border-right:5px solid ${c.accent}">${ownLogo() ? logo(true) : `<div class="doc-split-mark">${mark(true)}</div>`}</div>
<div class="doc-split-right">${kind("left")}<p class="doc-split-name" style="color:${c.main}">NEW CONCEPT SECURITY</p>${tagline()}</div></div>
<div class="doc-in">${body(t)}</div>`;
  },
  diagonal(t) {
    const c = colors();
    return `<div class="doc-diag"><svg class="doc-diag-art" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,0 560,0 470,180 0,180" fill="${c.main}"/><polygon points="578,0 594,0 504,180 488,180" fill="${c.accent}"/></svg>
<div class="doc-diag-in"><div class="doc-diag-mark">${logo(true)}</div>${kind()}</div></div>
<div class="doc-in">${body(t)}</div>`;
  },
  executive(t) {
    const c = colors();
    const brand = ownLogo()
      ? logo(true)
      : `<div class="doc-exec-brand"><div class="doc-exec-mark">${mark(true)}</div><p class="doc-exec-name" style="color:${c.ink}">New Concept</p><p class="doc-exec-sub" style="color:${c.ink}">SECURITY</p><div class="doc-exec-rule" style="background:${c.accent}"></div>${tagline()}</div>`;
    return `<div class="doc-exec" style="background:linear-gradient(160deg, ${c.soft}, ${c.dark})">${brand}<div class="doc-title" style="text-align:right"><h1 class="doc-kind" style="color:${c.accent}">${KIND.title}</h1><p class="doc-number" style="color:${c.ink};opacity:0.7">${esc(state.number)}</p></div></div>
<div class="doc-in">${body(t)}</div>`;
  },
  badge(t) {
    const c = colors();
    const art = ownLogo()
      ? logo()
      : `<svg class="doc-badge-art" viewBox="0 0 300 340" aria-hidden="true">${shield(150, 160, 0.95, c.accent, 7)}<g transform="translate(66 92) scale(0.27)"><path fill="${c.main}" d="${W_PATH}"/><g fill="${c.accent}">${R_PATHS}</g></g></svg>`;
    return `<div class="doc-in"><div class="doc-badge">${art}<h1 class="doc-kind" style="text-align:center">${KIND.title}</h1><p class="doc-number" style="text-align:center">${esc(state.number)} · NEW CONCEPT SECURITY</p>${tagline()}</div>${body(t)}</div>`;
  },
  hivis(t) {
    const c = colors();
    const band = (y) => `<div class="doc-hv-stripe" style="background:${c.accent}"><span></span></div>`;
    return `<div class="doc-hv" style="background:linear-gradient(160deg, ${c.soft}, ${c.dark});color:${c.ink}"><div class="doc-row" style="align-items:center">${logo(true)}<div class="doc-title"><h1 class="doc-kind" style="color:${c.ink}">${KIND.title}</h1><p class="doc-number" style="color:${c.ink};opacity:0.7">${esc(state.number)}</p></div></div></div>${band()}${band()}
<div class="doc-in">${body(t)}</div><div class="doc-hv-foot" style="background:${c.accent}"><span></span></div>`;
  },
  blueprint(t) {
    const c = colors();
    const id = `bp${(svgIds += 1)}`;
    const point = (x, y, n) => `<circle cx="${x}" cy="${y}" r="11" fill="${c.accent}"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="700" fill="${c.main}" font-family="Arial, sans-serif">${n}</text>`;
    return `<div class="doc-bp"><svg class="doc-bp-art" viewBox="0 0 1100 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="${id}" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1"/></pattern></defs><rect width="1100" height="190" fill="${c.main}"/><rect width="1100" height="190" fill="url(#${id})"/><rect x="430" y="40" width="280" height="110" fill="none" stroke="${c.accent}" stroke-width="2.5" stroke-dasharray="12 8"/><path d="M525 40V100H710" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="2"/>${point(430, 40, 1)}${point(710, 100, 2)}${point(710, 150, 3)}${point(430, 150, 4)}</svg>
<div class="doc-bp-in" style="color:${c.ink}">${logo(true)}<div class="doc-title"><h1 class="doc-kind" style="color:${c.ink}">${KIND.title}</h1><p class="doc-number" style="color:${c.ink};opacity:0.75">${esc(state.number)}</p></div></div></div>
<div class="doc-in">${body(t)}</div>`;
  },
  night(t) {
    const c = colors();
    const sky = lum(c.main) > 0.2 ? "#0B2236" : c.main;
    const top = mixHex(sky, "#000000", 0.4);
    const bottom = mixHex(sky, "#3A6E99", 0.25);
    const id = `ns${(svgIds += 1)}`;
    let stars = "";
    let seed = 11;
    const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 60; i += 1) stars += `<circle cx="${(rand() * 1100).toFixed(1)}" cy="${(rand() * 120).toFixed(1)}" r="${(0.8 + rand() * 1.6).toFixed(1)}" fill="#FFFFFF" fill-opacity="${(0.25 + rand() * 0.6).toFixed(2)}"/>`;
    let fence = "";
    for (let x = 0; x < 1110; x += 26) fence += `<rect x="${x}" y="160" width="3" height="30" fill="#02080F"/>`;
    const r = lum(c.accent) < 0.2 ? "#C41616" : c.accent;
    return `<div class="doc-night"><svg class="doc-night-art" viewBox="0 0 1100 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="1100" height="200" fill="url(#${id})"/>${stars}<circle cx="470" cy="50" r="22" fill="${r}"/><circle cx="479" cy="44" r="20" fill="${top}"/><path d="M640 190V70M580 84H780M640 70L580 84M640 70L780 84" stroke="#02080F" stroke-width="7" fill="none"/>${fence}<rect y="161" width="1100" height="2.5" fill="#02080F"/><rect y="176" width="1100" height="2.5" fill="#02080F"/><rect y="188" width="1100" height="12" fill="#02080F"/></svg>
<div class="doc-night-in">${state.logo || !state.showLogo ? logo(true) : `<div class="doc-logo"><svg viewBox="0 0 420 420" aria-hidden="true"><path fill="#FFFFFF" d="${W_PATH}"/><g fill="${r}">${R_PATHS}</g></svg><div class="doc-logo-name" style="color:#FFFFFF"><span class="ncs-word"><b>NEW</b><span>CONCEPT</span></span><small style="color:rgba(255,255,255,0.65)">SECURITY</small>${tagline()}</div></div>`}<div class="doc-title"><h1 class="doc-kind" style="color:#FFFFFF">${KIND.title}</h1><p class="doc-number" style="color:rgba(255,255,255,0.7)">${esc(state.number)}</p></div></div></div>
<div class="doc-in">${body(t)}</div>`;
  },
  wordmark(t) {
    const c = colors();
    const brand = ownLogo()
      ? logo()
      : `<div class="doc-wm"><p class="doc-wm-name" style="color:${c.main}"><span class="ncs-word"><b>NEW</b><span>CONCEPT</span></span><span style="background:${c.accent}"></span></p><p class="doc-wm-sub">SECURITY</p>${tagline()}</div>`;
    return `<div class="doc-in"><div class="doc-row" style="align-items:flex-end">${brand}${kind()}</div><div class="doc-wm-rule" style="background:${c.main}"></div>${body(t)}</div>`;
  },
  classic(t) {
    return `<div class="doc-topline"></div><div class="doc-in">${head()}
<div class="doc-row doc-parties">${fromBlock()}${toBlock()}${facts()}</div>
${table(t)}${totalsBlock(t)}${notesBlock()}${signBlock()}${foot()}</div>`;
  },
  modern(t) {
    return `<div class="doc-band"><div class="doc-row">${logo(true)}<div><h1 class="doc-kind">${KIND.title}</h1><p class="doc-number">${esc(state.number)}</p></div></div></div><div class="doc-rule"></div>
<div class="doc-in"><div class="doc-row doc-parties" style="margin-top:0">${toBlock()}${fromBlock()}${facts()}</div>
${table(t)}${totalsBlock(t)}${notesBlock()}${signBlock()}${foot()}</div>`;
  },
  minimal(t) {
    return `<div class="doc-in"><div class="doc-row"><div><h1 class="doc-kind" style="text-align:left">${KIND.title}</h1><p class="doc-number" style="text-align:left">${esc(state.number)}</p></div>${logo()}</div>
<div class="doc-row doc-parties">${toBlock()}${fromBlock()}${facts()}</div>
${table(t)}${totalsBlock(t)}${notesBlock()}${signBlock()}${foot()}</div>`;
  },
  sidebar(t) {
    return `<aside class="doc-side">${logo(true)}${fromBlock()}${payBlock()}</aside>
<div class="doc-in"><h1 class="doc-kind">${KIND.title}</h1><p class="doc-number">${esc(state.number)}</p><div class="doc-accentbar"></div>
<div class="doc-row doc-parties">${toBlock()}${facts()}</div>
${table(t)}${totalsBlock(t)}${notesBlock(false)}${signBlock()}${foot()}</div>`;
  },
  ledger(t) {
    return `<div class="doc-in"><div class="doc-row" style="align-items:center">${logo()}${kind()}</div><div class="doc-ledger-rule"></div>
<div class="doc-row doc-parties">${fromBlock()}${toBlock()}<div>${facts()}</div></div>
${table(t)}${totalsBlock(t)}${notesBlock()}${signBlock()}${foot()}</div>`;
  },
  frame(t) {
    return `<div class="doc-frame" aria-hidden="true"></div><div class="doc-in"><div class="doc-frame-head">${logo()}<div class="doc-frame-rule"></div>${kind("center")}</div>${body(t)}</div>`;
  },
  column(t) {
    const [label, value] = headline(t);
    return `<div class="doc-in"><div class="doc-row" style="align-items:flex-end">${logo()}${kind()}</div>
<div class="doc-col"><div class="doc-col-main">${table(t)}${totalsBlock(t)}${notesBlock(false)}${signBlock()}</div>
<aside class="doc-col-side"><p class="doc-label">${label}</p><p class="doc-col-big">${value}</p>${facts()}${toBlock()}${fromBlock()}${payBlock()}</aside></div>${foot()}</div>`;
  },
  stripe(t) {
    return `<div class="doc-stripe" aria-hidden="true"><span></span></div><div class="doc-in"><div class="doc-row" style="align-items:flex-start">${kind("left")}${logo()}</div>${body(t)}</div>`;
  },
  letterhead(t) {
    const f = state.from;
    const line = [f.address.replace(/\n/g, ", "), f.phone, f.email].filter((v) => v && v.trim()).join("  ·  ");
    return `<div class="doc-in"><div class="doc-lh">${logo()}<p class="doc-lh-line">${esc(line)}</p></div>
<div class="doc-lh-title"><span></span><h1 class="doc-kind">${KIND.title}</h1><span></span></div><p class="doc-number" style="text-align:center">${esc(state.number)}</p>
<div class="doc-row doc-parties">${toBlock()}${facts()}</div>
${table(t)}${totalsBlock(t)}${notesBlock()}${signBlock()}${foot()}</div>`;
  },
  corner(t) {
    const c = colors();
    return `<svg class="doc-corner" viewBox="0 0 300 300" aria-hidden="true"><path d="M300 0V300A300 300 0 0 1 0 0Z" fill="${c.main}"/><path d="M300 238A238 238 0 0 1 62 0" fill="none" stroke="${c.accent}" stroke-width="5"/></svg>
<div class="doc-corner-mark">${logo(true)}</div><div class="doc-in"><div class="doc-corner-title">${kind("left")}</div>${body(t)}</div>`;
  },
  hairline(t) {
    return `<div class="doc-in"><div class="doc-row" style="align-items:center">${logo()}<div class="doc-hl-kind"><h1 class="doc-kind">${KIND.title}</h1><p class="doc-number">${esc(state.number)}</p></div></div><div class="doc-hl-rule"></div>${body(t)}</div>`;
  },
  poster(t) {
    return `<div class="doc-in"><div class="doc-row" style="align-items:flex-start">${logo()}<p class="doc-number">${esc(state.number)}</p></div><h1 class="doc-kind doc-poster-kind">${KIND.title}</h1><div class="doc-poster-bar"></div>${body(t)}</div>`;
  },
  seal(t) {
    const c = colors();
    const art = ownLogo()
      ? logo()
      : `<svg class="doc-seal" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="${c.main}"/><circle cx="60" cy="60" r="47" fill="none" stroke="${c.accent}" stroke-width="2"/><g transform="translate(25 39) scale(0.11)"><path fill="#FFFFFF" d="${W_PATH}"/><g fill="${c.accent}">${R_PATHS}</g></g></svg>`;
    return `<div class="doc-in"><div class="doc-seal-row">${art}<div><p class="doc-seal-name" style="color:${c.main}">NEW CONCEPT SECURITY</p>${tagline()}</div>${kind()}</div>${body(t)}</div>`;
  },
  ribbon(t) {
    const c = colors();
    return `<svg class="doc-ribbon" viewBox="0 0 200 200" aria-hidden="true"><polygon points="60,0 110,0 200,90 200,140" fill="${c.main}"/><polygon points="118,0 128,0 200,72 200,82" fill="${c.accent}"/></svg><div class="doc-in"><div class="doc-row" style="align-items:center;padding-right:110px">${logo()}${kind()}</div>${body(t)}</div>`;
  },
  banner(t) {
    const c = colors();
    const brand = ownLogo()
      ? logo()
      : `<div class="doc-logo"><svg viewBox="0 0 420 420" aria-hidden="true"><path fill="${c.main}" d="${W_PATH}"/><g fill="#FFFFFF">${R_PATHS}</g></svg><div class="doc-logo-name" style="color:${c.main}"><span class="ncs-word"><b>NEW</b><span>CONCEPT</span></span><small style="color:${c.main};opacity:0.7">SECURITY</small>${tagline()}</div></div>`;
    return `<div class="doc-banner" style="background:${c.accent}"><div class="doc-row" style="align-items:center">${brand}${kind()}</div></div><div class="doc-banner-rule" style="background:${c.main}"></div><div class="doc-in">${body(t)}</div>`;
  },
  elegant(t) {
    return `<div class="doc-in"><div class="doc-eleg">${logo()}<div class="doc-eleg-rule"></div>${kind("center")}<div class="doc-eleg-rule"></div></div>${body(t)}</div>`;
  },
  block(t) {
    return `<div class="doc-blk"><div class="doc-blk-fill">${kind("left")}</div><div class="doc-blk-logo">${logo()}</div></div><div class="doc-in">${body(t)}</div>`;
  },
  underline(t) {
    return `<div class="doc-in"><div class="doc-row" style="align-items:flex-start">${kind("left")}${logo()}</div><div class="doc-ul-bar"></div>${body(t)}</div>`;
  },
  tab(t) {
    return `<div class="doc-tab-row"><div class="doc-tab">${kind("left")}</div><div class="doc-tab-logo">${logo()}</div></div><div class="doc-tab-line"></div><div class="doc-in doc-tab-in">${body(t)}</div>`;
  },
  grid(t) {
    const c = colors();
    const id = `gd${(svgIds += 1)}`;
    return `<div class="doc-gridhead"><svg class="doc-gridhead-art" viewBox="0 0 800 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${c.main}" stroke-opacity="0.12" stroke-width="1"/></pattern></defs><rect width="800" height="170" fill="${mixHex(c.main, "#FFFFFF", 0.93)}"/><rect width="800" height="170" fill="url(#${id})"/></svg><div class="doc-gridhead-in"><div class="doc-row" style="align-items:center">${logo()}${kind()}</div></div></div><div class="doc-in">${body(t)}</div>`;
  },
  compact(t) {
    return `<div class="doc-in"><div class="doc-row">${logo()}<div><h1 class="doc-kind">${KIND.title}</h1><p class="doc-number">${esc(state.number)}</p></div></div>
<div class="doc-row doc-parties">${fromBlock()}${toBlock()}${facts()}</div>
${table(t)}${totalsBlock(t)}${notesBlock()}${signBlock()}${foot()}</div>`;
  },
};

function thermal(t) {
  const f = state.from;
  const line = (a, b, cls = "") => `<div class="doc-line ${cls}"><span>${a}</span><span>${b}</span></div>`;
  const items = t.lines
    .filter((l) => l.desc || l.amount)
    .map((l) => `<div class="doc-item">${line(esc(l.desc), money(l.amount))}<small>${qty(num(l.qty))} ${esc(l.unit || "")} × ${money(num(l.rate))}</small></div>`)
    .join('<div style="height:6px"></div>');
  let sums = line("Subtotal", money(t.subtotal));
  if (t.discount > 0) sums += line("Discount", `−${money(t.discount)}`);
  if (t.tax > 0) sums += line(esc(state.taxLabel), money(t.tax));
  if (t.other) sums += line(esc(state.otherLabel), money(t.other));
  sums += line("TOTAL", money(t.total), "is-grand");
  return `<div class="doc-in">${logo()}<p style="margin-top:8px">${esc(f.name)}</p><p class="doc-block" style="color:#6e6e73">${esc([f.address, f.phone].filter(Boolean).join("\n"))}</p>
<div class="doc-cut"></div><p style="font-weight:700;letter-spacing:0.12em">${KIND.title.toUpperCase()}</p>
${line("No.", esc(state.number))}${line("Date", esc(fmtDate(state.date)))}${state.reference ? line("Ref", esc(state.reference)) : ""}${line("Customer", esc(state.to.name))}
<div class="doc-cut"></div>${items}<div class="doc-cut"></div>${sums}
<div class="doc-cut"></div>${line("Paid by", esc(state.method))}${state.txn ? line("Transaction", esc(state.txn)) : ""}${line("Amount paid", money(t.paid))}${Math.abs(t.due) > 0.004 ? line("Balance", money(t.due)) : ""}
<div class="doc-cut"></div><p>${esc(state.notes || "Thank you.")}</p><p style="margin-top:6px;color:#6e6e73">${esc(f.web)}</p></div>`;
}

function docHtml() {
  const t = totals();
  let paper = PAGES[state.paper] ? state.paper : "letter";
  if (paper === "thermal" && TYPE !== "receipt") paper = "letter";
  const c = colors();
  const tint = mixHex(state.accent, "#FFFFFF", 0.9);
  const style = `--a:${c.main};--a2:${c.accent};--ink:${c.ink};--page:${c.page};--tint:${tint};--doc-font:'${state.font}';--logo-h:${((40 * num(state.logoScale || 100)) / 100).toFixed(1)}px`;
  if (paper === "thermal") {
    return `<article class="doc is-thermal" style="${style}">${thermal(t)}</article>`;
  }
  const layout = LAYOUTS[state.template] || LAYOUTS.classic;
  return `<article class="doc is-${paper} t-${state.template}${TYPE === "timesheet" ? ` is-tsdoc is-f-${state.format}` : ""}" style="${style}">${layout(t)}</article>`;
}

function mixHex(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const x = p(a);
  const y = p(b);
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

/* ---------- Template thumbnails ---------- */

function thumb(id) {
  const a = state.accent;
  const g = state.accent2;
  const lines = (x, y, n, w = 50) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * 7}" width="${w}" height="2.5" rx="1" fill="#d2d2d7"/>`).join("");
  const art = {
    classic: `<rect width="71" height="4" fill="${a}"/><rect x="50" y="4" width="21" height="4" fill="${g}"/><rect x="7" y="12" width="9" height="6" fill="${a}"/><rect x="44" y="12" width="20" height="5" fill="${a}"/>${lines(7, 28, 3, 18)}${lines(30, 28, 3, 16)}<rect x="7" y="52" width="57" height="1.5" fill="${a}"/>${lines(7, 58, 5, 57)}<rect x="40" y="94" width="24" height="4" fill="#1d1d1f"/>`,
    modern: `<rect width="71" height="22" fill="${a}"/><rect y="22" width="71" height="2.5" fill="${g}"/><rect x="7" y="8" width="9" height="6" fill="#fff"/><rect x="44" y="8" width="20" height="5" fill="#fff"/>${lines(7, 32, 3, 18)}${lines(36, 32, 3, 16)}<rect x="7" y="54" width="57" height="5" fill="${mixHex(a, "#FFFFFF", 0.85)}"/>${lines(7, 63, 4, 57)}<rect x="40" y="94" width="24" height="4" fill="#1d1d1f"/>`,
    minimal: `<rect x="7" y="9" width="26" height="7" fill="#1d1d1f" opacity="0.75"/><rect x="55" y="9" width="9" height="6" fill="${a}"/>${lines(7, 28, 3, 18)}${lines(30, 28, 3, 16)}${lines(7, 56, 5, 57)}<rect x="40" y="94" width="24" height="3" fill="#86868b"/>`,
    sidebar: `<rect width="22" height="100" fill="${a}"/><rect x="5" y="8" width="11" height="7" fill="#fff"/>${Array.from({ length: 4 }, (_, i) => `<rect x="5" y="${24 + i * 7}" width="12" height="2.5" rx="1" fill="#ffffff" opacity="0.5"/>`).join("")}<rect x="28" y="9" width="22" height="6" fill="${a}"/><rect x="28" y="19" width="8" height="2" fill="${g}"/>${lines(28, 30, 3, 16)}${lines(28, 54, 5, 37)}<rect x="45" y="92" width="20" height="4" fill="#1d1d1f"/>`,
    monogram: `<rect width="3" height="100" fill="${g}"/><path d="M40 4h40v34H40z" fill="${a}" opacity="0.06"/><rect x="8" y="9" width="8" height="5" fill="${a}"/><rect x="8" y="17" width="18" height="3" fill="#1d1d1f"/><rect x="46" y="10" width="18" height="5" fill="${a}"/>${lines(8, 30, 3, 18)}${lines(32, 30, 3, 16)}${lines(8, 54, 5, 56)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    split: `<rect width="27" height="22" fill="${a}"/><rect x="27" width="2" height="22" fill="${g}"/><rect x="9" y="8" width="10" height="6" fill="#fff"/><rect x="34" y="7" width="20" height="5" fill="${a}"/><rect x="34" y="15" width="24" height="2" fill="#86868b"/>${lines(7, 30, 3, 18)}${lines(30, 30, 3, 16)}${lines(7, 54, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    diagonal: `<polygon points="0,0 40,0 33,22 0,22" fill="${a}"/><polygon points="41,0 43,0 36,22 34,22" fill="${g}"/><rect x="7" y="8" width="10" height="6" fill="#fff"/><rect x="46" y="8" width="18" height="5" fill="${a}"/>${lines(7, 30, 3, 18)}${lines(30, 30, 3, 16)}${lines(7, 54, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    executive: `<rect width="71" height="24" fill="${a}"/><rect x="7" y="6" width="5" height="3" fill="#fff"/><rect x="7" y="12" width="22" height="5" fill="#fff"/><rect x="7" y="19" width="8" height="1.5" fill="${g}"/><rect x="48" y="9" width="17" height="5" fill="${g}"/>${lines(7, 32, 3, 18)}${lines(30, 32, 3, 16)}${lines(7, 56, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    badge: `<path d="M29 5h13v8c0 6-3 9-6.5 10.5C32 22 29 19 29 13z" fill="none" stroke="${g}" stroke-width="1.4"/><rect x="31.5" y="9" width="8" height="5" fill="${a}"/><rect x="25" y="27" width="21" height="4" fill="${a}"/>${lines(7, 37, 3, 18)}${lines(30, 37, 3, 16)}${lines(7, 58, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    hivis: `<rect width="71" height="18" fill="${a}"/><rect y="19" width="71" height="3" fill="${g}"/><rect y="23.5" width="71" height="3" fill="${g}"/><rect x="7" y="6" width="10" height="6" fill="#fff"/><rect x="46" y="6" width="18" height="5" fill="#fff"/>${lines(7, 33, 3, 18)}${lines(30, 33, 3, 16)}${lines(7, 56, 5, 57)}<rect y="97" width="71" height="3" fill="${g}"/>`,
    blueprint: `<rect width="71" height="22" fill="${a}"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 8}" width="0.4" height="22" fill="#fff" opacity="0.3"/>`).join("")}<rect x="40" y="5" width="20" height="12" fill="none" stroke="${g}" stroke-width="0.8" stroke-dasharray="2 1.5"/><rect x="7" y="8" width="10" height="6" fill="#fff"/>${lines(7, 30, 3, 18)}${lines(30, 30, 3, 16)}${lines(7, 54, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    night: `<rect width="71" height="24" fill="#0b1a2a"/><circle cx="60" cy="7" r="3" fill="${g}"/><circle cx="61" cy="6.3" r="2.8" fill="#0b1a2a"/><rect y="21" width="71" height="3" fill="#02080f"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 6}" y="17" width="0.6" height="5" fill="#02080f"/>`).join("")}<rect x="7" y="7" width="10" height="6" fill="#fff"/>${lines(7, 32, 3, 18)}${lines(30, 32, 3, 16)}${lines(7, 56, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    wordmark: `<rect x="7" y="8" width="34" height="9" fill="${a}"/><circle cx="44" cy="15" r="2" fill="${g}"/><rect x="48" y="11" width="16" height="5" fill="${a}"/><rect x="7" y="21" width="57" height="1.2" fill="${a}"/>${lines(7, 30, 3, 18)}${lines(30, 30, 3, 16)}${lines(7, 54, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    ledger: `<rect x="7" y="9" width="9" height="6" fill="${a}"/><rect x="44" y="10" width="20" height="3" fill="${a}"/><rect x="7" y="20" width="57" height="0.8" fill="${a}"/><rect x="7" y="25" width="57" height="14" fill="none" stroke="#d2d2d7" stroke-width="0.6"/><rect x="26" y="25" width="0.6" height="14" fill="#d2d2d7"/><rect x="45" y="25" width="0.6" height="14" fill="#d2d2d7"/>${Array.from({ length: 6 }, (_, i) => `<rect x="7" y="${46 + i * 6}" width="57" height="4" fill="${i % 2 ? "#ffffff" : mixHex(a, "#FFFFFF", 0.88)}"/>`).join("")}<rect x="40" y="88" width="24" height="4" fill="#1d1d1f"/>`,
    frame: `<rect x="3.5" y="3.5" width="64" height="93" fill="none" stroke="${a}" stroke-width="0.9"/><rect x="5.5" y="5.5" width="60" height="89" fill="none" stroke="${g}" stroke-width="0.5"/><rect x="31" y="10" width="9" height="6" fill="${a}"/><rect x="27" y="19" width="17" height="0.6" fill="${g}"/><rect x="24" y="22" width="23" height="4" fill="${a}"/>${lines(10, 33, 3, 16)}${lines(36, 33, 3, 16)}${lines(10, 56, 4, 51)}<rect x="38" y="84" width="23" height="4" fill="#1d1d1f"/>`,
    column: `<rect x="7" y="8" width="9" height="6" fill="${a}"/><rect x="44" y="9" width="20" height="4" fill="${a}"/><rect x="46" y="22" width="19" height="66" fill="${mixHex(a, "#FFFFFF", 0.9)}"/><rect x="49" y="26" width="10" height="2" fill="#86868b"/><rect x="49" y="30" width="13" height="4" fill="${a}"/>${lines(49, 40, 6, 12)}${lines(7, 24, 7, 35)}<rect x="22" y="78" width="20" height="4" fill="#1d1d1f"/>`,
    stripe: `<rect width="4" height="100" fill="${a}"/><rect x="4" width="1" height="100" fill="${g}"/><rect x="11" y="9" width="24" height="6" fill="${a}"/><rect x="11" y="18" width="12" height="2" fill="#86868b"/><rect x="55" y="9" width="9" height="6" fill="${a}"/>${lines(11, 30, 3, 16)}${lines(36, 30, 3, 16)}${lines(11, 54, 5, 53)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    letterhead: `<rect x="31" y="6" width="9" height="6" fill="${a}"/><rect x="18" y="14" width="35" height="1.6" fill="#86868b"/><rect x="7" y="22" width="18" height="0.6" fill="${g}"/><rect x="46" y="22" width="18" height="0.6" fill="${g}"/><rect x="27" y="20" width="17" height="4" fill="${a}"/>${lines(7, 32, 3, 18)}${lines(40, 32, 3, 24)}${lines(7, 54, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    corner: `<path d="M71 0V26A26 26 0 0 1 45 0Z" fill="${a}"/><path d="M71 21A21 21 0 0 1 50 0" fill="none" stroke="${g}" stroke-width="0.8"/><rect x="58" y="5" width="8" height="5" fill="#fff"/><rect x="7" y="12" width="24" height="6" fill="${a}"/><rect x="7" y="21" width="12" height="2" fill="#86868b"/>${lines(7, 32, 3, 18)}${lines(30, 32, 3, 16)}${lines(7, 54, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    hairline: `<rect x="7" y="9" width="9" height="5" fill="${a}"/><rect x="46" y="10" width="18" height="2" fill="#1d1d1f"/><rect x="7" y="19" width="57" height="0.4" fill="#1d1d1f"/>${lines(7, 28, 3, 18)}${lines(30, 28, 3, 16)}${Array.from({ length: 5 }, (_, i) => `<rect x="7" y="${54 + i * 6}" width="57" height="0.3" fill="#86868b"/>`).join("")}${lines(7, 56, 5, 57)}<rect x="44" y="92" width="20" height="3" fill="#1d1d1f"/>`,
    poster: `<rect x="7" y="7" width="8" height="5" fill="${a}"/><rect x="7" y="16" width="44" height="12" fill="${a}"/><rect x="7" y="30" width="16" height="2.5" fill="${g}"/>${lines(7, 38, 3, 18)}${lines(30, 38, 3, 16)}${lines(7, 60, 4, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    seal: `<circle cx="13" cy="13" r="7" fill="${a}"/><circle cx="13" cy="13" r="5.6" fill="none" stroke="${g}" stroke-width="0.5"/><rect x="23" y="11" width="18" height="2" fill="${a}"/><rect x="46" y="9" width="18" height="5" fill="${a}"/>${lines(7, 28, 3, 18)}${lines(30, 28, 3, 16)}${lines(7, 52, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    ribbon: `<polygon points="42,0 52,0 71,19 71,29" fill="${a}"/><polygon points="54,0 56,0 71,15 71,17" fill="${g}"/><rect x="7" y="9" width="9" height="6" fill="${a}"/><rect x="24" y="10" width="16" height="4" fill="${a}"/>${lines(7, 30, 3, 18)}${lines(30, 30, 3, 16)}${lines(7, 54, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    banner: `<rect width="71" height="22" fill="${g}"/><rect y="22" width="71" height="2" fill="${a}"/><rect x="7" y="8" width="9" height="6" fill="${a}"/><rect x="44" y="8" width="20" height="5" fill="${a}"/>${lines(7, 32, 3, 18)}${lines(30, 32, 3, 16)}${lines(7, 56, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    elegant: `<rect x="31" y="5" width="9" height="6" fill="${a}"/><rect x="10" y="14" width="51" height="1.2" fill="${g}"/><rect x="10" y="15.8" width="51" height="0.5" fill="${g}"/><rect x="24" y="18" width="23" height="4" fill="${a}" rx="2"/><rect x="10" y="25" width="51" height="1.2" fill="${g}"/>${lines(7, 33, 3, 18)}${lines(30, 33, 3, 16)}${lines(7, 56, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    block: `<rect width="42" height="24" fill="${a}"/><rect y="24" width="42" height="2" fill="${g}"/><rect x="7" y="9" width="22" height="5" fill="#fff"/><rect x="7" y="17" width="10" height="2" fill="#fff" opacity="0.6"/><rect x="52" y="9" width="11" height="6" fill="${a}"/>${lines(7, 33, 3, 18)}${lines(30, 33, 3, 16)}${lines(7, 56, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    underline: `<rect x="7" y="8" width="30" height="8" fill="${a}"/><rect x="7" y="19" width="12" height="2" fill="#86868b"/><rect x="7" y="24" width="14" height="2.5" fill="${g}"/><rect x="55" y="8" width="9" height="6" fill="${a}"/>${lines(7, 33, 3, 18)}${lines(30, 33, 3, 16)}${lines(7, 56, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    tab: `<rect x="7" y="7" width="26" height="13" rx="2" fill="${a}"/><rect x="7" y="18" width="26" height="2" fill="${a}"/><rect x="10" y="10" width="17" height="4" fill="#fff"/><rect x="7" y="20" width="57" height="1.2" fill="${a}"/><rect x="55" y="11" width="9" height="6" fill="${a}"/>${lines(7, 30, 3, 18)}${lines(30, 30, 3, 16)}${lines(7, 54, 5, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    grid: `<rect width="71" height="22" fill="${mixHex(a, "#FFFFFF", 0.9)}"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 9}" width="0.4" height="22" fill="${a}" opacity="0.25"/>`).join("")}${Array.from({ length: 3 }, (_, i) => `<rect y="${i * 8}" width="71" height="0.4" fill="${a}" opacity="0.25"/>`).join("")}<rect y="22" width="71" height="1" fill="${a}"/><rect x="7" y="8" width="9" height="6" fill="${a}"/><rect x="44" y="8" width="20" height="5" fill="${a}"/>${lines(7, 30, 3, 18)}${lines(30, 30, 3, 16)}<rect x="7" y="52" width="57" height="4" fill="${a}"/>${lines(7, 59, 4, 57)}<rect x="40" y="92" width="24" height="4" fill="#1d1d1f"/>`,
    compact: `<rect x="6" y="7" width="8" height="5" fill="${a}"/><rect x="48" y="7" width="17" height="4" fill="${a}"/>${lines(6, 20, 2, 18)}${lines(30, 20, 2, 16)}<rect x="6" y="36" width="59" height="5" fill="${a}"/>${Array.from({ length: 8 }, (_, i) => `<rect x="6" y="${44 + i * 5.5}" width="59" height="3" fill="${i % 2 ? "#f0f0f2" : "#e2e2e6"}"/>`).join("")}<rect x="44" y="92" width="21" height="3.5" fill="#1d1d1f"/>`,
  }[id];
  const page = colors().page;
  return `<svg viewBox="0 0 71 100" aria-hidden="true"><rect width="71" height="100" fill="${page}"/>${art}</svg>`;
}

function formatThumb(id) {
  const a = state.accent;
  const row = (y, cells, w) => cells.map((x, i) => `<rect x="${x}" y="${y}" width="${w[i]}" height="2.4" rx="0.8" fill="#d2d2d7"/>`).join("");
  let art = "";
  if (id === "log") {
    art = `<rect x="5" y="6" width="61" height="4" fill="${a}"/>${Array.from({ length: 7 }, (_, i) => row(14 + i * 5.5, [5, 18, 34, 50], [10, 12, 12, 14])).join("")}`;
  } else if (id === "grid") {
    art = `<rect x="5" y="6" width="61" height="4" fill="${a}"/>${Array.from({ length: 5 }, (_, i) => `<rect x="5" y="${14 + i * 6}" width="12" height="2.4" rx="0.8" fill="#d2d2d7"/>${Array.from({ length: 7 }, (_, j) => `<rect x="${20 + j * 6.4}" y="${13 + i * 6}" width="5" height="4.4" fill="${(i + j) % 3 ? mixHex(a, "#FFFFFF", 0.82) : "#f0f0f2"}"/>`).join("")}`).join("")}`;
  } else if (id === "signin") {
    art = `<rect x="5" y="6" width="61" height="4" fill="${a}"/>${Array.from({ length: 7 }, (_, i) => `<rect x="5" y="${14 + i * 5.6}" width="61" height="0.6" fill="#b0b0b8"/>`).join("")}<path d="M30 20c3-3 5 2 8-1s4 1 6 0" stroke="${a}" stroke-width="0.8" fill="none"/>`;
  } else {
    art = `<rect x="5" y="6" width="61" height="4" fill="${a}"/><rect x="5" y="13" width="61" height="3.5" fill="${mixHex(a, "#FFFFFF", 0.82)}"/>${row(19, [7, 22, 50], [12, 18, 14])}${row(24, [7, 22, 50], [12, 18, 14])}<rect x="5" y="29" width="61" height="3.5" fill="${mixHex(a, "#FFFFFF", 0.82)}"/>${row(35, [7, 22, 50], [12, 18, 14])}${row(40, [7, 22, 50], [12, 18, 14])}`;
  }
  return `<svg viewBox="0 0 71 48" aria-hidden="true"><rect width="71" height="48" fill="#fff"/>${art}</svg>`;
}

/* ---------- The editor ---------- */

const field = (label, key, type = "text", extra = "") =>
  `<label class="dc-field${extra.includes("wide") ? " is-wide" : ""}">${label}${
    type === "textarea"
      ? `<textarea data-k="${key}" rows="3"></textarea>`
      : `<input type="${type}" data-k="${key}"${type === "number" ? ' step="any" inputmode="decimal"' : ""}>`
  }</label>`;

const select = (label, key, options, extra = "") =>
  `<label class="dc-field${extra.includes("wide") ? " is-wide" : ""}">${label}<select data-k="${key}">${options.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join("")}</select></label>`;

const check = (label, key) => `<label class="dc-check"><input type="checkbox" data-k="${key}"> ${label}</label>`;

/* Five styles up front (this document's own first), the rest in a list. */
function featured() {
  const own = defaults().template;
  return [...new Set([own, "classic", "modern", "minimal", "column", "letterhead", "executive"])].slice(0, 5);
}

function designCard(papers, stamps) {
  const swatches = Object.entries(PALETTES)
    .map(([id, p]) => `<label class="dc-swatch" title="${p.label}"><input type="radio" name="dc-palette" value="${id}" data-palette aria-label="${p.label}"><span style="background:linear-gradient(160deg, ${p.swatch[0]}, ${p.swatch[1]})"></span></label>`)
    .join("");
  const qrs = [["none", "None"], ["web", "Website"]];
  if (BILL) qrs.push(["pay", "Payment link"]);
  return `<section class="dc-card"><h2>Design <button class="dc-link" type="button" data-match-card>Match my business card</button></h2>
  <p class="dc-sub">Featured</p>
  <div class="dc-templates is-featured">${featured()
    .map((id) => `<button class="dc-template" type="button" data-template="${id}" aria-pressed="false"><span class="dc-template-art" data-thumb="${id}"></span>${TEMPLATES[id]}</button>`)
    .join("")}</div>
  <details class="dc-more"${featured().includes(state.template) ? "" : " open"}><summary>More styles <small>${Object.keys(TEMPLATES).length - 5}</small></summary>
  <div class="dc-more-list">${Object.keys(TEMPLATES)
    .filter((id) => !featured().includes(id))
    .map((id) => `<button class="dc-template is-mini" type="button" data-template="${id}" aria-pressed="false"><span class="dc-template-art" data-thumb="${id}"></span><span>${TEMPLATES[id]}</span></button>`)
    .join("")}</div></details>
  <p class="dc-sub">Colour <span data-palette-name></span></p>
  <div class="dc-swatches">${swatches}<label class="dc-swatch" title="Custom colours"><input type="radio" name="dc-palette" value="custom" data-palette aria-label="Custom colours"><span class="is-custom"></span></label></div>
  <div class="dc-grid">
    <label class="dc-field">Main colour<input type="color" data-k="accent"></label>
    <label class="dc-field">Accent<input type="color" data-k="accent2"></label>
    ${select("Font", "font", FONTS.map((f) => [f, f]))}
    ${select("Paper", "paper", papers)}
    ${select("Currency", "currency", Object.keys(CURRENCIES).map((c) => [c, c]))}
    ${stamps}
    <label class="dc-field">Logo size · <span data-logo-size></span><input type="range" min="60" max="160" step="5" data-k="logoScale"></label>
    ${select("QR code", "qr", qrs)}
  </div>
  <div class="dc-tagline">${check("Tagline under the logo", "showTagline")}<label class="dc-field">Tagline<input data-k="tagline" maxlength="60"></label></div>
</section>`;
}

function tsEditorHtml() {
  const days = DAYS.map((d, i) => `<label class="dc-check dc-day"><input type="checkbox" data-k="gen.days.${i}"> ${d}</label>`).join("");
  const types = [["auto", "Auto (night, weekend)"], ...Object.entries(RATE_TYPES)];
  return `
<section class="dc-card"><h2>Timesheet template</h2>
  <div class="dc-formats">${Object.entries(FORMATS)
    .map(([id, name]) => `<button class="dc-format" type="button" data-format="${id}" aria-pressed="false"><span class="dc-format-art" data-format-thumb="${id}"></span><span>${name}</span></button>`)
    .join("")}</div>
  <div class="dc-grid" data-signin-options>
    ${field("Blank rows to fill in", "blankRows", "number")}
    <div class="dc-field" style="align-self:end">${check("Print the planned shifts", "signinPrefill")}</div>
  </div>
</section>

${designCard(["letter", "a4", "letterl", "a4l"].map((k) => [k, PAGES[k].label]), select("Stamp", "stamp", [["none", "None"], ["approved", "Approved"], ["draft", "Draft"]]))}

<section class="dc-card"><h2>Period</h2>
  <div class="dc-grid">
    ${field("Timesheet number", "number")}
    ${field("Issued", "date", "date")}
    ${field("Period starts", "periodStart", "date")}
    ${field("Period ends", "periodEnd", "date")}
    ${field("Site or post", "site", "text", "wide")}
    ${field("PO / reference", "reference")}
  </div>
  <div class="dc-quick">
    <span>Quick period:</span>
    <button class="dc-link" type="button" data-period="week">This week</button>
    <button class="dc-link" type="button" data-period="next">Next week</button>
    <button class="dc-link" type="button" data-period="fortnight">Two weeks</button>
    <button class="dc-link" type="button" data-period="month">This month</button>
  </div>
</section>

<section class="dc-card"><h2>Generate shifts <small>fills the period from a pattern</small></h2>
  <div class="dc-grid">
    ${field("Officers (one per line)", "gen.officers", "textarea", "wide")}
    ${field("Post", "gen.post")}
    ${select("Rate", "gen.type", types)}
    ${field("Start", "gen.start", "time")}
    ${field("End", "gen.end", "time")}
    ${field("Unpaid break (minutes)", "gen.brk", "number")}
    ${select("When generating", "gen.mode", [["add", "Add to the sheet"], ["replace", "Replace the sheet"]])}
  </div>
  <div class="dc-days">${days}</div>
  <button class="ds-btn is-solid dc-generate" type="button" data-generate>Generate shifts</button>
</section>

<section class="dc-card"><h2>Shifts <small data-item-count></small></h2>
  <div class="dc-items" data-items></div>
  <button class="dc-add" type="button" data-add>+ Add a shift</button>
  <button class="dc-link" type="button" data-sort style="margin-top:0.75rem">Sort by date and time</button>
</section>

<section class="dc-card"><h2>Rates <small>per hour</small></h2>
  <div class="dc-grid">
    ${Object.entries(RATE_TYPES).map(([k, label]) => field(label, `rates.${k}`, "number")).join("")}
  </div>
  <div style="margin-top:0.9rem;display:grid;gap:0.6rem">
    ${check("Show rates and cost on the timesheet", "showRates")}
    ${check("Signature lines for officer, supervisor and client", "signature")}
  </div>
  <button class="ds-btn is-outline dc-generate" type="button" data-to-invoice>Make an invoice from these hours</button>
</section>

<section class="dc-card"><h2>Your business</h2>
  <div class="dc-grid">
    ${field("Business name", "from.name", "text", "wide")}
    ${field("Address", "from.address", "textarea", "wide")}
    ${field("Phone", "from.phone")}
    ${field("Email", "from.email", "email")}
  </div>
  <div class="dc-logo-row">
    ${check("Show logo", "showLogo")}
    <button class="ds-btn is-outline" type="button" data-upload>Upload a logo</button>
    <button class="dc-link" type="button" data-default-logo>Use the NCS mark</button>
    <input type="file" accept="image/*" data-logo-file hidden>
  </div>
</section>

<section class="dc-card"><h2>Client and site</h2>
  <div class="dc-grid">
    ${field("Client", "to.name", "text", "wide")}
    ${field("Contact", "to.contact")}
    ${field("Email", "to.email", "email")}
    ${field("Site address", "to.address", "textarea", "wide")}
  </div>
</section>

<section class="dc-card"><h2>Notes</h2>
  <div class="dc-grid">${field("Notes", "notes", "textarea", "wide")}</div>
</section>

<section class="dc-card"><h2>Saved timesheets <small>in this browser</small></h2>
  <div class="dc-saved" data-saved></div>
</section>`;
}

function editorHtml() {
  if (TYPE === "timesheet") return tsEditorHtml();
  const second = KIND.second ? field(KIND.second.label, KIND.second.key, "date") : "";
  const papers = TYPE === "receipt" ? Object.entries(PAGES).map(([k, p]) => [k, p.label]) : [["a4", "A4"], ["letter", "Letter"]];
  const stamps = {
    invoice: [["none", "None"], ["paid", "Paid"], ["overdue", "Overdue"], ["draft", "Draft"]],
    quote: [["none", "None"], ["accepted", "Accepted"], ["draft", "Draft"]],
    receipt: [["paid", "Paid"], ["none", "None"]],
    credit: [["none", "None"], ["credited", "Credited"], ["draft", "Draft"]],
    po: [["none", "None"], ["approved", "Approved"], ["draft", "Draft"]],
    statement: [["none", "None"], ["overdue", "Overdue"]],
    proforma: [["none", "None"], ["paid", "Paid"], ["draft", "Draft"]],
    debit: [["none", "None"], ["paid", "Paid"], ["overdue", "Overdue"], ["draft", "Draft"]],
    delivery: [["none", "None"], ["delivered", "Delivered"], ["draft", "Draft"]],
    remittance: [["paid", "Paid"], ["none", "None"]],
    jobsheet: [["none", "None"], ["completed", "Completed"], ["draft", "Draft"]],
    payslip: [["none", "None"], ["paid", "Paid"]],
  };
  const status = select("Stamp", "stamp", stamps[TYPE]);
  const receiptBits =
    TYPE === "receipt"
      ? `${select("Payment method", "method", ["Card", "Bank transfer", "Cash", "Cheque", "Direct debit", "Online payment"].map((m) => [m, m]))}${field("Transaction reference", "txn")}`
      : "";
  return `
${designCard(papers, status)}

<section class="dc-card"><h2>Details</h2>
  <div class="dc-grid">
    ${field(`${KIND.title} number`, "number")}
    ${field(KIND.date, "date", "date")}
    ${second}
    ${field(REF_LABEL, "reference")}
    ${receiptBits}
  </div>
  ${TYPE === "receipt" ? `<div style="margin-top:0.9rem">${check("Paid in full", "paidInFull")}</div>` : ""}
  ${["quote", "po", "delivery", "jobsheet"].includes(TYPE) ? `<div style="margin-top:0.9rem">${check({ po: "Signature block for authorising", delivery: "Signature block for receiving", jobsheet: "Signature block for signing off" }[TYPE] || "Signature block for acceptance", "signature")}</div>` : ""}
</section>

<section class="dc-card"><h2>Your business</h2>
  <div class="dc-grid">
    ${field("Business name", "from.name", "text", "wide")}
    ${field("Address", "from.address", "textarea", "wide")}
    ${field("Phone", "from.phone")}
    ${field("Email", "from.email", "email")}
    ${field("Website", "from.web")}
    ${field("Company, VAT or SIA numbers", "from.taxId")}
  </div>
  <div class="dc-logo-row">
    ${check("Show logo", "showLogo")}
    <button class="ds-btn is-outline" type="button" data-upload>Upload a logo</button>
    <button class="dc-link" type="button" data-default-logo>Use the NCS mark</button>
    <input type="file" accept="image/*" data-logo-file hidden>
  </div>
</section>

<section class="dc-card"><h2>${KIND.to}</h2>
  <div class="dc-grid">
    ${field("Company or name", "to.name", "text", "wide")}
    ${field("Contact", "to.contact")}
    ${field("Email", "to.email", "email")}
    ${field("Address", "to.address", "textarea", "wide")}
  </div>
</section>

<section class="dc-card"><h2>Items <small data-item-count></small></h2>
  <div class="dc-items" data-items></div>
  <button class="dc-add" type="button" data-add>+ Add a line</button>
</section>

<section class="dc-card"><h2>Totals</h2>
  <div class="dc-grid">
    ${field("Tax name", "taxLabel")}
    ${field("Tax % for new lines", "taxRate", "number")}
    ${select("Discount", "discountType", [["percent", "Percent"], ["amount", "Amount"]])}
    ${field("Discount value", "discount", "number")}
    ${field("Other charges label", "otherLabel")}
    ${field("Other charges", "other", "number")}
    ${["quote", "po", "credit", "delivery", "remittance", "jobsheet", "payslip"].includes(TYPE) ? "" : field({ receipt: "Amount paid (if not in full)", statement: "Payments received" }[TYPE] || "Already paid / deposit", "paid", "number", "wide")}
  </div>
  <button class="dc-link" type="button" data-apply-tax style="margin-top:0.9rem">Apply this tax % to every line</button>
</section>

${
  BILL
    ? `<section class="dc-card"><h2>Payment details</h2>
  <div class="dc-grid">
    ${field("Bank", "pay.bank")}
    ${field("Account name", "pay.accountName")}
    ${field("Account number", "pay.account")}
    ${field("Sort code / routing", "pay.sort")}
    ${field("IBAN", "pay.iban")}
    ${field("SWIFT / BIC", "pay.swift")}
    ${field("Online payment link", "pay.link", "text", "wide")}
  </div>
</section>`
    : ""
}

<section class="dc-card"><h2>Notes and terms</h2>
  <div class="dc-grid">
    ${field("Notes", "notes", "textarea", "wide")}
    ${field("Terms", "terms", "textarea", "wide")}
  </div>
</section>

<section class="dc-card"><h2>Saved ${KIND.title.toLowerCase()}s <small>in this browser</small></h2>
  <div class="dc-saved" data-saved></div>
</section>`;
}

function entriesHtml() {
  const t = totals();
  const types = Object.entries(RATE_TYPES);
  return state.entries
    .map(
      (e, i) => `<div class="dc-item is-shift">
  <label class="dc-field">Date<input type="date" data-k="entries.${i}.date" value="${esc(e.date)}"></label>
  <label class="dc-field">Officer<input data-k="entries.${i}.officer" value="${esc(e.officer)}"></label>
  <label class="dc-field">Post<input data-k="entries.${i}.post" value="${esc(e.post)}"></label>
  <label class="dc-field">Rate<select data-k="entries.${i}.type">${types.map(([k, v]) => `<option value="${k}"${k === e.type ? " selected" : ""}>${v}</option>`).join("")}</select></label>
  <label class="dc-field">Start<input type="time" data-k="entries.${i}.start" value="${esc(e.start)}"></label>
  <label class="dc-field">End<input type="time" data-k="entries.${i}.end" value="${esc(e.end)}"></label>
  <label class="dc-field">Break (min)<input type="number" step="5" min="0" data-k="entries.${i}.brk" value="${esc(e.brk)}"></label>
  <label class="dc-field">Note<input data-k="entries.${i}.notes" value="${esc(e.notes || "")}"></label>
  <div class="dc-item-bar"><span><strong data-line="${i}">${esc(dayLabel(e.date))} · ${hrs(t.lines[i].hours)} h</strong></span>
    <span class="dc-mini">
      <button type="button" data-move="${i}" data-dir="-1" aria-label="Move shift ${i + 1} up" ${i === 0 ? "disabled" : ""}>↑</button>
      <button type="button" data-move="${i}" data-dir="1" aria-label="Move shift ${i + 1} down" ${i === state.entries.length - 1 ? "disabled" : ""}>↓</button>
      <button type="button" data-copy="${i}" aria-label="Duplicate shift ${i + 1}">⧉</button>
      <button type="button" data-remove="${i}" aria-label="Remove shift ${i + 1}">✕</button>
    </span>
  </div>
</div>`,
    )
    .join("");
}

function itemsHtml() {
  if (TYPE === "timesheet") return entriesHtml();
  const t = totals();
  return state.items
    .map(
      (it, i) => `<div class="dc-item">
  <label class="dc-field is-desc">Description<input data-k="items.${i}.desc" value="${esc(it.desc)}"></label>
  <label class="dc-field is-detail">Detail (optional)<input data-k="items.${i}.detail" value="${esc(it.detail || "")}"></label>
  <label class="dc-field">Qty<input type="number" step="any" inputmode="decimal" data-k="items.${i}.qty" value="${esc(it.qty)}"></label>
  <label class="dc-field">Unit<input data-k="items.${i}.unit" value="${esc(it.unit || "")}" placeholder="hours"></label>
  <label class="dc-field">Price<input type="number" step="any" inputmode="decimal" data-k="items.${i}.rate" value="${esc(it.rate)}"></label>
  <label class="dc-field">${esc(state.taxLabel)} %<input type="number" step="any" inputmode="decimal" data-k="items.${i}.tax" value="${esc(it.tax)}"></label>
  <div class="dc-item-bar"><span>Line ${i + 1} · <strong data-line="${i}">${money(t.lines[i].amount)}</strong></span>
    <span class="dc-mini">
      <button type="button" data-move="${i}" data-dir="-1" aria-label="Move line ${i + 1} up" ${i === 0 ? "disabled" : ""}>↑</button>
      <button type="button" data-move="${i}" data-dir="1" aria-label="Move line ${i + 1} down" ${i === state.items.length - 1 ? "disabled" : ""}>↓</button>
      <button type="button" data-copy="${i}" aria-label="Duplicate line ${i + 1}">⧉</button>
      <button type="button" data-remove="${i}" aria-label="Remove line ${i + 1}">✕</button>
    </span>
  </div>
</div>`,
    )
    .join("");
}

function fill(root = document) {
  root.querySelectorAll("[data-k]").forEach((el) => {
    const v = get(el.dataset.k);
    if (el.type === "checkbox") el.checked = Boolean(v);
    else if (document.activeElement !== el) el.value = v ?? "";
  });
  document.querySelectorAll("[data-template]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.template === state.template)));
  document.querySelectorAll("[data-format]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.format === state.format)));
  document.querySelectorAll("[data-palette]").forEach((r) => {
    r.checked = r.value === (PALETTES[state.palette] ? state.palette : "custom");
  });
}

function renderItems() {
  const box = document.querySelector("[data-items]");
  box.innerHTML = itemsHtml();
  const n = list().length;
  const word = TYPE === "timesheet" ? "shift" : "line";
  document.querySelector("[data-item-count]").textContent = `${n} ${word}${n === 1 ? "" : "s"}`;
}

/* ---------- Preview ---------- */

const scaler = () => document.querySelector(".dc-scaler");

function renderPreview() {
  const box = scaler();
  box.innerHTML = docHtml();
  box.querySelector(".doc").classList.add("dc-paper");
  document.querySelectorAll("[data-thumb]").forEach((el) => {
    el.innerHTML = thumb(el.dataset.thumb);
  });
  document.querySelectorAll("[data-format-thumb]").forEach((el) => {
    el.innerHTML = formatThumb(el.dataset.formatThumb);
  });
  const name = document.querySelector("[data-palette-name]");
  if (name) name.textContent = `· ${PALETTES[state.palette]?.label || "Custom"}`;
  const size = document.querySelector("[data-logo-size]");
  if (size) size.textContent = `${num(state.logoScale || 100)}%`;
  const signin = document.querySelector("[data-signin-options]");
  if (signin) signin.hidden = state.format !== "signin";
  const t = totals();
  document.querySelectorAll("[data-line]").forEach((el) => {
    const line = t.lines[Number(el.dataset.line)];
    el.textContent = TYPE === "timesheet" ? `${dayLabel(line?.date)} · ${hrs(line?.hours || 0)} h` : money(line?.amount || 0);
  });
  fit();
  persist();
}

function fit() {
  const box = scaler();
  const doc = box.querySelector(".doc");
  if (!doc) return;
  const stage = box.parentElement;
  const style = getComputedStyle(stage);
  const avail = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const scale = Math.min(1, avail / doc.offsetWidth);
  box.style.transform = `scale(${scale})`;
  box.style.width = `${doc.offsetWidth}px`;
  box.style.height = "auto";
  stage.style.height = `${doc.offsetHeight * scale + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)}px`;
  if (doc.classList.contains("is-thermal")) box.style.marginInline = `${Math.max(0, (avail - doc.offsetWidth * scale) / 2)}px`;
  else box.style.marginInline = "0";
  const page = PAGES[state.paper] || PAGES.letter;
  const pages = page.h ? Math.max(1, Math.ceil((doc.offsetHeight - 2) / page.h)) : 1;
  const t = totals();
  const sum =
    TYPE === "timesheet"
      ? `${hrs(t.hours)} hours${state.showRates ? ` · ${money(t.amount)}` : ""}`
      : NO_PRICES
        ? `${qty(t.lines.reduce((a, l) => a + num(l.qty), 0))} items`
        : TYPE === "payslip"
          ? `Net pay ${money(t.total)}`
          : `Total ${money(t.total)}`;
  document.querySelector("[data-meta]").textContent = `${page.label} · ${pages} page${pages === 1 ? "" : "s"} · ${sum}`;
}

/* ---------- Saved documents ---------- */

function savedList() {
  try {
    return JSON.parse(localStorage.getItem(SAVED) || "[]");
  } catch {
    return [];
  }
}

function renderSaved() {
  const list = savedList();
  const box = document.querySelector("[data-saved]");
  if (!list.length) {
    box.innerHTML = `<p class="dc-empty">Nothing saved yet. Use Save to keep a copy of this ${KIND.title.toLowerCase()} here.</p>`;
    return;
  }
  box.innerHTML = list
    .map(
      (d, i) => `<div class="dc-saved-row"><span><strong>${esc(d.number)}</strong> · ${esc(d.client)} · ${esc(d.total)}<br><small>Saved ${esc(new Date(d.savedAt).toLocaleString())}</small></span>
<span class="dc-mini"><button type="button" data-open="${i}" aria-label="Open ${esc(d.number)}">↗</button><button type="button" data-delete="${i}" aria-label="Delete ${esc(d.number)}">✕</button></span></div>`,
    )
    .join("");
}

function saveDoc() {
  const list = savedList().filter((d) => d.number !== state.number);
  const t = totals();
  const total = TYPE === "timesheet" ? `${hrs(t.hours)} h` : money(t.total);
  list.unshift({ number: state.number, client: state.to.name, total, savedAt: Date.now(), state: JSON.parse(JSON.stringify(state)) });
  try {
    localStorage.setItem(SAVED, JSON.stringify(list.slice(0, 60)));
    toast(`${state.number} saved`);
  } catch {
    toast("Could not save: this browser's storage is full or blocked");
  }
  renderSaved();
}

function nextNumber() {
  const nums = [state.number, ...savedList().map((d) => d.number)]
    .map((n) => {
      const m = String(n).match(/(\d+)(?!.*\d)/);
      return m ? { n: Number(m[1]), width: m[1].length, pre: String(n).slice(0, m.index) } : null;
    })
    .filter(Boolean);
  if (!nums.length) return `${KIND.prefix}-0001`;
  const top = nums.reduce((a, b) => (b.n > a.n ? b : a));
  return `${top.pre}${String(top.n + 1).padStart(top.width, "0")}`;
}

function newDoc() {
  if (TYPE === "timesheet") {
    // The next period for the same client: rates, site and people carry over.
    const number = nextNumber();
    const days = Math.round((new Date(state.periodEnd) - new Date(state.periodStart)) / 86400000) + 1 || 7;
    const start = addDays(state.periodEnd, 1);
    state = merge(defaults(), { ...state, number, date: today(), periodStart: start, periodEnd: addDays(start, days - 1), entries: [], stamp: "none" });
    refreshAll();
    toast(`New timesheet ${number}`);
    return;
  }
  const keep = { template: state.template, accent: state.accent, accent2: state.accent2, font: state.font, paper: state.paper, currency: state.currency, from: state.from, pay: state.pay, showLogo: state.showLogo, logo: state.logo, taxLabel: state.taxLabel, taxRate: state.taxRate, terms: state.terms, notes: state.notes };
  const number = nextNumber();
  state = merge(defaults(), keep);
  state.number = number;
  state.to = { name: "", contact: "", address: "", email: "" };
  state.reference = "";
  state.items = [{ desc: "", detail: "", qty: 1, unit: "", rate: 0, tax: num(state.taxRate) }];
  refreshAll();
  toast(`New ${KIND.title.toLowerCase()} ${number}`);
}

function refreshAll() {
  fill();
  renderItems();
  fill(document.querySelector("[data-items]"));
  renderPreview();
}

const list = () => (TYPE === "timesheet" ? state.entries : state.items);

/* Takes the design, colours, font, logo size and tagline from the business card editor. */
function matchCard() {
  let card = null;
  try {
    card = JSON.parse(localStorage.getItem("ncs-card-v3") || "null");
  } catch {
    card = null;
  }
  if (!card) return toast("Open the business card editor first, then come back");
  if (TEMPLATES[card.design]) state.template = card.design;
  if (PALETTES[card.palette]) applyPalette(card.palette);
  else if (card.primary) {
    state.palette = "custom";
    state.accent = card.primary;
    state.accent2 = card.accent || state.accent2;
  }
  if (FONTS.includes(card.font)) state.font = card.font;
  if (card.logo) state.logoScale = Math.round(card.logo * 100);
  if (typeof card.showTagline === "boolean") state.showTagline = card.showTagline;
  if (card.tagline) state.tagline = card.tagline;
  fill();
  renderPreview();
  toast(`Matched your card: ${TEMPLATES[state.template]}, ${PALETTES[state.palette]?.label || "custom colours"}, ${state.font}`);
}

/* ---------- Generator and hand-off (timesheets) ---------- */

function setPeriod(kind) {
  if (kind === "week") [state.periodStart, state.periodEnd] = [monday(0), monday(6)];
  if (kind === "next") [state.periodStart, state.periodEnd] = [monday(7), monday(13)];
  if (kind === "fortnight") [state.periodStart, state.periodEnd] = [monday(0), monday(13)];
  if (kind === "month") {
    const d = new Date();
    state.periodStart = iso(new Date(d.getFullYear(), d.getMonth(), 1));
    state.periodEnd = iso(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  }
  fill();
  renderPreview();
}

function generate() {
  const g = state.gen;
  const officers = String(g.officers).split(/[\n,;]+/).map((o) => o.trim()).filter(Boolean);
  if (!officers.length) return toast("Add at least one officer");
  if (toMins(g.start) == null || toMins(g.end) == null) return toast("Set a start and an end time");
  const from = new Date(`${state.periodStart}T00:00:00`);
  const to = new Date(`${state.periodEnd}T00:00:00`);
  if (!(from <= to)) return toast("The period ends before it starts");
  const made = [];
  for (const d = new Date(from); d <= to && made.length < 600; d.setDate(d.getDate() + 1)) {
    if (!g.days[(d.getDay() + 6) % 7]) continue;
    const date = iso(d);
    officers.forEach((officer) =>
      made.push({ date, officer, post: g.post, start: g.start, end: g.end, brk: num(g.brk), type: g.type === "auto" ? autoType(date, g.start, g.end) : g.type, notes: "" }),
    );
  }
  if (!made.length) return toast("None of the chosen days fall in the period");
  const kept = g.mode === "replace" ? [] : state.entries.filter((e) => e.date || e.officer);
  state.entries = sortShifts([...kept, ...made]);
  renderItems();
  renderPreview();
  toast(`${made.length} shift${made.length === 1 ? "" : "s"} added`);
}

function sortShifts(entries) {
  return entries.sort((a, b) => String(a.date).localeCompare(String(b.date)) || (toMins(a.start) ?? 0) - (toMins(b.start) ?? 0) || String(a.officer).localeCompare(String(b.officer)));
}

/* Hours become invoice lines, one per post and rate, and the invoice opens. */
function toInvoice() {
  const t = totals();
  if (!t.hours) return toast("There are no hours to invoice yet");
  const groups = {};
  t.lines.forEach((l) => {
    const key = `${l.post}|${l.type}`;
    const g = (groups[key] = groups[key] || { post: l.post, type: l.type, hours: 0 });
    g.hours += l.hours;
  });
  const items = Object.values(groups).map((g) => ({
    desc: `${g.post || "Security cover"}, ${(RATE_TYPES[g.type] || g.type).toLowerCase()} hours`,
    detail: `${state.site ? `${state.site}, ` : ""}${fmtDate(state.periodStart)} to ${fmtDate(state.periodEnd)}`,
    qty: Math.round(g.hours * 100) / 100,
    unit: "hours",
    rate: num(state.rates[g.type]),
    tax: 0,
  }));
  let invoice = {};
  try {
    invoice = JSON.parse(localStorage.getItem("ncs-doc-invoice") || "null") || {};
  } catch {
    invoice = {};
  }
  Object.assign(invoice, { items, to: { ...state.to }, from: { ...(invoice.from || {}), name: state.from.name, address: state.from.address, phone: state.from.phone, email: state.from.email }, currency: state.currency, reference: `Timesheet ${state.number}`, date: today(), due: today(14), stamp: "none" });
  try {
    localStorage.setItem("ncs-doc-invoice", JSON.stringify(invoice));
  } catch {
    return toast("Could not hand over: this browser's storage is blocked");
  }
  window.location.href = "invoice.html";
}

/* ---------- Exports ---------- */

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if ([...document.scripts].some((s) => s.src === src)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

async function capture() {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-20000px;top:0;";
  holder.innerHTML = docHtml();
  document.body.append(holder);
  await document.fonts?.ready;
  const doc = holder.querySelector(".doc");
  try {
    return await window.html2canvas(doc, { scale: 2.5, backgroundColor: "#ffffff", useCORS: true, logging: false });
  } finally {
    holder.remove();
  }
}

const fileName = (ext) => `${state.number || KIND.title}`.replace(/[^\w.-]+/g, "-") + `-new-concept-security.${ext}`;

function download(url, name) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
}

async function exportPng() {
  const canvas = await capture();
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    download(url, fileName("png"));
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, "image/png");
}

async function exportPdf() {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const canvas = await capture();
  const { jsPDF } = window.jspdf;
  const thermalPaper = state.paper === "thermal" && TYPE === "receipt";
  const size = (PAGES[state.paper] && PAGES[state.paper].pt) || PAGES.letter.pt;
  const pageW = thermalPaper ? 226.77 : size[0];
  const pageH = thermalPaper ? (canvas.height / canvas.width) * pageW : size[1];
  const orientation = pageW > pageH ? "landscape" : "portrait";
  const pdf = new jsPDF({ unit: "pt", format: [pageW, pageH], orientation });
  const slice = Math.round((canvas.width * pageH) / pageW);
  for (let y = 0, i = 0; y < canvas.height - 4; y += slice, i += 1) {
    const h = Math.min(slice, canvas.height - y);
    const part = document.createElement("canvas");
    part.width = canvas.width;
    part.height = h;
    part.getContext("2d").drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
    if (i) pdf.addPage([pageW, pageH], orientation);
    pdf.addImage(part.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, pageW, (h * pageW) / canvas.width);
  }
  pdf.setProperties({ title: `${KIND.title} ${state.number}`, creator: state.from.name });
  pdf.save(fileName("pdf"));
}

function printDoc() {
  const box = document.querySelector(".dc-print");
  box.innerHTML = docHtml();
  let style = document.getElementById("dc-page");
  if (!style) {
    style = document.createElement("style");
    style.id = "dc-page";
    document.head.append(style);
  }
  if (state.paper === "thermal" && TYPE === "receipt") {
    // The roll is as long as the receipt: measure the one on screen.
    const shown = scaler().querySelector(".doc");
    const h = Math.ceil(((shown?.offsetHeight || 900) * 25.4) / 96) + 4;
    style.textContent = `@page { size: 80mm ${h}mm; margin: 0; }`;
  } else {
    style.textContent = `@page { size: ${(PAGES[state.paper] && PAGES[state.paper].print) || "letter"}; margin: 0; }`;
  }
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
    el = document.createElement("div");
    el.className = "dc-toast";
    el.setAttribute("role", "status");
    document.body.append(el);
  }
  el.textContent = message;
  el.classList.add("is-on");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("is-on"), 2200);
}

/* ---------- Logo upload ---------- */

function readLogo(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      // Kept small so it fits in browser storage: at most 600 px wide.
      const scale = Math.min(1, 600 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      state.logo = canvas.toDataURL("image/png");
      state.showLogo = true;
      fill();
      renderPreview();
      toast("Logo added");
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* ---------- Wiring ---------- */

function init() {
  document.querySelector("[data-editor]").innerHTML = editorHtml();
  refreshAll();
  renderSaved();

  document.addEventListener("input", (event) => {
    const el = event.target.closest("[data-k]");
    if (!el) return;
    const key = el.dataset.k;
    const value = el.type === "checkbox" ? el.checked : el.value;
    set(key, value);
    if (key === "accent" || key === "accent2") {
      state.palette = "custom";
      fill();
    }
    if (key === "taxLabel") {
      document.querySelectorAll("[data-items] .dc-field").forEach((label) => {
        if (label.querySelector('[data-k$=".tax"]')) label.firstChild.textContent = `${value} %`;
      });
    }
    renderPreview();
  });
  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-logo-file]") && event.target.files[0]) readLogo(event.target.files[0]);
    if (event.target.matches("[data-palette]")) {
      applyPalette(event.target.value);
      fill();
      renderPreview();
    }
  });

  document.addEventListener("click", (event) => {
    const t = event.target.closest("button");
    if (!t) return;
    if (t.dataset.template) {
      state.template = t.dataset.template;
      fill();
      renderPreview();
    } else if (t.matches("[data-add]")) {
      if (TYPE === "timesheet") {
        const last = state.entries[state.entries.length - 1];
        const date = last ? addDays(last.date, 1) : state.periodStart;
        state.entries.push(last ? { ...last, date, type: autoType(date, last.start, last.end), notes: "" } : { date, officer: "", post: "", start: "07:00", end: "17:00", brk: 30, type: "standard", notes: "" });
      } else {
        state.items.push({ desc: "", detail: "", qty: 1, unit: "", rate: 0, tax: num(state.taxRate) });
      }
      renderItems();
      renderPreview();
      document.querySelector(`[data-k="${TYPE === "timesheet" ? "entries" : "items"}.${list().length - 1}.${TYPE === "timesheet" ? "officer" : "desc"}"]`)?.focus();
    } else if (t.dataset.remove) {
      list().splice(Number(t.dataset.remove), 1);
      if (!list().length && TYPE !== "timesheet") state.items.push({ desc: "", detail: "", qty: 1, unit: "", rate: 0, tax: 0 });
      renderItems();
      renderPreview();
    } else if (t.dataset.copy) {
      const i = Number(t.dataset.copy);
      list().splice(i + 1, 0, { ...list()[i] });
      renderItems();
      renderPreview();
    } else if (t.dataset.move) {
      const i = Number(t.dataset.move);
      const j = i + Number(t.dataset.dir);
      const l = list();
      [l[i], l[j]] = [l[j], l[i]];
      renderItems();
      renderPreview();
    } else if (t.dataset.format) {
      state.format = t.dataset.format;
      fill();
      renderPreview();
    } else if (t.matches("[data-match-card]")) {
      matchCard();
    } else if (t.matches("[data-generate]")) {
      generate();
    } else if (t.matches("[data-sort]")) {
      sortShifts(state.entries);
      renderItems();
      renderPreview();
    } else if (t.matches("[data-to-invoice]")) {
      toInvoice();
    } else if (t.dataset.period) {
      setPeriod(t.dataset.period);
    } else if (t.matches("[data-apply-tax]")) {
      state.items.forEach((it) => {
        it.tax = num(state.taxRate);
      });
      renderItems();
      renderPreview();
    } else if (t.matches("[data-upload]")) {
      document.querySelector("[data-logo-file]").click();
    } else if (t.matches("[data-default-logo]")) {
      state.logo = "";
      state.showLogo = true;
      fill();
      renderPreview();
    } else if (t.dataset.open) {
      const d = savedList()[Number(t.dataset.open)];
      if (d) {
        state = merge(defaults(), d.state);
        refreshAll();
        toast(`${d.number} opened`);
      }
    } else if (t.dataset.delete) {
      const list = savedList();
      const [gone] = list.splice(Number(t.dataset.delete), 1);
      localStorage.setItem(SAVED, JSON.stringify(list));
      renderSaved();
      if (gone) toast(`${gone.number} deleted`);
    } else if (t.matches("[data-new]")) {
      newDoc();
    } else if (t.matches("[data-save]")) {
      saveDoc();
    } else if (t.matches("[data-reset]")) {
      if (window.confirm(`Start again from the sample ${KIND.title.toLowerCase()}? Saved documents are kept.`)) {
        state = defaults();
        refreshAll();
      }
    } else if (t.dataset.export === "pdf") {
      busy(t, exportPdf);
    } else if (t.dataset.export === "png") {
      busy(t, exportPng);
    } else if (t.dataset.export === "print") {
      printDoc();
    }
  });

  window.addEventListener("resize", fit);
  document.fonts?.ready.then(fit);
}

init();
