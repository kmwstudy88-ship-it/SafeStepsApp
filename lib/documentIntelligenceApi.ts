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
export type RequirementExtractionResult = {
  requirement?: string;
  category?: string;
  priority?: string;
  status?: string;
  source_locator?: string;
  confidence?: number;
};
export type ConcernClassificationResult = {
  concern?: string;
  category?: string;
  severity?: string;
  rationale?: string;
  source_locator?: string;
  confidence?: number;
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
  requirements?: RequirementExtractionResult[];
  concern_classification?: { concerns?: ConcernClassificationResult[] };
  risk?: Record<string, unknown> & { media_assessment?: MediaAssessmentResult };
  media_assessment?: MediaAssessmentResult;
  analysis_skills?: Array<{
    skill_id?: string;
    status?: 'complete' | 'insufficient_evidence' | 'failed';
    findings?: Array<Record<string, unknown>>;
    confidence?: number;
    evidence_citations?: string[];
    limitations?: string[];
    human_review_required?: boolean;
    failure_behavior?: string;
    unsafe_output_flags?: string[];
  }>;
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

export type DocumentIntelligenceScores = {
  risk_score: number;
  protective_score: number;
  bias_score: number;
  document_quality_score: number;
  case_complexity_score: number;
};

export type DocumentIntelligenceSummaries = {
  child_centred: string;
  parent_summary: string;
  legal_summary: string;
  strengths_summary: string;
  action_plan: string;
};

export type DocumentIntelligenceV1Result = {
  document_id: string;
  metadata: {
    document_type: string;
    author_role: string;
    created_at: string;
    source_system: string;
  };
  entities: { people: unknown[]; dates: unknown[]; locations: unknown[]; events: unknown[] };
  timeline: { events: unknown[]; gaps: unknown[]; contradictions: unknown[] };
  analysis: {
    risks: unknown[];
    protective_factors: unknown[];
    contradictions: unknown[];
    bias_indicators: unknown[];
    professional_concerns: unknown[];
    missing_evidence: unknown[];
    severity_scale: Record<string, unknown>;
    contextual_modifiers: Record<string, unknown>;
  };
  scores: DocumentIntelligenceScores;
  summaries: DocumentIntelligenceSummaries;
  ml_features: { tokens: unknown[]; embeddings: unknown[]; feature_vector: unknown[] };
  audit: { evidence_trace: unknown[]; source_verification: unknown[]; explainability: unknown[] };
};

export type DocumentIntelligenceQueuedResult = {
  document_id: string;
  status: string;
  poll_url: string;
  summary_url: string;
  scores_url: string;
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

export async function analyzeDocumentV1(payload: {
  text?: string;
  file?: { name: string; mimeType?: string; contentBase64: string; extractedText?: string | null };
  metadata?: Record<string, unknown>;
  caseId?: string | null;
}) {
  return request<DocumentIntelligenceV1Result | DocumentIntelligenceQueuedResult>('/v1/document/analyse', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getDocumentIntelligenceSummary(documentId: string) {
  return request<DocumentIntelligenceSummaries>(`/v1/document/${documentId}/summary`);
}

export async function getDocumentIntelligenceScores(documentId: string) {
  return request<DocumentIntelligenceScores>(`/v1/document/${documentId}/scores`);
}
