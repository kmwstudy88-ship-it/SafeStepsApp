import { supabase } from "../supabase";

export async function getActiveCrisisEventsForCase(caseId: string) {
  const { data, error } = await supabase
    .from("crisis_events")
    .select("*")
    .eq("case_id", caseId)
    .eq("crisis_status", "active")
    .order("started_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load crisis events: ${error.message}`);
  }

  return data ?? [];
}
