import { getNextLessonStep, getPreviousLessonStep, isCheckpointCorrect, LESSON_FLOW_STEPS } from "../lib/platform/lessonFlow";

describe("lesson flow", () => {
  test("uses the full SafeSteps daily lesson order", () => {
    expect(LESSON_FLOW_STEPS).toEqual(["reflection", "content", "checkpoint", "scenario", "practice", "end_reflection"]);
  });

  test("moves forward and backward", () => {
    expect(getNextLessonStep("reflection")).toBe("content");
    expect(getPreviousLessonStep("content")).toBe("reflection");
    expect(getNextLessonStep("end_reflection")).toBeNull();
  });

  test("checks checkpoint answer without case sensitivity", () => {
    expect(isCheckpointCorrect({ correctAnswer: "Safe step" }, "safe step")).toBe(true);
    expect(isCheckpointCorrect({ correctAnswer: "Safe step" }, "unsafe step")).toBe(false);
    expect(isCheckpointCorrect({}, "anything")).toBeNull();
  });
});