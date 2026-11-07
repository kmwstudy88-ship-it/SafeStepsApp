/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-require-imports -- Reload modules to simulate app restarts with durable mock storage. */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-crypto", () => {
  const crypto = require("node:crypto");
  const keyObject = (bytes: Buffer) => ({ bytes, encoded: async () => bytes.toString("base64") });
  return {
    CryptoDigestAlgorithm: { SHA256: "SHA-256" },
    digestStringAsync: jest.fn(async (_algorithm: string, value: string) => crypto.createHash("sha256").update(value).digest("hex")),
    digest: jest.fn(async (_algorithm: string, value: Uint8Array) => {
      const result = crypto.createHash("sha256").update(value).digest();
      return result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
    }),
    randomUUID: jest.fn(() => crypto.randomUUID()),
    AESEncryptionKey: {
      generate: jest.fn(async () => keyObject(crypto.randomBytes(32))),
      import: jest.fn(async (value: string) => keyObject(Buffer.from(value, "base64"))),
    },
    AESKeySize: { AES256: 256 },
    AESSealedData: { fromCombined: (value: string) => ({ value }) },
    aesEncryptAsync: jest.fn(async (bytes: Uint8Array, key: { bytes: Buffer }, options: { additionalData: Uint8Array }) => {
      const nonce = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv("aes-256-gcm", key.bytes, nonce);
      cipher.setAAD(Buffer.from(options.additionalData));
      const encrypted = Buffer.concat([cipher.update(bytes), cipher.final()]);
      const combined = Buffer.concat([nonce, cipher.getAuthTag(), encrypted]).toString("base64");
      return { combined: async () => combined };
    }),
    aesDecryptAsync: jest.fn(async (sealed: { value: string }, key: { bytes: Buffer }, options: { additionalData: Uint8Array }) => {
      const combined = Buffer.from(sealed.value, "base64");
      const decipher = crypto.createDecipheriv("aes-256-gcm", key.bytes, combined.subarray(0, 12));
      decipher.setAAD(Buffer.from(options.additionalData));
      decipher.setAuthTag(combined.subarray(12, 28));
      return new Uint8Array(Buffer.concat([decipher.update(combined.subarray(28)), decipher.final()]));
    }),
  };
});

jest.mock("expo-secure-store", () => {
  const keys = new Map();
  return {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
    getItemAsync: jest.fn(async (key: string) => keys.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => { keys.set(key, value); }),
    __keys: keys,
  };
});

jest.mock("expo-file-system/legacy", () => {
  const files = new Map<string, string>();
  return {
    documentDirectory: "file:///vault/", EncodingType: { Base64: "base64" },
    getInfoAsync: jest.fn(async (uri: string) => ({ exists: files.has(uri), size: Buffer.from(files.get(uri) ?? "", "base64").length })),
    makeDirectoryAsync: jest.fn(async () => undefined),
    readAsStringAsync: jest.fn(async (uri: string) => {
      if (!files.has(uri)) throw new Error("File missing");
      return files.get(uri);
    }),
    writeAsStringAsync: jest.fn(async (uri: string, value: string) => { files.set(uri, value); }),
    deleteAsync: jest.fn(async (uri: string) => { files.delete(uri); }),
    __files: files,
  };
});

type VaultModule = typeof import("../lib/engines/offlineEvidenceVault");
let vault: VaultModule;
let storage: typeof import("@react-native-async-storage/async-storage").default;
let fs: any;
let secureStore: any;

beforeEach(async () => {
  jest.resetModules();
  const storageModule = require("@react-native-async-storage/async-storage");
  storage = storageModule.default ?? storageModule;
  await storage.clear();
  fs = require("expo-file-system/legacy");
  secureStore = require("expo-secure-store");
  vault = require("../lib/engines/offlineEvidenceVault");
});

const input = (title = "Capture") => ({ ownerId: "user-1", title });
const attachment = () => ({ uri: "file:///camera.jpg", name: "capture.jpg", source: "live" as const });

async function captureFile() {
  fs.__files.set("file:///camera.jpg", Buffer.from("abc").toString("base64"));
  return vault.queueOfflineEvidence({ ...input(), attachment: attachment() });
}

test("three captures link to the latest predecessor and survive restart", async () => {
  const a = await vault.queueOfflineEvidence(input("A"));
  const b = await vault.queueOfflineEvidence(input("B"));
  const c = await vault.queueOfflineEvidence(input("C"));
  expect(c.previousHash).toBe(b.integrityHash);
  expect(b.previousHash).toBe(a.integrityHash);
  // Reload the implementation while retaining durable mock stores.
  let restarted: VaultModule;
  jest.isolateModules(() => { restarted = require("../lib/engines/offlineEvidenceVault"); });
  const history = await restarted!.getOfflineEvidenceVaultHistory();
  expect(history).toHaveLength(3);
  await expect(restarted!.verifyOfflineEvidenceVaultChain(history)).resolves.toBe(true);
});

test("concurrent saves and key creation do not overwrite evidence", async () => {
  await Promise.all(Array.from({ length: 8 }, (_, index) => vault.queueOfflineEvidence(input(String(index)))));
  const history = await vault.getOfflineEvidenceVaultHistory();
  expect(new Set(history.map((item) => item.id)).size).toBe(8);
  await expect(vault.verifyOfflineEvidenceVaultChain(history)).resolves.toBe(true);
  expect(require("expo-crypto").AESEncryptionKey.generate).toHaveBeenCalledTimes(1);
});

test("retrying an ancestor and syncing any member preserve all original hashes", async () => {
  const a = await vault.queueOfflineEvidence(input("A"));
  await vault.queueOfflineEvidence(input("B"));
  await vault.queueOfflineEvidence(input("C"));
  const before = await vault.getOfflineEvidenceVaultHistory();
  await vault.markOfflineEvidenceSyncFailed(a.id, "offline");
  await vault.removeOfflineEvidenceItem(a.id);
  await vault.markOfflineEvidenceSyncFailed(a.id, "late failure");
  const after = await vault.getOfflineEvidenceVaultHistory();
  expect(after.map((item) => item.integrityHash)).toEqual(before.map((item) => item.integrityHash));
  expect(after.find((item) => item.id === a.id)?.status).toBe("synced");
  expect(await vault.getOfflineEvidenceVaultItems()).toHaveLength(2);
  await expect(vault.verifyOfflineEvidenceVaultChain(after)).resolves.toBe(true);
});

test("attachments are encrypted and SHA-256 covers original bytes", async () => {
  const item = await captureFile();
  expect(item.attachment?.sha256).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  const sealed = fs.__files.get(item.attachment!.vaultUri);
  expect(sealed).not.toBe(Buffer.from("abc").toString("base64"));
  expect(Buffer.from(await vault.readOfflineEvidenceAttachment(item.attachment!)).toString()).toBe("abc");
  expect((await vault.getOfflineEvidenceVaultSecurityStatus()).encryptedAttachments).toBe(true);
});

test("changed ciphertext and missing attachment fail verification", async () => {
  const item = await captureFile();
  const history = await vault.getOfflineEvidenceVaultHistory();
  fs.__files.set(item.attachment!.vaultUri, Buffer.from("tampered").toString("base64"));
  await expect(vault.verifyOfflineEvidenceVaultChain(history)).resolves.toBe(false);
  fs.__files.delete(item.attachment!.vaultUri);
  await expect(vault.verifyOfflineEvidenceVaultChain(history)).resolves.toBe(false);
});

test("metadata tampering is detected and returned records cannot mutate the cached vault", async () => {
  const item = await vault.queueOfflineEvidence(input());
  item.title = "tampered";
  await expect(vault.verifyOfflineEvidenceVaultChain([item])).resolves.toBe(false);
  const history = await vault.getOfflineEvidenceVaultHistory();
  expect(history[0].title).toBe("Capture");
});

test("failed retirement write keeps the queue and attachment intact", async () => {
  const item = await captureFile();
  (storage.setItem as jest.Mock).mockRejectedValueOnce(new Error("disk full"));
  await expect(vault.removeOfflineEvidenceItem(item.id)).rejects.toThrow("disk full");
  expect(await vault.getOfflineEvidenceVaultItems()).toHaveLength(1);
  expect(fs.__files.has(item.attachment!.vaultUri)).toBe(true);
  expect(fs.deleteAsync).not.toHaveBeenCalled();
});

test("an interrupted seal is retried from the recovery journal", async () => {
  fs.__files.set("file:///camera.jpg", Buffer.from("abc").toString("base64"));
  fs.writeAsStringAsync.mockRejectedValueOnce(new Error("interrupted"));
  await expect(vault.queueOfflineEvidence({ ...input(), attachment: attachment() })).rejects.toThrow("interrupted");
  await expect(vault.recoverOfflineEvidenceCaptures()).resolves.toEqual({ recoveredCount: 1, failedCount: 0 });
  expect(await vault.getOfflineEvidenceVaultItems()).toHaveLength(1);
  await expect(vault.recoverOfflineEvidenceCaptures()).resolves.toEqual({ recoveredCount: 0, failedCount: 0 });
});

test("missing interrupted capture is retained and blocks logout", async () => {
  await expect(vault.queueOfflineEvidence({ ...input(), attachment: attachment() })).rejects.toThrow("File missing");
  await expect(vault.recoverOfflineEvidenceCaptures()).resolves.toEqual({ recoveredCount: 0, failedCount: 1 });
  await expect(vault.assertOfflineEvidenceSynced("user-1")).rejects.toThrow("before signing out");
  await expect(vault.assertOfflineEvidenceSynced("other-user")).resolves.toBeUndefined();
});

test("logout blocks unsynced evidence but allows synced history", async () => {
  const item = await vault.queueOfflineEvidence(input());
  await expect(vault.assertOfflineEvidenceSynced("user-1")).rejects.toThrow("have not synced");
  await vault.removeOfflineEvidenceItem(item.id);
  await expect(vault.assertOfflineEvidenceSynced("user-1")).resolves.toBeUndefined();
});

test("missing vault keys never silently regenerate over existing ciphertext", async () => {
  await vault.queueOfflineEvidence(input());
  secureStore.__keys.clear();
  // Invalidate plaintext cache by loading a separate module instance.
  let restarted: VaultModule;
  jest.isolateModules(() => { restarted = require("../lib/engines/offlineEvidenceVault"); });
  await expect(restarted!.getOfflineEvidenceVaultItems()).rejects.toThrow("key is unavailable");
  expect(secureStore.__keys.size).toBe(0);
});


test("encrypted copy recovers even if metadata write failed and camera cache disappeared", async () => {
  fs.__files.set("file:///camera.jpg", Buffer.from("abc").toString("base64"));
  const persist = (storage.setItem as jest.Mock).getMockImplementation()!;
  (storage.setItem as jest.Mock).mockImplementationOnce(persist).mockRejectedValueOnce(new Error("Interrupted metadata write"));
  await expect(vault.queueOfflineEvidence({ ...input(), attachment: attachment() })).rejects.toThrow("Interrupted metadata write");
  fs.__files.delete("file:///camera.jpg");
  await expect(vault.recoverOfflineEvidenceCaptures()).resolves.toEqual({ recoveredCount: 1, failedCount: 0 });
  const history = await vault.getOfflineEvidenceVaultHistory();
  await expect(vault.verifyOfflineEvidenceVaultChain(history)).resolves.toBe(true);
});

test("failure to clear a recovery journal never duplicates a durable capture", async () => {
  const persist = (storage.setItem as jest.Mock).getMockImplementation()!;
  (storage.setItem as jest.Mock).mockImplementationOnce(persist).mockImplementationOnce(persist).mockRejectedValueOnce(new Error("Interrupted journal cleanup"));
  await vault.queueOfflineEvidence(input());
  await vault.recoverOfflineEvidenceCaptures();
  expect(await vault.getOfflineEvidenceVaultItems()).toHaveLength(1);
});

test("capture identity deduplicates recovery and a consumed draft stays in custody history", async () => {
  const captureId = "11111111-1111-4111-8111-111111111111";
  const draft = await vault.queueOfflineEvidence({ ...input(), captureId, requiresConfirmation: true });
  const again = await vault.queueOfflineEvidence({ ...input(), captureId, requiresConfirmation: true });
  expect(draft.id).toBe(again.id);
  await vault.retainOfflineEvidenceDraft(draft.id, "user-1");
  expect(await vault.getOfflineEvidenceVaultItems()).toHaveLength(0);
  const history = await vault.getOfflineEvidenceVaultHistory();
  expect(history).toHaveLength(1);
  await expect(vault.verifyOfflineEvidenceVaultChain(history)).resolves.toBe(true);
});

test("picker ownership is persisted before capture and blocks logout until handled", async () => {
  const intent = await vault.beginEvidenceCapture("user-1");
  expect(await vault.getEvidenceCaptureIntent()).toEqual(intent);
  await expect(vault.assertOfflineEvidenceSynced("user-1")).rejects.toThrow("before signing out");
  await vault.finishEvidenceCaptureIntent("different-capture");
  expect(await vault.getEvidenceCaptureIntent()).toEqual(intent);
  await vault.finishEvidenceCaptureIntent(intent.captureId);
  await expect(vault.assertOfflineEvidenceSynced("user-1")).resolves.toBeUndefined();
});


test("legacy v2 custody hashes survive delivery-state changes without rewriting", async () => {
  await vault.queueOfflineEvidence(input()); // initialise the secure key only
  const legacy: any = {
    id: "legacy", ownerId: "user-1", title: "Legacy", notes: "Original", evidenceType: null,
    purpose: null, structuredData: null, attachment: null, createdAt: "2026-07-10T00:00:00Z",
    status: "queued", syncAttempts: 0, previousHash: "vault-root", hashAlgorithm: "sha256",
    sealedAt: "2026-07-10T00:00:00Z", schemaVersion: 2,
  };
  legacy.integrityHash = await vault.createEvidenceVaultHash({ ...legacy, lastError: null });
  const crypto = require("expo-crypto");
  const key = await crypto.AESEncryptionKey.import(secureStore.__keys.get("safesteps.offlineEvidenceVault.key.v1"), "base64");
  const aad = "safesteps.offlineEvidenceVault.v2";
  const sealed = await crypto.aesEncryptAsync(new TextEncoder().encode(JSON.stringify([legacy])), key, { additionalData: new TextEncoder().encode(aad) });
  await storage.setItem(aad, JSON.stringify({ schemaVersion: 2, encrypted: true, algorithm: "AES-256-GCM", ciphertext: await sealed.combined("base64"), aad }));
  await vault.markOfflineEvidenceSyncFailed("legacy", "offline");
  await vault.removeOfflineEvidenceItem("legacy");
  const history = await vault.getOfflineEvidenceVaultHistory();
  expect(history[0].integrityHash).toBe(legacy.integrityHash);
  await expect(vault.verifyOfflineEvidenceVaultChain(history)).resolves.toBe(true);
});


test("a failed media recovery cannot be replaced by a no-media record with the same identity", async () => {
  const captureId = "11111111-1111-4111-8111-111111111111";
  await expect(vault.queueOfflineEvidence({ ...input(), captureId, requiresConfirmation: true, attachment: attachment() })).rejects.toThrow("File missing");
  await expect(vault.queueOfflineEvidence({ ...input(), captureId, requiresConfirmation: true, attachment: null })).rejects.toThrow("original recovery context");
  expect((await vault.getOfflineEvidenceVaultSecurityStatus()).pendingRecoveryCount).toBe(1);
});


test("caller mutations cannot alter sealed structured data in the cached vault", async () => {
  const structuredData = { context: { original: true } };
  await vault.queueOfflineEvidence({ ...input(), structuredData });
  structuredData.context.original = false;
  const history = await vault.getOfflineEvidenceVaultHistory();
  expect(history[0].structuredData).toEqual({ context: { original: true } });
  await expect(vault.verifyOfflineEvidenceVaultChain(history)).resolves.toBe(true);
});
