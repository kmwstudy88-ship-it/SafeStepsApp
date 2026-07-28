jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-crypto", () => ({
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digestStringAsync: jest.fn(async (_algorithm: string, value: string) => {
    let hash = 5381;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 33) ^ value.charCodeAt(index);
    }
    return (hash >>> 0).toString(16).padStart(64, "0");
  }),
  randomUUID: jest.fn(() => "test-uuid"),
  getRandomBytesAsync: jest.fn(async (count: number) => new Uint8Array(count).fill(7)),
  AESEncryptionKey: {
    generate: jest.fn(async () => ({
      encoded: jest.fn(async () => "test-key"),
    })),
    import: jest.fn(async () => ({
      encoded: jest.fn(async () => "test-key"),
    })),
  },
  AESKeySize: { AES256: 256 },
  AESSealedData: {
    fromCombined: jest.fn(() => ({})),
  },
  aesEncryptAsync: jest.fn(async () => ({
    combined: jest.fn(async () => "sealed"),
  })),
  aesDecryptAsync: jest.fn(async () => new TextEncoder().encode("[]")),
}));

import {
  createEvidenceVaultHash,
  verifyOfflineEvidenceVaultChain,
  type OfflineEvidenceVaultItem,
} from "../lib/engines/offlineEvidenceVault";

jest.mock("expo-secure-store", () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///vault/",
  EncodingType: { Base64: "base64" },
  getInfoAsync: jest.fn(async () => ({ exists: false })),
  makeDirectoryAsync: jest.fn(async () => undefined),
  copyAsync: jest.fn(async () => undefined),
  readAsStringAsync: jest.fn(async () => "file-bytes"),
  deleteAsync: jest.fn(async () => undefined),
}));

async function makeVaultItem(
  id: string,
  previousHash: string,
) {
  const base = {
    id,
    ownerId: "user-1",
    title: `Evidence ${id}`,
    notes: "Captured offline",
    evidenceType: null,
    purpose: null,
    structuredData: null,
    attachment: null,
    createdAt: `2026-07-10T00:00:0${id}.000Z`,
    status: "queued" as const,
    syncAttempts: 0,
    previousHash,
    hashAlgorithm: "sha256" as const,
    sealedAt: `2026-07-10T00:00:0${id}.000Z`,
    schemaVersion: 2 as const,
  };

  return {
    ...base,
    integrityHash: await createEvidenceVaultHash({
      ...base,
      lastError: null,
    }),
  } satisfies OfflineEvidenceVaultItem;
}

describe("offline evidence vault", () => {
  test("validates a tamper-evident hash chain", async () => {
    const first = await makeVaultItem("1", "vault-root");
    const second = await makeVaultItem("2", first.integrityHash);

    await expect(verifyOfflineEvidenceVaultChain([second, first])).resolves.toBe(true);
  });

  test("detects changed evidence metadata", async () => {
    const first = await makeVaultItem("1", "vault-root");
    const second = await makeVaultItem("2", first.integrityHash);

    await expect(
      verifyOfflineEvidenceVaultChain([
        { ...second, title: "Changed after capture" },
        first,
      ]),
    ).resolves.toBe(false);
  });
});
