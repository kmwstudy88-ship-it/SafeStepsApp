import { supabase } from "../supabase/client";

export type GrowthProfile = {
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

export type GrowthReflectionType =
  | "weekly_family_win"
  | "toolbox_skill"
  | "child_future_letter"
  | "end_reflection";

export type GrowthReflection = {
  id: string;
  owner_id: string;
  program_id: string;
  program_title: string;
  reflection_type: GrowthReflectionType;
  month_number: number | null;
  month_topic: string | null;
  week_number: number | null;
  week_in_month: number | null;
  day_number: number | null;
  lesson_title: string | null;
  prompt: string;
  response: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  const user = data.user;

  if (!user) {
    throw new Error("No logged-in user found. Sign in before using growth features.");
  }

  return user;
}

export async function fetchGrowthProfile() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as GrowthProfile | null;
}

export async function saveGrowthProfile(input: {
  story_goal: string;
  strengths: string;
  support_notes: string;
}) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email ?? null,
      role: "parent",
      story_goal: input.story_goal,
      strengths: input.strengths,
      support_notes: input.support_notes,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("progress_events").insert({
    owner_id: user.id,
    event_type: "growth_profile_saved",
    label: "Growth profile updated",
    metadata: {
      has_story_goal: input.story_goal.trim().length > 0,
      has_strengths: input.strengths.trim().length > 0,
      has_support_notes: input.support_notes.trim().length > 0,
    },
  });

  return data as GrowthProfile;
}

export async function saveGrowthReflection(input: {
  reflection_type: GrowthReflectionType;
  prompt: string;
  response: string;
  program_id?: string;
  program_title?: string;
  month_number?: number | null;
  month_topic?: string | null;
  week_number?: number | null;
  week_in_month?: number | null;
  day_number?: number | null;
  lesson_title?: string | null;
}) {
  const user = await getCurrentUser();

  const programId = input.program_id ?? "safesteps-growth";
  const programTitle = input.program_title ?? "SafeSteps Growth";

  const { data, error } = await supabase
    .from("program_reflections")
    .insert({
      owner_id: user.id,
      program_id: programId,
      program_title: programTitle,
      reflection_type: input.reflection_type,
      month_number: input.month_number ?? null,
      month_topic: input.month_topic ?? null,
      week_number: input.week_number ?? null,
      week_in_month: input.week_in_month ?? input.week_number ?? null,
      day_number: input.day_number ?? null,
      lesson_title: input.lesson_title ?? null,
      prompt: input.prompt,
      response: input.response,
      metadata: {
        source: "growth_features",
        reflection_type: input.reflection_type,
      },
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("progress_events").insert({
    owner_id: user.id,
    event_type: input.reflection_type,
    label: getReflectionLabel(input.reflection_type),
    metadata: {
      program_id: programId,
      program_title: programTitle,
      prompt: input.prompt,
      response: input.response,
      reflection_id: data.id,
    },
  });

  return data as GrowthReflection;
}

export async function fetchGrowthReflections() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("program_reflections")
    .select("*")
    .eq("owner_id", user.id)
    .in("reflection_type", [
      "weekly_family_win",
      "toolbox_skill",
      "child_future_letter",
      "end_reflection",
    ])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as GrowthReflection[];
}

function getReflectionLabel(type: GrowthReflectionType) {
  if (type === "weekly_family_win") return "Family win recorded";
  if (type === "toolbox_skill") return "Toolbox skill added";
  if (type === "child_future_letter") return "Child future letter saved";
  return "Growth reflection saved";
}