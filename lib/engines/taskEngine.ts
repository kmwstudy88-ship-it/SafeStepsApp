import { supabase } from "../supabase/client";
import { getOptionalUserId, getSignedInUserId } from "../authSession";

export type UserTask = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  status: "ready" | "in_progress" | "completed";
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  priority: "low" | "medium" | "high";
  related_lesson_id: string | null;
  evidence_required: boolean;
  category: string;
};

export type CreateUserTaskInput = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  category?: string;
  evidence_required?: boolean;
  related_lesson_id?: string | null;
  due_at?: string | null;
};

export async function fetchUserTasks() {
  const userId = await getOptionalUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UserTask[];
}

export async function createUserTask(input: CreateUserTaskInput) {
  const userId = await getSignedInUserId("creating tasks");

  const { data, error } = await supabase
    .from("user_tasks")
    .insert({
      owner_id: userId,
      title: input.title,
      description: input.description ?? "",
      status: "ready",
      due_at: input.due_at ?? null,
      priority: input.priority ?? "medium",
      related_lesson_id: input.related_lesson_id ?? null,
      evidence_required: input.evidence_required ?? false,
      category: input.category ?? "general",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "task_created",
    label: `Task created: ${input.title}`,
    metadata: {
      title: input.title,
      category: input.category ?? "general",
      evidence_required: input.evidence_required ?? false,
      priority: input.priority ?? "medium",
    },
  });

  return data as UserTask;
}

export async function completeUserTask(taskId: string, taskTitle: string) {
  const userId = await getSignedInUserId("completing tasks");

  const completedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("user_tasks")
    .update({
      status: "completed",
      completed_at: completedAt,
    })
    .eq("id", taskId)
    .eq("owner_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "task_completed",
    label: `Task completed: ${taskTitle}`,
    metadata: {
      task_id: taskId,
      task_title: taskTitle,
      completed_at: completedAt,
    },
  });

  return data as UserTask;
}

export async function completeUserTasks(tasks: Pick<UserTask, "id" | "title" | "status">[]) {
  const openTasks = tasks.filter((task) => task.status !== "completed");

  if (openTasks.length === 0) {
    return { updatedCount: 0 };
  }

  const userId = await getSignedInUserId("completing tasks");

  const completedAt = new Date().toISOString();
  const taskIds = openTasks.map((task) => task.id);

  const { error } = await supabase
    .from("user_tasks")
    .update({
      status: "completed",
      completed_at: completedAt,
    })
    .eq("owner_id", userId)
    .in("id", taskIds);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "tasks_bulk_completed",
    label: `${openTasks.length} tasks completed`,
    metadata: {
      task_ids: taskIds,
      task_titles: openTasks.map((task) => task.title),
      completed_at: completedAt,
    },
  });

  return { updatedCount: openTasks.length };
}
