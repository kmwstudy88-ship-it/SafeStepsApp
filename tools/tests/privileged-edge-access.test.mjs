import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { stripTypeScriptTypes } from 'node:module';

const sourcePath = new URL('../../supabase/functions/_shared/privileged.ts', import.meta.url);
const source = stripTypeScriptTypes(await readFile(sourcePath, 'utf8'), { mode: 'strip' })
  .replace(
    /^import \{ createClient,[^}]*\} from "npm:@supabase\/supabase-js@2\.57\.4";\r?$/m,
    'const createClient = (...args) => globalThis.__safeStepsCreateClient(...args);',
  );
const privileged = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

function setGlobal(name, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  return () => {
    if (previous) Object.defineProperty(globalThis, name, previous);
    else delete globalThis[name];
  };
}

function makeQuery(result, calls = []) {
  const query = {
    select(...args) { calls.push(['select', ...args]); return this; },
    eq(...args) { calls.push(['eq', ...args]); return this; },
    contains(...args) { calls.push(['contains', ...args]); return this; },
    order(...args) { calls.push(['order', ...args]); return this; },
    limit(...args) { calls.push(['limit', ...args]); return this; },
    insert(...args) { calls.push(['insert', ...args]); return this; },
    maybeSingle: async () => result,
    single: async () => result,
    then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
  };
  return query;
}

test('request parsing rejects non-object bodies and validates identifiers and bounded values', () => {
  for (const body of [null, [], 'text', 42]) {
    assert.throws(
      () => privileged.parseBody(body),
      (error) => error instanceof privileged.HttpError && error.status === 400,
    );
  }
  assert.deepEqual(privileged.parseBody({ caseId: 'ok' }), { caseId: 'ok' });

  const input = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    empty: '',
    label: '  safety plan  ',
    action: 'release',
    enabled: false,
    limit: '5',
  };
  assert.equal(privileged.requiredUuid(input, 'id'), input.id);
  assert.equal(privileged.optionalUuid(input, 'empty'), null);
  assert.equal(privileged.optionalUuid({}, 'missing'), null);
  assert.equal(privileged.requiredString(input, 'label'), 'safety plan');
  assert.equal(privileged.optionalString(input, 'empty'), null);
  assert.equal(privileged.requiredEnum(input, 'action', ['release', 'hold']), 'release');
  assert.equal(privileged.optionalBoolean(input, 'enabled'), false);
  assert.equal(privileged.optionalInteger(input, 'limit', 1, 1, 10), 5);

  const invalidInputs = [
    () => privileged.requiredUuid({ id: 'not-a-uuid' }, 'id'),
    () => privileged.optionalUuid({ id: 12 }, 'id'),
    () => privileged.requiredString({ name: '  ' }, 'name'),
    () => privileged.requiredString({ name: 'long' }, 'name', 3),
    () => privileged.optionalString({ name: 12 }, 'name'),
    () => privileged.requiredEnum({ action: 'delete' }, 'action', ['release', 'hold']),
    () => privileged.optionalBoolean({ enabled: 'false' }, 'enabled'),
    () => privileged.optionalInteger({ limit: 1.5 }, 'limit', 1, 1, 10),
    () => privileged.optionalInteger({ limit: 11 }, 'limit', 1, 1, 10),
  ];
  for (const invalid of invalidInputs) {
    assert.throws(invalid, (error) => error instanceof privileged.HttpError && error.status === 400);
  }
});

test('authentication rejects missing tokens and keeps user-scoped and service clients separate', async () => {
  let envReads = 0;
  const restoreDeno = setGlobal('Deno', {
    env: {
      get(name) {
        envReads += 1;
        return {
          SUPABASE_URL: 'https://supabase.test',
          SUPABASE_ANON_KEY: 'anon',
          SUPABASE_SERVICE_ROLE_KEY: 'service',
        }[name];
      },
    },
  });
  let created = [];
  const restoreFactory = setGlobal('__safeStepsCreateClient', (...args) => {
    created.push(args);
    if (args[1] === 'anon') {
      return { auth: { getUser: async (token) => ({ data: { user: { id: 'actor-1', token } }, error: null }) } };
    }
    return { privileged: true };
  });

  try {
    await assert.rejects(
      privileged.authenticate(new Request('https://edge.test', { headers: { authorization: '' } })),
      (error) => error instanceof privileged.HttpError && error.status === 401,
    );
    assert.equal(envReads, 0);

    const result = await privileged.authenticate(new Request('https://edge.test', {
      headers: { authorization: 'Bearer user-token' },
    }));
    assert.equal(result.user.id, 'actor-1');
    assert.equal(result.adminClient.privileged, true);
    assert.deepEqual(created, [
      [
        'https://supabase.test',
        'anon',
        {
          global: { headers: { Authorization: 'Bearer user-token' } },
          auth: { persistSession: false, autoRefreshToken: false },
        },
      ],
      [
        'https://supabase.test',
        'service',
        { auth: { persistSession: false, autoRefreshToken: false } },
      ],
    ]);
  } finally {
    restoreFactory();
    restoreDeno();
  }
});

test('authentication fails closed when Supabase cannot verify the bearer token', async () => {
  const restoreDeno = setGlobal('Deno', {
    env: { get: (name) => ({ SUPABASE_URL: 'url', SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'service' })[name] },
  });
  let adminClientCreated = false;
  const restoreFactory = setGlobal('__safeStepsCreateClient', (_url, key) => {
    if (key === 'anon') {
      return { auth: { getUser: async () => ({ data: { user: null }, error: new Error('invalid token') }) } };
    }
    adminClientCreated = true;
    return {};
  });

  try {
    await assert.rejects(
      privileged.authenticate(new Request('https://edge.test', {
        headers: { authorization: 'Bearer invalid-token' },
      })),
      (error) => error instanceof privileged.HttpError && error.status === 401,
    );
    assert.equal(adminClientCreated, true);
  } finally {
    restoreFactory();
    restoreDeno();
  }
});

test('case role authorization requires both active membership and an allowed role', async () => {
  const rpcCalls = [];
  const client = {
    async rpc(name, args) {
      rpcCalls.push([name, args]);
      return { data: name === 'user_has_active_case_membership', error: null };
    },
  };
  await assert.rejects(
    privileged.assertCaseRole(client, 'case-1', ['case_worker']),
    (error) => error instanceof privileged.HttpError && error.status === 403,
  );
  assert.deepEqual(rpcCalls, [
    ['user_has_active_case_membership', { target_case_id: 'case-1' }],
    ['user_has_case_role', { target_case_id: 'case-1', allowed_roles: ['case_worker'] }],
  ]);

  const authorizedClient = { rpc: async () => ({ data: true, error: null }) };
  await assert.doesNotReject(privileged.assertCaseRole(authorizedClient, 'case-1', ['case_worker']));
  await assert.rejects(
    privileged.assertCaseRole({ rpc: async () => ({ data: true, error: new Error('rpc failure') }) }, 'case-1', ['case_worker']),
    (error) => error instanceof privileged.HttpError && error.status === 403,
  );
});

test('case and organisation tenant checks fail closed when scoped rows or membership are missing', async () => {
  const caseCalls = [];
  const caseClient = {
    from(table) {
      caseCalls.push(['from', table]);
      return makeQuery({ data: null, error: null }, caseCalls);
    },
  };
  await assert.rejects(
    privileged.assertCaseTenant(caseClient, 'reunification-case-1', 'tenant-1'),
    (error) => error instanceof privileged.HttpError && error.status === 403,
  );
  assert.deepEqual(caseCalls, [
    ['from', 'reunification_cases'],
    ['select', 'id'],
    ['eq', 'id', 'reunification-case-1'],
    ['eq', 'tenant_id', 'tenant-1'],
  ]);
  await assert.doesNotReject(
    privileged.assertCaseTenant({
      from: () => makeQuery({ data: { id: 'case-1' }, error: null }),
    }, 'case-1', 'tenant-1'),
  );

  const orgClient = {
    async rpc() { return { data: false, error: null }; },
    from() { return makeQuery({ data: { id: 'org-1' }, error: null }); },
  };
  await assert.rejects(
    privileged.assertOrganisationTenantAccess(orgClient, { id: 'actor-1' }, 'org-1', 'tenant-1'),
    (error) => error instanceof privileged.HttpError && error.status === 403,
  );

  const organisationCalls = [];
  const authorizedOrgClient = {
    async rpc(name, args) {
      organisationCalls.push([name, args]);
      return { data: true, error: null };
    },
    from(table) {
      organisationCalls.push(['from', table]);
      return makeQuery({ data: { id: 'org-1' }, error: null }, organisationCalls);
    },
  };
  await assert.doesNotReject(
    privileged.assertOrganisationTenantAccess(authorizedOrgClient, { id: 'actor-1' }, 'org-1', 'tenant-1'),
  );
  assert.deepEqual(organisationCalls, [
    ['safesteps_is_active_member', {
      target_user_id: 'actor-1',
      target_organisation_id: 'org-1',
    }],
    ['from', 'organisations'],
    ['select', 'id'],
    ['eq', 'id', 'org-1'],
    ['eq', 'tenant_id', 'tenant-1'],
  ]);
});

test('administrator checks fail closed and audit writes preserve actor provenance', async () => {
  await assert.rejects(
    privileged.assertAdminRole({ rpc: async () => ({ data: false, error: null }) }),
    (error) => error instanceof privileged.HttpError && error.status === 403,
  );
  await assert.doesNotReject(
    privileged.assertAdminRole({ rpc: async () => ({ data: true, error: null }) }),
  );

  const auditCalls = [];
  const auditClient = {
    from(table) {
      auditCalls.push(['from', table]);
      return makeQuery({ data: { id: 'audit-1', created_at: 'now' }, error: null }, auditCalls);
    },
  };
  const audit = await privileged.writeAudit(auditClient, {
    actorUserId: 'actor-1',
    action: 'report.release',
    resourceType: 'case_report',
    resourceId: 'report-1',
    details: { source: 'edge-function' },
  });
  assert.deepEqual(audit, { id: 'audit-1', created_at: 'now' });
  assert.deepEqual(auditCalls, [
    ['from', 'audit_logs'],
    ['insert', {
      case_id: null,
      actor_user_id: 'actor-1',
      action: 'report.release',
      resource_type: 'case_report',
      resource_id: 'report-1',
      details: { source: 'edge-function' },
    }],
    ['select', 'id, created_at'],
  ]);
  await assert.rejects(
    privileged.writeAudit({
      from: () => makeQuery({ data: null, error: new Error('write failed') }),
    }, {
      actorUserId: 'actor-1',
      action: 'report.release',
      resourceType: 'case_report',
    }),
    (error) => error instanceof privileged.HttpError && error.status === 500,
  );
});

test('audit idempotency lookup scopes the actor, action, resource, case and key', async () => {
  const calls = [];
  const client = {
    from(table) {
      calls.push(['from', table]);
      return makeQuery({ data: [{ id: 'audit-1', created_at: 'now' }], error: null }, calls);
    },
  };
  const found = await privileged.findIdempotentAudit(client, {
    idempotencyKey: 'request-123',
    actorUserId: 'actor-1',
    action: 'report.release',
    resourceType: 'case_report',
    resourceId: 'report-1',
    caseId: 'case-1',
  });
  assert.deepEqual(found, { id: 'audit-1', created_at: 'now' });
  assert.deepEqual(calls, [
    ['from', 'audit_logs'],
    ['select', 'id, created_at'],
    ['eq', 'actor_user_id', 'actor-1'],
    ['eq', 'action', 'report.release'],
    ['eq', 'resource_type', 'case_report'],
    ['contains', 'details', { idempotency_key: 'request-123' }],
    ['order', 'created_at', { ascending: false }],
    ['limit', 1],
    ['eq', 'case_id', 'case-1'],
    ['eq', 'resource_id', 'report-1'],
  ]);
  await assert.rejects(
    privileged.findIdempotentAudit({
      from: () => makeQuery({ data: null, error: new Error('database failure') }),
    }, {
      idempotencyKey: 'request-123',
      actorUserId: 'actor-1',
      action: 'report.release',
      resourceType: 'case_report',
    }),
    (error) => error instanceof privileged.HttpError && error.status === 500,
  );
});

test('generic edge errors are sanitized while explicit HTTP errors retain their status', async () => {
  const generic = await privileged.errorResponse(new Error('secret SQL detail'), {});
  assert.equal(generic.status, 400);
  assert.deepEqual(await generic.json(), { error: 'Request failed' });

  const forbidden = await privileged.errorResponse(new privileged.HttpError(403, 'Case access denied'), {});
  assert.equal(forbidden.status, 403);
  assert.deepEqual(await forbidden.json(), { error: 'Case access denied' });
});
