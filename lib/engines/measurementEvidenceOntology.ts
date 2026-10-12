export type SmeoObjectType =
  | "person"
  | "competency"
  | "capability"
  | "behaviour"
  | "evidence"
  | "observation"
  | "finding"
  | "claim"
  | "conclusion"
  | "recommendation"
  | "review";

export type SmeoRole = "parent" | "child" | "worker" | "clinician" | "reviewer";
export type SmeoEvidenceDirection = "supporting" | "challenging" | "mixed" | "missing";
export type SmeoConfidenceBand = "very_low" | "low" | "moderate" | "high" | "very_high";
export type SmeoEvidenceSufficiency = "no_evidence" | "some_evidence" | "sufficient_evidence";
export type SmeoContext =
  | "home"
  | "school"
  | "visit"
  | "community"
  | "stress"
  | "conflict"
  | "court_process"
  | "online"
  | "family_gathering"
  | "structured_activity"
  | "unstructured_routine";

export type SmeoMetadata = {
  id: string;
  objectType: SmeoObjectType;
  createdAt: string;
  updatedAt?: string;
  source: string;
  reviewerId?: string;
  confidence?: number;
  context?: SmeoContext;
  linkedCompetencyIds?: string[];
  auditHistory?: SmeoAuditEvent[];
};

export type SmeoAuditEvent = {
  id: string;
  at: string;
  actorId: string;
  action: string;
  rationale: string;
};

export type SmeoPerson = SmeoMetadata & {
  objectType: "person";
  role: SmeoRole;
  program: string;
  programStage: string;
  assessmentHistoryIds: string[];
  consentSettings: string[];
  accessibilityNeeds: string[];
  culturalPreferences: string[];
  languagePreferences: string[];
};

export type SmeoCompetency = SmeoMetadata & {
  objectType: "competency";
  label: string;
  description: string;
};

export type SmeoCapability = SmeoMetadata & {
  objectType: "capability";
  competencyId: string;
  label: string;
  description: string;
};

export type SmeoBehaviour = SmeoMetadata & {
  objectType: "behaviour";
  capabilityId: string;
  label: string;
  observableAction: string;
};

export type SmeoEvidence = SmeoMetadata & {
  objectType: "evidence";
  evidenceType:
    | "quiz_response"
    | "scenario_result"
    | "reflection"
    | "worker_note"
    | "photo"
    | "video"
    | "daily_log"
    | "home_activity"
    | "child_feedback"
    | "teacher_feedback"
    | "portfolio_item";
  personId: string;
  behaviourIds: string[];
  direction: SmeoEvidenceDirection;
  reliability: number;
  independence: number;
  verifiability: number;
};

export type SmeoObservation = SmeoMetadata & {
  objectType: "observation";
  evidenceIds: string[];
  behaviourIds: string[];
  description: string;
};

export type SmeoFinding = SmeoMetadata & {
  objectType: "finding";
  observationIds: string[];
  description: string;
};

export type SmeoClaimThreshold = {
  minimumSupportingEvidence: number;
  minimumIndependentSources: number;
  requiredEvidenceTypes: SmeoEvidence["evidenceType"][];
};

export type SmeoClaim = SmeoMetadata & {
  objectType: "claim";
  competencyId: string;
  findingIds: string[];
  statement: string;
  threshold: SmeoClaimThreshold;
};

export type SmeoConclusion = SmeoMetadata & {
  objectType: "conclusion";
  claimIds: string[];
  statement: string;
  confidenceBand: SmeoConfidenceBand;
  evidenceDiversity: number;
  timeframe: string;
  remainingGaps: string[];
  alternativeExplanations: string[];
  assumptions: string[];
};

export type SmeoRecommendation = SmeoMetadata & {
  objectType: "recommendation";
  conclusionIds: string[];
  statement: string;
  requestedEvidence: string[];
};

export type SmeoReview = SmeoMetadata & {
  objectType: "review";
  reviewerId: string;
  evidenceConsideredIds: string[];
  areasOfAgreement: string[];
  areasOfUncertainty: string[];
  requestedAdditionalEvidence: string[];
  decisionRationale: string;
  overrideDecision?: {
    applied: boolean;
    reason: string;
  };
};

export type SmeoOntologyRecord =
  | SmeoPerson
  | SmeoCompetency
  | SmeoCapability
  | SmeoBehaviour
  | SmeoEvidence
  | SmeoObservation
  | SmeoFinding
  | SmeoClaim
  | SmeoConclusion
  | SmeoRecommendation
  | SmeoReview;

export type SmeoClaimEvaluation = {
  claimId: string;
  sufficiency: SmeoEvidenceSufficiency;
  confidenceBand: SmeoConfidenceBand;
  supportingEvidenceIds: string[];
  challengingEvidenceIds: string[];
  missingEvidenceTypes: SmeoEvidence["evidenceType"][];
  evidenceDiversity: number;
  independentSources: number;
  explanation: string;
};

const objectOrder: SmeoObjectType[] = [
  "person",
  "competency",
  "capability",
  "behaviour",
  "evidence",
  "observation",
  "finding",
  "claim",
  "conclusion",
  "recommendation",
  "review",
];

export function buildOntologyChain(records: SmeoOntologyRecord[]) {
  const grouped = objectOrder.reduce((groups, objectType) => {
    groups[objectType] = records.filter((record) => record.objectType === objectType);
    return groups;
  }, {} as Record<SmeoObjectType, SmeoOntologyRecord[]>);

  return { order: objectOrder, grouped };
}

export function traceConclusionLineage({
  conclusionId,
  records,
}: {
  conclusionId: string;
  records: SmeoOntologyRecord[];
}) {
  const conclusions = records.filter(
    (record): record is SmeoConclusion => record.objectType === "conclusion" && record.id === conclusionId,
  );
  const claims = records.filter(
    (record): record is SmeoClaim =>
      record.objectType === "claim" && conclusions.some((conclusion) => conclusion.claimIds.includes(record.id)),
  );
  const findings = records.filter(
    (record): record is SmeoFinding =>
      record.objectType === "finding" && claims.some((claim) => claim.findingIds.includes(record.id)),
  );
  const observations = records.filter(
    (record): record is SmeoObservation =>
      record.objectType === "observation" && findings.some((finding) => finding.observationIds.includes(record.id)),
  );
  const evidence = records.filter(
    (record): record is SmeoEvidence =>
      record.objectType === "evidence" && observations.some((observation) => observation.evidenceIds.includes(record.id)),
  );

  return { conclusions, claims, findings, observations, evidence };
}

export function evaluateClaim({
  claim,
  evidence,
}: {
  claim: SmeoClaim;
  evidence: SmeoEvidence[];
}): SmeoClaimEvaluation {
  const relevantEvidence = evidence.filter((item) =>
    item.linkedCompetencyIds?.includes(claim.competencyId),
  );
  const supportingEvidence = relevantEvidence.filter((item) => item.direction === "supporting");
  const challengingEvidence = relevantEvidence.filter((item) => item.direction === "challenging" || item.direction === "mixed");
  const evidenceTypes = new Set(supportingEvidence.map((item) => item.evidenceType));
  const independentSources = new Set(supportingEvidence.map((item) => item.source)).size;
  const missingEvidenceTypes = claim.threshold.requiredEvidenceTypes.filter((type) => !evidenceTypes.has(type));
  const reliabilityAverage =
    supportingEvidence.length === 0
      ? 0
      : supportingEvidence.reduce((total, item) => total + item.reliability, 0) / supportingEvidence.length;

  const hasMinimumEvidence = supportingEvidence.length >= claim.threshold.minimumSupportingEvidence;
  const hasMinimumIndependence = independentSources >= claim.threshold.minimumIndependentSources;
  const hasRequiredTypes = missingEvidenceTypes.length === 0;
  const sufficiency: SmeoEvidenceSufficiency =
    supportingEvidence.length === 0
      ? "no_evidence"
      : hasMinimumEvidence && hasMinimumIndependence && hasRequiredTypes
        ? "sufficient_evidence"
        : "some_evidence";

  const confidenceBand = classifyConfidenceBand({
    sufficiency,
    reliabilityAverage,
    evidenceDiversity: evidenceTypes.size,
    hasContradiction: challengingEvidence.length > 0,
  });

  return {
    claimId: claim.id,
    sufficiency,
    confidenceBand,
    supportingEvidenceIds: supportingEvidence.map((item) => item.id),
    challengingEvidenceIds: challengingEvidence.map((item) => item.id),
    missingEvidenceTypes,
    evidenceDiversity: evidenceTypes.size,
    independentSources,
    explanation:
      sufficiency === "sufficient_evidence"
        ? "The claim has enough supporting, diverse, and independent evidence for review."
        : "There is currently insufficient evidence to determine this claim without additional review.",
  };
}

export function classifyConfidenceBand({
  sufficiency,
  reliabilityAverage,
  evidenceDiversity,
  hasContradiction,
}: {
  sufficiency: SmeoEvidenceSufficiency;
  reliabilityAverage: number;
  evidenceDiversity: number;
  hasContradiction: boolean;
}): SmeoConfidenceBand {
  if (sufficiency === "no_evidence") return "very_low";
  if (sufficiency === "some_evidence") return hasContradiction ? "low" : "moderate";
  if (hasContradiction) return "moderate";
  if (reliabilityAverage >= 85 && evidenceDiversity >= 5) return "very_high";
  if (reliabilityAverage >= 70 && evidenceDiversity >= 3) return "high";
  return "moderate";
}

export const smeoObjectModel: { objectType: SmeoObjectType; purpose: string }[] = [
  { objectType: "person", purpose: "Defines the subject, role, program stage, preferences, consent, and access needs." },
  { objectType: "competency", purpose: "Stores stable skill concepts used across lessons, assessments, reports, AI, and review." },
  { objectType: "capability", purpose: "Breaks a competency into specific abilities that can be taught and assessed." },
  { objectType: "behaviour", purpose: "Defines observable actions that demonstrate a capability." },
  { objectType: "evidence", purpose: "Stores material that may support, challenge, or leave a behaviour unresolved." },
  { objectType: "observation", purpose: "Records what was seen or reported without making a conclusion." },
  { objectType: "finding", purpose: "Summarises patterns across one or more observations while staying descriptive." },
  { objectType: "claim", purpose: "Connects findings to a narrow, testable competency statement." },
  { objectType: "conclusion", purpose: "Combines claims with confidence, diversity, timeframe, gaps, alternatives, and assumptions." },
  { objectType: "recommendation", purpose: "Identifies forward-looking next evidence or practice steps." },
  { objectType: "review", purpose: "Records human interpretation, uncertainty, rationale, additional evidence requests, and overrides." },
];
