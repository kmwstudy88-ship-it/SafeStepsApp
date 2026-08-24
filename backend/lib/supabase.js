import { createClient } from "@supabase/supabase-js";

import { ApiError, serviceUnavailable } from "./apiError.js";

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    throw serviceUnavailable("SafeSteps API authentication is not configured.");
  }

  return { url, publishableKey };
}

export function createSafeStepsClient(accessToken) {
  const { url, publishableKey } = getSupabaseConfig();

  return createClient(url, publishableKey, {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function createSafeStepsServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) throw serviceUnavailable("SafeSteps persistence is not configured.");
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}

export async function resolveAuthorizationContext(client, userId) {
  const [rolesResult, membershipsResult] = await Promise.all([
    client.from("user_roles").select("role").eq("user_id", userId),
    client
      .from("case_memberships")
      .select("case_id,membership_role,status")
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  if (rolesResult.error || membershipsResult.error) {
    throw new ApiError(
      503,
      "AUTHORIZATION_LOOKUP_FAILED",
      "SafeSteps could not verify this account's permissions.",
      { cause: rolesResult.error ?? membershipsResult.error },
    );
  }

  const roles = [...new Set((rolesResult.data ?? []).map((item) => String(item.role)))];
  const memberships = (membershipsResult.data ?? []).map((item) => ({
    caseId: String(item.case_id),
    membershipRole: String(item.membership_role),
    status: "active",
  }));

  return { roles, memberships };
}

export function sessionReferenceFromToken(accessToken) {
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64url").toString("utf8"));
    return typeof payload.session_id === "string" ? payload.session_id : null;
  } catch {
    return null;
  }
}

export async function ensureActiveSecuritySession(client, user, accessToken, metadata = {}) {
  const sessionReference = sessionReferenceFromToken(accessToken);
  if (!sessionReference) {
    throw new ApiError(401, "SESSION_INVALID", "The SafeSteps session is missing its session reference.");
  }

  const { data: existing, error: lookupError } = await client
    .from("user_security_sessions")
    .select("id,revoked_at")
    .eq("user_id", user.id)
    .eq("auth_session_reference", sessionReference)
    .maybeSingle();

  if (lookupError) {
    throw new ApiError(503, "SESSION_LOOKUP_FAILED", "SafeSteps could not verify this session.", {
      cause: lookupError,
    });
  }

  if (existing?.revoked_at) {
    throw new ApiError(401, "SESSION_REVOKED", "This SafeSteps session has been signed out.");
  }

  const now = new Date().toISOString();
  if (!existing) {
    const { error: insertError } = await client.from("user_security_sessions").insert({
      user_id: user.id,
      auth_session_reference: sessionReference,
      device_reference: metadata.deviceReference ?? null,
      platform: metadata.platform ?? null,
      client_version: metadata.clientVersion ?? null,
      last_seen_at: now,
    });

    if (insertError && insertError.code !== "23505") {
      throw new ApiError(503, "SESSION_REGISTER_FAILED", "SafeSteps could not register this session.", {
        cause: insertError,
      });
    }
  } else {
    const { error: updateError } = await client
      .from("user_security_sessions")
      .update({ last_seen_at: now })
      .eq("id", existing.id);

    if (updateError) {
      throw new ApiError(503, "SESSION_UPDATE_FAILED", "SafeSteps could not update this session.", {
        cause: updateError,
      });
    }
  }

  return sessionReference;
}
