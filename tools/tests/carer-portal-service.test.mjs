import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createCarerService } = require('../../backend/carers/service');
const user = '11111111-1111-4111-8111-111111111111';
const caseId = '22222222-2222-4222-8222-222222222222';
const tenant = '33333333-3333-4333-8333-333333333333';
const other = '44444444-4444-4444-8444-444444444444';
const start = '2026-01-01T00:00:00Z';
const time = Date.parse('2026-10-13T00:00:00Z');
const body = { submissionId: '55555555-5555-4555-8555-555555555555', kind: 'achievement', title: 'School', detail: 'Observed progress.' };

function fixture() {
  const tables = {
    case_participants: [{ case_id: caseId, tenant_id: tenant, user_id: user, participant_role: 'carer',
      status: 'active', participation_status: 'active', effective_from: start, effective_to: null,
      participation_start_at: start, participation_end_at: null, allowed_actions: ['carer.portal.read', 'carer.journal.create'], denied_actions: [] }],
    tenant_memberships: [{ tenant_id: tenant, user_id: user, membership_status: 'active', effective_from: start, effective_to: null, revoked_at: null, suspended_at: null }],
    platform_tenants: [{id:tenant,tenant_status:'active'}],
    cases: [{ id: caseId, tenant_id: tenant, title: 'Assigned case', status: 'active', case_status_code: null }],
    case_notes: [{ id: body.submissionId, case_id: caseId, tenant_id: tenant, author_user_id: user,
      note_type: 'carer_achievement', note_title: 'School', note_body: 'Progress', family_shared: false },
      { id: other, case_id: caseId, tenant_id: tenant, author_user_id: other, note_type: 'case_note', note_body: 'Other actor confidential note' }],
  };
  const rpcCalls = [];
  const errors = {};
  const db = {
    from(table) {
      let rows = tables[table] || []; let one = false;
      const query = {
        select() { return query; }, eq(key, value) { rows = rows.filter(r => r[key] === value); return query; },
        in(key, values) { rows = rows.filter(r => values.includes(r[key])); return query; },
        order() { return query; }, limit(n) { rows = rows.slice(0, n); return query; }, maybeSingle() { one = true; return query; },
        then(resolve, reject) { return Promise.resolve({ data: one ? rows[0] || null : rows, error: errors[table] || null }).then(resolve, reject); },
      };
      return query;
    },
    async rpc(name, args = {}) {
      if(name==='get_carer_assigned_case') return {data:tables.cases.find(row=>row.id===args.p_case_id)||null,error:errors.cases||null};
      if(name==='list_carer_assigned_cases') return {data:tables.cases,error:errors.cases||null};
      rpcCalls.push({ name, args }); return { data: { id: args.p_submission_id, status: 'submitted' }, error: errors.rpc || null };
    },
  };
  return { tables, rpcCalls, errors, service: createCarerService({ db, userId: user, now: () => time }) };
}
const denied = { statusCode: 403 };
test('returns only assigned operational case summaries', async () => {
  const f = fixture(); f.tables.cases.push({ id: other, tenant_id: tenant, title: 'Other case' });
  assert.deepEqual((await f.service.listCases()).map(c => c.id), [caseId]);
});
for (const [name, change] of [
  ['expired participant', f => f.tables.case_participants[0].effective_to = start],
  ['future participant', f => f.tables.case_participants[0].participation_start_at = '2027-01-01T00:00:00Z'],
  ['revoked participant', f => f.tables.case_participants[0].participation_status = 'revoked'],
  ['wrong role', f => f.tables.case_participants[0].participant_role = 'parent'],
  ['explicit denial', f => f.tables.case_participants[0].denied_actions = ['carer.portal.read']],
  ['denial on a second active participant', f => f.tables.case_participants.push({ ...f.tables.case_participants[0], denied_actions: ['carer.portal.read'] })],
  ['tenant mismatch', f => f.tables.case_participants[0].tenant_id = other],
  ['suspended membership', f => f.tables.tenant_memberships[0].suspended_at = start],
  ['revoked membership', f => f.tables.tenant_memberships[0].revoked_at = start],
  ['future membership', f => f.tables.tenant_memberships[0].effective_from = '2027-01-01T00:00:00Z'],
  ['non-active tenant', f => f.tables.platform_tenants[0].tenant_status='restricted_grace'],
]) test(`rejects ${name}`, async () => {
  const f = fixture(); change(f);
  assert.deepEqual(await f.service.listCases(), []);
  await assert.rejects(f.service.createJournal(caseId, body), denied);
  assert.equal(f.rpcCalls.length, 0);
});
test('requires separate create action and rejects forged sharing or author fields', async () => {
  const f = fixture();
  for (const field of ['family_shared', 'author_user_id', 'tenant_id', 'media']) {
    await assert.rejects(f.service.createJournal(caseId, { ...body, [field]: true }), { statusCode: 400 });
  }
  f.tables.case_participants[0].allowed_actions = ['carer.portal.read'];
  await assert.rejects(f.service.createJournal(caseId, body), denied);
  assert.equal(f.rpcCalls.length, 0);
});
test('validates content, kind, case ID and closed cases', async () => {
  const f = fixture();
  for (const invalid of [{ ...body, detail: ' ' }, { ...body, kind: 'unknown' }, { ...body, title: 'a'.repeat(161) }, { ...body, detail: 'a'.repeat(10001) }]) {
    await assert.rejects(f.service.createJournal(caseId, invalid), { statusCode: 400 });
  }
  await assert.rejects(f.service.listJournal('bad-id'), { statusCode: 400 });
  f.tables.cases[0].status = 'closed';
  await assert.rejects(f.service.createJournal(caseId, body), denied);
});
test('journal reads are confined to this author, case, tenant and carer note types', async () => {
  const f = fixture();
  f.tables.case_notes.push({ ...f.tables.case_notes[0], id: other, tenant_id: other });
  const entries = await f.service.listJournal(caseId);
  assert.deepEqual(entries.map(e => e.id), [body.submissionId]);
  assert.equal(entries[0].familyShared, false);
});
test('submits through the atomic invoker RPC and preserves database errors', async () => {
  const f = fixture();
  await f.service.createJournal(caseId, body);
  assert.deepEqual(f.rpcCalls[0], { name: 'submit_carer_journal', args: { p_case_id: caseId,
    p_submission_id: body.submissionId, p_kind: body.kind, p_title: body.title, p_detail: body.detail } });
  f.errors.rpc = { code: '42501' };
  await assert.rejects(f.service.createJournal(caseId, body), denied);
  f.errors.rpc = { code: '23505' };
  await assert.rejects(f.service.createJournal(caseId, body), { statusCode: 409 });
  f.errors.rpc = { code: 'PGRST202', message: 'Secret internal diagnostic' };
  await assert.rejects(f.service.createJournal(caseId, body), error => error.statusCode === 503 && !error.message.includes('Secret'));
});
test('unauthenticated actors are rejected', () => {
  assert.throws(() => createCarerService({ db: {}, userId: null }), { statusCode: 401 });
});
test('communication operations delegate identity-bound parameters to scoped RPCs', async () => {
  const f = fixture();
  await f.service.listChannels();
  await f.service.getMessages(caseId);
  await f.service.setChannelEnabled(caseId, { enabled: false });
  await f.service.sendMessage(caseId, { submissionId: body.submissionId, text: ' Practical message ' });
  await f.service.reviewMessage(caseId, { messageId: body.submissionId, decision: 'approved', reason: ' Reviewed ' });
  await f.service.revokeChannel(caseId, { reason: ' Closed ' });
  await f.service.createChannel({ operationalCaseId: caseId, carerUserId: user, parentUserId: other, expiresAt: '2027-01-01T00:00:00Z',label:'Fixture care conversation',reason:'Reviewed participant links' });
  assert.deepEqual(f.rpcCalls.map(call => call.name), ['list_carer_message_channels','get_carer_channel_messages',
    'set_carer_channel_enabled','send_carer_channel_message','review_carer_channel_message','revoke_carer_message_channel','create_carer_message_channel']);
  assert.deepEqual(f.rpcCalls[3].args, { p_channel_id: caseId, p_submission_id: body.submissionId, p_body: 'Practical message' });
  assert.deepEqual(f.rpcCalls[4].args, { p_channel_id: caseId, p_message_id: body.submissionId, p_decision: 'approved', p_note: 'Reviewed' });
  for (const call of f.rpcCalls) assert.ok(!Object.hasOwn(call.args, 'actor_user_id'));
});
test('communication rejects forged author, status, control and review inputs before any write', async () => {
  const f = fixture();
  for (const extra of ['created_by','reviewStatus','reviewed_by','threadId']) {
    await assert.rejects(f.service.sendMessage(caseId, { submissionId: body.submissionId, text: 'Message', [extra]: user }), { statusCode: 400 });
  }
  await assert.rejects(f.service.sendMessage(caseId, { submissionId: body.submissionId, text: 'a'.repeat(4001) }), { statusCode: 400 });
  await assert.rejects(f.service.setChannelEnabled(caseId, { enabled: 'false' }), { statusCode: 400 });
  await assert.rejects(f.service.reviewMessage(caseId, { messageId: body.submissionId, decision: 'approved', reason: ' ' }), { statusCode: 400 });
  await assert.rejects(f.service.reviewMessage(caseId, { messageId: body.submissionId, decision: 'pending', reason: 'Review' }), { statusCode: 400 });
  await assert.rejects(f.service.revokeChannel(caseId, { reason: ' ', actor: user }), { statusCode: 400 });
  await assert.rejects(f.service.getMessages('not-a-channel'), { statusCode: 400 });
  assert.equal(f.rpcCalls.length, 0);
});
