import type { SaferJudgementResult } from "./saferAssessmentEngine";

export type AssessmentItemType = "likert" | "multiple_choice" | "yes_no" | "numeric" | "narrative";

export type AssessmentResponseOption = {
  id: string;
  itemId: string;
  label: string;
  value: string;
  score: number;
};

export type AssessmentItem = {
  id: string;
  domainId: string;
  itemType: AssessmentItemType;
  weight: number;
  maxValue?: number;
  options?: AssessmentResponseOption[];
};

export type AssessmentResponse = {
  itemId: string;
  selectedOptionId?: string | null;
  numericValue?: number | null;
  narrativeValue?: string | null;
};

export type AssessmentDomain = {
  id: string;
  name: string;
  weight: number;
};

export type AssessmentScoringBand = {
  id: string;
  label: string;
  minScore: number;
  maxScore: number;
  recommendation?: string;
  requiresSupervisorReview?: boolean;
};

export type AssessmentCriticalOverride = {
  id: string;
  itemId: string;
  triggerOptionId: string;
  forcedBandId: string;
  reason: string;
  requiresSupervisorReview?: boolean;
};

export type DomainScore = {
  domainId: string;
  rawScore: number;
  maxPossible: number;
  normalizedScore: number;
};

export type AssessmentScoreResult = {
  domainScores: DomainScore[];
  overallScore: number;
  band: AssessmentScoringBand | null;
  overrideTriggered: boolean;
  override: AssessmentCriticalOverride | null;
  requiresSupervisorReview: boolean;
  recommendation: string;
};

export type ScoreTrend = {
  domainId: string;
  previousScore: number;
  currentScore: number;
  change: number;
  direction: "improving" | "declining" | "stable";
};

export type ReadinessSignal = {
  label: string;
  score: number | null;
  weight: number;
};

export type ReadinessIndexResult = {
  compositeScore: number | null;
  recommendation: string;
  flags: string[];
  signals: ReadinessSignal[];
  suppressedByOverride: boolean;
  saferJudgement?: SaferJudgementResult | null;
};

export type CompositeRiskBand = "Critical" | "High" | "Moderate" | "Ready";

export type CompositeReadinessRiskResult = ReadinessIndexResult & {
  riskBand: CompositeRiskBand;
  direction: "improving" | "declining" | "stable" | "unknown";
  workerOnly: true;
};

export type ServiceReferralProgress = {
  status: "referred" | "engaged" | "completed" | "declined" | "discontinued";
  completionWeight?: number;
};

export type VisitationProgress = {
  visitDate: string | Date;
  qualityScore: number | null;
  incidentCount?: number;
};

export type MilestoneProgress = {
  status: "not_started" | "in_progress" | "completed" | "blocked";
  progressScore?: number | null;
};

function roundScore(value: number) {
  return Math.round(value * 100) / 100;
}

function responseByItem(responses: AssessmentResponse[]) {
  return new Map(responses.map((response) => [response.itemId, response]));
}

export function scoreResponse(item: AssessmentItem, response: AssessmentResponse) {
  if (item.itemType === "narrative") return 0;

  if (item.itemType === "numeric") {
    if (response.numericValue == null) {
      throw new Error(`Numeric item ${item.id} has no numericValue.`);
    }
    return response.numericValue * item.weight;
  }

  const selectedOption = item.options?.find((option) => option.id === response.selectedOptionId);

  if (!selectedOption) {
    throw new Error(`No selected option recorded for item ${item.id}.`);
  }

  return selectedOption.score * item.weight;
}

export function scoreDomain(
  domain: AssessmentDomain,
  items: AssessmentItem[],
  responses: AssessmentResponse[],
): DomainScore {
  const domainItems = items.filter((item) => item.domainId === domain.id);
  const responsesByItem = responseByItem(responses);
  let rawScore = 0;
  let maxPossible = 0;

  for (const item of domainItems) {
    const response = responsesByItem.get(item.id);
    if (!response) continue;

    rawScore += scoreResponse(item, response);

    if (item.itemType === "numeric") {
      maxPossible += (item.maxValue ?? response.numericValue ?? 0) * item.weight;
    } else if (item.itemType !== "narrative") {
      const maxOptionScore = Math.max(...(item.options ?? []).map((option) => option.score), 0);
      maxPossible += maxOptionScore * item.weight;
    }
  }

  return {
    domainId: domain.id,
    rawScore: roundScore(rawScore),
    maxPossible: roundScore(maxPossible),
    normalizedScore: maxPossible > 0 ? roundScore((rawScore / maxPossible) * 100) : 0,
  };
}

export function findTriggeredOverride(
  overrides: AssessmentCriticalOverride[],
  responses: AssessmentResponse[],
  bands: AssessmentScoringBand[],
) {
  const responsesByItem = responseByItem(responses);
  const triggered = overrides.filter((override) => {
    const response = responsesByItem.get(override.itemId);
    return response?.selectedOptionId === override.triggerOptionId;
  });

  if (!triggered.length) return null;

  return triggered.sort((left, right) => {
    const leftBand = bands.find((band) => band.id === left.forcedBandId);
    const rightBand = bands.find((band) => band.id === right.forcedBandId);
    return (leftBand?.minScore ?? 0) - (rightBand?.minScore ?? 0);
  })[0];
}

export function findScoringBand(score: number, bands: AssessmentScoringBand[]) {
  return (
    bands.find((band) => score >= band.minScore && score <= band.maxScore) ??
    null
  );
}

export function scoreAssessment({
  domains,
  items,
  responses,
  overrides = [],
  bands = [],
}: {
  domains: AssessmentDomain[];
  items: AssessmentItem[];
  responses: AssessmentResponse[];
  overrides?: AssessmentCriticalOverride[];
  bands?: AssessmentScoringBand[];
}): AssessmentScoreResult {
  const domainScores = domains.map((domain) => scoreDomain(domain, items, responses));
  const totalWeight = domains.reduce((sum, domain) => sum + domain.weight, 0) || 1;
  const overallScore = roundScore(
    domainScores.reduce((sum, score) => {
      const domain = domains.find((candidate) => candidate.id === score.domainId);
      return sum + score.normalizedScore * (domain?.weight ?? 0);
    }, 0) / totalWeight,
  );

  const override = findTriggeredOverride(overrides, responses, bands);
  const forcedBand = override ? bands.find((band) => band.id === override.forcedBandId) ?? null : null;
  const computedBand = findScoringBand(overallScore, bands);
  const band = forcedBand ?? computedBand;
  const requiresSupervisorReview =
    Boolean(override?.requiresSupervisorReview) || Boolean(band?.requiresSupervisorReview);

  return {
    domainScores,
    overallScore,
    band,
    overrideTriggered: Boolean(override),
    override,
    requiresSupervisorReview,
    recommendation: band?.recommendation ?? "Review assessment findings with the case team.",
  };
}

export function scoreTrend(previous: DomainScore[], current: DomainScore[]): ScoreTrend[] {
  return current
    .map((currentScore) => {
      const previousScore = previous.find((score) => score.domainId === currentScore.domainId);
      if (!previousScore) return null;

      const change = roundScore(currentScore.normalizedScore - previousScore.normalizedScore);
      const direction = change > 2 ? "improving" : change < -2 ? "declining" : "stable";

      return {
        domainId: currentScore.domainId,
        previousScore: previousScore.normalizedScore,
        currentScore: currentScore.normalizedScore,
        change,
        direction,
      };
    })
    .filter((trend): trend is ScoreTrend => trend !== null);
}

export function computeReadinessIndex({
  assessmentScore,
  serviceCompletionScore,
  visitationQualityScore,
  milestoneProgressScore,
  activeCriticalOverride,
  saferJudgement,
}: {
  assessmentScore?: number | null;
  serviceCompletionScore?: number | null;
  visitationQualityScore?: number | null;
  milestoneProgressScore?: number | null;
  activeCriticalOverride?: boolean;
  saferJudgement?: SaferJudgementResult | null;
}): ReadinessIndexResult {
  const signals: ReadinessSignal[] = [
    { label: "Assessment scores", score: assessmentScore ?? null, weight: 0.4 },
    { label: "Service completion", score: serviceCompletionScore ?? null, weight: 0.2 },
    { label: "Visitation quality", score: visitationQualityScore ?? null, weight: 0.25 },
    { label: "Milestone progress", score: milestoneProgressScore ?? null, weight: 0.15 },
  ];
  const availableSignals = signals.filter((signal) => signal.score != null);
  const flags = signals
    .filter((signal) => signal.score == null)
    .map((signal) => `${signal.label} signal is missing.`);

  if (activeCriticalOverride) {
    return {
      compositeScore: null,
      recommendation: "Supervisor review required before any reunification-level change.",
      flags: ["Active critical override suppresses readiness index.", ...flags],
      signals,
      suppressedByOverride: true,
      saferJudgement: saferJudgement ?? null,
    };
  }

  if (saferJudgement?.requiredReview) {
    return {
      compositeScore: null,
      recommendation: "SAFER guided judgement requires practitioner review before readiness can be relied on.",
      flags: ["SAFER practitioner review required before readiness use.", ...saferJudgement.flags, ...flags],
      signals,
      suppressedByOverride: true,
      saferJudgement,
    };
  }

  if (saferJudgement) {
    flags.push("SAFER guided judgement is shown as review context, not a weighted readiness signal.");
  }

  if (!availableSignals.length) {
    return {
      compositeScore: null,
      recommendation: "Insufficient evidence to calculate readiness.",
      flags,
      signals,
      suppressedByOverride: false,
      saferJudgement: saferJudgement ?? null,
    };
  }

  const availableWeight = availableSignals.reduce((sum, signal) => sum + signal.weight, 0);
  const compositeScore = roundScore(
    availableSignals.reduce((sum, signal) => sum + (signal.score ?? 0) * signal.weight, 0) / availableWeight,
  );
  const recommendation =
    compositeScore >= 80
      ? "Strong progress shown; review readiness with supervisor and case team."
      : compositeScore >= 60
        ? "Emerging progress shown; continue structured monitoring and targeted supports."
        : "Readiness concerns remain; continue intervention and review active risks.";

  return {
    compositeScore,
    recommendation,
    flags,
    signals,
    suppressedByOverride: false,
    saferJudgement: saferJudgement ?? null,
  };
}

export function classifyCompositeRiskBand(input: {
  compositeScore: number | null;
  suppressedByOverride?: boolean;
}): CompositeRiskBand {
  if (input.suppressedByOverride || input.compositeScore == null) return "Critical";
  if (input.compositeScore < 40) return "Critical";
  if (input.compositeScore < 60) return "High";
  if (input.compositeScore < 80) return "Moderate";
  return "Ready";
}

export function calculateReadinessDirection(currentScore: number | null, previousScore?: number | null) {
  if (currentScore == null || previousScore == null) return "unknown" as const;
  const change = roundScore(currentScore - previousScore);
  if (change > 2) return "improving" as const;
  if (change < -2) return "declining" as const;
  return "stable" as const;
}

export function computeCompositeReunificationReadinessRisk({
  previousCompositeScore,
  ...input
}: Parameters<typeof computeReadinessIndex>[0] & {
  previousCompositeScore?: number | null;
}): CompositeReadinessRiskResult {
  const readiness = computeReadinessIndex(input);
  const riskBand = classifyCompositeRiskBand({
    compositeScore: readiness.compositeScore,
    suppressedByOverride: readiness.suppressedByOverride,
  });

  return {
    ...readiness,
    riskBand,
    direction: calculateReadinessDirection(readiness.compositeScore, previousCompositeScore),
    workerOnly: true,
  };
}

export function calculateServiceCompletionScore(referrals: ServiceReferralProgress[]) {
  const activeReferrals = referrals.filter((referral) => referral.status !== "declined");
  if (!activeReferrals.length) return null;

  const totalWeight = activeReferrals.reduce((sum, referral) => sum + (referral.completionWeight ?? 1), 0);
  if (totalWeight <= 0) return null;

  const completedWeight = activeReferrals.reduce((sum, referral) => {
    if (referral.status === "completed") return sum + (referral.completionWeight ?? 1);
    if (referral.status === "engaged") return sum + (referral.completionWeight ?? 1) * 0.5;
    return sum;
  }, 0);

  return roundScore((completedWeight / totalWeight) * 100);
}

export function calculateVisitationQualityTrend(visits: VisitationProgress[]) {
  const scoredVisits = visits
    .filter((visit) => visit.qualityScore != null)
    .sort((left, right) => new Date(left.visitDate).getTime() - new Date(right.visitDate).getTime());

  if (!scoredVisits.length) return null;

  const weighted = scoredVisits.reduce(
    (acc, visit, index) => {
      const recencyWeight = index + 1;
      const incidentPenalty = (visit.incidentCount ?? 0) * 10;
      const adjustedScore = Math.max(0, Math.min(100, (visit.qualityScore ?? 0) - incidentPenalty));

      return {
        total: acc.total + adjustedScore * recencyWeight,
        weight: acc.weight + recencyWeight,
      };
    },
    { total: 0, weight: 0 },
  );

  return weighted.weight > 0 ? roundScore(weighted.total / weighted.weight) : null;
}

export function calculateMilestoneProgressScore(milestones: MilestoneProgress[]) {
  if (!milestones.length) return null;

  const scores = milestones.map((milestone) => {
    if (milestone.progressScore != null) return milestone.progressScore;
    if (milestone.status === "completed") return 100;
    if (milestone.status === "in_progress") return 50;
    return 0;
  });

  return roundScore(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

export function computeReadinessIndexFromSignals({
  assessmentScore,
  serviceReferrals,
  visitations,
  milestones,
  activeCriticalOverride,
  saferJudgement,
}: {
  assessmentScore?: number | null;
  serviceReferrals: ServiceReferralProgress[];
  visitations: VisitationProgress[];
  milestones: MilestoneProgress[];
  activeCriticalOverride?: boolean;
  saferJudgement?: SaferJudgementResult | null;
}) {
  return computeReadinessIndex({
    assessmentScore,
    serviceCompletionScore: calculateServiceCompletionScore(serviceReferrals),
    visitationQualityScore: calculateVisitationQualityTrend(visitations),
    milestoneProgressScore: calculateMilestoneProgressScore(milestones),
    activeCriticalOverride,
    saferJudgement,
  });
}

// ---------------------------------------------------------------------------
// Score regression detection
// ---------------------------------------------------------------------------

export type ScoreRegressionFlag = {
  domainId: string;
  previousScore: number;
  currentScore: number;
  drop: number;
  severity: "minor" | "significant" | "critical";
};

/**
 * Compare a previous set of domain scores against the current scores and
 * return a list of domains where the score has dropped beyond a configurable
 * threshold.  Drops are classified:
 *   - minor:       5–14 points
 *   - significant: 15–29 points
 *   - critical:    30+ points
 */
export function flagScoreRegression(
  previousScores: DomainScore[],
  currentScores: DomainScore[],
  minorThreshold = 5,
  significantThreshold = 15,
  criticalThreshold = 30,
): ScoreRegressionFlag[] {
  const prevByDomain = new Map(previousScores.map((d) => [d.domainId, d]));

  const flags: ScoreRegressionFlag[] = [];

  for (const current of currentScores) {
    const prev = prevByDomain.get(current.domainId);
    if (!prev) continue;

    const prevNorm = prev.normalizedScore * 100;
    const currNorm = current.normalizedScore * 100;
    const drop = roundScore(prevNorm - currNorm);

    if (drop < minorThreshold) continue;

    let severity: ScoreRegressionFlag["severity"];
    if (drop >= criticalThreshold) {
      severity = "critical";
    } else if (drop >= significantThreshold) {
      severity = "significant";
    } else {
      severity = "minor";
    }

    flags.push({
      domainId: current.domainId,
      previousScore: roundScore(prevNorm),
      currentScore: roundScore(currNorm),
      drop,
      severity,
    });
  }

  return flags;
}

// ---------------------------------------------------------------------------
// Domain trajectory summary
// ---------------------------------------------------------------------------

export type DomainTrajectoryPoint = {
  assessmentId: string;
  assessedAt: string;
  normalizedScore: number;
};

export type DomainTrajectorySummary = {
  domainId: string;
  points: DomainTrajectoryPoint[];
  firstScore: number | null;
  latestScore: number | null;
  peakScore: number | null;
  direction: "improving" | "declining" | "stable" | "insufficient_data";
  regressionFlags: ScoreRegressionFlag[];
};

export type LongitudinalTrajectorySummary = {
  domains: DomainTrajectorySummary[];
  overallDirection: "improving" | "declining" | "stable" | "insufficient_data";
  assessmentCount: number;
};

/**
 * Summarize the score trajectory for each domain across a series of
 * historical assessment records.
 *
 * Each record is an object with `assessmentId`, `assessedAt`, and
 * `domainScores` (an array of DomainScore).  Records must be provided in
 * chronological order (oldest first).
 */
export function summarizeDomainTrajectory(
  records: Array<{
    assessmentId: string;
    assessedAt: string;
    domainScores: DomainScore[];
  }>,
): LongitudinalTrajectorySummary {
  if (!records.length) {
    return { domains: [], overallDirection: "insufficient_data", assessmentCount: 0 };
  }

  // Collect all domain IDs seen across all records
  const domainIds = new Set<string>();
  for (const record of records) {
    for (const ds of record.domainScores) {
      domainIds.add(ds.domainId);
    }
  }

  const domains: DomainTrajectorySummary[] = [];

  for (const domainId of domainIds) {
    const points: DomainTrajectoryPoint[] = [];

    for (const record of records) {
      const ds = record.domainScores.find((d) => d.domainId === domainId);
      if (!ds) continue;
      points.push({
        assessmentId: record.assessmentId,
        assessedAt: record.assessedAt,
        normalizedScore: roundScore(ds.normalizedScore * 100),
      });
    }

    if (!points.length) {
      domains.push({
        domainId,
        points: [],
        firstScore: null,
        latestScore: null,
        peakScore: null,
        direction: "insufficient_data",
        regressionFlags: [],
      });
      continue;
    }

    const firstScore = points[0].normalizedScore;
    const latestScore = points[points.length - 1].normalizedScore;
    const peakScore = Math.max(...points.map((p) => p.normalizedScore));

    let direction: DomainTrajectorySummary["direction"];
    if (points.length < 2) {
      direction = "insufficient_data";
    } else {
      const change = latestScore - firstScore;
      if (change > 5) direction = "improving";
      else if (change < -5) direction = "declining";
      else direction = "stable";
    }

    // Build regression flags from consecutive pairs
    const regressionFlags: ScoreRegressionFlag[] = [];
    for (let i = 1; i < points.length; i++) {
      const prevDs: DomainScore = {
        domainId,
        rawScore: 0,
        maxPossible: 100,
        normalizedScore: points[i - 1].normalizedScore / 100,
      };
      const currDs: DomainScore = {
        domainId,
        rawScore: 0,
        maxPossible: 100,
        normalizedScore: points[i].normalizedScore / 100,
      };
      const flags = flagScoreRegression([prevDs], [currDs]);
      regressionFlags.push(...flags);
    }

    domains.push({ domainId, points, firstScore, latestScore, peakScore, direction, regressionFlags });
  }

  // Compute overall direction from domain directions
  const dirCounts = { improving: 0, declining: 0, stable: 0 };
  for (const d of domains) {
    if (d.direction === "improving") dirCounts.improving++;
    else if (d.direction === "declining") dirCounts.declining++;
    else if (d.direction === "stable") dirCounts.stable++;
  }

  let overallDirection: LongitudinalTrajectorySummary["overallDirection"];
  const tracked = domains.filter((d) => d.direction !== "insufficient_data").length;
  if (!tracked) {
    overallDirection = "insufficient_data";
  } else if (dirCounts.improving > dirCounts.declining) {
    overallDirection = "improving";
  } else if (dirCounts.declining > dirCounts.improving) {
    overallDirection = "declining";
  } else {
    overallDirection = "stable";
  }

  return { domains, overallDirection, assessmentCount: records.length };
}
