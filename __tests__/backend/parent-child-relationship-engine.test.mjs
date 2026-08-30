import {
  analyseParentChildRelationship,
  validateInteractionObservation,
  verifyInteractionGameInventory,
} from "../../backend/engines/parentChildRelationshipEngine.js";

function observation(overrides = {}) {
  return {
    sessionId: "session-1",
    dimension: "attunement",
    rating: 3,
    observedAt: "2026-08-01T00:00:00Z",
    context: "contact_visit",
    observerId: "worker-1",
    observerRole: "caseworker",
    behaviourAnchor: "Parent noticed the child's pause and checked what support was wanted.",
    ...overrides,
  };
}

describe("parent-child relationship engine", () => {
  test("requires behaviourally anchored observations", () => {
    expect(validateInteractionObservation(observation()).valid).toBe(true);
    expect(validateInteractionObservation(observation({ rating: 5 })).errors).toContain("rating_must_be_0_to_4");
    expect(validateInteractionObservation(observation({ behaviourAnchor: "good" })).errors).toContain(
      "behaviour_anchor_required",
    );
  });

  test("does not treat a single session as a relationship conclusion", () => {
    const result = analyseParentChildRelationship({ observations: [observation()] });
    expect(result.readyForProfessionalReview).toBe(false);
    expect(result.limitations).toContain("minimum_three_sessions_not_met");
    expect(result.automatedParentingCapacityConclusionPermitted).toBe(false);
  });

  test("requires patterns across sessions and contexts", () => {
    const result = analyseParentChildRelationship({
      observations: [
        observation(),
        observation({ sessionId: "session-2", context: "family_game", rating: 3, observedAt: "2026-08-05T00:00:00Z" }),
        observation({ sessionId: "session-3", context: "home_visit", rating: 4, observedAt: "2026-08-10T00:00:00Z" }),
      ],
      childVoice: [{ id: "voice-1", sharedForRelationshipReview: true }],
      gameLibraryPurposeConfirmed: true,
    });
    expect(result.readyForProfessionalReview).toBe(true);
    expect(result.contextsObserved).toBe(3);
    expect(result.dimensions.find((item) => item.dimension === "attunement")?.trend).toBe("strengthening");
  });

  test("excludes private child voice by default", () => {
    const result = analyseParentChildRelationship({
      observations: [],
      childVoice: [
        { id: "private", sharedForRelationshipReview: false },
        { id: "shared", sharedForRelationshipReview: true },
      ],
    });
    expect(result.childVoice.records).toEqual([{ id: "shared", sharedForRelationshipReview: true }]);
    expect(result.childVoice.privateRecordsExcluded).toBe(true);
  });

  test("keeps games outside curriculum", () => {
    const result = analyseParentChildRelationship({
      observations: [observation({ gameId: "game_31", context: "family_game" })],
      gameLibraryPurposeConfirmed: true,
    });
    expect(result.assessmentPurpose).toMatch(/not curriculum/i);
  });

  test("detects the currently missing first thirty games", () => {
    const existing = Array.from({ length: 120 }, (_, index) => `game_${index + 31}`);
    const inventory = verifyInteractionGameInventory(existing);
    expect(inventory.complete).toBe(false);
    expect(inventory.presentCount).toBe(120);
    expect(inventory.missing).toEqual(Array.from({ length: 30 }, (_, index) => `game_${index + 1}`));
  });

  test("never produces automatic parenting-capacity or case decisions", () => {
    const result = analyseParentChildRelationship({ observations: [observation()] });
    expect(result.decisionBoundary).toMatch(/cannot independently determine parenting capacity/i);
    expect(result).not.toHaveProperty("parentingCapacityDecision");
    expect(result).not.toHaveProperty("contactDecision");
  });
});
