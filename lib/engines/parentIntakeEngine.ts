import { supabase } from "../supabase/client";
import {
  PARENT_INTAKE_TOTAL_SECTIONS,
  getNextParentIntakeSection,
  getParentIntakeResumeSection,
  splitParentIntakeLines,
  type ParentIntakeAnswers,
  type ParentIntakeSectionKey,
} from "./parentIntakePolicy";

export type ParentIntakeDraftAnswers = Partial<
  Record<ParentIntakeSectionKey, ParentIntakeAnswers>
>;

export type ParentIntakeProgress = {
  caseId: string;
  draftAnswers: ParentIntakeDraftAnswers;
  completedSectionKeys: ParentIntakeSectionKey[];
  completedSections: number;
  totalSections: number;
  currentSection: ParentIntakeSectionKey;
  completedAt: string | null;
  lastSavedAt: string | null;
  reviewerState: "not_required" | "pending" | "approved" | "changes_required";
};

async function requireCurrentParent() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) throw new Error("Sign in to continue parent intake.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id,role,display_name,preferred_name,primary_phone,preferred_language_code,story_goal,strengths,support_notes,case_id",
    )
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile || profile.role !== "parent") {
    throw new Error("A SafeSteps parent profile is required for this intake.");
  }

  return { user: userData.user, profile };
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseDraftAnswers(value: unknown): ParentIntakeDraftAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([key, answers]) =>
      answers && typeof answers === "object" && !Array.isArray(answers)
        ? [[key, answers as ParentIntakeAnswers]]
        : [],
    ),
  ) as ParentIntakeDraftAnswers;
}

function fillMissingAnswers(
  draft: ParentIntakeDraftAnswers,
  sectionKey: ParentIntakeSectionKey,
  defaults: ParentIntakeAnswers,
) {
  draft[sectionKey] = { ...defaults, ...(draft[sectionKey] ?? {}) };
}

export async function ensureParentIntakeCase(): Promise<string> {
  await requireCurrentParent();
  const { data, error } = await supabase.rpc("ensure_parent_intake_case");
  if (error) throw new Error(error.message);
  if (!data) throw new Error("SafeSteps could not create or resume your parent intake case.");
  return String(data);
}

export async function loadParentIntakeProgress(
  requestedCaseId?: string,
): Promise<ParentIntakeProgress> {
  const { profile } = await requireCurrentParent();
  const caseId = requestedCaseId ?? (await ensureParentIntakeCase());

  const [intakeResult, caseResult] = await Promise.all([
    supabase
      .from("case_intake_status")
      .select(
        "case_id,draft_answers,completed_section_keys,completed_sections,total_sections,current_section,completed_at,last_saved_at,reviewer_state",
      )
      .eq("case_id", caseId)
      .maybeSingle(),
    supabase
      .from("reunification_cases")
      .select(
        "id,family_label,parent_carer_name,child_names,program_stream,assessment_type,case_goals,case_number",
      )
      .eq("id", caseId)
      .maybeSingle(),
  ]);

  if (intakeResult.error) throw new Error(intakeResult.error.message);
  if (caseResult.error) throw new Error(caseResult.error.message);
  if (!intakeResult.data || !caseResult.data) {
    throw new Error("Your SafeSteps intake record is not ready yet.");
  }

  const intake = intakeResult.data;
  const caseRecord = caseResult.data;
  const draftAnswers = parseDraftAnswers(intake.draft_answers);

  fillMissingAnswers(draftAnswers, "about_you", {
    displayName: asString(profile.display_name),
    preferredName: asString(profile.preferred_name),
    phone: asString(profile.primary_phone),
  });
  fillMissingAnswers(draftAnswers, "cultural_identity", {
    language: asString(profile.preferred_language_code),
  });
  fillMissingAnswers(draftAnswers, "family_household", {
    familyLabel: asString(caseRecord.family_label),
  });
  fillMissingAnswers(draftAnswers, "children", {
    childNames: asStringArray(caseRecord.child_names).join("\n"),
  });
  fillMissingAnswers(draftAnswers, "child_safety_court", {
    caseReference: asString(caseRecord.case_number),
  });
  fillMissingAnswers(draftAnswers, "current_strengths", {
    strengths: asString(profile.strengths),
  });
  fillMissingAnswers(draftAnswers, "support_needs", {
    supportNotes: asString(profile.support_notes),
  });
  fillMissingAnswers(draftAnswers, "goals_program", {
    storyGoal: asString(profile.story_goal),
    caseGoals: asStringArray(caseRecord.case_goals).join("\n"),
    programStream: asString(caseRecord.program_stream) || "Custom Program",
  });

  const completedSectionKeys = asStringArray(
    intake.completed_section_keys,
  ) as ParentIntakeSectionKey[];
  const currentSection = getParentIntakeResumeSection(
    completedSectionKeys,
    intake.current_section,
  );

  return {
    caseId,
    draftAnswers,
    completedSectionKeys,
    completedSections: Number(intake.completed_sections ?? 0),
    totalSections: Number(intake.total_sections ?? PARENT_INTAKE_TOTAL_SECTIONS),
    currentSection,
    completedAt: intake.completed_at ? String(intake.completed_at) : null,
    lastSavedAt: intake.last_saved_at ? String(intake.last_saved_at) : null,
    reviewerState: (intake.reviewer_state ?? "not_required") as ParentIntakeProgress["reviewerState"],
  };
}

async function persistCanonicalIntakeFields(
  caseId: string,
  sectionKey: ParentIntakeSectionKey,
  answers: ParentIntakeAnswers,
) {
  const { user } = await requireCurrentParent();
  const profileUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const caseUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };

  switch (sectionKey) {
    case "about_you": {
      const displayName = answers.displayName?.trim();
      if (displayName) {
        profileUpdate.display_name = displayName;
        caseUpdate.parent_carer_name = displayName;
      }
      profileUpdate.preferred_name = answers.preferredName?.trim() || null;
      profileUpdate.primary_phone = answers.phone?.trim() || null;
      break;
    }
    case "family_household":
      if (answers.familyLabel?.trim()) {
        caseUpdate.family_label = answers.familyLabel.trim();
      }
      break;
    case "children":
      if (answers.childNames?.trim()) {
        caseUpdate.child_names = splitParentIntakeLines(answers.childNames);
      }
      break;
    case "child_safety_court":
      caseUpdate.case_number = answers.caseReference?.trim() || null;
      caseUpdate.assessment_type = "Intake Assessment";
      break;
    case "current_strengths":
      if (answers.strengths?.trim()) profileUpdate.strengths = answers.strengths.trim();
      break;
    case "support_needs":
      if (answers.supportNotes?.trim()) {
        profileUpdate.support_notes = answers.supportNotes.trim();
      }
      break;
    case "goals_program":
      if (answers.storyGoal?.trim()) profileUpdate.story_goal = answers.storyGoal.trim();
      if (answers.caseGoals?.trim()) {
        caseUpdate.case_goals = splitParentIntakeLines(answers.caseGoals);
      }
      if (answers.programStream?.trim()) {
        caseUpdate.program_stream = answers.programStream.trim();
      }
      caseUpdate.assessment_type = "Intake Assessment";
      break;
    default:
      break;
  }

  if (Object.keys(profileUpdate).length > 1) {
    const { error } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", user.id);
    if (error) throw new Error(error.message);
  }

  if (Object.keys(caseUpdate).length > 1) {
    const { error } = await supabase
      .from("reunification_cases")
      .update(caseUpdate)
      .eq("id", caseId)
      .eq("owner_id", user.id);
    if (error) throw new Error(error.message);
  }
}

export async function saveParentIntakeStep(input: {
  caseId: string;
  sectionKey: ParentIntakeSectionKey;
  answers: ParentIntakeAnswers;
  complete: boolean;
  nextSectionKey?: ParentIntakeSectionKey;
}) {
  await persistCanonicalIntakeFields(input.caseId, input.sectionKey, input.answers);
  const nextSectionKey =
    input.nextSectionKey ?? getNextParentIntakeSection(input.sectionKey);

  const { error } = await supabase.rpc("save_parent_intake_step", {
    target_case_id: input.caseId,
    section_key: input.sectionKey,
    section_answers: input.answers,
    section_complete: input.complete,
    next_section_key: nextSectionKey,
  });

  if (error) throw new Error(error.message);
}

export async function completeParentIntake(caseId: string) {
  const { data, error } = await supabase.rpc("complete_parent_intake", {
    target_case_id: caseId,
  });
  if (error) throw new Error(error.message);
  return String(data);
}

export async function isParentIntakeComplete(): Promise<boolean> {
  const { profile } = await requireCurrentParent();
  if (!profile.case_id) return false;

  const { data, error } = await supabase
    .from("case_intake_status")
    .select("completed_at,completed_sections,total_sections")
    .eq("case_id", profile.case_id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(
    data?.completed_at &&
      Number(data.completed_sections) >=
        Number(data.total_sections ?? PARENT_INTAKE_TOTAL_SECTIONS),
  );
}
