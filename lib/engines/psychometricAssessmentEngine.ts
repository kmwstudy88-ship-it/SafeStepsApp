export type PsychometricCompetencyId =
  | "knowledge"
  | "understanding"
  | "application"
  | "insight"
  | "communication"
  | "decision_making"
  | "problem_solving"
  | "emotional_regulation"
  | "safety"
  | "parenting"
  | "consistency"
  | "behaviour_change"
  | "protective_capacity"
  | "reflective_capacity"
  | "resilience"
  | "self_awareness"
  | "executive_function"
  | "planning"
  | "organisation"
  | "motivation"
  | "engagement";

export type PsychometricDifficulty =
  | "very_easy"
  | "easy"
  | "moderate"
  | "hard"
  | "very_hard"
  | "expert";

export type PsychometricEvidenceType =
  | "quiz"
  | "scenario"
  | "reflection"
  | "worker_observation"
  | "home_challenge"
  | "child_feedback"
  | "ai_conversation"
  | "behaviour_trend"
  | "video_demonstration"
  | "retention_check";

export type PsychometricBand = "low" | "emerging" | "adequate" | "strong";
export type PsychometricTrend = "declining" | "stable" | "improving" | "strong_improvement" | "not_enough_data";
export type PsychometricVariation = "low" | "moderate" | "high" | "very_high" | "not_enough_data";

export type EvidenceQualityInput = {
  reliability: number;
  objectivity: number;
  recency: number;
  completeness: number;
  repeatability: number;
  independence: number;
  verifiability: number;
  authenticity: number;
  relevance: number;
  strength: number;
};

export type PsychometricEvidenceSource = {
  id: string;
  competencyIds: PsychometricCompetencyId[];
  score: number;
  evidenceType: PsychometricEvidenceType;
  quality: EvidenceQualityInput;
  assessedAt: string;
  attemptNumber?: number;
  difficulty?: PsychometricDifficulty;
  validityScore?: number;
  discriminationScore?: number;
  confidenceRating?: number;
  sourceLabel?: string;
};

export type PsychometricCompetencyProfile = {
  competencyId: PsychometricCompetencyId;
  competencyLevel: number;
  confidence: number;
  evidenceQuality: number;
  evidenceDiversity: number;
  evidenceSufficiency: PsychometricBand;
  recentTrend: PsychometricTrend;
  conflictingEvidence: string[];
  recommendedNextEvidence: string[];
  evidenceSources: number;
  consistency: PsychometricVariation;
  retention: "not_assessed" | "weak" | "moderate" | "strong";
  application: "not_assessed" | "weak" | "moderate" | "strong";
  qualityBreakdown: EvidenceQualityInput;
};

const qualityKeys: (keyof EvidenceQualityInput)[] = [
  "reliability",
  "objectivity",
  "recency",
  "completeness",
  "repeatability",
  "independence",
  "verifiability",
  "authenticity",
  "relevance",
  "strength",
];

const applicationEvidenceTypes: PsychometricEvidenceType[] = [
  "scenario",
  "worker_observation",
  "home_challenge",
  "behaviour_trend",
  "video_demonstration",
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round(value: number) {
  return Math.round(value);
}

export function calculateEvidenceQuality(quality: EvidenceQualityInput) {
  return round(average(qualityKeys.map((key) => clampScore(quality[key]))));
}

export function classifyVariation(scores: number[]): PsychometricVariation {
  if (scores.length < 2) return "not_enough_data";

  const mean = average(scores);
  const standardDeviation = Math.sqrt(average(scores.map((score) => (score - mean) ** 2)));

  if (standardDeviation <= 5) return "low";
  if (standardDeviation <= 12) return "moderate";
  if (standardDeviation <= 25) return "high";
  return "very_high";
}

export function calculateReliabilityConfidence(scores: number[]) {
  const variation = classifyVariation(scores);
  const attemptBonus = Math.min(scores.length * 8, 24);
  const variationScore = {
    low: 76,
    moderate: 58,
    high: 34,
    very_high: 14,
    not_enough_data: 24,
  }[variation];

  return clampScore(variationScore + attemptBonus);
}

function classifySufficiency(sourceCount: number, diversity: number, quality: number): PsychometricBand {
  if (sourceCount >= 6 && diversity >= 5 && quality >= 70) return "strong";
  if (sourceCount >= 3 && diversity >= 3 && quality >= 60) return "adequate";
  if (sourceCount >= 2) return "emerging";
  return "low";
}

function classifySignal(score: number): "weak" | "moderate" | "strong" {
  if (score >= 75) return "strong";
  if (score >= 50) return "moderate";
  return "weak";
}

function calculateTrend(sources: PsychometricEvidenceSource[]): PsychometricTrend {
  if (sources.length < 3) return "not_enough_data";

  const chronological = [...sources].sort(
    (left, right) => new Date(left.assessedAt).getTime() - new Date(right.assessedAt).getTime(),
  );
  const splitPoint = Math.max(1, Math.floor(chronological.length / 2));
  const early = average(chronological.slice(0, splitPoint).map((source) => source.score));
  const recent = average(chronological.slice(splitPoint).map((source) => source.score));
  const delta = recent - early;

  if (delta >= 20) return "strong_improvement";
  if (delta >= 8) return "improving";
  if (delta <= -8) return "declining";
  return "stable";
}

function averageQualityBreakdown(sources: PsychometricEvidenceSource[]): EvidenceQualityInput {
  return qualityKeys.reduce((breakdown, key) => {
    breakdown[key] = round(average(sources.map((source) => clampScore(source.quality[key]))));
    return breakdown;
  }, {} as EvidenceQualityInput);
}

function detectContradictions(sources: PsychometricEvidenceSource[]) {
  const knowledgeScores = sources
    .filter((source) => ["quiz", "reflection", "retention_check"].includes(source.evidenceType))
    .map((source) => source.score);
  const applicationScores = sources
    .filter((source) => applicationEvidenceTypes.includes(source.evidenceType))
    .map((source) => source.score);

  if (knowledgeScores.length === 0 || applicationScores.length === 0) return [];

  const knowledgeAverage = average(knowledgeScores);
  const applicationAverage = average(applicationScores);

  if (knowledgeAverage - applicationAverage >= 25) {
    return [
      "Knowledge appears stronger than demonstrated application. Additional practical assessment recommended.",
    ];
  }

  if (applicationAverage - knowledgeAverage >= 25) {
    return [
      "Observed practice appears stronger than quiz or reflection evidence. Additional knowledge check recommended.",
    ];
  }

  return [];
}

export function recommendNextEvidence(profile: Pick<
  PsychometricCompetencyProfile,
  "evidenceSufficiency" | "confidence" | "conflictingEvidence" | "application" | "retention"
>) {
  const recommendations: string[] = [];

  if (profile.evidenceSufficiency === "low" || profile.evidenceSufficiency === "emerging") {
    recommendations.push("Complete two practical activities and one scenario assessment.");
  }

  if (profile.conflictingEvidence.length > 0) {
    recommendations.push("Add an observed practical assessment to clarify the discrepancy.");
  }

  if (profile.application === "not_assessed" || profile.application === "weak") {
    recommendations.push("Add home challenge, scenario, or video demonstration evidence.");
  }

  if (profile.retention === "not_assessed") {
    recommendations.push("Schedule a follow-up retention check after the next review period.");
  }

  return recommendations.length > 0 ? recommendations : ["Maintain periodic reassessment to confirm sustained competency."];
}

export function calculateCompetencyProfile({
  competencyId,
  evidenceSources,
}: {
  competencyId: PsychometricCompetencyId;
  evidenceSources: PsychometricEvidenceSource[];
}): PsychometricCompetencyProfile {
  const relevantSources = evidenceSources.filter((source) => source.competencyIds.includes(competencyId));

  if (relevantSources.length === 0) {
    const emptyProfile: PsychometricCompetencyProfile = {
      competencyId,
      competencyLevel: 0,
      confidence: 0,
      evidenceQuality: 0,
      evidenceDiversity: 0,
      evidenceSufficiency: "low",
      recentTrend: "not_enough_data",
      conflictingEvidence: [],
      recommendedNextEvidence: [],
      evidenceSources: 0,
      consistency: "not_enough_data",
      retention: "not_assessed",
      application: "not_assessed",
      qualityBreakdown: {
        reliability: 0,
        objectivity: 0,
        recency: 0,
        completeness: 0,
        repeatability: 0,
        independence: 0,
        verifiability: 0,
        authenticity: 0,
        relevance: 0,
        strength: 0,
      },
    };
    return { ...emptyProfile, recommendedNextEvidence: recommendNextEvidence(emptyProfile) };
  }

  const scoredSources = relevantSources.map((source) => {
    const quality = calculateEvidenceQuality(source.quality);
    const validity = source.validityScore ?? 75;
    const discrimination = source.discriminationScore ?? 70;
    const confidencePenalty = source.confidenceRating === undefined ? 0 : (100 - source.confidenceRating) * 0.12;
    const weight = Math.max(1, quality * 0.55 + validity * 0.3 + discrimination * 0.15 - confidencePenalty);

    return { source, quality, weight };
  });

  const weightedTotal = scoredSources.reduce(
    (total, item) => total + clampScore(item.source.score) * item.weight,
    0,
  );
  const totalWeight = scoredSources.reduce((total, item) => total + item.weight, 0);
  const competencyLevel = round(weightedTotal / totalWeight);
  const evidenceQuality = round(average(scoredSources.map((item) => item.quality)));
  const evidenceTypes = new Set(relevantSources.map((source) => source.evidenceType));
  const evidenceDiversity = evidenceTypes.size;
  const scores = relevantSources.map((source) => source.score);
  const reliabilityConfidence = calculateReliabilityConfidence(scores);
  const confidence = round(
    clampScore(
      reliabilityConfidence * 0.32 +
        evidenceQuality * 0.26 +
        Math.min(relevantSources.length * 9, 24) +
        Math.min(evidenceDiversity * 5, 20),
    ),
  );
  const applicationSources = relevantSources.filter((source) => applicationEvidenceTypes.includes(source.evidenceType));
  const retentionSources = relevantSources.filter((source) => source.evidenceType === "retention_check");
  const conflictingEvidence = detectContradictions(relevantSources);

  const profile: PsychometricCompetencyProfile = {
    competencyId,
    competencyLevel,
    confidence,
    evidenceQuality,
    evidenceDiversity,
    evidenceSufficiency: classifySufficiency(relevantSources.length, evidenceDiversity, evidenceQuality),
    recentTrend: calculateTrend(relevantSources),
    conflictingEvidence,
    recommendedNextEvidence: [],
    evidenceSources: relevantSources.length,
    consistency: classifyVariation(scores),
    retention: retentionSources.length === 0 ? "not_assessed" : classifySignal(average(retentionSources.map((source) => source.score))),
    application:
      applicationSources.length === 0 ? "not_assessed" : classifySignal(average(applicationSources.map((source) => source.score))),
    qualityBreakdown: averageQualityBreakdown(relevantSources),
  };

  return { ...profile, recommendedNextEvidence: recommendNextEvidence(profile) };
}

export function buildPsychometricAssessmentProfile({
  evidenceSources,
  competencyIds,
}: {
  evidenceSources: PsychometricEvidenceSource[];
  competencyIds?: PsychometricCompetencyId[];
}) {
  const ids =
    competencyIds ??
    Array.from(new Set(evidenceSources.flatMap((source) => source.competencyIds))).sort();

  return ids.map((competencyId) =>
    calculateCompetencyProfile({ competencyId, evidenceSources }),
  );
}
