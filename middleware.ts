/* Two jobs.

   1. Nothing under /admin is served without a signed-in session, except the
      sign-in page and what it needs; a tool page also needs that section in
      the session. The API routes check the account again for themselves:
      this is the first lock, not the only one.
   2. Development mode: while the developer has it on, visitors to the
      website see a "back soon" page. Anyone signed in to the admin still
      sees the site. The setting is read from /api/public?action=mode (cached
      at the edge) and kept here for 15 seconds. */

import { NextResponse, type NextRequest } from "next/server";
import { TOOL_PAGES } from "@/lib/server/access";
import { COOKIE, verify } from "@/lib/server/session";

export const config = {
  matcher: ["/admin", "/admin/:path*", "/((?!api/|_next/|admin|maintenance|images/|.*\\.[A-Za-z0-9]+$).*)"],
};

const OPEN = new Set(["/admin/login.html", "/admin/admin.css"]);

let mode = { at: 0, on: false };
async function devMode(request: NextRequest) {
  if (Date.now() - mode.at < 15_000) return mode.on;
  try {
    const res = await fetch(new URL("/api/public?action=mode", request.url), { signal: AbortSignal.timeout(1500) });
    const data = await res.json();
    mode = { at: Date.now(), on: Boolean(data?.devmode?.on) };
  } catch {
    mode = { at: Date.now(), on: mode.on };
  }
  return mode.on;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verify(request.cookies.get(COOKIE)?.value);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (OPEN.has(pathname)) return NextResponse.next();
    if (!session) {
      const login = new URL("/admin/login.html", request.url);
      if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
      return NextResponse.redirect(login, 302);
    }
    const tool = pathname.startsWith("/admin/tools/") ? TOOL_PAGES[pathname.slice("/admin/tools/".length)] : undefined;
    if (tool && !session.sections.includes(tool)) return NextResponse.redirect(new URL("/admin", request.url), 302);
    return NextResponse.next();
  }

  // The public website.
  if (!session && (await devMode(request))) {
    return NextResponse.rewrite(new URL("/maintenance", request.url), { status: 503, headers: { "retry-after": "3600", "cache-control": "no-store" } });
  }
  return NextResponse.next();
}
