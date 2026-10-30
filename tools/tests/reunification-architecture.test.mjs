import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  DEFAULT_CASE_ID,
  DEFAULT_TENANT_ID,
  getConcreteSupports,
  requestConcreteSupport,
  approveAndDisburseConcreteSupport,
  getCaseBarriers,
  recordServiceBarrierWithTimerPause,
  getParentPartners,
  getParentPartnerSessions,
  logParentPartnerSession,
  getFatherhoodEngagementAudit,
  recordFatherInclusiveAccommodation,
  getKinshipPlacementEquity,
  requestKinshipLicensingWaiverOrSupport,
  getPostReunificationPlan,
  logPostReunificationCheckIn,
} = await importTypeScriptModule('../../lib/reunification/reunificationArchitectureService.ts');

const {
  RELATIONAL_COACHING_PROMPTS,
  getCanonicalVisitRecords,
  createCanonicalVisitRecord,
} = await importTypeScriptModule('../../lib/contactVisit/contactVisitService.ts');

test('Economic & Concrete Supports (ECS) enforces canonical caseId/tenantId and tracks material stabilization', async () => {
  const initial = await getConcreteSupports(DEFAULT_CASE_ID);
  assert.ok(initial.length >= 2);
  assert.equal(initial[0].tenantId, DEFAULT_TENANT_ID);

  const created = await requestConcreteSupport({
    caseId: DEFAULT_CASE_ID,
    requestedByUserId: 'usr_parent_sarah',
    category: 'rent_arrears',
    title: 'Emergency Eviction Prevention Grant',
    description: 'Two weeks rent arrears relief after unexpected casual shift reduction.',
    amountCents: 85000,
    mitigatesRiskSignal: 'unsafe_housing',
  });

  assert.equal(created.success, true);
  assert.equal(created.record.status, 'requested');
  assert.equal(created.record.tenantId, DEFAULT_TENANT_ID);
  assert.equal(created.record.mitigatesRiskSignal, 'unsafe_housing');

  const disbursed = await approveAndDisburseConcreteSupport(
    DEFAULT_CASE_ID,
    created.record.id,
    'usr_worker_01'
  );
  assert.equal(disbursed.success, true);
  assert.equal(disbursed.record.status, 'disbursed');
  assert.ok(disbursed.record.disbursedAt);
});

test('Structural barrier logging automatically pauses compliance timers for agency waitlists and transit gaps', async () => {
  const result = await recordServiceBarrierWithTimerPause({
    caseId: DEFAULT_CASE_ID,
    linkedCasePlanActionId: 'act_01_03',
    barrierDomain: 'service_level_structural',
    barrierType: 'lack_of_public_transport',
    description: 'No weekend bus service between parent home and regional contact center.',
    mitigationPlan: 'Issue taxi voucher via ECS and relocate alternate visits to community library.',
  });

  assert.equal(result.success, true);
  assert.equal(result.barrier.complianceTimerPaused, true);
  assert.match(result.barrier.pauseReason, /not penalized for systemic delay/i);

  const barriers = await getCaseBarriers(DEFAULT_CASE_ID);
  assert.ok(barriers.some((b) => b.id === result.barrier.id));
});

test('Parent Partner peer mentorship logs non-surveilled confidential advocacy sessions', async () => {
  const partners = await getParentPartners();
  assert.ok(partners.length >= 2);

  const sessionRes = await logParentPartnerSession({
    caseId: DEFAULT_CASE_ID,
    parentPartnerId: partners[0].id,
    parentUserId: 'usr_parent_sarah',
    focusArea: 'court_hearing_preparation',
    summaryNote: 'Reviewed upcoming review hearing expectations, translated legal terms, and practiced self-advocacy.',
    parentHopeRating: 5,
  });

  assert.equal(sessionRes.success, true);
  assert.equal(sessionRes.session.nonSurveilledConfidential, true);
  assert.equal(sessionRes.session.parentHopeRating, 5);

  const sessions = await getParentPartnerSessions(DEFAULT_CASE_ID);
  assert.ok(sessions.some((s) => s.id === sessionRes.session.id));
});

test('Fatherhood engagement audit and kinship caregiver equity prevent paternal exclusion and licensing disparity', async () => {
  const fatherRes = await recordFatherInclusiveAccommodation(
    DEFAULT_CASE_ID,
    'Added video co-reading slot at 7:00 PM on Wednesdays during father regional work roster.'
  );
  assert.equal(fatherRes.success, true);
  assert.equal(fatherRes.audit.fatherIdentifiedInCaseParticipants, true);
  assert.equal(fatherRes.audit.workScheduleAccommodated, true);

  const kinshipBefore = await getKinshipPlacementEquity(DEFAULT_CASE_ID);
  const respiteBefore = kinshipBefore.respiteHoursAllocatedPerMonth;

  const kinshipRes = await requestKinshipLicensingWaiverOrSupport({
    caseId: DEFAULT_CASE_ID,
    barrierType: 'separate_bedroom_requirement',
    description: 'Sibling placement kept together in shared bedroom at Maternal Grandmother home.',
    requestFullStipendParity: true,
    additionalRespiteHours: 8,
  });

  assert.equal(kinshipRes.success, true);
  assert.equal(kinshipRes.equityRecord.stipendStatus, 'full_foster_parity');
  assert.equal(
    kinshipRes.equityRecord.monthlyStipendCents,
    kinshipRes.equityRecord.strangerFosterBenchmarkCents
  );
  assert.equal(kinshipRes.equityRecord.respiteHoursAllocatedPerMonth, respiteBefore + 8);
});

test('Post-reunification step-down plan prevents the service cliff with non-punitive check-ins', async () => {
  const checkInRes = await logPostReunificationCheckIn({
    caseId: DEFAULT_CASE_ID,
    phase: 'days_31_90_routine_stabilization',
    familyStabilityScore: 91,
    concreteNeedsIdentified: ['Continued school holiday care voucher'],
    supportProvided: 'Holiday care voucher approved via ECS; Parent Partner bi-weekly coffee check-in active.',
  });

  assert.equal(checkInRes.success, true);
  assert.equal(checkInRes.plan.currentPhase, 'days_31_90_routine_stabilization');
  assert.equal(checkInRes.plan.nonPunitiveSupportOnly, true);
  assert.equal(checkInRes.plan.ecsContinuityGuaranteed, true);
});

test('Canonical Contact Visit service provides ABC/PCIT coaching prompts and persists reflections', async () => {
  assert.equal(RELATIONAL_COACHING_PROMPTS.length, 4);

  const created = await createCanonicalVisitRecord({
    childName: 'Leo',
    coachingFocus: 'nurturance_during_distress',
    wentWell: 'Offered calm hug and soft tone when Leo felt sad about the visit ending.',
    supportNeed: 'Transition at 55 minutes was emotional.',
    nextStep: 'Bring matching knitted wristbands for our goodbye ritual next Tuesday.',
    postVisitTransitionPlan: 'Carer Anne will offer warm milo and quiet story time on arrival home.',
    transportSupportRequested: true,
  });

  assert.equal(created.success, true);
  assert.equal(created.record.transportSupportRequested, true);
  assert.equal(created.record.coachingFocus, 'nurturance_during_distress');

  const records = await getCanonicalVisitRecords();
  assert.ok(records.some((r) => r.id === created.record.id));
});

test('intensiveReunificationSupport data defines ABC-EC, PCIT, Parent Partner, and Poverty!=Neglect / Service Cliff models', async () => {
  const {
    intensiveReunificationPrograms,
    reunificationChallengeModels,
  } = await importTypeScriptModule('../../lib/data/intensiveReunificationSupport.ts');

  const programIds = intensiveReunificationPrograms.map((p) => p.id);
  assert.ok(programIds.includes('abc-ec'));
  assert.ok(programIds.includes('pcit'));
  assert.ok(programIds.includes('parent-partner'));

  const challengeIds = reunificationChallengeModels.map((c) => c.id);
  assert.ok(challengeIds.includes('poverty_neglect_conflation'));
  assert.ok(challengeIds.includes('post_reunification_cliff'));
});

test('parentLessonDefinitions includes full 9-page ABC-EC and PCIT PRIDE interactive workbooks', async () => {
  const {
    PARENT_LESSON_WORKBOOKS,
    getLessonWorkbookById,
  } = await importTypeScriptModule('../../lib/lessons/parentLessonDefinitions.ts');

  const abcWorkbook = getLessonWorkbookById('abc_ec_following_lead_and_nurturance');
  assert.equal(abcWorkbook.id, 'abc_ec_following_lead_and_nurturance');
  assert.match(abcWorkbook.title, /ABC-EC/);
  assert.equal(abcWorkbook.page4.pillars.length, 3);

  const pcitWorkbook = getLessonWorkbookById('pcit_pride_dyadic_play');
  assert.equal(pcitWorkbook.id, 'pcit_pride_dyadic_play');
  assert.match(pcitWorkbook.title, /PCIT/);
  assert.equal(pcitWorkbook.page4.pillars.length, 3);
  assert.ok(PARENT_LESSON_WORKBOOKS.length >= 7);
});

test('reunification_architecture_safeguards migration enforces canonical cases.id and platform_tenants.id foreign keys and RLS', async () => {
  const fs = await import('node:fs');
  const sql = fs.readFileSync(
    new URL('../../supabase/migrations/20261030014500_reunification_architecture_safeguards.sql', import.meta.url),
    'utf8'
  );

  assert.match(sql, /alter table if exists public\.community_service_referrals[\s\S]*add column if not exists tenant_id uuid references public\.platform_tenants\(id\)/i);
  assert.match(sql, /create table if not exists public\.case_concrete_support_requests/i);
  assert.match(sql, /create table if not exists public\.case_service_barrier_logs/i);
  assert.match(sql, /create table if not exists public\.case_parent_partner_sessions/i);
  assert.match(sql, /create table if not exists public\.case_post_reunification_step_down_plans/i);
  assert.match(sql, /references public\.cases\(id\)/i);
  assert.match(sql, /references public\.platform_tenants\(id\)/i);
  assert.equal(/reunification_cases/i.test(sql), false);
});

test('regulationScenarioEngine includes SCN-003 (ABC-EC Miscuing) and SCN-004 (Waitlist Tolling & ECS Advocacy)', async () => {
  const {
    BUILTIN_SCENARIOS,
    evaluateRegulationSimulation,
  } = await importTypeScriptModule('../../lib/engines/regulationScenarioEngine.ts');

  const scn3 = BUILTIN_SCENARIOS.find((s) => s.id === 'SCN-003');
  assert.ok(scn3);
  assert.match(scn3.title, /ABC-EC Miscuing/);

  const scn4 = BUILTIN_SCENARIOS.find((s) => s.id === 'SCN-004');
  assert.ok(scn4);
  assert.match(scn4.title, /Waitlist Tolling & Concrete Support/);

  const evalRes = evaluateRegulationSimulation({
    scenarioId: 'SCN-004',
    selectedChoices: [scn4.choices[0]],
    participantRole: 'Parent',
  });
  assert.equal(evalRes.overallProficiency, 'Sustained Under Stress');
});
