import { supabase } from "./supabase";

export type ReportReviewDecision = "approved" | "changes_requested" | "rejected";

export type CaseReportVersion = {
  id: string;
  report_id: string;
  version_number: number;
  version_status: string;
  content_hash: string;
  created_by: string | null;
  created_at: string;
  report_rendered_files?: CaseReportRenderedFile[];
};

export type CaseReportRenderedFile = {
  id: string;
  report_id: string;
  report_version: number;
  file_format: string;
  storage_bucket: string;
  storage_path: string;
  file_hash_sha256: string;
  generated_at: string;
};

export type CaseReport = {
  id: string;
  reunification_case_id: string;
  report_reference: string;
  report_type: string;
  audience_type: string;
  purpose: string;
  status: string;
  current_version: number;
  primary_author_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  released_at: string | null;
  report_versions?: CaseReportVersion[];
};

export type ReportApprovalEvent = {
  id: string;
  report_id: string;
  report_version: number;
  decision: ReportReviewDecision | "abstained";
  decision_reason: string | null;
  approver_user_id: string | null;
  independence_confirmed: boolean | null;
  approved_at: string | null;
  created_at: string;
};

export type ReportReleaseEvent = {
  id: string;
  case_id: string;
  report_id: string;
  report_version: number;
  content_hash_sha256: string;
  file_hash_sha256: string;
  verification_code: string;
  watermark_text: string;
  release_notes: string;
  released_by: string;
  released_at: string;
};

export function currentCaseReportVersion(report: CaseReport) {
  return (report.report_versions ?? []).find(
    (version) => version.version_number === report.current_version,
  ) ?? null;
}

export function currentReportPdf(version: CaseReportVersion | null) {
  if (!version) return null;
  return (version.report_rendered_files ?? []).find(
    (file) => file.report_version === version.version_number && file.file_format.toLowerCase() === "pdf",
  ) ?? null;
}

export function validateReportDecision(input: {
  decision: ReportReviewDecision;
  decisionReason: string;
  reviewerId?: string | null;
  authorId?: string | null;
}) {
  if (input.reviewerId && input.authorId && input.reviewerId === input.authorId) {
    return "Independent approval requires a reviewer who did not author this version.";
  }
  if (
    (input.decision === "changes_requested" || input.decision === "rejected")
    && input.decisionReason.trim().length === 0
  ) {
    return "A reason is required when returning or rejecting a report.";
  }
  return null;
}

export async function listCaseReports(caseId: string) {
  const { data, error } = await supabase
    .from("reports")
    .select("id,reunification_case_id,report_reference,report_type,audience_type,purpose,status,current_version,primary_author_id,approved_by,approved_at,released_at,report_versions(id,report_id,version_number,version_status,content_hash,created_by,created_at,report_rendered_files(id,report_id,report_version,file_format,storage_bucket,storage_path,file_hash_sha256,generated_at))")
    .eq("reunification_case_id", caseId)
    .order("requested_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CaseReport[];
}

export async function listReportApprovalEvents(reportIds: string[]) {
  if (!reportIds.length) return [];
  const { data, error } = await supabase
    .from("report_approvals")
    .select("id,report_id,report_version,decision,decision_reason,approver_user_id,independence_confirmed,approved_at,created_at")
    .in("report_id", reportIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReportApprovalEvent[];
}

export async function listReportReleaseEvents(caseId: string) {
  const { data, error } = await supabase
    .from("case_report_release_events")
    .select("*")
    .eq("case_id", caseId)
    .order("released_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReportReleaseEvent[];
}

export async function decideCaseReportVersion(input: {
  caseId: string;
  reportId: string;
  reportVersionId: string;
  decision: ReportReviewDecision;
  decisionReason: string;
}) {
  const validation = validateReportDecision(input);
  if (validation) throw new Error(validation);
  const { data, error } = await supabase.rpc("decide_case_report_version", {
    p_case_id: input.caseId,
    p_report_id: input.reportId,
    p_report_version_id: input.reportVersionId,
    p_decision: input.decision,
    p_decision_reason: input.decisionReason.trim(),
  });
  if (error) throw error;
  return data as string;
}

export async function releaseCaseReportVersion(input: {
  caseId: string;
  reportId: string;
  reportVersionId: string;
  renderedFileId: string;
  releaseNotes: string;
}) {
  const { data, error } = await supabase.rpc("release_case_report_version", {
    p_case_id: input.caseId,
    p_report_id: input.reportId,
    p_report_version_id: input.reportVersionId,
    p_rendered_file_id: input.renderedFileId,
    p_release_notes: input.releaseNotes.trim(),
  });
  if (error) throw error;
  return data as string;
}
