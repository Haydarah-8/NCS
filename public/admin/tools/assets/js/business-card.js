/* New Concept Security: business card studio.
   Twenty-four designs, each a front and a back drawn as SVG from the form, so the
   preview, the SVG, the PNG and the PDF are the same drawing. Colour, font,
   alignment, logo size, tagline, metallic foil, rounded corners and a QR code are
   all options. Exports embed the chosen font so the type matches anywhere. */

const RED = "#C41616";
const DEEP_RED = "#A01010";
const GOLD = RED;
const NAVY = "#0A0A0A";
const INK = "#1D1D1F";
const GREY = "#86868B";

const W_PATH = "M210 8L297.35 95.35V301.72L148.09 69.91ZM210 412L122.65 324.65V118.28L271.91 350.09Z";
const R_PATHS =
  '<path d="M10.18 210L68.05 152.13V267.87ZM409.82 210L351.95 152.13V267.87Z"/>';

/* Colour themes. `light` themes put dark type on the finish. */
const PALETTES = {
  black: { label: "Black", top: "#1C1C1E", bottom: "#000000", accent: RED, w: RED },
  red: { label: "NCS Red", top: "#B81818", bottom: "#7A0A0A", accent: "#FFFFFF", w: "#FFFFFF", r: "#FFFFFF" },
  charcoal: { label: "Charcoal", top: "#3A3A3C", bottom: "#1C1C1E", accent: RED },
  steel: { label: "Steel", top: "#4B535C", bottom: "#22272D", accent: RED },
  oxblood: { label: "Oxblood", top: "#5E1414", bottom: "#250505", accent: "#E5E5EA" },
  silver: { label: "Silver", top: "#F4F4F6", bottom: "#D4D4D9", accent: DEEP_RED, light: true, w: DEEP_RED },
  bone: { label: "Bone", top: "#F5F3EE", bottom: "#E3DFD6", accent: DEEP_RED, light: true, w: DEEP_RED },
  paper: { label: "Paper", top: "#FFFFFF", bottom: "#F1F1F1", accent: DEEP_RED, light: true, w: DEEP_RED },
};

const FONTS = {
  Geist: "300..700",
  Inter: "300..700",
  Manrope: "300..700",
  "DM Sans": "300..700",
  Montserrat: "300..700",
  "Space Grotesk": "300..700",
  "Playfair Display": "400..700",
  Fraunces: "300..700",
};

/* Trim sizes in pixels at 300 dpi, with the bleed printers ask for. */
const SIZES = {
  us: { w: 1050, h: 600, bleed: 37.5, unit: "in", pw: 3.5, ph: 2, pb: 0.125, name: "3.5x2in", label: "3.5 × 2 in", radius: 37.5 },
  eu: { w: 1004, h: 650, bleed: 35.4, unit: "mm", pw: 85, ph: 55, pb: 3, name: "85x55mm", label: "85 × 55 mm", radius: 35.4 },
};

const DEFAULTS = {
  name: "Your Name",
  title: "Security Operations",
  phone: "01253 982211",
  email: "mattbaron@newconceptsecurity.co.uk",
  web: "newconceptsecurity.co.uk",
  area: "Blackpool · North West · National coverage",
  extra: "",
  tagline: "SIA Approved Contractor",
};

const STYLE_DEFAULTS = {
  design: "classic",
  palette: "black",
  primary: "#0A0A0A",
  accent: "#C41616",
  font: "Montserrat",
  align: "left",
  logo: 1,
  showName: true,
  showTagline: false,
  foil: false,
  rounded: false,
  qr: "none",
  size: "eu",
  bleed: false,
};

const STORE = "ncs-card-v3";
const form = document.querySelector("#card-form");
const frontBox = document.querySelector("#card-front");
const backBox = document.querySelector("#card-back");
const flip = document.querySelector(".bc-flip");
const fontData = {};
let qrReady = false;

const esc = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* ---------- Colour ---------- */

function rgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  const x = rgb(a);
  const y = rgb(b);
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

function lum(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function theme(opt) {
  let p = PALETTES[opt.palette];
  if (opt.palette === "custom" || !p) {
    const light = lum(opt.primary) > 0.45;
    p = { top: mix(opt.primary, "#FFFFFF", 0.1), bottom: mix(opt.primary, "#000000", light ? 0.08 : 0.38), accent: opt.accent, light };
  }
  const light = Boolean(p.light);
  const accent = p.accent;
  // On the white back the mark keeps a readable R: the accent, unless it is too pale.
  const paperR = lum(accent) > 0.75 || accent === NAVY ? GOLD : accent;
  return {
    top: p.top,
    bottom: p.bottom,
    base: mix(p.top, p.bottom, 0.5),
    accent,
    acc: opt.foil ? "url(#foil)" : accent,
    light,
    ink: light ? INK : "#FFFFFF",
    soft: light ? "#5A5A60" : "#C7C7CC",
    w: p.w || (light ? NAVY : "#FFFFFF"),
    r: opt.foil ? "url(#foil)" : p.r || accent,
    paper: "#FFFFFF",
    paperInk: INK,
    paperMuted: GREY,
    paperW: DEEP_RED,
    paperR: opt.foil ? "url(#foil-paper)" : paperR,
    paperAccent: paperR,
  };
}

/* ---------- Type ---------- */

const measurer = document.createElement("canvas").getContext("2d");
const family = (opt) => `'${opt.font}', 'Helvetica Neue', Arial, sans-serif`;

/* Shrinks a line until it fits its column, measured with the real font. */
function fit(value, size, weight, maxWidth, opt, spacing = 0) {
  let s = size;
  while (s > 8) {
    measurer.font = `${weight} ${s}px ${family(opt)}`;
    if (measurer.measureText(value).width + spacing * value.length <= maxWidth) return s;
    s -= 0.5;
  }
  return s;
}

function text(x, y, value, opt, o = {}) {
  const spacing = o.spacing || 0;
  const anchor = o.anchor || "start";
  // Letter-spaced text leaves a gap after its last letter: centre the rest.
  const dx = anchor === "middle" ? spacing / 2 : anchor === "end" ? spacing : 0;
  return `<text x="${(x + dx).toFixed(2)}" y="${y.toFixed(2)}" font-family="${family(opt)}" font-size="${o.size || 30}" font-weight="${o.weight || 400}" fill="${o.fill || INK}"${anchor !== "start" ? ` text-anchor="${anchor}"` : ""}${spacing ? ` letter-spacing="${spacing}"` : ""}${o.opacity != null ? ` fill-opacity="${o.opacity}"` : ""}>${esc(value)}</text>`;
}

/* ---------- Pieces ---------- */

/* NEWCONCEPT as in the logo: NEW heavy, CONCEPT light in the accent. */
function logotype(x, y, opt, o = {}) {
  const spacing = o.spacing || 0;
  const anchor = o.anchor || "start";
  const dx = anchor === "middle" ? spacing / 2 : anchor === "end" ? spacing : 0;
  const heavy = Math.max(700, (o.weight || 600) + 200);
  return `<text x="${(x + dx).toFixed(2)}" y="${y.toFixed(2)}" font-family="${family(opt)}" font-size="${o.size || 30}"${anchor !== "start" ? ` text-anchor="${anchor}"` : ""}${spacing ? ` letter-spacing="${spacing}"` : ""}><tspan font-weight="${heavy}" fill="${o.fill || INK}">NEW</tspan><tspan font-weight="400" fill="${o.accent || RED}">CONCEPT</tspan></text>`;
}

/* The NCS mark's drawn area is 400 × 404 units, from (10, 8). */
function mark(cx, cy, scale, w, r, opacity = 1) {
  const x = cx - (10 + 400 / 2) * scale;
  const y = cy - (8 + 404 / 2) * scale;
  const o = opacity < 1 ? ` opacity="${opacity}"` : "";
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)})"${o}><path fill="${w}" d="${W_PATH}"/><g fill="${r}">${R_PATHS}</g></g>`;
}

const markW = (scale) => 400 * scale;
const markH = (scale) => 404 * scale;

function full(c, fill, extra = "") {
  return `<rect x="${-c.b}" y="${-c.b}" width="${c.W + 2 * c.b}" height="${c.H + 2 * c.b}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
}

function finish(c, th) {
  return full(c, "url(#bg)") + (th.light ? "" : full(c, "url(#sheen)"));
}

function wordmark(x, y, opt, th, o = {}) {
  const anchor = o.anchor || "middle";
  const size = o.size || 25;
  let out = text(x, y, "NEW CONCEPT SECURITY", opt, { size, weight: 500, fill: o.fill || th.ink, anchor, spacing: size * 0.28, opacity: o.opacity ?? 0.62 });
  if (opt.showTagline && DEFAULTS && o.tagline !== false) {
    const t = readForm().tagline;
    if (t.trim()) out += text(x, y + size * 1.7, t, opt, { size: size * 0.82, weight: 400, fill: o.taglineFill || th.acc, anchor, opacity: 0.95 });
  }
  return out;
}

/* A QR code (website or contact card) drawn as vector modules. */
function qr(d, opt, x, y, size, fill, bg) {
  if (opt.qr === "none" || !qrReady || !window.qrcode) return "";
  const url = d.web.trim() ? (/^https?:/i.test(d.web) ? d.web.trim() : `https://${d.web.trim()}`) : "";
  const data =
    opt.qr === "contact"
      ? [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${d.name};;;;`,
          `FN:${d.name}`,
          "ORG:New Concept Security",
          d.title && `TITLE:${d.title}`,
          d.phone && `TEL;TYPE=WORK,VOICE:${d.phone}`,
          d.email && `EMAIL:${d.email}`,
          url && `URL:${url}`,
          d.area && `ADR;TYPE=WORK:;;${d.area};;;;`,
          "END:VCARD",
        ]
          .filter(Boolean)
          .join("\n")
      : url;
  if (!data) return "";
  const code = window.qrcode(0, "M");
  code.addData(data);
  code.make();
  const n = code.getModuleCount();
  const quiet = 2;
  const cell = size / (n + quiet * 2);
  let path = "";
  for (let r = 0; r < n; r += 1) {
    for (let col = 0; col < n; col += 1) {
      if (code.isDark(r, col)) path += `M${(x + (col + quiet) * cell).toFixed(2)} ${(y + (r + quiet) * cell).toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`;
    }
  }
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.06}" fill="${bg}"/><path d="${path}" fill="${fill}"/>`;
}

const QR = 156;

/* The contact block: name and title above, the lines at the bottom of the box. */
function details(d, opt, box, colors, o = {}) {
  const align = o.align || opt.align;
  let { x, y, w, h } = box;
  let code = "";
  if (opt.qr !== "none" && o.qr !== false) {
    const qx = o.qrAt ? o.qrAt[0] : align === "right" ? x : x + w - QR;
    const qy = o.qrAt ? o.qrAt[1] : y + h - QR + 6;
    code = qr(d, opt, qx, qy, QR, colors.qrInk || colors.ink, colors.qrBg || "#FFFFFF");
    if (!o.qrAt) {
      if (align === "center") {
        x += QR + 30;
        w -= 2 * (QR + 30);
      } else {
        w -= QR + 34;
        if (align === "right") x += QR + 34;
      }
    }
  }
  const anchor = { left: "start", center: "middle", right: "end" }[align];
  const ax = align === "left" ? x : align === "center" ? x + w / 2 : x + w;
  const lines = [
    [d.phone, colors.ink],
    [d.email, colors.ink],
    [d.web, colors.ink],
    [d.area, colors.muted],
    [d.extra, colors.muted],
  ].filter(([v]) => v && v.trim());
  const size = Math.min(31, ...lines.map(([v]) => fit(v, 31, 400, w, opt)));
  const gap = size * 1.38;
  const bottom = y + h;
  const rows = lines.map(([v, fill], i) => text(ax, bottom - (lines.length - 1 - i) * gap, v, opt, { size, fill, anchor })).join("");
  const linesTop = bottom - (lines.length - 1) * gap - size;
  const nameSize = fit(d.name, o.nameSize || 54, 600, w, opt, -0.8);
  const titleSize = fit(d.title, 31, 400, w, opt);
  let nameY;
  let titleY;
  if (o.top) {
    nameY = y + nameSize;
    titleY = nameY + titleSize + 16;
  } else {
    titleY = linesTop - 58;
    nameY = titleY - titleSize - 18;
    if (nameY < y + nameSize) {
      nameY = y + nameSize;
      titleY = nameY + titleSize + 16;
    }
  }
  return (
    text(ax, nameY, d.name, opt, { size: nameSize, weight: 600, fill: colors.name || colors.ink, anchor, spacing: -0.8 }) +
    text(ax, titleY, d.title, opt, { size: titleSize, fill: colors.title || colors.muted, anchor }) +
    rows +
    code
  );
}

const paperColors = (th) => ({ ink: th.paperInk, muted: th.paperMuted, qrInk: INK, qrBg: "#FFFFFF" });
const finishColors = (th) => ({ ink: th.ink, muted: th.soft, title: th.soft, qrInk: th.light ? INK : "#000000", qrBg: "#FFFFFF" });

/* ---------- The twenty-four designs ---------- */

const DESIGNS = {
  classic: {
    name: "Classic",
    front(d, opt, th, c) {
      const lift = opt.showName ? (opt.showTagline ? 40 : 22) : 0;
      const s = 0.3 * opt.logo;
      return (
        finish(c, th) +
        mark(c.W / 2, c.H / 2 - lift, s, th.w, th.r) +
        (opt.showName ? wordmark(c.W / 2, c.H - (opt.showTagline ? 98 : 70), opt, th) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      const s = 0.12 * opt.logo;
      const mx = opt.align === "right" ? m + markW(s) / 2 : opt.align === "center" ? c.W / 2 : c.W - m - markW(s) / 2;
      return full(c, th.paper) + mark(mx, m - 6 + markH(s) / 2, s, th.paperW, th.paperR) + details(d, opt, { x: m, y: m + 30, w: c.W - 2 * m, h: c.H - 2 * m - 26 }, paperColors(th));
    },
  },

  monogram: {
    name: "Monogram",
    front(d, opt, th, c) {
      const s = 0.12 * opt.logo;
      const t = readForm().tagline;
      return (
        finish(c, th) +
        mark(c.W - 150, c.H - 60, 1.25, th.light ? NAVY : "#FFFFFF", th.light ? NAVY : "#FFFFFF", th.light ? 0.06 : 0.07) +
        mark(76 + markW(s) / 2, 70 + markH(s) / 2, s, th.w, th.r) +
        logotype(76, c.H - 120, opt, { accent: th.acc, size: 47, weight: 600, fill: th.ink, spacing: -1 }) +
        (opt.showName ? text(78, c.H - 80, "SECURITY", opt, { size: 22, weight: 500, fill: th.ink, spacing: 6.5, opacity: 0.6 }) : "") +
        (opt.showTagline && t.trim() ? text(78, c.H - 46, t, opt, { size: 20, fill: th.acc }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      return (
        full(c, th.paper) +
        `<rect x="${-c.b}" y="${-c.b}" width="${c.b + 18}" height="${c.H + 2 * c.b}" fill="${th.paperAccent}"/>` +
        mark(c.W - 120, c.H - 40, 0.9, NAVY, NAVY, 0.045) +
        details(d, opt, { x: m + 14, y: m, w: c.W - 2 * m - 14, h: c.H - 2 * m }, paperColors(th), { top: false })
      );
    },
  },

  split: {
    name: "Split",
    front(d, opt, th, c) {
      const sx = c.W * 0.4;
      const s = 0.19 * opt.logo;
      const x = sx + 64;
      const wcol = c.W - x - 60;
      const nameSize = fit(d.name, 52, 600, wcol, opt, -0.8);
      const t = readForm().tagline;
      return (
        full(c, th.paper) +
        `<rect x="${-c.b}" y="${-c.b}" width="${sx + c.b}" height="${c.H + 2 * c.b}" fill="url(#bg)"/>` +
        `<rect x="${sx - 5}" y="${-c.b}" width="5" height="${c.H + 2 * c.b}" fill="${th.acc}"/>` +
        mark(sx / 2, c.H / 2, s, th.w, th.r) +
        text(x, c.H / 2 - 12, d.name, opt, { size: nameSize, weight: 600, fill: INK, spacing: -0.8 }) +
        text(x, c.H / 2 + 34, d.title, opt, { size: fit(d.title, 28, 400, wcol, opt), fill: GREY }) +
        (opt.showName ? text(x, c.H - 70, "NEW CONCEPT SECURITY", opt, { size: 18, weight: 500, fill: NAVY, spacing: 4.5, opacity: 0.7 }) : "") +
        (opt.showTagline && t.trim() ? text(x, 92, t, opt, { size: 20, fill: th.paperAccent }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      return finish(c, th) + details(d, opt, { x: m, y: m, w: c.W - 2 * m, h: c.H - 2 * m }, finishColors(th));
    },
  },

  diagonal: {
    name: "Diagonal",
    front(d, opt, th, c) {
      const a = c.W * 0.6;
      const z = c.W * 0.36;
      const s = 0.19 * opt.logo;
      const t = readForm().tagline;
      return (
        full(c, th.paper) +
        `<polygon points="${-c.b},${-c.b} ${a},${-c.b} ${z},${c.H + c.b} ${-c.b},${c.H + c.b}" fill="url(#bg)"/>` +
        `<polygon points="${a + 16},${-c.b} ${a + 30},${-c.b} ${z + 30},${c.H + c.b} ${z + 16},${c.H + c.b}" fill="${th.acc}"/>` +
        mark(c.W * 0.24, c.H * 0.4, s, th.w, th.r) +
        logotype(c.W - 64, c.H - 124, opt, { accent: th.paperAccent, size: 40, weight: 600, fill: NAVY, anchor: "end", spacing: -1 }) +
        (opt.showName ? text(c.W - 64, c.H - 88, "SECURITY", opt, { size: 19, weight: 500, fill: INK, anchor: "end", spacing: 5, opacity: 0.6 }) : "") +
        (opt.showTagline && t.trim() ? text(c.W - 64, c.H - 52, t, opt, { size: 18, fill: th.paperAccent, anchor: "end" }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      const s = 0.1 * opt.logo;
      return (
        full(c, th.paper) +
        `<polygon points="${c.W - 170},${c.H + c.b} ${c.W + c.b},${c.H - 260} ${c.W + c.b},${c.H + c.b}" fill="url(#bg)"/>` +
        `<polygon points="${c.W - 200},${c.H + c.b} ${c.W + c.b},${c.H - 300} ${c.W + c.b},${c.H - 286} ${c.W - 184},${c.H + c.b}" fill="${th.acc}"/>` +
        mark(m + markW(s) / 2, m + markH(s) / 2 - 8, s, th.paperW, th.paperR) +
        details(d, opt, { x: m, y: m + 30, w: c.W - 2 * m - 120, h: c.H - 2 * m - 26 }, paperColors(th), { align: opt.align === "right" ? "left" : opt.align })
      );
    },
  },

  executive: {
    name: "Executive",
    front(d, opt, th, c) {
      const m = 80;
      const s = 0.1 * opt.logo;
      const t = readForm().tagline;
      return (
        finish(c, th) +
        mark(m + markW(s) / 2, m + markH(s) / 2 - 10, s, th.w, th.r) +
        text(m - 4, c.H / 2 + 34, "NCS", opt, { size: 92, weight: 600, fill: th.ink, spacing: -2.5 }) +
        (opt.showName ? text(m, c.H / 2 + 82, "SECURITY", opt, { size: 23, weight: 500, fill: th.ink, spacing: 7.5, opacity: 0.62 }) : "") +
        `<rect x="${m}" y="${c.H / 2 + 112}" width="90" height="4" fill="${th.acc}"/>` +
        (opt.showTagline && t.trim() ? text(m, c.H - 58, t, opt, { size: 20, fill: th.soft }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 80;
      return finish(c, th) + details(d, opt, { x: m, y: m, w: c.W - 2 * m, h: c.H - 2 * m }, { ...finishColors(th), name: th.acc }, { top: true });
    },
  },

  badge: {
    name: "Badge",
    front(d, opt, th, c) {
      const cx = c.W / 2;
      const cy = c.H / 2 - (opt.showName ? 36 : 0);
      const k = 0.9 * opt.logo;
      const w = 130 * k;
      const h = 150 * k;
      const shield = `M${cx - w} ${cy - h}H${cx + w}V${cy - 8 * k}C${cx + w} ${cy + 92 * k} ${cx + 44 * k} ${cy + 140 * k} ${cx} ${cy + 162 * k}C${cx - 44 * k} ${cy + 140 * k} ${cx - w} ${cy + 92 * k} ${cx - w} ${cy - 8 * k}Z`;
      return (
        finish(c, th) +
        `<path d="${shield}" fill="none" stroke="${th.acc}" stroke-width="${6 * k}" stroke-linejoin="round"/>` +
        mark(cx, cy - 12 * k, 0.29 * k, th.w, th.r) +
        (opt.showName ? wordmark(cx, c.H - (opt.showTagline ? 70 : 50), opt, th, { size: 22 }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 70;
      const cx = c.W / 2;
      const k = 0.32;
      const shield = `M${cx - 130 * k} ${m}H${cx + 130 * k}V${m + 142 * k}C${cx + 130 * k} ${m + 242 * k} ${cx + 44 * k} ${m + 290 * k} ${cx} ${m + 312 * k}C${cx - 44 * k} ${m + 290 * k} ${cx - 130 * k} ${m + 242 * k} ${cx - 130 * k} ${m + 142 * k}Z`;
      return (
        full(c, th.paper) +
        `<path d="${shield}" fill="url(#bg)"/>` +
        mark(cx, m + 128 * k, 0.29 * k, "#FFFFFF", th.light ? GOLD : th.r) +
        details(d, opt, { x: m, y: m + 130, w: c.W - 2 * m, h: c.H - 2 * m - 130 }, paperColors(th), { align: "center", nameSize: 48 })
      );
    },
  },

  hivis: {
    name: "Hi-vis",
    front(d, opt, th, c) {
      const m = 76;
      const s = 0.14 * opt.logo;
      const band = (y) =>
        `<rect x="${-c.b}" y="${y}" width="${c.W + 2 * c.b}" height="40" fill="${th.acc}"/><rect x="${-c.b}" y="${y + 16}" width="${c.W + 2 * c.b}" height="8" fill="#FFFFFF" fill-opacity="0.55"/>`;
      const t = readForm().tagline;
      return (
        finish(c, th) +
        band(c.H - 200) +
        band(c.H - 130) +
        mark(m + markW(s) / 2, m + markH(s) / 2 - 10, s, th.w, th.r) +
        logotype(c.W - m, m + 34, opt, { accent: th.acc, size: 33, weight: 600, fill: th.ink, anchor: "end", spacing: 1 }) +
        (opt.showName ? text(c.W - m, m + 70, "SECURITY", opt, { size: 18, weight: 500, fill: th.ink, anchor: "end", spacing: 5, opacity: 0.62 }) : "") +
        (opt.showTagline && t.trim() ? text(c.W / 2, c.H - 44, t, opt, { size: 20, fill: th.soft, anchor: "middle" }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      const s = 0.1 * opt.logo;
      return (
        full(c, th.paper) +
        `<rect x="${-c.b}" y="${c.H - 34}" width="${c.W + 2 * c.b}" height="${34 + c.b}" fill="${th.paperAccent}"/><rect x="${-c.b}" y="${c.H - 22}" width="${c.W + 2 * c.b}" height="7" fill="#FFFFFF" fill-opacity="0.6"/>` +
        mark(c.W - m - markW(s) / 2, m + markH(s) / 2 - 8, s, th.paperW, th.paperR) +
        details(d, opt, { x: m, y: m, w: c.W - 2 * m, h: c.H - 2 * m - 30 }, paperColors(th))
      );
    },
  },

  blueprint: {
    name: "Blueprint",
    front(d, opt, th, c) {
      const m = 70;
      const s = 0.13 * opt.logo;
      const line = th.light ? NAVY : "#FFFFFF";
      const t = readForm().tagline;
      const px = c.W * 0.5;
      const py = 110;
      const pw = c.W * 0.38;
      const ph = c.H * 0.5;
      const point = (x, y, n) => `<circle cx="${x}" cy="${y}" r="15" fill="${th.accent}"/>` + text(x, y + 7, String(n), opt, { size: 19, weight: 600, fill: th.light ? "#FFFFFF" : "#000000", anchor: "middle" });
      return (
        finish(c, th) +
        `<rect x="${-c.b}" y="${-c.b}" width="${c.W + 2 * c.b}" height="${c.H + 2 * c.b}" fill="url(#grid)"/>` +
        `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" stroke="${th.accent}" stroke-width="3" stroke-dasharray="14 10" opacity="0.8"/>` +
        `<path d="M${px + pw * 0.35} ${py}V${py + ph * 0.55}H${px + pw}" fill="none" stroke="${line}" stroke-opacity="0.35" stroke-width="2"/>` +
        point(px, py, 1) + point(px + pw, py + ph * 0.55, 2) + point(px + pw, py + ph, 3) + point(px, py + ph, 4) +
        mark(c.W - m - markW(s) / 2, c.H - m - markH(s) / 2 + 8, s, th.w, th.r) +
        logotype(m, m + 26, opt, { accent: th.acc, size: 30, weight: 600, fill: th.ink, spacing: 1 }) +
        (opt.showName ? text(m, m + 60, "SECURITY", opt, { size: 17, weight: 500, fill: th.ink, spacing: 4.5, opacity: 0.6 }) : "") +
        (opt.showTagline && t.trim() ? text(m, c.H - m + 8, t, opt, { size: 19, fill: th.acc }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      const s = 0.1 * opt.logo;
      return (
        full(c, th.paper) +
        `<rect x="${-c.b}" y="${-c.b}" width="${c.W + 2 * c.b}" height="${c.H + 2 * c.b}" fill="url(#grid-paper)"/>` +
        mark(c.W - m - markW(s) / 2, m + markH(s) / 2 - 8, s, th.paperW, th.paperR) +
        details(d, opt, { x: m, y: m + 30, w: c.W - 2 * m, h: c.H - 2 * m - 26 }, paperColors(th))
      );
    },
  },

  night: {
    name: "Night",
    front(d, opt, th, c) {
      const s = 0.22 * opt.logo;
      const sky = th.light ? "#0B2236" : th.bottom;
      let stars = "";
      let seed = 7;
      const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      for (let i = 0; i < 46; i += 1) {
        stars += `<circle cx="${(rand() * c.W).toFixed(1)}" cy="${(rand() * c.H * 0.62).toFixed(1)}" r="${(1 + rand() * 2.2).toFixed(1)}" fill="#FFFFFF" fill-opacity="${(0.25 + rand() * 0.55).toFixed(2)}"/>`;
      }
      const ground = c.H - 92;
      let fence = `<rect x="${-c.b}" y="${ground}" width="${c.W + 2 * c.b}" height="${92 + c.b}" fill="#02080F"/>`;
      for (let x = -20; x < c.W + 40; x += 46) fence += `<rect x="${x}" y="${ground - 52}" width="4" height="52" fill="#02080F"/>`;
      fence += `<rect x="${-c.b}" y="${ground - 50}" width="${c.W + 2 * c.b}" height="3" fill="#02080F"/><rect x="${-c.b}" y="${ground - 24}" width="${c.W + 2 * c.b}" height="3" fill="#02080F"/>`;
      const crane = `<path d="M${c.W - 230} ${ground - 52}V${ground - 330}M${c.W - 330} ${ground - 300}H${c.W - 60}M${c.W - 230} ${ground - 330}L${c.W - 330} ${ground - 300}M${c.W - 230} ${ground - 330}L${c.W - 60} ${ground - 300}" stroke="#02080F" stroke-width="10" fill="none"/>`;
      return (
        `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(sky, "#000000", 0.35)}"/><stop offset="1" stop-color="${mix(sky, "#3A6E99", 0.25)}"/></linearGradient></defs>` +
        full(c, "url(#sky)") +
        stars +
        `<circle cx="170" cy="120" r="44" fill="${th.accent}" fill-opacity="0.9"/><circle cx="188" cy="108" r="40" fill="${mix(sky, "#000000", 0.3)}"/>` +
        crane +
        fence +
        mark(c.W / 2, c.H * 0.36, s, "#FFFFFF", th.light ? GOLD : th.r) +
        (opt.showName ? text(c.W / 2, c.H * 0.36 + markH(s) / 2 + 52, "NEW CONCEPT SECURITY", opt, { size: 22, weight: 500, fill: "#FFFFFF", anchor: "middle", spacing: 6, opacity: 0.7 }) : "") +
        (opt.showTagline && readForm().tagline.trim() ? text(c.W / 2, c.H - 40, readForm().tagline, opt, { size: 19, fill: GOLD, anchor: "middle" }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      const sky = th.light ? "#0B2236" : th.bottom;
      return (
        full(c, mix(sky, "#000000", 0.25)) +
        details(d, opt, { x: m, y: m, w: c.W - 2 * m, h: c.H - 2 * m }, { ink: "#FFFFFF", muted: "#A1A1A6", title: GOLD, qrInk: "#000000", qrBg: "#FFFFFF" })
      );
    },
  },

  wordmark: {
    name: "Wordmark",
    front(d, opt, th, c) {
      const size = fit("NEWCONCEPT", 168 * opt.logo, 700, c.W - 200, opt, -3);
      measurer.font = `700 ${size}px ${family(opt)}`;
      const cy = c.H / 2 + size * 0.32 - (opt.showName ? 20 : 0);
      return (
        finish(c, th) +
        logotype(c.W / 2, cy, opt, { accent: th.acc, size, weight: 700, fill: th.ink, anchor: "middle", spacing: -3 }) +
        (opt.showName ? text(c.W / 2, cy + 70, "SECURITY", opt, { size: 24, weight: 500, fill: th.ink, anchor: "middle", spacing: 9, opacity: 0.62 }) : "") +
        (opt.showTagline && readForm().tagline.trim() ? text(c.W / 2, c.H - 52, readForm().tagline, opt, { size: 20, fill: th.acc, anchor: "middle" }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 70;
      const split = c.W * 0.38;
      const s = 0.27 * opt.logo;
      return (
        full(c, th.paper) +
        mark(split / 2 + 10, c.H / 2, s, th.paperW, th.paperR) +
        `<rect x="${split}" y="${m}" width="2" height="${c.H - 2 * m}" fill="#D2D2D7"/>` +
        details(d, opt, { x: split + 54, y: m, w: c.W - split - 54 - m, h: c.H - 2 * m }, paperColors(th), { align: "left", nameSize: 46, qr: false })
      );
    },
  },

  frame: {
    name: "Frame",
    front(d, opt, th, c) {
      const i = 34;
      const s = 0.2 * opt.logo;
      return (
        finish(c, th) +
        `<rect x="${i}" y="${i}" width="${c.W - 2 * i}" height="${c.H - 2 * i}" fill="none" stroke="${th.acc}" stroke-width="3"/>` +
        `<rect x="${i + 12}" y="${i + 12}" width="${c.W - 2 * i - 24}" height="${c.H - 2 * i - 24}" fill="none" stroke="${th.ink}" stroke-opacity="0.22" stroke-width="1.5"/>` +
        mark(c.W / 2, c.H / 2 - (opt.showName ? 34 : 0), s, th.w, th.r) +
        (opt.showName ? wordmark(c.W / 2, c.H / 2 + markH(s) / 2 + 30, opt, th, { size: 22 }) : "")
      );
    },
    back(d, opt, th, c) {
      const i = 34;
      const m = 96;
      return (
        full(c, th.paper) +
        `<rect x="${i}" y="${i}" width="${c.W - 2 * i}" height="${c.H - 2 * i}" fill="none" stroke="${th.paperAccent}" stroke-width="3"/>` +
        details(d, opt, { x: m, y: m, w: c.W - 2 * m, h: c.H - 2 * m }, paperColors(th))
      );
    },
  },

  stripe: {
    name: "Stripe",
    front(d, opt, th, c) {
      const s = 0.14 * opt.logo;
      const t = readForm().tagline;
      return (
        finish(c, th) +
        `<rect x="${-c.b}" y="${-c.b}" width="${c.b + 40}" height="${c.H + 2 * c.b}" fill="${th.acc}"/>` +
        mark(110 + markW(s) / 2, 84 + markH(s) / 2, s, th.w, th.r) +
        logotype(110, c.H - 110, opt, { accent: th.acc, size: 43, weight: 600, fill: th.ink, spacing: 2 }) +
        (opt.showName ? text(112, c.H - 72, "SECURITY", opt, { size: 20, weight: 500, fill: th.ink, spacing: 7, opacity: 0.6 }) : "") +
        (opt.showTagline && t.trim() ? text(c.W - 76, 104, t, opt, { size: 19, fill: th.acc, anchor: "end" }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      return (
        full(c, th.paper) +
        `<rect x="${-c.b}" y="${-c.b}" width="${c.b + 14}" height="${c.H + 2 * c.b}" fill="${th.base}"/>` +
        `<rect x="14" y="${-c.b}" width="6" height="${c.H + 2 * c.b}" fill="${th.paperAccent}"/>` +
        details(d, opt, { x: m + 20, y: m, w: c.W - 2 * m - 20, h: c.H - 2 * m }, paperColors(th))
      );
    },
  },

  corner: {
    name: "Corner",
    front(d, opt, th, c) {
      const R = c.H * 0.78;
      const s = 0.16 * opt.logo;
      const t = readForm().tagline;
      return (
        finish(c, th) +
        `<circle cx="${c.W}" cy="${c.H}" r="${R}" fill="${th.ink}" fill-opacity="${th.light ? 0.05 : 0.06}"/>` +
        `<circle cx="${c.W}" cy="${c.H}" r="${(R * 0.62).toFixed(1)}" fill="none" stroke="${th.acc}" stroke-width="3"/>` +
        mark(c.W - 70 - markW(s) / 2, c.H - 66 - markH(s) / 2, s, th.w, th.r) +
        logotype(76, 132, opt, { accent: th.acc, size: 40, weight: 600, fill: th.ink, spacing: 1 }) +
        (opt.showName ? text(78, 170, "SECURITY", opt, { size: 19, weight: 500, fill: th.ink, spacing: 6.5, opacity: 0.6 }) : "") +
        (opt.showTagline && t.trim() ? text(78, 212, t, opt, { size: 19, fill: th.acc }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      const r = c.H * 0.34;
      return (
        full(c, th.paper) +
        `<circle cx="${c.W}" cy="0" r="${r.toFixed(1)}" fill="${th.base}"/>` +
        `<circle cx="${c.W}" cy="0" r="${(r + 14).toFixed(1)}" fill="none" stroke="${th.paperAccent}" stroke-width="3"/>` +
        mark(c.W - 92, 62, 0.085 * opt.logo, th.w, th.r) +
        details(d, opt, { x: m, y: m + 60, w: c.W - 2 * m - 110, h: c.H - 2 * m - 60 }, paperColors(th), { align: "left" })
      );
    },
  },

  horizon: {
    name: "Horizon",
    front(d, opt, th, c) {
      const y = c.H * 0.64;
      const s = 0.2 * opt.logo;
      const t = readForm().tagline;
      const band = `x="${-c.b}" y="${-c.b}" width="${c.W + 2 * c.b}" height="${(y + c.b).toFixed(1)}"`;
      const mid = y + (c.H - y) / 2;
      return (
        full(c, th.paper) +
        `<rect ${band} fill="url(#bg)"/>` +
        (th.light ? "" : `<rect ${band} fill="url(#sheen)"/>`) +
        `<rect x="${-c.b}" y="${y.toFixed(1)}" width="${c.W + 2 * c.b}" height="8" fill="${th.acc}"/>` +
        mark(c.W / 2, y / 2, s, th.w, th.r) +
        (opt.showName ? text(c.W / 2, mid + (opt.showTagline && t.trim() ? -2 : 12), "NEW CONCEPT SECURITY", opt, { size: 26, weight: 600, fill: th.paperW, anchor: "middle", spacing: 7 }) : "") +
        (opt.showTagline && t.trim() ? text(c.W / 2, mid + 36, t, opt, { size: 19, fill: th.paperAccent, anchor: "middle" }) : "")
      );
    },
    back(d, opt, th, c) {
      return DESIGNS.classic.back(d, opt, th, c);
    },
  },

  minimal: {
    name: "Minimal",
    front(d, opt, th, c) {
      const s = 0.1 * opt.logo;
      const t = readForm().tagline;
      return (
        finish(c, th) +
        (opt.showTagline && t.trim() ? text(76, 104, t, opt, { size: 19, fill: th.acc }) : `<rect x="76" y="76" width="56" height="4" fill="${th.acc}"/>`) +
        mark(76 + markW(s) / 2, c.H - 76 - markH(s) / 2, s, th.w, th.r) +
        (opt.showName ? text(c.W - 76, c.H - 82, "NEW CONCEPT SECURITY", opt, { size: 18, weight: 500, fill: th.ink, anchor: "end", spacing: 6, opacity: 0.7 }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 90;
      return full(c, th.paper) + details(d, opt, { x: m, y: m, w: c.W - 2 * m, h: c.H - 2 * m }, paperColors(th), { align: "center" });
    },
  },

  bold: {
    name: "Bold",
    front(d, opt, th, c) {
      const t = readForm().tagline;
      const size = fit("NEWCONCEPT", 92, 700, c.W * 0.62, opt, -2);
      return (
        finish(c, th) +
        mark(c.W - 120, c.H / 2 + 20, 1.05, th.light ? NAVY : "#FFFFFF", th.accent, 0.14) +
        logotype(76, c.H / 2 - 6, opt, { accent: th.acc, size, weight: 700, fill: th.ink, spacing: -2 }) +
        `<rect x="80" y="${c.H / 2 + 22}" width="90" height="6" fill="${th.acc}"/>` +
        (opt.showName ? text(80, c.H / 2 + 74, "SECURITY", opt, { size: 22, weight: 500, fill: th.ink, spacing: 7.5, opacity: 0.65 }) : "") +
        (opt.showTagline && t.trim() ? text(80, c.H - 66, t, opt, { size: 20, fill: th.acc }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      return (
        full(c, th.paper) +
        `<rect x="${-c.b}" y="${-c.b}" width="${c.W + 2 * c.b}" height="${c.b + 22}" fill="${th.base}"/>` +
        `<rect x="${m}" y="22" width="90" height="6" fill="${th.paperAccent}"/>` +
        details(d, opt, { x: m, y: m + 20, w: c.W - 2 * m, h: c.H - 2 * m - 20 }, paperColors(th))
      );
    },
  },

  seal: {
    name: "Seal",
    front(d, opt, th, c) {
      const s = 0.17 * opt.logo;
      const cy = c.H / 2 - (opt.showName ? 34 : 0);
      const R = 150;
      return (
        finish(c, th) +
        `<circle cx="${c.W / 2}" cy="${cy}" r="${R}" fill="none" stroke="${th.acc}" stroke-width="4"/>` +
        `<circle cx="${c.W / 2}" cy="${cy}" r="${R - 16}" fill="none" stroke="${th.ink}" stroke-opacity="0.24" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round"/>` +
        mark(c.W / 2, cy, s, th.w, th.r) +
        (opt.showName ? wordmark(c.W / 2, cy + R + 52, opt, th, { size: 21 }) : "")
      );
    },
    back(d, opt, th, c) {
      return DESIGNS.frame.back(d, opt, th, c);
    },
  },

  ribbon: {
    name: "Ribbon",
    front(d, opt, th, c) {
      const s = 0.15 * opt.logo;
      const t = readForm().tagline;
      const b = c.b;
      return (
        finish(c, th) +
        `<polygon points="${c.W - 340},${-b} ${c.W - 250},${-b} ${c.W + b},${250 + b} ${c.W + b},${340 + b}" fill="${th.acc}"/>` +
        mark(76 + markW(s) / 2, c.H / 2 - 50, s, th.w, th.r) +
        logotype(76, c.H / 2 + 66, opt, { accent: th.acc, size: 37, weight: 600, fill: th.ink, spacing: 1 }) +
        (opt.showName ? text(78, c.H / 2 + 102, "SECURITY", opt, { size: 18, weight: 500, fill: th.ink, spacing: 6, opacity: 0.6 }) : "") +
        (opt.showTagline && t.trim() ? text(78, c.H - 58, t, opt, { size: 19, fill: th.acc }) : "")
      );
    },
    back(d, opt, th, c) {
      const m = 76;
      const b = c.b;
      return (
        full(c, th.paper) +
        `<polygon points="${c.W - 170},${-b} ${c.W - 126},${-b} ${c.W + b},${126 + b} ${c.W + b},${170 + b}" fill="${th.paperAccent}"/>` +
        details(d, opt, { x: m, y: m, w: c.W - 2 * m - 70, h: c.H - 2 * m }, paperColors(th))
      );
    },
  },

  outline: {
    name: "Outline",
    front(d, opt, th, c) {
      const s = 0.1 * opt.logo;
      const t = readForm().tagline;
      return (
        finish(c, th) +
        `<text x="-24" y="${c.H - 56}" font-family="${family(opt)}" font-size="232" font-weight="800" fill="none" stroke="${th.acc}" stroke-width="2.5" letter-spacing="-6">NCS</text>` +
        mark(76 + markW(s) / 2, 76 + markH(s) / 2, s, th.w, th.r) +
        (opt.showName ? text(c.W - 76, 104, "SECURITY", opt, { size: 19, weight: 500, fill: th.ink, anchor: "end", spacing: 6.5, opacity: 0.7 }) : "") +
        (opt.showTagline && t.trim() ? text(c.W - 76, 140, t, opt, { size: 19, fill: th.acc, anchor: "end" }) : "")
      );
    },
    back(d, opt, th, c) {
      return DESIGNS.bold.back(d, opt, th, c);
    },
  },

  lines: {
    name: "Lines",
    front(d, opt, th, c) {
      const s = 0.2 * opt.logo;
      let bars = "";
      for (let i = 0; i < 5; i += 1) bars += `<rect x="${c.W - 220 + i * 36}" y="${-c.b}" width="${i === 2 ? 9 : 3}" height="${c.H + 2 * c.b}" fill="${i === 2 ? th.acc : th.ink}" fill-opacity="${i === 2 ? 1 : 0.16}"/>`;
      return (
        finish(c, th) +
        bars +
        mark(80 + markW(s) / 2, c.H / 2 - (opt.showName ? 30 : 0), s, th.w, th.r) +
        (opt.showName ? wordmark(80, c.H / 2 + markH(s) / 2 + 26, opt, th, { anchor: "start", size: 20 }) : "")
      );
    },
    back(d, opt, th, c) {
      return DESIGNS.stripe.back(d, opt, th, c);
    },
  },

  dots: {
    name: "Dots",
    front(d, opt, th, c) {
      const s = 0.18 * opt.logo;
      let dots = "";
      for (let x = c.W * 0.58; x < c.W + c.b; x += 34) for (let y = 30; y < c.H; y += 34) dots += `<circle cx="${x.toFixed(1)}" cy="${y}" r="${(2.4 + ((x + y) % 3)).toFixed(1)}" fill="${th.acc}" fill-opacity="${(0.25 + ((x * 7 + y) % 50) / 100).toFixed(2)}"/>`;
      return (
        finish(c, th) +
        dots +
        mark(80 + markW(s) / 2, c.H / 2 - (opt.showName ? 26 : 0), s, th.w, th.r) +
        (opt.showName ? wordmark(80, c.H / 2 + markH(s) / 2 + 22, opt, th, { anchor: "start", size: 19 }) : "")
      );
    },
    back(d, opt, th, c) {
      return DESIGNS.minimal.back(d, opt, th, c);
    },
  },

  chevron: {
    name: "Chevron",
    front(d, opt, th, c) {
      const t = readForm().tagline;
      let ch = "";
      for (let i = 0; i < 3; i += 1) {
        const x = c.W - 290 + i * 70;
        ch += `<path d="M${x} ${c.H / 2 - 90}L${x + 60} ${c.H / 2}L${x} ${c.H / 2 + 90}" fill="none" stroke="${th.acc}" stroke-width="16" stroke-linecap="square" stroke-opacity="${0.4 + i * 0.3}"/>`;
      }
      return (
        finish(c, th) +
        ch +
        logotype(76, c.H / 2 + 6, opt, { accent: th.acc, size: 46, weight: 700, fill: th.ink, spacing: -1 }) +
        (opt.showName ? text(78, c.H / 2 + 46, "SECURITY", opt, { size: 19, weight: 500, fill: th.ink, spacing: 6.5, opacity: 0.62 }) : "") +
        mark(76 + markW(0.08 * opt.logo) / 2, 84, 0.08 * opt.logo, th.w, th.r) +
        (opt.showTagline && t.trim() ? text(78, c.H - 60, t, opt, { size: 19, fill: th.acc }) : "")
      );
    },
    back(d, opt, th, c) {
      return DESIGNS.bold.back(d, opt, th, c);
    },
  },

  window: {
    name: "Window",
    front(d, opt, th, c) {
      const i = 60;
      const s = 0.19 * opt.logo;
      return (
        finish(c, th) +
        `<rect x="${i}" y="${i}" width="${c.W - 2 * i}" height="${c.H - 2 * i}" rx="34" fill="${th.ink}" fill-opacity="${th.light ? 0.04 : 0.06}" stroke="${th.acc}" stroke-width="2.5"/>` +
        mark(c.W / 2, c.H / 2 - (opt.showName ? 30 : 0), s, th.w, th.r) +
        (opt.showName ? wordmark(c.W / 2, c.H / 2 + markH(s) / 2 + 28, opt, th, { size: 20 }) : "")
      );
    },
    back(d, opt, th, c) {
      return DESIGNS.frame.back(d, opt, th, c);
    },
  },

  signature: {
    name: "Signature",
    front(d, opt, th, c) {
      const s = 0.09 * opt.logo;
      const nameSize = fit(d.name || "Your Name", 84, 600, c.W - 160, opt, -2);
      return (
        finish(c, th) +
        mark(c.W - 76 - markW(s) / 2, 76 + markH(s) / 2, s, th.w, th.r) +
        text(76, c.H / 2 + 20, d.name || "Your Name", opt, { size: nameSize, weight: 600, fill: th.ink, spacing: -2 }) +
        `<rect x="80" y="${c.H / 2 + 48}" width="70" height="5" fill="${th.acc}"/>` +
        text(80, c.H / 2 + 96, d.title || "", opt, { size: 26, fill: th.soft }) +
        (opt.showName ? text(80, c.H - 66, "NEW CONCEPT SECURITY", opt, { size: 17, weight: 500, fill: th.ink, spacing: 5.5, opacity: 0.6 }) : "")
      );
    },
    back(d, opt, th, c) {
      return DESIGNS.classic.back(d, opt, th, c);
    },
  },
};

/* ---------- Frame ---------- */

function canvasFor(opt) {
  const S = SIZES[opt.size];
  return { W: S.w, H: S.h, b: opt.bleed ? S.bleed : 0, S };
}

function frame(opt, th, c, inner) {
  const face = fontData[opt.font]
    ? `<style>@font-face{font-family:"${opt.font}";src:url(${fontData[opt.font]}) format("woff2");font-weight:100 900;}</style>`
    : "";
  const foil = (id, color) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(color, "#FFFFFF", 0.5)}"/><stop offset="0.42" stop-color="${color}"/><stop offset="0.7" stop-color="${mix(color, "#000000", 0.28)}"/><stop offset="1" stop-color="${mix(color, "#FFFFFF", 0.38)}"/></linearGradient>`;
  const gridLine = th.light ? NAVY : "#FFFFFF";
  const defs = `<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${th.top}"/><stop offset="1" stop-color="${th.bottom}"/></linearGradient>
<radialGradient id="sheen" cx="0.3" cy="0" r="0.9"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.08"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
${foil("foil", th.accent)}${foil("foil-paper", th.paperAccent)}
<pattern id="grid" width="150" height="150" patternUnits="userSpaceOnUse"><path d="M150 0H0V150" fill="none" stroke="${gridLine}" stroke-opacity="0.13" stroke-width="2"/><path d="M30 0V150M60 0V150M90 0V150M120 0V150M0 30H150M0 60H150M0 90H150M0 120H150" fill="none" stroke="${gridLine}" stroke-opacity="0.05" stroke-width="1.5"/></pattern>
<pattern id="grid-paper" width="150" height="150" patternUnits="userSpaceOnUse"><path d="M150 0H0V150" fill="none" stroke="${NAVY}" stroke-opacity="0.07" stroke-width="2"/><path d="M30 0V150M60 0V150M90 0V150M120 0V150M0 30H150M0 60H150M0 90H150M0 120H150" fill="none" stroke="${NAVY}" stroke-opacity="0.03" stroke-width="1.5"/></pattern>
${opt.rounded ? `<clipPath id="corners"><rect x="0" y="0" width="${c.W}" height="${c.H}" rx="${c.S.radius}"/></clipPath>` : ""}
</defs>`;
  const body = opt.rounded && !opt.bleed ? `<g clip-path="url(#corners)">${inner}</g>` : inner;
  // Many cards share the page: each drawing gets its own gradient and pattern ids.
  frame.count = (frame.count || 0) + 1;
  const p = `c${frame.count}-`;
  const svg = `${face}${defs}${body}`.replace(/id="([\w-]+)"/g, `id="${p}$1"`).replace(/url\(#([\w-]+)\)/g, `url(#${p}$1)`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${c.W + 2 * c.b}" height="${c.H + 2 * c.b}" viewBox="${-c.b} ${-c.b} ${c.W + 2 * c.b} ${c.H + 2 * c.b}">${svg}</svg>`;
}

function drawSide(side, d, opt, design = opt.design) {
  const th = theme(opt);
  const c = canvasFor(opt);
  const dz = DESIGNS[design] || DESIGNS.classic;
  return frame(opt, th, c, dz[side](d, opt, th, c));
}

const drawFront = (d, opt) => drawSide("front", d, opt);
const drawBack = (d, opt) => drawSide("back", d, opt);

/* ---------- Form ---------- */

function readForm() {
  const data = { ...DEFAULTS };
  Object.keys(DEFAULTS).forEach((key) => {
    data[key] = String(form.elements[key]?.value ?? "");
  });
  return data;
}

const checked = (name) => document.querySelector(`[name=${name}]:checked`)?.value;

function options() {
  return {
    design: document.querySelector(".bc-design.is-on")?.dataset.design || STYLE_DEFAULTS.design,
    palette: checked("palette") || STYLE_DEFAULTS.palette,
    primary: form.elements.primary.value,
    accent: form.elements.accent.value,
    font: form.elements.font.value,
    align: checked("align") || "left",
    logo: Number(form.elements.logo.value) / 100,
    showName: form.elements.showName.checked,
    showTagline: form.elements.showTagline.checked,
    foil: form.elements.foil.checked,
    rounded: form.elements.rounded.checked,
    qr: form.elements.qr.value,
    size: checked("size") || "us",
    bleed: form.elements.bleed.checked,
  };
}

function applyOptions(o) {
  const set = (name, value) => {
    const radio = document.querySelector(`[name=${name}][value="${value}"]`);
    if (radio) radio.checked = true;
  };
  set("palette", o.palette);
  set("align", o.align);
  set("size", o.size);
  form.elements.primary.value = o.primary;
  form.elements.accent.value = o.accent;
  form.elements.font.value = o.font;
  form.elements.logo.value = Math.round(o.logo * 100);
  ["showName", "showTagline", "foil", "rounded", "bleed"].forEach((k) => {
    form.elements[k].checked = Boolean(o[k]);
  });
  form.elements.qr.value = o.qr;
  selectDesign(o.design, false);
}

/* ---------- Designs gallery ---------- */

function buildGallery() {
  const list = document.querySelector(".bc-designs");
  if (!list) return;
  /* Five designs up front, the rest in a compact list below them. */
  const all = Object.entries(DESIGNS);
  list.innerHTML = all
    .slice(0, 5)
    .map(
      ([id, dz], i) =>
        `<button class="bc-design" type="button" data-design="${id}" aria-pressed="false"><span class="bc-design-art" data-thumb="${id}"></span><span class="bc-design-name"><span>${String(i + 1).padStart(2, "0")}</span>${dz.name}</span></button>`,
    )
    .join("");
  if (list.nextElementSibling?.classList.contains("bc-more")) list.nextElementSibling.remove();
  list.insertAdjacentHTML(
    "afterend",
    `<div class="bc-more"><p class="bc-more-title">${all.length - 5} more designs</p><div class="bc-more-list">${all
      .slice(5)
      .map(([id, dz], i) => `<button class="bc-design is-mini" type="button" data-design="${id}" aria-pressed="false"><span class="bc-design-art" data-thumb="${id}"></span><span class="bc-design-name"><span>${String(i + 6).padStart(2, "0")}</span>${dz.name}</span></button>`)
      .join("")}</div></div>`,
  );
}

function selectDesign(id, redraw = true) {
  document.querySelectorAll(".bc-design").forEach((el) => {
    const on = el.dataset.design === id;
    el.classList.toggle("is-on", on);
    el.setAttribute("aria-pressed", String(on));
  });
  if (redraw) render();
}

function drawThumbs(d, opt) {
  document.querySelectorAll("[data-thumb]").forEach((el) => {
    el.innerHTML = drawSide("front", d, { ...opt, bleed: false }, el.dataset.thumb);
  });
}

/* ---------- Preview ---------- */

function render() {
  const d = readForm();
  const opt = options();
  const c = canvasFor(opt);
  frontBox.innerHTML = drawFront(d, opt);
  backBox.innerHTML = drawBack(d, opt);
  drawThumbs(d, opt);
  flip.style.aspectRatio = `${c.W + 2 * c.b} / ${c.H + 2 * c.b}`;
  flip.classList.toggle("is-rounded", opt.rounded && !opt.bleed);
  document.querySelectorAll("[data-size-label]").forEach((el) => {
    el.textContent = opt.bleed ? `${c.S.label} with ${c.S.pb} ${c.S.unit} bleed` : c.S.label;
  });
  document.querySelector("[data-finish-label]").textContent = `${DESIGNS[opt.design]?.name || "Classic"} · ${opt.palette === "custom" ? "Custom" : PALETTES[opt.palette].label}`;
  document.querySelector("[data-logo-value]").textContent = `${Math.round(opt.logo * 100)}%`;
  if (opt.qr !== "none" && !qrReady) loadQr();
  try {
    localStorage.setItem(STORE, JSON.stringify({ ...d, ...opt }));
  } catch {
    /* Storage blocked: the card still works, it just will not remember. */
  }
}

function restore() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORE) || "null");
  } catch {
    saved = null;
  }
  const data = { ...DEFAULTS, ...(saved || {}) };
  Object.keys(DEFAULTS).forEach((key) => {
    if (form.elements[key]) form.elements[key].value = data[key];
  });
  applyOptions({ ...STYLE_DEFAULTS, ...(saved || {}) });
}

function loadQr() {
  if (loadQr.pending) return;
  loadQr.pending = loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js")
    .then(() => {
      qrReady = true;
      render();
    })
    .catch(() => {
      loadQr.pending = null;
    });
}

/* Front and back: the card turns over in 3D. */
function showSide(side) {
  flip.classList.toggle("is-back", side === "back");
  document.querySelectorAll("[data-side]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.side === side));
  });
}

/* The card leans gently towards the pointer. */
function initTilt() {
  const stage = document.querySelector(".bc-stage");
  const tilt = document.querySelector(".bc-tilt");
  if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  stage.addEventListener("pointermove", (event) => {
    const r = stage.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - 0.5;
    const y = (event.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
  });
  stage.addEventListener("pointerleave", () => {
    tilt.style.transform = "";
  });
}

/* ---------- Fonts for exports ---------- */

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function ensureFont(name = options().font) {
  if (fontData[name]) return fontData[name];
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, "+")}:wght@${FONTS[name] || "400..700"}&display=swap`).then((r) => r.text());
    const latin = css.match(/\/\* latin \*\/[\s\S]*?url\((https:[^)]+)\)/);
    const url = latin ? latin[1] : css.match(/url\((https:[^)]+)\)/)?.[1];
    if (!url) return null;
    const buffer = await fetch(url).then((r) => r.arrayBuffer());
    fontData[name] = `data:font/woff2;base64,${toBase64(buffer)}`;
  } catch {
    return null;
  }
  return fontData[name];
}

/* ---------- Exports ---------- */

function save(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function svgToCanvas(svg, scale) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    // Give the embedded font a beat to apply before the first paint.
    await new Promise((r) => setTimeout(r, 60));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const canvasBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

function fileBase(side) {
  const opt = options();
  return `ncs-business-card-${opt.design}-${side}-${opt.palette}-${SIZES[opt.size].name}${opt.bleed ? "-bleed" : ""}`;
}

async function exportPng(side) {
  await ensureFont();
  const svg = side === "front" ? drawFront(readForm(), options()) : drawBack(readForm(), options());
  // 600 dpi: twice the 300 dpi drawing, sharp for any printer.
  save(await canvasBlob(await svgToCanvas(svg, 2)), `${fileBase(side)}.png`);
}

async function exportSvg(side) {
  await ensureFont();
  const svg = side === "front" ? drawFront(readForm(), options()) : drawBack(readForm(), options());
  save(new Blob([svg], { type: "image/svg+xml" }), `${fileBase(side)}.svg`);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

async function exportPdf() {
  await ensureFont();
  if (!window.jspdf) {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  }
  const d = readForm();
  const opt = options();
  const S = SIZES[opt.size];
  const pw = S.pw + (opt.bleed ? 2 * S.pb : 0);
  const ph = S.ph + (opt.bleed ? 2 * S.pb : 0);
  const pdf = new window.jspdf.jsPDF({ orientation: "landscape", unit: S.unit, format: [pw, ph] });
  const front = await svgToCanvas(drawFront(d, opt), 2);
  const back = await svgToCanvas(drawBack(d, opt), 2);
  // JPEG at 600 dpi and high quality: crisp in print, a fraction of the size.
  // Rounded corners need transparency, so those cards go in as PNG.
  const add = (canvas) =>
    opt.rounded && !opt.bleed
      ? pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pw, ph)
      : pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pw, ph);
  add(front);
  pdf.addPage([pw, ph], "landscape");
  add(back);
  pdf.setProperties({ title: "New Concept Security business card", creator: "New Concept Security" });
  pdf.save(`ncs-business-card-${opt.design}-${opt.palette}-${S.name}${opt.bleed ? "-bleed" : ""}.pdf`);
}

/* Print straight from the browser: one side per page at its real size. */
function printCards() {
  const d = readForm();
  const opt = options();
  const S = SIZES[opt.size];
  const pw = S.pw + (opt.bleed ? 2 * S.pb : 0);
  const ph = S.ph + (opt.bleed ? 2 * S.pb : 0);
  const sheet = document.querySelector(".bc-print");
  sheet.innerHTML = `<div class="bc-print-page">${drawFront(d, opt)}</div><div class="bc-print-page">${drawBack(d, opt)}</div>`;
  let style = document.getElementById("bc-page-size");
  if (!style) {
    style = document.createElement("style");
    style.id = "bc-page-size";
    document.head.append(style);
  }
  style.textContent = `@page { size: ${pw}${S.unit} ${ph}${S.unit}; margin: 0; } .bc-print-page { width: ${pw}${S.unit}; height: ${ph}${S.unit}; }`;
  window.print();
}

/* Logo PNG: the full logo on black, rendered from the SVG file. */
async function exportLogoPng() {
  const svg = await fetch("assets/img/logo/ncs-logo-dark.svg").then((r) => r.text());
  save(await canvasBlob(await svgToCanvas(svg, 2)), "new-concept-security-logo-dark.png");
}

/* ---------- Wiring ---------- */

async function busy(button, task) {
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "Preparing…";
  try {
    await task();
  } catch (error) {
    console.error(error);
    window.alert("That download could not be prepared. Check your connection and try again.");
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

document.addEventListener("click", (event) => {
  const copy = event.target.closest("[data-copy]");
  if (copy) {
    navigator.clipboard?.writeText(copy.dataset.copy);
    const label = copy.querySelector("small");
    const was = label.textContent;
    label.textContent = "Copied " + copy.dataset.copy;
    setTimeout(() => (label.textContent = was), 1400);
    return;
  }
  const side = event.target.closest("[data-side]");
  if (side) showSide(side.dataset.side);
  const design = event.target.closest(".bc-design");
  if (design) selectDesign(design.dataset.design);
  const button = event.target.closest("[data-export]");
  if (!button) return;
  const kind = button.dataset.export;
  const run = {
    "png-front": () => exportPng("front"),
    "png-back": () => exportPng("back"),
    "svg-front": () => exportSvg("front"),
    "svg-back": () => exportSvg("back"),
    pdf: exportPdf,
    "logo-png": exportLogoPng,
  }[kind];
  if (kind === "print") printCards();
  else if (run) busy(button, run);
});

flip.addEventListener("click", () => showSide(flip.classList.contains("is-back") ? "front" : "back"));
flip.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showSide(flip.classList.contains("is-back") ? "front" : "back");
  }
});

const react = (event) => {
  if (!event.target.closest("#card-form, .bc-finish")) return;
  // Picking a custom colour switches the theme to Custom.
  if (event.target.name === "primary" || event.target.name === "accent") {
    const custom = document.querySelector("[name=palette][value=custom]");
    if (custom) custom.checked = true;
  }
  if (event.target.name === "font") ensureFont(event.target.value).then(render);
  render();
};
document.addEventListener("input", react);
document.addEventListener("change", react);
form.addEventListener("submit", (event) => event.preventDefault());
document.querySelector("[data-reset]")?.addEventListener("click", () => {
  Object.entries(DEFAULTS).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value;
  });
  render();
});
document.querySelector("[data-reset-style]")?.addEventListener("click", () => {
  applyOptions(STYLE_DEFAULTS);
  render();
});
// Editing a back-of-card field turns the card to show it.
form.addEventListener("focusin", (event) => {
  if (Object.keys(DEFAULTS).includes(event.target.name) && event.target.name !== "tagline") showSide("back");
  if (event.target.name === "tagline") showSide("front");
});

buildGallery();
restore();
render();
initTilt();
// Redraw once the fonts have loaded so the fitted sizes use the real metrics.
document.fonts?.ready.then(render);
ensureFont();
