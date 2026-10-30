/* NCS Business Studio: the frame. The sidebar, the routes, the period the
   analytics show, the badges, and the quick-command search (Ctrl K). */

import { $, api, icon, prefs } from "./core.js";
import * as V from "./views.js";
import * as H from "./hub.js";
import * as D from "./docstudio.js";
import { openPalette } from "./palette.js";

const NAV = [
  ["Studio", [
    ["#/", "home", "Overview"],
    ["#/studio", "file", "Document Studio"],
    ["#/brand", "card", "Brand Studio"],
    ["#/insights", "chart", "Website Insights"],
    ["#/enquiries", "inbox", "Enquiries", "leads"],
    ["#/locations", "compass", "Locations"],
    ["#/library", "badge", "Library"],
  ]],
  ["Website", [
    ["#/blog", "pen", "Blog", "drafts"],
    ["#/announcement", "megaphone", "Announcement"],
  ]],
  ["Tools", [
    ["#/documents", "receipt", "Paperwork"],
    ["#/documents/pdf", "pen", "PDF editor"],
    ["#/documents/files", "download", "File tools"],
  ]],
];
const FOOT = [
  ["#/next", "spark", "Coming next"],
  ["#/settings", "gear", "Settings"],
];

const ROUTES = [
  [/^#\/?$/, (v, a) => V.overview(v, a), "Overview"],
  [/^#\/studio$/, (v, a) => D.list(v, a), "Document Studio"],
  [/^#\/studio\/new\/([\w-]+)$/, (v, a, m) => D.create(v, { ...a, kind: m[1] }), "Document Studio"],
  [/^#\/studio\/(\d+)$/, (v, a, m) => D.edit(v, { ...a, id: m[1] }), "Document Studio"],
  [/^#\/brand$/, (v) => H.brandStudio(v), "Brand Studio"],
  [/^#\/insights$/, (v, a) => H.insights(v, a), "Website Insights"],
  [/^#\/insights\/campaigns$/, (v, a) => H.campaigns(v, a), "Campaign links"],
  [/^#\/traffic$/, (v, a) => V.traffic(v, a), "Traffic"],
  [/^#\/sources$/, (v, a) => V.sources(v, a), "Sources"],
  [/^#\/speed$/, (v, a) => V.speed(v, a), "Speed and uptime"],
  [/^#\/enquiries(?:\/(\w+))?$/, (v, a, m) => V.enquiries(v, { ...a, id: m[1] }), "Enquiries"],
  [/^#\/locations$/, (v, a) => H.locations(v, a), "Locations"],
  [/^#\/library$/, (v, a) => H.library(v, a), "Library"],
  [/^#\/blog$/, (v) => V.blog(v), "Blog"],
  [/^#\/blog\/(new|\w+)$/, (v, a, m) => V.editPost(v, { id: m[1] }), "Blog"],
  [/^#\/announcement$/, (v) => V.announcement(v), "Announcement"],
  [/^#\/documents$/, (v) => V.documents(v), "Paperwork"],
  [/^#\/documents\/([\w-]+)$/, (v, a, m) => V.documentView(v, { id: m[1], query: a.query }), "Paperwork"],
  [/^#\/next$/, (v) => V.next(v), "Coming next"],
  [/^#\/settings$/, (v, a) => H.settings(v, a), "Settings"],
];

/* Pages that light up a sidebar item other than their own address. */
const PARENT = { "#/traffic": "#/insights", "#/sources": "#/insights", "#/speed": "#/insights", "#/insights/campaigns": "#/insights" };

const side = $("#side");
const view = $("#view");
let days = prefs.get("days", 30);
let counts = {};

function drawSide() {
  const raw = location.hash.split("?")[0] || "#/";
  const here = PARENT[raw] || raw;
  const all = NAV.flatMap(([, items]) => items).concat(FOOT);
  const best = all
    .map(([h]) => h)
    .filter((h) => (h === "#/" ? here === "#/" || here === "#" || here === "" : here === h || here.startsWith(`${h}/`)))
    .sort((a, b) => b.length - a.length)[0];
  const link = ([href, ic, label, badge]) => {
    const n = badge === "leads" ? counts.new_leads : badge === "drafts" ? counts.drafts : 0;
    return `<a href="${href}"${href === best ? ' aria-current="page"' : ""}>${icon(ic, 18)}<span>${label}</span>${n ? `<b class="badge">${n}</b>` : ""}</a>`;
  };
  side.innerHTML = `
    <a class="brand" href="#/" aria-label="NCS Business Studio, overview">
      <svg viewBox="0 0 420 420" aria-hidden="true"><use href="#ncs-mark"/></svg>
      <span><b><i>NEW</i>CONCEPT</b><small>Business Studio</small></span>
    </a>
    <button class="side-search" type="button" data-palette>${icon("compass", 15)}<span>Search or jump to…</span><kbd>Ctrl K</kbd></button>
    <nav class="nav" aria-label="Business Studio">${NAV.map(([g, items]) => `<p>${g}</p>${items.map(link).join("")}`).join("")}</nav>
    <div class="nav nav-foot">
      ${FOOT.map(link).join("")}
      <a href="/" target="_blank" rel="noopener">${icon("globe", 18)}<span>View the website</span></a>
      <button type="button" data-signout>${icon("out", 18)}<span>Sign out</span></button>
    </div>
    ${counts.live ? `<p class="side-live"><i></i>${counts.live} on the site now</p>` : ""}`;
}

async function refreshCounts() {
  try {
    counts = await api("counts");
    drawSide();
  } catch {}
}

function route() {
  const [hash, query = ""] = location.hash.split("?");
  const found = ROUTES.map(([re, run, title]) => [hash.match(re), run, title]).find(([m]) => m);
  if (!found) return (location.hash = "#/");
  const [m, run, title] = found;
  document.title = `${title} · NCS Business Studio`;
  document.body.classList.remove("side-open");
  drawSide();
  window.scrollTo(0, 0);
  run(view, { days, query }, m);
  view.focus({ preventScroll: true });
}

addEventListener("hashchange", route);

document.addEventListener("click", async (e) => {
  const t = e.target;
  const r = t.closest("[data-range]");
  if (r) {
    days = Number(r.dataset.range);
    prefs.set("days", days);
    return route();
  }
  if (t.closest("[data-palette]")) return openPalette(NAV.flatMap(([, i]) => i).concat(FOOT));
  if (t.closest("[data-open-side]")) return document.body.classList.add("side-open");
  if (t.closest("[data-close-side]")) return document.body.classList.remove("side-open");
  if (t.closest("[data-signout]")) {
    await fetch("/api/logout", { method: "POST" });
    location.href = "/admin/login.html";
  }
});

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openPalette(NAV.flatMap(([, i]) => i).concat(FOOT));
  }
});

$("[data-open-side]").innerHTML = icon("menu", 20);
route();
refreshCounts();
setInterval(refreshCounts, 60_000);
addEventListener("hashchange", () => setTimeout(refreshCounts, 400));
