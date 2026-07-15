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

export type IntakeReviewQueueItem = {
  id: string;
  case_id: string;
  parent_user_id: string;
  completed_sections: number;
  total_sections: number;
  completed_at: string;
  reviewer_state: "pending" | "changes_required";
  reviewer_notes: string | null;
  family_label: string | null;
  parent_carer_name: string | null;
  program_stream: string | null;
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

export async function completeMyCaseIntake(
  assessmentId: string,
  responses: Record<string, string>,
  totalSections: number,
): Promise<{ completedSections: number; completedAt: string }> {
  const caseId = await resolveSingleActiveCaseId();
  const entries = Object.entries(responses).filter(([, value]) => value.trim().length > 0);
  const completedSections = entries.length;

  if (completedSections !== totalSections || totalSections <= 0) {
    throw new Error("Complete every intake section before saving.");
  }

  const { error } = await supabase.rpc("complete_case_intake", {
    target_case_id: caseId,
    target_assessment_id: assessmentId,
    intake_answers: Object.fromEntries(entries),
    completed_section_count: completedSections,
    total_section_count: totalSections,
  });

  if (error) throw new Error(error.message);

  return { completedSections, completedAt: new Date().toISOString() };
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

  const caseId = await resolveSingleActiveCaseId();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("id")
    .eq("owner_id", userId)
    .eq("case_id", caseId)
    .eq("program_id", programId)
    .eq("status", "active")
    .limit(1);

  if (error) throw new Error(error.message);
  if (!(data ?? []).length) {
    throw new Error("This program has not been started. Complete intake and program start requirements first.");
  }
}

export async function fetchIntakeReviewQueue(): Promise<IntakeReviewQueueItem[]> {
  const { data, error } = await supabase
    .from("case_intake_status")
    .select("id,case_id,parent_user_id,completed_sections,total_sections,completed_at,reviewer_state,reviewer_notes,reunification_cases(family_label,parent_carer_name,program_stream)")
    .in("reviewer_state", ["pending", "changes_required"])
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const caseRecord = Array.isArray(row.reunification_cases)
      ? row.reunification_cases[0]
      : row.reunification_cases;

    return {
      id: String(row.id),
      case_id: String(row.case_id),
      parent_user_id: String(row.parent_user_id),
      completed_sections: Number(row.completed_sections),
      total_sections: Number(row.total_sections),
      completed_at: String(row.completed_at),
      reviewer_state: row.reviewer_state as "pending" | "changes_required",
      reviewer_notes: row.reviewer_notes ? String(row.reviewer_notes) : null,
      family_label: caseRecord?.family_label ? String(caseRecord.family_label) : null,
      parent_carer_name: caseRecord?.parent_carer_name ? String(caseRecord.parent_carer_name) : null,
      program_stream: caseRecord?.program_stream ? String(caseRecord.program_stream) : null,
    };
  });
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
