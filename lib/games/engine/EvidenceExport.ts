import type { SafeStepsEvidenceRecord } from "./EvidenceModel";

export function exportEvidence(records: SafeStepsEvidenceRecord[]) {
  return records
    .filter((record) => !record.hiddenFromWorker)
    .map((record) => ({
      gameId: record.gameId,
      playerId: record.playerId,
      actionType: record.actionType,
      actionData: record.actionData,
      timestamp: record.timestamp,
      privacy: record.privacy,
      childSafetyMode: record.childSafetyMode,
    }));
}
