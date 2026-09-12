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
