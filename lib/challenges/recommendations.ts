import {
  safestepsParentChallenges,
  type SafeStepsParentChallenge,
} from "../data/safestepsParentChallenges";

const STOP_WORDS = new Set([
  "and", "for", "from", "into", "the", "this", "that", "with", "your",
  "parent", "parenting", "family", "program", "course", "lesson",
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

export function getRecommendedChallenges(context: string, limit = 4) {
  const contextTerms = terms(context);

  return safestepsParentChallenges
    .map((challenge) => {
      const searchable = challengeSearchText(challenge).toLowerCase();
      const score = [...contextTerms].reduce(
        (total, term) => total + (searchable.includes(term) ? 1 : 0),
        0,
      );
      return { challenge, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.challenge.id.localeCompare(right.challenge.id))
    .slice(0, limit)
    .map(({ challenge }) => challenge);
}
