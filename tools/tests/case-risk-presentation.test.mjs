import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';

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
  assert.equal(summary.latest.cautionText, 'Rule-based decision support only; not a validated prediction or a substitute for human review.');
  assert.equal('confidenceText' in summary.latest, false);
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

test('risk screens do not present empty safety queues when backend data is unavailable', () => {
    const caseScreen = fs.readFileSync(new URL('../../app/cases/[id].tsx', import.meta.url), 'utf8');
    const supervisorScreen = fs.readFileSync(new URL('../../app/dashboard/supervisor.tsx', import.meta.url), 'utf8');
    assert.match(caseScreen, /disabled=\{loading \|\| recomputingRisk \|\| Boolean\(riskError\)\}/);
    assert.match(caseScreen, /!riskSummary\.hasError && !loading \?/);
    const caseQueueStart = caseScreen.indexOf('{!riskError && !loading ? <>');
    const caseQueueEnd = caseScreen.indexOf('</> : null}', caseQueueStart);
    assert.ok(caseQueueStart >= 0 && caseQueueEnd > caseQueueStart);
    const caseQueues = caseScreen.slice(caseQueueStart, caseQueueEnd);
    for (const title of ['Open Escalations', 'Follow-up Tasks', 'Recent Timeline Events']) {
      assert.ok(caseQueues.includes(title), title);
    }
    const supervisorStart = supervisorScreen.indexOf('{!error && !loading && dashboard ? <>');
    const supervisorEnd = supervisorScreen.indexOf('</> : null}', supervisorStart);
    assert.ok(supervisorStart >= 0 && supervisorEnd > supervisorStart);
    const supervisorQueues = supervisorScreen.slice(supervisorStart, supervisorEnd);
    for (const title of ['Highest-Risk Open Cases', 'Rising-Risk Cases', 'Open Escalations', 'Overdue Follow-Ups']) {
      assert.ok(supervisorQueues.includes(title), title);
    }
  });
