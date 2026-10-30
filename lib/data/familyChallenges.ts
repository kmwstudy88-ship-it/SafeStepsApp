import { safestepsParentChallenges, type SafeStepsParentChallenge } from "./safestepsParentChallenges";

export type ChallengeTrack = "all" | "personal" | "family" | "weekend";
export type ChallengeCadenceFilter = "all" | "daily" | "weekly" | "monthly";

export const personalChallengeCategories = [
  "Parent Self-Regulation",
  "Progress Evidence",
] as const;

export const familyChallengeCategories = [
  "Connection & Attachment",
  "Communication",
  "Discipline & Boundaries",
  "Routines & Structure",
  "Safety & Stability",
  "Emotional Literacy",
  "Child Voice",
  "Co-Parenting",
  "Practical Care",
  "Teens & Adolescence",
  "Babies & Toddlers",
] as const;

export const weekendActivityCategories = [
  "Connection & Attachment",
  "Communication",
  "Routines & Structure",
  "Emotional Literacy",
  "Child Voice",
  "Co-Parenting",
  "Practical Care",
] as const;

export const allChallengeCategories = [
  ...familyChallengeCategories,
  ...personalChallengeCategories,
] as const;

const personalCategorySet = new Set<string>(personalChallengeCategories);
const familyCategorySet = new Set<string>(familyChallengeCategories);
const weekendCategorySet = new Set<string>(weekendActivityCategories);

export function isPersonalChallenge(challenge: SafeStepsParentChallenge): boolean {
  return personalCategorySet.has(challenge.category);
}

export function isFamilyChallenge(challenge: SafeStepsParentChallenge): boolean {
  return familyCategorySet.has(challenge.category);
}

export function isWeekendActivityChallenge(challenge: SafeStepsParentChallenge): boolean {
  return weekendCategorySet.has(challenge.category);
}

export function getChallengeTrack(challenge: SafeStepsParentChallenge): "personal" | "family" {
  return isPersonalChallenge(challenge) ? "personal" : "family";
}

export type ChallengeSafeguardMetadata = {
  track: "personal" | "family";
  isWeekendSuitable: boolean;
  voluntaryParticipation: true;
  noAdverseNonParticipationEffect: true;
  supportsBreakWithoutPenalty: true;
  supportsSeparateChildReflection: boolean;
  noCovertAssessmentOrParentingScore: true;
  povertyDecoupledFromAssessment: true;
  supportsWaitlistPause: true;
  safeguardSummary: string;
  registerIds: readonly string[];
};

export function getChallengeSafeguardMetadata(
  challenge: SafeStepsParentChallenge,
): ChallengeSafeguardMetadata {
  const track = getChallengeTrack(challenge);
  const isFamily = track === "family";
  return {
    track,
    isWeekendSuitable: isWeekendActivityChallenge(challenge),
    voluntaryParticipation: true,
    noAdverseNonParticipationEffect: true,
    supportsBreakWithoutPenalty: true,
    supportsSeparateChildReflection: isFamily,
    noCovertAssessmentOrParentingScore: true,
    povertyDecoupledFromAssessment: true,
    supportsWaitlistPause: true,
    safeguardSummary: isFamily
      ? "Voluntary family & parent-child activity (SS-PCD-030). Pausing or skipping carries no penalty or adverse inference, and separate parent/child reflections are never used as a covert parenting capacity score (SS-PCD-045)."
      : "Personal parent skill & evidence practice (SS-TASK-001). You can pause for a break at any time without losing progress or streak continuity.",
    registerIds: isFamily
      ? ["SS-TASK-001", "SS-TASK-002", "SS-PCD-030", "SS-PCD-036", "SS-PCD-043", "SS-PCD-045"]
      : ["SS-TASK-001", "SS-TASK-002", "SS-TASK-003", "SS-PCD-036"],
  };
}

export const personalChallenges = safestepsParentChallenges.filter(isPersonalChallenge);

export const familyChallenges = safestepsParentChallenges.filter(isFamilyChallenge);

export const weekendActivityChallenges = safestepsParentChallenges.filter(isWeekendActivityChallenge);

export const allParentChallenges = safestepsParentChallenges;

export type FilterChallengesOptions = {
  track?: ChallengeTrack;
  challengeType?: ChallengeCadenceFilter;
  category?: string;
  query?: string;
};

export function filterChallenges(options: FilterChallengesOptions = {}): SafeStepsParentChallenge[] {
  const {
    track = "all",
    challengeType = "all",
    category = "all",
    query = "",
  } = options;
  const normalizedQuery = query.trim().toLowerCase();

  return safestepsParentChallenges.filter((challenge) => {
    if (track === "personal" && !isPersonalChallenge(challenge)) return false;
    if (track === "family" && !isFamilyChallenge(challenge)) return false;
    if (track === "weekend" && !isWeekendActivityChallenge(challenge)) return false;

    if (challengeType !== "all" && challenge.challengeType !== challengeType) {
      return false;
    }

    if (category && category !== "all" && challenge.category !== category) {
      return false;
    }

    if (normalizedQuery) {
      const searchable = [
        challenge.id,
        challenge.displayTitle,
        challenge.title,
        challenge.category,
        challenge.purpose,
        ...challenge.parentSkillFocus,
        ...challenge.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}
