import type { RecognitionSupportPlan } from "./recognitionSupportEngine";

export type SaferInformationCategory =
  | "child"
  | "parent_or_caregiver"
  | "family"
  | "culture"
  | "community"
  | "risk"
  | "strengths"
  | "protection_and_safety";

export type SaferJudgementDimension =
  | "consequence_of_harm"
  | "probability_of_harm"
  | "protective_capacity"
  | "demonstrated_safety"
  | "evidence_gaps";

export type SaferSpecialistFlag =
  | "aod"
  | "family_violence"
  | "mental_health"
  | "disability"
  | "housing_instability"
  | "social_isolation"
  | "complex_needs"
  | "cultural_safety";

export type SaferReviewState = "draft" | "reviewed" | "contested" | "superseded";

export type SaferEvidenceSourceType =
  | "parent_reflection"
  | "uploaded_evidence"
  | "task_completion"
  | "worker_observation"
  | "service_record"
  | "case_note";

export type SaferEvidenceInput = {
  id: string;
  title: string;
  notes?: string | null;
  sourceType: SaferEvidenceSourceType;
  verified?: boolean;
  observedAt?: string | Date | null;
  manualCategories?: SaferInformationCategory[];
  manualFlags?: SaferSpecialistFlag[];
};

export type SaferEvidenceClassification = {
  evidenceId: string;
  categories: SaferInformationCategory[];
  specialistFlags: SaferSpecialistFlag[];
  confidence: "manual" | "keyword" | "source";
};

export type SaferJudgementInput = {
  consequenceOfHarm: number;
  probabilityOfHarm: number;
  protectiveCapacity: number;
  demonstratedSafety: number;
  evidenceGapCount: number;
  classifications: SaferEvidenceClassification[];
  reviewState?: SaferReviewState;
  recognitionSupportPlan?: RecognitionSupportPlan | null;
};

export type SaferJudgementResult = {
  riskScore: number;
  safetyScore: number;
  evidenceCoverageScore: number;
  readinessSupportScore: number;
  reviewState: SaferReviewState;
  requiredReview: boolean;
  recommendation: string;
  flags: string[];
  missingCategories: SaferInformationCategory[];
  presentCategories: SaferInformationCategory[];
  specialistFlags: SaferSpecialistFlag[];
};

export const saferInformationCategories: SaferInformationCategory[] = [
  "child",
  "parent_or_caregiver",
  "family",
  "culture",
  "community",
  "risk",
  "strengths",
  "protection_and_safety",
];

const categoryKeywords: Record<SaferInformationCategory, string[]> = {
  child: ["child", "children", "young person", "development", "trauma", "school", "sleep", "behaviour"],
  parent_or_caregiver: ["parent", "caregiver", "carer", "father", "mother", "capacity", "attunement"],
  family: ["family", "sibling", "household", "co-parent", "kinship", "relationship"],
  culture: ["culture", "cultural", "aboriginal", "torres strait", "language", "community elder"],
  community: ["community", "school", "service", "support", "care team", "provider", "referral"],
  risk: ["risk", "harm", "unsafe", "incident", "violence", "neglect", "substance", "breach"],
  strengths: ["strength", "progress", "protective routine", "motivation", "engaged", "completed"],
  protection_and_safety: ["safety", "safe", "protection", "protective", "supervision", "routine", "plan"],
};

const specialistFlagKeywords: Record<SaferSpecialistFlag, string[]> = {
  aod: ["aod", "alcohol", "drug", "substance", "screen", "sobriety"],
  family_violence: ["family violence", "coercive", "control", "predominant aggressor", "intervention order"],
  mental_health: ["mental health", "depression", "anxiety", "self-harm", "psychological"],
  disability: ["disability", "ndis", "reasonable adjustment", "accessibility", "easy read"],
  housing_instability: ["housing", "homeless", "accommodation", "tenancy", "unstable home"],
  social_isolation: ["social isolation", "isolated", "no support", "limited support"],
  complex_needs: ["complex needs", "multiple needs", "cumulative", "high risk"],
  cultural_safety: ["cultural safety", "aboriginal", "torres strait", "cultural plan"],
};

function roundScore(value: number) {
  return Math.round(value * 100) / 100;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

function textForEvidence(evidence: SaferEvidenceInput) {
  return `${evidence.title} ${evidence.notes ?? ""}`.toLowerCase();
}

function uniqueSorted<T extends string>(values: T[]) {
  return [...new Set(values)].sort();
}

function keywordMatches<T extends string>(text: string, keywords: Record<T, string[]>) {
  return (Object.entries(keywords) as [T, string[]][])
    .filter(([, terms]) => terms.some((term: string) => text.includes(term)))
    .map(([key]) => key as T);
}

function sourceCategories(sourceType: SaferEvidenceSourceType): SaferInformationCategory[] {
  if (sourceType === "worker_observation" || sourceType === "case_note") {
    return ["risk", "protection_and_safety"];
  }

  if (sourceType === "service_record") {
    return ["community"];
  }

  if (sourceType === "task_completion") {
    return ["strengths", "protection_and_safety"];
  }

  return [];
}

export function classifySaferEvidence(evidence: SaferEvidenceInput): SaferEvidenceClassification {
  const manualCategories = evidence.manualCategories ?? [];
  const manualFlags = evidence.manualFlags ?? [];
  const text = textForEvidence(evidence);
  const categories = uniqueSorted([
    ...manualCategories,
    ...keywordMatches(text, categoryKeywords),
    ...sourceCategories(evidence.sourceType),
  ]);
  const specialistFlags = uniqueSorted([...manualFlags, ...keywordMatches(text, specialistFlagKeywords)]);

  return {
    evidenceId: evidence.id,
    categories,
    specialistFlags,
    confidence: manualCategories.length || manualFlags.length ? "manual" : categories.length || specialistFlags.length ? "keyword" : "source",
  };
}

export function classifySaferEvidenceBatch(evidenceItems: SaferEvidenceInput[]) {
  return evidenceItems.map(classifySaferEvidence);
}

export function computeSaferEvidenceCoverage(classifications: SaferEvidenceClassification[]) {
  const presentCategories = uniqueSorted(classifications.flatMap((classification) => classification.categories));
  const missingCategories = saferInformationCategories.filter((category) => !presentCategories.includes(category));
  const evidenceCoverageScore = roundScore((presentCategories.length / saferInformationCategories.length) * 100);

  return {
    presentCategories,
    missingCategories,
    evidenceCoverageScore,
  };
}

export function computeSaferGuidedJudgement(input: SaferJudgementInput): SaferJudgementResult {
  const consequenceOfHarm = clampScore(input.consequenceOfHarm);
  const probabilityOfHarm = clampScore(input.probabilityOfHarm);
  const protectiveCapacity = clampScore(input.protectiveCapacity);
  const demonstratedSafety = clampScore(input.demonstratedSafety);
  const evidenceGapPenalty = clampScore(input.evidenceGapCount * 8);
  const riskScore = roundScore(consequenceOfHarm * 0.55 + probabilityOfHarm * 0.45);
  const safetyScore = roundScore(protectiveCapacity * 0.45 + demonstratedSafety * 0.55);
  const { presentCategories, missingCategories, evidenceCoverageScore } = computeSaferEvidenceCoverage(input.classifications);
  const specialistFlags = uniqueSorted(input.classifications.flatMap((classification) => classification.specialistFlags));
  const recognitionSupportPlan = input.recognitionSupportPlan ?? null;
  const requiredRecognitionGaps =
    recognitionSupportPlan?.gaps.filter((gap) => gap.severity === "required") ?? [];
  const readinessSupportScore = roundScore(
    clampScore(
      safetyScore * 0.55 +
        evidenceCoverageScore * 0.25 +
        (100 - riskScore) * 0.2 -
        evidenceGapPenalty -
        requiredRecognitionGaps.length * 6,
    ),
  );
  const reviewState = input.reviewState ?? "draft";
  const requiredReview =
    reviewState !== "reviewed" ||
    riskScore >= 65 ||
    readinessSupportScore < 60 ||
    missingCategories.includes("child") ||
    missingCategories.includes("protection_and_safety") ||
    specialistFlags.includes("family_violence") ||
    requiredRecognitionGaps.length > 0;
  const flags = [
    ...(riskScore >= 65 ? ["High risk judgement requires supervisor review."] : []),
    ...(missingCategories.length ? [`Missing SAFER evidence categories: ${missingCategories.join(", ")}.`] : []),
    ...(specialistFlags.includes("family_violence") ? ["Family violence flag requires specialist risk review."] : []),
    ...(input.evidenceGapCount > 0 ? [`${input.evidenceGapCount} evidence gap(s) remain unresolved.`] : []),
    ...requiredRecognitionGaps.map((gap) => gap.label),
    ...(reviewState !== "reviewed" ? [`Assessment is ${reviewState}; do not use as final decision evidence.`] : []),
  ];
  const recommendation =
    requiredReview
      ? "Use as decision-support only; complete practitioner review before relying on readiness findings."
      : "SAFER-aligned evidence is sufficiently covered for reviewed decision-support discussion.";

  return {
    riskScore,
    safetyScore,
    evidenceCoverageScore,
    readinessSupportScore,
    reviewState,
    requiredReview,
    recommendation,
    flags,
    missingCategories,
    presentCategories,
    specialistFlags,
  };
}
