import { supabase } from "../supabase";
import type { ProductionLessonResponse } from "./types";

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error("You must be signed in to save lesson progress.");
  return data.user.id;
}

export async function getProductionLessonResponse(
  lessonId: string,
  enrolmentId?: string | null,
) {
  const userId = await currentUserId();
  let query = supabase
    .from("lesson_responses")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId);

  query = enrolmentId
    ? query.eq("enrolment_id", enrolmentId)
    : query.is("enrolment_id", null);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data ?? null) as ProductionLessonResponse | null;
}

export async function saveProductionLessonResponse(input: {
  lessonId: string;
  enrolmentId?: string | null;
  currentStep: string;
  completedSteps: string[];
  responseData: Record<string, unknown>;
  quizScore?: number | null;
  quizPassed?: boolean;
  assessmentStatus?: "not_started" | "draft" | "submitted" | "reviewed";
  completedAt?: string | null;
}) {
  const userId = await currentUserId();
  const existing = await getProductionLessonResponse(
    input.lessonId,
    input.enrolmentId,
  );

  const payload = {
    user_id: userId,
    enrolment_id: input.enrolmentId ?? null,
    lesson_id: input.lessonId,
    current_step: input.currentStep,
    completed_steps: input.completedSteps,
    response_data: input.responseData,
    quiz_score: input.quizScore ?? null,
    quiz_passed: input.quizPassed ?? false,
    assessment_status: input.assessmentStatus ?? "not_started",
    completed_at: input.completedAt ?? null,
  };

  const request = existing?.id
    ? supabase
        .from("lesson_responses")
        .update(payload)
        .eq("id", existing.id)
        .select("*")
        .single()
    : supabase.from("lesson_responses").insert(payload).select("*").single();

  const { data, error } = await request;
  if (error) throw error;
  return data as ProductionLessonResponse;
}
