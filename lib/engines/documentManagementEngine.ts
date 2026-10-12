import { supabase } from "../supabase";
import { getSignedInUserId } from "../authSession";

export type CaseDocumentType =
  | "tenancy_agreement"
  | "centrelink_statement"
  | "court_order"
  | "service_letter"
  | "medical"
  | "school"
  | "financial"
  | "identity"
  | "other";

export type CaseDocumentStatus =
  | "requested"
  | "submitted"
  | "reviewed"
  | "accepted"
  | "needs_update"
  | "expired"
  | "excluded";

export type CaseDocumentVersion = {
  id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  file_sha256: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
  review_status: "pending" | "accepted" | "needs_update" | "excluded";
  review_notes: string;
};

export type CaseDocumentRecord = {
  id: string;
  case_id: string;
  parent_user_id: string | null;
  worker_user_id: string | null;
  current_version_id: string | null;
  linked_evidence_id: string | null;
  linked_assessment_id: string | null;
  document_type: CaseDocumentType;
  title: string;
  status: CaseDocumentStatus;
  expiry_date: string | null;
  court_report_include: boolean;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseDocumentRequest = {
  id: string;
  case_id: string;
  document_id: string | null;
  parent_user_id: string | null;
  requested_by: string | null;
  document_type: CaseDocumentType;
  title: string;
  reason: string;
  due_at: string | null;
  status: "requested" | "submitted" | "cancelled" | "overdue";
  created_at: string;
  fulfilled_at: string | null;
};

export type DocumentExpiryAlert = {
  documentId: string;
  title: string;
  severity: "moderate" | "high";
  notificationType: "document_expiry";
  body: string;
  daysUntilExpiry: number;
};

export type DocumentManagementSummary = {
  totalDocuments: number;
  acceptedDocuments: number;
  needsUpdate: number;
  expiringOrExpired: number;
  openRequests: number;
  reportReadyDocuments: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysUntilDocumentExpiry(expiryDate: string | null, now = new Date()) {
  if (!expiryDate) return null;
  const expiryTime = new Date(`${expiryDate}T00:00:00.000Z`).getTime();
  const todayTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.ceil((expiryTime - todayTime) / MS_PER_DAY);
}

export function documentIsExpired(document: Pick<CaseDocumentRecord, "expiry_date" | "status">, now = new Date()) {
  const days = daysUntilDocumentExpiry(document.expiry_date, now);
  return days !== null && days < 0 && document.status !== "excluded";
}

export function nextDocumentVersionNumber(versions: Pick<CaseDocumentVersion, "version_number">[]) {
  return versions.reduce((highest, version) => Math.max(highest, version.version_number), 0) + 1;
}

export function buildDocumentStoragePath(input: {
  caseId: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
}) {
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `case-documents/${input.caseId}/${input.documentId}/v${input.versionNumber}-${safeName}`;
}

export function evaluateDocumentExpiryAlerts(
  documents: Pick<CaseDocumentRecord, "id" | "title" | "expiry_date" | "status">[],
  now = new Date(),
): DocumentExpiryAlert[] {
  return documents.flatMap((document) => {
    if (document.status === "excluded" || document.status === "expired") return [];
    const days = daysUntilDocumentExpiry(document.expiry_date, now);
    if (days === null || days > 14) return [];

    return [
      {
        documentId: document.id,
        title: days < 0 ? "Document expired" : "Document expiry approaching",
        severity: days < 0 ? "high" : "moderate",
        notificationType: "document_expiry",
        body:
          days < 0
            ? `${document.title} expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago.`
            : `${document.title} expires in ${days} day${days === 1 ? "" : "s"}.`,
        daysUntilExpiry: days,
      },
    ];
  });
}

export function createDocumentManagementSummary(
  documents: Pick<CaseDocumentRecord, "status" | "expiry_date" | "court_report_include">[],
  requests: Pick<CaseDocumentRequest, "status">[] = [],
  now = new Date(),
): DocumentManagementSummary {
  return {
    totalDocuments: documents.length,
    acceptedDocuments: documents.filter((document) => document.status === "accepted").length,
    needsUpdate: documents.filter((document) => document.status === "needs_update").length,
    expiringOrExpired: evaluateDocumentExpiryAlerts(
      documents.map((document, index) => ({ id: String(index), title: "Document", ...document })),
      now,
    ).length,
    openRequests: requests.filter((request) => request.status === "requested" || request.status === "overdue").length,
    reportReadyDocuments: documents.filter(
      (document) => document.court_report_include && document.status === "accepted",
    ).length,
  };
}

export async function listCaseDocuments(caseId: string) {
  const { data, error } = await supabase
    .from("case_documents")
    .select("*, case_document_versions(*)")
    .eq("case_id", caseId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as (CaseDocumentRecord & { case_document_versions?: CaseDocumentVersion[] })[];
}

export async function requestCaseDocument(input: {
  caseId: string;
  parentUserId?: string | null;
  documentType: CaseDocumentType;
  title: string;
  reason?: string;
  dueAt?: string | null;
}) {
  const userId = await getSignedInUserId("requesting a case document");
  const { data, error } = await supabase
    .from("case_document_requests")
    .insert({
      case_id: input.caseId,
      parent_user_id: input.parentUserId ?? null,
      requested_by: userId,
      document_type: input.documentType,
      title: input.title,
      reason: input.reason ?? "",
      due_at: input.dueAt ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as CaseDocumentRequest;
}

export async function registerCaseDocumentVersion(input: {
  documentId: string;
  versionNumber: number;
  filePath: string;
  fileName: string;
  mimeType?: string | null;
  fileSha256?: string | null;
}) {
  const userId = await getSignedInUserId("registering a case document");
  const { data, error } = await supabase
    .from("case_document_versions")
    .insert({
      document_id: input.documentId,
      version_number: input.versionNumber,
      file_path: input.filePath,
      file_name: input.fileName,
      mime_type: input.mimeType ?? null,
      file_sha256: input.fileSha256 ?? null,
      uploaded_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as CaseDocumentVersion;
}
