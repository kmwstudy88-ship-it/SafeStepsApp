import { supabase } from "../supabase/client";

function getAuthRedirectUrl() {
  if (process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL) {
    return process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL;
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/welcome`;
  }

  return undefined;
}

export type SafeStepsProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: "parent" | "worker" | "admin";
  story_goal: string;
  strengths: string;
  support_notes: string;
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

  return data as SafeStepsProfile;
}

export async function upsertProfile(input: {
  display_name?: string | null;
  email?: string | null;
  story_goal?: string;
  strengths?: string;
  support_notes?: string;
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
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SafeStepsProfile;
}
