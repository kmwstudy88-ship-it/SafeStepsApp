import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  getExtractedIntelligence,
  verifyExtractedConcern,
  disputeExtractedConcern,
  resolveContradiction,
  auditExtractedConcernsForSystemicBias,
  DEFAULT_MOCK_INTELLIGENCE,
} = await importTypeScriptModule('../../lib/documents/documentIntelligenceService.ts');

test('getExtractedIntelligence returns valid structured extractions with source locators', async () => {
  const data = await getExtractedIntelligence('demo_case');
  assert(data);
  assert.equal(data.caseId, 'demo_case');
  assert(Array.isArray(data.concerns));
  assert(data.concerns.length >= 2);
  assert(Array.isArray(data.goals));
  assert(data.goals.length >= 2);
  assert(Array.isArray(data.contradictions));
  assert(data.contradictions.length >= 1);

  // Validate canonical locator format: paragraph:N:sentence:M
  for (const concern of data.concerns) {
    assert(concern.sourceLocator);
    assert.match(concern.sourceLocator, /^paragraph:\d+:sentence:\d+$/);
    assert(concern.exactQuote);
    assert(typeof concern.confidence === 'number');
    assert(concern.confidence >= 0 && concern.confidence <= 1);
  }

  for (const goal of data.goals) {
    assert(goal.sourceLocator);
    assert.match(goal.sourceLocator, /^paragraph:\d+:sentence:\d+$/);
    assert(goal.goalTitle);
    assert(goal.domain);
  }
});

test('verifyExtractedConcern marks status as verified_by_practitioner with ID', async () => {
  const res = await verifyExtractedConcern('demo_case', 'ext_concern_01', 'practitioner_sarah');
  assert.equal(res.success, true);
  assert(res.concern);
  assert.equal(res.concern.status, 'verified_by_practitioner');
  assert.equal(res.concern.verifiedBy, 'practitioner_sarah');

  // Verify persistence in store
  const data = await getExtractedIntelligence('demo_case');
  const updated = data.concerns.find((c) => c.id === 'ext_concern_01');
  assert(updated);
  assert.equal(updated.status, 'verified_by_practitioner');
  assert.equal(updated.verifiedBy, 'practitioner_sarah');
});

test('disputeExtractedConcern validates non-empty reply and records parent procedural statement', async () => {
  // Empty dispute statement validation
  const emptyRes = await disputeExtractedConcern('demo_case', 'ext_concern_02', '   ');
  assert.equal(emptyRes.success, false);
  assert.match(emptyRes.error, /cannot be empty/i);

  // Valid procedural dispute
  const disputeNote = 'I was delayed because the supervisor arrived 25 minutes late and the transport escort did not sign in.';
  const res = await disputeExtractedConcern('demo_case', 'ext_concern_02', disputeNote);
  assert.equal(res.success, true);
  assert(res.concern);
  assert.equal(res.concern.status, 'disputed_by_parent');
  assert.equal(res.concern.parentDisputeNote, disputeNote);

  // Original quote and locator remain intact (non-destructive procedural right of reply)
  assert.equal(res.concern.sourceLocator, 'paragraph:7:sentence:1');
  assert(res.concern.exactQuote.length > 0);
});

test('resolveContradiction logs resolution notes and marks status as clarified', async () => {
  const note = 'Telecom carrier records confirm the SMS was transmitted at 8:15 AM and received by supervisor mobile handset.';
  const res = await resolveContradiction('demo_case', 'contra_01', note);
  assert.equal(res.success, true);
  assert(res.contradiction);
  assert.equal(res.contradiction.status, 'clarified');
  assert.equal(res.contradiction.resolutionNotes, note);

  // Verify persistence
  const data = await getExtractedIntelligence('demo_case');
  const updated = data.contradictions.find((c) => c.id === 'contra_01');
  assert(updated);
  assert.equal(updated.status, 'clarified');
  assert.equal(updated.resolutionNotes, note);
});

test('auditExtractedConcernsForSystemicBias detects provider/transport delays and flags compliance-clock safeguard', async () => {
  const auditRes = await auditExtractedConcernsForSystemicBias('demo_case');
  assert(auditRes.totalFlagged >= 1);
  const delayedConcern = auditRes.flaggedConcerns.find((c) => c.id === 'ext_concern_02');
  assert(delayedConcern);
  assert.equal(delayedConcern.structuralBiasFlag, 'agency_waitlist_penalized');
  assert.match(delayedConcern.recommendedEcsOrSafeguard, /Pause statutory compliance clock/);
});
