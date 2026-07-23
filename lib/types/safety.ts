export type SafetyLevel = "SAFE" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | "IMMINENT";

export interface SafetyPlan {
  id: string;
  tenant_id: string;
  case_id: string;
  family_id: string | null;
  plan_reference: string;
  plan_title: string;
  safety_level: SafetyLevel;
  risk_summary: string | null;
  plan_status: string;
  next_review_at: string | null;
}

export interface SafetyDashboardSummary {
  case_id: string;
  tenant_id: string;
  case_reference: string;
  safety_plan_id: string | null;
  safety_level: SafetyLevel | null;
  next_review_at: string | null;
  open_alert_count: number;
  open_incident_count: number;
  pending_weapon_alert_count: number;
  open_missing_child_count: number;
  active_risk_factor_count: number;
  active_protective_factor_count: number;
}
