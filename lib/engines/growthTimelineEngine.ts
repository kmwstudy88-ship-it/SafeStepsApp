import { supabase } from "../supabase/client";
import { getOptionalUserId } from "../authSession";

const DAILY_LESSON_RECORD_LIMIT = 1000;

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
    .select("id,owner_id,event_type,label,metadata,created_at")
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
    .order("created_at", { ascending: false })
    .limit(DAILY_LESSON_RECORD_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SavedDailyLessonRecord[]).reverse();
}

export function calculateGrowthStats(records: SavedDailyLessonRecord[]): GrowthStats {
  let completedLessons = 0;
  let practicalActivities = 0;
  let knowledgeCheckpoints = 0;
  let scenarioCheckpoints = 0;
  let beforeTotal = 0;
  let beforeCount = 0;
  let afterTotal = 0;
  let afterCount = 0;

  records.forEach((record) => {
    switch (record.event_type) {
      case "daily_lesson_completed": {
        completedLessons += 1;

        const confidenceBefore = Number(record.metadata.confidence_before ?? 0);
        if (confidenceBefore > 0) {
          beforeTotal += confidenceBefore;
          beforeCount += 1;
        }

        const confidenceAfter = Number(record.metadata.confidence_after ?? 0);
        if (confidenceAfter > 0) {
          afterTotal += confidenceAfter;
          afterCount += 1;
        }
        break;
      }
      case "practical_activity_recorded":
        practicalActivities += 1;
        break;
      case "knowledge_checkpoint_completed":
        knowledgeCheckpoints += 1;
        break;
      case "scenario_checkpoint_completed":
        scenarioCheckpoints += 1;
        break;
      default:
        break;
    }
  });

  if (completedLessons === 0) {
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

  const averageConfidenceBefore = beforeCount === 0 ? 0 : beforeTotal / beforeCount;
  const averageConfidenceAfter = afterCount === 0 ? 0 : afterTotal / afterCount;

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
