import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { scoreCaseRisk } = require('../../backend/case-risk/engine.js');

test('scoreCaseRisk honors deterministic tier boundaries', () => {
  const low = scoreCaseRisk({});
  assert.equal(low.score, 10);
  assert.equal(low.tier, 'low');

  const moderate = scoreCaseRisk({
    behavioralCues: ['missed_contact', 'isolation'],
  });
  assert.equal(moderate.score, 28);
  assert.equal(moderate.tier, 'moderate');

  const high = scoreCaseRisk({
    behavioralCues: ['coercive_control', 'child_distress'],
    contextualFactors: ['prior_incidents'],
  });
  assert.equal(high.score, 56);
  assert.equal(high.tier, 'high');

  const critical = scoreCaseRisk({
    behavioralCues: ['threat_or_fear_disclosure', 'escalating_violence'],
    contextualFactors: ['prior_incidents'],
  });
  assert.equal(critical.score, 76);
  assert.equal(critical.tier, 'critical');
});

test('scoreCaseRisk applies hard escalation independent of score threshold', () => {
  const result = scoreCaseRisk({
    behavioralCues: ['missed_contact'],
    hardFlags: ['missing_child'],
  });

  assert.equal(result.tier, 'critical');
  assert.equal(result.hard_escalation.triggered, true);
  assert.equal(result.score >= 90, true);
  assert.deepEqual(result.hard_escalation.triggers.map((item) => item.key), ['missing_child']);
});

test('scoreCaseRisk includes recent trend and document-derived signal factors', () => {
  const now = new Date().toISOString();
  const result = scoreCaseRisk({
    recentEvents: [
      {
        created_at: now,
        payload: {
          behavioral_cues: ['threat_or_fear_disclosure'],
          doc_signals: [{ key: 'weapon_access', category: 'contextual', source: 'document' }],
        },
      },
      {
        created_at: now,
        payload: {
          behavioral_cues: ['threat_or_fear_disclosure'],
          doc_signals: [{ key: 'unsafe_housing', category: 'contextual', source: 'document' }],
        },
      },
      {
        created_at: now,
        payload: {
          behavioral_cues: ['threat_or_fear_disclosure'],
        },
      },
    ],
  });

  const trendKeys = result.factors.filter((item) => item.category === 'trend').map((item) => item.key);
  assert.deepEqual(trendKeys.sort(), ['multiple_document_signals', 'repeated_acute_events_7d', 'repeated_events_30d', 'repeated_same_signal'].sort());
  assert.match(result.rationale, /Recent pattern pressure/);
});
