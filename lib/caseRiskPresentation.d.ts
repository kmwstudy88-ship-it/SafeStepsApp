export type CaseRiskHistoryItem = {
  score: number | null;
  tier: string | null;
  confidence: number | null;
  rationale: string | null;
  model_version: string | null;
  material_hardship_assessment?: {
    detected: boolean;
    decoupled_from_neglect_score: boolean;
    signals: string[];
    structural_barriers?: string[];
    missed_contact_mitigated?: boolean;
  };
};

export type CaseRiskSummary =
  | {
      hasError: true;
      errorText: string;
      latest: null;
      emptyText?: string;
    }
  | {
      hasError: false;
      errorText: null;
      latest: null;
      emptyText: string;
    }
  | {
      hasError: false;
      errorText: null;
      latest: {
        title: string;
        cautionText: string;
        rationaleText: string;
        rulesText: string;
        materialHardshipText?: string;
      };
      emptyText?: string;
    };

export function buildCaseRiskSummary(input?: {
  riskHistory?: CaseRiskHistoryItem[];
  riskError?: string | null;
}): CaseRiskSummary;
