'use strict';

const { rulesFromEnv } = require('./rules');

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function normalizeFactor(input, category) {
  if (!input) return null;
  if (typeof input === 'string') return { key: input, category, source: 'event' };
  if (typeof input === 'object' && typeof input.key === 'string') {
    return {
      key: input.key,
      category,
      source: input.source || 'event',
      note: input.note || null,
      confidence: typeof input.confidence === 'number' ? input.confidence : null,
    };
  }
  return null;
}

function normalizeHardFlags(value) {
  const entries = [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') entries.push(item);
      if (item && typeof item === 'object' && typeof item.key === 'string') entries.push(item.key);
    }
    return entries;
  }
  if (value && typeof value === 'object') {
    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) entries.push(key);
    }
  }
  return entries;
}

function extractSignalsFromPayload(payload = {}) {
  const docSignals = toArray(payload.doc_signals || payload.document_signals).map((item) => {
    if (!item || typeof item !== 'object' || typeof item.key !== 'string') return null;
    return normalizeFactor({ ...item, source: item.source || 'document' }, item.category || 'behavioral');
  }).filter(Boolean);

  return {
    behavioral: [
      ...toArray(payload.behavioral_cues).map((item) => normalizeFactor(item, 'behavioral')),
      ...docSignals.filter((item) => item.category === 'behavioral'),
    ].filter(Boolean),
    contextual: [
      ...toArray(payload.contextual_factors).map((item) => normalizeFactor(item, 'contextual')),
      ...docSignals.filter((item) => item.category === 'contextual'),
    ].filter(Boolean),
    protective: [
      ...toArray(payload.protective_factors).map((item) => normalizeFactor(item, 'protective')),
      ...docSignals.filter((item) => item.category === 'protective'),
    ].filter(Boolean),
    hardFlags: normalizeHardFlags(payload.hard_flags || payload.hard_escalation_flags),
  };
}

function startOfWindow(days) {
  return Date.now() - (days * 24 * 60 * 60 * 1000);
}

function dateMs(value) {
  const parsed = Date.parse(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateTrendAdjustments(events, rules) {
  const last7d = startOfWindow(7);
  const last30d = startOfWindow(30);
  const acuteSignals = new Set([
    'threat_or_fear_disclosure',
    'escalating_violence',
    'suicidal_statement',
    'self_harm_indicator',
    'weapon_access',
    'credible_threat_to_life',
    'child_immediate_danger',
    'missing_child',
  ]);

  let acuteCount7d = 0;
  let eventCount30d = 0;
  const signalCounts = new Map();
  let documentSignals = 0;

  for (const event of events) {
    const createdAt = dateMs(event.created_at || event.createdAt);
    if (createdAt >= last30d) eventCount30d += 1;
    const extracted = extractSignalsFromPayload(event.payload || {});
    for (const factor of [...extracted.behavioral, ...extracted.contextual]) {
      if (createdAt >= last7d && acuteSignals.has(factor.key)) acuteCount7d += 1;
      signalCounts.set(factor.key, (signalCounts.get(factor.key) || 0) + 1);
      if (factor.source === 'document') documentSignals += 1;
    }
    for (const key of extracted.hardFlags) {
      if (createdAt >= last7d && acuteSignals.has(key)) acuteCount7d += 1;
      signalCounts.set(key, (signalCounts.get(key) || 0) + 1);
    }
  }

  const trendFactors = [];
  if (acuteCount7d >= 2) {
    trendFactors.push({ key: 'repeated_acute_events_7d', category: 'trend', weight: rules.weights.trends.repeated_acute_events_7d, direction: 'increase' });
  }
  if (eventCount30d >= 3) {
    trendFactors.push({ key: 'repeated_events_30d', category: 'trend', weight: rules.weights.trends.repeated_events_30d, direction: 'increase' });
  }
  if ([...signalCounts.values()].some((count) => count >= 3)) {
    trendFactors.push({ key: 'repeated_same_signal', category: 'trend', weight: rules.weights.trends.repeated_same_signal, direction: 'increase' });
  }
  if (documentSignals >= 2) {
    trendFactors.push({ key: 'multiple_document_signals', category: 'trend', weight: rules.weights.trends.multiple_document_signals, direction: 'increase' });
  }
  return trendFactors;
}

function toTier(score, rules) {
  if (score >= rules.highThreshold) return 'critical';
  if (score >= rules.moderateThreshold) return 'high';
  if (score >= rules.lowThreshold) return 'moderate';
  return 'low';
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function scoreCaseRisk(input = {}, options = {}) {
  const rules = options.rules || rulesFromEnv();
  const behavioral = toArray(input.behavioralCues).map((item) => normalizeFactor(item, 'behavioral')).filter(Boolean);
  const contextual = toArray(input.contextualFactors).map((item) => normalizeFactor(item, 'contextual')).filter(Boolean);
  const protective = toArray(input.protectiveFactors).map((item) => normalizeFactor(item, 'protective')).filter(Boolean);
  const recentEvents = toArray(input.recentEvents);
  const hardFlags = [
    ...toArray(input.hardFlags).flatMap((value) => normalizeHardFlags(value)),
    ...recentEvents.flatMap((event) => extractSignalsFromPayload(event.payload || {}).hardFlags),
  ];

  const factorBreakdown = [];
  let score = rules.baseScore;
  const addFactor = (factor, weight, direction) => {
    factorBreakdown.push({
      key: factor.key,
      category: factor.category,
      source: factor.source || 'event',
      weight,
      direction,
      note: factor.note || null,
    });
    score += direction === 'decrease' ? -Math.abs(weight) : Math.abs(weight);
  };

  for (const factor of behavioral) {
    if (rules.weights.behavioral[factor.key] != null) addFactor(factor, rules.weights.behavioral[factor.key], 'increase');
  }
  for (const factor of contextual) {
    if (rules.weights.contextual[factor.key] != null) addFactor(factor, rules.weights.contextual[factor.key], 'increase');
  }
  for (const factor of protective) {
    if (rules.weights.protective[factor.key] != null) addFactor(factor, rules.weights.protective[factor.key], 'decrease');
  }

  const trendFactors = calculateTrendAdjustments(recentEvents, rules);
  for (const trend of trendFactors) addFactor(trend, trend.weight, 'increase');

  const hardEscalationTriggers = [...new Set(hardFlags)].filter((key) => rules.hardEscalationSignals[key]).map((key) => ({
    key,
    reason: rules.hardEscalationSignals[key],
  }));
  if (hardEscalationTriggers.length) {
    score = Math.max(score, 90);
  }

  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const tier = hardEscalationTriggers.length ? 'critical' : toTier(normalizedScore, rules);
  const signalCount = behavioral.length + contextual.length + protective.length + trendFactors.length + hardEscalationTriggers.length;
  let confidence = rules.confidence.base + (signalCount * rules.confidence.perSignal);
  if (signalCount < 2) confidence -= rules.confidence.sparsePenalty;
  confidence = round(Math.max(0.2, Math.min(rules.confidence.max, confidence)));

  const strongestRisk = factorBreakdown.filter((factor) => factor.direction === 'increase').sort((a, b) => b.weight - a.weight).slice(0, 3);
  const strongestProtective = factorBreakdown.filter((factor) => factor.direction === 'decrease').sort((a, b) => b.weight - a.weight).slice(0, 2);
  const rationaleParts = [];
  if (strongestRisk.length) rationaleParts.push(`Primary risk drivers: ${strongestRisk.map((factor) => factor.key).join(', ')}.`);
  if (trendFactors.length) rationaleParts.push(`Recent pattern pressure: ${trendFactors.map((factor) => factor.key).join(', ')}.`);
  if (strongestProtective.length) rationaleParts.push(`Protective offsets: ${strongestProtective.map((factor) => factor.key).join(', ')}.`);
  if (hardEscalationTriggers.length) rationaleParts.push(`Hard escalation triggered by ${hardEscalationTriggers.map((item) => item.key).join(', ')}.`);
  if (!rationaleParts.length) rationaleParts.push('Limited structured signals were available, so the result should receive prompt human review.');

  return {
    score: normalizedScore,
    tier,
    confidence,
    factors: factorBreakdown,
    rationale: rationaleParts.join(' '),
    model_version: rules.version,
    hard_escalation: {
      triggered: hardEscalationTriggers.length > 0,
      triggers: hardEscalationTriggers,
    },
  };
}

module.exports = {
  extractSignalsFromPayload,
  scoreCaseRisk,
};
