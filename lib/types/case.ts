export type CaseStatusCode =
  | "intake"
  | "assessment"
  | "planning"
  | "active"
  | "monitoring"
  | "transition"
  | "closure_review"
  | "closed"
  | "transferred";

export type CasePriorityCode =
  | "routine"
  | "standard"
  | "elevated"
  | "high"
  | "urgent"
  | "critical";

export interface SafeStepsCase {
  id: string;
  tenant_id: string;
  organisation_id: string;
  family_id: string;
  case_reference: string;
  case_type_code: string;
  case_status_code: CaseStatusCode;
  priority_code: CasePriorityCode;
  case_title: string | null;
  case_summary: string | null;
  opened_at: string;
  target_review_at: string | null;
  closed_at: string | null;
}

export interface CaseAllocation {
  id: string;
  tenant_id: string;
  case_id: string;
  allocated_user_id: string | null;
  allocated_team_id: string | null;
  allocation_role: string;
  allocation_status: string;
  primary_allocation: boolean;
  allocated_at: string;
  ended_at: string | null;
}

export interface CasePlan {
  id: string;
  tenant_id: string;
  case_id: string;
  plan_reference: string;
  plan_title: string;
  plan_type: string;
  plan_status: string;
  version_number: number;
  review_due_date: string | null;
}
