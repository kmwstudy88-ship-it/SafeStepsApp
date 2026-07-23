import { safestepsParentChallenges, type SafeStepsParentChallenge } from "./safestepsParentChallenges";

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

const familyCategorySet = new Set<string>(familyChallengeCategories);
const weekendCategorySet = new Set<string>(weekendActivityCategories);

export function isFamilyChallenge(challenge: SafeStepsParentChallenge) {
  return familyCategorySet.has(challenge.category);
}

export function isWeekendActivityChallenge(challenge: SafeStepsParentChallenge) {
  return weekendCategorySet.has(challenge.category);
}

export const familyChallenges = safestepsParentChallenges.filter(isFamilyChallenge);

export const weekendActivityChallenges = safestepsParentChallenges.filter(isWeekendActivityChallenge);
