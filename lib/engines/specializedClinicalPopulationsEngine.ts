import {
  computeAuditSha256,
  sanitizeAiOutputAgainstSafetyPolicy,
} from "./aiSupportCoachEngine";

// ============================================================================
// MODULE 5: 24/7 ADDICTION URGE-SURFING, HIGH-RISK CALENDAR & MAT SHIELD
// ============================================================================

export type HaltSTrigger =
  | "hungry_or_dehydrated"
  | "angry_or_resentful"
  | "lonely_or_isolated"
  | "tired_or_sleep_deprived"
  | "stressed_court_or_contact_worry"
  | "payday_or_cash_availability"
  | "sensory_or_household_overload";

export interface AddictionRecoveryShieldInput {
  participantUserId: string;
  caseId?: string;
  cravingBefore0to10: number;
  cravingAfter0to10: number;
  urgeSurfSecondsCompleted: number;
  haltSTriggers: HaltSTrigger[];
  upcomingHighRiskEvent?: string;
  matAdherenceChecked: boolean;
  lapseOccurred: boolean;
  childSafeCareArranged: boolean;
}

export interface AddictionRecoveryShieldResult {
  cravingDelta: number;
  urgeWaveSurfedSuccessfully: boolean;
  riskTier: "steady_green" | "elevated_amber" | "high_craving_orange" | "immediate_child_safety_first_red";
  ninetySecondWaveCoachScript: string;
  matRoutineReminder: string;
  nonPunitiveLapseResetPlan: {
    step1ChildSafetyFirst: string;
    step2HaltShameSpiral: string;
    step3IdentifyTriggerChain: string;
    step4ReEngageSupportWithin24h: string;
  };
  highRiskCalendarShieldNote: string;
  auditSha256: string;
}

export function runAddictionRecoveryShield(
  input: AddictionRecoveryShieldInput,
): AddictionRecoveryShieldResult {
  const before = Math.max(0, Math.min(10, Math.round(input.cravingBefore0to10)));
  const after = Math.max(0, Math.min(10, Math.round(input.cravingAfter0to10)));
  const cravingDelta = after - before;
  const urgeWaveSurfedSuccessfully = input.urgeSurfSecondsCompleted >= 60 && after <= before;

  let riskTier: AddictionRecoveryShieldResult["riskTier"] = "steady_green";
  if (input.lapseOccurred && !input.childSafeCareArranged) {
    riskTier = "immediate_child_safety_first_red";
  } else if (after >= 7 || input.lapseOccurred) {
    riskTier = "high_craving_orange";
  } else if (after >= 4 || input.haltSTriggers.length >= 3) {
    riskTier = "elevated_amber";
  }

  const ninetySecondWaveCoachScript =
    "A craving wave peaks like an ocean wave and begins to crest within 90 to 180 seconds if not fed. Notice where the urge sits in your jaw, chest, or stomach, breathe in for 4 seconds and out for 6 seconds, and ride the wave without acting for the next 90 seconds.";

  const matRoutineReminder = input.matAdherenceChecked
    ? "MAT / pharmacotherapy routine confirmed for today. Keep all medications in a locked child-resistant safe box."
    : "Reminder: Take prescribed MAT / recovery medication on schedule and store securely in a locked child-safe container.";

  const nonPunitiveLapseResetPlan = {
    step1ChildSafetyFirst: input.childSafeCareArranged
      ? "Protective Priority Confirmed: Sober, safe adult care is in place for the children."
      : "IMMEDIATE PRIORITY: Call your pre-arranged safe sober support person or kinship contact right now to care for the children before anything else.",
    step2HaltShameSpiral:
      "A lapse or craving spike is a clinical signal to adjust your recovery shield—not a moral failure. Interrupt the 'abstinence violation effect' immediately by hydrating and moving to a safe room.",
    step3IdentifyTriggerChain:
      input.haltSTriggers.length > 0
        ? `Active HALT+S triggers identified: ${input.haltSTriggers.join(", ")}. Address physical hunger, sleep debt, and isolation first.`
        : "Log the sensory, emotional, or environmental cue that preceded the urge within 10 minutes.",
    step4ReEngageSupportWithin24h:
      "Contact your AOD worker, peer recovery mentor, or National Alcohol & Other Drug Hotline (1800 250 015) within the next 2 hours.",
  };

  const highRiskCalendarShieldNote = input.upcomingHighRiskEvent
    ? `High-Risk Event Shield ('${sanitizeAiOutputAgainstSafetyPolicy(input.upcomingHighRiskEvent).sanitizedText}'): Pre-book a check-in call before and after the event, avoid carrying excess cash, and plan an early exit route.`
    : "No acute calendar event flagged; maintain daily HALT+S evening check-in.";

  const auditSha256 = computeAuditSha256(
    JSON.stringify({
      participantUserId: input.participantUserId,
      before,
      after,
      riskTier,
      lapseOccurred: input.lapseOccurred,
    }),
  );

  return {
    cravingDelta,
    urgeWaveSurfedSuccessfully,
    riskTier,
    ninetySecondWaveCoachScript,
    matRoutineReminder,
    nonPunitiveLapseResetPlan,
    highRiskCalendarShieldNote,
    auditSha256,
  };
}

// ============================================================================
// MODULE 6: CHILD TRAUMA SLEEP/NIGHTMARE COACH & NEURODIVERGENT LOW-AROUSAL TOOLKIT
// ============================================================================

export type NeurodivergentProfileTrait =
  | "autism_sensory_predictability"
  | "adhd_dopamine_and_transition_scaffolding"
  | "fasd_concrete_visual_single_step"
  | "parent_abi_or_idd_plain_language_chunking"
  | "child_complex_trauma_hypervigilance";

export type SleepDistressSignal =
  | "bedtime_hyperarousal_or_stall_tactics"
  | "nightmares_or_night_terrors"
  | "fear_of_dark_or_hypervigilance_to_house_noises"
  | "sensory_pyjama_or_bedding_overload";

export interface NeuroSleepHouseholdInput {
  participantUserId: string;
  caseId?: string;
  neurodivergentTraits: NeurodivergentProfileTrait[];
  sensoryTriggers: string[];
  sleepDistressSignals: SleepDistressSignal[];
}

export interface NeuroSleepHouseholdResult {
  lowArousalPrinciples: string[];
  bedtimeCoRegulationScript: string;
  nightmareAwakeningProtocol: string;
  chunkedVisualSchedule: {
    stepNumber: number;
    iconLabel: string;
    plainLanguageInstruction: string;
    sensoryAccommodation: string;
  }[];
  evaluatorAccommodationFlag: string;
  auditSha256: string;
}

export function buildNeuroSleepHouseholdToolkit(
  input: NeuroSleepHouseholdInput,
): NeuroSleepHouseholdResult {
  const lowArousalPrinciples: string[] = [
    "Lower voice volume, slow body movements, and reduce overhead fluorescent lighting 45 minutes before transitions.",
    "Give 1 concrete instruction at a time (wait 10 seconds for processing before repeating).",
  ];

  if (input.neurodivergentTraits.includes("fasd_concrete_visual_single_step")) {
    lowArousalPrinciples.push(
      "FASD Brain-Based Scaffolding: Frame difficulty as 'brain-based processing difference, not wilful defiance'. Use visual icons and consistent daily anchors.",
    );
  }
  if (input.neurodivergentTraits.includes("parent_abi_or_idd_plain_language_chunking")) {
    lowArousalPrinciples.push(
      "Parent ABI/IDD Accommodation: All coaching steps use Easy-Read 3-step cards with zero multi-clause jargon.",
    );
  }

  const bedtimeCoRegulationScript =
    "\"It's safe to rest now. The doors are locked, the hallway nightlight is on, and I am right in the next room checking on you every 10 minutes until you're asleep.\"";

  const nightmareAwakeningProtocol =
    "1. Ground in the Present: Use a soft, steady voice—'You had a scary dream, and now you are awake in your safe bed with me.' 2. Sensory Anchor: Offer a sip of water, a cool cloth, or a weighted/heavy blanket. 3. Avoid Detailed Retelling at 2 AM: Reassure safety first so the nervous system returns to ventral-vagal rest.";

  const chunkedVisualSchedule = [
    {
      stepNumber: 1,
      iconLabel: "Warm Wash & Comfy Clothes",
      plainLanguageInstruction: "Warm bath or face wash, then tag-free soft pyjamas.",
      sensoryAccommodation: "Dim lights and avoid scratchy seams or loud bathroom fans.",
    },
    {
      stepNumber: 2,
      iconLabel: "Calm Snack & Quiet Story",
      plainLanguageInstruction: "Warm milk/water and 1 predictable picture book or audio story.",
      sensoryAccommodation: "No screens or loud arguments within 60 minutes of sleep.",
    },
    {
      stepNumber: 3,
      iconLabel: "Nightlight & Safety Check",
      plainLanguageInstruction: "Turn on amber nightlight, 3 slow belly breaths together, and 10-minute check-in promise.",
      sensoryAccommodation: "White noise or gentle fan to mask sudden street/house sounds.",
    },
  ];

  const evaluatorAccommodationFlag =
    "Engine 7 Neurodiversity Fairness Active: Do not penalise flat affect, literal phrasing, or sensory pacing pauses during parenting evaluations.";

  const auditSha256 = computeAuditSha256(
    JSON.stringify({
      participantUserId: input.participantUserId,
      traits: input.neurodivergentTraits,
      sleepSignals: input.sleepDistressSignals,
    }),
  );

  return {
    lowArousalPrinciples,
    bedtimeCoRegulationScript,
    nightmareAwakeningProtocol,
    chunkedVisualSchedule,
    evaluatorAccommodationFlag,
    auditSha256,
  };
}

// ============================================================================
// MODULE 7: KINSHIP, FOSTER & GRANDPARENT CARER SECONDARY TRAUMA (ProQOL) & CONTACT COACH
// ============================================================================

export type CarerRoleType =
  | "kinship_grandparent"
  | "kinship_relative"
  | "foster_carer"
  | "kith_and_kin";

export interface KinshipCarerSupportInput {
  carerUserId: string;
  caseId?: string;
  carerType: CarerRoleType;
  compassionSatisfaction0to50: number;
  burnout0to50: number;
  secondaryTraumaticStress0to50: number;
  birthParentContactTensionSummary?: string;
}

export interface KinshipCarerSupportResult {
  carerType: CarerRoleType;
  placementStabilityBand:
    | "strong_sustainable_green"
    | "moderate_strain_respite_recommended_amber"
    | "high_burnout_or_sts_urgent_support_red";
  proQolInterpretation: string;
  birthParentBoundaryScript: string;
  respiteAndSupportRecommendations: string[];
  auditSha256: string;
}

export function evaluateKinshipCarerSupport(
  input: KinshipCarerSupportInput,
): KinshipCarerSupportResult {
  const cs = Math.max(0, Math.min(50, Math.round(input.compassionSatisfaction0to50)));
  const burnout = Math.max(0, Math.min(50, Math.round(input.burnout0to50)));
  const sts = Math.max(0, Math.min(50, Math.round(input.secondaryTraumaticStress0to50)));

  let placementStabilityBand: KinshipCarerSupportResult["placementStabilityBand"] =
    "strong_sustainable_green";
  if (burnout >= 35 || sts >= 35) {
    placementStabilityBand = "high_burnout_or_sts_urgent_support_red";
  } else if (burnout >= 23 || sts >= 23 || cs < 25) {
    placementStabilityBand = "moderate_strain_respite_recommended_amber";
  }

  const proQolInterpretation =
    placementStabilityBand === "high_burnout_or_sts_urgent_support_red"
      ? `Elevated Secondary Traumatic Stress (${sts}/50) or Burnout (${burnout}/50) detected. Caring for a traumatised child while navigating family loyalty binds carries heavy emotional load—immediate carer respite and dedicated kinship worker check-in recommended.`
      : placementStabilityBand === "moderate_strain_respite_recommended_amber"
        ? `Moderate carer fatigue (${burnout}/50) alongside Compassion Satisfaction (${cs}/50). Schedule planned respite and peer kinship support group connection.`
        : `High Compassion Satisfaction (${cs}/50) and sustainable carer regulation (${burnout}/50).`;

  const birthParentBoundaryScript =
    "\"I want [Child's Name] to have a safe, settled visit today. Let's keep our handover focused strictly on their school week and routine, and any case or court questions can go directly through the caseworker.\"";

  const respiteAndSupportRecommendations = [
    "Protect child emotional safety by never speaking negatively about birth parents within the child's hearing, even when adult family tension is high.",
    "Use the Caseworker Communication Channel to relay logistics if direct birth-parent text messages become pressured or hostile.",
    placementStabilityBand !== "strong_sustainable_green"
      ? "Request a Kinship Carer Respite & Practical brokerage review with your agency support worker this week."
      : "Continue weekly self-care and post-contact settling routines.",
  ].map((r) => sanitizeAiOutputAgainstSafetyPolicy(r).sanitizedText);

  const auditSha256 = computeAuditSha256(
    JSON.stringify({
      carerUserId: input.carerUserId,
      carerType: input.carerType,
      cs,
      burnout,
      sts,
      placementStabilityBand,
    }),
  );

  return {
    carerType: input.carerType,
    placementStabilityBand,
    proQolInterpretation,
    birthParentBoundaryScript,
    respiteAndSupportRecommendations,
    auditSha256,
  };
}

// ============================================================================
// MODULE 8: FIRST NATIONS CULTURAL SEWB 7-DOMAIN YARNING MAP & CULTURAL WORKER CO-SIGN
// ============================================================================

export interface CulturalSewbYarningInput {
  participantUserId: string;
  caseId?: string;
  domainBody: string;
  domainMindEmotions: string;
  domainFamilyKinship: string;
  domainCommunity: string;
  domainCulture: string;
  domainCountry: string;
  domainSpiritAncestors: string;
  culturalWorkerCoSigned?: boolean;
  culturalWorkerName?: string;
}

export interface CulturalSewbYarningResult {
  domainsPopulatedCount: number;
  sewbVitalityScore0to100: number;
  culturalStrengthsWeave: string[];
  antiBiasKinshipGuardrailNotes: string[];
  culturalWorkerCoSigned: boolean;
  culturalWorkerName: string | null;
  culturalWorkerSignedAtIso: string | null;
  auditSha256: string;
}

export function buildFirstNationsSewbYarningMap(
  input: CulturalSewbYarningInput,
): CulturalSewbYarningResult {
  const domains = [
    { label: "Connection to Body & Physical Wellbeing", value: input.domainBody },
    { label: "Connection to Mind & Emotions", value: input.domainMindEmotions },
    { label: "Connection to Family & Kinship", value: input.domainFamilyKinship },
    { label: "Connection to Community", value: input.domainCommunity },
    { label: "Connection to Culture & Ceremony", value: input.domainCulture },
    { label: "Connection to Country & Land", value: input.domainCountry },
    { label: "Connection to Spirit, Spirituality & Ancestors", value: input.domainSpiritAncestors },
  ];

  const populated = domains.filter((d) => d.value && d.value.trim().length > 0);
  const sewbVitalityScore0to100 = Math.min(
    100,
    Math.round((populated.length / 7) * 85 + (input.culturalWorkerCoSigned ? 15 : 0)),
  );

  const culturalStrengthsWeave = populated.map(
    (d) =>
      `${d.label}: ${sanitizeAiOutputAgainstSafetyPolicy(d.value.trim()).sanitizedText}`,
  );

  const antiBiasKinshipGuardrailNotes = [
    "Engine 8 Cultural Anti-Bias Mandate: Shared caring across Aunties, Uncles, Grandparents, and extended Kinship networks is a recognized cultural protective factor—never misclassify collective kinship caregiving as 'diffused parental responsibility' or 'instability'.",
    "Yarning-style narrative storytelling and circular reflection must be scored with equal validity to linear Western clinical self-report.",
    "Ensure an Aboriginal and Torres Strait Islander Family Led Decision Making (AFLDM) convenor or Cultural Worker is offered before any care-plan milestone.",
  ];

  const signedAtIso = input.culturalWorkerCoSigned ? new Date().toISOString() : null;
  const auditSha256 = computeAuditSha256(
    JSON.stringify({
      participantUserId: input.participantUserId,
      domainsPopulatedCount: populated.length,
      culturalWorkerCoSigned: Boolean(input.culturalWorkerCoSigned),
    }),
  );

  return {
    domainsPopulatedCount: populated.length,
    sewbVitalityScore0to100,
    culturalStrengthsWeave,
    antiBiasKinshipGuardrailNotes,
    culturalWorkerCoSigned: Boolean(input.culturalWorkerCoSigned),
    culturalWorkerName: input.culturalWorkerName?.trim() || null,
    culturalWorkerSignedAtIso: signedAtIso,
    auditSha256,
  };
}
