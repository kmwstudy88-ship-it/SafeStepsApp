export type ReflectionPayload = {
  sessionId?: string;
  playerId?: string;
  gameId?: string;
  text: string;
  shareSetting: string;
  hiddenFromWorker?: boolean;
  timestamp?: number;
};

const queuedReflections: ReflectionPayload[] = [];

export async function sendReflection(payload: ReflectionPayload) {
  queuedReflections.push(payload);

  try {
    await fetch("http://localhost:3000/reflection/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Keep the reflection queued locally for draft/offline worker review.
  }

  return payload;
}

export function getQueuedReflections() {
  return [...queuedReflections];
}
