jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import {
  createEvidenceVaultHash,
  verifyOfflineEvidenceVaultChain,
  type OfflineEvidenceVaultItem,
} from "../lib/engines/offlineEvidenceVault";

function makeVaultItem(
  id: string,
  previousHash: string,
): OfflineEvidenceVaultItem {
  const base = {
    id,
    ownerId: "user-1",
    title: `Evidence ${id}`,
    notes: "Captured offline",
    attachment: null,
    createdAt: `2026-07-10T00:00:0${id}.000Z`,
    status: "queued" as const,
    syncAttempts: 0,
    previousHash,
  };

  return {
    ...base,
    integrityHash: createEvidenceVaultHash({
      ...base,
      lastError: null,
    }),
  };
}

describe("offline evidence vault", () => {
  test("validates a tamper-evident hash chain", () => {
    const first = makeVaultItem("1", "vault-root");
    const second = makeVaultItem("2", first.integrityHash);

    expect(verifyOfflineEvidenceVaultChain([second, first])).toBe(true);
  });

  test("detects changed evidence metadata", () => {
    const first = makeVaultItem("1", "vault-root");
    const second = makeVaultItem("2", first.integrityHash);

    expect(
      verifyOfflineEvidenceVaultChain([
        { ...second, title: "Changed after capture" },
        first,
      ]),
    ).toBe(false);
  });
});
