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

export type StageGatedContactStage =
  | "no_contact"
  | "supervised"
  | "semi_supervised"
  | "unsupervised"
  | "overnight"
  | "return_home_trial";

export type StageGatedContactSessionSignal = {
  id: string;
  stage: StageGatedContactStage;
  occurredAt: string;
  durationMinutes: number;
  childDistressScore: number;
  childComfortScore: number;
  emotionalRegulationScore: number;
  facilitatorInterventionCount: number;
  riskFlags?: {
    code: string;
    severity: "green" | "amber" | "red" | "critical";
  }[];
  facilitatorUnsafeToEscalate?: boolean;
  skillEvidence?: Partial<Record<"co_regulation" | "reflective_listening" | "boundary_respect" | "repair_attempts", boolean>>;
};

export type StageGatedAssessmentRecordSignal = {
  id: string;
  lessonId: string;
  createdAt: string;
  score?: number | null;
  riskFlags?: {
    code: string;
    severity: "green" | "amber" | "red" | "critical";
  }[];
  validatedBy?: string | null;
  skillEvidence?: Partial<Record<"co_regulation" | "reflective_listening" | "boundary_respect" | "repair_attempts", boolean>>;
};

export type EvaluateContactProgressionInput = {
  parentProfileId: string;
  caseId: string;
  currentStage: StageGatedContactStage;
  contactSessions: StageGatedContactSessionSignal[];
  assessmentRecords: StageGatedAssessmentRecordSignal[];
  requiredLessonIds?: string[];
  sessionWindow?: number;
  lessonWindow?: number;
  childDistressThreshold?: number;
  caseworkerManualHold?: boolean;
};

export type EvaluateContactProgressionResult = {
  currentStage: StageGatedContactStage;
  recommendedStage: StageGatedContactStage;
  canEscalate: boolean;
  mustRegress: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  reasons: string[];
  hardBlocks: string[];
  requiredInterventions: string[];
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

const stageOrder: StageGatedContactStage[] = [
  "no_contact",
  "supervised",
  "semi_supervised",
  "unsupervised",
  "overnight",
  "return_home_trial",
];

function nextStage(stage: StageGatedContactStage) {
  return stageOrder[Math.min(stageOrder.indexOf(stage) + 1, stageOrder.length - 1)] ?? stage;
}

function previousStage(stage: StageGatedContactStage) {
  return stageOrder[Math.max(stageOrder.indexOf(stage) - 1, 0)] ?? stage;
}

function newestFirst<T extends { occurredAt?: string; createdAt?: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    String(right.occurredAt ?? right.createdAt).localeCompare(String(left.occurredAt ?? left.createdAt)),
  );
}

function hasAmberOrWorse(flags: { severity: "green" | "amber" | "red" | "critical" }[] | undefined) {
  return (flags ?? []).some((flag) => ["amber", "red", "critical"].includes(flag.severity));
}

function hasRedOrCritical(flags: { severity: "green" | "amber" | "red" | "critical" }[] | undefined) {
  return (flags ?? []).some((flag) => ["red", "critical"].includes(flag.severity));
}

function demonstratedSkills(input: EvaluateContactProgressionInput) {
  const skills = new Set<string>();
  for (const signal of [...input.contactSessions, ...input.assessmentRecords]) {
    Object.entries(signal.skillEvidence ?? {}).forEach(([skill, demonstrated]) => {
      if (demonstrated && ("validatedBy" in signal ? signal.validatedBy : true)) skills.add(skill);
    });
  }
  return skills;
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

export function evaluateContactProgression(input: ContactProgressionInput): {
  canProgress: boolean;
  recommendation: string;
};
export function evaluateContactProgression(input: EvaluateContactProgressionInput): EvaluateContactProgressionResult;
export function evaluateContactProgression(input: ContactProgressionInput | EvaluateContactProgressionInput) {
  if ("parentProfileId" in input) {
    const sessionWindow = input.sessionWindow ?? 3;
    const lessonWindow = input.lessonWindow ?? 5;
    const childDistressThreshold = input.childDistressThreshold ?? 4;
    const currentStageSessions = newestFirst(input.contactSessions)
      .filter((session) => session.stage === input.currentStage)
      .slice(0, sessionWindow);
    const recentLessons = newestFirst(input.assessmentRecords).slice(0, lessonWindow);
    const hardBlocks: string[] = [];
    const reasons: string[] = [];
    const requiredInterventions = new Set<string>();

    if (input.caseworkerManualHold) {
      hardBlocks.push("Caseworker manual hold is active.");
      requiredInterventions.add("caseworker_review");
    }

    if (currentStageSessions.some((session) => hasAmberOrWorse(session.riskFlags))) {
      hardBlocks.push("Amber or red contact-session risk flag is present in the stability window.");
      requiredInterventions.add("pause_contact_progression");
    }

    if (recentLessons.some((record) => hasAmberOrWorse(record.riskFlags))) {
      hardBlocks.push("New negative assessment-record risk flag is present.");
      requiredInterventions.add("targeted_lesson_review");
    }

    if (currentStageSessions.some((session) => session.childDistressScore >= childDistressThreshold)) {
      hardBlocks.push("Child distress score is above the escalation threshold.");
      requiredInterventions.add("child_comfort_review");
    }

    if (currentStageSessions.some((session) => session.facilitatorUnsafeToEscalate)) {
      hardBlocks.push("Facilitator marked unsafe to escalate.");
      requiredInterventions.add("facilitator_case_review");
    }

    const redOrCritical = [...currentStageSessions, ...recentLessons].some((signal) => hasRedOrCritical(signal.riskFlags));
    if (redOrCritical) {
      requiredInterventions.add("regression_safety_review");
    }

    if (currentStageSessions.length < sessionWindow) {
      reasons.push(`Needs ${sessionWindow} consecutive sessions at ${input.currentStage}.`);
    } else {
      reasons.push(`${currentStageSessions.length} current-stage sessions are available for review.`);
    }

    const completedLessonIds = new Set(recentLessons.map((record) => record.lessonId));
    const missingLessons = (input.requiredLessonIds ?? []).filter((lessonId) => !completedLessonIds.has(lessonId));
    if (missingLessons.length > 0) {
      reasons.push(`Required stage lessons incomplete: ${missingLessons.join(", ")}.`);
      requiredInterventions.add("complete_required_lessons");
    }

    const oldestToNewest = [...currentStageSessions].reverse();
    const first = oldestToNewest[0];
    const last = oldestToNewest.at(-1);
    const regulationImproving =
      first && last ? last.emotionalRegulationScore >= first.emotionalRegulationScore : false;
    const interventionsDecreasing =
      first && last ? last.facilitatorInterventionCount <= first.facilitatorInterventionCount : false;
    const childComfortImproving = first && last ? last.childComfortScore >= first.childComfortScore : false;

    if (!regulationImproving) {
      reasons.push("Emotional regulation is not yet stable or improving.");
      requiredInterventions.add("co_regulation_coaching");
    }
    if (!interventionsDecreasing) {
      reasons.push("Facilitator intervention frequency is not decreasing.");
      requiredInterventions.add("supported_contact_practice");
    }
    if (!childComfortImproving) {
      reasons.push("Child comfort trajectory is not yet positive.");
      requiredInterventions.add("child_voice_and_comfort_review");
    }

    const skills = demonstratedSkills(input);
    const missingSkills = ["co_regulation", "reflective_listening", "boundary_respect", "repair_attempts"].filter(
      (skill) => !skills.has(skill),
    );
    if (missingSkills.length > 0) {
      reasons.push(`Required skill evidence missing: ${missingSkills.join(", ")}.`);
      requiredInterventions.add("skill_demonstration_tasks");
    }

    const canEscalate =
      hardBlocks.length === 0 &&
      currentStageSessions.length >= sessionWindow &&
      missingLessons.length === 0 &&
      regulationImproving &&
      interventionsDecreasing &&
      childComfortImproving &&
      missingSkills.length === 0 &&
      input.currentStage !== "return_home_trial";
    const mustRegress = redOrCritical || hardBlocks.some((block) => block.includes("distress") || block.includes("unsafe"));
    const riskLevel: EvaluateContactProgressionResult["riskLevel"] = redOrCritical
      ? "critical"
      : hardBlocks.length > 0
        ? "high"
        : reasons.length > 1
          ? "medium"
          : "low";

    return {
      currentStage: input.currentStage,
      recommendedStage: mustRegress ? previousStage(input.currentStage) : canEscalate ? nextStage(input.currentStage) : input.currentStage,
      canEscalate,
      mustRegress,
      riskLevel,
      reasons: canEscalate ? ["All escalation gates passed across contact, lesson, trend, and skill evidence."] : reasons,
      hardBlocks,
      requiredInterventions: Array.from(requiredInterventions),
    };
  }

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
