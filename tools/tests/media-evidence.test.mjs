import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createHash } from 'node:crypto';
import { hashMediaBytes, preserveMediaOriginal, sameDigest } from '../../backend/Services/MediaEvidence/mediaIntegrity.js';
import { createMediaEvidenceService, requireMediaStepUp, validateStart } from '../../backend/Services/MediaEvidence/mediaEvidenceService.js';

const userId = '11111111-1111-4111-8111-111111111111';
const evidenceId = '22222222-2222-4222-8222-222222222222';
const requestId = '33333333-3333-4333-8333-333333333333';
const now = Date.now();
const auth = (overrides = {}) => ({
  user: { id: userId }, accessToken: 'verified-by-auth-middleware', sessionReference: 'session', isLocalBypass: false,
  supabase: { auth: { getClaims: async () => ({ data: { claims: {
    sub: userId, session_id: 'session', aal: 'aal2', amr: [{ method: 'totp', timestamp: Math.floor(now / 1000) }],
  } } }) } }, ...overrides,
});

test('SHA-256 matches the independent standard abc vector across arbitrary chunks', async () => {
  const result = await hashMediaBytes(Readable.from([Buffer.from('a'), Buffer.from('bc')]), 3);
  assert.equal(result.sha256, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(result.byteSize, 3);
  assert.equal(sameDigest(result.sha256, result.sha256), true);
  assert.equal(sameDigest('not-a-digest', 'not-a-digest'), false);
});

test('truncated, oversized and nonbinary streams cannot be verified', async () => {
  await assert.rejects(hashMediaBytes(Readable.from([Buffer.from('abc')]), 4), { code: 'MEDIA_SIZE_MISMATCH' });
  await assert.rejects(hashMediaBytes(Readable.from([Buffer.from('abc')]), 2), { code: 'MEDIA_SIZE_MISMATCH' });
  await assert.rejects(hashMediaBytes(Readable.from(['abc']), 3), TypeError);
});

function vaultFixture({ corruption = false, retained = true, held = true } = {}) {
  const calls = [];
  return { calls,
    capabilities: { versioned: true, retentionEnforced: true, sealedIntake: true, encrypted: true },
    sealIntake: async ({ evidenceId, uploadId }) => { calls.push('seal'); return { evidenceId, uploadId, version: 'intake-v1' }; },
    readIntake: async () => { calls.push('read-intake'); return Readable.from([Buffer.from('abc')]); },
    preserve: async (input) => { calls.push(['preserve', input.sha256]); return { evidenceId: input.evidenceId, version: 'vault-v1', retentionEnforced: retained, legalHold: held, locator: 'private' }; },
    readOriginal: async () => { calls.push('read-original'); return Readable.from([Buffer.from(corruption ? 'abd' : 'abc')]); },
  };
}
const preservationRequest = { evidenceId, uploadId: requestId, expectedBytes: 3, retentionClass: 'reviewed', legalHold: true };

test('preservation seals then hashes then independently reads back the vault version', async () => {
  const vault = vaultFixture();
  const receipt = await preserveMediaOriginal(preservationRequest, vault);
  assert.equal(receipt.sha256, createHash('sha256').update('abc').digest('hex'));
  assert.equal(receipt.version, 'vault-v1');
  assert.deepEqual(vault.calls.map((v) => Array.isArray(v) ? v[0] : v), ['seal', 'read-intake', 'preserve', 'read-original']);
});

test('one-byte vault corruption, unenforced retention and missing hold fail closed', async () => {
  await assert.rejects(preserveMediaOriginal(preservationRequest, vaultFixture({ corruption: true })), { code: 'MEDIA_PRESERVATION_MISMATCH' });
  await assert.rejects(preserveMediaOriginal(preservationRequest, vaultFixture({ retained: false })), { code: 'MEDIA_RETENTION_UNVERIFIED' });
  await assert.rejects(preserveMediaOriginal(preservationRequest, vaultFixture({ held: false })), { code: 'MEDIA_RETENTION_UNVERIFIED' });
  await assert.rejects(preserveMediaOriginal(preservationRequest, {}), { code: 'MEDIA_VAULT_UNAVAILABLE' });
});

test('client digest mismatch prevents vault promotion', async () => {
  const vault = vaultFixture();
  await assert.rejects(preserveMediaOriginal({ ...preservationRequest, claimedSha256: '0'.repeat(64) }, vault), { code: 'MEDIA_HASH_MISMATCH' });
  assert.equal(vault.calls.length, 2);
});

test('media never accepts local bypass or unauthenticated context', async () => {
  const service = createMediaEvidenceService({ clientFactory: () => { throw Error('must not access database'); } });
  for (const identity of [null, auth({ isLocalBypass: true }), auth({ sessionReference: null })]) {
    await assert.rejects(service.execute({ auth: identity, action: 'summary', id: evidenceId, requestId }), { code: 'MEDIA_AUTH_REQUIRED' });
  }
});

test('step-up rejects stale MFA, wrong subject/session, unsigned claims and aal1', async () => {
  await requireMediaStepUp(auth(), now);
  for (const claims of [
    { sub: userId, session_id: 'session', aal: 'aal2', amr: [{ method: 'totp', timestamp: now / 1000 - 301 }] },
    { sub: evidenceId, session_id: 'session', aal: 'aal2', amr: [{ method: 'totp', timestamp: now / 1000 }] },
    { sub: userId, session_id: 'other', aal: 'aal2', amr: [{ method: 'totp', timestamp: now / 1000 }] },
    { sub: userId, session_id: 'session', aal: 'aal1', amr: [{ method: 'password', timestamp: now / 1000 }] },
  ]) {
    await assert.rejects(requireMediaStepUp(auth({ supabase: { auth: { getClaims: async () => ({ data: { claims } }) } } }), now), { code: 'MEDIA_STEP_UP_REQUIRED' });
  }
  await assert.rejects(requireMediaStepUp(auth({ supabase: { auth: { getClaims: async () => ({ error: new Error('bad signature') }) } } }), now), { code: 'MEDIA_STEP_UP_REQUIRED' });
});

const upload = { caseId: evidenceId, familyId: evidenceId, consentId: requestId, mediaType: 'video', sourceType: 'device_upload', originalFilename: 'original.mov', mimeType: 'video/quicktime', byteSize: 3 };
test('upload contract rejects spoofed provenance, path injection and imprecise sizes', () => {
  assert.deepEqual(validateStart(upload), upload);
  for (const change of [{ uploadedBy: userId }, { sha256: '0'.repeat(64) }, { originalFilename: '../original.mov' }, { byteSize: Number.MAX_SAFE_INTEGER + 1 }, { claimedCapturedAt: '2026-08-31' }]) {
    assert.throws(() => validateStart({ ...upload, ...change }), { code: 'VALIDATION_ERROR' });
  }
});

test('production ingestion cannot start without approved infrastructure', async () => {
  const service = createMediaEvidenceService({ clientFactory: () => { throw Error('must not create rows'); } });
  await assert.rejects(service.execute({ auth: auth(), action: 'start', body: upload, requestId }), { code: 'MEDIA_INGESTION_NOT_CONFIGURED' });
});

test('restriction reports cannot copy attachments or arbitrary text into custody history', async () => {
  const service = createMediaEvidenceService({ clientFactory: () => { throw Error('must not write attachment'); } });
  await assert.rejects(service.execute({ auth: auth(), action: 'report-restriction', id: evidenceId,
    body: { category: 'privacy_concern', attachment: 'untrusted content' }, requestId }), { code: 'VALIDATION_ERROR' });
});

test('finding DTO preserves provisional language and formats source milliseconds', async () => {
  const service = createMediaEvidenceService({ clientFactory: () => ({ rpc: async () => ({ data: { ok: true, findings: [{
    id: requestId, evidence_id: evidenceId, source_file_id: evidenceId, finding: 'Possible inconsistency',
    confidence: null, confidence_basis: 'Not calibrated', source_time_ms: 84500, method: 'metadata_v1',
    model_version: 'tool_v1', limitations: 'Does not establish alteration.', review_status: 'human_review_required',
  }] } }) }) });
  const result = await service.execute({ auth: auth(), action: 'findings', id: evidenceId, requestId });
  assert.equal(result.findings[0].sourceTimestamp, '00:01:24.500');
  assert.equal(result.findings[0].confidence, null);
  assert.equal(result.findings[0].reviewStatus, 'human_review_required');
});

test('service forwards only authenticated actor and propagates database denial', async () => {
  let parameters;
  const service = createMediaEvidenceService({ clientFactory: () => ({ rpc: async (_name, args) => {
    parameters = args; return { data: { ok: false, status: 404, code: 'MEDIA_NOT_FOUND', message: 'Not accessible.' } };
  } }) });
  await assert.rejects(service.execute({ auth: auth(), action: 'summary', id: evidenceId, body: { actor: 'spoof' }, requestId }), { code: 'MEDIA_NOT_FOUND' });
  assert.equal(parameters.p_actor, userId);
});
