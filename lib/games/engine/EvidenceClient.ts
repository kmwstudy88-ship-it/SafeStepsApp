import type { SafeStepsEvidenceRecord } from "./EvidenceModel";

const queuedEvidence: SafeStepsEvidenceRecord[] = [];

export function sendEvidence(record: SafeStepsEvidenceRecord) {
  queuedEvidence.push(record);
  return record;
}

export function getQueuedEvidence() {
  return [...queuedEvidence];
}

export function clearQueuedEvidence() {
  queuedEvidence.length = 0;
}
