import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Load the actual TypeScript handlers with isolated database/auth adapters.
// Tests never use credentials, contact Supabase, or invoke the writing service.
function load(file, dependencies) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, Response, Request, URL, URLSearchParams,
    process: { env: {} }, console,
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: file });
  return module.exports;
}

const json = (data, status = 200) => Response.json(data, { status });
const request = () => new Request('http://localhost/api/studio?action=unknown');

for (const scenario of [
  { name: 'unsigned request', session: false, account: null, status: 401 },
  { name: 'removed account', session: { id: 1 }, account: null, status: 401 },
  { name: 'disabled administrator', session: { id: 1 }, account: { id: 1, active: false, role: 'administrator' }, status: 401 },
  { name: 'employee', session: { id: 1 }, account: { id: 1, active: true, role: 'employee' }, status: 403 },
  { name: 'administrator', session: { id: 1 }, account: { id: 1, active: true, role: 'administrator' }, status: 200 },
  { name: 'developer', session: { id: 1 }, account: { id: 1, active: true, role: 'developer' }, status: 200 },
]) {
  test(`Studio and writing access: ${scenario.name}`, async () => {
    let accountQueries = 0;
    const accounts = load('lib/server/accounts.ts', {
      'node:crypto': {}, './access': { sectionsFor: () => [] },
      './auth': { authConfigured: () => true },
      './db': { getSql: async () => async () => {
        accountQueries++;
        return scenario.account ? [scenario.account] : [];
      } },
      './http': { json },
      './session': { readCookie: () => '', verify: async () => scenario.session },
    });
    const access = await accounts.requireAdministrator(request());
    assert.equal(access.response?.status || 200, scenario.status);
    assert.equal(accountQueries, scenario.session ? 1 : 0);

    const common = {
      '@/lib/server/accounts': accounts,
      '@/lib/server/http': { json, guard: work => work(), readBody: async () => ({}) },
      '@/lib/server/db': { getSql: async () => ({}) },
    };
    const studio = load('app/api/studio/route.ts', {
      ...common, '@/lib/md.js': {}, '@/lib/server/brandkit': {}, '@/lib/server/sample': {},
    });
    const assist = load('app/api/assist/route.ts', {
      ...common, '@anthropic-ai/sdk': {},
    });
    // A permitted request reaches the handler (unknown action / disabled AI).
    // Rejected requests stop before body parsing, database writes, or AI calls.
    assert.equal((await studio.GET(request())).status, scenario.status === 200 ? 400 : scenario.status);
    assert.equal((await studio.POST(request())).status, scenario.status === 200 ? 400 : scenario.status);
    assert.equal((await assist.POST(request())).status, scenario.status === 200 ? 503 : scenario.status);
    if (scenario.status === 200) {
      const crossSite = () => new Request('http://localhost/api/studio?action=unknown', { method: 'POST', headers: { origin: 'https://other.example' } });
      assert.equal((await studio.POST(crossSite())).status, 403);
      assert.equal((await assist.POST(crossSite())).status, 403);
    }
  });
}


test('Password reset audit receives a typed account identity', async () => {
  let queries = 0;
  const audits = [];
  const login = load('app/api/login/route.ts', {
    '@/lib/server/access': {},
    '@/lib/server/auth': { authConfigured: () => false },
    '@/lib/server/db': { getSql: async () => async () => ++queries === 1 ? [{ fails: 0 }] : [{ id: '42', role: 'developer' }] },
    '@/lib/server/http': {
      json, guard: work => work(), readBody: async () => ({ email: 'test@example.com' }),
      clip: value => typeof value === 'string' ? value : '', ipKey: () => 'test',
      audit: async (...args) => audits.push(args),
    },
    '@/lib/server/session': { secret: () => 'test-only-secret' },
  });
  const response = await login.POST(new Request('http://localhost/api/login?action=forgot', { method: 'POST' }));
  assert.equal(response.status, 200);
  assert.equal(audits[0][4].id, 42);
  assert.equal(audits[0][4].role, 'developer');
});

