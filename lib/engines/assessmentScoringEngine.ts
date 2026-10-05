export type AssessmentDomain = {
  id: string;
  name: string;
  weight?: number;
};

export type AssessmentOption = {
  id: string;
  itemId: string;
  label: string;
  value: string;
  score: number;
};

export type AssessmentItem = {
  id: string;
  domainId: string;
  itemType: "likert" | "multiple_choice" | "numeric";
  weight?: number;
  options?: AssessmentOption[];
  maxValue?: number;
};

export type AssessmentResponse = {
  itemId: string;
  selectedOptionId?: string;
  numericValue?: number;
};

export type AssessmentScoringBand = {
  id: string;
  label: string;
  minScore: number;
  maxScore: number;
  recommendation: string;
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

export type ServiceReferralProgress = {
  status: "completed" | "engaged" | "referred" | "not_started";
  completionWeight: number;
};

export type VisitationProgress = {
  visitDate: string;
  qualityScore: number;
  incidentCount: number;
};

export type MilestoneProgress = {
  status: "completed" | "in_progress" | "not_started";
  progressScore?: number;
};

export type AssessmentDomainScore = {
  domainId: string;
  domainName: string;
  score: number | null;
  answeredItems: number;
  totalItems: number;
  coveragePercent: number;
};

export type AppliedCriticalOverride = {
  id: string;
  reason: string;
  forcedBandId: string;
};

export type AssessmentScoreResult = {
  score: number | null;
  band: AssessmentScoringBand | null;
  domainScores: AssessmentDomainScore[];
  answeredItems: number;
  totalItems: number;
  coveragePercent: number;
  criticalOverridesApplied: AppliedCriticalOverride[];
  recommendations: string[];
  requiresSupervisorReview: boolean;
  decisionSupportOnly: true;
  humanReviewRequired: true;
};

type ScoreAssessmentInput = {
  domains: AssessmentDomain[];
  items: AssessmentItem[];
  responses: AssessmentResponse[];
  bands: AssessmentScoringBand[];
  criticalOverrides?: AssessmentCriticalOverride[];
};

function assertPositiveWeight(value: number | undefined, label: string): number {
  const weight = value ?? 1;
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new RangeError(`${label} must have a finite weight greater than zero.`);
  }
  return weight;
}

function assertUniqueIds<T extends { id: string }>(values: T[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (!value.id || seen.has(value.id)) {
      throw new Error(`${label} must contain non-empty, unique IDs.`);
    }
    seen.add(value.id);
  }
}

function validateConfiguration({
  domains,
  items,
  bands,
  criticalOverrides,
}: Omit<ScoreAssessmentInput, "responses">): void {
  assertUniqueIds(domains, "Assessment domains");
  assertUniqueIds(items, "Assessment items");
  assertUniqueIds(bands, "Assessment scoring bands");
  assertUniqueIds(criticalOverrides, "Assessment critical overrides");

  const domainIds = new Set(domains.map((domain) => domain.id));
  for (const domain of domains) assertPositiveWeight(domain.weight, `Domain "${domain.id}"`);
  for (const item of items) {
    if (!domainIds.has(item.domainId)) {
      throw new Error(`Assessment item "${item.id}" references unknown domain "${item.domainId}".`);
    }
    assertPositiveWeight(item.weight, `Item "${item.id}"`);

    if (item.itemType === "numeric") {
      const maxValue = item.maxValue ?? 0;
      if (!Number.isFinite(maxValue) || maxValue <= 0) {
        throw new RangeError(`Numeric item "${item.id}" must have a finite maxValue greater than zero.`);
      }
    } else {
      if (!item.options?.length) {
        throw new Error(`Assessment item "${item.id}" must define at least one option.`);
      }
      assertUniqueIds(item.options, `Options for item "${item.id}"`);
      for (const option of item.options) {
        if (option.itemId !== item.id || !Number.isFinite(option.score) || option.score < 0) {
          throw new Error(`Assessment option "${option.id}" has invalid ownership or score.`);
        }
      }
      if (Math.max(...item.options.map((option) => option.score)) <= 0) {
        throw new RangeError(`Assessment item "${item.id}" must have a positive maximum option score.`);
      }
    }
  }

  for (const band of bands) {
    if (
      !Number.isFinite(band.minScore)
      || !Number.isFinite(band.maxScore)
      || band.minScore < 0
      || band.maxScore > 100
      || band.minScore > band.maxScore
    ) {
      throw new RangeError(`Assessment scoring band "${band.id}" must be a valid range within 0 to 100.`);
    }
  }

  const orderedBands = [...bands].sort((left, right) => left.minScore - right.minScore);
  for (let index = 1; index < orderedBands.length; index += 1) {
    if (orderedBands[index].minScore <= orderedBands[index - 1].maxScore) {
      throw new Error("Assessment scoring bands must not overlap.");
    }
  }

  const itemById = new Map(items.map((item) => [item.id, item]));
  const bandIds = new Set(bands.map((band) => band.id));
  const optionIdsByItem = new Map(items.map((item) => [
    item.id,
    new Set((item.options || []).map((option) => option.id)),
  ]));
  for (const override of criticalOverrides) {
    if (!itemById.has(override.itemId)) {
      throw new Error(`Critical override "${override.id}" references unknown item "${override.itemId}".`);
    }
    if (!optionIdsByItem.get(override.itemId)?.has(override.triggerOptionId)) {
      throw new Error(`Critical override "${override.id}" references an unknown trigger option.`);
    }
    if (!bandIds.has(override.forcedBandId)) {
      throw new Error(`Critical override "${override.id}" references unknown band "${override.forcedBandId}".`);
    }
  }
}

function roundedPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

export function scoreAssessment(input: ScoreAssessmentInput): AssessmentScoreResult {
  const criticalOverrides = input.criticalOverrides || [];
  validateConfiguration({ ...input, criticalOverrides });

  const itemById = new Map(input.items.map((item) => [item.id, item]));
  const responseByItem = new Map<string, AssessmentResponse>();
  for (const response of input.responses) {
    if (!itemById.has(response.itemId)) {
      throw new Error(`Assessment response references unknown item "${response.itemId}".`);
    }
    if (responseByItem.has(response.itemId)) {
      throw new Error(`Assessment contains duplicate responses for item "${response.itemId}".`);
    }
    responseByItem.set(response.itemId, response);
  }

  const domainScores = input.domains.map((domain): AssessmentDomainScore => {
    const domainItems = input.items.filter((item) => item.domainId === domain.id);
    let weightedScore = 0;
    let totalWeight = 0;
    let answeredItems = 0;

    for (const item of domainItems) {
      const response = responseByItem.get(item.id);
      if (!response) continue;

      let rawScore: number;
      let maximumScore: number;
      if (item.itemType === "numeric") {
        const numericValue = response.numericValue ?? Number.NaN;
        if (!Number.isFinite(numericValue)) {
          throw new Error(`Numeric item "${item.id}" requires a finite numeric response.`);
        }
        rawScore = numericValue;
        maximumScore = item.maxValue ?? 0;
        if (rawScore < 0 || rawScore > maximumScore) {
          throw new RangeError(`Numeric response for item "${item.id}" must be within 0 and ${maximumScore}.`);
        }
      } else {
        if (!response.selectedOptionId) {
          throw new Error(`Item "${item.id}" requires a selected option.`);
        }
        const selectedOption = item.options?.find((option) => option.id === response.selectedOptionId);
        if (!selectedOption) {
          throw new Error(`Response for item "${item.id}" selects an unknown option.`);
        }
        rawScore = selectedOption.score;
        maximumScore = Math.max(...(item.options || []).map((option) => option.score));
      }

      const weight = assertPositiveWeight(item.weight, `Item "${item.id}"`);
      weightedScore += (rawScore / maximumScore) * 100 * weight;
      totalWeight += weight;
      answeredItems += 1;
    }

    return {
      domainId: domain.id,
      domainName: domain.name,
      score: totalWeight ? roundedPercent(weightedScore / totalWeight) : null,
      answeredItems,
      totalItems: domainItems.length,
      coveragePercent: domainItems.length ? roundedPercent((answeredItems / domainItems.length) * 100) : 0,
    };
  });

  const scoredDomains = domainScores.filter((domain) => domain.score !== null);
  const totalDomainWeight = scoredDomains.reduce((sum, domainScore) => {
    const domain = input.domains.find((candidate) => candidate.id === domainScore.domainId)!;
    return sum + assertPositiveWeight(domain.weight, `Domain "${domain.id}"`);
  }, 0);
  const weightedOverall = scoredDomains.reduce((sum, domainScore) => {
    const domain = input.domains.find((candidate) => candidate.id === domainScore.domainId)!;
    return sum + (domainScore.score as number) * assertPositiveWeight(domain.weight, `Domain "${domain.id}"`);
  }, 0);
  const score = totalDomainWeight ? roundedPercent(weightedOverall / totalDomainWeight) : null;

  const answeredItems = domainScores.reduce((sum, domain) => sum + domain.answeredItems, 0);
  const totalItems = input.items.length;
  const coveragePercent = totalItems ? roundedPercent((answeredItems / totalItems) * 100) : 0;
  const band = score === null
    ? null
    : input.bands.find((candidate) => score >= candidate.minScore && score <= candidate.maxScore) || null;

  const appliedOverrides = criticalOverrides.filter((override) => (
    responseByItem.get(override.itemId)?.selectedOptionId === override.triggerOptionId
  ));
  const forcedBand = appliedOverrides
    .map((override) => input.bands.find((candidate) => candidate.id === override.forcedBandId)!)
    .sort((left, right) => left.minScore - right.minScore)[0];
  const finalBand = forcedBand || band;
  const recommendations = [
    ...(finalBand?.recommendation ? [finalBand.recommendation] : []),
    ...appliedOverrides.map((override) => override.reason),
  ];

  return {
    score,
    band: finalBand,
    domainScores,
    answeredItems,
    totalItems,
    coveragePercent,
    criticalOverridesApplied: appliedOverrides.map((override) => ({
      id: override.id,
      reason: override.reason,
      forcedBandId: override.forcedBandId,
    })),
    recommendations: [...new Set(recommendations)],
    requiresSupervisorReview: Boolean(
      finalBand?.requiresSupervisorReview || appliedOverrides.some((override) => override.requiresSupervisorReview),
    ),
    decisionSupportOnly: true,
    humanReviewRequired: true,
  };
}
