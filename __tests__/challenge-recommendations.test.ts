import { getRecommendedChallenges } from "../lib/challenges/recommendations";

describe("challenge recommendations", () => {
  it("returns challenges relevant to curriculum topics", () => {
    const results = getRecommendedChallenges("communication listening connection", 5);

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((challenge) =>
        `${challenge.title} ${challenge.category} ${challenge.purpose}`
          .toLowerCase()
          .includes("connection"),
      ),
    ).toBe(true);
  });

  it("respects the requested result limit", () => {
    expect(getRecommendedChallenges("safety communication routines emotional regulation", 3)).toHaveLength(3);
  });

  it("does not recommend unrelated challenges", () => {
    expect(getRecommendedChallenges("xylophone quantum astronomy", 4)).toEqual([]);
  });
});
