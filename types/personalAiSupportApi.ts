import type {
  PersonalAiCompletionState,
  PersonalAiEscalationType,
  PersonalAiFlowState,
  PersonalAiRiskLevel,
  PersonalAiSafetyCheck,
} from "../lib/engines/personalAiSupportTypes";

export interface PersonalAiRequestContext {
  conversationId?: string;
  flowId?: string;
  state?: PersonalAiFlowState;
  locale?: string;
  timezone?: string;
}

export type PersonalAiApiErrorCode =
  | "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND"
  | "RATE_LIMITED" | "CLASSIFICATION_FAILED" | "MODEL_FAILED"
  | "SAFETY_OVERRIDE" | "STATE_CONFLICT" | "INTERNAL_ERROR";

export interface PersonalAiApiError {
  code: PersonalAiApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

export interface ClassifyRequest {
  message: string;
  context?: PersonalAiRequestContext;
}

export interface ClassifyResponse {
  intent: string;
  riskLevel: PersonalAiRiskLevel;
  confidence: number;
  escalationType: PersonalAiEscalationType;
  flowId: string;
  additionalFlowIds: string[];
  requiresImmediateSafetyFlow: boolean;
  requiresHumanHandoff: boolean;
  needsClarification: boolean;
  clarificationQuestion?: string;
  matchedSignalIds: string[];
  reasons: string[];
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
  flowId?: string;
  state?: PersonalAiFlowState;
  context?: PersonalAiRequestContext;
  safetyCheck?: PersonalAiSafetyCheck;
  consentToAiSupport: boolean;
}

export interface ChatResponse {
  conversationId?: string;
  flowId: string;
  state: PersonalAiFlowState;
  assistantMessage: string;
  riskLevel: PersonalAiRiskLevel;
  escalationType: PersonalAiEscalationType;
  requiresHumanHandoff: boolean;
  shouldDocument: boolean;
  completionState: PersonalAiCompletionState;
  metadata: {
    intent: string;
    confidence: number;
    matchedSignalIds: string[];
  };
}

export interface CreateInteractionNoteRequest {
  conversationId: string;
  flowId: string;
  riskLevel: PersonalAiRiskLevel;
  safetyCheckResult?: string;
  actionsTaken: string[];
  resourcesOffered: string[];
  escalationStatus: PersonalAiEscalationType;
  completionState: PersonalAiCompletionState;
  consentToStoreNote: true;
  /** Requires a separate authorized safeguarding workflow and must not enter ordinary chat memory. */
  authorizedVerbatimDisclosure?: string;
}

export interface CreateHandoffRequest {
  conversationId?: string;
  flowId?: string;
  reason: string;
  urgency: PersonalAiRiskLevel;
  metadata?: Record<string, unknown>;
  consentToShareWithSupport: boolean;
  /** Never populate from an ordinary transcript automatically. */
  authorizedTriggerExcerpt?: string;
}

export interface PersonalAiFlowSummary {
  id: string;
  label: string;
  category: string;
  riskLevel: PersonalAiRiskLevel;
  escalationType: PersonalAiEscalationType;
  description: string;
  triggerHints: string[];
  uiChipLabel?: string;
  requiresHumanHandoff: boolean;
  isCriticalSafetyFlow: boolean;
}

export interface GetFlowsResponse {
  version: "1.0";
  product: "SafeSteps Personal AI Support";
  flows: PersonalAiFlowSummary[];
}

export const SAFE_PERSONAL_AI_FALLBACK =
  "I’m glad you told me. Right now, let’s focus on safety. If anyone is in immediate danger, call Triple Zero or involve a trusted safe adult now.";
