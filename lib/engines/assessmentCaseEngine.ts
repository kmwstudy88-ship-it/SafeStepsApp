import { supabase } from "../supabase/client";

export type AssessmentCaseSetup = {
  id: string;
  owner_id: string;
  family_label: string | null;
  parent_carer_name: string | null;
  child_names: string[];
  program_stream: string | null;
  assessment_type: string | null;
  case_goals: string[];
  case_start_date: string | null;
  assessment_date: string | null;
  review_due_date: string | null;
  court_date: string | null;
  support_worker_name: string | null;
  caseworker_name: string | null;
  supervisor_name: string | null;
  legal_contact_name: string | null;
  status: "active" | "on_hold" | "completed" | "exited";
  program_phase: number;
  opened_date: string;
  updated_at: string;
};

export type SaveAssessmentCaseSetupInput = {
  id?: string | null;
  caseName: string;
  parentCarerName: string;
  childNames: string[];
  programStream: string;
  assessmentType: string;
  caseGoals: string[];
  caseStartDate: string | null;
  assessmentDate: string | null;
  reviewDueDate: string | null;
  courtDate: string | null;
  supportWorkerName: string;
  caseworkerName: string;
  supervisorName: string;
  legalContactName: string;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Sign in before managing assessment cases.");
  }

  return userId;
}

function buildCasePayload(userId: string, input: SaveAssessmentCaseSetupInput) {
  return {
    owner_id: userId,
    family_label: input.caseName.trim(),
    parent_carer_name: input.parentCarerName.trim(),
    child_names: input.childNames,
    program_stream: input.programStream.trim(),
    assessment_type: input.assessmentType.trim(),
    case_goals: input.caseGoals,
    case_start_date: input.caseStartDate,
    assessment_date: input.assessmentDate,
    review_due_date: input.reviewDueDate,
    court_date: input.courtDate,
    support_worker_name: input.supportWorkerName.trim(),
    caseworker_name: input.caseworkerName.trim(),
    supervisor_name: input.supervisorName.trim(),
    legal_contact_name: input.legalContactName.trim(),
    opened_date: input.caseStartDate ?? undefined,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchLatestAssessmentCaseSetup() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("reunification_cases")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as AssessmentCaseSetup | null;
}

export async function saveAssessmentCaseSetup(input: SaveAssessmentCaseSetupInput) {
  const userId = await getCurrentUserId();
  const payload = buildCasePayload(userId, input);

  if (input.id) {
    const { data, error } = await supabase
      .from("reunification_cases")
      .update(payload)
      .eq("id", input.id)
      .eq("owner_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as AssessmentCaseSetup;
  }

  const { data, error } = await supabase
    .from("reunification_cases")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AssessmentCaseSetup;
}
