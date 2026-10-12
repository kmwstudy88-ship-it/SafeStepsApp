import type { SafeStepsEvidenceRecord } from "./EvidenceModel";

export type SafeStepsSafetyReviewRecord = SafeStepsEvidenceRecord & {
  flagged?: boolean;
  reviewReason?: string;
};

const REVIEW_TERMS = ["violence", "sex", "drugs", "abuse", "self-harm"];

export function finalSafetyCheck(record: SafeStepsSafetyReviewRecord): SafeStepsSafetyReviewRecord {
  const text = JSON.stringify(record.actionData).toLowerCase();
  const matchedTerm = REVIEW_TERMS.find((term) => text.includes(term));

  if (!matchedTerm) {
    return record;
  }

  return {
    ...record,
    actionData: "[filtered]",
    flagged: true,
    hiddenFromWorker: false,
    reviewReason: `Review term detected: ${matchedTerm}`,
  };
}
