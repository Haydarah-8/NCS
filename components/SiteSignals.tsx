"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Note = { text: string; link: string; label: string } | null;

/* How quickly this page loaded, for the admin's Speed view: time to first
   byte, largest contentful paint (Google's main loading measure) and full
   load. Only the first page of a visit is a real load; later pages are
   client-side navigations and send nothing. */
let firstLoad = true;
let lcp = 0;
if (typeof window !== "undefined" && "PerformanceObserver" in window) {
  try {
    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) lcp = Math.round(last.startTime);
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}
}

function sendVitals(id: number) {
  if (!firstLoad) return;
  firstLoad = false;
  const send = () => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (!nav) return;
    const body = { type: "vitals", id, ttfb: Math.round(nav.responseStart), lcp: lcp || undefined, load: Math.round(nav.loadEventEnd || performance.now()) };
    navigator.sendBeacon?.("/api/track", new Blob([JSON.stringify(body)], { type: "application/json" }));
  };
  // LCP settles once the page has loaded and the visitor has had a moment.
  const later = () => setTimeout(send, 2500);
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later, { once: true });
}

/* Sends the admin panel's analytics (a view when a page opens, the time on
   it when it closes, and calls, emails and outbound links), and shows the
   site announcement set in the admin panel. Nothing personal is sent and no
   cookies are set; see app/api/track. */
export default function SiteSignals() {
  const pathname = usePathname();
  const [note, setNote] = useState<Note>(null);
  const [hidden, setHidden] = useState(false);
  const view = useRef<{ id: number | null; start: number }>({ id: null, start: 0 });

  useEffect(() => {
    const send = (body: object) => navigator.sendBeacon?.("/api/track", new Blob([JSON.stringify(body)], { type: "application/json" }));
    const leave = () => {
      const v = view.current;
      if (v.id) send({ type: "leave", id: v.id, seconds: Math.round((Date.now() - v.start) / 1000) });
      v.id = null;
    };
    const params = new URLSearchParams(location.search);
    view.current = { id: null, start: Date.now() };
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "view",
        path: pathname,
        title: document.title,
        referrer: document.referrer,
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        view.current.id = d.id || null;
        setNote(d.announcement || null);
        if (d.id) sendVitals(d.id);
      })
      .catch(() => {});

    const onHide = () => document.visibilityState === "hidden" && leave();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      leave();
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const a = (event.target as Element)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const name = href.startsWith("tel:") ? "call" : href.startsWith("mailto:") ? "email" : a.host && a.host !== location.host ? "outbound" : "";
      if (!name) return;
      const body = JSON.stringify({ type: "event", name, path: location.pathname, label: name === "outbound" ? a.host : href.slice(0, 200) });
      navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!note || hidden) return null;
  return (
    <div role="status" className="fixed inset-x-0 bottom-0 z-50 bg-[#a01010] text-white shadow-[0_-8px_30px_rgba(0,0,0,0.18)]">
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-5 py-3 text-[15px] sm:px-8">
        <p className="flex-1">
          {note.text}
          {note.link && (
            <a href={note.link} className="ml-2 font-semibold underline underline-offset-2">
              {note.label || "Find out more"}
            </a>
          )}
        </p>
        <button type="button" onClick={() => setHidden(true)} aria-label="Close the announcement" className="rounded-full px-2 text-[20px] leading-none hover:bg-white/15">
          ×
        </button>
      </div>
    </div>
  );
}
