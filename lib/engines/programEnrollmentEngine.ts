import { supabase } from "../supabase/client";
import { hasCompletedIntakeAssessment } from "../platformData";

export type ProgramEnrollment = {
  id: string;
  owner_id: string;
  program_id: string;
  status: "active" | "paused" | "completed";
  started_at: string;
  completed_at: string | null;
};

export async function fetchMyProgramEnrollments() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Sign in before viewing programs.");
  }

  const { data, error } = await supabase
    .from("program_enrollments")
    .select("*")
    .eq("owner_id", userId)
    .order("started_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ProgramEnrollment[];
}

export async function fetchActiveProgramEnrollment(programId: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Sign in before checking enrolment.");
  }

  const { data, error } = await supabase
    .from("program_enrollments")
    .select("*")
    .eq("owner_id", userId)
    .eq("program_id", programId)
    .eq("status", "active")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? [])[0] ?? null) as ProgramEnrollment | null;
}

export async function startProgramEnrollment(programId: string, programTitle: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Parent must be signed in before starting a program.");
  }

  const existing = await fetchActiveProgramEnrollment(programId);

  if (existing) {
    return existing;
  }

  const intakeComplete = await hasCompletedIntakeAssessment(userId);

  if (!intakeComplete) {
    throw new Error("Complete the SafeSteps intake assessment before starting a program.");
  }

  const { data, error } = await supabase
    .from("program_enrollments")
    .insert({
      owner_id: userId,
      program_id: programId,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "program_started",
    label: `Program started: ${programTitle}`,
    metadata: {
      program_id: programId,
      program_title: programTitle,
    },
  });

  return data as ProgramEnrollment;
}
