import {
  classifySupportGuideRisk,
  createSupportGuideResponse,
} from "../SupportGuide/SupportGuideService.js";

export const personalAiFlows = [
  { id: "visit_preparation", label: "Visit preparation", category: "parenting", riskLevel: "low", escalationType: "none", description: "Prepare a calm, child-centred visit plan.", triggerHints: ["prepare for a visit"], uiChipLabel: "Visit prep", requiresHumanHandoff: false, isCriticalSafetyFlow: false },
  { id: "parent_yelled", label: "Repair after yelling", category: "parenting", riskLevel: "medium", escalationType: "none", description: "Regulate, repair and use a safer next response.", triggerHints: ["yelled at my child"], uiChipLabel: "Repair", requiresHumanHandoff: false, isCriticalSafetyFlow: false },
  { id: "parent_missed_visit", label: "Missed visit accountability", category: "parenting", riskLevel: "medium", escalationType: "none", description: "Take responsibility and plan reliable repair.", triggerHints: ["missed a visit"], uiChipLabel: "Missed visit", requiresHumanHandoff: false, isCriticalSafetyFlow: false },
  { id: "parent_may_hurt_child", label: "Immediate child safety", category: "crisis", riskLevel: "critical", escalationType: "emergency_services", description: "Separate safely and involve immediate human support.", triggerHints: [], uiChipLabel: "Child safety", requiresHumanHandoff: true, isCriticalSafetyFlow: true },
  { id: "child_discloses_abuse", label: "Abuse disclosure safety", category: "crisis", riskLevel: "critical", escalationType: "child_protection", description: "Believe, avoid investigation and move to safeguarding.", triggerHints: [], uiChipLabel: "Safeguarding", requiresHumanHandoff: true, isCriticalSafetyFlow: true },
  { id: "child_self_harm_warning", label: "Self-harm safety", category: "crisis", riskLevel: "critical", escalationType: "crisis_line", description: "Immediate safety check and real-world crisis support.", triggerHints: [], uiChipLabel: "Crisis support", requiresHumanHandoff: true, isCriticalSafetyFlow: true },
  { id: "parenting_support", label: "Parenting support", category: "parenting", riskLevel: "low", escalationType: "none", description: "Practical parenting, regulation and repair support.", triggerHints: ["parenting", "yelled", "routine"], uiChipLabel: "Parenting", requiresHumanHandoff: false, isCriticalSafetyFlow: false },
  { id: "child_wellbeing", label: "Child wellbeing", category: "child_psychology", riskLevel: "low", escalationType: "none", description: "Development-aware, non-diagnostic child wellbeing guidance.", triggerHints: ["child behaviour", "child emotions"], uiChipLabel: "Child wellbeing", requiresHumanHandoff: false, isCriticalSafetyFlow: false },
  { id: "family_violence_safety", label: "Family violence safety", category: "family_violence", riskLevel: "high", escalationType: "dv_support", description: "Private, non-confrontational family violence support.", triggerHints: ["partner scares me", "checks my phone"], uiChipLabel: "DV safety", requiresHumanHandoff: true, isCriticalSafetyFlow: false },
  { id: "substance_use_support", label: "Alcohol and other drug support", category: "substance_use", riskLevel: "high", escalationType: "treatment_support", description: "Non-shaming recovery and sober-supervision support.", triggerHints: ["relapsed", "drinking", "using"], uiChipLabel: "Recovery", requiresHumanHandoff: true, isCriticalSafetyFlow: false },
  { id: "mental_health_support", label: "Mental health support", category: "mental_health", riskLevel: "low", escalationType: "none", description: "Grounding and connection to qualified care.", triggerHints: ["overwhelmed", "mental health"], uiChipLabel: "Mental health", requiresHumanHandoff: false, isCriticalSafetyFlow: false },
  { id: "critical_safety", label: "Immediate safety", category: "crisis", riskLevel: "critical", escalationType: "emergency_services", description: "Stops normal coaching and shows immediate human support.", triggerHints: [], uiChipLabel: "Urgent safety", requiresHumanHandoff: true, isCriticalSafetyFlow: true },
];

function inferDomain(message, requested) {
  if (["parenting", "child_psychology", "family_violence", "substance_use", "mental_health"].includes(requested)) return requested;
  if (/partner|domestic violence|abuse|monitors?|tracks?|threat|see my phone|read this/i.test(message)) return "family_violence";
  if (/drunk|high|intoxicat|relaps|alcohol|drug|craving/i.test(message)) return "substance_use";
  if (/suicid|self[- ]harm|mental health|panic|depress/i.test(message)) return "mental_health";
  if (/child|kid|teen|toddler/i.test(message)) return "child_psychology";
  return "parenting";
}

function flowForMessage(message, risk) {
  const ruleFlow = { CHILD_HARM: "parent_may_hurt_child", CHILD_ABUSE_DISCLOSURE: "child_discloses_abuse", SELF_HARM: "child_self_harm_warning" };
  for (const ruleId of risk.ruleIds) { const id = ruleFlow[ruleId]; if (id) return personalAiFlows.find((item) => item.id === id); }
  if (risk.urgent) return personalAiFlows.find((item) => item.id === "critical_safety");
  if (/\bprepare for (a |my )?visit\b/i.test(message)) return personalAiFlows.find((item) => item.id === "visit_preparation");
  if (/\byelled at my (child|kid|son|daughter)\b/i.test(message)) return personalAiFlows.find((item) => item.id === "parent_yelled");
  if (/\bmissed (a |my )?visit\b/i.test(message)) return personalAiFlows.find((item) => item.id === "parent_missed_visit");
  return null;
}

export function classifyPersonalAiMessage(message) {
  const clean = String(message ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!clean || clean.length > 1200) throw Object.assign(new Error("Message must contain 1 to 1200 characters."), { statusCode: 400, code: "VALIDATION_ERROR" });
  const risk = classifySupportGuideRisk(clean);
  const domain = inferDomain(clean);
  const flow = flowForMessage(clean, risk) ?? personalAiFlows.find((item) => item.category === domain && !item.isCriticalSafetyFlow);
  return {
    intent: flow.id,
    riskLevel: risk.urgent ? "critical" : flow.riskLevel,
    confidence: risk.urgent ? 0.99 : 0.68,
    escalationType: risk.urgent ? (risk.ruleIds.includes("FAMILY_VIOLENCE") ? "dv_support" : flow.escalationType) : flow.escalationType,
    flowId: flow.id,
    additionalFlowIds: [],
    requiresImmediateSafetyFlow: risk.urgent,
    requiresHumanHandoff: risk.urgent || flow.requiresHumanHandoff,
    needsClarification: false,
    matchedSignalIds: risk.ruleIds,
    reasons: [risk.urgent ? "Deterministic safety rule matched." : `Matched ${domain} support domain.`],
  };
}

export async function createPersonalAiChat(input, options = {}) {
  const classification = classifyPersonalAiMessage(input.message);
  const domain = inferDomain(input.message, input.domain);
  const result = await createSupportGuideResponse({
    message: input.message,
    domain,
    consent: input.consentToAiSupport === true,
    history: input.history ?? [],
    memoryContext: input.memoryContext ?? [],
  }, options);
  const critical = classification.requiresImmediateSafetyFlow;
  const validatorFallback = result.source === "guardrail_fallback";
  const response = {
    conversationId: input.conversationId ?? null,
    flowId: classification.flowId,
    state: critical ? "safety_check" : "support",
    assistantMessage: [result.reply.acknowledgement, ...result.reply.steps, result.reply.followUp].join("\n\n"),
    reply: result.reply,
    riskLevel: classification.riskLevel,
    escalationType: classification.escalationType,
    requiresHumanHandoff: classification.requiresHumanHandoff || validatorFallback,
    shouldDocument: input.consentToStoreNote === true,
    completionState: critical ? "escalated" : "in_progress",
    metadata: { intent: classification.intent, confidence: classification.confidence, matchedSignalIds: classification.matchedSignalIds, tone: result.tone ?? { label: "crisis", confidence: 1, diagnostic: false } },
    source: result.source,
  };
  if (typeof options.saveConversationTurn === "function") await options.saveConversationTurn({ input, response });
  if ((critical || classification.riskLevel === "high") && input.consentToStoreNote === true && typeof options.createInteractionNoteIfNeeded === "function") {
    await options.createInteractionNoteIfNeeded({ conversationId: input.conversationId ?? null, flowId: response.flowId, riskLevel: response.riskLevel, signalIds: classification.matchedSignalIds, storeVerbatimDisclosure: false });
  }
  if ((classification.requiresHumanHandoff || validatorFallback) && input.consentToShareWithSupport === true && typeof options.createHandoffIfNeeded === "function") {
    await options.createHandoffIfNeeded({ conversationId: input.conversationId ?? null, flowId: response.flowId, urgency: critical ? "critical" : "high", automaticEmergencyDispatch: false });
  }
  return response;
}
