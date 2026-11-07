/** @jest-environment node */
import * as picker from "expo-image-picker";
import * as vault from "../lib/engines/offlineEvidenceVault";
import { pickDurableEvidence, recoverEvidencePicker } from "../lib/engines/evidenceCapture";
jest.mock("expo-image-picker", () => ({
  launchCameraAsync: jest.fn(), launchImageLibraryAsync: jest.fn(), getPendingResultAsync: jest.fn(),
}));
jest.mock("../lib/engines/offlineEvidenceVault", () => ({
  beginEvidenceCapture: jest.fn(), finishEvidenceCaptureIntent: jest.fn(),
  getEvidenceCaptureIntent: jest.fn(), queueOfflineEvidence: jest.fn(),
}));
const intent = { ownerId: "user-1", captureId: "capture-id", startedAt: "2026-11-08T00:00:00Z" };
const result = { canceled: false, assets: [{ uri: "file:///capture.jpg", mimeType: "image/jpeg", type: "image" }] };
beforeEach(() => {
  jest.clearAllMocks();
  (vault.beginEvidenceCapture as jest.Mock).mockResolvedValue(intent);
  (vault.getEvidenceCaptureIntent as jest.Mock).mockResolvedValue(intent);
  (vault.queueOfflineEvidence as jest.Mock).mockImplementation(async (input) => ({ id: "draft-id", ...input }));
  (picker.launchCameraAsync as jest.Mock).mockResolvedValue(result);
  (picker.getPendingResultAsync as jest.Mock).mockResolvedValue(result);
});

test("preserves capture intent before launching and seals before clearing ownership", async () => {
  await pickDurableEvidence("user-1", "camera");
  expect((vault.beginEvidenceCapture as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan((picker.launchCameraAsync as jest.Mock).mock.invocationCallOrder[0]);
  expect((vault.queueOfflineEvidence as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan((vault.finishEvidenceCaptureIntent as jest.Mock).mock.invocationCallOrder[0]);
  expect(vault.queueOfflineEvidence).toHaveBeenCalledWith(expect.objectContaining({ requiresConfirmation: true, captureId: intent.captureId, attachment: expect.objectContaining({ source: "live", capturedAt: intent.startedAt }) }));
});

test("recovered results remain unverified and await confirmation", async () => {
  await recoverEvidencePicker("user-1");
  expect(vault.queueOfflineEvidence).toHaveBeenCalledWith(expect.objectContaining({ requiresConfirmation: true, structuredData: expect.objectContaining({ source_reliability: "unverified" }) }));
});

test("does not attach a previous account's capture to the new account", async () => {
  await recoverEvidencePicker("user-2");
  expect(picker.getPendingResultAsync).not.toHaveBeenCalled();
  expect(vault.queueOfflineEvidence).not.toHaveBeenCalled();
});

test("does not consume recovery while a picker is still active", async () => {
  let complete!: (value: any) => void;
  (picker.launchCameraAsync as jest.Mock).mockImplementationOnce(() => new Promise((resolve) => { complete = resolve; }));
  const active = pickDurableEvidence("user-1", "camera");
  await Promise.resolve();
  await recoverEvidencePicker("user-1");
  expect(picker.getPendingResultAsync).not.toHaveBeenCalled();
  complete(result);
  await active;
});

test("missing recordings retain an interruption record without inventing media", async () => {
  (picker.getPendingResultAsync as jest.Mock).mockResolvedValueOnce(null);
  await recoverEvidencePicker("user-1");
  expect(vault.queueOfflineEvidence).toHaveBeenCalledWith(expect.objectContaining({ requiresConfirmation: true, attachment: null, structuredData: expect.objectContaining({ media_unavailable: true }) }));
});

test("canceled capture clears intent without making evidence", async () => {
  (picker.launchCameraAsync as jest.Mock).mockResolvedValueOnce({ canceled: true, assets: null });
  await pickDurableEvidence("user-1", "camera");
  expect(vault.queueOfflineEvidence).not.toHaveBeenCalled();
  expect(vault.finishEvidenceCaptureIntent).toHaveBeenCalledWith(intent.captureId);
});

test("a failed seal keeps the capture intent for recovery", async () => {
  (vault.queueOfflineEvidence as jest.Mock).mockRejectedValueOnce(new Error("Storage full"));
  await expect(pickDurableEvidence("user-1", "camera")).rejects.toThrow("Storage full");
  expect(vault.finishEvidenceCaptureIntent).not.toHaveBeenCalled();
});
