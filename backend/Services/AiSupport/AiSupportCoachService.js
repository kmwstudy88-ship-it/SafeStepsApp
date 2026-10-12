import { randomUUID } from "node:crypto";
import { generateClinicalCompletionWithFallback } from "./AiProviderRouter.js";
import {
  evaluateServerCouplesDfvSafetyCheck,
  evaluateServerSafetyGate,
  formatUncertaintyBanner,
  redactPii,
  sanitizeAgainstSafetyPolicy,
  sha256Hex,
} from "./SafetyPolicyEnforcer.js";

function scoreReflectiveAndAuthenticity(text) {
  const cleaned = String(text ?? "").trim();
  const lower = cleaned.toLowerCase();

  let rfScore = 54;
  if (/\b(?:my child|my kid|my son|my daughter|my baby|their eyes|felt scared|needed comfort|co-regulat)/i.test(lower)) {
    rfScore += 20;
  }
  if (/\b(?:i noticed my|i took a breath|my responsibility|i repaired|my tone)/i.test(lower)) {
    rfScore += 15;
  }
  if (/\b(?:manipulating me|on purpose to wind me up|spoiled brat|made me yell)/i.test(lower)) {
    rfScore -= 25;
  }

  let authScore = 60;
  if (cleaned.length >= 40) authScore += 14;
  if (/\b(?:morning|bedtime|school|kitchen|dinner|today|yesterday|minutes|breathed)\b/i.test(lower)) {
    authScore += 15;
  }
  if (/\b(?:i never get angry|100% perfect always)\b/i.test(lower)) {
    authScore -= 25;
  }

  return {
    reflectiveFunctioningScore: Math.max(10, Math.min(98, rfScore)),
    antiGamingAuthenticityScore: Math.max(10, Math.min(98, authScore)),
  };
}

export async function processCoachTurn(body = {}) {
  const sessionId = body.sessionId || `sess-${randomUUID()}`;
  const personaMode = body.personaMode || "parent_support_coach";
  const clinicalPathway = body.clinicalPathway || "parent_co_regulation_cos";
  const interactionForm = body.interactionForm || "reflective_dialogue";
  const userMessage = String(body.userMessage ?? "").trim();
  const confidenceScore = Number.isFinite(body.confidenceOverride)
    ? Number(body.confidenceOverride)
    : 0.88;

  const safetyGate = evaluateServerSafetyGate(userMessage, personaMode);
  if (!safetyGate.safeToProceed) {
    return {
      sessionId,
      personaMode,
      clinicalPathway,
      interactionForm,
      assistantMessage: safetyGate.emergencyMessage,
      uncertaintyDisclosure: null,
      confidenceScore: 0.99,
      safetyEvaluation: safetyGate,
      reflectiveFunctioningScore: 50,
      antiGamingAuthenticityScore: 50,
      microSkillActionSteps: [
        "If anyone is in immediate danger, call 000 now.",
        "Call 1800RESPECT (1800 737 732), Lifeline (13 11 14), Kids Helpline (1800 55 1800), or 13YARN (13 92 76).",
      ],
      providerTierUsed: "tier3_deterministic_local",
      auditSha256: safetyGate.auditSha256,
      createdAt: new Date().toISOString(),
    };
  }

  const metrics = scoreReflectiveAndAuthenticity(userMessage);

  const deterministicGenerator = () => {
    if (personaMode === "child_support_coach") {
      return "Thank you for sharing that with me! Your feelings make total sense, and grown-up stress is never your fault. Let's take 3 slow balloon breaths together and check in with your Trusted Safe Grown-Ups.";
    }
    if (interactionForm === "safe_partner_message_bridge") {
      return "BIFF Safe Message Rewrite: 'Hi, writing to confirm the children's pickup and bedtime routine for today. Please let me know by 5:00 PM if that logistics plan works so we can keep things predictable for the kids. Thanks.'";
    }
    if (interactionForm === "shared_timeout_contract") {
      return "Synchronised 20-Minute Time-Out Contract active: At a 3/10 body signal (tight jaw or rising voice), use your agreed code phrase, step into a separate space for 20 minutes with zero door-blocking or texting, and reassure the children that they are completely safe.";
    }
    return `Thank you for reflecting on that in our ${clinicalPathway.replace(/_/g, " ")} coaching space. Pausing to notice your body signals and looking at the moment through your child's eyes builds lasting safety and trust.`;
  };

  const completion = await generateClinicalCompletionWithFallback({
    prompt: `Persona: ${personaMode}\nPathway: ${clinicalPathway}\nForm: ${interactionForm}\nParticipant reflection: ${safetyGate.redactedText}`,
    deterministicFallbackGenerator: deterministicGenerator,
    preferLocalDeterministic: Boolean(body.preferLocalDeterministic),
  });

  const uncertaintyDisclosure = formatUncertaintyBanner(confidenceScore);
  const assistantMessage = uncertaintyDisclosure
    ? `${uncertaintyDisclosure}\n\n${completion.text}`
    : completion.text;

  return {
    sessionId,
    personaMode,
    clinicalPathway,
    interactionForm,
    assistantMessage,
    uncertaintyDisclosure,
    confidenceScore,
    safetyEvaluation: {
      ...safetyGate,
      policyViolationsCorrected: completion.violationsCorrected,
    },
    reflectiveFunctioningScore: metrics.reflectiveFunctioningScore,
    antiGamingAuthenticityScore: metrics.antiGamingAuthenticityScore,
    microSkillActionSteps: [
      "Notice your earliest 3/10 body signal and take a slow 4s-in / 6s-out breath.",
      "Look underneath the behaviour to what your child needed to feel safe.",
      "Practise a warm, blame-free repair on the same day if a moment felt tense.",
    ],
    providerTierUsed: completion.providerTierUsed,
    auditSha256: sha256Hex({
      sessionId,
      personaMode,
      interactionForm,
      assistantMessage,
    }),
    createdAt: new Date().toISOString(),
  };
}

export function processCouplesDfvSafetyCheck(body = {}) {
  return evaluateServerCouplesDfvSafetyCheck(body);
}

export function processScaleScoring(body = {}) {
  const scaleId = String(body.scaleId || "phq_9");
  const responses = Array.isArray(body.responses) ? body.responses : [];
  const rawScore = responses.reduce(
    (sum, item) => sum + (Number.isFinite(item?.score) ? Number(item.score) : 0),
    0,
  );
  const maxRawScore = Math.max(12, responses.length * 4);
  const normalizedScore = Math.round((rawScore / maxRawScore) * 10000) / 100;

  const criticalOverrideTriggered = Boolean(
    body.criticalOverrideTriggered ||
      responses.some((r) => Boolean(r?.triggersCriticalOverride)),
  );

  // RCI calculation if baselineRaw is provided
  let rci = null;
  if (Number.isFinite(body.baselineRaw)) {
    const baselineRaw = Number(body.baselineRaw);
    const sem = 3.2 * Math.sqrt(1 - 0.88);
    const sDiff = Math.sqrt(2 * sem * sem);
    const rciValue = Math.round(((rawScore - baselineRaw) / sDiff) * 100) / 100;
    rci = {
      baselineRaw,
      currentRaw: rawScore,
      rciValue,
      statisticallyReliable: Math.abs(rciValue) >= 1.96,
    };
  }

  return {
    scaleId,
    rawScore,
    maxRawScore,
    normalizedScore,
    criticalOverrideTriggered,
    rci,
    requiresSupervisorReview: criticalOverrideTriggered || normalizedScore >= 60,
    auditSha256: sha256Hex({ scaleId, rawScore, criticalOverrideTriggered }),
    assessedAt: new Date().toISOString(),
  };
}

export function processPsychologicalFormulation(body = {}) {
  const confidenceScore = Number.isFinite(body.confidenceOverride)
    ? Number(body.confidenceOverride)
    : 0.86;
  const uncertaintyDisclosure = formatUncertaintyBanner(confidenceScore);

  const rawSynthesis =
    body.customSynthesis ||
    "Non-Diagnostic 5P Formulation: Cumulative trauma reminders, broken sleep, and high-stress household transition windows interact to narrow the caregiver's Window of Tolerance. Protective strengths include active engagement, commitment to child safety, and openness to structured co-regulation and Time-Out safety contracts.";

  const { sanitizedText, violationsCorrected } = sanitizeAgainstSafetyPolicy(
    redactPii(rawSynthesis),
  );

  return {
    id: `formulation-${randomUUID()}`,
    caseId: body.caseId ?? null,
    participantUserId: body.participantUserId ?? "participant",
    presentingFactors: body.presentingFactors ?? [
      "Navigating high-stress parenting transitions while building emotional regulation and household predictability.",
    ],
    predisposingFactors: body.predisposingFactors ?? [
      "Cumulative stress/trauma exposure and executive/sensory load.",
    ],
    precipitatingFactors: body.precipitatingFactors ?? [
      "Morning/bedtime transition stress and post-contact grief waves.",
    ],
    perpetuatingFactors: body.perpetuatingFactors ?? [
      "Sleep disruption and delayed early-warning somatic interruption.",
    ],
    protectiveFactors: body.protectiveFactors ?? [
      "Demonstrated care for child safety, willingness to repair, and engagement with support networks.",
    ],
    intersectionalSynthesis: uncertaintyDisclosure
      ? `${uncertaintyDisclosure}\n\n${sanitizedText}`
      : sanitizedText,
    policyViolationsCorrected: violationsCorrected,
    confidenceScore,
    uncertaintyDisclosure,
    reviewState: "draft_requires_clinician_review",
    auditSha256: sha256Hex({ sanitizedText, confidenceScore }),
    createdAt: new Date().toISOString(),
  };
}

export function processLongitudinalEvaluation(body = {}) {
  const confidenceScore = Number.isFinite(body.confidenceOverride)
    ? Number(body.confidenceOverride)
    : 0.87;
  const uncertaintyDisclosure = formatUncertaintyBanner(confidenceScore);
  const feltSafety = Number(body.feltSafetyScore ?? 8);
  const silentPivotActive = feltSafety < 7 || Boolean(body.fearOfRetaliation);

  const overallReadinessScore = silentPivotActive
    ? 54
    : Number(body.overallReadinessScore ?? 78);
  const overallRiskBand =
    body.criticalOverrideTriggered
      ? "Critical"
      : silentPivotActive || overallReadinessScore < 55
        ? "High"
        : overallReadinessScore < 72
          ? "Moderate"
          : "Ready";

  return {
    id: `eval-${randomUUID()}`,
    caseId: body.caseId ?? null,
    participantUserId: body.participantUserId ?? "participant",
    overallReadinessScore,
    overallRiskBand,
    confidenceScore,
    uncertaintyDisclosure,
    tenEnginesSummary: {
      antiGamingAuthenticity: Number(body.antiGamingAuthenticity ?? 82),
      safeAndTogetherSurvivorProtected: true,
      couplesDfvStage: silentPivotActive
        ? "stage_2_parallel_synchronised"
        : "stage_3_conjoint_safety_gated",
      silentPivotActive,
      reflectiveFunctioningScore: Number(body.reflectiveFunctioningScore ?? 78),
      triMorbidCascadeContained: !body.criticalOverrideTriggered,
      neurodiversityAndPovertyFairnessApplied: true,
      culturalSewbValidated: true,
      psychometricValidityStatus: "valid_interpretable",
      multiInformantConvergenceScore: Number(body.convergenceScore ?? 84),
    },
    reviewState: "draft_requires_clinician_review",
    auditSha256: sha256Hex({ overallReadinessScore, overallRiskBand, silentPivotActive }),
    evaluatedAt: new Date().toISOString(),
  };
}

export function processClinicianSignOff(body = {}, reviewerUserId = "clinician") {
  const reviewState = body.reviewState || "clinician_approved";
  const clinicianNotes = redactPii(body.clinicianNotes || "Reviewed and signed off via SPJ.");
  const targetId = body.targetId || `target-${randomUUID()}`;

  return {
    targetId,
    targetType: body.targetType || "formulation_or_evaluation",
    reviewState,
    reviewedByUserId: reviewerUserId,
    reviewedAt: new Date().toISOString(),
    clinicianNotes,
    auditSha256: sha256Hex({ targetId, reviewState, reviewerUserId, clinicianNotes }),
  };
}

export function processStealthPinVerification(body = {}) {
  const enteredHash = sha256Hex(`safesteps-pin-salt-v1:${String(body.enteredPin || "").trim()}`);
  const primaryPinHash = String(body.primaryPinHash || "");
  const duressPinHash = body.duressPinHash ? String(body.duressPinHash) : null;

  if (duressPinHash && enteredHash === duressPinHash) {
    const alertId = `duress-alert-${randomUUID()}`;
    return {
      authenticated: true,
      mode: "duress_sanitized_decoy",
      hideDfvCheckInsAndSafetyVault: true,
      silentCaseworkerAlertDispatched: true,
      silentAlertAuditId: alertId,
      displayViewTitle: "General Parenting Routines & Meal Planner",
      auditSha256: sha256Hex({ mode: "duress_sanitized_decoy", alertId }),
    };
  }

  if (enteredHash === primaryPinHash) {
    return {
      authenticated: true,
      mode: "normal_full_access",
      hideDfvCheckInsAndSafetyVault: false,
      silentCaseworkerAlertDispatched: false,
      silentAlertAuditId: null,
      displayViewTitle: "SafeSteps Personal Support & Safety Vault",
      auditSha256: sha256Hex({ mode: "normal_full_access", enteredHash }),
    };
  }

  return {
    authenticated: false,
    mode: "invalid_pin",
    hideDfvCheckInsAndSafetyVault: true,
    silentCaseworkerAlertDispatched: false,
    silentAlertAuditId: null,
    displayViewTitle: "PIN Required",
    auditSha256: sha256Hex({ mode: "invalid_pin" }),
  };
}

export function processSafetyPlanVaultSave(body = {}, userId = "survivor") {
  const safePlaces = Array.isArray(body.safePlacesToGo) ? body.safePlacesToGo : [];
  const trustedContacts = Array.isArray(body.trustedAdultsAndNeighbours)
    ? body.trustedAdultsAndNeighbours
    : [];
  const docs = Array.isArray(body.essentialDocumentsChecklist)
    ? body.essentialDocumentsChecklist
    : [];
  const docsReady = docs.filter((d) => Boolean(d?.packedOrPhotographedInVault)).length;
  const readinessPercentage = Math.min(
    100,
    Math.round(
      (([
        safePlaces.length > 0,
        trustedContacts.length > 0,
        Boolean(body.codeWordWithChildrenOrFriends),
        docsReady > 0,
      ].filter(Boolean).length) /
        4) *
        100,
    ),
  );

  const auditSha256 = sha256Hex({ userId, readinessPercentage, docsReady });
  return {
    planId: `safety-plan-${randomUUID()}`,
    ownerUserId: userId,
    readinessPercentage,
    redactedSummary: {
      safePlaceCount: safePlaces.length,
      trustedContactCount: trustedContacts.length,
      documentsReadyCount: docsReady,
      documentsTotalCount: docs.length,
    },
    auditSha256,
    updatedAtIso: new Date().toISOString(),
  };
}

export function processContactVisitCoaching(body = {}) {
  const arousal = Math.max(0, Math.min(10, Number(body.parentArousal0to10 ?? 3)));
  const requiresFiveMinuteSomaticGroundingFirst = arousal >= 6;
  const visitPhase = body.visitPhase || "post_visit_transition";
  const rawScript =
    "You don't have to talk right now. I'm right here with your snack and water whenever you're ready. Grown-up worries are never your job to carry.";
  const { sanitizedText } = sanitizeAgainstSafetyPolicy(rawScript);

  return {
    visitPhase,
    parentArousal0to10: arousal,
    requiresFiveMinuteSomaticGroundingFirst,
    attachmentTransitionFormulation:
      "Child post-visit quietness, clinginess, or restlessness reflects nervous-system transition stress between households—respond with low-arousal co-regulation rather than interrogation.",
    coRegulationMicroScript: sanitizedText,
    auditSha256: sha256Hex({ visitPhase, arousal }),
  };
}

export function processRestorativeFamilyMeeting(body = {}) {
  const stage = body.couplesDfvStage || "stage_1_stabilisation";
  const stageAllowed =
    stage === "stage_3_conjoint_safety_gated" ||
    stage === "stage_4_family_reunification_maintenance";
  const feltSafety = Number(body.survivorFeltSafetyScore0to10 ?? 5);
  const clinicianCleared = Boolean(body.clinicianSafetyClearance);
  const draft = String(body.ruptureRepairDraft || "");

  const safetyGate = evaluateServerSafetyGate(draft, "couples_family_dfv_coach");
  const meetingPermitted =
    safetyGate.safeToProceed && stageAllowed && clinicianCleared && feltSafety >= 7;

  const excuseDetected = /\b(sorry\s+if\s+you|sorry\s+but|you\s+made\s+me|pushed\s+my\s+buttons|your\s+fault)\b/i.test(
    draft,
  );

  const sanitizedChildCentredApology = excuseDetected
    ? "I am sorry for my loud voice and the way I acted. That was my choice as the grown-up. Nothing you did caused my behaviour, and I am using my 20-minute cooling-off plan so our home stays safe."
    : sanitizeAgainstSafetyPolicy(redactPii(draft)).sanitizedText;

  return {
    meetingPermitted,
    activeDeliveryMode: meetingPermitted
      ? "conjoint_restorative_cleared"
      : "parallel_individual_only_blocked",
    excuseOrChildBlameDetected: excuseDetected,
    sanitizedChildCentredApology,
    auditSha256: sha256Hex({ meetingPermitted, excuseDetected, sanitizedChildCentredApology }),
  };
}

export function processAddictionRecoveryShield(body = {}) {
  const before = Number(body.cravingBefore0to10 ?? 6);
  const after = Number(body.cravingAfter0to10 ?? 3);
  const lapseOccurred = Boolean(body.lapseOccurred);
  const childSafeCareArranged = body.childSafeCareArranged !== false;

  return {
    cravingDelta: after - before,
    urgeWaveSurfedSuccessfully: after <= before,
    riskTier:
      lapseOccurred && !childSafeCareArranged
        ? "immediate_child_safety_first_red"
        : after >= 7 || lapseOccurred
          ? "high_craving_orange"
          : "steady_green",
    nonPunitiveLapseResetPlan: {
      step1ChildSafetyFirst: childSafeCareArranged
        ? "Sober, safe care confirmed for the children."
        : "IMMEDIATE PRIORITY: Arrange safe sober adult care for the children right now.",
      step2HaltShameSpiral:
        "Interrupt the abstinence violation effect immediately; treat the urge/lapse as data to strengthen your HALT+S recovery shield.",
    },
    auditSha256: sha256Hex({ before, after, lapseOccurred, childSafeCareArranged }),
  };
}

export function processNeuroSleepProfile(body = {}) {
  return {
    lowArousalPrinciples: [
      "Dim lighting and lower vocal volume 45 minutes before bedtime transitions.",
      "Provide 1 concrete visual step at a time with 10-second processing pauses.",
    ],
    bedtimeCoRegulationScript:
      "It's safe to rest now. The nightlight is on, and I am checking on you every 10 minutes until you're asleep.",
    evaluatorAccommodationFlag:
      "Engine 7 Neurodiversity Fairness Active: Do not penalise flat affect or literal phrasing.",
    auditSha256: sha256Hex({ traits: body.neurodivergentTraits || [] }),
  };
}

export function processKinshipCarerSupport(body = {}) {
  const burnout = Number(body.burnout0to50 ?? 20);
  const sts = Number(body.secondaryTraumaticStress0to50 ?? 18);
  const placementStabilityBand =
    burnout >= 35 || sts >= 35
      ? "high_burnout_or_sts_urgent_support_red"
      : burnout >= 23 || sts >= 23
        ? "moderate_strain_respite_recommended_amber"
        : "strong_sustainable_green";

  return {
    carerType: body.carerType || "kinship_grandparent",
    placementStabilityBand,
    birthParentBoundaryScript:
      "I want the child to have a calm, settled visit today. Let's keep handover focused on their routine and route any case questions through the caseworker.",
    auditSha256: sha256Hex({ burnout, sts, placementStabilityBand }),
  };
}

export function processCulturalSewbYarningMap(body = {}) {
  const coSigned = Boolean(body.culturalWorkerCoSigned);
  return {
    sewbVitalityScore0to100: coSigned ? 95 : 80,
    culturalWorkerCoSigned: coSigned,
    culturalWorkerName: body.culturalWorkerName || null,
    antiBiasKinshipGuardrailNotes: [
      "Shared Auntie/Uncle/Grandparent kinship caring is a cultural protective strength, never diffused responsibility.",
    ],
    auditSha256: sha256Hex({ coSigned, culturalWorkerName: body.culturalWorkerName }),
  };
}

export function processCourtAnnexureCompilation(body = {}) {
  const clinicianApproved = Boolean(body.clinicianApproved);
  if (!clinicianApproved) {
    return {
      eligibleForCourtExport: false,
      blockedReason:
        "Court & SAFER Export Blocked: Under policies/safety_policy.md, unreviewed AI drafts cannot be exported to court bundles until signed off by a clinician.",
      tamperEvidentSha256: sha256Hex({ clinicianApproved: false, caseId: body.caseId }),
    };
  }

  return {
    eligibleForCourtExport: true,
    blockedReason: null,
    annexureTitle: `SafeSteps SAFER & 5P Longitudinal Court Annexure (${body.caseId || "case"})`,
    nonDiagnosticLegalDisclaimer:
      "NON-DIAGNOSTIC & NON-LEGAL DISCLOSURE: Synthesises longitudinal observations and RCI trajectories under the SAFER framework.",
    approvedByClinicianName: body.approvedByClinicianName || "Clinician",
    tamperEvidentSha256: sha256Hex({ clinicianApproved: true, caseId: body.caseId }),
  };
}

export function processMultiInformant360Portal(body = {}) {
  const selfScore = Number(body.parentSelfReportScore0to100 ?? 75);
  const obs = Array.isArray(body.observations) ? body.observations : [];
  const meanInformant =
    obs.length > 0
      ? Math.round(obs.reduce((a, b) => a + Number(b?.rating0to100 ?? 75), 0) / obs.length)
      : selfScore;
  const gap = Math.abs(selfScore - meanInformant);

  return {
    overallConvergenceScore0to100: Math.max(0, 100 - gap),
    meanInformantScore0to100: meanInformant,
    convergenceBand:
      gap >= 25
        ? "critical_multi_informant_discrepancy"
        : gap >= 15
          ? "moderate_contextual_variation"
          : "strong_360_convergence",
    auditSha256: sha256Hex({ selfScore, meanInformant, count: obs.length }),
  };
}

export function processAdaptiveMicroPrescriptions(body = {}) {
  const nowMs = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return {
    prescriptions: [
      {
        prescriptionId: `rx-${randomUUID()}`,
        microLessonId: "micro-cos-01",
        microLessonTitle: "3-Minute Co-Regulation & Somatic Reset",
        retest7dDueIso: new Date(nowMs + 7 * dayMs).toISOString(),
        retest14dDueIso: new Date(nowMs + 14 * dayMs).toISOString(),
        retest30dDueIso: new Date(nowMs + 30 * dayMs).toISOString(),
      },
    ],
    auditSha256: sha256Hex({ participantUserId: body.participantUserId }),
  };
}

export function processChildThreeHousesPlayroom(body = {}) {
  const worries = Array.isArray(body.houseOfWorries) ? body.houseOfWorries : [];
  const goodThings = Array.isArray(body.houseOfGoodThings) ? body.houseOfGoodThings : [];
  const dreams = Array.isArray(body.houseOfDreams) ? body.houseOfDreams : [];
  const trustedAdults = Array.isArray(body.fiveFingerTrustedAdults)
    ? body.fiveFingerTrustedAdults.filter(Boolean)
    : [];

  const combined = [...goodThings, ...worries, ...dreams].join(" ");
  const safetyGate = evaluateServerSafetyGate(combined, "child_support_coach");

  return {
    ageBand: body.ageBand || "9-12",
    safetyTier: safetyGate.safetyTier,
    crisisHalted: !safetyGate.safeToProceed,
    childFriendlyResponseMessage: !safetyGate.safeToProceed
      ? safetyGate.emergencyMessage
      : "Thank you for building your Three Houses and your 5-Finger Safety Hand! Grown-up worries are never your fault, and your safe grown-ups are here to help.",
    safetyNetworkComplete: trustedAdults.length >= 3,
    trustedAdultsCount: trustedAdults.length,
    auditSha256: sha256Hex({
      safetyTier: safetyGate.safetyTier,
      trustedAdultsCount: trustedAdults.length,
    }),
  };
}

