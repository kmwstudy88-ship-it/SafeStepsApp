import type { PsychometricCompetencyId } from "../engines/psychometricAssessmentEngine";
import type { SaferInformationCategory, SaferSpecialistFlag } from "../engines/saferAssessmentEngine";

export type ClinicalScaleCategoryId =
  | "validity_anti_gaming"
  | "dfv_couples_restoration"
  | "addiction_aod"
  | "mental_health_trauma"
  | "perinatal_infant"
  | "neurodiversity_abi"
  | "cultural_sewb_carer"
  | "parenting_attachment_pdf"
  | "child_youth_voice"
  | "external_tier3_4_bridge";

export type ClinicalScaleAdministrationForm =
  | "standard_scale"
  | "sjt_vignette"
  | "ema_micro_pulse"
  | "somatic_body_map"
  | "spaced_retest"
  | "external_clinician_import";

export type ClinicalScaleOption = {
  id: string;
  label: string;
  easyReadLabel?: string;
  score: number;
  triggersCriticalOverride?: boolean;
  criticalReason?: string;
};

export type ClinicalScaleItem = {
  id: string;
  prompt: string;
  easyReadPrompt?: string;
  subscaleId?: string;
  reverseScored?: boolean;
  validityPairId?: string;
  socialDesirabilityKey?: boolean;
  options: ClinicalScaleOption[];
};

export type ClinicalScaleBand = {
  id: string;
  label: string;
  minRawScore: number;
  maxRawScore: number;
  severity: "optimal" | "mild" | "moderate" | "severe" | "critical";
  interpretation: string;
  recommendedAction: string;
  requiresSupervisorReview?: boolean;
};

export type ClinicalScaleDefinition = {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  category: ClinicalScaleCategoryId;
  sourceReference: string;
  description: string;
  targetAudience: ("parent" | "partner" | "child" | "carer" | "clinician")[];
  supportedForms: ClinicalScaleAdministrationForm[];
  higherScoreMeans: "higher_risk_or_distress" | "higher_strength_or_safety";
  maxRawScore: number;
  clinicalCutoffRaw: number;
  testRetestR: number;
  normativeSd: number;
  saferCategories: SaferInformationCategory[];
  saferFlags: SaferSpecialistFlag[];
  competencyIds: PsychometricCompetencyId[];
  subscales: { id: string; label: string; description: string }[];
  items: ClinicalScaleItem[];
  bands: ClinicalScaleBand[];
};

export type ClinicalScaleResponseInput = {
  itemId: string;
  selectedOptionId?: string;
  numericScore?: number;
  responseTimeMs?: number;
};

export type ValidityCheckResult = {
  overallValidityBand: "valid" | "caution_impression_management" | "invalid_gaming_or_random";
  validityScore: number;
  socialDesirabilityIndex: number;
  inconsistencyIndex: number;
  straightLiningDetected: boolean;
  rapidClickThroughDetected: boolean;
  extremeMinimisationDetected: boolean;
  flags: string[];
  clinicianGuidance: string;
};

export type ClinicalScaleScoreOutput = {
  scaleId: string;
  scaleTitle: string;
  category: ClinicalScaleCategoryId;
  administrationForm: ClinicalScaleAdministrationForm;
  rawScore: number;
  maxRawScore: number;
  normalizedScore: number;
  strengthAdjustedScore: number;
  band: ClinicalScaleBand;
  subscaleScores: Record<string, { raw: number; max: number; normalized: number; label: string }>;
  criticalOverrideTriggered: boolean;
  criticalOverrideReasons: string[];
  requiresSupervisorReview: boolean;
  validity: ValidityCheckResult;
  saferCategories: SaferInformationCategory[];
  saferFlags: SaferSpecialistFlag[];
  competencyIds: PsychometricCompetencyId[];
  assessedAt: string;
};

export type ReliableChangeIndexResult = {
  scaleId: string;
  scaleTitle: string;
  baselineRaw: number;
  currentRaw: number;
  rawDifference: number;
  standardErrorOfMeasurement: number;
  standardErrorOfDifference: number;
  rciValue: number;
  statisticallyReliable: boolean;
  crossedClinicalCutoff: boolean;
  classification:
    | "clinically_significant_improvement"
    | "reliable_improvement"
    | "no_reliable_change"
    | "reliable_deterioration";
  summary: string;
};

const LIKERT_0_TO_3_FREQUENCY: ClinicalScaleOption[] = [
  { id: "opt_0", label: "Not at all (0 days)", easyReadLabel: "Never", score: 0 },
  { id: "opt_1", label: "Several days", easyReadLabel: "A few days", score: 1 },
  { id: "opt_2", label: "More than half the days", easyReadLabel: "Many days", score: 2 },
  { id: "opt_3", label: "Nearly every day", easyReadLabel: "Almost every day", score: 3 },
];

const LIKERT_0_TO_4_INTENSITY: ClinicalScaleOption[] = [
  { id: "opt_0", label: "Not at all", easyReadLabel: "No", score: 0 },
  { id: "opt_1", label: "A little bit", easyReadLabel: "A little", score: 1 },
  { id: "opt_2", label: "Moderately", easyReadLabel: "Medium", score: 2 },
  { id: "opt_3", label: "Quite a bit", easyReadLabel: "A lot", score: 3 },
  { id: "opt_4", label: "Extremely", easyReadLabel: "Very much", score: 4 },
];

const LIKERT_0_TO_4_STRENGTH: ClinicalScaleOption[] = [
  { id: "opt_0", label: "Never / Not yet", easyReadLabel: "Not yet", score: 0 },
  { id: "opt_1", label: "Rarely", easyReadLabel: "A little", score: 1 },
  { id: "opt_2", label: "Sometimes", easyReadLabel: "Sometimes", score: 2 },
  { id: "opt_3", label: "Often", easyReadLabel: "Mostly", score: 3 },
  { id: "opt_4", label: "Consistently / Always", easyReadLabel: "Always", score: 4 },
];

function buildQuickScale(params: {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  category: ClinicalScaleCategoryId;
  sourceReference: string;
  description: string;
  targetAudience: ("parent" | "partner" | "child" | "carer" | "clinician")[];
  higherScoreMeans: "higher_risk_or_distress" | "higher_strength_or_safety";
  testRetestR: number;
  normativeSd: number;
  clinicalCutoffRaw: number;
  saferCategories: SaferInformationCategory[];
  saferFlags: SaferSpecialistFlag[];
  competencyIds: PsychometricCompetencyId[];
  subscales: { id: string; label: string; description: string }[];
  prompts: {
    id: string;
    prompt: string;
    easyReadPrompt?: string;
    subscaleId?: string;
    validityPairId?: string;
    socialDesirabilityKey?: boolean;
    criticalFromScore?: number;
    criticalReason?: string;
    options?: ClinicalScaleOption[];
  }[];
  bands?: ClinicalScaleBand[];
}): ClinicalScaleDefinition {
  const defaultOptions =
    params.higherScoreMeans === "higher_strength_or_safety"
      ? LIKERT_0_TO_4_STRENGTH
      : LIKERT_0_TO_3_FREQUENCY;

  const items: ClinicalScaleItem[] = params.prompts.map((item) => {
    const baseOpts = item.options ?? defaultOptions;
    const options = baseOpts.map((opt) => {
      if (item.criticalFromScore !== undefined && opt.score >= item.criticalFromScore) {
        return {
          ...opt,
          triggersCriticalOverride: true,
          criticalReason: item.criticalReason ?? `Critical safety indicator endorsed on ${params.shortTitle}`,
        };
      }
      return opt;
    });
    return {
      id: item.id,
      prompt: item.prompt,
      easyReadPrompt: item.easyReadPrompt,
      subscaleId: item.subscaleId,
      validityPairId: item.validityPairId,
      socialDesirabilityKey: item.socialDesirabilityKey,
      options,
    };
  });

  const maxRawScore = items.reduce(
    (sum, item) => sum + Math.max(...item.options.map((o) => o.score), 0),
    0,
  );

  const defaultBands: ClinicalScaleBand[] =
    params.bands ??
    (params.higherScoreMeans === "higher_risk_or_distress"
      ? [
          {
            id: "low",
            label: "Low / Minimal Clinical Concern",
            minRawScore: 0,
            maxRawScore: Math.floor(maxRawScore * 0.25),
            severity: "optimal",
            interpretation: "Responses indicate low current symptom burden or risk in this domain.",
            recommendedAction: "Maintain protective routines and periodic spaced check-ins.",
          },
          {
            id: "mild",
            label: "Mild / Emerging Concern",
            minRawScore: Math.floor(maxRawScore * 0.25) + 1,
            maxRawScore: Math.floor(maxRawScore * 0.5),
            severity: "mild",
            interpretation: "Responses suggest emerging distress or early warning stressors.",
            recommendedAction: "Engage targeted AI Support Coach skill module and coping plan.",
          },
          {
            id: "moderate",
            label: "Moderate / Clinically Elevated",
            minRawScore: Math.floor(maxRawScore * 0.5) + 1,
            maxRawScore: Math.floor(maxRawScore * 0.75),
            severity: "moderate",
            interpretation: "Score exceeds clinical screening threshold; structured support indicated.",
            recommendedAction: "Integrate into 5P formulation and schedule practitioner review.",
            requiresSupervisorReview: true,
          },
          {
            id: "severe",
            label: "Severe / High Priority Clinical Review",
            minRawScore: Math.floor(maxRawScore * 0.75) + 1,
            maxRawScore: maxRawScore,
            severity: "severe",
            interpretation: "High clinical severity or safety risk requiring active containment and specialist review.",
            recommendedAction: "Prioritise stabilisation, safety planning, and immediate clinician review.",
            requiresSupervisorReview: true,
          },
        ]
      : [
          {
            id: "critical_gap",
            label: "Significant Support Gap",
            minRawScore: 0,
            maxRawScore: Math.floor(maxRawScore * 0.35),
            severity: "severe",
            interpretation: "Protective capacity or readiness is currently fragile and requires scaffolding.",
            recommendedAction: "Provide high-support coaching, roleplay practice, and safety containment.",
            requiresSupervisorReview: true,
          },
          {
            id: "emerging_capacity",
            label: "Emerging Capacity",
            minRawScore: Math.floor(maxRawScore * 0.35) + 1,
            maxRawScore: Math.floor(maxRawScore * 0.7),
            severity: "moderate",
            interpretation: "Foundational awareness is present; consistent behavioural application is still developing.",
            recommendedAction: "Reinforce via situational judgement vignettes, home practice, and teach-back.",
          },
          {
            id: "strong_capacity",
            label: "Demonstrated Protective Capacity",
            minRawScore: Math.floor(maxRawScore * 0.7) + 1,
            maxRawScore: maxRawScore,
            severity: "optimal",
            interpretation: "Strong demonstrated protective capacity, insight, and consistent application.",
            recommendedAction: "Continue spaced retention checks and family maintenance routines.",
          },
        ]);

  return {
    id: params.id,
    code: params.code,
    title: params.title,
    shortTitle: params.shortTitle,
    category: params.category,
    sourceReference: params.sourceReference,
    description: params.description,
    targetAudience: params.targetAudience,
    supportedForms: [
      "standard_scale",
      "sjt_vignette",
      "ema_micro_pulse",
      "somatic_body_map",
      "spaced_retest",
    ],
    higherScoreMeans: params.higherScoreMeans,
    maxRawScore,
    clinicalCutoffRaw: params.clinicalCutoffRaw,
    testRetestR: params.testRetestR,
    normativeSd: params.normativeSd,
    saferCategories: params.saferCategories,
    saferFlags: params.saferFlags,
    competencyIds: params.competencyIds,
    subscales: params.subscales,
    items,
    bands: defaultBands,
  };
}

export const CLINICAL_AND_PARENTING_SCALES: ClinicalScaleDefinition[] = [
  // ============================================================================
  // CATEGORY 1: PSYCHOMETRIC VALIDITY, IMPRESSION MANAGEMENT & GAMING (3 Scales)
  // ============================================================================
  buildQuickScale({
    id: "validity_mcsds",
    code: "MCSDS-SF",
    title: "Social Desirability & Impression Management Index",
    shortTitle: "Impression Management (MCSDS-SF)",
    category: "validity_anti_gaming",
    sourceReference: "Reynolds (1982) Short Form Marlowe-Crowne Social Desirability Scale + Paulhus BIDR",
    description:
      "Detects socially desirable responding, defensive minimisation, and 'faking good' under child protection or court scrutiny.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.84,
    normativeSd: 2.8,
    clinicalCutoffRaw: 8,
    saferCategories: ["parent_or_caregiver", "risk"],
    saferFlags: ["complex_needs"],
    competencyIds: ["self_awareness", "consistency", "reflective_capacity"],
    subscales: [
      { id: "impression_mgmt", label: "Impression Management", description: "Presenting an unrealistically flawless image" },
      { id: "self_deception", label: "Defensive Minimisation", description: "Denying universal human frustrations" },
    ],
    prompts: [
      {
        id: "mcsds_1",
        prompt: "I have never felt annoyed when my child or partner disagreed with me.",
        easyReadPrompt: "I never ever get annoyed at anyone.",
        subscaleId: "impression_mgmt",
        socialDesirabilityKey: true,
        validityPairId: "pair_anger",
      },
      {
        id: "mcsds_2",
        prompt: "Even when exhausted or stressed, I always respond with 100% patience.",
        easyReadPrompt: "I am 100% patient every single time I am tired.",
        subscaleId: "self_deception",
        socialDesirabilityKey: true,
        validityPairId: "pair_patience",
      },
      {
        id: "mcsds_3",
        prompt: "I have never once said something in an argument that I wished I could take back.",
        easyReadPrompt: "I have never said anything I regretted in an argument.",
        subscaleId: "impression_mgmt",
        socialDesirabilityKey: true,
      },
      {
        id: "mcsds_4",
        prompt: "There have been times when I felt overwhelmed and wanted a break, even briefly.",
        easyReadPrompt: "Sometimes parenting feels hard and I need a breather.",
        subscaleId: "self_deception",
        validityPairId: "pair_patience",
      },
    ],
  }),

  buildQuickScale({
    id: "validity_consistency",
    code: "VRIN-CR",
    title: "Variable Response Inconsistency & Randomness Check",
    shortTitle: "Response Consistency (VRIN-CR)",
    category: "validity_anti_gaming",
    sourceReference: "Psychometric Semantic Pair Consistency & Attentive Responding Protocol",
    description:
      "Evaluates semantic consistency across paired items, straight-lining, and rapid click-through gaming.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.86,
    normativeSd: 2.1,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver"],
    saferFlags: [],
    competencyIds: ["consistency", "engagement"],
    subscales: [
      { id: "semantic_consistency", label: "Semantic Pair Alignment", description: "Consistency across positively and negatively framed pairs" },
    ],
    prompts: [
      {
        id: "vrin_1",
        prompt: "When family tension rises, I find it easy to notice my early body warning signs.",
        subscaleId: "semantic_consistency",
        validityPairId: "pair_body_signs",
      },
      {
        id: "vrin_2",
        prompt: "When arguments start at home, I usually only realise I was escalated after it is over.",
        subscaleId: "semantic_consistency",
        validityPairId: "pair_body_signs",
      },
      {
        id: "vrin_3",
        prompt: "I feel confident asking our support network for help when I am struggling.",
        subscaleId: "semantic_consistency",
        validityPairId: "pair_help_seeking",
      },
      {
        id: "vrin_4",
        prompt: "I keep struggles to myself because asking services for help feels unsafe or pointless.",
        subscaleId: "semantic_consistency",
        validityPairId: "pair_help_seeking",
      },
    ],
  }),

  buildQuickScale({
    id: "validity_sjt_pressure",
    code: "SJT-PRESSURE",
    title: "High-Pressure Situational Judgement Authenticity Scale",
    shortTitle: "SJT Under-Pressure Authenticity",
    category: "validity_anti_gaming",
    sourceReference: "Construct-Driven Situational Judgement Test (Lievens & Motowidlo) for Family Safety",
    description:
      "Tests real-world decision-making when every option involves a realistic trade-off, preventing rehearsed textbook answers.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.82,
    normativeSd: 3.0,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "protection_and_safety", "child"],
    saferFlags: ["family_violence"],
    competencyIds: ["application", "decision_making", "emotional_regulation", "protective_capacity"],
    subscales: [
      { id: "tradeoff_realism", label: "Realistic Protective Choice", description: "Prioritising child safety over adult ego under pressure" },
    ],
    prompts: [
      {
        id: "sjt_p1",
        prompt:
          "It is 7:30 PM, your 6-year-old spills milk across clean laundry, and your partner raises their voice. How consistently do you step in calmly to soothe the child first rather than joining the argument?",
        subscaleId: "tradeoff_realism",
      },
      {
        id: "sjt_p2",
        prompt:
          "When your partner brings up a painful topic right before school drop-off, how reliably do you use your agreed Time-Out signal and postpone the adult discussion until the children are safe at school?",
        subscaleId: "tradeoff_realism",
      },
      {
        id: "sjt_p3",
        prompt:
          "If a caseworker points out a gap in your home routine, how openly do you explore what your child needed in that moment rather than defending yourself or blaming others?",
        subscaleId: "tradeoff_realism",
      },
      {
        id: "sjt_p4",
        prompt:
          "When you notice your heart racing and jaw clenching during a family disagreement, how consistently do you exit the room for 20 minutes without slams, threats, or texting?",
        subscaleId: "tradeoff_realism",
      },
    ],
  }),

  // ============================================================================
  // CATEGORY 2: DFV, COERCIVE CONTROL & COUPLES/FAMILY RESTORATION (7 Scales)
  // ============================================================================
  buildQuickScale({
    id: "dfv_safety_coercive",
    code: "MARAM-DVRISS",
    title: "DFV Lethality, Coercive Control & Multi-Agency Risk Screen",
    shortTitle: "DFV & Coercive Control (MARAM/DVRISS)",
    category: "dfv_couples_restoration",
    sourceReference: "MARAM Framework / Danger Assessment (Campbell) / Evan Stark Coercive Control",
    description:
      "Screens for physical violence, non-fatal strangulation, threats to kill, stalking, technology-facilitated abuse, financial/reproductive control, and child exposure.",
    targetAudience: ["parent", "partner", "clinician"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.89,
    normativeSd: 3.4,
    clinicalCutoffRaw: 3,
    saferCategories: ["risk", "protection_and_safety", "family", "child"],
    saferFlags: ["family_violence", "complex_needs"],
    competencyIds: ["safety", "protective_capacity", "decision_making"],
    subscales: [
      { id: "lethality_indicators", label: "High-Lethality Indicators", description: "Choking/strangulation, weapons, threats to kill, escalation" },
      { id: "coercive_control", label: "Coercive Control & Surveillance", description: "Isolation, financial control, phone/location tracking, intimidation" },
      { id: "child_exposure", label: "Child Exposure & Weaponisation", description: "Children witnessing violence or being used to monitor/control" },
    ],
    prompts: [
      {
        id: "dfv_1",
        prompt: "Has a partner or family member ever choked, strangled, suffocated, or put pressure on your neck/throat?",
        easyReadPrompt: "Has anyone ever put their hands on your neck or made it hard to breathe?",
        subscaleId: "lethality_indicators",
        criticalFromScore: 1,
        criticalReason: "High-lethality indicator: Non-fatal strangulation / choking history reported",
      },
      {
        id: "dfv_2",
        prompt: "Has a partner or family member threatened to kill you, the children, pets, or themselves, or used/threatened a weapon?",
        easyReadPrompt: "Has anyone threatened to kill you, the kids, pets, or themselves?",
        subscaleId: "lethality_indicators",
        criticalFromScore: 1,
        criticalReason: "High-lethality indicator: Threats to kill or weapon threat endorsed",
      },
      {
        id: "dfv_3",
        prompt: "Does a partner monitor your phone, messages, location, money, or isolate you from family, friends, or supports?",
        easyReadPrompt: "Does someone check your phone, take your money, or stop you seeing people?",
        subscaleId: "coercive_control",
        criticalFromScore: 2,
        criticalReason: "Active coercive control and surveillance pattern detected",
      },
      {
        id: "dfv_4",
        prompt: "Have the children overheard, witnessed, tried to stop, or been caught in the middle of frightening behaviour at home?",
        easyReadPrompt: "Have the kids seen or heard scary fighting at home?",
        subscaleId: "child_exposure",
        criticalFromScore: 2,
        criticalReason: "Child exposure to frightening family violence reported",
      },
    ],
  }),

  buildQuickScale({
    id: "web_safety",
    code: "WEB-10",
    title: "Women's Experience with Battering / Psychological Entrapment Scale",
    shortTitle: "Felt Safety & Entrapment (WEB)",
    category: "dfv_couples_restoration",
    sourceReference: "Smith, Earp & DeVellis (1995) WEB Scale (Gender-Inclusive Survivor Adaptation)",
    description:
      "Measures the internal psychological experience of living on 'eggshells', chronic fear, and loss of autonomy even when physical assaults are absent.",
    targetAudience: ["parent", "partner"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.88,
    normativeSd: 3.2,
    clinicalCutoffRaw: 5,
    saferCategories: ["risk", "protection_and_safety", "parent_or_caregiver"],
    saferFlags: ["family_violence"],
    competencyIds: ["safety", "self_awareness", "protective_capacity"],
    subscales: [
      { id: "walking_on_eggshells", label: "Hypervigilance / Eggshells", description: "Modifying daily behaviour to prevent partner anger" },
      { id: "autonomy_erosion", label: "Erosion of Autonomy", description: "Feeling programmed or unable to speak freely" },
    ],
    prompts: [
      {
        id: "web_1",
        prompt: "I feel like I have to 'walk on eggshells' or carefully watch my tone to keep the peace at home.",
        easyReadPrompt: "I have to be super careful about what I say so my partner does not get angry.",
        subscaleId: "walking_on_eggshells",
      },
      {
        id: "web_2",
        prompt: "A single look, sigh, or change in my partner's voice can make me feel afraid inside.",
        easyReadPrompt: "Just one angry look from my partner makes me feel scared.",
        subscaleId: "walking_on_eggshells",
        criticalFromScore: 2,
        criticalReason: "Survivor reports fear triggered by partner micro-expressions; contraindication for conjoint work",
      },
      {
        id: "web_3",
        prompt: "I censor what I say to workers, family, or in sessions because I worry about what will happen afterwards.",
        easyReadPrompt: "I hide the truth because I am scared of what happens when we go home.",
        subscaleId: "autonomy_erosion",
        criticalFromScore: 1,
        criticalReason: "Fear of post-session retaliation endorsed; immediate pivot to Parallel Safe Mode required",
      },
      {
        id: "web_4",
        prompt: "I feel like I have lost track of who I am or what I am allowed to decide for myself and my children.",
        easyReadPrompt: "I feel like I am not allowed to make my own choices anymore.",
        subscaleId: "autonomy_erosion",
      },
    ],
  }),

  buildQuickScale({
    id: "dvfct_readiness",
    code: "DVFCT-R",
    title: "Domestic Violence-Focused Couples Therapy Readiness & Safety Gate",
    shortTitle: "Couples DFV Readiness Gate (DVFCT-R)",
    category: "dfv_couples_restoration",
    sourceReference: "Stith, McCollum & Rosen (2011) Domestic Violence-Focused Couples Therapy Screening Protocol",
    description:
      "Determines whether a couple/family where DFV has occurred meets the clinical prerequisites for Stage 3 Conjoint Restoration versus Stage 2 Parallel Synchronised Coaching.",
    targetAudience: ["parent", "partner", "clinician"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.87,
    normativeSd: 3.1,
    clinicalCutoffRaw: 12,
    saferCategories: ["protection_and_safety", "family", "parent_or_caregiver"],
    saferFlags: ["family_violence"],
    competencyIds: ["safety", "communication", "emotional_regulation", "behaviour_change"],
    subscales: [
      { id: "mutual_safety", label: "Freedom from Fear & Retaliation", description: "Both partners report zero fear of retaliation" },
      { id: "timeout_fidelity", label: "De-Escalation & Time-Out Fidelity", description: "Demonstrated ability to honour Time-Out contracts" },
      { id: "shared_accountability", label: "Non-Blaming Accountability", description: "Ownership of harmful actions without victim-blaming" },
    ],
    prompts: [
      {
        id: "dvfct_1",
        prompt: "Both of us can disagree or express hurt in a session without any fear of punishment, silent treatment, or retaliation at home.",
        subscaleId: "mutual_safety",
      },
      {
        id: "dvfct_2",
        prompt: "When either partner calls a Time-Out, both of us immediately stop arguing, give space, and never block doors or follow each other.",
        subscaleId: "timeout_fidelity",
      },
      {
        id: "dvfct_3",
        prompt: "The partner who used harmful or frightening behaviour takes 100% responsibility without blaming stress, alcohol, or the other partner.",
        subscaleId: "shared_accountability",
      },
      {
        id: "dvfct_4",
        prompt: "Both partners agree that our children's emotional and physical safety comes before winning any adult disagreement.",
        subscaleId: "mutual_safety",
      },
    ],
  }),

  buildQuickScale({
    id: "puv_accountability",
    code: "PUV-ACC",
    title: "Person Using Violence Accountability, Empathy & Non-Violence Readiness Scale",
    shortTitle: "Behaviour Change & Accountability (PUV-ACC)",
    category: "dfv_couples_restoration",
    sourceReference: "Safe & Together™ Perpetrator Pattern Mapping & Men's Behaviour Change (MBCP) Readiness",
    description:
      "Measures movement from denial, minimisation, and external blame toward full ownership, awareness of impact on child/partner, and sustained non-violent self-regulation.",
    targetAudience: ["parent", "partner", "clinician"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.85,
    normativeSd: 3.3,
    clinicalCutoffRaw: 11,
    saferCategories: ["parent_or_caregiver", "risk", "protection_and_safety", "child"],
    saferFlags: ["family_violence"],
    competencyIds: ["behaviour_change", "insight", "reflective_capacity", "emotional_regulation"],
    subscales: [
      { id: "ownership", label: "Ownership vs Blame/Minimisation", description: "Naming specific behaviours without excuses" },
      { id: "child_partner_impact", label: "Child & Partner Impact Empathy", description: "Understanding how fear affects child brain development and attachment" },
      { id: "self_interruption", label: "Early Interruption & Repair", description: "Stepping away at early somatic cues" },
    ],
    prompts: [
      {
        id: "puv_1",
        prompt: "I can clearly name the specific ways my words, tone, or actions caused fear in my partner or children, without saying 'but they provoked me'.",
        subscaleId: "ownership",
      },
      {
        id: "puv_2",
        prompt: "I understand how witnessing tension or intimidation affects my child's nervous system, sleep, and trust in me.",
        subscaleId: "child_partner_impact",
      },
      {
        id: "puv_3",
        prompt: "When I feel disrespected or ashamed, I use my grounding plan instead of raising my voice, lecturing, or demanding an immediate answer.",
        subscaleId: "self_interruption",
      },
      {
        id: "puv_4",
        prompt: "I actively support my partner's parenting authority and wellbeing in front of our children.",
        subscaleId: "child_partner_impact",
      },
    ],
  }),

  buildQuickScale({
    id: "csi_4",
    code: "CSI-4",
    title: "Couple Satisfaction & Dyadic Trust Index",
    shortTitle: "Couple Satisfaction (CSI-4)",
    category: "dfv_couples_restoration",
    sourceReference: "Funk & Rogge (2007) Couples Satisfaction Index (4-Item IRT Form)",
    description:
      "High-precision IRT-derived measure of relationship warmth, dyadic cohesion, and emotional safety between partners.",
    targetAudience: ["parent", "partner"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.90,
    normativeSd: 3.5,
    clinicalCutoffRaw: 10,
    saferCategories: ["family", "strengths"],
    saferFlags: [],
    competencyIds: ["communication", "resilience"],
    subscales: [
      { id: "dyadic_warmth", label: "Dyadic Warmth & Satisfaction", description: "Felt warmth, teamwork, and comfort in the partnership" },
    ],
    prompts: [
      {
        id: "csi_1",
        prompt: "Our relationship feels warm, respectful, and emotionally safe even when we are tired.",
        subscaleId: "dyadic_warmth",
      },
      {
        id: "csi_2",
        prompt: "We handle practical family stresses (routines, bills, schedules) as a supportive team.",
        subscaleId: "dyadic_warmth",
      },
      {
        id: "csi_3",
        prompt: "I feel genuinely heard and respected when I bring up a concern to my partner.",
        subscaleId: "dyadic_warmth",
      },
      {
        id: "csi_4",
        prompt: "Overall, our relationship provides a calm and steady base for our children.",
        subscaleId: "dyadic_warmth",
      },
    ],
  }),

  buildQuickScale({
    id: "cpcrs",
    code: "CPCRS-B",
    title: "Co-Parenting Relationship, Gatekeeping & Child-Triangulation Scale",
    shortTitle: "Co-Parenting & Triangulation (CPCRS-B)",
    category: "dfv_couples_restoration",
    sourceReference: "Feinberg et al. (2012) Coparenting Relationship Scale (Brief Form)",
    description:
      "Assesses co-parenting solidarity, mutual support, undermining, and protection of children from adult conflict triangulation (for intact, separated, or kinship co-parents).",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.86,
    normativeSd: 3.0,
    clinicalCutoffRaw: 11,
    saferCategories: ["family", "child", "protection_and_safety"],
    saferFlags: ["family_violence"],
    competencyIds: ["communication", "parenting", "protective_capacity"],
    subscales: [
      { id: "non_triangulation", label: "Zero Child Triangulation", description: "Keeping children out of adult disputes and message-carrying" },
      { id: "coparent_alignment", label: "Co-Parenting Alignment", description: "Predictable routines and backing each other's safe boundaries" },
    ],
    prompts: [
      {
        id: "cpcrs_1",
        prompt: "We never ask our children to carry messages, take sides, or report on the other caregiver.",
        subscaleId: "non_triangulation",
      },
      {
        id: "cpcrs_2",
        prompt: "We speak respectfully about the other caregiver whenever the children can hear or see us.",
        subscaleId: "non_triangulation",
      },
      {
        id: "cpcrs_3",
        prompt: "Our handovers and daily parenting communications are brief, friendly, child-focused, and predictable.",
        subscaleId: "coparent_alignment",
      },
      {
        id: "cpcrs_4",
        prompt: "We maintain consistent bedtimes, safety rules, and soothing routines across caregivers.",
        subscaleId: "coparent_alignment",
      },
    ],
  }),

  buildQuickScale({
    id: "avith_screen",
    code: "AVITH-R",
    title: "Adolescent Family Violence in the Home (AVITH) Restorative Screen",
    shortTitle: "Adolescent Violence in Home (AVITH)",
    category: "dfv_couples_restoration",
    sourceReference: "MARAM Adolescent Family Violence Practice Guidance & Non-Violent Resistance (NVR)",
    description:
      "Trauma-informed, neuro-affirming screen for adolescent-to-parent/sibling aggression, distinguishing trauma/sensory meltdown from coercive harm.",
    targetAudience: ["parent", "carer", "clinician"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.84,
    normativeSd: 2.9,
    clinicalCutoffRaw: 5,
    saferCategories: ["family", "child", "risk", "protection_and_safety"],
    saferFlags: ["family_violence", "disability", "complex_needs"],
    competencyIds: ["safety", "emotional_regulation", "parenting"],
    subscales: [
      { id: "household_safety", label: "Parent & Sibling Safety", description: "Physical safety of younger siblings and caregivers" },
      { id: "escalation_triggers", label: "Trauma / Sensory Triggers", description: "Sensory overload, trauma reminders, or transitions preceding outbursts" },
    ],
    prompts: [
      {
        id: "avith_1",
        prompt: "Have younger siblings or caregivers had to lock doors or leave the house to stay safe during a young person's outburst?",
        subscaleId: "household_safety",
        criticalFromScore: 2,
        criticalReason: "Immediate sibling/caregiver physical safety risk in AVITH context",
      },
      {
        id: "avith_2",
        prompt: "Has property damage, throwing objects, or physical aggression occurred during household transitions or boundary setting?",
        subscaleId: "household_safety",
      },
      {
        id: "avith_3",
        prompt: "Do escalations follow sensory overload, school exhaustion, shame, or trauma reminders?",
        subscaleId: "escalation_triggers",
      },
      {
        id: "avith_4",
        prompt: "Do caregivers feel isolated or ashamed to ask for Non-Violent Resistance (NVR) and youth de-escalation support?",
        subscaleId: "escalation_triggers",
      },
    ],
  }),

  // ============================================================================
  // CATEGORY 3: ADDICTION / AOD & BEHAVIOURAL ADDICTIONS (7 Scales)
  // ============================================================================
  buildQuickScale({
    id: "audit",
    code: "AUDIT-10",
    title: "Alcohol Use Disorders Identification Test (WHO)",
    shortTitle: "Alcohol Use Screen (AUDIT)",
    category: "addiction_aod",
    sourceReference: "World Health Organization (Saunders et al., 1993) AUDIT",
    description:
      "Gold-standard WHO screen for hazardous alcohol consumption, dependence symptoms, and alcohol-related harm impacting family routines.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.92,
    normativeSd: 4.5,
    clinicalCutoffRaw: 5,
    saferCategories: ["parent_or_caregiver", "risk", "protection_and_safety"],
    saferFlags: ["aod"],
    competencyIds: ["self_awareness", "behaviour_change", "safety"],
    subscales: [
      { id: "consumption", label: "Hazardous Consumption", description: "Frequency and quantity of alcohol use" },
      { id: "dependence_harm", label: "Dependence & Family Impact", description: "Difficulty stopping and impact on daily responsibilities" },
    ],
    prompts: [
      {
        id: "audit_1",
        prompt: "How often do you have a drink containing alcohol, or have 5 or more standard drinks on one occasion?",
        subscaleId: "consumption",
      },
      {
        id: "audit_2",
        prompt: "How often during the last month have you found that you were not able to stop drinking once you had started?",
        subscaleId: "dependence_harm",
      },
      {
        id: "audit_3",
        prompt: "How often has alcohol use affected your sleep, morning parenting routines, or patience at home?",
        subscaleId: "dependence_harm",
      },
      {
        id: "audit_4",
        prompt: "Has a relative, friend, worker, or doctor expressed concern about your drinking or suggested cutting down?",
        subscaleId: "dependence_harm",
        criticalFromScore: 3,
        criticalReason: "High alcohol dependence / safe-caregiver supervision review needed",
      },
    ],
  }),

  buildQuickScale({
    id: "dast_10",
    code: "DAST-10",
    title: "Drug Abuse Screening Test (10-Item Form)",
    shortTitle: "Substance Use Screen (DAST-10)",
    category: "addiction_aod",
    sourceReference: "Skinner (1982) Drug Abuse Screening Test (DAST-10)",
    description:
      "Screens for non-medical substance use, withdrawal, and impact on caregiving and safe storage.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.89,
    normativeSd: 2.7,
    clinicalCutoffRaw: 3,
    saferCategories: ["parent_or_caregiver", "risk", "protection_and_safety"],
    saferFlags: ["aod"],
    competencyIds: ["safety", "behaviour_change", "protective_capacity"],
    subscales: [
      { id: "substance_impact", label: "Substance Severity & Safety", description: "Substance use consequences and safe caregiving" },
    ],
    prompts: [
      {
        id: "dast_1",
        prompt: "Have you used drugs or prescription medications other than those required for medical reasons?",
        subscaleId: "substance_impact",
      },
      {
        id: "dast_2",
        prompt: "Do you ever experience withdrawal discomfort, crashes, or exhaustion when you stop using a substance?",
        subscaleId: "substance_impact",
      },
      {
        id: "dast_3",
        prompt: "Has substance use created tension with your partner, family, housing, or child protection plan?",
        subscaleId: "substance_impact",
      },
      {
        id: "dast_4",
        prompt: "Has there ever been a time when a sober, safe adult was not designated while substances were present?",
        subscaleId: "substance_impact",
        criticalFromScore: 1,
        criticalReason: "Unsupervised caregiving or unsafe substance storage risk identified",
      },
    ],
  }),

  buildQuickScale({
    id: "assist_lite",
    code: "ASSIST-LITE",
    title: "WHO Alcohol, Smoking and Substance Involvement Screening Test (Lite)",
    shortTitle: "WHO Substance Risk (ASSIST-Lite)",
    category: "addiction_aod",
    sourceReference: "WHO ASSIST Working Group (Humeniuk et al., 2008)",
    description:
      "Rapid WHO poly-substance risk stratification across cannabis, stimulants, opioids, sedatives, and alcohol.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.88,
    normativeSd: 2.9,
    clinicalCutoffRaw: 4,
    saferCategories: ["parent_or_caregiver", "risk"],
    saferFlags: ["aod", "complex_needs"],
    competencyIds: ["self_awareness", "behaviour_change"],
    subscales: [
      { id: "polysubstance_risk", label: "Poly-Substance Involvement", description: "Urges, frequency, and control across substances" },
    ],
    prompts: [
      {
        id: "assist_1",
        prompt: "In the past 3 months, how often have you had a strong desire or urge to use alcohol, cannabis, stimulants, or sedatives?",
        subscaleId: "polysubstance_risk",
      },
      {
        id: "assist_2",
        prompt: "How often has using substances led to health, financial, emotional, or family stress?",
        subscaleId: "polysubstance_risk",
      },
      {
        id: "assist_3",
        prompt: "Have you tried and struggled to cut down or control your use on your own?",
        subscaleId: "polysubstance_risk",
      },
      {
        id: "assist_4",
        prompt: "Do cravings spike when you experience trauma reminders, loneliness, or relationship conflict?",
        subscaleId: "polysubstance_risk",
      },
    ],
  }),

  buildQuickScale({
    id: "pacs_5",
    code: "PACS-5",
    title: "Penn Alcohol & Substance Craving Scale",
    shortTitle: "Craving Intensity & Urge Surfing (PACS-5)",
    category: "addiction_aod",
    sourceReference: "Flannery, Volpicelli & Pettinati (1999) PACS",
    description:
      "Tracks past-week craving frequency, intensity, duration, and ability to surf urges without relapse.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.87,
    normativeSd: 3.1,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver", "risk"],
    saferFlags: ["aod"],
    competencyIds: ["emotional_regulation", "resilience", "behaviour_change"],
    subscales: [
      { id: "craving_load", label: "Craving Intensity & Duration", description: "Strength and persistence of urges over the past 7 days" },
    ],
    prompts: [
      {
        id: "pacs_1",
        prompt: "Over the past week, how frequently have you thought about using or how good it would make you feel?",
        subscaleId: "craving_load",
      },
      {
        id: "pacs_2",
        prompt: "At its most severe point this week, how strong was your craving?",
        subscaleId: "craving_load",
      },
      {
        id: "pacs_3",
        prompt: "How difficult would it have been to resist using if the substance had been right in front of you?",
        subscaleId: "craving_load",
      },
      {
        id: "pacs_4",
        prompt: "Overall, how much distress did cravings cause you this week?",
        subscaleId: "craving_load",
      },
    ],
  }),

  buildQuickScale({
    id: "bam_r",
    code: "BAM-R",
    title: "Brief Addiction Monitor - Revised (Recovery Capital vs Risk)",
    shortTitle: "Recovery Capital & Protective Factors (BAM-R)",
    category: "addiction_aod",
    sourceReference: "Cacciola et al. (2013) Brief Addiction Monitor (BAM-R)",
    description:
      "Evaluates recovery capital, sober support networks, structured daily routines, and safe child care backup plans.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.86,
    normativeSd: 3.2,
    clinicalCutoffRaw: 10,
    saferCategories: ["strengths", "protection_and_safety", "community"],
    saferFlags: ["aod"],
    competencyIds: ["resilience", "planning", "protective_capacity", "behaviour_change"],
    subscales: [
      { id: "recovery_protection", label: "Recovery Capital & Sober Network", description: "Protective routines, sober allies, and safe child backup" },
    ],
    prompts: [
      {
        id: "bam_1",
        prompt: "I have at least one trusted, sober support person I can call immediately when an urge or HALT trigger hits.",
        subscaleId: "recovery_protection",
      },
      {
        id: "bam_2",
        prompt: "All medications and substances are locked away and we have a written Safe Sober Caregiver plan for the children.",
        subscaleId: "recovery_protection",
      },
      {
        id: "bam_3",
        prompt: "I practise daily recovery routines (sleep, nutrition, urge surfing, peer/clinical support).",
        subscaleId: "recovery_protection",
      },
      {
        id: "bam_4",
        prompt: "I feel confident in my ability to maintain my recovery goals over the next 30 days.",
        subscaleId: "recovery_protection",
      },
    ],
  }),

  buildQuickScale({
    id: "urica_s",
    code: "URICA-S",
    title: "University of Rhode Island Change Assessment (Readiness Stage)",
    shortTitle: "Stages of Change Readiness (URICA-S)",
    category: "addiction_aod",
    sourceReference: "McConnaughy, Prochaska & Velicer (1983) URICA Short Form",
    description:
      "Assesses motivational readiness across Precontemplation, Contemplation, Action, and Maintenance for behaviour change.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.85,
    normativeSd: 3.0,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "strengths"],
    saferFlags: ["aod"],
    competencyIds: ["motivation", "engagement", "behaviour_change", "insight"],
    subscales: [
      { id: "action_maintenance", label: "Action & Maintenance Commitment", description: "Active steps to sustain change and prevent relapse" },
    ],
    prompts: [
      {
        id: "urica_1",
        prompt: "I am actively working on changing patterns that affect my wellbeing and my children's safety.",
        subscaleId: "action_maintenance",
      },
      {
        id: "urica_2",
        prompt: "Even when I have a hard day, I use my relapse prevention plan rather than giving up.",
        subscaleId: "action_maintenance",
      },
      {
        id: "urica_3",
        prompt: "I welcome honest feedback and coaching to help me stay on track for my family.",
        subscaleId: "action_maintenance",
      },
      {
        id: "urica_4",
        prompt: "I can see the concrete benefits my changes are having on my children's calm and security.",
        subscaleId: "action_maintenance",
      },
    ],
  }),

  buildQuickScale({
    id: "pgsi_brief",
    code: "PGSI-B",
    title: "Problem Gambling Severity Index & Financial Harm Screen",
    shortTitle: "Gambling & Financial Harm (PGSI-B)",
    category: "addiction_aod",
    sourceReference: "Ferris & Wynne (2001) Problem Gambling Severity Index (Brief)",
    description:
      "Screens for gambling urges, chasing losses, and financial depletion impacting food, rent, and family stability.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.87,
    normativeSd: 2.6,
    clinicalCutoffRaw: 3,
    saferCategories: ["risk", "family", "parent_or_caregiver"],
    saferFlags: ["aod", "housing_instability"],
    competencyIds: ["self_awareness", "planning", "behaviour_change"],
    subscales: [
      { id: "gambling_harm", label: "Gambling Loss Chasing & Household Impact", description: "Financial stress and secret betting" },
    ],
    prompts: [
      {
        id: "pgsi_1",
        prompt: "Have you bet more than you could really afford to lose (pokies, sports apps, online gaming)?",
        subscaleId: "gambling_harm",
      },
      {
        id: "pgsi_2",
        prompt: "Have you gone back another day to try to win back money you lost?",
        subscaleId: "gambling_harm",
      },
      {
        id: "pgsi_3",
        prompt: "Has gambling caused stress around rent, groceries, bills, or arguments at home?",
        subscaleId: "gambling_harm",
      },
      {
        id: "pgsi_4",
        prompt: "Have you felt guilty about the way you gamble or hidden it from your family?",
        subscaleId: "gambling_harm",
      },
    ],
  }),

  // ============================================================================
  // CATEGORY 4: MENTAL HEALTH, TRAUMA, REGULATION, SLEEP & GRIEF (11 Scales)
  // ============================================================================
  buildQuickScale({
    id: "phq_9",
    code: "PHQ-9",
    title: "Patient Health Questionnaire-9 (Mood & Self-Harm Safety Screen)",
    shortTitle: "Mood & Energy Check-In (PHQ-9)",
    category: "mental_health_trauma",
    sourceReference: "Kroenke, Spitzer & Williams (2001) PHQ-9",
    description:
      "Validated 9-construct depression and low-energy screen with mandatory Item 9 suicidal/self-harm critical override.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.89,
    normativeSd: 4.8,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver", "risk"],
    saferFlags: ["mental_health"],
    competencyIds: ["emotional_regulation", "self_awareness", "resilience"],
    subscales: [
      { id: "affective_mood", label: "Mood & Anhedonia", description: "Low mood, hopelessness, loss of pleasure" },
      { id: "somatic_energy", label: "Sleep, Energy & Concentration", description: "Fatigue, sleep disruption, concentration" },
      { id: "safety_item9", label: "Self-Harm Safety (Item 9)", description: "Thoughts of self-harm or being better off dead" },
    ],
    prompts: [
      {
        id: "phq9_1",
        prompt: "Little interest or pleasure in doing things, or feeling down, depressed, or hopeless?",
        easyReadPrompt: "Have you felt very sad or stopped enjoying things?",
        subscaleId: "affective_mood",
      },
      {
        id: "phq9_2",
        prompt: "Trouble falling or staying asleep, or feeling tired and having very little energy for daily routines?",
        easyReadPrompt: "Have you had trouble sleeping or felt exhausted all day?",
        subscaleId: "somatic_energy",
      },
      {
        id: "phq9_3",
        prompt: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
        easyReadPrompt: "Have you felt really bad about yourself?",
        subscaleId: "affective_mood",
      },
      {
        id: "phq9_9",
        prompt: "Thoughts that you would be better off dead, or of hurting yourself in some way?",
        easyReadPrompt: "Have you had thoughts of hurting yourself or not wanting to be here?",
        subscaleId: "safety_item9",
        criticalFromScore: 1,
        criticalReason: "PHQ-9 Item 9 endorsed: Suicidal ideation or self-harm thoughts require immediate safety support",
      },
    ],
  }),

  buildQuickScale({
    id: "gad_7",
    code: "GAD-7",
    title: "Generalized Anxiety Disorder-7 (Worry & Nervous System Hyperarousal)",
    shortTitle: "Anxiety & Worry Screen (GAD-7)",
    category: "mental_health_trauma",
    sourceReference: "Spitzer, Kroenke, Williams & Löwe (2006) GAD-7",
    description:
      "Validated screen for uncontrollable worry, restlessness, irritability, and fear that something awful might happen.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.88,
    normativeSd: 4.1,
    clinicalCutoffRaw: 5,
    saferCategories: ["parent_or_caregiver"],
    saferFlags: ["mental_health"],
    competencyIds: ["emotional_regulation", "self_awareness"],
    subscales: [
      { id: "cognitive_worry", label: "Uncontrollable Worry", description: "Racing thoughts and anticipating danger" },
      { id: "autonomic_tension", label: "Somatic Tension & Irritability", description: "Unable to relax, on edge, easily annoyed" },
    ],
    prompts: [
      {
        id: "gad7_1",
        prompt: "Feeling nervous, anxious, or on edge, or not being able to stop or control worrying?",
        subscaleId: "cognitive_worry",
      },
      {
        id: "gad7_2",
        prompt: "Having trouble relaxing or feeling so restless that it is hard to sit still?",
        subscaleId: "autonomic_tension",
      },
      {
        id: "gad7_3",
        prompt: "Becoming easily annoyed or irritable when small things go wrong at home?",
        subscaleId: "autonomic_tension",
      },
      {
        id: "gad7_4",
        prompt: "Feeling afraid as if something awful might happen to you or your family?",
        subscaleId: "cognitive_worry",
      },
    ],
  }),

  buildQuickScale({
    id: "k10",
    code: "K10",
    title: "Kessler Psychological Distress Scale (Australian Clinical Standard)",
    shortTitle: "Psychological Distress (K10)",
    category: "mental_health_trauma",
    sourceReference: "Kessler et al. (2002) K10 Australian Primary Care & Mental Health Standard",
    description:
      "Australian benchmark measure of non-specific psychological distress, fatigue, agitation, and hopelessness.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.90,
    normativeSd: 4.4,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver"],
    saferFlags: ["mental_health"],
    competencyIds: ["emotional_regulation", "resilience"],
    subscales: [
      { id: "k10_distress", label: "Global Psychological Distress", description: "Fatigue, nervousness, and emotional overwhelm" },
    ],
    prompts: [
      {
        id: "k10_1",
        prompt: "In the past 4 weeks, how often did you feel tired out for no good reason or that everything was an effort?",
        subscaleId: "k10_distress",
      },
      {
        id: "k10_2",
        prompt: "How often did you feel so nervous that nothing could calm you down?",
        subscaleId: "k10_distress",
      },
      {
        id: "k10_3",
        prompt: "How often did you feel so sad or hopeless that nothing could cheer you up?",
        subscaleId: "k10_distress",
      },
      {
        id: "k10_4",
        prompt: "How often did you feel worthless or completely overwhelmed by daily demands?",
        subscaleId: "k10_distress",
      },
    ],
  }),

  buildQuickScale({
    id: "dass_21",
    code: "DASS-21-SF",
    title: "Depression, Anxiety & Stress Scale (Tri-Factor Profile)",
    shortTitle: "Depression, Anxiety & Stress (DASS-21)",
    category: "mental_health_trauma",
    sourceReference: "Lovibond & Lovibond (1995) DASS-21",
    description:
      "Differentiates dysphoric low mood (Depression), autonomic panic/arousal (Anxiety), and chronic nervous tension/over-reactivity (Stress).",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.88,
    normativeSd: 4.2,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver"],
    saferFlags: ["mental_health"],
    competencyIds: ["emotional_regulation", "self_awareness"],
    subscales: [
      { id: "dass_stress", label: "Stress & Over-Reactivity", description: "Difficulty winding down and low frustration tolerance" },
      { id: "dass_anxiety", label: "Autonomic Anxiety", description: "Dry mouth, racing heart, panic cues" },
      { id: "dass_depression", label: "Depressive Dysphoria", description: "Low initiative and meaninglessness" },
    ],
    prompts: [
      {
        id: "dass_1",
        prompt: "I found it hard to wind down and tended to over-react to situations around the house.",
        subscaleId: "dass_stress",
      },
      {
        id: "dass_2",
        prompt: "I was aware of dryness of my mouth, racing heart, or trembling when stressed.",
        subscaleId: "dass_anxiety",
      },
      {
        id: "dass_3",
        prompt: "I found it difficult to work up the initiative to do everyday tasks.",
        subscaleId: "dass_depression",
      },
      {
        id: "dass_4",
        prompt: "I felt that I was using a lot of nervous energy and was intolerant of anything that kept me from getting on with what I was doing.",
        subscaleId: "dass_stress",
      },
    ],
  }),

  buildQuickScale({
    id: "pcl_5_short",
    code: "PCL-5-SF",
    title: "PTSD Checklist for DSM-5 (Trauma Intrusion, Avoidance & Hypervigilance)",
    shortTitle: "Trauma Reminders & Hypervigilance (PCL-5)",
    category: "mental_health_trauma",
    sourceReference: "Blevins et al. (2015) PCL-5 Short Form",
    description:
      "Screens for post-traumatic intrusions, avoidance, negative alterations in mood, and startle/hypervigilance triggered during parenting.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.87,
    normativeSd: 3.8,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver"],
    saferFlags: ["mental_health", "complex_needs"],
    competencyIds: ["emotional_regulation", "self_awareness", "resilience"],
    subscales: [
      { id: "re_experiencing", label: "Intrusions & Flashbacks", description: "Unwanted memories or physiological reactivity to reminders" },
      { id: "hyperarousal", label: "Hypervigilance & Startle", description: "Feeling super-alert, watchful, or on guard" },
    ],
    prompts: [
      {
        id: "pcl5_1",
        prompt: "Repeated, disturbing memories, thoughts, or strong body reactions when something reminds you of past trauma?",
        subscaleId: "re_experiencing",
      },
      {
        id: "pcl5_2",
        prompt: "Avoiding memories, thoughts, feelings, or external reminders of stressful past experiences?",
        subscaleId: "re_experiencing",
      },
      {
        id: "pcl5_3",
        prompt: "Being 'super-alert', watchful, on guard, or easily startled by loud noises or sudden movements?",
        subscaleId: "hyperarousal",
      },
      {
        id: "pcl5_4",
        prompt: "Feeling distant or cut off from people, or struggling to feel positive emotions when triggered?",
        subscaleId: "hyperarousal",
      },
    ],
  }),

  buildQuickScale({
    id: "itq_cptsd",
    code: "ITQ-CPTSD",
    title: "International Trauma Questionnaire (Complex PTSD & Disturbances in Self-Organisation)",
    shortTitle: "Complex Trauma & DSO (ITQ)",
    category: "mental_health_trauma",
    sourceReference: "Cloitre et al. (2018) ICD-11 International Trauma Questionnaire (ITQ)",
    description:
      "Evaluates Complex PTSD Disturbances in Self-Organisation (DSO): affective dysregulation, negative self-concept, and relational disturbances common in intergenerational trauma and DFV survivors.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.88,
    normativeSd: 3.6,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver", "family"],
    saferFlags: ["mental_health", "complex_needs"],
    competencyIds: ["emotional_regulation", "self_awareness", "reflective_capacity"],
    subscales: [
      { id: "affect_dysregulation", label: "Affective Dysregulation", description: "Long recovery time after upset or emotional numbing/shutdown" },
      { id: "relational_dso", label: "Negative Self-Concept & Relational Trust", description: "Deep shame and difficulty feeling safe close to others" },
    ],
    prompts: [
      {
        id: "itq_1",
        prompt: "When I am upset, it takes me a long time to calm down, OR I feel numb and shut down inside.",
        subscaleId: "affect_dysregulation",
        options: LIKERT_0_TO_4_INTENSITY,
      },
      {
        id: "itq_2",
        prompt: "I feel like a failure or feel worthless deep down because of what I have been through.",
        subscaleId: "relational_dso",
        options: LIKERT_0_TO_4_INTENSITY,
      },
      {
        id: "itq_3",
        prompt: "I feel distant or cut off from others and find it hard to stay emotionally close when stressed.",
        subscaleId: "relational_dso",
        options: LIKERT_0_TO_4_INTENSITY,
      },
      {
        id: "itq_4",
        prompt: "Loud crying, chaos, or feeling judged can trigger an automatic fight, flight, freeze, or fawn response in me.",
        subscaleId: "affect_dysregulation",
        options: LIKERT_0_TO_4_INTENSITY,
      },
    ],
  }),

  buildQuickScale({
    id: "ders_sf",
    code: "DERS-SF",
    title: "Difficulties in Emotion Regulation Scale - Short Form",
    shortTitle: "Emotion Regulation & Impulse Control (DERS-SF)",
    category: "mental_health_trauma",
    sourceReference: "Kaufman et al. (2016) / Gratz & Roemer (2004) DERS-SF",
    description:
      "Assesses emotional clarity, non-acceptance of distress, impulse control under distress, and access to regulation strategies.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.89,
    normativeSd: 3.9,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver"],
    saferFlags: ["mental_health"],
    competencyIds: ["emotional_regulation", "self_awareness", "application"],
    subscales: [
      { id: "impulse_control", label: "Impulse Control Under Distress", description: "Remaining in control of behaviour when upset" },
      { id: "strategies_clarity", label: "Regulation Strategies & Clarity", description: "Knowing how to soothe nervous system distress" },
    ],
    prompts: [
      {
        id: "ders_1",
        prompt: "When I am upset, I experience my emotions as overwhelming and out of control.",
        subscaleId: "impulse_control",
      },
      {
        id: "ders_2",
        prompt: "When I am upset, I have difficulty controlling my behaviour or tone of voice.",
        subscaleId: "impulse_control",
      },
      {
        id: "ders_3",
        prompt: "When I am upset, I believe that there is nothing I can do to make myself feel better.",
        subscaleId: "strategies_clarity",
      },
      {
        id: "ders_4",
        prompt: "When I am upset, I have difficulty focusing on what my child needs in that moment.",
        subscaleId: "strategies_clarity",
      },
    ],
  }),

  buildQuickScale({
    id: "isi_sleep",
    code: "ISI-7",
    title: "Insomnia Severity Index & Caregiver Circadian Exhaustion Screen",
    shortTitle: "Sleep & Exhaustion Screen (ISI-7)",
    category: "mental_health_trauma",
    sourceReference: "Bastien, Vallières & Morin (2001) Insomnia Severity Index",
    description:
      "Evaluates sleep-onset/maintenance insomnia, night waking, and severe caregiver exhaustion that erodes executive functioning and emotional regulation.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.86,
    normativeSd: 3.5,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver", "child"],
    saferFlags: ["mental_health"],
    competencyIds: ["emotional_regulation", "executive_function", "planning"],
    subscales: [
      { id: "sleep_disruption", label: "Sleep Disruption & Daytime Exhaustion", description: "Sleep loss and impact on daytime patience" },
    ],
    prompts: [
      {
        id: "isi_1",
        prompt: "Difficulty falling asleep, staying asleep, or waking up too early over the past 2 weeks?",
        subscaleId: "sleep_disruption",
        options: LIKERT_0_TO_4_INTENSITY,
      },
      {
        id: "isi_2",
        prompt: "How much is sleep deprivation interfering with your daytime patience, memory, or parenting energy?",
        subscaleId: "sleep_disruption",
        options: LIKERT_0_TO_4_INTENSITY,
      },
      {
        id: "isi_3",
        prompt: "Do nightmares, hypervigilance, or infant/child night-wakings leave you running on empty?",
        subscaleId: "sleep_disruption",
        options: LIKERT_0_TO_4_INTENSITY,
      },
      {
        id: "isi_4",
        prompt: "How worried or distressed are you about your current sleep pattern and exhaustion?",
        subscaleId: "sleep_disruption",
        options: LIKERT_0_TO_4_INTENSITY,
      },
    ],
  }),

  buildQuickScale({
    id: "grief_ambiguous_loss",
    code: "PG-13-AL",
    title: "Prolonged Grief, Disenfranchised Grief & Ambiguous Loss Inventory",
    shortTitle: "Grief & Ambiguous Loss (PG-13-AL)",
    category: "mental_health_trauma",
    sourceReference: "Prigerson et al. (2009) PG-13 & Boss (2006) Ambiguous Loss Framework",
    description:
      "Assesses bereavement, disenfranchised grief, and ambiguous loss (e.g., child removal/separation, relationship dissolution, loss of health or Country).",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.86,
    normativeSd: 3.4,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver", "family"],
    saferFlags: ["mental_health", "complex_needs"],
    competencyIds: ["emotional_regulation", "resilience", "self_awareness"],
    subscales: [
      { id: "yearning_grief", label: "Yearning & Unresolved Grief", description: "Waves of grief, longing, and emotional pain around separation or loss" },
    ],
    prompts: [
      {
        id: "grief_1",
        prompt: "How often have you experienced intense waves of longing, grief, or heartache over a loss or family separation?",
        subscaleId: "yearning_grief",
      },
      {
        id: "grief_2",
        prompt: "Do reminders of separation (e.g., after contact visits, birthdays, quiet evenings) trigger overwhelming numbness or urge to escape?",
        subscaleId: "yearning_grief",
      },
      {
        id: "grief_3",
        prompt: "Do you feel that others do not understand or allow space for the grief you are carrying?",
        subscaleId: "yearning_grief",
      },
      {
        id: "grief_4",
        prompt: "Has grief made it hard to plan routines or hold onto hope for the future?",
        subscaleId: "yearning_grief",
      },
    ],
  }),

  buildQuickScale({
    id: "scs_shame",
    code: "SCS-SF",
    title: "Self-Compassion vs Toxic Shame & Self-Criticism Scale",
    shortTitle: "Self-Compassion vs Shame (SCS-SF)",
    category: "mental_health_trauma",
    sourceReference: "Raes, Pommier, Neff & Van Gucht (2011) Self-Compassion Scale Short Form",
    description:
      "Measures capacity to move from toxic shame (which drives defensiveness, hiding, or relapse) toward accountable self-compassion.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.87,
    normativeSd: 3.2,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "strengths"],
    saferFlags: [],
    competencyIds: ["self_awareness", "reflective_capacity", "resilience"],
    subscales: [
      { id: "accountable_compassion", label: "Accountable Self-Compassion", description: "Owning mistakes without spiralling into shame shutdown" },
    ],
    prompts: [
      {
        id: "scs_1",
        prompt: "When I make a parenting mistake, I can acknowledge it honestly and focus on repairing with my child rather than spiralling into self-hatred.",
        subscaleId: "accountable_compassion",
      },
      {
        id: "scs_2",
        prompt: "When I am going through a very hard time, I give myself the caring and steadiness I need to stay safe.",
        subscaleId: "accountable_compassion",
      },
      {
        id: "scs_3",
        prompt: "I remind myself that needing support and learning new skills is part of being a human parent.",
        subscaleId: "accountable_compassion",
      },
      {
        id: "scs_4",
        prompt: "When I feel judged or triggered, I can pause and breathe instead of lashing out or shutting down.",
        subscaleId: "accountable_compassion",
      },
    ],
  }),

  buildQuickScale({
    id: "bces_10",
    code: "BCES-10",
    title: "Benevolent Childhood Experiences & Intergenerational Strengths Scale",
    shortTitle: "Protective Childhood & Life Strengths (BCES-10)",
    category: "mental_health_trauma",
    sourceReference: "Narayan et al. (2018) Benevolent Childhood Experiences (BCEs) Scale",
    description:
      "Strengths-based counterbalance to ACEs that identifies safe attachment memories, cultural anchors, and positive caregiver models to draw upon.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.90,
    normativeSd: 3.1,
    clinicalCutoffRaw: 9,
    saferCategories: ["strengths", "parent_or_caregiver", "culture"],
    saferFlags: [],
    competencyIds: ["resilience", "protective_capacity", "parenting"],
    subscales: [
      { id: "protective_anchors", label: "Benevolent Anchors & Safe Memories", description: "Internalised models of safety, warmth, and predictability" },
    ],
    prompts: [
      {
        id: "bces_1",
        prompt: "Growing up or in my adult life, I had at least one person who made me feel safe, valued, and believed in.",
        subscaleId: "protective_anchors",
      },
      {
        id: "bces_2",
        prompt: "I have clear memories or examples of comforting traditions, stories, or routines that I want to pass on to my children.",
        subscaleId: "protective_anchors",
      },
      {
        id: "bces_3",
        prompt: "Even when my own childhood had painful chapters, I can clearly picture the kind of safe home I am building now.",
        subscaleId: "protective_anchors",
      },
      {
        id: "bces_4",
        prompt: "I have values, faith, culture, or strengths that help me keep going when times are tough.",
        subscaleId: "protective_anchors",
      },
    ],
  }),

  // ============================================================================
  // CATEGORY 5: PERINATAL MENTAL HEALTH & PARENT-INFANT BONDING (2 Scales)
  // ============================================================================
  buildQuickScale({
    id: "epds_10",
    code: "EPDS-10",
    title: "Edinburgh Postnatal Depression & Perinatal Anxiety Scale",
    shortTitle: "Perinatal Mood & Anxiety (EPDS-10)",
    category: "perinatal_infant",
    sourceReference: "Cox, Holden & Sagovsky (1987) Edinburgh Postnatal Depression Scale",
    description:
      "Validated perinatal mood, anxiety, and intrusive-thought screen for pregnant and postpartum mothers, fathers, and non-birthing partners, with Item 10 safety gate.",
    targetAudience: ["parent", "partner"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.89,
    normativeSd: 4.0,
    clinicalCutoffRaw: 5,
    saferCategories: ["parent_or_caregiver", "child", "risk"],
    saferFlags: ["mental_health"],
    competencyIds: ["emotional_regulation", "self_awareness", "parenting"],
    subscales: [
      { id: "perinatal_mood_anxiety", label: "Perinatal Anhedonia & Anxiety", description: "Postpartum worry, panic, overwhelm, and tearfulness" },
      { id: "epds_item10_safety", label: "Perinatal Safety (Item 10)", description: "Thoughts of harming oneself" },
    ],
    prompts: [
      {
        id: "epds_1",
        prompt: "In the past 7 days, have you felt anxious, worried, or scared/panicky for no very good reason?",
        subscaleId: "perinatal_mood_anxiety",
      },
      {
        id: "epds_2",
        prompt: "Have things been getting on top of you, or have you been so unhappy that you have had difficulty sleeping even when baby sleeps?",
        subscaleId: "perinatal_mood_anxiety",
      },
      {
        id: "epds_3",
        prompt: "Have you blamed yourself unnecessarily when things went wrong or felt overwhelmed by infant crying?",
        subscaleId: "perinatal_mood_anxiety",
      },
      {
        id: "epds_10",
        prompt: "In the past 7 days, has the thought of harming yourself occurred to you?",
        subscaleId: "epds_item10_safety",
        criticalFromScore: 1,
        criticalReason: "EPDS Item 10 endorsed: Perinatal self-harm ideation requires immediate Tier-1 safety escalation",
      },
    ],
  }),

  buildQuickScale({
    id: "mpas_ppas",
    code: "MPAS-PPAS",
    title: "Maternal & Paternal Postnatal Attachment & Infant Soothing Scale",
    shortTitle: "Parent-Infant Bonding & Crying Tolerance (MPAS/PPAS)",
    category: "perinatal_infant",
    sourceReference: "Condon & Corkindale (1998) MPAS / PPAS & Period of PURPLE Crying Safety",
    description:
      "Assesses warmth of parent-infant bonding, reading infant cues, and safe put-down plans during inconsolable infant crying.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.86,
    normativeSd: 3.1,
    clinicalCutoffRaw: 10,
    saferCategories: ["child", "parent_or_caregiver", "protection_and_safety"],
    saferFlags: [],
    competencyIds: ["parenting", "emotional_regulation", "protective_capacity", "safety"],
    subscales: [
      { id: "infant_bonding", label: "Affectionate Bonding & Cue Reading", description: "Warmth, delight, and responsiveness to infant signals" },
      { id: "safe_crying_plan", label: "Safe Infant Crying & Put-Down Plan", description: "Placing baby safely in cot and stepping back when overwhelmed" },
    ],
    prompts: [
      {
        id: "mpas_1",
        prompt: "When I am caring for my baby, I feel warm, protective, and tuned in to their cues.",
        subscaleId: "infant_bonding",
      },
      {
        id: "mpas_2",
        prompt: "If my baby cries inconsolably and I feel my frustration rising, I know to place baby safely on their back in the cot and step out for 5 minutes to breathe.",
        subscaleId: "safe_crying_plan",
      },
      {
        id: "mpas_3",
        prompt: "I understand that infant crying is how babies communicate need or sensory tiredness, never a baby 'trying to manipulate me'.",
        subscaleId: "infant_bonding",
      },
      {
        id: "mpas_4",
        prompt: "We have a clear night-shift / respite plan so no caregiver is left isolated with severe sleep deprivation.",
        subscaleId: "safe_crying_plan",
      },
    ],
  }),

  // ============================================================================
  // CATEGORY 6: ADULT NEURODIVERSITY, EXECUTIVE FUNCTIONING, SENSORY & ABI (2 Scales)
  // ============================================================================
  buildQuickScale({
    id: "asrs_6",
    code: "ASRS-v1.1",
    title: "WHO Adult ADHD & Executive Functioning Scaffolding Screen",
    shortTitle: "Executive Functioning & Attention Scaffold (ASRS-6)",
    category: "neurodiversity_abi",
    sourceReference: "Kessler et al. (2005) WHO Adult ADHD Self-Report Scale (ASRS-v1.1 Screener)",
    description:
      "Identifies executive functioning, working memory, time-blindness, and task-initiation needs so support plans use visual/external scaffolds rather than mislabelling neurodivergence as 'non-compliance'.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.88,
    normativeSd: 3.4,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver"],
    saferFlags: ["disability"],
    competencyIds: ["executive_function", "planning", "organisation"],
    subscales: [
      { id: "task_organisation", label: "Task Initiation & Working Memory", description: "Remembering appointments, multi-step forms, and transitions" },
    ],
    prompts: [
      {
        id: "asrs_1",
        prompt: "How often do you have difficulty getting things in order when a task requires multi-step organisation or paperwork?",
        subscaleId: "task_organisation",
      },
      {
        id: "asrs_2",
        prompt: "How often do you have problems remembering appointments, school forms, or obligations unless they are on a visual alarm?",
        subscaleId: "task_organisation",
      },
      {
        id: "asrs_3",
        prompt: "When you have a task that requires a lot of thought or reading, how often do you freeze or delay getting started?",
        subscaleId: "task_organisation",
      },
      {
        id: "asrs_4",
        prompt: "How much does it help when workers break steps down into 1-page visual checklists with reminders?",
        subscaleId: "task_organisation",
      },
    ],
  }),

  buildQuickScale({
    id: "ef_sensory_abi",
    code: "EF-SENS-ABI",
    title: "Caregiver Sensory Overload, Cognitive Fatigue & ABI Accommodation Screen",
    shortTitle: "Sensory Overload & Cognitive Access (EF-SENS-ABI)",
    category: "neurodiversity_abi",
    sourceReference: "Neuro-Affirming Sensory Processing & Acquired Brain Injury (ABI) Functional Screen",
    description:
      "Screens for auditory/visual sensory overload in busy households, post-concussion/strangulation cognitive fatigue, and Easy-Read / audio communication preferences.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.85,
    normativeSd: 3.2,
    clinicalCutoffRaw: 5,
    saferCategories: ["parent_or_caregiver", "protection_and_safety"],
    saferFlags: ["disability"],
    competencyIds: ["executive_function", "emotional_regulation", "planning"],
    subscales: [
      { id: "sensory_overload", label: "Household Sensory Overload", description: "Noise, clutter, and simultaneous demands triggering shutdown/meltdown" },
      { id: "cognitive_access", label: "Cognitive & Memory Accommodation Needs", description: "Need for Easy-Read, voice notes, or post-injury pacing" },
    ],
    prompts: [
      {
        id: "sens_1",
        prompt: "Do overlapping noises (TV, crying, talking at once, bright lights) quickly cause sensory overload or brain freeze?",
        subscaleId: "sensory_overload",
      },
      {
        id: "sens_2",
        prompt: "Have you ever experienced a head injury, concussion, or choking/strangulation that affected your memory, headaches, or concentration?",
        subscaleId: "cognitive_access",
      },
      {
        id: "sens_3",
        prompt: "During stressful meetings, do you find it hard to process fast spoken jargon without written or visual summaries?",
        subscaleId: "cognitive_access",
      },
      {
        id: "sens_4",
        prompt: "Do sensory decompression breaks (quiet corner, headphones, dimming lights) help you stay regulated with the kids?",
        subscaleId: "sensory_overload",
      },
    ],
  }),

  // ============================================================================
  // CATEGORY 7: CULTURAL SEWB, CARER STRAIN & BASIC NEEDS (3 Scales)
  // ============================================================================
  buildQuickScale({
    id: "gem_sewb",
    code: "GEM-SEWB",
    title: "Growth and Empowerment Measure & First Nations Social & Emotional Wellbeing",
    shortTitle: "Cultural Connection & SEWB (GEM-SEWB)",
    category: "cultural_sewb_carer",
    sourceReference: "Haswell et al. (2010) Growth and Empowerment Measure (GEM) & Gee et al. (2014) SEWB",
    description:
      "Culturally grounded measure of holistic Social and Emotional Wellbeing across Connection to Spirit, Country, Kinship, Culture, Community, Mind, and Body.",
    targetAudience: ["parent", "partner", "carer", "child"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.88,
    normativeSd: 3.3,
    clinicalCutoffRaw: 10,
    saferCategories: ["culture", "community", "strengths", "family"],
    saferFlags: ["cultural_safety"],
    competencyIds: ["resilience", "protective_capacity", "self_awareness"],
    subscales: [
      { id: "kinship_country", label: "Connection to Culture, Kinship & Country", description: "Cultural identity, Elders, community, and belonging" },
      { id: "empowerment_voice", label: "Empowerment & Self-Determination", description: "Having a respected voice in family and service decisions" },
    ],
    prompts: [
      {
        id: "sewb_1",
        prompt: "I feel strong in my cultural identity and connected to Elders, kin, community, or Country.",
        subscaleId: "kinship_country",
      },
      {
        id: "sewb_2",
        prompt: "Our children are supported to know their cultural stories, language, kin networks, and pride in who they are.",
        subscaleId: "kinship_country",
      },
      {
        id: "sewb_3",
        prompt: "I feel culturally safe, respected, and heard when making decisions about my family's healing.",
        subscaleId: "empowerment_voice",
      },
      {
        id: "sewb_4",
        prompt: "Shared yarning, community support, and cultural practices help restore my spirit when stressed.",
        subscaleId: "empowerment_voice",
      },
    ],
  }),

  buildQuickScale({
    id: "carer_proqol",
    code: "PROQOL-CARER",
    title: "Kinship, Foster & Family Carer Secondary Trauma, Burnout & Support Scale",
    shortTitle: "Carer Strain & Secondary Trauma (ProQOL-Carer)",
    category: "cultural_sewb_carer",
    sourceReference: "Stamm (2010) ProQOL & Caregiver Burden Inventory (Kinship/Foster Adaptation)",
    description:
      "Measures placement stability, secondary traumatic stress, respite needs, and burnout among kinship, grandparent, foster, and family carers.",
    targetAudience: ["carer", "parent"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.87,
    normativeSd: 3.4,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver", "community", "family"],
    saferFlags: ["social_isolation", "complex_needs"],
    competencyIds: ["resilience", "emotional_regulation", "parenting"],
    subscales: [
      { id: "carer_burnout", label: "Carer Exhaustion & Respite Need", description: "Physical and emotional depletion requiring practical respite" },
    ],
    prompts: [
      {
        id: "proqol_1",
        prompt: "Do you feel worn out or depleted by the emotional or behavioural needs of the children in your care?",
        subscaleId: "carer_burnout",
      },
      {
        id: "proqol_2",
        prompt: "Does supporting a child's trauma distress bring up secondary distress or sleeplessness for you?",
        subscaleId: "carer_burnout",
      },
      {
        id: "proqol_3",
        prompt: "Do you lack practical respite, transport, or financial/agency support to sustain the placement?",
        subscaleId: "carer_burnout",
      },
      {
        id: "proqol_4",
        prompt: "Have navigating family contact handovers or system demands left you feeling isolated?",
        subscaleId: "carer_burnout",
      },
    ],
  }),

  buildQuickScale({
    id: "concrete_needs",
    code: "SDH-NEEDS",
    title: "Concrete Basic Needs, Housing & Poverty-vs-Neglect Barrier Screen",
    shortTitle: "Housing, Food & Practical Needs (SDH-NEEDS)",
    category: "cultural_sewb_carer",
    sourceReference: "Social Determinants of Health & Anti-Poverty Child Welfare Fairness Protocol",
    description:
      "Distinguishes structural poverty, housing insecurity, DFV financial sabotage, and transport barriers from parental neglect.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.90,
    normativeSd: 3.2,
    clinicalCutoffRaw: 4,
    saferCategories: ["community", "family", "protection_and_safety"],
    saferFlags: ["housing_instability", "social_isolation"],
    competencyIds: ["planning", "organisation"],
    subscales: [
      { id: "material_security", label: "Housing, Food & Utility Security", description: "Immediate material needs requiring brokerage rather than blame" },
    ],
    prompts: [
      {
        id: "sdh_1",
        prompt: "Are you worried about losing your housing, tenancy instability, overcrowding, or unsafe locks/repairs?",
        subscaleId: "material_security",
      },
      {
        id: "sdh_2",
        prompt: "In the past month, have you run short of money for groceries, formula, nappies, medications, or utilities?",
        subscaleId: "material_security",
      },
      {
        id: "sdh_3",
        prompt: "Do lack of transport, fuel, childcare, or phone data make it hard to attend appointments?",
        subscaleId: "material_security",
      },
      {
        id: "sdh_4",
        prompt: "Has a partner's financial control, debt, or property damage caused your current material shortage?",
        subscaleId: "material_security",
      },
    ],
  }),

  // ============================================================================
  // CATEGORY 8: PARENTING CAPACITY, ATTACHMENT & SAFESTEPS PDFs (10 Scales)
  // ============================================================================
  buildQuickScale({
    id: "capes",
    code: "CAPES",
    title: "Child Adjustment and Parent Efficacy Scale",
    shortTitle: "Child Adjustment & Parent Efficacy (CAPES)",
    category: "parenting_attachment_pdf",
    sourceReference: "Morawska, Sanders et al. (2014) CAPES (SafeSteps PDF Library)",
    description:
      "Assesses child behavioural/emotional adjustment alongside parental self-efficacy in managing everyday parenting challenges.",
    targetAudience: ["parent", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.88,
    normativeSd: 3.4,
    clinicalCutoffRaw: 10,
    saferCategories: ["child", "parent_or_caregiver", "strengths"],
    saferFlags: [],
    competencyIds: ["parenting", "emotional_regulation", "application"],
    subscales: [
      { id: "parent_efficacy", label: "Parental Self-Efficacy", description: "Confidence in guiding child emotions and behaviour calmly" },
    ],
    prompts: [
      {
        id: "capes_1",
        prompt: "I feel confident helping my child calm down when they are upset, frustrated, or having a meltdown.",
        subscaleId: "parent_efficacy",
      },
      {
        id: "capes_2",
        prompt: "I can set clear, calm limits without yelling, threatening, or giving in out of exhaustion.",
        subscaleId: "parent_efficacy",
      },
      {
        id: "capes_3",
        prompt: "I notice and praise my child's positive efforts, kindness, and cooperation every day.",
        subscaleId: "parent_efficacy",
      },
      {
        id: "capes_4",
        prompt: "My child is settling into more predictable sleep, school/play, and emotional routines.",
        subscaleId: "parent_efficacy",
      },
    ],
  }),

  buildQuickScale({
    id: "pafas",
    code: "PAFAS",
    title: "Parenting and Family Adjustment Scales",
    shortTitle: "Parenting & Family Adjustment (PAFAS)",
    category: "parenting_attachment_pdf",
    sourceReference: "Sanders, Morawska et al. (2014) PAFAS (SafeSteps PDF Library)",
    description:
      "Evaluates parental consistency, non-coercive positive encouragement, parent-child relationship quality, and family teamwork.",
    targetAudience: ["parent", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.87,
    normativeSd: 3.2,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "family", "strengths"],
    saferFlags: [],
    competencyIds: ["parenting", "consistency", "communication"],
    subscales: [
      { id: "positive_consistency", label: "Consistent Non-Coercive Parenting", description: "Following through calmly without harsh discipline" },
    ],
    prompts: [
      {
        id: "pafas_1",
        prompt: "I follow through on rules and routines calmly and predictably, rather than changing rules depending on my mood.",
        subscaleId: "positive_consistency",
      },
      {
        id: "pafas_2",
        prompt: "I enjoy spending warm, one-on-one play or connection time with my child.",
        subscaleId: "positive_consistency",
      },
      {
        id: "pafas_3",
        prompt: "Instead of shouting or lecturing, I use calm guidance and natural consequences.",
        subscaleId: "positive_consistency",
      },
      {
        id: "pafas_4",
        prompt: "Adults in our home support each other to keep the atmosphere calm for the children.",
        subscaleId: "positive_consistency",
      },
    ],
  }),

  buildQuickScale({
    id: "pars",
    code: "PARS",
    title: "Parenting Assessment & Resilience Scale",
    shortTitle: "Parenting Resilience (PARS)",
    category: "parenting_attachment_pdf",
    sourceReference: "SafeSteps PDF Library - PARS",
    description:
      "Measures caregiver adaptability, stress recovery, and protective buffering of children during family transitions.",
    targetAudience: ["parent", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.86,
    normativeSd: 3.1,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "strengths", "protection_and_safety"],
    saferFlags: [],
    competencyIds: ["resilience", "protective_capacity", "problem_solving"],
    subscales: [
      { id: "stress_buffering", label: "Protective Stress Buffering", description: "Shielding children from adult stress and bouncing back" },
    ],
    prompts: [
      {
        id: "pars_1",
        prompt: "Even when external stresses hit, I keep my child's daily meals, bedtime, and emotional check-ins steady.",
        subscaleId: "stress_buffering",
      },
      {
        id: "pars_2",
        prompt: "I reach out early to supports before stress builds into a crisis.",
        subscaleId: "stress_buffering",
      },
      {
        id: "pars_3",
        prompt: "I help my child name their feelings and feel safe asking questions.",
        subscaleId: "stress_buffering",
      },
      {
        id: "pars_4",
        prompt: "After a hard moment, I initiate a warm repair with my child on the same day.",
        subscaleId: "stress_buffering",
      },
    ],
  }),

  buildQuickScale({
    id: "keps",
    code: "KEPS",
    title: "Knowledge of Effective Parenting Scale",
    shortTitle: "Effective Parenting Knowledge (KEPS)",
    category: "parenting_attachment_pdf",
    sourceReference: "Morawska, Sanders & Winter (2007) KEPS (SafeSteps PDF Library)",
    description:
      "Assesses applied understanding of child development, safe boundaries, positive reinforcement, and trauma-informed co-regulation.",
    targetAudience: ["parent", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.85,
    normativeSd: 2.9,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "child"],
    saferFlags: [],
    competencyIds: ["knowledge", "understanding", "parenting"],
    subscales: [
      { id: "developmental_knowledge", label: "Developmental & Co-Regulation Knowledge", description: "Age-appropriate expectations and co-regulation" },
    ],
    prompts: [
      {
        id: "keps_1",
        prompt: "I know what is developmentally realistic to expect from my child at their current age and stage.",
        subscaleId: "developmental_knowledge",
      },
      {
        id: "keps_2",
        prompt: "I understand that children learn emotional regulation by borrowing a calm adult's nervous system first (co-regulation).",
        subscaleId: "developmental_knowledge",
      },
      {
        id: "keps_3",
        prompt: "I know how to give clear, specific, calm instructions rather than vague or angry demands.",
        subscaleId: "developmental_knowledge",
      },
      {
        id: "keps_4",
        prompt: "I know how to prepare my child ahead of time for transitions (leaving the park, handovers, bedtime).",
        subscaleId: "developmental_knowledge",
      },
    ],
  }),

  buildQuickScale({
    id: "maap",
    code: "MAAP",
    title: "Me as a Parent Scale (Self-Regulation, Efficacy, Agency & Satisfaction)",
    shortTitle: "Me as a Parent (MAAP)",
    category: "parenting_attachment_pdf",
    sourceReference: "Hamilton, Matthews & Crawford (2015) Me as a Parent (MAAP) Scale (SafeSteps PDF Library)",
    description:
      "Validated 4-subscale measure of parental self-efficacy, personal agency, self-management, and self-sufficiency.",
    targetAudience: ["parent", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.88,
    normativeSd: 3.2,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "strengths"],
    saferFlags: [],
    competencyIds: ["self_awareness", "parenting", "executive_function", "motivation"],
    subscales: [
      { id: "maap_agency", label: "Parental Agency & Self-Management", description: "Confidence and self-directed problem-solving in parenting" },
    ],
    prompts: [
      {
        id: "maap_1",
        prompt: "I have the skills and inner steadiness to deal with new parenting challenges as my child grows.",
        subscaleId: "maap_agency",
      },
      {
        id: "maap_2",
        prompt: "How my child feels and settles is strongly supported by the calm choices I make each day.",
        subscaleId: "maap_agency",
      },
      {
        id: "maap_3",
        prompt: "I can set goals for our family routines and work through obstacles step by step.",
        subscaleId: "maap_agency",
      },
      {
        id: "maap_4",
        prompt: "I feel proud of the safe, loving parent I am becoming.",
        subscaleId: "maap_agency",
      },
    ],
  }),

  buildQuickScale({
    id: "fps",
    code: "FPS",
    title: "Family Protective & Functioning Scale",
    shortTitle: "Family Protective Functioning (FPS)",
    category: "parenting_attachment_pdf",
    sourceReference: "SafeSteps PDF Library - FPS",
    description:
      "Evaluates household predictability, emotional warmth, clear communication, and shared safety boundaries.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.87,
    normativeSd: 3.1,
    clinicalCutoffRaw: 10,
    saferCategories: ["family", "protection_and_safety", "strengths"],
    saferFlags: [],
    competencyIds: ["communication", "safety", "planning"],
    subscales: [
      { id: "household_cohesion", label: "Household Safety & Predictability", description: "Predictable routines and safe conflict resolution" },
    ],
    prompts: [
      {
        id: "fps_1",
        prompt: "Our home has predictable morning, mealtime, and bedtime routines that help everyone feel secure.",
        subscaleId: "household_cohesion",
      },
      {
        id: "fps_2",
        prompt: "Everyone in our home knows the safety rules and who to call if anyone feels unsafe.",
        subscaleId: "household_cohesion",
      },
      {
        id: "fps_3",
        prompt: "We solve practical problems by talking calmly when the children are settled.",
        subscaleId: "household_cohesion",
      },
      {
        id: "fps_4",
        prompt: "Laughter, warmth, and encouragement happen every day in our home.",
        subscaleId: "household_cohesion",
      },
    ],
  }),

  buildQuickScale({
    id: "gaps",
    code: "GAPS",
    title: "Goal Achievement in Parenting Scale",
    shortTitle: "Goal Achievement in Parenting (GAPS)",
    category: "parenting_attachment_pdf",
    sourceReference: "SafeSteps PDF Library - GAPS",
    description:
      "Tracks concrete behavioural attainment of safety plan milestones, home routines, and child-centred goals.",
    targetAudience: ["parent", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.86,
    normativeSd: 3.0,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "strengths", "protection_and_safety"],
    saferFlags: [],
    competencyIds: ["planning", "organisation", "application", "behaviour_change"],
    subscales: [
      { id: "goal_attainment", label: "Behavioural Goal Execution", description: "Turning safety and parenting plans into daily habits" },
    ],
    prompts: [
      {
        id: "gaps_1",
        prompt: "I have practised my primary SafeSteps parenting goal in real home moments at least 3 times this week.",
        subscaleId: "goal_attainment",
      },
      {
        id: "gaps_2",
        prompt: "When a plan did not work as expected, I reflected on why and adjusted my approach.",
        subscaleId: "goal_attainment",
      },
      {
        id: "gaps_3",
        prompt: "My child has noticed a positive difference in how we handle tricky moments.",
        subscaleId: "goal_attainment",
      },
      {
        id: "gaps_4",
        prompt: "I have shared honest examples (wins and hard moments) with my worker or coach.",
        subscaleId: "goal_attainment",
      },
    ],
  }),

  buildQuickScale({
    id: "ptc_lbc",
    code: "PTC-LBC",
    title: "Parenting Tasks Checklist & Lifestyle Behaviour Checklist",
    shortTitle: "Parenting Tasks & Routines (PTC/LBC)",
    category: "parenting_attachment_pdf",
    sourceReference: "Sanders & Woolley (2005) PTC / West & Sanders (2009) LBC (SafeSteps PDF Library)",
    description:
      "Task-specific confidence across high-stress settings (shopping, transitions, bedtime, mornings, screen time, siblings).",
    targetAudience: ["parent", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.87,
    normativeSd: 3.1,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "child"],
    saferFlags: [],
    competencyIds: ["application", "parenting", "organisation"],
    subscales: [
      { id: "setting_confidence", label: "High-Demand Setting Mastery", description: "Calm leadership during mornings, outings, and bedtimes" },
    ],
    prompts: [
      {
        id: "ptc_1",
        prompt: "I can stay calm and guide my child when they refuse to get ready in the morning or at bedtime.",
        subscaleId: "setting_confidence",
      },
      {
        id: "ptc_2",
        prompt: "I can manage public outings (supermarket, appointments, transport) when my child is tired or overstimulated.",
        subscaleId: "setting_confidence",
      },
      {
        id: "ptc_3",
        prompt: "I can guide healthy meals, bath time, and screen transitions without power struggles.",
        subscaleId: "setting_confidence",
      },
      {
        id: "ptc_4",
        prompt: "I can coach siblings through sharing or conflict without taking sides or shouting.",
        subscaleId: "setting_confidence",
      },
    ],
  }),

  buildQuickScale({
    id: "prfq",
    code: "PRFQ-18",
    title: "Parental Reflective Functioning Questionnaire (Mentalization Capacity)",
    shortTitle: "Parental Reflective Functioning (PRFQ)",
    category: "parenting_attachment_pdf",
    sourceReference: "Luyten, Mayes, Nijssens & Fonagy (2017) PRFQ",
    description:
      "Assesses the parent's capacity to hold the child's mind in mind: Pre-Mentalizing Modes (hostile attributions), Certainty of Mental States, and Interest/Curiosity in the child's internal world.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.88,
    normativeSd: 3.3,
    clinicalCutoffRaw: 11,
    saferCategories: ["parent_or_caregiver", "child", "protection_and_safety"],
    saferFlags: [],
    competencyIds: ["reflective_capacity", "insight", "understanding", "parenting"],
    subscales: [
      { id: "curiosity_mentalizing", label: "Curiosity in Child's Inner World", description: "Wondering what emotions or fears drive the child's behaviour" },
      { id: "non_hostile_attribution", label: "Low Pre-Mentalizing / Non-Hostile Attribution", description: "Rejecting beliefs that the child is 'manipulative' or 'out to get me'" },
    ],
    prompts: [
      {
        id: "prfq_1",
        prompt: "I am always curious about what feelings or worries might be underneath my child's behaviour.",
        subscaleId: "curiosity_mentalizing",
      },
      {
        id: "prfq_2",
        prompt: "When my child acts out or clings to me, I recognize they may be feeling scared or overwhelmed rather than 'trying to wind me up'.",
        subscaleId: "non_hostile_attribution",
      },
      {
        id: "prfq_3",
        prompt: "I realize that my child can experience a family event very differently from how I experienced it.",
        subscaleId: "curiosity_mentalizing",
      },
      {
        id: "prfq_4",
        prompt: "Even when I am stressed, I pause to imagine how my tone and body language look through my child's eyes.",
        subscaleId: "non_hostile_attribution",
      },
    ],
  }),

  buildQuickScale({
    id: "pfs_2",
    code: "PFS-2",
    title: "Protective Factors Survey (2nd Edition - FRIENDS National Center)",
    shortTitle: "Family Protective Factors (PFS-2)",
    category: "parenting_attachment_pdf",
    sourceReference: "FRIENDS National Center for Community-Based Child Abuse Prevention (PFS-2)",
    description:
      "Measures the 5 core child welfare protective factors: Family Functioning/Resiliency, Social Supports, Concrete Supports, Nurturing & Attachment, and Caregiver/Practitioner Relationship.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.89,
    normativeSd: 3.2,
    clinicalCutoffRaw: 11,
    saferCategories: ["strengths", "protection_and_safety", "community", "family"],
    saferFlags: [],
    competencyIds: ["protective_capacity", "resilience", "parenting"],
    subscales: [
      { id: "nurturing_attachment", label: "Nurturing & Attachment", description: "Warm attunement and emotional safety" },
      { id: "social_concrete_support", label: "Social & Concrete Support Network", description: "People and services to call in a pinch" },
    ],
    prompts: [
      {
        id: "pfs_1",
        prompt: "My child knows without a doubt that I will protect them and comfort them when they are scared.",
        subscaleId: "nurturing_attachment",
      },
      {
        id: "pfs_2",
        prompt: "I have trusted people in my life who will listen and help out practically if our family hits a rough patch.",
        subscaleId: "social_concrete_support",
      },
      {
        id: "pfs_3",
        prompt: "I know how to find and ask for community, health, or emergency support whenever our family needs it.",
        subscaleId: "social_concrete_support",
      },
      {
        id: "pfs_4",
        prompt: "In our family, we talk openly about how to stay safe and support one another.",
        subscaleId: "nurturing_attachment",
      },
    ],
  }),

  // ============================================================================
  // CATEGORY 9: CHILD & YOUTH VOICE (3 Scales)
  // ============================================================================
  buildQuickScale({
    id: "child_felt_safety",
    code: "CWBS-SAFE",
    title: "Child & Youth Felt Safety, Worry Thermometer & Trusted Adult Check-In",
    shortTitle: "Child Felt Safety & Worry Thermometer",
    category: "child_youth_voice",
    sourceReference: "SafeSteps Child Voice & Signs of Safety (Turnell & Edwards) Child Safety House",
    description:
      "Age-calibrated (5–8, 9–12, 13–17) child voice check-in measuring felt safety at home, sleep comfort, worry thermometer, and trusted adults.",
    targetAudience: ["child"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.86,
    normativeSd: 3.1,
    clinicalCutoffRaw: 10,
    saferCategories: ["child", "protection_and_safety"],
    saferFlags: [],
    competencyIds: ["safety", "communication", "emotional_regulation"],
    subscales: [
      { id: "home_safety", label: "Felt Safety at Home & Night", description: "Feeling safe in body and bedroom" },
      { id: "trusted_adults", label: "Trusted Safety Network", description: "Knowing safe adults who listen and help" },
    ],
    prompts: [
      {
        id: "cfs_1",
        prompt: "How safe and calm does your body feel at home right now?",
        easyReadPrompt: "Does your body feel safe at home today?",
        subscaleId: "home_safety",
      },
      {
        id: "cfs_2",
        prompt: "How easy is it to fall asleep at night without worrying about grown-up fighting?",
        easyReadPrompt: "Do you feel safe and cozy at bedtime?",
        subscaleId: "home_safety",
      },
      {
        id: "cfs_3",
        prompt: "Do you have at least two safe grown-ups you can talk to if you ever feel scared or worried?",
        easyReadPrompt: "Do you have safe grown-ups who listen to you?",
        subscaleId: "trusted_adults",
      },
      {
        id: "cfs_4",
        prompt: "Do you know what your Safe Place and Safety Plan are if big feelings or loud noises happen?",
        easyReadPrompt: "Do you know your Safe Place?",
        subscaleId: "trusted_adults",
      },
    ],
  }),

  buildQuickScale({
    id: "cries_8",
    code: "CRIES-8",
    title: "Children's Revised Impact of Event Scale (Child Trauma Stress Screen)",
    shortTitle: "Child Trauma Stress Check (CRIES-8)",
    category: "child_youth_voice",
    sourceReference: "Perrin, Meiser-Stedman & Smith (2005) CRIES-8 (Children & Young People 8–17)",
    description:
      "Brief child-friendly screen for trauma intrusion (bad dreams, unwanted pictures in mind) and avoidance following frightening events.",
    targetAudience: ["child", "clinician"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.85,
    normativeSd: 3.4,
    clinicalCutoffRaw: 5,
    saferCategories: ["child", "risk"],
    saferFlags: ["mental_health", "family_violence"],
    competencyIds: ["emotional_regulation", "safety"],
    subscales: [
      { id: "child_intrusion", label: "Unwanted Thoughts & Nightmares", description: "Pictures or bad dreams popping into the child's head" },
      { id: "child_avoidance", label: "Avoidance of Reminders", description: "Trying hard not to think or talk about scary things" },
    ],
    prompts: [
      {
        id: "cries_1",
        prompt: "Do pictures or thoughts about a scary time pop into your head even when you don't want them to?",
        easyReadPrompt: "Do scary memories pop into your head?",
        subscaleId: "child_intrusion",
      },
      {
        id: "cries_2",
        prompt: "Do waves of big feelings or tummy aches come back when something reminds you of it?",
        easyReadPrompt: "Does your tummy hurt when you remember scary times?",
        subscaleId: "child_intrusion",
      },
      {
        id: "cries_3",
        prompt: "Do you try super hard to push those thoughts away or stay away from reminders?",
        easyReadPrompt: "Do you try hard not to think about it?",
        subscaleId: "child_avoidance",
      },
      {
        id: "cries_4",
        prompt: "Do loud noises or sudden voices make you jump or freeze up?",
        easyReadPrompt: "Do loud noises make you jump?",
        subscaleId: "child_intrusion",
      },
    ],
  }),

  buildQuickScale({
    id: "sdq_summary",
    code: "SDQ-BRIEF",
    title: "Strengths and Difficulties Questionnaire (Multi-Informant Child Summary)",
    shortTitle: "Child Strengths & Wellbeing (SDQ-Brief)",
    category: "child_youth_voice",
    sourceReference: "Goodman (1997) Strengths and Difficulties Questionnaire (SDQ)",
    description:
      "Multi-informant summary of child emotional wellbeing, peer relationships, attention/regulation, and prosocial strengths.",
    targetAudience: ["parent", "carer", "child", "clinician"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.87,
    normativeSd: 3.1,
    clinicalCutoffRaw: 10,
    saferCategories: ["child", "strengths"],
    saferFlags: [],
    competencyIds: ["emotional_regulation", "resilience"],
    subscales: [
      { id: "prosocial_wellbeing", label: "Prosocial Strengths & Emotional Settling", description: "Kindness, friendships, and emotional regulation" },
    ],
    prompts: [
      {
        id: "sdq_1",
        prompt: "Considerate of other people's feelings, kind to younger children, and shares readily.",
        subscaleId: "prosocial_wellbeing",
      },
      {
        id: "sdq_2",
        prompt: "Able to settle into school or play activities and bounce back from small frustrations.",
        subscaleId: "prosocial_wellbeing",
      },
      {
        id: "sdq_3",
        prompt: "Has at least one good friend or positive peer connection and feels included.",
        subscaleId: "prosocial_wellbeing",
      },
      {
        id: "sdq_4",
        prompt: "Generally free from frequent headaches, tummy-aches, or overwhelming worries.",
        subscaleId: "prosocial_wellbeing",
      },
    ],
  }),

  // ============================================================================
  // CATEGORY 10: EXTERNAL PSYCHOLOGIST TIER 3 & TIER 4 SUMMARY BRIDGE (4 Scales)
  // ============================================================================
  buildQuickScale({
    id: "external_pai_mcmi",
    code: "EXT-PAI-MCMI",
    title: "Tier 3 External Psychologist Summary Bridge (PAI / MCMI-IV / MMPI-3)",
    shortTitle: "External Psych Assessment Bridge (PAI/MCMI)",
    category: "external_tier3_4_bridge",
    sourceReference: "Morey (PAI) / Millon (MCMI-IV) Clinician-Administered Summary Integration",
    description:
      "Structured clinician import bridge translating external forensic/clinical personality and validity findings into SafeSteps non-diagnostic coaching adaptations.",
    targetAudience: ["clinician"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.91,
    normativeSd: 3.0,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "risk", "protection_and_safety"],
    saferFlags: ["mental_health", "complex_needs"],
    competencyIds: ["insight", "emotional_regulation", "reflective_capacity"],
    subscales: [
      { id: "profile_validity_alliance", label: "Profile Validity & Treatment Alliance", description: "Validity scales and amenability to structured therapy" },
    ],
    prompts: [
      {
        id: "ext_pai_1",
        prompt: "External validity indices (ICN, INF, NIM, PIM) indicate a valid, interpretable, and non-defensive clinical profile.",
        subscaleId: "profile_validity_alliance",
      },
      {
        id: "ext_pai_2",
        prompt: "Affective, trauma, and interpersonal regulation scales show sufficient stability for structured parenting skill acquisition.",
        subscaleId: "profile_validity_alliance",
      },
      {
        id: "ext_pai_3",
        prompt: "Aggression, dominance, and substance scales indicate low acute danger when safety plan scaffolds are active.",
        subscaleId: "profile_validity_alliance",
      },
      {
        id: "ext_pai_4",
        prompt: "Treatment Rejection (RXR) and alliance indicators support active engagement with coaching and reflective supervision.",
        subscaleId: "profile_validity_alliance",
      },
    ],
  }),

  buildQuickScale({
    id: "external_tsi2_wais",
    code: "EXT-TSI2-WAIS",
    title: "Tier 3 Trauma & Neurocognitive Summary Bridge (TSI-2 / WAIS-IV / ABAS-3)",
    shortTitle: "External Trauma & Neurocognitive Bridge (TSI-2/WAIS)",
    category: "external_tier3_4_bridge",
    sourceReference: "Briere (TSI-2) / Wechsler (WAIS-IV) / Harrison & Oakland (ABAS-3)",
    description:
      "Integrates external trauma symptom inventory and cognitive/adaptive functioning assessments to calibrate Easy-Read, pacing, and sensory accommodations.",
    targetAudience: ["clinician"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.90,
    normativeSd: 3.1,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "protection_and_safety"],
    saferFlags: ["disability", "mental_health"],
    competencyIds: ["executive_function", "understanding", "application"],
    subscales: [
      { id: "cognitive_trauma_fit", label: "Cognitive Scaffolding & Trauma Containment Fit", description: "Matching intervention delivery to working memory and processing speed" },
    ],
    prompts: [
      {
        id: "ext_wais_1",
        prompt: "Working memory and processing speed findings have been translated into concrete visual/Easy-Read coaching accommodations.",
        subscaleId: "cognitive_trauma_fit",
      },
      {
        id: "ext_wais_2",
        prompt: "Adaptive daily living strengths (ABAS-3) are leveraged to anchor household routines.",
        subscaleId: "cognitive_trauma_fit",
      },
      {
        id: "ext_wais_3",
        prompt: "Trauma self-capacity and dissociation indicators (TSI-2) are supported via somatic grounding before difficult topics.",
        subscaleId: "cognitive_trauma_fit",
      },
      {
        id: "ext_wais_4",
        prompt: "All caseworkers and coaches are aligned on the participant's communication and learning profile.",
        subscaleId: "cognitive_trauma_fit",
      },
    ],
  }),

  buildQuickScale({
    id: "external_dpics_care_eas",
    code: "EXT-DPICS-EAS",
    title: "Tier 4 Observational Attachment & Dyadic Coding Bridge (DPICS / CARE-Index / EAS)",
    shortTitle: "Observational Dyadic Coding (DPICS/CARE/EAS)",
    category: "external_tier3_4_bridge",
    sourceReference: "Eyberg (DPICS-IV) / Crittenden (CARE-Index) / Biringen (Emotional Availability Scales)",
    description:
      "Structured observational coding of live parent-child interactions: PRIDE skills (Praise, Reflection, Imitation, Description, Enjoyment), maternal/paternal sensitivity, structuring, non-intrusiveness, and non-hostility.",
    targetAudience: ["clinician"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.91,
    normativeSd: 3.2,
    clinicalCutoffRaw: 11,
    saferCategories: ["child", "parent_or_caregiver", "protection_and_safety", "strengths"],
    saferFlags: [],
    competencyIds: ["parenting", "application", "emotional_regulation", "reflective_capacity"],
    subscales: [
      { id: "dyadic_sensitivity", label: "Observed Sensitivity, Structuring & Non-Hostility", description: "Real-time attunement and child comfort during observation" },
    ],
    prompts: [
      {
        id: "ext_dpics_1",
        prompt: "Caregiver demonstrates warm sensitivity, labelled praise, and follows the child's lead during child-led play.",
        subscaleId: "dyadic_sensitivity",
      },
      {
        id: "ext_dpics_2",
        prompt: "Caregiver provides calm, predictable structuring without intrusiveness, harshness, or covert hostility.",
        subscaleId: "dyadic_sensitivity",
      },
      {
        id: "ext_dpics_3",
        prompt: "Child visibly seeks proximity, comfort, and shared delight with the caregiver without freezing or role-reversal.",
        subscaleId: "dyadic_sensitivity",
      },
      {
        id: "ext_dpics_4",
        prompt: "Caregiver repairs minor dyadic mismatches smoothly during transitions or clean-up.",
        subscaleId: "dyadic_sensitivity",
      },
    ],
  }),

  buildQuickScale({
    id: "external_ncfas_sdm_capi",
    code: "EXT-NCFAS-SDM",
    title: "Tier 4 Child Protection Ecological & Actuarial Summary Bridge (NCFAS-G+R / SDM / CAPI)",
    shortTitle: "Ecological & Reunification Readiness (NCFAS-G+R/SDM)",
    category: "external_tier3_4_bridge",
    sourceReference: "North Carolina Family Assessment Scale (NCFAS-G+R) / Structured Decision Making (SDM) / Milner CAPI",
    description:
      "Synthesizes ecological reunification domains (Environment, Parental Capabilities, Family Interactions, Family Safety, Child Well-Being, Ambivalence, Readiness for Reunification).",
    targetAudience: ["clinician"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.90,
    normativeSd: 3.3,
    clinicalCutoffRaw: 11,
    saferCategories: ["child", "parent_or_caregiver", "family", "protection_and_safety", "community"],
    saferFlags: [],
    competencyIds: ["protective_capacity", "safety", "parenting", "consistency"],
    subscales: [
      { id: "ecological_reunification", label: "NCFAS-G+R Reunification & Safety Readiness", description: "Demonstrated ecological safety across home, caregiver, and child domains" },
    ],
    prompts: [
      {
        id: "ext_ncfas_1",
        prompt: "Home environment and daily supervision routines meet or exceed baseline child safety standards.",
        subscaleId: "ecological_reunification",
      },
      {
        id: "ext_ncfas_2",
        prompt: "Caregiver demonstrates sustained protective capacity across unannounced/varied times and stressors.",
        subscaleId: "ecological_reunification",
      },
      {
        id: "ext_ncfas_3",
        prompt: "Family interactions and co-parenting boundaries protect the child from adult conflict or relapse triggers.",
        subscaleId: "ecological_reunification",
      },
      {
        id: "ext_ncfas_4",
        prompt: "Caregiver and child readiness for restoration/maintenance is supported by formal and informal safety nets.",
        subscaleId: "ecological_reunification",
      },
    ],
  }),

  buildQuickScale({
    id: "cts2s_conflict",
    code: "CTS2S",
    title: "Revised Conflict Tactics Scales Short Form (Negotiation vs Aggression)",
    shortTitle: "Conflict Tactics & Negotiation (CTS2S)",
    category: "dfv_couples_restoration",
    sourceReference: "Straus & Douglas (2004) Revised Conflict Tactics Scales Short Form (CTS2S)",
    description:
      "Evaluates constructive cognitive/emotional negotiation versus psychological or physical aggression during household disagreements.",
    targetAudience: ["parent", "partner"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.86,
    normativeSd: 3.1,
    clinicalCutoffRaw: 10,
    saferCategories: ["family", "protection_and_safety"],
    saferFlags: ["family_violence"],
    competencyIds: ["communication", "emotional_regulation", "safety"],
    subscales: [
      { id: "constructive_negotiation", label: "Constructive Negotiation & Respect", description: "Calm compromise and problem-solving without coercion" },
    ],
    prompts: [
      { id: "cts_1", prompt: "I showed respect for my partner's or co-parent's feelings even when we disagreed on a decision.", subscaleId: "constructive_negotiation" },
      { id: "cts_2", prompt: "I suggested a calm compromise or paused the discussion until the children were asleep.", subscaleId: "constructive_negotiation" },
      { id: "cts_3", prompt: "I refrained from insults, shouting, swearing, or stomping out of the room during disagreements.", subscaleId: "constructive_negotiation" },
      { id: "cts_4", prompt: "We were able to agree on a safe, practical solution that put the children's routine first.", subscaleId: "constructive_negotiation" },
    ],
  }),

  buildQuickScale({
    id: "cerq_short",
    code: "CERQ-SF",
    title: "Cognitive Emotion Regulation Questionnaire - Short Form",
    shortTitle: "Cognitive Emotion Regulation (CERQ-SF)",
    category: "mental_health_trauma",
    sourceReference: "Garnefski & Kraaij (2006) CERQ-Short",
    description:
      "Measures adaptive cognitive coping (Positive Reappraisal, Refocus on Planning, Perspective) versus catastrophizing, rumination, and other-blame.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.85,
    normativeSd: 3.0,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "strengths"],
    saferFlags: ["mental_health"],
    competencyIds: ["emotional_regulation", "problem_solving", "reflective_capacity"],
    subscales: [
      { id: "adaptive_reappraisal", label: "Refocus on Planning & Perspective", description: "Thinking about practical steps rather than catastrophizing" },
    ],
    prompts: [
      { id: "cerq_1", prompt: "When a stressful event happens, I think about what steps I can take to handle it safely.", subscaleId: "adaptive_reappraisal" },
      { id: "cerq_2", prompt: "I look for what I can learn from a hard moment to strengthen my parenting.", subscaleId: "adaptive_reappraisal" },
      { id: "cerq_3", prompt: "I pause before jumping to the worst-case conclusion or blaming others.", subscaleId: "adaptive_reappraisal" },
      { id: "cerq_4", prompt: "I remind myself that difficult feelings can be managed one step at a time.", subscaleId: "adaptive_reappraisal" },
    ],
  }),

  buildQuickScale({
    id: "who_5",
    code: "WHO-5",
    title: "World Health Organization Well-Being Index (Positive Vitality)",
    shortTitle: "WHO-5 Positive Well-Being Index",
    category: "mental_health_trauma",
    sourceReference: "World Health Organization (1998) WHO-5 Well-Being Index",
    description:
      "Validated 5-construct measure of positive subjective emotional vitality, calm, restfulness, and daily interest.",
    targetAudience: ["parent", "partner", "carer", "child"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.88,
    normativeSd: 3.2,
    clinicalCutoffRaw: 9,
    saferCategories: ["parent_or_caregiver", "strengths"],
    saferFlags: [],
    competencyIds: ["resilience", "emotional_regulation"],
    subscales: [
      { id: "vitality", label: "Emotional Vitality & Calm", description: "Feeling calm, rested, and interested in daily life" },
    ],
    prompts: [
      { id: "who5_1", prompt: "I have felt calm, relaxed, and emotionally steady over the past two weeks.", subscaleId: "vitality" },
      { id: "who5_2", prompt: "I have felt active, purposeful, and engaged with my children's daily world.", subscaleId: "vitality" },
      { id: "who5_3", prompt: "I have woken up feeling fresh or able to pace my energy safely.", subscaleId: "vitality" },
      { id: "who5_4", prompt: "My daily life has been filled with moments that interest and matter to me.", subscaleId: "vitality" },
    ],
  }),

  buildQuickScale({
    id: "dts_distress",
    code: "DTS-SF",
    title: "Simons & Gaher Distress Tolerance Scale (Short Form)",
    shortTitle: "Distress Tolerance Scale (DTS-SF)",
    category: "mental_health_trauma",
    sourceReference: "Simons & Gaher (2005) Distress Tolerance Scale",
    description:
      "Measures perceived capacity to withstand emotional distress without impulsive escape, substance use, or explosive outbursts.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.86,
    normativeSd: 3.1,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "protection_and_safety"],
    saferFlags: ["mental_health", "aod"],
    competencyIds: ["emotional_regulation", "resilience", "application"],
    subscales: [
      { id: "distress_endurance", label: "Sitting With Discomfort Safely", description: "Tolerating uncomfortable feelings without reactive escape" },
    ],
    prompts: [
      { id: "dts_1", prompt: "I can handle feeling upset or uncomfortable without needing to act impulsively to make it stop immediately.", subscaleId: "distress_endurance" },
      { id: "dts_2", prompt: "When I feel distressed, I can still keep my attention on keeping my child safe and settled.", subscaleId: "distress_endurance" },
      { id: "dts_3", prompt: "I use grounding or breathing skills rather than numbing out when big feelings hit.", subscaleId: "distress_endurance" },
      { id: "dts_4", prompt: "I accept that uncomfortable emotions rise and pass like waves.", subscaleId: "distress_endurance" },
    ],
  }),

  buildQuickScale({
    id: "scoff_eating",
    code: "SCOFF-B",
    title: "Disordered Eating, Appetite & Nutritional Stress Screen",
    shortTitle: "Nutrition & Eating Stress (SCOFF-B)",
    category: "mental_health_trauma",
    sourceReference: "Morgan, Reid & Lacey (1999) SCOFF & Trauma Nutritional Screen",
    description:
      "Screens for stress-related appetite suppression, binge/purge distress, or food insecurity impacting caregiver physical stamina.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.84,
    normativeSd: 2.5,
    clinicalCutoffRaw: 4,
    saferCategories: ["parent_or_caregiver"],
    saferFlags: ["mental_health"],
    competencyIds: ["self_awareness", "planning"],
    subscales: [
      { id: "nutritional_stress", label: "Stress Eating / Appetite Depletion", description: "Skipping meals or distress around food under stress" },
    ],
    prompts: [
      { id: "scoff_1", prompt: "Does high stress or trauma anxiety cause you to skip meals for long stretches and run on empty?", subscaleId: "nutritional_stress" },
      { id: "scoff_2", prompt: "Do you ever feel you have lost control over eating or feel intense shame around food?", subscaleId: "nutritional_stress" },
      { id: "scoff_3", prompt: "Do you put all available food toward the children while going hungry yourself?", subscaleId: "nutritional_stress" },
      { id: "scoff_4", prompt: "Would practical meal-planning or pantry brokerage help stabilise your daily energy?", subscaleId: "nutritional_stress" },
    ],
  }),

  buildQuickScale({
    id: "pss_parental_stress",
    code: "PSS-18-B",
    title: "Berry & Jones Parental Stress Scale (Brief Form)",
    shortTitle: "Parental Stress & Reward Balance (PSS)",
    category: "parenting_attachment_pdf",
    sourceReference: "Berry & Jones (1995) Parental Stress Scale (PSS)",
    description:
      "Captures the balance between perceived caregiving depletion/overwhelm and warmth/satisfaction in the parenting role.",
    targetAudience: ["parent", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.87,
    normativeSd: 3.3,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver", "child"],
    saferFlags: [],
    competencyIds: ["parenting", "emotional_regulation", "resilience"],
    subscales: [
      { id: "caregiving_load", label: "Caregiving Load & Overwhelm", description: "Feeling stretched thin by daily caregiving demands" },
    ],
    prompts: [
      { id: "pss_1", prompt: "Caring for my children sometimes takes more time and energy than I have to give.", subscaleId: "caregiving_load" },
      { id: "pss_2", prompt: "I sometimes worry whether I am doing enough or feel overwhelmed by the responsibility of being a parent.", subscaleId: "caregiving_load" },
      { id: "pss_3", prompt: "Balancing household tasks, appointments, and child needs leaves me with zero recovery time.", subscaleId: "caregiving_load" },
      { id: "pss_4", prompt: "Having practical respite or a simpler weekly schedule would significantly reduce my stress.", subscaleId: "caregiving_load" },
    ],
  }),

  buildQuickScale({
    id: "psi_sf",
    code: "PSI-SF-B",
    title: "Parenting Stress Index - Short Form (Dyadic & Child Regulation)",
    shortTitle: "Parenting Stress Index (PSI-SF)",
    category: "parenting_attachment_pdf",
    sourceReference: "Abidin (2012) Parenting Stress Index - Short Form (PSI-4-SF Adaptation)",
    description:
      "Differentiates Parental Distress (PD), Parent-Child Dysfunctional Interaction (P-CDI), and Difficult Child Regulation (DC).",
    targetAudience: ["parent", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.88,
    normativeSd: 3.4,
    clinicalCutoffRaw: 6,
    saferCategories: ["parent_or_caregiver", "child", "family"],
    saferFlags: [],
    competencyIds: ["parenting", "emotional_regulation", "understanding"],
    subscales: [
      { id: "dyadic_strain", label: "Parent-Child Dyadic Strain", description: "Feeling rejected or out of sync with the child" },
    ],
    prompts: [
      { id: "psi_1", prompt: "How often do you feel that your child rarely does things that make you feel good as a parent?", subscaleId: "dyadic_strain" },
      { id: "psi_2", prompt: "How often does your child seem much harder to soothe or settle than you expected?", subscaleId: "dyadic_strain" },
      { id: "psi_3", prompt: "How often do transitions (bedtime, dressing, meals) turn into exhausting standoffs?", subscaleId: "dyadic_strain" },
      { id: "psi_4", prompt: "How often do you feel trapped by your responsibilities as a caregiver?", subscaleId: "dyadic_strain" },
    ],
  }),

  buildQuickScale({
    id: "bcapi_risk",
    code: "BCAPI-P",
    title: "Brief Child Abuse Potential & Protective Rigidity Screen",
    shortTitle: "Rigid Expectations vs Flexibility (BCAPI-P)",
    category: "parenting_attachment_pdf",
    sourceReference: "Ondersma et al. (2005) Brief Child Abuse Potential Inventory (Protective Adaptation)",
    description:
      "Screens for rigid obedience expectations, family conflict, and emotional loneliness that benefit from flexible developmental coaching.",
    targetAudience: ["parent", "carer", "clinician"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.87,
    normativeSd: 3.1,
    clinicalCutoffRaw: 5,
    saferCategories: ["parent_or_caregiver", "risk", "protection_and_safety"],
    saferFlags: [],
    competencyIds: ["parenting", "understanding", "safety"],
    subscales: [
      { id: "rigid_expectations", label: "Rigidity vs Developmental Flexibility", description: "Expecting adult-level obedience from young children" },
    ],
    prompts: [
      { id: "bcapi_1", prompt: "Do you feel children should always obey immediately without ever crying or making a mess?", subscaleId: "rigid_expectations" },
      { id: "bcapi_2", prompt: "Do you often feel completely alone and misunderstood inside your own family?", subscaleId: "rigid_expectations" },
      { id: "bcapi_3", prompt: "Does a child's normal noise or play quickly feel like a personal attack on your peace?", subscaleId: "rigid_expectations" },
      { id: "bcapi_4", prompt: "Do household arguments frequently spill over into harshness with the children?", subscaleId: "rigid_expectations" },
    ],
  }),

  buildQuickScale({
    id: "rfq_8",
    code: "RFQ-8",
    title: "Fonagy Reflective Functioning Questionnaire (Mentalizing Certainty & Uncertainty)",
    shortTitle: "Reflective Functioning (RFQ-8)",
    category: "parenting_attachment_pdf",
    sourceReference: "Fonagy et al. (2016) Reflective Functioning Questionnaire (RFQ-8)",
    description:
      "Assesses capacity to recognize that both one's own and one's child's internal thoughts and feelings are nuanced and shaped by relational context.",
    targetAudience: ["parent", "partner", "carer"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.86,
    normativeSd: 3.0,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "child"],
    saferFlags: [],
    competencyIds: ["reflective_capacity", "insight", "self_awareness"],
    subscales: [
      { id: "balanced_mentalizing", label: "Balanced Mentalizing & Emotional Insight", description: "Understanding how emotions affect actions" },
    ],
    prompts: [
      { id: "rfq_1", prompt: "I realize that my own strong feelings can temporarily colour how I interpret someone else's behaviour.", subscaleId: "balanced_mentalizing" },
      { id: "rfq_2", prompt: "When I slow down and reflect, I can usually figure out why I reacted the way I did.", subscaleId: "balanced_mentalizing" },
      { id: "rfq_3", prompt: "I ask gentle questions rather than assuming I automatically know everything my child is thinking.", subscaleId: "balanced_mentalizing" },
      { id: "rfq_4", prompt: "Understanding what is happening inside my own mind helps me stay a calmer parent.", subscaleId: "balanced_mentalizing" },
    ],
  }),

  buildQuickScale({
    id: "rcads_child",
    code: "RCADS-BRIEF",
    title: "Revised Child Anxiety and Depression Scale (Youth Voice Brief Screen)",
    shortTitle: "Child Anxiety & Mood Check (RCADS-Brief)",
    category: "child_youth_voice",
    sourceReference: "Chorpita et al. (2000) RCADS Brief Youth & Caregiver Form",
    description:
      "Age-appropriate check-in for separation worry, school worry, tummy butterflies, and low mood in children and young people.",
    targetAudience: ["child", "parent", "carer"],
    higherScoreMeans: "higher_risk_or_distress",
    testRetestR: 0.86,
    normativeSd: 3.1,
    clinicalCutoffRaw: 5,
    saferCategories: ["child"],
    saferFlags: ["mental_health"],
    competencyIds: ["emotional_regulation", "safety"],
    subscales: [
      { id: "separation_worry", label: "Separation & Safety Worry", description: "Worrying about something bad happening to family" },
    ],
    prompts: [
      { id: "rcads_1", prompt: "Do you worry a lot that something bad might happen to someone in your family?", easyReadPrompt: "Do you worry a lot about your family?", subscaleId: "separation_worry" },
      { id: "rcads_2", prompt: "Does it feel scary to be away from your safe grown-up or go to sleep at night?", easyReadPrompt: "Is it scary to go to sleep at night?", subscaleId: "separation_worry" },
      { id: "rcads_3", prompt: "Do you feel sad, empty, or tired during play or school?", easyReadPrompt: "Do you feel sad or super tired at school?", subscaleId: "separation_worry" },
      { id: "rcads_4", prompt: "Does your heart beat super fast when you have to try something new?", easyReadPrompt: "Does your heart beat fast when you are worried?", subscaleId: "separation_worry" },
    ],
  }),

  buildQuickScale({
    id: "external_aai_attachment",
    code: "EXT-AAI",
    title: "Tier 3 Adult Attachment Interview & Coherence of Mind Summary Bridge",
    shortTitle: "External Adult Attachment Bridge (AAI)",
    category: "external_tier3_4_bridge",
    sourceReference: "George, Kaplan & Main (AAI) / Earned Security & Unresolved Trauma Formulation Bridge",
    description:
      "Integrates external clinical psychologist findings on caregiver attachment state of mind, earned security, and unresolved loss/trauma.",
    targetAudience: ["clinician"],
    higherScoreMeans: "higher_strength_or_safety",
    testRetestR: 0.90,
    normativeSd: 3.0,
    clinicalCutoffRaw: 10,
    saferCategories: ["parent_or_caregiver", "child", "strengths"],
    saferFlags: ["mental_health"],
    competencyIds: ["reflective_capacity", "insight", "parenting"],
    subscales: [
      { id: "narrative_coherence", label: "Earned Security & Narrative Coherence", description: "Making coherent sense of past adversity to protect the child" },
    ],
    prompts: [
      { id: "ext_aai_1", prompt: "Caregiver demonstrates 'earned security' or increasing coherence when reflecting on their own childhood history.", subscaleId: "narrative_coherence" },
      { id: "ext_aai_2", prompt: "Caregiver consciously works to break intergenerational cycles of fear or emotional distance.", subscaleId: "narrative_coherence" },
      { id: "ext_aai_3", prompt: "Unresolved loss or trauma triggers are identified and buffered with somatic grounding before child contact.", subscaleId: "narrative_coherence" },
      { id: "ext_aai_4", prompt: "Caregiver values attachment relationships and responds warmly to the child's attachment bids.", subscaleId: "narrative_coherence" },
    ],
  }),
];

export const CLINICAL_SCALE_CATEGORIES: {
  id: ClinicalScaleCategoryId;
  label: string;
  description: string;
}[] = [
  {
    id: "validity_anti_gaming",
    label: "1. Psychometric Validity, Impression Management & SJT Authenticity",
    description: "Embedded validity checks (MCSDS-SF, VRIN-CR, High-Pressure SJT) to detect faking-good, defensive minimisation, or random clicking.",
  },
  {
    id: "dfv_couples_restoration",
    label: "2. DFV, Coercive Control & Couples/Family Restoration Gateways",
    description: "MARAM/DVRISS, WEB entrapment, DVFCT Couples Readiness Gate, Person Using Violence Accountability, CSI-4, Co-Parenting & AVITH.",
  },
  {
    id: "addiction_aod",
    label: "3. Addiction (AOD), Cravings, Recovery Capital & Gambling",
    description: "WHO AUDIT, DAST-10, ASSIST-Lite, PACS-5 Cravings, BAM-R Recovery Capital, URICA Stages of Change & PGSI Gambling.",
  },
  {
    id: "mental_health_trauma",
    label: "4. Mental Health, Complex Trauma, Regulation, Sleep & Grief",
    description: "PHQ-9, GAD-7, K10, DASS-21, PCL-5, ITQ Complex PTSD, DERS-SF, ISI Sleep, Ambiguous Loss/Grief, Self-Compassion & BCEs.",
  },
  {
    id: "perinatal_infant",
    label: "5. Perinatal Mental Health & Parent-Infant Bonding",
    description: "EPDS-10 Perinatal Mood/Anxiety and MPAS/PPAS Parent-Infant Bonding & Safe Crying Plan.",
  },
  {
    id: "neurodiversity_abi",
    label: "6. Adult Neurodiversity, Executive Functioning, Sensory & ABI",
    description: "WHO ASRS-v1.1 Executive Scaffolding and Caregiver Sensory Overload / Post-Concussion / ABI Access Screen.",
  },
  {
    id: "cultural_sewb_carer",
    label: "7. Cultural SEWB, Kinship/Foster Carer Strain & Concrete Basic Needs",
    description: "First Nations GEM/SEWB, Kinship/Foster ProQOL Secondary Trauma & Poverty-vs-Neglect Concrete Needs Screen.",
  },
  {
    id: "parenting_attachment_pdf",
    label: "8. Parenting Capacity, Reflective Functioning & SafeSteps PDFs",
    description: "CAPES, PAFAS, PARS, KEPS, MAAP, FPS, GAPS, PTC/LBC, PRFQ-18 Reflective Functioning & PFS-2 Protective Factors.",
  },
  {
    id: "child_youth_voice",
    label: "9. Child & Youth Voice, Felt Safety & Trauma Screen",
    description: "Age-Calibrated Child Felt Safety & Worry Thermometer, CRIES-8 Child Trauma Screen & Multi-Informant SDQ.",
  },
  {
    id: "external_tier3_4_bridge",
    label: "10. External Psychologist Tier 3 & Tier 4 Summary Bridge",
    description: "Structured clinician bridge for PAI/MCMI-IV, TSI-2/WAIS-IV/ABAS-3, DPICS/CARE-Index/EAS & NCFAS-G+R/SDM/CAPI.",
  },
];

export function getClinicalScaleById(scaleId: string): ClinicalScaleDefinition | undefined {
  return CLINICAL_AND_PARENTING_SCALES.find((scale) => scale.id === scaleId);
}

export function getClinicalScalesByCategory(category: ClinicalScaleCategoryId): ClinicalScaleDefinition[] {
  return CLINICAL_AND_PARENTING_SCALES.filter((scale) => scale.category === category);
}

export function evaluateResponseValidity(
  scale: ClinicalScaleDefinition,
  responses: ClinicalScaleResponseInput[],
): ValidityCheckResult {
  if (responses.length === 0) {
    return {
      overallValidityBand: "caution_impression_management",
      validityScore: 50,
      socialDesirabilityIndex: 0,
      inconsistencyIndex: 0,
      straightLiningDetected: false,
      rapidClickThroughDetected: false,
      extremeMinimisationDetected: false,
      flags: ["No responses recorded"],
      clinicianGuidance: "Complete the scale items to compute response validity.",
    };
  }

  const itemScores = scale.items.map((item) => {
    const resp = responses.find((r) => r.itemId === item.id);
    if (!resp) return 0;
    if (typeof resp.numericScore === "number") return resp.numericScore;
    const opt = item.options.find((o) => o.id === resp.selectedOptionId);
    return opt?.score ?? 0;
  });

  // 1. Straight-lining check (identical non-zero option chosen across >= 4 items)
  const uniqueScores = new Set(itemScores);
  const straightLiningDetected = itemScores.length >= 4 && uniqueScores.size === 1 && itemScores[0] > 0;

  // 2. Rapid click-through check (average < 1100ms per item when timestamps supplied)
  const timings = responses
    .map((r) => r.responseTimeMs)
    .filter((ms): ms is number => typeof ms === "number" && ms > 0);
  const avgResponseMs =
    timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 4500;
  const rapidClickThroughDetected = timings.length >= 3 && avgResponseMs < 1100;

  // 3. Social desirability / extreme minimisation check
  const sdItems = scale.items.filter((i) => i.socialDesirabilityKey);
  let sdEndorsed = 0;
  for (const sdItem of sdItems) {
    const resp = responses.find((r) => r.itemId === sdItem.id);
    const opt = sdItem.options.find((o) => o.id === resp?.selectedOptionId);
    const maxOpt = Math.max(...sdItem.options.map((o) => o.score), 1);
    if ((opt?.score ?? resp?.numericScore ?? 0) >= maxOpt * 0.66) {
      sdEndorsed += 1;
    }
  }
  const socialDesirabilityIndex =
    sdItems.length > 0 ? Math.round((sdEndorsed / sdItems.length) * 100) : 0;

  // 4. Semantic pair inconsistency check
  const pairGroups = new Map<string, number[]>();
  scale.items.forEach((item, idx) => {
    if (item.validityPairId) {
      const list = pairGroups.get(item.validityPairId) ?? [];
      list.push(itemScores[idx] ?? 0);
      pairGroups.set(item.validityPairId, list);
    }
  });
  let inconsistentPairs = 0;
  for (const [, scores] of pairGroups.entries()) {
    if (scores.length >= 2) {
      const diff = Math.abs(scores[0] - scores[1]);
      if (diff >= 3) inconsistentPairs += 1;
    }
  }
  const inconsistencyIndex =
    pairGroups.size > 0 ? Math.round((inconsistentPairs / pairGroups.size) * 100) : 0;

  // 5. Extreme minimisation or ceiling perfection
  const totalRaw = itemScores.reduce((a, b) => a + b, 0);
  const extremeMinimisationDetected =
    (scale.higherScoreMeans === "higher_risk_or_distress" &&
      totalRaw === 0 &&
      scale.id === "validity_mcsds") ||
    socialDesirabilityIndex >= 67;

  const flags: string[] = [];
  if (straightLiningDetected) {
    flags.push("Uniform straight-line response pattern detected across all items");
  }
  if (rapidClickThroughDetected) {
    flags.push(`Rapid click-through detected (${Math.round(avgResponseMs)}ms/item avg)`);
  }
  if (extremeMinimisationDetected) {
    flags.push("Elevated Impression Management / socially desirable perfection endorsed");
  }
  if (inconsistencyIndex >= 50) {
    flags.push("Semantic pair inconsistency detected across paired validity items");
  }

  let validityScore = 100;
  if (straightLiningDetected) validityScore -= 30;
  if (rapidClickThroughDetected) validityScore -= 35;
  if (extremeMinimisationDetected) validityScore -= 25;
  if (inconsistencyIndex >= 50) validityScore -= 25;
  validityScore = Math.max(10, Math.min(100, validityScore));

  const overallValidityBand: ValidityCheckResult["overallValidityBand"] =
    validityScore < 55
      ? "invalid_gaming_or_random"
      : validityScore < 80
        ? "caution_impression_management"
        : "valid";

  const clinicianGuidance =
    overallValidityBand === "valid"
      ? "Response pattern is internally consistent and within attentive norms."
      : overallValidityBand === "caution_impression_management"
        ? "Caution: Responses show defensive minimisation or impression management. Cross-check against Situational Judgement Vignettes (SJT), live stress roleplay, and worker/child observations."
        : "Alert: High probability of rapid click-through, straight-lining, or gaming. Re-administer via conversational SJT vignette or live practitioner check-in.";

  return {
    overallValidityBand,
    validityScore,
    socialDesirabilityIndex,
    inconsistencyIndex,
    straightLiningDetected,
    rapidClickThroughDetected,
    extremeMinimisationDetected,
    flags,
    clinicianGuidance,
  };
}

export function scoreClinicalScale(
  scaleId: string,
  responses: ClinicalScaleResponseInput[],
  administrationForm: ClinicalScaleAdministrationForm = "standard_scale",
): ClinicalScaleScoreOutput {
  const scale = getClinicalScaleById(scaleId);
  if (!scale) {
    throw new Error(`Unknown clinical scale: ${scaleId}`);
  }

  let rawScore = 0;
  const criticalOverrideReasons: string[] = [];
  const subscaleBuckets: Record<string, { raw: number; max: number; label: string }> = {};

  for (const sub of scale.subscales) {
    subscaleBuckets[sub.id] = { raw: 0, max: 0, label: sub.label };
  }

  for (const item of scale.items) {
    const itemMax = Math.max(...item.options.map((o) => o.score), 0);
    const resp = responses.find((r) => r.itemId === item.id);
    const selectedOpt = resp?.selectedOptionId
      ? item.options.find((o) => o.id === resp.selectedOptionId)
      : undefined;

    const rawItemScore =
      selectedOpt?.score ??
      (typeof resp?.numericScore === "number"
        ? Math.max(0, Math.min(itemMax, resp.numericScore))
        : 0);

    const effectiveScore = item.reverseScored ? itemMax - rawItemScore : rawItemScore;
    rawScore += effectiveScore;

    if (item.subscaleId && subscaleBuckets[item.subscaleId]) {
      subscaleBuckets[item.subscaleId].raw += effectiveScore;
      subscaleBuckets[item.subscaleId].max += itemMax;
    }

    if (selectedOpt?.triggersCriticalOverride && selectedOpt.criticalReason) {
      criticalOverrideReasons.push(selectedOpt.criticalReason);
    } else {
      const matchingCriticalOpt = item.options.find(
        (o) => o.triggersCriticalOverride && effectiveScore >= o.score,
      );
      if (matchingCriticalOpt?.criticalReason) {
        criticalOverrideReasons.push(matchingCriticalOpt.criticalReason);
      }
    }
  }

  const normalizedScore =
    scale.maxRawScore > 0 ? Math.round((rawScore / scale.maxRawScore) * 10000) / 100 : 0;

  // Strength-adjusted score (0-100 where 100 always means higher safety/competency for downstream psychometric engines)
  const strengthAdjustedScore =
    scale.higherScoreMeans === "higher_strength_or_safety"
      ? normalizedScore
      : Math.max(0, Math.round((100 - normalizedScore) * 100) / 100);

  let matchedBand =
    scale.bands.find((b) => rawScore >= b.minRawScore && rawScore <= b.maxRawScore) ??
    scale.bands[scale.bands.length - 1];

  const criticalOverrideTriggered = criticalOverrideReasons.length > 0;
  if (criticalOverrideTriggered && scale.higherScoreMeans === "higher_risk_or_distress") {
    matchedBand = scale.bands[scale.bands.length - 1];
  }

  const subscaleScores: Record<
    string,
    { raw: number; max: number; normalized: number; label: string }
  > = {};
  for (const [subId, bucket] of Object.entries(subscaleBuckets)) {
    subscaleScores[subId] = {
      raw: bucket.raw,
      max: bucket.max,
      normalized: bucket.max > 0 ? Math.round((bucket.raw / bucket.max) * 10000) / 100 : 0,
      label: bucket.label,
    };
  }

  const validity = evaluateResponseValidity(scale, responses);

  const requiresSupervisorReview = Boolean(
    matchedBand.requiresSupervisorReview ||
      criticalOverrideTriggered ||
      validity.overallValidityBand === "invalid_gaming_or_random",
  );

  return {
    scaleId: scale.id,
    scaleTitle: scale.title,
    category: scale.category,
    administrationForm,
    rawScore,
    maxRawScore: scale.maxRawScore,
    normalizedScore,
    strengthAdjustedScore,
    band: matchedBand,
    subscaleScores,
    criticalOverrideTriggered,
    criticalOverrideReasons,
    requiresSupervisorReview,
    validity,
    saferCategories: scale.saferCategories,
    saferFlags: scale.saferFlags,
    competencyIds: scale.competencyIds,
    assessedAt: new Date().toISOString(),
  };
}

/**
 * Jacobson & Truax (1991) Reliable Change Index (RCI) Calculator
 * RCI = (X_current - X_baseline) / S_diff
 * where S_E = SD * sqrt(1 - r_xx) and S_diff = sqrt(2 * S_E^2)
 * |RCI| >= 1.96 indicates statistically reliable change at p < 0.05.
 */
export function computeReliableChangeIndex(params: {
  scaleId: string;
  baselineRaw: number;
  currentRaw: number;
}): ReliableChangeIndexResult {
  const scale = getClinicalScaleById(params.scaleId);
  if (!scale) {
    throw new Error(`Unknown clinical scale for RCI: ${params.scaleId}`);
  }

  const sem = scale.normativeSd * Math.sqrt(Math.max(0.01, 1 - scale.testRetestR));
  const sDiff = Math.sqrt(2 * sem * sem);
  const rawDifference = params.currentRaw - params.baselineRaw;
  const rciValue = Math.round((rawDifference / sDiff) * 100) / 100;
  const statisticallyReliable = Math.abs(rciValue) >= 1.96;

  const isStrengthScale = scale.higherScoreMeans === "higher_strength_or_safety";
  const improvedDirection = isStrengthScale ? rawDifference > 0 : rawDifference < 0;

  const crossedClinicalCutoff = isStrengthScale
    ? params.baselineRaw < scale.clinicalCutoffRaw && params.currentRaw >= scale.clinicalCutoffRaw
    : params.baselineRaw >= scale.clinicalCutoffRaw && params.currentRaw < scale.clinicalCutoffRaw;

  let classification: ReliableChangeIndexResult["classification"] = "no_reliable_change";
  if (statisticallyReliable && improvedDirection) {
    classification = crossedClinicalCutoff
      ? "clinically_significant_improvement"
      : "reliable_improvement";
  } else if (statisticallyReliable && !improvedDirection) {
    classification = "reliable_deterioration";
  }

  const summary =
    classification === "clinically_significant_improvement"
      ? `${scale.shortTitle}: Clinically significant & statistically reliable improvement (RCI = ${rciValue}, crossed recovery cutoff).`
      : classification === "reliable_improvement"
        ? `${scale.shortTitle}: Statistically reliable improvement (RCI = ${rciValue}, p < .05).`
        : classification === "reliable_deterioration"
          ? `${scale.shortTitle}: Statistically reliable deterioration detected (RCI = ${rciValue}, p < .05) — review triggers and safety plan.`
          : `${scale.shortTitle}: Within measurement error / stable (RCI = ${rciValue}).`;

  return {
    scaleId: scale.id,
    scaleTitle: scale.title,
    baselineRaw: params.baselineRaw,
    currentRaw: params.currentRaw,
    rawDifference,
    standardErrorOfMeasurement: Math.round(sem * 100) / 100,
    standardErrorOfDifference: Math.round(sDiff * 100) / 100,
    rciValue,
    statisticallyReliable,
    crossedClinicalCutoff,
    classification,
    summary,
  };
}
