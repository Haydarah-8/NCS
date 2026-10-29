/* Markdown for blog posts, in the same small dialect as the built-in
   articles: "## " and "### " headings, paragraphs, "- " and "1. " lists,
   "> " quotes, **bold**, `code` and [links](https://...). Everything else is
   text, escaped. Used by the admin editor's preview and by the blog pages, so
   what you see while writing is what gets published. */

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

function inline(text) {
  const links = [];
  let s = escape(text).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const href = safeHref(url.replace(/&amp;/g, "&"));
    links.push(href ? `<a href="${escape(href)}">${typeset(label)}</a>` : typeset(label));
    return `\u0000${links.length - 1}\u0000`;
  });
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = typeset(s);
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => links[Number(i)]);
}

export function render(markdown) {
  const html = [];
  const toc = [];
  const used = new Set();
  let words = 0;
  const chunks = String(markdown ?? "")
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/);
  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    words += lines.join(" ").split(/\s+/).length;
    const first = lines[0];
    const heading = /^(#{2,3})\s+(.*)$/.exec(first);
    if (heading) {
      const text = heading[2];
      if (heading[1] === "##") {
        let id = slugify(text) || "section";
        while (used.has(id)) id += "-2";
        used.add(id);
        toc.push({ id, text: typeset(escape(text)) });
        html.push(`<h2 id="${id}">${inline(text)}</h2>`);
      } else {
        html.push(`<h3>${inline(text)}</h3>`);
      }
      if (lines.length > 1) html.push(`<p>${inline(lines.slice(1).join(" "))}</p>`);
      continue;
    }
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      html.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`);
    } else if (lines.every((l) => /^\d+\.\s+/.test(l))) {
      const start = Number(/^(\d+)/.exec(first)[1]);
      const attr = start !== 1 ? ` start="${start}" style="--start: ${start - 1}"` : "";
      html.push(`<ol${attr}>${lines.map((l) => `<li>${inline(l.replace(/^\d+\.\s+/, ""))}</li>`).join("")}</ol>`);
    } else if (lines.every((l) => l.startsWith(">"))) {
      html.push(`<blockquote><p>${inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "))}</p></blockquote>`);
    } else {
      html.push(`<p>${inline(lines.join(" "))}</p>`);
    }
  }
  return { html: html.join("\n"), toc, words, minutes: Math.max(2, Math.ceil(words / 220)) };
}
