/**
 * SafeSteps Child Development & Parental Capacity Engine
 *
 * Evaluates parental capacity and attunement against developmental age bands:
 *   - infant_0_12m, early_childhood_1_5y, middle_childhood_6_11y, adolescent_12_17y
 *
 * Checks for:
 *   - Realistic behavioral expectations
 *   - Emotional co-regulation capacity
 *   - Developmental mismatch flags (unrealistic expectations or punitive discipline)
 *   - Preservation of child boundaries from adult conflicts
 *
 * Decision-support only; does not produce clinical or diagnostic labels.
 */

export type ChildDevelopmentAgeBand =
  | "infant_0_12m"
  | "early_childhood_1_5y"
  | "middle_childhood_6_11y"
  | "adolescent_12_17y";

export type DevelopmentalCapacityObservation = {
  dimension:
    | "emotional_attunement"
    | "behavioral_expectations"
    | "soothing_and_co_regulation"
    | "boundary_protection"
    | "daily_routine_structure";
  rating: 1 | 2 | 3 | 4 | 5; // 1 = marked concern, 5 = robust demonstrated strength
  notes?: string;
  observedAt?: string;
};

export type ChildDevelopmentCapacityInput = {
  caseId: string;
  childAgeYears: number;
  observations: DevelopmentalCapacityObservation[];
  parentReportedExpectations?: string[];
  adultDisputeInvolvementReported?: boolean;
};

export type DevelopmentalMismatchFlag = {
  type: "unrealistic_expectation" | "co_regulation_gap" | "adultification_or_messenger" | "punitive_discipline_risk";
  description: string;
  severity: "high" | "medium" | "low";
  suggestedCoaching: string;
};

export type ChildDevelopmentCapacityResult = {
  caseId: string;
  ageBand: ChildDevelopmentAgeBand;
  attunementScore: number; // 0-100
  capacityLevel: "emerging" | "developing" | "competent" | "strong";
  mismatchFlags: DevelopmentalMismatchFlag[];
  strengthsIdentified: string[];
  coachingRecommendations: string[];
  decisionSupportOnly: true;
  humanReviewRequired: true;
};

export function deriveChildAgeBand(ageYears: number): ChildDevelopmentAgeBand {
  if (ageYears < 1) return "infant_0_12m";
  if (ageYears < 6) return "early_childhood_1_5y";
  if (ageYears < 12) return "middle_childhood_6_11y";
  return "adolescent_12_17y";
}

export function evaluateChildDevelopmentCapacity(
  input: ChildDevelopmentCapacityInput,
): ChildDevelopmentCapacityResult {
  const ageBand = deriveChildAgeBand(input.childAgeYears);
  const mismatchFlags: DevelopmentalMismatchFlag[] = [];
  const strengthsIdentified: string[] = [];
  const coachingRecommendations: string[] = [];

  // Check adult conflict boundary
  if (input.adultDisputeInvolvementReported) {
    mismatchFlags.push({
      type: "adultification_or_messenger",
      description: "Child has been exposed to adult conflict, litigation details, or message-carrying.",
      severity: "high",
      suggestedCoaching: "Strictly protect child from adult matters; communicate directly between adults or via designated worker.",
    });
  }

  // Evaluate observations
  let totalRating = 0;
  let count = 0;

  for (const obs of input.observations) {
    totalRating += obs.rating;
    count += 1;

    if (obs.rating >= 4) {
      strengthsIdentified.push(`Demonstrated strength in ${obs.dimension.replace(/_/g, " ")}.`);
    } else if (obs.rating <= 2) {
      if (obs.dimension === "behavioral_expectations") {
        mismatchFlags.push({
          type: "unrealistic_expectation",
          description: `Parent struggles with age-appropriate behavioral expectations for a ${input.childAgeYears}-year-old.`,
          severity: "medium",
          suggestedCoaching: `Provide psychoeducation on normal developmental milestones for ${ageBand.replace(/_/g, " ")}.`,
        });
      } else if (obs.dimension === "soothing_and_co_regulation") {
        mismatchFlags.push({
          type: "co_regulation_gap",
          description: "Difficulty co-regulating child distress during transitions or meltdowns.",
          severity: "medium",
          suggestedCoaching: "Practice calm-presence, slow breathing, and attunement before giving verbal directions.",
        });
      }
    }
  }

  const averageRating = count > 0 ? totalRating / count : 3;
  const attunementScore = Math.round((averageRating / 5) * 100);

  let capacityLevel: ChildDevelopmentCapacityResult["capacityLevel"] = "developing";
  if (attunementScore >= 80 && mismatchFlags.length === 0) capacityLevel = "strong";
  else if (attunementScore >= 60 && !mismatchFlags.some((f) => f.severity === "high")) capacityLevel = "competent";
  else if (attunementScore < 45 || mismatchFlags.some((f) => f.severity === "high")) capacityLevel = "emerging";

  // Age-specific coaching prompts
  if (ageBand === "infant_0_12m") {
    coachingRecommendations.push("Focus on responsive feeding, gentle eye contact, and soothing touch during crying spells.");
  } else if (ageBand === "early_childhood_1_5y") {
    coachingRecommendations.push("Maintain predictable routines and offer simple, two-choice options to minimize toddler power struggles.");
  } else if (ageBand === "middle_childhood_6_11y") {
    coachingRecommendations.push("Encourage emotional labeling and validate feelings while keeping household rules clear and consistent.");
  } else {
    coachingRecommendations.push("Balance collaborative problem-solving with respect for healthy adolescent autonomy and privacy.");
  }

  return {
    caseId: input.caseId,
    ageBand,
    attunementScore,
    capacityLevel,
    mismatchFlags,
    strengthsIdentified,
    coachingRecommendations,
    decisionSupportOnly: true,
    humanReviewRequired: true,
  };
}
