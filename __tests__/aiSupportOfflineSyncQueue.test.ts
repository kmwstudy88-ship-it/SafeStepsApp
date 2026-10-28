jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import {
  clearAllQueuedAiSupportItems,
  computeQueueItemHash,
  getPendingAiSupportQueue,
  markQueuedItemFailed,
  queueAiSupportSubmission,
  removeQueuedAiSupportItem,
  syncPendingAiSupportQueue,
  verifyAiSupportQueueChain,
  type QueuedAiSupportItem,
} from "../lib/engines/aiSupportOfflineSyncQueue";
import {
  submitContactVisitCoachSession,
  submitCouplesDfvSafetyCheck,
} from "../lib/aiSupportApi";

describe("SafeSteps AI Support Offline Sync Queue & Tamper-Evident Lineage", () => {
  beforeEach(async () => {
    await clearAllQueuedAiSupportItems();
  });

  afterAll(async () => {
    await clearAllQueuedAiSupportItems();
  });

  test("enqueues submissions and builds a cryptographic SHA-256 hash chain", async () => {
    const item1 = await queueAiSupportSubmission("/ai-support/visits/coach", {
      childAges: ["6", "9"],
      phase: "pre_visit_prep",
    });

    const item2 = await queueAiSupportSubmission("/ai-support/addiction/urge-surf", {
      substanceCategory: "alcohol",
      cravingIntensity: 8,
    });

    const item3 = await queueAiSupportSubmission("/ai-support/child/three-houses", {
      childAge: 7,
      worries: ["Scared when voices get loud"],
    });

    expect(item1.previousHash).toBe("safesteps-offline-queue-root-v1");
    expect(item2.previousHash).toBe(item1.integrityHash);
    expect(item3.previousHash).toBe(item2.integrityHash);

    const queue = await getPendingAiSupportQueue();
    expect(queue).toHaveLength(3);
    expect(verifyAiSupportQueueChain(queue)).toBe(true);
  });

  test("detects tampering when an item payload or hash is modified", async () => {
    await queueAiSupportSubmission("/ai-support/kinship-carer/check-in", {
      carerType: "grandparent",
      burnoutScore: 4,
    });

    await queueAiSupportSubmission("/ai-support/cultural-sewb/yarning-map", {
      communityName: "Yarning Mob",
      culturalWorkerPresent: true,
    });

    const queue = await getPendingAiSupportQueue();
    expect(verifyAiSupportQueueChain(queue)).toBe(true);

    // Tamper with payload of first item
    const tamperedQueue = JSON.parse(JSON.stringify(queue)) as QueuedAiSupportItem[];
    tamperedQueue[0].payload.burnoutScore = 1; // modified!
    expect(verifyAiSupportQueueChain(tamperedQueue)).toBe(false);

    // Tamper with previousHash
    const tamperedHashQueue = JSON.parse(JSON.stringify(queue)) as QueuedAiSupportItem[];
    tamperedHashQueue[1].previousHash = "tampered-hash";
    expect(verifyAiSupportQueueChain(tamperedHashQueue)).toBe(false);
  });

  test("syncs queue entries successfully and removes processed items", async () => {
    await queueAiSupportSubmission("/ai-support/visits/coach", {
      phase: "during_visit_grounding",
    });
    await queueAiSupportSubmission("/ai-support/neuro-sleep/profile", {
      nightmareAwakeningsPerWeek: 4,
    });

    expect(await getPendingAiSupportQueue()).toHaveLength(2);

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    }) as unknown as typeof fetch;

    const result = await syncPendingAiSupportQueue({
      baseUrl: "http://localhost:3000",
      accessToken: "test-token",
      fetchFn: mockFetch,
    });

    expect(result.total).toBe(2);
    expect(result.synced).toBe(2);
    expect(result.failed).toBe(0);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const remaining = await getPendingAiSupportQueue();
    expect(remaining).toHaveLength(0);
  });

  test("retains items and records failure diagnostics when sync encounters network errors", async () => {
    await queueAiSupportSubmission("/ai-support/family-meeting/repair-script", {
      ruptureDescription: "Missed bedtime routine after argument",
    });

    const mockFailingFetch = jest.fn().mockRejectedValue(new Error("Network timeout")) as unknown as typeof fetch;

    const result = await syncPendingAiSupportQueue({
      fetchFn: mockFailingFetch,
    });

    expect(result.total).toBe(1);
    expect(result.synced).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.errors[0]).toContain("Network timeout");

    const remaining = await getPendingAiSupportQueue();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].syncAttempts).toBe(1);
    expect(remaining[0].lastError).toBe("Network timeout");
  });

  test("falls back automatically to offline queue when calling aiSupportApi in offline environment", async () => {
    // When fetch fails, submitCouplesDfvSafetyCheck should still return immediate local result AND enqueue
    const result = await submitCouplesDfvSafetyCheck({
      sessionId: "session-test-1",
      participantUserId: "survivor-1",
      checkPhase: "pre_session",
      feltSafetyScore: 4, // triggers parallel safe pivot
      fearOfRetaliation: true,
    });

    expect(result.silentPivotTriggered).toBe(true);
    expect(result.recommendedMode).toBe("individual_stabilisation_only");

    const queued = await getPendingAiSupportQueue();
    expect(queued.length).toBeGreaterThanOrEqual(1);
    expect(queued.some((item) => item.endpoint === "/ai-support/couples-dfv/safety-check")).toBe(true);
  });
});
