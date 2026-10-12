import { resolveSingleActiveCaseId } from "./security/caseAccess";
import { safeStepsApiRequest } from "./safeStepsApi";

export type DocumentIntelligenceSource = {
  mode: "text" | "file";
  fileName: string | null;
  mimeType: string | null;
  textLength: number;
};

export type DocumentIntelligenceSection = {
  summary: string;
  signals: string[];
  evidenceRefs: string[];
  gaps: string[];
  reviewPrompts: string[];
  confidence: "low" | "medium" | "high";
};

export type DocumentIntelligenceResult = {
  schemaVersion: string;
  model: string;
  generatedAt: string;
  input: {
    characterCount: number;
    truncated: boolean;
  };
  overallSummary: string;
  priorityReview: string[];
  safetyFlags: string[];
  evidenceGaps: string[];
  workerReviewActions: string[];
  sections: Record<string, DocumentIntelligenceSection>;
  disclaimer: string;
};

export type DocumentAnalysisRun = {
  id: string;
  case_id: string;
  document_id: string | null;
  document_version_id: string | null;
  requested_by: string;
  source_mode: "text" | "file";
  source_metadata: DocumentIntelligenceSource;
  status: "queued" | "processing" | "completed" | "failed";
  schema_version: string;
  model: string | null;
  result: DocumentIntelligenceResult | null;
  error_code: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type DocumentIntelligenceResponse = {
  source: DocumentIntelligenceSource;
  result: DocumentIntelligenceResult;
  analysisId?: string;
  documentId?: string | null;
};

export type DocumentIntelligenceFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

export async function analyzeDocumentText(text: string, selectedCaseId?: string) {
  const caseId = selectedCaseId ?? (await resolveSingleActiveCaseId());
  const data = await safeStepsApiRequest<{
    source: DocumentIntelligenceSource;
    document: { id: string } | null;
    documentVersion: { id: string } | null;
    analysis: DocumentAnalysisRun;
  }>("/documents/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId, text }),
  });

  return responseFromRun(data.source, data.analysis, data.document?.id ?? null);
}

export async function analyzeDocumentFile(
  file: DocumentIntelligenceFile,
  fallbackText = "",
  selectedCaseId?: string,
) {
  const caseId = selectedCaseId ?? (await resolveSingleActiveCaseId());
  const formData = new FormData();
  formData.append("caseId", caseId);

  if (!file.uri.startsWith("file:") && fallbackText.trim()) {
    formData.append("text", fallbackText.trim());
  }

  if (file.uri.startsWith("file:")) {
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? "application/octet-stream",
    } as unknown as Blob);
  }

  const data = await safeStepsApiRequest<{
    source: DocumentIntelligenceSource;
    document: { id: string } | null;
    documentVersion: { id: string } | null;
    analysis: DocumentAnalysisRun;
  }>("/documents/analyze", {
    method: "POST",
    body: formData,
  });

  return responseFromRun(data.source, data.analysis, data.document?.id ?? null);
}

export async function uploadDocumentFile(
  file: DocumentIntelligenceFile,
  input: {
    caseId?: string;
    documentId?: string;
    documentType?: string;
    title?: string;
  } = {},
) {
  const caseId = input.caseId ?? (await resolveSingleActiveCaseId());
  const formData = new FormData();
  formData.append("caseId", caseId);
  formData.append("documentType", input.documentType ?? "other");
  formData.append("title", input.title ?? file.name);
  if (input.documentId) formData.append("documentId", input.documentId);
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? "application/octet-stream",
  } as unknown as Blob);

  return safeStepsApiRequest<{
    document: Record<string, unknown>;
    version: Record<string, unknown>;
  }>("/documents/upload", { method: "POST", body: formData });
}

export async function getDocumentAnalysis(analysisId: string, selectedCaseId?: string) {
  const caseId = selectedCaseId ?? (await resolveSingleActiveCaseId());
  const params = new URLSearchParams({ caseId });
  return safeStepsApiRequest<{ analysis: DocumentAnalysisRun }>(
    `/documents/analyses/${encodeURIComponent(analysisId)}?${params.toString()}`,
  );
}

export async function listDocumentAnalyses(documentId: string, selectedCaseId?: string) {
  const caseId = selectedCaseId ?? (await resolveSingleActiveCaseId());
  const params = new URLSearchParams({ caseId });
  return safeStepsApiRequest<{ analyses: DocumentAnalysisRun[] }>(
    `/documents/${encodeURIComponent(documentId)}/analyses?${params.toString()}`,
  );
}

function responseFromRun(
  source: DocumentIntelligenceSource,
  analysis: DocumentAnalysisRun,
  documentId: string | null,
): DocumentIntelligenceResponse {
  if (!analysis.result) {
    throw new Error(analysis.error_message ?? "SafeSteps did not return a document analysis result.");
  }

  return {
    source,
    result: analysis.result,
    analysisId: analysis.id,
    documentId,
  };
}
