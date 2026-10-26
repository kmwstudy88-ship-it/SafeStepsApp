/**
 * SafeSteps Contact Progression Engine
 *
 * Models reviewable state transitions for graduated family contact:
 *   supervised -> community -> overnight -> trial_at_home -> full_return
 *
 * Implements evidence prerequisites, pause/step-back conditions, and
 * mandatory supervisor approval checkpoints.
 *
 * Decision-support only; never generates automated custody or placement orders.
 */

export type ContactProgressionStage =
  | "supervised"
  | "community"
  | "overnight"
  | "trial_at_home"
  | "full_return";

export const CONTACT_PROGRESSION_STAGES: readonly ContactProgressionStage[] = [
  "supervised",
  "community",
  "overnight",
  "trial_at_home",
  "full_return",
] as const;

export type ContactVisitEvidence = {
  visitId: string;
  visitDate: string;
  stage: ContactProgressionStage;
  attended: boolean;
  onTime: boolean;
  incidentFree: boolean;
  positiveRepairObserved: boolean;
  supervisorNotes?: string;
};

export type ContactSafetyVerification = {
  functionalSafetyPlanCurrent: boolean;
  stableLivingEnvironmentVerified: boolean;
  substanceScreeningCompliant: boolean;
  supportNetworkActive: boolean;
  culturalSafetyPlanInPlace: boolean;
  accessibilityAccommodationsMet: boolean;
};

export type ContactProgressionInput = {
  caseId: string;
  currentStage: ContactProgressionStage;
  targetStage: ContactProgressionStage;
  recentVisits: ContactVisitEvidence[];
  safetyVerification: ContactSafetyVerification;
  openSafetyIncidentsCount: number;
  unresolvedContradictionsCount: number;
  caseWorkerEndorsement: boolean;
};

export type ContactProgressionEvaluation = {
  caseId: string;
  currentStage: ContactProgressionStage;
  recommendedStage: ContactProgressionStage;
  transitionAction: "advance" | "maintain" | "step_back" | "pause_pending_review";
  readyToAdvance: boolean;
  prerequisitesMet: boolean;
  missingPrerequisites: string[];
  riskStepBackTriggers: string[];
  requiredReviewCheckpoints: string[];
  totalVisitsConsidered: number;
  incidentFreeVisitCount: number;
  minimumVisitsRequired: number;
  decisionSupportOnly: true;
  humanReviewRequired: true;
  supervisorSignoffRequired: boolean;
};

const STAGE_MINIMUM_VISITS: Record<ContactProgressionStage, number> = {
  supervised: 6,
  community: 6,
  overnight: 4,
  trial_at_home: 8,
  full_return: 0,
};

function stageIndex(stage: ContactProgressionStage): number {
  return CONTACT_PROGRESSION_STAGES.indexOf(stage);
}

export function evaluateContactProgression(
  input: ContactProgressionInput,
): ContactProgressionEvaluation {
  const currentIndex = stageIndex(input.currentStage);
  const targetIndex = stageIndex(input.targetStage);

  const missingPrerequisites: string[] = [];
  const riskStepBackTriggers: string[] = [];
  const requiredReviewCheckpoints: string[] = [];

  // 1. Visit count and incident check
  const minimumVisits = STAGE_MINIMUM_VISITS[input.currentStage];
  const relevantVisits = input.recentVisits.filter(
    (v) => v.stage === input.currentStage && v.attended,
  );
  const incidentFreeVisits = relevantVisits.filter((v) => v.incidentFree);

  if (relevantVisits.length < minimumVisits) {
    missingPrerequisites.push(
      `Requires at least ${minimumVisits} attended visits at ${input.currentStage} stage (currently ${relevantVisits.length}).`,
    );
  }

  const recentIncidents = relevantVisits.filter((v) => !v.incidentFree);
  if (recentIncidents.length > 0) {
    riskStepBackTriggers.push(
      `${recentIncidents.length} recent visit incident(s) observed at ${input.currentStage} stage.`,
    );
  }

  if (input.openSafetyIncidentsCount > 0) {
    riskStepBackTriggers.push(
      `${input.openSafetyIncidentsCount} unresolved safety incident(s) on file.`,
    );
  }

  if (input.unresolvedContradictionsCount > 0) {
    requiredReviewCheckpoints.push(
      `${input.unresolvedContradictionsCount} evidence contradiction(s) require multidisciplinary resolution.`,
    );
  }

  // 2. Safety verifications
  if (!input.safetyVerification.functionalSafetyPlanCurrent) {
    missingPrerequisites.push("Functional safety plan must be current and signed by carers.");
  }
  if (!input.safetyVerification.stableLivingEnvironmentVerified) {
    missingPrerequisites.push("Stable living environment must be verified on-site by worker.");
  }
  if (!input.safetyVerification.substanceScreeningCompliant) {
    riskStepBackTriggers.push("Substance screening non-compliance or unmanaged substance trigger.");
  }
  if (!input.safetyVerification.supportNetworkActive) {
    missingPrerequisites.push("Active kinship/community safety network must be confirmed.");
  }
  if (!input.safetyVerification.culturalSafetyPlanInPlace) {
    missingPrerequisites.push("Cultural safety and connection plan must be recorded.");
  }
  if (!input.safetyVerification.accessibilityAccommodationsMet) {
    missingPrerequisites.push("Accessibility and communication adjustments must be confirmed.");
  }

  if (!input.caseWorkerEndorsement) {
    missingPrerequisites.push("Caseworker clinical endorsement is required before progression.");
  }

  requiredReviewCheckpoints.push(
    "CSO supervisor must review documented attunement observations and sign off progression.",
  );

  // 3. Determine transition action
  let transitionAction: ContactProgressionEvaluation["transitionAction"] = "maintain";
  let recommendedStage: ContactProgressionStage = input.currentStage;
  let readyToAdvance = false;

  if (riskStepBackTriggers.length >= 2 || input.openSafetyIncidentsCount >= 2) {
    transitionAction = "step_back";
    const previousIndex = Math.max(0, currentIndex - 1);
    recommendedStage = CONTACT_PROGRESSION_STAGES[previousIndex];
  } else if (riskStepBackTriggers.length > 0) {
    transitionAction = "pause_pending_review";
    recommendedStage = input.currentStage;
  } else if (
    missingPrerequisites.length === 0 &&
    targetIndex === currentIndex + 1
  ) {
    transitionAction = "advance";
    recommendedStage = input.targetStage;
    readyToAdvance = true;
  } else {
    transitionAction = "maintain";
    recommendedStage = input.currentStage;
  }

  return {
    caseId: input.caseId,
    currentStage: input.currentStage,
    recommendedStage,
    transitionAction,
    readyToAdvance,
    prerequisitesMet: missingPrerequisites.length === 0 && riskStepBackTriggers.length === 0,
    missingPrerequisites,
    riskStepBackTriggers,
    requiredReviewCheckpoints,
    totalVisitsConsidered: relevantVisits.length,
    incidentFreeVisitCount: incidentFreeVisits.length,
    minimumVisitsRequired: minimumVisits,
    decisionSupportOnly: true,
    humanReviewRequired: true,
    supervisorSignoffRequired: true,
  };
}
