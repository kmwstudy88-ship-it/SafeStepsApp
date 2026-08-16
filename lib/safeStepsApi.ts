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
    memberships: { caseId: string; membershipRole: string; status: "active" }[];
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
    memberships: { caseId: string; membershipRole: string; status: "active" }[];
    sessionReference: string | null;
  }>("/auth/session");
}

export async function signOutSafeStepsSession() {
  await safeStepsApiRequest<{ signedOut: true }>("/auth/logout", { method: "POST" });
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error(error.message);
}
