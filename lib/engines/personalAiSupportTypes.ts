export type PersonalAiRiskLevel = "low" | "medium" | "high" | "critical";

export type PersonalAiEscalationType =
  | "none"
  | "human_review"
  | "trusted_adult"
  | "urgent_support";

export type PersonalAiFlowState =
  | "start"
  | "reflect"
  | "clarify"
  | "safety_check"
  | "support"
  | "escalate"
  | "document"
  | "close";

export type PersonalAiCompletionState =
  | "in_progress"
  | "completed"
  | "paused"
  | "ended";

export interface PersonalAiSafetyCheck {
  completed: boolean;
  result?: "safe" | "not_safe" | "prefer_not_to_say";
  checkedAt?: string;
}

export interface PersonalAiFlowDefinition {
  id: string;
  version: string;
  label: string;
  category: string;
  riskLevel: PersonalAiRiskLevel;
  escalationType: PersonalAiEscalationType;
  description: string;
  triggerHints: string[];
  uiChipLabel?: string;
  requiresHumanHandoff: boolean;
  isCriticalSafetyFlow: boolean;
  firstResponse: string;
  coreScript: string[];
  followUpQuestions: string[];
}

export interface PersonalAiActiveFlowCatalog {
  /** Return only approved, active flows from a trusted server-side source. */
  listApprovedActiveFlows(): Promise<PersonalAiFlowDefinition[]>;
}

export interface PersonalAiConsentVerifier {
  /** Verify current, unrevoked consent for this authenticated actor. */
  hasActiveConsent(
    userId: string,
    purpose: "ai_support" | "conversation_storage" | "human_handoff",
  ): Promise<boolean>;
}

export type PersonalAiConfidenceBasis = "uncalibrated_rule_match";
