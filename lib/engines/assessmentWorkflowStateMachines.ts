export type WorkflowMachineId =
  | "assessment_template"
  | "assessment_assignment"
  | "assessment_session"
  | "response"
  | "scoring"
  | "human_review"
  | "evidence"
  | "observation"
  | "competency_calculation"
  | "contradiction"
  | "disagreement"
  | "claim"
  | "report";

export type WorkflowRole = "parent_learner" | "worker" | "supervisor" | "administrator";

export type WorkflowEventCategory = "assessment" | "evidence" | "competency" | "review" | "reporting";

export type WorkflowEventEnvelope = {
  event_id: string;
  event_type: WorkflowEventType;
  event_version: number;
  occurred_at: string;
  actor_user_id: string;
  person_id?: string;
  case_id?: string;
  entity_type: string;
  entity_id: string;
  correlation_id: string;
  causation_id?: string;
  source: string;
  metadata: Record<string, string | number | boolean>;
};

export type WorkflowStateMachine = {
  id: WorkflowMachineId;
  label: string;
  states: string[];
  terminalStates: string[];
  transitions: { from: string; to: string; requiresReason?: boolean; guard?: string }[];
  safeguards: string[];
};

export type WorkflowPermissionSet = {
  role: WorkflowRole;
  can: string[];
  cannot: string[];
};

export type EvidenceQualityReview = {
  relevance: number;
  reliability: number;
  authenticity: "unverified" | "partially_verified" | "verified";
  completeness: "incomplete" | "partial" | "complete";
  independence: "self_report" | "related_source" | "independent_source";
  recency: "current" | "recent" | "older" | "historical";
  contextQuality: "limited" | "adequate" | "detailed";
  directness: "indirect" | "partially_direct" | "direct";
  repeatability: "one_off" | "repeated" | "consistently_repeated";
};

export type EvidenceSufficiencyRule = {
  competency: string;
  targetLevel: string;
  minimumRequirements: {
    knowledgeAssessments: number;
    scenarioAssessments: number;
    practicalDemonstrations: number;
    independentObservations: number;
    contexts: number;
    minimumPeriodDays: number;
  };
};

export type EvidenceSufficiencyInput = EvidenceSufficiencyRule["minimumRequirements"];

export type ContradictionCategory =
  | "self_report_differs_from_observation"
  | "knowledge_differs_from_application"
  | "two_observers_disagree"
  | "child_and_parent_accounts_differ"
  | "recent_evidence_differs_from_historical_evidence"
  | "one_context_differs_from_another"
  | "uploaded_evidence_conflicts_with_metadata"
  | "assessment_responses_vary_substantially"
  | "evidence_may_refer_to_different_events"
  | "evidence_is_incomplete_or_ambiguous";

export type ContradictionResolutionOutcome =
  | "explained_by_context"
  | "both_accounts_plausible"
  | "one_source_more_reliable"
  | "requires_additional_evidence"
  | "data_error"
  | "unresolved"
  | "no_material_contradiction";

export type WorkflowEventType =
  | "assessment.template_created"
  | "assessment.template_submitted_for_review"
  | "assessment.template_approved"
  | "assessment.template_published"
  | "assessment.assigned"
  | "assessment.started"
  | "assessment.paused"
  | "assessment.resumed"
  | "assessment.submitted"
  | "assessment.auto_scored"
  | "assessment.review_requested"
  | "assessment.review_completed"
  | "assessment.finalised"
  | "assessment.expired"
  | "assessment.cancelled"
  | "evidence.created"
  | "evidence.upload_completed"
  | "evidence.processing_completed"
  | "evidence.review_requested"
  | "evidence.accepted"
  | "evidence.context_requested"
  | "evidence.challenged"
  | "evidence.restricted"
  | "evidence.superseded"
  | "evidence.archived"
  | "competency.evidence_added"
  | "competency.recalculation_requested"
  | "competency.profile_updated"
  | "competency.level_changed"
  | "competency.confidence_changed"
  | "competency.insufficient_evidence_detected"
  | "competency.contradiction_detected"
  | "competency.human_review_requested"
  | "competency.confirmed"
  | "review.assigned"
  | "review.started"
  | "review.completed"
  | "review.second_review_requested"
  | "review.disagreement_created"
  | "review.disagreement_resolved"
  | "review.override_recorded"
  | "report.requested"
  | "report.generated"
  | "report.quality_review_requested"
  | "report.approved"
  | "report.released"
  | "report.superseded";

export const workflowStateMachines: WorkflowStateMachine[] = [
  machine("assessment_template", "Assessment Template Lifecycle", ["draft", "internal_review", "approved", "published", "retired", "archived"], ["archived"], [
    ["draft", "internal_review"],
    ["internal_review", "draft"],
    ["internal_review", "approved"],
    ["approved", "published"],
    ["approved", "draft"],
    ["published", "retired"],
    ["retired", "published"],
    ["retired", "archived"],
  ], ["Published versions are not edited directly; editing creates a new version."]),
  machine("assessment_assignment", "Assessment Assignment Lifecycle", ["created", "assigned", "available", "started", "submitted", "under_review", "completed", "expired", "cancelled", "declined", "withdrawn"], ["completed", "expired", "cancelled", "declined", "withdrawn"], [
    ["created", "assigned"],
    ["assigned", "available"],
    ["available", "started"],
    ["started", "submitted"],
    ["submitted", "under_review"],
    ["under_review", "completed"],
    ["submitted", "completed"],
    ["created", "cancelled", true],
    ["assigned", "cancelled", true],
    ["available", "declined", true],
    ["started", "withdrawn", true],
    ["available", "expired"],
  ], ["Assignment completion requires final outcome availability."]),
  machine("assessment_session", "Assessment Session Lifecycle", ["not_started", "in_progress", "paused", "submitted", "scoring", "review_required", "finalised", "abandoned", "timed_out", "invalidated", "reopened"], ["finalised", "abandoned", "timed_out", "invalidated"], [
    ["not_started", "in_progress"],
    ["in_progress", "paused"],
    ["paused", "in_progress"],
    ["in_progress", "submitted", false, "Missing required responses prevent submission."],
    ["submitted", "scoring"],
    ["scoring", "review_required"],
    ["review_required", "finalised"],
    ["scoring", "finalised"],
    ["in_progress", "abandoned"],
    ["in_progress", "timed_out"],
    ["submitted", "invalidated", true],
    ["finalised", "reopened", true],
  ], ["Submitted responses become read-only.", "Invalidation requires a recorded reason and audit event."]),
  machine("response", "Response Lifecycle", ["empty", "draft", "answered", "submitted", "scored", "reviewed", "finalised"], ["finalised"], [
    ["empty", "draft"],
    ["draft", "answered", false, "Response must validate against item type."],
    ["answered", "submitted"],
    ["submitted", "scored"],
    ["scored", "reviewed"],
    ["reviewed", "finalised"],
    ["scored", "finalised"],
  ], ["Submitted responses cannot be edited."]),
  machine("scoring", "Automatic Scoring Workflow", ["not_scored", "auto_scored", "partially_scored", "human_review_required", "reviewed", "finalised", "scoring_error"], ["finalised", "scoring_error"], [
    ["not_scored", "auto_scored"],
    ["auto_scored", "partially_scored"],
    ["partially_scored", "human_review_required"],
    ["human_review_required", "reviewed"],
    ["reviewed", "finalised"],
    ["auto_scored", "finalised"],
    ["not_scored", "scoring_error", true],
  ], ["The scoring rule version must be stored with the result."]),
  machine("human_review", "Human Review Workflow", ["queued", "assigned_to_reviewer", "review_in_progress", "completed", "second_review_required", "moderation_required", "returned_for_information", "disputed", "superseded"], ["completed", "superseded"], [
    ["queued", "assigned_to_reviewer"],
    ["assigned_to_reviewer", "review_in_progress"],
    ["review_in_progress", "completed"],
    ["review_in_progress", "second_review_required"],
    ["review_in_progress", "moderation_required"],
    ["review_in_progress", "returned_for_information"],
    ["completed", "disputed", true],
    ["completed", "superseded", true],
  ], ["Completed reviews require reviewer, date, rubric version, score, confidence, reasons, limitations, context, and conflict declaration."]),
  machine("evidence", "Evidence Lifecycle", ["created", "processing", "available", "under_review", "accepted", "needs_context", "challenged", "restricted", "superseded", "rejected", "archived"], ["accepted", "rejected", "archived"], [
    ["created", "processing"],
    ["processing", "available"],
    ["available", "under_review"],
    ["under_review", "accepted"],
    ["under_review", "needs_context"],
    ["available", "challenged", true],
    ["available", "restricted", true],
    ["accepted", "superseded", true],
    ["under_review", "rejected", true],
    ["superseded", "archived"],
    ["rejected", "archived"],
  ], ["Rejected evidence is retained historically with a visible reason unless deletion is legally required."]),
  machine("observation", "Observation Lifecycle", ["planned", "scheduled", "in_progress", "recorded", "observer_confirmed", "reviewed", "finalised"], ["finalised"], [
    ["planned", "scheduled"],
    ["scheduled", "in_progress"],
    ["in_progress", "recorded"],
    ["recorded", "observer_confirmed"],
    ["observer_confirmed", "reviewed"],
    ["reviewed", "finalised"],
  ], ["Observable actions and interpretation must be recorded separately."]),
  machine("competency_calculation", "Competency Calculation Workflow", ["not_assessed", "insufficient_evidence", "provisional", "calculated", "human_review_required", "confirmed", "disputed", "superseded"], ["confirmed", "superseded"], [
    ["not_assessed", "insufficient_evidence"],
    ["insufficient_evidence", "provisional"],
    ["provisional", "calculated"],
    ["calculated", "human_review_required"],
    ["human_review_required", "confirmed"],
    ["calculated", "confirmed"],
    ["confirmed", "disputed", true],
    ["confirmed", "superseded", true],
  ], ["Profiles update only after eligible evidence is accepted.", "Every recalculation creates a history snapshot."]),
  machine("contradiction", "Contradiction Workflow", ["detected", "record_created", "classified", "reviewer_notified", "context_requested", "under_review", "resolved", "retained", "additional_evidence_requested"], ["resolved", "retained", "additional_evidence_requested"], [
    ["detected", "record_created"],
    ["record_created", "classified"],
    ["classified", "reviewer_notified"],
    ["reviewer_notified", "context_requested"],
    ["context_requested", "under_review"],
    ["under_review", "resolved", true],
    ["under_review", "retained", true],
    ["under_review", "additional_evidence_requested"],
  ], ["Contradictions trigger review, not automatic punishment."]),
  machine("disagreement", "Disagreement and Appeal Workflow", ["submitted", "acknowledged", "under_review", "additional_information_requested", "resolved", "partially_upheld", "upheld", "not_upheld", "escalated", "closed"], ["resolved", "closed"], [
    ["submitted", "acknowledged"],
    ["acknowledged", "under_review"],
    ["under_review", "additional_information_requested"],
    ["additional_information_requested", "under_review"],
    ["under_review", "resolved", true],
    ["resolved", "partially_upheld", true],
    ["resolved", "upheld", true],
    ["resolved", "not_upheld", true],
    ["not_upheld", "escalated", true],
    ["partially_upheld", "closed"],
    ["upheld", "closed"],
    ["not_upheld", "closed"],
  ], ["Disagreement never deletes the original evidence or interpretation."]),
  machine("claim", "Claim Lifecycle", ["proposed", "under_evaluation", "supported", "partially_supported", "challenged", "insufficient_evidence", "not_supported", "superseded", "withdrawn"], ["supported", "partially_supported", "challenged", "insufficient_evidence", "not_supported", "superseded", "withdrawn"], [
    ["proposed", "under_evaluation"],
    ["under_evaluation", "supported"],
    ["under_evaluation", "partially_supported"],
    ["under_evaluation", "challenged"],
    ["under_evaluation", "insufficient_evidence"],
    ["under_evaluation", "not_supported"],
    ["supported", "superseded", true],
    ["proposed", "withdrawn", true],
  ], ["Claims must show supporting evidence, challenging evidence, contexts, timeframe, independent sources, confidence, and reviewer status."]),
  machine("report", "Report Lifecycle", ["requested", "generating", "draft", "quality_review", "approved", "released", "generation_failed", "returned_for_correction", "superseded", "withdrawn", "archived"], ["released", "generation_failed", "withdrawn", "archived"], [
    ["requested", "generating"],
    ["generating", "draft"],
    ["generating", "generation_failed", true],
    ["draft", "quality_review"],
    ["quality_review", "approved"],
    ["quality_review", "returned_for_correction"],
    ["returned_for_correction", "draft"],
    ["approved", "released"],
    ["released", "superseded", true],
    ["superseded", "archived"],
    ["draft", "withdrawn", true],
  ], ["Report release requires supported claims, dispute visibility, confidence, dates, permissions, version, and source evidence links."]),
];

export const evidenceQualityDimensions: { key: keyof EvidenceQualityReview; scale: string }[] = [
  { key: "relevance", scale: "0-5" },
  { key: "reliability", scale: "0-5" },
  { key: "authenticity", scale: "unverified, partially verified, verified" },
  { key: "completeness", scale: "incomplete, partial, complete" },
  { key: "independence", scale: "self-report, related source, independent source" },
  { key: "recency", scale: "current, recent, older, historical" },
  { key: "contextQuality", scale: "limited, adequate, detailed" },
  { key: "directness", scale: "indirect, partially direct, direct" },
  { key: "repeatability", scale: "one-off, repeated, consistently repeated" },
];

export const emotionalRegulationProficientRule: EvidenceSufficiencyRule = {
  competency: "emotional_regulation",
  targetLevel: "proficient",
  minimumRequirements: {
    knowledgeAssessments: 1,
    scenarioAssessments: 2,
    practicalDemonstrations: 2,
    independentObservations: 1,
    contexts: 2,
    minimumPeriodDays: 28,
  },
};

export const contradictionCategories: ContradictionCategory[] = [
  "self_report_differs_from_observation",
  "knowledge_differs_from_application",
  "two_observers_disagree",
  "child_and_parent_accounts_differ",
  "recent_evidence_differs_from_historical_evidence",
  "one_context_differs_from_another",
  "uploaded_evidence_conflicts_with_metadata",
  "assessment_responses_vary_substantially",
  "evidence_may_refer_to_different_events",
  "evidence_is_incomplete_or_ambiguous",
];

export const contradictionResolutionOutcomes: ContradictionResolutionOutcome[] = [
  "explained_by_context",
  "both_accounts_plausible",
  "one_source_more_reliable",
  "requires_additional_evidence",
  "data_error",
  "unresolved",
  "no_material_contradiction",
];

export const rolePermissionSets: WorkflowPermissionSet[] = [
  {
    role: "parent_learner",
    can: ["view assigned assessments", "begin and pause assessments", "submit responses", "view eligible results", "provide context", "challenge interpretations", "upload supporting evidence", "view own audit-accessible history"],
    cannot: ["alter scoring rules", "alter submitted responses", "approve own evidence", "change competency calculations", "delete historical reviews"],
  },
  {
    role: "worker",
    can: ["assign permitted assessments", "conduct observations", "review assigned evidence", "request clarification", "add contextual notes", "draft findings", "view authorised competency profiles"],
    cannot: ["silently overwrite parent evidence", "remove disagreements", "edit published assessment content", "access information outside assigned permissions"],
  },
  {
    role: "supervisor",
    can: ["moderate reviews", "resolve disagreements", "approve high-impact conclusions", "record overrides", "request reassessment", "review worker consistency"],
    cannot: ["remove original evidence history", "approve without rationale where rationale is required"],
  },
  {
    role: "administrator",
    can: ["manage templates", "publish assessment versions", "manage system configuration", "manage permissions", "inspect technical audit records"],
    cannot: ["make professional competency conclusions unless separately assigned an appropriate reviewer role"],
  },
];

export const workflowEventCatalogue: { category: WorkflowEventCategory; events: WorkflowEventType[] }[] = [
  {
    category: "assessment",
    events: ["assessment.template_created", "assessment.template_submitted_for_review", "assessment.template_approved", "assessment.template_published", "assessment.assigned", "assessment.started", "assessment.paused", "assessment.resumed", "assessment.submitted", "assessment.auto_scored", "assessment.review_requested", "assessment.review_completed", "assessment.finalised", "assessment.expired", "assessment.cancelled"],
  },
  {
    category: "evidence",
    events: ["evidence.created", "evidence.upload_completed", "evidence.processing_completed", "evidence.review_requested", "evidence.accepted", "evidence.context_requested", "evidence.challenged", "evidence.restricted", "evidence.superseded", "evidence.archived"],
  },
  {
    category: "competency",
    events: ["competency.evidence_added", "competency.recalculation_requested", "competency.profile_updated", "competency.level_changed", "competency.confidence_changed", "competency.insufficient_evidence_detected", "competency.contradiction_detected", "competency.human_review_requested", "competency.confirmed"],
  },
  {
    category: "review",
    events: ["review.assigned", "review.started", "review.completed", "review.second_review_requested", "review.disagreement_created", "review.disagreement_resolved", "review.override_recorded"],
  },
  {
    category: "reporting",
    events: ["report.requested", "report.generated", "report.quality_review_requested", "report.approved", "report.released", "report.superseded"],
  },
];

export const automaticAssessmentSubmittedWorkflow = [
  "Validate required responses.",
  "Lock submitted answers.",
  "Publish assessment.submitted.",
  "Start automatic scoring.",
  "Create provisional result.",
  "Identify responses needing human review.",
  "Create provisional evidence records.",
  "Change session to review_required or finalised.",
  "Notify the assigned reviewer where necessary.",
  "After finalisation, publish assessment.finalised.",
  "Activate accepted evidence.",
  "Recalculate linked competencies.",
  "Check for contradictions.",
  "Update dashboards.",
  "Record all actions in the audit log.",
] as const;

export const databaseWorkflowConstraints = [
  "A submitted response cannot be edited.",
  "A finalised session must have a submitted timestamp.",
  "A completed review must identify a reviewer.",
  "An accepted evidence item must have a completed review when review is required.",
  "A competency history record cannot be deleted.",
  "A published assessment must have a version number.",
  "A retired template cannot create new assignments.",
  "A disputed conclusion cannot be silently removed.",
  "An override must contain a reason.",
  "A superseded record must identify its replacement.",
] as const;

export const recommendedNextMigrationScope = [
  "assessment enums",
  "workflow tables",
  "assessment templates and versions",
  "sessions and responses",
  "scoring and rubric tables",
  "evidence and competency tables",
  "review and disagreement records",
  "event outbox",
  "audit records",
  "indexes",
  "database constraints",
  "row-level security foundations",
] as const;

export function canTransition({
  machineId,
  from,
  to,
  reason,
}: {
  machineId: WorkflowMachineId;
  from: string;
  to: string;
  reason?: string;
}) {
  const machineConfig = workflowStateMachines.find((item) => item.id === machineId);
  const transition = machineConfig?.transitions.find((item) => item.from === from && item.to === to);

  if (!machineConfig || !transition) {
    return { allowed: false, reason: "Transition is not permitted by this state machine." };
  }

  if (transition.requiresReason && !reason?.trim()) {
    return { allowed: false, reason: "This transition requires a recorded reason and audit event." };
  }

  return { allowed: true, reason: transition.guard ?? "Transition permitted." };
}

export function evaluateEvidenceSufficiency({
  rule,
  actual,
}: {
  rule: EvidenceSufficiencyRule;
  actual: EvidenceSufficiencyInput;
}) {
  const missing = Object.entries(rule.minimumRequirements)
    .filter(([key, required]) => actual[key as keyof EvidenceSufficiencyInput] < required)
    .map(([key, required]) => ({
      requirement: key,
      required,
      actual: actual[key as keyof EvidenceSufficiencyInput],
    }));

  return {
    sufficient: missing.length === 0,
    status: missing.length === 0 ? rule.targetLevel : "developing",
    reason:
      missing.length === 0
        ? "Minimum evidence requirements are met."
        : "Knowledge and scenario evidence may be sufficient, but practical, contextual, repeated, or independent evidence remains incomplete.",
    missing,
  };
}

export function createWorkflowEventEnvelope(input: Omit<WorkflowEventEnvelope, "event_version" | "source"> & {
  event_version?: number;
  source?: string;
}): WorkflowEventEnvelope {
  return {
    ...input,
    event_version: input.event_version ?? 1,
    source: input.source ?? "safesteps_assessment_service",
  };
}

export function roleCan(role: WorkflowRole, action: string) {
  const permissions = rolePermissionSets.find((item) => item.role === role);
  const normalized = action.toLowerCase();
  return Boolean(permissions?.can.some((item) => item.toLowerCase() === normalized));
}

export function validateReportRelease({
  requiredEvidenceAvailable,
  unsupportedClaimsExcluded,
  disputedEvidenceIdentified,
  confidenceDisplayed,
  datesClear,
  missingEvidenceNotPresentedAsFailure,
  reviewerOverridesHaveReasons,
  childPermissionsApplied,
  reportVersionRecorded,
  summariesLinkToEvidence,
}: {
  requiredEvidenceAvailable: boolean;
  unsupportedClaimsExcluded: boolean;
  disputedEvidenceIdentified: boolean;
  confidenceDisplayed: boolean;
  datesClear: boolean;
  missingEvidenceNotPresentedAsFailure: boolean;
  reviewerOverridesHaveReasons: boolean;
  childPermissionsApplied: boolean;
  reportVersionRecorded: boolean;
  summariesLinkToEvidence: boolean;
}) {
  const failures: string[] = [];
  if (!requiredEvidenceAvailable) failures.push("required evidence is unavailable");
  if (!unsupportedClaimsExcluded) failures.push("unsupported claims are included");
  if (!disputedEvidenceIdentified) failures.push("disputed evidence is not identified");
  if (!confidenceDisplayed) failures.push("confidence is not displayed");
  if (!datesClear) failures.push("dates and timeframes are unclear");
  if (!missingEvidenceNotPresentedAsFailure) failures.push("missing evidence is presented as failure");
  if (!reviewerOverridesHaveReasons) failures.push("reviewer override reasons are missing");
  if (!childPermissionsApplied) failures.push("sensitive child information permissions are not applied");
  if (!reportVersionRecorded) failures.push("report version is not recorded");
  if (!summariesLinkToEvidence) failures.push("generated summaries do not link back to source evidence");

  return { releasable: failures.length === 0, failures };
}

function machine(
  id: WorkflowMachineId,
  label: string,
  states: string[],
  terminalStates: string[],
  transitionTuples: [string, string, boolean?, string?][],
  safeguards: string[],
): WorkflowStateMachine {
  return {
    id,
    label,
    states,
    terminalStates,
    transitions: transitionTuples.map(([from, to, requiresReason, guard]) => ({ from, to, requiresReason, guard })),
    safeguards,
  };
}
