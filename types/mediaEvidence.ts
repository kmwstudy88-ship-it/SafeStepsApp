/** Media evidence is a review aid, not an authenticity or admissibility finding. */
export type MediaEvidence = {
  id: string;
  caseId: string;
  familyId: string;
  childId?: string;
  mediaType: 'photo' | 'video' | 'audio';
  sourceType: 'in_app_capture' | 'device_upload' | 'professional_upload';
  originalFilename: string;
  mimeType: string;
  byteSize: number;
  /** Null until the server has hashed the complete, sealed upload. */
  sha256: string | null;
  claimedCapturedAt?: string;
  extractedCapturedAt?: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadStatus: 'initiated' | 'preserving' | 'preserved' | 'failed';
  integrityStatus: 'pending' | 'verified' | 'verification_failed';
  /** Warnings do not change whether stored bytes match the recorded hash. */
  safetyStatus: 'quarantined' | 'scanning' | 'cleared' | 'restricted' | 'escalated';
  analysisStatus: 'not_started' | 'queued' | 'processing' | 'human_review_required' | 'completed' | 'failed';
  retentionClass: string;
  legalHold: boolean;
};

export type MediaFinding = {
  id: string;
  evidenceId: string;
  sourceFileId: string;
  finding: string;
  confidence: number | null;
  confidenceBasis: string;
  sourceTimestamp: string | null;
  method: string;
  modelVersion: string;
  limitations: string;
  reviewStatus: 'human_review_required';
  supersedesId?: string;
};
