import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { scoreCaseRisk } = require('../../backend/case-risk/engine.js');
const { DEFAULT_RULES } = require('../../backend/case-risk/rules.js');

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

test('scoreCaseRisk forces critical tier for every hard escalation signal', () => {
  for (const signal of [
    'child_immediate_danger',
    'credible_threat_to_life',
    'weapon_access',
    'missing_child',
    'suicidal_statement',
  ]) {
    const result = scoreCaseRisk({
      behavioralCues: ['missed_contact'],
      hardFlags: [signal],
    });
    assert.equal(result.tier, 'critical');
    assert.equal(result.hard_escalation.triggered, true);
    assert.ok(result.hard_escalation.triggers.some((trigger) => trigger.key === signal));
  }
});

test('scoreCaseRisk applies tier thresholds at boundary values', () => {
  const thresholdRules = {
    ...DEFAULT_RULES,
    weights: {
      behavioral: {
        edge_14: 14,
        edge_15: 15,
        edge_39: 39,
        edge_40: 40,
        edge_64: 64,
        edge_65: 65,
      },
      contextual: {},
      protective: {},
      trends: DEFAULT_RULES.weights.trends,
    },
  };
  const scoreWith = (key) => scoreCaseRisk({ behavioralCues: [key] }, { rules: thresholdRules });

  assert.equal(scoreWith('edge_14').score, 24);
  assert.equal(scoreWith('edge_14').tier, 'low');
  assert.equal(scoreWith('edge_15').score, 25);
  assert.equal(scoreWith('edge_15').tier, 'moderate');
  assert.equal(scoreWith('edge_39').score, 49);
  assert.equal(scoreWith('edge_39').tier, 'moderate');
  assert.equal(scoreWith('edge_40').score, 50);
  assert.equal(scoreWith('edge_40').tier, 'high');
  assert.equal(scoreWith('edge_64').score, 74);
  assert.equal(scoreWith('edge_64').tier, 'high');
  assert.equal(scoreWith('edge_65').score, 75);
  assert.equal(scoreWith('edge_65').tier, 'critical');
});

test('scoreCaseRisk uses protective factors to reduce severity', () => {
  const withoutProtective = scoreCaseRisk({
    behavioralCues: ['threat_or_fear_disclosure'],
    contextualFactors: ['prior_incidents'],
  });
  const withProtective = scoreCaseRisk({
    behavioralCues: ['threat_or_fear_disclosure'],
    contextualFactors: ['prior_incidents'],
    protectiveFactors: ['engaged_support_network', 'safety_plan_in_place'],
  });

  assert.equal(withoutProtective.tier, 'high');
  assert.equal(withProtective.tier, 'moderate');
  assert.ok(withProtective.score < withoutProtective.score);
  assert.match(withProtective.rationale, /Protective offsets/);
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

test('scoreCaseRisk applies repeated-event trend boosts when thresholds are crossed', () => {
  const now = new Date();
  const iso = (daysAgo) => new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString();
  const result = scoreCaseRisk({
    recentEvents: [
      { created_at: iso(1), payload: { behavioral_cues: ['threat_or_fear_disclosure'] } },
      { created_at: iso(2), payload: { behavioral_cues: ['threat_or_fear_disclosure'] } },
      { created_at: iso(3), payload: { behavioral_cues: ['threat_or_fear_disclosure'] } },
    ],
  });
  const trendKeys = result.factors.filter((item) => item.category === 'trend').map((item) => item.key);
  assert.deepEqual(trendKeys.sort(), ['repeated_acute_events_7d', 'repeated_events_30d', 'repeated_same_signal'].sort());
});
