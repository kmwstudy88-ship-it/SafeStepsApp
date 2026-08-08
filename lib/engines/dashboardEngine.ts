import { supabase } from "../supabase/client";
import { resolveSingleActiveCaseId } from "../security/caseAccess";
import { getProgramRecommendationForStream } from "./programRecommendationPolicy";

export type ProgramJourneySnapshot = {
  caseId: string;
  selectedStream: string;
  programId: string;
  programTitle: string;
  recommendationStatus: "recommended" | "confirmed" | "active";
  reviewerState: string;
  confirmedAt: string | null;
  startedAt: string | null;
};

export type DashboardStats = {
  activePrograms: number;
  completedTasks: number;
  readyTasks: number;
  evidenceItems: number;
  progressEvents: number;
  reflections: number;
  programJourney: ProgramJourneySnapshot | null;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error(
      "No logged-in user found. Sign in before viewing the dashboard.",
    );
  }

  return userId;
}

async function getCount(
  table: string,
  ownerColumn: string,
  ownerId: string,
  extra?: (query: any) => any,
) {
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(ownerColumn, ownerId);

  if (extra) {
    query = extra(query);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function fetchProgramJourney(
  userId: string,
): Promise<ProgramJourneySnapshot | null> {
  let caseId: string;

  try {
    caseId = await resolveSingleActiveCaseId();
  } catch {
    return null;
  }

  const [caseResult, intakeResult, confirmationResult, enrollmentResult] =
    await Promise.all([
      supabase
        .from("reunification_cases")
        .select("program_stream")
        .eq("id", caseId)
        .maybeSingle(),
      supabase
        .from("case_intake_status")
        .select("reviewer_state")
        .eq("case_id", caseId)
        .eq("parent_user_id", userId)
        .maybeSingle(),
      supabase
        .from("program_recommendations")
        .select("program_id,confirmed_at,status")
        .eq("case_id", caseId)
        .eq("parent_user_id", userId)
        .eq("status", "confirmed")
        .maybeSingle(),
      supabase
        .from("program_enrollments")
        .select("program_id,started_at")
        .eq("case_id", caseId)
        .eq("owner_id", userId)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1),
    ]);

  const journeyError =
    caseResult.error ||
    intakeResult.error ||
    confirmationResult.error ||
    enrollmentResult.error;
  if (journeyError) throw new Error(journeyError.message);

  const selectedStream = String(caseResult.data?.program_stream ?? "");
  const recommendation = getProgramRecommendationForStream(selectedStream);
  if (!recommendation) return null;

  const activeEnrollmentCandidate = enrollmentResult.data?.[0] ?? null;
  const activeEnrollment =
    activeEnrollmentCandidate?.program_id === recommendation.program.id
      ? activeEnrollmentCandidate
      : null;

  const confirmedCandidate = confirmationResult.data;
  const confirmed =
    confirmedCandidate?.program_id === recommendation.program.id
      ? confirmedCandidate
      : null;

  return {
    caseId,
    selectedStream,
    programId: recommendation.program.id,
    programTitle: recommendation.program.title,
    recommendationStatus: activeEnrollment
      ? "active"
      : confirmed
        ? "confirmed"
        : "recommended",
    reviewerState: String(intakeResult.data?.reviewer_state ?? "not_ready"),
    confirmedAt: confirmed?.confirmed_at
      ? String(confirmed.confirmed_at)
      : null,
    startedAt: activeEnrollment?.started_at
      ? String(activeEnrollment.started_at)
      : null,
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const userId = await getCurrentUserId();

  const [
    activePrograms,
    completedTasks,
    readyTasks,
    evidenceItems,
    progressEvents,
    reflections,
    programJourney,
  ] = await Promise.all([
    getCount("program_enrollments", "owner_id", userId, (query) =>
      query.eq("status", "active"),
    ),
    getCount("user_tasks", "owner_id", userId, (query) =>
      query.eq("status", "completed"),
    ),
    getCount("user_tasks", "owner_id", userId, (query) =>
      query.neq("status", "completed"),
    ),
    getCount("evidence_items", "owner_id", userId),
    getCount("progress_events", "owner_id", userId),
    getCount("program_reflections", "owner_id", userId),
    fetchProgramJourney(userId),
  ]);

  return {
    activePrograms,
    completedTasks,
    readyTasks,
    evidenceItems,
    progressEvents,
    reflections,
    programJourney,
  };
}
