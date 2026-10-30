/* Optional writing help for the Business Studio. Admin only, and only when
   ANTHROPIC_API_KEY is set; every tool works without it.

   It rewrites words the user has already written. It never adds facts:
   no accreditations, client names, staffing levels, prices, dates,
   guarantees or incidents that aren't in the text it was given. The
   suggestion comes back for the user to review; nothing is saved here. */

import Anthropic from "@anthropic-ai/sdk";
import { requireAdministrator } from "@/lib/server/accounts";
import { audit, guard, json, readBody } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 6000;

const TASKS: Record<string, string> = {
  tidy: "Correct spelling, grammar and punctuation, and make clumsy sentences read smoothly. Keep the length and tone.",
  shorter: "Make it shorter and clearer, keeping every fact. Cut repetition and filler.",
  formal: "Make the tone more formal and suitable for a tender or a letter to a client.",
  friendly: "Make the tone warmer and more conversational, still professional.",
  notes: "Turn these rough notes into well-written paragraphs. Use only what the notes say.",
};

const SYSTEM = `You edit business writing for New Concept Security, a UK security company. You are given text the user wrote, inside <text> tags, and one editing instruction.

Rules, in order of importance:
- Use only the facts in the text. Never add accreditations, licences, client or site names, people, staffing numbers, response times, prices, dates, statistics, guarantees, legal terms or descriptions of incidents that the text doesn't already state. If something seems missing, leave it out; don't invent it.
- Keep every fact, number, name and placeholder (such as {client} or [site name]) exactly as written.
- Don't make promises or commitments stronger than the original.
- Write in British English. Keep the user's light formatting: ## headings, - lists and **bold**.
- Reply with the edited text only: no preamble, no notes, no quotation marks around it.`;

let client: Anthropic | null = null;

export function POST(request: Request) {
  return guard(async () => {
    const access = await requireAdministrator(request);
    if ("response" in access) return access.response;
    const origin = request.headers.get("origin");
    const host = request.headers.get("host") || new URL(request.url).host;
    if (origin && new URL(origin).host !== host) return json({ error: "Wrong origin" }, 403);
    if (!process.env.ANTHROPIC_API_KEY) return json({ error: "Writing help is turned off. Add ANTHROPIC_API_KEY to switch it on." }, 503);

    const body = await readBody(request);
    const task = String(body.task || "");
    const text = String(body.text || "").trim();
    if (!TASKS[task]) return json({ error: "Unknown request." }, 400);
    if (!text) return json({ error: "Write something first, then ask for help with it." }, 400);
    if (text.length > MAX_TEXT) return json({ error: `That's too long for one go. Keep it under ${MAX_TEXT.toLocaleString("en-GB")} characters.` }, 400);

    client ??= new Anthropic();
    try {
      const response = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 4000,
        output_config: { effort: "low" },
        // If the request is declined, the API retries it on a suitable model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM,
        messages: [{ role: "user", content: `${TASKS[task]}\n\n<text>\n${text}\n</text>` }],
      });
      if (response.stop_reason === "refusal") return json({ error: "Writing help couldn't do this one. Edit it by hand." }, 422);
      const out = response.content
        .flatMap((b) => (b.type === "text" ? [b.text] : []))
        .join("")
        .replace(/^\s*<\/?text>\s*|\s*<\/?text>\s*$/g, "")
        .trim();
      if (!out) return json({ error: "No suggestion came back. Try again." }, 502);
      await audit("assist", true, request, task);
      return json({ text: out, truncated: response.stop_reason === "max_tokens" });
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) return json({ error: "The writing help key wasn't accepted. Check ANTHROPIC_API_KEY." }, 503);
      if (error instanceof Anthropic.RateLimitError) return json({ error: "Writing help is busy. Try again in a minute." }, 429);
      if (error instanceof Anthropic.APIError) return json({ error: "Writing help isn't available right now." }, 502);
      throw error;
    }
  });
}
