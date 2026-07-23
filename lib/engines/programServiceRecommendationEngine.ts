export type ParentNeedCategoryId =
  | "behaviour_emotional_regulation"
  | "attachment_connection"
  | "developmental_concerns"
  | "parenting_confidence_skills"
  | "family_stress_wellbeing"
  | "safety_protection"
  | "practical_life_management";

export type ParentNeedSignal = {
  id: string;
  label: string;
};

export type ParentNeedCategory = {
  id: ParentNeedCategoryId;
  title: string;
  summary: string;
  signals: ParentNeedSignal[];
};

export type RecommendedParentingProgram = {
  id: string;
  name: string;
  category: string;
  reason: string;
  nextStep: string;
  matchedNeedCategoryIds: ParentNeedCategoryId[];
  referralServiceType: string;
};

export type ProgramRecommendationResult = {
  parentNeeds: ParentNeedCategoryId[];
  matchedSignals: ParentNeedSignal[];
  recommendedPrograms: RecommendedParentingProgram[];
  appCards: {
    programName: string;
    why: string;
    nextStep: string;
  }[];
  parentReportText: string;
  multiProgramSummary: string;
  workerReviewNotes: string[];
};

export const parentNeedCategories: ParentNeedCategory[] = [
  {
    id: "behaviour_emotional_regulation",
    title: "Behaviour and Emotional Regulation",
    summary: "Behaviour support, routines, emotional outbursts, and following instructions.",
    signals: [
      { id: "tantrums", label: "Tantrums" },
      { id: "defiance", label: "Defiance" },
      { id: "emotional_outbursts", label: "Emotional outbursts" },
      { id: "following_instructions", label: "Difficulty following instructions" },
    ],
  },
  {
    id: "attachment_connection",
    title: "Attachment and Connection",
    summary: "Bonding, strained parent-child connection, and understanding child cues.",
    signals: [
      { id: "bonding_concerns", label: "Bonding concerns" },
      { id: "relationship_strain", label: "Parent-child relationship strain" },
      { id: "child_cues", label: "Difficulty understanding child cues" },
    ],
  },
  {
    id: "developmental_concerns",
    title: "Developmental Concerns",
    summary: "Developmental delays, sensory concerns, and early childhood support needs.",
    signals: [
      { id: "speech_delay", label: "Speech delay" },
      { id: "sensory_issues", label: "Sensory issues" },
      { id: "asd_adhd_indicators", label: "ASD/ADHD indicators" },
      { id: "motor_delays", label: "Motor delays" },
    ],
  },
  {
    id: "parenting_confidence_skills",
    title: "Parenting Confidence and Skills",
    summary: "Confidence, routines, young-parent support, and parenting skill building.",
    signals: [
      { id: "first_time_parent", label: "First-time parent" },
      { id: "young_parent", label: "Young parent" },
      { id: "overwhelmed", label: "Overwhelmed" },
      { id: "unsure_routines", label: "Unsure about routines" },
    ],
  },
  {
    id: "family_stress_wellbeing",
    title: "Family Stress and Wellbeing",
    summary: "Conflict, co-parenting, anxiety, and household stressors.",
    signals: [
      { id: "conflict", label: "Conflict" },
      { id: "co_parenting_issues", label: "Co-parenting issues" },
      { id: "parental_anxiety", label: "Parental anxiety" },
      { id: "household_instability", label: "Household instability" },
    ],
  },
  {
    id: "safety_protection",
    title: "Safety and Protection",
    summary: "Home safety, supervision, boundaries, and protective behaviours.",
    signals: [
      { id: "home_safety", label: "Home safety" },
      { id: "supervision_challenges", label: "Supervision challenges" },
      { id: "boundaries", label: "Boundaries" },
      { id: "protective_behaviours", label: "Protective behaviours" },
    ],
  },
  {
    id: "practical_life_management",
    title: "Practical Life Management",
    summary: "Daily routines, feeding, sleep, budgeting, and household organisation.",
    signals: [
      { id: "routines", label: "Routines" },
      { id: "feeding", label: "Feeding" },
      { id: "sleep", label: "Sleep" },
      { id: "budgeting", label: "Budgeting" },
      { id: "household_organisation", label: "Household organisation" },
    ],
  },
];

export const parentingProgramRecommendationRules: RecommendedParentingProgram[] = [
  {
    id: "triple-p",
    name: "Triple P",
    category: "Behaviour Support",
    reason: "Supports behaviour guidance, routines, and emotional regulation.",
    nextStep: "Explore local providers or online modules.",
    matchedNeedCategoryIds: ["behaviour_emotional_regulation"],
    referralServiceType: "Triple P parenting program",
  },
  {
    id: "incredible-years",
    name: "Incredible Years",
    category: "Behaviour Support",
    reason: "Supports social skills, emotional coaching, and positive behaviour strategies.",
    nextStep: "Check local group availability and suitability for the child's age.",
    matchedNeedCategoryIds: ["behaviour_emotional_regulation"],
    referralServiceType: "Incredible Years parenting program",
  },
  {
    id: "pcit",
    name: "Parent-Child Interaction Therapy (PCIT)",
    category: "Behaviour Support",
    reason: "Strengthens parent-child interaction and behaviour management.",
    nextStep: "Discuss clinical fit and provider availability with the case team.",
    matchedNeedCategoryIds: ["behaviour_emotional_regulation"],
    referralServiceType: "PCIT service",
  },
  {
    id: "circle-of-security",
    name: "Circle of Security Parenting",
    category: "Attachment",
    reason: "Strengthens parent-child connection, emotional safety, and understanding of child cues.",
    nextStep: "Explore local facilitators or online program options.",
    matchedNeedCategoryIds: ["attachment_connection"],
    referralServiceType: "Circle of Security Parenting program",
  },
  {
    id: "nurturing-parenting",
    name: "Nurturing Parenting Program",
    category: "Attachment",
    reason: "Focuses on empathy, positive discipline, and family resilience.",
    nextStep: "Review group or individual provider options.",
    matchedNeedCategoryIds: ["attachment_connection"],
    referralServiceType: "Nurturing Parenting Program",
  },
  {
    id: "early-intervention",
    name: "Early Intervention Services",
    category: "Early Childhood Development",
    reason: "Supports speech, motor, sensory, and developmental concerns.",
    nextStep: "Seek local early childhood or allied health referral options.",
    matchedNeedCategoryIds: ["developmental_concerns"],
    referralServiceType: "Early intervention service",
  },
  {
    id: "playgroup",
    name: "Playgroup Programs",
    category: "Early Childhood Development",
    reason: "Provides structured social learning, parent connection, and child development support.",
    nextStep: "Explore local playgroups and community hubs.",
    matchedNeedCategoryIds: ["developmental_concerns"],
    referralServiceType: "Playgroup program",
  },
  {
    id: "child-development-clinic",
    name: "Child Development Clinics",
    category: "Early Childhood Development",
    reason: "Provides developmental review and pathways for specialist assessment.",
    nextStep: "Discuss clinic referral criteria with a health or child development professional.",
    matchedNeedCategoryIds: ["developmental_concerns"],
    referralServiceType: "Child development clinic",
  },
  {
    id: "parenting-education",
    name: "Parenting Education Workshops",
    category: "Parenting Confidence",
    reason: "Builds practical parenting skills, confidence, and predictable routines.",
    nextStep: "Choose a workshop matched to the parent's stage and goals.",
    matchedNeedCategoryIds: ["parenting_confidence_skills"],
    referralServiceType: "Parenting education workshop",
  },
  {
    id: "young-parent",
    name: "Young Parent Programs",
    category: "Parenting Confidence",
    reason: "Provides developmentally appropriate support for young parents building confidence.",
    nextStep: "Check local young-parent service eligibility.",
    matchedNeedCategoryIds: ["parenting_confidence_skills"],
    referralServiceType: "Young parent program",
  },
  {
    id: "community-parenting-hub",
    name: "Community Parenting Hubs",
    category: "Parenting Confidence",
    reason: "Connects parents with practical learning, peer support, and local services.",
    nextStep: "Explore community hubs near the family.",
    matchedNeedCategoryIds: ["parenting_confidence_skills"],
    referralServiceType: "Community parenting hub",
  },
  {
    id: "family-relationship-centre",
    name: "Family Relationship Centres",
    category: "Family Stress",
    reason: "Supports co-parenting, conflict reduction, and family relationship planning.",
    nextStep: "Consider referral where safe and appropriate.",
    matchedNeedCategoryIds: ["family_stress_wellbeing"],
    referralServiceType: "Family Relationship Centre",
  },
  {
    id: "family-counselling",
    name: "Family Counselling",
    category: "Family Stress",
    reason: "Supports family wellbeing, conflict management, and emotional stress.",
    nextStep: "Review specialist fit, safety context, and consent requirements.",
    matchedNeedCategoryIds: ["family_stress_wellbeing"],
    referralServiceType: "Family counselling",
  },
  {
    id: "parent-mentoring",
    name: "Parent Mentoring Programs",
    category: "Family Stress",
    reason: "Provides practical coaching and relational support during stressful periods.",
    nextStep: "Explore local mentoring programs and case suitability.",
    matchedNeedCategoryIds: ["family_stress_wellbeing"],
    referralServiceType: "Parent mentoring program",
  },
  {
    id: "child-safety-education",
    name: "Child Safety Education Programs",
    category: "Safety and Protection",
    reason: "Builds knowledge and routines for safer supervision, boundaries, and home safety.",
    nextStep: "Match referral to the current safety plan and child age.",
    matchedNeedCategoryIds: ["safety_protection"],
    referralServiceType: "Child safety education program",
  },
  {
    id: "protective-behaviours",
    name: "Protective Behaviours Programs",
    category: "Safety and Protection",
    reason: "Supports protective behaviours, safe boundaries, and child-focused safety language.",
    nextStep: "Review age fit and safety-plan alignment before referral.",
    matchedNeedCategoryIds: ["safety_protection"],
    referralServiceType: "Protective behaviours program",
  },
  {
    id: "nutrition-feeding",
    name: "Nutrition and Feeding Support",
    category: "Practical Life Management",
    reason: "Supports feeding routines, nutrition planning, and practical caregiving stability.",
    nextStep: "Consider child health, dietitian, or community provider options.",
    matchedNeedCategoryIds: ["practical_life_management"],
    referralServiceType: "Nutrition and feeding support",
  },
  {
    id: "sleep-support",
    name: "Sleep Support Program",
    category: "Practical Life Management",
    reason: "Helps establish predictable sleep routines and bedtime structure.",
    nextStep: "Explore child health or parenting sleep support services.",
    matchedNeedCategoryIds: ["practical_life_management"],
    referralServiceType: "Sleep support program",
  },
  {
    id: "budget-household",
    name: "Budgeting and Household Management Workshops",
    category: "Practical Life Management",
    reason: "Supports budgeting, household organisation, and stable day-to-day routines.",
    nextStep: "Explore community financial capability or household skills programs.",
    matchedNeedCategoryIds: ["practical_life_management"],
    referralServiceType: "Budgeting and household management workshop",
  },
];

const categoryBySignalId = new Map(
  parentNeedCategories.flatMap((category) => category.signals.map((signal) => [signal.id, category] as const)),
);

const categoryById = new Map(parentNeedCategories.map((category) => [category.id, category] as const));

function uniqueValues<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function getParentNeedCategoryById(categoryId: ParentNeedCategoryId) {
  return categoryById.get(categoryId);
}

export function getParentNeedCategoryForSignal(signalId: string) {
  return categoryBySignalId.get(signalId);
}

export function buildParentingProgramRecommendations(input: {
  selectedSignalIds?: string[];
  parentNeedCategories?: ParentNeedCategoryId[];
  maxPrograms?: number;
}): ProgramRecommendationResult {
  const categoriesFromSignals = uniqueValues(
    (input.selectedSignalIds ?? [])
      .map((signalId) => categoryBySignalId.get(signalId)?.id)
      .filter((categoryId): categoryId is ParentNeedCategoryId => !!categoryId),
  );
  const parentNeeds = uniqueValues([...(input.parentNeedCategories ?? []), ...categoriesFromSignals]);
  const matchedSignals = parentNeedCategories.flatMap((category) =>
    category.signals.filter((signal) => input.selectedSignalIds?.includes(signal.id)),
  );
  const maxPrograms = input.maxPrograms ?? 6;
  const recommendedPrograms = parentingProgramRecommendationRules
    .filter((program) => program.matchedNeedCategoryIds.some((categoryId) => parentNeeds.includes(categoryId)))
    .slice(0, maxPrograms);

  const appCards = recommendedPrograms.map((program) => ({
    programName: program.name,
    why: program.reason,
    nextStep: program.nextStep,
  }));

  const parentReportText =
    recommendedPrograms.length === 0
      ? "No parenting program recommendation has been generated yet. Review the parent's goals, needs, and any safety requirements before planning referrals."
      : `Your responses suggest you may benefit from ${recommendedPrograms[0].name}, a program focused on ${recommendedPrograms[0].reason.toLowerCase()}`;

  const multiProgramSummary =
    recommendedPrograms.length === 0
      ? "No program recommendations selected."
      : `Based on your needs, SafeSteps recommends: ${recommendedPrograms
          .map((program) => `${program.name} (${program.category})`)
          .join("; ")}.`;

  return {
    parentNeeds,
    matchedSignals,
    recommendedPrograms,
    appCards,
    parentReportText,
    multiProgramSummary,
    workerReviewNotes: [
      "Confirm local availability, eligibility, consent, safety fit, and any court or case-plan requirements before referral.",
      "Keep recommendation reasons separate from referral attendance evidence and provider progress notes.",
      "Use recommendations as worker-review prompts, not automatic case decisions.",
    ],
  };
}

export function buildProgramRecommendationReferralDrafts(result: ProgramRecommendationResult) {
  return result.recommendedPrograms.map((program) => ({
    serviceType: program.referralServiceType,
    providerName: null as string | null,
    notes: `Recommendation source: ${program.category}. Reason: ${program.reason}`,
  }));
}
