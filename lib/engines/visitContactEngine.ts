import { fetchLatestAssessmentCaseSetup } from "./assessmentCaseEngine";
import { getSignedInUserId } from "../authSession";
import { supabase } from "../supabase/client";

export type VisitContactRecord = {
  id: string;
  case_id: string;
  parent_user_id: string | null;
  visit_date: string;
  visit_type: string | null;
  quality_score: number | null;
  incident_count: number;
  observation_summary: string | null;
  created_by: string;
  created_at: string;
};

export type SaveVisitContactInput = {
  caseId?: string | null;
  visitDate: string;
  visitType: string;
  qualityScore: number | null;
  incidentCount: number;
  observationSummary: string;
};

function validateVisitDate(value: string) {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Enter the visit date as YYYY-MM-DD.");
  }

  return trimmed;
}

function validateScore(value: number | null) {
  if (value === null) return null;
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error("Quality score must be between 0 and 100.");
  }

  return value;
}

function validateIncidentCount(value: number) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Incident count must be 0 or higher.");
  }

  return value;
}

async function resolveCaseId(inputCaseId?: string | null) {
  if (inputCaseId) return inputCaseId;

  const caseRecord = await fetchLatestAssessmentCaseSetup();

  if (!caseRecord) {
    throw new Error("Create a case setup before recording visit and contact notes.");
  }

  return caseRecord.id;
}

export async function fetchVisitContactRecords(caseId?: string | null) {
  const userId = await getSignedInUserId("loading visit and contact records");
  const resolvedCaseId = await resolveCaseId(caseId);

  const { data, error } = await supabase
    .from("case_visitations")
    .select("*")
    .eq("case_id", resolvedCaseId)
    .or(`parent_user_id.eq.${userId},created_by.eq.${userId}`)
    .order("visit_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as VisitContactRecord[];
}

export async function createVisitContactRecord(input: SaveVisitContactInput) {
  const userId = await getSignedInUserId("recording visit and contact notes");
  const caseId = await resolveCaseId(input.caseId);

  const payload = {
    case_id: caseId,
    parent_user_id: userId,
    visit_date: validateVisitDate(input.visitDate),
    visit_type: input.visitType.trim() || "contact_visit",
    quality_score: validateScore(input.qualityScore),
    incident_count: validateIncidentCount(input.incidentCount),
    observation_summary: input.observationSummary.trim() || null,
    created_by: userId,
  };

  const { data, error } = await supabase
    .from("case_visitations")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as VisitContactRecord;
}
