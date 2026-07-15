import { getProgramById } from "../data/programs";
import { supabase } from "../supabase/client";
import { resolveSingleActiveCaseId } from "../security/caseAccess";
import {
  blockerMessage,
  evaluateProgramStartGate,
  type IntakeReviewerState,
  type ProgramRiskLevel,
  type ProgramStartGateDecision,
  type ProgramStartGateSnapshot,
} from "./programStartGatePolicy";

export type IntakeProgress = ProgramStartGateSnapshot & {
  caseId: string;
  completedSections: number;
  totalSections: number;
  percentComplete: number;
  reviewerNotes: string | null;
  decision: ProgramStartGateDecision;
};

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function calculateProfileComplete(profile: Record<string, unknown> | null): boolean {
  return Boolean(
    profile &&
      hasText(profile.display_name) &&
      hasText(profile.story_goal) &&
      hasText(profile.strengths) &&
      hasText(profile.support_notes),
  );
}

function calculateCaseSetupComplete(caseRecord: Record<string, unknown> | null): boolean {
  return Boolean(
    caseRecord &&
      hasText(caseRecord.family_label) &&
      hasText(caseRecord.parent_carer_name) &&
      Array.isArray(caseRecord.child_names) &&
      caseRecord.child_names.length > 0 &&
      hasText(caseRecord.program_stream) &&
      hasText(caseRecord.assessment_type) &&
      Array.isArray(caseRecord.case_goals) &&
      caseRecord.case_goals.length > 0,
  );
}

export async function getMyIntakeProgress(programId?: string): Promise<IntakeProgress> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  const userId = userData.user?.id;
  if (!userId) throw new Error("Sign in before checking intake progress.");

  const caseId = await resolveSingleActiveCaseId();
  const program = programId ? getProgramById(programId) : null;
  const riskLevel = (program?.curation.riskLevel ?? "custom") as ProgramRiskLevel;

  const [profileResult, caseResult, intakeResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name,story_goal,strengths,support_notes")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("reunification_cases")
      .select("id,family_label,parent_carer_name,child_names,program_stream,assessment_type,case_goals")
      .eq("id", caseId)
      .maybeSingle(),
    supabase
      .from("case_intake_status")
      .select("completed_sections,total_sections,completed_at,reviewer_state,reviewer_user_id,reviewed_at,reviewer_notes")
      .eq("case_id", caseId)
      .eq("parent_user_id", userId)
      .maybeSingle(),
  ]);

  if (profileResult.error) throw new Error(profileResult.error.message);
  if (caseResult.error) throw new Error(caseResult.error.message);
  if (intakeResult.error) throw new Error(intakeResult.error.message);

  const intake = intakeResult.data;
  const completedSections = Number(intake?.completed_sections ?? 0);
  const totalSections = Math.max(Number(intake?.total_sections ?? 12), 1);
  const intakeCompletedAt = intake?.completed_at ? String(intake.completed_at) : null;

  const snapshot: ProgramStartGateSnapshot = {
    profileComplete: calculateProfileComplete(profileResult.data as Record<string, unknown> | null),
    caseSetupComplete: calculateCaseSetupComplete(caseResult.data as Record<string, unknown> | null),
    intakeComplete: Boolean(intakeCompletedAt && completedSections >= totalSections),
    intakeCompletedAt,
    reviewerState: (intake?.reviewer_state ?? "not_required") as IntakeReviewerState,
    reviewerUserId: intake?.reviewer_user_id ? String(intake.reviewer_user_id) : null,
    reviewedAt: intake?.reviewed_at ? String(intake.reviewed_at) : null,
  };

  return {
    caseId,
    completedSections,
    totalSections,
    percentComplete: Math.min(100, Math.round((completedSections / totalSections) * 100)),
    reviewerNotes: intake?.reviewer_notes ? String(intake.reviewer_notes) : null,
    ...snapshot,
    decision: evaluateProgramStartGate(snapshot, riskLevel),
  };
}

export async function assertProgramCanStart(programId: string): Promise<IntakeProgress> {
  const progress = await getMyIntakeProgress(programId);
  if (!progress.decision.allowed) {
    throw new Error(progress.decision.blockers.map(blockerMessage).join(" "));
  }
  return progress;
}

export async function assertProgramEnrollmentAccess(programId: string): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  const userId = userData.user?.id;
  if (!userId) throw new Error("Sign in before opening program content.");

  const { data, error } = await supabase
    .from("program_enrollments")
    .select("id")
    .eq("owner_id", userId)
    .eq("program_id", programId)
    .eq("status", "active")
    .limit(1);

  if (error) throw new Error(error.message);
  if (!(data ?? []).length) {
    throw new Error("This program has not been started. Complete intake and program start requirements first.");
  }
}

export async function reviewIntake(
  caseId: string,
  reviewerState: "approved" | "changes_required",
  reviewerNotes: string,
): Promise<void> {
  const { error } = await supabase.rpc("review_case_intake", {
    target_case_id: caseId,
    next_reviewer_state: reviewerState,
    next_reviewer_notes: reviewerNotes.trim() || null,
  });
  if (error) throw new Error(error.message);
}
