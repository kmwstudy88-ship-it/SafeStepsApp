import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTypeScriptModule } from './load-typescript-module.mjs';

const { buildRecognitionSupportPlan } = await importTypeScriptModule('../../lib/engines/recognitionSupportEngine.ts');
const {
  saferInformationCategories,
  classifySaferEvidence,
  classifySaferEvidenceBatch,
  computeSaferEvidenceCoverage,
  computeSaferGuidedJudgement,
} = await importTypeScriptModule('../../lib/engines/saferAssessmentEngine.ts');

test('buildRecognitionSupportPlan flags required and recommended cultural safety and accessibility gaps', () => {
  const plan = buildRecognitionSupportPlan({
    culturalSafety: {
      childIdentifiedAsAboriginalOrTorresStraitIslander: true,
      culturalIdentityRecorded: false,
      culturalPlanRecorded: false,
      familyCommunityConnectionsRecorded: false,
      aboriginalControlledServiceInvolved: false,
      culturalPlanReviewDate: '2020-01-01T00:00:00.000Z',
    },
    accessibility: {
      disabilityOrAccessNeedIdentified: true,
      communicationPreferenceRecorded: false,
      easyReadRequired: true,
      easyReadProvided: false,
      supportPersonOffered: false,
      reasonableAdjustmentsRecorded: false,
    },
  });

  assert.equal(plan.culturalSafetyRequired, true);
  assert.equal(plan.accessibilityRequired, true);
  assert.equal(plan.complete, false);
  assert.equal(plan.reviewRequired, true);
  assert.deepEqual(
    plan.gaps.map((gap) => gap.id),
    [
      'cultural-identity',
      'cultural-plan',
      'family-community-connections',
      'aboriginal-controlled-service',
      'cultural-plan-review',
      'communication-preference',
      'easy-read',
      'support-person',
      'reasonable-adjustments',
    ],
  );
  assert.deepEqual(plan.evidenceTags, ['cultural_safety', 'accessibility', 'easy_read']);
});

test('buildRecognitionSupportPlan marks plan complete when all required cultural and accessibility checks are recorded', () => {
  const futureDate = new Date(Date.now() + 86_400_000 * 30).toISOString();
  const plan = buildRecognitionSupportPlan({
    culturalSafety: {
      childIdentifiedAsAboriginalOrTorresStraitIslander: true,
      culturalIdentityRecorded: true,
      culturalPlanRecorded: true,
      familyCommunityConnectionsRecorded: true,
      aboriginalControlledServiceInvolved: true,
      culturalPlanReviewDate: futureDate,
    },
    accessibility: {
      disabilityOrAccessNeedIdentified: true,
      communicationPreferenceRecorded: true,
      easyReadRequired: true,
      easyReadProvided: true,
      supportPersonOffered: true,
      reasonableAdjustmentsRecorded: true,
    },
  });

  assert.equal(plan.complete, true);
  assert.equal(plan.reviewRequired, false);
  assert.equal(plan.gaps.length, 0);
  assert.deepEqual(plan.evidenceTags, [
    'cultural_safety',
    'accessibility',
    'easy_read',
    'aboriginal_controlled_service',
  ]);
});

test('classifySaferEvidence and computeSaferEvidenceCoverage classify evidence across manual, keyword, and source rules', () => {
  const items = [
    {
      id: 'ev-1',
      title: 'Child school and sleep routine note',
      notes: 'Parent completed safety plan with cultural elder and care team support',
      sourceType: 'worker_observation',
    },
    {
      id: 'ev-2',
      title: 'Kinship household reflection',
      notes: 'Family violence intervention order and NDIS disability support',
      sourceType: 'parent_reflection',
      manualCategories: ['family'],
      manualFlags: ['housing_instability'],
    },
  ];

  const classifications = classifySaferEvidenceBatch(items);
  assert.equal(classifications[0].confidence, 'keyword');
  assert.equal(classifications[1].confidence, 'manual');
  assert.ok(classifications[1].specialistFlags.includes('family_violence'));
  assert.ok(classifications[1].specialistFlags.includes('disability'));
  assert.ok(classifications[1].specialistFlags.includes('housing_instability'));

  const coverage = computeSaferEvidenceCoverage(classifications);
  assert.deepEqual(coverage.presentCategories, [...saferInformationCategories].sort());
  assert.deepEqual(coverage.missingCategories, []);
  assert.equal(coverage.evidenceCoverageScore, 100);
});

test('computeSaferGuidedJudgement enforces practitioner review on draft state, high risk, or recognition gaps', () => {
  const fullClassification = classifySaferEvidence({
    id: 'ev-full',
    title: 'Full domain summary',
    notes: 'child parent family cultural community risk strength safety',
    sourceType: 'worker_observation',
  });

  const reviewedLowRisk = computeSaferGuidedJudgement({
    consequenceOfHarm: 20,
    probabilityOfHarm: 20,
    protectiveCapacity: 85,
    demonstratedSafety: 85,
    evidenceGapCount: 0,
    classifications: [fullClassification],
    reviewState: 'reviewed',
  });

  assert.equal(reviewedLowRisk.requiredReview, false);
  assert.equal(reviewedLowRisk.flags.length, 0);
  assert.match(reviewedLowRisk.recommendation, /sufficiently covered for reviewed decision-support/i);

  const recognitionPlanWithGap = buildRecognitionSupportPlan({
    culturalSafety: {
      childIdentifiedAsAboriginalOrTorresStraitIslander: true,
      culturalIdentityRecorded: false,
      culturalPlanRecorded: true,
      familyCommunityConnectionsRecorded: true,
      aboriginalControlledServiceInvolved: true,
    },
    accessibility: {
      disabilityOrAccessNeedIdentified: false,
      communicationPreferenceRecorded: false,
      easyReadRequired: false,
      easyReadProvided: false,
      supportPersonOffered: false,
      reasonableAdjustmentsRecorded: false,
    },
  });

  const gatedResult = computeSaferGuidedJudgement({
    consequenceOfHarm: 80,
    probabilityOfHarm: 70,
    protectiveCapacity: 60,
    demonstratedSafety: 60,
    evidenceGapCount: 2,
    classifications: [],
    reviewState: 'draft',
    recognitionSupportPlan: recognitionPlanWithGap,
  });

  assert.equal(gatedResult.requiredReview, true);
  assert.ok(gatedResult.riskScore >= 65);
  assert.ok(gatedResult.flags.some((flag) => flag.includes('High risk judgement requires supervisor review')));
  assert.ok(gatedResult.flags.some((flag) => flag.includes('Missing SAFER evidence categories')));
  assert.ok(gatedResult.flags.some((flag) => flag.includes('2 evidence gap(s) remain unresolved')));
  assert.ok(gatedResult.flags.some((flag) => flag.includes("Record the child's cultural identity")));
  assert.ok(gatedResult.flags.some((flag) => flag.includes('Assessment is draft')));
  assert.match(gatedResult.recommendation, /Use as decision-support only/i);
});
