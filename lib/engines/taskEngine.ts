import {
  buildParentChallengeTask,
  completeDailyChallengeTask,
  getStoredChallengeTasks,
  pauseChallengeForBreak,
  resumeChallengeFromBreak,
  startDailyChallengeTask,
  verifyChallengeCompletionRequirement,
  type ChallengeTaskRecord,
} from "../dailyChallengesFlow";
import { getChallengeTrack } from "../data/familyChallenges";
import { getParentChallengeById } from "../data/safestepsParentChallenges";
import { cacheData, getCachedData } from "../offline/offlineSyncService";

export type UserTask = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  status: "ready" | "in_progress" | "paused_break" | "completed";
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  priority: "low" | "medium" | "high";
  related_lesson_id: string | null;
  evidence_required: boolean;
  category: string;
  track?: "personal" | "family";
  paused_at?: string | null;
  break_reason?: string | null;
  child_perspective_note?: string | null;
  shared_with_child?: boolean;
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
  return (
    task.category.startsWith("parent_challenge:") ||
    Boolean(task.related_lesson_id?.startsWith("challenge:"))
  );
}

function isScenarioTask(task: Pick<UserTask, "category" | "related_lesson_id">) {
  return (
    task.category.startsWith("scenario_activity:") ||
    Boolean(task.related_lesson_id?.startsWith("scenario:"))
  );
}

export function challengeIdFromTask(task: Pick<UserTask, "related_lesson_id">): string | null {
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
    reason: linkedEvidenceCount > 0 ? undefined : missingEvidenceReason,
  };
}

export function buildParentChallengeTaskInput(challengeId: string): CreateUserTaskInput {
  const challenge = getParentChallengeById(challengeId);
  if (!challenge) {
    throw new Error("Parent challenge not found.");
  }

  const built = buildParentChallengeTask(challengeId);
  return {
    title: built.title,
    description: built.description,
    priority: built.priority,
    category: built.category,
    evidence_required: built.evidence_required,
    related_lesson_id: built.related_lesson_id,
    due_at: null,
  };
}

function toUserTask(record: ChallengeTaskRecord): UserTask {
  return {
    id: record.id,
    owner_id: record.owner_id,
    title: record.title,
    description: record.description,
    status: record.status,
    due_at: null,
    completed_at: record.completed_at,
    created_at: record.created_at,
    priority: record.priority,
    related_lesson_id: record.related_lesson_id,
    evidence_required: record.evidence_required,
    category: record.category,
    track: record.track,
    paused_at: record.paused_at ?? null,
    break_reason: record.break_reason ?? null,
    child_perspective_note: record.child_perspective_note ?? null,
    shared_with_child: record.shared_with_child ?? false,
  };
}

export async function fetchParentChallengeTask(
  challengeId: string,
  userId = "local-parent",
): Promise<UserTask | null> {
  const challenge = getParentChallengeById(challengeId);
  if (!challenge) return null;

  const tasks = await getStoredChallengeTasks(userId);
  const match = tasks.find(
    (task) =>
      task.challenge_id === challenge.id ||
      task.related_lesson_id === `challenge:${challenge.id}`,
  );

  return match ? toUserTask(match) : null;
}

export async function fetchUserTasks(userId = "local-parent"): Promise<UserTask[]> {
  const challengeTasks = await getStoredChallengeTasks(userId);
  const customTasks = (await getCachedData<UserTask[]>(`custom_user_tasks_${userId}`)) ?? [];

  const merged = new Map<string, UserTask>();
  for (const task of challengeTasks) {
    merged.set(task.id, toUserTask(task));
  }
  for (const task of customTasks) {
    if (!merged.has(task.id)) {
      merged.set(task.id, task);
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createUserTask(
  input: CreateUserTaskInput,
  userId = "local-parent",
): Promise<UserTask> {
  const challengeId = input.related_lesson_id?.startsWith("challenge:")
    ? input.related_lesson_id.replace("challenge:", "")
    : null;

  if (challengeId) {
    const started = await startDailyChallengeTask(challengeId, userId);
    return toUserTask(started);
  }

  const created: UserTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    owner_id: userId,
    title: input.title,
    description: input.description ?? "",
    status: "ready",
    due_at: input.due_at ?? null,
    completed_at: null,
    created_at: new Date().toISOString(),
    priority: input.priority ?? "medium",
    related_lesson_id: input.related_lesson_id ?? null,
    evidence_required: input.evidence_required ?? false,
    category: input.category ?? "general",
  };

  const existing = (await getCachedData<UserTask[]>(`custom_user_tasks_${userId}`)) ?? [];
  await cacheData(`custom_user_tasks_${userId}`, [created, ...existing]);
  return created;
}

export async function createUserTaskFromParentChallenge(
  challengeId: string,
  userId = "local-parent",
): Promise<UserTask> {
  const existing = await fetchParentChallengeTask(challengeId, userId);
  if (existing) return existing;

  const challenge = getParentChallengeById(challengeId);
  if (!challenge) {
    throw new Error("Parent challenge not found.");
  }

  const started = await startDailyChallengeTask(challenge.id, userId);
  const task = toUserTask(started);
  task.track = getChallengeTrack(challenge);
  return task;
}

export async function pauseUserChallengeTask(
  challengeId: string,
  breakReason?: string,
  userId = "local-parent",
): Promise<UserTask> {
  const paused = await pauseChallengeForBreak(challengeId, breakReason, userId);
  return toUserTask(paused);
}

export async function resumeUserChallengeTask(
  challengeId: string,
  userId = "local-parent",
): Promise<UserTask> {
  const resumed = await resumeChallengeFromBreak(challengeId, userId);
  return toUserTask(resumed);
}

export async function getTaskCompletionRequirement(
  task: UserTask,
  userId = "local-parent",
): Promise<TaskCompletionRequirement> {
  if (!task.evidence_required || (!isParentChallengeTask(task) && !isScenarioTask(task))) {
    return { canComplete: true, linkedEvidenceCount: 0 };
  }

  const challengeId = challengeIdFromTask(task) ?? "";
  const verified = await verifyChallengeCompletionRequirement(
    {
      id: task.id,
      challenge_id: challengeId,
      related_lesson_id: task.related_lesson_id ?? "",
      evidence_required: task.evidence_required,
    },
    userId,
  );

  return evaluateTaskCompletionRequirement(task, verified.linkedEvidenceCount);
}

export async function completeUserTask(
  task: UserTask,
  userId = "local-parent",
): Promise<UserTask> {
  const challengeId = challengeIdFromTask(task);
  if (challengeId) {
    const completed = await completeDailyChallengeTask(challengeId, userId);
    return toUserTask(completed);
  }

  const requirement = await getTaskCompletionRequirement(task, userId);
  if (!requirement.canComplete) {
    throw new Error(requirement.reason ?? "Task completion requirements are not met.");
  }

  const completedAt = new Date().toISOString();
  const updated: UserTask = {
    ...task,
    status: "completed",
    completed_at: completedAt,
  };

  const customTasks = (await getCachedData<UserTask[]>(`custom_user_tasks_${userId}`)) ?? [];
  const next = customTasks.map((item) => (item.id === task.id ? updated : item));
  await cacheData(`custom_user_tasks_${userId}`, next);
  return updated;
}

export async function completeUserTasks(
  tasks: UserTask[],
  userId = "local-parent",
): Promise<{ updatedCount: number; skippedCount: number; skippedTitles: string[] }> {
  const openTasks = tasks.filter((task) => task.status !== "completed");
  if (openTasks.length === 0) {
    return { updatedCount: 0, skippedCount: 0, skippedTitles: [] };
  }

  let updatedCount = 0;
  const skippedTitles: string[] = [];

  for (const task of openTasks) {
    const requirement = await getTaskCompletionRequirement(task, userId);
    if (!requirement.canComplete) {
      skippedTitles.push(task.title);
      continue;
    }
    await completeUserTask(task, userId);
    updatedCount += 1;
  }

  return {
    updatedCount,
    skippedCount: skippedTitles.length,
    skippedTitles,
  };
}
