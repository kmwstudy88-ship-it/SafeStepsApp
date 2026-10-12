import type { TenEngineLongitudinalEvaluationReport } from "./aiLongitudinalEvaluatorEngine";
import type { FivePPsychologicalFormulation } from "./aiPsychologistFormulationEngine";
import {
  buildUncertaintyDisclosure,
  computeAuditSha256,
  evaluatePreAndPostSafetyGate,
  sanitizeAiOutputAgainstSafetyPolicy,
} from "./aiSupportCoachEngine";
import type {
  CourtReportCollateral,
  CourtReportContradiction,
  CourtReportEvidenceRecord,
} from "./courtReportBuilderEngine";

// ============================================================================
// MODULE 9: COURT REPORT & SAFER ANNEXURE AUTO-COMPILER
// ============================================================================

export interface CourtSaferAiAnnexureInput {
  caseId: string;
  participantUserId: string;
  formulation: FivePPsychologicalFormulation;
  evaluation: TenEngineLongitudinalEvaluationReport;
  clinicianApproved: boolean;
  approvedByClinicianName?: string;
  approvedAtIso?: string;
}

export interface CourtSaferAiAnnexureResult {
  eligibleForCourtExport: boolean;
  blockedReason: string | null;
  annexureTitle: string;
  nonDiagnosticLegalDisclaimer: string;
  uncertaintyDisclosure: string | null;
  fivePFormulationSummary: {
    presenting: string[];
    predisposing: string[];
    precipitating: string[];
    perpetuating: string[];
    protective: string[];
  };
  saferDimensionSummary: {
    category: string;
    label: string;
    band: string;
    rationale: string;
  }[];
  reliableChangeTrajectorySummary: string[];
  courtEvidenceRecords: CourtReportEvidenceRecord[];
  courtContradictions: CourtReportContradiction[];
  approvedByClinicianName: string | null;
  approvedAtIso: string | null;
  tamperEvidentSha256: string;
}

/**
 * Module 9: Compiles Clinician-Approved 5P Formulations & 10-Engine Evaluations into
 * tamper-evident SAFER Court Annexures. Strictly blocks unapproved drafts per safety_policy.md.
 */
export function compileCourtSaferAiAnnexure(
  input: CourtSaferAiAnnexureInput,
): CourtSaferAiAnnexureResult {
  const isApproved =
    input.clinicianApproved &&
    input.formulation.reviewState !== "draft_requires_clinician_review" &&
    input.evaluation.reviewState !== "draft_requires_clinician_review";

  const blockedReason = isApproved
    ? null
    : "Court & SAFER Export Blocked: Under policies/safety_policy.md, AI-assisted 5P formulations and 10-engine evaluations cannot be exported to court or statutory bundles until reviewed and signed off by an authorized clinician or supervisor.";

  const uncertaintyDisclosure = buildUncertaintyDisclosure(
    Math.min(input.formulation.confidenceScore, input.evaluation.confidenceScore),
  );

  const nonDiagnosticLegalDisclaimer =
    "NON-DIAGNOSTIC & NON-LEGAL DISCLOSURE: This annexure synthesises longitudinal behavioural observations, psychometric Reliable Change Index (RCI) trajectories, and multi-informant convergence under the SAFER framework. It is not a medical/psychiatric diagnosis or legal custody determination.";

  const saferDimensionSummary = (input.evaluation.saferJudgement.presentCategories || []).map(
    (category) => ({
      category,
      label: category.replace(/_/g, " ").toUpperCase(),
      band: input.evaluation.overallRiskBand,
      rationale: sanitizeAiOutputAgainstSafetyPolicy(
        input.evaluation.saferJudgement.recommendation,
      ).sanitizedText,
    }),
  );

  const reliableChangeTrajectorySummary =
    input.evaluation.engine6LongitudinalRci.rciResults.map(
      (r) =>
        `${r.scaleId}: Baseline ${r.baselineRaw} -> Current ${r.currentRaw} (RCI = ${r.rciValue}, ${r.classification.replace(/_/g, " ")})`,
    );

  const nowIso = new Date().toISOString();
  const annexureHash = computeAuditSha256(
    JSON.stringify({
      caseId: input.caseId,
      participantUserId: input.participantUserId,
      formulationHash: input.formulation.auditSha256,
      evaluationHash: input.evaluation.auditSha256,
      isApproved,
      approvedBy: input.approvedByClinicianName ?? null,
    }),
  );

  const courtEvidenceRecords: CourtReportEvidenceRecord[] = isApproved
    ? [
        {
          id: `court-ev-5p-${annexureHash.slice(0, 8)}`,
          title: "Clinician-Approved 5P Longitudinal Formulation & Safe & Together Synthesis",
          type: "assessment",
          createdAt: input.approvedAtIso || nowIso,
          status: "accepted",
          provenance: "worker_observed",
          reviewAvailability: "linked_worker_available",
          relianceLimitations: uncertaintyDisclosure ? [uncertaintyDisclosure] : [],
          linkedDomains: ["safety", "emotional_regulation", "child_focus", "accountability"],
          integrityHash: input.formulation.auditSha256,
        },
        {
          id: `court-ev-10eng-${annexureHash.slice(0, 8)}`,
          title: "10-Engine Multi-Modal Psychometric & SAFER Triangulation Evaluation",
          type: "assessment",
          createdAt: input.approvedAtIso || nowIso,
          status: "accepted",
          provenance: "worker_observed",
          reviewAvailability: "linked_worker_available",
          relianceLimitations: uncertaintyDisclosure ? [uncertaintyDisclosure] : [],
          linkedDomains: ["safety", "daily_care", "home_stability", "support_engagement"],
          integrityHash: input.evaluation.auditSha256,
        },
      ]
    : [];

  const talkVsWalkGap =
    100 - input.evaluation.engine1AntiGaming.indicators.crossModalBehaviouralAlignment;
  const courtContradictions: CourtReportContradiction[] =
    talkVsWalkGap >= 20
      ? [
          {
            id: `contra-talk-walk-${annexureHash.slice(0, 8)}`,
            severity: talkVsWalkGap >= 30 ? "high" : "medium",
            summary:
              input.evaluation.engine1AntiGaming.flags[0] ||
              input.evaluation.engine1AntiGaming.summary ||
              "Divergence between self-report scales and stressed behavioural simulation.",
            sourceA: "Parent Direct Self-Report Scale",
            sourceB: "Stressed Roleplay / SJT Behavioural Simulation",
            resolved: false,
          },
        ]
      : [];

  return {
    eligibleForCourtExport: isApproved,
    blockedReason,
    annexureTitle: `SafeSteps SAFER & 5P Longitudinal Court Annexure (${input.caseId})`,
    nonDiagnosticLegalDisclaimer,
    uncertaintyDisclosure,
    fivePFormulationSummary: {
      presenting: input.formulation.presentingFactors,
      predisposing: input.formulation.predisposingFactors,
      precipitating: input.formulation.precipitatingFactors,
      perpetuating: input.formulation.perpetuatingFactors,
      protective: input.formulation.protectiveFactors,
    },
    saferDimensionSummary,
    reliableChangeTrajectorySummary,
    courtEvidenceRecords,
    courtContradictions,
    approvedByClinicianName: isApproved ? input.approvedByClinicianName || "Clinician" : null,
    approvedAtIso: isApproved ? input.approvedAtIso || nowIso : null,
    tamperEvidentSha256: annexureHash,
  };
}

// ============================================================================
// MODULE 10: 360° MULTI-INFORMANT CONVERGENCE PORTAL
// ============================================================================

export type InformantRoleType =
  | "contact_supervisor"
  | "teacher_early_childhood"
  | "aod_counsellor"
  | "gp_clinician"
  | "kinship_carer"
  | "child_safety_worker";

export interface MultiInformantObservationInput {
  informantRole: InformantRoleType;
  informantName: string;
  observedDomain: string;
  rating0to100: number;
  behavioralObservationNotes: string;
}

export interface MultiInformant360PortalInput {
  caseId: string;
  subjectUserId: string;
  parentSelfReportScore0to100: number;
  observations: MultiInformantObservationInput[];
}

export interface MultiInformant360PortalResult {
  overallConvergenceScore0to100: number;
  meanInformantScore0to100: number;
  parentVsInformantGap: number;
  convergenceBand:
    | "strong_360_convergence"
    | "moderate_contextual_variation"
    | "critical_multi_informant_discrepancy";
  processedObservations: {
    informantRole: InformantRoleType;
    informantName: string;
    observedDomain: string;
    rating0to100: number;
    sanitizedNotes: string;
    convergenceAlignment: "convergent" | "minor_divergence" | "critical_discrepancy";
  }[];
  courtCollateralRecords: CourtReportCollateral[];
  contradictionAlerts: string[];
  auditSha256: string;
}

export function evaluate360MultiInformantPortal(
  input: MultiInformant360PortalInput,
): MultiInformant360PortalResult {
  const selfScore = Math.max(0, Math.min(100, Math.round(input.parentSelfReportScore0to100)));
  const obsList = input.observations;

  const meanInformantScore0to100 =
    obsList.length > 0
      ? Math.round(
          obsList.reduce((acc, o) => acc + Math.max(0, Math.min(100, o.rating0to100)), 0) /
            obsList.length,
        )
      : selfScore;

  const parentVsInformantGap = selfScore - meanInformantScore0to100;
  const absGap = Math.abs(parentVsInformantGap);
  const overallConvergenceScore0to100 = Math.max(0, Math.min(100, 100 - absGap));

  let convergenceBand: MultiInformant360PortalResult["convergenceBand"] =
    "strong_360_convergence";
  if (absGap >= 25) {
    convergenceBand = "critical_multi_informant_discrepancy";
  } else if (absGap >= 15) {
    convergenceBand = "moderate_contextual_variation";
  }

  const contradictionAlerts: string[] = [];
  const processedObservations = obsList.map((obs) => {
    const rating = Math.max(0, Math.min(100, Math.round(obs.rating0to100)));
    const itemGap = Math.abs(selfScore - rating);
    let convergenceAlignment: "convergent" | "minor_divergence" | "critical_discrepancy" =
      "convergent";
    if (itemGap >= 25) {
      convergenceAlignment = "critical_discrepancy";
      contradictionAlerts.push(
        `Discrepancy (${itemGap} pts) between parent self-report (${selfScore}/100) and ${obs.informantRole.replace(/_/g, " ")} observation (${rating}/100) on ${obs.observedDomain}.`,
      );
    } else if (itemGap >= 15) {
      convergenceAlignment = "minor_divergence";
    }

    return {
      informantRole: obs.informantRole,
      informantName: obs.informantName.trim(),
      observedDomain: obs.observedDomain.trim(),
      rating0to100: rating,
      sanitizedNotes: sanitizeAiOutputAgainstSafetyPolicy(
        obs.behavioralObservationNotes,
      ).sanitizedText,
      convergenceAlignment,
    };
  });

  const nowIso = new Date().toISOString();
  const courtCollateralRecords: CourtReportCollateral[] = processedObservations.map(
    (p, idx) => ({
      id: `col-360-${idx + 1}`,
      source: `${p.informantRole.replace(/_/g, " ")} (${p.informantName})`,
      date: nowIso.slice(0, 10),
      summary: `${p.observedDomain} (${p.rating0to100}/100): ${p.sanitizedNotes}`,
      alignment:
        p.convergenceAlignment === "convergent"
          ? "aligned"
          : p.convergenceAlignment === "minor_divergence"
            ? "partial"
            : "conflicting",
    }),
  );

  const auditSha256 = computeAuditSha256(
    JSON.stringify({
      caseId: input.caseId,
      subjectUserId: input.subjectUserId,
      overallConvergenceScore0to100,
      count: processedObservations.length,
    }),
  );

  return {
    overallConvergenceScore0to100,
    meanInformantScore0to100,
    parentVsInformantGap,
    convergenceBand,
    processedObservations,
    courtCollateralRecords,
    contradictionAlerts,
    auditSha256,
  };
}

// ============================================================================
// MODULE 11: CLOSED-LOOP ADAPTIVE MICRO-LESSON & SPACED RE-TEST PRESCRIBER
// ============================================================================

export interface AdaptiveMicroPrescriptionInput {
  participantUserId: string;
  caseId?: string;
  flaggedDomains: {
    domainKey:
      | "co_regulation_under_stress"
      | "non_violent_accountability"
      | "biff_co_parenting_boundaries"
      | "addiction_craving_regulation"
      | "trauma_bedtime_routines"
      | "reflective_mentalizing";
    triggerSource: string;
    currentScore0to100: number;
  }[];
}

export interface AdaptiveMicroPrescriptionItem {
  prescriptionId: string;
  domainKey: string;
  triggeredBySource: string;
  microLessonId: string;
  microLessonTitle: string;
  threeMinutePracticeDrill: string;
  retest7dDueIso: string;
  retest14dDueIso: string;
  retest30dDueIso: string;
  completionStatus: "prescribed";
}

export interface AdaptiveMicroPrescriptionResult {
  prescriptions: AdaptiveMicroPrescriptionItem[];
  spacedRepetitionSummary: string;
  auditSha256: string;
}

const MICRO_LESSON_CATALOG: Record<
  AdaptiveMicroPrescriptionInput["flaggedDomains"][number]["domainKey"],
  { microLessonId: string; title: string; drill: string }
> = {
  co_regulation_under_stress: {
    microLessonId: "micro-cos-01",
    title: "3-Minute 'Bigger, Stronger, Wiser, Kind' Co-Regulation Reset",
    drill:
      "Drop your shoulders, soften your vocal tone by 30%, kneel to eye level, and validate the child's feeling before giving any instruction.",
  },
  non_violent_accountability: {
    microLessonId: "micro-dfv-02",
    title: "20-Minute Physiological Time-Out & Zero-Excuse Repair",
    drill:
      "Recognize jaw/chest tightness at 5/10, state the agreed time-out phrase calmly, leave the room without blocking exits, and take 20 minutes to regulate.",
  },
  biff_co_parenting_boundaries: {
    microLessonId: "micro-biff-03",
    title: "Writing Child-Focused BIFF Messages Without Triangulation",
    drill:
      "Rewrite 1 stressful co-parenting message so it is Brief, Informative, Friendly, and Firm—removing all adjectives, blame, and child messaging.",
  },
  addiction_craving_regulation: {
    microLessonId: "micro-aod-04",
    title: "90-Second Somatic Urge-Surfing & HALT+S Check",
    drill:
      "Set a 90-second timer, breathe 4s in / 6s out while observing the craving wave crest, drink a glass of water, and text your sober support contact.",
  },
  trauma_bedtime_routines: {
    microLessonId: "micro-sleep-05",
    title: "Predictable 3-Step Trauma-Informed Bedtime Anchor",
    drill:
      "Dim lights 45 minutes before bed, use the 3-step visual schedule card, and reassure your child with the 10-minute check-in promise.",
  },
  reflective_mentalizing: {
    microLessonId: "micro-rf-06",
    title: "Seeing Behind the Behaviour: Curiosity Over Certainty",
    drill:
      "Replace 'They are doing this to wind me up' with 'What might my child's nervous system be feeling or needing right now?'",
  },
};

export function prescribeAdaptiveMicroLessonsAndReTests(
  input: AdaptiveMicroPrescriptionInput,
): AdaptiveMicroPrescriptionResult {
  const nowMs = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const retest7dDueIso = new Date(nowMs + 7 * dayMs).toISOString();
  const retest14dDueIso = new Date(nowMs + 14 * dayMs).toISOString();
  const retest30dDueIso = new Date(nowMs + 30 * dayMs).toISOString();

  const domainsToPrescribe =
    input.flaggedDomains.length > 0
      ? input.flaggedDomains
      : [
          {
            domainKey: "co_regulation_under_stress" as const,
            triggerSource: "Baseline Preventive Skill Builder",
            currentScore0to100: 65,
          },
        ];

  const prescriptions: AdaptiveMicroPrescriptionItem[] = domainsToPrescribe.map(
    (item, idx) => {
      const lesson = MICRO_LESSON_CATALOG[item.domainKey];
      return {
        prescriptionId: `rx-${idx + 1}-${lesson.microLessonId}`,
        domainKey: item.domainKey,
        triggeredBySource: item.triggerSource,
        microLessonId: lesson.microLessonId,
        microLessonTitle: lesson.title,
        threeMinutePracticeDrill: lesson.drill,
        retest7dDueIso,
        retest14dDueIso,
        retest30dDueIso,
        completionStatus: "prescribed",
      };
    },
  );

  const spacedRepetitionSummary = `Prescribed ${prescriptions.length} targeted 3-minute micro-lesson(s) with automated 7-day (${retest7dDueIso.slice(0, 10)}), 14-day (${retest14dDueIso.slice(0, 10)}), and 30-day (${retest30dDueIso.slice(0, 10)}) spaced retention vignettes to verify durable neuroplastic habit change.`;

  const auditSha256 = computeAuditSha256(
    JSON.stringify({
      participantUserId: input.participantUserId,
      prescriptionsCount: prescriptions.length,
      lessonIds: prescriptions.map((p) => p.microLessonId),
    }),
  );

  return {
    prescriptions,
    spacedRepetitionSummary,
    auditSha256,
  };
}

// ============================================================================
// MODULE 12: CHILD THREE HOUSES, 5-FINGER SAFETY NETWORK HAND & WORRY MONSTER PLAYROOM
// ============================================================================

export interface ChildThreeHousesInput {
  childUserId: string;
  caseId?: string;
  ageBand: "5-8" | "9-12" | "13-17";
  houseOfGoodThings: string[];
  houseOfWorries: string[];
  houseOfDreams: string[];
  fiveFingerTrustedAdults: string[];
  worryMonsterIntensity0to10: number;
}

export interface ChildThreeHousesResult {
  ageBand: "5-8" | "9-12" | "13-17";
  safetyTier: "tier_1_immediate" | "tier_2_urgent_2h" | "tier_3_24h" | "tier_4_green";
  crisisHalted: boolean;
  childFriendlyResponseMessage: string;
  worryMonsterTamingExercise: string;
  safetyNetworkComplete: boolean;
  trustedAdultsCount: number;
  voiceOfChildSummaryForWorker: {
    whatKeepsChildSafeAndHappy: string[];
    whatChildWorriesAbout: string[];
    whatChildWishesForHome: string[];
    safetyNetworkAdults: string[];
  };
  auditSha256: string;
}

/**
 * Module 12: Signs of Safety 'Three Houses' (Good Things, Worries, Dreams),
 * 5-Finger Safety Network Hand, and Worry Monster Playroom for Children & Youth.
 * Uses non-leading, child-centred prompts and runs the Tier-1 child disclosure safety gate.
 */
export function evaluateChildThreeHousesAndSafetyHand(
  input: ChildThreeHousesInput,
): ChildThreeHousesResult {
  const combinedText = [
    ...input.houseOfGoodThings,
    ...input.houseOfWorries,
    ...input.houseOfDreams,
  ].join(" ");

  const preGate = evaluatePreAndPostSafetyGate(combinedText, "child_support_coach");
  const worryLevel = Math.max(0, Math.min(10, Math.round(input.worryMonsterIntensity0to10)));

  const trustedAdults = input.fiveFingerTrustedAdults
    .map((a) => a.trim())
    .filter(Boolean);
  const safetyNetworkComplete = trustedAdults.length >= 3;

  let safetyTier: ChildThreeHousesResult["safetyTier"] = "tier_4_green";
  if (preGate.safetyTier === "tier_1_immediate") {
    safetyTier = "tier_1_immediate";
  } else if (preGate.safetyTier === "tier_2_clinical_review") {
    safetyTier = "tier_2_urgent_2h";
  } else if (preGate.safetyTier === "tier_3_supportive" || worryLevel >= 8) {
    safetyTier = "tier_3_24h";
  }

  const childFriendlyResponseMessage = !preGate.safeToProceed
    ? preGate.emergencyResponseMessage ||
      "You are very brave for sharing that. Nothing bad that happens is ever your fault. Please talk to a safe adult right now or call Kids Helpline on 1800 55 1800."
    : input.ageBand === "5-8"
      ? "Thank you for building your Three Houses and your Safety Hand! The Worry Monster is holding your worries in a safe box so your body can rest, and your safe grown-ups are here to help."
      : "Thanks for mapping your House of Good Things, House of Worries, and House of Dreams. Remember that grown-up problems are never your fault, and your 5-Finger Safety Network is always there when you need support.";

  const worryMonsterTamingExercise =
    worryLevel >= 6
      ? "Big Worry Tamer: Put both hands on your belly like blowing up a giant balloon—breathe in for 3 seconds, blow the worry into the Worry Monster's lockbox for 5 seconds, and press your feet into the floor."
      : "Calm Weather Check: Your Worry Monster is sleepy and small today! Give yourself a high-five and pick one fun thing from your House of Good Things.";

  const auditSha256 = computeAuditSha256(
    JSON.stringify({
      childUserId: input.childUserId,
      ageBand: input.ageBand,
      safetyTier,
      trustedAdultsCount: trustedAdults.length,
    }),
  );

  return {
    ageBand: input.ageBand,
    safetyTier,
    crisisHalted: !preGate.safeToProceed,
    childFriendlyResponseMessage,
    worryMonsterTamingExercise,
    safetyNetworkComplete,
    trustedAdultsCount: trustedAdults.length,
    voiceOfChildSummaryForWorker: {
      whatKeepsChildSafeAndHappy: input.houseOfGoodThings,
      whatChildWorriesAbout: input.houseOfWorries,
      whatChildWishesForHome: input.houseOfDreams,
      safetyNetworkAdults: trustedAdults,
    },
    auditSha256,
  };
}
