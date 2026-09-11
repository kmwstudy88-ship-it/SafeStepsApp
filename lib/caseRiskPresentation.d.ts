export type CaseRiskHistoryItem = {
  score: number | null;
  tier: string | null;
  confidence: number | null;
  rationale: string | null;
  model_version: string | null;
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
        confidenceText: string;
        rationaleText: string;
        rulesText: string;
      };
      emptyText?: string;
    };

export function buildCaseRiskSummary(input?: {
  riskHistory?: CaseRiskHistoryItem[];
  riskError?: string | null;
}): CaseRiskSummary;
