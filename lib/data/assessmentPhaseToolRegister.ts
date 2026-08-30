/**
 * Phase Tool Register
 *
 * Lists the assessment tools relevant to each phase of the SafeSteps
 * reunification program.  This is a metadata register only — it does NOT
 * copy restricted test items, scoring keys, or interpretive algorithms.
 *
 * Licensed tools must be administered and scored by qualified staff using
 * the authorised instrument.  SafeSteps stores the professional's summary
 * and score as external evidence, not the raw test content.
 */

export type ToolAdminRole =
  | "psychologist"
  | "worker"
  | "trained_observer"
  | "licensed_platform"
  | "worker_under_policy"
  | "forensic_psychologist";

export type ToolStorageMode =
  | "app_native"          // Can be collected and scored inside SafeSteps (policy-approved)
  | "external_summary"    // Store professional summary and score only — instrument is external
  | "metadata_only";      // Store existence and date only — tool is fully licensed/restricted

export type AssessmentTool = {
  id: string;
  name: string;
  fullName: string;
  domain: string;
  adminRole: ToolAdminRole;
  storageMode: ToolStorageMode;
  governanceNote?: string;
};

export type ProgramPhase =
  | "pre_entry"
  | "phase_1"
  | "phase_2"
  | "phase_3"
  | "exit";

export type PhaseToolEntry = {
  phase: ProgramPhase;
  phaseLabel: string;
  phaseWeeks: string;
  tools: AssessmentTool[];
};

// ---------------------------------------------------------------------------
// Individual tool definitions
// ---------------------------------------------------------------------------

const PAI: AssessmentTool = {
  id: "pai",
  name: "PAI",
  fullName: "Personality Assessment Inventory",
  domain: "Psychopathology and clinical profile",
  adminRole: "psychologist",
  storageMode: "external_summary",
  governanceNote: "Requires qualified psychologist. Store professional report and summary only.",
};

const MCMI_IV: AssessmentTool = {
  id: "mcmi_iv",
  name: "MCMI-IV",
  fullName: "Millon Clinical Multiaxial Inventory-IV",
  domain: "Personality and clinical psychopathology",
  adminRole: "psychologist",
  storageMode: "external_summary",
  governanceNote: "Requires qualified psychologist. Store professional report and summary only.",
};

const AAI: AssessmentTool = {
  id: "aai",
  name: "AAI",
  fullName: "Adult Attachment Interview",
  domain: "Attachment patterns and parenting representations",
  adminRole: "psychologist",
  storageMode: "external_summary",
  governanceNote: "Requires trained interviewer or psychologist. Store attachment formulation and report only.",
};

const ACE: AssessmentTool = {
  id: "ace",
  name: "ACE Structured Interview",
  fullName: "Adverse Childhood Experiences Structured Interview",
  domain: "Developmental and trauma history",
  adminRole: "worker",
  storageMode: "external_summary",
  governanceNote: "Store structured history summary. Do not store individual ACE items without a clinical governance framework.",
};

const TSI_2: AssessmentTool = {
  id: "tsi_2",
  name: "TSI-2",
  fullName: "Trauma Symptom Inventory-2",
  domain: "Trauma symptom assessment",
  adminRole: "psychologist",
  storageMode: "external_summary",
  governanceNote: "Requires qualified psychologist or clinician. Store external report and summary only.",
};

const WAIS_IV: AssessmentTool = {
  id: "wais_iv",
  name: "WAIS-IV",
  fullName: "Wechsler Adult Intelligence Scale-IV",
  domain: "Cognitive functioning and adaptive behaviour",
  adminRole: "psychologist",
  storageMode: "external_summary",
  governanceNote: "Requires qualified psychologist. Store external report and functional implications only.",
};

const SDM: AssessmentTool = {
  id: "sdm",
  name: "SDM",
  fullName: "Structured Decision Making Model",
  domain: "Risk and safety classification",
  adminRole: "worker_under_policy",
  storageMode: "external_summary",
  governanceNote: "Store risk and safety score summary under agency policy. Do not store scoring guides.",
};

const AAPI_2: AssessmentTool = {
  id: "aapi_2",
  name: "AAPI-2",
  fullName: "Adult Adolescent Parenting Inventory-2",
  domain: "Parenting attitudes and childrearing beliefs",
  adminRole: "worker_under_policy",
  storageMode: "external_summary",
  governanceNote: "Store score summary under agency licensing rules.",
};

const PSI_4: AssessmentTool = {
  id: "psi_4",
  name: "PSI-4",
  fullName: "Parenting Stress Index-4",
  domain: "Parenting stress and parent-child interaction quality",
  adminRole: "worker_under_policy",
  storageMode: "external_summary",
  governanceNote: "Store score summary under agency licensing rules.",
};

const PHQ_9: AssessmentTool = {
  id: "phq_9",
  name: "PHQ-9",
  fullName: "Patient Health Questionnaire-9",
  domain: "Depression screening",
  adminRole: "worker_under_policy",
  storageMode: "app_native",
  governanceNote: "Can be app-native if policy-approved. Store total score and response set.",
};

const GAD_7: AssessmentTool = {
  id: "gad_7",
  name: "GAD-7",
  fullName: "Generalised Anxiety Disorder Scale-7",
  domain: "Anxiety screening",
  adminRole: "worker_under_policy",
  storageMode: "app_native",
  governanceNote: "Can be app-native if policy-approved. Store total score and response set.",
};

const AUDIT: AssessmentTool = {
  id: "audit",
  name: "AUDIT",
  fullName: "Alcohol Use Disorders Identification Test",
  domain: "Alcohol use and risk",
  adminRole: "worker_under_policy",
  storageMode: "app_native",
  governanceNote: "Can be app-native using authorised version. Store total score and hazardous use flag.",
};

const DAST_10: AssessmentTool = {
  id: "dast_10",
  name: "DAST-10",
  fullName: "Drug Abuse Screening Test-10",
  domain: "Drug use risk screening",
  adminRole: "worker_under_policy",
  storageMode: "app_native",
  governanceNote: "Can be app-native using authorised version. Store total score and severity classification.",
};

const NCFAS_G: AssessmentTool = {
  id: "ncfas_g",
  name: "NCFAS-G",
  fullName: "North Carolina Family Assessment Scale – General",
  domain: "Family functioning across environment, parental capabilities, family interactions, family safety, and child wellbeing",
  adminRole: "worker_under_policy",
  storageMode: "external_summary",
  governanceNote: "Store licensed score summary under agency licence and policy.",
};

const DPICS: AssessmentTool = {
  id: "dpics",
  name: "DPICS",
  fullName: "Dyadic Parent-Child Interaction Coding System",
  domain: "Parent-child interaction quality",
  adminRole: "trained_observer",
  storageMode: "external_summary",
  governanceNote: "Store coded observation summary from trained observer only.",
};

const EAS: AssessmentTool = {
  id: "eas",
  name: "EAS",
  fullName: "Emotional Availability Scales",
  domain: "Emotional availability and co-regulation quality",
  adminRole: "trained_observer",
  storageMode: "external_summary",
  governanceNote: "Store coded observation summary from trained observer only.",
};

const CARE_INDEX: AssessmentTool = {
  id: "care_index",
  name: "CARE-Index",
  fullName: "Child-Adult Relationship Experimental Index",
  domain: "Caregiver sensitivity and child cooperation",
  adminRole: "trained_observer",
  storageMode: "external_summary",
  governanceNote: "Store coded observation summary from trained observer only.",
};

const CAPI: AssessmentTool = {
  id: "capi",
  name: "CAPI",
  fullName: "Child Abuse Potential Inventory",
  domain: "Child abuse potential and parenting risk",
  adminRole: "licensed_platform",
  storageMode: "external_summary",
  governanceNote: "Requires licensed scoring process. Store external report and summary only.",
};

const PCA: AssessmentTool = {
  id: "pca",
  name: "PCA",
  fullName: "Forensic Parenting Capacity Assessment",
  domain: "Forensic parenting capacity",
  adminRole: "forensic_psychologist",
  storageMode: "external_summary",
  governanceNote: "Forensic psychologist only. Store forensic report and recommendations. Do not store scoring details.",
};

const CONTRADICTION_LOG: AssessmentTool = {
  id: "contradiction_log",
  name: "Contradiction Log",
  fullName: "Worker Contradiction and Regression Log",
  domain: "Consistency between self-report, observed behaviour, and collateral evidence",
  adminRole: "worker",
  storageMode: "app_native",
  governanceNote: "Worker records inconsistencies neutrally. Use consistent, non-blaming language. Review with supervisor.",
};

// ---------------------------------------------------------------------------
// Phase register
// ---------------------------------------------------------------------------

export const ASSESSMENT_PHASE_TOOL_REGISTER: PhaseToolEntry[] = [
  {
    phase: "pre_entry",
    phaseLabel: "Pre-entry baseline",
    phaseWeeks: "Week 0",
    tools: [PAI, MCMI_IV, AAI, ACE, TSI_2, WAIS_IV, SDM, AAPI_2, CONTRADICTION_LOG],
  },
  {
    phase: "phase_1",
    phaseLabel: "Phase 1 – Engagement and foundation",
    phaseWeeks: "Weeks 1–4",
    tools: [PSI_4, PHQ_9, GAD_7, AUDIT, DAST_10, CAPI, CONTRADICTION_LOG],
  },
  {
    phase: "phase_2",
    phaseLabel: "Phase 2 – Skill building and deep assessment",
    phaseWeeks: "Weeks 5–10",
    tools: [DPICS, EAS, CARE_INDEX, NCFAS_G, AUDIT, DAST_10, CONTRADICTION_LOG],
  },
  {
    phase: "phase_3",
    phaseLabel: "Phase 3 – Integration and generalisation",
    phaseWeeks: "Weeks 11–16",
    tools: [NCFAS_G, AUDIT, DAST_10, PHQ_9, GAD_7, CONTRADICTION_LOG],
  },
  {
    phase: "exit",
    phaseLabel: "Exit – Transition and readiness review",
    phaseWeeks: "Weeks 17–18",
    tools: [PCA, AAPI_2, SDM, CONTRADICTION_LOG],
  },
];

export function getPhaseToolEntry(phase: ProgramPhase): PhaseToolEntry | null {
  return ASSESSMENT_PHASE_TOOL_REGISTER.find((entry) => entry.phase === phase) ?? null;
}

export function getAllTools(): AssessmentTool[] {
  const seen = new Set<string>();
  const tools: AssessmentTool[] = [];
  for (const entry of ASSESSMENT_PHASE_TOOL_REGISTER) {
    for (const tool of entry.tools) {
      if (!seen.has(tool.id)) {
        seen.add(tool.id);
        tools.push(tool);
      }
    }
  }
  return tools;
}
