/* The quick-command search (Ctrl K): every page, every tool and template,
   and, as you type, documents, enquiries, library items and locations. */

import { $, esc, icon, studio } from "./core.js";
import { DOCS } from "./views.js";
import { TEMPLATES } from "./docstudio.js";

const TOOLS = [
  ...Object.entries(TEMPLATES).map(([kind, t]) => ({ href: `#/studio/new/${kind}`, icon: "plus", label: `New ${t.label.toLowerCase()}`, hint: "Document Studio" })),
  ...DOCS.flatMap(([group, items]) => items.map(([id, name, ic]) => ({ href: `#/documents/${id}`, icon: ic, label: name, hint: group }))),
  { href: "#/insights/campaigns", icon: "compass", label: "Campaign links and QR codes", hint: "Website Insights" },
  { href: "#/settings?tab=brand", icon: "gear", label: "Brand kit", hint: "Settings" },
  { href: "#/settings?tab=sample", icon: "gear", label: "Sample data", hint: "Settings" },
];

export function openPalette(pages) {
  if ($(".palette")) return;
  const d = document.createElement("dialog");
  d.className = "palette";
  d.innerHTML = `<label class="palette-find">${icon("compass", 18)}<input type="search" placeholder="Search tools, templates, documents, enquiries…" aria-label="Search"><kbd>Esc</kbd></label><ul class="palette-list" role="listbox"></ul>`;
  document.body.append(d);
  const input = $("input", d);
  const list = $("ul", d);
  const base = [...pages.map(([href, ic, label]) => ({ href, icon: ic, label, hint: "Go to" })), ...TOOLS];
  let items = base;
  let at = 0;
  let timer;
  const draw = () => {
    list.innerHTML = items.length
      ? items.slice(0, 40).map((it, i) => `<li role="option" aria-selected="${i === at}"><a href="${it.href}">${icon(it.icon || "arrow", 16)}<span>${esc(it.label)}</span><small>${esc(it.hint || "")}</small></a></li>`).join("")
      : `<li class="palette-empty">Nothing found</li>`;
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  };
  const close = () => d.close();
  d.addEventListener("close", () => d.remove());
  d.addEventListener("click", (e) => {
    if (e.target === d || e.target.closest("a")) close();
  });
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    items = q ? base.filter((it) => `${it.label} ${it.hint}`.toLowerCase().includes(q)) : base;
    at = 0;
    draw();
    clearTimeout(timer);
    if (q.length < 2) return;
    timer = setTimeout(async () => {
      try {
        const { results } = await studio("search", { params: { q } });
        const more = results.map((r) =>
          r.type === "document"
            ? { href: `#/studio/${r.id}`, icon: "file", label: r.title, hint: "Document" }
            : r.type === "enquiry"
              ? { href: `#/enquiries/${r.id}`, icon: "inbox", label: [r.name, r.company].filter(Boolean).join(", "), hint: "Enquiry" }
              : r.type === "library"
                ? { href: `#/library?id=${r.id}`, icon: "badge", label: r.title, hint: `Library · ${r.type}` }
                : { href: `#/locations?id=${r.id}`, icon: "compass", label: r.name, hint: `Location · ${r.category}` },
        );
        if (input.value.trim().toLowerCase() === q) {
          items = [...items, ...more];
          draw();
        }
      } catch {}
    }, 220);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") at = Math.min(items.length - 1, at + 1);
    else if (e.key === "ArrowUp") at = Math.max(0, at - 1);
    else if (e.key === "Enter") {
      const it = items[at];
      if (it) location.hash = it.href.replace(/^#/, "");
      return close();
    } else return;
    e.preventDefault();
    draw();
  });
  draw();
  d.showModal();
  input.focus();
}
