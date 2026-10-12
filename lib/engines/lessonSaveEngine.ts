import { supabase } from "../supabase/client";

export type DailyLessonRecord = {
  program_id: string;
  program_title: string;
  month_number: number;
  month_topic: string;
  week_number: number;
  week_sub_topic: string;
  day_number: number;
  lesson_title: string;
  start_reflection: string;
  confidence_before: number;
  knowledge_checkpoint_done: boolean;
  scenario_checkpoint_done: boolean;
  practical_activity: string;
  end_reflection: string;
  confidence_after: number;
  completed: boolean;
};

export async function saveDailyLessonRecord(record: DailyLessonRecord) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Parent must be signed in before saving lesson progress.");
  }

  const sharedMetadata = {
    program_id: record.program_id,
    program_title: record.program_title,
    month_number: record.month_number,
    month_topic: record.month_topic,
    week_number: record.week_number,
    week_in_month: record.week_number,
    week_sub_topic: record.week_sub_topic,
    day_number: record.day_number,
    lesson_title: record.lesson_title,
    confidence_before: record.confidence_before,
    confidence_after: record.confidence_after,
    knowledge_checkpoint_done: record.knowledge_checkpoint_done,
    scenario_checkpoint_done: record.scenario_checkpoint_done,
    practical_activity: record.practical_activity,
    completed: record.completed,
  };

  const { error: reflectionError } = await supabase
    .from("program_reflections")
    .insert([
      {
        owner_id: userId,
        program_id: record.program_id,
        program_title: record.program_title,
        reflection_type: "daily_meaning",
        month_number: record.month_number,
        month_topic: record.month_topic,
        week_number: record.week_number,
        week_in_month: record.week_number,
        day_number: record.day_number,
        lesson_title: record.lesson_title,
        prompt: "What does today's lesson mean to you?",
        response: record.start_reflection,
        metadata: sharedMetadata,
      },
      {
        owner_id: userId,
        program_id: record.program_id,
        program_title: record.program_title,
        reflection_type: "end_reflection",
        month_number: record.month_number,
        month_topic: record.month_topic,
        week_number: record.week_number,
        week_in_month: record.week_number,
        day_number: record.day_number,
        lesson_title: record.lesson_title,
        prompt: "What did you learn from today's lesson?",
        response: record.end_reflection,
        metadata: sharedMetadata,
      },
    ]);

  if (reflectionError) {
    throw new Error(reflectionError.message);
  }

  const progressEvents = [
    {
      owner_id: userId,
      event_type: "knowledge_checkpoint_completed",
      label: `Knowledge checkpoint completed: ${record.lesson_title}`,
      metadata: sharedMetadata,
    },
    {
      owner_id: userId,
      event_type: "scenario_checkpoint_completed",
      label: `Scenario checkpoint completed: ${record.lesson_title}`,
      metadata: sharedMetadata,
    },
    {
      owner_id: userId,
      event_type: "practical_activity_recorded",
      label: `Practical activity recorded: ${record.lesson_title}`,
      metadata: sharedMetadata,
    },
    {
      owner_id: userId,
      event_type: "daily_lesson_completed",
      label: `Daily lesson completed: ${record.lesson_title}`,
      metadata: sharedMetadata,
    },
  ];

  const { data, error } = await supabase
    .from("progress_events")
    .insert(progressEvents)
    .select()
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0] ?? { id: "saved" };
}