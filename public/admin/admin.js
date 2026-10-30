/* New Concept Security admin: the frame. The sidebar, the routes, the
   period the analytics show, and the badges for new enquiries and drafts. */

import { $, $$, api, icon, prefs } from "./core.js";
import * as V from "./views.js";

const NAV = [
  ["Website", [
    ["#/", "home", "Overview"],
    ["#/traffic", "chart", "Traffic"],
    ["#/sources", "compass", "Sources"],
    ["#/enquiries", "inbox", "Enquiries", "leads"],
    ["#/speed", "gauge", "Speed and uptime"],
  ]],
  ["Content", [
    ["#/blog", "pen", "Blog", "drafts"],
    ["#/announcement", "megaphone", "Announcement"],
  ]],
  ["Tools", [
    ["#/documents", "file", "Documents"],
    ["#/documents/pdf", "pen", "PDF editor"],
  ]],
];
const FOOT = [
  ["#/next", "spark", "Coming next"],
  ["#/settings", "gear", "Settings"],
];

const ROUTES = [
  [/^#\/?$/, (v, a) => V.overview(v, a), "Overview"],
  [/^#\/traffic$/, (v, a) => V.traffic(v, a), "Traffic"],
  [/^#\/sources$/, (v, a) => V.sources(v, a), "Sources"],
  [/^#\/enquiries(?:\/(\w+))?$/, (v, a, m) => V.enquiries(v, { ...a, id: m[1] }), "Enquiries"],
  [/^#\/speed$/, (v, a) => V.speed(v, a), "Speed and uptime"],
  [/^#\/blog$/, (v) => V.blog(v), "Blog"],
  [/^#\/blog\/(new|\w+)$/, (v, a, m) => V.editPost(v, { id: m[1] }), "Blog"],
  [/^#\/announcement$/, (v) => V.announcement(v), "Announcement"],
  [/^#\/documents$/, (v) => V.documents(v), "Documents"],
  [/^#\/documents\/([\w-]+)$/, (v, a, m) => V.documentView(v, { id: m[1] }), "Documents"],
  [/^#\/next$/, (v) => V.next(v), "Coming next"],
  [/^#\/settings$/, (v) => V.settings(v), "Settings"],
];

const side = $("#side");
const view = $("#view");
let days = prefs.get("days", 30);
let counts = {};

function drawSide() {
  const here = location.hash.split("?")[0] || "#/";
  const active = (href) =>
    href === "#/" ? here === "#/" || here === "#" || here === "" : here === href || (here.startsWith(`${href}/`) && !NAV.some(([, items]) => items.some(([h]) => h !== href && h.startsWith(href) && (here === h || here.startsWith(`${h}/`)))));
  const link = ([href, ic, label, badge]) => {
    const n = badge === "leads" ? counts.new_leads : badge === "drafts" ? counts.drafts : 0;
    return `<a href="${href}"${active(href) ? ' aria-current="page"' : ""}>${icon(ic, 18)}<span>${label}</span>${n ? `<b class="badge">${n}</b>` : ""}</a>`;
  };
  side.innerHTML = `
    <a class="brand" href="#/" aria-label="New Concept Security admin, overview">
      <svg viewBox="0 0 420 420" aria-hidden="true"><use href="#ncs-mark"/></svg>
      <span><b><i>NEW</i>CONCEPT</b><small>Admin</small></span>
    </a>
    <nav class="nav" aria-label="Admin">${NAV.map(([g, items]) => `<p>${g}</p>${items.map(link).join("")}`).join("")}</nav>
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
  document.title = `${title} · NCS admin`;
  document.body.classList.remove("side-open");
  drawSide();
  view.scrollTop = 0;
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
  if (t.closest("[data-open-side]")) return document.body.classList.add("side-open");
  if (t.closest("[data-close-side]")) return document.body.classList.remove("side-open");
  if (t.closest("[data-signout]")) {
    await fetch("/api/logout", { method: "POST" });
    location.href = "/admin/login.html";
  }
});

$("[data-open-side]").innerHTML = icon("menu", 20);
route();
refreshCounts();
setInterval(refreshCounts, 60_000);
addEventListener("hashchange", () => setTimeout(refreshCounts, 400));
