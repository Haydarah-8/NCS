/* New Concept Security: settings for Mozilla's PDF.js viewer (pdfjs/, kept
   as released so it can be updated by replacing the folder). Runs before
   the viewer starts. Files open from this computer and never leave it. */

function configure() {
  const o = window.PDFViewerApplicationOptions;
  if (!o || configure.done) return;
  configure.done = true;
  o.set("disablePreferences", true); // these settings win over saved ones
  o.set("defaultUrl", ""); // open empty, not Mozilla's sample paper
  o.set("viewerCssTheme", 1); // light, like the admin
  // Editing tools: text, drawing, highlight, pictures, signatures, comments,
  // and page reordering, deleting and merging.
  o.set("enableSignatureEditor", true);
  o.set("enableHighlightFloatingButton", true);
  o.set("enableUpdatedAddImage", true);
  o.set("enableComment", true);
  o.set("enableSplitMerge", true);
  o.set("enableMerge", true);
  // No scripts from inside PDFs, and no AI model downloads for alt text.
  o.set("enableScripting", false);
  o.set("enableAltTextModelDownload", false);
  o.set("enableGuessAltText", false);
  o.set("externalLinkTarget", 2); // links in a PDF open in a new tab
  o.set("historyUpdateUrl", false);
}
// PDF.js announces itself to the parent page when it's in a frame (as it is
// inside the admin), and to its own page otherwise; listen on both.
document.addEventListener("webviewerloaded", configure);
try {
  if (parent !== window) parent.document.addEventListener("webviewerloaded", configure, { once: true });
} catch {
  /* A parent on another site: PDF.js then uses this page's event. */
}

/* A welcome panel until a PDF is open. */
window.addEventListener("DOMContentLoaded", () => {
  const panel = document.createElement("div");
  panel.className = "ncs-empty";
  panel.innerHTML = `<div class="ncs-empty-card">
      <svg viewBox="0 0 420 420" aria-hidden="true"><path fill="#a01010" d="M210 8L297.35 95.35V301.72L148.09 69.91ZM210 412L122.65 324.65V118.28L271.91 350.09Z"/><path fill="#1d1d1f" d="M10.18 210L68.05 152.13V267.87ZM409.82 210L351.95 152.13V267.87Z"/></svg>
      <h1>Open a PDF</h1>
      <p>Drop a PDF anywhere on this page, or choose one. You can read it, fill in its form, add text, draw, highlight, sign, add pictures and comments, reorder or delete pages, then download or print it.</p>
      <button type="button" class="ncs-open">Choose a PDF</button>
      <small>The file stays on this computer. Nothing is uploaded.</small>
    </div>`;
  document.getElementById("viewerContainer")?.append(panel);
  panel.querySelector(".ncs-open").addEventListener("click", () => document.getElementById("fileInput")?.click());
  const app = () => window.PDFViewerApplication;
  const wait = setInterval(() => {
    if (!app()?.initializedPromise) return;
    clearInterval(wait);
    app().initializedPromise.then(() => {
      app().eventBus.on("documentloaded", () => panel.remove());
    });
  }, 50);
});
