/* The team: accounts, roles and access, by ?action=.

   GET   me        the signed-in account (and a refreshed session cookie)
         list      accounts the signed-in person may manage
         activity  the activity log (never the developer's own lines,
                   unless the developer is asking)
         company   the company details tools and documents use
   POST  create, update, reset-password, delete    (administrator: employees
                   only; developer: anyone)
         password  choose your own password
         profile   change your own name and phone number
         company-save

   The developer's account is never listed, counted or shown to anyone else. */

import { canManage, grantable, isRole, isSection, ROLE_NAMES, SECTIONS, sectionsFor, type Role } from "@/lib/server/access";
import { canMakeSignIns, publicAccount, removeSignIn, requireAccount, sameOrigin, setSignInPassword, tempPassword, upsertSignIn, type Account } from "@/lib/server/accounts";
import { authConfigured } from "@/lib/server/auth";
import { withDefaults } from "@/lib/server/brandkit";
import { getSql, type Sql } from "@/lib/server/db";
import { audit, clip, guard, json, readBody } from "@/lib/server/http";
import { cookieHeader, sign } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const manages = (a: Account) => a.role === "developer" || a.role === "administrator";
const cleanAccess = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter(isSection))] : []);
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

async function devmode(sql: Sql) {
  const [row] = await sql`select value from settings where key = 'devmode'`;
  return { on: Boolean(row?.value?.on) };
}

async function get(sql: Sql, me: Account, action: string | null) {
  switch (action) {
    case "me": {
      const token = await sign({ id: Number(me.id), role: me.role, sections: sectionsFor(me.role, me.access) });
      await sql`update accounts set last_seen = now() where id = ${me.id}`;
      return json(
        {
          account: { ...publicAccount(me), roleName: ROLE_NAMES[me.role] },
          sections: SECTIONS,
          roles: grantable(me.role).map((r) => ({ key: r, name: ROLE_NAMES[r] })),
          devmode: await devmode(sql),
        },
        200,
        { "set-cookie": cookieHeader(token) },
      );
    }
    case "list": {
      if (!manages(me)) return json({ error: "You don't have access to this." }, 403);
      const rows = me.role === "developer"
        ? await sql`select * from accounts order by (role = 'developer') desc, (role = 'administrator') desc, name`
        : await sql`select * from accounts where role <> 'developer' order by (role = 'administrator') desc, name`;
      return json({ accounts: rows.map((a) => ({ ...publicAccount(a), roleName: ROLE_NAMES[a.role as Role], manageable: canManage(me.role, a.role) && Number(a.id) !== Number(me.id) })), canMakeSignIns: canMakeSignIns() || !authConfigured() });
    }
    case "activity": {
      if (!manages(me)) return json({ error: "You don't have access to this." }, 403);
      const rows = me.role === "developer"
        ? await sql`select l.ts, l.action, l.ok, l.detail, l.hidden, a.name from admin_log l left join accounts a on a.id = l.account_id order by l.ts desc limit 150`
        : await sql`select l.ts, l.action, l.ok, l.detail, a.name from admin_log l left join accounts a on a.id = l.account_id where not l.hidden order by l.ts desc limit 150`;
      return json({ activity: rows });
    }
    case "company": {
      const [row] = await sql`select value from settings where key = 'brandkit'`;
      return json({ company: withDefaults(row?.value).company });
    }
    default:
      return json({ error: "Unknown action" }, 400);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function post(sql: Sql, me: Account, action: string | null, d: Record<string, any>, request: Request) {
  const target = async () => {
    const [t] = await sql`select * from accounts where id = ${Number(d.id) || 0}`;
    // Someone who can't manage an account can't learn that it exists.
    if (!t || (t.role === "developer" && me.role !== "developer")) return null;
    return t as Account;
  };

  switch (action) {
    case "create": {
      if (!manages(me)) return json({ error: "You don't have access to this." }, 403);
      const role = isRole(d.role) ? d.role : "employee";
      if (!canManage(me.role, role)) return json({ error: "You can't give out that role." }, 403);
      const email = clip(d.email, 200).toLowerCase();
      if (!emailOk(email)) return json({ error: "Enter a valid email address." }, 400);
      const name = clip(d.name, 80);
      if (!name) return json({ error: "Enter their name." }, 400);
      const [taken] = await sql`select id, role from accounts where lower(email) = ${email}`;
      if (taken) return json({ error: taken.role === "developer" && me.role !== "developer" ? "That email can't be used." : "Someone already has an account with that email." }, 409);
      const password = tempPassword();
      let authId: string | null;
      try {
        authId = await upsertSignIn(email, password);
      } catch (e) {
        return json({ error: (e as Error).message }, 503);
      }
      const [a] = await sql`insert into accounts (auth_id, email, name, title, phone, role, access, must_change, created_by)
        values (${authId}, ${email}, ${name}, ${clip(d.title, 80)}, ${clip(d.phone, 40)}, ${role}, ${JSON.stringify(cleanAccess(d.access))}::jsonb, ${Boolean(authId)}, ${me.id}) returning *`;
      await audit("add account", true, request, `${name} · ${role === "employee" ? clip(d.title, 80) || "Employee" : ROLE_NAMES[role]}`, role === "developer" ? { id: me.id, role: "developer" } : me);
      return json({ account: publicAccount(a), password: authId ? password : null });
    }
    case "update": {
      if (!manages(me)) return json({ error: "You don't have access to this." }, 403);
      const t = await target();
      if (!t) return json({ error: "That account no longer exists." }, 404);
      const self = Number(t.id) === Number(me.id);
      const role = isRole(d.role) ? d.role : t.role;
      if (!self && (!canManage(me.role, t.role) || !canManage(me.role, role))) return json({ error: "You can't change this account." }, 403);
      if (self && (role !== t.role || d.active === false)) return json({ error: "You can't change your own role or switch yourself off." }, 400);
      const name = clip(d.name, 80) || t.name;
      const [a] = await sql`update accounts set name = ${name}, title = ${clip(d.title, 80)}, phone = ${clip(d.phone, 40)}, role = ${role},
          access = ${JSON.stringify(cleanAccess(d.access))}::jsonb, active = ${d.active === undefined ? t.active : Boolean(d.active)},
          version = version + 1, updated_at = now() where id = ${t.id} returning *`;
      await audit("change account", true, request, `${name}${a.active ? "" : " · switched off"}`, t.role === "developer" || role === "developer" ? { id: me.id, role: "developer" } : me);
      return json({ account: publicAccount(a) });
    }
    case "reset-password": {
      if (!manages(me)) return json({ error: "You don't have access to this." }, 403);
      const t = await target();
      if (!t) return json({ error: "That account no longer exists." }, 404);
      if (!canManage(me.role, t.role) || Number(t.id) === Number(me.id)) return json({ error: "You can't change this account." }, 403);
      const password = tempPassword();
      try {
        if (t.auth_id) await setSignInPassword(t.auth_id, password);
        else {
          const authId = await upsertSignIn(t.email, password);
          if (authId) await sql`update accounts set auth_id = ${authId} where id = ${t.id}`;
        }
      } catch (e) {
        return json({ error: (e as Error).message }, 503);
      }
      await sql`update accounts set must_change = true, version = version + 1, updated_at = now() where id = ${t.id}`;
      await audit("reset password", true, request, t.name, t.role === "developer" ? { id: me.id, role: "developer" } : me);
      return json({ password: authConfigured() ? password : null });
    }
    case "delete": {
      if (!manages(me)) return json({ error: "You don't have access to this." }, 403);
      const t = await target();
      if (!t) return json({ error: "That account no longer exists." }, 404);
      if (!canManage(me.role, t.role) || Number(t.id) === Number(me.id)) return json({ error: "You can't remove this account." }, 403);
      await removeSignIn(t.auth_id);
      await sql`delete from accounts where id = ${t.id}`;
      await audit("remove account", true, request, t.name, t.role === "developer" ? { id: me.id, role: "developer" } : me);
      return json({ ok: true });
    }
    case "password": {
      const password = typeof d.password === "string" ? d.password : "";
      if (password.length < 10) return json({ error: "Use at least 10 characters." }, 400);
      if (/^(.)\1+$/.test(password) || /password|123456|qwerty/i.test(password)) return json({ error: "Choose something harder to guess." }, 400);
      try {
        await setSignInPassword(me.auth_id, password);
      } catch (e) {
        return json({ error: (e as Error).message }, 503);
      }
      await sql`update accounts set must_change = false, updated_at = now() where id = ${me.id}`;
      await audit("change own password", true, request, me.name, me);
      return json({ ok: true });
    }
    case "profile": {
      const name = clip(d.name, 80) || me.name;
      const [a] = await sql`update accounts set name = ${name}, phone = ${clip(d.phone, 40)}, updated_at = now() where id = ${me.id} returning *`;
      return json({ account: publicAccount(a) });
    }
    case "company-save": {
      if (!manages(me)) return json({ error: "You don't have access to this." }, 403);
      const [row] = await sql`select value from settings where key = 'brandkit'`;
      const kit = withDefaults(row?.value);
      const c = d.company || {};
      const company = Object.fromEntries(Object.keys(kit.company).map((k) => [k, clip(c[k] ?? kit.company[k as keyof typeof kit.company], 300)]));
      const next = { ...kit, company, version: (kit.version || 1) + 1 };
      await sql`insert into settings (key, value) values ('brandkit', ${JSON.stringify(next)}::jsonb)
        on conflict (key) do update set value = excluded.value, updated_at = now()`;
      await audit("company details", true, request, String(company.name), me);
      return json({ company });
    }
    default:
      return json({ error: "Unknown action" }, 400);
  }
}

export function GET(request: Request) {
  return guard(async () => {
    const r = await requireAccount(request);
    if ("response" in r) return r.response;
    return get(await getSql(), r.account, new URL(request.url).searchParams.get("action"));
  });
}

export function POST(request: Request) {
  return guard(async () => {
    const r = await requireAccount(request);
    if ("response" in r) return r.response;
    if (!sameOrigin(request)) return json({ error: "Wrong origin" }, 403);
    return post(await getSql(), r.account, new URL(request.url).searchParams.get("action"), await readBody(request), request);
  });
}
