import type {
  PersonalAiCompletionState,
  PersonalAiConfidenceBasis,
  PersonalAiEscalationType,
  PersonalAiFlowState,
  PersonalAiRiskLevel,
} from "../lib/engines/personalAiSupportTypes";

export interface PersonalAiRequestContext {
  flowId?: string;
  ageBand?: "early_child" | "middle_child" | "adolescent";
  developmentBand?: "early_child" | "middle_child" | "adolescent";
  ageYears?: number;
}

export type PersonalAiApiErrorCode =
  | "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND"
  | "RATE_LIMITED" | "CLASSIFICATION_FAILED" | "MODEL_FAILED"
  | "SAFETY_OVERRIDE" | "STATE_CONFLICT" | "CONSENT_REQUIRED"
  | "SERVICE_UNAVAILABLE" | "INTERNAL_ERROR";

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
  confidenceBasis: PersonalAiConfidenceBasis;
  escalationType: PersonalAiEscalationType;
  flowId: string;
  additionalFlowIds: string[];
  requiresImmediateSafetyFlow: boolean;
  requiresHumanHandoff: boolean;
  needsClarification: boolean;
  clarificationQuestion?: string;
  matchedSignalIds: string[];
  reasons: string[];
  decisionSupportOnly: true;
}

export interface ChatRequest {
  message: string;
  flowId?: string;
  context?: PersonalAiRequestContext;
  consentToAiSupport: boolean;
}

export interface ChatResponse {
  flowId: string;
  state: PersonalAiFlowState;
  assistantMessage: string;
  riskLevel: PersonalAiRiskLevel;
  escalationType: PersonalAiEscalationType;
  requiresHumanHandoff: boolean;
  shouldDocument: boolean;
  completionState: PersonalAiCompletionState;
  handoffStatus: "not_offered" | "offered";
  metadata: {
    intent: string;
    confidence: number;
    confidenceBasis: PersonalAiConfidenceBasis;
    matchedSignalIds: string[];
    processingMode: "deterministic_scripted";
    decisionSupportOnly: true;
    humanReviewRequired: true;
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

export interface PersonalAiSupportHandlers {
  getFlows(input: { userId: string }): Promise<GetFlowsResponse>;
  classify(input: { userId: string; body: ClassifyRequest }): Promise<ClassifyResponse>;
  chat(input: { userId: string; body: ChatRequest }): Promise<ChatResponse>;
}

export const SAFE_PERSONAL_AI_FALLBACK =
  "I’m glad you told me. Right now, let’s focus on safety. If anyone is in immediate danger, contact local emergency services or a trusted safe adult now.";
