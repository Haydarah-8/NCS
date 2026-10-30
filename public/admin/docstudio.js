/* NCS Business Studio: Document Studio. Pick a template, fill it in,
   preview, export. Documents are made of blocks (cover, text, services,
   pricing, contact page and so on) that can be reordered by dragging. The
   preview flows them onto real A4 pages (or 16:9 slides for presentations),
   so the PDF is exactly what's on screen. Every document keeps the brand
   kit it was made with; autosave, versions, statuses, PDF, Word and print.

   Contract terms are never written here: a terms block holds the
   company's own approved wording, pasted in, or stays a visible
   placeholder. */

import { render } from "./md.js";
import { $, $$, api, brandKit, confirmBox, day, empty, esc, head, icon, studio, studioPost, toast } from "./core.js";

/* ---------- Templates ---------- */

export const TEMPLATES = {
  proposal: { label: "Proposal pack", group: "Sales", text: "Cover, introduction, services, quotation, credentials and contact page, in one PDF", wizard: true },
  quotation: { label: "Quotation", group: "Sales", text: "Services, quantities and prices, with VAT and totals" },
  letter: { label: "Business letter", group: "Correspondence", text: "Introductions, cover letters and general correspondence" },
  profile: { label: "Company profile", group: "Sales", text: "A polished overview of the company for prospects" },
  capability: { label: "Capability statement", group: "Sales", text: "Services, coverage and verified credentials on one page" },
  minutes: { label: "Meeting minutes", group: "Office", text: "Attendees, decisions, actions, owners and deadlines" },
  report: { label: "Report", group: "Office", text: "A branded report with photos and tables" },
  presentation: { label: "Presentation", group: "Sales", text: "16:9 slides for sales introductions and client meetings", slides: true },
  advert: { label: "Job advert", group: "Recruitment", text: "A role, its requirements and how to apply" },
  interview: { label: "Interview invitation", group: "Recruitment", text: "An invitation letter with what to bring" },
  welcome: { label: "Welcome letter", group: "Recruitment", text: "A new starter's welcome, first day and contacts" },
};

const BLOCKS = {
  cover: "Cover page",
  heading: "Heading",
  text: "Text",
  address: "Recipient and date",
  facts: "Key facts",
  services: "Services",
  pricing: "Quotation table",
  credentials: "Credentials",
  coverage: "Coverage",
  image: "Photograph",
  table: "Table",
  actions: "Action list",
  quote: "Quote",
  terms: "Approved terms",
  signature: "Signature",
  contact: "Contact page",
  pagebreak: "Page break",
  slide: "Slide",
};

const PHOTOS = ["hero", "hero-skyline", "balfour-site", "control-room", "fleet-night", "northern-way", "reception", "street", "tram", "venue"];
const uid = () => Math.random().toString(36).slice(2, 9);
const todayLong = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const plusDays = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const B = (type, extra = {}) => ({ id: uid(), type, ...extra });

/* The blocks each template starts with. */
function starter(kind, kit, c = {}) {
  const client = c.client || "Client name";
  const sig = B("signature", { name: kit.staff[0]?.name || "", role: kit.staff[0]?.role || "" });
  switch (kind) {
    case "quotation":
      return [
        B("address", { to: [c.contact, client, c.address].filter(Boolean).join("\n") || "Name\nCompany\nAddress", date: todayLong(), ref: `QTE-${String(Date.now()).slice(-5)}` }),
        B("heading", { text: `Quotation${c.site ? `: ${c.site}` : ""}` }),
        B("facts", { rows: [["Prepared for", client], ["Site", c.location || ""], ["Valid until", plusDays(30)]] }),
        B("services", { ids: c.services || [], intro: "Our quotation covers the following services." }),
        B("pricing", { rows: (c.services || []).map((id) => ({ item: kit.services.find((s) => s.id === id)?.name || id, qty: "", unit: "hours", rate: "" })), vat: 20, notes: "Prices exclude VAT unless stated." }),
        B("terms", { text: "" }),
        sig,
      ];
    case "letter":
      return [B("address", { to: [c.contact, client, c.address].filter(Boolean).join("\n") || "Name\nCompany\nAddress", date: todayLong(), ref: "" }), B("text", { text: `Dear ${c.contact?.split(" ")[0] || "Sir or Madam"},\n\nThank you for your interest in ${kit.company.name}.\n\nWrite the letter here.\n\nYours sincerely,` }), sig];
    case "profile":
      return [
        B("cover", { title: "Company profile", subtitle: kit.tagline, client: "", photo: "hero-skyline" }),
        B("heading", { text: `About ${kit.company.name}` }),
        B("text", { text: kit.description }),
        B("services", { ids: kit.services.slice(0, 8).map((s) => s.id), intro: "What we do." }),
        B("credentials", {}),
        B("coverage", { text: kit.company.region }),
        B("contact", { staffIds: kit.staff.slice(0, 2).map((s) => s.id) }),
      ];
    case "capability":
      return [
        B("heading", { text: "Capability statement" }),
        B("text", { text: kit.description }),
        B("facts", { rows: [["Company number", kit.company.number], ["Accreditation", kit.credentials.filter((x) => x.verified).map((x) => `${x.name} (${x.reference})`).join("; ")], ["Hours", kit.company.hours], ["Coverage", kit.company.region]] }),
        B("services", { ids: kit.services.map((s) => s.id), intro: "Core services.", compact: true }),
        B("contact", { staffIds: kit.staff.slice(0, 1).map((s) => s.id) }),
      ];
    case "minutes":
      return [
        B("heading", { text: "Meeting minutes" }),
        B("facts", { rows: [["Meeting", c.client ? `Meeting with ${client}` : "Monthly operations meeting"], ["Date", todayLong()], ["Location", kit.company.address.split(",")[0]], ["Chair", kit.staff[0]?.name || ""]] }),
        B("text", { text: "## Attendees\n\n- Name, role\n- Name, role\n\n## Apologies\n\nNone." }),
        B("text", { text: "## Discussion\n\nNotes of what was discussed.\n\n## Decisions\n\n- Decision one\n- Decision two" }),
        B("actions", { rows: [{ action: "First action", owner: kit.staff[0]?.name || "", due: plusDays(7) }] }),
      ];
    case "report":
      return [
        B("cover", { title: "Report title", subtitle: c.client ? `Prepared for ${client}` : "Prepared by " + kit.company.name, client, photo: "control-room" }),
        B("heading", { text: "Summary" }),
        B("text", { text: "A short summary of what this report covers and what it found." }),
        B("image", { photo: "balfour-site", caption: "Caption for the photograph" }),
        B("table", { head: ["Item", "Detail", "Status"], rows: [["Example", "Detail", "Complete"]] }),
        B("heading", { text: "Recommendations" }),
        B("text", { text: "- First recommendation\n- Second recommendation" }),
      ];
    case "presentation":
      return [
        B("slide", { title: kit.company.name, points: kit.tagline, photo: "hero-skyline", layout: "title" }),
        B("slide", { title: "About us", points: kit.description, photo: "control-room" }),
        B("slide", { title: "What we do", points: kit.services.slice(0, 6).map((s) => s.name).join("\n"), photo: "balfour-site" }),
        B("slide", { title: "Why choose us", points: "Every officer SIA licensed and trained\nOne account manager from survey to start\nA written report every morning\nControl room 24 hours, 365 days", photo: "fleet-night" }),
        B("slide", { title: "Where we work", points: kit.company.region, photo: "street" }),
        B("slide", { title: "Let's talk", points: `${kit.company.phone}\n${kit.company.email}\n${kit.company.web}`, photo: "reception", layout: "title" }),
      ];
    case "advert":
      return [
        B("heading", { text: "Security Officer" }),
        B("facts", { rows: [["Location", "Blackpool and the Fylde"], ["Hours", "Days, nights and weekends"], ["Pay", "Add the rate"], ["Contract", "Full or part time"]] }),
        B("text", { text: `## The role\n\nJoin ${kit.company.name} and protect sites across the North West.\n\n## You'll need\n\n- A current SIA licence\n- The right to work in the UK\n- Good communication and a professional manner\n\n## How to apply\n\nApply through our website or call ${kit.company.phone}.` }),
      ];
    case "interview":
      return [B("address", { to: c.contact || "Applicant name", date: todayLong(), ref: "" }), B("heading", { text: "Interview invitation" }), B("text", { text: `Dear ${c.contact?.split(" ")[0] || "applicant"},\n\nThank you for applying to join ${kit.company.name}. We'd like to invite you to an interview.\n\n**Please bring** your SIA licence, photo ID and proof of your right to work in the UK.\n\nPlease reply to confirm, or let us know if you need another time.` }), B("facts", { rows: [["Date", ""], ["Time", ""], ["Place", kit.company.address]] }), sig];
    case "welcome":
      return [B("address", { to: c.contact || "New starter's name", date: todayLong(), ref: "" }), B("heading", { text: `Welcome to ${kit.company.name}` }), B("text", { text: "We're delighted you're joining us.\n\n## Your first day\n\nWhere to go, when, and who will meet you.\n\n## What to bring\n\n- Your SIA licence\n- Bank details for payroll\n- Proof of address" }), B("contact", { staffIds: kit.staff.slice(0, 1).map((s) => s.id) }), sig];
    default:
      return [B("heading", { text: "Untitled" }), B("text", { text: "" })];
  }
}

/* The proposal pack, assembled from the wizard's choices. */
function proposalPack(kit, c, opts) {
  const chosen = kit.services.filter((s) => c.services.includes(s.id));
  const blocks = [B("cover", { title: "Security proposal", subtitle: c.site ? `${c.site}${c.location ? `, ${c.location}` : ""}` : "Prepared for you", client: c.client, photo: opts.photo || "balfour-site" })];
  if (opts.intro) blocks.push(B("heading", { text: "Introduction" }), B("text", { text: `${c.contact ? `Dear ${c.contact.split(" ")[0]},\n\n` : ""}Thank you for the opportunity to propose security for ${c.client || "your site"}.${c.message ? `\n\nYou told us: “${c.message.slice(0, 400)}”` : ""}\n\n${kit.description}` }));
  if (opts.services && chosen.length) blocks.push(B("services", { ids: chosen.map((s) => s.id), intro: "The services we propose." }));
  if (opts.quote) blocks.push(B("pagebreak"), B("heading", { text: "Quotation" }), B("pricing", { rows: chosen.map((s) => ({ item: s.name, qty: "", unit: "hours", rate: "" })), vat: 20, notes: "Prices exclude VAT unless stated. Rates are confirmed after the site survey." }));
  if (opts.credentials) blocks.push(B("credentials", {}));
  if (opts.coverage) blocks.push(B("coverage", { text: kit.company.region }));
  if (opts.terms) blocks.push(B("terms", { text: "" }));
  blocks.push(B("contact", { staffIds: kit.staff.slice(0, 2).map((s) => s.id) }));
  return blocks;
}

/* ---------- Rendering ---------- */

const md = (t) => render(t || "").html;
const fill = (t, d) => String(t ?? "").replace(/\{client\}/g, d.client || "the client");
const money = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n) || 0);
const n = (v) => Number(String(v ?? "").replace(/[^\d.-]/g, "")) || 0;

/* Each block becomes one or more flowing pieces; a piece never splits. */
function pieces(block, ctx) {
  const { kit, data, locations } = ctx;
  const out = [];
  const add = (html, opts = {}) => out.push({ html, ...opts });
  switch (block.type) {
    case "cover":
      add(`<section class="ds-cover"><div class="ds-cover-photo" style="background-image:url('/images/${esc(block.photo || "hero-skyline")}.jpg')"></div>
        <div class="ds-cover-in"><img class="ds-cover-logo" src="${esc(kit.logos.dark)}" alt=""><div><p class="ds-kicker">${esc(block.client ? `Prepared for ${fill(block.client, data)}` : kit.company.name)}</p><h1>${esc(fill(block.title, data))}</h1>${block.subtitle ? `<p class="ds-cover-sub">${esc(fill(block.subtitle, data))}</p>` : ""}</div>
        <p class="ds-cover-foot">${esc(todayLong())} · ${esc(kit.company.web)}</p></div></section>`, { page: "cover" });
      break;
    case "heading":
      add(`<h2 class="ds-h">${esc(fill(block.text, data))}</h2>`, { keepNext: true });
      break;
    case "text":
      // Paragraph by paragraph, so a long text flows across pages.
      String(fill(block.text, data))
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .forEach((p) => add(`<div class="ds-text">${md(p)}</div>`));
      break;
    case "address":
      add(`<div class="ds-address"><p>${esc(block.to || "").replace(/\n/g, "<br>")}</p><p class="ds-date">${esc(block.date || "")}${block.ref ? `<br><span>Ref: ${esc(block.ref)}</span>` : ""}</p></div>`);
      break;
    case "facts":
      add(`<dl class="ds-facts">${(block.rows || []).filter((r) => r[0] || r[1]).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(fill(v, data))}</dd></div>`).join("")}</dl>`);
      break;
    case "services": {
      const list = (block.ids || []).map((id) => kit.services.find((s) => s.id === id)).filter(Boolean);
      if (block.intro) add(`<p class="ds-lead">${esc(block.intro)}</p>`, { keepNext: true });
      if (block.compact) add(`<ul class="ds-svc-compact">${list.map((s) => `<li><b>${esc(s.name)}</b><span>${esc(s.summary)}</span></li>`).join("")}</ul>`);
      else for (let i = 0; i < list.length; i += 2) add(`<div class="ds-svc-row">${list.slice(i, i + 2).map((s) => `<article class="ds-svc"><i></i><h3>${esc(s.name)}</h3><p>${esc(block.overrides?.[s.id] || s.summary)}</p></article>`).join("")}</div>`);
      if (!list.length) add(`<p class="ds-placeholder">Choose services for this block.</p>`);
      break;
    }
    case "pricing": {
      const rows = block.rows || [];
      const sub = rows.reduce((a, r) => a + n(r.qty) * n(r.rate), 0);
      const vat = (sub * n(block.vat)) / 100;
      add(`<table class="ds-table ds-price"><thead><tr><th>Service</th><th class="num">Quantity</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead><tbody>${rows
        .map((r) => `<tr><td>${esc(r.item)}</td><td class="num">${esc(r.qty)} ${esc(r.unit || "")}</td><td class="num">${r.rate ? money(n(r.rate)) : ""}</td><td class="num">${r.qty && r.rate ? money(n(r.qty) * n(r.rate)) : "To confirm"}</td></tr>`)
        .join("")}</tbody></table>`);
      add(`<dl class="ds-totals"><dt>Subtotal</dt><dd>${money(sub)}</dd>${n(block.vat) ? `<dt>VAT at ${n(block.vat)}%</dt><dd>${money(vat)}</dd>` : ""}<dt class="is-grand">Total</dt><dd class="is-grand">${money(sub + vat)}</dd></dl>${block.notes ? `<p class="ds-note">${esc(block.notes)}</p>` : ""}`);
      break;
    }
    case "credentials": {
      const list = kit.credentials.filter((x) => x.verified);
      add(`<div class="ds-creds"><h3>Accreditations</h3>${list.length ? list.map((x) => `<p><b>${esc(x.name)}</b>${x.reference ? ` · ${esc(x.reference)}` : ""}</p>`).join("") : `<p class="ds-placeholder">No verified credentials in the brand kit.</p>`}</div>`);
      break;
    }
    case "coverage": {
      const towns = (locations || []).filter((l) => l.public && l.category === "coverage").map((l) => l.name);
      add(`<div class="ds-coverage"><h3>Where we work</h3><p>${esc(block.text || kit.company.region)}</p>${towns.length ? `<p class="ds-towns">${towns.map(esc).join(" · ")}</p>` : ""}</div>`);
      break;
    }
    case "image":
      add(`<figure class="ds-figure">${block.src ? `<img src="${esc(block.src)}" alt="">` : `<div style="background-image:url('/images/${esc(block.photo || "hero")}.jpg')"></div>`}${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ""}</figure>`);
      break;
    case "table": {
      const rows = block.rows || [];
      for (let i = 0; i < Math.max(1, rows.length); i += 14)
        add(`<table class="ds-table"><thead><tr>${(block.head || []).map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.slice(i, i + 14).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      break;
    }
    case "actions":
      add(`<table class="ds-table"><thead><tr><th>Action</th><th>Owner</th><th>Due</th></tr></thead><tbody>${(block.rows || []).map((r) => `<tr><td>${esc(r.action)}</td><td>${esc(r.owner)}</td><td>${esc(r.due)}</td></tr>`).join("")}</tbody></table>`);
      break;
    case "quote":
      add(`<blockquote class="ds-quote"><p>“${esc(block.text)}”</p>${block.who ? `<cite>${esc(block.who)}</cite>` : ""}</blockquote>`);
      break;
    case "terms": {
      if (String(block.text || "").trim()) String(block.text).split(/\n\s*\n/).forEach((p, i) => add(`${i ? "" : `<h3 class="ds-h3">${esc(block.title || "Terms and conditions")}</h3>`}<div class="ds-text ds-small">${md(p)}</div>`));
      else add(`<div class="ds-placeholder">Terms: paste the company's approved terms here. The studio never writes contractual terms.</div>`);
      break;
    }
    case "signature":
      add(`<div class="ds-sign"><div class="ds-sign-line"></div><p><b>${esc(block.name)}</b><br>${esc(block.role)}<br>${esc(kit.company.name)}</p></div>`);
      break;
    case "contact": {
      const staff = (block.staffIds || []).map((id) => kit.staff.find((s) => s.id === id)).filter(Boolean);
      add(`<section class="ds-contact"><h2 class="ds-h">Get in touch</h2><div class="ds-contact-grid">${staff.map((s) => `<div><b>${esc(s.name)}</b><span>${esc(s.role)}</span><span>${esc(s.phone)}</span><span>${esc(s.email)}</span></div>`).join("")}
        <div><b>${esc(kit.company.name)}</b><span>${esc(kit.company.address)}</span><span>${esc(kit.company.phone)}</span><span>${esc(kit.company.web)}</span></div></div><p class="ds-hours">${esc(kit.company.hours)}</p></section>`);
      break;
    }
    case "pagebreak":
      add("", { page: "break" });
      break;
    case "slide": {
      const pts = String(block.points || "").split("\n").filter((l) => l.trim());
      add(`<section class="ds-slide ${block.layout === "title" ? "is-title" : ""}"><div class="ds-slide-photo" style="background-image:url('/images/${esc(block.photo || "hero")}.jpg')"></div>
        <div class="ds-slide-in"><img class="ds-slide-logo" src="${esc(block.layout === "title" ? kit.logos.dark : kit.logos.light)}" alt=""><h1>${esc(fill(block.title, data))}</h1>${pts.length > 1 ? `<ul>${pts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : pts[0] ? `<p>${esc(pts[0])}</p>` : ""}</div></section>`, { page: "slide" });
      break;
    }
  }
  return out;
}

/* Flows the pieces onto pages, measuring as it goes. */
function paginate(doc, ctx) {
  const slides = TEMPLATES[doc.kind]?.slides;
  const kit = ctx.kit;
  const items = doc.data.blocks.flatMap((b) => pieces(b, ctx).map((p) => ({ ...p, block: b.id })));
  const pages = [];
  const measure = document.createElement("div");
  measure.className = `ds-measure ${slides ? "is-slides" : ""}`;
  measure.style.cssText = `position:fixed;left:-20000px;top:0;--accent:${kit.colours.accent};--primary:${kit.colours.primary}`;
  document.body.append(measure);
  const shell = (body, cls = "") => `<div class="ds-page ${cls}"><header class="ds-head"><img src="${esc(kit.logos.light)}" alt=""><span>${esc(doc.title)}</span></header><div class="ds-body">${body}</div><footer class="ds-foot"><span>${esc(kit.footer)}</span><span class="ds-num"></span></footer></div>`;
  if (slides) {
    items.filter((i) => i.page === "slide").forEach((i) => pages.push(`<div class="ds-page is-slide">${i.html}</div>`));
  } else {
    let current = [];
    const flush = () => {
      if (current.length) pages.push(shell(current.join("")));
      current = [];
    };
    measure.innerHTML = shell("");
    const body = () => measure.querySelector(".ds-body");
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.page === "cover") {
        flush();
        pages.push(`<div class="ds-page is-cover">${it.html}</div>`);
        measure.innerHTML = shell("");
        continue;
      }
      if (it.page === "break") {
        flush();
        measure.innerHTML = shell("");
        continue;
      }
      // A heading travels with what follows it.
      const group = [it.html];
      if (it.keepNext && items[i + 1] && !items[i + 1].page) group.push(items[i + 1].html);
      body().insertAdjacentHTML("beforeend", group.join(""));
      if (body().scrollHeight > body().clientHeight + 1 && current.length) {
        flush();
        measure.innerHTML = shell(group.join(""));
      }
      current.push(...group);
      if (group.length > 1) i++;
    }
    flush();
  }
  measure.remove();
  const total = pages.length;
  return pages.map((p, i) => p.replace('<span class="ds-num"></span>', `<span class="ds-num">Page ${i + 1} of ${total}</span>`));
}

/* ---------- List ---------- */

export async function list(view) {
  view.innerHTML = `<div class="loading"><span></span>Loading…</div>`;
  let docs = [];
  try {
    docs = (await studio("documents")).documents;
  } catch (e) {
    view.innerHTML = head("Something went wrong.") + `<p class="muted">${esc(e.message)}</p>`;
    return;
  }
  const groups = {};
  Object.entries(TEMPLATES).forEach(([k, t]) => (groups[t.group] ||= []).push([k, t]));
  view.innerHTML =
    head("Document Studio.", "Choose a template, fill it in, preview and export. Your company details come from the brand kit, so every document matches.") +
    `<section class="ds-gallery">${Object.entries(groups)
      .map(([g, items]) => `<h2 class="group-title">${g}</h2><div class="docs">${items.map(([k, t]) => `<a href="#/studio/new/${k}"><span class="doc-ico">${icon(t.slides ? "chart" : k === "proposal" ? "spark" : "file", 22)}</span><b>${t.label}</b><span>${t.text}</span></a>`).join("")}</div>`)
      .join("")}</section>
    <section class="card"><header class="card-head"><h2>Your documents</h2><label class="search" style="margin:0;width:min(320px,100%)">${icon("compass", 15)}<input type="search" placeholder="Search documents" data-find></label></header><div class="card-body">${
      docs.length
        ? `<table class="table"><thead><tr><th>Document</th><th class="hide-sm">Kind</th><th>Status</th><th class="hide-sm">Updated</th><th></th></tr></thead><tbody>${docs
            .map((d) => `<tr data-row="${esc(`${d.title} ${d.client || ""}`.toLowerCase())}"><td><a class="cell-link" href="#/studio/${d.id}"><b>${d.favourite ? "★ " : ""}${esc(d.title)}</b><small>${esc(d.client || "")}${d.sample ? " · sample" : ""}</small></a></td><td class="hide-sm muted">${esc(TEMPLATES[d.kind]?.label || d.kind)}</td><td><span class="pill is-${d.status === "approved" ? "won" : d.status === "reviewed" ? "quoted" : "draft"}">${d.status}</span></td><td class="hide-sm muted">${day(d.updated_at)}</td><td class="num"><button class="btn is-quiet is-small" type="button" data-dup="${d.id}">Duplicate</button></td></tr>`)
            .join("")}</tbody></table>`
        : empty("No documents yet", "Start from a template above. Load the sample data in Settings to see a finished proposal.")
    }</div></section>`;
  $("[data-find]", view)?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    $$("[data-row]", view).forEach((r) => (r.hidden = q && !r.dataset.row.includes(q)));
  });
  view.onclick = async (e) => {
    const b = e.target.closest("[data-dup]");
    if (!b) return;
    const { document: d } = await studioPost("document-duplicate", { id: b.dataset.dup });
    location.hash = `#/studio/${d.id}`;
  };
}

/* ---------- Creating ---------- */

export async function create(view, { kind, query }) {
  if (!TEMPLATES[kind]) return (location.hash = "#/studio");
  view.innerHTML = `<div class="loading"><span></span>Preparing…</div>`;
  const kit = await brandKit();
  const leadId = new URLSearchParams(query).get("lead");
  let lead = null;
  if (leadId) lead = (await api("leads")).leads.find((l) => String(l.id) === leadId) || null;
  const client = lead ? { client: lead.company || lead.name, contact: lead.name, email: lead.email, phone: lead.phone, address: lead.location || "", site: lead.site || "", location: lead.location || "", message: lead.message || "", services: kit.services.filter((s) => (lead.site || "").toLowerCase().includes(s.name.toLowerCase().split(" ")[0])).map((s) => s.id) } : {};
  if (TEMPLATES[kind].wizard) return wizard(view, kit, client, lead);
  const title = `${TEMPLATES[kind].label}${client.client ? `: ${client.client}` : ""}`;
  const { document: d } = await studioPost("document-save", { kind, title, data: { ...client, blocks: starter(kind, kit, client) }, lead_id: lead?.id });
  location.replace(`#/studio/${d.id}`);
}

async function wizard(view, kit, c, lead) {
  view.innerHTML =
    head("Proposal pack.", "Choose the client and services; the studio assembles a branded cover, introduction, services, quotation, credentials and contact page into one PDF.", `<a class="btn is-quiet" href="#/studio">${icon("back", 15)} Document Studio</a>`) +
    `<form class="wizard" data-wizard>
      <section class="card"><header class="card-head"><h2>1. Client</h2>${lead ? `<span class="chip">From the enquiry by ${esc(lead.name)}</span>` : ""}</header><div class="card-body grid is-2 is-flat">
        <label class="field"><span>Organisation</span><input name="client" value="${esc(c.client || "")}" required></label>
        <label class="field"><span>Contact</span><input name="contact" value="${esc(c.contact || "")}"></label>
        <label class="field"><span>Email</span><input name="email" value="${esc(c.email || "")}"></label>
        <label class="field"><span>Site or requirement</span><input name="site" value="${esc(c.site || "")}"></label>
        <label class="field"><span>Location</span><input name="location" value="${esc(c.location || "")}"></label>
        <label class="field"><span>Cover photograph</span><select name="photo">${PHOTOS.map((p) => `<option${p === "balfour-site" ? " selected" : ""}>${p}</option>`).join("")}</select></label>
      </div></section>
      <section class="card"><header class="card-head"><h2>2. Services</h2></header><div class="card-body"><div class="checks">${kit.services.map((s) => `<label class="check-card"><input type="checkbox" name="svc" value="${s.id}"${(c.services || []).includes(s.id) ? " checked" : ""}><b>${esc(s.name)}</b><small>${esc(s.summary)}</small></label>`).join("")}</div></div></section>
      <section class="card"><header class="card-head"><h2>3. Sections</h2></header><div class="card-body checks is-sections">
        ${[["intro", "Introduction"], ["services", "Service overview"], ["quote", "Quotation"], ["credentials", "Credentials"], ["coverage", "Coverage"], ["terms", "Approved terms"]].map(([k, l]) => `<label class="st-check"><input type="checkbox" name="opt" value="${k}" checked> ${l}</label>`).join("")}
      </div></section>
      <div class="row-end"><button class="btn" type="submit">${icon("spark", 15)} Build the proposal</button></div>
    </form>`;
  $("[data-wizard]", view).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const client = { client: f.client.value, contact: f.contact.value, email: f.email.value, site: f.site.value, location: f.location.value, message: c.message || "", services: $$('[name="svc"]:checked', f).map((x) => x.value) };
    const opts = Object.fromEntries($$('[name="opt"]', f).map((x) => [x.value, x.checked]));
    opts.photo = f.photo.value;
    const blocks = proposalPack(kit, client, opts);
    const { document: d } = await studioPost("document-save", { kind: "proposal", title: `Proposal: ${client.client || "new client"}`, data: { ...client, blocks }, lead_id: lead?.id });
    toast("Proposal assembled. Fill in the prices and check the wording.");
    location.hash = `#/studio/${d.id}`;
  });
}

/* ---------- Editing ---------- */

export async function edit(view, { id }) {
  view.innerHTML = `<div class="loading"><span></span>Loading…</div>`;
  let doc, versions, locations, current;
  try {
    [{ document: doc, versions }, { locations }, current] = await Promise.all([studio("document", { params: { id } }), studio("locations"), brandKit()]);
  } catch (e) {
    view.innerHTML = head("Something went wrong.") + `<p class="muted">${esc(e.message)}</p>`;
    return;
  }
  const kit = Object.keys(doc.brand || {}).length ? { ...current, ...doc.brand } : current;
  doc.data.blocks ||= [];
  const ctx = { kit, data: doc.data, locations };
  const slides = TEMPLATES[doc.kind]?.slides;
  const brandChanged = (doc.brand?.version || 0) < current.version;
  view.innerHTML = `
    <div class="ds-top">
      <a class="btn is-quiet is-small" href="#/studio">${icon("back", 14)}</a>
      <input class="ds-title" value="${esc(doc.title)}" data-title aria-label="Document title">
      <select data-status aria-label="Status">${["draft", "reviewed", "approved"].map((s) => `<option${s === doc.status ? " selected" : ""}>${s}</option>`).join("")}</select>
      <span class="ds-saved" data-saved>Saved</span>
      <span class="ds-top-actions">
        <button class="btn is-quiet is-small" type="button" data-fav title="Favourite">${doc.favourite ? "★" : "☆"}</button>
        <button class="btn is-quiet is-small" type="button" data-history>${icon("clock", 14)} History</button>
        <button class="btn is-quiet is-small" type="button" data-version>Save version</button>
        <details class="ds-menu"><summary class="btn is-quiet is-small">More</summary><div class="ds-menu-list">
          <button type="button" data-dup>Duplicate</button>
          ${slides ? "" : '<button type="button" data-docx>Word document (.docx)</button>'}
          <button type="button" data-print>Print</button>
          <button type="button" data-delete class="is-danger">Delete</button>
        </div></details>
        <button class="btn is-small" type="button" data-pdf>${icon("download", 14)} PDF</button>
      </span>
    </div>
    ${brandChanged ? `<p class="note is-warn">This document uses the brand kit as it was when it was made (version ${doc.brand?.version || 1}). <button class="link" type="button" data-rebrand>Update it to the current brand</button></p>` : ""}
    <div class="ds-app">
      <aside class="ds-blocks">
        <div class="ds-client">${["client", "contact", "email"].map((k) => `<label class="field"><span>${k === "client" ? "Client" : k === "contact" ? "Contact" : "Email"}</span><input data-client="${k}" value="${esc(doc.data[k] || "")}"></label>`).join("")}</div>
        <ol class="ds-list" data-list></ol>
        <div class="ds-add"><select data-add-type><option value="">+ Add a section…</option>${Object.entries(BLOCKS).filter(([k]) => (slides ? k === "slide" : k !== "slide")).map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></div>
      </aside>
      <div class="ds-preview" data-preview></div>
    </div>`;

  const listEl = $("[data-list]", view);
  const preview = $("[data-preview]", view);
  let open = doc.data.blocks[0]?.id;
  let timer;
  let saving = Promise.resolve();

  const save = (extra = {}) => {
    clearTimeout(timer);
    $("[data-saved]", view).textContent = "Saving…";
    saving = saving.then(async () => {
      try {
        const r = await studioPost("document-save", { id: doc.id, title: doc.title, status: doc.status, data: doc.data, favourite: doc.favourite, ...extra });
        doc.updated_at = r.document.updated_at;
        $("[data-saved]", view).textContent = `Saved ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
      } catch (e) {
        $("[data-saved]", view).textContent = "Not saved";
        toast(e.message, { error: true });
      }
    });
    return saving;
  };
  const later = () => {
    $("[data-saved]", view).textContent = "Editing…";
    clearTimeout(timer);
    timer = setTimeout(save, 1200);
  };

  const drawPreview = () => {
    const pages = paginate(doc, ctx);
    preview.innerHTML = `<div class="ds-pages ${slides ? "is-slides" : ""}" style="--accent:${kit.colours.accent};--primary:${kit.colours.primary}">${pages.join("")}</div>`;
    preview.dataset.count = pages.length;
  };
  const drawList = () => {
    listEl.innerHTML = doc.data.blocks.map((b, i) => `<li class="ds-block${b.id === open ? " is-open" : ""}" draggable="true" data-id="${b.id}">
      <header><span class="ds-grip" title="Drag to reorder">⋮⋮</span><button type="button" data-toggle><b>${esc(BLOCKS[b.type] || b.type)}</b><small>${esc(summary(b))}</small></button>
      <span class="ds-block-tools"><button type="button" data-up title="Move up"${i ? "" : " disabled"}>↑</button><button type="button" data-down title="Move down"${i < doc.data.blocks.length - 1 ? "" : " disabled"}>↓</button><button type="button" data-copy title="Duplicate">⧉</button><button type="button" data-remove title="Remove">✕</button></span></header>
      ${b.id === open ? `<div class="ds-block-form">${blockForm(b, ctx)}</div>` : ""}</li>`).join("");
  };
  drawList();
  drawPreview();
  document.fonts?.ready.then(drawPreview);
  // Writing help shows only when it's switched on (ANTHROPIC_API_KEY).
  studio("integrations")
    .then((i) => {
      ctx.ai = Boolean(i.ai);
      if (ctx.ai) drawList();
    })
    .catch(() => {});

  const blockById = (el) => doc.data.blocks.find((b) => b.id === el.closest("[data-id]")?.dataset.id);
  listEl.addEventListener("input", (e) => {
    const b = blockById(e.target);
    const k = e.target.dataset.k;
    if (!b || !k) return;
    setPath(b, k, e.target.type === "checkbox" ? e.target.checked : e.target.value, e.target);
    drawPreview();
    later();
  });
  listEl.addEventListener("change", (e) => {
    if (e.target.dataset.rerender) drawList();
  });
  listEl.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    const b = blockById(t);
    const i = doc.data.blocks.indexOf(b);
    if (t.dataset.assist) return assistReview(t);
    if (t.matches("[data-toggle]")) open = open === b.id ? null : b.id;
    else if (t.matches("[data-up]")) doc.data.blocks.splice(i - 1, 0, ...doc.data.blocks.splice(i, 1));
    else if (t.matches("[data-down]")) doc.data.blocks.splice(i + 1, 0, ...doc.data.blocks.splice(i, 1));
    else if (t.matches("[data-copy]")) doc.data.blocks.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(b)), id: uid() });
    else if (t.matches("[data-remove]")) doc.data.blocks.splice(i, 1);
    else if (t.dataset.rowAdd) {
      const rows = (b[t.dataset.rowAdd] ||= []);
      rows.push(t.dataset.rowAdd === "rows" && b.type === "pricing" ? { item: "", qty: "", unit: "hours", rate: "" } : b.type === "actions" ? { action: "", owner: "", due: "" } : b.type === "facts" ? ["", ""] : (b.head || []).map(() => ""));
    } else if (t.dataset.rowDel) b[t.dataset.rowDel.split(":")[0]].splice(Number(t.dataset.rowDel.split(":")[1]), 1);
    else return;
    drawList();
    drawPreview();
    later();
  });
  // Drag to reorder.
  let dragId = null;
  listEl.addEventListener("dragstart", (e) => {
    if (e.target.closest(".ds-block-form")) return e.preventDefault();
    dragId = e.target.closest("[data-id]")?.dataset.id;
  });
  listEl.addEventListener("dragover", (e) => {
    if (!dragId) return;
    e.preventDefault();
    $$(".ds-block", listEl).forEach((li) => li.classList.toggle("is-over", li === e.target.closest(".ds-block")));
  });
  listEl.addEventListener("drop", (e) => {
    const over = e.target.closest("[data-id]");
    if (!dragId || !over || over.dataset.id === dragId) return (dragId = null);
    e.preventDefault();
    const from = doc.data.blocks.findIndex((b) => b.id === dragId);
    const [moved] = doc.data.blocks.splice(from, 1);
    doc.data.blocks.splice(doc.data.blocks.findIndex((b) => b.id === over.dataset.id), 0, moved);
    dragId = null;
    drawList();
    drawPreview();
    later();
  });

  $$("[data-client]", view).forEach((el) =>
    el.addEventListener("input", () => {
      doc.data[el.dataset.client] = el.value;
      drawPreview();
      later();
    }),
  );
  $("[data-title]", view).addEventListener("input", (e) => {
    doc.title = e.target.value;
    drawPreview();
    later();
  });
  $("[data-status]", view).addEventListener("change", (e) => {
    doc.status = e.target.value;
    save();
    toast(`Marked ${doc.status}. A version was saved.`);
  });
  $("[data-add-type]", view).addEventListener("change", (e) => {
    const type = e.target.value;
    if (!type) return;
    const b = B(type, type === "pricing" ? { rows: [{ item: "", qty: "", unit: "hours", rate: "" }], vat: 20 } : type === "table" ? { head: ["Column", "Column"], rows: [["", ""]] } : type === "facts" ? { rows: [["", ""]] } : type === "actions" ? { rows: [{ action: "", owner: "", due: "" }] } : type === "services" ? { ids: [] } : type === "contact" ? { staffIds: kit.staff.slice(0, 1).map((s) => s.id) } : type === "slide" ? { title: "New slide", points: "", photo: "hero" } : {});
    doc.data.blocks.push(b);
    open = b.id;
    e.target.value = "";
    drawList();
    drawPreview();
    later();
  });

  const fileBase = () => window.NCSExport?.fileName([doc.title, kit.company.name], "x").replace(/\.x$/, "") || doc.title;
  const ensureExporter = async () => {
    if (!window.NCSExport) await new Promise((ok, no) => document.head.append(Object.assign(document.createElement("script"), { src: "/admin/tools/assets/js/exporter.js", onload: ok, onerror: no })));
  };
  view.onclick = async (e) => {
    const t = e.target.closest("button");
    if (!t || t.closest("[data-list]")) return;
    t.closest("details")?.removeAttribute("open");
    if (t.matches("[data-pdf]")) {
      t.disabled = true;
      try {
        await ensureExporter();
        const pages = paginate(doc, ctx);
        const html = `<div class="ds-pages ${slides ? "is-slides" : ""}" style="--accent:${kit.colours.accent};--primary:${kit.colours.primary}">${pages.join("")}</div>`;
        const { blob } = await window.NCSExport.pagesPdf({ html, selector: ".ds-page", pt: slides ? [960, 540] : [595.28, 841.89], scale: slides ? 2 : 2.6, meta: { title: doc.title, subject: `${TEMPLATES[doc.kind]?.label} for ${doc.data.client || ""}`, author: kit.company.name } });
        window.NCSExport.save(blob, `${fileBase()}.pdf`);
        if (doc.status === "draft") toast("Saved. This document is still a draft: have it reviewed before sending.");
      } catch (err) {
        toast(err.message || "The PDF couldn't be made.", { error: true });
      }
      t.disabled = false;
    }
    if (t.matches("[data-docx]")) {
      t.disabled = true;
      try {
        await ensureExporter();
        const blob = await toDocx(doc, ctx);
        window.NCSExport.save(blob, `${fileBase()}.docx`);
      } catch (err) {
        console.error(err);
        toast("The Word file couldn't be made. Use PDF instead.", { error: true });
      }
      t.disabled = false;
    }
    if (t.matches("[data-print]")) {
      const w = window.open("", "_blank");
      w.document.write(`<!doctype html><html><head><title>${esc(doc.title)}</title><link rel="stylesheet" href="/admin/admin.css"><style>@page{size:${slides ? "297mm 167mm" : "A4"};margin:0}body{background:#fff}.ds-pages{gap:0}.ds-page{box-shadow:none;break-after:page}</style></head><body>${preview.innerHTML}</body></html>`);
      w.document.close();
      setTimeout(() => w.print(), 600);
    }
    if (t.matches("[data-version]")) {
      await save({ version: true, note: "Saved a version" });
      toast("Version saved.");
    }
    if (t.matches("[data-fav]")) {
      doc.favourite = !doc.favourite;
      t.textContent = doc.favourite ? "★" : "☆";
      save();
    }
    if (t.matches("[data-dup]")) {
      await save();
      const { document: d } = await studioPost("document-duplicate", { id: doc.id });
      location.hash = `#/studio/${d.id}`;
    }
    if (t.matches("[data-delete]") && (await confirmBox(`Delete "${doc.title}" and its history?`))) {
      await studioPost("document-delete", { id: doc.id });
      location.hash = "#/studio";
    }
    if (t.matches("[data-history]")) history(doc, versions);
    if (t.matches("[data-rebrand]") && (await confirmBox("Update this document to the current brand kit? Its words stay as they are.", { ok: "Update" }))) {
      await save();
      await studioPost("document-rebrand", { id: doc.id });
      await brandKit(true);
      edit(view, { id: doc.id });
    }
  };
}

function summary(b) {
  const s = b.title || b.text || b.to || b.caption || b.intro || b.name || (b.rows?.length ? `${b.rows.length} rows` : "") || (b.ids?.length ? `${b.ids.length} services` : "");
  return String(s).replace(/[#*\n]+/g, " ").trim().slice(0, 60);
}

function setPath(b, k, v, el) {
  if (k === "headText") {
    b.head = String(v).split("|").map((h) => h.trim());
    b.rows = (b.rows || []).map((r) => b.head.map((_, j) => r[j] ?? ""));
    return;
  }
  if (k.startsWith("svc:")) {
    const id = k.slice(4);
    b.ids = el.checked ? [...new Set([...(b.ids || []), id])] : (b.ids || []).filter((x) => x !== id);
    return;
  }
  if (k.startsWith("staff:")) {
    const id = k.slice(6);
    b.staffIds = el.checked ? [...new Set([...(b.staffIds || []), id])] : (b.staffIds || []).filter((x) => x !== id);
    return;
  }
  const keys = k.split(".");
  const last = keys.pop();
  const target = keys.reduce((o, key) => (o[key] ??= /^\d+$/.test(key) ? [] : {}), b);
  target[last] = v;
}

/* ---------- Writing help (optional) ---------- */

const ASSIST = [
  ["tidy", "Tidy up"],
  ["shorter", "Shorter"],
  ["formal", "More formal"],
  ["friendly", "Warmer"],
  ["notes", "Notes to paragraphs"],
];
const assist = (ctx) =>
  ctx.ai ? `<div class="ds-assist"><span>Writing help</span>${ASSIST.map(([k, l]) => `<button type="button" data-assist="${k}">${l}</button>`).join("")}</div>` : "";

/* Asks for a reworded version, then shows it beside the original. Nothing
   changes until the user reads it and chooses to use it. */
async function assistReview(btn) {
  const ta = btn.closest(".ds-block-form")?.querySelector("textarea");
  if (!ta || !ta.value.trim()) return toast("Write something first, then ask for help with it.");
  const tools = btn.closest(".ds-assist");
  tools.classList.add("is-busy");
  let data;
  try {
    const res = await fetch("/api/assist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ task: btn.dataset.assist, text: ta.value }), signal: AbortSignal.timeout(60_000) });
    data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Something went wrong (${res.status}).`);
  } catch (e) {
    return toast(e.name === "TimeoutError" ? "Writing help took too long. Try again." : e.message, { error: true });
  } finally {
    tools.classList.remove("is-busy");
  }
  const d = document.createElement("dialog");
  d.className = "dialog is-wide";
  d.innerHTML = `<div class="dialog-head"><h2>Check the suggestion</h2><button class="icon-btn" type="button" data-close>✕</button></div>
    <p class="note is-warn">Writing help only rewords what you wrote, but it can still get things wrong. Check every name, number and promise before you use it.${data.truncated ? " This suggestion was cut short." : ""}</p>
    <div class="ds-assist-compare"><label class="field"><span>Yours</span><textarea rows="12" readonly>${esc(ta.value)}</textarea></label>
    <label class="field"><span>Suggestion <em>you can edit it here</em></span><textarea rows="12" data-suggestion>${esc(data.text)}</textarea></label></div>
    <div class="dialog-foot"><button class="btn is-quiet" type="button" data-close>Keep mine</button><button class="btn" type="button" data-use>Use the suggestion</button></div>`;
  document.body.append(d);
  d.addEventListener("close", () => d.remove());
  d.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) d.close();
    if (e.target.closest("[data-use]")) {
      ta.value = $("[data-suggestion]", d).value;
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      d.close();
      toast("Suggestion used. Undo with Ctrl Z in the box, or restore a version from History.");
    }
  });
  d.showModal();
}

function blockForm(b, ctx) {
  const { kit } = ctx;
  const inp = (k, label, v = b[k] ?? "", opts = {}) =>
    opts.area ? `<label class="field"><span>${label}</span><textarea data-k="${k}" rows="${opts.rows || 4}">${esc(v)}</textarea></label>` : `<label class="field"><span>${label}</span><input data-k="${k}" value="${esc(v)}"${opts.type ? ` type="${opts.type}"` : ""}></label>`;
  const photo = (k = "photo") => `<label class="field"><span>Photograph</span><select data-k="${k}">${PHOTOS.map((p) => `<option${p === b[k] ? " selected" : ""}>${p}</option>`).join("")}</select></label>`;
  switch (b.type) {
    case "cover":
      return inp("title", "Title") + inp("subtitle", "Subtitle") + inp("client", "Prepared for <em>{client} uses the client's name</em>") + photo();
    case "heading":
      return inp("text", "Heading");
    case "text":
      return inp("text", "Text <em>## heading, - list, **bold**</em>", b.text, { area: true, rows: 8 }) + assist(ctx);
    case "address":
      return inp("to", "To", b.to, { area: true, rows: 4 }) + inp("date", "Date") + inp("ref", "Reference");
    case "facts":
      return `${(b.rows || []).map((r, i) => `<div class="ds-row"><input data-k="rows.${i}.0" value="${esc(r[0])}" placeholder="Label"><input data-k="rows.${i}.1" value="${esc(r[1])}" placeholder="Value"><button type="button" data-row-del="rows:${i}">✕</button></div>`).join("")}<button class="link" type="button" data-row-add="rows">+ Add a row</button>`;
    case "services":
      return inp("intro", "Introduction") + `<label class="st-check"><input type="checkbox" data-k="compact"${b.compact ? " checked" : ""}> Compact list</label><div class="ds-checks">${kit.services.map((s) => `<label class="st-check"><input type="checkbox" data-k="svc:${s.id}"${(b.ids || []).includes(s.id) ? " checked" : ""}> ${esc(s.name)}</label>`).join("")}</div><p class="muted small">Descriptions come from the brand kit.</p>`;
    case "pricing":
      return `${(b.rows || []).map((r, i) => `<div class="ds-row is-price"><input data-k="rows.${i}.item" value="${esc(r.item)}" placeholder="Service"><input data-k="rows.${i}.qty" value="${esc(r.qty)}" placeholder="Qty"><input data-k="rows.${i}.unit" value="${esc(r.unit || "")}" placeholder="Unit"><input data-k="rows.${i}.rate" value="${esc(r.rate)}" placeholder="Rate £"><button type="button" data-row-del="rows:${i}">✕</button></div>`).join("")}<button class="link" type="button" data-row-add="rows">+ Add a line</button>` + inp("vat", "VAT %", b.vat ?? 20, { type: "number" }) + inp("notes", "Notes");
    case "image":
      return photo() + inp("caption", "Caption");
    case "table":
      return `<label class="field"><span>Column headings <em>separated by |</em></span><input data-k="headText" value="${esc((b.head || []).join(" | "))}" data-rerender="1"></label>${(b.rows || []).map((r, i) => `<div class="ds-row">${(b.head || []).map((_, j) => `<input data-k="rows.${i}.${j}" value="${esc(r[j] ?? "")}">`).join("")}<button type="button" data-row-del="rows:${i}">✕</button></div>`).join("")}<button class="link" type="button" data-row-add="rows">+ Add a row</button>`;
    case "actions":
      return `${(b.rows || []).map((r, i) => `<div class="ds-row"><input data-k="rows.${i}.action" value="${esc(r.action)}" placeholder="Action"><input data-k="rows.${i}.owner" value="${esc(r.owner)}" placeholder="Owner"><input data-k="rows.${i}.due" value="${esc(r.due)}" placeholder="Due"><button type="button" data-row-del="rows:${i}">✕</button></div>`).join("")}<button class="link" type="button" data-row-add="rows">+ Add an action</button>`;
    case "quote":
      return inp("text", "Quote", b.text, { area: true }) + inp("who", "Who said it");
    case "terms":
      return inp("title", "Heading", b.title || "Terms and conditions") + inp("text", "The company's approved terms <em>paste them in exactly as supplied</em>", b.text || "", { area: true, rows: 10 }) + `<p class="muted small">Use only terms the company has approved. The studio never writes contractual terms, and writing help is not offered here.</p>`;
    case "signature":
      return inp("name", "Name") + inp("role", "Role");
    case "contact":
      return `<div class="ds-checks">${kit.staff.map((s) => `<label class="st-check"><input type="checkbox" data-k="staff:${s.id}"${(b.staffIds || []).includes(s.id) ? " checked" : ""}> ${esc(s.name)}, ${esc(s.role)}</label>`).join("")}</div><p class="muted small">Staff come from the brand kit.</p>`;
    case "coverage":
      return inp("text", "Coverage", b.text, { area: true, rows: 2 }) + assist(ctx) + `<p class="muted small">Public coverage areas from Locations are listed under it.</p>`;
    case "slide":
      return inp("title", "Title") + inp("points", "Points <em>one per line</em>", b.points, { area: true, rows: 5 }) + photo() + `<label class="field"><span>Layout</span><select data-k="layout"><option value="">Photo and points</option><option value="title"${b.layout === "title" ? " selected" : ""}>Title slide</option></select></label>`;
    case "credentials":
      return `<p class="muted small">Shows only the verified credentials in the brand kit.</p>`;
    case "pagebreak":
      return `<p class="muted small">Starts a new page here.</p>`;
  }
  return "";
}

function history(doc, versions) {
  const d = document.createElement("dialog");
  d.className = "dialog is-wide";
  d.innerHTML = `<div class="dialog-head"><h2>Version history</h2><button class="icon-btn" type="button" data-close>✕</button></div>
    ${versions.length ? `<ul class="list">${versions.map((v) => `<li><span><b>${esc(v.note || "Saved")}</b><small>${day(v.ts, { day: "numeric", month: "short", year: "numeric" })} ${new Date(v.ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · ${esc(v.status || "")}</small></span><button class="btn is-quiet is-small" type="button" data-restore="${v.id}">Restore</button></li>`).join("")}</ul>` : empty("No versions yet")}`;
  document.body.append(d);
  d.addEventListener("close", () => d.remove());
  d.onclick = async (e) => {
    if (e.target.closest("[data-close]")) return d.close();
    const r = e.target.closest("[data-restore]");
    if (!r || !(await confirmBox("Restore this version? The current one is kept in the history.", { ok: "Restore" }))) return;
    await studioPost("document-restore", { version: r.dataset.restore });
    d.close();
    location.reload();
  };
  d.showModal();
}

/* ---------- Word export ---------- */

async function toDocx(doc, ctx) {
  const src = "https://unpkg.com/docx@8.5.0/build/index.umd.js";
  if (!window.docx) await new Promise((ok, no) => document.head.append(Object.assign(document.createElement("script"), { src, onload: ok, onerror: no })));
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ImageRun, Header, Footer, AlignmentType, PageNumber, PageBreak, BorderStyle } = window.docx;
  const { kit, data } = ctx;
  const accent = kit.colours.accent.replace("#", "");
  const runs = (text) =>
    String(text)
      .split(/(\*\*[^*]+\*\*)/)
      .filter(Boolean)
      .map((part) => (part.startsWith("**") ? new TextRun({ text: part.slice(2, -2), bold: true }) : new TextRun(part)));
  const para = (t) => new Paragraph({ children: runs(t), spacing: { after: 160 } });
  const textBlock = (t) =>
    String(fill(t, data))
      .split(/\n\s*\n/)
      .flatMap((p) => {
        const lines = p.split("\n");
        if (/^##\s/.test(lines[0])) return [new Paragraph({ text: lines[0].replace(/^##\s+/, ""), heading: HeadingLevel.HEADING_2 }), ...lines.slice(1).map(para)];
        if (lines.every((l) => /^[-*]\s/.test(l))) return lines.map((l) => new Paragraph({ children: runs(l.replace(/^[-*]\s+/, "")), bullet: { level: 0 } }));
        return [para(lines.join(" "))];
      });
  const table = (head, rows) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ tableHeader: true, children: head.map((h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(h), bold: true, color: "6E6E73" })] })] })) }),
        ...rows.map((r) => new TableRow({ children: r.map((c) => new TableCell({ children: [new Paragraph(String(c ?? ""))] })) })),
      ],
    });
  const children = [];
  for (const b of doc.data.blocks) {
    switch (b.type) {
      case "cover":
        children.push(new Paragraph({ children: [new TextRun({ text: b.client ? `Prepared for ${fill(b.client, data)}` : kit.company.name, color: accent, bold: true })] }), new Paragraph({ text: fill(b.title, data), heading: HeadingLevel.TITLE }), new Paragraph({ text: fill(b.subtitle || "", data) }), new Paragraph({ children: [new PageBreak()] }));
        break;
      case "heading":
        children.push(new Paragraph({ text: fill(b.text, data), heading: HeadingLevel.HEADING_1 }));
        break;
      case "text":
        children.push(...textBlock(b.text));
        break;
      case "address":
        children.push(...String(b.to || "").split("\n").map((l) => new Paragraph(l)), new Paragraph({ text: b.date || "", spacing: { before: 200 } }), ...(b.ref ? [new Paragraph(`Ref: ${b.ref}`)] : []), new Paragraph(""));
        break;
      case "facts":
        children.push(table(["", ""], (b.rows || []).filter((r) => r[0] || r[1])));
        break;
      case "services": {
        if (b.intro) children.push(para(b.intro));
        (b.ids || []).map((id) => kit.services.find((s) => s.id === id)).filter(Boolean).forEach((s) => children.push(new Paragraph({ children: [new TextRun({ text: s.name, bold: true })] }), para(s.summary)));
        break;
      }
      case "pricing": {
        const sub = (b.rows || []).reduce((a, r) => a + n(r.qty) * n(r.rate), 0);
        const vat = (sub * n(b.vat)) / 100;
        children.push(table(["Service", "Quantity", "Rate", "Amount"], [...(b.rows || []).map((r) => [r.item, `${r.qty} ${r.unit || ""}`, r.rate ? money(n(r.rate)) : "", r.qty && r.rate ? money(n(r.qty) * n(r.rate)) : "To confirm"]), ["", "", "Subtotal", money(sub)], ...(n(b.vat) ? [["", "", `VAT ${n(b.vat)}%`, money(vat)]] : []), ["", "", "Total", money(sub + vat)]]));
        if (b.notes) children.push(para(b.notes));
        break;
      }
      case "credentials":
        children.push(new Paragraph({ text: "Accreditations", heading: HeadingLevel.HEADING_3 }), ...kit.credentials.filter((x) => x.verified).map((x) => para(`**${x.name}**${x.reference ? ` · ${x.reference}` : ""}`)));
        break;
      case "coverage":
        children.push(new Paragraph({ text: "Where we work", heading: HeadingLevel.HEADING_3 }), para(b.text || kit.company.region));
        break;
      case "table":
        children.push(table(b.head || [], b.rows || []));
        break;
      case "actions":
        children.push(table(["Action", "Owner", "Due"], (b.rows || []).map((r) => [r.action, r.owner, r.due])));
        break;
      case "quote":
        children.push(new Paragraph({ children: [new TextRun({ text: `“${b.text}”`, italics: true })] }), ...(b.who ? [new Paragraph(b.who)] : []));
        break;
      case "terms": {
        children.push(...(String(b.text || "").trim() ? [new Paragraph({ text: b.title || "Terms and conditions", heading: HeadingLevel.HEADING_3 }), ...textBlock(b.text)] : [para("Terms: paste the company's approved terms here.")]));
        break;
      }
      case "signature":
        children.push(new Paragraph({ text: "", spacing: { before: 600 } }), new Paragraph({ children: [new TextRun({ text: b.name, bold: true })] }), new Paragraph(b.role || ""), new Paragraph(kit.company.name));
        break;
      case "contact":
        children.push(new Paragraph({ text: "Get in touch", heading: HeadingLevel.HEADING_1 }), ...(b.staffIds || []).map((id) => kit.staff.find((s) => s.id === id)).filter(Boolean).flatMap((s) => [para(`**${s.name}**, ${s.role}`), para(`${s.phone} · ${s.email}`)]), para(`**${kit.company.name}**`), para(kit.company.address), para(`${kit.company.phone} · ${kit.company.web}`));
        break;
      case "pagebreak":
        children.push(new Paragraph({ children: [new PageBreak()] }));
        break;
      case "image": {
        try {
          const buf = await fetch(b.src || `/images/${b.photo || "hero"}.jpg`).then((r) => r.arrayBuffer());
          children.push(new Paragraph({ children: [new ImageRun({ data: buf, transformation: { width: 600, height: 340 } })] }), ...(b.caption ? [new Paragraph({ children: [new TextRun({ text: b.caption, color: "6E6E73", size: 18 })] })] : []));
        } catch {}
        break;
      }
    }
  }
  let logo = null;
  try {
    logo = await fetch(kit.logos.light).then((r) => r.arrayBuffer());
  } catch {}
  const d = new Document({
    creator: kit.company.name,
    title: doc.title,
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } }, paragraphStyles: [{ id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", run: { size: 32, bold: true, color: "1D1D1F" }, paragraph: { spacing: { before: 280, after: 120 } } }] },
    sections: [
      {
        headers: { default: new Header({ children: [new Paragraph({ children: logo ? [new ImageRun({ data: logo, transformation: { width: 150, height: 50 } })] : [new TextRun(kit.company.name)], border: { bottom: { color: accent, size: 12, style: BorderStyle.SINGLE, space: 6 } } })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${kit.footer}  ·  Page `, size: 16, color: "86868B" }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "86868B" })] })] }) },
        children,
      },
    ],
  });
  return Packer.toBlob(d);
}
