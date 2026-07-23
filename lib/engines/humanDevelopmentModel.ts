export type ShdmCompetenceLevelId =
  | "exposure"
  | "knowledge"
  | "understanding"
  | "application"
  | "behaviour"
  | "consistency"
  | "mastery";

export type ShdmCompetencyId =
  | "communication"
  | "emotional_regulation"
  | "safety"
  | "child_development"
  | "reflective_capacity"
  | "attachment"
  | "problem_solving"
  | "protective_parenting"
  | "co_regulation"
  | "executive_function"
  | "behaviour_support"
  | "stress_management";

export type ShdmEvidenceType =
  | "lesson_completed"
  | "video_watched"
  | "reading_completed"
  | "quiz"
  | "definition"
  | "matching"
  | "explanation"
  | "summary"
  | "teach_back"
  | "misconception_correction"
  | "scenario"
  | "role_play"
  | "simulation"
  | "home_challenge"
  | "practical_exercise"
  | "daily_log"
  | "evidence_upload"
  | "routine_tracking"
  | "worker_observation"
  | "repeated_practice"
  | "multi_week_pattern"
  | "multi_setting_pattern"
  | "stress_level_pattern"
  | "multi_observer_pattern"
  | "teach_others"
  | "adapt_strategy"
  | "novel_problem"
  | "unprompted_maintenance";

export type ShdmContext =
  | "home"
  | "public"
  | "conflict"
  | "child_distress"
  | "tired"
  | "stressed"
  | "different_children"
  | "supervised_contact"
  | "reunification"
  | "months_later";

export type ShdmConfidenceBand = "low" | "moderate" | "high" | "very_high";

export type ShdmLearningProgressRecord = {
  personId: string;
  topicId: string;
  lessonsCompleted: number;
  quizScores: number[];
  timeSpentMinutes: number;
  activitiesCompleted: number;
  reflectionsCompleted: number;
  certificatesEarned: number;
};

export type ShdmCompetencyEvidenceRecord = {
  id: string;
  personId: string;
  competencyIds: ShdmCompetencyId[];
  evidenceType: ShdmEvidenceType;
  demonstratedLevel: ShdmCompetenceLevelId;
  score: number;
  confidence: number;
  context: ShdmContext;
  source: string;
  observedAt: string;
};

export type ShdmCompetencyGenomeEntry = {
  competencyId: ShdmCompetencyId;
  currentLevel: ShdmCompetenceLevelId;
  confidence: ShdmConfidenceBand;
  evidenceCount: number;
  strongestEvidenceLevel: ShdmCompetenceLevelId;
  contextCoverage: number;
  learningProgressScore: number;
  competencyEvidenceScore: number;
  gapSummary: string;
  nextDevelopmentStep: string;
};

export const shdmCompetenceLevels: {
  id: ShdmCompetenceLevelId;
  label: string;
  question: string;
  examples: ShdmEvidenceType[];
  rank: number;
}[] = [
  {
    id: "exposure",
    label: "Exposure",
    question: "Has the person been introduced to the concept?",
    examples: ["lesson_completed", "video_watched", "reading_completed"],
    rank: 1,
  },
  {
    id: "knowledge",
    label: "Knowledge",
    question: "Do they know the information?",
    examples: ["quiz", "definition", "matching"],
    rank: 2,
  },
  {
    id: "understanding",
    label: "Understanding",
    question: "Do they understand the idea?",
    examples: ["explanation", "summary", "teach_back", "misconception_correction"],
    rank: 3,
  },
  {
    id: "application",
    label: "Application",
    question: "Can they use the skill?",
    examples: ["scenario", "role_play", "simulation", "home_challenge", "practical_exercise"],
    rank: 4,
  },
  {
    id: "behaviour",
    label: "Behaviour",
    question: "Are they actually doing it?",
    examples: ["daily_log", "evidence_upload", "routine_tracking", "worker_observation", "repeated_practice"],
    rank: 5,
  },
  {
    id: "consistency",
    label: "Consistency",
    question: "Can they do it reliably?",
    examples: ["multi_week_pattern", "multi_setting_pattern", "stress_level_pattern", "multi_observer_pattern"],
    rank: 6,
  },
  {
    id: "mastery",
    label: "Mastery",
    question: "Can they transfer the skill to new situations?",
    examples: ["teach_others", "adapt_strategy", "novel_problem", "unprompted_maintenance"],
    rank: 7,
  },
];

export const shdmGrowthSpiral = [
  "learn",
  "understand",
  "practise",
  "reflect",
  "improve",
  "repeat",
  "master",
  "teach",
  "maintain",
] as const;

const evidenceTypeLevel: Record<ShdmEvidenceType, ShdmCompetenceLevelId> = shdmCompetenceLevels.reduce(
  (map, level) => {
    for (const type of level.examples) {
      map[type] = level.id;
    }
    return map;
  },
  {} as Record<ShdmEvidenceType, ShdmCompetenceLevelId>,
);

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function getCompetenceLevelRank(level: ShdmCompetenceLevelId) {
  return shdmCompetenceLevels.find((item) => item.id === level)?.rank ?? 0;
}

export function inferEvidenceLevel(evidenceType: ShdmEvidenceType) {
  return evidenceTypeLevel[evidenceType];
}

export function calculateLearningProgressScore(progress: ShdmLearningProgressRecord) {
  const lessonScore = Math.min(progress.lessonsCompleted * 8, 32);
  const quizScore = average(progress.quizScores) * 0.24;
  const timeScore = Math.min(progress.timeSpentMinutes / 12, 20);
  const activityScore = Math.min(progress.activitiesCompleted * 5, 20);
  const reflectionScore = Math.min(progress.reflectionsCompleted * 4, 16);
  const certificateScore = Math.min(progress.certificatesEarned * 8, 12);

  return Math.round(clamp(lessonScore + quizScore + timeScore + activityScore + reflectionScore + certificateScore));
}

export function calculateCompetencyEvidenceScore(evidence: ShdmCompetencyEvidenceRecord[]) {
  if (evidence.length === 0) return 0;

  const weighted = evidence.map((item) => {
    const levelWeight = getCompetenceLevelRank(item.demonstratedLevel) / shdmCompetenceLevels.length;
    return clamp(item.score) * 0.55 + clamp(item.confidence) * 0.2 + levelWeight * 100 * 0.25;
  });

  return Math.round(average(weighted));
}

export function classifyShdmConfidence({
  evidenceCount,
  contextCoverage,
  competencyEvidenceScore,
  strongestLevel,
}: {
  evidenceCount: number;
  contextCoverage: number;
  competencyEvidenceScore: number;
  strongestLevel: ShdmCompetenceLevelId;
}): ShdmConfidenceBand {
  const strongestRank = getCompetenceLevelRank(strongestLevel);

  if (evidenceCount >= 8 && contextCoverage >= 5 && competencyEvidenceScore >= 80 && strongestRank >= 6) {
    return "very_high";
  }
  if (evidenceCount >= 5 && contextCoverage >= 3 && competencyEvidenceScore >= 68 && strongestRank >= 5) {
    return "high";
  }
  if (evidenceCount >= 2 && competencyEvidenceScore >= 50) {
    return "moderate";
  }
  return "low";
}

export function buildCompetencyGenome({
  personId,
  competencies,
  learningProgress,
  evidence,
}: {
  personId: string;
  competencies: ShdmCompetencyId[];
  learningProgress: ShdmLearningProgressRecord[];
  evidence: ShdmCompetencyEvidenceRecord[];
}): ShdmCompetencyGenomeEntry[] {
  return competencies.map((competencyId) => {
    const relevantEvidence = evidence.filter(
      (item) => item.personId === personId && item.competencyIds.includes(competencyId),
    );
    const strongestEvidenceLevel = relevantEvidence.reduce<ShdmCompetenceLevelId>((strongest, item) => {
      return getCompetenceLevelRank(item.demonstratedLevel) > getCompetenceLevelRank(strongest)
        ? item.demonstratedLevel
        : strongest;
    }, "exposure");
    const competencyEvidenceScore = calculateCompetencyEvidenceScore(relevantEvidence);
    const contextCoverage = new Set(relevantEvidence.map((item) => item.context)).size;
    const learningProgressScore = Math.round(
      average(learningProgress.filter((item) => item.personId === personId).map(calculateLearningProgressScore)),
    );
    const confidence = classifyShdmConfidence({
      evidenceCount: relevantEvidence.length,
      contextCoverage,
      competencyEvidenceScore,
      strongestLevel: strongestEvidenceLevel,
    });

    return {
      competencyId,
      currentLevel: determineCurrentLevel(relevantEvidence),
      confidence,
      evidenceCount: relevantEvidence.length,
      strongestEvidenceLevel,
      contextCoverage,
      learningProgressScore,
      competencyEvidenceScore,
      gapSummary: summarizeGap({ learningProgressScore, competencyEvidenceScore, strongestEvidenceLevel }),
      nextDevelopmentStep: recommendDevelopmentStep(strongestEvidenceLevel),
    };
  });
}

function determineCurrentLevel(evidence: ShdmCompetencyEvidenceRecord[]): ShdmCompetenceLevelId {
  if (evidence.length === 0) return "exposure";

  const reliableEvidence = evidence.filter((item) => item.score >= 60 && item.confidence >= 55);
  if (reliableEvidence.length === 0) return "exposure";

  return reliableEvidence.reduce<ShdmCompetenceLevelId>((current, item) => {
    return getCompetenceLevelRank(item.demonstratedLevel) > getCompetenceLevelRank(current)
      ? item.demonstratedLevel
      : current;
  }, "exposure");
}

function summarizeGap({
  learningProgressScore,
  competencyEvidenceScore,
  strongestEvidenceLevel,
}: {
  learningProgressScore: number;
  competencyEvidenceScore: number;
  strongestEvidenceLevel: ShdmCompetenceLevelId;
}) {
  if (learningProgressScore >= 75 && competencyEvidenceScore < 55) {
    return "Learning progress is stronger than demonstrated competency evidence.";
  }

  if (getCompetenceLevelRank(strongestEvidenceLevel) < 4) {
    return "Evidence is mostly learning or recall; practical application evidence is still needed.";
  }

  if (getCompetenceLevelRank(strongestEvidenceLevel) < 6) {
    return "Skill has been demonstrated, but consistency across time and context needs more evidence.";
  }

  return "Evidence supports development beyond learning progress into demonstrated practice.";
}

function recommendDevelopmentStep(level: ShdmCompetenceLevelId) {
  const rank = getCompetenceLevelRank(level);

  if (rank <= 1) return "Add knowledge checks and short explanation prompts.";
  if (rank === 2) return "Add teach-back or misconception-correction evidence.";
  if (rank === 3) return "Add scenarios, role play, simulation, or a practical exercise.";
  if (rank === 4) return "Add observations, routine tracking, and repeated practice evidence.";
  if (rank === 5) return "Collect evidence across weeks, settings, stress levels, and observers.";
  if (rank === 6) return "Look for transfer to novel situations and unprompted maintenance.";
  return "Maintain periodic evidence and opportunities to teach or adapt the skill.";
}
