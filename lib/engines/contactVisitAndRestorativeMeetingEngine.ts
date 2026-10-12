import type { CouplesDfvStageId } from "../data/therapeuticCoachingProtocols";
import {
  computeAuditSha256,
  evaluatePreAndPostSafetyGate,
  sanitizeAiOutputAgainstSafetyPolicy,
} from "./aiSupportCoachEngine";

export type ContactVisitPhase =
  | "pre_visit_grounding"
  | "during_visit_coregulation"
  | "post_visit_transition";

export type ChildTransitionSignal =
  | "quiet_withdrawn_or_shut_down"
  | "clingy_separation_distress"
  | "hyperactive_or_silly_dysregulation"
  | "anger_or_pushing_parent_away"
  | "tummy_ache_or_headache"
  | "sleep_regression_or_bedwetting"
  | "loyalty_bind_questions";

export interface ContactVisitCoachingInput {
  caseId?: string;
  parentOrCarerUserId: string;
  visitPhase: ContactVisitPhase;
  parentArousal0to10: number;
  childAgeBand: "0-4" | "5-8" | "9-12" | "13-17";
  childObservedSignals: ChildTransitionSignal[];
  parentDraftReflection?: string;
}

export interface ContactVisitCoachingResult {
  visitPhase: ContactVisitPhase;
  parentArousal0to10: number;
  requiresFiveMinuteSomaticGroundingFirst: boolean;
  somaticGroundingDrill: string;
  attachmentTransitionFormulation: string;
  coRegulationMicroScript: string;
  avoidedMisattributionFlags: string[];
  reunificationEvidenceNote: string;
  auditSha256: string;
}

const SIGNAL_DECODER_MAP: Record<
  ChildTransitionSignal,
  { formulation: string; microScript: string; misattributionWarning: string }
> = {
  quiet_withdrawn_or_shut_down: {
    formulation:
      "Dorsal-vagal freeze or emotional overload during transition between two worlds. The child is conserving energy while adjusting to handover.",
    microScript:
      "\"You don't have to talk right now. I'm right here with your snack and water whenever you're ready.\"",
    misattributionWarning:
      "Do not interpret quietness as 'coldness' or interrogate the child about what happened at the other home.",
  },
  clingy_separation_distress: {
    formulation:
      "Heightened attachment proximity-seeking triggered by transition uncertainty.",
    microScript:
      "\"I've got you. Let's do our special goodbye handshake, and remember I will see you on [Day] right after school.\"",
    misattributionWarning:
      "Do not prolong handover goodbyes with adult tears, which increases the child's burden to take care of the parent's emotions.",
  },
  hyperactive_or_silly_dysregulation: {
    formulation:
      "Sympathetic nervous system mobilisation ('flight/fidget' energy) masking transition anxiety.",
    microScript:
      "\"Your body has lots of big energy right now! Let's do 5 wall-pushes or bounce the ball together before we sit down.\"",
    misattributionWarning:
      "Avoid labelling transition hyperactivity as 'naughty' or 'disrespectful'.",
  },
  anger_or_pushing_parent_away: {
    formulation:
      "Protest behaviour: children often release stored grief or confusion with the adult they trust to stay steady.",
    microScript:
      "\"I can see you have really big mad feelings right now. Even when you're mad, you're safe with me and I'm staying calm.\"",
    misattributionWarning:
      "Do not take protest behaviour personally or retaliate with harsh consequences.",
  },
  tummy_ache_or_headache: {
    formulation:
      "Somatic expression of loyalty conflict or nervous system transition stress.",
    microScript:
      "\"Transitions can make tummies feel tight. Let's have a warm drink and rest on the couch with your blanket.\"",
    misattributionWarning:
      "Provide comfort without using physical symptoms to interrogate the child about the other parent/carer.",
  },
  sleep_regression_or_bedwetting: {
    formulation:
      "Temporary neurobiological regression following high-emotion contact transitions.",
    microScript:
      "\"No problem at all, bodies take time to settle after a big day. Let's change the sheets quietly together.\"",
    misattributionWarning:
      "Never shame, punish, or blame the child for post-visit sleep or toileting regression.",
  },
  loyalty_bind_questions: {
    formulation:
      "The child is checking whether it is emotionally safe to love or enjoy time with both parents/carers.",
    microScript:
      "\"My job is to make sure you feel safe and loved. You never have to choose or carry grown-up worries.\"",
    misattributionWarning:
      "Never ask the child to carry messages, report on the other household, or take sides.",
  },
};

/**
 * Module 3: Pre / During / Post Contact Visit Co-Regulation & Child Transition Decoder.
 */
export function runContactVisitCoaching(
  input: ContactVisitCoachingInput,
): ContactVisitCoachingResult {
  const arousal = Math.max(0, Math.min(10, Math.round(input.parentArousal0to10)));
  const requiresFiveMinuteSomaticGroundingFirst = arousal >= 6;

  const somaticGroundingDrill = requiresFiveMinuteSomaticGroundingFirst
    ? "STOP BEFORE HANDOVER: Your nervous system arousal is high (" +
      arousal +
      "/10). Children co-regulate off your voice and shoulders. Do 4 rounds of Physiological Sigh (double inhale through nose, long slow exhale through mouth) and drop your shoulders before greeting your child."
    : "Steady Baseline (" +
      arousal +
      "/10): Keep your greeting warm, predictable, low-volume, and completely free of adult case questions.";

  const signals =
    input.childObservedSignals.length > 0
      ? input.childObservedSignals
      : (["quiet_withdrawn_or_shut_down"] as ChildTransitionSignal[]);

  const decoded = signals.map((sig) => SIGNAL_DECODER_MAP[sig]);

  const rawFormulation =
    input.visitPhase === "pre_visit_grounding"
      ? `Pre-Visit Attachment Readiness (${input.childAgeBand} yrs): Focus 100% on being a 'Safe Haven' and 'Secure Base'. Bring a predictable sensory snack/activity and let the child set the pace of physical affection.`
      : decoded.map((d) => d.formulation).join(" ");

  const rawScript = decoded.map((d) => d.microScript).join(" / ");
  const avoidedMisattributionFlags = decoded.map((d) => d.misattributionWarning);

  const sanitizedFormulation = sanitizeAiOutputAgainstSafetyPolicy(rawFormulation).sanitizedText;
  const sanitizedScript = sanitizeAiOutputAgainstSafetyPolicy(rawScript).sanitizedText;

  const reunificationEvidenceNote =
    "Demonstrated trauma-informed attachment decoding during contact transition: prioritised child nervous-system settling over adult agenda.";

  const auditSha256 = computeAuditSha256(
    JSON.stringify({
      parentOrCarerUserId: input.parentOrCarerUserId,
      visitPhase: input.visitPhase,
      arousal,
      signals,
    }),
  );

  return {
    visitPhase: input.visitPhase,
    parentArousal0to10: arousal,
    requiresFiveMinuteSomaticGroundingFirst,
    somaticGroundingDrill,
    attachmentTransitionFormulation: sanitizedFormulation,
    coRegulationMicroScript: sanitizedScript,
    avoidedMisattributionFlags,
    reunificationEvidenceNote,
    auditSha256,
  };
}

export interface RestorativeFamilyMeetingInput {
  caseId?: string;
  creatorUserId: string;
  couplesDfvStage: CouplesDfvStageId;
  clinicianSafetyClearance: boolean;
  survivorFeltSafetyScore0to10: number;
  ruptureRepairDraft: string;
  childWishesOrWorries: string[];
  turnTakingMinutes?: number;
}

export interface RestorativeFamilyMeetingResult {
  meetingPermitted: boolean;
  activeDeliveryMode: "conjoint_restorative_cleared" | "parallel_individual_only_blocked";
  safetyGateReason: string;
  excuseOrChildBlameDetected: boolean;
  detectedBlameOrMinimizationFlags: string[];
  sanitizedChildCentredApology: string;
  fiveStepRepairStructure: {
    step1OwnAdultAction: string;
    step2NameChildImpact: string;
    step3ZeroExcusesGuarantee: string;
    step4ConcreteSafetyChange: string;
    step5NoPressureToForgive: string;
  };
  voiceOfChildCards: string[];
  turnTakingMinutes: number;
  auditSha256: string;
}

const EXCUSE_OR_BLAME_PATTERNS: { label: string; regex: RegExp }[] = [
  {
    label: "Conditional apology ('I'm sorry if you felt...' or 'I'm sorry, but...')",
    regex: /\b(sorry\s+if\s+you|sorry\s+but|only\s+because\s+you|if\s+you\s+hadn'?t)\b/i,
  },
  {
    label: "Child-blaming or parentification ('You made me angry' / 'You pushed my buttons')",
    regex: /\b(you\s+made\s+me|pushed\s+my\s+buttons|your\s+fault|because\s+you\s+were\s+naughty|you\s+stressed\s+me)\b/i,
  },
  {
    label: "Other-parent blaming ('Your mum/dad made me do it')",
    regex: /\b(your\s+(mum|mom|dad|mother|father)\s+(made|forced|drove)\s+me)\b/i,
  },
  {
    label: "Demanding immediate forgiveness ('You have to forgive me now' / 'Let's forget the past')",
    regex: /\b(have\s+to\s+forgive\s+me|move\s+on\s+now|stop\s+bringing\s+it\s+up|forget\s+about\s+it)\b/i,
  },
];

/**
 * Module 4: Safety-Gated Restorative Family Meeting & Child-Parent Rupture-Repair Studio.
 * Enforces Stage 3/4 + Clinician Clearance + Survivor Felt Safety >= 7/10 before allowing conjoint meetings,
 * and rewrites adult-to-child apologies to eliminate excuses, minimization, or child-blaming.
 */
export function buildRestorativeFamilyMeetingPlan(
  input: RestorativeFamilyMeetingInput,
): RestorativeFamilyMeetingResult {
  const preSafety = evaluatePreAndPostSafetyGate(
    input.ruptureRepairDraft,
    "couples_dfv_restoration_coach",
  );

  const stageAllowed =
    input.couplesDfvStage === "stage_3_conjoint_safety_gated" ||
    input.couplesDfvStage === "stage_4_whole_family_integration" ||
    input.couplesDfvStage === "stage_4_family_reunification_maintenance";

  const feltSafetyCleared = input.survivorFeltSafetyScore0to10 >= 7;
  const meetingPermitted =
    preSafety.safeToProceed &&
    stageAllowed &&
    input.clinicianSafetyClearance &&
    feltSafetyCleared;

  let safetyGateReason =
    "All Stage 3/4 restorative prerequisites met: clinician clearance active and felt safety >= 7/10.";
  if (!preSafety.safeToProceed) {
    safetyGateReason =
      "Tier-1 safety halt triggered on draft text. Restorative meeting blocked.";
  } else if (!stageAllowed) {
    safetyGateReason = `Conjoint restorative meeting is locked at ${input.couplesDfvStage}. Complete Stage 1 & Stage 2 parallel accountability milestones first.`;
  } else if (!input.clinicianSafetyClearance) {
    safetyGateReason =
      "Awaiting caseworker/clinician sign-off before opening a joint restorative family meeting.";
  } else if (!feltSafetyCleared) {
    safetyGateReason =
      "Session automatically routed to Parallel Individual Preparation Mode to honour participant comfort and pacing.";
  }

  const detectedBlameOrMinimizationFlags = EXCUSE_OR_BLAME_PATTERNS.filter((item) =>
    item.regex.test(input.ruptureRepairDraft),
  ).map((item) => item.label);

  const excuseOrChildBlameDetected = detectedBlameOrMinimizationFlags.length > 0;

  const fiveStepRepairStructure = {
    step1OwnAdultAction:
      "I am sorry for my loud voice and the way I acted. That was my choice as the grown-up.",
    step2NameChildImpact:
      "I know that when grown-ups yell or argue, it can make your body feel scared and unsafe.",
    step3ZeroExcusesGuarantee:
      "Nothing you did caused my behaviour. Grown-up feelings are 100% my job to manage.",
    step4ConcreteSafetyChange:
      "From now on, I am using my 20-minute cooling-off plan and working with my support coach so our home stays calm.",
    step5NoPressureToForgive:
      "You don't have to say 'it's okay' right now. I will show you through my actions every day that you are safe.",
  };

  const sanitizedChildCentredApology = excuseOrChildBlameDetected
    ? `${fiveStepRepairStructure.step1OwnAdultAction} ${fiveStepRepairStructure.step2NameChildImpact} ${fiveStepRepairStructure.step3ZeroExcusesGuarantee} ${fiveStepRepairStructure.step4ConcreteSafetyChange} ${fiveStepRepairStructure.step5NoPressureToForgive}`
    : sanitizeAiOutputAgainstSafetyPolicy(input.ruptureRepairDraft.trim()).sanitizedText;

  const voiceOfChildCards =
    input.childWishesOrWorries.length > 0
      ? input.childWishesOrWorries.map(
          (w) => sanitizeAiOutputAgainstSafetyPolicy(w).sanitizedText,
        )
      : [
          "I want grown-ups to use calm voices at bedtime.",
          "I want to know what the plan is before handover day.",
          "I want to feel safe talking about my feelings without anyone getting mad.",
        ];

  const turnTakingMinutes = Math.max(1, Math.min(10, input.turnTakingMinutes ?? 3));
  const auditSha256 = computeAuditSha256(
    JSON.stringify({
      creatorUserId: input.creatorUserId,
      meetingPermitted,
      excuseOrChildBlameDetected,
      sanitizedChildCentredApology,
    }),
  );

  return {
    meetingPermitted,
    activeDeliveryMode: meetingPermitted
      ? "conjoint_restorative_cleared"
      : "parallel_individual_only_blocked",
    safetyGateReason,
    excuseOrChildBlameDetected,
    detectedBlameOrMinimizationFlags,
    sanitizedChildCentredApology,
    fiveStepRepairStructure,
    voiceOfChildCards,
    turnTakingMinutes,
    auditSha256,
  };
}
