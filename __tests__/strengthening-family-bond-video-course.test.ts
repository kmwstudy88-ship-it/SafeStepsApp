import {
  buildStrengtheningFamilyBondCompletionPayload,
  strengtheningFamilyBondLessonId,
  strengtheningFamilyBondUsesPlaceholderVideos,
  strengtheningFamilyBondVideoCourse,
  strengtheningFamilyBondVideoSteps,
} from "../lib/data/strengtheningFamilyBondVideoCourse";
import { getInteractiveVideoCourseAssetStatus } from "../lib/data/interactiveVideoCourse";

describe("strengthening family bond video course", () => {
  test("defines a 10-step interactive video course", () => {
    expect(strengtheningFamilyBondVideoSteps).toHaveLength(10);
    expect(strengtheningFamilyBondVideoSteps[0]).toEqual(
      expect.objectContaining({
        id: 1,
        title: "Welcome to SafeSteps",
        subtitle: "Series Introduction",
      }),
    );
    expect(strengtheningFamilyBondVideoSteps.at(-1)?.title).toBe("Wrap-Up and Next Steps");
  });

  test("keeps exactly one quiz step with one correct option", () => {
    const quizSteps = strengtheningFamilyBondVideoSteps.filter((step) => step.quiz);

    expect(quizSteps).toHaveLength(1);
    expect(quizSteps[0].id).toBe(9);
    expect(quizSteps[0].quiz?.options.filter((option) => option.correct)).toHaveLength(1);
  });

  test("flags placeholder video assets for review", () => {
    expect(strengtheningFamilyBondUsesPlaceholderVideos()).toBe(true);
    expect(getInteractiveVideoCourseAssetStatus(strengtheningFamilyBondVideoCourse)).toEqual(
      expect.objectContaining({
        isProductionReady: false,
        placeholderStepCount: 10,
        missingProductionVideoStepIds: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        missingCaptionStepIds: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        missingScriptStepIds: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      }),
    );
  });

  test("builds the final completion payload", () => {
    const payload = buildStrengtheningFamilyBondCompletionPayload({
      answers: {
        1: "I want better connection.",
        10: "I will plan a weekend activity.",
      },
      selectedQuizAnswerId: 1,
    });

    expect(payload).toEqual(
      expect.objectContaining({
        lessonId: strengtheningFamilyBondLessonId,
        userAnswers: {
          1: "I want better connection.",
          10: "I will plan a weekend activity.",
        },
        quizPassed: true,
        videoStepCount: 10,
      }),
    );
    expect(payload.completedAt).toBeTruthy();
  });
});
