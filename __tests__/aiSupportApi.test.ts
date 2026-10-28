import {
  clearAllQueuedAiSupportItems,
  generateAdaptiveMicroPrescriptions,
  generateCourtSaferAiAnnexure,
  generateLongitudinalEvaluation,
  generatePsychologistFormulation,
  getAiSupportOfflineQueueStatus,
  hashSafetyPin,
  runTechAbuseSafetyAudit,
  saveEncryptedDfvSafetyPlan,
  submit360MultiInformantPortal,
  submitAddictionUrgeSurfShield,
  submitAiCoachTurn,
  submitChildThreeHousesPlayroom,
  submitClinicalScaleScreening,
  submitCouplesDfvSafetyCheck,
  submitCulturalSewbYarningMap,
  submitKinshipCarerProQolCheck,
  submitNeuroSleepHouseholdToolkit,
  verifyStealthOrDuressPin,
} from "../lib/aiSupportApi";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("aiSupportApi Client Suite", () => {
  beforeEach(async () => {
    await clearAllQueuedAiSupportItems();
  });

  test("submitAiCoachTurn executes local deterministic clinical turn with safety evaluation", async () => {
    const result = await submitAiCoachTurn(
      {
        userMessage: "I felt overwhelmed when bedtime was loud, so I took 3 deep breaths.",
        personaMode: "parent_support_coach",
        activeClinicalPathway: "parent_co_regulation_cos",
        history: [],
      },
      { preferLocalDeterministic: true },
    );

    expect(result.assistantMessage).toBeTruthy();
    expect(result.safetyEvaluation.safeToProceed).toBe(true);
    expect(result.auditSha256.length).toBe(64);
  });

  test("submitCouplesDfvSafetyCheck detects coercion and triggers silent individual pivot", async () => {
    const safeCheck = await submitCouplesDfvSafetyCheck({
      sessionId: "session-couples-safe",
      participantUserId: "user-survivor",
      checkPhase: "pre_session",
      feltSafetyScore: 9,
      fearOfRetaliation: false,
      coercedToParticipate: false,
      immediateDanger: false,
    });
    expect(safeCheck.recommendedMode).toBe("proceed_conjoint");
    expect(safeCheck.silentPivotTriggered).toBe(false);

    const unsafeCheck = await submitCouplesDfvSafetyCheck({
      sessionId: "session-couples-unsafe",
      participantUserId: "user-survivor",
      checkPhase: "pre_session",
      feltSafetyScore: 3,
      fearOfRetaliation: true,
      coercedToParticipate: true,
      immediateDanger: false,
    });
    expect(unsafeCheck.silentPivotTriggered).toBe(true);
    expect(unsafeCheck.recommendedMode).toBe("individual_stabilisation_only");
  });

  test("submitClinicalScaleScreening scores clinical instruments", async () => {
    const scored = await submitClinicalScaleScreening("prfq", [
      { itemId: "prfq_1", numericScore: 4 },
      { itemId: "prfq_2", numericScore: 4 },
      { itemId: "prfq_3", numericScore: 5 },
      { itemId: "prfq_4", numericScore: 4 },
    ]);

    expect(scored.scaleId).toBe("prfq");
    expect(scored.rawScore).toBeGreaterThan(0);
    expect(scored.band.interpretation).toBeTruthy();
  });

  test("generatePsychologistFormulation compiles 5P formulation", async () => {
    const prfq = await submitClinicalScaleScreening("prfq", [
      { itemId: "prfq_1", numericScore: 4 },
      { itemId: "prfq_2", numericScore: 4 },
      { itemId: "prfq_3", numericScore: 4 },
      { itemId: "prfq_4", numericScore: 4 },
    ]);

    const formulation = await generatePsychologistFormulation({
      caseId: "case-formulation-test",
      participantUserId: "user-parent-1",
      clinicianClearedConjoint: true,
      screenings: [prfq],
    });

    expect(formulation.presentingFactors).toBeDefined();
    expect(formulation.predisposingFactors).toBeDefined();
    expect(formulation.protectiveFactors).toBeDefined();
    expect(formulation.reviewState).toBe("draft_requires_clinician_review");
    expect(formulation.auditSha256.length).toBe(64);
  });

  test("generateLongitudinalEvaluation runs 10-engine evaluation with RCI", async () => {
    const prfqCurrent = await submitClinicalScaleScreening("prfq", [
      { itemId: "prfq_1", numericScore: 5 },
      { itemId: "prfq_2", numericScore: 5 },
      { itemId: "prfq_3", numericScore: 4 },
      { itemId: "prfq_4", numericScore: 5 },
    ]);

    const evalReport = await generateLongitudinalEvaluation({
      caseId: "case-longitudinal-test",
      participantUserId: "user-parent-1",
      currentScreenings: [prfqCurrent],
      baselineScreenings: [{ scaleId: "prfq", rawScore: 8 }],
      clinicianClearedConjoint: true,
    });

    expect(evalReport.caseId).toBe("case-longitudinal-test");
    expect(evalReport.engine6LongitudinalRci.rciResults.length).toBeGreaterThan(0);
    expect(evalReport.saferJudgement).toBeDefined();
    expect(evalReport.auditSha256.length).toBe(64);
  });

  test("verifyStealthOrDuressPin distinguishes primary PIN from duress sanitized decoy", async () => {
    const primaryHash = hashSafetyPin("2468");
    const duressHash = hashSafetyPin("9999");

    const primaryCheck = await verifyStealthOrDuressPin({
      enteredPin: "2468",
      primaryPinHash: primaryHash,
      duressPinHash: duressHash,
    });
    expect(primaryCheck.mode).toBe("normal_full_access");
    expect(primaryCheck.hideDfvCheckInsAndSafetyVault).toBe(false);

    const duressCheck = await verifyStealthOrDuressPin({
      enteredPin: "9999",
      primaryPinHash: primaryHash,
      duressPinHash: duressHash,
    });
    expect(duressCheck.mode).toBe("duress_sanitized_decoy");
    expect(duressCheck.hideDfvCheckInsAndSafetyVault).toBe(true);
    expect(duressCheck.silentCaseworkerAlertDispatched).toBe(true);
  });

  test("runTechAbuseSafetyAudit generates safe non-escalating remediation steps", async () => {
    const audit = await runTechAbuseSafetyAudit([
      { category: "location_airtag_or_find_my_tracking", endorsed: true },
      { category: "shared_cloud_or_apple_google_id", endorsed: true },
    ]);

    expect(audit.endorsedCount).toBe(2);
    expect(audit.safeRemediationSteps.length).toBe(2);
    expect(audit.escalationGuidance).toBeTruthy();
  });

  test("saveEncryptedDfvSafetyPlan encrypts vault record and computes audit hash", async () => {
    const record = await saveEncryptedDfvSafetyPlan({
      ownerUserId: "user-survivor-1",
      safePlacesToGo: ["Sister's house", "Local community refuge"],
      trustedAdultsAndNeighbours: ["Aunty Sarah", "Neighbour Chen"],
      codeWordWithChildrenOrFriends: "Pick up the blue library folder",
      essentialDocumentsChecklist: [
        { item: "Passports", packedOrPhotographedInVault: true },
      ],
      childAndPetSafetyArrangements: "Pet foster arranged with cousin",
      financialIndependenceSteps: ["Confidential account opened"],
      dvoAvoConditions: [],
    });

    expect(record.encryptedCiphertext).toBeTruthy();
    expect(record.redactedSummary.readinessPercentage).toBeGreaterThan(0);
    expect(record.auditSha256.length).toBe(64);
  });

  test("submitAddictionUrgeSurfShield calculates wave delta and MAT routines", async () => {
    const result = await submitAddictionUrgeSurfShield({
      participantUserId: "user-aod-1",
      cravingBefore0to10: 8,
      cravingAfter0to10: 3,
      urgeSurfSecondsCompleted: 90,
      haltSTriggers: ["tired_or_sleep_deprived"],
      upcomingHighRiskEvent: "Payday Friday",
      matAdherenceChecked: true,
      lapseOccurred: false,
      childSafeCareArranged: true,
    });

    expect(result.cravingDelta).toBe(-5);
    expect(result.riskTier).toBe("steady_green");
    expect(result.ninetySecondWaveCoachScript).toBeTruthy();
  });

  test("submitNeuroSleepHouseholdToolkit accommodates neurodivergent bedtime routines", async () => {
    const result = await submitNeuroSleepHouseholdToolkit({
      participantUserId: "user-parent-nd",
      neurodivergentTraits: ["autism_sensory_predictability", "fasd_concrete_visual_single_step"],
      sensoryTriggers: ["Loud sounds", "Bright lights"],
      sleepDistressSignals: ["nightmares_or_night_terrors"],
    });

    expect(result.chunkedVisualSchedule.length).toBeGreaterThan(0);
    expect(result.bedtimeCoRegulationScript).toBeTruthy();
    expect(result.evaluatorAccommodationFlag).toBeTruthy();
  });

  test("submitKinshipCarerProQolCheck evaluates placement stability and contact scripts", async () => {
    const result = await submitKinshipCarerProQolCheck({
      carerUserId: "carer-grandparent-1",
      carerType: "kinship_grandparent",
      compassionSatisfaction0to50: 42,
      burnout0to50: 18,
      secondaryTraumaticStress0to50: 15,
    });

    expect(result.placementStabilityBand).toBe("strong_sustainable_green");
    expect(result.birthParentBoundaryScript).toBeTruthy();
  });

  test("submitCulturalSewbYarningMap evaluates 7-domain SEWB and anti-bias guardrails", async () => {
    const result = await submitCulturalSewbYarningMap({
      participantUserId: "user-indigenous-parent",
      domainBody: "Walking on country and eating healthy bush tucker",
      domainMindEmotions: "Yarning with mob and deep listening (Dadirri)",
      domainFamilyKinship: "Grandmothers and aunties active in school pickup",
      domainCommunity: "Active gathering place connections",
      domainCulture: "Teaching language and traditional dance to children",
      domainCountry: "Riverbank walks on ancestral land",
      domainSpiritAncestors: "Honouring Elder teachings",
      culturalWorkerCoSigned: true,
      culturalWorkerName: "Uncle David [Co-signed under cultural safety standards]",
    });

    expect(result.sewbVitalityScore0to100).toBeGreaterThan(70);
    expect(result.antiBiasKinshipGuardrailNotes.length).toBeGreaterThan(0);
  });

  test("generateCourtSaferAiAnnexure strictly blocks unapproved drafts and allows approved export", async () => {
    const prfq = await submitClinicalScaleScreening("prfq", [
      { itemId: "prfq_1", numericScore: 4 },
      { itemId: "prfq_2", numericScore: 4 },
      { itemId: "prfq_3", numericScore: 4 },
      { itemId: "prfq_4", numericScore: 4 },
    ]);

    const formulation = await generatePsychologistFormulation({
      caseId: "case-court-annexure-test",
      participantUserId: "parent-test",
      screenings: [prfq],
      clinicianClearedConjoint: true,
    });

    const evaluation = await generateLongitudinalEvaluation({
      caseId: "case-court-annexure-test",
      participantUserId: "parent-test",
      currentScreenings: [prfq],
      baselineScreenings: [{ scaleId: "prfq", rawScore: 6 }],
      clinicianClearedConjoint: true,
    });

    // Unapproved: must be blocked per safety_policy.md
    const blockedAnnexure = await generateCourtSaferAiAnnexure({
      caseId: "case-court-annexure-test",
      participantUserId: "parent-test",
      formulation,
      evaluation,
      clinicianApproved: false,
    });
    expect(blockedAnnexure.eligibleForCourtExport).toBe(false);
    expect(blockedAnnexure.blockedReason).toContain("Court & SAFER Export Blocked");

    // Approved: must be eligible with tamper-evident hash
    formulation.reviewState = "clinician_approved";
    evaluation.reviewState = "clinician_approved";

    const approvedAnnexure = await generateCourtSaferAiAnnexure({
      caseId: "case-court-annexure-test",
      participantUserId: "parent-test",
      formulation,
      evaluation,
      clinicianApproved: true,
      approvedByClinicianName: "Dr. E. Vance [AHPRA PSY0001928374]",
    });
    expect(approvedAnnexure.eligibleForCourtExport).toBe(true);
    expect(approvedAnnexure.tamperEvidentSha256.length).toBe(64);
  });

  test("submit360MultiInformantPortal triangulates collateral observations", async () => {
    const portal = await submit360MultiInformantPortal({
      caseId: "case-360-test",
      subjectUserId: "parent-test",
      parentSelfReportScore0to100: 80,
      observations: [
        {
          informantRole: "contact_supervisor",
          informantName: "Supervisor Jane",
          observedDomain: "Warmth and Handover Settling",
          rating0to100: 78,
          behavioralObservationNotes: "Calm and encouraging handover greeting.",
        },
        {
          informantRole: "teacher_early_childhood",
          informantName: "Teacher Mark",
          observedDomain: "Morning School Readiness",
          rating0to100: 76,
          behavioralObservationNotes: "Child arrives settled with lunch packed.",
        },
      ],
    });

    expect(portal.overallConvergenceScore0to100).toBeGreaterThan(80);
    expect(portal.convergenceBand).toBe("strong_360_convergence");
    expect(portal.processedObservations.length).toBe(2);
    expect(portal.auditSha256.length).toBe(64);
  });

  test("generateAdaptiveMicroPrescriptions prescribes drills with spaced 7d/14d/30d re-tests", async () => {
    const prescriptions = await generateAdaptiveMicroPrescriptions({
      participantUserId: "parent-test",
      flaggedDomains: [
        {
          domainKey: "co_regulation_under_stress",
          triggerSource: "Live Stress Simulator",
          currentScore0to100: 60,
        },
      ],
    });

    expect(prescriptions.prescriptions.length).toBe(1);
    expect(prescriptions.prescriptions[0].retest7dDueIso).toBeTruthy();
    expect(prescriptions.prescriptions[0].retest14dDueIso).toBeTruthy();
    expect(prescriptions.prescriptions[0].retest30dDueIso).toBeTruthy();
    expect(prescriptions.auditSha256.length).toBe(64);
  });

  test("submitChildThreeHousesPlayroom maps child voice, 5-finger safety hand, and worry pacer", async () => {
    const playroom = await submitChildThreeHousesPlayroom({
      childUserId: "child-test",
      ageBand: "9-12",
      houseOfGoodThings: ["Drawing comics", "Soccer with pup"],
      houseOfWorries: ["Loud arguing at bedtime"],
      houseOfDreams: ["Calm dinner table"],
      fiveFingerTrustedAdults: [
        "👍 Thumb (Primary): Grandma Helen [0400 111 222]",
        "☝ Index (School): Miss Taylor [School Office]",
        "🖕 Middle (Caseworker): Sam [Child Safety]",
      ],
      worryMonsterIntensity0to10: 4,
    });

    expect(playroom.safetyTier).toBe("tier_4_green");
    expect(playroom.safetyNetworkComplete).toBe(true);
    expect(playroom.trustedAdultsCount).toBe(3);
    expect(playroom.worryMonsterTamingExercise).toBeTruthy();
    expect(playroom.auditSha256.length).toBe(64);
  });

  test("getAiSupportOfflineQueueStatus reports queue count and cryptographic chain verification", async () => {
    const status = await getAiSupportOfflineQueueStatus();
    expect(status.pendingCount).toBe(0);
    expect(status.tamperVerified).toBe(true);
  });
});
