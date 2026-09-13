'use strict';

const FORENSIC_CRITERIA_MODEL_VERSION = 'forensic-criteria-v1';

const FORENSIC_SIGNAL_SCALE = Object.freeze([
  { value: 0, label: '0 · Not observed' },
  { value: 1, label: '1 · Brief / inconsistent' },
  { value: 2, label: '2 · Present / repeatable' },
  { value: 3, label: '3 · Strong / sustained' },
]);

const FORENSIC_BOOLEAN_SCALE = Object.freeze([
  { value: false, label: 'No' },
  { value: true, label: 'Yes' },
]);

const FORENSIC_CRITERIA_DOMAINS = Object.freeze([
  {
    id: 'parent_child_interaction_quality',
    title: 'Parent–Child Interaction Quality',
    summary: 'Observes attunement, warmth, responsiveness, and comfort-seeking outcomes.',
    childCentredWeight: 1.35,
    signals: [
      { id: 'attuned_eye_contact', label: 'Attuned eye contact', detail: 'Duration, reciprocity, comfort.', effect: 'protective', weight: 14 },
      { id: 'responsiveness_latency', label: 'Responsiveness latency', detail: 'Timely response after child cues or bids for connection.', effect: 'protective', weight: 12 },
      { id: 'warmth_index', label: 'Warmth index', detail: 'Facial affect, tone, touch, and child comfort.', effect: 'protective', weight: 16 },
      { id: 'irritation_markers', label: 'Irritation markers', detail: 'Micro-expressions, tension, dismissive gestures.', effect: 'risk', weight: 15 },
      { id: 'comfort_seeking_success', label: 'Comfort-seeking success', detail: 'Child approaches and receives an appropriate response.', effect: 'protective', weight: 16 },
    ],
    riskFlags: [
      { id: 'interaction_avoidance_shutdown', label: 'Avoidance, flinching, or shutdown', weight: 12 },
      { id: 'interaction_distress_ignored', label: 'Parent ignores distress', weight: 16 },
      { id: 'interaction_hostile_microexpressions', label: 'Hostile micro-expressions', weight: 15 },
    ],
    protectiveFlags: [
      { id: 'interaction_consistent_soothing', label: 'Consistent soothing', weight: 14 },
      { id: 'interaction_positive_engagement_cycles', label: 'Positive engagement cycles', weight: 12 },
    ],
  },
  {
    id: 'supervision_safety_behaviours',
    title: 'Supervision & Safety Behaviours',
    summary: 'Measures hazard monitoring, active supervision, handling safety, and boundary follow-through.',
    childCentredWeight: 1.3,
    signals: [
      { id: 'hazard_proximity_mapping', label: 'Hazard proximity mapping', detail: 'Awareness of child proximity to hazards.', effect: 'risk', weight: 14 },
      { id: 'parent_attention_tracking', label: 'Parent attention tracking', detail: 'Gaze and body orientation remain child-aware.', effect: 'protective', weight: 15 },
      { id: 'infant_handling_safety_score', label: 'Infant handling safety score', detail: 'Safe lifting, transfer, feeding, or support behaviours.', effect: 'protective', weight: 16 },
      { id: 'boundary_enforcement_consistency', label: 'Boundary enforcement consistency', detail: 'Clear, calm, predictable limits.', effect: 'protective', weight: 14 },
    ],
    riskFlags: [
      { id: 'supervision_distraction', label: 'Distraction, intoxication, or active conflict', weight: 16 },
      { id: 'supervision_unsafe_object_exposure', label: 'Unsafe object exposure', weight: 16 },
      { id: 'supervision_child_wandering_unnoticed', label: 'Child wandering without awareness', weight: 15 },
    ],
    protectiveFlags: [
      { id: 'supervision_active_monitoring', label: 'Active monitoring', weight: 14 },
      { id: 'supervision_hazard_removed_preemptively', label: 'Pre-emptive hazard removal', weight: 12 },
    ],
  },
  {
    id: 'parent_emotional_regulation',
    title: 'Parent Emotional Regulation',
    summary: 'Scores tone stability, escalation speed, intimidation, and self-regulation attempts.',
    childCentredWeight: 1.15,
    signals: [
      { id: 'tone_stability', label: 'Tone stability', detail: 'Voice remains calm, even, and proportionate.', effect: 'protective', weight: 14 },
      { id: 'escalation_curve', label: 'Escalation curve', detail: 'Speed and intensity of emotional escalation.', effect: 'risk', weight: 16 },
      { id: 'anger_microbursts', label: 'Anger micro-bursts', detail: 'Sharp bursts of irritation, contempt, or hostility.', effect: 'risk', weight: 15 },
      { id: 'self_regulation_attempts', label: 'Self-regulation attempts', detail: 'Pausing, repairing, breathing, or resetting.', effect: 'protective', weight: 14 },
    ],
    riskFlags: [
      { id: 'regulation_sudden_rage_spikes', label: 'Sudden rage spikes', weight: 17 },
      { id: 'regulation_threatening_posture', label: 'Threatening posture', weight: 16 },
      { id: 'regulation_intimidation_gestures', label: 'Intimidation gestures', weight: 15 },
    ],
    protectiveFlags: [
      { id: 'regulation_deescalation', label: 'De-escalation', weight: 14 },
      { id: 'regulation_calm_conflict_navigation', label: 'Calm conflict navigation', weight: 12 },
    ],
  },
  {
    id: 'child_emotional_state',
    title: 'Child Emotional State',
    summary: 'Captures fear, comfort, hypervigilance, compliance pressure, and secure attachment signals.',
    childCentredWeight: 1.5,
    signals: [
      { id: 'fear_index', label: 'Fear index', detail: 'Freeze, flinch, avoidance, distress.', effect: 'risk', weight: 18 },
      { id: 'comfort_index', label: 'Comfort index', detail: 'Relaxed posture, leaning in, playful ease.', effect: 'protective', weight: 16 },
      { id: 'hypervigilance_markers', label: 'Hypervigilance markers', detail: 'Scanning, startle, tension, vigilance.', effect: 'risk', weight: 17 },
      { id: 'compliance_pressure_markers', label: 'Compliance pressure markers', detail: 'Appeasing, guarded agreement, adult-pleasing.', effect: 'risk', weight: 15 },
    ],
    riskFlags: [
      { id: 'child_distress_unaddressed', label: 'Child distress unaddressed', weight: 17 },
      { id: 'child_appeasing_parent', label: 'Child appeasing parent', weight: 15 },
    ],
    protectiveFlags: [
      { id: 'child_secure_attachment_behaviours', label: 'Secure attachment behaviours', weight: 16 },
    ],
  },
  {
    id: 'coparenting_dynamics',
    title: 'Co-Parenting Dynamics',
    summary: 'Assesses cooperation, undermining, triangulation, and coordinated parenting action.',
    childCentredWeight: 1.1,
    signals: [
      { id: 'cooperation_score', label: 'Cooperation score', detail: 'Adults coordinate, share responsibility, and reduce child burden.', effect: 'protective', weight: 14 },
      { id: 'undermining_behaviours', label: 'Undermining behaviours', detail: 'Adult-to-adult sabotage, contradiction, or denigration.', effect: 'risk', weight: 16 },
      { id: 'triangulation_detection', label: 'Triangulation detection', detail: 'Child pulled into adult conflict or messaging.', effect: 'risk', weight: 17 },
      { id: 'parallel_parenting_markers', label: 'Parallel parenting markers', detail: 'Low-coordination arrangements protecting the child from conflict.', effect: 'protective', weight: 10 },
    ],
    riskFlags: [
      { id: 'coparenting_hostile_exchanges', label: 'Hostile exchanges', weight: 16 },
      { id: 'coparenting_child_used_as_messenger', label: 'Child used as communication tool', weight: 17 },
    ],
    protectiveFlags: [
      { id: 'coparenting_coordinated_parenting_actions', label: 'Coordinated parenting actions', weight: 14 },
    ],
  },
]);

const FORENSIC_RELIABILITY_MODIFIERS = Object.freeze({
  contradictions: [
    { id: 'contradiction_observed_vs_reported', label: 'Observed behaviour conflicts with reported narrative', weight: 8 },
    { id: 'contradiction_timeline_gaps', label: 'Timeline gaps or unresolved sequencing conflict', weight: 6 },
    { id: 'contradiction_material_context_missing', label: 'Material context missing for a key interpretation', weight: 5 },
  ],
  bias: [
    { id: 'bias_judgmental_language', label: 'Judgmental or loaded language present', weight: 6 },
    { id: 'bias_adult_centric_framing', label: 'Adult-centric framing overrides the child impact', weight: 7 },
    { id: 'bias_cultural_context_gap', label: 'Cultural or disability context appears underexplained', weight: 5 },
  ],
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function scaleValue(value) {
  if (value === 0 || value === 1 || value === 2 || value === 3) return value;
  return null;
}

function boolValue(value) {
  return value === true;
}

function totalSignalCount() {
  return FORENSIC_CRITERIA_DOMAINS.reduce((sum, domain) => sum + domain.signals.length, 0);
}

function totalModifierCount() {
  return FORENSIC_RELIABILITY_MODIFIERS.contradictions.length + FORENSIC_RELIABILITY_MODIFIERS.bias.length;
}

function scoreForensicCriteriaAssessment(responses = {}) {
  const domains = [];
  let weightedConcernSum = 0;
  let weightedRiskSum = 0;
  let weightedProtectiveSum = 0;
  let weightedCoverageSum = 0;
  let totalWeight = 0;
  let answeredSignals = 0;

  for (const domain of FORENSIC_CRITERIA_DOMAINS) {
    const riskCapacity =
      domain.signals.filter((signal) => signal.effect === 'risk').reduce((sum, signal) => sum + signal.weight, 0) +
      domain.riskFlags.reduce((sum, flag) => sum + flag.weight, 0);
    const protectiveCapacity =
      domain.signals.filter((signal) => signal.effect === 'protective').reduce((sum, signal) => sum + signal.weight, 0) +
      domain.protectiveFlags.reduce((sum, flag) => sum + flag.weight, 0);

    let riskPoints = 0;
    let protectivePoints = 0;
    let domainAnsweredSignals = 0;

    const observedSignals = domain.signals.map((signal) => {
      const value = scaleValue(responses[signal.id]);
      if (value != null) domainAnsweredSignals += 1;
      const scaledWeight = value == null ? 0 : (value / 3) * signal.weight;
      if (signal.effect === 'risk') riskPoints += scaledWeight;
      if (signal.effect === 'protective') protectivePoints += scaledWeight;
      return {
        feature_id: signal.id,
        value,
        kind: 'signal',
        effect: signal.effect,
        weight: signal.weight,
      };
    });

    const riskFlagsPresent = domain.riskFlags.filter((flag) => boolValue(responses[flag.id]));
    const protectiveFlagsPresent = domain.protectiveFlags.filter((flag) => boolValue(responses[flag.id]));

    riskPoints += riskFlagsPresent.reduce((sum, flag) => sum + flag.weight, 0);
    protectivePoints += protectiveFlagsPresent.reduce((sum, flag) => sum + flag.weight, 0);

    const riskWeightedScore = riskCapacity ? round((riskPoints / riskCapacity) * 100) : 0;
    const protectiveWeightedScore = protectiveCapacity ? round((protectivePoints / protectiveCapacity) * 100) : 0;
    const concernScore = clamp(round(riskWeightedScore - (protectiveWeightedScore * 0.45)), 0, 100);
    const coverageScore = round((domainAnsweredSignals / Math.max(1, domain.signals.length)) * 100);

    answeredSignals += domainAnsweredSignals;
    totalWeight += domain.childCentredWeight;
    weightedConcernSum += concernScore * domain.childCentredWeight;
    weightedRiskSum += riskWeightedScore * domain.childCentredWeight;
    weightedProtectiveSum += protectiveWeightedScore * domain.childCentredWeight;
    weightedCoverageSum += coverageScore * domain.childCentredWeight;

    domains.push({
      id: domain.id,
      title: domain.title,
      summary: domain.summary,
      child_centred_weight: domain.childCentredWeight,
      concern_score: concernScore,
      risk_weighted_score: riskWeightedScore,
      protective_weighted_score: protectiveWeightedScore,
      coverage_score: coverageScore,
      risk_flags_present: riskFlagsPresent.map((flag) => ({ id: flag.id, label: flag.label })),
      protective_flags_present: protectiveFlagsPresent.map((flag) => ({ id: flag.id, label: flag.label })),
      all_risk_flag_ids: domain.riskFlags.map((flag) => flag.id),
      all_protective_flag_ids: domain.protectiveFlags.map((flag) => flag.id),
      observed_signals: observedSignals,
    });
  }

  const contradictionFlags = FORENSIC_RELIABILITY_MODIFIERS.contradictions.filter((flag) => boolValue(responses[flag.id]));
  const biasFlags = FORENSIC_RELIABILITY_MODIFIERS.bias.filter((flag) => boolValue(responses[flag.id]));

  const contradictionPenalty = contradictionFlags.reduce((sum, flag) => sum + flag.weight, 0);
  const biasPenalty = biasFlags.reduce((sum, flag) => sum + flag.weight, 0);

  const rawConcernScore = totalWeight ? round(weightedConcernSum / totalWeight) : 0;
  const riskWeightedScore = totalWeight ? round(weightedRiskSum / totalWeight) : 0;
  const protectiveWeightedScore = totalWeight ? round(weightedProtectiveSum / totalWeight) : 0;
  const coverageScore = totalWeight ? round(weightedCoverageSum / totalWeight) : 0;

  const scoreAdjustmentFactor = clamp(1 - (contradictionPenalty * 0.0045) - (biasPenalty * 0.004), 0.72, 1);
  const adjustedConcernScore = clamp(round(rawConcernScore * scoreAdjustmentFactor), 0, 100);
  const confidence = clamp(
    round(0.46 + ((answeredSignals / Math.max(1, totalSignalCount())) * 0.34) - (contradictionPenalty * 0.007) - (biasPenalty * 0.006)),
    0.2,
    0.98
  );

  const childCentredPriority = domains
    .slice()
    .sort((a, b) => (b.concern_score * b.child_centred_weight) - (a.concern_score * a.child_centred_weight))
    .slice(0, 3)
    .map((domain) => ({ id: domain.id, title: domain.title }));

  let level = 'low';
  if (adjustedConcernScore >= 75) level = 'critical';
  else if (adjustedConcernScore >= 55) level = 'high';
  else if (adjustedConcernScore >= 30) level = 'moderate';

  const defensibilityReasons = [];
  if (coverageScore < 75) defensibilityReasons.push('Structured observation coverage is incomplete.');
  if (contradictionFlags.length) defensibilityReasons.push('Material contradictions need reconciliation before high-confidence reliance.');
  if (biasFlags.length) defensibilityReasons.push('Bias/framing concerns should be rewritten or contextualized.');
  if (!defensibilityReasons.length) defensibilityReasons.push('Structured observations are complete and internally coherent.');

  let courtDefensibility = 'strong';
  if (coverageScore < 60 || contradictionPenalty >= 10 || biasPenalty >= 10) courtDefensibility = 'review_required';
  else if (coverageScore < 85 || contradictionPenalty > 0 || biasPenalty > 0) courtDefensibility = 'adequate';

  const flatFeatures = {};
  for (const domain of domains) {
    for (const signal of domain.observed_signals) flatFeatures[signal.feature_id] = signal.value;
    const presentRiskFlags = new Set(domain.risk_flags_present.map((flag) => flag.id));
    const presentProtectiveFlags = new Set(domain.protective_flags_present.map((flag) => flag.id));
    for (const flagId of domain.all_risk_flag_ids) flatFeatures[flagId] = presentRiskFlags.has(flagId) ? 1 : 0;
    for (const flagId of domain.all_protective_flag_ids) flatFeatures[flagId] = presentProtectiveFlags.has(flagId) ? 1 : 0;
  }
  for (const flag of FORENSIC_RELIABILITY_MODIFIERS.contradictions) flatFeatures[flag.id] = boolValue(responses[flag.id]) ? 1 : 0;
  for (const flag of FORENSIC_RELIABILITY_MODIFIERS.bias) flatFeatures[flag.id] = boolValue(responses[flag.id]) ? 1 : 0;

  return {
    model_version: FORENSIC_CRITERIA_MODEL_VERSION,
    adjusted_concern_score: adjustedConcernScore,
    raw_concern_score: rawConcernScore,
    risk_weighted_score: riskWeightedScore,
    protective_weighted_score: protectiveWeightedScore,
    contradiction_penalty: contradictionPenalty,
    bias_penalty: biasPenalty,
    coverage_score: coverageScore,
    confidence,
    level,
    child_centred_priority_domains: childCentredPriority,
    court_defensibility: {
      status: courtDefensibility,
      reasons: defensibilityReasons,
    },
    contradictions_present: contradictionFlags.map((flag) => flag.id),
    bias_flags_present: biasFlags.map((flag) => flag.id),
    domains,
    ml_payload: {
      schema_version: FORENSIC_CRITERIA_MODEL_VERSION,
      target: {
        adjusted_concern_score: adjustedConcernScore,
        raw_concern_score: rawConcernScore,
        risk_weighted_score: riskWeightedScore,
        protective_weighted_score: protectiveWeightedScore,
        confidence,
        level,
      },
      metadata: {
        contradiction_penalty: contradictionPenalty,
        bias_penalty: biasPenalty,
        coverage_score: coverageScore,
        court_defensibility: courtDefensibility,
        child_centred_priority_domains: childCentredPriority,
      },
      domain_scores: domains.map((domain) => ({
        domain_id: domain.id,
        concern_score: domain.concern_score,
        risk_weighted_score: domain.risk_weighted_score,
        protective_weighted_score: domain.protective_weighted_score,
        coverage_score: domain.coverage_score,
      })),
      feature_vector: flatFeatures,
      contradiction_flags: contradictionFlags.map((flag) => flag.id),
      bias_flags: biasFlags.map((flag) => flag.id),
    },
  };
}

module.exports = {
  FORENSIC_BOOLEAN_SCALE,
  FORENSIC_CRITERIA_DOMAINS,
  FORENSIC_CRITERIA_MODEL_VERSION,
  FORENSIC_RELIABILITY_MODIFIERS,
  FORENSIC_SIGNAL_SCALE,
  scoreForensicCriteriaAssessment,
  totalModifierCount,
  totalSignalCount,
};
