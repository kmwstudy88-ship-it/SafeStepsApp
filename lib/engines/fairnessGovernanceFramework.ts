export type FairnessDomainId =
  | "procedural_fairness"
  | "evidentiary_fairness"
  | "cultural_fairness"
  | "disability_fairness"
  | "socioeconomic_fairness"
  | "assessor_fairness"
  | "algorithmic_fairness"
  | "outcome_fairness";

export type ReviewerAuthorityLevel = 1 | 2 | 3 | 4 | "specialist";

export type AiOutputStatus = "draft" | "unverified" | "reviewed" | "accepted" | "modified" | "rejected" | "superseded";

export type StatementClassification =
  | "direct_observation"
  | "reported_information"
  | "documented_fact"
  | "professional_interpretation"
  | "system_generated_finding"
  | "unverified_allegation"
  | "historical_information"
  | "current_evidence"
  | "recommendation"
  | "legal_requirement";

export type FairnessMetricRun = {
  metricCode: string;
  sampleSize: number;
  metricValue?: number;
  referenceValue?: number;
  minimumPublicSampleSize: number;
  minimumCalculationSampleSize: number;
};

export type AssessorCredential = {
  assessorUserId: string;
  reviewerLevel?: ReviewerAuthorityLevel;
  specialistAreas: string[];
  verificationStatus: "unverified" | "verified" | "expired" | "restricted";
};

export type ReviewAssignmentRequirement = {
  requiredLevel: ReviewerAuthorityLevel;
  specialistArea?: string;
  highImpact: boolean;
};

export type ProceduralFairnessCheck = {
  noticeProvided: boolean;
  evidenceAccessProvided: boolean;
  responseOpportunityProvided: boolean;
  responseConsidered: boolean;
  accessibilityChecked: boolean;
  culturalContextChecked: boolean;
  conflictChecked: boolean;
  qualificationChecked: boolean;
  supportingEvidenceReviewed: boolean;
  challengingEvidenceReviewed: boolean;
  alternativesConsidered: boolean;
  reasonsRecorded: boolean;
  appealInformationProvided: boolean;
};

export const fairnessWorkflow = [
  "Evidence Collection",
  "Context Verification",
  "Accessibility Review",
  "Cultural Review",
  "Bias Screening",
  "Structured Assessment",
  "Assessor Review",
  "Moderation",
  "Decision",
  "Appeal and Reassessment",
] as const;

export const fairnessDomains: { id: FairnessDomainId; question: string }[] = [
  { id: "procedural_fairness", question: "Was the person given a fair process?" },
  { id: "evidentiary_fairness", question: "Was all relevant evidence considered?" },
  { id: "cultural_fairness", question: "Were cultural norms interpreted appropriately?" },
  { id: "disability_fairness", question: "Were reasonable adjustments available?" },
  { id: "socioeconomic_fairness", question: "Was poverty distinguished from unwillingness or neglect?" },
  { id: "assessor_fairness", question: "Was the reviewer qualified, consistent and impartial?" },
  { id: "algorithmic_fairness", question: "Did automated tools influence groups differently?" },
  { id: "outcome_fairness", question: "Are similar cases receiving materially different outcomes?" },
];

export const contextQuestions = [
  "What happened?",
  "When did it happen?",
  "Where did it happen?",
  "Who was present?",
  "What occurred immediately before?",
  "What resources were available?",
  "What barriers were present?",
  "Was the behaviour typical or unusual?",
  "Was the person informed of expectations?",
  "Was assistance offered?",
  "Was the child in immediate danger?",
  "What alternative explanations exist?",
] as const;

export const adjustmentCategories = [
  "simplified language",
  "text-to-speech",
  "speech-to-text",
  "captioning",
  "sign-language support",
  "interpreter support",
  "extended time",
  "scheduled breaks",
  "alternative input method",
  "video or practical response",
  "support person",
  "visual instructions",
  "offline access",
  "flexible scheduling",
] as const;

export const biasCategories = [
  "confirmation bias",
  "anchoring",
  "recency bias",
  "negativity bias",
  "halo effect",
  "horn effect",
  "cultural bias",
  "class bias",
  "disability bias",
  "gender bias",
  "racial or ethnic bias",
  "language bias",
  "automation bias",
  "outcome bias",
] as const;

export const highRiskLanguage = [
  "manipulative",
  "lazy",
  "does not care",
  "uncooperative",
  "aggressive personality",
  "bad attitude",
  "attention seeking",
  "non-compliant",
  "unmotivated",
  "lacks insight",
  "hostile",
  "unstable",
] as const;

export const prohibitedAiFinalisations = [
  "child safety conclusions",
  "abuse findings",
  "credibility findings",
  "parental capacity findings",
  "reunification readiness",
  "removal recommendations",
  "contact restriction",
  "legal conclusions",
  "diagnosis",
  "emergency intervention decisions",
] as const;

export const appealLevels = [
  { level: 1, name: "Informal clarification" },
  { level: 2, name: "Independent review" },
  { level: 3, name: "Formal moderation panel" },
  { level: 4, name: "External review pathway" },
] as const;

export const coreFairnessRules = [
  "Difference is not deficiency.",
  "Poverty is not automatically neglect.",
  "Disability-related barriers require adjustment, not punishment.",
  "Missing evidence is not evidence of failure.",
  "Context must be considered before interpretation.",
  "Direct observation must remain separate from opinion.",
  "AI assistance must remain identifiable and reviewable.",
  "Automated outputs cannot independently finalise high-impact conclusions.",
  "Fairness safeguards must not prevent proportionate safety action.",
] as const;

export function detectHighRiskLanguage(statement: string) {
  const lower = statement.toLowerCase();
  return highRiskLanguage.filter((phrase) => lower.includes(phrase));
}

export function canAssignReviewer({
  credential,
  requirement,
}: {
  credential: AssessorCredential;
  requirement: ReviewAssignmentRequirement;
}) {
  if (credential.verificationStatus !== "verified") {
    return { allowed: false, reason: "Reviewer credential is not verified." };
  }

  if (requirement.requiredLevel === "specialist") {
    const hasSpecialistArea = Boolean(
      requirement.specialistArea && credential.specialistAreas.includes(requirement.specialistArea),
    );
    return hasSpecialistArea
      ? { allowed: true, reason: "Reviewer has the required specialist credential." }
      : { allowed: false, reason: "A verified specialist credential is required." };
  }

  if (credential.reviewerLevel === "specialist") {
    return { allowed: true, reason: "Specialist reviewer can complete this review." };
  }

  const reviewerLevel = credential.reviewerLevel ?? 0;
  if (reviewerLevel >= requirement.requiredLevel) {
    return { allowed: true, reason: "Reviewer authority level meets the requirement." };
  }

  return { allowed: false, reason: "Reviewer authority level is too low for this review." };
}

export function evaluateProceduralFairness(check: ProceduralFairnessCheck) {
  const missing = Object.entries(check)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    complete: missing.length === 0,
    missing,
    releaseBlocked: missing.length > 0,
  };
}

export function assessSmallSampleProtection(metric: FairnessMetricRun) {
  if (metric.sampleSize < metric.minimumCalculationSampleSize) {
    return { publishable: false, calculable: false, reason: "Sample is too small to calculate a comparative outcome metric." };
  }
  if (metric.sampleSize < metric.minimumPublicSampleSize) {
    return { publishable: false, calculable: true, reason: "Internal review only due to small-sample privacy and instability risk." };
  }
  return { publishable: true, calculable: true, reason: "Metric can be calculated and published where authorised." };
}

export function canAiFinaliseOutcome(outcome: string) {
  return !prohibitedAiFinalisations.some((item) => outcome.toLowerCase().includes(item));
}
