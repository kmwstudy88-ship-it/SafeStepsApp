'use strict';

const DEFAULT_RULES = Object.freeze({
  version: 'risk-rules-v1',
  baseScore: 10,
  lowThreshold: 25,
  moderateThreshold: 50,
  highThreshold: 75,
  deltaEscalationThreshold: 15,
  confidence: {
    base: 0.58,
    perSignal: 0.05,
    max: 0.96,
    sparsePenalty: 0.08,
  },
  thresholds: {
    highAlertScore: 60,
    criticalAlertScore: 75,
  },
  weights: {
    behavioral: {
      threat_or_fear_disclosure: 28,
      escalating_violence: 26,
      suicidal_statement: 30,
      self_harm_indicator: 24,
      child_distress: 16,
      coercive_control: 18,
      stalking: 18,
      substance_relapse: 14,
      absconding_risk: 18,
      missed_contact: 8,
      isolation: 10,
      retaliation_concern: 20,
    },
    contextual: {
      weapon_access: 25,
      prior_incidents: 12,
      unsafe_housing: 10,
      recent_separation: 8,
      court_breach: 14,
      high_conflict_handover: 10,
      caregiver_overload: 9,
      limited_transport: 5,
      school_nonattendance: 8,
    },
    protective: {
      engaged_support_network: 12,
      safety_plan_in_place: 10,
      consistent_service_engagement: 8,
      stable_housing: 8,
      caregiver_insight: 6,
      safe_contact_observed: 8,
      school_engagement: 5,
    },
    trends: {
      repeated_acute_events_7d: 12,
      repeated_events_30d: 8,
      repeated_same_signal: 6,
      multiple_document_signals: 5,
    },
  },
  hardEscalationSignals: {
    child_immediate_danger: 'Immediate child safety danger disclosed',
    credible_threat_to_life: 'Credible threat to life disclosed',
    weapon_access: 'Weapon access or use flagged',
    missing_child: 'Missing child risk identified',
    suicidal_statement: 'Suicidal statement or imminent self-harm disclosed',
  },
  followUpTemplates: {
    low: [
      { task_type: 'check_in', title: 'Routine case check-in', due_in_hours: 168, priority: 'routine', source: 'risk_tier_low' },
    ],
    moderate: [
      { task_type: 'case_check_in', title: 'Moderate-risk caseworker follow-up', due_in_hours: 72, priority: 'medium', source: 'risk_tier_moderate' },
      { task_type: 'risk_reassessment', title: 'Reassess case risk', due_in_hours: 168, priority: 'medium', source: 'risk_tier_moderate' },
    ],
    high: [
      { task_type: 'safety_check', title: 'High-risk safety check', due_in_hours: 24, priority: 'high', source: 'risk_tier_high' },
      { task_type: 'supervisor_review', title: 'Supervisor review required', due_in_hours: 8, priority: 'high', source: 'risk_tier_high' },
      { task_type: 'risk_reassessment', title: 'Reassess case risk', due_in_hours: 48, priority: 'high', source: 'risk_tier_high' },
    ],
    critical: [
      { task_type: 'immediate_supervisor_review', title: 'Immediate supervisor review', due_in_hours: 2, priority: 'urgent', source: 'risk_tier_critical' },
      { task_type: 'safety_plan_review', title: 'Urgent safety plan review', due_in_hours: 4, priority: 'urgent', source: 'risk_tier_critical' },
      { task_type: 'risk_reassessment', title: 'Critical-risk reassessment', due_in_hours: 24, priority: 'urgent', source: 'risk_tier_critical' },
    ],
  },
});

function rulesFromEnv() {
  const raw = process.env.CASE_RISK_RULE_OVERRIDES;
  if (!raw) return DEFAULT_RULES;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_RULES,
      ...parsed,
      confidence: { ...DEFAULT_RULES.confidence, ...(parsed.confidence || {}) },
      thresholds: { ...DEFAULT_RULES.thresholds, ...(parsed.thresholds || {}) },
      weights: {
        behavioral: { ...DEFAULT_RULES.weights.behavioral, ...(parsed.weights?.behavioral || {}) },
        contextual: { ...DEFAULT_RULES.weights.contextual, ...(parsed.weights?.contextual || {}) },
        protective: { ...DEFAULT_RULES.weights.protective, ...(parsed.weights?.protective || {}) },
        trends: { ...DEFAULT_RULES.weights.trends, ...(parsed.weights?.trends || {}) },
      },
      hardEscalationSignals: { ...DEFAULT_RULES.hardEscalationSignals, ...(parsed.hardEscalationSignals || {}) },
      followUpTemplates: {
        ...DEFAULT_RULES.followUpTemplates,
        ...(parsed.followUpTemplates || {}),
      },
    };
  } catch (error) {
    console.warn('[case-risk] invalid CASE_RISK_RULE_OVERRIDES JSON ignored:', error.message);
    return DEFAULT_RULES;
  }
}

module.exports = {
  DEFAULT_RULES,
  rulesFromEnv,
};
