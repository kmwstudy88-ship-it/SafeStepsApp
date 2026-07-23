import { supabase } from "../supabase/client";
import { getOptionalUserId, getSignedInUserId } from "../authSession";
import { getParentChallengeById } from "../data/safestepsParentChallenges";
import { getScenarioModuleById } from "../data/scenarioModules";
import { buildScenarioTaskDescription } from "./scenarioActivityEngine";

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

export type TaskCompletionRequirement = {
  canComplete: boolean;
  reason?: string;
  linkedEvidenceCount: number;
};

function isParentChallengeTask(task: Pick<UserTask, "category" | "related_lesson_id">) {
  return task.category.startsWith("parent_challenge:") || task.related_lesson_id?.startsWith("challenge:");
}

function isScenarioTask(task: Pick<UserTask, "category" | "related_lesson_id">) {
  return task.category.startsWith("scenario_activity:") || task.related_lesson_id?.startsWith("scenario:");
}

function challengeIdFromTask(task: Pick<UserTask, "related_lesson_id">) {
  return task.related_lesson_id?.startsWith("challenge:")
    ? task.related_lesson_id.replace("challenge:", "")
    : null;
}

export function evaluateTaskCompletionRequirement(
  task: Pick<UserTask, "evidence_required" | "category" | "related_lesson_id">,
  linkedEvidenceCount: number,
): TaskCompletionRequirement {
  if (!task.evidence_required || (!isParentChallengeTask(task) && !isScenarioTask(task))) {
    return { canComplete: true, linkedEvidenceCount };
  }

  const missingEvidenceReason = isParentChallengeTask(task)
    ? "Add or upload evidence for this challenge before marking it complete."
    : "Add or upload evidence for this activity before marking it complete.";

  return {
    canComplete: linkedEvidenceCount > 0,
    linkedEvidenceCount,
    reason:
      linkedEvidenceCount > 0
        ? undefined
        : missingEvidenceReason,
  };
}

function evidenceLinkFilter(task: Pick<UserTask, "id" | "title" | "related_lesson_id">) {
  const challengeId = challengeIdFromTask(task);
  const filters = [
    `structured_data->>task_id.eq.${task.id}`,
    `structured_data->>related_task_id.eq.${task.id}`,
  ];

  if (challengeId) {
    filters.push(`structured_data->>challenge_id.eq.${challengeId}`);
  }

  if (task.related_lesson_id?.startsWith("scenario:")) {
    filters.push(`structured_data->>scenario_module_id.eq.${task.related_lesson_id.replace("scenario:", "")}`);
  }

  return filters.join(",");
}

export function buildParentChallengeTaskInput(challengeId: string): CreateUserTaskInput {
  const challenge = getParentChallengeById(challengeId);
  if (!challenge) {
    throw new Error("Parent challenge not found.");
  }

  return {
    title: challenge.displayTitle,
    description: [
      challenge.purpose,
      "",
      challenge.quickQuestionBeforeChallenge,
      "",
      "Challenge steps:",
      ...challenge.challengeSteps.map((step, index) => `${index + 1}. ${step}`),
      "",
      "Reflection questions:",
      ...challenge.reflectionQuestions.map((question) => `- ${question}`),
      "",
      "Completion checklist:",
      ...challenge.completionChecklist.map((item) => `- ${item}`),
      "",
      `Evidence task: ${challenge.evidenceTask}`,
      "",
      `Safety note: ${challenge.safetyNote}`,
    ].join("\n"),
    priority: challenge.challengeType === "daily" ? "medium" : "low",
    category: `parent_challenge:${challenge.category}`,
    evidence_required: true,
    related_lesson_id: `challenge:${challenge.id}`,
  };
}

export async function fetchParentChallengeTask(challengeId: string) {
  const userId = await getOptionalUserId();
  if (!userId) return null;

  const challenge = getParentChallengeById(challengeId);
  if (!challenge) return null;

  const { data, error } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("owner_id", userId)
    .eq("related_lesson_id", `challenge:${challenge.id}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) return data as UserTask;

  const { data: legacyData, error: legacyError } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("owner_id", userId)
    .eq("title", challenge.displayTitle)
    .eq("category", `parent_challenge:${challenge.category}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (legacyError) {
    throw new Error(legacyError.message);
  }

  return (legacyData as UserTask | null) ?? null;
}

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

export async function createUserTaskFromParentChallenge(challengeId: string) {
  const existing = await fetchParentChallengeTask(challengeId);
  if (existing) return existing;

  return createUserTask(buildParentChallengeTaskInput(challengeId));
}

export function buildScenarioActivityTaskInput(moduleId: string): CreateUserTaskInput {
  const module = getScenarioModuleById(moduleId);
  if (!module) {
    throw new Error("Scenario module not found.");
  }

  return {
    title: module.title,
    description: buildScenarioTaskDescription(module),
    priority: module.scenario.risk_level === "high" ? "high" : "medium",
    category: `scenario_activity:${module.category}`,
    evidence_required: true,
    related_lesson_id: `scenario:${module.module_id}`,
  };
}

export async function getTaskCompletionRequirement(task: UserTask): Promise<TaskCompletionRequirement> {
  if (!task.evidence_required || (!isParentChallengeTask(task) && !isScenarioTask(task))) {
    return { canComplete: true, linkedEvidenceCount: 0 };
  }

  const userId = await getSignedInUserId("checking task evidence");
  const { count, error } = await supabase
    .from("evidence_items")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .or(evidenceLinkFilter(task));

  if (error) {
    throw new Error(error.message);
  }

  return evaluateTaskCompletionRequirement(task, count ?? 0);
}

export async function completeUserTask(task: UserTask) {
  const userId = await getSignedInUserId("completing tasks");
  const requirement = await getTaskCompletionRequirement(task);

  if (!requirement.canComplete) {
    throw new Error(requirement.reason ?? "Task completion requirements are not met.");
  }

  const completedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("user_tasks")
    .update({
      status: "completed",
      completed_at: completedAt,
    })
    .eq("id", task.id)
    .eq("owner_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "task_completed",
    label: `Task completed: ${task.title}`,
    metadata: {
      task_id: task.id,
      task_title: task.title,
      linked_evidence_count: requirement.linkedEvidenceCount,
      completed_at: completedAt,
    },
  });

  return data as UserTask;
}

export async function completeUserTasks(tasks: UserTask[]) {
  const openTasks = tasks.filter((task) => task.status !== "completed");

  if (openTasks.length === 0) {
    return { updatedCount: 0, skippedCount: 0, skippedTitles: [] };
  }

  const userId = await getSignedInUserId("completing tasks");
  const requirements = await Promise.all(
    openTasks.map(async (task) => ({
      task,
      requirement: await getTaskCompletionRequirement(task),
    })),
  );
  const completableTasks = requirements.filter((item) => item.requirement.canComplete).map((item) => item.task);
  const skippedTasks = requirements.filter((item) => !item.requirement.canComplete).map((item) => item.task);

  if (completableTasks.length === 0) {
    return {
      updatedCount: 0,
      skippedCount: skippedTasks.length,
      skippedTitles: skippedTasks.map((task) => task.title),
    };
  }

  const completedAt = new Date().toISOString();
  const taskIds = completableTasks.map((task) => task.id);

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
    label: `${completableTasks.length} tasks completed`,
    metadata: {
      task_ids: taskIds,
      task_titles: completableTasks.map((task) => task.title),
      skipped_task_titles: skippedTasks.map((task) => task.title),
      completed_at: completedAt,
    },
  });

  return {
    updatedCount: completableTasks.length,
    skippedCount: skippedTasks.length,
    skippedTitles: skippedTasks.map((task) => task.title),
  };
}
