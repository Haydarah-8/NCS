/* New Concept Security studio: gives every maker's editor the same
   structure. Each section (a .dc-card with an h2) becomes collapsible, a
   rail of section names runs along the top to jump between them, and the
   open or closed state is remembered per maker. It watches the editor, so
   sections the maker redraws are picked up again. */

(function () {
  const KEY = `ncs-studio:${location.pathname.split("/").pop()}${new URLSearchParams(location.search).get("type") || ""}`;
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  };
  const write = (v) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch {}
  };
  const title = (sec) => (sec.querySelector(":scope > h2")?.childNodes[0]?.textContent || "").trim();

  function enhance(editor) {
    const sections = [...editor.querySelectorAll(":scope > .dc-card, :scope > section.dc-card")].filter((s) => s.querySelector(":scope > h2"));
    if (!sections.length) return;
    const saved = read();
    sections.forEach((sec, i) => {
      if (sec.dataset.st) return;
      sec.dataset.st = "1";
      const name = title(sec);
      sec.id ||= `st-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      // Open by default: the first two sections; after that, as left last time.
      const open = name in saved ? saved[name] : i < 2;
      sec.classList.toggle("is-closed", !open);
      const h2 = sec.querySelector(":scope > h2");
      h2.setAttribute("role", "button");
      h2.setAttribute("tabindex", "0");
      h2.setAttribute("aria-expanded", String(open));
      const toggle = (e) => {
        if (e.target.closest("button, a, input, select, label")) return;
        if (e.type === "keydown" && !["Enter", " "].includes(e.key)) return;
        e.preventDefault();
        setOpen(sec, sec.classList.contains("is-closed"));
      };
      h2.addEventListener("click", toggle);
      h2.addEventListener("keydown", toggle);
    });
    rail(editor, sections);
  }

  function setOpen(sec, open) {
    sec.classList.toggle("is-closed", !open);
    sec.querySelector(":scope > h2")?.setAttribute("aria-expanded", String(open));
    write({ ...read(), [title(sec)]: open });
  }

  function rail(editor, sections) {
    // Inside the editor, so the page's two-column grid is untouched.
    let bar = editor.querySelector(":scope > .st-rail");
    if (!bar) {
      bar = document.createElement("nav");
      bar.className = "st-rail";
      bar.setAttribute("aria-label", "Sections");
      editor.prepend(bar);
    }
    bar.innerHTML =
      sections.map((s) => `<button type="button" data-st-go="${s.id}">${title(s)}</button>`).join("") +
      `<button type="button" class="st-all" data-st-all>${sections.every((s) => !s.classList.contains("is-closed")) ? "Collapse all" : "Open all"}</button>`;
    bar.onclick = (e) => {
      const go = e.target.closest("[data-st-go]");
      if (go) {
        const sec = document.getElementById(go.dataset.stGo);
        setOpen(sec, true);
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
        mark(go.dataset.stGo);
        return;
      }
      if (e.target.closest("[data-st-all]")) {
        const openAll = sections.some((s) => s.classList.contains("is-closed"));
        sections.forEach((s) => setOpen(s, openAll));
        e.target.textContent = openAll ? "Collapse all" : "Open all";
      }
    };
    const mark = (id) => bar.querySelectorAll("[data-st-go]").forEach((b) => b.setAttribute("aria-current", String(b.dataset.stGo === id)));
    const watch = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) mark(top.target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    sections.forEach((s) => watch.observe(s));
  }

  function start() {
    document.querySelectorAll(".dc-editor").forEach((editor) => {
      enhance(editor);
      new MutationObserver(() => enhance(editor)).observe(editor, { childList: true });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(start, 50));
  else setTimeout(start, 50);
})();
