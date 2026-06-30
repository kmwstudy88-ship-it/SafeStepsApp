import { supabase } from "../supabase/client";
import { getOptionalUserId } from "../authSession";

export type SavedDailyLessonRecord = {
  id: string;
  owner_id: string;
  event_type: string;
  label: string;
  metadata: {
    program_id?: string;
    program_title?: string;
    month_number?: number;
    month_topic?: string;
    week_number?: number;
    week_in_month?: number;
    week_sub_topic?: string;
    day_number?: number;
    lesson_title?: string;
    confidence_before?: number;
    confidence_after?: number;
    practical_activity?: string;
    start_reflection?: string;
    end_reflection?: string;
    [key: string]: unknown;
  };
  created_at: string;
};

export type GrowthStats = {
  totalLessonsSaved: number;
  completedLessons: number;
  practicalActivities: number;
  knowledgeCheckpoints: number;
  scenarioCheckpoints: number;
  averageConfidenceBefore: number;
  averageConfidenceAfter: number;
  confidenceChange: number;
};

export async function fetchDailyLessonRecords() {
  const userId = await getOptionalUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("progress_events")
    .select("*")
    .eq("owner_id", userId)
    .in("event_type", [
      "daily_lesson_completed",
      "knowledge_checkpoint_completed",
      "scenario_checkpoint_completed",
      "practical_activity_recorded",
      "month_reflection_saved",
      "week_reflection_saved",
      "tasks_bulk_added",
      "tasks_bulk_skipped",
      "tasks_bulk_completed",
      "tasks_bulk_status_updated",
      "evidence_bulk_added",
      "evidence_bulk_skipped",
      "evidence_bulk_status_updated",
      "program_week_bulk_added",
      "daily_home_evidence_added",
      "certificate_issued",
      "assessment_submitted",
    ])
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SavedDailyLessonRecord[];
}

export function calculateGrowthStats(records: SavedDailyLessonRecord[]): GrowthStats {
  const completedLessonEvents = records.filter(
    (record) => record.event_type === "daily_lesson_completed"
  );

  const completedLessons = completedLessonEvents.length;

  const practicalActivities = records.filter(
    (record) => record.event_type === "practical_activity_recorded"
  ).length;

  const knowledgeCheckpoints = records.filter(
    (record) => record.event_type === "knowledge_checkpoint_completed"
  ).length;

  const scenarioCheckpoints = records.filter(
    (record) => record.event_type === "scenario_checkpoint_completed"
  ).length;

  if (completedLessonEvents.length === 0) {
    return {
      totalLessonsSaved: records.length,
      completedLessons,
      practicalActivities,
      knowledgeCheckpoints,
      scenarioCheckpoints,
      averageConfidenceBefore: 0,
      averageConfidenceAfter: 0,
      confidenceChange: 0,
    };
  }

  const beforeValues = completedLessonEvents
    .map((record) => Number(record.metadata.confidence_before ?? 0))
    .filter((value) => value > 0);

  const afterValues = completedLessonEvents
    .map((record) => Number(record.metadata.confidence_after ?? 0))
    .filter((value) => value > 0);

  const averageConfidenceBefore =
    beforeValues.length === 0
      ? 0
      : beforeValues.reduce((total, value) => total + value, 0) /
        beforeValues.length;

  const averageConfidenceAfter =
    afterValues.length === 0
      ? 0
      : afterValues.reduce((total, value) => total + value, 0) /
        afterValues.length;

  return {
    totalLessonsSaved: records.length,
    completedLessons,
    practicalActivities,
    knowledgeCheckpoints,
    scenarioCheckpoints,
    averageConfidenceBefore,
    averageConfidenceAfter,
    confidenceChange: averageConfidenceAfter - averageConfidenceBefore,
  };
}
