/* NCS Business Studio: the hubs. Brand Studio, Website Insights with its
   practical questions and campaign links, Locations and coverage, the
   content Library, and Settings with the brand kit everything inherits. */

import {
  $, $$, COLORS, api, bars, brandKit, card, clock, confirmBox, day, delta, download, empty, esc, head, icon, kpi, lineChart, num,
  pointLabel, rangeLabel, rangePicker, secs, share, studio, studioPost, toast, wireCharts,
} from "./core.js";

const loading = (view) => (view.innerHTML = `<div class="loading" aria-live="polite"><span></span>Loading…</div>`);
function failed(view, error, retry) {
  view.innerHTML = head("Something went wrong.") + card("", `<p class="muted">${esc(error.message)}</p><button class="btn" type="button" data-retry>Try again</button>`);
  $("[data-retry]", view).addEventListener("click", retry);
}
const sampleChip = (row) => (row?.sample ? `<span class="chip is-sample">Sample</span>` : "");
const uid = () => Math.random().toString(36).slice(2, 9);
const loadScript = (src) => new Promise((ok, no) => (document.querySelector(`script[src="${src}"]`) ? ok() : document.head.append(Object.assign(document.createElement("script"), { src, onload: ok, onerror: no }))));
const loadCss = (href) => document.querySelector(`link[href="${href}"]`) || document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href }));

/* ---------- Brand Studio ---------- */

const BRAND_TOOLS = [
  ["business-card", "Business cards", "card", "Staff cards from saved profiles, 3D preview, batch print"],
  ["email", "Email signatures and templates", "mail", "Matching signatures for the whole office, and business emails"],
  ["letterhead", "Letterhead and stationery", "file", "Letterheads, with or without a letter"],
  ["post", "Marketing and social", "megaphone", "Recruitment graphics, flyers, LinkedIn banners and posts"],
  ["sign", "Site signs", "sign", "Safety and security signage to UK standards"],
  ["badge", "Officer ID badges", "badge", "Photo, licence, QR to check, front and back"],
  ["certificate", "Certificates", "spark", "Training and long-service certificates"],
  ["pass", "Visitor passes", "badge", "Colour of the day, escort and contractor"],
];

export async function brandStudio(view) {
  loading(view);
  let kit;
  try {
    kit = await brandKit();
  } catch (e) {
    return failed(view, e, () => brandStudio(view));
  }
  view.innerHTML =
    head("Brand Studio.", "Cards, signatures, stationery and marketing, all drawing on the brand kit, so every piece matches.", `<a class="btn is-quiet" href="#/settings?tab=brand">${icon("gear", 15)} Edit the brand kit</a>`) +
    `<section class="brand-strip">
      <div class="brand-logos"><span class="is-light"><img src="${esc(kit.logos.light)}" alt="Logo on light"></span><span class="is-dark"><img src="${esc(kit.logos.dark)}" alt="Logo on dark"></span></div>
      <div class="brand-colours">${Object.entries(kit.colours).map(([k, c]) => `<span><i style="background:${esc(c)}"></i><b>${esc(k)}</b><small>${esc(c)}</small></span>`).join("")}</div>
      <div class="brand-type"><b style="font-family:${esc(kit.fonts.heading)}">${esc(kit.fonts.heading)}</b><small>headings</small><b>${esc(kit.fonts.body)}</b><small>text</small></div>
    </section>
    <div class="docs">${BRAND_TOOLS.map(([id, name, ic, text]) => `<a href="#/documents/${id}"><span class="doc-ico">${icon(ic, 22)}</span><b>${name}</b><span>${text}</span></a>`).join("")}</div>
    ${card("Staff profiles", kit.staff.length ? `<ul class="list">${kit.staff.map((s) => `<li><span><b>${esc(s.name)}</b> ${s.sample ? '<span class="chip is-sample">Sample</span>' : ""}<small>${esc(s.role)} · ${esc(s.phone)} · ${esc(s.email)}</small></span><span class="row-links"><a class="link" href="#/documents/business-card?staff=${encodeURIComponent(s.id)}">Card ${icon("arrow", 13)}</a><a class="link" href="#/documents/email?staff=${encodeURIComponent(s.id)}">Signature ${icon("arrow", 13)}</a></span></li>`).join("")}</ul>` : empty("No staff yet", "Add staff in the brand kit to fill cards and signatures."), { action: `<a class="link" href="#/settings?tab=staff">Manage staff ${icon("arrow", 14)}</a>` })}`;
}

/* ---------- Website Insights ---------- */

export async function insights(view, { days }) {
  loading(view);
  try {
    const [s, q] = await Promise.all([api("stats", { params: { days } }), studio("questions", { params: { days: [7, 30, 90, 365].includes(days) ? days : 30 } })]);
    const t = s.totals, p = s.previous, f = q.funnel;
    const conv = share(t.leads, t.visitors);
    view.innerHTML =
      head("Website Insights.", `What the website did ${rangeLabel(days)}, and the questions it answers.`, rangePicker(days) + `<button class="btn" type="button" data-summary>${icon("download", 15)} Branded summary (PDF)</button>`) +
      `<div class="kpis">
        ${kpi({ label: "Visitors", value: num(t.visitors), deltaHtml: delta(t.visitors, p.visitors) })}
        ${kpi({ label: "Visits", value: num(t.visits), deltaHtml: delta(t.visits, p.visits) })}
        ${kpi({ label: "Page views", value: num(t.views), deltaHtml: delta(t.views, p.views) })}
        ${kpi({ label: "Enquiries", value: num(t.leads), deltaHtml: delta(t.leads, p.leads) })}
        ${kpi({ label: "Form conversion", value: `${conv}%`, sub: "enquiries per visitor" })}
        ${kpi({ label: "Phone and email taps", value: num((t.events?.call || 0) + (t.events?.email || 0)) })}
      </div>
      <nav class="subnav"><a href="#/traffic">Traffic ${icon("arrow", 13)}</a><a href="#/sources">Sources and devices ${icon("arrow", 13)}</a><a href="#/speed">Speed and uptime ${icon("arrow", 13)}</a><a href="#/insights/campaigns">Campaign links ${icon("arrow", 13)}</a></nav>
      <div class="grid is-2">
        ${card("Which services attract interest?", bars(q.services, { name: (r) => (r.title || r.path).replace(/ - New Concept Security$/, ""), sub: (r) => r.path, limit: 8 }) + (q.byService.length ? `<h3 class="sub">Enquiries by service</h3>${bars(q.byService, { value: (r) => r.enquiries, limit: 6 })}` : ""))}
        ${card("Where are enquiries coming from?", q.sources.length ? bars(q.sources, { value: (r) => r.enquiries, limit: 8 }) + `<h3 class="sub">The page they enquired from</h3>${bars(q.byPage, { value: (r) => r.enquiries, limit: 6 })}` : empty("No enquiries in this period", "When the contact form is used, where each person first arrived from shows here."))}
      </div>
      ${card(
        "Are visitors reaching the contact form?",
        `<div class="funnel">${[
          ["Visitors", f.visitors],
          ["Looked at a service or contact page", f.interested],
          ["Reached the contact page", f.contact_page],
          ["Sent an enquiry", f.enquiries],
        ]
          .map(([l, n], i, a) => `<div class="funnel-step"><span style="width:${a[0][1] ? Math.max(4, (n / a[0][1]) * 100) : 0}%"></span><b>${num(n)}</b><small>${l}${i ? ` · ${share(n, a[0][1])}% of visitors` : ""}</small></div>`)
          .join("")}</div>`,
      )}
      ${card("Visitors and enquiries", lineChart(s.series, [{ key: "visitors", label: "Visitors", color: COLORS.red, area: true }, { key: "leads", label: "Enquiries", color: COLORS.ink }], pointLabel(days)))}
      <section class="note-block"><h3>About these figures</h3><p>Visits are measured by the website itself, without cookies: the same person on the same day counts once and nothing that identifies them is kept, so no consent banner is needed for this measurement. People who block scripts aren't counted. Figures update within a minute. Geography is approximate and comes from the hosting network; it's only available once the site runs on Vercel. Search keywords aren't measured (that needs Google Search Console, listed under Coming next).</p></section>`;
    wireCharts(view);
    $("[data-summary]", view).addEventListener("click", (e) => summaryPdf(e.target, s, q, days));
  } catch (e) {
    failed(view, e, () => insights(view, { days }));
  }
}

/* A branded one-page summary of the period, as a PDF. */
async function summaryPdf(btn, s, q, days) {
  btn.disabled = true;
  try {
    const kit = await brandKit();
    await loadScript("/admin/tools/assets/js/exporter.js");
    const t = s.totals;
    const rows = (list, val, name) => list.slice(0, 6).map((r) => `<tr><td>${esc(name(r))}</td><td style="text-align:right">${num(val(r))}</td></tr>`).join("") || `<tr><td colspan="2" style="color:#86868b">Nothing yet</td></tr>`;
    const html = `<div class="ins-pdf" style="width:794px;min-height:1123px;padding:56px 60px;box-sizing:border-box;background:#fff;color:#1d1d1f;font-family:Inter,-apple-system,Segoe UI,Arial,sans-serif;font-size:13px">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid ${kit.colours.accent};padding-bottom:18px"><img src="${kit.logos.light}" style="height:44px"><div style="text-align:right"><div style="font-size:22px;font-weight:700">Website summary</div><div style="color:#6e6e73">${esc(rangeLabel(days).replace(/^the /, "The "))} · made ${day(new Date())}</div></div></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:26px 0">${[["Visitors", t.visitors], ["Page views", t.views], ["Enquiries", t.leads], ["Conversion", `${share(t.leads, t.visitors)}%`]].map(([l, v]) => `<div style="background:#f5f5f7;border-radius:12px;padding:14px"><div style="color:#6e6e73;font-size:11px">${l}</div><div style="font-size:24px;font-weight:700">${typeof v === "number" ? num(v) : v}</div></div>`).join("")}</div>
      <h2 style="font-size:15px;margin:22px 0 8px">Most visited pages</h2><table style="width:100%;border-collapse:collapse">${rows(s.pages, (r) => r.visitors, (r) => r.title || r.name)}</table>
      <h2 style="font-size:15px;margin:22px 0 8px">Where visitors came from</h2><table style="width:100%;border-collapse:collapse">${rows(s.channels, (r) => r.visitors, (r) => r.name)}</table>
      <h2 style="font-size:15px;margin:22px 0 8px">Services that attracted interest</h2><table style="width:100%;border-collapse:collapse">${rows(q.services, (r) => r.visitors, (r) => (r.title || r.path).replace(/ - New Concept Security$/, ""))}</table>
      <p style="margin-top:28px;color:#86868b;font-size:10.5px">Measured by the website without cookies; visitors who block scripts are not counted. ${esc(kit.footer)}</p></div>`;
    const style = document.createElement("style");
    style.textContent = ".ins-pdf td{padding:7px 0;border-bottom:1px solid #ececee}";
    document.head.append(style);
    const { blob } = await window.NCSExport.documentPdf({ html, selector: ".ins-pdf", pt: [595.28, 841.89], meta: { title: "Website summary", author: kit.company.name } });
    window.NCSExport.save(blob, window.NCSExport.fileName(["Website summary", rangeLabel(days), kit.company.name], "pdf"));
    style.remove();
  } catch (e) {
    toast(e.message || "The summary couldn't be made.", { error: true });
  } finally {
    btn.disabled = false;
  }
}

/* ---------- Campaign links ---------- */

const siteOrigin = () => (location.origin.includes("localhost") ? "https://www.newconceptsecurity.co.uk" : location.origin);
const campaignUrl = (c) => {
  const u = new URL(c.destination || "/", siteOrigin());
  u.searchParams.set("utm_source", c.source || "link");
  u.searchParams.set("utm_medium", c.medium || "referral");
  u.searchParams.set("utm_campaign", c.slug);
  return u.toString();
};
async function qrSvg(text, px = 4) {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js");
  const q = window.qrcode(0, "M");
  q.addData(text);
  q.make();
  const n = q.getModuleCount();
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 ${n + 8} ${n + 8}" width="${(n + 8) * px}" height="${(n + 8) * px}"><rect x="-4" y="-4" width="${n + 8}" height="${n + 8}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

export async function campaigns(view, { days }) {
  loading(view);
  let list;
  try {
    list = (await studio("campaigns", { params: { days: [7, 30, 90, 365].includes(days) ? days : 30 } })).campaigns;
  } catch (e) {
    return failed(view, e, () => campaigns(view, { days }));
  }
  view.innerHTML =
    head("Campaign links.", "Make a tagged link and QR code for a recruitment drive, a mailshot or a flyer, then see the visits and enquiries it brings.", rangePicker(days) + `<button class="btn" type="button" data-new>${icon("plus", 15)} New campaign</button>`) +
    (list.length
      ? `<div class="camps">${list
          .map(
            (c) => `<article class="camp" data-id="${c.id}"><div class="camp-qr" data-qr="${esc(campaignUrl(c))}"></div>
          <div class="camp-body"><h3>${esc(c.name)} ${sampleChip(c)}</h3><p class="muted small">${esc(c.goal || "")}</p>
          <code class="camp-url">${esc(campaignUrl(c))}</code>
          <div class="camp-stats"><span><b>${num(c.views)}</b> visits through the link</span><span><b>${num(c.visitors)}</b> people</span><span><b>${num(c.enquiries)}</b> enquiries from them</span></div>
          <div class="row-start"><button class="btn is-small" type="button" data-copy>${icon("download", 13)} Copy link</button><button class="btn is-quiet is-small" type="button" data-qr-png>QR as PNG</button><button class="btn is-quiet is-small" type="button" data-qr-svg>QR as SVG</button><button class="btn is-quiet is-small" type="button" data-edit>Edit</button><button class="btn is-danger-quiet is-small" type="button" data-del>Delete</button></div></div></article>`,
          )
          .join("")}</div>`
      : card("", empty("No campaigns yet", "Create one to get a tagged link and a QR code for flyers, posters, emails and social posts."))) +
    `<p class="footnote">A visit is someone arriving through the link; an enquiry is someone who arrived through it and then sent the contact form the same day. A link click that never loads the page (blocked or abandoned) can't be counted.</p>`;
  for (const el of $$("[data-qr]", view)) el.innerHTML = await qrSvg(el.dataset.qr, 3);
  const byId = (el) => list.find((c) => String(c.id) === el.closest("[data-id]").dataset.id);
  view.onclick = async (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.matches("[data-new]")) return campaignForm(view, null, days);
    const c = byId(t);
    if (t.matches("[data-copy]")) {
      await navigator.clipboard.writeText(campaignUrl(c)).catch(() => {});
      return toast("Link copied.");
    }
    if (t.matches("[data-qr-svg]")) return download(`${c.slug}-qr.svg`, await qrSvg(campaignUrl(c), 10), "image/svg+xml");
    if (t.matches("[data-qr-png]")) {
      const svg = await qrSvg(campaignUrl(c), 16);
      const img = new Image();
      img.onload = () => {
        const cv = Object.assign(document.createElement("canvas"), { width: img.width, height: img.height });
        cv.getContext("2d").drawImage(img, 0, 0);
        cv.toBlob((b) => Object.assign(document.createElement("a"), { href: URL.createObjectURL(b), download: `${c.slug}-qr.png` }).click());
      };
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      return;
    }
    if (t.matches("[data-edit]")) return campaignForm(view, c, days);
    if (t.matches("[data-del]") && (await confirmBox(`Delete the campaign "${c.name}"? Its visits stay in the analytics.`))) {
      await studioPost("campaign-delete", { id: c.id });
      campaigns(view, { days });
    }
  };
}

function campaignForm(view, c, days) {
  const d = document.createElement("dialog");
  d.className = "dialog is-wide";
  c ||= { name: "", source: "", medium: "", destination: "/", goal: "" };
  d.innerHTML = `<form class="form" method="dialog"><div class="dialog-head"><h2>${c.id ? "Edit campaign" : "New campaign"}</h2></div>
    <label class="field"><span>Name</span><input name="name" value="${esc(c.name)}" required placeholder="Spring recruitment"></label>
    <div class="grid is-2 is-flat"><label class="field"><span>Where it's shared <em>source</em></span><input name="source" value="${esc(c.source || "")}" placeholder="facebook, flyer, newsletter"></label>
    <label class="field"><span>Type <em>medium</em></span><select name="medium">${["social", "email", "print", "qr", "paid", "referral"].map((m) => `<option${m === c.medium ? " selected" : ""}>${m}</option>`).join("")}</select></label></div>
    <label class="field"><span>Page it opens</span><input name="destination" value="${esc(c.destination)}" placeholder="/careers"></label>
    <label class="field"><span>Goal <em>for your own notes</em></span><input name="goal" value="${esc(c.goal || "")}"></label>
    <div class="row-end"><button class="btn is-quiet" value="cancel" formnovalidate>Cancel</button><button class="btn" value="save">Save</button></div></form>`;
  document.body.append(d);
  d.addEventListener("close", async () => {
    if (d.returnValue === "save") {
      const f = $("form", d);
      try {
        await studioPost("campaign-save", { id: c.id, name: f.name.value, source: f.source.value, medium: f.medium.value, destination: f.destination.value, goal: f.goal.value });
        campaigns(view, { days });
      } catch (e) {
        toast(e.message, { error: true });
      }
    }
    d.remove();
  });
  d.showModal();
}

/* ---------- Locations and coverage ---------- */

const CATS = { office: "Office", coverage: "Coverage area", site: "Client site", partner: "Partner", other: "Other" };
const CAT_COLOR = { office: "#A01010", coverage: "#A01010", site: "#1D1D1F", partner: "#2F6BC4", other: "#86868B" };
const km = (a, b) => {
  const R = 6371, t = (x) => (x * Math.PI) / 180;
  const h = Math.sin(t(b.lat - a.lat) / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(t(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export async function locations(view, { query }) {
  loading(view);
  let list;
  try {
    list = (await studio("locations")).locations;
  } catch (e) {
    return failed(view, e, () => locations(view, { query }));
  }
  const office = list.find((l) => l.category === "office" && l.lat);
  let filter = "all", term = "";
  view.innerHTML =
    head("Locations and coverage.", "Where we work: offices, the towns we cover and client sites. Public entries can be shown on the website and in proposals; private ones stay here.", `<button class="btn" type="button" data-new>${icon("plus", 15)} Add a location</button>`) +
    `<div class="loc-app"><div class="loc-map" data-map></div>
      <aside class="loc-side">
        <label class="search">${icon("compass", 15)}<input type="search" placeholder="Search name, address or postcode" data-find></label>
        <div class="seg" data-filters>${[["all", "All"], ...Object.entries(CATS)].map(([k, l]) => `<button type="button" data-filter="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("")}</div>
        <ul class="loc-list" data-list></ul>
      </aside></div>
    <p class="footnote">Distances are straight-line estimates from the head office; road distance is longer. Map data © OpenStreetMap contributors. Officer tracking isn't part of this studio: live operations stay in your security software.</p>`;
  loadCss("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js");
  const L = window.L;
  const map = L.map($("[data-map]", view), { scrollWheelZoom: false }).setView([53.78, -2.9], 9);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap contributors" }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  const shown = () => list.filter((l) => (filter === "all" || l.category === filter) && `${l.name} ${l.address} ${l.postcode}`.toLowerCase().includes(term));
  const draw = (fit = false) => {
    layer.clearLayers();
    const rows = shown();
    rows.filter((l) => l.lat != null).forEach((l) => {
      const color = CAT_COLOR[l.category] || "#1D1D1F";
      if (l.radius_km) L.circle([l.lat, l.lng], { radius: l.radius_km * 1000, color, weight: 1, fillOpacity: l.category === "coverage" ? 0.12 : 0.05 }).addTo(layer);
      L.circleMarker([l.lat, l.lng], { radius: l.category === "office" ? 9 : 6, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 })
        .bindPopup(`<b>${esc(l.name)}</b><br>${esc([l.address, l.postcode].filter(Boolean).join(", "))}${l.phone ? `<br>${esc(l.phone)}` : ""}`)
        .addTo(layer);
    });
    $("[data-list]", view).innerHTML = rows.length
      ? rows
          .map(
            (l) => `<li data-id="${l.id}"><button type="button" data-focus><b>${esc(l.name)}</b>${sampleChip(l)}<small>${CATS[l.category] || l.category}${l.public ? " · public" : " · private"}${office && l.lat && l !== office ? ` · ${km(office, l).toFixed(0)} km` : ""}</small></button>
          <span class="loc-actions">${l.lat != null ? `<a class="link" href="https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}" target="_blank" rel="noopener">Directions</a>` : ""}<button class="link" type="button" data-edit>Edit</button></span></li>`,
          )
          .join("")
      : `<li>${empty("No locations", "Add the head office, the towns you cover and client sites.")}</li>`;
    const pts = rows.filter((l) => l.lat != null).map((l) => [l.lat, l.lng]);
    if (fit && pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 12 });
  };
  draw(true);
  setTimeout(() => map.invalidateSize(), 50);
  $("[data-find]", view).addEventListener("input", (e) => {
    term = e.target.value.trim().toLowerCase();
    draw();
  });
  view.onclick = (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.filter) {
      filter = t.dataset.filter;
      $$("[data-filter]", view).forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
      return draw(true);
    }
    if (t.matches("[data-new]")) return locationForm(view, null, query);
    const l = list.find((x) => String(x.id) === t.closest("[data-id]")?.dataset.id);
    if (t.matches("[data-focus]") && l?.lat != null) map.setView([l.lat, l.lng], 13);
    if (t.matches("[data-edit]")) locationForm(view, l, query);
  };
  const want = new URLSearchParams(query).get("id");
  const hit = want && list.find((l) => String(l.id) === want);
  if (hit?.lat != null) map.setView([hit.lat, hit.lng], 13);
}

function locationForm(view, l, query) {
  l ||= { name: "", category: "site", address: "", postcode: "", lat: "", lng: "", radius_km: "", contact: "", phone: "", notes: "", public: false };
  const d = document.createElement("dialog");
  d.className = "dialog is-wide";
  d.innerHTML = `<form class="form" method="dialog"><div class="dialog-head"><h2>${l.id ? "Edit location" : "Add a location"}</h2></div>
    <div class="grid is-2 is-flat"><label class="field"><span>Name</span><input name="name" value="${esc(l.name)}" required></label>
    <label class="field"><span>Kind</span><select name="category">${Object.entries(CATS).map(([k, v]) => `<option value="${k}"${k === l.category ? " selected" : ""}>${v}</option>`).join("")}</select></label></div>
    <label class="field"><span>Address</span><input name="address" value="${esc(l.address || "")}"></label>
    <div class="grid is-2 is-flat"><label class="field"><span>Postcode <em>finds the map position</em></span><input name="postcode" value="${esc(l.postcode || "")}"></label>
    <label class="field"><span>Coverage radius, km <em>optional</em></span><input name="radius_km" type="number" min="0" step="1" value="${l.radius_km ?? ""}"></label></div>
    <div class="grid is-2 is-flat"><label class="field"><span>Latitude</span><input name="lat" value="${l.lat ?? ""}"></label><label class="field"><span>Longitude</span><input name="lng" value="${l.lng ?? ""}"></label></div>
    <div class="grid is-2 is-flat"><label class="field"><span>Contact</span><input name="contact" value="${esc(l.contact || "")}"></label><label class="field"><span>Phone</span><input name="phone" value="${esc(l.phone || "")}"></label></div>
    <label class="field"><span>Notes <em>access, keys, parking</em></span><textarea name="notes" rows="3">${esc(l.notes || "")}</textarea></label>
    <label class="switch"><input type="checkbox" name="public"${l.public ? " checked" : ""}><span></span>Public (can appear on the website and in proposals)</label>
    <div class="row-between">${l.id ? '<button class="btn is-danger-quiet" value="delete" formnovalidate>Delete</button>' : "<span></span>"}<span class="row-end"><button class="btn is-quiet" value="cancel" formnovalidate>Cancel</button><button class="btn" value="save">Save</button></span></div></form>`;
  document.body.append(d);
  const f = $("form", d);
  f.postcode.addEventListener("change", async () => {
    const pc = f.postcode.value.trim();
    if (!pc) return;
    try {
      const r = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`).then((x) => x.json());
      if (r.result) {
        f.lat.value = r.result.latitude;
        f.lng.value = r.result.longitude;
        toast("Found it on the map.");
      } else toast("That postcode wasn't found.", { error: true });
    } catch {
      toast("Couldn't look up the postcode.", { error: true });
    }
  });
  d.addEventListener("close", async () => {
    try {
      if (d.returnValue === "save") {
        await studioPost("location-save", { id: l.id, name: f.name.value, category: f.category.value, address: f.address.value, postcode: f.postcode.value, lat: f.lat.value, lng: f.lng.value, radius_km: f.radius_km.value, contact: f.contact.value, phone: f.phone.value, notes: f.notes.value, public: f.public.checked });
        locations(view, { query });
      } else if (d.returnValue === "delete" && (await confirmBox(`Delete ${l.name}?`))) {
        await studioPost("location-delete", { id: l.id });
        locations(view, { query });
      }
    } catch (e) {
      toast(e.message, { error: true });
    }
    d.remove();
  });
  d.showModal();
}

/* ---------- Library ---------- */

const LIB_TYPES = { text: "Words", logo: "Logos", photo: "Photographs", graphic: "Graphics", template: "Templates", credential: "Credentials", headshot: "Staff headshots", document: "Documents" };

export async function library(view, { query }) {
  loading(view);
  let items;
  try {
    items = (await studio("library")).items;
  } catch (e) {
    return failed(view, e, () => library(view, { query }));
  }
  let type = "all", term = "";
  const today = new Date().toISOString().slice(0, 10);
  const overdue = (x) => x.review_date && x.review_date.slice(0, 10) < today;
  view.innerHTML =
    head("Library.", "Approved words, logos, photographs, templates and credentials, each with an owner and a review date, so out-of-date claims don't slip into new work.", `<button class="btn" type="button" data-new>${icon("plus", 15)} Add to the library</button>`) +
    `<div class="lib-bar"><label class="search">${icon("compass", 15)}<input type="search" placeholder="Search the library" data-find></label>
      <div class="seg">${[["all", "All"], ...Object.entries(LIB_TYPES)].map(([k, l]) => `<button type="button" data-type="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("")}</div></div>
    ${items.some(overdue) ? `<p class="note is-warn">${items.filter(overdue).length} item(s) are past their review date. Check they're still true before using them.</p>` : ""}
    <div class="lib-grid" data-grid></div>`;
  const draw = () => {
    const rows = items.filter((x) => (type === "all" || x.type === type) && `${x.title} ${x.body || ""} ${x.tags || ""}`.toLowerCase().includes(term));
    $("[data-grid]", view).innerHTML = rows.length
      ? rows
          .map(
            (x) => `<article class="lib-item" data-id="${x.id}">
          <div class="lib-thumb">${x.file && /^data:image/.test(x.file) ? `<img src="${x.file}" alt="">` : x.has_file ? icon("file", 26) : `<p>${esc((x.body || "").slice(0, 150))}</p>`}</div>
          <div class="lib-meta"><b>${esc(x.title)}</b>${sampleChip(x)}<small>${LIB_TYPES[x.type] || x.type} · <span class="pill is-${x.status === "approved" ? "won" : x.status === "draft" ? "draft" : "lost"}">${x.status}</span>${overdue(x) ? ' · <span class="pill is-new">Review due</span>' : ""}</small>
          <small>${x.owner ? `Owner: ${esc(x.owner)}` : "No owner"}${x.review_date ? ` · review ${day(x.review_date)}` : ""}</small></div>
          <div class="row-start"><button class="btn is-quiet is-small" type="button" data-open>Open</button>${x.body ? '<button class="btn is-quiet is-small" type="button" data-copy>Copy words</button>' : ""}</div></article>`,
          )
          .join("")
      : empty("Nothing here yet", "Add approved wording, logos, photographs and credentials. Load the sample data in Settings to see how it works.");
  };
  draw();
  $("[data-find]", view).addEventListener("input", (e) => {
    term = e.target.value.trim().toLowerCase();
    draw();
  });
  view.onclick = async (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.type) {
      type = t.dataset.type;
      $$("[data-type]", view).forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
      return draw();
    }
    if (t.matches("[data-new]")) return libraryForm(view, null, query);
    const x = items.find((i) => String(i.id) === t.closest("[data-id]")?.dataset.id);
    if (t.matches("[data-copy]")) {
      await navigator.clipboard.writeText(x.body).catch(() => {});
      return toast("Copied.");
    }
    if (t.matches("[data-open]")) libraryForm(view, x, query);
  };
  const want = new URLSearchParams(query).get("id");
  const hit = want && items.find((i) => String(i.id) === want);
  if (hit) libraryForm(view, hit, query);
}

async function libraryForm(view, x, query) {
  x ||= { type: "text", title: "", body: "", tags: "", owner: "", review_date: "", status: "approved" };
  let file = null;
  if (x.has_file && !x.file && x.id) file = (await studio("library-file", { params: { id: x.id } })).file;
  else file = x.file || null;
  const d = document.createElement("dialog");
  d.className = "dialog is-wide";
  d.innerHTML = `<form class="form" method="dialog"><div class="dialog-head"><h2>${x.id ? esc(x.title) : "Add to the library"}</h2></div>
    <div class="grid is-2 is-flat"><label class="field"><span>Title</span><input name="title" value="${esc(x.title)}" required></label>
    <label class="field"><span>Kind</span><select name="type">${Object.entries(LIB_TYPES).map(([k, v]) => `<option value="${k}"${k === x.type ? " selected" : ""}>${v}</option>`).join("")}</select></label></div>
    <label class="field"><span>Words <em>for reusable wording, descriptions and biographies</em></span><textarea name="body" rows="6">${esc(x.body || "")}</textarea></label>
    <div class="field"><span>File <em>picture or PDF, up to about 3 MB</em></span><div class="row-start"><button class="btn is-quiet is-small" type="button" data-pick>${file ? "Replace file" : "Choose a file"}</button>${file ? `<a class="link" href="${file}" download="${esc(x.title || "file")}">Download</a>` : ""}<input type="file" hidden data-file accept="image/*,application/pdf"></div>${file && /^data:image/.test(file) ? `<img class="lib-preview" src="${file}" alt="">` : ""}</div>
    <div class="grid is-2 is-flat"><label class="field"><span>Tags</span><input name="tags" value="${esc(x.tags || "")}" placeholder="proposal, recruitment"></label><label class="field"><span>Owner</span><input name="owner" value="${esc(x.owner || "")}" placeholder="Who keeps it up to date"></label></div>
    <div class="grid is-2 is-flat"><label class="field"><span>Review by</span><input type="date" name="review_date" value="${esc((x.review_date || "").slice(0, 10))}"></label>
    <label class="field"><span>Status</span><select name="status">${["approved", "draft", "retired"].map((s) => `<option${s === x.status ? " selected" : ""}>${s}</option>`).join("")}</select></label></div>
    <div class="row-between">${x.id ? '<button class="btn is-danger-quiet" value="delete" formnovalidate>Delete</button>' : "<span></span>"}<span class="row-end"><button class="btn is-quiet" value="cancel" formnovalidate>Cancel</button><button class="btn" value="save">Save</button></span></div></form>`;
  document.body.append(d);
  const f = $("form", d);
  let newFile = null, mime = x.mime || null;
  $("[data-pick]", d).onclick = () => $("[data-file]", d).click();
  $("[data-file]", d).onchange = (e) => {
    const file0 = e.target.files[0];
    if (!file0) return;
    if (file0.size > 3_000_000) return toast("That file is over 3 MB.", { error: true });
    const r = new FileReader();
    r.onload = () => {
      newFile = r.result;
      mime = file0.type;
      if (!f.title.value) f.title.value = file0.name.replace(/\.[^.]+$/, "");
      toast("File ready. Save to keep it.");
    };
    r.readAsDataURL(file0);
  };
  d.addEventListener("close", async () => {
    try {
      if (d.returnValue === "save") {
        await studioPost("library-save", { id: x.id, type: f.type.value, title: f.title.value, body: f.body.value, tags: f.tags.value, owner: f.owner.value, review_date: f.review_date.value, status: f.status.value, file: newFile, mime });
        library(view, { query: "" });
      } else if (d.returnValue === "delete" && (await confirmBox(`Delete "${x.title}" from the library?`))) {
        await studioPost("library-delete", { id: x.id });
        library(view, { query: "" });
      }
    } catch (e) {
      toast(e.message, { error: true });
    }
    d.remove();
  });
  d.showModal();
}

/* ---------- Settings ---------- */

const TABS = [
  ["brand", "Brand kit"],
  ["staff", "Staff"],
  ["services", "Services and credentials"],
  ["access", "Access"],
  ["integrations", "Integrations"],
  ["sample", "Sample data"],
  ["data", "Your data"],
];

export async function settings(view, { query }) {
  const tab = new URLSearchParams(query).get("tab") || "brand";
  loading(view);
  let kit, defaults, log = [], integ = {};
  try {
    [{ brand: kit, defaults }, { log }, integ] = await Promise.all([studio("brand"), api("log"), studio("integrations").catch(() => ({}))]);
  } catch (e) {
    return failed(view, e, () => settings(view, { query }));
  }
  const tabs = `<nav class="tabs is-page">${TABS.map(([k, l]) => `<a href="#/settings?tab=${k}" aria-selected="${k === tab}">${l}</a>`).join("")}</nav>`;
  const f = (path, label, opts = {}) => {
    const v = path.split(".").reduce((o, k) => o?.[k], kit) ?? "";
    return opts.area
      ? `<label class="field${opts.wide ? " is-wide" : ""}"><span>${label}</span><textarea data-path="${path}" rows="${opts.rows || 3}">${esc(v)}</textarea></label>`
      : `<label class="field"><span>${label}</span><input data-path="${path}" type="${opts.type || "text"}" value="${esc(v)}"></label>`;
  };
  let body = "";
  if (tab === "brand") {
    body = `<form class="form" data-brand>
      ${card("Company", `<div class="grid is-2 is-flat">${f("company.name", "Trading name")}${f("company.legal", "Legal name")}${f("company.number", "Company number")}${f("company.vat", "VAT number")}${f("company.phone", "Phone")}${f("company.email", "Email")}${f("company.web", "Website")}${f("company.region", "Where we work")}</div>${f("company.address", "Address")}${f("company.hours", "Opening hours")}`)}
      ${card("Words everyone uses", `${f("tagline", "Tagline")}${f("description", "Approved company description", { area: true, rows: 5 })}${f("footer", "Standard footer", { area: true, rows: 2 })}`)}
      ${card("Look", `<div class="grid is-2 is-flat">${["primary", "accent", "ink", "paper"].map((k) => `<label class="field"><span>${k}</span><input type="color" data-path="colours.${k}" value="${esc(kit.colours[k])}"></label>`).join("")}${f("fonts.heading", "Heading font")}${f("fonts.body", "Text font")}</div>
        <div class="grid is-2 is-flat">${f("logos.light", "Logo for light backgrounds")}${f("logos.dark", "Logo for dark backgrounds")}</div>
        <div class="brand-logos" style="margin-top:12px"><span class="is-light"><img src="${esc(kit.logos.light)}" alt=""></span><span class="is-dark"><img src="${esc(kit.logos.dark)}" alt=""></span></div>`)}
      ${card("Social links", `<div class="grid is-2 is-flat">${["facebook", "linkedin", "instagram", "x"].map((k) => f(`socials.${k}`, k[0].toUpperCase() + k.slice(1))).join("")}</div>`)}
      ${card("Locked in templates", `<p class="muted small">Locked parts can't be changed inside a single document or design, only here. Content always stays editable.</p>${["colours", "fonts", "logos", "footer"].map((k) => `<label class="switch"><input type="checkbox" data-lock="${k}"${kit.locked[k] ? " checked" : ""}><span></span>Lock ${k}</label>`).join("")}`)}
      <div class="row-between sticky-save"><span class="muted small">Version ${kit.version}. Changes apply to new work; documents already made keep the brand they were made with.</span><span class="row-end"><button class="btn is-quiet" type="button" data-reset-brand>Restore website defaults</button><button class="btn" type="submit">Save brand kit</button></span></div>
    </form>`;
  } else if (tab === "staff" || tab === "services") {
    const isStaff = tab === "staff";
    const rows = isStaff ? kit.staff : kit.services;
    body = `<form class="form" data-list-form>
      ${card(isStaff ? "Staff profiles" : "Services", `<p class="muted small">${isStaff ? "Used for business cards, email signatures and the contact page of proposals." : "Reusable service descriptions for proposals, quotations and capability statements."}</p>
        <div class="rows" data-rows>${rows.map((r) => (isStaff ? staffRow(r) : serviceRow(r))).join("")}</div>
        <button class="btn is-quiet is-small" type="button" data-add-row>${icon("plus", 13)} Add ${isStaff ? "a person" : "a service"}</button>`)}
      ${isStaff ? "" : card("Accreditations and credentials", `<p class="muted small">Only list what the company holds and can evidence. Unverified items never appear in documents.</p><div class="rows" data-creds>${kit.credentials.map(credRow).join("")}</div><button class="btn is-quiet is-small" type="button" data-add-cred>${icon("plus", 13)} Add a credential</button>`)}
      <div class="row-end sticky-save"><button class="btn" type="submit">Save</button></div></form>`;
  } else if (tab === "access") {
    body = card("Who can sign in", `<p>Admins sign in with their email and password through Supabase. Only accounts given admin access can open the studio.</p>
      <p class="muted small" style="margin-top:10px">To add someone, run on the office computer:<br><code>npm run admin:add -- their@email.co.uk</code><br>They'll get an email to choose a password. To remove access: <code>npm run admin:remove -- their@email.co.uk</code></p>
      <p class="muted small" style="margin-top:10px">Everyone with access can see enquiries, documents and the library. Recruitment applications are kept on their own tab in Enquiries.</p>
      <div class="row-start" style="margin-top:14px"><a class="btn is-quiet" href="/admin/login.html#forgot">${icon("lock", 15)} Change my password</a></div>`);
  } else if (tab === "integrations") {
    const row = (name, ok, text) => `<li><span><b>${name}</b><small>${text}</small></span><span class="pill ${ok ? "is-won" : "is-draft"}">${ok ? "Connected" : "Not set up"}</span></li>`;
    body = card("Integrations", `<ul class="list">
      ${row("Database", integ.database, integ.database ? `Supabase (${esc(integ.database)})` : "DATABASE_URL in .env")}
      ${row("Sign-in", integ.auth, "Supabase Auth, email and password")}
      ${row("Website analytics", true, "Built in, without cookies")}
      ${row("Daily uptime check", integ.cron, integ.cron ? "Runs on Vercel once deployed" : "CRON_SECRET in .env")}
      ${row("Writing assistant (optional)", integ.ai, integ.ai ? "Claude, for rewording and drafting; always reviewed before use" : "Add ANTHROPIC_API_KEY to .env to switch it on. Everything works without it.")}
      ${row("Google Search Console", false, "Coming next: the searches that bring people in")}
    </ul>`);
  } else if (tab === "sample") {
    body = card("Sample data", `<p>Load clearly labelled demonstration enquiries, a proposal, library items, locations and campaigns, to show the studio before real company information is authorised. Every sample row says "(sample)".</p>
      <p class="muted small" style="margin-top:8px">Website analytics are never faked. Removing sample data deletes only rows marked as samples.</p>
      <div class="row-start" style="margin-top:14px"><button class="btn" type="button" data-sample="load">Load sample data</button><button class="btn is-quiet" type="button" data-sample="remove">Remove sample data</button></div>`);
  } else {
    body = `<div class="grid is-2">${card("Downloads", `<div class="stack">
        <a class="btn is-quiet" href="/api/admin?action=export&what=leads">${icon("download", 15)} Enquiries (CSV)</a>
        <a class="btn is-quiet" href="/api/admin?action=export&what=views">${icon("download", 15)} Page views, last 12 months (CSV)</a>
        <a class="btn is-quiet" href="/api/admin?action=export&what=events">${icon("download", 15)} Calls, emails and enquiries (CSV)</a>
        <a class="btn is-quiet" href="/api/admin?action=backup">${icon("download", 15)} Backup: posts, enquiries, settings (JSON)</a></div>`)}
      ${card("Recent activity", log.length ? `<ul class="list is-tight">${log.slice(0, 15).map((r) => `<li><span><b>${esc(r.action)}</b><small>${esc(r.detail || "")}</small></span><small>${day(r.ts, { day: "numeric", month: "short" })} ${clock(r.ts)}</small></li>`).join("")}</ul>` : empty("Nothing yet"))}</div>`;
  }
  view.innerHTML = head("Settings.", "Enter the company's details once; every document and design inherits them.") + tabs + body;
  wireSettings(view, kit, defaults, tab, query);
}

const staffRow = (s) => `<div class="row-card" data-row data-id="${esc(s.id || uid())}"><input placeholder="Name" data-k="name" value="${esc(s.name)}"><input placeholder="Role" data-k="role" value="${esc(s.role)}"><input placeholder="Phone" data-k="phone" value="${esc(s.phone)}"><input placeholder="Email" data-k="email" value="${esc(s.email)}">${s.sample ? '<span class="chip is-sample">Sample</span>' : ""}<button type="button" class="icon-btn" data-remove aria-label="Remove">${icon("x", 15)}</button></div>`;
const serviceRow = (s) => `<div class="row-card is-service" data-row data-id="${esc(s.id || uid())}"><input placeholder="Service" data-k="name" value="${esc(s.name)}"><textarea placeholder="Short description" data-k="summary" rows="2">${esc(s.summary)}</textarea><button type="button" class="icon-btn" data-remove aria-label="Remove">${icon("x", 15)}</button></div>`;
const credRow = (c) => `<div class="row-card" data-cred data-id="${esc(c.id || uid())}"><input placeholder="Accreditation" data-k="name" value="${esc(c.name)}"><input placeholder="Reference" data-k="reference" value="${esc(c.reference)}"><label class="st-check"><input type="checkbox" data-k="verified"${c.verified ? " checked" : ""}> Verified</label><button type="button" class="icon-btn" data-remove aria-label="Remove">${icon("x", 15)}</button></div>`;

function wireSettings(view, kit, defaults, tab, query) {
  const save = async (patch) => {
    try {
      await studioPost("brand-save", { brand: patch });
      await brandKit(true);
      toast("Saved. New work uses it from now on.");
      settings(view, { query });
    } catch (e) {
      toast(e.message, { error: true });
    }
  };
  const brandForm = $("[data-brand]", view);
  if (brandForm) {
    brandForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const next = JSON.parse(JSON.stringify(kit));
      $$("[data-path]", brandForm).forEach((el) => {
        const keys = el.dataset.path.split(".");
        const last = keys.pop();
        keys.reduce((o, k) => o[k], next)[last] = el.value;
      });
      $$("[data-lock]", brandForm).forEach((el) => (next.locked[el.dataset.lock] = el.checked));
      save(next);
    });
    $("[data-reset-brand]", view).onclick = async () => {
      if (await confirmBox("Restore the brand kit to the website's details? Staff and services are reset too.", { ok: "Restore" })) save({ ...defaults, version: kit.version });
    };
  }
  const listForm = $("[data-list-form]", view);
  if (listForm) {
    listForm.onclick = (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      if (t.matches("[data-remove]")) t.closest(".row-card").remove();
      if (t.matches("[data-add-row]")) $("[data-rows]", view).insertAdjacentHTML("beforeend", tab === "staff" ? staffRow({ name: "", role: "", phone: "", email: "" }) : serviceRow({ name: "", summary: "" }));
      if (t.matches("[data-add-cred]")) $("[data-creds]", view).insertAdjacentHTML("beforeend", credRow({ name: "", reference: "", verified: false }));
    };
    listForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const read = (sel) =>
        $$(sel, view)
          .map((r) => {
            const o = { id: r.dataset.id };
            $$("[data-k]", r).forEach((el) => (o[el.dataset.k] = el.type === "checkbox" ? el.checked : el.value.trim()));
            return o;
          })
          .filter((o) => o.name);
      save(tab === "staff" ? { staff: read("[data-row]") } : { services: read("[data-row]"), credentials: read("[data-cred]") });
    });
  }
  $$("[data-sample]", view).forEach((b) =>
    b.addEventListener("click", async () => {
      const load = b.dataset.sample === "load";
      if (!load && !(await confirmBox("Remove every row marked as sample data?", { ok: "Remove" }))) return;
      b.disabled = true;
      try {
        await studioPost(load ? "sample-load" : "sample-remove", {});
        toast(load ? "Sample data loaded. Look in Enquiries, Document Studio, Library and Locations." : "Sample data removed.");
      } catch (e) {
        toast(e.message, { error: true });
      }
      b.disabled = false;
    }),
  );
}

