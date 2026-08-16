import { supabase } from "../supabase";
import type { LessonProgressStatus } from "./types";

type LessonLockInput = {
  id: string;
  day_number?: number | null;
};

export function computeLessonLocks(lessons: LessonLockInput[], completedLessonIds: string[]) {
  const completed = new Set(completedLessonIds);
  const sorted = [...lessons].sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0));
  const result: { lessonId: string; status: LessonProgressStatus; locked: boolean }[] = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const lesson = sorted[index];
    const previousLesson = sorted[index - 1];
    const isCompleted = completed.has(lesson.id);
    const canOpen = index === 0 || (previousLesson ? completed.has(previousLesson.id) : false) || isCompleted;

    result.push({
      lessonId: lesson.id,
      status: isCompleted ? "completed" : canOpen ? "unlocked" : "locked",
      locked: !canOpen,
    });
  }

  return result;
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error("You must be signed in to update progress.");
  return data.user.id;
}

export async function getProgressForEnrolment(enrolmentId: string) {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("enrolment_id", enrolmentId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function markLessonInProgress(enrolmentId: string, lessonId: string, currentStep = "reflection") {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        enrolment_id: enrolmentId,
        lesson_id: lessonId,
        user_id: userId,
        status: "in_progress",
        current_step: currentStep,
        attempts: 1,
      },
      { onConflict: "enrolment_id,lesson_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function completeLessonAndUnlockNext(enrolmentId: string, lessonId: string) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        enrolment_id: enrolmentId,
        lesson_id: lessonId,
        user_id: userId,
        status: "completed",
        current_step: "end_reflection",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "enrolment_id,lesson_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}