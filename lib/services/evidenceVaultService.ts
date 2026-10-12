import { supabase } from "../supabase";
import type {
  EvidenceFairnessAnalysis,
  EvidenceRecord,
  EvidenceVaultDashboard,
} from "../types/evidenceVault";

export async function getEvidenceForCase(caseId: string): Promise<EvidenceRecord[]> {
  const { data, error } = await supabase
    .from("evidence_records")
    .select(
      "id, tenant_id, case_id, family_id, child_id, evidence_reference, evidence_title, evidence_description, evidence_type, evidence_source, evidence_status, privacy_level, uploader_user_id, uploaded_at, legal_hold, deleted",
    )
    .eq("case_id", caseId)
    .eq("deleted", false)
    .order("uploaded_at", { ascending: false })
    .returns<EvidenceRecord[]>();

  if (error) {
    throw new Error(`Unable to load evidence: ${error.message}`);
  }

  return data ?? [];
}

export async function getEvidenceVaultDashboard(caseId: string): Promise<EvidenceVaultDashboard | null> {
  const { data, error } = await supabase
    .from("evidence_vault_dashboard_view")
    .select("*")
    .eq("case_id", caseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load evidence dashboard: ${error.message}`);
  }

  return data as EvidenceVaultDashboard | null;
}

export async function getEvidenceChainOfCustody(evidenceRecordId: string) {
  const { data, error } = await supabase
    .from("evidence_chain_of_custody")
    .select("*")
    .eq("evidence_record_id", evidenceRecordId)
    .order("occurred_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load chain of custody: ${error.message}`);
  }

  return data ?? [];
}

export async function getEvidenceFairnessAnalyses(
  evidenceRecordId: string,
): Promise<EvidenceFairnessAnalysis[]> {
  const { data, error } = await supabase
    .from("evidence_ai_analyses")
    .select(
      "id, evidence_record_id, analysis_type, fairness_score, bias_indicators, coercion_flags, discrimination_risks, framing_concerns, unrealistic_expectations, remediation_recommendations, review_status, worker_override, analysed_at",
    )
    .eq("evidence_record_id", evidenceRecordId)
    .eq("analysis_type", "fairness_detection")
    .order("analysed_at", { ascending: false })
    .returns<EvidenceFairnessAnalysis[]>();

  if (error) {
    throw new Error(`Unable to load fairness analysis: ${error.message}`);
  }

  return data ?? [];
}

export async function saveEvidenceFairnessReviewOutcome(
  analysisId: string,
  outcome: {
    status: "pending_human_review" | "confirmed" | "rejected" | "superseded";
    falsePositive?: boolean;
    note?: string;
    caseContextNote?: string;
  },
) {
  const { data, error } = await supabase
    .from("evidence_ai_analyses")
    .update({
      review_status: outcome.status,
      worker_override: {
        false_positive: Boolean(outcome.falsePositive),
        note: outcome.note?.trim() ?? null,
        case_context: outcome.caseContextNote?.trim() ?? null,
        reviewed_at: new Date().toISOString(),
      },
    })
    .eq("id", analysisId)
    .select(
      "id, evidence_record_id, analysis_type, fairness_score, bias_indicators, coercion_flags, discrimination_risks, framing_concerns, unrealistic_expectations, remediation_recommendations, review_status, worker_override, analysed_at",
    )
    .single();

  if (error) {
    throw new Error(`Unable to save fairness review outcome: ${error.message}`);
  }

  return data as EvidenceFairnessAnalysis;
}
