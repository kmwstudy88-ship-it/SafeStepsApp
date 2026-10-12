import {
  CLINICAL_AND_PARENTING_SCALES,
  CLINICAL_SCALE_CATEGORIES,
  computeReliableChangeIndex,
  evaluateResponseValidity,
  getClinicalScaleById,
  scoreClinicalScale,
} from "../lib/data/clinicalAndParentingScales";
import {
  CLINICAL_PATHWAY_PROTOCOLS,
  FOUR_STAGE_COUPLES_DFV_RESTORATION_PATHWAY,
  TEN_INTERACTION_FORMS,
} from "../lib/data/therapeuticCoachingProtocols";
import { runTenEngineLongitudinalEvaluation } from "../lib/engines/aiLongitudinalEvaluatorEngine";
import { buildFivePPsychologicalFormulation } from "../lib/engines/aiPsychologistFormulationEngine";
import {
  buildSharedTimeOutContract,
  buildUncertaintyDisclosure,
  computeAuditSha256,
  evaluateCouplesDfvSafetyGate,
  evaluateEarlyWarningRadar,
  evaluatePreAndPostSafetyGate,
  redactSensitivePii,
  rewritePartnerMessageToBiff,
  runSupportCoachTurn,
  sanitizeAiOutputAgainstSafetyPolicy,
} from "../lib/engines/aiSupportCoachEngine";
import {
  buildRestorativeFamilyMeetingPlan,
  runContactVisitCoaching,
} from "../lib/engines/contactVisitAndRestorativeMeetingEngine";
import {
  compileCourtSaferAiAnnexure,
  evaluate360MultiInformantPortal,
  evaluateChildThreeHousesAndSafetyHand,
  prescribeAdaptiveMicroLessonsAndReTests,
} from "../lib/engines/forensicConvergenceAndChildPlayroomEngine";
import {
  buildFirstNationsSewbYarningMap,
  buildNeuroSleepHouseholdToolkit,
  evaluateKinshipCarerSupport,
  runAddictionRecoveryShield,
} from "../lib/engines/specializedClinicalPopulationsEngine";
import {
  buildBenignCloakScreenPayload,
  buildLivingDfvSafetyPlan,
  decryptSafetyPlanPayload,
  encryptSafetyPlanPayload,
  evaluateTechAbuseStalkerwareAudit,
  hashSafetyPin,
  verifyPinOrDuressMode,
} from "../lib/security/stealthSafetyAndEscapeVaultEngine";

describe("SafeSteps AI Support Coach, 5P Psychologist & 10-Engine Evaluator Suite", () => {
  test("provides all 10 interaction forms, 12 clinical pathways, 4 couples DFV stages, and 10 scale categories", () => {
    expect(TEN_INTERACTION_FORMS).toHaveLength(10);
    expect(CLINICAL_PATHWAY_PROTOCOLS).toHaveLength(12);
    expect(FOUR_STAGE_COUPLES_DFV_RESTORATION_PATHWAY).toHaveLength(4);
    expect(CLINICAL_SCALE_CATEGORIES).toHaveLength(10);
    expect(CLINICAL_AND_PARENTING_SCALES.length).toBeGreaterThanOrEqual(50);
  });

  test("triggers critical safety overrides on PHQ-9 Item 9, EPDS Item 10, and DFV strangulation", () => {
    const phq9Result = scoreClinicalScale("phq_9", [
      { itemId: "phq9_1", numericScore: 0 },
      { itemId: "phq9_9", numericScore: 1 },
    ]);
    expect(phq9Result.criticalOverrideTriggered).toBe(true);
    expect(phq9Result.requiresSupervisorReview).toBe(true);

    const epdsResult = scoreClinicalScale("epds_10", [
      { itemId: "epds_1", numericScore: 0 },
      { itemId: "epds_10", numericScore: 1 },
    ]);
    expect(epdsResult.criticalOverrideTriggered).toBe(true);

    const dfvResult = scoreClinicalScale("dfv_safety_coercive", [
      { itemId: "dfv_1", numericScore: 1 },
    ]);
    expect(dfvResult.criticalOverrideTriggered).toBe(true);
    expect(dfvResult.criticalOverrideReasons[0]).toMatch(/strangulation/i);
  });

  test("detects straight-lining, rapid click-through, and impression management in embedded validity checks", () => {
    const mcsds = getClinicalScaleById("validity_mcsds")!;
    const gamedValidity = evaluateResponseValidity(mcsds, [
      { itemId: "mcsds_1", numericScore: 3, responseTimeMs: 400 },
      { itemId: "mcsds_2", numericScore: 3, responseTimeMs: 450 },
      { itemId: "mcsds_3", numericScore: 3, responseTimeMs: 500 },
      { itemId: "mcsds_4", numericScore: 3, responseTimeMs: 400 },
    ]);

    expect(gamedValidity.straightLiningDetected).toBe(true);
    expect(gamedValidity.rapidClickThroughDetected).toBe(true);
    expect(gamedValidity.extremeMinimisationDetected).toBe(true);
    expect(gamedValidity.overallValidityBand).toBe("invalid_gaming_or_random");
  });

  test("computes Jacobson & Truax (1991) Reliable Change Index (RCI) accurately", () => {
    const improved = computeReliableChangeIndex({
      scaleId: "phq_9",
      baselineRaw: 11,
      currentRaw: 3,
    });
    expect(improved.statisticallyReliable).toBe(true);
    expect(improved.crossedClinicalCutoff).toBe(true);
    expect(improved.classification).toBe("clinically_significant_improvement");

    const deteriorated = computeReliableChangeIndex({
      scaleId: "phq_9",
      baselineRaw: 2,
      currentRaw: 10,
    });
    expect(deteriorated.statisticallyReliable).toBe(true);
    expect(deteriorated.classification).toBe("reliable_deterioration");
  });

  test("enforces Tier-1 immediate crisis halt on child disclosure, strangulation, and suicidality", () => {
    const childCrisis = evaluatePreAndPostSafetyGate(
      "Someone is hurting me at home and I am scared",
      "child_support_coach",
    );
    expect(childCrisis.safeToProceed).toBe(false);
    expect(childCrisis.safetyTier).toBe("tier_1_immediate");
    expect(childCrisis.detectedDomains).toContain("child_abuse_disclosure");
    expect(childCrisis.emergencyResponseMessage).toMatch(/1800 55 1800/);

    const strangulationCrisis = evaluatePreAndPostSafetyGate(
      "He put his hands around my neck last night and threatened to kill me",
      "dfv_safety_coach",
    );
    expect(strangulationCrisis.safeToProceed).toBe(false);
    expect(strangulationCrisis.detectedDomains).toContain("dfv_strangulation_or_weapons");
  });

  test("enforces safety_policy.md non-diagnostic, non-legal, PII redaction, and uncertainty disclosure rules", () => {
    const raw =
      "This child has PTSD and this parent is narcissistic. The court will grant custody because this is abuse.";
    const { sanitizedText, violationsCorrected } = sanitizeAiOutputAgainstSafetyPolicy(raw);
    expect(sanitizedText).not.toMatch(/\bthis child has\b/i);
    expect(sanitizedText).not.toMatch(/\bthis parent is\b/i);
    expect(sanitizedText).not.toMatch(/\bthe court will\b/i);
    expect(sanitizedText).not.toMatch(/\bthis is abuse\b/i);
    expect(violationsCorrected.length).toBeGreaterThanOrEqual(4);

    const piiRedacted = redactSensitivePii(
      "Call me on 0412 345 678 or email parent@example.com at 14 Smith Street",
    );
    expect(piiRedacted).toContain("[REDACTED_PHONE]");
    expect(piiRedacted).toContain("[REDACTED_EMAIL]");
    expect(piiRedacted).toContain("[REDACTED_ADDRESS]");

    expect(buildUncertaintyDisclosure(0.15)).toBe(
      "Uncertain — do not rely on this output; consult a supervisor.",
    );
    expect(buildUncertaintyDisclosure(0.35)).toBe(
      "Low-confidence output — verify with primary records before acting.",
    );
    expect(buildUncertaintyDisclosure(0.85)).toBeNull();
  });

  test("silently pivots Couples & Family DFV session to Parallel Safe Mode when partner reports fear (<7/10)", () => {
    const unsafeCheck = evaluateCouplesDfvSafetyGate({
      sessionId: "sess-dfv-1",
      participantUserId: "survivor-1",
      checkPhase: "pre_session",
      feltSafetyScore: 5,
      fearOfRetaliation: true,
      coercedToParticipate: false,
      immediateDanger: false,
    });

    expect(unsafeCheck.silentPivotTriggered).toBe(true);
    expect(unsafeCheck.recommendedMode).toBe("parallel_safe");
    expect(unsafeCheck.permittedStage).toBe("stage_2_parallel_synchronised");
    // Ensure the partner-facing notice is completely neutral and never reveals the survivor's check-in answer
    expect(unsafeCheck.partnerFacingNeutralNotice).not.toMatch(/fear|retaliation|unsafe|5/i);
    expect(unsafeCheck.partnerFacingNeutralNotice).toMatch(/Parallel Individual Skill-Building Mode/);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY])(
    "blocks conjoint sessions when the felt-safety score is invalid (%s)",
    (feltSafetyScore) => {
      const check = evaluateCouplesDfvSafetyGate({
        sessionId: "sess-dfv-invalid-score",
        participantUserId: "survivor-1",
        checkPhase: "pre_session",
        feltSafetyScore,
        fearOfRetaliation: false,
        coercedToParticipate: false,
        immediateDanger: false,
      });

      expect(check.silentPivotTriggered).toBe(true);
      expect(check.recommendedMode).toBe("individual_stabilisation_only");
      expect(check.permittedStage).toBe("stage_1_containment_individual");
      expect(check.clinicianAlertRequired).toBe(true);
    },
  );

  test("rewrites hostile or triangulating partner messages into safe BIFF messages and builds 20-min Time-Out contracts", () => {
    const biff = rewritePartnerMessageToBiff(
      "You always ruin everything and even the kids know it! Where are you right now?!",
      "Friday 4pm school pickup",
    );
    expect(biff.containsCoerciveOrHostileLanguage).toBe(true);
    expect(biff.containsChildTriangulation).toBe(true);
    expect(biff.safeToSend).toBe(false);
    expect(biff.biffRewrittenMessage).toMatch(/Friday 4pm school pickup/);

    const contract = buildSharedTimeOutContract({
      agreedCodeWord: "Pause for the Kids",
      coolingDurationMinutes: 25,
    });
    expect(contract.coolingDurationMinutes).toBe(25);
    expect(contract.agreedCodeWord).toBe("Pause for the Kids");
    expect(contract.prohibitedBehaviours.length).toBeGreaterThanOrEqual(3);
  });

  test("runs all 10 interaction forms in runSupportCoachTurn and computes Early Warning Radar", () => {
    const radar = evaluateEarlyWarningRadar({
      sleepHoursLastNight: 4,
      cravingIntensity0to10: 7,
      householdTension0to10: 6,
      upcomingOrRecentContactVisit: true,
      sensoryOverload0to10: 6,
      missedProtectiveRoutineDays: 2,
    });
    expect(radar.riskLevel).toBe("critical_red");
    expect(radar.recommendedPathway).toBe("addiction_mi_relapse_prevention");

    const turn = runSupportCoachTurn({
      personaMode: "parent_support_coach",
      clinicalPathway: "parent_co_regulation_cos",
      interactionForm: "teach_back_perspective_switch",
      userMessage:
        "During bedtime tonight my child felt scared when voices got loud, so I knelt down at eye level, softened my voice, and comforted them so their body felt safe.",
      confidenceOverride: 0.4,
    });

    expect(turn.reflectiveFunctioningScore).toBeGreaterThanOrEqual(75);
    expect(turn.uncertaintyDisclosure).toBe(
      "Low-confidence output — verify with primary records before acting.",
    );
    expect(turn.auditSha256).toHaveLength(64);
    expect(computeAuditSha256("test")).toHaveLength(64);
  });

  test("builds 5P Non-Diagnostic Formulation and executes all 10 Specialized Evaluator Engines", () => {
    const screenings = [
      scoreClinicalScale("dvfct_readiness", [
        { itemId: "dvfct_1", numericScore: 4 },
        { itemId: "dvfct_2", numericScore: 4 },
        { itemId: "dvfct_3", numericScore: 4 },
        { itemId: "dvfct_4", numericScore: 4 },
      ]),
      scoreClinicalScale("puv_accountability", [
        { itemId: "puv_1", numericScore: 3 },
        { itemId: "puv_2", numericScore: 4 },
        { itemId: "puv_3", numericScore: 3 },
        { itemId: "puv_4", numericScore: 4 },
      ]),
      scoreClinicalScale("prfq", [
        { itemId: "prfq_1", numericScore: 4 },
        { itemId: "prfq_2", numericScore: 4 },
        { itemId: "prfq_3", numericScore: 3 },
        { itemId: "prfq_4", numericScore: 4 },
      ]),
      scoreClinicalScale("concrete_needs", [
        { itemId: "sdh_1", numericScore: 2 },
        { itemId: "sdh_2", numericScore: 2 },
      ]),
    ];

    const formulation = buildFivePPsychologicalFormulation({
      caseId: "case-100",
      participantUserId: "parent-100",
      screenings,
      clinicianClearedConjoint: true,
    });

    expect(formulation.presentingFactors.length).toBeGreaterThan(0);
    expect(formulation.protectiveFactors.length).toBeGreaterThan(0);
    expect(formulation.safeAndTogetherSummary.nonVictimBlamingGuardrailVerified).toBe(true);
    expect(formulation.couplesDfvRestorationSummary.recommendedStage).toBe(
      "stage_3_conjoint_safety_gated",
    );
    expect(formulation.reviewState).toBe("draft_requires_clinician_review");

    const evaluation = runTenEngineLongitudinalEvaluation({
      caseId: "case-100",
      participantUserId: "parent-100",
      currentScreenings: screenings,
      baselineScreenings: [{ scaleId: "prfq", rawScore: 6 }],
      clinicianClearedConjoint: true,
    });

    expect(evaluation.engine1AntiGaming.overallAuthenticityScore).toBeGreaterThan(60);
    expect(evaluation.engine2SafeAndTogether.survivorPenalisationBlocked).toBe(true);
    expect(evaluation.engine3CouplesDfvRestoration.conjointSafetyClearance).toBe(true);
    expect(evaluation.engine4ReflectiveFunctioning.rfBand).toBe("strong_protective_mentalizing");
    expect(evaluation.engine6LongitudinalRci.rciResults.length).toBe(1);
    expect(evaluation.engine7NeurodiversityFairness.povertyVsNeglectGuardrailTriggered).toBe(true);
    expect(evaluation.engine8CulturalSewb.antiBiasAuditPassed).toBe(true);
    expect(evaluation.engine9PsychometricValidity.overallValidityStatus).toBe("valid_interpretable");
    expect(evaluation.engine10MultiInformantConvergence.convergenceScore).toBeGreaterThan(50);
    expect(evaluation.saferJudgement.presentCategories).toHaveLength(8);
    expect(evaluation.psychometricCompetencyProfiles.length).toBeGreaterThan(0);

    // Module 9: Court & SAFER Annexure Compiler blocks unreviewed drafts and approves signed-off reports
    const blockedAnnexure = compileCourtSaferAiAnnexure({
      caseId: "case-100",
      participantUserId: "parent-100",
      formulation,
      evaluation,
      clinicianApproved: false,
    });
    expect(blockedAnnexure.eligibleForCourtExport).toBe(false);
    expect(blockedAnnexure.courtEvidenceRecords).toHaveLength(0);

    formulation.reviewState = "clinician_approved";
    evaluation.reviewState = "clinician_approved";
    const approvedAnnexure = compileCourtSaferAiAnnexure({
      caseId: "case-100",
      participantUserId: "parent-100",
      formulation,
      evaluation,
      clinicianApproved: true,
      approvedByClinicianName: "Dr. Vance",
    });
    expect(approvedAnnexure.eligibleForCourtExport).toBe(true);
    expect(approvedAnnexure.courtEvidenceRecords).toHaveLength(2);
  });

  test("executes Modules 1 & 2: Stealth Quick-Exit Cloak, Duress PIN decoy mode, Tech-Abuse Audit, and Encrypted Safety Plan Vault", () => {
    const cloak = buildBenignCloakScreenPayload("household_shopping_checklist");
    expect(cloak.navigationHistoryCleared).toBe(true);
    expect(cloak.sensitiveCachePurged).toBe(true);
    expect(cloak.benignItems.length).toBeGreaterThan(2);

    const primaryHash = hashSafetyPin("2468");
    const duressHash = hashSafetyPin("9999");

    const duressCheck = verifyPinOrDuressMode({
      enteredPin: "9999",
      primaryPinHash: primaryHash,
      duressPinHash: duressHash,
    });
    expect(duressCheck.authenticated).toBe(true);
    expect(duressCheck.mode).toBe("duress_sanitized_decoy");
    expect(duressCheck.hideDfvCheckInsAndSafetyVault).toBe(true);
    expect(duressCheck.silentCaseworkerAlertDispatched).toBe(true);

    const techAudit = evaluateTechAbuseStalkerwareAudit([
      { category: "spyware_unknown_configuration_profiles", endorsed: true },
      { category: "location_airtag_or_find_my_tracking", endorsed: true },
    ]);
    expect(techAudit.overallTechRiskBand).toBe("critical_stalkerware");
    expect(techAudit.safeRemediationSteps).toHaveLength(2);

    const cipher = encryptSafetyPlanPayload('{"secret":"safe-house"}', "key-1");
    expect(decryptSafetyPlanPayload(cipher, "key-1")).toBe('{"secret":"safe-house"}');

    const plan = buildLivingDfvSafetyPlan({
      ownerUserId: "survivor-1",
      safePlacesToGo: ["Sister's home", "Police station"],
      trustedAdultsAndNeighbours: ["Aunty Sarah"],
      codeWordWithChildrenOrFriends: "Blue folder",
      essentialDocumentsChecklist: [
        { item: "Birth certificates", packedOrPhotographedInVault: true },
      ],
      childAndPetSafetyArrangements: "School pickup list updated",
      financialIndependenceSteps: ["Separate safe account"],
      dvoAvoConditions: [{ conditionSummary: "No contact", breachReportingNote: "Log immediately" }],
    });
    expect(plan.redactedSummary.readinessPercentage).toBe(100);
    expect(plan.encryptedCiphertext).toMatch(/^v1-enc:/);
  });

  test("executes Modules 3 & 4: Contact Visit Transition Decoder and Safety-Gated Restorative Family Meeting Studio", () => {
    const visitCoach = runContactVisitCoaching({
      parentOrCarerUserId: "parent-1",
      visitPhase: "post_visit_transition",
      parentArousal0to10: 7,
      childAgeBand: "5-8",
      childObservedSignals: ["quiet_withdrawn_or_shut_down", "tummy_ache_or_headache"],
    });
    expect(visitCoach.requiresFiveMinuteSomaticGroundingFirst).toBe(true);
    expect(visitCoach.avoidedMisattributionFlags.length).toBe(2);

    const blockedMeeting = buildRestorativeFamilyMeetingPlan({
      creatorUserId: "parent-1",
      couplesDfvStage: "stage_3_conjoint_safety_gated",
      clinicianSafetyClearance: true,
      survivorFeltSafetyScore0to10: 5,
      ruptureRepairDraft: "I'm sorry if you felt scared, but you pushed my buttons!",
      childWishesOrWorries: ["Calm voices at bedtime"],
    });
    expect(blockedMeeting.meetingPermitted).toBe(false);
    expect(blockedMeeting.activeDeliveryMode).toBe("parallel_individual_only_blocked");
    expect(blockedMeeting.excuseOrChildBlameDetected).toBe(true);
    expect(blockedMeeting.sanitizedChildCentredApology).toMatch(/Nothing you did caused my behaviour/);
  });

  test("executes Modules 5, 6, 7 & 8: Addiction Urge-Surfing, Neuro/Sleep Toolkit, Kinship Carer ProQOL, and Cultural SEWB Yarning Map", () => {
    const addiction = runAddictionRecoveryShield({
      participantUserId: "parent-1",
      cravingBefore0to10: 8,
      cravingAfter0to10: 3,
      urgeSurfSecondsCompleted: 90,
      haltSTriggers: ["tired_or_sleep_deprived"],
      matAdherenceChecked: true,
      lapseOccurred: false,
      childSafeCareArranged: true,
    });
    expect(addiction.cravingDelta).toBe(-5);
    expect(addiction.urgeWaveSurfedSuccessfully).toBe(true);

    const neuroSleep = buildNeuroSleepHouseholdToolkit({
      participantUserId: "parent-1",
      neurodivergentTraits: ["autism_sensory_predictability", "fasd_concrete_visual_single_step"],
      sensoryTriggers: ["Bright lights"],
      sleepDistressSignals: ["nightmares_or_night_terrors"],
    });
    expect(neuroSleep.chunkedVisualSchedule).toHaveLength(3);
    expect(neuroSleep.lowArousalPrinciples.length).toBeGreaterThanOrEqual(3);

    const kinship = evaluateKinshipCarerSupport({
      carerUserId: "carer-1",
      carerType: "kinship_grandparent",
      compassionSatisfaction0to50: 40,
      burnout0to50: 36,
      secondaryTraumaticStress0to50: 28,
    });
    expect(kinship.placementStabilityBand).toBe("high_burnout_or_sts_urgent_support_red");

    const sewb = buildFirstNationsSewbYarningMap({
      participantUserId: "parent-1",
      domainBody: "Strong",
      domainMindEmotions: "Steady",
      domainFamilyKinship: "Aunties & Grandmother",
      domainCommunity: "Gathering place",
      domainCulture: "Storytelling",
      domainCountry: "River walk",
      domainSpiritAncestors: "Elders",
      culturalWorkerCoSigned: true,
      culturalWorkerName: "Uncle David",
    });
    expect(sewb.domainsPopulatedCount).toBe(7);
    expect(sewb.sewbVitalityScore0to100).toBe(100);
    expect(sewb.culturalWorkerCoSigned).toBe(true);
  });

  test("executes Modules 10, 11 & 12: 360° Multi-Informant Portal, Closed-Loop Adaptive Micro-Lessons, and Child Three Houses Playroom", () => {
    const portal = evaluate360MultiInformantPortal({
      caseId: "case-100",
      subjectUserId: "parent-100",
      parentSelfReportScore0to100: 90,
      observations: [
        {
          informantRole: "contact_supervisor",
          informantName: "Supervisor A",
          observedDomain: "Handover Warmth",
          rating0to100: 55,
          behavioralObservationNotes: "Parent appeared tense at handover.",
        },
      ],
    });
    expect(portal.convergenceBand).toBe("critical_multi_informant_discrepancy");
    expect(portal.contradictionAlerts.length).toBe(1);

    const prescriptions = prescribeAdaptiveMicroLessonsAndReTests({
      participantUserId: "parent-100",
      flaggedDomains: [
        {
          domainKey: "co_regulation_under_stress",
          triggerSource: "Stress Roleplay",
          currentScore0to100: 55,
        },
        {
          domainKey: "biff_co_parenting_boundaries",
          triggerSource: "BIFF Bridge",
          currentScore0to100: 60,
        },
      ],
    });
    expect(prescriptions.prescriptions).toHaveLength(2);

    const threeHousesSafe = evaluateChildThreeHousesAndSafetyHand({
      childUserId: "child-1",
      ageBand: "9-12",
      houseOfGoodThings: ["Playing with my dog"],
      houseOfWorries: ["Homework"],
      houseOfDreams: ["Calm dinners"],
      fiveFingerTrustedAdults: ["Grandma", "Teacher", "Aunty", "Caseworker"],
      worryMonsterIntensity0to10: 3,
    });
    expect(threeHousesSafe.crisisHalted).toBe(false);
    expect(threeHousesSafe.safetyNetworkComplete).toBe(true);

    const threeHousesCrisis = evaluateChildThreeHousesAndSafetyHand({
      childUserId: "child-1",
      ageBand: "9-12",
      houseOfGoodThings: ["My dog"],
      houseOfWorries: ["Someone is hurting me at home and I am scared"],
      houseOfDreams: ["Being safe"],
      fiveFingerTrustedAdults: ["Grandma"],
      worryMonsterIntensity0to10: 9,
    });
    expect(threeHousesCrisis.crisisHalted).toBe(true);
    expect(threeHousesCrisis.safetyTier).toBe("tier_1_immediate");
  });
});
