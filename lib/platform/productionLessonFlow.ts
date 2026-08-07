import type {
  ProductionLessonContent,
  ProductionQuiz,
  ProductionQuizQuestion,
} from "./types";

export const PRODUCTION_LESSON_STEPS = [
  "definition",
  "video_1",
  "teaching_1",
  "video_2",
  "activity_1",
  "teaching_2",
  "video_3",
  "case_study",
  "teaching_3",
  "video_4",
  "activity_2",
  "home_practice",
  "formal_assessment",
  "quiz",
  "final_reflection",
] as const;

export type ProductionLessonStep = (typeof PRODUCTION_LESSON_STEPS)[number];

export type QuizAnswerMap = Record<string, string | string[]>;

export function hasProductionLessonContent(
  value: unknown,
): value is ProductionLessonContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProductionLessonContent>;
  return (
    typeof candidate.Title === "string" &&
    Array.isArray(candidate.Videos) &&
    candidate.Videos.length > 0 &&
    Array.isArray(candidate.TeachingSections) &&
    candidate.TeachingSections.length > 0
  );
}

export function productionStepLabel(
  step: ProductionLessonStep,
  content: ProductionLessonContent,
) {
  const index = PRODUCTION_LESSON_STEPS.indexOf(step);
  const videoIndex = step.startsWith("video_")
    ? Number(step.replace("video_", "")) - 1
    : -1;
  const teachingIndex = step.startsWith("teaching_")
    ? Number(step.replace("teaching_", "")) - 1
    : -1;
  const activityIndex = step.startsWith("activity_")
    ? Number(step.replace("activity_", "")) - 1
    : -1;

  if (step === "definition") return content.DefinitionGate?.ScreenTitle || "Before you begin";
  if (videoIndex >= 0) return content.Videos?.[videoIndex]?.Title || `Video ${videoIndex + 1}`;
  if (teachingIndex >= 0) {
    return content.TeachingSections?.[teachingIndex]?.Title || `Teaching ${teachingIndex + 1}`;
  }
  if (activityIndex >= 0) {
    return content.InteractiveActivities?.[activityIndex]?.Title || `Activity ${activityIndex + 1}`;
  }
  if (step === "case_study") return content.CaseStudy?.Title || "Case study";
  if (step === "home_practice") return content.HomePracticeTask?.Title || "Home practice";
  if (step === "formal_assessment") return content.FormalAssessment?.Title || "Formal assessment";
  if (step === "quiz") return content.Quiz?.Title || "Knowledge quiz";
  if (step === "final_reflection") return "Final reflection";
  return `Step ${index + 1}`;
}

function normaliseAnswer(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function isProductionQuizQuestionCorrect(
  question: ProductionQuizQuestion,
  answer: string | string[] | undefined,
) {
  if (Array.isArray(question.CorrectAnswers)) {
    if (!Array.isArray(answer)) return false;
    const expected = [...question.CorrectAnswers].map(normaliseAnswer).sort();
    const received = [...answer].map(normaliseAnswer).sort();
    return (
      expected.length === received.length &&
      expected.every((value, index) => value === received[index])
    );
  }

  if (typeof question.CorrectAnswer === "string") {
    if (Array.isArray(answer) || typeof answer !== "string") return false;
    return normaliseAnswer(question.CorrectAnswer) === normaliseAnswer(answer);
  }

  return false;
}

export function scoreProductionQuiz(
  quiz: ProductionQuiz | undefined,
  answers: QuizAnswerMap,
) {
  const questions = quiz?.Questions ?? [];
  const possiblePoints = questions.reduce(
    (total, question) => total + Math.max(question.Points ?? 1, 0),
    0,
  );
  const earnedPoints = questions.reduce((total, question) => {
    if (!question.QuestionId) return total;
    return (
      total +
      (isProductionQuizQuestionCorrect(question, answers[question.QuestionId])
        ? Math.max(question.Points ?? 1, 0)
        : 0)
    );
  }, 0);
  const percent =
    possiblePoints > 0 ? Math.round((earnedPoints / possiblePoints) * 100) : 0;
  const criticalSafetyPassed = questions
    .filter((question) => question.CriticalSafetyQuestion)
    .every(
      (question) =>
        Boolean(question.QuestionId) &&
        isProductionQuizQuestionCorrect(
          question,
          answers[question.QuestionId as string],
        ),
    );
  const passPercent = quiz?.PassPercent ?? 80;

  return {
    earnedPoints,
    possiblePoints,
    percent,
    criticalSafetyPassed,
    passed: percent >= passPercent && criticalSafetyPassed,
  };
}

export function nextProductionLessonStep(step: ProductionLessonStep) {
  const index = PRODUCTION_LESSON_STEPS.indexOf(step);
  return PRODUCTION_LESSON_STEPS[index + 1] ?? null;
}

export function previousProductionLessonStep(step: ProductionLessonStep) {
  const index = PRODUCTION_LESSON_STEPS.indexOf(step);
  return index > 0 ? PRODUCTION_LESSON_STEPS[index - 1] : null;
}
