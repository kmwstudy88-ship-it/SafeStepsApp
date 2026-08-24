export type WellbeingCheckIn = {
  mood: "steady" | "stressed" | "overwhelmed";
  stress: 1 | 2 | 3 | 4 | 5;
  sleep: "rested" | "limited" | "none";
  conflict: "low" | "rising" | "unsafe";
  substanceRisk: "none" | "thoughts" | "strong_urge" | "used";
  childDependingNow: boolean;
  afraidMayHarm: boolean;
  safety: "safe" | "watching" | "unsafe";
};

export type CheckInRoute = {
  level: "routine" | "extra_support" | "urgent_human_support";
  ordinarySaveAllowed: boolean;
  reasons: string[];
  heading: string;
  action: string;
};

export function routeWellbeingCheckIn(input: WellbeingCheckIn): CheckInRoute {
  const reasons: string[] = [];
  if (input.safety === "unsafe") reasons.push("immediate_safety_concern");
  if (input.conflict === "unsafe") reasons.push("unsafe_family_conflict");
  if (input.afraidMayHarm) reasons.push("caregiver_may_harm");
  if (input.childDependingNow && input.substanceRisk === "used") reasons.push("impaired_caregiving_risk");

  if (reasons.length > 0) {
    return {
      level: "urgent_human_support",
      ordinarySaveAllowed: false,
      reasons,
      heading: "Safety support comes first",
      action: "Do not continue as an ordinary progress check-in. Open immediate safety support and connect with a trained person now.",
    };
  }

  if (
    input.mood === "overwhelmed" || input.stress >= 4 || input.sleep === "none" ||
    input.conflict === "rising" || input.substanceRisk === "strong_urge" || input.substanceRisk === "used"
  ) {
    return {
      level: "extra_support",
      ordinarySaveAllowed: true,
      reasons: ["elevated_wellbeing_load"],
      heading: "Add support today",
      action: "Save the check-in if you choose, then use the Support Guide or contact a trusted professional or support person.",
    };
  }

  return {
    level: "routine",
    ordinarySaveAllowed: true,
    reasons: [],
    heading: "Keep noticing what helps",
    action: "Save the check-in and choose one small supportive action for today.",
  };
}
