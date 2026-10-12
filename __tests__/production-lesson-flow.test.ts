import {
  hasProductionLessonContent,
  isProductionQuizQuestionCorrect,
  PRODUCTION_LESSON_STEPS,
  scoreProductionQuiz,
} from "../lib/platform/productionLessonFlow";

describe("production lesson flow", () => {
  test("uses the complete 15-screen production order", () => {
    expect(PRODUCTION_LESSON_STEPS).toHaveLength(15);
    expect(PRODUCTION_LESSON_STEPS[0]).toBe("definition");
    expect(PRODUCTION_LESSON_STEPS.at(-1)).toBe("final_reflection");
  });

  test("detects production lesson content", () => {
    expect(
      hasProductionLessonContent({
        Title: "Adolescent development",
        Videos: [{ Title: "Introduction" }],
        TeachingSections: [{ Title: "Core teaching" }],
      }),
    ).toBe(true);
    expect(hasProductionLessonContent({ Title: "Legacy lesson" })).toBe(false);
  });

  test("checks single and multiple choice quiz answers", () => {
    expect(
      isProductionQuizQuestionCorrect(
        { CorrectAnswer: "Safe action" },
        "safe action",
      ),
    ).toBe(true);
    expect(
      isProductionQuizQuestionCorrect(
        { CorrectAnswers: ["Ask", "Protect"] },
        ["Protect", "Ask"],
      ),
    ).toBe(true);
  });

  test("requires the pass mark and all critical safety questions", () => {
    const quiz = {
      PassPercent: 80,
      Questions: [
        {
          QuestionId: "Q1",
          CorrectAnswer: "A",
          Points: 8,
        },
        {
          QuestionId: "Q2",
          CorrectAnswer: "Safe",
          Points: 2,
          CriticalSafetyQuestion: true,
        },
      ],
    };

    expect(
      scoreProductionQuiz(quiz, { Q1: "A", Q2: "Unsafe" }),
    ).toMatchObject({
      percent: 80,
      criticalSafetyPassed: false,
      passed: false,
    });

    expect(
      scoreProductionQuiz(quiz, { Q1: "A", Q2: "Safe" }),
    ).toMatchObject({
      percent: 100,
      criticalSafetyPassed: true,
      passed: true,
    });
  });
});
