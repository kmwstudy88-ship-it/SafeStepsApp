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
}: {
  assessmentScore?: number | null;
  serviceCompletionScore?: number | null;
  visitationQualityScore?: number | null;
  milestoneProgressScore?: number | null;
  activeCriticalOverride?: boolean;
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
    };
  }

  if (!availableSignals.length) {
    return {
      compositeScore: null,
      recommendation: "Insufficient evidence to calculate readiness.",
      flags,
      signals,
      suppressedByOverride: false,
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
}: {
  assessmentScore?: number | null;
  serviceReferrals: ServiceReferralProgress[];
  visitations: VisitationProgress[];
  milestones: MilestoneProgress[];
  activeCriticalOverride?: boolean;
}) {
  return computeReadinessIndex({
    assessmentScore,
    serviceCompletionScore: calculateServiceCompletionScore(serviceReferrals),
    visitationQualityScore: calculateVisitationQualityTrend(visitations),
    milestoneProgressScore: calculateMilestoneProgressScore(milestones),
    activeCriticalOverride,
  });
}
