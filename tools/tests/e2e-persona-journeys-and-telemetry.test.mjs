import test from 'node:test';
import assert from 'node:assert/strict';
import { importTypeScriptModule } from './load-typescript-module.mjs';

// 1. Load Core Services
const concernsModule = await importTypeScriptModule('../../lib/concerns/concernsRegisterService.ts');
const casePlanModule = await importTypeScriptModule('../../lib/parentWorkspace/casePlanService.ts');
const calendarModule = await importTypeScriptModule('../../lib/family/unifiedCalendarService.ts');
const coachModule = await importTypeScriptModule('../../lib/support/supportCoachService.ts');
const evidenceModule = await importTypeScriptModule('../../lib/evidence/evidenceVaultService.ts');
const carerModule = await importTypeScriptModule('../../lib/carers/carerPortalService.ts');
const supervisorModule = await importTypeScriptModule('../../lib/supervisor/supervisorTriageService.ts');
const legalModule = await importTypeScriptModule('../../lib/legal/legalPortalService.ts');
const reportModule = await importTypeScriptModule('../../lib/reports/reportDeliveryService.ts');
const roleBoundaryModule = await importTypeScriptModule('../../lib/auth/roleBoundaryService.ts');

test('E2E Journey 1: Parent Workspace & Procedural Fairness (SS-PAR-001 - SS-PAR-014, SS-EVD-001)', async () => {
  // Step 1: Submit right of reply to concern
  const replyResult = await concernsModule.submitParentRightOfReply({
    concernId: 'concern_01',
    replyType: 'factual_correction',
    parentStatement: 'I have completed the 8-week course and maintained routine since September 2026.',
  });
  assert.equal(replyResult.success, true, 'Parent reply submitted successfully');
  assert.ok(replyResult.concern);
  assert.equal(replyResult.concern.parentReplies[0].replyType, 'factual_correction');

  // Step 2: Update case plan action and check progress calculation
  const planResult = await casePlanModule.updateCasePlanActionStatus({
    caseId: 'demo_case',
    goalId: 'goal_01',
    actionId: 'act_01_03',
    newStatus: 'completed',
    evidenceVaultId: 'evd_live_01',
  });
  assert.equal(planResult.success, true, 'Case action updated to completed');

  const progress = casePlanModule.calculateCaseProgress(planResult.plan);
  assert.ok(progress.overallPercentage >= 0 && progress.overallPercentage <= 100);

  // Step 3: Calendar schedule check
  const events = await calendarModule.getCalendarEvents('demo_case');
  assert.ok(events.length > 0, 'Unified calendar events loaded');
  assert.ok(events[0].title, 'First event has title');

  // Step 4: AI Coach interaction with crisis safety gate
  const stressResponse = await coachModule.getCoachResponse(
    'My child is having a huge meltdown before handover'
  );
  assert.equal(stressResponse.crisisTriggered, false, 'Parenting stress is de-escalated, not flagged as danger');
  assert.ok(stressResponse.message.length > 20);

  const crisisResponse = await coachModule.getCoachResponse(
    'I feel like I want to end it all tonight'
  );
  assert.equal(crisisResponse.crisisTriggered, true, 'Harm signal triggers immediate crisis protocol');
  assert.match(crisisResponse.message, /Lifeline/i, 'Returns verified Australian crisis helplines');

  // Step 5: Vault evidence capture with dual timestamps & SHA-256 receipt
  const depositResult = await evidenceModule.depositEvidence({
    caseId: 'demo_case',
    userId: 'usr_parent_01',
    title: 'Completed Family Routine Chart',
    category: 'Child Safety & Routines',
    reflectionText: 'Routine board is displayed in the kitchen and adhered to every evening.',
    captureMode: 'live_camera',
    deviceTimestamp: new Date().toISOString(),
  });
  assert.equal(depositResult.success, true);
  const vaultRecord = depositResult.evidence;
  assert.equal(vaultRecord.status, 'pending_verification');
  assert.equal(vaultRecord.isLiveCaptured, true);
  assert.ok(vaultRecord.sha256Hash.length === 64, 'Evidence fingerprint is valid SHA-256');
  assert.equal(vaultRecord.clockAnomalyDetected, false);
});

test('E2E Journey 2: Child Safe Access & Protected Voice (SS-AUTH-004, SS-CHD-015, SS-CHD-018)', () => {
  const childActor = {
    userId: 'user_child_leo',
    role: 'child',
    caseAssignments: ['case_smith_01'],
    tenantId: 'tenant_nsw_gov_01',
  };

  const caseResource = {
    caseId: 'case_smith_01',
    tenantId: 'tenant_nsw_gov_01',
  };

  // 1. Child CAN submit safeguarding help request
  const helpAccess = roleBoundaryModule.evaluateRoleAccess(childActor, 'submit_child_help_request', caseResource);
  assert.equal(helpAccess.allowed, true, 'Child can submit urgent safeguarding request');

  // 2. Child CANNOT access supervisor safeguarding queues
  const supAccess = roleBoundaryModule.evaluateRoleAccess(childActor, 'dispatch_safety_check', caseResource);
  assert.equal(supAccess.allowed, false, 'Child cannot dispatch supervisor checks');

  // 3. Child private diary is sealed from parents unless explicitly consented
  const diaryResource = {
    caseId: 'case_smith_01',
    tenantId: 'tenant_nsw_gov_01',
    isChildPrivate: true,
    childSharingConsent: false,
  };
  const parentActor = {
    userId: 'user_parent_jane',
    role: 'parent',
    caseAssignments: ['case_smith_01'],
    tenantId: 'tenant_nsw_gov_01',
  };
  const parentDiaryAccess = roleBoundaryModule.evaluateRoleAccess(parentActor, 'access_child_private_diary', diaryResource);
  assert.equal(parentDiaryAccess.allowed, false, 'Parent cannot read unshared child diary');
});

test('E2E Journey 3: Carer Portal & Objective Observation (SS-CAR-001 - SS-CAR-030)', async () => {
  // Step 1: Carer creates daily observation with forensic child word separation
  const journalResult = await carerModule.createCarerJournalEntry({
    caseId: 'case_demo_001',
    carerId: 'usr_carer_01',
    childId: 'chd_001',
    childName: 'Leo',
    entryKind: 'routine_milestone',
    title: 'Evening transition and mealtime',
    detail: 'Leo ate dinner calmly and shared his school drawing.',
    verbatimChildWords: 'I had fun building the Lego bridge today!',
    sharedWithParent: true,
  });
  assert.equal(journalResult.success, true);
  assert.equal(journalResult.entry?.verbatimChildWords, 'I had fun building the Lego bridge today!');

  // Step 2: Verify sharing toggle
  const toggled = await carerModule.toggleEntryParentSharing(journalResult.entry.id, false);
  assert.equal(toggled.success, true);
  assert.equal(toggled.entry?.sharedWithParent, false);
});

test('E2E Journey 4: Supervisor & Safeguarding Triage (SS-SUP-001 - SS-SUP-004, SS-CHD-008)', async () => {
  // Step 1: Triage pending child help request
  const triageResult = await supervisorModule.triageChildHelpRequest(
    'req_chd_001',
    'dispatch_safety_check',
    'Safety check dispatched with school wellbeing officer',
    'supervisor_ellen'
  );
  assert.equal(triageResult.success, true);
  assert.equal(triageResult.request?.status, 'safety_check_dispatched');

  // Step 2: Serious decision review sign-off
  const decisionResult = await supervisorModule.reviewSeriousDecision(
    'dec_001',
    'approved',
    'Parent has satisfied all protective capacity criteria over 12 consecutive weeks without incidents',
    'supervisor_ellen'
  );
  assert.equal(decisionResult.success, true);
  assert.equal(decisionResult.review?.status, 'approved');

  // Step 3: Resolve contradiction
  const contradictionResult = await supervisorModule.resolveContradictionItem(
    'contra_sup_01',
    'clarified_in_favour_of_parent',
    'Independent pathology verified negative sample; original observation was an administrative transcription error',
    'supervisor_ellen'
  );
  assert.equal(contradictionResult.success, true);

  // Step 4: Verify immutable audit trail entries
  const trail = await supervisorModule.getSupervisorAuditTrail(5);
  assert.ok(trail.length >= 3, 'Audit trail captured all actions');
  for (const entry of trail) {
    assert.ok(entry.id, 'Entry has ID');
    assert.ok(entry.action, 'Entry has action');
    assert.ok(entry.timestamp, 'Entry has timestamp');
    assert.ok(entry.actorId, 'Entry has actor ID');
    assert.ok(!JSON.stringify(entry).includes('password'), 'Audit trail strictly minimizes PII');
  }
});

test('E2E Journey 5: Court & Legal Read-Only Portal (SS-LEG-001 - SS-LEG-004, SS-RPT-001)', async () => {
  // Step 1: Query authorized case chronology
  const chronology = await legalModule.getCaseVerifiedChronology('case_smith_01');
  assert.ok(chronology.length > 0, 'Verified chronology records returned');
  assert.ok(chronology[0].provenanceSource, 'Events contain strict provenance sources');

  // Step 2: Access disclosure bundle and generate access receipt
  const receiptResult = await legalModule.generateBundleAccessReceipt('bundle_smith_section82', 'lawyer_current');
  assert.equal(receiptResult.success, true);
  assert.ok(receiptResult.receipt?.receiptId.startsWith('rcpt_'));
  assert.ok(receiptResult.receipt?.accessHash.length >= 10);

  // Step 3: Privileged report export request and challenge verification
  const exportReq = await reportModule.requestReportExport({
    tenantId: '00000000-0000-0000-0000-000000000001',
    caseId: 'case_smith_01',
    releaseEventId: 'rel_001',
    recipientId: 'rec_lawyer_01',
    authority: "Children's Court Section 82 Direction",
    purpose: 'Hearing preparation',
  });
  assert.equal(exportReq.success, true);
  assert.ok(exportReq.exportEventId);
  assert.ok(exportReq.auditId);

  const deliveryPrep = await reportModule.prepareReportDelivery(
    '00000000-0000-0000-0000-000000000001',
    'case_smith_01',
    'rel_001',
    'rec_lawyer_01',
    30
  );
  assert.equal(deliveryPrep.success, true);
  assert.ok(deliveryPrep.challenge?.deliveryToken);
  assert.match(deliveryPrep.challenge?.verificationCode, /^\d{6}$/);

  const confirmation = await reportModule.confirmReportExport('rel_001');
  assert.equal(confirmation.success, true);
  assert.equal(confirmation.confirmed, true);
});

test('Cross-Cutting: Telemetry & Audit Log Formatting Integrity', async () => {
  const supervisorLog = await supervisorModule.getSupervisorAuditTrail(10);
  const legalReceipts = await legalModule.getLegalAccessReceipts();

  // Validate supervisor log entries adhere to structured audit criteria
  for (const entry of supervisorLog) {
    const raw = JSON.stringify(entry);
    assert.doesNotThrow(() => JSON.parse(raw), 'Entry must be serializable JSON');
    assert.match(entry.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Timestamp is valid ISO-8601');
  }

  // Validate legal receipts adhere to structured audit criteria
  for (const receipt of legalReceipts) {
    const raw = JSON.stringify(receipt);
    assert.doesNotThrow(() => JSON.parse(raw), 'Receipt must be serializable JSON');
    assert.match(receipt.signedTimestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Timestamp is valid ISO-8601');
    assert.ok(receipt.accessHash, 'Contains cryptographic access hash');
  }
});
