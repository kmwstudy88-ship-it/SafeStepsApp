import Constants from 'expo-constants';
import { supabase } from './supabaseClient';

const baseUrl = String(
  Constants.expoConfig?.extra?.backendUrl ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '',
).replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) throw new Error('SafeSteps backend is not configured. Set EXPO_PUBLIC_BACKEND_URL.');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sign in before using case risk workflows.');

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: ['Bearer', token].join(' '),
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `Case risk request failed (${response.status})`);
  return payload as T;
}

export type CaseRiskHistoryResponse = {
  risk_history: Array<{ id: string; score: number; tier: string; confidence: number; rationale: string; model_version: string; created_at: string }>;
  recent_events: Array<{ id: string; event_type: string; event_source: string; note?: string; created_at: string }>;
  open_escalations: Array<{ id: string; trigger_type: string; severity: string; status: string; created_at: string }>;
  follow_up_tasks: Array<{ id: string; task_type: string; title: string; priority: string; status: string; due_at: string }>;
  human_review_required: boolean;
};

export type SupervisorDashboardResponse = {
  generated_at: string;
  highest_risk_open_cases: Array<any>;
  rising_risk_cases: Array<any>;
  open_escalations: Array<any>;
  overdue_follow_ups: Array<any>;
  case_summaries: Array<any>;
};

export async function getCaseRiskHistory(caseId: string) {
  return request<CaseRiskHistoryResponse>(`/cases/${caseId}/risk-history`);
}

export async function recomputeCaseRisk(caseId: string) {
  return request<{ snapshot: { score: number; tier: string; rationale: string } }>(`/cases/${caseId}/recompute-risk`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function createCaseEvent(caseId: string, payload: Record<string, unknown>) {
  return request(`/cases/${caseId}/events`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getSupervisorDashboard() {
  return request<SupervisorDashboardResponse>('/dashboard/supervisor');
}
