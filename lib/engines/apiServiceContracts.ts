export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: { request_id: string; correlation_id?: string; api_version: string; server_time: string };
};

export type ApiFieldError = { field: string; code: string; message: string };

export type ApiErrorResponse = {
  success: false;
  error: { code: ApiErrorCode; message: string; details?: Record<string, unknown>; field_errors?: ApiFieldError[] };
  meta: { request_id: string; correlation_id?: string; api_version: string };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;

export type ApiErrorCode =
  | "AUTH_UNAUTHENTICATED"
  | "AUTH_FORBIDDEN"
  | "AUTH_SESSION_EXPIRED"
  | "CASE_NOT_FOUND"
  | "CASE_ACCESS_DENIED"
  | "ASSESSMENT_NOT_FOUND"
  | "ASSESSMENT_INVALID_STATE"
  | "ASSESSMENT_ALREADY_SUBMITTED"
  | "ASSESSMENT_RESPONSE_INCOMPLETE"
  | "ASSESSMENT_VERSION_CONFLICT"
  | "EVIDENCE_NOT_FOUND"
  | "EVIDENCE_UPLOAD_EXPIRED"
  | "EVIDENCE_FILE_BLOCKED"
  | "EVIDENCE_CONSENT_REQUIRED"
  | "EVIDENCE_ACCESS_DENIED"
  | "EVIDENCE_INTEGRITY_FAILED"
  | "REVIEW_NOT_ASSIGNED"
  | "REVIEW_CONFLICT_DETECTED"
  | "REVIEW_CREDENTIAL_REQUIRED"
  | "REVIEW_ALREADY_COMPLETED"
  | "APPEAL_NOT_ELIGIBLE"
  | "APPEAL_ALREADY_OPEN"
  | "APPEAL_DEADLINE_EXPIRED"
  | "REPORT_APPROVAL_REQUIRED"
  | "REPORT_RELEASE_NOT_AUTHORISED"
  | "WORKFLOW_INVALID_TRANSITION"
  | "WORKFLOW_STEP_FAILED"
  | "WORKFLOW_REPAIR_REQUIRED"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT_EXCEEDED"
  | "IDEMPOTENCY_KEY_REUSED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export type HttpStatus = 200 | 201 | 202 | 204 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503;
export type ApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type EndpointContract = {
  method: ApiMethod;
  path: string;
  purpose: string;
  idempotencyRequired: boolean;
  controlledEndpoint: boolean;
  workflowEventsEmitted: string[];
  forbiddenClientFields: string[];
};

export type IdempotencyRecord = {
  userId: string;
  endpointCode: string;
  idempotencyKey: string;
  requestHash: string;
  status: "processing" | "completed" | "failed";
  response?: ApiResponse<unknown>;
};

export const publicApiDomains = [
  "/api/v1/auth",
  "/api/v1/profiles",
  "/api/v1/cases",
  "/api/v1/programs",
  "/api/v1/lessons",
  "/api/v1/assessments",
  "/api/v1/evidence",
  "/api/v1/reviews",
  "/api/v1/competencies",
  "/api/v1/appeals",
  "/api/v1/reports",
  "/api/v1/notifications",
  "/api/v1/files",
  "/api/v1/workflows",
  "/api/v1/admin",
] as const;

export const internalApiDomains = [
  "/internal/v1/events",
  "/internal/v1/workflows",
  "/internal/v1/projections",
  "/internal/v1/integrity",
  "/internal/v1/notifications",
] as const;

export const requiredHeaders = [
  "Authorization",
  "X-Request-ID",
  "X-Correlation-ID",
  "Idempotency-Key",
  "X-Client-Version",
  "X-Timezone",
] as const;

export const endpointContracts: EndpointContract[] = [
  {
    method: "POST",
    path: "/api/v1/assessments/assignments/:id/start",
    purpose: "Start an assigned assessment and create an in-progress session.",
    idempotencyRequired: true,
    controlledEndpoint: true,
    workflowEventsEmitted: ["assessment.started"],
    forbiddenClientFields: ["final_score", "review_status", "competency_level"],
  },
  {
    method: "PATCH",
    path: "/api/v1/assessments/sessions/:id/responses/:responseId",
    purpose: "Save one assessment response with optimistic concurrency.",
    idempotencyRequired: false,
    controlledEndpoint: true,
    workflowEventsEmitted: ["assessment.response_saved"],
    forbiddenClientFields: ["final_score", "evidence_acceptance", "finalisation_status"],
  },
  {
    method: "POST",
    path: "/api/v1/assessments/sessions/:id/submit",
    purpose: "Submit an assessment session and start asynchronous workflow processing.",
    idempotencyRequired: true,
    controlledEndpoint: true,
    workflowEventsEmitted: ["assessment.submitted"],
    forbiddenClientFields: ["final_score", "review_status", "evidence_acceptance", "competency_level", "finalisation_status"],
  },
  {
    method: "POST",
    path: "/api/v1/evidence/uploads",
    purpose: "Create an upload session in quarantine.",
    idempotencyRequired: true,
    controlledEndpoint: true,
    workflowEventsEmitted: ["evidence.created"],
    forbiddenClientFields: ["review_status", "authenticity_status"],
  },
  {
    method: "POST",
    path: "/api/v1/evidence/uploads/:uploadId/complete",
    purpose: "Complete quarantine upload and start evidence processing.",
    idempotencyRequired: true,
    controlledEndpoint: true,
    workflowEventsEmitted: ["evidence.file_uploaded"],
    forbiddenClientFields: ["storage_bucket", "storage_path", "review_status"],
  },
];

export const contractTestCases = [
  "valid request",
  "missing token",
  "expired token",
  "wrong case",
  "wrong role",
  "stale version",
  "duplicate idempotency key",
  "reused key with different body",
  "invalid state transition",
  "incomplete response",
  "malformed JSON",
  "rate limit",
  "outbox event creation",
  "audit record creation",
] as const;

export const apiSecurityTests = [
  "Parent attempts to access another family's evidence",
  "Worker attempts to review an unassigned case",
  "Reviewer completes own assessment",
  "User supplies another person's user_id",
  "User changes case_id in request body",
  "Expired signed upload URL reused",
  "Original evidence path overwritten",
  "Report downloaded after access revoked",
  "Child-only evidence requested by parent",
  "Service endpoint called with normal user token",
] as const;

export const recommendedApiMigrations = [
  "202607210031_api_idempotency_keys.sql",
  "202607210032_api_audit_records.sql",
  "202607210033_file_upload_sessions.sql",
  "202607210034_permission_functions.sql",
  "202607210035_public_references.sql",
  "202607210036_rate_limit_records.sql",
  "202607210037_client_version_policies.sql",
  "202607210038_webhook_subscriptions.sql",
  "202607210039_webhook_deliveries.sql",
  "202607210040_api_rls.sql",
] as const;

export const coreApiRules = [
  "Never trust user IDs, roles or case access supplied by the client.",
  "High-impact writes must use controlled service endpoints.",
  "Every write must validate current state.",
  "Sensitive updates should use optimistic concurrency.",
  "Critical create and transition endpoints must be idempotent.",
  "API errors must use stable codes.",
  "Internal errors must not expose database details.",
  "File uploads must enter quarantine first.",
  "Runtime validation is mandatory.",
  "Workflow processing should continue outside the HTTP request.",
  "Public and internal endpoints must remain separate.",
] as const;

export function success<T>({ data, requestId, correlationId, serverTime }: { data: T; requestId: string; correlationId?: string; serverTime: string }): ApiSuccess<T> {
  return { success: true, data, meta: { request_id: requestId, correlation_id: correlationId, api_version: "v1", server_time: serverTime } };
}

export function errorResponse({ code, message, requestId, correlationId, statusDetails }: { code: ApiErrorCode; message: string; requestId: string; correlationId?: string; statusDetails?: Record<string, unknown> }): ApiErrorResponse {
  return { success: false, error: { code, message, details: statusDetails, field_errors: [] }, meta: { request_id: requestId, correlation_id: correlationId, api_version: "v1" } };
}

export function mapErrorCodeToStatus(code: ApiErrorCode): HttpStatus {
  if (code.startsWith("AUTH_UNAUTHENTICATED") || code === "AUTH_SESSION_EXPIRED") return 401;
  if (code.endsWith("ACCESS_DENIED") || code === "AUTH_FORBIDDEN" || code === "REPORT_RELEASE_NOT_AUTHORISED") return 403;
  if (code.endsWith("NOT_FOUND")) return 404;
  if (code.includes("VERSION_CONFLICT") || code.includes("INVALID_STATE") || code === "IDEMPOTENCY_KEY_REUSED") return 409;
  if (code.includes("INCOMPLETE") || code === "VALIDATION_ERROR") return 422;
  if (code === "RATE_LIMIT_EXCEEDED") return 429;
  if (code === "SERVICE_UNAVAILABLE") return 503;
  return 500;
}

export function checkIdempotency({ existing, requestHash }: { existing?: IdempotencyRecord; requestHash: string }) {
  if (!existing) return { outcome: "new" as const };
  if (existing.requestHash !== requestHash) return { outcome: "conflict" as const, errorCode: "IDEMPOTENCY_KEY_REUSED" as const };
  return { outcome: "replay" as const, response: existing.response };
}

export function validateOptimisticConcurrency({ expectedVersion, currentVersion }: { expectedVersion: number; currentVersion: number }) {
  return expectedVersion === currentVersion
    ? { valid: true }
    : { valid: false, errorCode: "ASSESSMENT_VERSION_CONFLICT" as const, details: { expected_version: expectedVersion, current_version: currentVersion } };
}

export function uploadCompletionChecks(checks: Record<"belongsToUser" | "notExpired" | "objectExists" | "sizeMatches" | "mimeAllowed" | "pathMatchesSession" | "notAlreadyCompleted" | "caseAccessValid" | "consentOrAuthorityRecorded" | "inQuarantine", boolean>) {
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([key]) => key);
  return { complete: failures.length === 0, failures };
}
