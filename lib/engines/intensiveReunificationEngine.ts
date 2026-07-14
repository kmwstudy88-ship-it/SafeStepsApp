import {
  ContactStage,
  preReturnSafetyVerifications,
  ReunificationChallengeId,
  SafetyVerificationId,
} from "../data/intensiveReunificationSupport";

export type AppointmentLoadInput = {
  weeklyAppointments: number;
  missedAppointments: number;
  hasSingleCoordinator?: boolean;
  transportBarrier?: boolean;
  childcareBarrier?: boolean;
};

export type ContactProgressionInput = {
  currentStage: ContactStage;
  stableContacts: number;
  unresolvedIncidents: number;
  childDistressEscalating?: boolean;
  supervisorReviewed?: boolean;
};

export type SafetyVerificationResponse = {
  id: SafetyVerificationId;
  completedChecks: string[];
};

export type ReunificationPlanningSummary = {
  overloadRisk: "low" | "moderate" | "high";
  challengeFlags: ReunificationChallengeId[];
  canProgressContact: boolean;
  nextContactRecommendation: string;
  verificationCompletion: number;
  missingVerificationWarnings: string[];
  requiresSupervisorReview: boolean;
  reportLanguage: string;
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function assessAppointmentLoad(input: AppointmentLoadInput) {
  let score = 0;

  if (input.weeklyAppointments >= 8) score += 3;
  else if (input.weeklyAppointments >= 5) score += 2;
  else if (input.weeklyAppointments >= 3) score += 1;

  score += input.missedAppointments >= 3 ? 3 : input.missedAppointments;
  if (!input.hasSingleCoordinator && input.weeklyAppointments >= 5) score += 1;
  if (input.transportBarrier) score += 1;
  if (input.childcareBarrier) score += 1;

  if (score >= 6) return "high" as const;
  if (score >= 3) return "moderate" as const;
  return "low" as const;
}

export function identifyChallengeFlags(input: {
  appointmentLoad: AppointmentLoadInput;
  childResistanceEscalating?: boolean;
  adultConflictExposure?: boolean;
  relapseWarningSignals?: number;
}) {
  const flags: ReunificationChallengeId[] = [];

  if (assessAppointmentLoad(input.appointmentLoad) !== "low") {
    flags.push("systemic_overload");
  }

  if (input.childResistanceEscalating || input.adultConflictExposure) {
    flags.push("parent_child_alienation");
  }

  if ((input.relapseWarningSignals ?? 0) >= 2) {
    flags.push("trauma_backslide");
  }

  return flags;
}

export function evaluateContactProgression(input: ContactProgressionInput) {
  if (input.unresolvedIncidents > 0) {
    return {
      canProgress: false,
      recommendation: "Pause progression until unresolved contact incidents are reviewed and repaired.",
    };
  }

  if (input.childDistressEscalating) {
    return {
      canProgress: false,
      recommendation: "Hold current contact stage and review child distress with the case team.",
    };
  }

  if (!input.supervisorReviewed) {
    return {
      canProgress: false,
      recommendation: "Supervisor review is required before increasing contact stage.",
    };
  }

  if (input.stableContacts < 3) {
    return {
      canProgress: false,
      recommendation: "Keep current stage until at least three stable contacts are documented.",
    };
  }

  return {
    canProgress: input.currentStage !== "full_return",
    recommendation:
      input.currentStage === "full_return"
        ? "Maintain post-reunification monitoring and child wellbeing review."
        : "Progression may be considered by the case team based on the documented stability.",
  };
}

export function evaluatePreReturnVerification(responses: SafetyVerificationResponse[]) {
  const responseMap = new Map(responses.map((response) => [response.id, response]));
  let requiredTotal = 0;
  let completedTotal = 0;
  const missingVerificationWarnings: string[] = [];

  for (const verification of preReturnSafetyVerifications) {
    const response = responseMap.get(verification.id);
    requiredTotal += verification.requiredChecks.length;
    completedTotal += response?.completedChecks.filter((check) => verification.requiredChecks.includes(check)).length ?? 0;

    const isComplete = verification.requiredChecks.every((check) => response?.completedChecks.includes(check));
    if (!isComplete) {
      missingVerificationWarnings.push(verification.missingEvidenceWarning);
    }
  }

  return {
    completion: requiredTotal > 0 ? round((completedTotal / requiredTotal) * 100) : 0,
    missingVerificationWarnings,
    complete: missingVerificationWarnings.length === 0,
  };
}

export function buildIntensiveReunificationPlanSummary(input: {
  appointmentLoad: AppointmentLoadInput;
  contactProgression: ContactProgressionInput;
  safetyVerifications: SafetyVerificationResponse[];
  childResistanceEscalating?: boolean;
  adultConflictExposure?: boolean;
  relapseWarningSignals?: number;
}): ReunificationPlanningSummary {
  const overloadRisk = assessAppointmentLoad(input.appointmentLoad);
  const challengeFlags = identifyChallengeFlags({
    appointmentLoad: input.appointmentLoad,
    childResistanceEscalating: input.childResistanceEscalating,
    adultConflictExposure: input.adultConflictExposure,
    relapseWarningSignals: input.relapseWarningSignals,
  });
  const contact = evaluateContactProgression(input.contactProgression);
  const verification = evaluatePreReturnVerification(input.safetyVerifications);
  const requiresSupervisorReview = challengeFlags.length > 0 || !contact.canProgress || !verification.complete;

  return {
    overloadRisk,
    challengeFlags,
    canProgressContact: contact.canProgress,
    nextContactRecommendation: contact.recommendation,
    verificationCompletion: verification.completion,
    missingVerificationWarnings: verification.missingVerificationWarnings,
    requiresSupervisorReview,
    reportLanguage: buildPlanningReportLanguage({
      overloadRisk,
      challengeFlags,
      contactRecommendation: contact.recommendation,
      verificationCompletion: verification.completion,
      requiresSupervisorReview,
    }),
  };
}

export function buildPlanningReportLanguage(input: {
  overloadRisk: "low" | "moderate" | "high";
  challengeFlags: ReunificationChallengeId[];
  contactRecommendation: string;
  verificationCompletion: number;
  requiresSupervisorReview: boolean;
}) {
  const reviewText = input.requiresSupervisorReview
    ? "Supervisor review is recommended before using this plan to support any contact-stage increase."
    : "The current records show no automated blocker, but the plan should still be reviewed by the case team.";

  return [
    `Appointment-load risk is ${input.overloadRisk}.`,
    `Challenge flags: ${input.challengeFlags.length ? input.challengeFlags.join(", ") : "none recorded"}.`,
    `Pre-return verification is ${input.verificationCompletion}% complete.`,
    input.contactRecommendation,
    reviewText,
  ].join(" ");
}
