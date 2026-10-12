import { createHash } from "node:crypto";

export const AUSTRALIAN_CRISIS_CONTACTS = Object.freeze([
  { id: "emergency_000", name: "Emergency Services (Police / Ambulance / Fire)", phone: "000" },
  { id: "1800respect", name: "1800RESPECT (DFV & Sexual Violence 24/7)", phone: "1800 737 732" },
  { id: "lifeline", name: "Lifeline Australia (24/7 Crisis Support)", phone: "13 11 14" },
  { id: "kids_helpline", name: "Kids Helpline (Ages 5–25, 24/7 Free)", phone: "1800 55 1800" },
  { id: "13yarn", name: "13YARN (Aboriginal & Torres Strait Islander 24/7)", phone: "13 92 76" },
  { id: "mensline", name: "MensLine / No to Violence", phone: "1300 78 99 78" },
  { id: "national_aod", name: "National Alcohol and Other Drug Hotline", phone: "1800 250 015" },
  { id: "panda_perinatal", name: "PANDA National Perinatal Helpline", phone: "1300 726 306" },
]);

export function sha256Hex(payload) {
  return createHash("sha256")
    .update(typeof payload === "string" ? payload : JSON.stringify(payload))
    .digest("hex");
}

export function redactPii(text) {
  return String(text ?? "")
    .replace(/\b(?:\+?61|0)[2-478](?:[ -]?\d){8}\b/g, "[REDACTED_PHONE]")
    .replace(/\b\d{4}[ -]?\d{5}[ -]?\d{1}\b/g, "[REDACTED_MEDICARE]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .replace(
      /\b\d{1,5}\s+[A-Za-z0-9.\s]{2,25}\s(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|Place|Pl|Lane|Ln)\b/gi,
      "[REDACTED_ADDRESS]",
    );
}

export function sanitizeAgainstSafetyPolicy(rawText) {
  let sanitizedText = String(rawText ?? "");
  const violationsCorrected = [];

  const rules = [
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
    if (rule.pattern.test(sanitizedText)) {
      sanitizedText = sanitizedText.replace(rule.pattern, rule.replacement);
      violationsCorrected.push(rule.reason);
    }
  }

  return { sanitizedText, violationsCorrected };
}

export function formatUncertaintyBanner(confidenceScore) {
  const numeric = Number.isFinite(confidenceScore) ? Number(confidenceScore) : 0.85;
  if (numeric < 0.2) {
    return "Uncertain — do not rely on this output; consult a supervisor.";
  }
  if (numeric < 0.5) {
    return "Low-confidence output — verify with primary records before acting.";
  }
  return null;
}

const TIER_1_RULES = [
  {
    domain: "child_abuse_disclosure",
    regex:
      /\b(?:hit(?:ting)? the (?:child|kids|baby)|shake(?:n|s)? the baby|hurt(?:ing)? my (?:child|baby|kid)|someone touched me|hurting me at home|burn(?:ed|ing) the child|locked the child)\b/i,
  },
  {
    domain: "dfv_strangulation_or_weapons",
    regex:
      /\b(?:chok(?:ed|ing)|strangl(?:ed|ing)|hands around (?:my|her|his) neck|gun|knife|threatened to kill|going to kill|burn the house)\b/i,
  },
  {
    domain: "suicide_or_self_harm",
    regex:
      /\b(?:kill myself|end my life|want to die|better off dead|suicide|suicidal|overdose|cut myself|hurt myself)\b/i,
  },
  {
    domain: "perinatal_infant_harm_risk",
    regex:
      /\b(?:afraid i(?:'ll| will) hurt the baby|shake the crying baby|can't stop the baby crying and might snap)\b/i,
  },
  {
    domain: "acute_intoxication_sole_carer",
    regex:
      /\b(?:passed out drunk with the kids|using ice with the kids here|no sober adult here|overdosing right now)\b/i,
  },
];

const TIER_2_RULES = [
  {
    domain: "dfv_coercive_control_or_fear",
    regex:
      /\b(?:walking on eggshells|scared of what (?:he|she|they) will do|checks my phone|tracks my location|won't let me leave|afraid to go home|retaliat(?:e|ion))\b/i,
  },
  {
    domain: "avith_household_danger",
    regex:
      /\b(?:smashing walls|throwing furniture|locked ourselves in the bedroom|scared of our teen)\b/i,
  },
  {
    domain: "relapse_craving_spike",
    regex:
      /\b(?:about to relapse|craving is 10 out of 10|dealer texted|drinking again|used last night)\b/i,
  },
];

export function evaluateServerSafetyGate(rawText, personaMode = "parent_support_coach") {
  const redactedText = redactPii(rawText);
  const detectedDomains = [];

  for (const rule of TIER_1_RULES) {
    if (rule.regex.test(redactedText)) {
      detectedDomains.push(rule.domain);
    }
  }

  if (detectedDomains.length > 0) {
    const isChild = personaMode === "child_support_coach";
    const emergencyMessage = isChild
      ? "Thank you for being so brave and telling me. What happened is NEVER your fault. Because your safety is the most important thing in the world, I am pausing our chat right now so a safe protective helper can support you straight away. You can also call Kids Helpline free on 1800 55 1800 or Emergency 000."
      : "SAFETY PAUSE & IMMEDIATE SUPPORT: What you just shared involves immediate safety. In line with SafeSteps Safety Policy, automated coaching is paused right now so you can connect with immediate human safety support. If you or your children are in immediate danger, please call 000 now. For 24/7 confidential support: 1800RESPECT (1800 737 732), Lifeline (13 11 14), or 13YARN (13 92 76).";

    return {
      safeToProceed: false,
      safetyGateTriggered: true,
      safetyTier: "tier_1_immediate",
      detectedDomains,
      redactedText,
      emergencyMessage,
      emergencyResources: AUSTRALIAN_CRISIS_CONTACTS,
      auditSha256: sha256Hex({ tier: 1, personaMode, redactedText, detectedDomains }),
    };
  }

  for (const rule of TIER_2_RULES) {
    if (rule.regex.test(redactedText)) {
      detectedDomains.push(rule.domain);
    }
  }

  return {
    safeToProceed: true,
    safetyGateTriggered: detectedDomains.length > 0,
    safetyTier: detectedDomains.length > 0 ? "tier_2_clinical_review" : null,
    detectedDomains,
    redactedText,
    emergencyMessage: null,
    emergencyResources: AUSTRALIAN_CRISIS_CONTACTS,
    auditSha256: sha256Hex({ tier: detectedDomains.length > 0 ? 2 : 0, personaMode, redactedText }),
  };
}

export function evaluateServerCouplesDfvSafetyCheck(body = {}) {
  const requestedScore =
    body.feltSafetyScore === undefined ? 8 : Number(body.feltSafetyScore);
  const feltSafetyScore = Number.isFinite(requestedScore)
    ? Math.max(0, Math.min(10, requestedScore))
    : 0;
  const fearOfRetaliation = Boolean(body.fearOfRetaliation);
  const coercedToParticipate = Boolean(body.coercedToParticipate);
  const immediateDanger = Boolean(body.immediateDanger);
  const checkPhase = body.checkPhase || "pre_session";
  const redactedNotes = redactPii(body.privateNotes || "");

  if (immediateDanger) {
    return {
      checkPhase,
      feltSafetyScore,
      silentPivotTriggered: true,
      recommendedMode: "tier1_crisis_halt",
      permittedStage: "stage_1_containment_individual",
      partnerFacingNeutralNotice:
        "Today's session is scheduled as an Individual Reflection & Skill Check-In module for each participant.",
      privateSurvivorSupportMessage:
        "Your private check-in is strictly confidential and never shown to your partner. Because immediate safety indicators are present, conjoint coaching is locked and we have quietly switched to individual mode. Call 000 or 1800RESPECT (1800 737 732).",
      clinicianAlertRequired: true,
      redactedPrivateNotes: redactedNotes,
      auditSha256: sha256Hex({ checkPhase, feltSafetyScore, immediateDanger }),
    };
  }

  if (feltSafetyScore < 7 || fearOfRetaliation || coercedToParticipate) {
    return {
      checkPhase,
      feltSafetyScore,
      silentPivotTriggered: true,
      recommendedMode: feltSafetyScore <= 4 ? "individual_stabilisation_only" : "parallel_safe",
      permittedStage:
        feltSafetyScore <= 4
          ? "stage_1_containment_individual"
          : "stage_2_parallel_synchronised",
      partnerFacingNeutralNotice:
        "Today's module is running in Parallel Individual Skill-Building Mode so each caregiver can complete their personal pace check-in.",
      privateSurvivorSupportMessage:
        "Thank you for answering honestly. Your response is 100% private and hidden from your partner. We have silently switched today's session to Parallel Safe Mode using a standard curriculum notice so there is zero risk of retaliation.",
      clinicianAlertRequired: true,
      redactedPrivateNotes: redactedNotes,
      auditSha256: sha256Hex({ checkPhase, feltSafetyScore, fearOfRetaliation, coercedToParticipate }),
    };
  }

  return {
    checkPhase,
    feltSafetyScore,
    silentPivotTriggered: false,
    recommendedMode: "proceed_conjoint",
    permittedStage: "stage_3_conjoint_safety_gated",
    partnerFacingNeutralNotice:
      "Both participants have completed their check-in. Stage 3 Safety-Gated Restoration Coaching is active.",
    privateSurvivorSupportMessage: `Your private felt-safety check-in (${feltSafetyScore}/10) is recorded. You can tap 'Pause / Individual Mode' at any time.`,
    clinicianAlertRequired: false,
    redactedPrivateNotes: redactedNotes,
    auditSha256: sha256Hex({ checkPhase, feltSafetyScore, ok: true }),
  };
}
