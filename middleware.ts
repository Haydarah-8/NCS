/* Nothing under /admin is served without a signed-in session, except the
   sign-in page and what it needs. The API routes check the session again
   for themselves; this is the first lock, not the only one. */

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verify } from "@/lib/server/session";

export const config = { matcher: ["/admin", "/admin/:path*"] };

const OPEN = new Set(["/admin/login.html", "/admin/admin.css"]);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (OPEN.has(pathname)) return NextResponse.next();
  if ((await verify(request.cookies.get(COOKIE)?.value)) === "admin") return NextResponse.next();
  const login = new URL("/admin/login.html", request.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login, 302);
}
