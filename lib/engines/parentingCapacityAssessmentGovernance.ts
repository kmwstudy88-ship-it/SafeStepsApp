export type ParentingCapacityMethodCategory =
  | "parent_child_interaction"
  | "parenting_stress_and_attitudes"
  | "home_environment"
  | "alcohol_and_other_drugs"
  | "family_violence"
  | "adult_mental_health"
  | "child_development_and_wellbeing";

export type ParentingCapacityMethod = {
  id: string;
  label: string;
  category: ParentingCapacityMethodCategory;
  evidenceRole: string;
  restricted: boolean;
  safeStepsBoundary: string;
};

export const parentingCapacityMethodRegistry: ParentingCapacityMethod[] = [
  { id: "mim", label: "Marschak Interaction Method (MIM)", category: "parent_child_interaction", evidenceRole: "Structured observation of caregiver-child interaction", restricted: true, safeStepsBoundary: "Store authorised report metadata and summaries only." },
  { id: "psi_4", label: "Parenting Stress Index, Fourth Edition (PSI-4)", category: "parenting_stress_and_attitudes", evidenceRole: "Parenting stress information considered with other evidence", restricted: true, safeStepsBoundary: "Do not reproduce items, scoring rules, or interpretations." },
  { id: "aapi_2_1", label: "Adult-Adolescent Parenting Inventory (AAPI-2.1)", category: "parenting_stress_and_attitudes", evidenceRole: "Parenting attitude information considered with other evidence", restricted: true, safeStepsBoundary: "Use only under applicable licence and administration requirements." },
  { id: "home", label: "HOME Inventory", category: "home_environment", evidenceRole: "Structured information about the child's home environment", restricted: true, safeStepsBoundary: "Record an authorised summary; do not treat a score as proof of capacity." },
  { id: "audit", label: "Alcohol Use Disorders Identification Test (AUDIT)", category: "alcohol_and_other_drugs", evidenceRole: "Alcohol screening information, not a parenting-capacity determination", restricted: false, safeStepsBoundary: "Confirm current authorised version and qualified interpretation." },
  { id: "dudit", label: "Drug Use Disorders Identification Test (DUDIT)", category: "alcohol_and_other_drugs", evidenceRole: "Drug-use screening information, not a diagnosis", restricted: false, safeStepsBoundary: "Confirm permissions and local clinical governance before use." },
  { id: "sassi_4", label: "SASSI-4", category: "alcohol_and_other_drugs", evidenceRole: "Specialist substance-use assessment information", restricted: true, safeStepsBoundary: "External qualified administration and authorised summary only." },
  { id: "family_violence_framework", label: "Applicable family-violence risk framework", category: "family_violence", evidenceRole: "Jurisdiction-specific structured risk identification and management", restricted: false, safeStepsBoundary: "Select the framework required by the relevant state, territory, service, and role; MARAM is Victorian." },
  { id: "sara", label: "Spousal Assault Risk Assessment (SARA)", category: "family_violence", evidenceRole: "Specialist structured professional judgement", restricted: true, safeStepsBoundary: "Qualified specialist use only; never automate a risk conclusion." },
  { id: "odara", label: "Ontario Domestic Assault Risk Assessment (ODARA)", category: "family_violence", evidenceRole: "Actuarial family-violence risk information where locally approved", restricted: true, safeStepsBoundary: "Do not assume Australian jurisdictional acceptance; require governance approval." },
  { id: "mmpi_3_pai", label: "MMPI-3 or PAI", category: "adult_mental_health", evidenceRole: "Qualified psychological formulation, not proof of parenting capacity", restricted: true, safeStepsBoundary: "External psychologist report metadata and authorised summary only." },
  { id: "dass_21", label: "DASS-21", category: "adult_mental_health", evidenceRole: "Current distress screening information, not diagnosis", restricted: false, safeStepsBoundary: "Do not infer parenting ability from distress scores alone." },
  { id: "cbcl_asq_tscc", label: "CBCL, ASQ-3, or TSCC", category: "child_development_and_wellbeing", evidenceRole: "Child-specific developmental, behavioural, or trauma information", restricted: true, safeStepsBoundary: "Use age-appropriate authorised tools through qualified professionals." },
];

export type ParentingCapacityReadinessInput = {
  qualifiedAssessorConfirmed: boolean;
  childSpecificNeedsDocumented: boolean;
  evidenceSourceCount: number;
  includesDirectObservation: boolean;
  includesCollateralInformation: boolean;
  includesDemonstratedBehaviourChange: boolean;
  includesSustainabilityEvidence: boolean;
  includesProtectiveCapacity: boolean;
  reliesOnlyOnDiagnosisOrTestScore: boolean;
  restrictedToolRequirementsConfirmed: boolean;
  familyViolenceRelevant: boolean;
  jurisdictionFrameworkConfirmed: boolean;
  attemptsLegalOrCapacityConclusion: boolean;
};

export type ParentingCapacityReadinessResult = {
  decision: "not_ready" | "ready_for_qualified_review";
  blockers: string[];
  notice: string;
};

export function evaluateParentingCapacityReportReadiness(
  input: ParentingCapacityReadinessInput,
): ParentingCapacityReadinessResult {
  const blockers: string[] = [];
  if (!input.qualifiedAssessorConfirmed) blockers.push("A suitably qualified assessor has not been confirmed.");
  if (!input.childSpecificNeedsDocumented) blockers.push("The child's individual needs and circumstances are not documented.");
  if (input.evidenceSourceCount < 2) blockers.push("A multi-source evidence base is required.");
  if (!input.includesDirectObservation) blockers.push("Direct observation evidence is missing.");
  if (!input.includesCollateralInformation) blockers.push("Authorised collateral information is missing.");
  if (!input.includesDemonstratedBehaviourChange) blockers.push("Demonstrated behaviour change is not documented.");
  if (!input.includesSustainabilityEvidence) blockers.push("Sustainability of change over time is not documented.");
  if (!input.includesProtectiveCapacity) blockers.push("Protective capacity has not been addressed.");
  if (input.reliesOnlyOnDiagnosisOrTestScore) blockers.push("A diagnosis or test score cannot establish parenting capacity by itself.");
  if (!input.restrictedToolRequirementsConfirmed) blockers.push("Licensing, training, and administration requirements are not confirmed.");
  if (input.familyViolenceRelevant && !input.jurisdictionFrameworkConfirmed) blockers.push("The applicable jurisdictional family-violence framework is not confirmed.");
  if (input.attemptsLegalOrCapacityConclusion) blockers.push("SafeSteps cannot make legal findings or fit/unfit parenting-capacity determinations.");

  return {
    decision: blockers.length === 0 ? "ready_for_qualified_review" : "not_ready",
    blockers,
    notice: "This readiness check organises information for qualified human review. It is not a clinical, forensic, child-protection, or legal determination.",
  };
}
