import { supabase } from "../supabase";

export type SensitiveAuditAction =
  | "view_report"
  | "upload_evidence"
  | "edit_assessment"
  | "accept_ai_finding"
  | "export_document";

const PROHIBITED_METADATA_KEYS = new Set([
  "body",
  "message_text",
  "assessment_answers",
  "answers",
  "notes",
  "file_content",
  "transcript",
  "transcript_text",
  "response",
  "responses",
]);

export function sanitizeAuditMetadata(input: Record<string, unknown> = {}): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (PROHIBITED_METADATA_KEYS.has(key.toLowerCase())) continue;
    if (value === null || typeof value === "boolean" || typeof value === "number") {
      output[key] = value;
      continue;
    }
    if (typeof value === "string") {
      output[key] = value.slice(0, 250);
      continue;
    }
    if (Array.isArray(value)) {
      output[key] = value
        .filter((item) => ["string", "number", "boolean"].includes(typeof item))
        .slice(0, 20)
        .map((item) => (typeof item === "string" ? item.slice(0, 100) : item));
    }
  }

  return output;
}

export async function recordSensitiveAction(input: {
  caseId: string;
  action: SensitiveAuditAction;
  resourceType: string;
  resourceId?: string | null;
  outcome?: "allowed" | "denied" | "succeeded" | "failed";
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const { data, error } = await supabase.rpc("record_sensitive_action", {
    target_case_id: input.caseId,
    target_action: input.action,
    target_resource_type: input.resourceType,
    target_resource_id: input.resourceId ?? null,
    target_outcome: input.outcome ?? "succeeded",
    target_metadata: sanitizeAuditMetadata(input.metadata),
  });

  if (error) throw new Error(`Sensitive audit event was not recorded: ${error.message}`);
  return String(data);
}

export const auditReportViewed = (caseId: string, reportId?: string | null) =>
  recordSensitiveAction({ caseId, action: "view_report", resourceType: "report", resourceId: reportId });

export const auditEvidenceUploaded = (caseId: string, evidenceId: string) =>
  recordSensitiveAction({ caseId, action: "upload_evidence", resourceType: "evidence", resourceId: evidenceId });

export const auditAssessmentEdited = (caseId: string, assessmentId: string) =>
  recordSensitiveAction({ caseId, action: "edit_assessment", resourceType: "assessment", resourceId: assessmentId });

export const auditAiFindingAccepted = (caseId: string, findingId: string) =>
  recordSensitiveAction({ caseId, action: "accept_ai_finding", resourceType: "ai_finding", resourceId: findingId });

export const auditDocumentExported = (caseId: string, documentId: string, format?: string) =>
  recordSensitiveAction({
    caseId,
    action: "export_document",
    resourceType: "document",
    resourceId: documentId,
    metadata: format ? { format } : undefined,
  });
