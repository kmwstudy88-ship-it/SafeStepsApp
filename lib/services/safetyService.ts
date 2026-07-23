import { supabase } from "../supabase";
import type { SafetyDashboardSummary, SafetyPlan } from "../types/safety";

export async function getSafetyPlansForCase(caseId: string): Promise<SafetyPlan[]> {
  const { data, error } = await supabase
    .from("safety_plans")
    .select("id, tenant_id, case_id, family_id, plan_reference, plan_title, safety_level, risk_summary, plan_status, next_review_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false })
    .returns<SafetyPlan[]>();

  if (error) {
    throw new Error(`Unable to load safety plans: ${error.message}`);
  }

  return data ?? [];
}

export async function getSafetyDashboardForCase(caseId: string): Promise<SafetyDashboardSummary | null> {
  const { data, error } = await supabase
    .from("safety_dashboard_view")
    .select("*")
    .eq("case_id", caseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load safety dashboard: ${error.message}`);
  }

  return data as SafetyDashboardSummary | null;
}
