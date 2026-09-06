import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient';

const QUEUE_KEY = 'safesteps_offline_sync_queue';
const CACHE_KEY_PREFIX = 'safesteps_cache_';

export type QueuedSyncItem = {
  id: string;
  type: 'lesson_completion' | 'reflection_submit' | 'evidence_upload' | 'assessment_submit';
  payload: Record<string, any>;
  timestamp: string;
};

export async function enqueueOfflineItem(item: Omit<QueuedSyncItem, 'id' | 'timestamp'>): Promise<void> {
  const newItem: QueuedSyncItem = {
    ...item,
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const queue: QueuedSyncItem[] = raw ? JSON.parse(raw) : [];
  queue.push(newItem);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getPendingSyncCount(): Promise<number> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return 0;
  const queue: QueuedSyncItem[] = JSON.parse(raw);
  return queue.length;
}

export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return { synced: 0, failed: 0 };

  const queue: QueuedSyncItem[] = JSON.parse(raw);
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
      }
      synced++;
    } catch {
      failed++;
      remaining.push(item);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { synced, failed };
}

export async function cacheData(key: string, data: any): Promise<void> {
  await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(data));
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
  return raw ? JSON.parse(raw) : null;
}
