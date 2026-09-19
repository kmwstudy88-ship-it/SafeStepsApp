import Constants from 'expo-constants';
import { supabase } from './supabaseClient';

export type FairnessRecommendation = { concern: string; reframe: string };
export type MediaAssessmentDomainResult = {
  domain_id?: string;
  domain_name?: string;
  signals_observed?: string[];
  risk_flags?: string[];
  protective_flags?: string[];
  notes?: string;
  confidence?: number;
};
export type MediaAssessmentResult = {
  domains?: MediaAssessmentDomainResult[];
};
export type FairnessResult = {
  score?: number;
  framing_concerns?: Array<{ category?: string; language?: string; explanation?: string; severity?: string }>;
  coercion_flags?: unknown[];
  discrimination_risks?: unknown[];
  unrealistic_expectations?: unknown[];
  remediation_recommendations?: FairnessRecommendation[];
};

export type DocumentAnalysis = {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  provider?: string;
  model?: string;
  summary?: Record<string, unknown>;
  fairness?: FairnessResult;
  bias?: { score?: number; signals?: Array<{ category?: string; language?: string; explanation?: string; severity?: string }> };
  evidence?: unknown[];
  contradictions?: unknown[];
  timeline?: unknown[];
  risk?: Record<string, unknown> & { media_assessment?: MediaAssessmentResult };
  media_assessment?: MediaAssessmentResult;
  raw_output?: Record<string, unknown>;
  limitations?: string[];
  confidence_overview?: { sample_count: number; average: number | null; min: number | null; max: number | null };
  decision_support_only?: boolean;
  unverified?: boolean;
  human_review_required?: boolean;
  human_review_status?: string;
  error_message?: string | null;
};

export type DocumentPollResult = {
  document: {
    id: string;
    processing_status: string;
    file_name?: string;
    decision_support_only?: boolean;
    unverified?: boolean;
    human_review_required?: boolean;
    human_review_status?: string;
    metadata?: Record<string, unknown>;
  };
  analysis: DocumentAnalysis | null;
};

export type DocumentQueueResult = {
  document_id: string;
  analysis_id: string;
  job_id?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  poll_url?: string;
  human_review_required?: boolean;
};

const baseUrl = String(
  Constants.expoConfig?.extra?.backendUrl ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '',
).replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) throw new Error('Document intelligence backend is not configured. Set EXPO_PUBLIC_BACKEND_URL.');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sign in before using document intelligence.');

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `Document intelligence request failed (${response.status})`);
  return payload as T;
}

export async function queueFairnessAnalysis(text: string) {
  return request<DocumentQueueResult>('/documents/analyze/fairness', {
    method: 'POST', body: JSON.stringify({ text }),
  });
}

export async function queueDocumentUpload(params: {
  caseId?: string | null;
  fileName: string;
  mimeType: string;
  contentBase64: string;
  extractedText?: string | null;
}) {
  return request<DocumentQueueResult>('/documents/upload', {
    method: 'POST',
    body: JSON.stringify({
      caseId: params.caseId ?? null,
      fileName: params.fileName,
      mimeType: params.mimeType,
      contentBase64: params.contentBase64,
      extractedText: params.extractedText ?? null,
    }),
  });
}

export async function getDocumentAnalysis(documentId: string) {
  return request<DocumentPollResult>(`/documents/${documentId}`);
}

export async function waitForDocumentAnalysis(documentId: string, timeoutMs = 90000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const result = await getDocumentAnalysis(documentId);
    if (result.analysis?.status === 'completed' || result.analysis?.status === 'failed') return result;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  throw new Error('Analysis is still processing. You can retry in a moment.');
}

export async function compareDocuments(documentIds: string[]) {
  return request<{ comparison_id: string; status: string }>('/documents/compare', {
    method: 'POST', body: JSON.stringify({ documentIds }),
  });
}
