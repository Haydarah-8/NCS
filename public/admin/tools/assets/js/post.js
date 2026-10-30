/* New Concept Security: the social post maker. Posts at the exact sizes
   each network wants, in seven layouts, with the company's photographs or
   your own, and a caption with hashtags to go with them. Downloads a PNG at
   full resolution, or every size at once. */

(function () {
  const STORE = "ncs-post-v1";

  const FORMATS = {
    square: { label: "Square", use: "Instagram, Facebook", w: 1080, h: 1080 },
    portrait: { label: "Portrait", use: "Instagram feed", w: 1080, h: 1350 },
    story: { label: "Story", use: "Stories, Reels cover", w: 1080, h: 1920 },
    link: { label: "Landscape", use: "LinkedIn, Facebook", w: 1200, h: 627 },
    wide: { label: "Wide", use: "X (Twitter)", w: 1600, h: 900 },
    banner: { label: "LinkedIn banner", use: "LinkedIn profile or company page; words sit clear of the profile photo", w: 1584, h: 396 },
    cover: { label: "Facebook cover", use: "Facebook page cover", w: 1640, h: 624 },
    flyer: { label: "A5 flyer", use: "Print at 300 dpi; download the print PDF", w: 1748, h: 2480, mm: [148, 210] },
    poster: { label: "A4 poster or sign", use: "Print at 300 dpi, event and site signage", w: 2480, h: 3508, mm: [210, 297] },
  };
  const SOCIAL = Object.keys(FORMATS).filter((k) => !FORMATS[k].mm);

  const PHOTOS = ["hero", "hero-skyline", "balfour-site", "control-room", "fleet-night", "northern-way", "reception", "street", "tram", "venue"];

  const LAYOUTS = {
    hiring: {
      label: "We're hiring",
      kicker: "We're hiring",
      headline: "SIA door supervisors and security officers",
      body: "Blackpool, Preston and the Fylde coast\nDays, nights and weekends\nFull and part time",
      cta: "Apply at newconceptsecurity.co.uk/careers",
      photo: "venue",
      caption: "We're growing and looking for SIA licensed door supervisors and security officers across Blackpool, Preston and the Fylde coast. Full and part-time shifts, days, nights and weekends. Apply through the link in our bio or call 01253 982211.",
      tags: "#SecurityJobs #SIA #DoorSupervisor #BlackpoolJobs #PrestonJobs #NowHiring",
    },
    spotlight: {
      label: "Service spotlight",
      kicker: "Our services",
      headline: "Construction site security, day and night",
      body: "Licensed officers on site\nStandalone CCTV towers\nMorning reports, every day",
      cta: "Free site survey: 01253 982211",
      photo: "balfour-site",
      caption: "Keeping construction sites safe across the North West: licensed officers, mobile patrols and standalone CCTV, with a written report every morning. Book a free site survey on 01253 982211.",
      tags: "#ConstructionSecurity #SiteSecurity #CCTV #Blackpool #Preston #NorthWest",
    },
    stat: {
      label: "Big number",
      kicker: "Since 2017",
      stat: "24/7",
      statLabel: "Control room, every day of the year",
      headline: "",
      body: "",
      cta: "newconceptsecurity.co.uk",
      photo: "control-room",
      caption: "Our control room never closes. 24 hours a day, 365 days a year, our team is watching, answering and responding.",
      tags: "#ControlRoom #Security #AlarmResponse #KeyHolding #Blackpool",
    },
    quote: {
      label: "Client quote",
      kicker: "What clients say",
      quote: "Professional, reliable and always there when we need them. The morning reports give us total peace of mind.",
      author: "Site manager, Preston",
      headline: "",
      body: "",
      cta: "",
      photo: "balfour-site",
      caption: "Kind words from one of the sites we look after. Thank you for trusting New Concept Security.",
      tags: "#ClientFeedback #SecurityServices #Preston #Lancashire",
    },
    announce: {
      label: "Announcement",
      kicker: "News",
      headline: "Our new 24-hour control room is live",
      body: "Faster alarm response and live monitoring for every client.",
      cta: "Read more on our website",
      photo: "control-room",
      caption: "Big news: our new 24-hour control room is now live at Concept House, Blackpool. Faster alarm response, live camera monitoring, and a direct line for every client.",
      tags: "#News #Security #ControlRoom #Blackpool",
    },
    tip: {
      label: "Security tip",
      kicker: "Security tip",
      tipNo: "01",
      headline: "Check your perimeter before the clocks go back",
      body: "Longer nights mean more cover for intruders. Walk the fence line, test the lighting and make sure every gate locks.",
      cta: "Free site survey: 01253 982211",
      photo: "fleet-night",
      caption: "Security tip: with darker evenings on the way, walk your perimeter, test your lighting and check every gate locks properly. Want a second pair of eyes? We offer free site surveys.",
      tags: "#SecurityTips #BusinessSecurity #CrimePrevention #Blackpool",
    },
    event: {
      label: "Event sign",
      kicker: "Event security",
      headline: "Bag searches in operation",
      body: "Please have your ticket ready\nNo glass beyond this point\nAsk any steward for help",
      cta: "",
      photo: "venue",
      caption: "Licensed security on duty at today's event. Please arrive early and have your ticket ready.",
      tags: "#EventSecurity #SIA #Blackpool",
    },
    photo: {
      label: "Photo and words",
      kicker: "",
      headline: "Professional security, done properly",
      body: "",
      cta: "",
      photo: "hero-skyline",
      caption: "Professional security, done properly. Manned guarding, door supervision, key holding and CCTV across the North West.",
      tags: "#Security #Blackpool #Preston #NorthWest #SIA",
    },
  };

  const defaults = () => ({
    layout: "hiring",
    format: "square",
    ...LAYOUTS.hiring,
    upload: "",
    overlay: 62,
    theme: "dark",
    handle: "@NCSNW",
    showLogo: true,
    showContact: true,
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
      const { upload, ...rest } = state; // pictures stay out of storage, they're too big
      localStorage.setItem(STORE, JSON.stringify(rest));
    } catch {}
  };

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const MARK = '<path d="M210 8L297.35 95.35V301.72L148.09 69.91ZM210 412L122.65 324.65V118.28L271.91 350.09Z"/><path d="M10.18 210L68.05 152.13V267.87ZM409.82 210L351.95 152.13V267.87Z"/>';

  /* ---------- The post ---------- */

  function postHtml(s = state, format = s.format) {
    const f = FORMATS[format];
    const u = Math.min(f.w, f.h) / 100;
    const shape = f.w / f.h >= 3 ? "banner" : f.h / f.w > 1.5 ? "tall" : f.w / f.h > 1.5 ? "wide" : "even";
    const photo = s.upload || `/images/${s.photo}.jpg`;
    const light = s.theme === "light";
    const red = s.theme === "red";
    const ink = light ? "#1d1d1f" : "#ffffff";
    const shade = light ? `rgba(255,255,255,${s.overlay / 100})` : red ? `rgba(110,8,8,${s.overlay / 100})` : `rgba(0,0,0,${s.overlay / 100})`;
    const lines = String(s.body || "").split("\n").filter((l) => l.trim());
    const logo = s.showLogo
      ? `<div class="pm-logo"><svg viewBox="0 0 420 420"><g fill="${red ? "#ffffff" : "#c41616"}">${MARK}</g></svg><div><b style="color:${red ? "#fff" : "#c41616"}"><i style="color:${ink}">NEW</i>CONCEPT</b><small>SECURITY</small></div></div>`
      : "";
    const contact = s.showContact ? `<div class="pm-contact"><span>01253 982211</span><span>newconceptsecurity.co.uk</span>${s.handle ? `<span>${esc(s.handle)}</span>` : ""}</div>` : "";
    let main = "";
    switch (s.layout) {
      case "stat":
        main = `<p class="pm-kicker">${esc(s.kicker)}</p><p class="pm-stat">${esc(s.stat)}</p><p class="pm-stat-label">${esc(s.statLabel)}</p>`;
        break;
      case "quote":
        main = `<p class="pm-kicker">${esc(s.kicker)}</p><p class="pm-mark">“</p><blockquote class="pm-quote">${esc(s.quote)}</blockquote><p class="pm-author">${esc(s.author)}</p>`;
        break;
      case "tip":
        main = `<p class="pm-kicker">${esc(s.kicker)} <span class="pm-tipno">${esc(s.tipNo)}</span></p><h1 class="pm-head">${esc(s.headline)}</h1>${s.body ? `<p class="pm-body">${esc(s.body)}</p>` : ""}`;
        break;
      case "hiring":
      case "spotlight":
      case "event":
        main = `<p class="pm-kicker">${esc(s.kicker)}</p><h1 class="pm-head">${esc(s.headline)}</h1>${lines.length ? `<ul class="pm-list">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}`;
        break;
      default:
        main = `${s.kicker ? `<p class="pm-kicker">${esc(s.kicker)}</p>` : ""}<h1 class="pm-head">${esc(s.headline)}</h1>${s.body ? `<p class="pm-body">${esc(s.body)}</p>` : ""}`;
    }
    return `<div class="pm l-${s.layout} s-${shape} t-${s.theme}" style="width:${f.w}px;height:${f.h}px;--u:${u}px;--ink:${ink};background-image:url('${photo}')">
      <div class="pm-shade" style="background:linear-gradient(${shape === "wide" ? "90deg" : shape === "banner" ? "270deg" : "180deg"}, ${shade}, ${shade.replace(/[\d.]+\)$/, `${Math.min(1, s.overlay / 100 + 0.25)})`)})"></div>
      <div class="pm-in">
        <header class="pm-top">${logo}</header>
        <div class="pm-main">${main}</div>
        <footer class="pm-foot">${s.cta ? `<p class="pm-cta">${esc(s.cta)}</p>` : ""}${contact}</footer>
      </div>
      <i class="pm-rule"></i>
    </div>`;
  }

  /* Shrinks the words when a short format has less room. */
  function fit(root) {
    root.querySelectorAll(".pm").forEach((post) => {
      const main = post.querySelector(".pm-main");
      main.style.setProperty("--fit", "1");
      let k = 1;
      while (main.scrollHeight > main.clientHeight + 2 && k > 0.4) {
        k -= 0.03;
        main.style.setProperty("--fit", k.toFixed(2));
      }
    });
  }

  /* ---------- Page ---------- */

  const $ = (s, r = document) => r.querySelector(s);
  const controls = $("[data-controls]");
  const stage = $("[data-stage]");

  function controlsHtml() {
    const s = state;
    const field = (k, label, area = false, rows = 3) =>
      area ? `<label class="st-field is-wide">${label}<textarea data-k="${k}" rows="${rows}">${esc(s[k])}</textarea></label>` : `<label class="st-field is-wide">${label}<input data-k="${k}" value="${esc(s[k])}"></label>`;
    const words = {
      stat: field("kicker", "Small heading") + field("stat", "Big number") + field("statLabel", "What it means"),
      quote: field("kicker", "Small heading") + field("quote", "Quote", true, 4) + field("author", "Who said it"),
      tip: field("kicker", "Small heading") + field("tipNo", "Tip number") + field("headline", "Headline") + field("body", "Tip", true, 3),
      hiring: field("kicker", "Small heading") + field("headline", "Headline") + field("body", "Points <em>one per line</em>", true, 3),
      spotlight: field("kicker", "Small heading") + field("headline", "Headline") + field("body", "Points <em>one per line</em>", true, 3),
      event: field("kicker", "Small heading") + field("headline", "Headline") + field("body", "Lines <em>one per line</em>", true, 3),
    }[s.layout] || field("kicker", "Small heading") + field("headline", "Headline") + field("body", "Words", true, 3);
    return `
    <section class="st-sec"><h2>Size <small>${esc(FORMATS[s.format].use)}</small></h2>
      <div class="st-seg">${Object.entries(FORMATS).map(([id, f]) => `<button type="button" data-format="${id}" aria-pressed="${id === s.format}">${f.label} <small style="opacity:.6">${f.w}×${f.h}</small></button>`).join("")}</div></section>
    <section class="st-sec"><h2>Layout</h2>
      <div class="st-tiles is-wide">${Object.entries(LAYOUTS).map(([id, l]) => `<button class="st-tile" type="button" data-layout="${id}" aria-pressed="${id === s.layout}"><span class="st-thumb pm-thumb" data-thumb="${id}"></span><span>${esc(l.label)}</span></button>`).join("")}</div></section>
    <section class="st-sec"><h2>Words</h2><div class="st-grid">${words}${field("cta", "Call to action")}${field("handle", "Social handle")}</div></section>
    <section class="st-sec"><h2>Photo <small>or upload your own</small></h2>
      <div class="pm-photos">${PHOTOS.map((p) => `<button type="button" data-photo="${p}" aria-pressed="${!s.upload && p === s.photo}" style="background-image:url('/images/${p}.jpg')" title="${p}"></button>`).join("")}</div>
      <div class="st-actions" style="margin-top:10px"><button class="st-btn is-small" type="button" data-upload>Upload a photo</button>${s.upload ? '<button class="st-link" type="button" data-unupload>Remove upload</button>' : ""}</div>
      <input type="file" accept="image/*" data-upload-file hidden>
    </section>
    <section class="st-sec"><h2>Look</h2><div class="st-grid">
      <div class="st-field is-wide">Colour<div class="st-seg">${[["dark", "Black"], ["red", "NCS red"], ["light", "White"]].map(([v, l]) => `<button type="button" data-theme="${v}" aria-pressed="${s.theme === v}">${l}</button>`).join("")}</div></div>
      <label class="st-field is-wide">Photo shading · ${s.overlay}%<input type="range" min="10" max="92" data-k="overlay" value="${s.overlay}"></label>
      <label class="st-check"><input type="checkbox" data-k="showLogo"${s.showLogo ? " checked" : ""}> Logo</label>
      <label class="st-check"><input type="checkbox" data-k="showContact"${s.showContact ? " checked" : ""}> Phone and website</label>
    </div></section>
    <section class="st-sec"><h2>Caption <small>to paste with the post</small></h2><div class="st-grid">
      ${field("caption", "Caption", true, 5)}${field("tags", "Hashtags")}
      <div class="is-wide"><button class="st-btn is-small" type="button" data-copy-caption>Copy caption and hashtags</button></div>
    </div></section>`;
  }

  function thumbs() {
    controls.querySelectorAll("[data-thumb]").forEach((el) => {
      const id = el.dataset.thumb;
      const s = { ...state, ...LAYOUTS[id], layout: id, upload: state.upload && id === state.layout ? state.upload : "" };
      const f = FORMATS.square;
      const k = 100 / f.w;
      el.innerHTML = `<div style="transform:scale(${k});transform-origin:0 0;width:${f.w}px">${postHtml(s, "square")}</div>`;
      el.style.cssText = "display:block;width:100px;height:100px;overflow:hidden;border-radius:8px";
      fit(el);
    });
  }

  function draw() {
    stage.innerHTML = `<div class="st-scaler">${postHtml()}</div>`;
    const post = $(".pm", stage);
    const scaler = $(".st-scaler", stage);
    const k = Math.min(stage.clientWidth / post.offsetWidth, Math.max(420, window.innerHeight - 230) / post.offsetHeight, 1);
    scaler.style.transform = `scale(${k})`;
    scaler.style.width = `${post.offsetWidth}px`;
    stage.style.height = `${post.offsetHeight * k + 40}px`;
    fit(stage);
    const f = FORMATS[state.format];
    $("[data-meta]").textContent = `${LAYOUTS[state.layout].label} · ${f.label} ${f.w} × ${f.h} px · ${f.use}`;
    save();
  }

  function redraw() {
    controls.innerHTML = controlsHtml();
    draw();
    thumbs();
  }

  controls.addEventListener("input", (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    state[k] = e.target.type === "checkbox" ? e.target.checked : e.target.type === "range" ? Number(e.target.value) : e.target.value;
    if (k === "overlay") e.target.closest("label").firstChild.textContent = `Photo shading · ${state.overlay}%`;
    draw();
  });
  controls.addEventListener("click", async (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.format) state.format = t.dataset.format;
    else if (t.dataset.layout) {
      const { label, ...content } = LAYOUTS[t.dataset.layout];
      state = { ...state, ...content, layout: t.dataset.layout };
    } else if (t.dataset.photo) {
      state.photo = t.dataset.photo;
      state.upload = "";
    } else if (t.dataset.theme) state.theme = t.dataset.theme;
    else if (t.matches("[data-upload]")) return $("[data-upload-file]", controls).click();
    else if (t.matches("[data-unupload]")) state.upload = "";
    else if (t.matches("[data-copy-caption]")) {
      await navigator.clipboard.writeText(`${state.caption}\n\n${state.tags}`).catch(() => {});
      return toast("Caption and hashtags copied.");
    } else return;
    redraw();
  });
  controls.addEventListener("change", (e) => {
    if (!e.target.matches("[data-upload-file]") || !e.target.files[0]) return;
    const r = new FileReader();
    r.onload = () => {
      // Shrunk to a sensible size so exports stay quick.
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 2400 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        state.upload = c.toDataURL("image/jpeg", 0.9);
        redraw();
      };
      img.src = r.result;
    };
    r.readAsDataURL(e.target.files[0]);
  });

  /* ---------- Exports ---------- */

  const name = (format) => window.NCSExport.fileName([`NCS post ${LAYOUTS[state.layout].label}`, `${FORMATS[format].label} ${FORMATS[format].w}x${FORMATS[format].h}`], "png");

  async function exportOne(format = state.format) {
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-30000px;top:0";
    holder.innerHTML = postHtml(state, format);
    document.body.append(holder);
    fit(holder);
    const html = holder.innerHTML;
    holder.remove();
    const [canvas] = await window.NCSExport.pngOf({ html, selector: ".pm", scale: 1 });
    await window.NCSExport.png(canvas, name(format));
  }

  async function exportAll() {
    for (const f of SOCIAL) await exportOne(f);
    toast(`${SOCIAL.length} social sizes saved.`);
  }

  /* A PDF at the real print size (A5, A4), or at the picture's size for the rest. */
  async function exportPdf(format = state.format) {
    const f = FORMATS[format];
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-30000px;top:0";
    holder.innerHTML = postHtml(state, format);
    document.body.append(holder);
    fit(holder);
    const html = holder.innerHTML;
    holder.remove();
    const [canvas] = await window.NCSExport.pngOf({ html, selector: ".pm", scale: 1 });
    await window.NCSExport.load("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    const [w, h] = f.mm || [f.w * 0.75, f.h * 0.75];
    const pdf = new window.jspdf.jsPDF({ unit: f.mm ? "mm" : "pt", format: [w, h], orientation: w > h ? "landscape" : "portrait" });
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, w, h);
    pdf.setProperties({ title: `${LAYOUTS[state.layout].label}: ${state.headline || state.kicker || ""}`, author: "New Concept Security", creator: "New Concept Security admin" });
    window.NCSExport.save(pdf.output("blob"), name(format).replace(/\.png$/, ".pdf"));
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
    } catch (err) {
      console.error(err);
      toast("That image couldn't be prepared. Try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-export]");
    if (!b) return;
    if (b.dataset.export === "png") busy(b, () => exportOne());
    if (b.dataset.export === "all") busy(b, exportAll);
    if (b.dataset.export === "pdf") busy(b, () => exportPdf());
    if (b.dataset.export === "reset") {
      state = defaults();
      redraw();
    }
    b.closest("details")?.removeAttribute("open");
  });

  window.addEventListener("resize", draw);
  document.fonts?.ready.then(() => {
    draw();
    thumbs();
  });
  window.NCSPost = { html: postHtml, state: () => state, exportOne };
  redraw();
})();
