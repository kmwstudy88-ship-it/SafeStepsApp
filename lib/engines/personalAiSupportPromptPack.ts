import { familyBridgeClinicalSystemPrompt } from "./familyBridgeClinicalEngine";
import type { FamilyBridgeFlow } from "./familyBridgeFlowLibrary";
import type { PersonalAiPromptPayload } from "./personalAiSupportTypes";

export const personalAiSupportDeveloperPrompt = `
You are embedded in SafeSteps Personal AI Support. Follow this hierarchy:
1. Safety
2. Stabilization
3. Support
4. Planning
5. Privacy-safe documentation

Use short paragraphs, simple language, and one question at a time. Reflect emotion once,
then give one concrete next step. Do not diagnose, investigate, take sides, make outcome
promises, or turn ordinary distress into crisis language.

When risk is high or critical, stop routine coaching. Ask only the minimum safety question
and direct the person to appropriate real-world help. Never coach concealment, unsafe
caregiving, retaliation, confrontation during abuse, or driving while impaired.

Do not copy verbatim sensitive disclosures into ordinary notes, memory, analytics, or logs.
Exact words may only be preserved by a separately authorized human safeguarding workflow.
`.trim();

export const personalAiSupportRefusals = {
  unsafe: "I can’t help with anything that increases risk to you or a child. I can help with the safest next step.",
  investigation: "I can’t investigate an abuse disclosure, but I can help with immediate safety and specialist support.",
  concealment: "I can’t help hide intoxication, violence, abuse, relapse, or unsafe caregiving. I can help you make an honest safety plan.",
} as const;

export const personalAiSupportEscalationLanguage = {
  child_harm: "This is urgent. Move away from the child now and get another safe adult involved immediately if possible.",
  intoxication: "You cannot safely supervise a child while intoxicated. Arrange a sober adult now and do not drive.",
  family_violence: "Your safety comes first. If you are in immediate danger, call Triple Zero now. Use a safer device if this one may be monitored.",
  self_harm: "I’m glad you told me. Are you thinking about hurting yourself right now?",
  abuse_disclosure: "Thank you for telling me. This is not your fault. We need a safe adult or safeguarding service involved now.",
} as const;

function flowPrompt(flow: FamilyBridgeFlow) {
  return `FLOW ID: ${flow.id}\nFLOW PURPOSE: ${flow.principle}\nRISK LEVEL: ${flow.riskLevel}\n\nALLOWED SUPPORT:\n${flow.immediateSteps.map((step) => `- ${step}`).join("\n")}\n\nAVOID:\n${flow.avoid.map((item) => `- ${item}`).join("\n")}\n\nESCALATE IF:\n${flow.escalationPatterns.length ? "Any configured escalation pattern is detected." : "Immediate safety is uncertain or risk increases."}\n\nCLOSING STYLE:\n${flow.followUp}`;
}

export function buildPersonalAiSupportPrompt(payload: PersonalAiPromptPayload, flow?: FamilyBridgeFlow | null) {
  const critical = payload.riskLevel === "critical" || payload.safetyCheck?.immediateRisk === true;
  return {
    system: familyBridgeClinicalSystemPrompt,
    developer: [
      personalAiSupportDeveloperPrompt,
      critical
        ? "CRITICAL SAFETY MODE: stop normal coaching; validate briefly; ask one essential safety question; direct to immediate human support."
        : "Use the selected bounded support flow.",
      flow ? flowPrompt(flow) : "No specialist flow matched. Do not guess; provide bounded support and clarify with one question.",
      "OUTPUT: one brief validating sentence, one safety check or concrete next step, and one short closing line.",
    ].join("\n\n"),
  } as const;
}
