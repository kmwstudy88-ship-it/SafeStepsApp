import type {
  AssessmentCriticalOverride,
  AssessmentDomain,
  AssessmentItem,
  AssessmentResponse,
  AssessmentScoringBand,
} from "../engines/assessmentScoringEngine";

export const aodMhDfvAssessmentSlug = "aod-mh-dfv-v1";
export const aodMhDfvInstrumentCode = "AOD_MH_DFV_v1";

export type AodMhDfvDomainCode =
  | "DFV_SAFETY"
  | "AOD_IMPACT"
  | "MH_FUNCTIONAL"
  | "PROTECTIVE_CAPACITY"
  | "PERPETRATOR_ACCOUNTABILITY"
  | "SERVICE_COORDINATION"
  | "CHILD_IMPACT";

export const aodMhDfvDomains: AssessmentDomain[] = [
  { id: "DFV_SAFETY", name: "DFV Safety and Coercive Control", weight: 1 },
  { id: "AOD_IMPACT", name: "AOD Impact on Caregiving Capacity", weight: 1 },
  { id: "MH_FUNCTIONAL", name: "Mental Health Functional Impact", weight: 1 },
  { id: "PROTECTIVE_CAPACITY", name: "Protective Capacity and Support Network", weight: 1 },
  {
    id: "PERPETRATOR_ACCOUNTABILITY",
    name: "Perpetrator Accountability and Behaviour Change (where applicable)",
    weight: 1,
  },
  { id: "SERVICE_COORDINATION", name: "Coordination and Service Engagement", weight: 1 },
  { id: "CHILD_IMPACT", name: "Child Impact Indicators", weight: 1 },
];

const concernScaleOptions = (itemId: string) => [
  { id: `${itemId}-0`, itemId, label: "0 - Not present or no current concern", value: "0", score: 0 },
  { id: `${itemId}-1`, itemId, label: "1 - Mild or historical concern", value: "1", score: 1 },
  { id: `${itemId}-2`, itemId, label: "2 - Moderate concern requiring active monitoring", value: "2", score: 2 },
  { id: `${itemId}-3`, itemId, label: "3 - High concern requiring urgent review", value: "3", score: 3 },
  { id: `${itemId}-4`, itemId, label: "4 - Critical concern requiring immediate safety action", value: "4", score: 4 },
];

export const aodMhDfvItems: AssessmentItem[] = [
  {
    id: "DFV1",
    domainId: "DFV_SAFETY",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("DFV1"),
  },
  {
    id: "DFV2",
    domainId: "DFV_SAFETY",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("DFV2"),
  },
  {
    id: "DFV3",
    domainId: "DFV_SAFETY",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("DFV3"),
  },
  {
    id: "DFV4",
    domainId: "DFV_SAFETY",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("DFV4"),
  },
  {
    id: "AOD1",
    domainId: "AOD_IMPACT",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("AOD1"),
  },
  {
    id: "AOD2",
    domainId: "AOD_IMPACT",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("AOD2"),
  },
  {
    id: "AOD3",
    domainId: "AOD_IMPACT",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("AOD3"),
  },
  {
    id: "AOD4",
    domainId: "AOD_IMPACT",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("AOD4"),
  },
  {
    id: "MH1",
    domainId: "MH_FUNCTIONAL",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("MH1"),
  },
  {
    id: "MH2",
    domainId: "MH_FUNCTIONAL",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("MH2"),
  },
  {
    id: "MH3",
    domainId: "MH_FUNCTIONAL",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("MH3"),
  },
  {
    id: "MH4",
    domainId: "MH_FUNCTIONAL",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("MH4"),
  },
  {
    id: "PC1",
    domainId: "PROTECTIVE_CAPACITY",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("PC1"),
  },
  {
    id: "PC2",
    domainId: "PROTECTIVE_CAPACITY",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("PC2"),
  },
  {
    id: "PC3",
    domainId: "PROTECTIVE_CAPACITY",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("PC3"),
  },
  {
    id: "PA1",
    domainId: "PERPETRATOR_ACCOUNTABILITY",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("PA1"),
  },
  {
    id: "PA2",
    domainId: "PERPETRATOR_ACCOUNTABILITY",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("PA2"),
  },
  {
    id: "PA3",
    domainId: "PERPETRATOR_ACCOUNTABILITY",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("PA3"),
  },
  {
    id: "SC1",
    domainId: "SERVICE_COORDINATION",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("SC1"),
  },
  {
    id: "SC2",
    domainId: "SERVICE_COORDINATION",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("SC2"),
  },
  {
    id: "CI1",
    domainId: "CHILD_IMPACT",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("CI1"),
  },
  {
    id: "CI2",
    domainId: "CHILD_IMPACT",
    itemType: "likert",
    weight: 1,
    maxValue: 4,
    options: concernScaleOptions("CI2"),
  },
];

export const aodMhDfvScoringBands: AssessmentScoringBand[] = [
  {
    id: "aod-mh-dfv-low-concern",
    label: "Low Concern",
    minScore: 0,
    maxScore: 25,
    recommendation: "Continue routine monitoring and record protective evidence over time.",
  },
  {
    id: "aod-mh-dfv-moderate-concern",
    label: "Moderate Concern",
    minScore: 26,
    maxScore: 50,
    recommendation: "Create or update the coordinated support plan and review progress with the case team.",
  },
  {
    id: "aod-mh-dfv-high-concern",
    label: "High Concern",
    minScore: 51,
    maxScore: 75,
    recommendation: "Escalate for supervisor review and make safety, treatment, and service-coordination actions explicit.",
    requiresSupervisorReview: true,
  },
  {
    id: "aod-mh-dfv-critical-concern",
    label: "Critical Concern",
    minScore: 76,
    maxScore: 100,
    recommendation: "Immediate safety review required. Critical findings must not be averaged away by other strengths.",
    requiresSupervisorReview: true,
  },
];

const criticalOverride = (id: string, itemId: string, reason: string): AssessmentCriticalOverride => ({
  id,
  itemId,
  triggerOptionId: `${itemId}-3`,
  forcedBandId: "aod-mh-dfv-critical-concern",
  reason,
  requiresSupervisorReview: true,
});

export const aodMhDfvCriticalOverrides: AssessmentCriticalOverride[] = [
  criticalOverride("DFV1_HIGH", "DFV1", "Active physical safety risk overrides aggregate score."),
  criticalOverride("DFV3_HIGH", "DFV3", "Child direct exposure to DFV overrides aggregate score."),
  criticalOverride("AOD4_HIGH", "AOD4", "Substance use directly implicated in prior safety incident overrides aggregate score."),
  criticalOverride("MH2_HIGH", "MH2", "Symptom-driven supervision impairment overrides aggregate score."),
  criticalOverride("PA3_HIGH", "PA3", "Ongoing perpetrator risk indicators override aggregate score regardless of other domain trends."),
];

export const aodMhDfvDefaultResponses: AssessmentResponse[] = aodMhDfvItems.map((item) => ({
  itemId: item.id,
  selectedOptionId: `${item.id}-0`,
}));

export type AodMhDfvCrossDomainRuleFlag = {
  ruleCode: "DFV_OVERRIDES_AOD_TREND" | "SEPARATE_VICTIM_PERPETRATOR_PLANS";
  flagText: string;
};

export function evaluateAodMhDfvCrossDomainRules({
  triggeredOverrideIds,
  currentDomainScores,
  previousDomainScores = {},
}: {
  triggeredOverrideIds: string[];
  currentDomainScores: Record<string, number>;
  previousDomainScores?: Record<string, number>;
}): AodMhDfvCrossDomainRuleFlag[] {
  const flags: AodMhDfvCrossDomainRuleFlag[] = [];
  const dfvOverrideActive = triggeredOverrideIds.some((id) => id === "DFV1_HIGH" || id === "DFV3_HIGH");
  const previousAod = previousDomainScores.AOD_IMPACT;
  const currentAod = currentDomainScores.AOD_IMPACT;

  if (dfvOverrideActive && previousAod != null && currentAod != null && currentAod < previousAod) {
    flags.push({
      ruleCode: "DFV_OVERRIDES_AOD_TREND",
      flagText: "AOD improvement detected but suppressed in composite due to active DFV safety critical override.",
    });
  }

  if (triggeredOverrideIds.includes("PA3_HIGH")) {
    flags.push({
      ruleCode: "SEPARATE_VICTIM_PERPETRATOR_PLANS",
      flagText:
        "Ongoing perpetrator risk indicator triggered. Verify victim-parent case plan and perpetrator accountability tracking remain scored as separate units, not combined.",
    });
  }

  return flags;
}
