import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  getChildHelpRequests,
  triageChildHelpRequest,
  getSeriousDecisionReviews,
  reviewSeriousDecision,
  getContradictionReviews,
  resolveContradictionItem,
  getSupervisorAuditTrail,
} = await importTypeScriptModule('../../lib/supervisor/supervisorTriageService.ts');

test('getChildHelpRequests returns pending safeguarding requests with minimum-necessary child words', async () => {
  const requests = await getChildHelpRequests();
  assert(Array.isArray(requests));
  assert(requests.length >= 2);

  const urgentReq = requests.find((r) => r.urgency === 'immediate_safety');
  assert(urgentReq);
  assert.equal(urgentReq.childName, 'Leo (Age 6)');
  assert(urgentReq.childWords.length > 0);
  assert.equal(urgentReq.status, 'new');
});

test('triageChildHelpRequest dispatches safety check and appends to supervisor audit log', async () => {
  const res = await triageChildHelpRequest(
    'req_chd_001',
    'dispatch_safety_check',
    'Mobile outreach unit notified to conduct wellness check within 30 minutes.',
    'supervisor_ellen'
  );

  assert.equal(res.success, true);
  assert(res.request);
  assert.equal(res.request.status, 'safety_check_dispatched');
  assert.match(res.request.triageNotes, /SAFETY CHECK DISPATCHED/);

  // Audit trail verification
  const audit = await getSupervisorAuditTrail();
  assert(audit.length >= 1);
  const latestAudit = audit[0];
  assert.equal(latestAudit.action, 'child_help_request_dispatch_safety_check');
  assert.equal(latestAudit.actorId, 'supervisor_ellen');
  assert.equal(latestAudit.targetId, 'req_chd_001');
});

test('reviewSeriousDecision enforces mandatory supervisor rationale and signs off decision', async () => {
  // Rationale validation: empty string rejected
  const emptyRes = await reviewSeriousDecision('dec_001', 'approved', '   ', 'supervisor_ellen');
  assert.equal(emptyRes.success, false);
  assert.match(emptyRes.error, /mandatory supervisor rationale/i);

  // Valid approval
  const validRes = await reviewSeriousDecision(
    'dec_001',
    'approved',
    'Evidence demonstrates 100% attendance, calm emotional regulation, and secure lockbox photo proof.',
    'supervisor_ellen'
  );

  assert.equal(validRes.success, true);
  assert(validRes.review);
  assert.equal(validRes.review.status, 'approved');
  assert.equal(validRes.review.reviewedBy, 'supervisor_ellen');
  assert(validRes.review.reviewedAt);

  // Verify persistence
  const decisions = await getSeriousDecisionReviews('approved');
  const found = decisions.find((d) => d.id === 'dec_001');
  assert(found);
  assert.equal(found.status, 'approved');
});

test('resolveContradictionItem evaluates contrary evidence and resolves finding', async () => {
  const res = await resolveContradictionItem(
    'contra_sup_01',
    'clarified_in_favour_of_parent',
    'Carrier SMS delivery confirmation demonstrates timely notification; supervision note absence marked as excused.',
    'supervisor_ellen'
  );

  assert.equal(res.success, true);
  assert(res.item);
  assert.equal(res.item.status, 'clarified_in_favour_of_parent');
  assert.equal(res.item.resolvedBy, 'supervisor_ellen');

  const all = await getContradictionReviews();
  const updated = all.find((c) => c.id === 'contra_sup_01');
  assert(updated);
  assert.equal(updated.status, 'clarified_in_favour_of_parent');
});
