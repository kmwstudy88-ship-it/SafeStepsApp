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
  status: "queued" | "syncing" | "failed";
  syncAttempts: number;
  lastError?: string;
  previousHash: string;
  integrityHash: string;
  hashAlgorithm: "sha256";
  sealedAt: string;
  schemaVersion: 2;
};

export type QueueOfflineEvidenceInput = {
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
  sha256HashChain: boolean;
  itemCount: number;
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
const INITIAL_HASH = "vault-root";
const VAULT_DIRECTORY = `${FileSystem.documentDirectory ?? ""}safesteps-offline-evidence/`;
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

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
    id: item.id,
    ownerId: item.ownerId,
    title: item.title,
    notes: item.notes,
    evidenceType: item.evidenceType ?? null,
    purpose: item.purpose ?? null,
    structuredData: item.structuredData ?? null,
    attachment: item.attachment,
    createdAt: item.createdAt,
    status: item.status,
    syncAttempts: item.syncAttempts,
    lastError: item.lastError ?? null,
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

async function getVaultEncryptionKey() {
  const options: SecureStore.SecureStoreOptions = {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
  const existingKey = await SecureStore.getItemAsync(VAULT_KEY_STORAGE_KEY, options);

  if (existingKey) {
    return AESEncryptionKey.import(existingKey, "base64");
  }

  const generatedKey = await AESEncryptionKey.generate(AESKeySize.AES256);
  const keyBase64 = await generatedKey.encoded("base64");
  await SecureStore.setItemAsync(VAULT_KEY_STORAGE_KEY, keyBase64, options);
  return generatedKey;
}

async function readEncryptedVault(raw: string) {
  const envelope = JSON.parse(raw) as VaultEnvelope;
  const key = await getVaultEncryptionKey();
  const sealedData = AESSealedData.fromCombined(envelope.ciphertext);
  const decrypted = await aesDecryptAsync(sealedData, key, {
    output: "bytes",
    additionalData: TEXT_ENCODER.encode(envelope.aad),
  });

  return JSON.parse(TEXT_DECODER.decode(decrypted as Uint8Array)) as OfflineEvidenceVaultItem[];
}

async function readVault() {
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

  await AsyncStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(envelope));
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

function getSafeFileExtension(fileName?: string, mimeType?: string) {
  const fallbackByMime: Record<string, string> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "text/plain": "txt",
  };
  const extension = fileName?.split(".").pop() ?? (mimeType ? fallbackByMime[mimeType] : undefined) ?? "bin";

  return extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
}

async function hashFile(uri: string) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, base64);
}

async function sealAttachmentCopy(
  attachment: OfflineEvidenceAttachment | null | undefined,
  itemId: string,
): Promise<OfflineEvidenceAttachment | null> {
  if (!attachment) {
    return null;
  }

  const directory = await ensureVaultDirectory();
  if (!directory) {
    return {
      ...attachment,
      originalUri: attachment.originalUri ?? attachment.uri,
    };
  }

  const extension = getSafeFileExtension(attachment.name, attachment.mimeType);
  const vaultPath = `${itemId}.${extension}`;
  const vaultUri = `${directory}${vaultPath}`;

  await FileSystem.copyAsync({
    from: attachment.vaultUri ?? attachment.uri,
    to: vaultUri,
  });

  const fileInfo = await FileSystem.getInfoAsync(vaultUri);

  return {
    ...attachment,
    originalUri: attachment.originalUri ?? attachment.uri,
    uri: vaultUri,
    vaultUri,
    vaultPath,
    sha256: await hashFile(vaultUri),
    byteSize: fileInfo.exists && "size" in fileInfo ? fileInfo.size : undefined,
    copiedAt: new Date().toISOString(),
  };
}

export async function getOfflineEvidenceVaultItems(ownerId?: string) {
  const items = await readVault();

  return ownerId ? items.filter((item) => item.ownerId === ownerId) : items;
}

export async function queueOfflineEvidence(input: QueueOfflineEvidenceInput) {
  const items = await getOfflineEvidenceVaultItems();
  const previousHash = items.at(-1)?.integrityHash ?? INITIAL_HASH;
  const itemId = `offline-evidence-${Crypto.randomUUID()}`;
  const sealedAt = new Date().toISOString();
  const sealedAttachment = await sealAttachmentCopy(input.attachment, itemId);
  const queued = await withIntegrityHash({
    id: itemId,
    ownerId: input.ownerId,
    title: input.title,
    notes: input.notes ?? "",
    evidenceType: input.evidenceType ?? null,
    purpose: input.purpose ?? null,
    structuredData: input.structuredData ?? null,
    attachment: sealedAttachment,
    createdAt: sealedAt,
    status: "queued",
    syncAttempts: 0,
    previousHash,
    hashAlgorithm: "sha256",
    sealedAt,
    schemaVersion: 2,
  });

  await writeVault([queued, ...items]);

  return queued;
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
      const currentFileHash = await hashFile(item.attachment.vaultUri);
      if (currentFileHash !== item.attachment.sha256) {
        return false;
      }
    }

    previousHash = item.integrityHash;
  }

  return true;
}

export async function removeOfflineEvidenceItem(itemId: string) {
  const items = await getOfflineEvidenceVaultItems();
  const item = items.find((candidate) => candidate.id === itemId);

  if (item?.attachment?.vaultUri) {
    const fileInfo = await FileSystem.getInfoAsync(item.attachment.vaultUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(item.attachment.vaultUri, { idempotent: true });
    }
  }

  await writeVault(items.filter((candidate) => candidate.id !== itemId));
}

export async function markOfflineEvidenceSyncFailed(itemId: string, errorMessage: string) {
  const items = await getOfflineEvidenceVaultItems();
  const nextItems = await Promise.all(
    items.map(async (item) => {
      if (item.id !== itemId) return item;

      const { integrityHash, ...hashInput } = item;

      return withIntegrityHash({
        ...hashInput,
        status: "failed",
        syncAttempts: item.syncAttempts + 1,
        lastError: errorMessage,
      });
    }),
  );

  await writeVault(nextItems);
}

export async function getOfflineEvidenceVaultSecurityStatus(): Promise<OfflineVaultSecurityStatus> {
  const raw = await AsyncStorage.getItem(VAULT_STORAGE_KEY);
  const keyAvailable = Boolean(await SecureStore.getItemAsync(VAULT_KEY_STORAGE_KEY));
  const items = await getOfflineEvidenceVaultItems();

  return {
    encryptedEnvelope: raw ? (JSON.parse(raw) as VaultEnvelope).encrypted === true : keyAvailable,
    secureStoreKey: keyAvailable,
    appControlledAttachmentCopies: items.every((item) => !item.attachment || Boolean(item.attachment.vaultUri)),
    sha256HashChain: await verifyOfflineEvidenceVaultChain(items),
    itemCount: items.length,
  };
}

export const __offlineEvidenceVaultTestUtils = {
  base64ToBytes,
  bytesToBase64,
  stableStringify,
};
