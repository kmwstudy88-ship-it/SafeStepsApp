export type EvidenceStatus =
  | "uploaded"
  | "pending_review"
  | "verified"
  | "partially_verified"
  | "rejected"
  | "superseded"
  | "archived";

export interface EvidenceRecord {
  id: string;
  tenant_id: string;
  case_id: string | null;
  family_id: string | null;
  child_id: string | null;
  evidence_reference: string;
  evidence_title: string;
  evidence_description: string | null;
  evidence_type: string;
  evidence_source: string;
  evidence_status: EvidenceStatus;
  privacy_level: string;
  uploader_user_id: string | null;
  uploaded_at: string;
  legal_hold: boolean;
  deleted: boolean;
}

export interface EvidenceVaultDashboard {
  tenant_id: string;
  case_id: string | null;
  evidence_count: number;
  pending_verification_count: number;
  legal_hold_count: number;
  pending_ai_review_count: number;
  integrity_warning_count: number;
}
