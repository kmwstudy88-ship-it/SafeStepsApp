import { familyBridgeFlowLibrary, type FamilyBridgeFlow } from "./familyBridgeFlowLibrary";
import { buildPersonalAiSupportPrompt } from "./personalAiSupportPromptPack";
import {
  classifyPersonalAiSupportRisk,
  type PersonalAiRoutingDecision,
} from "./personalAiSupportRiskClassifier";
import type {
  PersonalAiFlowState,
  PersonalAiPromptPayload,
} from "./personalAiSupportTypes";

export interface PersonalAiConversationContext {
  conversationId?: string;
  currentFlowId?: FamilyBridgeFlow["id"];
  currentState?: PersonalAiFlowState;
  consentToSupport: boolean;
}

export interface PersonalAiOrchestrationPlan {
  routing: PersonalAiRoutingDecision;
  flow: FamilyBridgeFlow | null;
  nextState: PersonalAiFlowState;
  normalCoachingAllowed: boolean;
  prompt: ReturnType<typeof buildPersonalAiSupportPrompt> | null;
  safetyResponse: {
    heading: string;
    acknowledgement: string;
    nextStep: string;
    question: string;
  } | null;
  handoff: {
    required: boolean;
    urgency: "routine" | "priority" | "urgent";
    escalationType: PersonalAiRoutingDecision["escalationType"];
  };
  documentation: {
    allowed: boolean;
    requiresSeparateConsent: true;
    storeVerbatimDisclosure: false;
    minimumFields: readonly string[];
  };
}

const minimumNoteFields = [
  "timestamp",
  "flow_id",
  "risk_level",
  "safety_action_shown",
  "resources_offered",
  "handoff_status",
] as const;

function flowById(id: PersonalAiRoutingDecision["flowId"]) {
  return id === "unmatched" ? null : familyBridgeFlowLibrary.find((flow) => flow.id === id) ?? null;
}

function safetyCopy(routing: PersonalAiRoutingDecision) {
  if (!routing.requiresImmediateSafetyFlow) return null;
  if (routing.intent === "family_violence") return {
    heading: "Get to a safer place if you can",
    acknowledgement: "What you shared may involve immediate danger. Your safety and privacy come first.",
    nextStep: "Call Triple Zero now if danger is immediate. Use a safer device if this one may be monitored.",
    question: "Are you and any children physically safe right now?",
  };
  if (routing.intent === "substance_use") return {
    heading: "Arrange sober care now",
    acknowledgement: "This needs immediate real-world support, without shame or delay.",
    nextStep: "Do not drive or supervise alone. Ask a safe sober adult to take over, or call Triple Zero if safe care cannot be arranged.",
    question: "Can a safe sober adult take over right now?",
  };
  if (routing.intent === "self_harm") return {
    heading: "Get immediate support now",
    acknowledgement: "I’m glad you said this. An AI conversation is not enough for immediate risk.",
    nextStep: "Call Triple Zero for immediate danger or Lifeline on 13 11 14, and stay with a trusted safe person.",
    question: "Are you or the child in immediate danger right now?",
  };
  return {
    heading: "Protect the child now",
    acknowledgement: "This is an urgent safety moment, not a routine coaching moment.",
    nextStep: "Create distance from danger, involve a safe adult immediately, and call Triple Zero if safety cannot be maintained.",
    question: "Is the child physically safe right now?",
  };
}

export function orchestratePersonalAiSupport(
  message: string,
  context: PersonalAiConversationContext,
): PersonalAiOrchestrationPlan {
  if (!context.consentToSupport) throw new Error("Explicit consent is required before AI support begins.");
  const routing = classifyPersonalAiSupportRisk(message);
  const flow = flowById(routing.flowId);
  const critical = routing.requiresImmediateSafetyFlow;
  const nextState: PersonalAiFlowState = critical
    ? "safety_check"
    : routing.needsClarification ? "clarify" : "reflect";
  const payload: PersonalAiPromptPayload = {
    flowId: flow?.id ?? "unmatched",
    state: nextState,
    userMessage: message,
    riskLevel: routing.riskLevel,
  };

  return {
    routing,
    flow,
    nextState,
    normalCoachingAllowed: !critical && routing.riskLevel !== "high",
    prompt: critical ? null : buildPersonalAiSupportPrompt(payload, flow),
    safetyResponse: safetyCopy(routing),
    handoff: {
      required: routing.requiresHumanHandoff,
      urgency: critical ? "urgent" : routing.requiresHumanHandoff ? "priority" : "routine",
      escalationType: routing.escalationType,
    },
    documentation: {
      allowed: false,
      requiresSeparateConsent: true,
      storeVerbatimDisclosure: false,
      minimumFields: minimumNoteFields,
    },
  };
}
