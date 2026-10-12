import { supabase } from "./supabase";

export type EvidenceReviewDecision = "accepted" | "needs_update" | "excluded";

export type EvidenceReviewVersion = {
  id: string;
  document_id: string;
  version_number: number;
  file_name: string;
  mime_type: string | null;
  file_sha256: string | null;
  uploaded_at: string;
  review_status: "pending" | EvidenceReviewDecision;
  review_notes: string;
};

export type EvidenceReviewDocument = {
  id: string;
  case_id: string;
  current_version_id: string | null;
  document_type: string;
  title: string;
  status: string;
  court_report_include: boolean;
  notes: string;
  updated_at: string;
  case_document_versions?: EvidenceReviewVersion[];
};

export type EvidenceReviewEvent = {
  id: string;
  case_id: string;
  document_id: string;
  document_version_id: string;
  decision: EvidenceReviewDecision;
  include_in_report: boolean;
  review_notes: string;
  reviewed_by: string;
  reviewed_at: string;
};

export function currentEvidenceReviewVersion(document: EvidenceReviewDocument) {
  const versions = document.case_document_versions ?? [];
  if (!versions.length) return null;

  if (document.current_version_id) {
    const current = versions.find((version) => version.id === document.current_version_id);
    if (current) return current;
  }

  return [...versions].sort((left, right) => right.version_number - left.version_number)[0] ?? null;
}

export function validateEvidenceReviewDecision(input: {
  decision: EvidenceReviewDecision;
  includeInReport: boolean;
  reviewNotes: string;
}) {
  if (input.includeInReport && input.decision !== "accepted") {
    return "Only accepted evidence can be selected for report inclusion.";
  }

  if (
    (input.decision === "needs_update" || input.decision === "excluded")
    && input.reviewNotes.trim().length === 0
  ) {
    return "Review notes are required when evidence is returned or excluded.";
  }

  return null;
}

export async function listEvidenceReviewDocuments(caseId: string) {
  const { data, error } = await supabase
    .from("case_documents")
    .select(
      "id,case_id,current_version_id,document_type,title,status,court_report_include,notes,updated_at,case_document_versions(id,document_id,version_number,file_name,mime_type,file_sha256,uploaded_at,review_status,review_notes)",
    )
    .eq("case_id", caseId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as EvidenceReviewDocument[];
}

export async function listEvidenceReviewEvents(caseId: string) {
  const { data, error } = await supabase
    .from("case_document_review_events")
    .select("*")
    .eq("case_id", caseId)
    .order("reviewed_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as EvidenceReviewEvent[];
}

export async function reviewEvidenceDocument(input: {
  caseId: string;
  documentId: string;
  documentVersionId: string;
  decision: EvidenceReviewDecision;
  includeInReport: boolean;
  reviewNotes: string;
}) {
  const validationError = validateEvidenceReviewDecision(input);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabase.rpc("review_case_document_version", {
    p_case_id: input.caseId,
    p_document_id: input.documentId,
    p_document_version_id: input.documentVersionId,
    p_decision: input.decision,
    p_include_in_report: input.includeInReport,
    p_review_notes: input.reviewNotes.trim(),
  });

  if (error) throw error;
  return data as string;
}
