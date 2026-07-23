import { supabase } from "../supabase";

export type CourtReportSupervisorApproval = {
  id: string;
  case_id: string;
  snapshot_hash: string | null;
  approved: boolean;
  reviewed_by: string;
  reviewer_name: string | null;
  review_notes: string;
  approval_scope: "report_export" | "snapshot_export" | "case_review";
  created_at: string;
};

export type SaveCourtReportSupervisorApprovalInput = {
  caseId: string;
  snapshotHash?: string | null;
  approved: boolean;
  reviewerName?: string | null;
  reviewNotes?: string;
  approvalScope?: CourtReportSupervisorApproval["approval_scope"];
};

export async function fetchLatestCourtReportSupervisorApproval(
  caseId: string,
): Promise<CourtReportSupervisorApproval | null> {
  const { data, error } = await supabase
    .from("court_report_supervisor_approvals")
    .select("id, case_id, snapshot_hash, approved, reviewed_by, reviewer_name, review_notes, approval_scope, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return (data ?? null) as CourtReportSupervisorApproval | null;
}

export async function saveCourtReportSupervisorApproval(
  input: SaveCourtReportSupervisorApprovalInput,
): Promise<CourtReportSupervisorApproval> {
  const { data, error } = await supabase
    .from("court_report_supervisor_approvals")
    .insert({
      case_id: input.caseId,
      snapshot_hash: input.snapshotHash ?? null,
      approved: input.approved,
      reviewer_name: input.reviewerName?.trim() || null,
      review_notes: input.reviewNotes?.trim() ?? "",
      approval_scope: input.approvalScope ?? "report_export",
    })
    .select("id, case_id, snapshot_hash, approved, reviewed_by, reviewer_name, review_notes, approval_scope, created_at")
    .single();

  if (error) throw error;

  return data as CourtReportSupervisorApproval;
}
