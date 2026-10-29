/* Sign out: the session cookie is replaced by an expired one. */

import { json } from "@/lib/server/http";
import { cookieHeader } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST() {
  return json({ ok: true }, 200, { "set-cookie": cookieHeader("", 0) });
}
