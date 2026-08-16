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

export interface EvidenceFairnessAnalysis {
  id: string;
  evidence_record_id: string;
  analysis_type: string;
  fairness_score: number | null;
  bias_indicators: Record<string, unknown>[];
  coercion_flags: Record<string, unknown>[];
  discrimination_risks: Record<string, unknown>[];
  framing_concerns: Record<string, unknown>[];
  unrealistic_expectations: Record<string, unknown>[];
  remediation_recommendations: Record<string, unknown>[];
  review_status: string;
  worker_override: Record<string, unknown> | null;
  analysed_at: string;
}
