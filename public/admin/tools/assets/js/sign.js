/* New Concept Security: the sign studio. Safety and security signs drawn to
   the UK conventions (ISO 7010 / BS 5499): the colour and shape of each kind
   of sign, symbols drawn as vectors, real print sizes from A5 to a hoarding
   banner, headlines that fit themselves, the CCTV data protection notice the
   ICO asks for, the NCS brand strip, a QR code and a sign reference. Exports
   as a PDF at the real size, a PNG, or straight to the printer. */

(function () {
  const STORE = "ncs-sign-v1";
  const PX = 3; // preview pixels per millimetre

  /* ---------- Kinds of sign ---------- */

  const KINDS = {
    warning: { label: "Warning", note: "Yellow triangle: a hazard ahead", panel: "#FFD100", ink: "#111111" },
    prohibition: { label: "Prohibition", note: "Red circle and bar: do not", panel: "#C8102E", ink: "#FFFFFF" },
    mandatory: { label: "Mandatory", note: "Blue disc: you must", panel: "#005EB8", ink: "#FFFFFF" },
    safe: { label: "Safe condition", note: "Green: exits, first aid, assembly", panel: "#00843D", ink: "#FFFFFF" },
    fire: { label: "Fire equipment", note: "Red square: fire points", panel: "#C8102E", ink: "#FFFFFF" },
    security: { label: "Security", note: "NCS black and red: guarded, CCTV, patrols", panel: "#0A0A0A", ink: "#FFFFFF" },
  };

  const FINISHES = {
    standard: "Standard",
    minimal: "Minimal white",
    night: "Night",
  };

  /* Sizes in millimetres, as printers and sign makers sell them. */
  const SIZES = {
    a5: { label: "A5 portrait", w: 148, h: 210 },
    a4: { label: "A4 portrait", w: 210, h: 297 },
    a4l: { label: "A4 landscape", w: 297, h: 210 },
    a3: { label: "A3 portrait", w: 297, h: 420 },
    a3l: { label: "A3 landscape", w: 420, h: 297 },
    a2: { label: "A2 portrait", w: 420, h: 594 },
    board: { label: "Site board 600 × 450 mm", w: 600, h: 450 },
    panel: { label: "Panel 400 × 300 mm", w: 400, h: 300 },
    square: { label: "Square 300 × 300 mm", w: 300, h: 300 },
    door: { label: "Door strip 300 × 100 mm", w: 300, h: 100 },
    banner: { label: "Hoarding banner 1200 × 400 mm", w: 1200, h: 400 },
  };

  /* ---------- Symbols, drawn on a 100 × 100 grid in one colour ---------- */

  const ICONS = {
    camera: { label: "CCTV camera", d: '<path d="M14.5 33.2a4 4 0 0 1 2.9-4.8l40.3-10.1a4 4 0 0 1 4.8 2.9l5.4 21.6a4 4 0 0 1-2.9 4.8L24.7 57.7a4 4 0 0 1-4.8-2.9z"/><path d="M68.6 24.4 85 18.6a2 2 0 0 1 2.7 1.9v22.6a2 2 0 0 1-2.4 2l-15.8-3.2z"/><path d="M38 58.6h8v14h18v-6h8v20h-8v-6H38z"/>' },
    shield: { label: "Shield", d: '<path fill-rule="evenodd" d="M50 8 84 20.5v23.1c0 22.6-14.2 39-34 48.4C30.2 82.6 16 66.2 16 43.6V20.5Zm-4.8 51.7L33 47.5l-6.1 6.1 18.3 18.3 29-29-6.1-6.1z"/>' },
    guard: { label: "Security officer", d: '<path d="M31 25.5h38l-4.6-11.3c-1-2.5-3.4-4.2-6.1-4.2H41.7c-2.7 0-5.1 1.7-6.1 4.2z"/><path d="M36 29.5a14 14 0 0 0 28 0z"/><path fill-rule="evenodd" d="M50 50c-17.7 0-30 11.2-30 28.5V92h60V78.5C80 61.2 67.7 50 50 50Zm8 16h12v12H58z"/>' },
    dog: { label: "Guard dog", d: '<path d="M14 58.5 19.6 41c1.3-4 5-6.6 9.2-6.6h21.6l9.6-13.6 5.4 1.7 3 7.8 10 3.6c2.4.9 4.1 3.2 4.1 5.8v3.4l-6.8 3.6h-7.1L66.4 64v24h-8.2l-1.8-17.2H35.5L31 88h-8.2l1.6-22.4-4.2-.8-1 9.1H11z"/>' },
    walker: { label: "Person walking", d: '<circle cx="56" cy="15" r="9"/><path d="m48.4 27.6-15.3 8.7-6.4 17.6 7.5 2.7 5.1-13.8 6.4-3.6-6.9 26.6-11.2 20.6 7.8 4.1 12-22 4.4-8.6 9.2 11.9V93h8.5V70.8L58.4 55l3.8-14.4 5 8.4h13.4v-8.4H71.8L64 27.8c-2.6-4.1-8-5.6-12.3-3.4z"/>' },
    car: { label: "Patrol vehicle", d: '<path fill-rule="evenodd" d="M12 62.5 19.2 42c1.7-4.8 6.2-8 11.3-8h39c5.1 0 9.6 3.2 11.3 8L88 62.5V78h-8v6H68v-6H32v6H20v-6h-8Zm15.3-10.5h45.4l-4-10.4c-.6-1.6-2.1-2.6-3.8-2.6H35.1c-1.7 0-3.2 1-3.8 2.6zM24 66a5 5 0 1 0 0 .1zm52 0a5 5 0 1 0 0 .1z"/><path d="M42 22h16v8H42z"/>' },
    bell: { label: "Alarm", d: '<path d="M50 12c-13.8 0-23 10.4-23 25v19.4L18 68v6h64v-6l-9-11.6V37c0-14.6-9.2-25-23-25z"/><path d="M40 79h20a10 10 0 0 1-20 0z"/><path d="M14 30c1.4-8.4 5.5-15.5 11.6-20.4l4.1 5.3C25 18.6 21.9 24.1 21 30.7zm72 0c-1.4-8.4-5.5-15.5-11.6-20.4l-4.1 5.3c4.7 3.7 7.8 9.2 8.7 15.8z"/>' },
    eye: { label: "Watching", d: '<path fill-rule="evenodd" d="M50 24c-21 0-36.6 15.4-42 26 5.4 10.6 21 26 42 26s36.6-15.4 42-26C86.6 39.4 71 24 50 24Zm0 10a16 16 0 1 0 0 32 16 16 0 0 0 0-32Zm0 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14z"/>' },
    key: { label: "Key holding", d: '<path fill-rule="evenodd" d="M34 20a20 20 0 0 0-3.9 39.6L30 88h12v-6h8v-8h-8v-6h8v-8.6A20 20 0 0 0 34 20Zm0 9a6 6 0 1 1 0 12 6 6 0 0 1 0-12z" transform="rotate(-38 40 54)"/>' },
    vest: { label: "Hi-vis vest", d: '<path fill-rule="evenodd" d="M36 10h-9l-8 18v62h26V56h10v34h26V28l-8-18h-9c0 8.8-7.2 16-14 16s-14-7.2-14-16Zm-11 40h18v7H25zm32 0h18v7H57zm-32 16h18v7H25zm32 0h18v7H57z"/>' },
    hardhat: { label: "Hard hat", d: '<path d="M44 20h12l3 18h-5l-1-9h-6l-1 9h-5z"/><path d="M20 62c0-17 10.4-30.6 24-34.5L43 52h14l-1-24.5C69.6 31.4 80 45 80 62z"/><path d="M10 66h80v10H10z"/>' },
    boots: { label: "Safety boots", d: '<path d="M22 12h26v38l26 10c6 2.3 10 7.6 10 13.6V82H22z"/><path d="M18 86h70v6H18z"/>' },
    gloves: { label: "Gloves", d: '<path d="M30 92V60L18 44l6-5 12 11V18a5 5 0 0 1 10 0v26h2V12a5 5 0 0 1 10 0v32h2V16a5 5 0 0 1 10 0v30h2V26a5 5 0 0 1 10 0v40c0 14-8 26-22 26z"/>' },
    smoking: { label: "Smoking", d: '<path d="M12 60h58v14H12z"/><path d="M74 60h6v14h-6zm10 0h6v14h-6z"/><path d="M74 54c0-10 12-8 12-18s-8-11-8-11l4-4s10 4 10 15c0 13-12 12-12 18z"/>' },
    phone: { label: "Mobile phone", d: '<path fill-rule="evenodd" d="M32 8h36a6 6 0 0 1 6 6v72a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Zm2 10v58h32V18zm16 64a4 4 0 1 0 0 .1z"/>' },
    fire: { label: "Fire", d: '<path d="M52 8c4 14-6 20-6 30 0 6 4 10 9 10 6 0 9-6 8-13 10 9 15 21 15 32 0 17-12.5 26-28 26S22 84 22 67c0-14 8-22 14-28 0 7 3 12 8 12 3 0 5-3 5-7 0-12-6-18 3-36z"/>' },
    extinguisher: { label: "Extinguisher", d: '<path d="M40 30h20a6 6 0 0 1 6 6v54H34V36a6 6 0 0 1 6-6z"/><path d="M44 18h12v10H44z"/><path d="M56 20h14l14 8-3 5-13-6H56z"/><path d="M36 14h28v6H36z"/>' },
    exit: { label: "Exit", d: '<path d="M62 8h28v84H62V82h18V18H62z"/><circle cx="40" cy="18" r="7.5"/><path d="M34 29 21 37l-5 15 6.5 2 4-11 5-3-6 22-9 17 6.7 3.5 10-18.5 3.6-7 7.6 9.8V92h7V73.6l-10.2-13 3-12 4.4 7.4H58v-7h-6.4l-6.3-10.6c-2.2-3.4-6.7-4.6-10.2-2.8z"/>' },
    assembly: { label: "Assembly point", d: '<path d="M8 8h18v6H14v12H8zm84 0H74v6h12v12h6zM8 92h18v-6H14V74H8zm84 0H74v-6h12V74h6z"/><circle cx="34" cy="38" r="7"/><circle cx="66" cy="38" r="7"/><circle cx="50" cy="32" r="7"/><path d="M24 74V56c0-5 4-9 9-9h2c5 0 9 4 9 9v18zm32 0V56c0-5 4-9 9-9h2c5 0 9 4 9 9v18zM40 70V50c0-5 4-9 9-9h2c5 0 9 4 9 9v20z"/>' },
    firstaid: { label: "First aid", d: '<path d="M38 12h24v26h26v24H62v26H38V62H12V38h26z"/>' },
    lock: { label: "Locked", d: '<path fill-rule="evenodd" d="M30 44V32a20 20 0 0 1 40 0v12h6v46H24V44Zm10 0h20V32a10 10 0 0 0-20 0Zm10 14a6 6 0 0 0-3 11.2V78h6v-8.8A6 6 0 0 0 50 58z"/>' },
    barrier: { label: "Vehicle barrier", d: '<path d="M14 54h12v38H14z"/><path d="M28 46h62v12H28z"/><path d="M8 88h24v6H8z"/><path d="M40 46h10l-6 12H34zm20 0h10l-6 12H54zm20 0h10l-6 12H74z" fill-opacity="0.35"/>' },
    arrow: { label: "Direction arrow", d: '<path d="M12 42h46V24l30 26-30 26V58H12z"/>' },
  };

  /* Each kind of sign wears the symbol differently. */
  function badge(kind, icon, finish) {
    const p = ICONS[icon]?.d || ICONS.camera.d;
    const sym = (fill, k = 0.62, cy = 60) => `<g transform="translate(${60 - 50 * k} ${cy - 50 * k}) scale(${k})" fill="${fill}">${p}</g>`;
    const night = finish === "night";
    switch (kind) {
      case "warning":
        return `<svg viewBox="0 0 120 120" class="sg-badge"><path d="M60 9 113 103H7Z" fill="#FFD100" stroke="#111" stroke-width="7" stroke-linejoin="round"/>${sym("#111", 0.5, 70)}</svg>`;
      case "prohibition":
        return `<svg viewBox="0 0 120 120" class="sg-badge"><circle cx="60" cy="60" r="53" fill="#fff"/>${sym("#111", 0.6)}<circle cx="60" cy="60" r="48" fill="none" stroke="#C8102E" stroke-width="11"/><path d="M26 26 94 94" stroke="#C8102E" stroke-width="11"/></svg>`;
      case "mandatory":
        return `<svg viewBox="0 0 120 120" class="sg-badge"><circle cx="60" cy="60" r="54" fill="#005EB8"/>${sym("#fff", 0.66)}</svg>`;
      case "safe":
        return `<svg viewBox="0 0 120 120" class="sg-badge"><rect x="6" y="6" width="108" height="108" rx="6" fill="#00843D"/>${sym("#fff", 0.7)}</svg>`;
      case "fire":
        return `<svg viewBox="0 0 120 120" class="sg-badge"><rect x="6" y="6" width="108" height="108" rx="6" fill="#C8102E"/>${sym("#fff", 0.7)}</svg>`;
      default:
        return `<svg viewBox="0 0 120 120" class="sg-badge"><rect x="6" y="6" width="108" height="108" rx="16" fill="${night ? "#161616" : "#0A0A0A"}"/><path d="M6 98h108v4H6z" fill="#C41616"/>${sym("#fff", 0.6, 55)}</svg>`;
    }
  }

  /* ---------- Starting points ---------- */

  const PRESETS = {
    cctv: { label: "CCTV in operation", kind: "security", icons: ["camera"], headline: "24-hour CCTV in operation", sub: "This site is monitored and recorded", small: "Images are recorded for the prevention and detection of crime and for public safety.", notice: true },
    guarded: { label: "Guarded site", kind: "security", icons: ["guard"], headline: "Security officers on patrol", sub: "This site is guarded 24 hours a day", small: "All visitors and deliveries must report to the gatehouse." },
    noentry: { label: "No unauthorised entry", kind: "prohibition", icons: ["walker"], headline: "No unauthorised entry", sub: "Trespassers will be prosecuted", small: "This site is protected by CCTV and patrolled by security officers." },
    dogs: { label: "Guard dogs", kind: "warning", icons: ["dog"], headline: "Guard dogs on patrol", sub: "Do not enter this site", small: "Dogs are under the control of a licensed handler at all times." },
    patrol: { label: "Mobile patrols", kind: "security", icons: ["car"], headline: "Mobile patrols operate here", sub: "Day and night, at random times", small: "Every visit is logged and reported." },
    keys: { label: "Key holding", kind: "security", icons: ["key", "bell"], headline: "Alarm response and key holding", sub: "These premises are protected", small: "Alarm activations are attended by our response officers." },
    report: { label: "Report to gatehouse", kind: "mandatory", icons: ["guard"], headline: "All visitors must report to the gatehouse", sub: "Sign in before entering the site", small: "You will be given a pass and a short safety briefing." },
    ppe: { label: "Site PPE board", kind: "mandatory", icons: ["hardhat", "vest", "boots", "gloves"], headline: "Safety equipment must be worn", sub: "Beyond this point at all times", small: "Hard hat, hi-vis, safety boots and gloves. Ask at the gatehouse if you need them." },
    nosmoking: { label: "No smoking", kind: "prohibition", icons: ["smoking"], headline: "No smoking", sub: "Including e-cigarettes, anywhere on this site", small: "" },
    assembly: { label: "Fire assembly point", kind: "safe", icons: ["assembly"], headline: "Fire assembly point", sub: "Wait here for instructions", small: "Do not leave until your name has been checked." },
    exit: { label: "Emergency exit", kind: "safe", icons: ["exit", "arrow"], headline: "Emergency exit", sub: "Keep clear at all times", small: "" },
    firepoint: { label: "Fire point", kind: "fire", icons: ["extinguisher", "fire"], headline: "Fire point", sub: "Fire extinguisher and alarm", small: "Raise the alarm first. Only tackle a fire if it is safe to do so." },
    locked: { label: "Locked overnight", kind: "security", icons: ["lock"], headline: "Site locked overnight", sub: "Locked and unlocked by New Concept Security", small: "Out of hours access by arrangement with the control room only." },
  };

  const defaults = () => ({
    preset: "cctv",
    ...PRESETS.cctv,
    finish: "standard",
    size: "a3",
    logo: true,
    phone: "01253 982211",
    phoneLabel: "24-hour control room",
    sia: true,
    qr: "",
    ref: "NCS-S-001",
    operator: "New Concept Security Ltd on behalf of the site owner",
    purpose: "the prevention and detection of crime and public safety",
    contact: "01253 982211 · mattbaron@newconceptsecurity.co.uk",
    second: "",
  });

  let state = load();
  function load() {
    try {
      return { ...defaults(), ...(JSON.parse(localStorage.getItem(STORE) || "null") || {}) };
    } catch {
      return defaults();
    }
  }
  const save = () => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch {}
  };

  /* ---------- Drawing ---------- */

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const MARK = '<path d="M210 8L297.35 95.35V301.72L148.09 69.91ZM210 412L122.65 324.65V118.28L271.91 350.09Z"/><path d="M10.18 210L68.05 152.13V267.87ZM409.82 210L351.95 152.13V267.87Z"/>';

  function layoutOf(size) {
    const r = size.w / size.h;
    return r >= 2.2 ? "banner" : r > 1.08 ? "landscape" : r >= 0.92 ? "square" : "portrait";
  }

  function qrSvg(text, color) {
    if (!text || !window.qrcode) return "";
    const q = window.qrcode(0, "M");
    q.addData(text);
    q.make();
    const n = q.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return `<svg class="sg-qr" viewBox="-2 -2 ${n + 4} ${n + 4}"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="${color}"/></svg>`;
  }

  function signHtml(s = state) {
    const size = SIZES[s.size] || SIZES.a3;
    const layout = layoutOf(size);
    const k = KINDS[s.kind] || KINDS.security;
    const W = size.w * PX;
    const H = size.h * PX;
    const u = Math.min(W, H * (layout === "banner" ? 2.4 : layout === "landscape" ? 1.35 : 1)) / 100;
    const night = s.finish === "night";
    const minimal = s.finish === "minimal";
    // The text panel: the kind's own colour, or white, or night black.
    const panel = night ? "#0A0A0A" : minimal ? "#FFFFFF" : k.panel;
    const ink = night ? "#FFFFFF" : minimal ? "#111111" : k.ink;
    const board = night ? "#111111" : "#FFFFFF";
    const icons = (s.icons || []).slice(0, 4);
    const badges = icons.map((i) => badge(s.kind, i, s.finish)).join("");
    const notice =
      s.notice && s.kind === "security"
        ? `<p class="sg-notice">This CCTV scheme is operated by ${esc(s.operator)} for ${esc(s.purpose)}. For more information, contact ${esc(s.contact)}.</p>`
        : "";
    const foot =
      s.logo || s.phone || s.qr
        ? `<footer class="sg-foot" style="background:${night ? "#000" : "#0A0A0A"}">
        ${s.logo ? `<div class="sg-brand"><svg viewBox="0 0 420 420"><g fill="#C41616">${MARK}</g></svg><div><b><i>NEW</i>CONCEPT</b><small>SECURITY</small></div></div>` : ""}
        ${s.phone ? `<div class="sg-phone"><small>${esc(s.phoneLabel)}</small><b>${esc(s.phone)}</b></div>` : ""}
        ${s.sia ? `<div class="sg-sia"><small>SIA</small><b>Approved Contractor</b></div>` : ""}
        ${s.qr ? qrSvg(s.qr, "#0A0A0A") : ""}
      </footer>`
        : "";
    return `<div class="sg sg-${layout} k-${s.kind} f-${s.finish} n-${icons.length}" style="width:${W}px;height:${H}px;--u:${u.toFixed(3)}px;--panel:${panel};--ink:${ink};--board:${board};--rule:${minimal ? k.panel : "transparent"}">
      <div class="sg-sym" style="background:${night ? "#111" : "#fff"}">${badges}</div>
      <div class="sg-text"><div class="sg-words"><h1 class="sg-head">${esc(s.headline)}</h1>${s.second ? `<p class="sg-second">${esc(s.second)}</p>` : ""}${s.sub ? `<p class="sg-sub">${esc(s.sub)}</p>` : ""}${s.small ? `<p class="sg-small">${esc(s.small)}</p>` : ""}${notice}</div></div>
      ${foot}
      ${s.ref ? `<span class="sg-ref">${esc(s.ref)}</span>` : ""}
    </div>`;
  }

  /* Shrinks the words until they sit inside their panel. */
  function fitWords(root) {
    root.querySelectorAll(".sg").forEach((sign) => {
      const box = sign.querySelector(".sg-text");
      const words = sign.querySelector(".sg-words");
      if (!box || !words) return;
      let scale = 1;
      words.style.setProperty("--fit", "1");
      const cs = getComputedStyle(box);
      const room = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const fits = () => words.scrollHeight <= room && words.scrollWidth <= words.clientWidth + 1;
      while (!fits() && scale > 0.3) {
        scale -= 0.03;
        words.style.setProperty("--fit", scale.toFixed(2));
      }
      // Still too much for a small strip: the small print gives way first.
      if (!fits()) {
        words.querySelectorAll(".sg-small, .sg-notice").forEach((el) => el.remove());
        scale = 1;
        words.style.setProperty("--fit", "1");
        while (!fits() && scale > 0.3) {
          scale -= 0.03;
          words.style.setProperty("--fit", scale.toFixed(2));
        }
      }
    });
  }

  /* ---------- Page ---------- */

  const $ = (s, r = document) => r.querySelector(s);
  const stage = $("[data-stage]");
  const controls = $("[data-controls]");

  function controlsHtml() {
    const opt = (o, v) => Object.entries(o).map(([k, x]) => `<option value="${k}"${k === v ? " selected" : ""}>${esc(typeof x === "string" ? x : x.label)}</option>`).join("");
    return `
    <section class="st-sec"><h2>Start from <small>${Object.keys(PRESETS).length} ready-made signs</small></h2>
      <div class="st-tiles">${Object.entries(PRESETS).map(([id, p]) => `<button class="st-tile" type="button" data-preset="${id}" aria-pressed="${id === state.preset}">${badge(p.kind, p.icons[0], "standard")}<span>${esc(p.label)}</span></button>`).join("")}</div>
    </section>
    <section class="st-sec"><h2>Kind of sign <small>${esc(KINDS[state.kind].note)}</small></h2>
      <div class="st-seg">${Object.entries(KINDS).map(([id, k]) => `<button type="button" data-kind="${id}" aria-pressed="${id === state.kind}">${k.label}</button>`).join("")}</div>
    </section>
    <section class="st-sec"><h2>Symbols <small>up to four, in order</small></h2>
      <div class="st-tiles">${Object.entries(ICONS).map(([id, ic]) => `<button class="st-tile" type="button" data-icon="${id}" aria-pressed="${(state.icons || []).includes(id)}" title="${esc(ic.label)}">${badge(state.kind, id, state.finish)}<span>${esc(ic.label)}</span></button>`).join("")}</div>
    </section>
    <section class="st-sec"><h2>Words</h2><div class="st-grid">
      <label class="st-field is-wide">Headline<input data-k="headline" value="${esc(state.headline)}" maxlength="80"></label>
      <label class="st-field is-wide">Second line<input data-k="sub" value="${esc(state.sub)}" maxlength="90"></label>
      <label class="st-field is-wide">Small print<textarea data-k="small" rows="2" maxlength="240">${esc(state.small)}</textarea></label>
      <label class="st-field is-wide">Headline in a second language <em>optional</em><input data-k="second" value="${esc(state.second)}" maxlength="80"></label>
    </div></section>
    <section class="st-sec"><h2>CCTV notice <small>what the ICO asks a CCTV sign to say</small></h2><div class="st-grid">
      <label class="st-check is-wide"><input type="checkbox" data-k="notice"${state.notice ? " checked" : ""}> Show the data protection notice (security signs)</label>
      <label class="st-field is-wide">Operated by<input data-k="operator" value="${esc(state.operator)}"></label>
      <label class="st-field is-wide">For the purpose of<input data-k="purpose" value="${esc(state.purpose)}"></label>
      <label class="st-field is-wide">Contact<input data-k="contact" value="${esc(state.contact)}"></label>
    </div></section>
    <section class="st-sec"><h2>Size and finish</h2><div class="st-grid">
      <label class="st-field is-wide">Size<select data-k="size">${opt(SIZES, state.size)}</select></label>
      <div class="st-field is-wide">Finish<div class="st-seg">${Object.entries(FINISHES).map(([id, l]) => `<button type="button" data-finish="${id}" aria-pressed="${id === state.finish}">${l}</button>`).join("")}</div></div>
    </div></section>
    <section class="st-sec"><h2>Brand strip</h2><div class="st-grid">
      <label class="st-check is-wide"><input type="checkbox" data-k="logo"${state.logo ? " checked" : ""}> NCS logo</label>
      <label class="st-check is-wide"><input type="checkbox" data-k="sia"${state.sia ? " checked" : ""}> SIA Approved Contractor</label>
      <label class="st-field">Phone label<input data-k="phoneLabel" value="${esc(state.phoneLabel)}"></label>
      <label class="st-field">Phone<input data-k="phone" value="${esc(state.phone)}"></label>
      <label class="st-field is-wide">QR code link <em>optional: report an incident, site rules</em><input data-k="qr" value="${esc(state.qr)}" placeholder="https://"></label>
      <label class="st-field is-wide">Sign reference<input data-k="ref" value="${esc(state.ref)}"></label>
    </div></section>`;
  }

  function draw() {
    stage.innerHTML = `<div class="st-scaler">${signHtml()}</div>`;
    const scaler = $(".st-scaler", stage);
    const sign = $(".sg", stage);
    const avail = stage.clientWidth - 8;
    const maxH = Math.max(420, window.innerHeight - 220);
    const k = Math.min(1, avail / sign.offsetWidth, maxH / sign.offsetHeight);
    scaler.style.transform = `scale(${k})`;
    scaler.style.width = `${sign.offsetWidth}px`;
    stage.style.height = `${sign.offsetHeight * k + 48}px`;
    fitWords(stage);
    const size = SIZES[state.size];
    $("[data-meta]").textContent = `${KINDS[state.kind].label} sign · ${size.label} · ${FINISHES[state.finish]}`;
    save();
  }

  function redraw() {
    const open = document.activeElement?.dataset?.k;
    controls.innerHTML = controlsHtml();
    if (open) controls.querySelector(`[data-k="${open}"]`)?.focus();
    draw();
  }

  controls.addEventListener("input", (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    state[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    draw();
  });
  controls.addEventListener("change", (e) => {
    if (e.target.dataset.k === "size") draw();
  });
  controls.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.preset) {
      const p = PRESETS[t.dataset.preset];
      state = { ...state, preset: t.dataset.preset, kind: p.kind, icons: [...p.icons], headline: p.headline, sub: p.sub, small: p.small, notice: Boolean(p.notice) };
    } else if (t.dataset.kind) state.kind = t.dataset.kind;
    else if (t.dataset.finish) state.finish = t.dataset.finish;
    else if (t.dataset.icon) {
      const list = state.icons || [];
      state.icons = list.includes(t.dataset.icon) ? list.filter((x) => x !== t.dataset.icon) : [...list, t.dataset.icon].slice(-4);
      if (!state.icons.length) state.icons = [t.dataset.icon];
    } else return;
    redraw();
  });

  /* ---------- Exports ---------- */

  const fileName = (ext) => window.NCSExport.fileName([`Sign ${state.ref}`, state.headline, SIZES[state.size].label, "New Concept Security"], ext);
  const fitted = () => {
    const clone = $(".sg", stage).cloneNode(true);
    return clone.outerHTML;
  };
  const scaleFor = () => Math.min(3, 6500 / (SIZES[state.size].w * PX));

  async function exportPdf() {
    const size = SIZES[state.size];
    const { blob } = await window.NCSExport.pagesPdf({
      html: fitted(),
      selector: ".sg",
      pt: [size.w * 2.83465, size.h * 2.83465],
      scale: scaleFor(),
      meta: { title: `${state.headline} (${state.ref})`, subject: `${KINDS[state.kind].label} sign, ${size.label}`, author: "New Concept Security", keywords: "sign, safety, security, New Concept Security" },
    });
    window.NCSExport.save(blob, fileName("pdf"));
    toast(`PDF saved at full size: ${size.w} × ${size.h} mm.`);
  }

  async function exportPng() {
    const canvases = await window.NCSExport.pngOf({ html: fitted(), selector: ".sg", scale: scaleFor() });
    await window.NCSExport.png(canvases, fileName("png"));
  }

  function printSign() {
    const size = SIZES[state.size];
    const box = $(".st-print");
    box.innerHTML = fitted();
    const el = box.firstElementChild;
    el.style.transform = `scale(${(96 / 25.4 / PX).toFixed(4)})`;
    el.style.transformOrigin = "0 0";
    let style = $("#sg-page");
    if (!style) document.head.append((style = Object.assign(document.createElement("style"), { id: "sg-page" })));
    style.textContent = `@page { size: ${size.w}mm ${size.h}mm; margin: 0; }`;
    window.print();
  }

  function toast(text) {
    const t = Object.assign(document.createElement("div"), { className: "st-toast", textContent: text, role: "status" });
    document.body.append(t);
    setTimeout(() => t.remove(), 3200);
  }

  async function busy(btn, task) {
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Preparing…";
    try {
      await task();
    } catch (e) {
      console.error(e);
      toast("That export couldn't be prepared. Check your connection and try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-export]");
    if (!b) return;
    if (b.dataset.export === "pdf") busy(b, exportPdf);
    if (b.dataset.export === "png") busy(b, exportPng);
    if (b.dataset.export === "print") printSign();
    if (b.dataset.export === "reset") {
      state = defaults();
      redraw();
    }
    b.closest("details")?.removeAttribute("open");
  });

  window.addEventListener("resize", draw);
  window.NCSExport.load("https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js").then(draw).catch(() => {});
  document.fonts?.ready.then(draw);
  redraw();
})();
