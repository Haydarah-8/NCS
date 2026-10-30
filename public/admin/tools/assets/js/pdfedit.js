/* New Concept Security: the PDF editor. Everything happens in the browser;
   no file leaves the computer.

   pdf.js draws the pages; pdf-lib writes the result. Pages can be reordered
   (drag the thumbnails), rotated, duplicated, deleted, added blank, merged
   from other PDFs and extracted. On a page: text, highlight, box, line,
   freehand pen, white-out, signature (drawn or typed), image and stamps.
   A PDF's own form fields can be filled in. Marks are kept in points from
   the top left of the page as it is shown, and turned into the PDF's own
   coordinates when it is saved, whatever the page's rotation. */

(function () {
  const LIB = {
    pdfjs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    worker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
    pdflib: "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
  };
  const A4 = [595.28, 841.89];
  const COLORS = ["#1D1D1F", "#A01010", "#005EB8", "#00843D", "#FFD100", "#FFFFFF"];
  const STAMPS = ["PAID", "APPROVED", "RECEIVED", "COMPLETED", "DRAFT", "CONFIDENTIAL", "COPY", "VOID"];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const uid = () => Math.random().toString(36).slice(2, 10);

  /* ---------- State ---------- */

  const sources = []; // { name, bytes, doc (pdf.js) }
  let pages = []; // { id, src, index, rot (total), w, h (unrotated points), extra }
  let marks = {}; // page id -> [mark]
  let fields = []; // { name, type, value, options, src }
  let tool = "select";
  let style = { color: "#1D1D1F", size: 14, width: 2, bold: false, font: "Helvetica" };
  let zoom = 1;
  let selected = null; // { page, id }
  let picked = new Set(); // page ids ticked for extract or delete
  let history = [];
  let future = [];
  let docName = "document";
  let pendingImage = null;

  const snapshot = () => JSON.stringify({ pages, marks, fields });
  function remember() {
    history.push(snapshot());
    if (history.length > 80) history.shift();
    future = [];
    syncButtons();
  }
  function restore(snap) {
    const s = JSON.parse(snap);
    pages = s.pages;
    marks = s.marks;
    fields = s.fields;
    selected = null;
    renderAll();
  }
  function undo() {
    if (!history.length) return;
    future.push(snapshot());
    restore(history.pop());
  }
  function redo() {
    if (!future.length) return;
    history.push(snapshot());
    restore(future.pop());
  }

  /* ---------- Loading ---------- */

  const loaded = {};
  const load = (src) => (loaded[src] ??= new Promise((ok, no) => document.head.append(Object.assign(document.createElement("script"), { src, onload: ok, onerror: no }))));
  async function libs() {
    await Promise.all([load(LIB.pdfjs), load(LIB.pdflib)]);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = LIB.worker;
  }

  async function addFile(file, at = pages.length) {
    await libs();
    const bytes = await file.arrayBuffer();
    const doc = await window.pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    const src = sources.push({ name: file.name, bytes, doc }) - 1;
    const added = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const p = await doc.getPage(i);
      const [x0, y0, x1, y1] = p.view;
      added.push({ id: uid(), src, index: i - 1, rot: p.rotate % 360, orig: p.rotate % 360, w: x1 - x0, h: y1 - y0 });
    }
    pages.splice(at, 0, ...added);
    if (!sources.slice(0, -1).length) docName = file.name.replace(/\.pdf$/i, "");
    await readFields(src, bytes);
    return added.length;
  }

  async function readFields(src, bytes) {
    try {
      const pdf = await window.PDFLib.PDFDocument.load(bytes.slice(0), { ignoreEncryption: true });
      const form = pdf.getForm();
      const L = window.PDFLib;
      // Types by instanceof: the library's class names are minified.
      const typeOf = (f) =>
        f instanceof L.PDFTextField ? "PDFTextField" : f instanceof L.PDFCheckBox ? "PDFCheckBox" : f instanceof L.PDFDropdown ? "PDFDropdown" : f instanceof L.PDFOptionList ? "PDFOptionList" : f instanceof L.PDFRadioGroup ? "PDFRadioGroup" : "other";
      form.getFields().forEach((f) => {
        const type = typeOf(f);
        const entry = { src, name: f.getName(), type, value: "" };
        if (type === "PDFTextField") entry.value = f.getText() || "";
        else if (type === "PDFCheckBox") entry.value = f.isChecked();
        else if (type === "PDFDropdown" || type === "PDFOptionList") {
          entry.options = f.getOptions();
          entry.value = f.getSelected()[0] || "";
        } else if (type === "PDFRadioGroup") {
          entry.options = f.getOptions();
          entry.value = f.getSelected() || "";
        } else return;
        fields.push(entry);
      });
    } catch {}
  }

  function blankPage(at = pages.length, size = A4) {
    pages.splice(at, 0, { id: uid(), src: -1, index: 0, rot: 0, orig: 0, w: size[0], h: size[1] });
  }

  /* ---------- Geometry ---------- */

  const shown = (p) => (p.rot % 180 ? [p.h, p.w] : [p.w, p.h]);

  /* A point on the page as shown (x right, y down, points) to the PDF's own
     coordinates (x right, y up, on the unrotated page). */
  function toPdf(p, dx, dy) {
    switch (p.rot) {
      case 90:
        return [dy, dx];
      case 180:
        return [p.w - dx, dy];
      case 270:
        return [p.w - dy, p.h - dx];
      default:
        return [dx, p.h - dy];
    }
  }

  /* ---------- Drawing the editor ---------- */

  const viewer = $("[data-viewer]");
  const thumbs = $("[data-thumbs]");

  const rendering = new Map();
  async function paint(canvas, p, scale) {
    const key = `${p.id}:${p.rot}:${scale}`;
    if (canvas.dataset.key === key) return;
    canvas.dataset.key = key;
    const [W, H] = shown(p);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * scale * ratio);
    canvas.height = Math.round(H * scale * ratio);
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (p.src < 0) return;
    rendering.get(canvas)?.cancel();
    const page = await sources[p.src].doc.getPage(p.index + 1);
    const task = page.render({ canvasContext: ctx, viewport: page.getViewport({ scale: scale * ratio, rotation: p.rot }) });
    rendering.set(canvas, task);
    await task.promise.catch(() => {});
  }

  function renderAll() {
    renderThumbs();
    renderPages();
    renderSide();
    syncButtons();
  }

  function renderThumbs() {
    thumbs.innerHTML = pages
      .map(
        (p, i) => `<div class="pe-thumb${picked.has(p.id) ? " is-picked" : ""}" draggable="true" data-thumb="${p.id}">
      <canvas></canvas><span class="pe-num">${i + 1}</span>
      <label class="pe-pick" title="Select page"><input type="checkbox" data-pick="${p.id}"${picked.has(p.id) ? " checked" : ""}></label>
      <div class="pe-thumb-tools"><button type="button" data-rot="${p.id}" title="Rotate">⟳</button><button type="button" data-dup="${p.id}" title="Duplicate">⧉</button><button type="button" data-del="${p.id}" title="Delete">✕</button></div></div>`,
      )
      .join("");
    $$(".pe-thumb", thumbs).forEach((el, i) => {
      const p = pages[i];
      const [W] = shown(p);
      paint($("canvas", el), p, 118 / W);
    });
  }

  function renderPages() {
    if (!pages.length) {
      viewer.innerHTML = `<div class="pe-empty" data-drop><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M12 11v6M9 14l3-3 3 3"/></svg><b>Open a PDF to edit</b><span>Drop it here, or choose a file. It stays on this computer.</span><div class="pe-empty-actions"><button class="st-btn is-solid" type="button" data-open>Choose a PDF</button><button class="st-btn" type="button" data-blank>Start with a blank page</button></div></div>`;
      return;
    }
    const width = Math.max(320, viewer.clientWidth - 48);
    viewer.innerHTML = pages.map((p, i) => `<div class="pe-page" data-page="${p.id}"><canvas></canvas><div class="pe-layer" data-layer="${p.id}"></div><span class="pe-page-num">${i + 1} / ${pages.length}</span></div>`).join("");
    $$(".pe-page", viewer).forEach((el, i) => {
      const p = pages[i];
      const [W, H] = shown(p);
      const scale = (width / Math.max(...pages.map((q) => shown(q)[0]))) * zoom;
      el.style.width = `${W * scale}px`;
      el.style.height = `${H * scale}px`;
      el.dataset.scale = scale;
      paint($("canvas", el), p, scale);
      drawMarks(p.id);
    });
  }

  const scaleOf = (pid) => Number($(`[data-page="${pid}"]`, viewer)?.dataset.scale || 1);

  function drawMarks(pid) {
    const layer = $(`[data-layer="${pid}"]`, viewer);
    if (!layer) return;
    const k = scaleOf(pid);
    layer.innerHTML = (marks[pid] || []).map((m) => markHtml(m, k, selected?.page === pid && selected.id === m.id)).join("");
  }

  function markHtml(m, k, isSel) {
    const box = `left:${m.x * k}px;top:${m.y * k}px;width:${m.w * k}px;height:${m.h * k}px`;
    const sel = isSel ? " is-selected" : "";
    const handle = isSel ? '<i class="pe-handle" data-handle></i>' : "";
    switch (m.type) {
      case "text":
        return `<div class="pe-mark pe-text${sel}" data-mark="${m.id}" style="${box};color:${m.color};font-size:${m.size * k}px;font-weight:${m.bold ? 700 : 400};font-family:${m.font === "Times-Roman" ? "Times New Roman, serif" : m.font === "Courier" ? "Courier New, monospace" : "Helvetica, Arial, sans-serif"}"${isSel ? ' contenteditable="true" spellcheck="true"' : ""}>${esc(m.text).replace(/\n/g, "<br>")}</div>${isSel ? `<i class="pe-handle" data-handle data-for="${m.id}" style="left:${(m.x + m.w) * k - 6}px;top:${(m.y + m.h) * k - 6}px"></i>` : ""}`;
      case "highlight":
        return `<div class="pe-mark${sel}" data-mark="${m.id}" style="${box};background:${m.color};opacity:0.35">${handle}</div>`;
      case "whiteout":
        return `<div class="pe-mark pe-white${sel}" data-mark="${m.id}" style="${box};background:#fff">${handle}</div>`;
      case "rect":
        return `<div class="pe-mark${sel}" data-mark="${m.id}" style="${box};border:${m.width * k}px solid ${m.color}">${handle}</div>`;
      case "image":
        return `<div class="pe-mark${sel}" data-mark="${m.id}" style="${box}"><img src="${m.src}" alt="" draggable="false">${handle}</div>`;
      case "line":
      case "pen": {
        const pts = m.points.map(([x, y]) => `${(x * k).toFixed(1)},${(y * k).toFixed(1)}`).join(" ");
        return `<svg class="pe-mark pe-svg${sel}" data-mark="${m.id}" style="left:0;top:0;width:100%;height:100%"><polyline points="${pts}" fill="none" stroke="${m.color}" stroke-width="${m.width * k}" stroke-linecap="round" stroke-linejoin="round"/>${isSel ? `<polyline points="${pts}" fill="none" stroke="#a01010" stroke-opacity="0.25" stroke-width="${m.width * k + 8}"/>` : ""}</svg>`;
      }
    }
    return "";
  }

  /* ---------- Side panel ---------- */

  function renderSide() {
    const m = selectedMark();
    const kind = m ? m.type : tool;
    const showColor = ["text", "highlight", "rect", "line", "pen"].includes(kind);
    $("[data-style]").innerHTML = `
      ${showColor ? `<div class="st-field">Colour<div class="st-swatches">${COLORS.map((c) => `<button type="button" data-color="${c}" style="background:${c}" aria-pressed="${(m?.color || style.color) === c}" title="${c}"></button>`).join("")}<input type="color" data-color-custom value="${m?.color || style.color}" title="Any colour"></div></div>` : ""}
      ${kind === "text" ? `<div class="st-grid"><label class="st-field">Size<input type="number" min="6" max="96" data-size value="${m?.size || style.size}"></label><label class="st-field">Font<select data-font>${[["Helvetica", "Sans"], ["Times-Roman", "Serif"], ["Courier", "Mono"]].map(([v, l]) => `<option value="${v}"${(m?.font || style.font) === v ? " selected" : ""}>${l}</option>`).join("")}</select></label><label class="st-check is-wide"><input type="checkbox" data-bold${(m?.bold ?? style.bold) ? " checked" : ""}> Bold</label></div>` : ""}
      ${["rect", "line", "pen"].includes(kind) ? `<label class="st-field">Line width<input type="range" min="1" max="12" step="0.5" data-width value="${m?.width || style.width}"></label>` : ""}
      ${kind === "stamp" ? `<div class="st-field">Stamp<div class="st-seg">${STAMPS.map((s) => `<button type="button" data-stamp="${s}">${s}</button>`).join("")}</div><small class="pe-hint">Choose one, then click the page.</small></div>` : ""}
      ${m ? `<div class="pe-sel-actions"><button class="st-btn is-small" type="button" data-copy-mark>Duplicate</button><button class="st-btn is-small" type="button" data-delete-mark>Delete</button></div>` : `<p class="pe-hint">${HINTS[tool] || ""}</p>`}`;
    $("[data-fields]").innerHTML = fields.length
      ? fields
          .map((f, i) => {
            const label = esc(f.name.replace(/[._]/g, " "));
            if (f.type === "PDFCheckBox") return `<label class="st-check"><input type="checkbox" data-field="${i}"${f.value ? " checked" : ""}> ${label}</label>`;
            if (f.options) return `<label class="st-field">${label}<select data-field="${i}">${["", ...f.options].map((o) => `<option${o === f.value ? " selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`;
            return `<label class="st-field">${label}<input data-field="${i}" value="${esc(f.value)}"></label>`;
          })
          .join("") + `<p class="pe-hint">Answers are written into the page when you download.</p>`
      : `<p class="pe-hint">This PDF has no form fields. Use the Text tool to type anywhere.</p>`;
    $("[data-info]").textContent = pages.length ? `${pages.length} page${pages.length > 1 ? "s" : ""}${picked.size ? ` · ${picked.size} selected` : ""}` : "";
  }

  const HINTS = {
    select: "Click a mark to move, resize or change it. Delete removes it.",
    text: "Click where the text should start, then type.",
    highlight: "Drag across what you want to highlight.",
    rect: "Drag to draw a box.",
    line: "Drag to draw a straight line.",
    pen: "Draw freehand.",
    whiteout: "Drag over anything to cover it with white.",
    image: "Choose a picture, then click the page to place it.",
    signature: "Draw or type your signature, then click the page.",
    stamp: "",
    date: "Click to place today's date.",
    check: "Click to place a tick.",
  };

  function syncButtons() {
    $$("[data-tool]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tool === tool)));
    $("[data-undo]").disabled = !history.length;
    $("[data-redo]").disabled = !future.length;
    $$("[data-needs-doc]").forEach((b) => (b.disabled = !pages.length));
    $("[data-extract]").disabled = !picked.size;
    $("[data-zoom-label]").textContent = `${Math.round(zoom * 100)}%`;
    viewer.dataset.tool = tool;
  }

  const selectedMark = () => (selected ? (marks[selected.page] || []).find((m) => m.id === selected.id) : null);

  /* ---------- Making marks ---------- */

  function pointer(e, pid) {
    const layer = $(`[data-layer="${pid}"]`, viewer);
    const r = layer.getBoundingClientRect();
    const k = scaleOf(pid);
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];
  }

  function addMark(pid, m) {
    remember();
    (marks[pid] ||= []).push({ id: uid(), ...m });
    selected = { page: pid, id: marks[pid].at(-1).id };
    drawMarks(pid);
    renderSide();
    return marks[pid].at(-1);
  }

  let drag = null;

  viewer.addEventListener("pointerdown", (e) => {
    const pageEl = e.target.closest("[data-page]");
    if (!pageEl) return;
    const pid = pageEl.dataset.page;
    const [x, y] = pointer(e, pid);
    const markEl = e.target.closest("[data-mark]");
    const handle = e.target.closest("[data-handle]");

    if (tool === "select" || (markEl && tool !== "pen")) {
      if (handle && selected) {
        const m = selectedMark();
        drag = { kind: "resize", pid, m, start: [x, y], orig: { ...m } };
        remember();
        e.preventDefault();
        return;
      }
      if (markEl) {
        const id = markEl.dataset.mark;
        const m = marks[pid].find((q) => q.id === id);
        if (!(selected?.id === id && m.type === "text" && document.activeElement === markEl)) {
          selected = { page: pid, id };
          drag = { kind: "move", pid, m, start: [x, y], orig: JSON.parse(JSON.stringify(m)), moved: false };
          drawMarks(pid);
          renderSide();
          e.preventDefault();
        }
        return;
      }
      if (selected) {
        commitText();
        const prev = selected.page;
        selected = null;
        drawMarks(prev);
        renderSide();
      }
      return;
    }
    e.preventDefault();
    commitText();
    const placeAt = (w, h, extra) => addMark(pid, { x: x - w / 2, y: y - h / 2, w, h, ...extra });
    switch (tool) {
      case "text": {
        const m = addMark(pid, { type: "text", x, y: y - style.size * 0.7, w: 220, h: style.size * 1.5, text: "", color: style.color, size: style.size, bold: style.bold, font: style.font });
        setTimeout(() => {
          const el = $(`[data-mark="${m.id}"]`, viewer);
          el?.focus();
        }, 0);
        return;
      }
      case "date":
        addMark(pid, { type: "text", x, y: y - style.size * 0.7, w: 140, h: style.size * 1.5, text: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), color: style.color, size: style.size, bold: false, font: style.font });
        setTool("select");
        return;
      case "check":
        addMark(pid, { type: "text", x: x - 8, y: y - 14, w: 24, h: 28, text: "✓", color: style.color, size: 24, bold: true, font: "Helvetica" });
        return;
      case "image":
      case "signature":
      case "stamp":
        if (!pendingImage) return toast(tool === "stamp" ? "Choose a stamp first." : "Choose an image first.");
        placeAt(pendingImage.w, pendingImage.h, { type: "image", src: pendingImage.src });
        if (tool !== "stamp") {
          pendingImage = null;
          setTool("select");
        }
        return;
      case "pen":
        drag = { kind: "pen", pid, m: addMark(pid, { type: "pen", x: 0, y: 0, w: 0, h: 0, points: [[x, y]], color: style.color, width: style.width }) };
        return;
      default:
        drag = { kind: "draw", pid, start: [x, y], m: addMark(pid, { type: tool, x, y, w: 1, h: 1, color: tool === "highlight" ? (style.color === "#1D1D1F" ? "#FFD100" : style.color) : style.color, width: style.width, points: tool === "line" ? [[x, y], [x, y]] : undefined }) };
    }
  });

  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const [x, y] = pointer(e, drag.pid);
    const m = drag.m;
    if (drag.kind === "pen") {
      m.points.push([x, y]);
    } else if (drag.kind === "draw") {
      if (m.type === "line") m.points[1] = [x, y];
      else {
        const [sx, sy] = drag.start;
        Object.assign(m, { x: Math.min(sx, x), y: Math.min(sy, y), w: Math.abs(x - sx), h: Math.abs(y - sy) });
      }
    } else if (drag.kind === "move") {
      const dx = x - drag.start[0];
      const dy = y - drag.start[1];
      if (!drag.moved && Math.hypot(dx, dy) > 1.5) {
        drag.moved = true;
        remember();
      }
      if (!drag.moved) return;
      m.x = drag.orig.x + dx;
      m.y = drag.orig.y + dy;
      if (m.points) m.points = drag.orig.points.map(([px, py]) => [px + dx, py + dy]);
    } else if (drag.kind === "resize") {
      const dx = x - drag.start[0];
      const dy = y - drag.start[1];
      if (m.type === "image") {
        const r = drag.orig.h / drag.orig.w;
        m.w = Math.max(10, drag.orig.w + dx);
        m.h = m.w * r;
      } else {
        m.w = Math.max(10, drag.orig.w + dx);
        m.h = Math.max(8, drag.orig.h + dy);
      }
    }
    drawMarks(drag.pid);
  });

  window.addEventListener("pointerup", () => {
    if (!drag) return;
    const m = drag.m;
    if (drag.kind === "draw" && m.type !== "line" && m.w < 3 && m.h < 3) {
      marks[drag.pid] = marks[drag.pid].filter((q) => q !== m);
      history.pop();
      selected = null;
    }
    if (drag.kind === "draw" || drag.kind === "pen") setTool("select", false);
    const pid = drag.pid;
    drag = null;
    drawMarks(pid);
    renderSide();
  });

  /* Text is edited in place; its words go back into the mark on blur. */
  function commitText() {
    const m = selectedMark();
    if (!m || m.type !== "text") return;
    const el = $(`[data-mark="${m.id}"]`, viewer);
    if (!el) return;
    const text = el.innerText.replace(/\n$/, "");
    const k = scaleOf(selected.page);
    if (text !== m.text) m.text = text;
    m.h = Math.max(m.size * 1.3, el.scrollHeight / k);
    if (!m.text.trim()) marks[selected.page] = marks[selected.page].filter((q) => q !== m);
  }
  viewer.addEventListener("focusout", (e) => {
    if (e.target.matches?.(".pe-text")) commitText();
  });
  viewer.addEventListener("input", (e) => {
    if (!e.target.matches?.(".pe-text")) return;
    const m = selectedMark();
    if (m) m.text = e.target.innerText;
  });

  /* ---------- Signature, image and stamp ---------- */

  function stampImage(word) {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    const font = "800 64px Arial, Helvetica, sans-serif";
    ctx.font = font;
    const tw = ctx.measureText(word).width;
    c.width = tw + 80;
    c.height = 120;
    ctx.font = font;
    ctx.strokeStyle = ctx.fillStyle = "#A01010";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(6, 6, c.width - 12, c.height - 12, 16);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(word, c.width / 2, c.height / 2 + 3);
    return { src: c.toDataURL("image/png"), w: c.width / 4, h: c.height / 4 };
  }

  function readImage(file) {
    return new Promise((ok) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Re-drawn as PNG so pdf-lib can embed any picture format.
          const max = 1600;
          const k = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * k);
          c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          const w = Math.min(180, img.width / 3);
          ok({ src: c.toDataURL("image/png"), w, h: (w * img.height) / img.width });
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  function signatureDialog() {
    const d = $("[data-sig-dialog]");
    const canvas = $("canvas", d);
    const ctx = canvas.getContext("2d");
    const clear = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 3.2;
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.strokeStyle = "#0b1f4a";
    };
    clear();
    let down = false;
    let any = false;
    canvas.onpointerdown = (e) => {
      down = true;
      any = true;
      const r = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(((e.clientX - r.left) * canvas.width) / r.width, ((e.clientY - r.top) * canvas.height) / r.height);
    };
    canvas.onpointermove = (e) => {
      if (!down) return;
      const r = canvas.getBoundingClientRect();
      ctx.lineTo(((e.clientX - r.left) * canvas.width) / r.width, ((e.clientY - r.top) * canvas.height) / r.height);
      ctx.stroke();
    };
    canvas.onpointerup = canvas.onpointerleave = () => (down = false);
    $("[data-sig-clear]", d).onclick = () => {
      clear();
      any = false;
    };
    $("[data-sig-type]", d).oninput = (e) => {
      clear();
      const v = e.target.value;
      if (!v) return (any = false);
      ctx.fillStyle = "#0b1f4a";
      ctx.font = `64px "Caveat", "Segoe Script", "Brush Script MT", cursive`;
      ctx.textBaseline = "middle";
      ctx.fillText(v, 24, canvas.height / 2);
      any = true;
    };
    $("[data-sig-use]", d).onclick = () => {
      if (!any) return d.close();
      // Trim to the ink.
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let [x0, y0, x1, y1] = [canvas.width, canvas.height, 0, 0];
      for (let y = 0; y < canvas.height; y++)
        for (let x = 0; x < canvas.width; x++)
          if (data[(y * canvas.width + x) * 4 + 3] > 10) {
            x0 = Math.min(x0, x);
            y0 = Math.min(y0, y);
            x1 = Math.max(x1, x);
            y1 = Math.max(y1, y);
          }
      const pad = 8;
      const out = document.createElement("canvas");
      out.width = x1 - x0 + pad * 2;
      out.height = y1 - y0 + pad * 2;
      out.getContext("2d").drawImage(canvas, x0 - pad, y0 - pad, out.width, out.height, 0, 0, out.width, out.height);
      const w = Math.min(170, out.width / 3);
      pendingImage = { src: out.toDataURL("image/png"), w, h: (w * out.height) / out.width };
      d.close();
      setTool("signature", false);
      toast("Now click the page where the signature goes.");
    };
    d.showModal();
  }

  /* ---------- Saving ---------- */

  const hex = (c) => {
    const n = parseInt(c.replace("#", ""), 16);
    return window.PDFLib.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  };

  async function build(only = null) {
    await libs();
    const { PDFDocument, StandardFonts, degrees } = window.PDFLib;
    const out = await PDFDocument.create();
    const docs = {};
    for (const [i, s] of sources.entries()) {
      const d = await PDFDocument.load(s.bytes.slice(0), { ignoreEncryption: true });
      // Fill this source's form, then flatten it so the answers travel with the page.
      const mine = fields.filter((f) => f.src === i);
      if (mine.length) {
        try {
          const form = d.getForm();
          for (const f of mine) {
            const fld = form.getField(f.name);
            if (f.type === "PDFTextField") fld.setText(String(f.value || ""));
            else if (f.type === "PDFCheckBox") f.value ? fld.check() : fld.uncheck();
            else if (f.value) fld.select(f.value);
          }
          form.flatten();
        } catch (e) {
          console.warn("Form", e);
        }
      }
      docs[i] = d;
    }
    const fonts = {};
    const font = async (name, bold) => {
      const key = name === "Helvetica" ? (bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica) : name === "Times-Roman" ? (bold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman) : bold ? StandardFonts.CourierBold : StandardFonts.Courier;
      return (fonts[key] ??= await out.embedFont(key));
    };
    const list = only ? pages.filter((p) => only.has(p.id)) : pages;
    for (const p of list) {
      let page;
      if (p.src < 0) page = out.addPage([p.w, p.h]);
      else {
        [page] = await out.copyPages(docs[p.src], [p.index]);
        out.addPage(page);
      }
      page.setRotation(degrees(p.rot));
      for (const m of marks[p.id] || []) {
        const r = p.rot;
        if (m.type === "highlight" || m.type === "whiteout" || m.type === "rect") {
          const [ax, ay] = toPdf(p, m.x, m.y);
          const [bx, by] = toPdf(p, m.x + m.w, m.y + m.h);
          const opts = { x: Math.min(ax, bx), y: Math.min(ay, by), width: Math.abs(bx - ax), height: Math.abs(by - ay) };
          if (m.type === "highlight") page.drawRectangle({ ...opts, color: hex(m.color), opacity: 0.35 });
          else if (m.type === "whiteout") page.drawRectangle({ ...opts, color: window.PDFLib.rgb(1, 1, 1) });
          else page.drawRectangle({ ...opts, borderColor: hex(m.color), borderWidth: m.width });
        } else if (m.type === "line" || m.type === "pen") {
          for (let i = 1; i < m.points.length; i++) {
            const [ax, ay] = toPdf(p, ...m.points[i - 1]);
            const [bx, by] = toPdf(p, ...m.points[i]);
            page.drawLine({ start: { x: ax, y: ay }, end: { x: bx, y: by }, thickness: m.width, color: hex(m.color), lineCap: window.PDFLib.LineCapStyle.Round });
          }
        } else if (m.type === "image") {
          const img = await out.embedPng(m.src);
          const [ox, oy] = toPdf(p, m.x, m.y + m.h);
          page.drawImage(img, { x: ox, y: oy, width: m.w, height: m.h, rotate: degrees(r) });
        } else if (m.type === "text" && m.text.trim()) {
          const f = await font(m.font, m.bold);
          const lines = m.text.split("\n");
          const lh = m.size * 1.2;
          lines.forEach((line, i) => {
            const safe = [...line].map((ch) => {
              try {
                f.encodeText(ch);
                return ch;
              } catch {
                return ch === "✓" ? "v" : "?";
              }
            }).join("");
            const [ox, oy] = toPdf(p, m.x + 2, m.y + m.size * 1.02 + i * lh);
            page.drawText(safe, { x: ox, y: oy, size: m.size, font: f, color: hex(m.color), rotate: degrees(r) });
          });
        }
      }
    }
    out.setTitle(docName);
    out.setProducer("New Concept Security PDF editor");
    out.setCreator("New Concept Security admin");
    return out.save();
  }

  async function download(only = null, suffix = "edited") {
    commitText();
    const bytes = await build(only);
    window.NCSExport.save(new Blob([bytes], { type: "application/pdf" }), `${docName} (${suffix}).pdf`);
    toast(only ? `Saved ${only.size} page${only.size > 1 ? "s" : ""} as a new PDF.` : "Edited PDF saved.");
  }

  /* ---------- Events ---------- */

  function setTool(t, draw = true) {
    tool = t;
    if (t !== "signature" && t !== "image" && t !== "stamp") pendingImage = null;
    if (draw) {
      commitText();
      if (selected && t !== "select") {
        const prev = selected.page;
        selected = null;
        drawMarks(prev);
      }
    }
    renderSide();
    syncButtons();
  }

  const fileInput = $("[data-file]");
  const addInput = $("[data-add-file]");
  const imgInput = $("[data-img-file]");

  document.addEventListener("click", async (e) => {
    const t = e.target.closest("button, [data-tool]");
    if (!t) return;
    if (t.dataset.tool) {
      const next = t.dataset.tool;
      if (next === "signature") return signatureDialog();
      if (next === "image") {
        setTool("image");
        return imgInput.click();
      }
      return setTool(next);
    }
    if (t.matches("[data-open]")) return fileInput.click();
    if (t.matches("[data-add]")) return addInput.click();
    if (t.matches("[data-blank]")) {
      remember();
      blankPage();
      return renderAll();
    }
    if (t.matches("[data-undo]")) return undo();
    if (t.matches("[data-redo]")) return redo();
    if (t.matches("[data-zoom]")) {
      zoom = Math.max(0.4, Math.min(3, zoom * (t.dataset.zoom === "in" ? 1.2 : 1 / 1.2)));
      return renderAll();
    }
    if (t.matches("[data-zoom-fit]")) {
      zoom = 1;
      return renderAll();
    }
    if (t.matches("[data-save]")) return busy(t, () => download());
    if (t.matches("[data-extract]")) return busy(t, () => download(new Set(picked), "pages"));
    if (t.matches("[data-delete-picked]")) {
      if (!picked.size) return toast("Tick the pages to delete first.");
      remember();
      pages = pages.filter((p) => !picked.has(p.id));
      picked.clear();
      return renderAll();
    }
    if (t.dataset.rot) {
      remember();
      const p = pages.find((q) => q.id === t.dataset.rot);
      p.rot = (p.rot + 90) % 360;
      marks[p.id] = [];
      return renderAll();
    }
    if (t.dataset.dup) {
      remember();
      const i = pages.findIndex((q) => q.id === t.dataset.dup);
      const copy = { ...pages[i], id: uid() };
      marks[copy.id] = JSON.parse(JSON.stringify(marks[pages[i].id] || [])).map((m) => ({ ...m, id: uid() }));
      pages.splice(i + 1, 0, copy);
      return renderAll();
    }
    if (t.dataset.del) {
      remember();
      pages = pages.filter((q) => q.id !== t.dataset.del);
      picked.delete(t.dataset.del);
      return renderAll();
    }
    if (t.dataset.color) return applyStyle({ color: t.dataset.color });
    if (t.dataset.stamp) {
      pendingImage = stampImage(t.dataset.stamp);
      $$("[data-stamp]").forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
      return toast(`Click the page to place ${t.dataset.stamp}.`);
    }
    if (t.matches("[data-delete-mark]")) return deleteSelected();
    if (t.matches("[data-copy-mark]")) {
      const m = selectedMark();
      if (!m) return;
      const copy = JSON.parse(JSON.stringify(m));
      copy.x += 14;
      copy.y += 14;
      if (copy.points) copy.points = copy.points.map(([x, y]) => [x + 14, y + 14]);
      delete copy.id;
      addMark(selected.page, copy);
    }
  });

  function applyStyle(patch) {
    const m = selectedMark();
    if (m) {
      remember();
      Object.assign(m, patch);
      drawMarks(selected.page);
    }
    Object.assign(style, patch);
    renderSide();
  }

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.matches("[data-color-custom]")) return applyStyle({ color: t.value.toUpperCase() });
    if (t.matches("[data-size]")) return applyStyle({ size: Math.max(6, Math.min(96, Number(t.value) || 14)) });
    if (t.matches("[data-width]")) return applyStyle({ width: Number(t.value) });
    if (t.matches("[data-font]")) return applyStyle({ font: t.value });
    if (t.matches("[data-bold]")) return applyStyle({ bold: t.checked });
    if (t.matches("[data-field]")) {
      const f = fields[Number(t.dataset.field)];
      f.value = t.type === "checkbox" ? t.checked : t.value;
    }
    if (t.matches("[data-pick]")) {
      t.checked ? picked.add(t.dataset.pick) : picked.delete(t.dataset.pick);
      t.closest(".pe-thumb").classList.toggle("is-picked", t.checked);
      renderSide();
      syncButtons();
    }
  });

  function deleteSelected() {
    if (!selected) return;
    remember();
    marks[selected.page] = (marks[selected.page] || []).filter((m) => m.id !== selected.id);
    const pid = selected.page;
    selected = null;
    drawMarks(pid);
    renderSide();
  }

  document.addEventListener("keydown", (e) => {
    const typing = e.target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !typing) {
      e.preventDefault();
      return e.shiftKey ? redo() : undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y" && !typing) {
      e.preventDefault();
      return redo();
    }
    if ((e.key === "Delete" || e.key === "Backspace") && selected && !typing) {
      e.preventDefault();
      return deleteSelected();
    }
    if (e.key === "Escape") {
      commitText();
      const pid = selected?.page;
      selected = null;
      setTool("select");
      if (pid) drawMarks(pid);
    }
  });

  async function openFiles(files, add = false) {
    const pdfs = [...files].filter((f) => /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name));
    if (!pdfs.length) return toast("That isn't a PDF.");
    try {
      if (!add) {
        sources.length = 0;
        pages = [];
        marks = {};
        fields = [];
        history = [];
        future = [];
        picked.clear();
      } else remember();
      let n = 0;
      for (const f of pdfs) n += await addFile(f);
      renderAll();
      toast(add ? `Added ${n} page${n > 1 ? "s" : ""}.` : `${n} page${n > 1 ? "s" : ""} ready to edit.`);
    } catch (err) {
      console.error(err);
      toast("That PDF couldn't be opened. It may be damaged or password protected.");
    }
  }

  fileInput.addEventListener("change", () => openFiles(fileInput.files).then(() => (fileInput.value = "")));
  addInput.addEventListener("change", () => openFiles(addInput.files, true).then(() => (addInput.value = "")));
  imgInput.addEventListener("change", async () => {
    if (!imgInput.files[0]) return setTool("select");
    pendingImage = await readImage(imgInput.files[0]);
    imgInput.value = "";
    setTool("image", false);
    toast("Now click the page where the picture goes.");
  });

  ["dragover", "drop"].forEach((type) =>
    document.addEventListener(type, (e) => {
      if (![...(e.dataTransfer?.types || [])].includes("Files")) return;
      e.preventDefault();
      if (type === "drop") openFiles(e.dataTransfer.files, pages.length > 0 && e.target.closest("[data-thumbs]") !== null);
    }),
  );

  /* Drag thumbnails to reorder. */
  let dragId = null;
  thumbs.addEventListener("dragstart", (e) => {
    dragId = e.target.closest("[data-thumb]")?.dataset.thumb;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dragId || "");
  });
  thumbs.addEventListener("dragover", (e) => {
    if (!dragId) return;
    e.preventDefault();
    const over = e.target.closest("[data-thumb]");
    $$(".pe-thumb", thumbs).forEach((t) => t.classList.toggle("is-over", t === over));
  });
  thumbs.addEventListener("drop", (e) => {
    if (!dragId) return;
    e.preventDefault();
    const over = e.target.closest("[data-thumb]");
    if (over && over.dataset.thumb !== dragId) {
      remember();
      const from = pages.findIndex((p) => p.id === dragId);
      const [moved] = pages.splice(from, 1);
      const to = pages.findIndex((p) => p.id === over.dataset.thumb);
      pages.splice(from <= to ? to + 1 : to, 0, moved);
    }
    dragId = null;
    renderAll();
  });
  thumbs.addEventListener("click", (e) => {
    const t = e.target.closest("[data-thumb]");
    if (!t || e.target.closest("button, label")) return;
    $(`[data-page="${t.dataset.thumb}"]`, viewer)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function toast(text) {
    const t = Object.assign(document.createElement("div"), { className: "st-toast", textContent: text, role: "status" });
    document.body.append(t);
    setTimeout(() => t.remove(), 3200);
  }

  async function busy(btn, task) {
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Saving…";
    try {
      await task();
    } catch (e) {
      console.error(e);
      toast("That couldn't be saved. If the PDF is protected, it may not allow changes.");
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderPages, 150);
  });

  // For tests and the admin: open a PDF from bytes.
  window.NCSPdf = { openBytes: (bytes, name = "document.pdf") => openFiles([new File([bytes], name, { type: "application/pdf" })]), build: () => build(), state: () => ({ pages, marks, fields }) };

  libs().catch(() => toast("The PDF tools couldn't load. Check your connection."));
  renderAll();
})();
