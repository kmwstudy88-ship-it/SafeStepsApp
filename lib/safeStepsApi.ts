import { supabase } from "./supabaseClient";

const DEFAULT_API_URL = "http://localhost:3000";

export type SafeStepsAudience = "child" | "parent" | "caseworker";

export class SafeStepsApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly requestId: string | null,
    readonly status: number,
  ) {
    super(message);
    this.name = "SafeStepsApiError";
  }
}

type ApiEnvelope<T> = {
  data: T;
  meta?: {
    requestId?: string;
  };
};

type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    requestId?: string;
  };
};

function apiBaseUrl() {
  return (process.env.EXPO_PUBLIC_SAFESTEPS_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

export async function safeStepsApiRequest<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(init.headers);

  if (authenticated) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!data.session?.access_token) {
      throw new SafeStepsApiError("Sign in before continuing.", "AUTH_REQUIRED", null, 401);
    }
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, { ...init, headers });
  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ApiErrorEnvelope
    | null;

  if (!response.ok) {
    const error = (payload as ApiErrorEnvelope | null)?.error;
    throw new SafeStepsApiError(
      error?.message ?? `SafeSteps returned ${response.status}.`,
      error?.code ?? "REQUEST_FAILED",
      error?.requestId ?? response.headers.get("x-request-id"),
      response.status,
    );
  }

  return (payload as ApiEnvelope<T>).data;
}

export async function signInForAudience(
  audience: SafeStepsAudience,
  email: string,
  password: string,
) {
  const data = await safeStepsApiRequest<{
    audience: SafeStepsAudience;
    user: { id: string; email: string | null };
    roles: string[];
    memberships: Array<{ caseId: string; membershipRole: string; status: "active" }>;
    session: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number | null;
      expiresIn: number;
      tokenType: string;
    };
  }>(
    `/auth/${audience}/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    },
    false,
  );

  const { data: sessionData, error } = await supabase.auth.setSession({
    access_token: data.session.accessToken,
    refresh_token: data.session.refreshToken,
  });
  if (error) throw new Error(error.message);

  return {
    ...data,
    session: sessionData.session,
    user: sessionData.user,
  };
}

export async function getSafeStepsSessionContext() {
  return safeStepsApiRequest<{
    user: { id: string; email: string | null } | null;
    roles: string[];
    memberships: Array<{ caseId: string; membershipRole: string; status: "active" }>;
    sessionReference: string | null;
  }>("/auth/session");
}

export async function signOutSafeStepsSession() {
  await safeStepsApiRequest<{ signedOut: true }>("/auth/logout", { method: "POST" });
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error(error.message);
}

export async function requestSupportGuideResponse(input: {
  domain: "parenting" | "child_psychology" | "family_violence" | "substance_use" | "mental_health";
  message: string;
  consent: true;
  history?: Array<{ user: string; assistant: string }>;
}, signal?: AbortSignal) {
  return safeStepsApiRequest<{
    source: "ai" | "safety_intercept" | "guardrail_fallback";
    metadata?: { intent: string; confidence: number; matchedSignalIds: string[]; tone: { label: string; confidence: number; diagnostic: false } };
    persistence?: { stored: boolean; conversationId?: string; userMessageId?: string; assistantMessageId?: string };
    risk: { urgent: boolean; ruleIds: string[]; contacts: string[] };
    reply: { heading: string; acknowledgement: string; steps: string[]; followUp: string };
  }>("/support-guide/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
}

export async function requestPersonalAiChat(input: {
  conversationId?: string;
  domain: "parenting" | "child_psychology" | "family_violence" | "substance_use" | "mental_health";
  message: string;
  consentToAiSupport: true;
  consentToStoreNote?: boolean;
  consentToMoodTrends?: boolean;
  history?: Array<{ user: string; assistant: string }>;
}, signal?: AbortSignal) {
  return safeStepsApiRequest<{
    conversationId: string | null;
    flowId: string;
    state: "start" | "reflect" | "clarify" | "safety_check" | "support" | "escalate" | "document" | "close";
    assistantMessage: string;
    riskLevel: "low" | "medium" | "high" | "critical";
    escalationType: string;
    requiresHumanHandoff: boolean;
    shouldDocument: boolean;
    completionState: "not_started" | "in_progress" | "completed" | "escalated" | "abandoned";
    reply: { heading: string; acknowledgement: string; steps: string[]; followUp: string };
    source: "ai" | "safety_intercept" | "guardrail_fallback";
    metadata?: { intent: string; confidence: number; matchedSignalIds: string[]; tone: { label: string; confidence: number; diagnostic: false; scores?: Record<string, number>; analysisVersion?: string } };
  }>("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
}

export async function streamPersonalAiChat(
  input: Parameters<typeof requestPersonalAiChat>[0],
  onDelta: (approvedText: string) => void,
  signal?: AbortSignal,
) {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  if (!data.session?.access_token) throw new SafeStepsApiError("Sign in before continuing.", "AUTH_REQUIRED", null, 401);
  const response = await fetch(`${apiBaseUrl()}/api/chat/stream`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${data.session.access_token}`, "Content-Type": "application/json", "Accept": "application/x-ndjson" },
    body: JSON.stringify(input), signal,
  });
  if (!response.ok) throw new SafeStepsApiError(`SafeSteps returned ${response.status}.`, "REQUEST_FAILED", response.headers.get("x-request-id"), response.status);
  if (!response.body) throw new SafeStepsApiError("Streaming is not supported on this device.", "STREAM_UNAVAILABLE", response.headers.get("x-request-id"), 503);
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let approvedText = ""; let complete: Awaited<ReturnType<typeof requestPersonalAiChat>> | null = null;
  while (true) {
    const { value, done } = await reader.read(); buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n"); buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as { type: "start" | "delta" | "complete"; text?: string; data?: Awaited<ReturnType<typeof requestPersonalAiChat>> };
      if (event.type === "delta" && event.text) { approvedText += event.text; onDelta(approvedText); }
      if (event.type === "complete" && event.data) complete = event.data;
    }
    if (done) break;
  }
  if (!complete) throw new SafeStepsApiError("The validated response did not complete.", "STREAM_INCOMPLETE", response.headers.get("x-request-id"), 502);
  return complete;
}

export type PersonalAiMoodObservation = { id: string; dominant_emotion: "neutral" | "anxiety" | "sadness" | "anger" | "joy"; confidence_score: number; positive_score: number; negative_score: number; neutral_score: number; anger_score: number; sadness_score: number; anxiety_score: number; joy_score: number; analysis_version: string; created_at: string; expires_at: string };
export function getPersonalAiMoodTrends() { return safeStepsApiRequest<PersonalAiMoodObservation[]>("/api/mood-trends"); }
export function deletePersonalAiMoodTrends() { return safeStepsApiRequest<{ deleted: true }>("/api/mood-trends", { method: "DELETE" }); }

export type PersonalAiHandoffRow = {
  id: string; user_id: string; conversation_id: string | null; flow_id: string | null;
  reason_code: string; summary: string; urgency: "low" | "medium" | "high" | "critical";
  status: "queued" | "assigned" | "in_review" | "resolved" | "escalated_to_emergency" | "closed";
  assigned_to_user_id: string | null; created_at: string; updated_at: string;
};

export function getPersonalAiHandoffs() {
  return safeStepsApiRequest<PersonalAiHandoffRow[]>("/api/admin/handoffs");
}

export function updatePersonalAiHandoff(id: string, input: { status: PersonalAiHandoffRow["status"]; assignToMe?: boolean }) {
  return safeStepsApiRequest<Pick<PersonalAiHandoffRow, "id" | "status" | "assigned_to_user_id" | "updated_at">>(`/api/admin/handoffs/${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
}
