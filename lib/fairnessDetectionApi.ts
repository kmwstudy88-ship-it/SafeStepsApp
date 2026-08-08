import { resolveSingleActiveCaseId } from "./security/caseAccess";
import { safeStepsApiRequest } from "./safeStepsApi";

export type FairnessFinding = {
  category: string;
  severity: "low" | "medium" | "high";
  evidence: string;
  explanation: string;
};

export type FairnessRecommendation = {
  concern: string;
  reframe: string;
};

export type FairnessAnalysisResponse = {
  analysis_id: string;
  fairness_score: number;
  bias_indicators: FairnessFinding[];
  coercion_flags: FairnessFinding[];
  discrimination_risks: FairnessFinding[];
  framing_concerns: FairnessFinding[];
  unrealistic_expectations: FairnessFinding[];
  remediation_recommendations: FairnessRecommendation[];
  limitations: string;
  timestamp: string;
};

export async function analyzeDocumentFairness(input: {
  text: string;
  documentId?: string | null;
  caseContext?: {
    case_type?: string | null;
    family_composition?: string | null;
    child_ages?: number[] | null;
    jurisdictions?: string[] | null;
    cultural_background?: string | null;
  } | null;
  caseId?: string;
}) {
  const caseId = input.caseId ?? (await resolveSingleActiveCaseId());

  return safeStepsApiRequest<FairnessAnalysisResponse>("/documents/analyze/fairness", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      caseId,
      text: input.text,
      documentId: input.documentId ?? null,
      caseContext: input.caseContext ?? null,
    }),
  });
}
