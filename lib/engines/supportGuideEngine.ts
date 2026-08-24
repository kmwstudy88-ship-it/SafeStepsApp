import {
  classifyFamilyBridgeMessage,
  type FamilyBridgeTriageResult,
} from "./familyBridgeClinicalEngine";
import {
  classifyPersonalAiSupportRisk,
  type PersonalAiRoutingDecision,
} from "./personalAiSupportRiskClassifier";

export type SupportGuideDomain =
  | "parenting"
  | "child_psychology"
  | "family_violence"
  | "substance_use"
  | "mental_health";

export type SupportGuideReply = {
  triage: FamilyBridgeTriageResult;
  routing: PersonalAiRoutingDecision;
  heading: string;
  acknowledgement: string;
  steps: string[];
  followUp: string;
};

const domainGuidance: Record<
  SupportGuideDomain,
  Omit<SupportGuideReply, "triage" | "routing">
> = {
  parenting: {
    heading: "Let’s make the next moment easier",
    acknowledgement:
      "Parenting can feel especially hard when everyone is already stretched. We can focus on one small, observable change.",
    steps: [
      "Pause and lower your voice before giving the next direction.",
      "Name the limit in one sentence, then offer two safe choices.",
      "Notice any small cooperation and reconnect after the hard moment.",
    ],
    followUp: "What happened just before the difficult moment, and how old is your child?",
  },
  child_psychology: {
    heading: "Start with what you can observe",
    acknowledgement:
      "A child’s behaviour can communicate stress or an unmet need, but one message cannot tell us why it is happening.",
    steps: [
      "Describe what you saw without labels or assumptions.",
      "Check sleep, hunger, transitions, sensory load, and recent changes.",
      "Use a calm check-in and seek a qualified child professional if the pattern persists or affects safety or daily life.",
    ],
    followUp: "What behaviour have you noticed, when does it happen, and what seems to help?",
  },
  family_violence: {
    heading: "Your safety comes first",
    acknowledgement:
      "You deserve support without blame. You control what you share here, and you do not need to confront anyone to prove what is happening.",
    steps: [
      "If it is safe, move toward a place with an exit and away from weapons.",
      "Use a safer device if you think this device or your accounts are monitored.",
      "Contact a specialist service to make an individual safety plan; avoid joint planning or mediation where coercive control may be present.",
    ],
    followUp: "Are you and any children physically safe to keep talking right now?",
  },
  substance_use: {
    heading: "A safer next step is enough",
    acknowledgement:
      "Talking honestly about alcohol or other drugs takes courage. This guide will support change without shame and will not give detox or medication instructions.",
    steps: [
      "Protect children from impaired supervision, unsafe driving, substances, and equipment.",
      "Notice the trigger, urge, and one choice that could add time or distance before use.",
      "Ask a GP or alcohol and drug service about a safe, individualized support plan—withdrawal can require medical care.",
    ],
    followUp: "Is your concern about your own use or someone else’s, and is a child relying on that person right now?",
  },
  mental_health: {
    heading: "Let’s steady the next few minutes",
    acknowledgement:
      "You do not have to solve everything at once. This guide can help you slow things down, but it cannot diagnose or replace a mental health professional.",
    steps: [
      "Place both feet on the floor and name three things you can see.",
      "Choose one person you can contact and one demand you can postpone.",
      "Arrange professional support if distress is persistent, worsening, or affecting care and safety.",
    ],
    followUp: "What feels hardest right now: your thoughts, your body, the situation, or getting through the next task?",
  },
};

export function createSupportGuideReply(
  message: string,
  domain: SupportGuideDomain,
): SupportGuideReply {
  const triage = classifyFamilyBridgeMessage(message);
  const routing = classifyPersonalAiSupportRisk(message);

  if (triage.abortStandardCoaching) {
    return {
      triage,
      routing,
      heading: triage.assignedRiskLevel === "LEVEL_4" ? "Get immediate help now" : "Pause and make things safer",
      acknowledgement:
        "What you wrote may involve immediate or escalating risk. A trained person needs to help with this; ordinary coaching is not enough right now.",
      steps: [
        triage.userFacingAction,
        "Move away from weapons, driving, substances, or confrontation if you can do so safely.",
        "Use one of the specialist contacts shown below, or a trusted safe adult who can be physically present.",
      ],
      followUp: "Are you and any children physically safe at this moment?",
    };
  }

  return { triage, routing, ...domainGuidance[domain] };
}
