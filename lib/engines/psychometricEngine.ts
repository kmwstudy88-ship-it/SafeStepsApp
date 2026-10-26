/**
 * SafeSteps Psychometric & Evidence Quality Engine
 *
 * Converts multi-source assessment evidence into calibrated quality metrics:
 *   - Evidence Sufficiency: Multi-source coverage across required capability domains
 *   - Reliability & Inter-Rater Agreement: Alignment between worker observations and parent self-reports
 *   - Temporal Validity: Freshness and context-relevance of observations
 *   - Contradiction Penalty: Weight of disputed vs corroborated claims
 *   - Next-Evidence Recommendations: Actionable prompts for filling evidence gaps
 *
 * Decision-support only; does not produce automated competency or placement judgements.
 */

export type PsychometricEvidenceItem = {
  id: string;
  domainId: string;
  sourceType:
    | "worker_observation"
    | "parent_reflection"
    | "task_completion"
    | "service_record"
    | "third_party_corroboration";
  score: number; // 0-100
  weight?: number;
  observedAt: string; // ISO date
  corroborated: boolean;
  contradicted: boolean;
  observerId?: string;
};

export type PsychometricDomainRequirement = {
  domainId: string;
  domainName: string;
  minimumItemsRequired: number;
  weight: number;
};

export type PsychometricEngineInput = {
  caseId: string;
  subjectId: string;
  domains: PsychometricDomainRequirement[];
  evidenceItems: PsychometricEvidenceItem[];
  evaluationDate?: string;
};

export type PsychometricDomainResult = {
  domainId: string;
  domainName: string;
  sufficiencyScore: number; // 0-100
  meanEvidenceScore: number;
  itemCount: number;
  isSufficient: boolean;
  missingEvidenceTypes: string[];
};

export type PsychometricQualityResult = {
  caseId: string;
  subjectId: string;
  overallSufficiencyScore: number; // 0-100
  reliabilityScore: number; // 0-100 (inter-rater agreement)
  validityScore: number; // 0-100 (temporal freshness and corroboration)
  competencyConfidence: number; // 0-1 (calibrated metric, not percentage)
  domainBreakdown: PsychometricDomainResult[];
  unresolvedContradictionsCount: number;
  uncorroboratedClaimsCount: number;
  recommendedNextEvidence: string[];
  decisionSupportOnly: true;
  humanReviewRequired: true;
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function evaluatePsychometricQuality(
  input: PsychometricEngineInput,
): PsychometricQualityResult {
  const evalDate = input.evaluationDate ? new Date(input.evaluationDate) : new Date();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  const domainBreakdown: PsychometricDomainResult[] = [];
  const recommendedNextEvidence: string[] = [];

  let totalWeightedSufficiency = 0;
  let totalDomainWeight = 0;
  let totalContradictions = 0;
  let totalUncorroborated = 0;

  for (const domain of input.domains) {
    const items = input.evidenceItems.filter((e) => e.domainId === domain.domainId);
    const sourceTypes = new Set(items.map((i) => i.sourceType));

    const distinctSources = sourceTypes.size;
    const count = items.length;
    const isSufficient = count >= domain.minimumItemsRequired && distinctSources >= 2;

    const countRatio = Math.min(1, count / Math.max(1, domain.minimumItemsRequired));
    const diversityRatio = Math.min(1, distinctSources / 2);
    const sufficiencyScore = round(countRatio * 50 + diversityRatio * 50);

    const meanScore = count > 0
      ? round(items.reduce((sum, item) => sum + item.score, 0) / count)
      : 0;

    const missingSources: string[] = [];
    if (!sourceTypes.has("worker_observation")) missingSources.push("worker_observation");
    if (!sourceTypes.has("parent_reflection")) missingSources.push("parent_reflection");
    if (!sourceTypes.has("service_record")) missingSources.push("service_record");

    if (!isSufficient) {
      recommendedNextEvidence.push(
        `Gather additional independent evidence for "${domain.domainName}" (needs at least ${domain.minimumItemsRequired} items from 2+ distinct sources).`,
      );
    }

    domainBreakdown.push({
      domainId: domain.domainId,
      domainName: domain.domainName,
      sufficiencyScore,
      meanEvidenceScore: meanScore,
      itemCount: count,
      isSufficient,
      missingEvidenceTypes: missingSources,
    });

    totalWeightedSufficiency += sufficiencyScore * domain.weight;
    totalDomainWeight += domain.weight;
  }

  const overallSufficiency = totalDomainWeight > 0
    ? round(totalWeightedSufficiency / totalDomainWeight)
    : 0;

  // Inter-rater agreement: Compare worker_observation vs parent_reflection
  const workerItems = input.evidenceItems.filter((e) => e.sourceType === "worker_observation");
  const parentItems = input.evidenceItems.filter((e) => e.sourceType === "parent_reflection");

  let reliabilityScore = 70; // baseline if both absent
  if (workerItems.length > 0 && parentItems.length > 0) {
    const workerMean = workerItems.reduce((acc, curr) => acc + curr.score, 0) / workerItems.length;
    const parentMean = parentItems.reduce((acc, curr) => acc + curr.score, 0) / parentItems.length;
    const discrepancy = Math.abs(workerMean - parentMean);
    reliabilityScore = clamp(round(100 - discrepancy * 1.2));
  } else if (workerItems.length > 0 || parentItems.length > 0) {
    reliabilityScore = 55; // single perspective penalty
  }

  // Validity: Freshness and corroboration
  let freshCount = 0;
  for (const item of input.evidenceItems) {
    if (item.contradicted) totalContradictions += 1;
    if (!item.corroborated) totalUncorroborated += 1;

    const itemDate = new Date(item.observedAt);
    if (!isNaN(itemDate.getTime()) && evalDate.getTime() - itemDate.getTime() <= ninetyDaysMs) {
      freshCount += 1;
    }
  }

  const freshnessRatio = input.evidenceItems.length > 0
    ? freshCount / input.evidenceItems.length
    : 0;
  const corroborationRatio = input.evidenceItems.length > 0
    ? (input.evidenceItems.length - totalUncorroborated) / input.evidenceItems.length
    : 0;

  const validityScore = round(freshnessRatio * 50 + corroborationRatio * 50);

  if (totalContradictions > 0) {
    recommendedNextEvidence.push(
      `Cross-examine ${totalContradictions} contradictory evidence record(s) with primary provider reports.`,
    );
  }

  // Calibrated confidence (0 to 1)
  const penalty = (totalContradictions * 0.15) + (totalUncorroborated * 0.05);
  const rawConfidence = ((overallSufficiency * 0.4) + (reliabilityScore * 0.3) + (validityScore * 0.3)) / 100 - penalty;
  const competencyConfidence = round(Math.max(0.1, Math.min(0.95, rawConfidence)));

  return {
    caseId: input.caseId,
    subjectId: input.subjectId,
    overallSufficiencyScore: overallSufficiency,
    reliabilityScore,
    validityScore,
    competencyConfidence,
    domainBreakdown,
    unresolvedContradictionsCount: totalContradictions,
    uncorroboratedClaimsCount: totalUncorroborated,
    recommendedNextEvidence: [...new Set(recommendedNextEvidence)],
    decisionSupportOnly: true,
    humanReviewRequired: true,
  };
}
