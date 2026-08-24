import {
  familyBridgeFlowLibrary,
  type FamilyBridgeFlow,
  type FlowRiskLevel,
} from "./familyBridgeFlowLibrary";

export type FamilyBridgeState =
  | "received"
  | "safety_check"
  | "standard_coaching"
  | "professional_alignment"
  | "human_handoff"
  | "emergency_escalation"
  | "completed";

export type FamilyBridgeEvent =
  | { type: "START" }
  | { type: "SAFETY_ANSWER"; immediateDanger: boolean }
  | { type: "COACHING_DELIVERED" }
  | { type: "PROFESSIONAL_PLAN_SELECTED" }
  | { type: "HUMAN_SUPPORT_SELECTED" }
  | { type: "EMERGENCY_ACTION_CONFIRMED" };

export type FamilyBridgeMachineSpec = {
  schemaVersion: "FB-STATE-V1";
  flowId: FamilyBridgeFlow["id"];
  riskLevel: FlowRiskLevel;
  initialState: "received";
  safetyQuestions: string[];
  normalCoachingAllowed: boolean;
  escalationRule: string;
  safeCompletionState: string;
  documentation: {
    allowedFields: string[];
    rawDisclosureStorage: "never_automatic";
    policy: string;
  };
};

export type FamilyBridgeSession = {
  flowId: FamilyBridgeFlow["id"];
  state: FamilyBridgeState;
  riskLevel: FlowRiskLevel;
  normalCoachingAllowed: boolean;
  transitionCount: number;
};

const riskRank: Record<FlowRiskLevel, number> = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
};

function completionFor(flow: FamilyBridgeFlow) {
  if (flow.riskLevel === "LEVEL_4") return "Immediate real-world safety action is engaged; AI does not determine that risk is resolved.";
  if (flow.riskLevel === "LEVEL_3") return "A relevant human support pathway is selected and immediate safety guidance has been shown.";
  if (flow.riskLevel === "LEVEL_2") return "A child-centred action and appropriate professional-alignment step are identified.";
  return "The caregiver has one safe script and one practical next action.";
}

export function createFamilyBridgeMachineSpec(flow: FamilyBridgeFlow): FamilyBridgeMachineSpec {
  const highRisk = riskRank[flow.riskLevel] >= 3;
  return {
    schemaVersion: "FB-STATE-V1",
    flowId: flow.id,
    riskLevel: flow.riskLevel,
    initialState: "received",
    safetyQuestions: highRisk ? flow.intakeQuestions.slice(0, 3) : flow.intakeQuestions.slice(0, 1),
    normalCoachingAllowed: !highRisk,
    escalationRule: flow.riskLevel === "LEVEL_4"
      ? "Stop ordinary coaching immediately and show emergency or crisis support."
      : flow.riskLevel === "LEVEL_3"
        ? "Use safety-focused guidance and require a real-world human-support next step."
        : "Escalate if any configured escalation pattern is matched or safety becomes uncertain.",
    safeCompletionState: completionFor(flow),
    documentation: {
      allowedFields: flow.memoryFields,
      rawDisclosureStorage: "never_automatic",
      policy: "Store only specifically consented, minimum-necessary structured fields. Verbatim disclosures require a separate authorized human safeguarding workflow and must never enter AI chat memory, ordinary progress events, analytics, or application logs.",
    },
  };
}

export const familyBridgeMachineSpecs = familyBridgeFlowLibrary.map(createFamilyBridgeMachineSpec);

export function startFamilyBridgeSession(flow: FamilyBridgeFlow): FamilyBridgeSession {
  return {
    flowId: flow.id,
    state: "received",
    riskLevel: flow.riskLevel,
    normalCoachingAllowed: riskRank[flow.riskLevel] < 3,
    transitionCount: 0,
  };
}

export function advanceFamilyBridgeState(
  session: FamilyBridgeSession,
  event: FamilyBridgeEvent,
): FamilyBridgeSession {
  let state = session.state;

  if (session.state === "received" && event.type === "START") {
    state = riskRank[session.riskLevel] >= 3 ? "safety_check" : "standard_coaching";
  } else if (session.state === "safety_check" && event.type === "SAFETY_ANSWER") {
    state = event.immediateDanger || session.riskLevel === "LEVEL_4"
      ? "emergency_escalation"
      : "human_handoff";
  } else if (session.state === "standard_coaching" && event.type === "COACHING_DELIVERED") {
    state = session.riskLevel === "LEVEL_2" ? "professional_alignment" : "completed";
  } else if (session.state === "professional_alignment" && event.type === "PROFESSIONAL_PLAN_SELECTED") {
    state = "completed";
  } else if (session.state === "human_handoff" && event.type === "HUMAN_SUPPORT_SELECTED") {
    state = "completed";
  } else if (session.state === "emergency_escalation" && event.type === "EMERGENCY_ACTION_CONFIRMED") {
    state = "completed";
  } else {
    return session;
  }

  return { ...session, state, transitionCount: session.transitionCount + 1 };
}
