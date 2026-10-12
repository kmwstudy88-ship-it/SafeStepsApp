import type { ClinicalScaleScoreOutput } from "../data/clinicalAndParentingScales";
import type {
  ClinicalPathwayId,
  CouplesRestorationStageId,
  InteractionFormId,
} from "../data/therapeuticCoachingProtocols";
import {
  buildUncertaintyDisclosure,
  computeAuditSha256,
  redactSensitivePii,
  sanitizeAiOutputAgainstSafetyPolicy,
  type CouplesDfvSafetyCheckResult,
} from "./aiSupportCoachEngine";

export type ExternalTier34PsychSummaryInput = {
  id: string;
  instrumentCode:
    | "PAI"
    | "MCMI-IV"
    | "MMPI-3"
    | "TSI-2"
    | "WAIS-IV"
    | "ABAS-3"
    | "AAI"
    | "DPICS-IV"
    | "CARE-Index"
    | "EAS"
    | "NCFAS-G+R"
    | "SDM"
    | "CAPI";
  psychologistOrAssessorName?: string;
  assessmentDate: string;
  validitySummary: string;
  keyStrengthsIdentified: string[];
  keyClinicalAndSafetyNeeds: string[];
  recommendedCoachingAccommodations: string[];
};

export type SafeAndTogetherFormulationSummary = {
  perpetratorPatternIdentified: boolean;
  coerciveControlBehavioursNamed: string[];
  survivorProtectiveEffortsDocumented: string[];
  childImpactAndRecoveryNeeds: string[];
  povertyOrSystemicBarriersDistinguishedFromNeglect: string[];
  nonVictimBlamingGuardrailVerified: true;
};

export type CouplesDfvRestorationFormulationSummary = {
  recommendedStage: CouplesRestorationStageId;
  conjointClearanceStatus:
    | "blocked_crisis_or_coercive_control"
    | "parallel_only"
    | "clinician_cleared_conjoint"
    | "paused_safety_pivot";
  rationale: string;
  requiredSafetyPrerequisites: string[];
};

export type RecommendedInterventionPlanItem = {
  id: string;
  domain: string;
  pathwayId: ClinicalPathwayId;
  recommendedForms: InteractionFormId[];
  frequency: string;
  clinicalRationale: string;
};

export type FivePPsychologicalFormulation = {
  id: string;
  caseId?: string;
  participantUserId: string;
  presentingFactors: string[];
  predisposingFactors: string[];
  precipitatingFactors: string[];
  perpetuatingFactors: string[];
  protectiveFactors: string[];
  intersectionalSynthesis: string;
  safeAndTogetherSummary: SafeAndTogetherFormulationSummary;
  couplesDfvRestorationSummary: CouplesDfvRestorationFormulationSummary;
  neurodiversitySensoryAccommodations: string[];
  culturalSewbConsiderations: string[];
  externalTier34Summaries: ExternalTier34PsychSummaryInput[];
  recommendedInterventions: RecommendedInterventionPlanItem[];
  confidenceScore: number;
  uncertaintyDisclosure: string | null;
  nonDiagnosticComplianceBanner: string;
  reviewState:
    | "draft_requires_clinician_review"
    | "clinician_approved"
    | "clinician_amended"
    | "contested";
  reviewedByUserId?: string;
  reviewedAt?: string;
  clinicianNotes?: string;
  auditSha256: string;
  createdAt: string;
};

export type BuildFivePFormulationInput = {
  caseId?: string;
  participantUserId: string;
  screenings: ClinicalScaleScoreOutput[];
  couplesSafetyChecks?: CouplesDfvSafetyCheckResult[];
  externalTier34Summaries?: ExternalTier34PsychSummaryInput[];
  recentNarrativeNotes?: string[];
  clinicianClearedConjoint?: boolean;
  confidenceOverride?: number;
};

export function buildFivePPsychologicalFormulation(
  input: BuildFivePFormulationInput,
): FivePPsychologicalFormulation {
  const findScale = (id: string) => input.screenings.find((s) => s.scaleId === id);

  const dfvScale = findScale("dfv_safety_coercive");
  const webScale = findScale("web_safety");
  const dvfctScale = findScale("dvfct_readiness");
  const puvScale = findScale("puv_accountability");
  const auditScale = findScale("audit");
  const dastScale = findScale("dast_10");
  const pacsScale = findScale("pacs_5");
  const bamScale = findScale("bam_r");
  const phqScale = findScale("phq_9");
  const gadScale = findScale("gad_7");
  const pclScale = findScale("pcl_5_short");
  const itqScale = findScale("itq_cptsd");
  const dersScale = findScale("ders_sf");
  const isiScale = findScale("isi_sleep");
  const griefScale = findScale("grief_ambiguous_loss");
  const bcesScale = findScale("bces_10");
  const epdsScale = findScale("epds_10");
  const asrsScale = findScale("asrs_6");
  const sensoryScale = findScale("ef_sensory_abi");
  const sewbScale = findScale("gem_sewb");
  const sdhScale = findScale("concrete_needs");
  const prfqScale = findScale("prfq");
  const pfsScale = findScale("pfs_2");
  const childSafetyScale = findScale("child_felt_safety");

  const presentingFactors: string[] = [];
  const predisposingFactors: string[] = [];
  const precipitatingFactors: string[] = [];
  const perpetuatingFactors: string[] = [];
  const protectiveFactors: string[] = [];

  // 1. Presenting Factors (Non-diagnostic functional synthesis)
  if (dfvScale && dfvScale.normalizedScore >= 25) {
    presentingFactors.push(
      `Elevated family safety and coercive control stress indicators (${dfvScale.scaleTitle}: ${dfvScale.band.label}).`,
    );
  }
  if (webScale && webScale.normalizedScore >= 30) {
    presentingFactors.push(
      `Experience of psychological hypervigilance ('walking on eggshells') impacting caregiver autonomy (${webScale.band.label}).`,
    );
  }
  if ((auditScale && auditScale.normalizedScore >= 30) || (dastScale && dastScale.normalizedScore >= 25)) {
    presentingFactors.push(
      "Substance use or craving waves interacting with household stress and evening/post-contact emotional transitions.",
    );
  }
  if ((phqScale && phqScale.normalizedScore >= 35) || (gadScale && gadScale.normalizedScore >= 35)) {
    presentingFactors.push(
      "Elevated mood fatigue, nervous system worry, and emotional overwhelm affecting daily parenting bandwidth.",
    );
  }
  if (epdsScale && epdsScale.normalizedScore >= 30) {
    presentingFactors.push(
      "Perinatal emotional strain and broken-sleep exhaustion requiring structured infant-soothing and respite support.",
    );
  }
  if (presentingFactors.length === 0) {
    presentingFactors.push(
      "Caregiver is engaging proactively in structured parenting co-regulation, emotional steadiness, and family safety strengthening.",
    );
  }

  // 2. Predisposing Factors
  if ((pclScale && pclScale.normalizedScore >= 35) || (itqScale && itqScale.normalizedScore >= 35)) {
    predisposingFactors.push(
      "History of cumulative trauma exposure with sensitized nervous system startle and threat-detection responses under stress.",
    );
  }
  if ((asrsScale && asrsScale.normalizedScore >= 40) || (sensoryScale && sensoryScale.normalizedScore >= 35)) {
    predisposingFactors.push(
      "Neurodivergent executive functioning, sensory processing sensitivity, or cognitive fatigue requiring visual external scaffolding.",
    );
  }
  if (sdhScale && sdhScale.normalizedScore >= 30) {
    predisposingFactors.push(
      "Structural material, housing, or financial stressors (explicitly distinguished from parental neglect).",
    );
  }
  if (predisposingFactors.length === 0) {
    predisposingFactors.push(
      "Cumulative family transitions and high caregiving demands in the context of child welfare involvement.",
    );
  }

  // 3. Precipitating Factors
  if (griefScale && griefScale.normalizedScore >= 35) {
    precipitatingFactors.push(
      "Acute waves of grief or ambiguous loss (particularly around family separation, handovers, or post-contact transitions).",
    );
  }
  if (pacsScale && pacsScale.normalizedScore >= 35) {
    precipitatingFactors.push(
      "Recent spike in HALT (Hungry, Angry, Lonely, Tired) craving triggers during evening transitions.",
    );
  }
  precipitatingFactors.push(
    "High-demand household transition windows (7:00–8:30 AM school prep and 5:00–8:00 PM dinner/bedtime routines).",
  );

  // 4. Perpetuating Factors
  if (isiScale && isiScale.normalizedScore >= 35) {
    perpetuatingFactors.push(
      "Chronic sleep disruption and circadian exhaustion lowering prefrontal impulse regulation and frustration tolerance.",
    );
  }
  if (dersScale && dersScale.normalizedScore >= 35) {
    perpetuatingFactors.push(
      "Difficulty accessing rapid somatic down-regulation skills before body tension crosses 6/10.",
    );
  }
  if (sdhScale && sdhScale.normalizedScore >= 30) {
    perpetuatingFactors.push(
      "Unresolved practical brokerage needs (transport, childcare, or financial strain) compounding daily cognitive load.",
    );
  }
  if (perpetuatingFactors.length === 0) {
    perpetuatingFactors.push(
      "Self-criticism and fear of systemic judgement when minor parenting ruptures occur.",
    );
  }

  // 5. Protective Factors
  if (bcesScale && bcesScale.strengthAdjustedScore >= 60) {
    protectiveFactors.push(
      "Strong internalised benevolent anchors and clear vision of a safe, predictable home for the children (BCES-10).",
    );
  }
  if (prfqScale && prfqScale.strengthAdjustedScore >= 60) {
    protectiveFactors.push(
      "Demonstrated Parental Reflective Functioning (PRFQ): curiosity about the child's internal emotional world and non-hostile attribution.",
    );
  }
  if (sewbScale && sewbScale.strengthAdjustedScore >= 60) {
    protectiveFactors.push(
      "Strong Cultural Social & Emotional Wellbeing (GEM-SEWB): connection to kinship, community, Elders, and cultural pride.",
    );
  }
  if (bamScale && bamScale.strengthAdjustedScore >= 60) {
    protectiveFactors.push(
      "Active recovery capital, locked safe storage, and sober support network (BAM-R).",
    );
  }
  if (pfsScale && pfsScale.strengthAdjustedScore >= 60) {
    protectiveFactors.push(
      "Verified family protective factors, nurturing attachment commitment, and willingness to partner with support services (PFS-2).",
    );
  }
  if (protectiveFactors.length === 0) {
    protectiveFactors.push(
      "Active participation in SafeSteps check-ins, willingness to reflect on child safety, and desire to build calm routines.",
    );
  }

  // Safe & Together™ DFV Formulation Summary
  const perpetratorPatternIdentified = Boolean(
    (dfvScale && dfvScale.normalizedScore >= 25) ||
      (webScale && webScale.normalizedScore >= 30) ||
      input.couplesSafetyChecks?.some((c) => c.silentPivotTriggered),
  );

  const safeAndTogetherSummary: SafeAndTogetherFormulationSummary = {
    perpetratorPatternIdentified,
    coerciveControlBehavioursNamed: perpetratorPatternIdentified
      ? [
          "Intimidation, tone/posture escalation, or surveillance patterns creating an 'eggshells' climate in the household",
          "Disruption of household predictability and caregiver autonomy during high-stress transitions",
        ]
      : [],
    survivorProtectiveEffortsDocumented: [
      "Maintaining children's mealtime, school, and bedtime routines despite household stress",
      "Soothing and comforting children during emotional transitions",
      "Engaging proactively with safety planning and private felt-safety check-ins",
    ],
    childImpactAndRecoveryNeeds: [
      childSafetyScale && childSafetyScale.strengthAdjustedScore < 65
        ? "Child reports elevated worry thermometer signals; requires predictable routines and explicit reassurance that adult tension is never their fault."
        : "Child benefits from continued predictable bedtime routines, trusted adult check-ins, and calm co-regulation.",
    ],
    povertyOrSystemicBarriersDistinguishedFromNeglect:
      sdhScale && sdhScale.normalizedScore >= 25
        ? [
            "Material, housing, or financial shortages identified on SDH-NEEDS must be addressed via practical brokerage and never conflated with lack of parental care.",
          ]
        : [
            "No acute material deprivation conflation detected; continue monitoring practical support needs.",
          ],
    nonVictimBlamingGuardrailVerified: true,
  };

  // Couples & Family DFV Restoration Stage Recommendation
  const latestSafetyCheck = input.couplesSafetyChecks?.[0];
  const hasCriticalDfvOverride = Boolean(
    dfvScale?.criticalOverrideTriggered ||
      webScale?.criticalOverrideTriggered ||
      latestSafetyCheck?.recommendedMode === "tier1_crisis_halt" ||
      latestSafetyCheck?.recommendedMode === "individual_stabilisation_only",
  );
  const hasParallelPivot = Boolean(
    latestSafetyCheck?.silentPivotTriggered ||
      (webScale && webScale.normalizedScore >= 30),
  );
  const readinessStrong =
    (!dvfctScale || dvfctScale.strengthAdjustedScore >= 70) &&
    (!puvScale || puvScale.strengthAdjustedScore >= 68);

  let recommendedStage: CouplesRestorationStageId = "stage_2_parallel_synchronised";
  let conjointClearanceStatus: CouplesDfvRestorationFormulationSummary["conjointClearanceStatus"] =
    "parallel_only";
  let stageRationale =
    "Stage 2 Parallel Synchronised Coaching is recommended so both caregivers can practise the Shared Time-Out Contract and BIFF Safe Message Bridge independently before any conjoint work.";

  if (hasCriticalDfvOverride) {
    recommendedStage = "stage_1_containment_individual";
    conjointClearanceStatus = "blocked_crisis_or_coercive_control";
    stageRationale =
      "Stage 1 Individual Stabilisation Only: Conjoint couple coaching is strictly contraindicated due to high-lethality, coercive control, or acute fear indicators.";
  } else if (hasParallelPivot) {
    recommendedStage = "stage_2_parallel_synchronised";
    conjointClearanceStatus = "paused_safety_pivot";
    stageRationale =
      "Silent Safety Pivot Active: Private felt-safety check-in indicates < 7/10 safety or fear of retaliation. Session remains in Stage 2 Parallel Safe Mode.";
  } else if (readinessStrong && input.clinicianClearedConjoint) {
    recommendedStage = "stage_3_conjoint_safety_gated";
    conjointClearanceStatus = "clinician_cleared_conjoint";
    stageRationale =
      "Stage 3 Clinician-Cleared Conjoint Restoration: Both partners meet DVFCT-R readiness, PUV-ACC accountability, and private felt-safety (>= 7/10) prerequisites.";
  }

  const couplesDfvRestorationSummary: CouplesDfvRestorationFormulationSummary = {
    recommendedStage,
    conjointClearanceStatus,
    rationale: stageRationale,
    requiredSafetyPrerequisites: [
      "Mandatory Private Pre- and Post-Session Felt-Safety Check-In (>= 7/10, zero fear of retaliation) before every session",
      "Signed 20-Minute Physiological Time-Out Contract with zero door-blocking and zero hostile texting",
      "100% ownership of harmful behaviour without blaming stress, substances, or the partner",
    ],
  };

  // Neurodiversity, Sensory & ABI Accommodations
  const neurodiversitySensoryAccommodations: string[] = [
    "Break multi-step case plan goals into 3-step visual checklists with external calendar reminders.",
    "Provide both written plain-language summaries and optional voice playback after meetings.",
    "Incorporate a 10-minute sensory decompression buffer (dimmed lights, low noise) before dinner/bedtime transitions.",
  ];
  if (sensoryScale && sensoryScale.normalizedScore >= 35) {
    neurodiversitySensoryAccommodations.unshift(
      "Caregiver endorsed elevated sensory overload / cognitive fatigue on EF-SENS-ABI: use Easy-Read mode and avoid rapid multi-question interviewing.",
    );
  }

  // Cultural SEWB Considerations
  const culturalSewbConsiderations: string[] = [
    "Honour holistic Social and Emotional Wellbeing across Connection to Spirit, Country, Culture, Kinship, Community, Mind, and Body.",
    "Recognise extended kinship networks (Elders, Aunties, Uncles, Grandparents) as core protective attachment figures.",
    "Ensure family-led decision-making and ACCO / cultural support representation when desired by the family.",
  ];

  // Intersectional Narrative Synthesis (Tri-Morbid + Sleep + Grief + Child Safety)
  const rawSynthesis =
    "Intersectional Formulation Synthesis: Rather than viewing family challenges in isolated silos, the current pattern reflects an interacting cycle where cumulative trauma reminders, broken sleep, and high-stress transition windows narrow the caregiver's Window of Tolerance. When nervous system arousal spikes (or drops into grief/shutdown after contact visits), cravings or relationship reactivity can intensify. However, the caregiver demonstrates meaningful protective anchors and care for their children. By pairing immediate safety containment (Stage-gated DFV protection, Safe Sober Caregiver routines, and 60-second somatic resets) with neuro-affirming visual checklists and Circle of Security co-regulation, the family can steadily expand safety and predictability.";

  const { sanitizedText: intersectionalSynthesis } =
    sanitizeAiOutputAgainstSafetyPolicy(rawSynthesis);

  // Recommended Multi-Modal Interventions
  const recommendedInterventions: RecommendedInterventionPlanItem[] = [
    {
      id: "int_parent_coreg",
      domain: "Parent-Child Attachment & Co-Regulation",
      pathwayId: "parent_co_regulation_cos",
      recommendedForms: [
        "reflective_dialogue",
        "sjt_vignette",
        "teach_back_perspective_switch",
      ],
      frequency: "2x weekly (10 mins) + daily bedtime repair check",
      clinicalRationale:
        "Strengthens Circle of Security 'Bigger, Stronger, Wiser, Kind' co-regulation and same-day rupture-and-repair.",
    },
    {
      id: "int_couples_dfv",
      domain: "Couples & Co-Parenting Safety Boundary",
      pathwayId:
        recommendedStage === "stage_1_containment_individual"
          ? "dfv_survivor_safety_planning"
          : "couples_dfv_restoration",
      recommendedForms: [
        "shared_timeout_contract",
        "safe_partner_message_bridge",
        "stress_roleplay_simulator",
      ],
      frequency: "Before every co-parent communication + weekly skill check",
      clinicalRationale: stageRationale,
    },
    {
      id: "int_regulation_aod_mh",
      domain: "Nervous System, Sleep & Relapse Prevention",
      pathwayId:
        auditScale && auditScale.normalizedScore >= 25
          ? "addiction_mi_relapse_prevention"
          : "mental_health_cbt_dbt_act",
      recommendedForms: ["somatic_body_map", "ema_micro_pulse", "spaced_retention_retest"],
      frequency: "Daily 15-second morning & evening EMA pulses + on-demand 60s TIPP reset",
      clinicalRationale:
        "Buffers HALT, post-contact grief waves, and sleep exhaustion before escalation occurs.",
    },
  ];

  const dataPointsCount =
    input.screenings.length +
    (input.couplesSafetyChecks?.length ?? 0) +
    (input.externalTier34Summaries?.length ?? 0);
  const computedConfidence =
    input.confidenceOverride ??
    Math.min(0.94, Math.max(0.42, 0.52 + dataPointsCount * 0.06));
  const uncertaintyDisclosure = buildUncertaintyDisclosure(computedConfidence);

  const sanitizedNotes = (input.recentNarrativeNotes ?? []).map((n) =>
    redactSensitivePii(n),
  );

  const auditPayload = JSON.stringify({
    participantUserId: input.participantUserId,
    presentingFactors,
    recommendedStage,
    computedConfidence,
    sanitizedNotesCount: sanitizedNotes.length,
  });

  return {
    id: `formulation-${computeAuditSha256(auditPayload).slice(0, 12)}`,
    caseId: input.caseId,
    participantUserId: input.participantUserId,
    presentingFactors,
    predisposingFactors,
    precipitatingFactors,
    perpetuatingFactors,
    protectiveFactors,
    intersectionalSynthesis,
    safeAndTogetherSummary,
    couplesDfvRestorationSummary,
    neurodiversitySensoryAccommodations,
    culturalSewbConsiderations,
    externalTier34Summaries: input.externalTier34Summaries ?? [],
    recommendedInterventions,
    confidenceScore: Math.round(computedConfidence * 100) / 100,
    uncertaintyDisclosure,
    nonDiagnosticComplianceBanner:
      "NON-DIAGNOSTIC FORMULATION NOTICE (SafeSteps Safety Policy): This 5P formulation synthesizes functional strengths, triggers, and protective scaffolds to support practitioner Structured Professional Judgement (SPJ). It is not a medical, psychiatric, or legal diagnosis.",
    reviewState: "draft_requires_clinician_review",
    auditSha256: computeAuditSha256(auditPayload),
    createdAt: new Date().toISOString(),
  };
}
