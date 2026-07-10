import AsyncStorage from "@react-native-async-storage/async-storage";

export type OfflineEvidenceAttachment = {
  uri: string;
  name: string;
  mimeType?: string;
  source: "document" | "media" | "live" | "program";
};

export type OfflineEvidenceVaultItem = {
  id: string;
  ownerId: string;
  title: string;
  notes: string;
  attachment: OfflineEvidenceAttachment | null;
  createdAt: string;
  status: "queued" | "syncing" | "failed";
  syncAttempts: number;
  lastError?: string;
  previousHash: string;
  integrityHash: string;
};

export type QueueOfflineEvidenceInput = {
  ownerId: string;
  title: string;
  notes?: string;
  attachment?: OfflineEvidenceAttachment | null;
};

const VAULT_STORAGE_KEY = "safesteps.offlineEvidenceVault.v1";
const INITIAL_HASH = "vault-root";

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

export function createEvidenceVaultHash(value: unknown) {
  const input = stableStringify(value);
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }

  return `tev-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function vaultRecordForHash(item: Omit<OfflineEvidenceVaultItem, "integrityHash">) {
  return {
    id: item.id,
    ownerId: item.ownerId,
    title: item.title,
    notes: item.notes,
    attachment: item.attachment,
    createdAt: item.createdAt,
    status: item.status,
    syncAttempts: item.syncAttempts,
    lastError: item.lastError ?? null,
    previousHash: item.previousHash,
  };
}

function withIntegrityHash(item: Omit<OfflineEvidenceVaultItem, "integrityHash">): OfflineEvidenceVaultItem {
  return {
    ...item,
    integrityHash: createEvidenceVaultHash(vaultRecordForHash(item)),
  };
}

async function writeVault(items: OfflineEvidenceVaultItem[]) {
  await AsyncStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(items));
}

export async function getOfflineEvidenceVaultItems(ownerId?: string) {
  const raw = await AsyncStorage.getItem(VAULT_STORAGE_KEY);
  const items = raw ? (JSON.parse(raw) as OfflineEvidenceVaultItem[]) : [];

  return ownerId ? items.filter((item) => item.ownerId === ownerId) : items;
}

export async function queueOfflineEvidence(input: QueueOfflineEvidenceInput) {
  const items = await getOfflineEvidenceVaultItems();
  const previousHash = items.at(-1)?.integrityHash ?? INITIAL_HASH;
  const queued = withIntegrityHash({
    id: `offline-evidence-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ownerId: input.ownerId,
    title: input.title,
    notes: input.notes ?? "",
    attachment: input.attachment ?? null,
    createdAt: new Date().toISOString(),
    status: "queued",
    syncAttempts: 0,
    previousHash,
  });

  await writeVault([queued, ...items]);

  return queued;
}

export function verifyOfflineEvidenceVaultChain(items: OfflineEvidenceVaultItem[]) {
  const chronological = [...items].reverse();
  let previousHash = INITIAL_HASH;

  for (const item of chronological) {
    if (item.previousHash !== previousHash) {
      return false;
    }

    const expectedHash = createEvidenceVaultHash(vaultRecordForHash(item));

    if (item.integrityHash !== expectedHash) {
      return false;
    }

    previousHash = item.integrityHash;
  }

  return true;
}

export async function removeOfflineEvidenceItem(itemId: string) {
  const items = await getOfflineEvidenceVaultItems();
  await writeVault(items.filter((item) => item.id !== itemId));
}

export async function markOfflineEvidenceSyncFailed(itemId: string, errorMessage: string) {
  const items = await getOfflineEvidenceVaultItems();
  const nextItems = items.map((item) => {
    if (item.id !== itemId) return item;

    return withIntegrityHash({
      ...item,
      status: "failed",
      syncAttempts: item.syncAttempts + 1,
      lastError: errorMessage,
    });
  });

  await writeVault(nextItems);
}

