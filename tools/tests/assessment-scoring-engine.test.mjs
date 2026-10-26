import assert from 'node:assert/strict';
import test from 'node:test';
import { importTypeScriptModule } from './load-typescript-module.mjs';

const { scoreAssessment } = await importTypeScriptModule('../../lib/engines/assessmentScoringEngine.ts');
const {
  safeStepsCriticalOverrides,
  safeStepsDefaultResponses,
  safeStepsProtectiveCapacityDomains,
  safeStepsProtectiveCapacityItems,
  safeStepsScoringBands,
} = await importTypeScriptModule('../../lib/data/safeStepsAssessmentInstrument.ts');

const domains = [
  { id: 'safety', name: 'Safety', weight: 2 },
  { id: 'routines', name: 'Routines', weight: 1 },
];

const items = [
  {
    id: 'safety-1',
    domainId: 'safety',
    itemType: 'likert',
    weight: 1,
    options: [
      { id: 'safety-1-low', itemId: 'safety-1', label: 'Low', value: '0', score: 0 },
      { id: 'safety-1-high', itemId: 'safety-1', label: 'High', value: '4', score: 4 },
    ],
  },
  {
    id: 'routine-1',
    domainId: 'routines',
    itemType: 'numeric',
    weight: 1,
    maxValue: 10,
  },
];

const bands = [
  { id: 'critical', label: 'Critical', minScore: 0, maxScore: 49.99, recommendation: 'Review', requiresSupervisorReview: true },
  { id: 'supported', label: 'Supported', minScore: 50, maxScore: 100, recommendation: 'Continue' },
];

test('calculates normalized item scores and weights domain results', () => {
  const result = scoreAssessment({
    domains,
    items,
    responses: [
      { itemId: 'safety-1', selectedOptionId: 'safety-1-high' },
      { itemId: 'routine-1', numericValue: 5 },
    ],
    bands,
  });

  assert.equal(result.domainScores[0].score, 100);
  assert.equal(result.domainScores[1].score, 50);
  assert.equal(result.score, 83.33);
  assert.equal(result.band?.id, 'supported');
  assert.equal(result.coveragePercent, 100);
  assert.equal(result.decisionSupportOnly, true);
  assert.equal(result.humanReviewRequired, true);
});

test('excludes unanswered items from score but reports coverage', () => {
  const result = scoreAssessment({
    domains,
    items,
    responses: [{ itemId: 'safety-1', selectedOptionId: 'safety-1-high' }],
    bands,
  });

  assert.equal(result.score, 100);
  assert.equal(result.coveragePercent, 50);
  assert.equal(result.domainScores[1].score, null);
  assert.equal(result.domainScores[1].coveragePercent, 0);
});

test('returns no score or band when no responses are supplied', () => {
  const result = scoreAssessment({ domains, items, responses: [], bands });

  assert.equal(result.score, null);
  assert.equal(result.band, null);
  assert.equal(result.coveragePercent, 0);
});

test('critical overrides select their configured band and require review', () => {
  const result = scoreAssessment({
    domains,
    items,
    responses: [
      { itemId: 'safety-1', selectedOptionId: 'safety-1-low' },
      { itemId: 'routine-1', numericValue: 10 },
    ],
    bands,
    criticalOverrides: [{
      id: 'safety-override',
      itemId: 'safety-1',
      triggerOptionId: 'safety-1-low',
      forcedBandId: 'critical',
      reason: 'Unmanaged safety concern requires review.',
      requiresSupervisorReview: true,
    }],
  });

  assert.equal(result.score, 33.33);
  assert.equal(result.band?.id, 'critical');
  assert.equal(result.criticalOverridesApplied.length, 1);
  assert.equal(result.requiresSupervisorReview, true);
  assert.equal(result.recommendations.length, 2);
});

test('scores the existing SafeSteps protective-capacity instrument and applies its configured override', () => {
  const instrument = {
    domains: safeStepsProtectiveCapacityDomains,
    items: safeStepsProtectiveCapacityItems,
    responses: safeStepsDefaultResponses,
    bands: safeStepsScoringBands,
    criticalOverrides: safeStepsCriticalOverrides,
  };
  const result = scoreAssessment(instrument);

  assert.equal(result.answeredItems, safeStepsProtectiveCapacityItems.length);
  assert.equal(result.coveragePercent, 100);
  assert.equal(result.score !== null, true);
  assert.equal(result.criticalOverridesApplied.length, 0);
  assert.equal(result.decisionSupportOnly, true);
  assert.equal(result.humanReviewRequired, true);

  const unmanagedSafetyResponses = safeStepsDefaultResponses.map((response) => (
    response.itemId === 'active-safety-concern'
      ? { itemId: response.itemId, selectedOptionId: 'active-safety-concern-yes' }
      : response
  ));
  const overridden = scoreAssessment({ ...instrument, responses: unmanagedSafetyResponses });
  assert.equal(overridden.band?.id, 'critical-review');
  assert.equal(overridden.requiresSupervisorReview, true);
  assert.equal(overridden.criticalOverridesApplied[0].id, 'active-safety-concern-override');
});

test('rejects duplicate responses and out-of-range numeric responses', () => {
  assert.throws(() => scoreAssessment({
    domains,
    items,
    responses: [
      { itemId: 'safety-1', selectedOptionId: 'safety-1-high' },
      { itemId: 'safety-1', selectedOptionId: 'safety-1-low' },
    ],
    bands,
  }), /duplicate responses/);

  assert.throws(() => scoreAssessment({
    domains,
    items,
    responses: [{ itemId: 'routine-1', numericValue: 11 }],
    bands,
  }), /within 0 and 10/);
});

test('rejects overlapping scoring bands instead of choosing ambiguously', () => {
  assert.throws(() => scoreAssessment({
    domains,
    items,
    responses: [],
    bands: [
      { id: 'a', label: 'A', minScore: 0, maxScore: 60, recommendation: '' },
      { id: 'b', label: 'B', minScore: 60, maxScore: 100, recommendation: '' },
    ],
  }), /must not overlap/);
});
