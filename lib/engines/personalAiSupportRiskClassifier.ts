import { classifyFamilyBridgeMessage, type FamilyBridgeRiskLevel } from "./familyBridgeClinicalEngine";
import { familyBridgeFlowLibrary, type FamilyBridgeFlow } from "./familyBridgeFlowLibrary";
import type { PersonalAiEscalationType, PersonalAiRiskLevel } from "./personalAiSupportTypes";

export type PersonalAiIntent =
  | "parenting_support"
  | "visit_preparation"
  | "repair"
  | "substance_use"
  | "family_violence"
  | "child_safety"
  | "self_harm"
  | "case_planning"
  | "unknown";

export interface PersonalAiRoutingDecision {
  intent: PersonalAiIntent;
  flowId: FamilyBridgeFlow["id"] | "unmatched";
  additionalFlowIds: FamilyBridgeFlow["id"][];
  riskLevel: PersonalAiRiskLevel;
  /** Routing confidence, not a clinical probability or assurance of safety. */
  confidence: number;
  escalationType: PersonalAiEscalationType;
  requiresImmediateSafetyFlow: boolean;
  requiresHumanHandoff: boolean;
  needsClarification: boolean;
  clarificationQuestion?: string;
  matchedSignalIds: string[];
  reasons: string[];
}

const riskMap: Record<FamilyBridgeRiskLevel, PersonalAiRiskLevel> = {
  LEVEL_0: "low", LEVEL_1: "low", LEVEL_2: "medium", LEVEL_3: "high", LEVEL_4: "critical",
};

const intentForMode: Record<FamilyBridgeFlow["mode"], PersonalAiIntent> = {
  reunification: "visit_preparation",
  boundaries: "parenting_support",
  repair: "repair",
  accountability: "case_planning",
  emergency: "child_safety",
  aod_safety: "substance_use",
  dv_safety: "family_violence",
  refusal: "substance_use",
};

function rank(level: PersonalAiRiskLevel) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[level];
}

function escalationFor(domains: string[], risk: PersonalAiRiskLevel): PersonalAiEscalationType {
  if (domains.includes("self_harm")) return "crisis_line";
  if (domains.includes("family_violence") || domains.includes("coercive_control")) return "dv_support";
  if (domains.includes("unsafe_caregiving")) return risk === "critical" ? "safe_adult_handoff" : "treatment_support";
  if (domains.includes("child_harm")) return risk === "critical" ? "emergency_services" : "child_protection";
  if (domains.includes("substance_use")) return "treatment_support";
  return risk === "critical" ? "emergency_services" : "none";
}

function containsExplicitNegation(text: string) {
  return /\b(?:not|never|didn['’]?t|don['’]?t|isn['’]?t|wasn['’]?t)\b.{0,24}\b(?:suicidal|hurt|harm|drunk|high|intoxicated|abused?)\b/i.test(text);
}

export function classifyPersonalAiSupportRisk(message: string): PersonalAiRoutingDecision {
  const normalized = message.normalize("NFKC").replace(/\s+/g, " ").trim();
  const safety = classifyFamilyBridgeMessage(normalized);
  const matches = familyBridgeFlowLibrary
    .filter((flow) => flow.triggerPatterns.some((pattern) => pattern.test(normalized)))
    .sort((a, b) => rank(riskMap[b.riskLevel]) - rank(riskMap[a.riskLevel]));

  const primary = matches[0];
  const baselineRisk = riskMap[safety.assignedRiskLevel];
  const flowRisk = primary ? riskMap[primary.riskLevel] : "low";
  const riskLevel = rank(baselineRisk) >= rank(flowRisk) ? baselineRisk : flowRisk;
  const immediate = riskLevel === "critical";
  const negatedSignal = containsExplicitNegation(normalized) && safety.matchedRuleIds.length > 0;
  const needsClarification = !immediate && (matches.length === 0 || negatedSignal);
  const confidence = immediate
    ? 0.99
    : Math.min(0.92, 0.35 + (primary ? 0.35 : 0) + Math.min(matches.length - 1, 2) * 0.08 + safety.matchedRuleIds.length * 0.07);

  const matchedDomains = safety.matchedDomains;
  const intent: PersonalAiIntent = matchedDomains.includes("self_harm")
    ? "self_harm"
    : matchedDomains.includes("family_violence") || matchedDomains.includes("coercive_control")
      ? "family_violence"
      : matchedDomains.includes("substance_use")
        ? "substance_use"
        : matchedDomains.includes("child_harm") || matchedDomains.includes("unsafe_caregiving")
          ? "child_safety"
          : primary ? intentForMode[primary.mode] : "unknown";

  return {
    intent,
    flowId: primary?.id ?? "unmatched",
    additionalFlowIds: matches.slice(1).map((flow) => flow.id),
    riskLevel,
    confidence,
    escalationType: escalationFor(matchedDomains, riskLevel),
    requiresImmediateSafetyFlow: immediate,
    requiresHumanHandoff: rank(riskLevel) >= rank("high") || safety.requiresHumanReview,
    needsClarification,
    clarificationQuestion: needsClarification
      ? negatedSignal ? "To make sure I understand: is anyone unsafe right now?" : "Is this mainly about parenting, a visit, recovery, or an immediate safety concern?"
      : undefined,
    matchedSignalIds: safety.matchedRuleIds,
    reasons: [
      safety.matchedRuleIds.length ? "Deterministic safety signals matched." : "No deterministic safety signal matched.",
      primary ? `Matched support flow ${primary.id}.` : "No specialist support flow matched.",
      negatedSignal ? "Negated risk language detected; clarification is required unless the safety gate is critical." : "No negation guard applied.",
    ],
  };
}
