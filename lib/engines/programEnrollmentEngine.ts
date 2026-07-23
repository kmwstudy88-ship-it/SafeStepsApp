import { supabase } from "../supabase/client";
import { resolveSingleActiveCaseId } from "../security/caseAccess";
import { assertProgramCanStart } from "./programStartGateEngine";
import { hasCompletedIntakeAssessment } from "../platformData";

export type ProgramEnrollment = {
  id: string;
  owner_id: string;
  case_id: string;
  program_id: string;
  status: "active" | "paused" | "completed";
  started_at: string;
  completed_at: string | null;
  intake_status_id: string | null;
  gate_checked_at: string | null;
};

export async function fetchMyProgramEnrollments() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  const userId = userData.user?.id;
  if (!userId) throw new Error("No logged-in user found. Sign in before viewing programs.");

  const { data, error } = await supabase
    .from("program_enrollments")
    .select("*")
    .eq("owner_id", userId)
    .order("started_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProgramEnrollment[];
}

export async function fetchActiveProgramEnrollment(programId: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  const userId = userData.user?.id;
  if (!userId) throw new Error("No logged-in user found. Sign in before checking enrolment.");

  const caseId = await resolveSingleActiveCaseId();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("*")
    .eq("owner_id", userId)
    .eq("case_id", caseId)
    .eq("program_id", programId)
    .eq("status", "active")
    .limit(1);

  if (error) throw new Error(error.message);
  return ((data ?? [])[0] ?? null) as ProgramEnrollment | null;
}

export async function startProgramEnrollment(programId: string, programTitle: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  const userId = userData.user?.id;
  if (!userId) throw new Error("No logged-in user found. Parent must be signed in before starting a program.");

  const intakeComplete = await hasCompletedIntakeAssessment(userId);

  if (!intakeComplete) {
    throw new Error("Complete the SafeSteps intake assessment before starting or continuing a program.");
  }

  const existing = await fetchActiveProgramEnrollment(programId);
  if (existing) return existing;

  const progress = await assertProgramCanStart(programId);
  const { data, error } = await supabase.rpc("start_program_enrollment", {
    target_case_id: progress.caseId,
    target_program_id: programId,
  });

  if (error) throw new Error(error.message);

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "program_started",
    label: `Program started: ${programTitle}`,
    metadata: {
      case_id: progress.caseId,
      program_id: programId,
      program_title: programTitle,
      intake_completed_at: progress.intakeCompletedAt,
      reviewer_state: progress.reviewerState,
    },
  });

  return data as ProgramEnrollment;
}
