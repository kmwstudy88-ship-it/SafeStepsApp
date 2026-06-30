import { supabase } from "../supabase/client";

export type ReflectionStatusCheck = {
  programId: string;
  level: "month" | "week";
  monthNumber?: number | null;
  weekNumber?: number | null;
};

export async function hasReflectionRecord(check: ReflectionStatusCheck) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Parent must be signed in before checking reflection progress.");
  }

  const reflectionType =
    check.level === "week" ? "weekly_meaning" : "monthly_meaning";

  let query = supabase
    .from("program_reflections")
    .select("id")
    .eq("owner_id", userId)
    .eq("program_id", check.programId)
    .eq("reflection_type", reflectionType)
    .limit(1);

  if (check.monthNumber !== undefined && check.monthNumber !== null) {
    query = query.eq("month_number", check.monthNumber);
  }

  if (check.weekNumber !== undefined && check.weekNumber !== null) {
    query = query.eq("week_number", check.weekNumber);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).length > 0;
}