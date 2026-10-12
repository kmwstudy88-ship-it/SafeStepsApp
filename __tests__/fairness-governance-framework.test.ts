import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  appealLevels,
  assessSmallSampleProtection,
  biasCategories,
  canAiFinaliseOutcome,
  canAssignReviewer,
  coreFairnessRules,
  detectHighRiskLanguage,
  evaluateProceduralFairness,
  fairnessDomains,
  fairnessWorkflow,
} from "../lib/engines/fairnessGovernanceFramework";

describe("fairnessGovernanceFramework", () => {
  it("defines the fairness workflow and eight domains", () => {
    expect(fairnessWorkflow[0]).toBe("Evidence Collection");
    expect(fairnessWorkflow.at(-1)).toBe("Appeal and Reassessment");
    expect(fairnessDomains).toHaveLength(8);
    expect(fairnessDomains.map((domain) => domain.id)).toContain("socioeconomic_fairness");
  });

  it("flags high-risk subjective language for evidence support", () => {
    expect(detectHighRiskLanguage("The parent was uncooperative and lazy.")).toEqual([
      "lazy",
      "uncooperative",
    ]);
  });

  it("requires verified reviewer authority for high-impact or specialist review", () => {
    expect(
      canAssignReviewer({
        credential: { assessorUserId: "a1", reviewerLevel: 2, specialistAreas: [], verificationStatus: "verified" },
        requirement: { requiredLevel: 4, highImpact: true },
      }).allowed,
    ).toBe(false);
    expect(
      canAssignReviewer({
        credential: { assessorUserId: "a2", reviewerLevel: "specialist", specialistAreas: ["disability"], verificationStatus: "verified" },
        requirement: { requiredLevel: "specialist", specialistArea: "disability", highImpact: true },
      }).allowed,
    ).toBe(true);
  });

  it("blocks high-impact release when procedural fairness is incomplete", () => {
    const result = evaluateProceduralFairness({
      noticeProvided: true,
      evidenceAccessProvided: true,
      responseOpportunityProvided: true,
      responseConsidered: false,
      accessibilityChecked: true,
      culturalContextChecked: true,
      conflictChecked: true,
      qualificationChecked: true,
      supportingEvidenceReviewed: true,
      challengingEvidenceReviewed: false,
      alternativesConsidered: true,
      reasonsRecorded: true,
      appealInformationProvided: true,
    });

    expect(result.complete).toBe(false);
    expect(result.releaseBlocked).toBe(true);
    expect(result.missing).toEqual(["responseConsidered", "challengingEvidenceReviewed"]);
  });

  it("protects small samples from unstable or identifying publication", () => {
    expect(
      assessSmallSampleProtection({
        metricCode: "appeal_success_rate",
        sampleSize: 8,
        minimumCalculationSampleSize: 10,
        minimumPublicSampleSize: 20,
      }),
    ).toMatchObject({ publishable: false, calculable: false });
    expect(
      assessSmallSampleProtection({
        metricCode: "appeal_success_rate",
        sampleSize: 12,
        minimumCalculationSampleSize: 10,
        minimumPublicSampleSize: 20,
      }),
    ).toMatchObject({ publishable: false, calculable: true });
  });

  it("keeps AI away from high-impact final decisions", () => {
    expect(canAiFinaliseOutcome("reunification readiness")).toBe(false);
    expect(canAiFinaliseOutcome("next learning activity suggestion")).toBe(true);
    expect(biasCategories).toContain("automation bias");
    expect(coreFairnessRules).toContain("Missing evidence is not evidence of failure.");
    expect(appealLevels).toHaveLength(4);
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/fairness-governance"),
    ).toBe(true);
  });
});
