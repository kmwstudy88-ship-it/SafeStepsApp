import {
  processAdaptiveMicroPrescriptions,
  processAddictionRecoveryShield,
  processChildThreeHousesPlayroom,
  processClinicianSignOff,
  processCoachTurn,
  processContactVisitCoaching,
  processCouplesDfvSafetyCheck,
  processCourtAnnexureCompilation,
  processCulturalSewbYarningMap,
  processKinshipCarerSupport,
  processLongitudinalEvaluation,
  processMultiInformant360Portal,
  processNeuroSleepProfile,
  processPsychologicalFormulation,
  processRestorativeFamilyMeeting,
  processSafetyPlanVaultSave,
  processScaleScoring,
  processStealthPinVerification,
} from "../../backend/Services/AiSupport/AiSupportCoachService.js";
import {
  evaluateServerCouplesDfvSafetyCheck,
  evaluateServerSafetyGate,
  formatUncertaintyBanner,
  redactPii,
  sanitizeAgainstSafetyPolicy,
  sha256Hex,
} from "../../backend/Services/AiSupport/SafetyPolicyEnforcer.js";
import { isChildApiRequestAllowed } from "../../backend/security/childAccessPolicy.js";

describe("backend AI Support Coach, Psychologist, Evaluator & Safety Enforcer", () => {
  test("allows child access to POST /ai-support/coach/turn and /ai-support/child/three-houses while blocking adult AI endpoints", () => {
    expect(isChildApiRequestAllowed("POST", "/ai-support/coach/turn")).toBe(true);
    expect(isChildApiRequestAllowed("POST", "/ai-support/child/three-houses")).toBe(true);
    expect(isChildApiRequestAllowed("POST", "/ai-support/clinician/sign-off")).toBe(false);
    expect(isChildApiRequestAllowed("POST", "/ai-support/couples-dfv/safety-check")).toBe(false);
    expect(isChildApiRequestAllowed("POST", "/ai-support/court-annexure/compile")).toBe(false);
  });

  test("enforces Tier-1 safety halt and safety_policy.md sanitization on server", () => {
    const halt = evaluateServerSafetyGate(
      "He choked me and threatened to kill the kids",
      "dfv_safety_coach",
    );
    expect(halt.safeToProceed).toBe(false);
    expect(halt.safetyTier).toBe("tier_1_immediate");
    expect(halt.detectedDomains).toContain("dfv_strangulation_or_weapons");

    const sanitized = sanitizeAgainstSafetyPolicy(
      "This child has ADHD and this parent is borderline. The court should remove custody because this is abuse.",
    );
    expect(sanitized.sanitizedText).not.toMatch(/\bthis child has\b/i);
    expect(sanitized.sanitizedText).not.toMatch(/\bthis parent is\b/i);
    expect(sanitized.sanitizedText).not.toMatch(/\bthe court should\b/i);
    expect(sanitized.sanitizedText).not.toMatch(/\bthis is abuse\b/i);
    expect(sanitized.violationsCorrected.length).toBe(4);

    expect(redactPii("Phone 0412 345 678 and email test@example.com")).toContain("[REDACTED_PHONE]");
    expect(formatUncertaintyBanner(0.1)).toMatch(/Uncertain/);
    expect(formatUncertaintyBanner(0.4)).toMatch(/Low-confidence/);
  });

  test("silently pivots Couples DFV safety check to parallel_safe when feltSafetyScore < 7", () => {
    const check = evaluateServerCouplesDfvSafetyCheck({
      checkPhase: "pre_session",
      feltSafetyScore: 5,
      fearOfRetaliation: true,
    });
    expect(check.silentPivotTriggered).toBe(true);
    expect(check.recommendedMode).toBe("parallel_safe");
    expect(check.partnerFacingNeutralNotice).not.toMatch(/fear|5/i);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, "invalid", null])(
    "blocks conjoint sessions when the server felt-safety score is invalid (%s)",
    (feltSafetyScore) => {
      const check = evaluateServerCouplesDfvSafetyCheck({
        checkPhase: "pre_session",
        feltSafetyScore,
      });

      expect(check.feltSafetyScore).toBe(0);
      expect(check.silentPivotTriggered).toBe(true);
      expect(check.recommendedMode).toBe("individual_stabilisation_only");
      expect(check.permittedStage).toBe("stage_1_containment_individual");
      expect(check.clinicianAlertRequired).toBe(true);
    },
  );

  test.each([
    [-1, 0, "individual_stabilisation_only", "stage_1_containment_individual"],
    [4, 4, "individual_stabilisation_only", "stage_1_containment_individual"],
    [6, 6, "parallel_safe", "stage_2_parallel_synchronised"],
    [7, 7, "proceed_conjoint", "stage_3_conjoint_safety_gated"],
    [11, 10, "proceed_conjoint", "stage_3_conjoint_safety_gated"],
  ])(
    "clamps score %s and applies the server safety-mode boundaries",
    (score, expectedScore, expectedMode, expectedStage) => {
      const check = evaluateServerCouplesDfvSafetyCheck({ feltSafetyScore: score });

      expect(check.feltSafetyScore).toBe(expectedScore);
      expect(check.recommendedMode).toBe(expectedMode);
      expect(check.permittedStage).toBe(expectedStage);
      expect(check.silentPivotTriggered).toBe(expectedMode !== "proceed_conjoint");
    },
  );

  test("keeps immediate-danger reports in crisis-halt mode even with a high score", () => {
    const check = evaluateServerCouplesDfvSafetyCheck({
      feltSafetyScore: 10,
      immediateDanger: true,
    });

    expect(check.recommendedMode).toBe("tier1_crisis_halt");
    expect(check.permittedStage).toBe("stage_1_containment_individual");
    expect(check.silentPivotTriggered).toBe(true);
    expect(check.clinicianAlertRequired).toBe(true);
    expect(check.partnerFacingNeutralNotice).not.toMatch(/danger|safety|crisis/i);
  });

  test("processes coach turns, scale scoring with RCI, 5P formulations, 10-engine evaluations, and clinician sign-off deterministically", async () => {
    const turn = await processCoachTurn({
      personaMode: "parent_support_coach",
      clinicalPathway: "parent_co_regulation_cos",
      interactionForm: "reflective_dialogue",
      userMessage: "During bedtime my child felt scared so I took a breath and comforted them.",
      preferLocalDeterministic: true,
    });
    expect(turn.providerTierUsed).toBe("tier3_deterministic_local");
    expect(turn.reflectiveFunctioningScore).toBeGreaterThan(60);
    expect(turn.auditSha256).toHaveLength(64);

    const dfvCheck = processCouplesDfvSafetyCheck({ feltSafetyScore: 9 });
    expect(dfvCheck.recommendedMode).toBe("proceed_conjoint");

    const scored = processScaleScoring({
      scaleId: "phq_9",
      baselineRaw: 12,
      responses: [{ score: 1 }, { score: 1 }, { score: 1 }],
    });
    expect(scored.rawScore).toBe(3);
    expect(scored.rci.statisticallyReliable).toBe(true);

    const formulation = processPsychologicalFormulation({
      customSynthesis: "This child has anxiety and this parent is struggling.",
      confidenceOverride: 0.35,
    });
    expect(formulation.intersectionalSynthesis).toMatch(/Low-confidence output/);
    expect(formulation.intersectionalSynthesis).not.toMatch(/\bthis child has\b/i);

    const evaluation = processLongitudinalEvaluation({
      feltSafetyScore: 5,
      fearOfRetaliation: true,
    });
    expect(evaluation.tenEnginesSummary.silentPivotActive).toBe(true);
    expect(evaluation.overallRiskBand).toBe("High");

    const signOff = processClinicianSignOff(
      { targetId: "formulation-1", reviewState: "clinician_approved" },
      "clinician-42",
    );
    expect(signOff.reviewedByUserId).toBe("clinician-42");
    expect(signOff.auditSha256).toHaveLength(64);
  });

  test("processes all 12 Next-Horizon server modules deterministically", () => {
    const duress = processStealthPinVerification({
      enteredPin: "9999",
      primaryPinHash: sha256Hex("safesteps-pin-salt-v1:2468"),
      duressPinHash: sha256Hex("safesteps-pin-salt-v1:9999"),
    });
    expect(duress.mode).toBe("duress_sanitized_decoy");
    expect(duress.silentCaseworkerAlertDispatched).toBe(true);

    const vault = processSafetyPlanVaultSave(
      {
        safePlacesToGo: ["Sister's house"],
        trustedAdultsAndNeighbours: ["Aunty"],
        codeWordWithChildrenOrFriends: "Blue folder",
        essentialDocumentsChecklist: [{ packedOrPhotographedInVault: true }],
      },
      "survivor-99",
    );
    expect(vault.readinessPercentage).toBe(100);

    const visit = processContactVisitCoaching({ parentArousal0to10: 7 });
    expect(visit.requiresFiveMinuteSomaticGroundingFirst).toBe(true);

    const meeting = processRestorativeFamilyMeeting({
      couplesDfvStage: "stage_3_conjoint_safety_gated",
      clinicianSafetyClearance: true,
      survivorFeltSafetyScore0to10: 8,
      ruptureRepairDraft: "I'm sorry if you felt scared, but you pushed my buttons.",
    });
    expect(meeting.meetingPermitted).toBe(true);
    expect(meeting.excuseOrChildBlameDetected).toBe(true);

    const addiction = processAddictionRecoveryShield({
      cravingBefore0to10: 8,
      cravingAfter0to10: 3,
    });
    expect(addiction.urgeWaveSurfedSuccessfully).toBe(true);

    const neuro = processNeuroSleepProfile({ neurodivergentTraits: ["autism"] });
    expect(neuro.lowArousalPrinciples.length).toBe(2);

    const carer = processKinshipCarerSupport({ burnout0to50: 38 });
    expect(carer.placementStabilityBand).toBe("high_burnout_or_sts_urgent_support_red");

    const sewb = processCulturalSewbYarningMap({
      culturalWorkerCoSigned: true,
      culturalWorkerName: "Uncle David",
    });
    expect(sewb.culturalWorkerCoSigned).toBe(true);

    const blockedCourt = processCourtAnnexureCompilation({ clinicianApproved: false });
    expect(blockedCourt.eligibleForCourtExport).toBe(false);

    const approvedCourt = processCourtAnnexureCompilation({
      clinicianApproved: true,
      caseId: "case-77",
    });
    expect(approvedCourt.eligibleForCourtExport).toBe(true);

    const portal = processMultiInformant360Portal({
      parentSelfReportScore0to100: 90,
      observations: [{ rating0to100: 55 }],
    });
    expect(portal.convergenceBand).toBe("critical_multi_informant_discrepancy");

    const rx = processAdaptiveMicroPrescriptions({ participantUserId: "parent-1" });
    expect(rx.prescriptions).toHaveLength(1);

    const threeHouses = processChildThreeHousesPlayroom({
      houseOfWorries: ["Someone is hurting me at home"],
      fiveFingerTrustedAdults: ["Grandma", "Teacher", "Aunty"],
    });
    expect(threeHouses.crisisHalted).toBe(true);
    expect(threeHouses.safetyTier).toBe("tier_1_immediate");
  });
});
