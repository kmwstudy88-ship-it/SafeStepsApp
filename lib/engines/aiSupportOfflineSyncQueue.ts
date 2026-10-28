import AsyncStorage from "@react-native-async-storage/async-storage";

import { computeAuditSha256 } from "./aiSupportCoachEngine";

export type QueuedAiSupportItem = {
  id: string;
  endpoint: string;
  method: "POST" | "PUT";
  payload: Record<string, unknown>;
  queuedAt: string;
  previousHash: string;
  integrityHash: string;
  syncAttempts: number;
  status: "queued" | "syncing" | "failed";
  lastError?: string;
};

export type SyncSummary = {
  total: number;
  synced: number;
  failed: number;
  errors: string[];
};

const QUEUE_STORAGE_KEY = "safesteps.aiSupport.offlineQueue.v1";
const ROOT_HASH = "safesteps-offline-queue-root-v1";

let memoryQueue: QueuedAiSupportItem[] | null = null;

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
    .join(",")}}`;
}

export function computeQueueItemHash(
  item: Omit<QueuedAiSupportItem, "integrityHash">,
): string {
  const content = `${item.id}:${item.endpoint}:${item.method}:${item.queuedAt}:${item.previousHash}:${stableStringify(item.payload)}`;
  return computeAuditSha256(content);
}

export async function getPendingAiSupportQueue(): Promise<QueuedAiSupportItem[]> {
  if (memoryQueue !== null) {
    return [...memoryQueue];
  }
  try {
    const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) {
      memoryQueue = [];
      return [];
    }
    const parsed = JSON.parse(raw) as QueuedAiSupportItem[];
    memoryQueue = Array.isArray(parsed) ? parsed : [];
    return [...memoryQueue];
  } catch {
    memoryQueue = memoryQueue ?? [];
    return [...memoryQueue];
  }
}

async function persistQueue(items: QueuedAiSupportItem[]): Promise<void> {
  memoryQueue = [...items];
  try {
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // In-memory queue remains valid if storage is unavailable
  }
}

export async function queueAiSupportSubmission(
  endpoint: string,
  payload: Record<string, unknown>,
  method: "POST" | "PUT" = "POST",
): Promise<QueuedAiSupportItem> {
  const currentQueue = await getPendingAiSupportQueue();
  const previousHash =
    currentQueue.length > 0
      ? currentQueue[currentQueue.length - 1].integrityHash
      : ROOT_HASH;

  const id = `queued-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const queuedAt = new Date().toISOString();

  const itemWithoutHash: Omit<QueuedAiSupportItem, "integrityHash"> = {
    id,
    endpoint,
    method,
    payload,
    queuedAt,
    previousHash,
    syncAttempts: 0,
    status: "queued",
  };

  const integrityHash = computeQueueItemHash(itemWithoutHash);
  const newItem: QueuedAiSupportItem = {
    ...itemWithoutHash,
    integrityHash,
  };

  currentQueue.push(newItem);
  await persistQueue(currentQueue);
  return newItem;
}

export function verifyAiSupportQueueChain(items: QueuedAiSupportItem[]): boolean {
  if (!items || items.length === 0) return true;

  let expectedPreviousHash = ROOT_HASH;
  for (const item of items) {
    if (item.previousHash !== expectedPreviousHash) {
      return false;
    }
    const { integrityHash, ...rest } = item;
    const computed = computeQueueItemHash(rest);
    if (computed !== integrityHash) {
      return false;
    }
    expectedPreviousHash = integrityHash;
  }
  return true;
}

export async function removeQueuedAiSupportItem(id: string): Promise<void> {
  const currentQueue = await getPendingAiSupportQueue();
  const filtered = currentQueue.filter((item) => item.id !== id);
  await persistQueue(filtered);
}

export async function markQueuedItemFailed(
  id: string,
  errorMessage: string,
): Promise<void> {
  const currentQueue = await getPendingAiSupportQueue();
  const updated = currentQueue.map((item) => {
    if (item.id === id) {
      const attempts = item.syncAttempts + 1;
      return {
        ...item,
        syncAttempts: attempts,
        status: (attempts >= 5 ? "failed" : "queued") as "queued" | "failed",
        lastError: errorMessage,
      };
    }
    return item;
  });
  await persistQueue(updated);
}

export async function clearAllQueuedAiSupportItems(): Promise<void> {
  await persistQueue([]);
}

export async function syncPendingAiSupportQueue(options?: {
  baseUrl?: string;
  accessToken?: string;
  fetchFn?: typeof fetch;
}): Promise<SyncSummary> {
  const queue = await getPendingAiSupportQueue();
  const summary: SyncSummary = {
    total: queue.length,
    synced: 0,
    failed: 0,
    errors: [],
  };

  if (queue.length === 0) return summary;

  const baseUrl = options?.baseUrl ?? "http://localhost:3000";
  const customFetch = options?.fetchFn ?? fetch;

  for (const item of queue) {
    try {
      const url = `${baseUrl.replace(/\/+$/, "")}${item.endpoint.startsWith("/") ? "" : "/"}${item.endpoint}`;
      const response = await customFetch(url, {
        method: item.method,
        headers: {
          "Content-Type": "application/json",
          ...(options?.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
        },
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {
        await removeQueuedAiSupportItem(item.id);
        summary.synced += 1;
      } else {
        const errorText = await response.text();
        const errMessage = `HTTP ${response.status}: ${errorText.slice(0, 120)}`;
        await markQueuedItemFailed(item.id, errMessage);
        summary.failed += 1;
        summary.errors.push(`${item.endpoint}: ${errMessage}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      await markQueuedItemFailed(item.id, message);
      summary.failed += 1;
      summary.errors.push(`${item.endpoint}: ${message}`);
    }
  }

  return summary;
}
