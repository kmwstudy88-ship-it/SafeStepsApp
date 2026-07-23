import { supabase } from "../supabase";

export async function getOpenIncidentsForCase(caseId: string) {
  const { data, error } = await supabase
    .from("safety_incidents")
    .select("*")
    .eq("case_id", caseId)
    .eq("incident_status", "open")
    .order("occurred_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load incidents: ${error.message}`);
  }

  return data ?? [];
}
