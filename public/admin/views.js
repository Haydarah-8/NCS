/* New Concept Security admin: every page of the panel. Each view draws into
   `view` and returns nothing; the shell (app.js) handles the frame, the
   period and the routing. Sections follow Aevion View: traffic, sources,
   enquiries and conversions, speed and uptime. */

import { render, slugify } from "./md.js";
import {
  $, $$, COLORS, ago, api, brandKit, studio, studioPost, bars, card, clock, columns, confirmBox, day, delta, donut, dur, empty, esc, head, icon, kpi, lineChart, num,
  pct, pointLabel, post, rangeLabel, rangePicker, secs, share, toast, wireCharts,
} from "./core.js";

/* ---------- Shared ---------- */

const TOPICS = [
  ["guarding", "Guarding"],
  ["construction", "Construction"],
  ["venues", "Venues and events"],
  ["healthcare", "Healthcare"],
  ["technology", "CCTV and technology"],
  ["news", "Company news"],
];
const PHOTOS = ["hero", "hero-skyline", "balfour-site", "control-room", "fleet-night", "northern-way", "reception", "street", "tram", "venue"];

/* Google's Core Web Vitals bands for the largest contentful paint. */
const lcpBand = (ms) => (ms == null ? ["", "No data yet"] : ms <= 2500 ? ["is-good", "Good"] : ms <= 4000 ? ["is-fair", "Needs work"] : ["is-poor", "Poor"]);
const upBand = (p) => (p == null ? "" : p >= 99.5 ? "is-good" : p >= 97 ? "is-fair" : "is-poor");

const LEAD_STATES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["quoted", "Quotation prepared"],
  ["won", "Won"],
  ["closed", "Closed"],
];
const stateName = (s) => (s === "lost" ? "Closed" : LEAD_STATES.find((x) => x[0] === s)?.[1] || s);
const isOpen = (l) => !["won", "closed", "lost"].includes(l.status);
const todayIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

/* What Aevion View will do next. Planned, and not available yet. */
export const COMING_NEXT = [
  ["Search performance", "The searches and pages that bring people in from Google, with clicks and positions."],
  ["Change requests", "Ask for website updates from here, with your monthly update allowance alongside."],
  ["Monthly summaries", "A short report of the month's traffic, enquiries and speed, sent to your inbox."],
  ["Invoices and agreement", "Your care invoices and the care agreement, in one place."],
];

const loading = (view) => (view.innerHTML = `<div class="loading" aria-live="polite"><span></span>Loading…</div>`);
function failed(view, error, retry) {
  view.innerHTML = head("Something went wrong.") + card("", `<p class="muted">${esc(error.message)}</p><button class="btn" type="button" data-retry>Try again</button>`);
  $("[data-retry]", view).addEventListener("click", retry);
}

function pageDetail(path, days) {
  const d = document.createElement("dialog");
  d.className = "dialog is-wide";
  d.innerHTML = `<div class="dialog-head"><h2>${esc(path)}</h2><button class="icon-btn" type="button" data-close aria-label="Close">${icon("x")}</button></div><div data-body><div class="loading"><span></span>Loading…</div></div>`;
  document.body.append(d);
  d.addEventListener("close", () => d.remove());
  $("[data-close]", d).addEventListener("click", () => d.close());
  d.showModal();
  api("page", { params: { path, days } })
    .then((p) => {
      $("[data-body]", d).innerHTML = `<div class="kpis is-3">${kpi({ label: "Visitors", value: num(p.totals.visitors) })}${kpi({ label: "Page views", value: num(p.totals.views) })}${kpi({ label: "Time on page", value: dur(p.totals.seconds) })}</div>
        ${lineChart(p.series, [{ key: "visitors", label: "Visitors", color: COLORS.red, area: true }], pointLabel(days), { height: 180 })}
        <h3 class="sub">Where they came from</h3>${bars(p.referrers, { limit: 8 })}
        <p class="muted small">Typical load time (75th percentile): ${secs(p.totals.lcp)} · <a href="${esc(path)}" target="_blank" rel="noopener">Open the page ${icon("external", 13)}</a></p>`;
      wireCharts(d);
    })
    .catch((e) => ($("[data-body]", d).innerHTML = `<p class="muted">${esc(e.message)}</p>`));
}

function wirePages(view, days) {
  $$("[data-page]", view).forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      pageDetail(a.dataset.page, days);
    }),
  );
}

const pageRows = (rows, limit = 10) =>
  rows.length
    ? `<table class="table"><thead><tr><th>Page</th><th class="num">Visitors</th><th class="num">Views</th><th class="num hide-sm">Time</th></tr></thead><tbody>${rows
        .slice(0, limit)
        .map((r) => `<tr><td><a href="#" data-page="${esc(r.name)}" class="cell-link"><b>${esc(r.title || r.name)}</b><small>${esc(r.name)}</small></a></td><td class="num">${num(r.visitors)}</td><td class="num">${num(r.views)}</td><td class="num hide-sm">${dur(r.seconds)}</td></tr>`)
        .join("")}</tbody></table>`
    : empty("No page views yet", "Pages appear here once people visit the site.");

/* ---------- Overview ---------- */

export async function overview(view, { days }) {
  loading(view);
  try {
    const [s, sp, up, { leads }] = await Promise.all([api("stats", { params: { days } }), api("speed", { params: { days } }), api("uptime", { params: { days: Math.max(days, 30) } }), api("leads")]);
    const t = s.totals, p = s.previous;
    const conv = share(t.leads, t.visitors), convBefore = share(p.leads, p.visitors);
    const [band, bandName] = lcpBand(sp.overall.lcp);
    const upPct = up.checks ? share(up.up, up.checks) : null;
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";
    const fresh = leads.filter((l) => l.status === "new");
    view.innerHTML =
      head(greet, `How the website did ${rangeLabel(days)}.`, rangePicker(days)) +
      `<div class="kpis">
        ${kpi({ label: "Visitors", value: num(t.visitors), deltaHtml: delta(t.visitors, p.visitors) })}
        ${kpi({ label: "Page views", value: num(t.views), deltaHtml: delta(t.views, p.views) })}
        ${kpi({ label: "Enquiries", value: num(t.leads), deltaHtml: delta(t.leads, p.leads), sub: fresh.length ? `${fresh.length} new` : "" })}
        ${kpi({ label: "Conversion rate", value: `${conv}%`, deltaHtml: delta(conv, convBefore), sub: "enquiries per visitor" })}
        ${kpi({ label: "Load time", value: secs(sp.overall.lcp), sub: bandName, tone: band })}
        ${kpi({ label: "Uptime", value: upPct == null ? "–" : `${upPct}%`, sub: up.checks ? `${num(up.checks)} checks` : "No checks yet", tone: upBand(upPct) })}
      </div>
      <div class="grid is-main">
        ${card("Visitors and page views", lineChart(s.series, [{ key: "visitors", label: "Visitors", color: COLORS.red, area: true }, { key: "views", label: "Page views", color: COLORS.grey }], pointLabel(days)), { action: `<a class="link" href="#/traffic">Traffic ${icon("arrow", 14)}</a>` })}
        ${card(
          "New enquiries",
          fresh.length
            ? `<ul class="list">${fresh
                .slice(0, 5)
                .map((l) => `<li><a href="#/enquiries/${l.id}"><b>${esc(l.name)}</b><span>${esc(l.site || l.company || l.email || "")}</span><small>${ago(l.ts)}</small></a></li>`)
                .join("")}</ul>`
            : empty("You're all caught up", "New enquiries from the contact form land here."),
          { action: `<a class="link" href="#/enquiries">Inbox ${icon("arrow", 14)}</a>` },
        )}
      </div>
      <div class="grid is-3">
        ${card("Top pages", bars(s.pages, { name: (r) => r.title || r.name, sub: (r) => r.name, limit: 6, href: (r) => `#/traffic?page=${encodeURIComponent(r.name)}` }))}
        ${card("Where visitors come from", donut(s.channels.map((c) => ({ name: c.name, value: c.visitors })), { label: "visitors" }), { action: `<a class="link" href="#/sources">Sources ${icon("arrow", 14)}</a>` })}
        ${card("Right now", `<p class="live"><i></i><b>${num(s.live.now)}</b> on the site in the last five minutes</p>${s.live.recent.length ? `<ul class="list is-tight">${s.live.recent.slice(0, 5).map((r) => `<li><span><b>${esc(r.title || r.path)}</b><small>${esc([r.city, r.country].filter(Boolean).join(", ") || r.device || "")}</small></span><small>${ago(r.ts)}</small></li>`).join("")}</ul>` : ""}`)}
      </div>
      <div class="grid is-3" data-home><section class="card"><div class="card-body"><div class="loading"><span></span>Loading…</div></div></section></div>
      ${comingNextCard()}`;
    wireCharts(view);
    studio("home")
      .then((h) => {
        const box = $("[data-home]", view);
        if (!box) return;
        box.innerHTML =
          card("Recent documents", h.documents.length ? `<ul class="list">${h.documents.map((d) => `<li><a href="#/studio/${d.id}"><b>${d.favourite ? "★ " : ""}${esc(d.title)}</b><span>${esc(d.kind)} · ${esc(d.status)}</span><small>${ago(d.updated_at)}</small></a></li>`).join("")}</ul>` : empty("No documents yet", "Start one in Document Studio."), { action: `<a class="link" href="#/studio">Document Studio ${icon("arrow", 14)}</a>` }) +
          card("Follow-ups due", h.followUps.length ? `<ul class="list">${h.followUps.map((l) => `<li><a href="#/enquiries/${l.id}"><b>${esc(l.name)}</b><span>${esc(l.company || l.site || "")}</span><small>${day(l.follow_up, { day: "numeric", month: "short" })}</small></a></li>`).join("")}</ul>` : empty("Nothing due", "Set follow-up dates on enquiries and they appear here."), { action: `<a class="link" href="#/enquiries?status=due">Enquiries ${icon("arrow", 14)}</a>` }) +
          card("Shortcuts", `<div class="shortcuts">
            <a href="#/studio/new/proposal">${icon("spark", 18)}<span>Proposal pack</span></a>
            <a href="#/studio/new/quotation">${icon("file", 18)}<span>Quotation</span></a>
            <a href="#/tools/business-card">${icon("card", 18)}<span>Business card</span></a>
            <a href="#/tools/email">${icon("mail", 18)}<span>Email signature</span></a>
            <a href="#/insights/campaigns">${icon("compass", 18)}<span>Campaign link</span></a>
            <a href="#/tools/pdf">${icon("pen", 18)}<span>PDF viewer</span></a>
          </div>`);
      })
      .catch(() => ($("[data-home]", view).innerHTML = ""));
  } catch (e) {
    failed(view, e, () => overview(view, { days }));
  }
}

function comingNextCard() {
  return `<section class="card is-next"><header class="card-head"><h2>Coming next</h2><span class="chip">Planned, not available yet</span></header>
    <div class="card-body"><ul class="next">${COMING_NEXT.map(([t, b]) => `<li><b>${t}</b><span>${b}</span></li>`).join("")}</ul></div></section>`;
}

/* ---------- Traffic ---------- */

export async function traffic(view, { days, query }) {
  loading(view);
  try {
    const s = await api("stats", { params: { days } });
    const t = s.totals, p = s.previous;
    const perVisit = t.visits ? (t.views / t.visits).toFixed(1) : "0";
    const perVisitBefore = p.visits ? p.views / p.visits : 0;
    const hours = Array.from({ length: 24 }, (_, h) => s.hours.find((r) => r.hour === h)?.views || 0);
    const week = [1, 2, 3, 4, 5, 6, 7].map((d) => s.weekdays.find((r) => r.dow === d)?.views || 0);
    view.innerHTML =
      head("Traffic.", `Visits, visitors and the pages people read, ${rangeLabel(days)}.`, rangePicker(days)) +
      `<div class="kpis">
        ${kpi({ label: "Visitors", value: num(t.visitors), deltaHtml: delta(t.visitors, p.visitors) })}
        ${kpi({ label: "Visits", value: num(t.visits), deltaHtml: delta(t.visits, p.visits) })}
        ${kpi({ label: "Page views", value: num(t.views), deltaHtml: delta(t.views, p.views) })}
        ${kpi({ label: "Pages per visit", value: perVisit, deltaHtml: delta(Number(perVisit), perVisitBefore) })}
        ${kpi({ label: "Time on page", value: dur(t.seconds), deltaHtml: delta(t.seconds, p.seconds) })}
        ${kpi({ label: "Single-page visits", value: pct(t.bounce), sub: "left after one page" })}
      </div>
      ${card("Day by day", lineChart(s.series, [{ key: "visitors", label: "Visitors", color: COLORS.red, area: true }, { key: "views", label: "Page views", color: COLORS.grey }], pointLabel(days), { height: 280 }), { action: `<a class="btn is-quiet is-small" href="/api/admin?action=export&what=views">${icon("download", 14)} CSV</a>` })}
      ${card("Pages", pageRows(s.pages, 30), { action: `<span class="muted small">Click a page for its own numbers</span>` })}
      <div class="grid is-2">
        ${card("First page of a visit", bars(s.entries, { limit: 8 }))}
        ${card("Last page of a visit", bars(s.exits, { limit: 8 }))}
      </div>
      <div class="grid is-2">
        ${card("By hour of day", columns(hours, hours.map((_, h) => String(h).padStart(2, "0")), { title: "Page views by hour" }))}
        ${card("By day of the week", columns(week, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], { title: "Page views by weekday" }))}
      </div>
      <p class="footnote">Visitors are counted without cookies: the same person on the same day counts once, and nothing that identifies them is kept. Your own visits while signed in are not counted.</p>`;
    wireCharts(view);
    wirePages(view, days);
    const want = new URLSearchParams(query).get("page");
    if (want) pageDetail(want, days);
  } catch (e) {
    failed(view, e, () => traffic(view, { days, query }));
  }
}

/* ---------- Sources ---------- */

export async function sources(view, { days }) {
  loading(view);
  try {
    const s = await api("stats", { params: { days } });
    const total = s.channels.reduce((n, c) => n + c.visitors, 0);
    const devices = s.devices.map((d) => ({ name: d.name, value: d.visitors }));
    view.innerHTML =
      head("Sources.", `Where visitors came from ${rangeLabel(days)}: search, social, other sites and your campaigns.`, rangePicker(days)) +
      `<div class="grid is-main">
        ${card(
          "Channels",
          s.channels.length
            ? `<table class="table"><thead><tr><th>Channel</th><th class="num">Visitors</th><th class="num">Share</th><th class="num">Change</th></tr></thead><tbody>${s.channels
                .map((c) => `<tr><td><b>${esc(c.name)}</b></td><td class="num">${num(c.visitors)}</td><td class="num">${share(c.visitors, total)}%</td><td class="num">${delta(c.visitors, c.before)}</td></tr>`)
                .join("")}</tbody></table>`
            : empty("No visits yet"),
        )}
        ${card("Share of visitors", donut(s.channels.map((c) => ({ name: c.name, value: c.visitors })), { label: "visitors" }))}
      </div>
      <div class="grid is-2">
        ${card("Websites that sent visitors", bars(s.referrers, { limit: 12 }))}
        ${card(
          "Campaigns",
          s.campaigns.length
            ? `<table class="table"><thead><tr><th>Campaign</th><th class="hide-sm">Source / medium</th><th class="num">Visitors</th></tr></thead><tbody>${s.campaigns
                .map((c) => `<tr><td><b>${esc(c.name)}</b></td><td class="hide-sm muted">${esc([c.source, c.medium].filter(Boolean).join(" / ") || "–")}</td><td class="num">${num(c.visitors)}</td></tr>`)
                .join("")}</tbody></table>`
            : empty("No campaigns yet", "Add ?utm_source=…&utm_campaign=… to links in emails, ads and social posts and they appear here."),
        )}
      </div>
      <div class="grid is-3">
        ${card("Countries", bars(s.countries, { limit: 8 }))}
        ${card("Devices", donut(devices, { label: "visitors" }))}
        ${card("Browsers and systems", bars(s.browsers, { limit: 5 }) + `<h3 class="sub">Systems</h3>` + bars(s.systems, { limit: 5 }))}
      </div>
      <p class="footnote">Search covers Google, Bing, DuckDuckGo and the like; Social covers Facebook, Instagram, LinkedIn, X, TikTok, YouTube and others; Direct is a typed address, a bookmark or an app that hides where it came from.</p>`;
  } catch (e) {
    failed(view, e, () => sources(view, { days }));
  }
}

/* ---------- Enquiries and conversions ---------- */

export async function enquiries(view, { days, id, query }) {
  loading(view);
  try {
    const [s, { leads: all }, kit] = await Promise.all([api("stats", { params: { days } }), api("leads"), brandKit().catch(() => ({ staff: [] }))]);
    const t = s.totals, p = s.previous;
    const qs = new URLSearchParams(query);
    const current0 = all.find((l) => String(l.id) === String(id)) || null;
    // Sales enquiries and job applications are kept apart.
    const kind = qs.get("kind") || current0?.kind || "sales";
    const leads = all.filter((l) => (l.kind || "sales") === kind);
    const filter = qs.get("status") || "open";
    const counts = Object.fromEntries(LEAD_STATES.map(([k]) => [k, leads.filter((l) => (l.status === "lost" ? "closed" : l.status) === k).length]));
    const open = leads.filter(isOpen);
    const due = open.filter((l) => l.follow_up && l.follow_up.slice(0, 10) <= todayIso());
    const shown = filter === "all" ? leads : filter === "open" ? open : filter === "due" ? due : leads.filter((l) => (l.status === "lost" ? "closed" : l.status) === filter);
    const current = current0;
    const q = (o) => `#/enquiries?${new URLSearchParams({ kind, ...o })}`;
    const ev = (k) => t.events?.[k] || 0, evb = (k) => p.events?.[k] || 0;
    const conv = share(t.leads, t.visitors);
    view.innerHTML =
      head("Enquiries.", `Messages from the contact form, and the calls, emails and enquiries the site drove ${rangeLabel(days)}.`, rangePicker(days) + `<a class="btn is-quiet" href="/api/admin?action=export&what=leads">${icon("download", 15)} CSV</a>`) +
      `<div class="kpis">
        ${kpi({ label: "Enquiries", value: num(t.leads), deltaHtml: delta(t.leads, p.leads) })}
        ${kpi({ label: "Conversion rate", value: `${conv}%`, deltaHtml: delta(conv, share(p.leads, p.visitors)), sub: "enquiries per visitor" })}
        ${kpi({ label: "Phone taps", value: num(ev("call")), deltaHtml: delta(ev("call"), evb("call")) })}
        ${kpi({ label: "Email taps", value: num(ev("email")), deltaHtml: delta(ev("email"), evb("email")) })}
        ${kpi({ label: "Open enquiries", value: num(open.length), sub: counts.new ? `${counts.new} not yet answered` : "All answered" })}
        ${kpi({ label: "Won", value: num(counts.won), sub: leads.length ? `${share(counts.won, leads.length)}% of all enquiries` : "" })}
      </div>
      ${card("Enquiries against visitors", lineChart(s.series, [{ key: "leads", label: "Enquiries", color: COLORS.red, area: true }], pointLabel(days), { height: 160 }))}
      <section class="inbox${current ? " has-open" : ""}">
        <div class="inbox-list">
          <div class="seg kind-seg">${[["sales", "Sales enquiries"], ["recruitment", "Job applications"]].map(([k, l]) => `<a href="#/enquiries?kind=${k}" aria-pressed="${k === kind}" class="${k === kind ? "is-on" : ""}">${l} <small>${all.filter((x) => (x.kind || "sales") === k && isOpen(x)).length}</small></a>`).join("")}</div>
          <div class="tabs" role="tablist">${[["open", "Open", open.length], ["due", "Follow up", due.length], ...LEAD_STATES.map(([k, l]) => [k, l, counts[k]]), ["all", "All", leads.length]]
            .map(([k, l, n]) => `<a role="tab" href="${q({ status: k })}" aria-selected="${k === filter}">${l}<small>${n}</small></a>`)
            .join("")}</div>
          <label class="search">${icon("compass", 15)}<input type="search" placeholder="Search names, emails, messages" data-find aria-label="Search enquiries"></label>
          <ul class="mail">${
            shown.length
              ? shown
                  .map((l) => `<li data-text="${esc(`${l.name} ${l.email} ${l.phone} ${l.company} ${l.message}`.toLowerCase())}"><a href="#/enquiries/${l.id}?${new URLSearchParams({ kind, status: filter })}" aria-current="${String(l.id) === String(id)}">
                    <span class="mail-top"><b>${esc(l.name)}</b><small>${ago(l.ts)}</small></span>
                    <span class="mail-sub">${esc(l.site || l.company || "Enquiry")}</span>
                    <span class="mail-text">${esc(String(l.message || "").slice(0, 120))}</span>
                    <span class="mail-pills"><span class="pill is-${l.status}">${stateName(l.status)}</span>${l.follow_up && isOpen(l) ? `<span class="pill ${l.follow_up.slice(0, 10) <= todayIso() ? "is-new" : "is-draft"}">Follow up ${day(l.follow_up, { day: "numeric", month: "short" })}</span>` : ""}${l.assigned ? `<span class="pill is-draft">${esc(l.assigned)}</span>` : ""}${l.sample ? '<span class="chip is-sample">Sample</span>' : ""}</span></a></li>`)
                  .join("")
              : `<li>${empty("Nothing here", filter === "open" ? "No open " + (kind === "sales" ? "enquiries." : "applications.") : "")}</li>`
          }</ul>
        </div>
        <div class="inbox-read">${current ? reader(current, kit) : empty("Choose an enquiry", "Its message, contact details and notes open here.")}</div>
      </section>`;
    wireCharts(view);
    $("[data-find]", view).addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      $$(".mail li[data-text]", view).forEach((li) => (li.hidden = q && !li.dataset.text.includes(q)));
    });
    if (current) wireReader(view, current, () => enquiries(view, { days, id, query }));
  } catch (e) {
    failed(view, e, () => enquiries(view, { days, id, query }));
  }
}

function reader(l, kit) {
  const sales = (l.kind || "sales") === "sales";
  const subject = encodeURIComponent(`Re: your enquiry to New Concept Security${l.site ? ` (${l.site})` : ""}`);
  return `<article class="reader">
    <a class="btn is-quiet is-small only-sm" href="#/enquiries">${icon("back", 14)} All enquiries</a>
    <header><h2>${esc(l.name)}</h2><p class="muted">${day(l.ts, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} at ${clock(l.ts)}${l.page ? ` · from <a href="${esc(l.page)}" target="_blank" rel="noopener">${esc(l.page)}</a>` : ""}</p></header>
    <div class="reader-contact">
      ${l.email ? `<a class="btn" href="mailto:${esc(l.email)}?subject=${subject}">${icon("mail", 15)} Reply by email</a>` : ""}
      ${l.phone ? `<a class="btn is-quiet" href="tel:${esc(String(l.phone).replace(/[^\d+]/g, ""))}">${icon("phone", 15)} ${esc(l.phone)}</a>` : ""}
    </div>
    <div class="reader-next">${
      sales
        ? `<a class="btn is-quiet" href="#/studio/new/proposal?lead=${l.id}">${icon("spark", 15)} Prepare a proposal</a><a class="btn is-quiet" href="#/studio/new/quotation?lead=${l.id}">${icon("file", 15)} Prepare a quotation</a>`
        : `<a class="btn is-quiet" href="#/studio/new/interview?lead=${l.id}">${icon("file", 15)} Interview invitation</a>`
    }<span class="muted small">Their details fill in for you.</span></div>
    <dl class="facts">
      ${l.email ? `<div><dt>Email</dt><dd>${esc(l.email)}</dd></div>` : ""}
      ${l.company ? `<div><dt>Organisation</dt><dd>${esc(l.company)}</dd></div>` : ""}
      ${l.site ? `<div><dt>Service</dt><dd>${esc(l.site)}</dd></div>` : ""}
      ${l.location ? `<div><dt>Location</dt><dd>${esc(l.location)}</dd></div>` : ""}
    </dl>
    <blockquote class="message">${esc(l.message || "").replace(/\n/g, "<br>")}</blockquote>
    <form class="form" data-lead>
      <div class="grid is-2 is-flat">
        <label class="field"><span>Status</span><select name="status">${LEAD_STATES.map(([k, n]) => `<option value="${k}"${k === (l.status === "lost" ? "closed" : l.status) ? " selected" : ""}>${n}</option>`).join("")}</select></label>
        <label class="field"><span>Assigned to</span><select name="assigned"><option value="">Nobody yet</option>${(kit?.staff || []).map((s) => `<option${s.name === l.assigned ? " selected" : ""}>${esc(s.name)}</option>`).join("")}${l.assigned && !(kit?.staff || []).some((s) => s.name === l.assigned) ? `<option selected>${esc(l.assigned)}</option>` : ""}</select></label>
        <label class="field"><span>Follow up on</span><input type="date" name="follow_up" value="${esc((l.follow_up || "").slice(0, 10))}"></label>
        <label class="field"><span>Kind</span><select name="kind"><option value="sales"${sales ? " selected" : ""}>Sales enquiry</option><option value="recruitment"${sales ? "" : " selected"}>Job application</option></select></label>
      </div>
      <label class="field"><span>Notes, for you only</span><textarea name="notes" rows="4" placeholder="Called back, quote sent…">${esc(l.notes || "")}</textarea></label>
      <div class="row-between"><button class="btn is-danger-quiet" type="button" data-delete>${icon("trash", 15)} Delete</button><button class="btn" type="submit">Save</button></div>
    </form></article>`;
}

function wireReader(view, l, reload) {
  const form = $("[data-lead]", view);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await studioPost("lead-update", { id: l.id, status: form.status.value, notes: form.notes.value, assigned: form.assigned.value, follow_up: form.follow_up.value, kind: form.kind.value });
      toast("Saved.");
      reload();
    } catch (err) {
      toast(err.message, { error: true });
    }
  });
  ["status", "assigned", "follow_up", "kind"].forEach((k) => form[k].addEventListener("change", () => form.requestSubmit()));
  $("[data-delete]", view).addEventListener("click", async () => {
    if (!(await confirmBox(`Delete the enquiry from ${l.name}? This can't be undone.`))) return;
    await post("lead-delete", { id: l.id });
    toast("Deleted.");
    location.hash = "#/enquiries";
  });
}

/* ---------- Speed and uptime ---------- */

export async function speed(view, { days }) {
  loading(view);
  try {
    const [sp, up] = await Promise.all([api("speed", { params: { days } }), api("uptime", { params: { days: Math.max(days, 7) } })]);
    const o = sp.overall;
    const [band, bandName] = lcpBand(o.lcp);
    const upPct = up.checks ? share(up.up, up.checks) : null;
    const total = o.good + o.fair + o.poor;
    const last = up.recent[0];
    view.innerHTML =
      head("Speed and uptime.", `How quickly pages load for real visitors, and whether the site stayed up, ${rangeLabel(days)}.`, rangePicker(days)) +
      `<div class="kpis">
        ${kpi({ label: "Load time", value: secs(o.lcp), sub: `${bandName} · largest content shown`, tone: band })}
        ${kpi({ label: "Server response", value: secs(o.ttfb), sub: "first byte" })}
        ${kpi({ label: "Fully loaded", value: secs(o.load) })}
        ${kpi({ label: "Uptime", value: upPct == null ? "–" : `${upPct}%`, sub: up.checks ? `${num(up.up)} of ${num(up.checks)} checks` : "No checks yet", tone: upBand(upPct) })}
        ${kpi({ label: "Response time", value: up.ms ? secs(up.ms) : "–", sub: "average, when up" })}
        ${kpi({ label: "Last check", value: last ? (last.ok ? "Up" : "Down") : "–", sub: last ? ago(last.ts) : "", tone: last ? (last.ok ? "is-good" : "is-poor") : "" })}
      </div>
      <div class="grid is-main">
        ${card(
          "Load time, day by day",
          sp.series.length
            ? lineChart(sp.series, [{ key: "lcp", label: "Load time (ms)", color: COLORS.red, area: true }, { key: "ttfb", label: "Server response (ms)", color: COLORS.grey }], pointLabel(days === 1 ? 7 : days), { fmt: (v) => secs(v) })
            : empty("No speed readings yet", "Each visit sends one once its first page has loaded."),
        )}
        ${card(
          "How visits felt",
          total
            ? `<div class="meter"><span class="is-good" style="width:${share(o.good, total)}%"></span><span class="is-fair" style="width:${share(o.fair, total)}%"></span><span class="is-poor" style="width:${share(o.poor, total)}%"></span></div>
               <ul class="legend"><li><i class="is-good"></i>Good, under 2.5 s<b>${share(o.good, total)}%</b></li><li><i class="is-fair"></i>Needs work, 2.5 to 4 s<b>${share(o.fair, total)}%</b></li><li><i class="is-poor"></i>Poor, over 4 s<b>${share(o.poor, total)}%</b></li></ul>
               <p class="muted small">From ${num(o.samples)} real visits. Google uses the same bands in search.</p>`
            : empty("No readings yet"),
        )}
      </div>
      <div class="grid is-2">
        ${card("Slowest pages", sp.pages.length ? `<table class="table"><thead><tr><th>Page</th><th class="num">Load time</th><th class="num hide-sm">Visits</th></tr></thead><tbody>${sp.pages.map((r) => `<tr><td><a href="#" data-page="${esc(r.name)}" class="cell-link"><b>${esc(r.name)}</b></a></td><td class="num"><span class="dot ${lcpBand(r.lcp)[0]}"></span>${secs(r.lcp)}</td><td class="num hide-sm">${num(r.samples)}</td></tr>`).join("")}</tbody></table>` : empty("No readings yet"))}
        ${card("By device", bars(sp.devices, { value: (r) => r.lcp || 0, fmt: secs, sub: (r) => `${num(r.samples)} visits`, limit: 5 }))}
      </div>
      ${card(
        "Uptime checks",
        `<div class="uptime-days">${up.series.map((d) => `<span class="${d.up === d.checks ? "is-good" : d.up ? "is-fair" : "is-poor"}" title="${day(d.label)}: ${d.up} of ${d.checks} up"></span>`).join("") || `<span class="muted small">No checks yet.</span>`}</div>
         ${up.recent.length ? `<table class="table"><thead><tr><th>When</th><th>Result</th><th class="num">Response</th><th class="hide-sm">By</th></tr></thead><tbody>${up.recent.slice(0, 10).map((c) => `<tr><td>${day(c.ts, { day: "numeric", month: "short" })} ${clock(c.ts)}</td><td><span class="pill ${c.ok ? "is-won" : "is-lost"}">${c.ok ? "Up" : "Down"}${c.status ? ` · ${c.status}` : ""}</span></td><td class="num">${secs(c.ms)}</td><td class="hide-sm muted">${c.source === "schedule" ? "Daily check" : "Check now"}</td></tr>`).join("")}</tbody></table>` : ""}
         <p class="muted small">The home page is checked automatically once a day, and whenever you press Check now.</p>`,
        { action: `<button class="btn is-small" type="button" data-check>${icon("pulse", 14)} Check now</button>` },
      )}`;
    wireCharts(view, (v) => secs(v));
    wirePages(view, days);
    $("[data-check]", view).addEventListener("click", async (e) => {
      e.target.disabled = true;
      try {
        const r = await fetch("/api/uptime").then((x) => x.json());
        toast(r.check?.ok ? `The site is up (${secs(r.check.ms)}).` : "The site didn't answer.", { error: !r.check?.ok });
        speed(view, { days });
      } catch (err) {
        toast(err.message, { error: true });
        e.target.disabled = false;
      }
    });
  } catch (e) {
    failed(view, e, () => speed(view, { days }));
  }
}

/* ---------- Blog ---------- */

let richPending = null;
function loadRichEditor() {
  if (window.toastui?.Editor) return Promise.resolve();
  if (!document.querySelector('link[href="/admin/vendor/toastui/toastui-editor.min.css"]')) {
    document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href: "/admin/vendor/toastui/toastui-editor.min.css" }));
  }
  richPending ||= new Promise((ok, no) => document.head.append(Object.assign(document.createElement("script"), { src: "/admin/vendor/toastui/toastui-editor-all.min.js", onload: ok, onerror: () => ((richPending = null), no()) })));
  return richPending;
}

const live = (p) => p.status === "published" && new Date(p.published_at) <= new Date();
const postState = (p) => (p.status !== "published" ? ["is-draft", "Draft"] : live(p) ? ["is-won", "Live"] : ["is-quoted", `Scheduled ${day(p.published_at, { day: "numeric", month: "short" })}`]);

export async function blog(view) {
  loading(view);
  try {
    const { posts } = await api("posts");
    view.innerHTML =
      head("Blog.", "News and advice on the website, at newconceptsecurity.co.uk/blog.", `<a class="btn is-quiet" href="/blog" target="_blank" rel="noopener">${icon("external", 15)} View blog</a><a class="btn" href="#/blog/new">${icon("plus", 15)} New post</a>`) +
      card(
        "",
        posts.length
          ? `<ul class="posts">${posts
              .map((p) => {
                const [cls, name] = postState(p);
                return `<li><a href="#/blog/${p.id}">${p.cover ? `<img src="/images/${esc(p.cover)}.jpg" alt="" loading="lazy">` : `<span class="post-noimg"></span>`}<span><b>${esc(p.title)}</b><small>${esc(TOPICS.find((t) => t[0] === p.topic)?.[1] || "")}${p.published_at ? ` · ${day(p.published_at)}` : ""}</small></span><span class="pill ${cls}">${name}</span></a></li>`;
              })
              .join("")}</ul>`
          : empty("No posts yet", "Write the first one: news about the company, a new contract, or advice for clients."),
      );
  } catch (e) {
    failed(view, e, () => blog(view));
  }
}

export async function editPost(view, { id }) {
  loading(view);
  let p = { title: "", slug: "", dek: "", topic: "news", cover: PHOTOS[0], body: "", status: "draft", published_at: "" };
  try {
    if (id !== "new") {
      const found = (await api("posts")).posts.find((x) => String(x.id) === String(id));
      if (!found) return (location.hash = "#/blog");
      p = found;
    }
  } catch (e) {
    return failed(view, e, () => editPost(view, { id }));
  }
  const local = (d) => (d ? new Date(new Date(d).getTime() - new Date(d).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
  view.innerHTML =
    head(id === "new" ? "New post." : "Edit post.", "", `<a class="btn is-quiet" href="#/blog">${icon("back", 15)} All posts</a>${p.id && live(p) ? `<a class="btn is-quiet" href="/blog/${esc(p.slug)}" target="_blank" rel="noopener">${icon("external", 15)} View live</a>` : ""}`) +
    `<form class="editor" data-post>
      <div class="editor-main card"><div class="card-body form">
        <label class="field"><span>Title</span><input name="title" value="${esc(p.title)}" required maxlength="200" placeholder="What happened, or what you want readers to know"></label>
        <label class="field"><span>Summary <em>shown under the title and in search results</em></span><textarea name="dek" rows="2" maxlength="400">${esc(p.dek || "")}</textarea></label>
        <div class="field"><span>Text <em data-count></em></span>
          <div class="rich" data-rich><div class="loading"><span></span>Loading the editor…</div></div>
          <textarea name="body" rows="18" class="mono" hidden placeholder="## A heading\n\nA paragraph…">${esc(p.body || "")}</textarea>
          <div class="rich-tools">
            <label>Insert a site photo <select data-photo-insert><option value="">Choose…</option>${PHOTOS.map((ph) => `<option value="${ph}">${ph}</option>`).join("")}</select></label>
            <span class="muted small">Ctrl S saves. Unsaved changes are kept in this browser.</span>
          </div>
          <p class="note" data-draft hidden></p>
        </div>
      </div></div>
      <aside class="editor-side">
        ${card("Publish", `<div class="form">
          <label class="field"><span>Status</span><select name="status"><option value="draft"${p.status !== "published" ? " selected" : ""}>Draft, only here</option><option value="published"${p.status === "published" ? " selected" : ""}>Published</option></select></label>
          <label class="field"><span>Publish date <em>leave empty for now</em></span><input type="datetime-local" name="published_at" value="${local(p.published_at)}"></label>
          <label class="field"><span>Address</span><div class="prefix"><em>/blog/</em><input name="slug" value="${esc(p.slug)}" placeholder="made from the title"></div></label>
          <label class="field"><span>Topic</span><select name="topic">${TOPICS.map(([k, n]) => `<option value="${k}"${k === p.topic ? " selected" : ""}>${n}</option>`).join("")}</select></label>
          <div class="row-between">${p.id ? `<button class="btn is-danger-quiet" type="button" data-delete>${icon("trash", 15)} Delete</button>` : "<span></span>"}<button class="btn" type="submit">Save</button></div></div>`)}
        ${card("Cover photograph", `<div class="covers">${PHOTOS.map((ph) => `<button type="button" data-cover="${ph}" aria-pressed="${ph === p.cover}" title="${ph}"><img src="/images/${ph}.jpg" alt="${ph}" loading="lazy"></button>`).join("")}</div>`)}
      </aside>
      <section class="card editor-preview"><header class="card-head"><h2>Preview</h2></header><div class="card-body"><article class="preview" data-preview></article></div></section>
    </form>`;
  const form = $("[data-post]", view);
  let cover = p.cover;
  const draw = () => {
    const { html, minutes } = render(form.body.value);
    $("[data-preview]", view).innerHTML = `${cover ? `<img src="/images/${cover}.jpg" alt="">` : ""}<p class="preview-meta">${esc(TOPICS.find((t) => t[0] === form.topic.value)?.[1] || "")} · ${minutes} min read</p><h1>${esc(form.title.value || "Your title")}</h1>${form.dek.value ? `<p class="preview-dek">${esc(form.dek.value)}</p>` : ""}${html}`;
  };
  form.addEventListener("input", draw);

  // The rich text editor (Toast UI Editor, served from /admin/vendor). It
  // writes Markdown, which the blog renders. If it can't load, the plain
  // Markdown box takes its place.
  const draftKey = `ncs-post-draft:${p.id || "new"}`;
  const stash = () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ body: form.body.value, title: form.title.value, dek: form.dek.value, at: Date.now() }));
    } catch {}
  };
  const counts = () => {
    const { words, minutes } = render(form.body.value);
    $("[data-count]", view).textContent = `${words} words · about ${minutes} min read`;
  };
  let editor = null;
  loadRichEditor()
    .then(() => {
      const box = $("[data-rich]", view);
      if (!box) return;
      box.innerHTML = "";
      editor = new window.toastui.Editor({
        el: box,
        height: "620px",
        initialEditType: "wysiwyg",
        previewStyle: "tab",
        initialValue: form.body.value,
        placeholder: "Write the post. Use the toolbar for headings, lists, tables, quotes and links.",
        usageStatistics: false, // no reports to the editor's makers
        hideModeSwitch: false,
        toolbarItems: [["heading", "bold", "italic", "strike"], ["hr", "quote"], ["ul", "ol", "task", "indent", "outdent"], ["table", "image", "link"], ["code", "codeblock"]],
        hooks: {
          addImageBlobHook: () => toast("Pictures can't be uploaded into posts. Use a site photo, or the picture button with a web address.", { error: true }),
        },
      });
      editor.on("change", () => {
        form.body.value = editor.getMarkdown();
        draw();
        counts();
        stash();
      });
    })
    .catch(() => {
      $("[data-rich]", view)?.remove();
      form.body.hidden = false;
      toast("The rich text editor couldn't load, so the plain text box is showing instead.", { error: true });
    });
  form.body.addEventListener("input", () => (counts(), stash()));
  form.title.addEventListener("input", stash);
  form.dek.addEventListener("input", stash);
  counts();

  $("[data-photo-insert]", view).addEventListener("change", (e) => {
    const ph = e.target.value;
    e.target.value = "";
    if (!ph) return;
    if (editor) editor.exec("addImage", { imageUrl: `/images/${ph}.jpg`, altText: ph.replace(/-/g, " ") });
    else form.body.value += `\n\n![${ph.replace(/-/g, " ")}](/images/${ph}.jpg)\n`;
    form.body.value = editor ? editor.getMarkdown() : form.body.value;
    draw();
  });

  // An unsaved draft from earlier in this browser.
  try {
    const saved = JSON.parse(localStorage.getItem(draftKey) || "null");
    const newer = saved && saved.at > new Date(p.updated_at || 0).getTime() && (saved.body !== (p.body || "") || saved.title !== (p.title || ""));
    if (newer) {
      const note = $("[data-draft]", view);
      note.hidden = false;
      note.innerHTML = `There are unsaved changes from ${new Date(saved.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}. <button class="link" type="button" data-restore>Bring them back</button> · <button class="link" type="button" data-discard>Discard</button>`;
      note.addEventListener("click", (e) => {
        if (e.target.matches("[data-restore]")) {
          form.title.value = saved.title;
          form.dek.value = saved.dek;
          form.body.value = saved.body;
          editor?.setMarkdown(saved.body, false);
          draw();
          counts();
        }
        if (e.target.matches("[data-restore], [data-discard]")) {
          if (e.target.matches("[data-discard]")) localStorage.removeItem(draftKey);
          note.hidden = true;
        }
      });
    }
  } catch {}

  const saveKeys = (e) => {
    if (!document.contains(form)) return removeEventListener("keydown", saveKeys);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      form.requestSubmit();
    }
  };
  addEventListener("keydown", saveKeys);
  form.title.addEventListener("input", () => {
    if (!p.id || !form.slug.dataset.touched) form.slug.placeholder = slugify(form.title.value) || "made from the title";
  });
  form.slug.addEventListener("input", () => (form.slug.dataset.touched = "1"));
  $$("[data-cover]", view).forEach((b) =>
    b.addEventListener("click", () => {
      cover = b.dataset.cover;
      $$("[data-cover]", view).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      draw();
    }),
  );
  draw();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const when = form.published_at.value ? new Date(form.published_at.value).toISOString() : "";
    try {
      const { post: saved } = await post("post-save", { id: p.id, title: form.title.value, slug: form.slug.value, dek: form.dek.value, topic: form.topic.value, cover, body: form.body.value, status: form.status.value, published_at: when });
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      toast(saved.status === "published" ? (live(saved) ? "Published." : "Scheduled.") : "Draft saved.");
      location.hash = `#/blog/${saved.id}`;
      if (String(saved.id) === String(id)) editPost(view, { id: saved.id });
    } catch (err) {
      toast(err.message, { error: true });
    }
  });
  $("[data-delete]", view)?.addEventListener("click", async () => {
    if (!(await confirmBox(`Delete "${p.title}"? It comes off the website straight away.`))) return;
    await post("post-delete", { id: p.id });
    toast("Deleted.");
    location.hash = "#/blog";
  });
}

/* ---------- Announcement ---------- */

export async function announcement(view) {
  loading(view);
  let a = {};
  try {
    a = (await api("settings")).settings.announcement || {};
  } catch (e) {
    return failed(view, e, () => announcement(view));
  }
  const expired = a.until && new Date(a.until) < new Date();
  view.innerHTML =
    head("Announcement.", "A short message in a red bar along the bottom of every page of the website. Visitors can close it.") +
    `<div class="grid is-main">
      ${card(
        "Message",
        `<form class="form" data-ann>
          <label class="switch"><input type="checkbox" name="on"${a.on ? " checked" : ""}><span></span>Show it on the website</label>
          <label class="field"><span>Text</span><input name="text" maxlength="200" value="${esc(a.text || "")}" placeholder="We're recruiting SIA licensed door supervisors in Blackpool"></label>
          <div class="grid is-2 is-flat">
            <label class="field"><span>Link <em>optional</em></span><input name="link" maxlength="300" value="${esc(a.link || "")}" placeholder="/careers"></label>
            <label class="field"><span>Link words</span><input name="label" maxlength="40" value="${esc(a.label || "")}" placeholder="Apply now"></label>
          </div>
          <label class="field"><span>Take it down on <em>optional</em></span><input type="date" name="until" value="${esc(a.until || "")}"></label>
          ${expired ? `<p class="note is-warn">The end date has passed, so the bar isn't showing.</p>` : ""}
          <div class="row-end"><button class="btn" type="submit">Save</button></div>
        </form>`,
      )}
      ${card("Preview", `<div class="ann-preview"><div class="ann-page"></div><div class="ann-bar" data-bar></div></div>`)}
    </div>`;
  const form = $("[data-ann]", view);
  const draw = () => {
    const on = form.on.checked && form.text.value.trim();
    $("[data-bar]", view).innerHTML = on ? `<span>${esc(form.text.value)}${form.link.value ? ` <u>${esc(form.label.value || "Find out more")}</u>` : ""}</span><b>×</b>` : `<em>Hidden</em>`;
    $("[data-bar]", view).classList.toggle("is-off", !on);
  };
  form.addEventListener("input", draw);
  draw();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await post("settings-save", { key: "announcement", value: { on: form.on.checked, text: form.text.value, link: form.link.value, label: form.label.value, until: form.until.value } });
      toast(form.on.checked ? "The announcement is live." : "Saved. It isn't showing.");
    } catch (err) {
      toast(err.message, { error: true });
    }
  });
}

/* ---------- Tools ---------- */

/* Each tool is its own page in the admin, drawn in a frame. */
export const TOOLS = [
  ["business-card", "Business cards", "card", "tools/business-card.html", "Staff cards from saved profiles, 3D preview, batch print"],
  ["letterhead", "Letterhead", "file", "tools/letterhead.html", "Headed paper and letters, PDF and a Word template"],
  ["id-badge", "ID badges", "badge", "tools/id-badge.html", "Officer cards with photo, licence and expiry check"],
  ["visitor-pass", "Visitor passes", "badge", "tools/visitor-pass.html", "Colour of the day, escort and contractor, numbered sheets"],
  ["email", "Email templates", "mail", "tools/email.html", "Business emails and signatures for the whole office"],
  ["post", "Social posts", "megaphone", "tools/post.html", "Posts, banners, flyers and posters at every size"],
  ["files", "File tools", "download", "tools/files.html", "Merge, split, compress, page numbers, watermarks, QR codes"],
  ["pdf", "PDF viewer", "pen", "pdfjs/web/viewer.html", "Read, fill in, add text, draw, highlight, sign and reorder pages"],
];
// Old addresses from before the tools had their own pages.
const OLD_TOOL = { badge: "id-badge", pass: "visitor-pass" };

export function toolView(view, { id, query }) {
  const t = TOOLS.find((x) => x[0] === (OLD_TOOL[id] || id));
  if (!t) return (location.hash = "#/brand");
  const src = `/admin/${t[3]}${query ? `?${esc(query)}` : ""}`;
  view.innerHTML = `<div class="toolbar-head"><div><h1>${esc(t[1])}</h1><p class="muted">${esc(t[4])}</p></div>
      <a class="btn is-quiet is-small" href="${src}" target="_blank" rel="noopener">${icon("external", 14)} Open on its own</a></div>
    <iframe class="frame${t[0] === "pdf" ? " is-tall" : ""}" src="${src}" title="${esc(t[1])}"></iframe>`;
}

/* ---------- Coming next ---------- */

export function next(view) {
  view.innerHTML =
    head("Coming next.", "Tools planned for this dashboard. They are not available yet; this page says so until they are.") +
    `<div class="docs is-next">${COMING_NEXT.map(([t, b]) => `<div><span class="chip">Planned</span><b>${t}</b><span>${b}</span></div>`).join("")}</div>
    <p class="footnote">Available today: traffic and visitors, where visitors come from, enquiries and conversions, speed and uptime, the blog, the announcement and the document builders.</p>`;
}

/* ---------- Settings ---------- */

export async function settings(view) {
  loading(view);
  let log = [];
  try {
    log = (await api("log")).log;
  } catch (e) {
    return failed(view, e, () => settings(view));
  }
  view.innerHTML =
    head("Settings.") +
    `<div class="grid is-2">
      ${card(
        "Admin access",
        `<p class="muted small">Admins sign in with their email and a password, through Supabase. Only accounts given admin access can open this panel.</p>
        <div class="stack">
          <a class="btn is-quiet" href="/admin/login.html#forgot" data-reset>${icon("lock", 15)} Change my password</a>
        </div>
        <p class="muted small" style="margin-top:14px">To give someone access, run <code>npm run admin:add -- their@email.co.uk</code> on the office computer; they get an email to choose a password. <code>npm run admin:remove -- their@email.co.uk</code> takes it away.</p>`,
      )}
      ${card(
        "Your data",
        `<p class="muted small">Downloads of everything the panel keeps.</p>
        <div class="stack">
          <a class="btn is-quiet" href="/api/admin?action=export&what=leads">${icon("download", 15)} Enquiries (CSV)</a>
          <a class="btn is-quiet" href="/api/admin?action=export&what=views">${icon("download", 15)} Page views, last 12 months (CSV)</a>
          <a class="btn is-quiet" href="/api/admin?action=export&what=events">${icon("download", 15)} Calls, emails and enquiries (CSV)</a>
          <a class="btn is-quiet" href="/api/admin?action=backup">${icon("download", 15)} Full backup: posts, enquiries, settings (JSON)</a>
        </div>`,
      )}
    </div>
    ${card(
      "Recent activity",
      log.length
        ? `<table class="table"><thead><tr><th>When</th><th>What</th><th class="hide-sm">Detail</th></tr></thead><tbody>${log
            .map((r) => `<tr><td>${day(r.ts, { day: "numeric", month: "short" })} ${clock(r.ts)}</td><td><span class="dot ${r.ok ? "is-good" : "is-poor"}"></span>${esc(r.action)}</td><td class="hide-sm muted">${esc(r.detail || "")}</td></tr>`)
            .join("")}</tbody></table>`
        : empty("Nothing yet"),
    )}`;
  $("[data-reset]", view).addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch("/api/logout", { method: "POST" });
    location.href = "/admin/login.html#forgot";
  });
}


