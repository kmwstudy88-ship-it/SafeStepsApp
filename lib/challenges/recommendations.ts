import {
  filterChallenges,
  type ChallengeTrack,
} from "../data/familyChallenges";
import {
  type SafeStepsParentChallenge,
} from "../data/safestepsParentChallenges";

const STOP_WORDS = new Set([
  "and",
  "for",
  "from",
  "into",
  "the",
  "this",
  "that",
  "with",
  "your",
  "parent",
  "parenting",
  "family",
  "program",
  "course",
  "lesson",
]);

function terms(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((term) => term.length >= 3 && !STOP_WORDS.has(term)),
  );
}

function challengeSearchText(challenge: SafeStepsParentChallenge) {
  return [
    challenge.displayTitle,
    challenge.category,
    challenge.purpose,
    ...challenge.parentSkillFocus,
    ...challenge.tags,
  ].join(" ");
}

export type RecommendationContextInput =
  | string
  | {
      title?: string;
      category?: string;
      summary?: string;
      tags?: string[];
    };

function normalizeContextString(context: RecommendationContextInput): string {
  if (typeof context === "string") return context;
  return [
    context.title ?? "",
    context.category ?? "",
    context.summary ?? "",
    ...(context.tags ?? []),
  ].join(" ");
}

export function getRecommendedChallenges(
  context: RecommendationContextInput,
  limit = 4,
  options?: { track?: ChallengeTrack },
): SafeStepsParentChallenge[] {
  const contextTerms = terms(normalizeContextString(context));
  const pool = filterChallenges({ track: options?.track ?? "all" });

  if (contextTerms.size === 0) {
    return pool.slice(0, limit);
  }

  const scored = pool
    .map((challenge) => {
      const searchable = challengeSearchText(challenge).toLowerCase();
      const score = [...contextTerms].reduce(
        (total, term) => total + (searchable.includes(term) ? 1 : 0),
        0,
      );
      return { challenge, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.challenge.id.localeCompare(right.challenge.id),
    )
    .slice(0, limit)
    .map(({ challenge }) => challenge);

  return scored.length > 0 ? scored : pool.slice(0, limit);
}
