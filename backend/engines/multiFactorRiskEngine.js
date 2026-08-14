const LEVEL_VALUES = Object.freeze({
  none: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
  imminent: 5,
});

const LIKELIHOOD_VALUES = Object.freeze({
  rare: 1,
  unlikely: 2,
  possible: 3,
  likely: 4,
  almost_certain: 5,
});

const FREQUENCY_VALUES = Object.freeze({
  isolated: 1,
  occasional: 2,
  recurring: 3,
  frequent: 4,
  continuous: 5,
});

const EVIDENCE_WEIGHTS = Object.freeze({
  unverified: 0.25,
  reported: 0.45,
  corroborated: 0.7,
  verified: 0.9,
  direct: 1,
});

const PROTECTIVE_CONFIDENCE = Object.freeze({
  reported: 0.35,
  corroborated: 0.65,
  verified: 1,
});

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function valueOf(map, key, fallback) {
  return map[String(key || "").toLowerCase()] ?? fallback;
}

function recencyWeight(observedAt, now) {
  const timestamp = new Date(observedAt).getTime();
  if (!Number.isFinite(timestamp)) return 0.65;
  const days = Math.max(0, (now.getTime() - timestamp) / 86_400_000);
  if (days <= 7) return 1;
  if (days <= 30) return 0.9;
  if (days <= 90) return 0.75;
  if (days <= 180) return 0.6;
  return 0.5;
}

function scoreIndicator(indicator, now) {
  const severity = valueOf(LEVEL_VALUES, indicator.severity, 2);
  const likelihood = valueOf(LIKELIHOOD_VALUES, indicator.likelihood, 3);
  const frequency = valueOf(FREQUENCY_VALUES, indicator.frequency, 2);
  const evidenceWeight = valueOf(EVIDENCE_WEIGHTS, indicator.evidenceQuality, 0.25);
  const recent = recencyWeight(indicator.observedAt, now);
  const base =
    (severity / 5) * 0.48 +
    (likelihood / 5) * 0.27 +
    (frequency / 5) * 0.15 +
    evidenceWeight * 0.1;
  const score = clamp(base * recent * 100, 0, 100);
  return {
    id: indicator.id ?? null,
    category: indicator.category ?? "unspecified",
    score: Number(score.toFixed(2)),
    severity,
    evidenceWeight,
    sourceType: indicator.sourceType ?? "unknown",
    urgent: severity >= LEVEL_VALUES.critical,
  };
}

function scoreProtectiveFactor(factor) {
  if (factor.active === false) return { id: factor.id ?? null, score: 0, excluded: "inactive" };
  const strength = valueOf(LEVEL_VALUES, factor.strength, 2);
  const confidence = valueOf(PROTECTIVE_CONFIDENCE, factor.confidence, 0.35);
  const sustained = factor.sustained === true ? 1 : 0.75;
  const score = clamp((strength / 5) * confidence * sustained * 100, 0, 100);
  return {
    id: factor.id ?? null,
    category: factor.category ?? "unspecified",
    score: Number(score.toFixed(2)),
    confidence,
    excluded: null,
  };
}

function levelFromScore(score) {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MODERATE";
  if (score > 0) return "LOW";
  return "NONE";
}

function confidenceFrom(indicators) {
  if (indicators.length === 0) return { label: "INSUFFICIENT", score: 0 };
  const evidence = indicators.reduce((sum, item) => sum + item.evidenceWeight, 0) / indicators.length;
  const sources = new Set(indicators.map((item) => item.sourceType).filter((item) => item !== "unknown")).size;
  const diversity = clamp(sources / 3, 0, 1);
  const completeness = clamp(indicators.length / 5, 0.2, 1);
  const score = evidence * 0.6 + diversity * 0.25 + completeness * 0.15;
  return {
    label: score >= 0.78 ? "HIGH" : score >= 0.5 ? "MODERATE" : "LOW",
    score: Number(score.toFixed(2)),
  };
}

export function evaluateMultiFactorRisk(input, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const indicators = Array.isArray(input?.indicators) ? input.indicators : [];
  const protectiveFactors = Array.isArray(input?.protectiveFactors) ? input.protectiveFactors : [];

  const indicatorBreakdown = indicators.map((item) => scoreIndicator(item, now));
  const protectiveBreakdown = protectiveFactors.map(scoreProtectiveFactor);
  const rawRiskScore = indicatorBreakdown.length
    ? indicatorBreakdown.reduce((sum, item) => sum + item.score, 0) / indicatorBreakdown.length
    : 0;
  const protectiveScore = protectiveBreakdown.length
    ? protectiveBreakdown.reduce((sum, item) => sum + item.score, 0) / protectiveBreakdown.length
    : 0;

  const maximumMitigation = rawRiskScore * 0.35;
  const appliedMitigation = Math.min(maximumMitigation, protectiveScore * 0.35);
  let contextualScore = clamp(rawRiskScore - appliedMitigation, 0, 100);

  const urgentIndicators = indicatorBreakdown.filter((item) => item.urgent);
  const hasImminent = indicatorBreakdown.some((item) => item.severity === LEVEL_VALUES.imminent);
  const hasCritical = indicatorBreakdown.some((item) => item.severity === LEVEL_VALUES.critical);
  if (hasImminent) contextualScore = Math.max(contextualScore, 90);
  else if (hasCritical) contextualScore = Math.max(contextualScore, 70);

  const confidence = confidenceFrom(indicatorBreakdown);
  const flags = [];
  if (indicators.length === 0) flags.push("insufficient_risk_information");
  if (confidence.label === "LOW") flags.push("low_evidence_confidence");
  if (urgentIndicators.length > 0) flags.push("urgent_professional_review");
  if (hasImminent) flags.push("immediate_safety_review");
  if (protectiveScore > 0 && appliedMitigation === maximumMitigation) {
    flags.push("protective_mitigation_capped");
  }
  if (indicators.some((item) => item.aiGenerated === true)) flags.push("ai_signal_requires_human_validation");

  return {
    level: hasImminent ? "IMMINENT" : levelFromScore(contextualScore),
    contextualScore: Number(contextualScore.toFixed(2)),
    rawRiskScore: Number(rawRiskScore.toFixed(2)),
    protectiveScore: Number(protectiveScore.toFixed(2)),
    appliedMitigation: Number(appliedMitigation.toFixed(2)),
    confidence,
    indicatorBreakdown,
    protectiveBreakdown,
    flags,
    escalation: hasImminent
      ? "immediate_professional_safety_review"
      : urgentIndicators.length > 0
        ? "urgent_professional_review"
        : confidence.label === "INSUFFICIENT"
          ? "complete_information_and_review"
          : "scheduled_professional_review",
    humanReviewRequired: true,
    automatedDecisionPermitted: false,
    decisionBoundary:
      "Decision-support only. This result cannot determine removal, contact, parental capacity, guilt, or case outcome.",
  };
}

export { EVIDENCE_WEIGHTS, LEVEL_VALUES, PROTECTIVE_CONFIDENCE };
