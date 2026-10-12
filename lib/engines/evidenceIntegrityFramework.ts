export type IntegrityWorkflowStep =
  | "evidence_capture"
  | "source_registration"
  | "consent_verification"
  | "file_hashing"
  | "metadata_extraction"
  | "security_screening"
  | "authenticity_review"
  | "immutable_storage"
  | "controlled_access"
  | "version_correction_history"
  | "court_ready_export";

export type CaptureMethod =
  | "in_app_camera"
  | "in_app_audio"
  | "in_app_video"
  | "file_upload"
  | "document_scan"
  | "email_import"
  | "worker_observation"
  | "system_generated"
  | "external_api"
  | "manual_data_entry"
  | "bulk_import"
  | "third_party_submission"
  | "device_sensor"
  | "secure_link_submission";

export type FileObjectRole = "original" | "derivative" | "thumbnail" | "transcript" | "redacted_copy" | "export_copy";
export type IntegrityCheckResult = "match" | "mismatch" | "unable_to_verify" | "error";
export type SecurityScanStatus = "pending" | "safe" | "safe_with_warnings" | "quarantined" | "blocked" | "scan_failed";
export type AuthenticityStatus =
  | "unverified"
  | "source_declared"
  | "technically_consistent"
  | "source_verified"
  | "content_corroborated"
  | "authenticity_challenged"
  | "unable_to_determine";

export type EvidenceFileObject = {
  id: string;
  evidenceItemId: string;
  objectRole: FileObjectRole;
  storageBucket: string;
  storagePath: string;
  originalFilename: string;
  detectedMimeType?: string;
  sizeBytes: number;
  sha256Hash: string;
  immutable: boolean;
};

export type FileMutationAttempt = Partial<Pick<EvidenceFileObject, "storagePath" | "sha256Hash" | "sizeBytes" | "detectedMimeType">>;

export type IntegrityStatusSummary = {
  fileIntegrity: string;
  sourceIdentity: string;
  captureProvenance: string;
  metadataConsistency: string;
  contentAuthenticity: string;
  reviewStatus: string;
  competencyRelevance: string;
};

export type EvidenceExportAccessCheck = {
  requesterAuthorised: boolean;
  purposePermitted: boolean;
  childOnlyEvidenceChecked: boolean;
  safetyRestrictionsChecked: boolean;
  redactionAppliedWhereRequired: boolean;
  legalHoldsResolved: boolean;
  privilegedMaterialChecked: boolean;
  thirdPartyInformationChecked: boolean;
  consentOrAuthorityConfirmed: boolean;
  approvalAuthorityReviewed: boolean;
};

export const integrityWorkflow: IntegrityWorkflowStep[] = [
  "evidence_capture",
  "source_registration",
  "consent_verification",
  "file_hashing",
  "metadata_extraction",
  "security_screening",
  "authenticity_review",
  "immutable_storage",
  "controlled_access",
  "version_correction_history",
  "court_ready_export",
];

export const integrityPrinciples = [
  "Original files are immutable.",
  "Edited files are stored as new derivatives.",
  "Every file receives a cryptographic hash.",
  "Every material action creates an audit event.",
  "Metadata is preserved separately from user-supplied descriptions.",
  "Corrections do not erase earlier versions.",
  "AI processing never replaces the original evidence.",
  "Duplicate files do not count as independent evidence.",
  "Authenticity status remains separate from evidentiary meaning.",
  "Hash verification proves file integrity, not factual truth.",
] as const;

export const captureMethods: CaptureMethod[] = [
  "in_app_camera",
  "in_app_audio",
  "in_app_video",
  "file_upload",
  "document_scan",
  "email_import",
  "worker_observation",
  "system_generated",
  "external_api",
  "manual_data_entry",
  "bulk_import",
  "third_party_submission",
  "device_sensor",
  "secure_link_submission",
];

export const authenticityDimensions = [
  "file integrity",
  "source identity",
  "capture provenance",
  "metadata consistency",
  "content continuity",
  "external corroboration",
  "editing history",
  "chain of custody",
] as const;

export const storageBuckets = [
  "evidence-quarantine",
  "evidence-originals",
  "evidence-derivatives",
  "evidence-redacted",
  "evidence-transcripts",
  "evidence-exports",
] as const;

export const integrityAlertTypes = [
  "file hash changes",
  "MIME type does not match content",
  "malware is detected",
  "metadata materially conflicts",
  "original file is missing",
  "duplicate evidence is submitted repeatedly",
  "derivative is presented as original",
  "unauthorised user downloads evidence",
  "evidence is exported without approval",
  "consent is withdrawn",
  "legal hold is applied",
  "transcript confidence is too low",
  "redaction fails",
  "AI output is mistaken for original evidence",
  "custody event is missing",
] as const;

export const coreIntegrityRules = [
  "Never overwrite original evidence.",
  "Never store an edited file as the original.",
  "Every file must have a cryptographic hash.",
  "Every derivative must link to its source.",
  "Every export must include a manifest.",
  "Every correction must preserve prior versions.",
  "Duplicate evidence must not inflate corroboration.",
  "Consent and legal authority must remain visible.",
  "Child evidence requires stricter permissions.",
  "Authenticity, reliability and relevance remain separate.",
  "Deletion must respect legal holds and retention rules.",
  "Exports must identify redactions and limitations.",
] as const;

export const recommendedIntegrityBuildOrder = [
  {
    phase: "Original evidence protection",
    builds: ["evidence_sources", "evidence_file_objects", "SHA-256 hashing", "immutable original storage", "security scanning", "metadata extraction"],
  },
  {
    phase: "Provenance",
    builds: ["capture records", "custody events", "provenance links", "duplicate detection", "source-dependency tracking"],
  },
  {
    phase: "Rights and permissions",
    builds: ["evidence consents", "child permissions", "access events", "legal holds", "retention policies"],
  },
  {
    phase: "Derivatives",
    builds: ["transcripts", "translations", "redacted copies", "thumbnails", "processing history"],
  },
  {
    phase: "Court-ready exports",
    builds: ["evidence manifest", "integrity summary", "export approvals", "archive hashing", "digital verification", "export access logging"],
  },
] as const;

export function verifyFileHash({
  expectedHash,
  calculatedHash,
}: {
  expectedHash?: string;
  calculatedHash?: string;
}): IntegrityCheckResult {
  if (!expectedHash || !calculatedHash) return "unable_to_verify";
  return expectedHash === calculatedHash ? "match" : "mismatch";
}

export function canMutateFileObject({
  current,
  attempted,
}: {
  current: EvidenceFileObject;
  attempted: FileMutationAttempt;
}) {
  if (current.objectRole !== "original" || !current.immutable) {
    return { allowed: true, reason: "Non-original or mutable derivative can be updated through a versioned process." };
  }

  const immutableFieldsChanged =
    (attempted.storagePath !== undefined && attempted.storagePath !== current.storagePath) ||
    (attempted.sha256Hash !== undefined && attempted.sha256Hash !== current.sha256Hash) ||
    (attempted.sizeBytes !== undefined && attempted.sizeBytes !== current.sizeBytes) ||
    (attempted.detectedMimeType !== undefined && attempted.detectedMimeType !== current.detectedMimeType);

  return immutableFieldsChanged
    ? { allowed: false, reason: "Original evidence files are immutable; create a derivative or superseding evidence record." }
    : { allowed: true, reason: "No immutable original file fields changed." };
}

export function buildStoragePath({
  organisationId,
  caseId,
  personId,
  evidenceId,
  role,
  fileId,
}: {
  organisationId: string;
  caseId: string;
  personId: string;
  evidenceId: string;
  role: FileObjectRole;
  fileId: string;
}) {
  return `/${organisationId}/${caseId}/${personId}/${evidenceId}/${role}/${fileId}`;
}

export function validateExportAccess(check: EvidenceExportAccessCheck) {
  const failures = Object.entries(check)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return { releasable: failures.length === 0, failures };
}

export function summarizeIntegrityStatus(status: IntegrityStatusSummary) {
  return [
    `File integrity: ${status.fileIntegrity}`,
    `Source identity: ${status.sourceIdentity}`,
    `Capture provenance: ${status.captureProvenance}`,
    `Metadata consistency: ${status.metadataConsistency}`,
    `Content authenticity: ${status.contentAuthenticity}`,
    `Review status: ${status.reviewStatus}`,
    `Competency relevance: ${status.competencyRelevance}`,
  ];
}

export function duplicateCanCorroborate({
  duplicateDetected,
  sameSourceChain,
}: {
  duplicateDetected: boolean;
  sameSourceChain: boolean;
}) {
  return !(duplicateDetected || sameSourceChain);
}
