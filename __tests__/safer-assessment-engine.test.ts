import {
  classifySaferEvidence,
  classifySaferEvidenceBatch,
  computeSaferEvidenceCoverage,
  computeSaferGuidedJudgement,
} from "../lib/engines/saferAssessmentEngine";

describe("SAFER assessment engine", () => {
  test("classifies evidence into SAFER categories and specialist flags", () => {
    const classification = classifySaferEvidence({
      id: "evidence-1",
      title: "AOD support plan and safe bedtime routine",
      notes: "Parent completed alcohol counselling intake and uploaded a child safety routine.",
      sourceType: "uploaded_evidence",
    });

    expect(classification.categories).toEqual([
      "child",
      "community",
      "parent_or_caregiver",
      "protection_and_safety",
      "strengths",
    ]);
    expect(classification.specialistFlags).toEqual(["aod"]);
    expect(classification.confidence).toBe("keyword");
  });

  test("uses source type categories for worker observations", () => {
    expect(
      classifySaferEvidence({
        id: "observation-1",
        title: "Contact visit observation",
        sourceType: "worker_observation",
      }).categories,
    ).toEqual(["protection_and_safety", "risk"]);
  });

  test("calculates evidence coverage across all SAFER information categories", () => {
    const classifications = classifySaferEvidenceBatch([
      {
        id: "one",
        title: "Child development and trauma reflection",
        sourceType: "parent_reflection",
      },
      {
        id: "two",
        title: "Cultural plan and community support service note",
        sourceType: "service_record",
      },
      {
        id: "three",
        title: "Completed protective routine task",
        sourceType: "task_completion",
      },
    ]);

    const coverage = computeSaferEvidenceCoverage(classifications);

    expect(coverage.presentCategories).toEqual([
      "child",
      "community",
      "culture",
      "protection_and_safety",
      "strengths",
    ]);
    expect(coverage.missingCategories).toEqual(["parent_or_caregiver", "family", "risk"]);
    expect(coverage.evidenceCoverageScore).toBe(62.5);
  });

  test("keeps high-risk SAFER judgement in practitioner review", () => {
    const result = computeSaferGuidedJudgement({
      consequenceOfHarm: 80,
      probabilityOfHarm: 70,
      protectiveCapacity: 65,
      demonstratedSafety: 55,
      evidenceGapCount: 2,
      reviewState: "draft",
      classifications: classifySaferEvidenceBatch([
        {
          id: "fv",
          title: "Family violence risk and safety plan",
          notes: "Coercive control noted by worker.",
          sourceType: "worker_observation",
        },
      ]),
    });

    expect(result.riskScore).toBe(75.5);
    expect(result.requiredReview).toBe(true);
    expect(result.specialistFlags).toContain("family_violence");
    expect(result.flags).toContain("Family violence flag requires specialist risk review.");
    expect(result.recommendation).toBe(
      "Use as decision-support only; complete practitioner review before relying on readiness findings.",
    );
  });

  test("allows reviewed decision-support when coverage and safety are strong", () => {
    const result = computeSaferGuidedJudgement({
      consequenceOfHarm: 20,
      probabilityOfHarm: 25,
      protectiveCapacity: 90,
      demonstratedSafety: 88,
      evidenceGapCount: 0,
      reviewState: "reviewed",
      classifications: [
        {
          evidenceId: "manual",
          categories: [
            "child",
            "parent_or_caregiver",
            "family",
            "culture",
            "community",
            "risk",
            "strengths",
            "protection_and_safety",
          ],
          specialistFlags: [],
          confidence: "manual",
        },
      ],
    });

    expect(result.requiredReview).toBe(false);
    expect(result.evidenceCoverageScore).toBe(100);
    expect(result.readinessSupportScore).toBe(89.45);
    expect(result.recommendation).toBe(
      "SAFER-aligned evidence is sufficiently covered for reviewed decision-support discussion.",
    );
  });
});
