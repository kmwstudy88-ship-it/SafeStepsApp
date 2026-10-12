import { supabase } from "./supabase";

export type ReportReadyCaseDocumentVersion = {
  id: string;
  version_number: number;
  file_name: string;
  mime_type: string | null;
  file_sha256: string | null;
  uploaded_at: string;
  review_status: "pending" | "accepted" | "needs_update" | "excluded";
  review_notes: string;
};

export type ReportReadyCaseDocument = {
  id: string;
  case_id: string;
  current_version_id: string | null;
  document_type: string;
  title: string;
  status: string;
  expiry_date: string | null;
  court_report_include: boolean;
  notes: string;
  updated_at: string;
  case_document_versions?: ReportReadyCaseDocumentVersion[];
};

export function isReportReadyCaseDocument(
  document: Pick<ReportReadyCaseDocument, "status" | "court_report_include">,
) {
  return document.status === "accepted" && document.court_report_include === true;
}

export function currentReportReadyVersion(document: ReportReadyCaseDocument) {
  const versions = document.case_document_versions ?? [];
  if (!versions.length) return null;

  if (document.current_version_id) {
    const current = versions.find((version) => version.id === document.current_version_id);
    if (current) return current;
  }

  return [...versions].sort((a, b) => b.version_number - a.version_number)[0] ?? null;
}

export async function listReportReadyCaseDocuments(caseId: string) {
  const { data, error } = await supabase
    .from("case_documents")
    .select(
      "id,case_id,current_version_id,document_type,title,status,expiry_date,court_report_include,notes,updated_at,case_document_versions(id,version_number,file_name,mime_type,file_sha256,uploaded_at,review_status,review_notes)",
    )
    .eq("case_id", caseId)
    .eq("status", "accepted")
    .eq("court_report_include", true)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as ReportReadyCaseDocument[]).filter(isReportReadyCaseDocument);
}

export function buildReportReadyDocumentAppendix(documents: ReportReadyCaseDocument[]) {
  return documents.filter(isReportReadyCaseDocument).map((document, index) => {
    const version = currentReportReadyVersion(document);
    return {
      appendixNumber: index + 1,
      documentId: document.id,
      caseId: document.case_id,
      title: document.title,
      documentType: document.document_type,
      expiryDate: document.expiry_date,
      versionNumber: version?.version_number ?? null,
      fileName: version?.file_name ?? null,
      fileSha256: version?.file_sha256 ?? null,
      versionReviewStatus: version?.review_status ?? null,
      reviewNotes: version?.review_notes ?? "",
    };
  });
}
