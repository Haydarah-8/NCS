/* Markdown for blog posts. Written in the admin's rich text editor (Toast UI
   Editor), which saves Markdown, and rendered here for the editor's preview
   and the blog pages, so what you see while writing is what gets published.

   Supported: headings (# and ## become h2, ### h3, #### h4), paragraphs,
   bullet, numbered and check lists, quotes, tables, fenced code blocks,
   dividers, pictures, **bold**, *italic*, ~~struck~~, `code`, [links](...)
   and backslash escapes. Everything else is text, escaped. Links and
   pictures only to http(s), mailto, tel, site paths and anchors. */

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
export const escape = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ESC[c]);

/* Curly quotes and apostrophes, on text that is already escaped. */
function typeset(s) {
  return s.replace(/&quot;([^&]*?)&quot;/g, "“$1”").replace(/'/g, "’");
}

export function slugify(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function safeHref(url) {
  const u = url.trim();
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(u) ? u : "";
}

function safeSrc(url) {
  const u = url.trim();
  return /^(https?:\/\/|\/)/i.test(u) ? u : "";
}

/* Characters a writer escaped with a backslash stay literal. */
const ESCAPABLE = /\\([\\`*_{}[\]()#+\-.!|~>])/g;
const hide = (s) => s.replace(ESCAPABLE, (_, c) => `\u0001${c.charCodeAt(0)}\u0001`);
const unhide = (s) => s.replace(/\u0001(\d+)\u0001/g, (_, n) => escape(String.fromCharCode(Number(n))));

function inline(text) {
  const keep = [];
  const stash = (html) => `\u0000${keep.push(html) - 1}\u0000`;
  let s = escape(hide(text));
  s = s.replace(/`([^`]+)`/g, (_, code) => stash(`<code>${code}</code>`));
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, url) => {
    const src = safeSrc(url.replace(/&amp;/g, "&"));
    return src ? stash(`<img src="${escape(src)}" alt="${alt}" loading="lazy">`) : "";
  });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const href = safeHref(url.replace(/&amp;/g, "&"));
    return stash(href ? `<a href="${escape(href)}">${typeset(label)}</a>` : typeset(label));
  });
  s = s.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>").replace(/(^|[^\w])_([^_\s][^_]*?)_(?!\w)/g, "$1<em>$2</em>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  s = typeset(s);
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[Number(i)]);
  return unhide(s);
}

const cells = (line) =>
  line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim());

export function render(markdown) {
  const html = [];
  const toc = [];
  const used = new Set();
  let words = 0;
  const count = (t) => (words += t.split(/\s+/).filter(Boolean).length);

  // Fenced code blocks first: they may contain blank lines.
  const codes = [];
  const source = String(markdown ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/^```[^\n]*\n([\s\S]*?)\n```\s*$/gm, (_, code) => `\n\n\u0002${codes.push(code) - 1}\u0002\n\n`);

  for (const chunk of source.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const first = lines[0];

    const code = /^\u0002(\d+)\u0002$/.exec(first);
    if (code) {
      html.push(`<pre><code>${escape(codes[Number(code[1])])}</code></pre>`);
      continue;
    }
    if (lines.length === 1 && /^([-*_])(\s*\1){2,}$/.test(first)) {
      html.push("<hr>");
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(first);
    if (heading) {
      const text = heading[2].replace(/\s+#+$/, "");
      count(text);
      const level = heading[1].length <= 2 ? 2 : heading[1].length === 3 ? 3 : 4;
      if (level === 2) {
        let id = slugify(text) || "section";
        while (used.has(id)) id += "-2";
        used.add(id);
        toc.push({ id, text: typeset(escape(text)) });
        html.push(`<h2 id="${id}">${inline(text)}</h2>`);
      } else {
        html.push(`<h${level}>${inline(text)}</h${level}>`);
      }
      if (lines.length > 1) {
        count(lines.slice(1).join(" "));
        html.push(`<p>${inline(lines.slice(1).join(" "))}</p>`);
      }
      continue;
    }
    count(lines.join(" "));
    if (lines.length >= 2 && lines[0].startsWith("|") && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/.test(lines[1])) {
      const align = cells(lines[1]).map((c) => (c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : ""));
      const cell = (tag, c, i) => `<${tag}${align[i] ? ` style="text-align:${align[i]}"` : ""}>${inline(c)}</${tag}>`;
      const body = lines.slice(2).map((l) => `<tr>${cells(l).map((c, i) => cell("td", c, i)).join("")}</tr>`).join("");
      html.push(`<div class="table-wrap"><table><thead><tr>${cells(lines[0]).map((c, i) => cell("th", c, i)).join("")}</tr></thead><tbody>${body}</tbody></table></div>`);
    } else if (lines.every((l) => /^[-*+]\s+/.test(l))) {
      const items = lines.map((l) => l.replace(/^[-*+]\s+/, ""));
      const tasks = items.every((t) => /^\[[ xX]\]\s/.test(t));
      html.push(
        tasks
          ? `<ul class="tasks">${items.map((t) => `<li><span aria-hidden="true">${/^\[[xX]\]/.test(t) ? "☑" : "☐"}</span> ${inline(t.replace(/^\[[ xX]\]\s+/, ""))}</li>`).join("")}</ul>`
          : `<ul>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</ul>`,
      );
    } else if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
      const start = Number(/^(\d+)/.exec(first)[1]);
      const attr = start !== 1 ? ` start="${start}" style="--start: ${start - 1}"` : "";
      html.push(`<ol${attr}>${lines.map((l) => `<li>${inline(l.replace(/^\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`);
    } else if (lines.every((l) => l.startsWith(">"))) {
      html.push(`<blockquote><p>${inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "))}</p></blockquote>`);
    } else if (lines.length === 1 && /^!\[[^\]]*\]\([^)]+\)$/.test(first)) {
      html.push(`<figure>${inline(first)}</figure>`);
    } else {
      html.push(`<p>${inline(lines.join(" "))}</p>`);
    }
  }
  return { html: html.join("\n"), toc, words, minutes: Math.max(2, Math.ceil(words / 220)) };
}
