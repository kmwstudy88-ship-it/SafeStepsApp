import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  depositEvidence,
  depositSystemicBarrierProof,
  reviewEvidence,
  logEvidenceDispute,
  getEvidenceRecordsForCase,
  computeSha256Digest,
} = await importTypeScriptModule('../../lib/evidence/evidenceVaultService.ts');

test('computeSha256Digest outputs deterministic 64-char hex digest', () => {
  const hash1 = computeSha256Digest('safe_sleeping_space_photo_data');
  const hash2 = computeSha256Digest('safe_sleeping_space_photo_data');
  const hash3 = computeSha256Digest('different_photo_data');

  assert.equal(hash1.length, 64);
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
});

test('depositEvidence enforces dual timestamps, live capture, and chain of custody', async () => {
  const caseId = 'case-reunification-101';
  const userId = 'parent-user-42';

  const depositResult = await depositEvidence({
    caseId,
    userId,
    title: 'Daily Meal Routine Chart',
    category: 'Child Safety & Routines',
    reflectionText: 'Prepared balanced dinner and established consistent 6pm dinner routine.',
    captureMode: 'live_camera',
    deviceTimestamp: '2026-10-28T18:00:00Z',
    serverTimeForTesting: '2026-10-28T18:00:02Z',
  });

  assert.equal(depositResult.success, true);
  const ev = depositResult.evidence;
  assert(ev.id.startsWith('ev_'));
  assert.equal(ev.isLiveCaptured, true);
  assert.equal(ev.clockSkewSeconds, 2);
  assert.equal(ev.clockAnomalyDetected, false);
  assert.equal(ev.status, 'pending_verification');
  assert.equal(ev.chainOfCustody.length, 1);
  assert.equal(ev.chainOfCustody[0].action, 'captured');
  assert.equal(ev.chainOfCustody[0].actorRole, 'parent');
});

test('depositEvidence detects clock anomalies when device time skews from server', async () => {
  const depositResult = await depositEvidence({
    caseId: 'case-reunification-102',
    userId: 'parent-user-43',
    title: 'Bedtime Safety Lock',
    category: 'Home Environment',
    reflectionText: 'Installed child safety lock on cleaning supply cupboard.',
    captureMode: 'live_camera',
    deviceTimestamp: '2026-10-28T10:00:00Z', // 8 hours skewed
    serverTimeForTesting: '2026-10-28T18:00:00Z',
  });

  assert.equal(depositResult.success, true);
  const ev = depositResult.evidence;
  assert.equal(ev.clockAnomalyDetected, true);
  assert(ev.clockSkewSeconds > 180);
});

test('reviewEvidence records caseworker verification in chain of custody', async () => {
  const depositResult = await depositEvidence({
    caseId: 'case-reunification-103',
    userId: 'parent-user-44',
    title: 'Medicine Storage Box',
    category: 'Child Safety & Routines',
    reflectionText: 'Medication locked in high cabinet with key kept on person.',
    captureMode: 'live_camera',
  });

  const evId = depositResult.evidence.id;
  const reviewResult = await reviewEvidence(evId, {
    workerId: 'cso-worker-99',
    decision: 'verified',
    note: 'Inspected during home visit, verified secure lock.',
  });

  assert.equal(reviewResult.success, true);
  assert.equal(reviewResult.evidence.status, 'verified_by_worker');
  assert.equal(reviewResult.evidence.reviewedBy, 'cso-worker-99');
  assert.equal(reviewResult.evidence.chainOfCustody.length, 2);
  assert.equal(reviewResult.evidence.chainOfCustody[1].action, 'reviewed');
});

test('logEvidenceDispute non-destructively records contrary dispute preserving original record', async () => {
  const depositResult = await depositEvidence({
    caseId: 'case-reunification-104',
    userId: 'parent-user-45',
    title: 'Attendance Record at Clinic',
    category: 'Case Plan Goal Demonstration',
    reflectionText: 'Attended session on Tuesday morning.',
    captureMode: 'upload',
  });

  const evId = depositResult.evidence.id;
  const disputeResult = await logEvidenceDispute(evId, {
    raisedBy: 'cso-worker-99',
    role: 'worker',
    reason: 'Clinic log shows cancellation on Tuesday.',
  });

  assert.equal(disputeResult.success, true);
  const ev = disputeResult.evidence;
  assert.equal(ev.disputed, true);
  assert.equal(ev.status, 'disputed');
  assert.equal(ev.disputeReason, 'Clinic log shows cancellation on Tuesday.');
  assert.equal(ev.chainOfCustody.length, 2);
  assert.equal(ev.chainOfCustody[1].action, 'disputed');
  // Original hash and reflection are strictly preserved
  assert(ev.sha256Hash);
  assert.equal(ev.reflectionText, 'Attended session on Tuesday morning.');
});

test('depositSystemicBarrierProof seals agency waitlist letters and ECS stabilization receipts with tollsComplianceClock metadata', async () => {
  const waitlistProof = await depositSystemicBarrierProof({
    caseId: 'case-reunification-105',
    userId: 'parent-user-46',
    title: 'Regional Trauma Clinic 12-Week Waitlist Confirmation Letter',
    proofType: 'agency_waitlist_letter',
    barrierDescription: 'Clinic intake confirmed referral received 2026-10-01; earliest appointment is 2026-12-24.',
  });

  assert.equal(waitlistProof.success, true);
  assert.equal(waitlistProof.evidence.category, 'Systemic Waitlist / Barrier Proof');
  assert.equal(waitlistProof.evidence.systemicBarrierProofType, 'agency_waitlist_letter');
  assert.equal(waitlistProof.evidence.tollsComplianceClock, true);
  assert.equal(waitlistProof.evidence.sha256Hash.length, 64);

  const ecsReceipt = await depositSystemicBarrierProof({
    caseId: 'case-reunification-105',
    userId: 'parent-user-46',
    title: 'Utility Arrears ECS Grant Receipt',
    proofType: 'ecs_stabilization_receipt',
    barrierDescription: 'Paid $420 electricity arrears via flexible concrete support fund.',
  });

  assert.equal(ecsReceipt.success, true);
  assert.equal(ecsReceipt.evidence.category, 'Economic & Concrete Support (ECS) Proof');
  assert.equal(ecsReceipt.evidence.tollsComplianceClock, false);
});
