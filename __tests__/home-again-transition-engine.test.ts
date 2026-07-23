import { evaluateHomeAgainTransition, type HomeAgainWeeklySignal } from "../lib/engines/homeAgainTransitionEngine";

const completeMaintenancePlan = {
  safetyPlanCurrent: true,
  supportNetworkConfirmed: true,
  relapsePreventionPlanCurrent: true,
  childVoiceReviewed: true,
  schoolHealthPlanCurrent: true,
  reviewMeetingBooked: true,
};

function stableWeek(id: string, weekStart: string, overrides: Partial<HomeAgainWeeklySignal> = {}): HomeAgainWeeklySignal {
  return {
    id,
    weekStart,
    homeRoutineConsistencyScore: 5,
    childAdjustmentScore: 4,
    parentRegulationScore: 5,
    supportUseScore: 4,
    schoolHealthCommunityStabilityScore: 4,
    riskFlags: [],
    ...overrides,
  };
}

describe("Home Again transition engine", () => {
  test("allows step-down review when return-home stability and maintenance gates are met", () => {
    const result = evaluateHomeAgainTransition({
      caseId: "case-1",
      parentProfileId: "parent-1",
      weeksAtHome: [
        stableWeek("week-1", "2026-07-01"),
        stableWeek("week-2", "2026-07-08"),
        stableWeek("week-3", "2026-07-15"),
        stableWeek("week-4", "2026-07-22"),
      ],
      maintenancePlan: completeMaintenancePlan,
    });

    expect(result.recommendation).toBe("step_down_to_build_stronger_families");
    expect(result.canStepDown).toBe(true);
    expect(result.shouldReturnToIntensive).toBe(false);
    expect(result.hardBlocks).toEqual([]);
    expect(result.reportLanguage).toContain("not an automatic program transition");
  });

  test("returns to intensive review when child distress spikes during the home window", () => {
    const result = evaluateHomeAgainTransition({
      caseId: "case-1",
      parentProfileId: "parent-1",
      weeksAtHome: [
        stableWeek("week-1", "2026-07-01"),
        stableWeek("week-2", "2026-07-08", { childDistressSpike: true }),
        stableWeek("week-3", "2026-07-15"),
        stableWeek("week-4", "2026-07-22"),
      ],
      maintenancePlan: completeMaintenancePlan,
    });

    expect(result.recommendation).toBe("return_to_intensive_reunification");
    expect(result.canStepDown).toBe(false);
    expect(result.shouldReturnToIntensive).toBe(true);
    expect(result.hardBlocks).toContain("Child distress spike is recorded during the return-home window.");
    expect(result.requiredInterventions).toContain("child_adjustment_review");
  });

  test("requires urgent case review when red or critical risk is present", () => {
    const result = evaluateHomeAgainTransition({
      caseId: "case-1",
      parentProfileId: "parent-1",
      weeksAtHome: [
        stableWeek("week-1", "2026-07-01"),
        stableWeek("week-2", "2026-07-08", {
          riskFlags: [{ code: "unsafe_home_return", severity: "red" }],
        }),
        stableWeek("week-3", "2026-07-15"),
        stableWeek("week-4", "2026-07-22"),
      ],
      maintenancePlan: completeMaintenancePlan,
    });

    expect(result.recommendation).toBe("urgent_case_review");
    expect(result.riskLevel).toBe("critical");
    expect(result.hardBlocks).toContain("Amber or red home-stability risk flag is present in the review window.");
    expect(result.reportLanguage).toContain("urgent case review");
  });

  test("continues Home Again when maintenance planning is incomplete", () => {
    const result = evaluateHomeAgainTransition({
      caseId: "case-1",
      parentProfileId: "parent-1",
      weeksAtHome: [
        stableWeek("week-1", "2026-07-01"),
        stableWeek("week-2", "2026-07-08"),
        stableWeek("week-3", "2026-07-15"),
        stableWeek("week-4", "2026-07-22"),
      ],
      maintenancePlan: {
        ...completeMaintenancePlan,
        reviewMeetingBooked: false,
      },
    });

    expect(result.recommendation).toBe("continue_home_again");
    expect(result.canStepDown).toBe(false);
    expect(result.reasons).toContain("Maintenance plan incomplete: 5/6 checks complete.");
    expect(result.requiredInterventions).toContain("complete_maintenance_plan");
  });
});
