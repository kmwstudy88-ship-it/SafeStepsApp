export type CulturalSafetyInput = {
  childIdentifiedAsAboriginalOrTorresStraitIslander: boolean;
  culturalIdentityRecorded: boolean;
  culturalPlanRecorded: boolean;
  familyCommunityConnectionsRecorded: boolean;
  aboriginalControlledServiceInvolved: boolean;
  culturalPlanReviewDate?: string | Date | null;
};

export type AccessibilityInput = {
  disabilityOrAccessNeedIdentified: boolean;
  communicationPreferenceRecorded: boolean;
  easyReadRequired: boolean;
  easyReadProvided: boolean;
  supportPersonOffered: boolean;
  reasonableAdjustmentsRecorded: boolean;
};

export type RecognitionSupportPlanInput = {
  culturalSafety: CulturalSafetyInput;
  accessibility: AccessibilityInput;
};

export type RecognitionSupportGap = {
  id: string;
  domain: "cultural_safety" | "accessibility";
  label: string;
  severity: "required" | "recommended";
};

export type RecognitionSupportPlan = {
  culturalSafetyRequired: boolean;
  accessibilityRequired: boolean;
  gaps: RecognitionSupportGap[];
  complete: boolean;
  reviewRequired: boolean;
  evidenceTags: string[];
};

function isPastDate(value?: string | Date | null) {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}

export function buildRecognitionSupportPlan(input: RecognitionSupportPlanInput): RecognitionSupportPlan {
  const gaps: RecognitionSupportGap[] = [];
  const { culturalSafety, accessibility } = input;
  const culturalSafetyRequired = culturalSafety.childIdentifiedAsAboriginalOrTorresStraitIslander;
  const accessibilityRequired = accessibility.disabilityOrAccessNeedIdentified || accessibility.easyReadRequired;

  if (culturalSafetyRequired) {
    if (!culturalSafety.culturalIdentityRecorded) {
      gaps.push({
        id: "cultural-identity",
        domain: "cultural_safety",
        label: "Record the child's cultural identity before relying on readiness outputs.",
        severity: "required",
      });
    }

    if (!culturalSafety.culturalPlanRecorded) {
      gaps.push({
        id: "cultural-plan",
        domain: "cultural_safety",
        label: "Record a cultural plan or cultural planning status.",
        severity: "required",
      });
    }

    if (!culturalSafety.familyCommunityConnectionsRecorded) {
      gaps.push({
        id: "family-community-connections",
        domain: "cultural_safety",
        label: "Record family, community, culture, language, or identity connections.",
        severity: "required",
      });
    }

    if (!culturalSafety.aboriginalControlledServiceInvolved) {
      gaps.push({
        id: "aboriginal-controlled-service",
        domain: "cultural_safety",
        label: "Record Aboriginal-controlled service involvement or the reason it is not in place.",
        severity: "recommended",
      });
    }

    if (isPastDate(culturalSafety.culturalPlanReviewDate)) {
      gaps.push({
        id: "cultural-plan-review",
        domain: "cultural_safety",
        label: "Cultural plan review date has passed.",
        severity: "recommended",
      });
    }
  }

  if (accessibilityRequired) {
    if (!accessibility.communicationPreferenceRecorded) {
      gaps.push({
        id: "communication-preference",
        domain: "accessibility",
        label: "Record the parent's communication preference.",
        severity: "required",
      });
    }

    if (accessibility.easyReadRequired && !accessibility.easyReadProvided) {
      gaps.push({
        id: "easy-read",
        domain: "accessibility",
        label: "Provide Easy Read or plain-language material where required.",
        severity: "required",
      });
    }

    if (!accessibility.supportPersonOffered) {
      gaps.push({
        id: "support-person",
        domain: "accessibility",
        label: "Record whether a support person was offered.",
        severity: "recommended",
      });
    }

    if (!accessibility.reasonableAdjustmentsRecorded) {
      gaps.push({
        id: "reasonable-adjustments",
        domain: "accessibility",
        label: "Record reasonable adjustments or why none are required.",
        severity: "required",
      });
    }
  }

  const requiredGapCount = gaps.filter((gap) => gap.severity === "required").length;
  const evidenceTags = [
    ...(culturalSafetyRequired ? ["cultural_safety"] : []),
    ...(accessibilityRequired ? ["accessibility"] : []),
    ...(accessibility.easyReadRequired ? ["easy_read"] : []),
    ...(culturalSafety.aboriginalControlledServiceInvolved ? ["aboriginal_controlled_service"] : []),
  ];

  return {
    culturalSafetyRequired,
    accessibilityRequired,
    gaps,
    complete: requiredGapCount === 0,
    reviewRequired: gaps.length > 0,
    evidenceTags,
  };
}
