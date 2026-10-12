import { supabase } from "../supabase";

export async function getRiskTrendForCase(caseId: string) {
  const { data, error } = await supabase
    .from("risk_trend_view")
    .select("*")
    .eq("case_id", caseId)
    .order("assessed_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load risk trend: ${error.message}`);
  }

  return data ?? [];
}
