import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  getConcernsForCase,
  submitParentRightOfReply,
  flagMaterialHardshipConflation,
  reviewParentReply,
  DEFAULT_MOCK_CONCERNS,
} = await importTypeScriptModule('../../lib/concerns/concernsRegisterService.ts');

test('getConcernsForCase returns initial registered statutory concerns', async () => {
  const concerns = await getConcernsForCase('demo_case');
  assert(Array.isArray(concerns));
  assert(concerns.length >= 2);

  const medicationConcern = concerns.find((c) => c.id === 'concern_01');
  assert(medicationConcern);
  assert.equal(medicationConcern.category, 'environmental');
  assert.equal(medicationConcern.severity, 'high');
  assert.equal(medicationConcern.statutoryStatus, 'allegation');
  assert.equal(medicationConcern.sourceDocument, 'Safety Assessment Intake Note (2026-08-15)');
});

test('submitParentRightOfReply strictly preserves original agency wording (non-destructive)', async () => {
  const [initialConcern] = await getConcernsForCase('demo_case');
  const originalWording = initialConcern.agencyWording;
  const originalTitle = initialConcern.concernTitle;

  const result = await submitParentRightOfReply({
    concernId: initialConcern.id,
    replyType: 'factual_correction',
    parentStatement: 'Medication was secured inside locked medicine cabinet; toddler was playing with vitamin chewables container.',
  });

  assert.equal(result.success, true);
  const updatedConcern = result.concern;
  assert(updatedConcern);

  // Crucial procedural fairness assertion: original agency wording must never be overwritten
  assert.equal(updatedConcern.agencyWording, originalWording);
  assert.equal(updatedConcern.concernTitle, originalTitle);

  // Verifies appended reply
  assert.equal(updatedConcern.parentReplies.length, 1);
  const reply = updatedConcern.parentReplies[0];
  assert.equal(reply.replyType, 'factual_correction');
  assert.equal(reply.parentStatement, 'Medication was secured inside locked medicine cabinet; toddler was playing with vitamin chewables container.');
  assert.equal(reply.caseworkerReview.status, 'pending');
  assert.equal(updatedConcern.rightOfReplyStatus, 'submitted');
});

test('submitParentRightOfReply links contrary vault evidence IDs', async () => {
  const result = await submitParentRightOfReply({
    concernId: 'concern_02',
    replyType: 'contrary_evidence',
    parentStatement: 'Notification of emergency dentist appointment was sent to caseworker at 8:15 AM prior to the 10:00 AM contact visit.',
    contraryEvidenceIds: ['ev_vault_sms_screenshot_01', 'ev_vault_dental_receipt_02'],
  });

  assert.equal(result.success, true);
  const updatedConcern = result.concern;
  const reply = updatedConcern.parentReplies.find((r) => r.replyType === 'contrary_evidence');
  assert(reply);
  assert.deepEqual(reply.contraryEvidenceIds, ['ev_vault_sms_screenshot_01', 'ev_vault_dental_receipt_02']);
});

test('submitParentRightOfReply rejects empty statement or non-existent concern', async () => {
  const emptyRes = await submitParentRightOfReply({
    concernId: 'concern_01',
    replyType: 'context_clarification',
    parentStatement: '   ',
  });
  assert.equal(emptyRes.success, false);
  assert.match(emptyRes.error, /cannot be empty/i);

  const notFoundRes = await submitParentRightOfReply({
    concernId: 'non_existent_concern_id',
    replyType: 'factual_correction',
    parentStatement: 'Some statement',
  });
  assert.equal(notFoundRes.success, false);
  assert.match(notFoundRes.error, /not found/i);
});

test('reviewParentReply updates review status to accepted_correction with caseworker notes', async () => {
  const submitResult = await submitParentRightOfReply({
    concernId: 'concern_01',
    replyType: 'factual_correction',
    parentStatement: 'Medication was secured in locked cabinet.',
  });
  assert.equal(submitResult.success, true);
  const targetReply = submitResult.concern.parentReplies[submitResult.concern.parentReplies.length - 1];
  assert(targetReply);

  const reviewResult = await reviewParentReply({
    concernId: 'concern_01',
    replyId: targetReply.id,
    workerId: 'cso_worker_sarah_jenkins',
    decision: 'accepted_correction',
    note: 'Verified with photo of locked medicine cabinet and prescription log.',
  });

  assert.equal(reviewResult.success, true);
  const updatedConcern = reviewResult.concern;
  assert.equal(updatedConcern.rightOfReplyStatus, 'accepted_correction');

  const updatedReply = updatedConcern.parentReplies.find((r) => r.id === targetReply.id);
  assert.equal(updatedReply.caseworkerReview.status, 'accepted_correction');
  assert.equal(updatedReply.caseworkerReview.reviewedBy, 'cso_worker_sarah_jenkins');
  assert.equal(updatedReply.caseworkerReview.caseworkerNote, 'Verified with photo of locked medicine cabinet and prescription log.');
  assert(updatedReply.caseworkerReview.reviewedAt);
});

test('reviewParentReply handles acknowledged_contrary_position and errors', async () => {
  const submitResult = await submitParentRightOfReply({
    concernId: 'concern_02',
    replyType: 'context_clarification',
    parentStatement: 'Notification sent at 8:15 AM prior to visit.',
  });
  assert.equal(submitResult.success, true);
  const targetReply = submitResult.concern.parentReplies[submitResult.concern.parentReplies.length - 1];
  assert(targetReply);

  const reviewResult = await reviewParentReply({
    concernId: 'concern_02',
    replyId: targetReply.id,
    workerId: 'cso_worker_sarah_jenkins',
    decision: 'acknowledged_contrary_position',
    note: 'Parent notice acknowledged; rescheduling contact session.',
  });

  assert.equal(reviewResult.success, true);
  assert.equal(reviewResult.concern.rightOfReplyStatus, 'acknowledged_contrary_position');

  const invalidReplyRes = await reviewParentReply({
    concernId: 'concern_02',
    replyId: 'non_existent_reply',
    workerId: 'worker_1',
    decision: 'accepted_correction',
  });
  assert.equal(invalidReplyRes.success, false);
  assert.match(invalidReplyRes.error, /not found on this concern/i);
});

test('flagMaterialHardshipConflation attaches poverty_or_barrier_context reply and flags ECS support without overwriting agency wording', async () => {
  const concernsBefore = await getConcernsForCase('demo_case');
  const targetBefore = concernsBefore.find((c) => c.id === 'concern_02');
  const originalAgencyWording = targetBefore.agencyWording;

  const res = await flagMaterialHardshipConflation({
    concernId: 'concern_02',
    hardshipExplanation: 'Vehicle breakdown on regional highway; requested transit card from agency 5 days prior.',
    requestedEcsSupport: 'Regional transit pass or fuel voucher ($60)',
  });

  assert.equal(res.success, true);
  assert.equal(res.concern.materialHardshipConflationFlagged, true);
  assert.equal(res.concern.requestedEcsSupport, 'Regional transit pass or fuel voucher ($60)');
  assert.equal(res.concern.agencyWording, originalAgencyWording);

  const latestReply = res.concern.parentReplies[res.concern.parentReplies.length - 1];
  assert.equal(latestReply.replyType, 'poverty_or_barrier_context');
  assert.match(latestReply.parentStatement, /MATERIAL HARDSHIP \/ SYSTEMIC BARRIER CONTESTABILITY/);
});
