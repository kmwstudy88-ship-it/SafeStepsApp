import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient';

const QUEUE_KEY = 'safesteps_offline_sync_queue';
const CACHE_KEY_PREFIX = 'safesteps_cache_';

export type QueuedSyncItem = {
  id: string;
  type:
    | 'lesson_completion'
    | 'reflection_submit'
    | 'evidence_upload'
    | 'assessment_submit'
    | 'challenge_completion';
  payload: Record<string, any>;
  timestamp: string;
};

type SyncQueueListener = (items: QueuedSyncItem[]) => void;

const memoryQueue: QueuedSyncItem[] = [];
let memoryQueueHydrated = false;
const memoryCache = new Map<string, any>();
const syncQueueListeners = new Set<SyncQueueListener>();

function notifySyncQueueListeners(items: QueuedSyncItem[]) {
  syncQueueListeners.forEach((listener) => {
    try {
      listener([...items]);
    } catch {
      // Ignore subscriber errors
    }
  });
}

export function subscribeToOfflineSyncQueue(listener: SyncQueueListener): () => void {
  syncQueueListeners.add(listener);
  return () => {
    syncQueueListeners.delete(listener);
  };
}

async function readQueue(): Promise<QueuedSyncItem[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as QueuedSyncItem[];
      if (Array.isArray(parsed)) {
        memoryQueue.splice(0, memoryQueue.length, ...parsed);
        memoryQueueHydrated = true;
        return [...parsed];
      }
    }
  } catch {
    // Fallback to in-memory queue when AsyncStorage is unavailable in Node tests
  }
  return memoryQueueHydrated ? [...memoryQueue] : [...memoryQueue];
}

async function writeQueue(queue: QueuedSyncItem[]): Promise<void> {
  memoryQueue.splice(0, memoryQueue.length, ...queue);
  memoryQueueHydrated = true;
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Fallback to in-memory queue when AsyncStorage is unavailable in Node tests
  }
  notifySyncQueueListeners(queue);
}

export async function getQueuedSyncItems(): Promise<QueuedSyncItem[]> {
  return readQueue();
}

export async function enqueueOfflineItem(
  item: Omit<QueuedSyncItem, 'id' | 'timestamp'>,
): Promise<QueuedSyncItem> {
  const newItem: QueuedSyncItem = {
    ...item,
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  const queue = await readQueue();
  queue.push(newItem);
  await writeQueue(queue);
  return newItem;
}

export async function getPendingSyncCount(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}

export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  const queue = await readQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  const remaining: QueuedSyncItem[] = [];
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      if (item.type === 'lesson_completion') {
        const { error } = await supabase.from('lesson_progress').upsert({
          lesson_id: item.payload.lessonId,
          user_id: item.payload.userId,
          completed_at: item.timestamp,
        });
        if (error) throw error;
      } else if (item.type === 'assessment_submit') {
        const { error } = await supabase.from('assessment_records').insert({
          assessment_type: item.payload.assessmentType,
          scores: item.payload.scores,
          created_at: item.timestamp,
        });
        if (error) throw error;
      } else if (item.type === 'reflection_submit') {
        const { error } = await supabase.from('progress_events').insert({
          owner_id: item.payload.userId,
          event_type: 'reflection_submitted',
          label: item.payload.title ?? 'Reflection submitted',
          metadata: item.payload,
        });
        if (error) throw error;
      } else if (item.type === 'evidence_upload') {
        const { error } = await supabase.from('evidence_items').insert({
          owner_id: item.payload.userId,
          title: item.payload.title,
          notes: item.payload.notes ?? '',
          evidence_type: item.payload.evidenceType ?? 'self_report_interview',
          purpose: item.payload.purpose ?? null,
          structured_data: item.payload.structuredData ?? null,
          status: 'stored',
          captured_at: item.timestamp,
        });
        if (error) throw error;
      } else if (item.type === 'challenge_completion') {
        const { error } = await supabase
          .from('user_tasks')
          .update({
            status: 'completed',
            completed_at: item.payload.completedAt ?? item.timestamp,
          })
          .eq('id', item.payload.taskId)
          .eq('owner_id', item.payload.userId);
        if (error) throw error;
      }
      synced++;
    } catch {
      failed++;
      remaining.push(item);
    }
  }

  await writeQueue(remaining);
  return { synced, failed };
}

export async function cacheData(key: string, data: any): Promise<void> {
  memoryCache.set(key, data);
  try {
    await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // Fallback to in-memory cache
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw) as T;
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // Fallback to in-memory cache
  }
  return (memoryCache.get(key) as T | undefined) ?? null;
}

export async function clearOfflineSyncStateForTests(): Promise<void> {
  memoryQueue.splice(0, memoryQueue.length);
  memoryQueueHydrated = true;
  memoryCache.clear();
  syncQueueListeners.clear();
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch {
    // Ignore in non-RN test environments
  }
}
