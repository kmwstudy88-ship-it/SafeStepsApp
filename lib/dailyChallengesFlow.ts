import {
  filterChallenges,
  getChallengeSafeguardMetadata,
  getChallengeTrack,
  isWeekendActivityChallenge,
  type ChallengeCadenceFilter,
  type ChallengeTrack,
} from './data/familyChallenges';
import {
  getParentChallengeById,
  safestepsParentChallenges,
  type SafeStepsParentChallenge,
} from './data/safestepsParentChallenges';
import {
  cacheData,
  enqueueOfflineItem,
  getCachedData,
  getQueuedSyncItems,
} from './offline/offlineSyncService';

export type ChallengeTaskRecord = {
  id: string;
  owner_id: string;
  challenge_id: string;
  title: string;
  description: string;
  status: 'ready' | 'in_progress' | 'paused_break' | 'completed';
  completed_at: string | null;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
  related_lesson_id: string;
  evidence_required: boolean;
  category: string;
  track?: 'personal' | 'family';
  is_weekend_activity?: boolean;
  paused_at?: string | null;
  break_reason?: string | null;
  child_perspective_note?: string | null;
  shared_with_child?: boolean;
};

export type ChallengeEvidenceRecord = {
  id: string;
  owner_id: string;
  task_id: string;
  challenge_id: string;
  title: string;
  reflection: string;
  evidence_note: string;
  child_perspective_note?: string;
  shared_with_child?: boolean;
  track?: 'personal' | 'family';
  created_at: string;
  synced: boolean;
};

export type DailyChallengeRewardTier = {
  id: string;
  label: string;
  points: number;
  description: string;
};

export type DailyChallengeRewardStatus = DailyChallengeRewardTier & {
  unlocked: boolean;
  claimed: boolean;
  canClaim: boolean;
};

export type DailyChallengeSettings = {
  dailyReminder: boolean;
  eveningCheckIn: boolean;
  streakAlerts: boolean;
  paused: boolean;
  updatedAt?: string;
};

export const DAILY_CHALLENGE_POINTS = {
  daily: 150,
  weekly: 250,
  monthly: 500,
} as const;

export const DEFAULT_CHALLENGE_SETTINGS: DailyChallengeSettings = {
  dailyReminder: true,
  eveningCheckIn: true,
  streakAlerts: true,
  paused: false,
};

export const DAILY_CHALLENGE_REWARD_TIERS: readonly DailyChallengeRewardTier[] = [
  {
    id: 'bronze',
    label: 'Bronze Reward',
    points: 250,
    description: 'Complete 2 evidence-backed challenges to unlock your first milestone.',
  },
  {
    id: 'silver',
    label: 'Silver Reward',
    points: 500,
    description: 'Consistent child-focused reflection and daily routine practice.',
  },
  {
    id: 'gold',
    label: 'Gold Reward',
    points: 750,
    description: 'Strong evidence-backed parenting consistency across multiple challenges.',
  },
  {
    id: 'bonus',
    label: 'Bonus Reward',
    points: 1000,
    description: 'Champion milestone for completing 7+ daily challenges with verified evidence.',
  },
] as const;

type ChallengeStateListener = (tasks: ChallengeTaskRecord[]) => void;
const stateListeners = new Set<ChallengeStateListener>();

export function subscribeToDailyChallengeTasks(listener: ChallengeStateListener): () => void {
  stateListeners.add(listener);
  return () => {
    stateListeners.delete(listener);
  };
}

function notifyChallengeTaskListeners(tasks: ChallengeTaskRecord[]) {
  stateListeners.forEach((listener) => {
    try {
      listener([...tasks]);
    } catch {
      // Ignore subscriber errors
    }
  });
}

export function getChallengePoints(challenge: SafeStepsParentChallenge): number {
  return DAILY_CHALLENGE_POINTS[challenge.challengeType];
}

export function getActiveDailyChallenges(): SafeStepsParentChallenge[] {
  return safestepsParentChallenges
    .filter((challenge) => challenge.challengeType === 'daily')
    .slice(0, 8);
}

export function getActiveChallengesByTrack(
  track: ChallengeTrack | 'daily' = 'all',
  cadence: ChallengeCadenceFilter = 'all',
): SafeStepsParentChallenge[] {
  if (track === 'daily') {
    return getActiveDailyChallenges();
  }
  return filterChallenges({ track, challengeType: cadence });
}

export function buildParentChallengeTask(
  challengeId: string,
  userId = 'local-parent',
): ChallengeTaskRecord {
  const challenge = getParentChallengeById(challengeId);
  if (!challenge) {
    throw new Error('Parent challenge not found.');
  }

  const track = getChallengeTrack(challenge);
  const safeguards = getChallengeSafeguardMetadata(challenge);

  return {
    id: `challenge_task_${challenge.id}`,
    owner_id: userId,
    challenge_id: challenge.id,
    title: challenge.displayTitle,
    description: [
      challenge.purpose,
      '',
      challenge.quickQuestionBeforeChallenge,
      '',
      'Challenge steps:',
      ...challenge.challengeSteps.map((step, index) => `${index + 1}. ${step}`),
      '',
      'Reflection questions:',
      ...challenge.reflectionQuestions.map((question) => `- ${question}`),
      '',
      'Completion checklist:',
      ...challenge.completionChecklist.map((item) => `- ${item}`),
      '',
      `Evidence task: ${challenge.evidenceTask}`,
      '',
      `Safety note: ${challenge.safetyNote}`,
      '',
      `Safeguard notice: ${safeguards.safeguardSummary}`,
    ].join('\n'),
    status: 'in_progress',
    completed_at: null,
    created_at: new Date().toISOString(),
    priority: challenge.challengeType === 'daily' ? 'medium' : 'low',
    related_lesson_id: `challenge:${challenge.id}`,
    evidence_required: true,
    category: `parent_challenge:${challenge.category}`,
    track,
    is_weekend_activity: isWeekendActivityChallenge(challenge),
    paused_at: null,
    break_reason: null,
  };
}

export async function getStoredChallengeTasks(userId = 'local-parent'): Promise<ChallengeTaskRecord[]> {
  return (await getCachedData<ChallengeTaskRecord[]>(`daily_challenge_tasks_${userId}`)) ?? [];
}

export async function getStoredChallengeEvidence(
  userId = 'local-parent',
): Promise<ChallengeEvidenceRecord[]> {
  return (await getCachedData<ChallengeEvidenceRecord[]>(`daily_challenge_evidence_${userId}`)) ?? [];
}

export async function startDailyChallengeTask(
  challengeId: string,
  userId = 'local-parent',
): Promise<ChallengeTaskRecord> {
  const tasks = await getStoredChallengeTasks(userId);
  const existing = tasks.find(
    (task) =>
      task.challenge_id === challengeId || task.related_lesson_id === `challenge:${challengeId}`,
  );
  if (existing) {
    return existing;
  }

  const created = buildParentChallengeTask(challengeId, userId);
  const nextTasks = [created, ...tasks];
  await cacheData(`daily_challenge_tasks_${userId}`, nextTasks);
  notifyChallengeTaskListeners(nextTasks);
  return created;
}

/**
 * SS-PCD-036: "I need a break" control.
 * Pauses any challenge activity immediately without data loss, streak penalty,
 * or non-engagement inference.
 */
export async function pauseChallengeForBreak(
  challengeId: string,
  breakReason = 'Taking a calm break (no penalty)',
  userId = 'local-parent',
): Promise<ChallengeTaskRecord> {
  const task = await startDailyChallengeTask(challengeId, userId);
  if (task.status === 'completed') {
    return task;
  }

  const tasks = await getStoredChallengeTasks(userId);
  const pausedTask: ChallengeTaskRecord = {
    ...task,
    status: 'paused_break',
    paused_at: new Date().toISOString(),
    break_reason: breakReason.trim() || 'Taking a calm break (no penalty)',
  };

  const nextTasks = tasks.map((item) => (item.id === task.id ? pausedTask : item));
  await cacheData(`daily_challenge_tasks_${userId}`, nextTasks);
  notifyChallengeTaskListeners(nextTasks);
  return pausedTask;
}

export async function resumeChallengeFromBreak(
  challengeId: string,
  userId = 'local-parent',
): Promise<ChallengeTaskRecord> {
  const task = await startDailyChallengeTask(challengeId, userId);
  if (task.status === 'completed') {
    return task;
  }

  const tasks = await getStoredChallengeTasks(userId);
  const resumedTask: ChallengeTaskRecord = {
    ...task,
    status: 'in_progress',
    paused_at: null,
  };

  const nextTasks = tasks.map((item) => (item.id === task.id ? resumedTask : item));
  await cacheData(`daily_challenge_tasks_${userId}`, nextTasks);
  notifyChallengeTaskListeners(nextTasks);
  return resumedTask;
}

export async function attachDailyChallengeEvidence(input: {
  challengeId: string;
  taskId?: string;
  reflection: string;
  evidenceNote?: string;
  childPerspectiveNote?: string;
  sharedWithChild?: boolean;
  userId?: string;
}): Promise<ChallengeEvidenceRecord> {
  const userId = input.userId ?? 'local-parent';
  const trimmedReflection = input.reflection.trim();
  if (!trimmedReflection) {
    throw new Error('Reflection is required before saving challenge evidence.');
  }

  const challenge = getParentChallengeById(input.challengeId);
  if (!challenge) {
    throw new Error('Parent challenge not found.');
  }

  const track = getChallengeTrack(challenge);
  const trimmedChildNote = (input.childPerspectiveNote ?? '').trim();

  const task = await startDailyChallengeTask(challenge.id, userId);
  const targetTaskId = input.taskId ?? task.id;
  const evidenceRecord: ChallengeEvidenceRecord = {
    id: `challenge_evidence_${challenge.id}_${Date.now()}`,
    owner_id: userId,
    task_id: targetTaskId,
    challenge_id: challenge.id,
    title: `Challenge evidence: ${challenge.displayTitle}`,
    reflection: trimmedReflection,
    evidence_note: (input.evidenceNote ?? '').trim(),
    child_perspective_note: trimmedChildNote || undefined,
    shared_with_child: Boolean(input.sharedWithChild),
    track,
    created_at: new Date().toISOString(),
    synced: false,
  };

  const existingEvidence = await getStoredChallengeEvidence(userId);
  await cacheData(`daily_challenge_evidence_${userId}`, [evidenceRecord, ...existingEvidence]);

  if (trimmedChildNote || input.sharedWithChild !== undefined) {
    const tasks = await getStoredChallengeTasks(userId);
    const nextTasks = tasks.map((item) =>
      item.id === targetTaskId || item.id === task.id
        ? {
            ...item,
            child_perspective_note: trimmedChildNote || item.child_perspective_note || null,
            shared_with_child: Boolean(input.sharedWithChild || trimmedChildNote),
          }
        : item,
    );
    await cacheData(`daily_challenge_tasks_${userId}`, nextTasks);
    notifyChallengeTaskListeners(nextTasks);
  }

  await enqueueOfflineItem({
    type: 'evidence_upload',
    payload: {
      userId,
      title: evidenceRecord.title,
      notes: [
        `Reflection: ${evidenceRecord.reflection}`,
        evidenceRecord.evidence_note ? `Evidence note: ${evidenceRecord.evidence_note}` : '',
        evidenceRecord.child_perspective_note
          ? `Child perspective (voluntary/unpressured): ${evidenceRecord.child_perspective_note}`
          : '',
        `Evidence task: ${challenge.evidenceTask}`,
      ]
        .filter(Boolean)
        .join('\n'),
      evidenceType: 'self_report_interview',
      purpose: `Complete ${track} challenge: ${challenge.displayTitle}`,
      structuredData: {
        task_id: evidenceRecord.task_id,
        challenge_id: challenge.id,
        track,
        reflection: evidenceRecord.reflection,
        evidence_note: evidenceRecord.evidence_note,
        child_perspective_note: evidenceRecord.child_perspective_note ?? null,
        shared_with_child: evidenceRecord.shared_with_child ?? false,
      },
    },
  });

  return evidenceRecord;
}

export async function verifyChallengeCompletionRequirement(
  task: Pick<ChallengeTaskRecord, 'id' | 'challenge_id' | 'related_lesson_id' | 'evidence_required'>,
  userId = 'local-parent',
): Promise<{ canComplete: boolean; linkedEvidenceCount: number; reason?: string }> {
  if (!task.evidence_required) {
    return { canComplete: true, linkedEvidenceCount: 0 };
  }

  const challengeId =
    task.challenge_id ||
    (task.related_lesson_id.startsWith('challenge:')
      ? task.related_lesson_id.replace('challenge:', '')
      : '');

  const storedEvidence = await getStoredChallengeEvidence(userId);
  const queuedItems = await getQueuedSyncItems();

  const matchingStored = storedEvidence.filter(
    (item) => item.task_id === task.id || (challengeId && item.challenge_id === challengeId),
  );
  const matchingQueued = queuedItems.filter(
    (item) =>
      item.type === 'evidence_upload' &&
      (item.payload?.structuredData?.task_id === task.id ||
        (challengeId && item.payload?.structuredData?.challenge_id === challengeId)),
  );

  const linkedEvidenceCount = Math.max(matchingStored.length, matchingQueued.length);
  return {
    canComplete: linkedEvidenceCount > 0,
    linkedEvidenceCount,
    reason:
      linkedEvidenceCount > 0
        ? undefined
        : 'Add or upload evidence for this challenge before marking it complete.',
  };
}

export async function completeDailyChallengeTask(
  challengeId: string,
  userId = 'local-parent',
  completedAtIso?: string,
): Promise<ChallengeTaskRecord> {
  const tasks = await getStoredChallengeTasks(userId);
  const existing = tasks.find(
    (item) =>
      item.challenge_id === challengeId || item.related_lesson_id === `challenge:${challengeId}`,
  );
  if (!existing) {
    throw new Error('Start this challenge before completing it.');
  }

  const requirement = await verifyChallengeCompletionRequirement(existing, userId);
  if (!requirement.canComplete) {
    throw new Error(requirement.reason ?? 'Task completion requirements are not met.');
  }

  const completedAt = completedAtIso ?? new Date().toISOString();
  const updated: ChallengeTaskRecord = {
    ...existing,
    status: 'completed',
    completed_at: completedAt,
    paused_at: null,
  };

  const nextTasks = tasks.map((item) => (item.id === existing.id ? updated : item));
  await cacheData(`daily_challenge_tasks_${userId}`, nextTasks);

  await enqueueOfflineItem({
    type: 'challenge_completion',
    payload: {
      userId,
      taskId: updated.id,
      challengeId,
      completedAt,
      linkedEvidenceCount: requirement.linkedEvidenceCount,
    },
  });

  notifyChallengeTaskListeners(nextTasks);
  return updated;
}

function toUtcDateKey(dateOrIso: string | Date): string | null {
  const parsed = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateDailyChallengeStreak(
  tasks: ChallengeTaskRecord[],
  referenceDate = new Date(),
): { streak: number; completedToday: boolean; weekActivity: boolean[] } {
  const completed = tasks.filter((task) => task.status === 'completed');
  if (completed.length === 0) {
    return {
      streak: 0,
      completedToday: false,
      weekActivity: [false, false, false, false, false, false, false],
    };
  }

  const dateKeys = new Set<string>();
  for (const task of completed) {
    const key = toUtcDateKey(task.completed_at ?? task.created_at ?? referenceDate);
    if (key) dateKeys.add(key);
  }

  const todayUtc = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()),
  );
  const todayKey = toUtcDateKey(todayUtc) ?? '';
  const completedToday = dateKeys.has(todayKey);

  let streak = 0;
  const startOffset = completedToday ? 0 : 1;
  for (let offset = startOffset; offset < 365; offset += 1) {
    const cursor = new Date(todayUtc);
    cursor.setUTCDate(todayUtc.getUTCDate() - offset);
    const key = toUtcDateKey(cursor);
    if (key && dateKeys.has(key)) {
      streak += 1;
    } else {
      break;
    }
  }

  if (streak === 0 && dateKeys.size > 0) {
    const latestKey = Array.from(dateKeys).sort().reverse()[0];
    const latestDate = new Date(`${latestKey}T00:00:00.000Z`);
    for (let offset = 0; offset < 365; offset += 1) {
      const cursor = new Date(latestDate);
      cursor.setUTCDate(latestDate.getUTCDate() - offset);
      const key = toUtcDateKey(cursor);
      if (key && dateKeys.has(key)) {
        streak += 1;
      } else {
        break;
      }
    }
  }

  const dayOfWeek = todayUtc.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayUtc = new Date(todayUtc);
  mondayUtc.setUTCDate(todayUtc.getUTCDate() + mondayOffset);

  const weekActivity = [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
    const d = new Date(mondayUtc);
    d.setUTCDate(mondayUtc.getUTCDate() + dayIndex);
    const key = toUtcDateKey(d);
    return Boolean(key && dateKeys.has(key));
  });

  return {
    streak: Math.min(365, streak),
    completedToday,
    weekActivity,
  };
}

export function evaluateRewardTiers(
  points: number,
  claimedRewardIds: string[] = [],
): DailyChallengeRewardStatus[] {
  const claimedSet = new Set(claimedRewardIds);
  return DAILY_CHALLENGE_REWARD_TIERS.map((tier) => {
    const unlocked = points >= tier.points;
    const claimed = claimedSet.has(tier.id);
    return {
      ...tier,
      unlocked,
      claimed,
      canClaim: unlocked && !claimed,
    };
  });
}

export async function getClaimedChallengeRewards(userId = 'local-parent'): Promise<string[]> {
  return (await getCachedData<string[]>(`daily_challenge_claimed_rewards_${userId}`)) ?? [];
}

export async function claimChallengeReward(
  rewardId: string,
  currentPoints: number,
  userId = 'local-parent',
): Promise<{ claimedRewardIds: string[]; reward: DailyChallengeRewardTier }> {
  const tier = DAILY_CHALLENGE_REWARD_TIERS.find((item) => item.id === rewardId);
  if (!tier) {
    throw new Error('Reward tier not found.');
  }
  if (currentPoints < tier.points) {
    throw new Error(`Need ${tier.points} points to claim ${tier.label}.`);
  }

  const existing = await getClaimedChallengeRewards(userId);
  const next = Array.from(new Set([...existing, tier.id]));
  await cacheData(`daily_challenge_claimed_rewards_${userId}`, next);
  return { claimedRewardIds: next, reward: tier };
}

export async function getDailyChallengeSettings(
  userId = 'local-parent',
): Promise<DailyChallengeSettings> {
  const stored = await getCachedData<Partial<DailyChallengeSettings>>(
    `daily_challenge_settings_${userId}`,
  );
  if (!stored) return { ...DEFAULT_CHALLENGE_SETTINGS };
  return {
    dailyReminder: stored.dailyReminder ?? DEFAULT_CHALLENGE_SETTINGS.dailyReminder,
    eveningCheckIn: stored.eveningCheckIn ?? DEFAULT_CHALLENGE_SETTINGS.eveningCheckIn,
    streakAlerts: stored.streakAlerts ?? DEFAULT_CHALLENGE_SETTINGS.streakAlerts,
    paused: stored.paused ?? DEFAULT_CHALLENGE_SETTINGS.paused,
    updatedAt: stored.updatedAt,
  };
}

export async function saveDailyChallengePreferences(
  settings: DailyChallengeSettings,
  userId = 'local-parent',
): Promise<DailyChallengeSettings> {
  const next: DailyChallengeSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  await cacheData(`daily_challenge_settings_${userId}`, next);
  return next;
}

export function buildDailyChallengeSummary(
  tasks: ChallengeTaskRecord[],
  claimedRewardIds: string[] = [],
  referenceDate = new Date(),
) {
  const challenges = getActiveDailyChallenges();
  const completedChallengeIds = new Set<string>();

  for (const task of tasks) {
    if (task.status === 'completed') {
      const id =
        task.challenge_id ||
        (task.related_lesson_id.startsWith('challenge:')
          ? task.related_lesson_id.replace('challenge:', '')
          : '');
      if (id) completedChallengeIds.add(id);
    }
  }

  const completedDailyCount = challenges.filter((c) => completedChallengeIds.has(c.id)).length;
  let points = 0;
  let personalCompletedCount = 0;
  let familyCompletedCount = 0;

  for (const id of completedChallengeIds) {
    const challenge = getParentChallengeById(id);
    points += challenge ? getChallengePoints(challenge) : DAILY_CHALLENGE_POINTS.daily;
    if (challenge) {
      if (getChallengeTrack(challenge) === 'personal') {
        personalCompletedCount += 1;
      } else {
        familyCompletedCount += 1;
      }
    }
  }

  const activeBreakCount = tasks.filter((task) => task.status === 'paused_break').length;
  const rewards = evaluateRewardTiers(points, claimedRewardIds);
  const claimedPoints = rewards.filter((r) => r.claimed).reduce((sum, r) => sum + r.points, 0);
  const streakInfo = calculateDailyChallengeStreak(tasks, referenceDate);

  return {
    challenges,
    completedCount: completedDailyCount,
    totalCount: challenges.length,
    totalCompletedAllTracks: completedChallengeIds.size,
    personalCompletedCount,
    familyCompletedCount,
    activeBreakCount,
    points,
    claimedPoints,
    availablePoints: Math.max(0, points - claimedPoints),
    progress: challenges.length === 0 ? 0 : completedDailyCount / challenges.length,
    streak: streakInfo.streak,
    completedToday: streakInfo.completedToday,
    weekActivity: streakInfo.weekActivity,
    rewards,
  };
}
