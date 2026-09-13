import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  scoreForensicCriteriaAssessment,
  FORENSIC_CRITERIA_DOMAINS,
} = require('../../shared/forensicCriteriaModel.js');

test('forensic criteria scoring returns ML-ready high concern output', () => {
  const responses = {};

  for (const domain of FORENSIC_CRITERIA_DOMAINS) {
    for (const signal of domain.signals) {
      responses[signal.id] = signal.effect === 'risk' ? 3 : 0;
    }
    for (const flag of domain.riskFlags) responses[flag.id] = true;
    for (const flag of domain.protectiveFlags) responses[flag.id] = false;
  }

  const result = scoreForensicCriteriaAssessment(responses);
  assert.equal(result.level, 'critical');
  assert.equal(result.adjusted_concern_score > 75, true);
  assert.equal(typeof result.ml_payload.feature_vector.fear_index, 'number');
  assert.equal(result.ml_payload.feature_vector.interaction_distress_ignored, 1);
  assert.equal(result.ml_payload.feature_vector.interaction_consistent_soothing, 0);
  assert.deepEqual(result.domains.length, FORENSIC_CRITERIA_DOMAINS.length);
});

test('forensic criteria contradictions and bias reduce adjusted score and confidence', () => {
  const baseline = scoreForensicCriteriaAssessment({
    fear_index: 3,
    hypervigilance_markers: 2,
    child_distress_unaddressed: true,
    attuned_eye_contact: 0,
    responsiveness_latency: 0,
    warmth_index: 0,
    irritation_markers: 3,
    comfort_seeking_success: 0,
  });

  const adjusted = scoreForensicCriteriaAssessment({
    fear_index: 3,
    hypervigilance_markers: 2,
    child_distress_unaddressed: true,
    attuned_eye_contact: 0,
    responsiveness_latency: 0,
    warmth_index: 0,
    irritation_markers: 3,
    comfort_seeking_success: 0,
    contradiction_observed_vs_reported: true,
    contradiction_timeline_gaps: true,
    bias_adult_centric_framing: true,
  });

  assert.equal(adjusted.adjusted_concern_score < adjusted.raw_concern_score, true);
  assert.equal(adjusted.adjusted_concern_score < baseline.adjusted_concern_score, true);
  assert.equal(adjusted.confidence < baseline.confidence, true);
  assert.equal(adjusted.court_defensibility.status, 'review_required');
});

test('forensic criteria supports partial scoring and emits explicit zero-value flags', () => {
  const result = scoreForensicCriteriaAssessment({
    fear_index: 2,
  });

  assert.equal(typeof result.adjusted_concern_score, 'number');
  assert.equal(result.coverage_score > 0, true);
  assert.equal(result.ml_payload.feature_vector.interaction_distress_ignored, 0);
  assert.equal(result.ml_payload.feature_vector.interaction_consistent_soothing, 0);
  assert.equal(result.ml_payload.feature_vector.contradiction_observed_vs_reported, 0);
});

test('forensic criteria ignores invalid signal values and non-boolean flag inputs', () => {
  const result = scoreForensicCriteriaAssessment({
    fear_index: 4,
    warmth_index: -1,
    child_distress_unaddressed: 'true',
    interaction_consistent_soothing: 1,
    contradiction_observed_vs_reported: 'yes',
  });

  assert.equal(result.coverage_score, 0);
  assert.equal(result.ml_payload.feature_vector.fear_index, null);
  assert.equal(result.ml_payload.feature_vector.warmth_index, null);
  assert.equal(result.ml_payload.feature_vector.child_distress_unaddressed, 0);
  assert.equal(result.ml_payload.feature_vector.interaction_consistent_soothing, 0);
  assert.equal(result.ml_payload.feature_vector.contradiction_observed_vs_reported, 0);
});

test('forensic criteria court defensibility reflects coverage and reliability penalties', () => {
  const completeNoPenaltyResponses = {};
  for (const domain of FORENSIC_CRITERIA_DOMAINS) {
    for (const signal of domain.signals) completeNoPenaltyResponses[signal.id] = 1;
  }

  const strong = scoreForensicCriteriaAssessment(completeNoPenaltyResponses);
  assert.equal(strong.court_defensibility.status, 'strong');
  assert.match(strong.court_defensibility.reasons[0], /complete and internally coherent/i);

  const adequate = scoreForensicCriteriaAssessment({
    ...completeNoPenaltyResponses,
    bias_adult_centric_framing: true,
  });
  assert.equal(adequate.court_defensibility.status, 'adequate');

  const reviewRequired = scoreForensicCriteriaAssessment({});
  assert.equal(reviewRequired.court_defensibility.status, 'review_required');
});

test('forensic criteria limits reliability adjustment and keeps top-three priority domains', () => {
  const responses = {
    contradiction_observed_vs_reported: true,
    contradiction_timeline_gaps: true,
    contradiction_material_context_missing: true,
    bias_judgmental_language: true,
    bias_adult_centric_framing: true,
    bias_cultural_context_gap: true,
  };

  for (const domain of FORENSIC_CRITERIA_DOMAINS) {
    for (const signal of domain.signals) responses[signal.id] = signal.effect === 'risk' ? 3 : 0;
    for (const flag of domain.riskFlags) responses[flag.id] = true;
    for (const flag of domain.protectiveFlags) responses[flag.id] = false;
  }

  const result = scoreForensicCriteriaAssessment(responses);
  const expectedAdjustmentFactor = Math.max(
    0.72,
    Math.min(1, 1 - (result.contradiction_penalty * 0.0045) - (result.bias_penalty * 0.004))
  );
  assert.equal(result.adjusted_concern_score, Math.round(result.raw_concern_score * expectedAdjustmentFactor * 100) / 100);
  assert.equal(expectedAdjustmentFactor >= 0.72, true);
  assert.equal(result.child_centred_priority_domains.length, 3);
});
