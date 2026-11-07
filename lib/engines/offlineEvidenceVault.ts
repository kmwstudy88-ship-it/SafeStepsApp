import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import {
  AESEncryptionKey,
  AESKeySize,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
} from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";

export type OfflineEvidenceAttachment = {
  uri: string;
  name: string;
  mimeType?: string;
  source: "document" | "media" | "live" | "program";
  vaultUri?: string;
  vaultPath?: string;
  originalUri?: string;
  sha256?: string;
  byteSize?: number;
  copiedAt?: string;
  encryption?: "AES-256-GCM";
  encryptionAad?: string;
  digestEncoding?: "bytes";
  captureDraftId?: string;
  capturedAt?: string;
};

export type OfflineEvidenceVaultItem = {
  id: string;
  ownerId: string;
  title: string;
  notes: string;
  evidenceType?: string | null;
  purpose?: string | null;
  structuredData?: Record<string, unknown> | null;
  attachment: OfflineEvidenceAttachment | null;
  createdAt: string;
  status: "queued" | "syncing" | "failed" | "synced" | "retained";
  requiresConfirmation?: boolean;
  syncedAt?: string;
  // Delivery state at sealing; retry bookkeeping must never rewrite custody hashes.
  sealedDeliveryState?: { status: "queued" | "syncing" | "failed"; syncAttempts: number; lastError: string | null };
  syncAttempts: number;
  lastError?: string;
  previousHash: string;
  integrityHash: string;
  hashAlgorithm: "sha256";
  sealedAt: string;
  schemaVersion: 2;
};

export type QueueOfflineEvidenceInput = {
  captureId?: string;
  requiresConfirmation?: boolean;
  ownerId: string;
  title: string;
  notes?: string;
  evidenceType?: string | null;
  purpose?: string | null;
  structuredData?: Record<string, unknown> | null;
  attachment?: OfflineEvidenceAttachment | null;
};

export type OfflineVaultSecurityStatus = {
  encryptedEnvelope: boolean;
  secureStoreKey: boolean;
  appControlledAttachmentCopies: boolean;
  encryptedAttachments: boolean;
  sha256HashChain: boolean;
  itemCount: number;
  pendingRecoveryCount: number;
};

type LegacyVaultItem = Omit<
  OfflineEvidenceVaultItem,
  "hashAlgorithm" | "sealedAt" | "schemaVersion"
>;

type VaultEnvelope = {
  schemaVersion: 2;
  encrypted: true;
  algorithm: "AES-256-GCM";
  ciphertext: string;
  aad: string;
  storedAt: string;
};

const VAULT_STORAGE_KEY = "safesteps.offlineEvidenceVault.v2";
const LEGACY_VAULT_STORAGE_KEY = "safesteps.offlineEvidenceVault.v1";
const VAULT_KEY_STORAGE_KEY = "safesteps.offlineEvidenceVault.key.v1";
const PICKER_INTENT_KEY = "safesteps.offlineEvidenceVault.pickerIntent.v1";
const PENDING_SEALS_KEY = "safesteps.offlineEvidenceVault.pendingSeals.v1";
const INITIAL_HASH = "vault-root";
const VAULT_DIRECTORY = `${FileSystem.documentDirectory ?? ""}safesteps-offline-evidence/`;
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
let vaultOperation: Promise<unknown> = Promise.resolve();

function serializeVault<T>(operation: () => Promise<T>): Promise<T> {
  const result = vaultOperation.then(operation);
  vaultOperation = result.catch(() => undefined);
  return result;
}

let cachedEnvelopeRaw: string | null = null;
let cachedEnvelope: VaultEnvelope | null = null;
let cachedVaultRaw: string | null = null;
let cachedVaultItems: OfflineEvidenceVaultItem[] | null = null;

function cloneVaultValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`)
    .join(",")}}`;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function digestSha256(value: unknown) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    stableStringify(value),
  );
}

function normalizeVaultItem(item: LegacyVaultItem | OfflineEvidenceVaultItem): OfflineEvidenceVaultItem {
  return {
    ...item,
    hashAlgorithm: "sha256",
    sealedAt: "sealedAt" in item ? item.sealedAt : item.createdAt,
    schemaVersion: 2,
  };
}

function vaultRecordForHash(item: Omit<OfflineEvidenceVaultItem, "integrityHash">) {
  return {
    ...(item.requiresConfirmation ? { requiresConfirmation: true } : {}),
    id: item.id,
    ownerId: item.ownerId,
    title: item.title,
    notes: item.notes,
    evidenceType: item.evidenceType ?? null,
    purpose: item.purpose ?? null,
    structuredData: item.structuredData ?? null,
    attachment: item.attachment,
    createdAt: item.createdAt,
    status: item.sealedDeliveryState?.status ?? item.status,
    syncAttempts: item.sealedDeliveryState?.syncAttempts ?? item.syncAttempts,
    lastError: item.sealedDeliveryState ? item.sealedDeliveryState.lastError : item.lastError ?? null,
    previousHash: item.previousHash,
    hashAlgorithm: item.hashAlgorithm,
    sealedAt: item.sealedAt,
    schemaVersion: item.schemaVersion,
  };
}

export async function createEvidenceVaultHash(value: unknown) {
  return `sha256:${await digestSha256(value)}`;
}

async function withIntegrityHash(
  item: Omit<OfflineEvidenceVaultItem, "integrityHash">,
): Promise<OfflineEvidenceVaultItem> {
  return {
    ...item,
    integrityHash: await createEvidenceVaultHash(vaultRecordForHash(item)),
  };
}

async function getVaultEncryptionKey(allowCreate = true) {
  const options: SecureStore.SecureStoreOptions = {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
  const existingKey = await SecureStore.getItemAsync(VAULT_KEY_STORAGE_KEY, options);

  if (existingKey) {
    return AESEncryptionKey.import(existingKey, "base64");
  }

  if (!allowCreate) throw new Error("The evidence vault key is unavailable. Do not clear app data or reinstall.");

  const generatedKey = await AESEncryptionKey.generate(AESKeySize.AES256);
  const keyBase64 = await generatedKey.encoded("base64");
  await SecureStore.setItemAsync(VAULT_KEY_STORAGE_KEY, keyBase64, options);
  return generatedKey;
}

function parseVaultEnvelope(raw: string) {
  if (cachedEnvelopeRaw === raw && cachedEnvelope) {
    return cachedEnvelope;
  }

  const envelope = JSON.parse(raw) as VaultEnvelope;
  cachedEnvelopeRaw = raw;
  cachedEnvelope = envelope;
  return envelope;
}

async function readEncryptedVault(raw: string) {
  const key = await getVaultEncryptionKey(false);
  if (cachedVaultRaw === raw && cachedVaultItems) {
    return cachedVaultItems;
  }

  const envelope = parseVaultEnvelope(raw);
  const sealedData = AESSealedData.fromCombined(envelope.ciphertext);
  const decrypted = await aesDecryptAsync(sealedData, key, {
    output: "bytes",
    additionalData: TEXT_ENCODER.encode(envelope.aad),
  });

  const items = JSON.parse(TEXT_DECODER.decode(decrypted as Uint8Array)) as OfflineEvidenceVaultItem[];
  cachedVaultRaw = raw;
  cachedVaultItems = items;
  return items;
}

async function readStoredVault() {
  const raw = await AsyncStorage.getItem(VAULT_STORAGE_KEY);

  if (raw) {
    return readEncryptedVault(raw);
  }

  const legacyRaw = await AsyncStorage.getItem(LEGACY_VAULT_STORAGE_KEY);
  if (!legacyRaw) {
    return [];
  }

  const legacyItems = JSON.parse(legacyRaw) as LegacyVaultItem[];
  const normalized = legacyItems.map(normalizeVaultItem);
  await writeVault(normalized);
  return normalized;
}

async function writeVault(items: OfflineEvidenceVaultItem[]) {
  const key = await getVaultEncryptionKey();
  const aad = "safesteps.offlineEvidenceVault.v2";
  const sealedData = await aesEncryptAsync(TEXT_ENCODER.encode(JSON.stringify(items)), key, {
    additionalData: TEXT_ENCODER.encode(aad),
    nonce: { length: 12 },
    tagLength: 16,
  });
  const envelope: VaultEnvelope = {
    schemaVersion: 2,
    encrypted: true,
    algorithm: "AES-256-GCM",
    ciphertext: await sealedData.combined("base64") as string,
    aad,
    storedAt: new Date().toISOString(),
  };
  const rawEnvelope = JSON.stringify(envelope);

  await AsyncStorage.setItem(VAULT_STORAGE_KEY, rawEnvelope);
  cachedEnvelopeRaw = rawEnvelope;
  cachedEnvelope = envelope;
  cachedVaultRaw = rawEnvelope;
  cachedVaultItems = items;
}

async function ensureVaultDirectory() {
  if (!FileSystem.documentDirectory) {
    return null;
  }

  const directoryInfo = await FileSystem.getInfoAsync(VAULT_DIRECTORY);
  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(VAULT_DIRECTORY, { intermediates: true });
  }

  return VAULT_DIRECTORY;
}

async function byteHash(bytes: Uint8Array) {
  const hash = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, new Uint8Array(bytes));
  return Array.from(new Uint8Array(hash), (value) => value.toString(16).padStart(2, "0")).join("");
}

export async function readOfflineEvidenceAttachment(attachment: OfflineEvidenceAttachment): Promise<Uint8Array> {
  const base64 = await FileSystem.readAsStringAsync(attachment.vaultUri ?? attachment.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bytes = attachment.encryption
    ? await aesDecryptAsync(AESSealedData.fromCombined(base64), await getVaultEncryptionKey(false), {
        output: "bytes",
        additionalData: TEXT_ENCODER.encode(attachment.encryptionAad ?? ""),
      }) as Uint8Array
    : base64ToBytes(base64);
  if (attachment.sha256) {
    const actual = attachment.digestEncoding === "bytes"
      ? await byteHash(bytes)
      : await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, bytesToBase64(bytes));
    if (actual !== attachment.sha256) throw new Error("Evidence attachment integrity check failed.");
  }
  return bytes;
}

async function sealAttachmentCopy(
  attachment: OfflineEvidenceAttachment | null | undefined,
  itemId: string,
): Promise<OfflineEvidenceAttachment | null> {
  if (!attachment) return null;
  const directory = await ensureVaultDirectory();
  if (!directory) throw new Error("Secure local evidence storage is unavailable on this device.");

  const aad = `safesteps.evidence.attachment:${itemId}`;
  const vaultPath = `${itemId}.enc`;
  const vaultUri = `${directory}${vaultPath}`;
  // A completed encrypted copy can outlive its camera-cache source during a crash.
  let bytes: Uint8Array;
  if ((await FileSystem.getInfoAsync(vaultUri)).exists) {
    try {
      bytes = await readOfflineEvidenceAttachment({ ...attachment, uri: vaultUri, vaultUri,
        encryption: "AES-256-GCM", encryptionAad: aad, sha256: undefined });
    } catch {
      bytes = await readOfflineEvidenceAttachment(attachment);
    }
  } else {
    bytes = await readOfflineEvidenceAttachment(attachment);
  }
  const sealedData = await aesEncryptAsync(bytes, await getVaultEncryptionKey(), {
    additionalData: TEXT_ENCODER.encode(aad), nonce: { length: 12 }, tagLength: 16,
  });
  await FileSystem.writeAsStringAsync(vaultUri, await sealedData.combined("base64") as string, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return {
    ...attachment, originalUri: attachment.originalUri ?? attachment.uri,
    uri: vaultUri, vaultUri, vaultPath, encryption: "AES-256-GCM", encryptionAad: aad,
    digestEncoding: "bytes", sha256: await byteHash(bytes), byteSize: bytes.byteLength,
    copiedAt: new Date().toISOString(),
  };
}

// History remains available for full-chain verification after delivery.
export function getOfflineEvidenceVaultHistory() {
  return serializeVault(async () => cloneVaultValue(await readVault()));
}

export function getOfflineEvidenceVaultItems(ownerId?: string) {
  return serializeVault(async () => cloneVaultValue((await readVault()).filter(
    (item) => item.status !== "synced" && item.status !== "retained" && (!ownerId || item.ownerId === ownerId),
  )));
}

type PendingSeal = { id: string; sealedAt: string; input: QueueOfflineEvidenceInput };

async function readPendingSeals(): Promise<PendingSeal[]> {
  const raw = await AsyncStorage.getItem(PENDING_SEALS_KEY);
  if (!raw) return [];
  const bytes = await aesDecryptAsync(AESSealedData.fromCombined(raw), await getVaultEncryptionKey(false), {
    output: "bytes", additionalData: TEXT_ENCODER.encode(PENDING_SEALS_KEY),
  });
  return JSON.parse(TEXT_DECODER.decode(bytes as Uint8Array));
}

async function writePendingSeals(pending: PendingSeal[]) {
  const sealed = await aesEncryptAsync(TEXT_ENCODER.encode(JSON.stringify(pending)), await getVaultEncryptionKey(), {
    additionalData: TEXT_ENCODER.encode(PENDING_SEALS_KEY), nonce: { length: 12 }, tagLength: 16,
  });
  await AsyncStorage.setItem(PENDING_SEALS_KEY, await sealed.combined("base64") as string);
}

async function finishSeal(draft: PendingSeal, items: OfflineEvidenceVaultItem[]) {
  const { input, id: itemId, sealedAt } = draft;
  const sealedAttachment = await sealAttachmentCopy(input.attachment, itemId);
  const queued = await withIntegrityHash({
    ...(input.requiresConfirmation ? { requiresConfirmation: true } : {}),
    id: itemId, ownerId: input.ownerId, title: input.title, notes: input.notes ?? "",
    evidenceType: input.evidenceType ?? null, purpose: input.purpose ?? null,
    structuredData: input.structuredData ?? null, attachment: sealedAttachment,
    createdAt: sealedAt, status: "queued", syncAttempts: 0,
    sealedDeliveryState: { status: "queued", syncAttempts: 0, lastError: null },
    previousHash: items[0]?.integrityHash ?? INITIAL_HASH, hashAlgorithm: "sha256", sealedAt, schemaVersion: 2,
  });
  await writeVault([queued, ...items]);
  return queued;
}

async function recoverPendingSeals() {
  let items = await readStoredVault();
  const pending = await readPendingSeals();
  if (!pending.length) return { items, recoveredCount: 0, failedCount: 0 };
  if (!await verifyOfflineEvidenceVaultChain(items)) throw new Error("Evidence history failed verification.");
  const failed: PendingSeal[] = [];
  let recoveredCount = 0;
  for (const draft of pending) {
    // A crash after the vault write must not register a second copy.
    if (items.some((item) => item.id === draft.id)) continue;
    try {
      const queued = await finishSeal(draft, items);
      items = [queued, ...items];
      recoveredCount += 1;
    } catch {
      // Keep missing or interrupted captures in the recovery journal for support.
      failed.push(draft);
    }
  }
  await writePendingSeals(failed);
  return { items, recoveredCount, failedCount: failed.length };
}

async function readVault() {
  return (await recoverPendingSeals()).items;
}

export function recoverOfflineEvidenceCaptures() {
  return serializeVault(async () => {
    const { recoveredCount, failedCount } = await recoverPendingSeals();
    return { recoveredCount, failedCount };
  });
}

export function queueOfflineEvidence(input: QueueOfflineEvidenceInput) {
  input = cloneVaultValue(input);
  return serializeVault(async () => {
    const items = await readVault();
    if (!await verifyOfflineEvidenceVaultChain(items)) {
      throw new Error("Existing evidence history failed verification. Keep this device and contact support.");
    }
    const pending = await readPendingSeals();
    if (input.captureId && !/^[0-9a-f-]{36}$/i.test(input.captureId)) throw new Error("Invalid capture identity.");
    const id = `offline-evidence-${input.captureId ?? Crypto.randomUUID()}`;
    const existing = items.find((item) => item.id === id);
    if (existing) {
      if (existing.ownerId !== input.ownerId) throw new Error("Capture owner mismatch.");
      return cloneVaultValue(existing);
    }
    if (pending.some((draft) => draft.id === id)) {
      throw new Error("This capture still needs recovery. Its original recovery context has been retained.");
    }
    const draft = { id, sealedAt: new Date().toISOString(), input };
    // Persist capture context before encrypting/copying bytes so launch recovery can retry.
    await writePendingSeals([...pending, draft]);
    const queued = await finishSeal(draft, items);
    // If cleanup fails the durable item is still safe; recovery deduplicates it by id.
    await writePendingSeals(pending).catch(() => undefined);
    return cloneVaultValue(queued);
  });
}

export async function verifyOfflineEvidenceVaultChain(items: OfflineEvidenceVaultItem[]) {
  const chronological = [...items].reverse();
  let previousHash = INITIAL_HASH;

  for (const item of chronological) {
    if (item.previousHash !== previousHash) {
      return false;
    }

    const { integrityHash, ...hashInput } = item;
    const expectedHash = await createEvidenceVaultHash(vaultRecordForHash(hashInput));

    if (integrityHash !== expectedHash) {
      return false;
    }

    if (item.attachment?.vaultUri && item.attachment.sha256) {
      try {
        await readOfflineEvidenceAttachment(item.attachment);
      } catch {
        return false;
      }
    }

    previousHash = item.integrityHash;
  }

  return true;
}

// Retire from the delivery queue, never remove a custody-chain member or its bytes.
export function removeOfflineEvidenceItem(itemId: string) {
  return updateDeliveryState(itemId, (item) => ({ ...item, status: "synced", syncedAt: new Date().toISOString() }));
}

function updateDeliveryState(itemId: string, update: (item: OfflineEvidenceVaultItem) => OfflineEvidenceVaultItem) {
  return serializeVault(async () => {
    const items = await readVault();
    if (!await verifyOfflineEvidenceVaultChain(items)) throw new Error("Evidence history failed verification.");
    const nextItems = items.map((item) => {
      if (item.id !== itemId || (item.status === "synced" || item.status === "retained")) return item;
      // Preserve the original projection for legacy v2 hashes too.
      const sealedDeliveryState = item.sealedDeliveryState ?? {
        status: item.status, syncAttempts: item.syncAttempts, lastError: item.lastError ?? null,
      };
      return update({ ...item, sealedDeliveryState });
    });
    await writeVault(nextItems);
  });
}

export function retainOfflineEvidenceDraft(itemId: string, ownerId: string) {
  return updateDeliveryState(itemId, (item) => {
    if (item.ownerId !== ownerId || !item.requiresConfirmation) throw new Error("Only a capture draft may be retained locally.");
    return { ...item, status: "retained" };
  });
}

export type EvidenceCaptureIntent = { ownerId: string; captureId: string; startedAt: string };

async function readPickerIntent(): Promise<EvidenceCaptureIntent | null> {
  const raw = await AsyncStorage.getItem(PICKER_INTENT_KEY);
  if (!raw) return null;
  const bytes = await aesDecryptAsync(AESSealedData.fromCombined(raw), await getVaultEncryptionKey(false), {
    output: "bytes", additionalData: TEXT_ENCODER.encode(PICKER_INTENT_KEY),
  });
  return JSON.parse(TEXT_DECODER.decode(bytes as Uint8Array));
}

export function getEvidenceCaptureIntent() {
  return serializeVault(readPickerIntent);
}

export function beginEvidenceCapture(ownerId: string) {
  return serializeVault(async () => {
    if (await readPickerIntent()) throw new Error("A previous capture needs recovery. Reopen the app before starting another capture.");
    const intent = { ownerId, captureId: Crypto.randomUUID(), startedAt: new Date().toISOString() };
    const sealed = await aesEncryptAsync(TEXT_ENCODER.encode(JSON.stringify(intent)), await getVaultEncryptionKey(), {
      additionalData: TEXT_ENCODER.encode(PICKER_INTENT_KEY), nonce: { length: 12 }, tagLength: 16,
    });
    await AsyncStorage.setItem(PICKER_INTENT_KEY, await sealed.combined("base64") as string);
    return intent;
  });
}

export function finishEvidenceCaptureIntent(captureId: string) {
  return serializeVault(async () => {
    if ((await readPickerIntent())?.captureId === captureId) await AsyncStorage.removeItem(PICKER_INTENT_KEY);
  });
}

export function markOfflineEvidenceSyncFailed(itemId: string, errorMessage: string) {
  return updateDeliveryState(itemId, (item) => ({
    ...item, status: "failed", syncAttempts: item.syncAttempts + 1, lastError: errorMessage,
  }));
}

export function assertOfflineEvidenceSynced(ownerId: string) {
  return serializeVault(async () => {
    const pending = (await readVault()).filter((item) => item.ownerId === ownerId && item.status !== "synced" && item.status !== "retained");
    const interrupted = (await readPendingSeals()).filter((draft) => draft.input.ownerId === ownerId);
    const pickerPending = (await readPickerIntent())?.ownerId === ownerId ? 1 : 0;
    if (pending.length || interrupted.length || pickerPending) throw new Error(
      `${pending.length + interrupted.length + pickerPending} evidence item(s) have not synced. Open Evidence and sync before signing out. Clearing app data or uninstalling can permanently lose them.`,
    );
  });
}

export function getOfflineEvidenceVaultSecurityStatus(): Promise<OfflineVaultSecurityStatus> {
  return serializeVault(async () => {
    const items = await readVault();
    const raw = await AsyncStorage.getItem(VAULT_STORAGE_KEY);
    const keyAvailable = Boolean(await SecureStore.getItemAsync(VAULT_KEY_STORAGE_KEY));
    return {
      encryptedEnvelope: raw ? parseVaultEnvelope(raw).encrypted === true : keyAvailable,
      secureStoreKey: keyAvailable,
      appControlledAttachmentCopies: items.every((item) => !item.attachment || Boolean(item.attachment.vaultUri)),
      encryptedAttachments: items.every((item) => !item.attachment || item.attachment.encryption === "AES-256-GCM"),
      sha256HashChain: await verifyOfflineEvidenceVaultChain(items),
      itemCount: items.filter((item) => item.status !== "synced" && item.status !== "retained").length,
      pendingRecoveryCount: (await readPendingSeals()).length + (await readPickerIntent() ? 1 : 0),
    };
  });
}

export const __offlineEvidenceVaultTestUtils = {
  base64ToBytes,
  bytesToBase64,
  stableStringify,
};
