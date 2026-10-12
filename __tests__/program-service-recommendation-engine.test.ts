import {
  buildParentingProgramRecommendations,
  buildProgramRecommendationReferralDrafts,
  getParentNeedCategoryForSignal,
} from "../lib/engines/programServiceRecommendationEngine";

describe("programServiceRecommendationEngine", () => {
  test("maps parent-reported signals to need categories and parenting programs", () => {
    const result = buildParentingProgramRecommendations({
      selectedSignalIds: ["tantrums", "child_cues", "sleep"],
    });

    expect(result.parentNeeds).toEqual([
      "behaviour_emotional_regulation",
      "attachment_connection",
      "practical_life_management",
    ]);
    expect(result.recommendedPrograms.map((program) => program.name)).toEqual([
      "Triple P",
      "Incredible Years",
      "Parent-Child Interaction Therapy (PCIT)",
      "Circle of Security Parenting",
      "Nurturing Parenting Program",
      "Nutrition and Feeding Support",
    ]);
  });

  test("builds app-card and parent-report output", () => {
    const result = buildParentingProgramRecommendations({
      selectedSignalIds: ["bonding_concerns"],
    });

    expect(result.appCards[0]).toEqual({
      programName: "Circle of Security Parenting",
      why: "Strengthens parent-child connection, emotional safety, and understanding of child cues.",
      nextStep: "Explore local facilitators or online program options.",
    });
    expect(result.parentReportText).toContain("Your responses suggest you may benefit from Circle of Security Parenting");
    expect(result.multiProgramSummary).toContain("Nurturing Parenting Program (Attachment)");
  });

  test("creates neutral referral drafts for worker review", () => {
    const result = buildParentingProgramRecommendations({
      parentNeedCategories: ["safety_protection"],
    });

    expect(buildProgramRecommendationReferralDrafts(result)).toEqual([
      {
        serviceType: "Child safety education program",
        providerName: null,
        notes: "Recommendation source: Safety and Protection. Reason: Builds knowledge and routines for safer supervision, boundaries, and home safety.",
      },
      {
        serviceType: "Protective behaviours program",
        providerName: null,
        notes: "Recommendation source: Safety and Protection. Reason: Supports protective behaviours, safe boundaries, and child-focused safety language.",
      },
    ]);
  });

  test("ignores unknown signals without creating false recommendations", () => {
    const result = buildParentingProgramRecommendations({
      selectedSignalIds: ["unknown-signal"],
    });

    expect(getParentNeedCategoryForSignal("unknown-signal")).toBeUndefined();
    expect(result.recommendedPrograms).toHaveLength(0);
    expect(result.parentReportText).toContain("No parenting program recommendation");
  });
});
