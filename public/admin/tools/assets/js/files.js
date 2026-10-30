/* New Concept Security: file tools. Merge, split, pictures to PDF, compress,
   page numbers, watermarks, picture resizing, QR codes and file names.
   Everything happens in the browser; no file leaves the computer.

   pdf-lib writes PDFs, pdf.js draws pages (for compressing), JSZip bundles
   several results into one download. There is deliberately no "redact"
   tool: a box drawn over words hides them on screen but leaves them in
   the file. */

(function () {
  const LIB = {
    pdflib: "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
    pdfjs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    worker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
    zip: "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
    qr: "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js",
  };
  const MM = 72 / 25.4;
  const A4 = [595.28, 841.89];
  const COMPANY = "New Concept Security";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const load = (src) => window.NCSExport.load(src);
  const pdfLib = async () => (await load(LIB.pdflib), window.PDFLib);
  const pdfJs = async () => {
    await load(LIB.pdfjs);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = LIB.worker;
    return window.pdfjsLib;
  };
  const size = (n) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);
  const stem = (name) => String(name).replace(/\.[^.]+$/, "");
  const ext = (name) => (String(name).match(/\.([^.]+)$/)?.[1] || "").toLowerCase();
  const isPdf = (f) => f.type === "application/pdf" || ext(f.name) === "pdf";
  const isImage = (f) => f.type.startsWith("image/");
  const name = (parts, e) => window.NCSExport.fileName(parts, e);
  const save = (blob, n) => window.NCSExport.save(blob, n);
  const pdfBlob = (bytes) => new Blob([bytes], { type: "application/pdf" });

  function toast(msg) {
    const t = Object.assign(document.createElement("div"), { className: "st-toast", textContent: msg });
    document.body.append(t);
    setTimeout(() => t.remove(), 3200);
  }

  /* Several results go out as one zip; a single one as itself. */
  async function deliver(outputs, zipName) {
    if (outputs.length === 1) return save(outputs[0].blob, outputs[0].name);
    await load(LIB.zip);
    const zip = new window.JSZip();
    const seen = new Set();
    for (const o of outputs) {
      let n = o.name;
      for (let i = 2; seen.has(n); i++) n = o.name.replace(/(\.[^.]+)$/, ` (${i})$1`);
      seen.add(n);
      zip.file(n, o.blob);
    }
    save(await zip.generateAsync({ type: "blob" }), zipName);
  }

  async function openPdf(file) {
    const { PDFDocument } = await pdfLib();
    try {
      return await PDFDocument.load(await file.arrayBuffer());
    } catch (e) {
      if (/encrypt/i.test(e.message)) throw new Error(`${file.name} is password protected. Remove the password first, then try again.`);
      throw new Error(`${file.name} could not be read as a PDF.`);
    }
  }

  /* Where a point on the page as you see it lands in the PDF's own
     coordinates, whatever the page's rotation. vx, vy from the bottom left. */
  function placer(page) {
    const { width: W, height: H } = page.getSize();
    const r = ((page.getRotation().angle % 360) + 360) % 360;
    const vw = r % 180 ? H : W;
    const vh = r % 180 ? W : H;
    const at = (vx, vy) =>
      r === 90 ? { x: W - vy, y: vx } : r === 180 ? { x: W - vx, y: H - vy } : r === 270 ? { x: vy, y: H - vx } : { x: vx, y: vy };
    return { vw, vh, r, at };
  }

  /* ---------- File picker with a re-orderable list ---------- */

  function picker(box, { accept, multiple = true, label, hint, filter, onChange }) {
    let files = [];
    box.innerHTML = `
      <label class="ft-drop" data-drop>
        <b>${esc(label)}</b><span>${esc(hint || "Drop files here or click to choose")}</span>
        <input type="file" accept="${accept}" ${multiple ? "multiple" : ""} hidden>
      </label>
      <ul class="ft-files" data-list></ul>`;
    const drop = $("[data-drop]", box);
    const input = $("input", box);
    const list = $("[data-list]", box);
    const add = (incoming) => {
      const ok = [...incoming].filter(filter);
      if (ok.length < incoming.length) toast("Some files were skipped: wrong type.");
      files = multiple ? files.concat(ok) : ok.slice(0, 1);
      draw();
    };
    const draw = () => {
      list.innerHTML = files
        .map((f, i) => {
          const thumb = isImage(f) ? `<img alt="" src="${URL.createObjectURL(f)}">` : `<span class="ft-icon">${esc(ext(f.name).toUpperCase() || "FILE")}</span>`;
          return `<li draggable="${multiple}" data-i="${i}">${multiple ? `<span class="ft-grip" title="Drag to reorder">⋮⋮</span>` : "<span></span>"}${thumb}
            <span><b>${esc(f.name)}</b></span><small>${size(f.size)}</small>
            <span>${multiple && i ? `<button type="button" data-up="${i}" title="Move up">↑</button>` : ""}<button type="button" data-rm="${i}" title="Remove">✕</button></span></li>`;
        })
        .join("");
      onChange?.(files);
    };
    input.addEventListener("change", () => (add(input.files), (input.value = "")));
    drop.addEventListener("dragover", (e) => (e.preventDefault(), drop.classList.add("is-over")));
    drop.addEventListener("dragleave", () => drop.classList.remove("is-over"));
    drop.addEventListener("drop", (e) => (e.preventDefault(), drop.classList.remove("is-over"), add(e.dataTransfer.files)));
    list.addEventListener("click", (e) => {
      const rm = e.target.closest("[data-rm]");
      const up = e.target.closest("[data-up]");
      if (rm) files.splice(+rm.dataset.rm, 1);
      if (up) {
        const i = +up.dataset.up;
        [files[i - 1], files[i]] = [files[i], files[i - 1]];
      }
      if (rm || up) draw();
    });
    let from = null;
    list.addEventListener("dragstart", (e) => {
      from = +e.target.closest("li").dataset.i;
      e.target.classList.add("is-drag");
    });
    list.addEventListener("dragover", (e) => e.preventDefault());
    list.addEventListener("drop", (e) => {
      e.preventDefault();
      const li = e.target.closest("li");
      if (from == null || !li) return;
      const [f] = files.splice(from, 1);
      files.splice(+li.dataset.i, 0, f);
      from = null;
      draw();
    });
    list.addEventListener("dragend", () => ((from = null), $$("li", list).forEach((l) => l.classList.remove("is-drag"))));
    return { get files() { return files; } };
  }

  const pdfPicker = (box, o = {}) => picker(box, { accept: "application/pdf,.pdf", filter: isPdf, label: o.multiple === false ? "Choose a PDF" : "Choose PDFs", ...o });
  const imagePicker = (box, o = {}) => picker(box, { accept: "image/*", filter: isImage, label: "Choose pictures", hint: "JPG, PNG, WebP or GIF. Drop them here or click to choose", ...o });

  /* Runs a tool's job with a busy button and plain errors. */
  function runner(main, job) {
    const btn = $("[data-run]", main);
    const status = $("[data-status]", main);
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      const label = btn.textContent;
      btn.textContent = "Working…";
      status.textContent = "";
      try {
        const msg = await job((s) => (status.textContent = s));
        status.textContent = msg || "Done.";
      } catch (e) {
        console.error(e);
        status.textContent = e.message || "That didn't work.";
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  const head = (title, lede) => `<h2>${esc(title)}</h2><p class="ft-lede">${lede}</p>`;
  const go = (label) => `<div class="ft-go"><button class="st-btn is-solid" type="button" data-run>${esc(label)}</button><span class="ft-status" data-status></span></div>`;
  const field = (labelText, inner, wide) => `<label class="st-field${wide ? " is-wide" : ""}">${esc(labelText)}${inner}</label>`;
  const select = (n, opts, v) => `<select name="${n}">${opts.map(([k, l]) => `<option value="${esc(k)}"${k === v ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  const val = (main, n) => $(`[name="${n}"]`, main)?.value ?? "";

  /* Page ranges like "1-3, 5, 8-" into groups of zero-based indexes. */
  function ranges(text, total) {
    const groups = [];
    for (const part of String(text).split(/[,;]+/).map((s) => s.trim()).filter(Boolean)) {
      const m = part.match(/^(\d*)\s*[-–]\s*(\d*)$/) || part.match(/^(\d+)$/);
      if (!m) throw new Error(`"${part}" isn't a page range. Use something like 1-3, 5, 8-12.`);
      const a = m[2] === undefined ? +m[1] : m[1] ? +m[1] : 1;
      const b = m[2] === undefined ? +m[1] : m[2] ? +m[2] : total;
      if (a < 1 || b > total || a > b) throw new Error(`Pages ${part} are outside 1 to ${total}.`);
      groups.push(Array.from({ length: b - a + 1 }, (_, i) => a - 1 + i));
    }
    if (!groups.length) throw new Error("Type the pages you want, like 1-3, 5.");
    return groups;
  }

  /* ---------- Tools ---------- */

  const TOOLS = [];
  const tool = (id, group, label, icon, render) => TOOLS.push({ id, group, label, icon, render });
  const I = {
    merge: '<path d="M6 4v6a4 4 0 0 0 4 4h8M18 14l-3-3m3 3-3 3M6 20v-2"/>',
    split: '<path d="M12 3v18M5 7l-2 2 2 2M19 13l2 2-2 2M3 9h6M15 15h6"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',
    compress: '<path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/>',
    number: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    mark: '<path d="M4 20 20 4M6 6h5M13 18h5"/>',
    resize: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    name: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  };

  tool("merge", "PDF", "Merge PDFs", I.merge, (main) => {
    main.innerHTML = `${head("Merge PDFs", "Join several PDFs into one, in the order shown. Drag to change the order.")}<div data-pick></div>
      <div class="ft-opts">${field("File name", `<input name="title" placeholder="e.g. Tender pack - Blackpool Council">`, true)}</div>${go("Merge and download")}`;
    const p = pdfPicker($("[data-pick]", main));
    runner(main, async (say) => {
      if (p.files.length < 2) throw new Error("Choose at least two PDFs.");
      const { PDFDocument } = await pdfLib();
      const out = await PDFDocument.create();
      let n = 0;
      for (const f of p.files) {
        say(`Adding ${f.name}…`);
        const doc = await openPdf(f);
        (await out.copyPages(doc, doc.getPageIndices())).forEach((pg) => (out.addPage(pg), n++));
      }
      out.setTitle(val(main, "title") || stem(p.files[0].name));
      out.setProducer(COMPANY);
      save(pdfBlob(await out.save()), name([val(main, "title") || `${stem(p.files[0].name)} merged`], "pdf"));
      return `Merged ${p.files.length} files, ${n} pages.`;
    });
  });

  tool("split", "PDF", "Split or extract pages", I.split, (main) => {
    main.innerHTML = `${head("Split or extract pages", "Save every page as its own file, split into ranges, or pull chosen pages into a new PDF. For reordering or deleting pages by eye, use the <a class=\"st-link\" href=\"../pdfjs/web/viewer.html\">PDF viewer</a>.")}<div data-pick></div>
      <div class="ft-opts">
        ${field("How", select("mode", [["each", "Every page as its own file"], ["ranges", "One file per range"], ["extract", "Chosen pages into one file"]], "each"))}
        ${field("Pages", `<input name="pages" placeholder="e.g. 1-3, 5, 8-">`)}
      </div><p class="ft-note" data-info>Choose a PDF to see its page count.</p>${go("Split and download")}`;
    let total = 0;
    const p = pdfPicker($("[data-pick]", main), {
      multiple: false,
      onChange: async (files) => {
        total = 0;
        if (!files[0]) return ($("[data-info]", main).textContent = "Choose a PDF to see its page count.");
        try {
          total = (await openPdf(files[0])).getPageCount();
          $("[data-info]", main).textContent = `${files[0].name} has ${total} page${total === 1 ? "" : "s"}.`;
        } catch (e) {
          $("[data-info]", main).textContent = e.message;
        }
      },
    });
    runner(main, async (say) => {
      const f = p.files[0];
      if (!f) throw new Error("Choose a PDF first.");
      const { PDFDocument } = await pdfLib();
      const src = await openPdf(f);
      total = src.getPageCount();
      const mode = val(main, "mode");
      const groups = mode === "each" ? src.getPageIndices().map((i) => [i]) : ranges(val(main, "pages"), total);
      const sets = mode === "extract" ? [groups.flat()] : groups;
      const outs = [];
      for (const idx of sets) {
        say(`Writing ${outs.length + 1} of ${sets.length}…`);
        const out = await PDFDocument.create();
        (await out.copyPages(src, idx)).forEach((pg) => out.addPage(pg));
        const label = idx.length === 1 ? `page ${idx[0] + 1}` : mode === "extract" ? "selected pages" : `pages ${idx[0] + 1}-${idx.at(-1) + 1}`;
        outs.push({ blob: pdfBlob(await out.save()), name: name([stem(f.name), label], "pdf") });
      }
      await deliver(outs, name([stem(f.name), "split"], "zip"));
      return outs.length === 1 ? "Saved one file." : `Saved ${outs.length} files in one zip.`;
    });
  });

  /* Draws a picture (any format the browser reads, turned upright) to JPEG or PNG bytes. */
  async function pictureBytes(file, { maxW = 0, maxH = 0, type = "image/jpeg", quality = 0.9 } = {}) {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    let w = bmp.width, h = bmp.height;
    const k = Math.min(1, maxW ? maxW / w : 1, maxH ? maxH / h : 1);
    w = Math.max(1, Math.round(w * k));
    h = Math.max(1, Math.round(h * k));
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    const ctx = c.getContext("2d");
    if (type === "image/jpeg") (ctx.fillStyle = "#fff"), ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    const blob = await new Promise((r) => c.toBlob(r, type, quality));
    return { blob, w, h };
  }

  tool("images", "PDF", "Pictures to PDF", I.image, (main) => {
    main.innerHTML = `${head("Pictures to PDF", "Turn photos or scans into one PDF, a picture per page. Drag to change the order. Phone photos are turned the right way up.")}<div data-pick></div>
      <div class="ft-opts">
        ${field("Page size", select("page", [["a4", "A4, turned to suit each picture"], ["a4p", "A4 portrait"], ["a4l", "A4 landscape"], ["fit", "Same size as the picture"]], "a4"))}
        ${field("Margin", select("margin", [["0", "None"], ["8", "Narrow (8 mm)"], ["15", "Normal (15 mm)"]], "8"))}
        ${field("Picture quality", select("quality", [["0.92", "High"], ["0.8", "Medium, smaller file"], ["0.65", "Low, smallest file"]], "0.92"))}
        ${field("File name", `<input name="title" placeholder="e.g. Site photos - Preston depot">`)}
      </div>${go("Make the PDF")}`;
    const p = imagePicker($("[data-pick]", main));
    runner(main, async (say) => {
      if (!p.files.length) throw new Error("Choose at least one picture.");
      const { PDFDocument } = await pdfLib();
      const out = await PDFDocument.create();
      const mode = val(main, "page");
      const margin = +val(main, "margin") * MM;
      const q = +val(main, "quality");
      for (const [i, f] of p.files.entries()) {
        say(`Adding ${i + 1} of ${p.files.length}…`);
        const png = f.type === "image/png" || f.type === "image/gif";
        const { blob, w, h } = await pictureBytes(f, { maxW: 3000, maxH: 3000, type: png ? "image/png" : "image/jpeg", quality: q });
        const bytes = await blob.arrayBuffer();
        const img = png ? await out.embedPng(bytes) : await out.embedJpg(bytes);
        let [pw, ph] = A4;
        if (mode === "a4l" || (mode === "a4" && w > h)) [pw, ph] = [A4[1], A4[0]];
        if (mode === "fit") [pw, ph] = [w * 0.75 + margin * 2, h * 0.75 + margin * 2];
        const page = out.addPage([pw, ph]);
        const k = Math.min((pw - margin * 2) / w, (ph - margin * 2) / h);
        page.drawImage(img, { x: (pw - w * k) / 2, y: (ph - h * k) / 2, width: w * k, height: h * k });
      }
      out.setTitle(val(main, "title") || stem(p.files[0].name));
      out.setProducer(COMPANY);
      const bytes = await out.save();
      save(pdfBlob(bytes), name([val(main, "title") || stem(p.files[0].name)], "pdf"));
      return `Made a ${p.files.length}-page PDF, ${size(bytes.length)}.`;
    });
  });

  tool("compress", "PDF", "Make a PDF smaller", I.compress, (main) => {
    main.innerHTML = `${head("Make a PDF smaller", "Re-draws each page as a picture at the quality you choose. Best for scans and photo-heavy PDFs that are too big to email.")}<div data-pick></div>
      <div class="ft-opts">
        ${field("Sharpness", select("dpi", [["150", "Sharp (150 dpi)"], ["110", "Balanced (110 dpi)"], ["80", "Small (80 dpi)"]], "110"))}
        ${field("Picture quality", select("quality", [["0.8", "High"], ["0.65", "Medium"], ["0.45", "Low"]], "0.65"))}
      </div>
      <p class="ft-note is-warn">The text in the smaller file becomes part of a picture: it can't be searched or copied, and links and form fields are lost. Keep the original.</p>
      <div class="ft-preview" data-preview></div>
      <div class="ft-result" data-result></div>
      ${go("Make it smaller")}`;
    let doc = null;
    const pickBox = $("[data-pick]", main);
    const p = pdfPicker(pickBox, { multiple: false, onChange: () => ((doc = null), preview()) });
    const opts = () => ({ scale: +val(main, "dpi") / 72, quality: +val(main, "quality") });
    async function pdfjsDoc() {
      if (!doc && p.files[0]) doc = await (await pdfJs()).getDocument({ data: new Uint8Array(await p.files[0].arrayBuffer()) }).promise;
      return doc;
    }
    async function renderPage(d, n, scale) {
      const page = await d.getPage(n);
      const vp = page.getViewport({ scale });
      const c = Object.assign(document.createElement("canvas"), { width: Math.ceil(vp.width), height: Math.ceil(vp.height) });
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      return { c, w: page.getViewport({ scale: 1 }).width, h: page.getViewport({ scale: 1 }).height };
    }
    let previewToken = 0;
    async function preview() {
      const box = $("[data-preview]", main);
      $("[data-result]", main).innerHTML = "";
      if (!p.files[0]) return (box.innerHTML = "");
      const token = ++previewToken;
      box.innerHTML = '<p class="ft-note">Drawing a preview of page 1…</p>';
      try {
        const d = await pdfjsDoc();
        const { scale, quality } = opts();
        const { c } = await renderPage(d, 1, scale);
        const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", quality));
        if (token !== previewToken) return;
        const est = (blob.size * d.numPages) + 2000;
        box.innerHTML = `<figure><figcaption>Page 1 at these settings, zoom in to check the small print</figcaption><img alt="Preview of page 1" src="${URL.createObjectURL(blob)}"></figure>
          <div class="ft-result" style="margin:0;align-content:start">
            <div class="ft-card"><span>Now</span><b>${size(p.files[0].size)}</b></div>
            <div class="ft-card"><span>About, after</span><b>${size(est)}</b></div>
            <div class="ft-card"><span>Pages</span><b>${d.numPages}</b></div>
          </div>`;
      } catch (e) {
        box.innerHTML = `<p class="ft-note is-warn">${esc(/password/i.test(e.message) ? "This PDF is password protected." : "This PDF couldn't be read.")}</p>`;
      }
    }
    $$("select", main).forEach((s) => s.addEventListener("change", preview));
    runner(main, async (say) => {
      const f = p.files[0];
      if (!f) throw new Error("Choose a PDF first.");
      const d = await pdfjsDoc();
      const { PDFDocument } = await pdfLib();
      const out = await PDFDocument.create();
      const { scale, quality } = opts();
      for (let n = 1; n <= d.numPages; n++) {
        say(`Page ${n} of ${d.numPages}…`);
        const { c, w, h } = await renderPage(d, n, scale);
        const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", quality));
        const img = await out.embedJpg(await blob.arrayBuffer());
        out.addPage([w, h]).drawImage(img, { x: 0, y: 0, width: w, height: h });
        c.width = c.height = 0;
      }
      out.setTitle(stem(f.name));
      out.setProducer(COMPANY);
      const bytes = await out.save();
      const smaller = bytes.length < f.size;
      $("[data-result]", main).innerHTML = `<div class="ft-card"><span>Before</span><b>${size(f.size)}</b></div><div class="ft-card"><span>After</span><b>${size(bytes.length)}</b></div><div class="ft-card"><span>Saved</span><b>${smaller ? Math.round((1 - bytes.length / f.size) * 100) + "%" : "nothing"}</b></div>`;
      if (!smaller) return "This one is already small: the new file would be bigger, so nothing was downloaded. Try lower settings.";
      save(pdfBlob(bytes), name([stem(f.name), "smaller"], "pdf"));
      return "Downloaded the smaller copy.";
    });
  });

  tool("numbers", "PDF", "Page numbers", I.number, (main) => {
    main.innerHTML = `${head("Page numbers", "Add page numbers to a PDF. They're placed by how each page looks, so turned pages are numbered the right way up.")}<div data-pick></div>
      <div class="ft-opts">
        ${field("Style", select("style", [["Page {n} of {t}", "Page 1 of 9"], ["{n} / {t}", "1 / 9"], ["{n}", "1"], ["Page {n}", "Page 1"]], "Page {n} of {t}"))}
        ${field("Where", select("pos", [["bc", "Bottom centre"], ["br", "Bottom right"], ["bl", "Bottom left"], ["tr", "Top right"]], "bc"))}
        ${field("Start counting at", `<input name="start" type="number" min="0" value="1">`)}
        ${field("Size", select("size", [["9", "Small"], ["10.5", "Medium"], ["13", "Large"]], "9"))}
        <label class="st-check is-wide"><input type="checkbox" name="skip"> Leave the first page (a cover) unnumbered</label>
        ${field("Prefix (optional)", `<input name="prefix" placeholder="e.g. NCS-Q-0042">`)}
      </div>${go("Add numbers and download")}`;
    const p = pdfPicker($("[data-pick]", main), { multiple: false });
    runner(main, async () => {
      const f = p.files[0];
      if (!f) throw new Error("Choose a PDF first.");
      const { StandardFonts, rgb, degrees } = await pdfLib();
      const doc = await openPdf(f);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const skip = $('[name="skip"]', main).checked;
      const start = +val(main, "start") || 0;
      const fs = +val(main, "size");
      const pos = val(main, "pos");
      const prefix = val(main, "prefix").trim();
      const counted = pages.length - (skip ? 1 : 0);
      pages.forEach((page, i) => {
        if (skip && i === 0) return;
        const n = start + i - (skip ? 1 : 0);
        const text = (prefix ? `${prefix}  ·  ` : "") + val(main, "style").replace("{n}", n).replace("{t}", start + counted - 1);
        const { vw, vh, r, at } = placer(page);
        const tw = font.widthOfTextAtSize(text, fs);
        const m = 28;
        const vx = pos === "bc" ? (vw - tw) / 2 : pos === "bl" ? m : vw - m - tw;
        const vy = pos === "tr" ? vh - m : m - fs / 2;
        page.drawText(text, { ...at(vx, vy), size: fs, font, color: rgb(0.35, 0.35, 0.37), rotate: degrees(r) });
      });
      save(pdfBlob(await doc.save()), name([stem(f.name), "numbered"], "pdf"));
      return `Numbered ${counted} pages.`;
    });
  });

  tool("watermark", "PDF", "Watermark", I.mark, (main) => {
    main.innerHTML = `${head("Watermark", "Mark every page as a draft, a copy or confidential before it's sent for review.")}<div data-pick></div>
      <div class="ft-opts">
        ${field("Words", select("word", [["DRAFT", "DRAFT"], ["CONFIDENTIAL", "CONFIDENTIAL"], ["COPY", "COPY"], ["NOT FOR CIRCULATION", "NOT FOR CIRCULATION"], ["SAMPLE", "SAMPLE"], ["custom", "Your own words…"]], "DRAFT"))}
        ${field("Your own words", `<input name="custom" maxlength="40" placeholder="e.g. FOR REVIEW">`)}
        ${field("Colour", select("colour", [["red", "Brand red"], ["grey", "Grey"]], "red"))}
        ${field("Strength", select("opacity", [["0.12", "Faint"], ["0.2", "Medium"], ["0.32", "Strong"]], "0.2"))}
        ${field("Angle", select("angle", [["45", "Diagonal"], ["0", "Straight across"]], "45"))}
      </div>
      <p class="ft-note">A watermark is a visible label. It doesn't stop anyone copying or editing the file.</p>
      ${go("Add watermark and download")}`;
    const p = pdfPicker($("[data-pick]", main), { multiple: false });
    runner(main, async () => {
      const f = p.files[0];
      if (!f) throw new Error("Choose a PDF first.");
      const word = (val(main, "word") === "custom" ? val(main, "custom").trim() : val(main, "word")).toUpperCase();
      if (!word) throw new Error("Type the words for the watermark.");
      const { StandardFonts, rgb, degrees } = await pdfLib();
      const doc = await openPdf(f);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const color = val(main, "colour") === "red" ? rgb(0.63, 0.06, 0.06) : rgb(0.45, 0.45, 0.47);
      const opacity = +val(main, "opacity");
      const a = +val(main, "angle");
      const rad = (a * Math.PI) / 180;
      for (const page of doc.getPages()) {
        const { vw, vh, r, at } = placer(page);
        const span = a ? Math.hypot(vw, vh) * 0.7 : vw * 0.8;
        const fs = Math.min(140, span / (font.widthOfTextAtSize(word, 1) || 1));
        const tw = font.widthOfTextAtSize(word, fs);
        const th = fs * 0.72;
        // Start of the baseline so the words sit centred on the page.
        const vx = vw / 2 - Math.cos(rad) * (tw / 2) + Math.sin(rad) * (th / 2);
        const vy = vh / 2 - Math.sin(rad) * (tw / 2) - Math.cos(rad) * (th / 2);
        page.drawText(word, { ...at(vx, vy), size: fs, font, color, opacity, rotate: degrees(r + a) });
      }
      save(pdfBlob(await doc.save()), name([stem(f.name), word.toLowerCase()], "pdf"));
      return `Marked ${doc.getPageCount()} pages "${word}".`;
    });
  });

  tool("resize", "Pictures", "Resize and convert pictures", I.resize, (main) => {
    main.innerHTML = `${head("Resize and convert pictures", "Shrink photos for email or the website, or change their format. Several at once come back in one zip.")}<div data-pick></div>
      <div class="ft-opts">
        ${field("Longest side", select("max", [["0", "Keep the size"], ["2400", "2400 px (print)"], ["1600", "1600 px (website)"], ["1200", "1200 px (email)"], ["800", "800 px (small)"]], "1600"))}
        ${field("Format", select("type", [["image/jpeg", "JPG (photos)"], ["image/png", "PNG (logos, screenshots)"], ["image/webp", "WebP (website)"]], "image/jpeg"))}
        ${field("Quality", select("quality", [["0.9", "High"], ["0.78", "Medium"], ["0.6", "Low"]], "0.78"))}
        ${field("Name them", `<input name="base" placeholder="Keep their names, or e.g. Preston depot">`)}
      </div>
      <div class="ft-result" data-result></div>${go("Convert and download")}`;
    const p = imagePicker($("[data-pick]", main));
    runner(main, async (say) => {
      if (!p.files.length) throw new Error("Choose at least one picture.");
      const type = val(main, "type");
      const e = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[type];
      const max = +val(main, "max");
      const base = val(main, "base").trim();
      const outs = [];
      let before = 0, after = 0;
      for (const [i, f] of p.files.entries()) {
        say(`Picture ${i + 1} of ${p.files.length}…`);
        const { blob } = await pictureBytes(f, { maxW: max, maxH: max, type, quality: +val(main, "quality") });
        before += f.size;
        after += blob.size;
        outs.push({ blob, name: name([base ? `${base} ${String(i + 1).padStart(2, "0")}` : stem(f.name)], e) });
      }
      $("[data-result]", main).innerHTML = `<div class="ft-card"><span>Before</span><b>${size(before)}</b></div><div class="ft-card"><span>After</span><b>${size(after)}</b></div>`;
      await deliver(outs, name([base || "Pictures", "resized"], "zip"));
      return outs.length === 1 ? "Downloaded." : `Downloaded ${outs.length} pictures in one zip.`;
    });
  });

  tool("qr", "Make", "QR code", I.qr, (main) => {
    main.innerHTML = `${head("QR code", "For signs, flyers, letters and business cards. Test it with a phone before printing. For links you want to track, make a campaign link in Website Insights first.")}
      <div class="ft-qr"><div>
        <div class="ft-opts" style="margin:0">
          ${field("What it opens", select("kind", [["url", "A web page"], ["tel", "A phone call"], ["mail", "An email"], ["text", "Plain text"], ["wifi", "Wi-Fi details"]], "url"))}
          ${field("Error tolerance", select("ec", [["M", "Normal"], ["Q", "Higher"], ["H", "Highest (for rough surfaces)"]], "M"))}
          <div class="is-wide" data-inputs></div>
          ${field("Colour", select("ink", [["#000000", "Black"], ["#a01010", "Brand red"], ["#1d1d1f", "Charcoal"]], "#000000"))}
          ${field("PNG size", select("px", [["600", "600 px"], ["1200", "1200 px (print)"], ["2400", "2400 px (signs)"]], "1200"))}
          ${field("Label under it (optional)", `<input name="label" placeholder="e.g. Scan to call the control room">`, true)}
        </div>
      </div>
      <div class="ft-qr-out"><div data-qr></div><small class="ft-status" data-what></small>
        <div class="ft-go" style="margin:0"><button class="st-btn is-solid" type="button" data-png>PNG</button><button class="st-btn" type="button" data-svg>SVG</button></div></div></div>`;
    const INPUTS = {
      url: `${field("Web address", `<input name="v1" value="https://www.newconceptsecurity.co.uk">`)}`,
      tel: `${field("Phone number", `<input name="v1" value="01253 982211">`)}`,
      mail: `<div class="st-grid">${field("Email address", `<input name="v1" type="email" placeholder="name@company.co.uk">`)}${field("Subject", `<input name="v2" placeholder="Enquiry">`)}</div>`,
      text: `${field("Text", `<textarea name="v1" rows="3"></textarea>`)}`,
      wifi: `<div class="st-grid">${field("Network name", `<input name="v1">`)}${field("Password", `<input name="v2">`)}</div><p class="ft-note">Anyone who scans it gets the password. Use it for guest networks only.</p>`,
    };
    let svg = "", content = "";
    const kindChange = () => (($("[data-inputs]", main).innerHTML = INPUTS[val(main, "kind")]), draw());
    function data() {
      const k = val(main, "kind"), v1 = val(main, "v1").trim(), v2 = val(main, "v2").trim();
      const wifiEsc = (s) => s.replace(/([\\;,:"])/g, "\\$1");
      if (!v1) return "";
      if (k === "url") return /^[a-z]+:/i.test(v1) ? v1 : `https://${v1}`;
      if (k === "tel") return `tel:${v1.replace(/[^\d+]/g, "")}`;
      if (k === "mail") return `mailto:${v1}${v2 ? `?subject=${encodeURIComponent(v2)}` : ""}`;
      if (k === "wifi") return `WIFI:T:${v2 ? "WPA" : "nopass"};S:${wifiEsc(v1)};${v2 ? `P:${wifiEsc(v2)};` : ""};`;
      return v1;
    }
    async function draw() {
      await load(LIB.qr);
      content = data();
      const out = $("[data-qr]", main);
      if (!out) return; // Switched to another tool while the library loaded.
      if (!content) return ((svg = ""), (out.innerHTML = '<p class="ft-note">Fill in the details.</p>'), ($("[data-what]", main).textContent = ""));
      const qr = window.qrcode(0, val(main, "ec"));
      qr.addData(unescape(encodeURIComponent(content)));
      qr.make();
      const n = qr.getModuleCount(), q = 4, s = n + q * 2;
      let path = "";
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c + q} ${r + q}h1v1h-1z`;
      const label = val(main, "label").trim();
      const lh = label ? 4 : 0;
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s + lh}" shape-rendering="crispEdges"><rect width="${s}" height="${s + lh}" fill="#fff"/><path d="${path}" fill="${val(main, "ink")}"/>${label ? `<text x="${s / 2}" y="${s + 1.2}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="2.4" font-weight="600" fill="#1d1d1f">${esc(label)}</text>` : ""}</svg>`;
      out.innerHTML = svg;
      $("[data-what]", main).textContent = content.length > 60 ? content.slice(0, 60) + "…" : content;
    }
    main.addEventListener("input", (e) => e.target.name !== "kind" && draw());
    $('[name="kind"]', main).addEventListener("change", kindChange);
    $("[data-svg]", main).addEventListener("click", () => svg && save(new Blob([svg], { type: "image/svg+xml" }), name(["QR code", val(main, "label") || val(main, "kind")], "svg")));
    $("[data-png]", main).addEventListener("click", async () => {
      if (!svg) return;
      const img = new Image();
      img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      await img.decode();
      const px = +val(main, "px");
      const c = Object.assign(document.createElement("canvas"), { width: px, height: Math.round((px * img.height) / img.width) });
      const ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => save(b, name(["QR code", val(main, "label") || val(main, "kind")], "png")), "image/png");
    });
    kindChange();
  });

  tool("names", "Make", "File names", I.name, (main) => {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    main.innerHTML = `${head("File names", "One naming pattern for the whole office, so files sort by date and say what they are. Copy a name, or drop files to rename them all at once.")}
      <div class="ft-opts" style="margin-top:0">
        ${field("Date", `<input name="date" type="date" value="${today}">`)}
        ${field("Client or site", `<input name="client" placeholder="e.g. Blackpool Council">`)}
        ${field("What it is", select("type", ["Proposal", "Quotation", "Letter", "Report", "Invoice", "Contract", "Site survey", "Risk assessment", "Meeting minutes", "Photos", "Other"].map((x) => [x, x]), "Proposal"))}
        ${field("Reference (optional)", `<input name="ref" placeholder="e.g. Q-0042">`)}
        ${field("Version", `<input name="ver" type="number" min="1" value="1">`)}
        ${field("Status", select("status", [["Draft", "Draft"], ["Reviewed", "Reviewed"], ["Final", "Final"], ["", "None"]], "Draft"))}
      </div>
      <div class="ft-name" data-name></div>
      <div class="ft-go"><button class="st-btn" type="button" data-copy>Copy name</button></div>
      <h3 style="margin:28px 0 10px;font-size:15px">Rename files</h3><div data-pick></div>${go("Rename and download")}`;
    const parts = () => [val(main, "date"), val(main, "client"), val(main, "type"), val(main, "ref"), `v${val(main, "ver") || 1}`, val(main, "status")];
    const show = () => ($("[data-name]", main).textContent = name(parts(), "pdf").replace(/\.pdf$/, ""));
    main.addEventListener("input", show);
    show();
    $("[data-copy]", main).addEventListener("click", async () => {
      await navigator.clipboard.writeText($("[data-name]", main).textContent);
      toast("Copied.");
    });
    const p = picker($("[data-pick]", main), { accept: "*/*", filter: () => true, label: "Choose files to rename", hint: "Any kind of file. Each gets the name above, numbered if there are several" });
    runner(main, async () => {
      if (!p.files.length) throw new Error("Choose some files first.");
      const many = p.files.length > 1;
      const outs = p.files.map((f, i) => {
        const pp = parts();
        if (many) pp.splice(3, 0, String(i + 1).padStart(2, "0"));
        return { blob: f, name: name(pp, ext(f.name) || "bin") };
      });
      await deliver(outs, name(parts(), "zip"));
      return many ? `Renamed ${outs.length} files into one zip.` : "Downloaded with the new name.";
    });
  });

  /* ---------- Navigation ---------- */

  const nav = $("[data-nav]");
  const main = $("[data-main]");
  let group = "";
  nav.innerHTML =
    TOOLS.map((t) => {
      const h = t.group !== group ? `<h2>${esc((group = t.group))}</h2>` : "";
      return `${h}<button type="button" data-tool="${t.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>${esc(t.label)}</button>`;
    }).join("") +
    `<p class="ft-note" style="margin:16px 4px 0">There's no redaction tool here on purpose. Covering words in a PDF hides them on screen but leaves them in the file. Remove them in the original document, then export it again.</p>`;

  function open(id) {
    const t = TOOLS.find((x) => x.id === id) || TOOLS[0];
    $$("[data-tool]", nav).forEach((b) => b.setAttribute("aria-current", String(b.dataset.tool === t.id)));
    t.render(main);
    if (location.hash.slice(1) !== t.id) history.replaceState(null, "", `#${t.id}`);
  }
  nav.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tool]");
    if (b) open(b.dataset.tool);
  });
  window.addEventListener("hashchange", () => open(location.hash.slice(1)));
  open(location.hash.slice(1));
})();
