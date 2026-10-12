import * as Linking from "expo-linking";

import { supabase } from "../supabase/client";
import {
  defaultRepresentationPreferences,
  normaliseRepresentationPreferences,
  type RepresentationPreferences,
} from "./representationPreferencesEngine";

function getAuthRedirectUrl() {
  if (process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL) {
    return process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL;
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/onboarding/verify-account`;
  }

  return Linking.createURL("/onboarding/verify-account");
}

function getPasswordRecoveryRedirectUrl() {
  const baseUrl = getAuthRedirectUrl();

  if (!baseUrl) {
    return undefined;
  }

  try {
    const url = new URL(baseUrl);
    url.pathname = "/reset-password";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return baseUrl.replace(/\/[^/]*$/, "/reset-password");
  }
}

function getUrlAuthParams(authUrl: string) {
  const parsedUrl = new URL(authUrl);
  const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ""));
  const queryParams = parsedUrl.searchParams;

  return {
    accessToken: hashParams.get("access_token") ?? queryParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token") ?? queryParams.get("refresh_token"),
    code: queryParams.get("code") ?? hashParams.get("code"),
  };
}

export type SafeStepsProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: "parent" | "worker" | "admin";
  story_goal: string;
  strengths: string;
  support_notes: string;
  representation_preferences: RepresentationPreferences;
  created_at: string;
  updated_at: string;
};

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function registerWithEmail(input: {
  email: string;
  password: string;
  displayName: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const user = data.user;

  if (user && data.session) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: input.displayName.trim(),
        email: user.email ?? input.email.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      throw new Error(profileError.message);
    }
  }

  return data;
}

export async function requestPasswordReset(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getPasswordRecoveryRedirectUrl(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createPasswordRecoverySession(recoveryUrl: string) {
  const { accessToken, refreshToken, code } = getUrlAuthParams(recoveryUrl);

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  }

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createEmailVerificationSession(verificationUrl: string) {
  const { accessToken, refreshToken, code } = getUrlAuthParams(verificationUrl);

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  }

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token,
    type: "email",
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function resendEmailVerification(email: string) {
  const { data, error } = await supabase.auth.resend({
    email: email.trim(),
    type: "signup",
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchMyProfile() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("No logged-in user found.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return await upsertProfile({
      display_name: user.email ?? "Parent",
      email: user.email ?? null,
    });
  }

  return {
    ...data,
    representation_preferences: normaliseRepresentationPreferences(data.representation_preferences),
  } as SafeStepsProfile;
}

export async function upsertProfile(input: {
  display_name?: string | null;
  email?: string | null;
  story_goal?: string;
  strengths?: string;
  support_notes?: string;
  representation_preferences?: RepresentationPreferences;
}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("No logged-in user found.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: input.email ?? user.email ?? null,
      display_name: input.display_name ?? user.email ?? "Parent",
      role: "parent",
      story_goal: input.story_goal ?? "",
      strengths: input.strengths ?? "",
      support_notes: input.support_notes ?? "",
      representation_preferences: input.representation_preferences ?? defaultRepresentationPreferences,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SafeStepsProfile;
}
