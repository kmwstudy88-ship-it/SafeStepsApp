import { supabase } from "../supabase";
import type { SafeStepsCase } from "../types/case";

export type CaseListItem = Pick<
  SafeStepsCase,
  | "id"
  | "tenant_id"
  | "organisation_id"
  | "family_id"
  | "case_reference"
  | "case_type_code"
  | "case_status_code"
  | "priority_code"
  | "case_title"
  | "case_summary"
  | "opened_at"
  | "target_review_at"
  | "closed_at"
>;

export async function getCasesForFamily(familyId: string): Promise<CaseListItem[]> {
  const { data, error } = await supabase
    .from("cases")
    .select(
      `
      id,
      tenant_id,
      organisation_id,
      family_id,
      case_reference,
      case_type_code,
      case_status_code,
      priority_code,
      case_title,
      case_summary,
      opened_at,
      target_review_at,
      closed_at
    `,
    )
    .eq("family_id", familyId)
    .order("opened_at", { ascending: false })
    .returns<CaseListItem[]>();

  if (error) {
    throw new Error(`Unable to load cases: ${error.message}`);
  }

  return data ?? [];
}

export async function getCaseWorkspace(caseId: string) {
  const { data, error } = await supabase
    .from("cases")
    .select(
      `
      *,
      case_participants (*),
      case_allocations (*),
      case_plans (
        *,
        case_plan_goals (
          *,
          case_plan_actions (*)
        )
      ),
      case_strengths (*),
      case_barriers (*),
      case_milestones (*)
    `,
    )
    .eq("id", caseId)
    .single();

  if (error) {
    throw new Error(`Unable to load case: ${error.message}`);
  }

  return data;
}
