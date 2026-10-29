/* Gives someone access to the admin panel, or takes it away. Uses the
   Supabase service role key, so it only runs on a trusted computer.

     npm run admin:add -- person@example.com
         Creates the account if it doesn't exist, marks it as an admin, and
         emails a link to choose a password.
     npm run admin:add -- person@example.com --link
         The same, but prints the link here instead of emailing it.
     npm run admin:remove -- person@example.com
         Takes admin access away (the Supabase account stays).

   The link brings the person to SITE_URL/admin/login.html, so SITE_URL in
   .env must be the website's address, and that address must be allowed in
   Supabase: Authentication > URL Configuration > Redirect URLs. */

const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const site = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
const args = process.argv.slice(2);
const email = args.find((a) => a.includes("@"))?.toLowerCase();
const remove = args.includes("--remove");
const printLink = args.includes("--link");

if (!base || !service) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.");
  process.exit(1);
}
if (!email) {
  console.error("Give an email address: npm run admin:add -- person@example.com");
  process.exit(1);
}

async function call(path, method = "GET", body) {
  const res = await fetch(`${base}/auth/v1${path}`, {
    method,
    headers: { apikey: service, authorization: `Bearer ${service}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${data.msg || data.message || data.error_description || JSON.stringify(data)}`);
  return data;
}

async function findUser() {
  for (let page = 1; page < 50; page++) {
    const { users = [] } = await call(`/admin/users?page=${page}&per_page=200`);
    const hit = users.find((u) => u.email?.toLowerCase() === email);
    if (hit || users.length < 200) return hit;
  }
}

let user = await findUser();
if (remove) {
  if (!user) {
    console.log(`${email} has no account.`);
    process.exit(0);
  }
  await call(`/admin/users/${user.id}`, "PUT", { app_metadata: { ...user.app_metadata, ncs_admin: false } });
  console.log(`${email} no longer has access to the admin panel.`);
  process.exit(0);
}

if (user) {
  await call(`/admin/users/${user.id}`, "PUT", { app_metadata: { ...user.app_metadata, ncs_admin: true }, email_confirm: true });
  console.log(`${email} already had an account; it now has admin access.`);
} else {
  user = await call("/admin/users", "POST", { email, email_confirm: true, app_metadata: { ncs_admin: true } });
  console.log(`Created an admin account for ${email}.`);
}

const redirect = `${site}/admin/login.html`;
if (printLink) {
  const link = await call("/admin/generate_link", "POST", { type: "recovery", email, redirect_to: redirect });
  console.log(`\nSend this one-time link to choose a password (it expires):\n${link.action_link || link.properties?.action_link}\n`);
} else {
  await call(`/recover?redirect_to=${encodeURIComponent(redirect)}`, "POST", { email });
  console.log(`Emailed ${email} a link to choose a password. It opens ${redirect}.`);
}
