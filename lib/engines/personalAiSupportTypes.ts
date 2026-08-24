export type PersonalAiRiskLevel = "low" | "medium" | "high" | "critical";
export type PersonalAiFlowState = "start" | "reflect" | "clarify" | "safety_check" | "support" | "escalate" | "document" | "close";
export type PersonalAiEscalationType = "emergency_services" | "crisis_line" | "child_protection" | "dv_support" | "safe_adult_handoff" | "treatment_support" | "none";
export type PersonalAiCompletionState = "not_started" | "in_progress" | "completed" | "escalated" | "abandoned";

export interface PersonalAiSafetyCheck {
  immediateRisk: boolean;
  riskType?: PersonalAiEscalationType;
  childPresent?: boolean;
  userIntoxicated?: boolean;
  userMayHurtSelfOrOthers?: boolean;
  safeAdultAvailable?: boolean;
}

export interface PersonalAiPromptPayload {
  flowId: string;
  state: PersonalAiFlowState;
  userMessage: string;
  riskLevel: PersonalAiRiskLevel;
  safetyCheck?: PersonalAiSafetyCheck;
  userContext?: Record<string, unknown>;
}

export interface PersonalAiAssistantResponse {
  message: string;
  nextState: PersonalAiFlowState;
  escalationType?: PersonalAiEscalationType;
  requiresHumanHandoff: boolean;
  shouldDocument: boolean;
  completionState: PersonalAiCompletionState;
}

export interface PersonalAiInteractionNote {
  timestamp: string;
  flowId: string;
  riskLevel: PersonalAiRiskLevel;
  safetyCheckResult: string;
  actionsTaken: string[];
  resourcesOffered: string[];
  escalationStatus: PersonalAiEscalationType;
  completionState: PersonalAiCompletionState;
  /** Only populated by a separately authorized safeguarding workflow. */
  authorizedVerbatimDisclosure?: string;
}
