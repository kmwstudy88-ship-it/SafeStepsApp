export type StructuredEvidenceType =
  | "direct_observation"
  | "collateral_report"
  | "self_report_interview"
  | "objective_measure";

export type EvidenceSourceReliability =
  | "pending_review"
  | "direct_observation"
  | "provider_record"
  | "self_report"
  | "validated_measure"
  | "second_hand"
  | "disputed";

export type EvidenceReviewStatus = "draft" | "pending_review" | "reviewed" | "excluded";
export type EvidenceDisputeStatus = "not_disputed" | "disputed" | "resolved" | "superseded";
export type EvidenceReviewAvailability =
  | "linked_worker_available"
  | "no_linked_worker"
  | "unknown_case_linkage";

export type StructuredEvidenceRecord = {
  evidence_id?: string;
  case_id?: string;
  evidence_type: StructuredEvidenceType;
  purpose: string;
  collected_at: string;
  location: string;
  collector: {
    role: string;
    relationship_to_case: string;
  };
  people_present: string[];
  observable_facts: string;
  reported_information: string;
  professional_interpretation: string;
  child_context: string;
  parent_context: string;
  strengths_observed: string[];
  concerns_observed: string[];
  external_barriers: string[];
  contrary_evidence: string[];
  source_reliability: EvidenceSourceReliability;
  parent_response: string;
  child_response: string;
  consent_or_authority: {
    basis: string;
    scope: string;
    expires_at: string | null;
  };
  limitations: string[];
  attachments: string[];
  review_status: EvidenceReviewStatus;
  reviewer: string | null;
  dispute_status: EvidenceDisputeStatus;
  retention_class: "child_family_record";
  workflow: {
    direct_observation?: {
      scheduled_or_unannounced: string;
      lawful_basis: string;
      cultural_disability_language_needs: string;
      unusual_conditions: string;
      observation_guide: string;
      domains: Record<string, string>;
    };
    collateral_report?: {
      source_organisation: string;
      provider_role: string;
      directly_observed: string;
      records_supporting_information: string;
      exact_words_or_summary: string;
      information_current_until: string;
    };
    self_report_interview?: {
      collection_method: string;
      support_person_or_adjustments: string;
      parent_own_words: string;
      corrections_before_locking: string;
      insight_dimensions: Record<string, string>;
    };
    objective_measure?: {
      tool_name_version: string;
      administrator_qualifications: string;
      validated_population: string;
      raw_result: string;
      scoring_rules: string;
      limitations: string;
      confirmation_testing: string;
      review_or_expiry_date: string;
    };
  };
};

export const structuredEvidenceTypes: {
  id: StructuredEvidenceType;
  label: string;
  description: string;
}[] = [
  {
    id: "direct_observation",
    label: "Direct observation",
    description: "Parent-child contact, home visits, routines, and structured activities.",
  },
  {
    id: "collateral_report",
    label: "Collateral report",
    description: "Focused information from schools, health providers, counsellors, or services.",
  },
  {
    id: "self_report_interview",
    label: "Self-report or interview",
    description: "Structured parent interview, reflection, check-in, voice, or audio response.",
  },
  {
    id: "objective_measure",
    label: "Objective measure",
    description: "Attendance, screening, validated assessment, checklist, or clinical evaluation.",
  },
];

const observationDomains = [
  "Emotional attunement",
  "Communication",
  "Boundaries",
  "Safety",
  "Routines",
  "Connection",
  "Repair",
  "Child response",
];

const insightDimensions = [
  "Recognition of supported events",
  "Understanding of the child experience",
  "Recognition of personal responsibility",
  "Recognition of external factors",
  "Ability to identify triggers",
  "Ability to identify safer alternatives",
  "Willingness and capacity to seek help",
  "Evidence of behavioural change",
  "Ability to repair after mistakes",
  "Capacity to challenge inaccurate information constructively",
];

export function splitLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function emptyStructuredEvidenceRecord(type: StructuredEvidenceType): StructuredEvidenceRecord {
  return {
    evidence_type: type,
    purpose: "",
    collected_at: new Date().toISOString(),
    location: "",
    collector: {
      role: "",
      relationship_to_case: "",
    },
    people_present: [],
    observable_facts: "",
    reported_information: "",
    professional_interpretation: "",
    child_context: "",
    parent_context: "",
    strengths_observed: [],
    concerns_observed: [],
    external_barriers: [],
    contrary_evidence: [],
    source_reliability: "pending_review",
    parent_response: "",
    child_response: "",
    consent_or_authority: {
      basis: "",
      scope: "",
      expires_at: null,
    },
    limitations: [],
    attachments: [],
    review_status: "draft",
    reviewer: null,
    dispute_status: "not_disputed",
    retention_class: "child_family_record",
    workflow: {
      direct_observation:
        type === "direct_observation"
          ? {
              scheduled_or_unannounced: "",
              lawful_basis: "",
              cultural_disability_language_needs: "",
              unusual_conditions: "",
              observation_guide: "Age-appropriate SafeSteps observation guide",
              domains: Object.fromEntries(observationDomains.map((domain) => [domain, ""])),
            }
          : undefined,
      collateral_report:
        type === "collateral_report"
          ? {
              source_organisation: "",
              provider_role: "",
              directly_observed: "",
              records_supporting_information: "",
              exact_words_or_summary: "",
              information_current_until: "",
            }
          : undefined,
      self_report_interview:
        type === "self_report_interview"
          ? {
              collection_method: "",
              support_person_or_adjustments: "",
              parent_own_words: "",
              corrections_before_locking: "",
              insight_dimensions: Object.fromEntries(insightDimensions.map((dimension) => [dimension, ""])),
            }
          : undefined,
      objective_measure:
        type === "objective_measure"
          ? {
              tool_name_version: "",
              administrator_qualifications: "",
              validated_population: "",
              raw_result: "",
              scoring_rules: "",
              limitations: "",
              confirmation_testing: "",
              review_or_expiry_date: "",
            }
          : undefined,
    },
  };
}

export function structuredEvidenceTitle(record: StructuredEvidenceRecord) {
  const typeLabel = structuredEvidenceTypes.find((type) => type.id === record.evidence_type)?.label ?? "Evidence";
  return `${typeLabel}: ${record.purpose || "Untitled purpose"}`;
}

export function structuredEvidenceNotes(record: StructuredEvidenceRecord) {
  return [
    `Purpose: ${record.purpose}`,
    `Facts: ${record.observable_facts}`,
    record.reported_information ? `Reported information: ${record.reported_information}` : "",
    record.professional_interpretation ? `Interpretation: ${record.professional_interpretation}` : "",
    record.parent_response ? `Parent response: ${record.parent_response}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function evidenceReviewReadiness(input: {
  record: Pick<
    StructuredEvidenceRecord,
    | "observable_facts"
    | "reported_information"
    | "professional_interpretation"
    | "parent_response"
    | "contrary_evidence"
    | "limitations"
    | "source_reliability"
  >;
  reviewAvailability: EvidenceReviewAvailability;
}) {
  const warnings: string[] = [];

  if (!input.record.observable_facts.trim()) {
    warnings.push("Observable facts are missing.");
  }

  if (input.record.source_reliability === "pending_review") {
    warnings.push("Source reliability is still pending review.");
  }

  if (!input.record.parent_response.trim()) {
    warnings.push("Parent response is missing or not yet recorded.");
  }

  if (input.record.limitations.length === 0) {
    warnings.push("Limitations or context safeguards are missing.");
  }

  if (input.reviewAvailability === "no_linked_worker") {
    warnings.push("No linked case or support worker is currently attached to this family case file.");
  }

  if (input.reviewAvailability === "unknown_case_linkage") {
    warnings.push("Case/support worker linkage could not be confirmed.");
  }

  return {
    canUseForSeriousDecision:
      warnings.length === 0 && input.reviewAvailability === "linked_worker_available",
    warnings,
  };
}
