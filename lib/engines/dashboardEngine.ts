import { supabase } from "../supabase/client";

export type DashboardStats = {
  activePrograms: number;
  completedTasks: number;
  readyTasks: number;
  evidenceItems: number;
  progressEvents: number;
  reflections: number;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Sign in before viewing the dashboard.");
  }

  return userId;
}

async function getCount(
  table: string,
  ownerColumn: string,
  ownerId: string,
  extra?: (query: any) => any
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

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const userId = await getCurrentUserId();

  const [
    activePrograms,
    completedTasks,
    readyTasks,
    evidenceItems,
    progressEvents,
    reflections,
  ] = await Promise.all([
    getCount("program_enrollments", "owner_id", userId, (query) =>
      query.eq("status", "active")
    ),
    getCount("user_tasks", "owner_id", userId, (query) =>
      query.eq("status", "completed")
    ),
    getCount("user_tasks", "owner_id", userId, (query) =>
      query.neq("status", "completed")
    ),
    getCount("evidence_items", "owner_id", userId),
    getCount("progress_events", "owner_id", userId),
    getCount("program_reflections", "owner_id", userId),
  ]);

  return {
    activePrograms,
    completedTasks,
    readyTasks,
    evidenceItems,
    progressEvents,
    reflections,
  };
}