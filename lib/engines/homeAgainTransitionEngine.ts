export type HomeAgainRiskFlag = {
  code: string;
  severity: "green" | "amber" | "red" | "critical";
};

export type HomeAgainWeeklySignal = {
  id: string;
  weekStart: string;
  homeRoutineConsistencyScore: number;
  childAdjustmentScore: number;
  parentRegulationScore: number;
  supportUseScore: number;
  schoolHealthCommunityStabilityScore?: number | null;
  childDistressSpike?: boolean;
  missedCriticalRoutineCount?: number;
  riskFlags?: HomeAgainRiskFlag[];
};

export type HomeAgainMaintenancePlan = {
  safetyPlanCurrent: boolean;
  supportNetworkConfirmed: boolean;
  relapsePreventionPlanCurrent: boolean;
  childVoiceReviewed: boolean;
  schoolHealthPlanCurrent: boolean;
  reviewMeetingBooked: boolean;
};

export type EvaluateHomeAgainTransitionInput = {
  caseId: string;
  parentProfileId: string;
  weeksAtHome: HomeAgainWeeklySignal[];
  maintenancePlan: HomeAgainMaintenancePlan;
  minimumStabilityWeeks?: number;
  caseworkerManualHold?: boolean;
  courtOrderedConstraint?: boolean;
};

export type HomeAgainRecommendation =
  | "continue_home_again"
  | "step_down_to_build_stronger_families"
  | "return_to_intensive_reunification"
  | "urgent_case_review";

export type EvaluateHomeAgainTransitionResult = {
  recommendation: HomeAgainRecommendation;
  stabilityScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  canStepDown: boolean;
  shouldReturnToIntensive: boolean;
  reasons: string[];
  hardBlocks: string[];
  requiredInterventions: string[];
  reportLanguage: string;
};

function newestFirst(signals: HomeAgainWeeklySignal[]) {
  return [...signals].sort((left, right) => right.weekStart.localeCompare(left.weekStart));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

function hasAmberOrWorse(flags: HomeAgainRiskFlag[] | undefined) {
  return (flags ?? []).some((flag) => ["amber", "red", "critical"].includes(flag.severity));
}

function hasRedOrCritical(flags: HomeAgainRiskFlag[] | undefined) {
  return (flags ?? []).some((flag) => ["red", "critical"].includes(flag.severity));
}

function maintenanceCompletion(plan: HomeAgainMaintenancePlan) {
  const checks = [
    plan.safetyPlanCurrent,
    plan.supportNetworkConfirmed,
    plan.relapsePreventionPlanCurrent,
    plan.childVoiceReviewed,
    plan.schoolHealthPlanCurrent,
    plan.reviewMeetingBooked,
  ];
  return {
    completed: checks.filter(Boolean).length,
    total: checks.length,
    complete: checks.every(Boolean),
  };
}

export function evaluateHomeAgainTransition(
  input: EvaluateHomeAgainTransitionInput,
): EvaluateHomeAgainTransitionResult {
  const minimumStabilityWeeks = input.minimumStabilityWeeks ?? 4;
  const reviewWindow = newestFirst(input.weeksAtHome).slice(0, minimumStabilityWeeks);
  const hardBlocks: string[] = [];
  const reasons: string[] = [];
  const interventions = new Set<string>();
  const maintenance = maintenanceCompletion(input.maintenancePlan);

  if (input.caseworkerManualHold) {
    hardBlocks.push("Caseworker manual hold is active.");
    interventions.add("caseworker_review");
  }

  if (input.courtOrderedConstraint) {
    hardBlocks.push("Court-ordered constraint prevents step-down.");
    interventions.add("legal_constraint_review");
  }

  if (reviewWindow.some((week) => hasAmberOrWorse(week.riskFlags))) {
    hardBlocks.push("Amber or red home-stability risk flag is present in the review window.");
    interventions.add("home_stability_safety_review");
  }

  if (reviewWindow.some((week) => week.childDistressSpike)) {
    hardBlocks.push("Child distress spike is recorded during the return-home window.");
    interventions.add("child_adjustment_review");
  }

  if (reviewWindow.some((week) => (week.missedCriticalRoutineCount ?? 0) >= 2)) {
    hardBlocks.push("Repeated missed critical routines are recorded.");
    interventions.add("routine_repair_plan");
  }

  if (reviewWindow.length < minimumStabilityWeeks) {
    reasons.push(`Needs ${minimumStabilityWeeks} weeks of return-home stability evidence.`);
    interventions.add("continue_weekly_home_again_logs");
  }

  const routineAverage = average(reviewWindow.map((week) => week.homeRoutineConsistencyScore));
  const childAdjustmentAverage = average(reviewWindow.map((week) => week.childAdjustmentScore));
  const regulationAverage = average(reviewWindow.map((week) => week.parentRegulationScore));
  const supportAverage = average(reviewWindow.map((week) => week.supportUseScore));
  const schoolHealthAverage = average(
    reviewWindow
      .map((week) => week.schoolHealthCommunityStabilityScore)
      .filter((value): value is number => typeof value === "number"),
  );
  const stabilityScore = average([
    routineAverage,
    childAdjustmentAverage,
    regulationAverage,
    supportAverage,
    schoolHealthAverage || supportAverage,
  ]);

  if (routineAverage < 4) {
    reasons.push("Home routines are not yet consistently stable.");
    interventions.add("routine_stability_practice");
  }
  if (childAdjustmentAverage < 4) {
    reasons.push("Child adjustment is not yet consistently settled.");
    interventions.add("child_adjustment_support");
  }
  if (regulationAverage < 4) {
    reasons.push("Parent regulation after return home needs more stable evidence.");
    interventions.add("parent_regulation_support");
  }
  if (supportAverage < 4) {
    reasons.push("Support use is not yet reliable enough for step-down.");
    interventions.add("support_network_activation");
  }
  if (!maintenance.complete) {
    reasons.push(`Maintenance plan incomplete: ${maintenance.completed}/${maintenance.total} checks complete.`);
    interventions.add("complete_maintenance_plan");
  }

  const redOrCritical = reviewWindow.some((week) => hasRedOrCritical(week.riskFlags));
  const shouldReturnToIntensive =
    redOrCritical ||
    reviewWindow.some((week) => week.childDistressSpike) ||
    stabilityScore < 3 ||
    reviewWindow.some((week) => (week.missedCriticalRoutineCount ?? 0) >= 3);
  const canStepDown =
    hardBlocks.length === 0 &&
    reviewWindow.length >= minimumStabilityWeeks &&
    stabilityScore >= 4 &&
    maintenance.complete;

  const riskLevel: EvaluateHomeAgainTransitionResult["riskLevel"] = redOrCritical
    ? "critical"
    : shouldReturnToIntensive || hardBlocks.length > 0
      ? "high"
      : canStepDown
        ? "low"
        : "medium";
  const recommendation: HomeAgainRecommendation = shouldReturnToIntensive
    ? redOrCritical
      ? "urgent_case_review"
      : "return_to_intensive_reunification"
    : canStepDown
      ? "step_down_to_build_stronger_families"
      : "continue_home_again";

  const finalReasons = canStepDown
    ? ["Return-home stability, child adjustment, support use, and maintenance planning meet step-down review gates."]
    : reasons;

  return {
    recommendation,
    stabilityScore,
    riskLevel,
    canStepDown,
    shouldReturnToIntensive,
    reasons: finalReasons,
    hardBlocks,
    requiredInterventions: Array.from(interventions),
    reportLanguage: buildHomeAgainReportLanguage({
      recommendation,
      stabilityScore,
      riskLevel,
      canStepDown,
      shouldReturnToIntensive,
      reasons: finalReasons,
      hardBlocks,
    }),
  };
}

export function buildHomeAgainReportLanguage(input: {
  recommendation: HomeAgainRecommendation;
  stabilityScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  canStepDown: boolean;
  shouldReturnToIntensive: boolean;
  reasons: string[];
  hardBlocks: string[];
}) {
  const recommendationText = input.recommendation.replace(/_/g, " ");
  const decisionFrame = input.canStepDown
    ? "Step-down may be considered by the case team; this is not an automatic program transition."
    : input.shouldReturnToIntensive
      ? "Return to intensive reunification or urgent case review should be considered before reducing supports."
      : "Continue Home Again supports and review again when the missing stability evidence is available.";

  return [
    `Home Again stability score is ${input.stabilityScore}/5 with ${input.riskLevel} risk.`,
    `Recommendation: ${recommendationText}.`,
    input.hardBlocks.length ? `Hard blocks: ${input.hardBlocks.join("; ")}.` : "No hard blocks are recorded in this review window.",
    input.reasons.length ? `Reasons: ${input.reasons.join("; ")}.` : "No additional reasons recorded.",
    decisionFrame,
  ].join(" ");
}
