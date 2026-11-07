/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-require-imports -- Reload modules to simulate app restarts with durable mock storage. */
jest.mock("../lib/supabase/client", () => {
  const state = { evidence: new Map(), audits: new Map(), files: new Map(), pending: [] as any[],
    auditFailure: false, auditLostReply: false, uploadFailure: false, registrationLostReply: false, conflict: false };
  const from = (table: string) => {
    let row: any;
    let filters: Record<string, unknown> = {};
    const records = () => table === "evidence_items" ? state.evidence : table === "evidence_audit_log" ? state.audits : new Map();
    const query: any = {
      insert(value: any) { row = value; return query; },
      select() { return query; }, eq(key: string, value: unknown) { filters[key] = value; return query; },
      order() { return query; }, limit() { return query; },
      async single() { return execute(); }, async maybeSingle() { return execute(); },
      then(resolve: any, reject: any) { return execute().then(resolve, reject); },
    };
    async function execute() {
      const map = records();
      if (!row) {
        const data = [...map.values()].find((item: any) => Object.entries(filters).every(([key, value]) => item[key] === value)) ?? null;
        return { data, error: null };
      }
      if (table === "progress_events") return { data: row, error: null };
      if (table === "evidence_audit_log" && state.auditFailure) { state.auditFailure = false; return { data: null, error: { code: "500", message: "Audit unavailable" } }; }
      if (map.has(row.id)) return { data: null, error: { code: "23505", message: "Duplicate" } };
      map.set(row.id, { ...row });
      if (table === "evidence_items" && state.registrationLostReply) {
        state.registrationLostReply = false; return { data: null, error: { code: "500", message: "Response lost" } };
      }
      if (table === "evidence_audit_log" && state.auditLostReply) {
        state.auditLostReply = false; return { data: null, error: { code: "500", message: "Response lost" } };
      }
      return { data: row, error: null };
    }
    return query;
  };
  return { __state: state, supabase: {
    auth: { getUser: jest.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })),
      getSession: jest.fn(async () => ({ data: { session: { user: { id: "user-1" } } }, error: null })) },
    from: jest.fn(from), storage: { from: () => ({
      upload: jest.fn(async (path: string, bytes: Uint8Array) => {
        if (state.uploadFailure) return { error: { message: "Offline" } };
        if (state.files.has(path)) return { error: { message: "Already exists" } };
        state.files.set(path, new Uint8Array(bytes)); return { error: null };
      }),
      download: async (path: string) => state.files.has(path)
        ? { data: new Blob([state.conflict ? new Uint8Array([9]) : state.files.get(path)]), error: null }
        : { data: null, error: { message: "Not found" } },
    }) },
  } };
});

jest.mock("../lib/engines/offlineEvidenceVault", () => {
  const state = () => require("../lib/supabase/client").__state;
  return {
    createEvidenceVaultHash: jest.fn(async (value: unknown) => require("node:crypto").createHash("sha256").update(JSON.stringify(value)).digest("hex")),
    getOfflineEvidenceVaultItems: jest.fn(async () => [...state().pending]),
    getOfflineEvidenceVaultHistory: jest.fn(async () => [...state().pending]),
    verifyOfflineEvidenceVaultChain: jest.fn(async () => true),
    readOfflineEvidenceAttachment: jest.fn(async () => new Uint8Array([1, 2, 3])),
    retainOfflineEvidenceDraft: jest.fn(async () => undefined),
    removeOfflineEvidenceItem: jest.fn(async (id: string) => { state().pending = state().pending.filter((item: any) => item.id !== id); }),
    markOfflineEvidenceSyncFailed: jest.fn(async () => undefined),
    queueOfflineEvidence: jest.fn(async (value: any) => {
      const item = { ...value, id: "offline-evidence-11111111-1111-4111-8111-111111111111", createdAt: "2026-11-08T00:00:00Z", integrityHash: "sealed", previousHash: "vault-root" };
      state().pending.push(item); return item;
    }),
  };
});

let engine: typeof import("../lib/engines/evidenceEngine");
let state: any;
let vault: any;
let supabase: any;
const queued = () => ({
  id: "offline-evidence-11111111-1111-4111-8111-111111111111", ownerId: "user-1", title: "Original",
  notes: "Notes", createdAt: "2026-11-08T00:00:00Z", integrityHash: "sealed", previousHash: "vault-root",
  attachment: { uri: "encrypted.enc", name: "evidence.jpg", mimeType: "image/jpeg", source: "live", sha256: "digest", digestEncoding: "bytes" },
});
beforeEach(() => {
  jest.resetModules();
  ({ __state: state, supabase } = require("../lib/supabase/client"));
  vault = require("../lib/engines/offlineEvidenceVault");
  engine = require("../lib/engines/evidenceEngine");
  state.pending = [queued()];
});

test.each(["registrationLostReply", "auditFailure", "auditLostReply"])("retries %s with one evidence row, upload and audit event", async (failure) => {
  state[failure] = true;
  expect((await engine.syncPendingOfflineEvidence()).failedCount).toBe(1);
  expect(state.pending).toHaveLength(1);
  expect((await engine.syncPendingOfflineEvidence()).syncedCount).toBe(1);
  expect(state.evidence.size).toBe(1);
  expect(state.audits.size).toBe(1);
  expect(state.files.size).toBe(1);
  expect(state.pending).toHaveLength(0);
});

test("concurrent sync requests share one operation", async () => {
  const [a, b] = await Promise.all([engine.syncPendingOfflineEvidence(), engine.syncPendingOfflineEvidence()]);
  expect(a).toEqual(b);
  expect(vault.removeOfflineEvidenceItem).toHaveBeenCalledTimes(1);
  expect(state.evidence.size).toBe(1);
});

test("a conflicting existing object is never overwritten or registered", async () => {
  state.files.set("user-1/" + queued().id + ".jpg", new Uint8Array([9]));
  expect((await engine.syncPendingOfflineEvidence()).failedCount).toBe(1);
  expect(state.evidence.size).toBe(0);
  expect(state.pending).toHaveLength(1);
});

test("invalid chain stops before any upload", async () => {
  vault.verifyOfflineEvidenceVaultChain.mockResolvedValue(false);
  await expect(engine.syncPendingOfflineEvidence()).rejects.toThrow("verification");
  expect(state.files.size).toBe(0);
  expect(state.evidence.size).toBe(0);
});

test("a save reaches the local queue before the first upload and survives no connection", async () => {
  state.pending = [];
  state.uploadFailure = true;
  const result = await engine.createEvidenceItemWithOfflineFallback({ title: "Offline", attachment: queued().attachment as any });
  expect(result.mode).toBe("offline");
  expect(vault.queueOfflineEvidence).toHaveBeenCalledTimes(1);
  expect(state.pending).toHaveLength(1);
});

test("an unavailable server auth check still leaves a durable queued capture", async () => {
  state.pending = [];
  supabase.auth.getUser.mockRejectedValue(new Error("Offline"));
  const result = await engine.createEvidenceItemWithOfflineFallback({ title: "Offline" });
  expect(result.mode).toBe("offline");
  expect(state.pending).toHaveLength(1);
});


test("capture drafts are not uploaded without confirmation", async () => {
  state.pending[0].requiresConfirmation = true;
  const result = await engine.syncPendingOfflineEvidence();
  expect(result.syncedCount).toBe(0);
  expect(result.pendingCount).toBe(1);
  expect(state.files.size).toBe(0);
  expect(state.evidence.size).toBe(0);
});

test("a capture from another account cannot be consumed", async () => {
  await expect(engine.createEvidenceItemWithOfflineFallback({ title: "Wrong owner", captureDraftId: "other-owner-draft" })).rejects.toThrow("unavailable for this account");
  expect(vault.queueOfflineEvidence).not.toHaveBeenCalled();
});


test("account changes before registration retain the original instead of writing as another user", async () => {
  supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-2" } }, error: null });
  await expect(engine.createEvidenceItem({ id: "11111111-1111-4111-8111-111111111111", expectedOwnerId: "user-1", title: "Original" })).rejects.toThrow("account changed");
  expect(state.evidence.size).toBe(0);
});


test("local pending evidence remains visible without a server auth request", async () => {
  supabase.auth.getUser.mockRejectedValue(new Error("Offline"));
  expect(await engine.getPendingOfflineEvidenceItems()).toHaveLength(1);
  expect(supabase.auth.getUser).not.toHaveBeenCalled();
});
