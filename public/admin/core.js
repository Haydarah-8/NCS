/* New Concept Security admin: the shared pieces. The server API, formatting,
   icons, small UI helpers and the charts (plain SVG, no libraries). */

/* ---------- Server ---------- */

export async function api(action, { method = "GET", body, params = {} } = {}) {
  const query = new URLSearchParams({ action, ...params });
  let res;
  try {
    res = await fetch(`/api/admin?${query}`, {
      method,
      headers: body ? { "content-type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      // Never spin forever: after 25 seconds the page says so and offers to try again.
      signal: AbortSignal.timeout(25_000),
    });
  } catch (e) {
    throw new Error(e?.name === "TimeoutError" ? "The server took too long to answer. Try again." : "Couldn't reach the server. Check your connection.");
  }
  if (res.status === 401) {
    location.href = `/admin/login.html?next=${encodeURIComponent(location.pathname + location.hash)}`;
    throw new Error("Signed out");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Something went wrong (${res.status}).`);
  return data;
}
export const post = (action, body) => api(action, { method: "POST", body });

/* The Business Studio's own data (documents, locations, brand kit). */
export async function studio(action, { method = "GET", body, params = {} } = {}) {
  let res;
  try {
    res = await fetch(`/api/studio?${new URLSearchParams({ action, ...params })}`, {
      method,
      headers: body ? { "content-type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(25_000),
    });
  } catch (e) {
    throw new Error(e?.name === "TimeoutError" ? "The server took too long to answer. Try again." : "Couldn't reach the server. Check your connection.");
  }
  if (res.status === 401) {
    location.href = `/admin/login.html?next=${encodeURIComponent(location.pathname + location.hash)}`;
    throw new Error("Signed out");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Something went wrong (${res.status}).`);
  return data;
}
export const studioPost = (action, body) => studio(action, { method: "POST", body });

/* The brand kit, fetched once per page load. */
let brandPromise = null;
export const brandKit = (fresh = false) => {
  if (fresh || !brandPromise) brandPromise = studio("brand").then((d) => d.brand).catch((e) => ((brandPromise = null), Promise.reject(e)));
  return brandPromise;
};

/* ---------- Formatting ---------- */

const nf = new Intl.NumberFormat("en-GB");
export const num = (x) => nf.format(Math.round(Number(x) || 0));
export const pct = (x) => `${Math.round(Number(x) || 0)}%`;
export const share = (part, whole) => (whole ? Math.round((part / whole) * 1000) / 10 : 0);
export const dur = (s) => (!s ? "–" : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`);
export const secs = (ms) => (ms == null ? "–" : ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s`);
export const day = (d, opts = { day: "numeric", month: "short", year: "numeric" }) => new Date(d).toLocaleDateString("en-GB", { timeZone: "Europe/London", ...opts });
export const clock = (d) => new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
export function ago(d) {
  const s = Math.round((Date.now() - new Date(d)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return day(d);
}
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* The change against the period before: "+12%", "−3%", or nothing. */
export function delta(now, before, { invert = false } = {}) {
  if (!before && !now) return "";
  if (!before) return `<span class="kpi-delta is-up">New</span>`;
  const d = Math.round(((now - before) / before) * 100);
  if (!d) return `<span class="kpi-delta">0%</span>`;
  const good = invert ? d < 0 : d > 0;
  return `<span class="kpi-delta ${good ? "is-up" : "is-down"}">${d > 0 ? "+" : "−"}${Math.abs(d)}%</span>`;
}

/* ---------- Storage (per browser conveniences only) ---------- */

export const prefs = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(`ncs-admin:${key}`);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`ncs-admin:${key}`, JSON.stringify(value));
    } catch {}
  },
};

/* ---------- Icons (24px grid, stroked) ---------- */

const PATHS = {
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  inbox: '<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 5h14l2 8v6H3v-6z"/>',
  gauge: '<path d="M12 14 16 9"/><path d="M3.5 18a9 9 0 1 1 17 0"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6"/>',
  file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bolt: '<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>',
  pulse: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h6M7 14h3"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  badge: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/>',
  sign: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
};
export const icon = (name, size = 18) =>
  `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || PATHS.spark}</svg>`;

/* ---------- UI ---------- */

export function toast(text, { error = false } = {}) {
  let box = $(".toasts");
  if (!box) document.body.append((box = Object.assign(document.createElement("div"), { className: "toasts", role: "status" })));
  const t = Object.assign(document.createElement("div"), { className: `toast${error ? " is-error" : ""}`, textContent: text });
  box.append(t);
  setTimeout(() => t.classList.add("is-out"), 3200);
  setTimeout(() => t.remove(), 3600);
}

export function confirmBox(text, { ok = "Delete" } = {}) {
  return new Promise((done) => {
    const d = document.createElement("dialog");
    d.className = "dialog";
    d.innerHTML = `<form method="dialog"><p>${esc(text)}</p><div class="row-end"><button class="btn is-quiet" value="no">Cancel</button><button class="btn is-danger" value="yes">${esc(ok)}</button></div></form>`;
    document.body.append(d);
    d.addEventListener("close", () => {
      done(d.returnValue === "yes");
      d.remove();
    });
    d.showModal();
  });
}

export const head = (title, text = "", actions = "") =>
  `<header class="page-head"><div><h1>${title}</h1>${text ? `<p>${text}</p>` : ""}</div>${actions ? `<div class="page-actions">${actions}</div>` : ""}</header>`;

export const card = (title, body, { action = "", cls = "" } = {}) =>
  `<section class="card ${cls}">${title ? `<header class="card-head"><h2>${title}</h2>${action}</header>` : ""}<div class="card-body">${body}</div></section>`;

export const empty = (title, text = "") => `<div class="empty">${icon("spark", 22)}<b>${title}</b>${text ? `<span>${text}</span>` : ""}</div>`;

export function kpi({ label, value, sub = "", deltaHtml = "", tone = "" }) {
  return `<div class="kpi ${tone}"><span class="kpi-label">${label}</span><b class="kpi-value">${value}</b><span class="kpi-sub">${deltaHtml}${sub ? `<span>${sub}</span>` : ""}</span></div>`;
}

/* Periods the analytics views can show. */
export const RANGES = [
  [1, "Today"],
  [7, "7 days"],
  [30, "30 days"],
  [90, "90 days"],
  [365, "12 months"],
];
export const rangeLabel = (days) => (days === 1 ? "today" : days === 365 ? "the last 12 months" : `the last ${days} days`);
export function rangePicker(days) {
  return `<div class="seg" role="group" aria-label="Period">${RANGES.map(([d, l]) => `<button type="button" data-range="${d}" aria-pressed="${d === days}">${l}</button>`).join("")}</div>`;
}

export function download(name, text, type = "text/plain") {
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- Charts ---------- */

export const COLORS = { red: "#A01010", ink: "#1D1D1F", grey: "#A1A1A6", blue: "#2F6BC4", green: "#1D7A4B", amber: "#B7791F" };

const niceMax = (v) => {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v) || v;
};

/* An area-and-line chart over time with a hover readout. `series` is
   [{ key, label, color, area? }]; `label(row)` names each point. */
export function lineChart(rows, series, label, { height = 240, fmt = num } = {}) {
  if (!rows.length) return empty("Nothing to show yet");
  const W = 720, H = height, L = 40, R = 12, T = 14, B = 26;
  const max = niceMax(Math.max(1, ...rows.flatMap((r) => series.map((s) => Number(r[s.key]) || 0))));
  const x = (i) => L + (rows.length === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (rows.length - 1));
  const y = (v) => T + (H - T - B) * (1 - (Number(v) || 0) / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => max * t);
  const every = Math.max(1, Math.ceil(rows.length / 7));
  const grid = ticks.map((t) => `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${fmt(t)}</text>`).join("");
  const xs = rows.map((r, i) => (i % every === 0 || i === rows.length - 1 ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(label(r, false))}</text>` : "")).join("");
  const lines = series
    .map((s) => {
      const pts = rows.map((r, i) => `${x(i).toFixed(1)},${y(r[s.key]).toFixed(1)}`);
      const area = s.area ? `<path d="M${pts[0]} L${pts.join(" L")} L${x(rows.length - 1)},${y(0)} L${x(0)},${y(0)} Z" fill="${s.color}" fill-opacity="0.08"/>` : "";
      // One point draws no line, so it gets a dot.
      const dot = rows.length === 1 ? `<circle cx="${x(0)}" cy="${y(rows[0][s.key])}" r="4" fill="${s.color}"/>` : "";
      return `${area}<polyline points="${pts.join(" ")}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${s.dash ? ' stroke-dasharray="4 4"' : ""}/>${dot}`;
    })
    .join("");
  const data = esc(JSON.stringify({ rows: rows.map((r) => ({ l: label(r, true), v: series.map((s) => Number(r[s.key]) || 0) })), names: series.map((s) => s.label), colors: series.map((s) => s.color), L, R, W }));
  return `<figure class="chart" data-line="${data}">
    <div class="chart-legend">${series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.label)}</span>`).join("")}</div>
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(series.map((s) => s.label).join(" and "))} over time"><g class="chart-grid">${grid}</g><g class="chart-x">${xs}</g>${lines}<line class="chart-cursor" x1="0" x2="0" y1="${T}" y2="${H - B}" hidden/></svg>
    <div class="chart-tip" hidden></div></figure>`;
}

/* Hover readouts for every line chart under root. */
export function wireCharts(root, fmt = num) {
  $$("[data-line]", root).forEach((fig) => {
    const d = JSON.parse(fig.dataset.line);
    const svg = $("svg", fig), tip = $(".chart-tip", fig), cur = $(".chart-cursor", fig);
    const move = (e) => {
      const box = svg.getBoundingClientRect();
      const px = ((e.clientX - box.left) / box.width) * d.W;
      const n = d.rows.length;
      const i = Math.max(0, Math.min(n - 1, Math.round(((px - d.L) / (d.W - d.L - d.R)) * (n - 1))));
      const cx = n === 1 ? (d.W - d.L - d.R) / 2 + d.L : d.L + (i * (d.W - d.L - d.R)) / (n - 1);
      cur.setAttribute("x1", cx);
      cur.setAttribute("x2", cx);
      cur.hidden = false;
      const r = d.rows[i];
      tip.innerHTML = `<b>${esc(r.l)}</b>${d.names.map((nm, k) => `<span><i style="background:${d.colors[k]}"></i>${esc(nm)}<em>${fmt(r.v[k])}</em></span>`).join("")}`;
      tip.hidden = false;
      const left = (cx / d.W) * box.width;
      tip.style.left = `${Math.min(box.width - tip.offsetWidth, Math.max(0, left - tip.offsetWidth / 2))}px`;
    };
    svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerleave", () => {
      tip.hidden = true;
      cur.hidden = true;
    });
  });
}

/* A ranked list with a bar behind each row. */
export function bars(rows, { value = (r) => r.visitors, name = (r) => r.name, sub = null, limit = 8, href = null, fmt = num } = {}) {
  const list = rows.slice(0, limit);
  if (!list.length) return empty("Nothing yet", "It fills in as visitors arrive.");
  const max = Math.max(1, ...list.map(value));
  return `<ol class="bars">${list
    .map((r) => {
      const inner = `<span class="bar-fill" style="width:${((value(r) / max) * 100).toFixed(1)}%"></span><span class="bar-name">${esc(name(r))}${sub ? `<small>${esc(sub(r))}</small>` : ""}</span><b>${fmt(value(r))}</b>`;
      return `<li>${href ? `<a href="${href(r)}">${inner}</a>` : `<div>${inner}</div>`}</li>`;
    })
    .join("")}</ol>`;
}

/* A ring split into parts, with its legend. */
export function donut(parts, { label = "total", fmt = num } = {}) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (!total) return empty("Nothing yet");
  const palette = [COLORS.red, COLORS.ink, COLORS.blue, COLORS.green, COLORS.amber, COLORS.grey, "#7A4FB5", "#C2185B"];
  let at = 0;
  const C = 2 * Math.PI * 42;
  const arcs = parts
    .map((p, i) => {
      const len = (p.value / total) * C;
      const s = `<circle r="42" cx="60" cy="60" fill="none" stroke="${palette[i % palette.length]}" stroke-width="16" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-at}"/>`;
      at += len;
      return s;
    })
    .join("");
  return `<div class="donut"><svg viewBox="0 0 120 120" role="img" aria-label="Share by ${esc(label)}"><g transform="rotate(-90 60 60)">${arcs}</g><text x="60" y="58" text-anchor="middle" class="donut-n">${fmt(total)}</text><text x="60" y="74" text-anchor="middle" class="donut-l">${esc(label)}</text></svg>
    <ul>${parts.map((p, i) => `<li><i style="background:${palette[i % palette.length]}"></i>${esc(p.name)}<b>${share(p.value, total)}%</b></li>`).join("")}</ul></div>`;
}

/* Small columns, e.g. visits by hour or by weekday. */
export function columns(values, labels, { title = "" } = {}) {
  const max = Math.max(1, ...values);
  return `<div class="cols" role="img" aria-label="${esc(title)}">${values
    .map((v, i) => `<div class="col" title="${esc(labels[i])}: ${num(v)}"><span style="height:${Math.max(2, (v / max) * 100)}%"></span><small>${esc(labels[i])}</small></div>`)
    .join("")}</div>`;
}

export function sparkline(values, { width = 120, height = 32, color = COLORS.red } = {}) {
  if (values.length < 2) return "";
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * width).toFixed(1)},${(height - 2 - (v / max) * (height - 4)).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
}

/* "29 Oct" for a day, "14:00" for an hour of today. */
export const pointLabel = (days) => (r, long) => {
  if (days === 1) return `${String(r.label).padStart(2, "0")}:00`;
  const d = new Date(`${r.label}T12:00:00Z`);
  return long ? day(d, { weekday: "short", day: "numeric", month: "short" }) : day(d, days > 90 ? { month: "short" } : { day: "numeric", month: "short" });
};
