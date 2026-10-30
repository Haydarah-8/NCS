/* New Concept Security: the email template maker. Business emails in the
   brand, written as email-safe HTML (tables, inline styles, 600 px wide) so
   they look right in Gmail, Outlook and Apple Mail. Paste straight into an
   email, download the HTML, a plain-text version, or a draft .eml that
   opens in Outlook or Mail ready to send. Also an email signature. */

(function () {
  const STORE = "ncs-email-v1";
  const ORIGIN = location.origin.startsWith("http") ? location.origin : "https://www.newconceptsecurity.co.uk";
  const LOGO_DARK = `${ORIGIN}/images/logo-light.png`;
  const LOGO_LIGHT = `${ORIGIN}/images/logo.png`;
  const COMPANY = {
    name: "New Concept Security",
    legal: "New Concept Security Ltd",
    address: "Concept House, 283 Church Street, Blackpool FY1 3PG",
    phone: "01253 982211",
    email: "mattbaron@newconceptsecurity.co.uk",
    web: "newconceptsecurity.co.uk",
    number: "10664067",
    acs: "NECOSESC01",
    facebook: "https://www.facebook.com/NCSNW",
  };

  const TEMPLATES = {
    quoteFollow: {
      label: "Quote follow-up",
      group: "Sales",
      subject: "Your security quote {ref} from New Concept Security",
      preheader: "Everything you need to approve the cover for {site}.",
      kicker: "Your quote",
      headline: "Cover for {site}, ready when you are.",
      body: "Thank you for walking the site with us. As promised, your quote is attached.\n\nIt covers **licensed officers on site every night**, randomised mobile patrols and remote monitoring of the camera tower, with a written report each morning.\n\nIf you'd like to go ahead, just reply to this email and we'll confirm the start date the same day.",
      facts: "Quote|{ref}\nSite|{site}\nMonthly cost|£4,280 + VAT\nValid until|30 November 2026",
      cta: "Approve the quote",
      ctaUrl: "mailto:mattbaron@newconceptsecurity.co.uk?subject=Approve%20quote%20{ref}",
    },
    reminder: {
      label: "Payment reminder",
      group: "Accounts",
      subject: "Friendly reminder: invoice {ref}",
      preheader: "Invoice {ref} is now due. Payment details inside.",
      kicker: "Accounts",
      headline: "A quick reminder about invoice {ref}.",
      body: "We hope all is well on site. Our records show invoice {ref} is now due for payment.\n\nIf you've already paid, thank you, and please ignore this email. If there's anything you'd like to query, reply and we'll sort it straight away.",
      facts: "Invoice|{ref}\nAmount due|£2,841.00\nDue date|12 November 2026\nBank|Sort code 00-00-00 · Account 00000000",
      cta: "Pay online",
      ctaUrl: "https://",
    },
    finalNotice: {
      label: "Final payment notice",
      group: "Accounts",
      subject: "Final notice: invoice {ref} is overdue",
      preheader: "Please settle invoice {ref} within 7 days.",
      kicker: "Final notice",
      headline: "Invoice {ref} is now overdue.",
      body: "Despite our earlier reminders, invoice {ref} remains unpaid.\n\nPlease arrange payment within **7 days** of this email. After that we may add statutory interest and compensation under the Late Payment of Commercial Debts (Interest) Act 1998, and review the cover on your account.\n\nIf there is a problem we don't know about, please call us. We would much rather find a way forward together.",
      facts: "Invoice|{ref}\nAmount due|£2,841.00\nOriginally due|12 October 2026",
      cta: "Pay now",
      ctaUrl: "https://",
    },
    thanks: {
      label: "Payment received",
      group: "Accounts",
      subject: "Thank you: payment received for {ref}",
      preheader: "Your receipt is attached.",
      kicker: "Thank you",
      headline: "Payment received, thank you.",
      body: "We've received your payment for invoice {ref}. Your receipt is attached for your records.\n\nThank you for trusting New Concept Security with {site}.",
      facts: "Invoice|{ref}\nAmount paid|£2,841.00\nPaid on|29 October 2026",
      cta: "",
      ctaUrl: "",
    },
    welcome: {
      label: "Welcome a new client",
      group: "Clients",
      subject: "Welcome to New Concept Security",
      preheader: "Who to call, what happens next, and your first report.",
      kicker: "Welcome",
      headline: "Welcome aboard. Here's what happens next.",
      body: "Thank you for choosing New Concept Security. Our team starts on site on **{date}**.\n\n**Before we start**, we'll confirm the assignment instructions with you and brief every officer on your site.\n\n**From day one**, you'll get a written report every morning, and our control room is staffed 24 hours a day, 365 days a year.\n\n**Every month**, we'll review the cover with you and adjust it if anything changes.",
      facts: "Site|{site}\nStart date|{date}\nYour account manager|Matt Baron\nControl room, 24/7|01253 982211",
      cta: "Save the control room number",
      ctaUrl: "tel:01253982211",
    },
    survey: {
      label: "Site survey booked",
      group: "Sales",
      subject: "Your site survey is booked for {date}",
      preheader: "We'll walk the site with you and write the plan.",
      kicker: "Site survey",
      headline: "We'll see you on {date}.",
      body: "Thank you for booking a free site survey. One of our managers will walk {site} with you, look at the risks and the entrances, and talk through the options.\n\nIt usually takes about 45 minutes. We'll send a written plan and an itemised quote within two working days.",
      facts: "Date|{date}\nSite|{site}\nWith|Matt Baron",
      cta: "Add to calendar",
      ctaUrl: "https://",
    },
    incident: {
      label: "Incident notification",
      group: "Operations",
      subject: "Incident report: {site}, {date}",
      preheader: "What happened, what we did, and what's next.",
      kicker: "Incident report",
      headline: "An incident at {site} last night.",
      body: "We want you to know straight away that our officer dealt with an incident on site.\n\n**What happened:** at 02:14 two people were seen at the north fence line on camera.\n\n**What we did:** the officer challenged them, they left the area, and the police were informed (reference 0214/29). Nothing was taken and no one was hurt.\n\n**What's next:** we've added an extra patrol visit to the north fence for the next seven nights. The full report and camera stills are attached.",
      facts: "Site|{site}\nDate and time|{date}, 02:14\nPolice reference|0214/29\nOfficer|J. Carter",
      cta: "Call the control room",
      ctaUrl: "tel:01253982211",
    },
    report: {
      label: "Monthly service report",
      group: "Clients",
      subject: "Your security report for October",
      preheader: "Patrols, incidents and the month ahead at {site}.",
      kicker: "Monthly report",
      headline: "October at {site}, in brief.",
      body: "Here's a summary of the month. The full report is attached.\n\nIt was a quiet month overall, with **no losses recorded**. Two incidents were dealt with on site and both were reported to you at the time.\n\nNext month we'll be reviewing the lighting at the rear gate with your facilities team.",
      facts: "Hours of cover|744\nPatrol visits|186\nIncidents|2\nAlarm responses|1",
      cta: "",
      ctaUrl: "",
    },
    interview: {
      label: "Interview invitation",
      group: "Recruitment",
      subject: "Interview invitation: Security Officer",
      preheader: "We'd like to meet you.",
      kicker: "Careers",
      headline: "We'd like to meet you, {name}.",
      body: "Thank you for applying to join New Concept Security. We were impressed with your application and would like to invite you to an interview.\n\nPlease bring **your SIA licence**, photo ID and proof of your right to work in the UK.\n\nReply to confirm, or let us know if you need a different time.",
      facts: "Role|Security Officer\nDate|{date}\nPlace|Concept House, 283 Church Street, Blackpool",
      cta: "Confirm my interview",
      ctaUrl: "mailto:mattbaron@newconceptsecurity.co.uk?subject=Interview%20confirmation",
    },
    news: {
      label: "Newsletter or announcement",
      group: "Marketing",
      subject: "News from New Concept Security",
      preheader: "A new control room, new services and what's coming up.",
      kicker: "News",
      headline: "Our new 24-hour control room is live.",
      body: "We've opened a new control room at Concept House, staffed around the clock by trained operators.\n\nIt means **faster alarm response**, live monitoring of standalone camera towers, and a direct line for every client, day or night.\n\nThank you for being part of New Concept Security.",
      facts: "",
      cta: "Read more",
      ctaUrl: `${ORIGIN}/blog`,
      unsubscribe: true,
    },
  };

  const VARS = { ref: "INV-0001", site: "Riverside development", date: "Monday 3 November", name: "Sam" };

  const defaults = () => ({
    template: "quoteFollow",
    ...TEMPLATES.quoteFollow,
    vars: { ...VARS },
    greeting: "Dear {name},",
    signoff: "Kind regards,",
    sender: "Matt Baron",
    senderTitle: "Operations Manager",
    senderPhone: "07496 320245",
    header: "dark",
    accent: "#A01010",
    footer: true,
    to: "",
    mode: "email",
  });

  let state = load();
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || "null");
      return s ? { ...defaults(), ...s, vars: { ...VARS, ...(s.vars || {}) } } : defaults();
    } catch {
      return defaults();
    }
  }
  const save = () => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch {}
  };

  /* ---------- Writing the email ---------- */

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fillVars = (t) => String(t || "").replace(/\{(\w+)\}/g, (m, k) => state.vars[k] ?? m);
  /* **bold** and [words](link), on escaped text. */
  const inline = (t) =>
    esc(fillVars(t))
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+|mailto:[^)\s]+|tel:[^)\s]+)\)/g, `<a href="$2" style="color:${state.accent};text-decoration:underline">$1</a>`);
  const paragraphs = (t) =>
    fillVars(t)
      .split(/\n\s*\n/)
      .filter((p) => p.trim())
      .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1d1d1f">${inline(p).replace(/\n/g, "<br>")}</p>`)
      .join("");
  const factRows = () =>
    fillVars(state.facts)
      .split("\n")
      .map((l) => l.split("|"))
      .filter(([k, v]) => k && v);

  const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

  function emailHtml() {
    const s = state;
    const dark = s.header === "dark";
    const band = s.header === "red";
    const headerBg = dark ? "#000000" : band ? s.accent : "#ffffff";
    const logo = dark || band ? LOGO_DARK : LOGO_LIGHT;
    const facts = factRows();
    const factTable = facts.length
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border-collapse:collapse;background:#f5f5f7;border-radius:12px">${facts
          .map(([k, v], i) => `<tr><td style="padding:12px 18px;${i ? "border-top:1px solid #e5e5ea;" : ""}font:500 13px ${FONT};color:#6e6e73">${esc(k)}</td><td align="right" style="padding:12px 18px;${i ? "border-top:1px solid #e5e5ea;" : ""}font:600 14px ${FONT};color:#1d1d1f">${inline(v)}</td></tr>`)
          .join("")}</table>`
      : "";
    const cta = s.cta && s.ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 28px"><tr><td style="border-radius:999px;background:${s.accent}"><a href="${esc(fillVars(s.ctaUrl))}" style="display:inline-block;padding:14px 28px;font:600 15px ${FONT};color:#ffffff;text-decoration:none;border-radius:999px">${esc(fillVars(s.cta))}</a></td></tr></table>`
      : "";
    const footer = s.footer
      ? `<tr><td style="padding:28px 40px 36px;background:#f5f5f7;font:400 12px/1.6 ${FONT};color:#86868b">
          <strong style="color:#1d1d1f">${COMPANY.name}</strong><br>${COMPANY.address}<br>
          <a href="tel:${COMPANY.phone.replace(/\s/g, "")}" style="color:#86868b">${COMPANY.phone}</a> · <a href="https://${COMPANY.web}" style="color:#86868b">${COMPANY.web}</a> · <a href="${COMPANY.facebook}" style="color:#86868b">Facebook</a><br>
          ${COMPANY.legal}, registered in England and Wales no. ${COMPANY.number} · SIA Approved Contractor ${COMPANY.acs}
          ${s.unsubscribe ? `<br><br>You're receiving this because you're a client or contact of ${COMPANY.name}. <a href="mailto:${COMPANY.email}?subject=Unsubscribe" style="color:#86868b">Unsubscribe</a>` : ""}
        </td></tr>`
      : "";
    return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${esc(fillVars(s.subject))}</title></head>
<body style="margin:0;padding:0;background:#f5f5f7">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(fillVars(s.preheader))}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden">
<tr><td style="padding:26px 40px;background:${headerBg};${dark ? `border-bottom:3px solid ${s.accent};` : s.header === "light" ? "border-bottom:1px solid #e5e5ea;" : ""}"><img src="${logo}" width="170" alt="New Concept Security" style="display:block;width:170px;height:auto;border:0"></td></tr>
<tr><td style="padding:36px 40px 12px;font-family:${FONT}">
${s.kicker ? `<p style="margin:0 0 10px;font:700 12px ${FONT};letter-spacing:0.08em;text-transform:uppercase;color:${s.accent}">${esc(fillVars(s.kicker))}</p>` : ""}
${s.headline ? `<h1 style="margin:0 0 20px;font:700 28px/1.2 ${FONT};letter-spacing:-0.02em;color:#1d1d1f">${esc(fillVars(s.headline))}</h1>` : ""}
${s.greeting ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1d1d1f">${esc(fillVars(s.greeting))}</p>` : ""}
${paragraphs(s.body)}
${factTable}${cta}
<p style="margin:0;font-size:16px;line-height:1.6;color:#1d1d1f">${esc(fillVars(s.signoff))}</p>
<p style="margin:6px 0 32px;font-size:16px;line-height:1.5;color:#1d1d1f"><strong>${esc(s.sender)}</strong><br><span style="color:#6e6e73">${esc(s.senderTitle)}${s.senderPhone ? ` · ${esc(s.senderPhone)}` : ""}</span></p>
</td></tr>
${footer}
</table></td></tr></table></body></html>`;
  }

  function signatureHtml() {
    const s = state;
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-family:${FONT};color:#1d1d1f"><tr>
<td style="padding-right:16px;border-right:3px solid ${s.accent};vertical-align:middle"><img src="${LOGO_LIGHT}" width="150" alt="New Concept Security" style="display:block;width:150px;height:auto;border:0"></td>
<td style="padding-left:16px;vertical-align:middle;font-size:13px;line-height:1.55">
<strong style="font-size:15px">${esc(s.sender)}</strong><br><span style="color:#6e6e73">${esc(s.senderTitle)}</span><br>
${s.senderPhone ? `<a href="tel:${esc(s.senderPhone.replace(/\s/g, ""))}" style="color:#1d1d1f;text-decoration:none">${esc(s.senderPhone)}</a> · ` : ""}<a href="tel:${COMPANY.phone.replace(/\s/g, "")}" style="color:#1d1d1f;text-decoration:none">${COMPANY.phone}</a><br>
<a href="https://${COMPANY.web}" style="color:${s.accent};text-decoration:none;font-weight:600">${COMPANY.web}</a><br>
<span style="color:#86868b;font-size:11.5px">SIA Approved Contractor · Control room 24/7</span></td></tr></table>`;
  }

  function plainText() {
    const s = state;
    const strip = (t) => fillVars(t).replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
    const facts = factRows().map(([k, v]) => `${k}: ${strip(v)}`).join("\n");
    return [s.greeting && strip(s.greeting), strip(s.body), facts, s.cta && s.ctaUrl ? `${strip(s.cta)}: ${fillVars(s.ctaUrl)}` : "", `${strip(s.signoff)}\n${s.sender}\n${s.senderTitle}${s.senderPhone ? `\n${s.senderPhone}` : ""}`, s.footer ? `${COMPANY.name}\n${COMPANY.address}\n${COMPANY.phone} · ${COMPANY.web}` : ""]
      .filter(Boolean)
      .join("\n\n");
  }

  /* A draft email file: Outlook and Apple Mail open it ready to send. */
  function eml() {
    const s = state;
    const boundary = `ncs-${Math.random().toString(36).slice(2)}`;
    const b64 = (str) => btoa(unescape(encodeURIComponent(str))).replace(/.{76}/g, "$&\r\n");
    const subject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(fillVars(s.subject))))}?=`;
    return [
      `To: ${s.to}`,
      `Subject: ${subject}`,
      "X-Unsent: 1",
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      b64(plainText()),
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      b64(emailHtml()),
      `--${boundary}--`,
      "",
    ].join("\r\n");
  }

  /* ---------- Page ---------- */

  const $ = (s, r = document) => r.querySelector(s);
  const controls = $("[data-controls]");
  const frame = $("[data-frame]");
  let width = 640;

  function controlsHtml() {
    const s = state;
    const groups = {};
    Object.entries(TEMPLATES).forEach(([id, t]) => (groups[t.group] ||= []).push([id, t]));
    const field = (k, label, opts = {}) =>
      opts.area
        ? `<label class="st-field${opts.wide !== false ? " is-wide" : ""}">${label}<textarea data-k="${k}" rows="${opts.rows || 3}">${esc(s[k])}</textarea></label>`
        : `<label class="st-field${opts.wide ? " is-wide" : ""}">${label}<input data-k="${k}" value="${esc(s[k])}"${opts.ph ? ` placeholder="${esc(opts.ph)}"` : ""}></label>`;
    return `
    <section class="st-sec"><h2>Make</h2><div class="st-seg"><button type="button" data-mode="email" aria-pressed="${s.mode === "email"}">Email</button><button type="button" data-mode="signature" aria-pressed="${s.mode === "signature"}">Email signature</button></div></section>
    ${
      s.mode === "signature"
        ? `<section class="st-sec"><h2>You</h2><div class="st-grid">${field("sender", "Name", { wide: true })}${field("senderTitle", "Job title", { wide: true })}${field("senderPhone", "Mobile", { wide: true })}<label class="st-field is-wide">Accent<input type="color" data-k="accent" value="${esc(s.accent)}"></label></div></section>`
        : `<section class="st-sec"><h2>Template <small>${Object.keys(TEMPLATES).length} emails</small></h2>${Object.entries(groups)
            .map(([g, list]) => `<p class="em-group">${g}</p><div class="st-seg">${list.map(([id, t]) => `<button type="button" data-template="${id}" aria-pressed="${id === s.template}">${esc(t.label)}</button>`).join("")}</div>`)
            .join("")}</section>
    <section class="st-sec"><h2>Details <small>fill {ref}, {site}, {date}, {name}</small></h2><div class="st-grid">
      ${["ref", "site", "date", "name"].map((k) => `<label class="st-field">{${k}}<input data-var="${k}" value="${esc(s.vars[k])}"></label>`).join("")}
      <label class="st-field is-wide">To <em>for the draft email file</em><input data-k="to" value="${esc(s.to)}" placeholder="client@example.com"></label>
    </div></section>
    <section class="st-sec"><h2>Words <small>**bold** and [words](https://link)</small></h2><div class="st-grid">
      ${field("subject", "Subject line", { wide: true })}
      ${field("preheader", "Preview text <em>shown after the subject in the inbox</em>", { wide: true })}
      ${field("kicker", "Small heading")}${field("greeting", "Greeting")}
      ${field("headline", "Headline", { wide: true })}
      ${field("body", "Message", { area: true, rows: 9 })}
      ${field("facts", "Key facts <em>one per line: label|value</em>", { area: true, rows: 4 })}
      ${field("cta", "Button")}${field("ctaUrl", "Button link")}
    </div></section>
    <section class="st-sec"><h2>Sign-off</h2><div class="st-grid">${field("signoff", "Sign-off", { wide: true })}${field("sender", "Name")}${field("senderTitle", "Job title")}${field("senderPhone", "Phone", { wide: true })}</div></section>
    <section class="st-sec"><h2>Look</h2><div class="st-grid">
      <div class="st-field is-wide">Header<div class="st-seg">${[["dark", "Black"], ["red", "Red band"], ["light", "White"]].map(([v, l]) => `<button type="button" data-header="${v}" aria-pressed="${s.header === v}">${l}</button>`).join("")}</div></div>
      <label class="st-field">Accent<input type="color" data-k="accent" value="${esc(s.accent)}"></label>
      <label class="st-check" style="align-self:end"><input type="checkbox" data-k="footer"${s.footer ? " checked" : ""}> Company footer</label>
      <label class="st-check is-wide"><input type="checkbox" data-k="unsubscribe"${s.unsubscribe ? " checked" : ""}> Unsubscribe line (newsletters)</label>
    </div></section>`
    }`;
  }

  function preview() {
    const html = state.mode === "signature" ? `<!doctype html><html><body style="margin:0;padding:32px;background:#fff">${signatureHtml()}</body></html>` : emailHtml();
    frame.style.width = `${width}px`;
    frame.srcdoc = html;
    frame.onload = () => {
      frame.style.height = `${frame.contentDocument.documentElement.scrollHeight + 4}px`;
    };
    $("[data-subject]").textContent = state.mode === "signature" ? "Email signature" : fillVars(state.subject);
    $("[data-pre]").textContent = state.mode === "signature" ? "Paste it into Gmail or Outlook signature settings" : fillVars(state.preheader);
    save();
  }

  function redraw() {
    controls.innerHTML = controlsHtml();
    preview();
  }

  controls.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.var) state.vars[t.dataset.var] = t.value;
    else if (t.dataset.k) state[t.dataset.k] = t.type === "checkbox" ? t.checked : t.value;
    else return;
    preview();
  });
  controls.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.template) {
      const tpl = TEMPLATES[t.dataset.template];
      state = { ...state, template: t.dataset.template, unsubscribe: false, ...tpl };
    } else if (t.dataset.header) state.header = t.dataset.header;
    else if (t.dataset.mode) state.mode = t.dataset.mode;
    else return;
    redraw();
  });

  /* ---------- Exports ---------- */

  const name = (ext) => window.NCSExport.fileName([state.mode === "signature" ? `Email signature ${state.sender}` : fillVars(state.subject)], ext);
  const html = () => (state.mode === "signature" ? signatureHtml() : emailHtml());

  async function copyRich() {
    const h = html();
    try {
      await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([h], { type: "text/html" }), "text/plain": new Blob([state.mode === "signature" ? `${state.sender}\n${state.senderTitle}` : plainText()], { type: "text/plain" }) })]);
      toast(state.mode === "signature" ? "Copied. Paste it into your signature settings." : "Copied. Paste it into a new email in Gmail or Outlook.");
    } catch {
      // Older browsers: copy what the preview shows.
      const doc = frame.contentDocument;
      const range = doc.createRange();
      range.selectNodeContents(doc.body);
      const sel = doc.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      doc.execCommand("copy");
      sel.removeAllRanges();
      toast("Copied.");
    }
  }

  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-export], [data-width]");
    if (!b) return;
    if (b.dataset.width) {
      width = Number(b.dataset.width);
      document.querySelectorAll("[data-width]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      return preview();
    }
    const x = b.dataset.export;
    if (x === "copy") await copyRich();
    if (x === "html") window.NCSExport.save(new Blob([html()], { type: "text/html" }), name("html"));
    if (x === "text") {
      await navigator.clipboard.writeText(`${fillVars(state.subject)}\n\n${plainText()}`).catch(() => {});
      toast("Plain text copied.");
    }
    if (x === "eml") {
      window.NCSExport.save(new Blob([eml()], { type: "message/rfc822" }), name("eml"));
      toast("Draft saved. Open it to send from Outlook or Mail.");
    }
    if (x === "mailto") location.href = `mailto:${encodeURIComponent(state.to)}?subject=${encodeURIComponent(fillVars(state.subject))}&body=${encodeURIComponent(plainText())}`;
    if (x === "reset") {
      state = defaults();
      redraw();
    }
    b.closest("details")?.removeAttribute("open");
  });

  function toast(text) {
    const t = Object.assign(document.createElement("div"), { className: "st-toast", textContent: text, role: "status" });
    document.body.append(t);
    setTimeout(() => t.remove(), 3200);
  }

  window.NCSEmail = { html: emailHtml, text: plainText, eml, signature: signatureHtml, state: () => state };
  redraw();
})();
