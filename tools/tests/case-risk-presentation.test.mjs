import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildCaseRiskSummary } = require('../../lib/caseRiskPresentation.js');

test('buildCaseRiskSummary formats the latest snapshot for case detail display', () => {
  const summary = buildCaseRiskSummary({
    riskHistory: [{
      score: 82,
      tier: 'critical',
      confidence: 0.83,
      rationale: 'Recent pattern pressure.',
      model_version: 'risk-rules-v1',
    }],
  });

  assert.equal(summary.hasError, false);
  assert.equal(summary.latest.title, 'CRITICAL · Score 82');
  assert.equal(summary.latest.confidenceText, 'Confidence: 83%');
  assert.equal(summary.latest.rulesText, 'Rules: risk-rules-v1');
});

test('buildCaseRiskSummary surfaces risk workflow load failures without hiding the state', () => {
  const summary = buildCaseRiskSummary({ riskError: 'Backend unavailable' });

  assert.equal(summary.hasError, true);
  assert.equal(summary.errorText, 'Risk workflow data unavailable: Backend unavailable');
  assert.equal(summary.latest, null);
});

test('buildCaseRiskSummary tolerates partial snapshot payloads', () => {
  const summary = buildCaseRiskSummary({
    riskHistory: [{ score: null, tier: null, confidence: 0, rationale: '', model_version: null }],
  });

  assert.equal(summary.hasError, false);
  assert.equal(summary.latest.title, 'UNKNOWN · Score n/a');
  assert.equal(summary.latest.rationaleText, 'No rationale available.');
  assert.equal(summary.latest.rulesText, 'Rules: unknown');
});
