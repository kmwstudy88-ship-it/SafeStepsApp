import { describe, expect, test } from '@jest/globals';
import { scoreCaseRisk, extractSignalsFromPayload } from '../../backend/case-risk/engine.js';
import { DEFAULT_RULES, rulesFromEnv } from '../../backend/case-risk/rules.js';

describe('case risk deterministic rules and engine', () => {
  test('returns baseline score for empty signals', () => {
    const result = scoreCaseRisk({});

    expect(result.score).toBe(DEFAULT_RULES.baseScore);
    expect(result.tier).toBe('low');
    expect(result.confidence).toBeLessThan(0.6);
    expect(result.hard_escalation.triggered).toBe(false);
    expect(result.rationale).toContain('Limited structured signals were available');
  });

  test('increases risk score with behavioral and contextual risk factors', () => {
    const result = scoreCaseRisk({
      behavioralCues: [
        { key: 'threat_or_fear_disclosure' }, // weight 28
        { key: 'coercive_control' }, // weight 18
      ],
      contextualFactors: [
        { key: 'prior_incidents' }, // weight 12
      ],
    });

    // 10 base + 28 + 18 + 12 = 68
    expect(result.score).toBe(68);
    expect(result.tier).toBe('high');
    expect(result.factors).toHaveLength(3);
    expect(result.rationale).toContain('Primary risk drivers');
  });

  test('applies protective factors to offset risk score', () => {
    const unmitigated = scoreCaseRisk({
      behavioralCues: [{ key: 'threat_or_fear_disclosure' }], // 10 + 28 = 38
    });

    const mitigated = scoreCaseRisk({
      behavioralCues: [{ key: 'threat_or_fear_disclosure' }], // 28
      protectiveFactors: [
        { key: 'engaged_support_network' }, // -12
        { key: 'safety_plan_in_place' }, // -10
      ],
    });

    expect(unmitigated.score).toBe(38);
    expect(mitigated.score).toBe(16); // 10 + 28 - 12 - 10 = 16
    expect(mitigated.tier).toBe('low');
    expect(mitigated.rationale).toContain('Protective offsets');
  });

  test('triggers hard escalation when immediate child safety danger is flagged', () => {
    const result = scoreCaseRisk({
      hardFlags: ['child_immediate_danger'],
    });

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.tier).toBe('critical');
    expect(result.hard_escalation.triggered).toBe(true);
    expect(result.hard_escalation.triggers[0].key).toBe('child_immediate_danger');
  });

  test('triggers hard escalation from weapon access', () => {
    const result = scoreCaseRisk({
      hardFlags: ['weapon_access'],
    });

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.tier).toBe('critical');
    expect(result.hard_escalation.triggered).toBe(true);
  });

  test('extractSignalsFromPayload normalizes document signals and payload cues', () => {
    const signals = extractSignalsFromPayload({
      behavioral_cues: ['threat_or_fear_disclosure'],
      contextual_factors: [{ key: 'unsafe_housing', note: 'Temporary shelter' }],
      document_signals: [
        { key: 'consistent_service_engagement', category: 'protective' },
      ],
      hard_flags: ['missing_child'],
    });

    expect(signals.behavioral).toHaveLength(1);
    expect(signals.behavioral[0].key).toBe('threat_or_fear_disclosure');
    expect(signals.contextual[0].key).toBe('unsafe_housing');
    expect(signals.protective[0].key).toBe('consistent_service_engagement');
    expect(signals.protective[0].source).toBe('document');
    expect(signals.hardFlags).toContain('missing_child');
  });

  test('rulesFromEnv falls back gracefully on invalid override json', () => {
    const original = process.env.CASE_RISK_RULE_OVERRIDES;
    try {
      process.env.CASE_RISK_RULE_OVERRIDES = '{invalid json';
      const rules = rulesFromEnv();
      expect(rules.version).toBe(DEFAULT_RULES.version);
      expect(rules.baseScore).toBe(DEFAULT_RULES.baseScore);
    } finally {
      process.env.CASE_RISK_RULE_OVERRIDES = original;
    }
  });

  test('provides follow-up templates mapped to risk tiers', () => {
    expect(DEFAULT_RULES.followUpTemplates.low).toBeDefined();
    expect(DEFAULT_RULES.followUpTemplates.moderate).toBeDefined();
    expect(DEFAULT_RULES.followUpTemplates.high).toBeDefined();
    expect(DEFAULT_RULES.followUpTemplates.critical).toBeDefined();

    const criticalTasks = DEFAULT_RULES.followUpTemplates.critical;
    expect(criticalTasks.some((t) => t.task_type === 'immediate_supervisor_review')).toBe(true);
  });
});
