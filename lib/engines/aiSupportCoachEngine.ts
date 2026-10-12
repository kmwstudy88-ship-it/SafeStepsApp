import {
  AUSTRALIAN_CRISIS_RESOURCES,
  CLINICAL_PATHWAY_PROTOCOLS,
  EMA_MICRO_PULSES,
  FOUR_STAGE_COUPLES_DFV_RESTORATION_PATHWAY,
  SITUATIONAL_JUDGEMENT_VIGNETTES,
  SOMATIC_BODY_MAP_ZONES,
  STRESS_ROLEPLAY_SCENARIOS,
  TEACH_BACK_CHALLENGES,
  type ClinicalPathwayId,
  type CouplesRestorationStageId,
  type InteractionFormId,
  type WindowOfToleranceState,
} from "../data/therapeuticCoachingProtocols";

export type CoachPersonaMode =
  | "child_support_coach"
  | "parent_support_coach"
  | "couples_dfv_restoration_coach"
  | "family_repair_coach"
  | "dfv_safety_coach"
  | "dfv_accountability_coach"
  | "addiction_recovery_coach"
  | "mental_health_stabilisation_coach"
  | "perinatal_infant_coach"
  | "neurodiversity_executive_scaffold_coach"
  | "cultural_sewb_coach"
  | "ai_psychologist_formulation"
  | "ai_longitudinal_evaluator";

export type AccessibilityMode =
  | "standard"
  | "easy_read"
  | "low_stimulation"
  | "audio_first"
  | "cultural_yarning";

export type SafetyTier =
  | "tier_1_immediate"
  | "tier_2_clinical_review"
  | "tier_3_supportive";

export type SafetyRiskDomain =
  | "child_abuse_disclosure"
  | "dfv_strangulation_or_weapons"
  | "dfv_coercive_control_or_fear"
  | "suicide_or_self_harm"
  | "perinatal_infant_harm_risk"
  | "acute_intoxication_sole_carer"
  | "avith_household_danger"
  | "relapse_craving_spike"
  | "severe_sleep_exhaustion";

export type PrePostSafetyEvaluation = {
  safeToProceed: boolean;
  safetyGateTriggered: boolean;
  safetyTier: SafetyTier | null;
  detectedDomains: SafetyRiskDomain[];
  redactedText: string;
  haltReason?: string;
  emergencyResponseMessage?: string;
  emergencyResources: typeof AUSTRALIAN_CRISIS_RESOURCES;
  policyViolationsCorrected: string[];
  auditSha256: string;
};

export type CouplesDfvSafetyCheckInput = {
  sessionId: string;
  participantUserId: string;
  checkPhase: "pre_session" | "mid_session_pulse" | "post_session";
  feltSafetyScore: number; // 0 to 10
  fearOfRetaliation: boolean;
  coercedToParticipate: boolean;
  immediateDanger: boolean;
  strangulationOrWeaponHistory?: boolean;
  clinicianClearedConjoint?: boolean;
  privateNotes?: string;
};

export type CouplesDfvSafetyCheckResult = {
  checkPhase: "pre_session" | "mid_session_pulse" | "post_session";
  feltSafetyScore: number;
  silentPivotTriggered: boolean;
  recommendedMode:
    | "proceed_conjoint"
    | "parallel_safe"
    | "individual_stabilisation_only"
    | "tier1_crisis_halt";
  permittedStage: CouplesRestorationStageId;
  partnerFacingNeutralNotice: string;
  privateSurvivorSupportMessage: string;
  clinicianAlertRequired: boolean;
  redactedPrivateNotes: string;
  auditSha256: string;
};

export type SafePartnerMessageBridgeResult = {
  originalDraftRedacted: string;
  containsCoerciveOrHostileLanguage: boolean;
  containsChildTriangulation: boolean;
  detectedToneFlags: string[];
  biffRewrittenMessage: string;
  coachingFeedback: string[];
  safeToSend: boolean;
  auditSha256: string;
};

export type SharedTimeOutContract = {
  contractId: string;
  earlyBodySignals: string[];
  agreedCodeWord: string;
  exitProtocol: string[];
  coolingDurationMinutes: number;
  childReassuranceScript: string;
  reconnectionProtocol: string[];
  prohibitedBehaviours: string[];
  auditSha256: string;
};

export type EarlyWarningRadarInput = {
  sleepHoursLastNight: number;
  cravingIntensity0to10: number;
  householdTension0to10: number;
  upcomingOrRecentContactVisit: boolean;
  sensoryOverload0to10: number;
  missedProtectiveRoutineDays: number;
};

export type EarlyWarningRadarResult = {
  riskLevel: "low_steady" | "elevated_yellow" | "high_orange_intervene" | "critical_red";
  compositeVulnerabilityScore: number;
  activeTriggers: string[];
  proactiveSixtySecondReset: string;
  recommendedForm: InteractionFormId;
  recommendedPathway: ClinicalPathwayId;
};

export type SupportCoachTurnInput = {
  sessionId?: string;
  participantUserId?: string;
  personaMode: CoachPersonaMode;
  clinicalPathway: ClinicalPathwayId;
  interactionForm: InteractionFormId;
  userMessage: string;
  childAgeBand?: "5-8" | "9-12" | "13-17";
  accessibilityMode?: AccessibilityMode;
  windowOfTolerance?: WindowOfToleranceState;
  couplesRestorationStage?: CouplesRestorationStageId;
  sjtVignetteId?: string;
  sjtSelectedOptionId?: string;
  roleplayScenarioId?: string;
  teachBackChallengeId?: string;
  somaticZoneId?: string;
  emaPulseId?: string;
  emaSelectedValue?: number;
  confidenceOverride?: number;
};

export type SupportCoachTurnOutput = {
  sessionId: string;
  personaMode: CoachPersonaMode;
  clinicalPathway: ClinicalPathwayId;
  interactionForm: InteractionFormId;
  assistantMessage: string;
  uncertaintyDisclosure: string | null;
  confidenceScore: number;
  windowOfToleranceDetected: WindowOfToleranceState;
  safetyEvaluation: PrePostSafetyEvaluation;
  reflectiveFunctioningScore: number;
  antiGamingAuthenticityScore: number;
  microSkillActionSteps: string[];
  followUpPrompt: string;
  biffBridgeResult?: SafePartnerMessageBridgeResult;
  timeOutContract?: SharedTimeOutContract;
  providerTierUsed: "tier1_gemini" | "tier2_openai" | "tier3_deterministic_local";
  auditSha256: string;
  createdAt: string;
};

/**
 * Pure, deterministic SHA-256-compatible 64-character hex digest that runs synchronously
 * across React Native (Hermes), Web, and Node without requiring async SubtleCrypto.
 */
export function computeAuditSha256(payload: string): string {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const utf8 = unescape(encodeURIComponent(payload));
  const words: number[] = [];
  for (let i = 0; i < utf8.length; i++) {
    words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  const bitLength = utf8.length * 8;
  words[bitLength >> 5] |= 0x80 << (24 - (bitLength % 32));
  words[(((bitLength + 64) >> 9) << 4) + 15] = bitLength;

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Array<number>(64);
  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t++) {
      w[t] = words[i + t] | 0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + w[t]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => (v >>> 0).toString(16).padStart(8, "0"))
    .join("");
}

export function redactSensitivePii(text: string): string {
  return String(text ?? "")
    .replace(/\b(?:\+?61|0)[2-478](?:[ -]?\d){8}\b/g, "[REDACTED_PHONE]")
    .replace(/\b\d{4}[ -]?\d{5}[ -]?\d{1}\b/g, "[REDACTED_MEDICARE]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .replace(
      /\b\d{1,5}\s+[A-Za-z0-9.\s]{2,25}\s(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|Place|Pl|Lane|Ln)\b/gi,
      "[REDACTED_ADDRESS]",
    );
}

/**
 * Enforces `policies/safety_policy.md`:
 * - Strips diagnostic labels ("This child has...", "This parent is...", "You have borderline/narcissistic...")
 * - Strips legal advice/predictions ("The court should/will...", "You will win/lose custody")
 * - Strips definitive abuse adjudications ("This is/is not abuse")
 */
export function sanitizeAiOutputAgainstSafetyPolicy(rawText: string): {
  sanitizedText: string;
  violationsCorrected: string[];
} {
  let sanitized = String(rawText ?? "");
  const violationsCorrected: string[] = [];

  const rules: { pattern: RegExp; replacement: string; reason: string }[] = [
    {
      pattern: /\bthis child has\b/gi,
      replacement: "the child may be experiencing",
      reason: "Replaced diagnostic phrasing ('This child has...') per safety_policy.md",
    },
    {
      pattern: /\bthis parent is\b/gi,
      replacement: "the caregiver's current responses suggest",
      reason: "Replaced characterological label ('This parent is...') per safety_policy.md",
    },
    {
      pattern: /\bthe court (?:should|will)\b/gi,
      replacement: "a qualified legal representative or court may consider how to",
      reason: "Replaced legal prediction ('The court should/will...') per safety_policy.md",
    },
    {
      pattern: /\bthis (?:is|is not) abuse\b/gi,
      replacement: "these safety observations require structured practitioner review",
      reason: "Replaced legal/forensic conclusion ('This is/is not abuse') per safety_policy.md",
    },
    {
      pattern: /\byou have (?:borderline|narcissistic|bipolar|ptsd|adhd|autism|depression)\b/gi,
      replacement: "you are describing experiences that can be explored with a qualified clinician",
      reason: "Replaced direct clinical diagnosis statement per safety_policy.md",
    },
  ];

  for (const rule of rules) {
    if (rule.pattern.test(sanitized)) {
      sanitized = sanitized.replace(rule.pattern, rule.replacement);
      violationsCorrected.push(rule.reason);
    }
  }

  return { sanitizedText: sanitized, violationsCorrected };
}

export function buildUncertaintyDisclosure(confidenceScore: number): string | null {
  if (confidenceScore < 0.2) {
    return "Uncertain — do not rely on this output; consult a supervisor.";
  }
  if (confidenceScore < 0.5) {
    return "Low-confidence output — verify with primary records before acting.";
  }
  return null;
}

const TIER_1_PATTERNS: { domain: SafetyRiskDomain; regex: RegExp; label: string }[] = [
  {
    domain: "child_abuse_disclosure",
    regex:
      /\b(?:hit(?:ting)? the (?:child|kids|baby)|shake(?:n|s)? the baby|hurt(?:ing)? my (?:child|baby|kid)|someone touched me|hurting me at home|burn(?:ed|ing) the child|locked the child)\b/i,
    label: "Child harm or abuse disclosure indicator detected",
  },
  {
    domain: "dfv_strangulation_or_weapons",
    regex:
      /\b(?:chok(?:ed|ing)|strangl(?:ed|ing)|hands around (?:my|her|his) neck|gun|knife|threatened to kill|going to kill|burn the house)\b/i,
    label: "High-lethality DFV indicator (strangulation, weapon, or threat to kill) detected",
  },
  {
    domain: "suicide_or_self_harm",
    regex:
      /\b(?:kill myself|end my life|want to die|better off dead|suicide|suicidal|overdose|cut myself|hurt myself)\b/i,
    label: "Acute suicide or self-harm indicator detected",
  },
  {
    domain: "perinatal_infant_harm_risk",
    regex:
      /\b(?:afraid i(?:'ll| will) hurt the baby|shake the crying baby|can't stop the baby crying and might snap)\b/i,
    label: "Acute perinatal infant safety risk detected",
  },
  {
    domain: "acute_intoxication_sole_carer",
    regex:
      /\b(?:passed out drunk with the kids|using ice with the kids here|no sober adult here|overdosing right now)\b/i,
    label: "Acute intoxication or overdose while caring for children detected",
  },
];

const TIER_2_PATTERNS: { domain: SafetyRiskDomain; regex: RegExp; label: string }[] = [
  {
    domain: "dfv_coercive_control_or_fear",
    regex:
      /\b(?:walking on eggshells|scared of what (?:he|she|they) will do|checks my phone|tracks my location|won't let me leave|afraid to go home|retaliat(?:e|ion))\b/i,
    label: "Coercive control or fear of partner retaliation detected",
  },
  {
    domain: "avith_household_danger",
    regex:
      /\b(?:smashing walls|throwing furniture|locked ourselves in the bedroom|scared of our teen)\b/i,
    label: "Household physical safety escalation (AVITH / property violence) detected",
  },
  {
    domain: "relapse_craving_spike",
    regex:
      /\b(?:about to relapse|craving is 10 out of 10|dealer texted|drinking again|used last night)\b/i,
    label: "Acute AOD craving spike or lapse indicator detected",
  },
  {
    domain: "severe_sleep_exhaustion",
    regex:
      /\b(?:haven't slept in 3 days|hallucinating from no sleep|completely dissociating)\b/i,
    label: "Severe sleep deprivation or dissociation risk detected",
  },
];

export function evaluatePreAndPostSafetyGate(
  userText: string,
  personaMode: CoachPersonaMode = "parent_support_coach",
): PrePostSafetyEvaluation {
  const redactedText = redactSensitivePii(userText);
  const detectedDomains: SafetyRiskDomain[] = [];
  const triggerLabels: string[] = [];

  for (const rule of TIER_1_PATTERNS) {
    if (rule.regex.test(redactedText)) {
      detectedDomains.push(rule.domain);
      triggerLabels.push(rule.label);
    }
  }

  if (detectedDomains.length > 0) {
    const isChild = personaMode === "child_support_coach";
    const emergencyResponseMessage = isChild
      ? "Thank you for being so brave and telling me. What happened is NEVER your fault. Because your safety is the most important thing in the world, I am pausing our chat right now so a safe protective helper can support you straight away. You can also call Kids Helpline free on 1800 55 1800 or Emergency 000."
      : "SAFETY PAUSE & IMMEDIATE SUPPORT: What you just shared involves immediate safety. In line with SafeSteps Safety Policy, automated coaching is paused right now so you can connect with immediate human safety support. If you or your children are in immediate danger, please call 000 now. For 24/7 confidential support: 1800RESPECT (1800 737 732), Lifeline (13 11 14), or 13YARN (13 92 76). If a baby is crying and you feel overwhelmed, place baby safely on their back in the cot and step outside the room to breathe.";

    return {
      safeToProceed: false,
      safetyGateTriggered: true,
      safetyTier: "tier_1_immediate",
      detectedDomains,
      redactedText,
      haltReason: triggerLabels.join("; "),
      emergencyResponseMessage,
      emergencyResources: AUSTRALIAN_CRISIS_RESOURCES,
      policyViolationsCorrected: [],
      auditSha256: computeAuditSha256(`tier1:${personaMode}:${redactedText}`),
    };
  }

  for (const rule of TIER_2_PATTERNS) {
    if (rule.regex.test(redactedText)) {
      detectedDomains.push(rule.domain);
      triggerLabels.push(rule.label);
    }
  }

  const safetyTier: SafetyTier | null =
    detectedDomains.length > 0 ? "tier_2_clinical_review" : null;

  return {
    safeToProceed: true,
    safetyGateTriggered: detectedDomains.length > 0,
    safetyTier,
    detectedDomains,
    redactedText,
    haltReason: triggerLabels.length > 0 ? triggerLabels.join("; ") : undefined,
    emergencyResources: AUSTRALIAN_CRISIS_RESOURCES,
    policyViolationsCorrected: [],
    auditSha256: computeAuditSha256(`precheck:${personaMode}:${redactedText}`),
  };
}

/**
 * Evaluates Private Pre/Mid/Post Couples & Family DFV Felt-Safety Check-Ins.
 * CRITICAL SAFETY GUARANTEE: If a partner reports fear, coercion, or felt safety < 7/10,
 * the session silently pivots to Parallel Safe Mode with a neutral system message so the
 * partner using violence is NEVER tipped off that the survivor flagged fear.
 */
export function evaluateCouplesDfvSafetyGate(
  input: CouplesDfvSafetyCheckInput,
): CouplesDfvSafetyCheckResult {
  const redactedPrivateNotes = redactSensitivePii(input.privateNotes ?? "");
  const clampedScore = Math.max(0, Math.min(10, Math.round(input.feltSafetyScore)));

  if (input.immediateDanger || input.strangulationOrWeaponHistory) {
    return {
      checkPhase: input.checkPhase,
      feltSafetyScore: clampedScore,
      silentPivotTriggered: true,
      recommendedMode: "tier1_crisis_halt",
      permittedStage: "stage_1_containment_individual",
      partnerFacingNeutralNotice:
        "Today's session is scheduled as an Individual Reflection & Skill Check-In module for each participant.",
      privateSurvivorSupportMessage:
        "Your private check-in is strictly confidential and never shown to your partner. Because high-risk safety indicators are present, conjoint coaching is locked and we have quietly switched to individual mode. Call 000 in an emergency or 1800RESPECT (1800 737 732) 24/7.",
      clinicianAlertRequired: true,
      redactedPrivateNotes,
      auditSha256: computeAuditSha256(
        `dfv_check:tier1:${input.sessionId}:${input.participantUserId}:${clampedScore}`,
      ),
    };
  }

  if (
    clampedScore < 7 ||
    input.fearOfRetaliation ||
    input.coercedToParticipate ||
    input.clinicianClearedConjoint === false
  ) {
    return {
      checkPhase: input.checkPhase,
      feltSafetyScore: clampedScore,
      silentPivotTriggered: true,
      recommendedMode: clampedScore <= 4 ? "individual_stabilisation_only" : "parallel_safe",
      permittedStage:
        clampedScore <= 4
          ? "stage_1_containment_individual"
          : "stage_2_parallel_synchronised",
      partnerFacingNeutralNotice:
        "Today's module is running in Parallel Individual Skill-Building Mode so each caregiver can complete their personal pace check-in.",
      privateSurvivorSupportMessage:
        "Thank you for answering honestly. Your response is 100% private and hidden from your partner. We have silently switched today's session to Parallel Safe Mode using a standard curriculum notice so there is zero risk of retaliation.",
      clinicianAlertRequired: true,
      redactedPrivateNotes,
      auditSha256: computeAuditSha256(
        `dfv_check:pivot:${input.sessionId}:${input.participantUserId}:${clampedScore}`,
      ),
    };
  }

  return {
    checkPhase: input.checkPhase,
    feltSafetyScore: clampedScore,
    silentPivotTriggered: false,
    recommendedMode: "proceed_conjoint",
    permittedStage: "stage_3_conjoint_safety_gated",
    partnerFacingNeutralNotice:
      "Both participants have completed their check-in. Stage 3 Safety-Gated Restoration Coaching is active.",
    privateSurvivorSupportMessage:
      "Your private felt-safety check-in (score " +
      clampedScore +
      "/10) is recorded. Remember: you can tap 'Pause / Individual Mode' at any second and the app will smoothly switch to a routine individual activity.",
    clinicianAlertRequired: false,
    redactedPrivateNotes,
    auditSha256: computeAuditSha256(
      `dfv_check:ok:${input.sessionId}:${input.participantUserId}:${clampedScore}`,
    ),
  };
}

/**
 * AI-Bridged Safe Partner Message Coach (BIFF: Brief, Informative, Friendly, Firm).
 * Screens out coercive control, surveillance, blame, insults, and child triangulation.
 */
export function rewritePartnerMessageToBiff(
  rawDraft: string,
  childTopic = "the children's routine and handover",
): SafePartnerMessageBridgeResult {
  const redacted = redactSensitivePii(rawDraft);
  const detectedToneFlags: string[] = [];

  const blameOrHostileRegex =
    /\b(?:you always|you never|your fault|useless|pathetic|liar|crazy|psycho|disgusting|you ruin)\b/i;
  const coerciveOrSurveillanceRegex =
    /\b(?:where are you|who are you with|send me a photo|answer me right now|or else|you better|prove it)\b/i;
  const childTriangulationRegex =
    /\b(?:tell the kids what you did|ask the kids|even the kids know|the kids hate|tell your mum|tell your dad)\b/i;

  const containsHostile = blameOrHostileRegex.test(redacted);
  const containsCoercive = coerciveOrSurveillanceRegex.test(redacted);
  const containsChildTriangulation = childTriangulationRegex.test(redacted);

  if (containsHostile) {
    detectedToneFlags.push("Blaming or character-attacking phrasing ('you always/never' or insults)");
  }
  if (containsCoercive) {
    detectedToneFlags.push("Surveillance, immediate response demand, or ultimatum phrasing");
  }
  if (containsChildTriangulation) {
    detectedToneFlags.push("Child triangulation (pulling children into adult conflict)");
  }

  const timeMatch = redacted.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i);
  const extractedTime = timeMatch ? timeMatch[1] : "the agreed time";

  const biffRewrittenMessage =
    detectedToneFlags.length === 0 && redacted.trim().length > 10
      ? redacted.trim()
      : `Hi, writing to confirm ${childTopic} for ${extractedTime}. Please let me know by 5:00 PM if that logistics plan works so we can keep things predictable for the kids. Thanks.`;

  const coachingFeedback: string[] = [
    "BIFF Rule 1 (Brief): Keep the message to 2–3 sentences focused only on practical child logistics.",
    "BIFF Rule 2 (Informative): Share clear times, locations, and routine facts — zero blame or history.",
    "BIFF Rule 3 (Friendly & Calm): Use a neutral, respectful greeting so the child's caregivers stay regulated.",
    "BIFF Rule 4 (Firm & Non-Coercive): Offer a clear, reasonable logistics question without ultimatums or surveillance.",
  ];

  if (containsChildTriangulation) {
    coachingFeedback.unshift(
      "Child Protection Alert: Never ask children to carry adult messages or reference children taking sides.",
    );
  }

  return {
    originalDraftRedacted: redacted,
    containsCoerciveOrHostileLanguage: containsHostile || containsCoercive,
    containsChildTriangulation,
    detectedToneFlags,
    biffRewrittenMessage,
    coachingFeedback,
    safeToSend: detectedToneFlags.length === 0,
    auditSha256: computeAuditSha256(`biff:${redacted}:${biffRewrittenMessage}`),
  };
}

export function buildSharedTimeOutContract(params?: {
  earlyBodySignals?: string[];
  agreedCodeWord?: string;
  coolingDurationMinutes?: number;
}): SharedTimeOutContract {
  const earlyBodySignals =
    params?.earlyBodySignals && params.earlyBodySignals.length > 0
      ? params.earlyBodySignals
      : [
          "Jaw tightening or voice volume rising above conversational level (3/10 tension)",
          "Heart racing, chest heat, or feeling defensive/misunderstood",
          "Repeating the same point or interrupting while children are nearby",
        ];

  const agreedCodeWord = params?.agreedCodeWord?.trim() || "Yellow Light — Taking 20 for the Kids";
  const coolingDurationMinutes = Math.max(20, Math.min(60, params?.coolingDurationMinutes ?? 20));

  const exitProtocol = [
    `State calmly: "${agreedCodeWord}. I want to stay respectful, so I am taking ${coolingDurationMinutes} minutes to cool down."`,
    "The other partner immediately pauses the conversation without following, blocking doorways, or demanding one last word.",
    "Step into a separate room or safe garden/porch space and practise 4-in / 6-out paced breathing.",
  ];

  const childReassuranceScript =
    "You are completely safe. Grown-ups are taking a quiet breather so we can talk calmly later. Nothing is your fault.";

  const reconnectionProtocol = [
    `Return after ${coolingDurationMinutes} minutes ONLY if body tension is back below 3/10.`,
    "If still escalated, send a brief neutral message: 'Still calming my body, let's talk tomorrow at 10 AM when the kids are at school.'",
    "When reconnecting, use 'I' statements and focus on one practical child-focused solution at a time.",
  ];

  const prohibitedBehaviours = [
    "NEVER block doorways, take keys/phones, or prevent someone from taking space",
    "NEVER follow a partner from room to room or send hostile texts during a Time-Out",
    "NEVER slam doors, throw objects, or involve the children in the disagreement",
  ];

  const contractPayload = JSON.stringify({
    earlyBodySignals,
    agreedCodeWord,
    coolingDurationMinutes,
    childReassuranceScript,
  });

  return {
    contractId: `timeout-${computeAuditSha256(contractPayload).slice(0, 10)}`,
    earlyBodySignals,
    agreedCodeWord,
    exitProtocol,
    coolingDurationMinutes,
    childReassuranceScript,
    reconnectionProtocol,
    prohibitedBehaviours,
    auditSha256: computeAuditSha256(contractPayload),
  };
}

export function evaluateEarlyWarningRadar(
  input: EarlyWarningRadarInput,
): EarlyWarningRadarResult {
  const activeTriggers: string[] = [];
  let score = 0;

  if (input.sleepHoursLastNight < 5) {
    score += 28;
    activeTriggers.push(`Severe sleep deficit (${input.sleepHoursLastNight}h last night)`);
  } else if (input.sleepHoursLastNight < 6.5) {
    score += 14;
    activeTriggers.push(`Broken sleep (${input.sleepHoursLastNight}h)`);
  }

  if (input.cravingIntensity0to10 >= 6) {
    score += 30;
    activeTriggers.push(`Elevated craving wave (${input.cravingIntensity0to10}/10)`);
  } else if (input.cravingIntensity0to10 >= 3) {
    score += 15;
    activeTriggers.push(`Moderate craving signal (${input.cravingIntensity0to10}/10)`);
  }

  if (input.householdTension0to10 >= 6) {
    score += 25;
    activeTriggers.push(`Elevated household/partner tension (${input.householdTension0to10}/10)`);
  }

  if (input.upcomingOrRecentContactVisit) {
    score += 15;
    activeTriggers.push("High-emotion contact visit transition window (pre/post visit grief)");
  }

  if (input.sensoryOverload0to10 >= 6) {
    score += 15;
    activeTriggers.push(`Household sensory overload (${input.sensoryOverload0to10}/10)`);
  }

  if (input.missedProtectiveRoutineDays >= 2) {
    score += 12;
    activeTriggers.push(`${input.missedProtectiveRoutineDays} days of disrupted protective routine`);
  }

  const compositeVulnerabilityScore = Math.min(100, score);
  const riskLevel: EarlyWarningRadarResult["riskLevel"] =
    compositeVulnerabilityScore >= 75
      ? "critical_red"
      : compositeVulnerabilityScore >= 50
        ? "high_orange_intervene"
        : compositeVulnerabilityScore >= 25
          ? "elevated_yellow"
          : "low_steady";

  const recommendedPathway: ClinicalPathwayId =
    input.cravingIntensity0to10 >= 5
      ? "addiction_mi_relapse_prevention"
      : input.householdTension0to10 >= 6
        ? "couples_dfv_restoration"
        : input.upcomingOrRecentContactVisit
          ? "grief_shame_resilience"
          : input.sensoryOverload0to10 >= 6
            ? "neurodiversity_abi_scaffolding"
            : "parent_co_regulation_cos";

  const recommendedForm: InteractionFormId =
    compositeVulnerabilityScore >= 50 ? "somatic_body_map" : "reflective_dialogue";

  const proactiveSixtySecondReset =
    compositeVulnerabilityScore >= 50
      ? "60-Second Preventive Reset: Your Early Warning Radar shows stacked stressors today (" +
        activeTriggers.join(", ") +
        "). Before handling the next transition, drink cold water, do 4 slow physiological sighs (4s in, 6s out), and switch to your Low-Demand Safe Parenting Menu."
      : "Your daily rhythm looks steady. Keep anchoring morning and bedtime connection moments.";

  return {
    riskLevel,
    compositeVulnerabilityScore,
    activeTriggers,
    proactiveSixtySecondReset,
    recommendedForm,
    recommendedPathway,
  };
}

export function scoreTurnReflectiveAndAuthenticity(userText: string): {
  reflectiveFunctioningScore: number;
  antiGamingAuthenticityScore: number;
  windowOfTolerance: WindowOfToleranceState;
} {
  const cleaned = String(userText ?? "").trim();
  const lower = cleaned.toLowerCase();

  // Detect Window of Tolerance
  let windowOfTolerance: WindowOfToleranceState = "regulated";
  if (/\b(?:furious|panicking|shaking|racing|can't breathe|screaming|exploding)\b/i.test(lower)) {
    windowOfTolerance = "hyper_aroused";
  } else if (/\b(?:numb|frozen|shut down|spaced out|empty|can't move|foggy)\b/i.test(lower)) {
    windowOfTolerance = "hypo_aroused";
  }

  // Reflective functioning indicators (child/partner mentalization, curiosity, ownership)
  let rfScore = 52;
  const mentalizingPatterns = [
    /\bmy (?:child|kid|son|daughter|baby) (?:felt|might have felt|needed|was scared|saw|heard)\b/i,
    /\bi realized|i noticed my (?:tone|body|jaw|voice)|i took a breath|i repaired|my responsibility\b/i,
    /\bthrough (?:their|his|her) eyes|underneath the behaviour|co-regulat|knelt|eye level|softened my voice|comforted|body felt safe/i,
  ];
  for (const pat of mentalizingPatterns) {
    if (pat.test(lower)) rfScore += 15;
  }

  // Pre-mentalizing / hostile attribution penalties
  const hostileAttributionPatterns = [
    /\b(?:manipulating me|doing it on purpose to wind me up|spoiled brat|she made me yell|he provoked me)\b/i,
    /\b(?:nothing is ever my fault|i am 100% perfect|never make mistakes)\b/i,
  ];
  for (const pat of hostileAttributionPatterns) {
    if (pat.test(lower)) rfScore -= 22;
  }

  // Authenticity / anti-gaming score (concrete episode specificity vs buzzword stuffing)
  let authScore = 58;
  if (cleaned.length >= 45) authScore += 12;
  if (/\b(?:morning|bedtime|dinner|school|kitchen|car|yesterday|today|minutes|breathed|said)\b/i.test(lower)) {
    authScore += 16;
  }
  if (/\b(?:mistake|hard|struggled|tired|learning|next time)\b/i.test(lower)) {
    authScore += 10; // Honest vulnerability vs fake perfection
  }
  if (/\b(?:i never get angry|everything is 100% perfect always)\b/i.test(lower)) {
    authScore -= 28;
  }

  return {
    reflectiveFunctioningScore: Math.max(10, Math.min(98, rfScore)),
    antiGamingAuthenticityScore: Math.max(10, Math.min(98, authScore)),
    windowOfTolerance,
  };
}

export function runSupportCoachTurn(input: SupportCoachTurnInput): SupportCoachTurnOutput {
  const sessionId = input.sessionId || `sess-${Date.now()}`;
  const accessibilityMode = input.accessibilityMode ?? "standard";
  const isEasyRead = accessibilityMode === "easy_read" || accessibilityMode === "low_stimulation";
  const preSafety = evaluatePreAndPostSafetyGate(input.userMessage, input.personaMode);

  if (!preSafety.safeToProceed) {
    return {
      sessionId,
      personaMode: input.personaMode,
      clinicalPathway: input.clinicalPathway,
      interactionForm: input.interactionForm,
      assistantMessage:
        preSafety.emergencyResponseMessage ??
        "Safety pause activated. Please contact 000 or 1800RESPECT (1800 737 732).",
      uncertaintyDisclosure: null,
      confidenceScore: 0.99,
      windowOfToleranceDetected: "crisis_override",
      safetyEvaluation: preSafety,
      reflectiveFunctioningScore: 50,
      antiGamingAuthenticityScore: 50,
      microSkillActionSteps: [
        "If anyone is in immediate physical danger, call 000 now.",
        "Move to a safe room or trusted location.",
        "Call 1800RESPECT (1800 737 732), Lifeline (13 11 14), Kids Helpline (1800 55 1800), or 13YARN (13 92 76).",
      ],
      followUpPrompt: "Are you and the children in a physically safe place right now?",
      providerTierUsed: "tier3_deterministic_local",
      auditSha256: preSafety.auditSha256,
      createdAt: new Date().toISOString(),
    };
  }

  const pathwayProtocol =
    CLINICAL_PATHWAY_PROTOCOLS.find((p) => p.id === input.clinicalPathway) ??
    CLINICAL_PATHWAY_PROTOCOLS[1];

  const turnMetrics = scoreTurnReflectiveAndAuthenticity(input.userMessage);
  const effectiveWindow = input.windowOfTolerance ?? turnMetrics.windowOfTolerance;

  let rawReply = "";
  let followUpPrompt = "";
  let biffBridgeResult: SafePartnerMessageBridgeResult | undefined;
  let timeOutContract: SharedTimeOutContract | undefined;

  // Handle specialized 10-Form modalities deterministically
  if (input.interactionForm === "sjt_vignette") {
    const vignette =
      SITUATIONAL_JUDGEMENT_VIGNETTES.find((v) => v.id === input.sjtVignetteId) ??
      SITUATIONAL_JUDGEMENT_VIGNETTES[0];
    const chosen =
      vignette.options.find((o) => o.id === input.sjtSelectedOptionId) ??
      vignette.options.find((o) => o.reflectiveFunctioningLevel === "protective_mentalizing") ??
      vignette.options[0];

    rawReply = `Situational Judgement Reflection (${vignette.title}): You explored "${chosen.responseText}". Clinical insight: ${chosen.clinicalRationale} Notice how pausing to soothe the child's nervous system first prevents adult escalation from spilling over.`;
    followUpPrompt =
      "If this exact moment happened at 7:45 PM tomorrow, what early body signal would remind you to pause first?";
  } else if (input.interactionForm === "stress_roleplay_simulator") {
    const scenario =
      STRESS_ROLEPLAY_SCENARIOS.find((s) => s.id === input.roleplayScenarioId) ??
      STRESS_ROLEPLAY_SCENARIOS[0];
    const hasOwnershipAndCalm =
      turnMetrics.reflectiveFunctioningScore >= 60 &&
      !/\b(?:shut up|your fault|stupid)\b/i.test(input.userMessage);

    rawReply = hasOwnershipAndCalm
      ? `Live Roleplay Feedback (${scenario.title}): Strong regulated response! You held your boundary calmly, named the need for safety/space without attacking, and kept the child's emotional security at the centre.`
      : `Live Roleplay Coaching (${scenario.title}): Under pressure, it is easy to get pulled into defending or counter-arguing. Let's rewind and try again using a calm 'I' statement, naming a 20-minute return time, and lifting all blame off the child.`;
    followUpPrompt = `Want to try one more round of "${scenario.title}" using your 6-second exhale first?`;
  } else if (input.interactionForm === "teach_back_perspective_switch") {
    const challenge =
      TEACH_BACK_CHALLENGES.find((c) => c.id === input.teachBackChallengeId) ??
      TEACH_BACK_CHALLENGES[0];
    const matchedKeywords = challenge.rubricKeywords.filter((kw) =>
      input.userMessage.toLowerCase().includes(kw),
    );
    rawReply =
      matchedKeywords.length >= 2
        ? `Perspective-Switch Synthesis (${challenge.title}): You stepped directly into that perspective with genuine warmth and specificity (key anchors noticed: ${matchedKeywords.join(", ")}). Holding your child's internal world in mind during stress is one of the strongest protective factors in parenting.`
        : `Perspective-Switch Coaching (${challenge.title}): Thank you for sharing that. Let's go one layer deeper into the sensory experience: From your child's eye level, what did your face, voice volume, and posture feel like to their body, and what helped them know they were safe?`;
    followUpPrompt = "What is one sentence you can say to your child today so they know grown-up stress is never their fault?";
  } else if (input.interactionForm === "somatic_body_map") {
    const zone =
      SOMATIC_BODY_MAP_ZONES.find((z) => z.id === input.somaticZoneId) ??
      SOMATIC_BODY_MAP_ZONES[0];
    rawReply = `Body-Map & Nervous System Reset (${zone.label}): Noticing ${zone.sensations.slice(0, 2).join(" and ")} early is a huge strength. ${zone.sixtySecondResetSkill}`;
    followUpPrompt = "After doing that 60-second reset, has your body tension shifted down by even 1 or 2 points?";
  } else if (input.interactionForm === "ema_micro_pulse") {
    const pulse =
      EMA_MICRO_PULSES.find((p) => p.id === input.emaPulseId) ?? EMA_MICRO_PULSES[0];
    const anchor =
      pulse.quickTapAnchors.find((a) => a.value === input.emaSelectedValue) ??
      pulse.quickTapAnchors[2];
    rawReply = `15-Second Pulse Logged (${pulse.title} — ${anchor.emoji} ${anchor.label}): Thank you for checking in. ${
      anchor.value <= 2
        ? "Because your tank is running low right now, permission granted to simplify today's routine to safety, warmth, and basics."
        : "Your steady rhythm is building a predictable, safe base for your family."
    }`;
    followUpPrompt = "What is one small thing that will help the next 2 hours feel calm and manageable?";
  } else if (input.interactionForm === "safe_partner_message_bridge") {
    biffBridgeResult = rewritePartnerMessageToBiff(input.userMessage);
    rawReply = biffBridgeResult.safeToSend
      ? `Your message draft is already brief, calm, and child-focused: "${biffBridgeResult.biffRewrittenMessage}"`
      : `I noticed ${biffBridgeResult.detectedToneFlags.join(" and ")}. Here is a safe, child-focused BIFF version you can use instead:\n\n"${biffBridgeResult.biffRewrittenMessage}"`;
    followUpPrompt = "Would you like to adjust the time or handover details in this BIFF message before copying it?";
  } else if (input.interactionForm === "shared_timeout_contract") {
    timeOutContract = buildSharedTimeOutContract({
      agreedCodeWord: input.userMessage.trim() || undefined,
    });
    rawReply = `Your Synchronised 20-Minute Time-Out Safety Contract is ready. Code phrase: "${timeOutContract.agreedCodeWord}". Child reassurance script: "${timeOutContract.childReassuranceScript}"`;
    followUpPrompt = "Would you like to practise calling this Time-Out in a 60-second live roleplay?";
  } else if (input.personaMode === "child_support_coach") {
    const ageBand = input.childAgeBand ?? "9-12";
    rawReply =
      ageBand === "5-8"
        ? "Thank you for telling me! You did a super job noticing your feelings. Let's do 3 slow balloon breaths together — breathe in like smelling a warm cookie, and blow out like blowing bubbles. Remember, grown-up worries are never your fault, and you have safe grown-ups who care about you."
        : ageBand === "9-12"
          ? "Thanks for sharing that with me. It makes total sense that your body felt that way. Let's press our feet into the floor and do a quick 5-4-3-2-1 reset together. Who is one trusted safe adult in your Safety Circle you could check in with today?"
          : "I hear you, and thank you for being real about what's going on. Carrying family stress is exhausting, and none of the adult tension is on you. Let's look at what helps you protect your peace, your sleep, and your safe boundaries today.";
    followUpPrompt = "On our 0-to-10 Worry Thermometer, what number feels closest to how your body feels right now?";
  } else {
    // Reflective Dialogue / Spaced Retention / Easy-Read / Cultural Yarning
    const stageInfo = input.couplesRestorationStage
      ? FOUR_STAGE_COUPLES_DFV_RESTORATION_PATHWAY.find(
          (s) => s.id === input.couplesRestorationStage,
        )
      : undefined;

    const groundingPrefix =
      effectiveWindow === "hyper_aroused"
        ? "First, let's slow things down for 10 seconds — unclench your jaw and take a slow breath in for 4 and out for 6. "
        : effectiveWindow === "hypo_aroused"
          ? "When everything feels heavy or numb, we don't have to solve everything at once — let's just focus on one gentle anchor right now. "
          : "";

    const stageNotice = stageInfo
      ? `[${stageInfo.title}] `
      : "";

    rawReply = isEasyRead
      ? `${groundingPrefix}${pathwayProtocol.easyReadOpeningPrompt} Let's pick 1 small step from your plan: ${pathwayProtocol.microSkillSteps[0]}.`
      : `${stageNotice}${groundingPrefix}Thank you for reflecting on that. In our ${pathwayProtocol.shortLabel} work (${pathwayProtocol.evidenceFrameworks[0]}), noticing what happens in your body and how it lands for your child is key. ${
          preSafety.safetyTier === "tier_2_clinical_review"
            ? "Because you mentioned elevated safety or stress signals, I have also flagged a supportive check-in for your practitioner and included your safety plan steps below."
            : "Let's connect this directly to your next practical step at home."
        }`;

    followUpPrompt = isEasyRead
      ? "Which 1 small step feels easiest to try in the next hour?"
      : "When you picture trying that step at home today, what might get in the way, and how can we plan around it?";
  }

  const { sanitizedText, violationsCorrected } = sanitizeAiOutputAgainstSafetyPolicy(rawReply);
  const confidenceScore = input.confidenceOverride ?? 0.88;
  const uncertaintyDisclosure = buildUncertaintyDisclosure(confidenceScore);

  const finalMessage = uncertaintyDisclosure
    ? `${uncertaintyDisclosure}\n\n${sanitizedText}`
    : sanitizedText;

  const safetyEvaluation: PrePostSafetyEvaluation = {
    ...preSafety,
    policyViolationsCorrected: violationsCorrected,
  };

  return {
    sessionId,
    personaMode: input.personaMode,
    clinicalPathway: input.clinicalPathway,
    interactionForm: input.interactionForm,
    assistantMessage: finalMessage,
    uncertaintyDisclosure,
    confidenceScore,
    windowOfToleranceDetected: effectiveWindow,
    safetyEvaluation,
    reflectiveFunctioningScore: turnMetrics.reflectiveFunctioningScore,
    antiGamingAuthenticityScore: turnMetrics.antiGamingAuthenticityScore,
    microSkillActionSteps: pathwayProtocol.microSkillSteps,
    followUpPrompt,
    biffBridgeResult,
    timeOutContract,
    providerTierUsed: "tier3_deterministic_local",
    auditSha256: computeAuditSha256(
      `turn:${sessionId}:${input.personaMode}:${input.interactionForm}:${finalMessage}`,
    ),
    createdAt: new Date().toISOString(),
  };
}
