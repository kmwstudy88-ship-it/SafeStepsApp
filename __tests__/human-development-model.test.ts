import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  buildCompetencyGenome,
  calculateCompetencyEvidenceScore,
  calculateLearningProgressScore,
  getCompetenceLevelRank,
  inferEvidenceLevel,
  shdmCompetenceLevels,
  shdmGrowthSpiral,
  type ShdmCompetencyEvidenceRecord,
  type ShdmLearningProgressRecord,
} from "../lib/engines/humanDevelopmentModel";

const learningProgress: ShdmLearningProgressRecord = {
  personId: "parent-1",
  topicId: "co-regulation",
  lessonsCompleted: 6,
  quizScores: [90, 86],
  timeSpentMinutes: 240,
  activitiesCompleted: 5,
  reflectionsCompleted: 4,
  certificatesEarned: 1,
};

function evidence(overrides: Partial<ShdmCompetencyEvidenceRecord>): ShdmCompetencyEvidenceRecord {
  return {
    id: overrides.id ?? "evidence",
    personId: "parent-1",
    competencyIds: overrides.competencyIds ?? ["communication"],
    evidenceType: overrides.evidenceType ?? "scenario",
    demonstratedLevel: overrides.demonstratedLevel ?? "application",
    score: overrides.score ?? 78,
    confidence: overrides.confidence ?? 75,
    context: overrides.context ?? "home",
    source: overrides.source ?? "scenario_assessment",
    observedAt: overrides.observedAt ?? "2026-07-01",
    ...overrides,
  };
}

describe("humanDevelopmentModel", () => {
  it("defines the seven competence levels from exposure to mastery", () => {
    expect(shdmCompetenceLevels.map((level) => level.id)).toEqual([
      "exposure",
      "knowledge",
      "understanding",
      "application",
      "behaviour",
      "consistency",
      "mastery",
    ]);
    expect(getCompetenceLevelRank("mastery")).toBeGreaterThan(getCompetenceLevelRank("knowledge"));
  });

  it("maps evidence types onto the competence ladder", () => {
    expect(inferEvidenceLevel("lesson_completed")).toBe("exposure");
    expect(inferEvidenceLevel("quiz")).toBe("knowledge");
    expect(inferEvidenceLevel("scenario")).toBe("application");
    expect(inferEvidenceLevel("worker_observation")).toBe("behaviour");
    expect(inferEvidenceLevel("multi_week_pattern")).toBe("consistency");
    expect(inferEvidenceLevel("adapt_strategy")).toBe("mastery");
  });

  it("keeps learning progress separate from demonstrated competency evidence", () => {
    const highLearning = calculateLearningProgressScore(learningProgress);
    const weakEvidence = calculateCompetencyEvidenceScore([
      evidence({ score: 42, confidence: 45, demonstratedLevel: "knowledge", evidenceType: "quiz" }),
    ]);

    expect(highLearning).toBeGreaterThan(80);
    expect(weakEvidence).toBeLessThan(55);
  });

  it("builds a competency genome with context coverage and development gaps", () => {
    const genome = buildCompetencyGenome({
      personId: "parent-1",
      competencies: ["communication", "emotional_regulation"],
      learningProgress: [learningProgress],
      evidence: [
        evidence({ id: "scenario", competencyIds: ["communication"], demonstratedLevel: "application", context: "home" }),
        evidence({ id: "worker", competencyIds: ["communication"], evidenceType: "worker_observation", demonstratedLevel: "behaviour", context: "supervised_contact" }),
        evidence({ id: "weeks", competencyIds: ["communication"], evidenceType: "multi_week_pattern", demonstratedLevel: "consistency", context: "months_later", score: 82, confidence: 80 }),
        evidence({ id: "quiz", competencyIds: ["emotional_regulation"], evidenceType: "quiz", demonstratedLevel: "knowledge", score: 86, confidence: 78 }),
      ],
    });

    expect(genome.find((entry) => entry.competencyId === "communication")).toMatchObject({
      currentLevel: "consistency",
      strongestEvidenceLevel: "consistency",
      contextCoverage: 3,
    });
    expect(genome.find((entry) => entry.competencyId === "emotional_regulation")?.gapSummary).toContain(
      "practical application evidence",
    );
  });

  it("models growth as a cyclical spiral and exposes the assessment route", () => {
    expect(shdmGrowthSpiral).toEqual([
      "learn",
      "understand",
      "practise",
      "reflect",
      "improve",
      "repeat",
      "master",
      "teach",
      "maintain",
    ]);
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/human-development-model"),
    ).toBe(true);
  });
});
