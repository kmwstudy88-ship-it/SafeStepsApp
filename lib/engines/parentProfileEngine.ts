import { supabase } from "../supabase/client";
import type { AssessmentCaseSetup } from "./assessmentCaseEngine";

export type ParentRole = "mother" | "father" | "joint" | "other_carer";

export type ParentIdentity = {
  name: string;
  age: string;
  culturalIdentity: string;
  familyHistory: string;
  traumaHistory: string;
  schoolExperienceAdultImpact: string;
  schoolExperienceParentingInfluence: string;
  schoolExperienceChildHopesAndAvoidance: string;
  strengths: string;
  supports: string;
};

export type ProtectiveCapacities = {
  emotionalRegulation: string;
  insight: string;
  empathy: string;
  stability: string;
  abilityToProtect: string;
  responsiveness: string;
};

export type RiskIndicators = {
  substanceUse: string;
  violence: string;
  neglectPatterns: string;
  mentalHealthInstability: string;
  unsafePartners: string;
  environmentalRisks: string;
};

export type ParentingBehaviors = {
  disciplineStyle: string;
  attachmentBehaviors: string;
  consistency: string;
  supervision: string;
  warmth: string;
  boundaries: string;
};

export type Engagement = {
  attendance: string;
  homeworkCompletion: string;
  responsiveness: string;
  motivation: string;
  barriers: string;
  changeReadiness: string;
};

export type ParentProfileDomains = {
  identity: ParentIdentity;
  protectiveCapacities: ProtectiveCapacities;
  riskIndicators: RiskIndicators;
  parentingBehaviors: ParentingBehaviors;
  engagement: Engagement;
};

export type ParentProfileRecord = {
  id: string;
  case_id: string;
  owner_id: string;
  parent_role: ParentRole;
  display_name: string;
  identity: ParentIdentity;
  protective_capacities: ProtectiveCapacities;
  risk_indicators: RiskIndicators;
  parenting_behaviors: ParentingBehaviors;
  engagement: Engagement;
  created_at: string;
  updated_at: string;
};

export type SaveParentProfileInput = {
  id?: string | null;
  caseId: string;
  ownerId: string;
  parentRole: ParentRole;
  displayName: string;
  domains: ParentProfileDomains;
};

export const emptyParentProfileDomains: ParentProfileDomains = {
  identity: {
    name: "",
    age: "",
    culturalIdentity: "",
    familyHistory: "",
    traumaHistory: "",
    schoolExperienceAdultImpact: "",
    schoolExperienceParentingInfluence: "",
    schoolExperienceChildHopesAndAvoidance: "",
    strengths: "",
    supports: "",
  },
  protectiveCapacities: {
    emotionalRegulation: "",
    insight: "",
    empathy: "",
    stability: "",
    abilityToProtect: "",
    responsiveness: "",
  },
  riskIndicators: {
    substanceUse: "",
    violence: "",
    neglectPatterns: "",
    mentalHealthInstability: "",
    unsafePartners: "",
    environmentalRisks: "",
  },
  parentingBehaviors: {
    disciplineStyle: "",
    attachmentBehaviors: "",
    consistency: "",
    supervision: "",
    warmth: "",
    boundaries: "",
  },
  engagement: {
    attendance: "",
    homeworkCompletion: "",
    responsiveness: "",
    motivation: "",
    barriers: "",
    changeReadiness: "",
  },
};

function trimRecord<T extends Record<string, string>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, item.trim()]),
  ) as T;
}

export function buildParentProfilePayload(input: SaveParentProfileInput) {
  return {
    case_id: input.caseId,
    owner_id: input.ownerId,
    parent_role: input.parentRole,
    display_name: input.displayName.trim(),
    identity: trimRecord(input.domains.identity),
    protective_capacities: trimRecord(input.domains.protectiveCapacities),
    risk_indicators: trimRecord(input.domains.riskIndicators),
    parenting_behaviors: trimRecord(input.domains.parentingBehaviors),
    engagement: trimRecord(input.domains.engagement),
    updated_at: new Date().toISOString(),
  };
}

export function hydrateParentProfileDomains(record: ParentProfileRecord | null): ParentProfileDomains {
  if (!record) return emptyParentProfileDomains;

  return {
    identity: { ...emptyParentProfileDomains.identity, ...record.identity },
    protectiveCapacities: {
      ...emptyParentProfileDomains.protectiveCapacities,
      ...record.protective_capacities,
    },
    riskIndicators: {
      ...emptyParentProfileDomains.riskIndicators,
      ...record.risk_indicators,
    },
    parentingBehaviors: {
      ...emptyParentProfileDomains.parentingBehaviors,
      ...record.parenting_behaviors,
    },
    engagement: {
      ...emptyParentProfileDomains.engagement,
      ...record.engagement,
    },
  };
}

export async function fetchParentProfiles(caseId: string) {
  const { data, error } = await supabase
    .from("parent_profiles")
    .select("*")
    .eq("case_id", caseId)
    .order("parent_role", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ParentProfileRecord[];
}

export async function saveParentProfile(input: SaveParentProfileInput) {
  const payload = buildParentProfilePayload(input);

  const { data, error } = await supabase
    .from("parent_profiles")
    .upsert(payload, { onConflict: "case_id,parent_role" })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ParentProfileRecord;
}

export function getCaseOwnerId(caseRecord: AssessmentCaseSetup | null) {
  return caseRecord?.owner_id ?? "";
}
