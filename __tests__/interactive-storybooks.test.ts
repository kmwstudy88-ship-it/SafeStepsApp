import {
  getInteractiveStorybookById,
  getInteractiveStorybookCatalogueSummary,
  getInteractiveStorybooksByAge,
  interactiveStorybookIngestionPayload,
  interactiveStorybooks,
} from "../lib/data/interactiveStorybooks";

describe("interactiveStorybooks", () => {
  it("loads the first 30 SafeSteps interactive storybooks as typed buildable content", () => {
    expect(interactiveStorybooks).toHaveLength(30);
    expect(getInteractiveStorybookCatalogueSummary()).toMatchObject({
      total: 30,
      firstId: "storybook_001",
      lastId: "storybook_030",
      sceneCount: 150,
    });
  });

  it("preserves full content hooks for the first 10 metadata payload", () => {
    const lostBackpack = getInteractiveStorybookById("storybook_001");

    expect(lostBackpack).toMatchObject({
      title: "The Lost Backpack",
      ageRange: "4-7",
      theme: "Problem Solving",
      coreSkill: "Emotional Regulation",
      interactionType: "tap-to-choose",
      engineHooks: ["emotion_engine", "reflection_engine", "scoring_engine"],
      uiFlow: ["intro", "sceneChoice", "emotionCheck", "resolution", "reflection"],
    });
    expect(lostBackpack?.scenes).toHaveLength(5);
    expect(lostBackpack?.scenes.map((scene) => scene.screenId)).toEqual([
      "lostBackpack_intro",
      "lostBackpack_scene",
      "lostBackpack_activity",
      "lostBackpack_resolution",
      "lostBackpack_reflection",
    ]);
  });

  it("exports a curriculum-engine ingestion payload for all storybooks", () => {
    expect(interactiveStorybookIngestionPayload.version).toBe("2026-07-22.storybooks.1-30");
    expect(interactiveStorybookIngestionPayload.storybooks).toHaveLength(30);
    expect(interactiveStorybookIngestionPayload.storybooks[29]).toMatchObject({
      id: "storybook_030",
      title: "The Time Garden",
      interaction_type: "hold-to-wait",
      engine_hooks: ["patience_engine"],
    });
  });

  it("can filter storybooks by child age range", () => {
    const ageFourStories = getInteractiveStorybooksByAge(4);
    const ageNineStories = getInteractiveStorybooksByAge(9);

    expect(ageFourStories.length).toBeGreaterThan(0);
    expect(ageFourStories.every((story) => Number(story.ageRange.split("-")[0]) <= 4)).toBe(true);
    expect(ageNineStories.length).toBeGreaterThan(0);
    expect(ageNineStories.every((story) => Number(story.ageRange.split("-")[1]) >= 9)).toBe(true);
  });
});
