import { buildRecognitionSupportPlan } from "../lib/engines/recognitionSupportEngine";
import { computeSaferGuidedJudgement } from "../lib/engines/saferAssessmentEngine";

describe("recognition support engine", () => {
  test("requires cultural planning when Aboriginal or Torres Strait Islander identity is recorded", () => {
    const plan = buildRecognitionSupportPlan({
      culturalSafety: {
        childIdentifiedAsAboriginalOrTorresStraitIslander: true,
        culturalIdentityRecorded: true,
        culturalPlanRecorded: false,
        familyCommunityConnectionsRecorded: false,
        aboriginalControlledServiceInvolved: false,
      },
      accessibility: {
        disabilityOrAccessNeedIdentified: false,
        communicationPreferenceRecorded: false,
        easyReadRequired: false,
        easyReadProvided: false,
        supportPersonOffered: false,
        reasonableAdjustmentsRecorded: false,
      },
    });

    expect(plan.culturalSafetyRequired).toBe(true);
    expect(plan.complete).toBe(false);
    expect(plan.gaps.map((gap) => gap.id)).toEqual([
      "cultural-plan",
      "family-community-connections",
      "aboriginal-controlled-service",
    ]);
    expect(plan.evidenceTags).toEqual(["cultural_safety"]);
  });

  test("requires accessibility adjustments when disability or Easy Read needs are identified", () => {
    const plan = buildRecognitionSupportPlan({
      culturalSafety: {
        childIdentifiedAsAboriginalOrTorresStraitIslander: false,
        culturalIdentityRecorded: false,
        culturalPlanRecorded: false,
        familyCommunityConnectionsRecorded: false,
        aboriginalControlledServiceInvolved: false,
      },
      accessibility: {
        disabilityOrAccessNeedIdentified: true,
        communicationPreferenceRecorded: true,
        easyReadRequired: true,
        easyReadProvided: false,
        supportPersonOffered: true,
        reasonableAdjustmentsRecorded: false,
      },
    });

    expect(plan.accessibilityRequired).toBe(true);
    expect(plan.gaps.map((gap) => gap.id)).toEqual(["easy-read", "reasonable-adjustments"]);
    expect(plan.evidenceTags).toEqual(["accessibility", "easy_read"]);
  });

  test("blocks SAFER reliance while required recognition support gaps remain", () => {
    const recognitionSupportPlan = buildRecognitionSupportPlan({
      culturalSafety: {
        childIdentifiedAsAboriginalOrTorresStraitIslander: true,
        culturalIdentityRecorded: false,
        culturalPlanRecorded: false,
        familyCommunityConnectionsRecorded: false,
        aboriginalControlledServiceInvolved: false,
      },
      accessibility: {
        disabilityOrAccessNeedIdentified: false,
        communicationPreferenceRecorded: false,
        easyReadRequired: false,
        easyReadProvided: false,
        supportPersonOffered: false,
        reasonableAdjustmentsRecorded: false,
      },
    });

    const result = computeSaferGuidedJudgement({
      consequenceOfHarm: 20,
      probabilityOfHarm: 20,
      protectiveCapacity: 90,
      demonstratedSafety: 90,
      evidenceGapCount: 0,
      reviewState: "reviewed",
      recognitionSupportPlan,
      classifications: [
        {
          evidenceId: "full",
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

    expect(result.requiredReview).toBe(true);
    expect(result.readinessSupportScore).toBe(72.5);
    expect(result.flags).toContain("Record the child's cultural identity before relying on readiness outputs.");
  });
});
