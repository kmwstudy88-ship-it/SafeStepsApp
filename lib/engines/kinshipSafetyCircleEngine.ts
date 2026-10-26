/**
 * SafeSteps Kinship & Safety Network Engine
 *
 * Implements safety circle mapping and resilience evaluation:
 *   - Identifies vetted kinship, family, and community supporters
 *   - Verifies 30-minute rapid responders for acute overwhelm
 *   - Checks backup coverage if primary support is unavailable
 *   - Enforces exclusion boundaries for unsafe or restricted individuals
 *
 * Decision-support only; does not replace statutory child protection checks.
 */

export type SupportRoleType =
  | "primary_kinship"
  | "secondary_backup"
  | "emergency_30min_responder"
  | "cultural_community_mentor"
  | "professional_provider";

export type KinshipCircleMember = {
  memberId: string;
  name: string;
  relationship: string;
  roleType: SupportRoleType;
  verified: boolean;
  contactConfirmed: boolean;
  responseWindowMinutes: number; // e.g. 15, 30, 60, 120
  hasExclusionFlag: boolean;
  exclusionReason?: string;
  availability: "24_7" | "daytime" | "weekends_only" | "on_call";
};

export type KinshipSafetyCircleInput = {
  caseId: string;
  familyId: string;
  members: KinshipCircleMember[];
  excludedIndividuals?: {
    name: string;
    relationship: string;
    reason: string;
    hasActiveOrder: boolean;
  }[];
};

export type SafetyCircleResilienceTier = "robust" | "developing" | "fragile" | "critical_gap";

export type KinshipSafetyCircleResult = {
  caseId: string;
  familyId: string;
  tier: SafetyCircleResilienceTier;
  totalVettedMembers: number;
  hasPrimarySupport: boolean;
  hasThirtyMinuteResponder: boolean;
  hasIndependentBackup: boolean;
  boundaryBreachRiskIdentified: boolean;
  identifiedGaps: string[];
  recommendedActions: string[];
  decisionSupportOnly: true;
  humanReviewRequired: true;
};

export function evaluateKinshipSafetyCircle(
  input: KinshipSafetyCircleInput,
): KinshipSafetyCircleResult {
  const identifiedGaps: string[] = [];
  const recommendedActions: string[] = [];

  const vettedMembers = input.members.filter((m) => m.verified && !m.hasExclusionFlag);
  const excludedInCircle = input.members.filter((m) => m.hasExclusionFlag);

  // Check 1: Unsafe inclusion
  let boundaryBreachRisk = false;
  if (excludedInCircle.length > 0) {
    boundaryBreachRisk = true;
    identifiedGaps.push(
      `${excludedInCircle.length} individual(s) with active exclusion flags or safety restrictions are listed in the support network.`,
    );
    recommendedActions.push(
      "Immediately remove restricted individuals from the active family safety circle.",
    );
  }

  // Check 2: Primary support
  const primarySupporters = vettedMembers.filter(
    (m) => m.roleType === "primary_kinship" && m.contactConfirmed,
  );
  const hasPrimarySupport = primarySupporters.length > 0;
  if (!hasPrimarySupport) {
    identifiedGaps.push("No confirmed, verified primary kinship supporter is designated.");
    recommendedActions.push(
      "Work with the family to identify and vet at least one primary kinship supporter.",
    );
  }

  // Check 3: 30-minute rapid responder
  const rapidResponders = vettedMembers.filter(
    (m) => (m.roleType === "emergency_30min_responder" || m.responseWindowMinutes <= 30) && m.contactConfirmed,
  );
  const hasThirtyMinuteResponder = rapidResponders.length > 0;
  if (!hasThirtyMinuteResponder) {
    identifiedGaps.push("No verified support person can physically respond within 30 minutes if parent is overwhelmed.");
    recommendedActions.push(
      "Identify a trusted neighbor, local relative, or community support who can respond within 30 minutes.",
    );
  }

  // Check 4: Independent backup
  const backupSupporters = vettedMembers.filter(
    (m) => m.roleType === "secondary_backup" && m.contactConfirmed,
  );
  const hasIndependentBackup = backupSupporters.length > 0;
  if (!hasIndependentBackup) {
    identifiedGaps.push("No independent backup supporter identified if primary support is unavailable.");
    recommendedActions.push(
      "Establish a secondary backup support person for respite or emergency coverage.",
    );
  }

  // Determine resilience tier
  let tier: SafetyCircleResilienceTier = "robust";
  if (boundaryBreachRisk || vettedMembers.length === 0) {
    tier = "critical_gap";
  } else if (!hasPrimarySupport || !hasThirtyMinuteResponder) {
    tier = "fragile";
  } else if (!hasIndependentBackup || vettedMembers.length < 3) {
    tier = "developing";
  }

  return {
    caseId: input.caseId,
    familyId: input.familyId,
    tier,
    totalVettedMembers: vettedMembers.length,
    hasPrimarySupport,
    hasThirtyMinuteResponder,
    hasIndependentBackup,
    boundaryBreachRiskIdentified: boundaryBreachRisk,
    identifiedGaps,
    recommendedActions,
    decisionSupportOnly: true,
    humanReviewRequired: true,
  };
}
