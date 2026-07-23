import { supabase } from "../supabase";

export async function getPendingWeaponDetectionsForCase(caseId: string) {
  const { data, error } = await supabase
    .from("weapon_risk_detections")
    .select("*")
    .eq("case_id", caseId)
    .eq("review_status", "pending_review")
    .order("detected_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load weapon detections: ${error.message}`);
  }

  return data ?? [];
}
