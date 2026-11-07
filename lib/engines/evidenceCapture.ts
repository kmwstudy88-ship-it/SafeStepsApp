import * as ImagePicker from "expo-image-picker";
import {
  beginEvidenceCapture, finishEvidenceCaptureIntent, getEvidenceCaptureIntent,
  queueOfflineEvidence, type EvidenceCaptureIntent, type OfflineEvidenceAttachment,
} from "./offlineEvidenceVault";

const activePickers = new Set<string>();

async function preservePickerResult(intent: EvidenceCaptureIntent, result: ImagePicker.ImagePickerResult | ImagePicker.ImagePickerErrorResult | null, source: "media" | "live" = "media") {
  if (result && "canceled" in result && result.canceled) {
    await finishEvidenceCaptureIntent(intent.captureId);
    return null;
  }
  const asset = result && "assets" in result ? result.assets?.[0] : null;
  const draft = await queueOfflineEvidence({
    ownerId: intent.ownerId, captureId: intent.captureId, requiresConfirmation: true,
    title: asset ? "Captured media awaiting context and confirmation" : "Interrupted capture: no recoverable media returned",
    notes: "Unverified capture. Review the source and add context before confirming submission.",
    structuredData: { picker_started_at: intent.startedAt, source_reliability: "unverified", media_unavailable: !asset },
    attachment: asset ? {
      uri: asset.uri, name: asset.fileName ?? `capture.${asset.type === "video" ? "mp4" : "jpg"}`,
      mimeType: asset.mimeType, source, ...(source === "live" ? { capturedAt: intent.startedAt } : {}),
    } : null,
  });
  await finishEvidenceCaptureIntent(intent.captureId);
  return { draft, asset };
}

// Persist ownership before invoking the external activity. Drafts never auto-upload.
export async function pickDurableEvidence(ownerId: string, source: "camera" | "library") {
  const intent = await beginEvidenceCapture(ownerId);
  const options: ImagePicker.ImagePickerOptions = {
    allowsEditing: false, mediaTypes: ["images", "videos"], quality: 1, videoMaxDuration: 90,
  };
  activePickers.add(intent.captureId);
  try {
    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    return await preservePickerResult(intent, result, source === "camera" ? "live" : "media");
  } finally { activePickers.delete(intent.captureId); }
}

export async function recoverEvidencePicker(ownerId: string) {
  const intent = await getEvidenceCaptureIntent();
  if (!intent || intent.ownerId !== ownerId || activePickers.has(intent.captureId)) return;
  const result = await ImagePicker.getPendingResultAsync();
  await preservePickerResult(intent, result);
}

export function attachmentFromCaptureDraft(draft: { id: string; attachment: OfflineEvidenceAttachment | null }) {
  return draft.attachment ? { ...draft.attachment, captureDraftId: draft.id } : null;
}
