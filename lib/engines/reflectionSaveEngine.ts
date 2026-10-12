import { supabase } from "../supabase/client";

export type ReflectionLevel =
  | "program"
  | "month"
  | "week"
  | "lesson_start"
  | "lesson_end"
  | "week_review"
  | "month_review"
  | "program_completion";

export type ReflectionResponse = {
  question: string;
  answer: string;
};

export type ReflectionRecordInput = {
  program_id: string;
  program_title: string;
  reflection_level: ReflectionLevel;
  month_number?: number | null;
  month_topic?: string | null;
  week_number?: number | null;
  week_sub_topic?: string | null;
  day_number?: number | null;
  lesson_title?: string | null;
  responses: ReflectionResponse[];
  confidence_rating?: number | null;
};

function getReflectionType(level: ReflectionLevel) {
  if (level === "week") return "weekly_meaning";
  if (level === "lesson_start") return "daily_meaning";
  if (level === "lesson_end") return "end_reflection";
  if (level === "program_completion") return "end_reflection";
  return "monthly_meaning";
}

export async function saveReflectionRecord(record: ReflectionRecordInput) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Parent must be signed in before saving reflections.");
  }

  const reflectionType = getReflectionType(record.reflection_level);

  const rows = record.responses.map((response, index) => ({
    owner_id: userId,
    program_id: record.program_id,
    program_title: record.program_title,
    reflection_type: reflectionType,
    month_number: record.month_number ?? null,
    month_topic: record.month_topic ?? null,
    week_number: record.week_number ?? null,
    week_in_month: record.week_number ?? null,
    day_number: record.day_number ?? null,
    lesson_title: record.lesson_title ?? null,
    prompt: response.question,
    response: response.answer,
    metadata: {
      reflection_level: record.reflection_level,
      question_index: index,
      confidence_rating: record.confidence_rating ?? null,
      week_sub_topic: record.week_sub_topic ?? null,
    },
  }));

  const { data, error } = await supabase
    .from("program_reflections")
    .insert(rows)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (record.confidence_rating !== undefined && record.confidence_rating !== null) {
    await supabase.from("progress_events").insert({
      owner_id: userId,
      event_type: `${record.reflection_level}_reflection_saved`,
      label: `${record.reflection_level} reflection saved`,
      metadata: {
        program_id: record.program_id,
        program_title: record.program_title,
        month_number: record.month_number ?? null,
        month_topic: record.month_topic ?? null,
        week_number: record.week_number ?? null,
        week_sub_topic: record.week_sub_topic ?? null,
        confidence_rating: record.confidence_rating,
      },
    });
  }

  return data;
}

export async function fetchReflectionRecords() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Sign in before viewing reflections.");
  }

  const { data, error } = await supabase
    .from("program_reflections")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}