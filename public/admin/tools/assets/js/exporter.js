/* New Concept Security: the export engine shared by the document makers and
   the design kit. What it does beyond a plain screenshot:

   - Page breaks fall between lines, rows and blocks, never through them;
     long documents get a slim footer with the number and "Page 2 of 3".
   - Every PDF carries an invisible text layer laid exactly over the words,
     so the text can be searched, selected and copied, and read by screen
     readers and accounting software.
   - Links (website, email, the payment link) stay clickable in the PDF.
   - Pictures are drawn at about 290 dpi; the PDF's title, author, subject
     and keywords are filled in; file names say what the file is.

   Loaded as a plain script; everything hangs off window.NCSExport. */

(function () {
  const LIBS = {
    canvas: "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
    pdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  };
  const loaded = {};
  function load(src) {
    return (loaded[src] ??= new Promise((resolve, reject) => {
      const s = Object.assign(document.createElement("script"), { src, onload: resolve, onerror: reject });
      document.head.append(s);
    }));
  }
  const libs = () => Promise.all([load(LIBS.canvas), load(LIBS.pdf)]);

  /* Puts the HTML off screen at its real size, and waits for fonts and pictures. */
  async function mount(html) {
    const holder = document.createElement("div");
    holder.setAttribute("aria-hidden", "true");
    holder.style.cssText = "position:fixed;left:-30000px;top:0;pointer-events:none;";
    holder.innerHTML = html;
    document.body.append(holder);
    await document.fonts?.ready;
    await Promise.all([...holder.querySelectorAll("img")].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
    return holder;
  }

  const capture = (el, scale) => window.html2canvas(el, { scale, backgroundColor: "#ffffff", useCORS: true, logging: false });

  /* ---------- Page breaks ---------- */

  /* Things a page must never cut through. */
  const ATOMIC = "tr, p, li, h1, h2, h3, h4, dt, dd, img, svg, blockquote, figure, .doc-sum, .doc-sign, .doc-stamp, .doc-pay, .doc-qr, .doc-parties > *, .doc-notes > *, .doc-vat, .doc-col-side > *";

  function blocks(el) {
    const top = el.getBoundingClientRect().top;
    return [...el.querySelectorAll(ATOMIC)]
      .map((n) => n.getBoundingClientRect())
      .filter((r) => r.height > 0 && r.height < 900)
      .map((r) => [r.top - top, r.bottom - top]);
  }

  /* Splits a tall element into page slices [from, to] in CSS pixels. */
  function slices(el, firstRoom, nextRoom) {
    const total = el.scrollHeight;
    if (total <= firstRoom + 2) return [[0, total]];
    const spans = blocks(el);
    const cuts = [...new Set(spans.flat().map(Math.round))].sort((a, b) => a - b);
    const clear = (y) => !spans.some(([a, b]) => a < y - 1 && b > y + 1);
    const out = [];
    let from = 0;
    while (from < total - 2) {
      const room = out.length ? nextRoom : firstRoom;
      if (total - from <= room) {
        out.push([from, total]);
        break;
      }
      const limit = from + room;
      const best = cuts.filter((c) => c > from + room * 0.35 && c <= limit && clear(c)).pop();
      const to = best ?? limit;
      out.push([from, to]);
      from = to;
    }
    return out;
  }

  /* ---------- Text and links ---------- */

  const SKIP = new Set(["SCRIPT", "STYLE", "TEXT", "TSPAN", "SVG"]);

  /* Writes each word, invisibly, where it sits on the page. `place(y)` turns
     a CSS y inside the element into a page index and a y on that page, or
     null when the word falls in a gap between pages. */
  function textLayer(pdf, el, k, place, xOff = 0) {
    const origin = el.getBoundingClientRect();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (!n.data.trim() || n.parentElement?.closest("svg") || SKIP.has(n.parentElement?.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const range = document.createRange();
    let page = -1;
    pdf.setFont("helvetica", "normal");
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const size = parseFloat(getComputedStyle(node.parentElement).fontSize) || 12;
      for (const m of node.data.matchAll(/\S+/g)) {
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        const r = range.getClientRects()[0];
        if (!r || !r.width) continue;
        const spot = place(r.top - origin.top + r.height * 0.8);
        if (!spot) continue;
        if (spot.page !== page) {
          pdf.setPage(spot.page + 1);
          page = spot.page;
        }
        const pt = size * k;
        pdf.setFontSize(pt);
        // Stretch the word to the width it has on the page, so a selection
        // covers it exactly; letter spacing would break words apart on copy.
        const natural = pdf.getTextWidth(m[0]) || 1;
        const stretch = Math.max(0.4, Math.min(2.5, (r.width * k) / natural));
        pdf.text(`${m[0]} `, xOff + (r.left - origin.left) * k, spot.y * k, { renderingMode: "invisible", horizontalScale: stretch });
      }
    }
  }

  function linkLayer(pdf, el, k, place, xOff = 0) {
    const origin = el.getBoundingClientRect();
    el.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!/^(https?:|mailto:|tel:)/i.test(href)) return;
      const r = a.getBoundingClientRect();
      const spot = place(r.top - origin.top);
      if (!spot || !r.width) return;
      pdf.setPage(spot.page + 1);
      pdf.link(xOff + (r.left - origin.left) * k, spot.y * k, r.width * k, r.height * k, { url: href });
    });
  }

  /* ---------- Files ---------- */

  /* "INV-0001 - Blackpool Council - New Concept Security.pdf" */
  function fileName(parts, ext) {
    const clean = parts
      .filter((p) => p && String(p).trim())
      .map((p) => String(p).replace(/[\\/:*?"<>|#%&{}$!'@+`=]+/g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean);
    return `${clean.join(" - ").slice(0, 150) || "New Concept Security"}.${ext}`;
  }

  function save(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function meta(pdf, m = {}) {
    pdf.setProperties({
      title: m.title || "",
      subject: m.subject || "",
      author: m.author || "New Concept Security",
      keywords: m.keywords || "New Concept Security",
      creator: "New Concept Security admin",
    });
  }

  /* ---------- Documents: one tall page, split ---------- */

  /* html: the document at its printed width; pt: the page [w, h] in points.
     fit: true makes one page as tall as the content (an 80 mm till roll).
     footer: the text on the left of the page footer. */
  async function documentPdf({ html, selector, pt, fit = false, footer = "", meta: info, scale = 3 }) {
    await libs();
    const holder = await mount(html);
    const el = holder.querySelector(selector) || holder.firstElementChild;
    try {
      const k = pt[0] / el.offsetWidth;
      const pageCss = pt[1] / k;
      const canvas = await capture(el, scale);
      const s = canvas.width / el.offsetWidth;
      const FOOT = 30;
      const TOP = 36;
      const total = el.scrollHeight;
      // A page that runs over by a line or two is shrunk to fit, not split.
      if (!fit && total > pageCss + 2 && total <= pageCss * 1.1) {
        const q = pageCss / total;
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: "pt", format: pt, orientation: pt[0] > pt[1] ? "landscape" : "portrait", compress: true });
        const xOff = (pt[0] * (1 - q)) / 2;
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.9), "JPEG", xOff, 0, pt[0] * q, pt[1], undefined, "FAST");
        const place = (y) => ({ page: 0, y });
        textLayer(pdf, el, k * q, place, xOff);
        linkLayer(pdf, el, k * q, place, xOff);
        meta(pdf, info);
        return { pdf, blob: pdf.output("blob"), pages: 1, canvas };
      }
      const multi = !fit && total > pageCss + 2;
      const parts = fit ? [[0, total]] : slices(el, multi ? pageCss - FOOT : pageCss, pageCss - TOP - FOOT);
      const pageH = fit ? total : pageCss;
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "pt", format: [pt[0], pageH * k], orientation: pt[0] > pageH * k ? "landscape" : "portrait", compress: true });
      parts.forEach(([from, to], i) => {
        if (i) pdf.addPage([pt[0], pageH * k], pt[0] > pageH * k ? "landscape" : "portrait");
        const off = i ? TOP : 0;
        const c = document.createElement("canvas");
        c.width = canvas.width;
        c.height = Math.round(pageH * s);
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(canvas, 0, Math.round(from * s), canvas.width, Math.round((to - from) * s), 0, Math.round(off * s), canvas.width, Math.round((to - from) * s));
        pdf.addImage(c.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, pt[0], pageH * k, undefined, "FAST");
        if (multi) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7.5);
          pdf.setTextColor(134, 134, 139);
          const y = pageH * k - 16;
          if (footer) pdf.text(footer, 28, y);
          pdf.text(`Page ${i + 1} of ${parts.length}`, pt[0] - 28, y, { align: "right" });
          pdf.setTextColor(0, 0, 0);
        }
      });
      const place = (y) => {
        const i = parts.findIndex(([a, b]) => y >= a && y < b);
        return i < 0 ? null : { page: i, y: y - parts[i][0] + (i ? TOP : 0) };
      };
      textLayer(pdf, el, k, place);
      linkLayer(pdf, el, k, place);
      meta(pdf, info);
      return { pdf, blob: pdf.output("blob"), pages: parts.length, canvas };
    } finally {
      holder.remove();
    }
  }

  /* ---------- Cards and signs: one element per page ---------- */

  async function pagesPdf({ html, selector, pt, meta: info, scale = 3 }) {
    await libs();
    const holder = await mount(html);
    const els = [...holder.querySelectorAll(selector)];
    try {
      const { jsPDF } = window.jspdf;
      const orientation = pt[0] > pt[1] ? "landscape" : "portrait";
      const pdf = new jsPDF({ unit: "pt", format: pt, orientation, compress: true });
      const canvases = [];
      for (const [i, el] of els.entries()) {
        const canvas = await capture(el, scale);
        canvases.push(canvas);
        if (i) pdf.addPage(pt, orientation);
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, pt[0], pt[1], undefined, "FAST");
      }
      els.forEach((el, i) => {
        const k = pt[0] / el.offsetWidth;
        const place = (y) => ({ page: i, y });
        textLayer(pdf, el, k, place);
        linkLayer(pdf, el, k, place);
      });
      meta(pdf, info);
      return { pdf, blob: pdf.output("blob"), pages: els.length, canvases };
    } finally {
      holder.remove();
    }
  }

  /* PNG of one canvas, or several side by side. */
  function png(canvases, name) {
    const list = Array.isArray(canvases) ? canvases : [canvases];
    let canvas = list[0];
    if (list.length > 1) {
      const gap = Math.round(list[0].width * 0.06);
      canvas = document.createElement("canvas");
      canvas.width = list.reduce((a, c) => a + c.width, 0) + gap * (list.length - 1);
      canvas.height = Math.max(...list.map((c) => c.height));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      let x = 0;
      list.forEach((c) => {
        ctx.drawImage(c, x, 0);
        x += c.width + gap;
      });
    }
    return new Promise((resolve) => canvas.toBlob((blob) => (save(blob, name), resolve(blob)), "image/png"));
  }

  async function pngOf({ html, selector, scale = 3 }) {
    await load(LIBS.canvas);
    const holder = await mount(html);
    try {
      return await Promise.all([...holder.querySelectorAll(selector)].map((el) => capture(el, scale)));
    } finally {
      holder.remove();
    }
  }

  /* Shares a file through the device's share sheet where it can (phones,
     Windows, macOS); says false when it can't, so the caller can download. */
  async function share(blob, name, { title = "", text = "" } = {}) {
    try {
      const file = new File([blob], name, { type: blob.type });
      if (!navigator.canShare?.({ files: [file] })) return false;
      await navigator.share({ files: [file], title, text });
      return true;
    } catch (e) {
      return e?.name === "AbortError";
    }
  }

  window.NCSExport = { documentPdf, pagesPdf, pngOf, png, save, share, fileName, load };
})();
