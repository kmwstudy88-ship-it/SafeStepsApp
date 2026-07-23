import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  buildPsychometricAssessmentProfile,
  calculateCompetencyProfile,
  calculateEvidenceQuality,
  calculateReliabilityConfidence,
  classifyVariation,
  type EvidenceQualityInput,
  type PsychometricEvidenceSource,
} from "../lib/engines/psychometricAssessmentEngine";

const highQuality: EvidenceQualityInput = {
  reliability: 80,
  objectivity: 80,
  recency: 80,
  completeness: 80,
  repeatability: 80,
  independence: 80,
  verifiability: 80,
  authenticity: 80,
  relevance: 80,
  strength: 80,
};

function evidence(overrides: Partial<PsychometricEvidenceSource>): PsychometricEvidenceSource {
  return {
    id: overrides.id ?? "evidence",
    competencyIds: overrides.competencyIds ?? ["emotional_regulation"],
    score: overrides.score ?? 80,
    evidenceType: overrides.evidenceType ?? "quiz",
    assessedAt: overrides.assessedAt ?? "2026-07-01",
    quality: overrides.quality ?? highQuality,
    ...overrides,
  };
}

describe("psychometricAssessmentEngine", () => {
  it("averages evidence quality across all ten dimensions", () => {
    expect(
      calculateEvidenceQuality({
        reliability: 100,
        objectivity: 90,
        recency: 80,
        completeness: 70,
        repeatability: 60,
        independence: 50,
        verifiability: 40,
        authenticity: 30,
        relevance: 20,
        strength: 10,
      }),
    ).toBe(55);
  });

  it("treats stable repeated scores as reliable evidence", () => {
    expect(classifyVariation([83, 86, 84])).toBe("low");
    expect(calculateReliabilityConfidence([83, 86, 84])).toBeGreaterThanOrEqual(95);
  });

  it("lowers confidence when repeated scores are erratic", () => {
    expect(classifyVariation([100, 22, 95, 18, 91])).toBe("very_high");
    expect(calculateReliabilityConfidence([100, 22, 95, 18, 91])).toBeLessThan(45);
  });

  it("flags knowledge stronger than demonstrated application without adverse conclusions", () => {
    const profile = calculateCompetencyProfile({
      competencyId: "emotional_regulation",
      evidenceSources: [
        evidence({ id: "quiz", score: 94, evidenceType: "quiz", assessedAt: "2026-01-01" }),
        evidence({ id: "reflection", score: 90, evidenceType: "reflection", assessedAt: "2026-02-01" }),
        evidence({ id: "scenario", score: 52, evidenceType: "scenario", assessedAt: "2026-03-01" }),
        evidence({ id: "demo", score: 50, evidenceType: "video_demonstration", assessedAt: "2026-04-01" }),
      ],
    });

    expect(profile.conflictingEvidence.join(" ")).toContain(
      "Knowledge appears stronger than demonstrated application",
    );
    expect(profile.conflictingEvidence.join(" ").toLowerCase()).not.toContain("dishonest");
    expect(profile.recommendedNextEvidence.join(" ")).toContain("observed practical assessment");
  });

  it("reports sufficiency, diversity, trend, and next evidence for a competency", () => {
    const profile = calculateCompetencyProfile({
      competencyId: "protective_capacity",
      evidenceSources: [
        evidence({ id: "a", competencyIds: ["protective_capacity"], score: 42, evidenceType: "scenario", assessedAt: "2026-01-01" }),
        evidence({ id: "b", competencyIds: ["protective_capacity"], score: 76, evidenceType: "worker_observation", assessedAt: "2026-06-01" }),
        evidence({ id: "c", competencyIds: ["protective_capacity"], score: 84, evidenceType: "home_challenge", assessedAt: "2026-07-01" }),
      ],
    });

    expect(profile.evidenceSufficiency).toBe("adequate");
    expect(profile.evidenceDiversity).toBe(3);
    expect(profile.recentTrend).toBe("strong_improvement");
    expect(profile.recommendedNextEvidence.length).toBeGreaterThan(0);
  });

  it("builds a multi-competency assessment profile and exposes the route", () => {
    const profiles = buildPsychometricAssessmentProfile({
      evidenceSources: [
        evidence({ id: "knowledge", competencyIds: ["knowledge"], score: 82 }),
        evidence({ id: "application", competencyIds: ["application"], score: 67, evidenceType: "scenario" }),
      ],
    });

    expect(profiles.map((profile) => profile.competencyId)).toEqual(["application", "knowledge"]);
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/psychometric-engine"),
    ).toBe(true);
  });
});
