import { supabase } from "../supabase";
import {
  evaluateContactProgression,
  type EvaluateContactProgressionInput,
  type EvaluateContactProgressionResult,
  type StageGatedAssessmentRecordSignal,
  type StageGatedContactSessionSignal,
  type StageGatedContactStage,
} from "./intensiveReunificationEngine";

type RiskFlag = {
  code: string;
  severity: "green" | "amber" | "red" | "critical";
};

type SkillEvidence = Partial<
  Record<"co_regulation" | "reflective_listening" | "boundary_respect" | "repair_attempts", boolean>
>;

type ContactSessionRow = {
  id: string;
  stage: StageGatedContactStage;
  session_date: string;
  duration_minutes: number | null;
  child_distress_score: number | null;
  child_comfort_score: number | null;
  parent_regulation_score: number | null;
  facilitator_intervention_count: number | null;
  facilitator_unsafe_to_escalate: boolean | null;
  risk_flags: unknown;
  skill_evidence: unknown;
};

type AssessmentRecordRow = {
  id: string;
  lesson_id: string | null;
  created_at: string;
  score: number | string | null;
  risk_flags: unknown;
  validated_by: string | null;
  evidence_payload: unknown;
};

type ReunificationOverrideRow = {
  override_type: "hold" | "force_escalation" | "force_regression";
  target_stage: StageGatedContactStage | null;
};

export type ReunificationEvaluationLoadOptions = {
  caseId: string;
  parentProfileId: string;
  requiredLessonIds?: string[];
  sessionWindow?: number;
  lessonWindow?: number;
};

export type ReunificationEvaluationSnapshot = {
  input: EvaluateContactProgressionInput;
  result: EvaluateContactProgressionResult;
};

export type ReunificationRecommendationRecord = {
  id: string;
  case_id: string;
  parent_id: string;
  facilitator_id: string | null;
  current_stage: StageGatedContactStage;
  recommended_stage: StageGatedContactStage;
  risk_level: EvaluateContactProgressionResult["riskLevel"] | null;
  reasons: string[];
  hard_blocks: string[] | null;
  required_interventions: string[] | null;
  created_at: string;
};

export type ReunificationOverrideRecord = {
  id: string;
  case_id: string;
  parent_id: string;
  caseworker_id: string;
  override_type: ReunificationOverrideType;
  target_stage: StageGatedContactStage | null;
  reason: string;
  created_at: string;
};

export type ReunificationOverrideType = "hold" | "force_escalation" | "force_regression";

export type ContactSessionLogInput = {
  caseId: string;
  parentProfileId: string;
  facilitatorProfileId?: string | null;
  stage: StageGatedContactStage;
  sessionDate: string;
  durationMinutes: number;
  childComfortScore?: number | null;
  childDistressScore?: number | null;
  parentRegulationScore?: number | null;
  facilitatorInterventionCount?: number;
  facilitatorUnsafeToEscalate?: boolean;
  notes?: string | null;
  riskFlags?: RiskFlag[];
  skillEvidence?: SkillEvidence;
};

export function resolveCurrentContactStage(
  latestOverride: ReunificationOverrideRow | null | undefined,
  contactSessions: Array<Pick<ContactSessionRow, "stage" | "session_date">>,
  fallback: StageGatedContactStage = "supervised",
): StageGatedContactStage {
  if (latestOverride?.target_stage) return latestOverride.target_stage;
  return newestFirst(contactSessions)[0]?.stage ?? fallback;
}

function asRiskFlags(value: unknown): RiskFlag[] {
  if (!Array.isArray(value)) return [];
  return value.filter((flag): flag is RiskFlag => {
    if (!flag || typeof flag !== "object") return false;
    const maybeFlag = flag as Partial<RiskFlag>;
    return (
      typeof maybeFlag.code === "string" &&
      ["green", "amber", "red", "critical"].includes(String(maybeFlag.severity))
    );
  });
}

function asSkillEvidence(value: unknown): SkillEvidence {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  return {
    co_regulation: source.co_regulation === true,
    reflective_listening: source.reflective_listening === true,
    boundary_respect: source.boundary_respect === true,
    repair_attempts: source.repair_attempts === true,
  };
}

function numberOrDefault(value: number | string | null | undefined, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function newestFirst<T extends { session_date?: string; occurredAt?: string; createdAt?: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    String(right.session_date ?? right.occurredAt ?? right.createdAt).localeCompare(
      String(left.session_date ?? left.occurredAt ?? left.createdAt),
    ),
  );
}

function mapContactSession(row: ContactSessionRow): StageGatedContactSessionSignal {
  return {
    id: row.id,
    stage: row.stage,
    occurredAt: row.session_date,
    durationMinutes: numberOrDefault(row.duration_minutes, 0),
    childDistressScore: numberOrDefault(row.child_distress_score, 1),
    childComfortScore: numberOrDefault(row.child_comfort_score, 1),
    emotionalRegulationScore: numberOrDefault(row.parent_regulation_score, 1),
    facilitatorInterventionCount: numberOrDefault(row.facilitator_intervention_count, 0),
    riskFlags: asRiskFlags(row.risk_flags),
    facilitatorUnsafeToEscalate: row.facilitator_unsafe_to_escalate === true,
    skillEvidence: asSkillEvidence(row.skill_evidence),
  };
}

function mapAssessmentRecord(row: AssessmentRecordRow): StageGatedAssessmentRecordSignal {
  return {
    id: row.id,
    lessonId: row.lesson_id ?? "",
    createdAt: row.created_at,
    score: row.score == null ? null : numberOrDefault(row.score, 0),
    riskFlags: asRiskFlags(row.risk_flags),
    validatedBy: row.validated_by,
    skillEvidence: asSkillEvidence(row.evidence_payload),
  };
}

export async function fetchReunificationEvaluationInput(
  options: ReunificationEvaluationLoadOptions,
): Promise<EvaluateContactProgressionInput> {
  const [sessionsResponse, assessmentResponse, overrideResponse] = await Promise.all([
    supabase
      .from("contact_sessions")
      .select(
        "id,stage,session_date,duration_minutes,child_distress_score,child_comfort_score,parent_regulation_score,facilitator_intervention_count,facilitator_unsafe_to_escalate,risk_flags,skill_evidence",
      )
      .eq("case_id", options.caseId)
      .eq("parent_id", options.parentProfileId)
      .order("session_date", { ascending: false })
      .limit(options.sessionWindow ?? 6),
    supabase
      .from("assessment_records")
      .select("id,lesson_id,created_at,score,risk_flags,validated_by,evidence_payload")
      .eq("case_id", options.caseId)
      .eq("user_id", options.parentProfileId)
      .order("created_at", { ascending: false })
      .limit(options.lessonWindow ?? 10),
    supabase
      .from("reunification_overrides")
      .select("override_type,target_stage")
      .eq("case_id", options.caseId)
      .eq("parent_id", options.parentProfileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (sessionsResponse.error) throw sessionsResponse.error;
  if (assessmentResponse.error) throw assessmentResponse.error;
  if (overrideResponse.error) throw overrideResponse.error;

  const latestOverride = overrideResponse.data as ReunificationOverrideRow | null;
  const contactSessionRows = (sessionsResponse.data ?? []) as ContactSessionRow[];

  return {
    parentProfileId: options.parentProfileId,
    caseId: options.caseId,
    currentStage: resolveCurrentContactStage(latestOverride, contactSessionRows),
    contactSessions: contactSessionRows.map(mapContactSession),
    assessmentRecords: ((assessmentResponse.data ?? []) as AssessmentRecordRow[]).map(mapAssessmentRecord),
    requiredLessonIds: options.requiredLessonIds,
    sessionWindow: options.sessionWindow,
    lessonWindow: options.lessonWindow,
    caseworkerManualHold: latestOverride?.override_type === "hold",
  };
}

export async function saveContactSessionLog(input: ContactSessionLogInput) {
  const { data, error } = await supabase
    .from("contact_sessions")
    .insert({
      case_id: input.caseId,
      parent_id: input.parentProfileId,
      facilitator_id: input.facilitatorProfileId ?? null,
      stage: input.stage,
      session_date: input.sessionDate,
      duration_minutes: input.durationMinutes,
      child_comfort_score: input.childComfortScore ?? null,
      child_distress_score: input.childDistressScore ?? null,
      parent_regulation_score: input.parentRegulationScore ?? null,
      facilitator_intervention_count: input.facilitatorInterventionCount ?? 0,
      facilitator_unsafe_to_escalate: input.facilitatorUnsafeToEscalate ?? false,
      notes: input.notes ?? null,
      risk_flags: input.riskFlags ?? [],
      skill_evidence: input.skillEvidence ?? {},
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function saveReunificationRecommendation(input: {
  caseId: string;
  parentProfileId: string;
  facilitatorProfileId?: string | null;
  result: EvaluateContactProgressionResult;
}) {
  const { data, error } = await supabase
    .from("reunification_recommendations")
    .insert({
      case_id: input.caseId,
      parent_id: input.parentProfileId,
      facilitator_id: input.facilitatorProfileId ?? null,
      current_stage: input.result.currentStage,
      recommended_stage: input.result.recommendedStage,
      risk_level: input.result.riskLevel,
      reasons: input.result.reasons,
      hard_blocks: input.result.hardBlocks,
      required_interventions: input.result.requiredInterventions,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function fetchLatestReunificationRecommendation(input: {
  caseId: string;
  parentProfileId: string;
}): Promise<ReunificationRecommendationRecord | null> {
  const { data, error } = await supabase
    .from("reunification_recommendations")
    .select(
      "id,case_id,parent_id,facilitator_id,current_stage,recommended_stage,risk_level,reasons,hard_blocks,required_interventions,created_at",
    )
    .eq("case_id", input.caseId)
    .eq("parent_id", input.parentProfileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as ReunificationRecommendationRecord | null;
}

export async function fetchLatestReunificationOverride(input: {
  caseId: string;
  parentProfileId: string;
}): Promise<ReunificationOverrideRecord | null> {
  const { data, error } = await supabase
    .from("reunification_overrides")
    .select("id,case_id,parent_id,caseworker_id,override_type,target_stage,reason,created_at")
    .eq("case_id", input.caseId)
    .eq("parent_id", input.parentProfileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as ReunificationOverrideRecord | null;
}

export async function saveReunificationOverride(input: {
  caseId: string;
  parentProfileId: string;
  caseworkerProfileId: string;
  overrideType: ReunificationOverrideType;
  targetStage?: StageGatedContactStage | null;
  reason: string;
}) {
  const { data, error } = await supabase
    .from("reunification_overrides")
    .insert({
      case_id: input.caseId,
      parent_id: input.parentProfileId,
      caseworker_id: input.caseworkerProfileId,
      override_type: input.overrideType,
      target_stage: input.targetStage ?? null,
      reason: input.reason,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function evaluateAndSaveReunificationRecommendation(input: ReunificationEvaluationLoadOptions & {
  facilitatorProfileId?: string | null;
}): Promise<ReunificationEvaluationSnapshot> {
  const evaluationInput = await fetchReunificationEvaluationInput(input);
  const result = evaluateContactProgression(evaluationInput);
  await saveReunificationRecommendation({
    caseId: input.caseId,
    parentProfileId: input.parentProfileId,
    facilitatorProfileId: input.facilitatorProfileId,
    result,
  });

  return {
    input: evaluationInput,
    result,
  };
}
