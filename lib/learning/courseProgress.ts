import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CourseQuestion,
  UnderstandingHarmCourse,
} from './understandingHarmCourse';

const STORAGE_KEY = 'safesteps_course_progress_understanding_harm_basic_v1';

export type LessonResult = {
  scenarioScore: number;
  quizScore: number;
  completedAt: string;
};

export type AssessmentResult = {
  score: number;
  passed: boolean;
  attempt: number;
  competencyScores: Record<string, number>;
  completedAt: string;
};

export type CourseProgress = {
  courseId: string;
  completedLessonIds: string[];
  lessonResults: Record<string, LessonResult>;
  assessmentAttempts: AssessmentResult[];
  shareWithPractitioner: boolean;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export function createInitialProgress(courseId: string): CourseProgress {
  const now = new Date().toISOString();
  return {
    courseId,
    completedLessonIds: [],
    lessonResults: {},
    assessmentAttempts: [],
    shareWithPractitioner: false,
    startedAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

export async function loadCourseProgress(
  courseId: string,
): Promise<CourseProgress> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialProgress(courseId);

  const parsed = JSON.parse(raw) as CourseProgress;
  if (parsed.courseId !== courseId) return createInitialProgress(courseId);
  return parsed;
}

export async function saveCourseProgress(
  progress: CourseProgress,
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...progress,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function scoreQuestion(
  question: CourseQuestion,
  selectedChoiceId: string,
): number {
  return (
    question.choices.find((choice) => choice.id === selectedChoiceId)?.score ??
    0
  );
}

export function scoreQuestionSet(
  questions: CourseQuestion[],
  answers: Record<string, string>,
): number {
  if (questions.length === 0) return 0;
  const total = questions.reduce(
    (sum, question) => sum + scoreQuestion(question, answers[question.id]),
    0,
  );
  return Math.round(total / questions.length);
}

export function scoreFinalAssessment(
  course: UnderstandingHarmCourse,
  answers: Record<string, string>,
  attempt: number,
): AssessmentResult {
  const score = scoreQuestionSet(course.finalAssessment.questions, answers);
  const competencyTotals: Record<string, { total: number; count: number }> = {};

  course.finalAssessment.questions.forEach((question) => {
    if (!question.competencyId) return;
    const current = competencyTotals[question.competencyId] ?? {
      total: 0,
      count: 0,
    };
    current.total += scoreQuestion(question, answers[question.id]);
    current.count += 1;
    competencyTotals[question.competencyId] = current;
  });

  const competencyScores = Object.fromEntries(
    Object.entries(competencyTotals).map(([key, value]) => [
      key,
      Math.round(value.total / value.count),
    ]),
  );

  return {
    score,
    passed:
      score >= course.finalAssessment.passMark &&
      course.competencies.every(
        (competency) =>
          (competencyScores[competency.id] ?? 0) >= competency.requiredScore,
      ),
    attempt,
    competencyScores,
    completedAt: new Date().toISOString(),
  };
}

export function getCourseCompletionPercentage(
  course: UnderstandingHarmCourse,
  progress: CourseProgress,
): number {
  const lessonWeight = 80;
  const lessonsComplete =
    progress.completedLessonIds.length / course.sections.length;
  const assessmentComplete =
    progress.assessmentAttempts.some((attempt) => attempt.passed) ? 20 : 0;
  return Math.min(
    100,
    Math.round(lessonsComplete * lessonWeight + assessmentComplete),
  );
}

export function isLessonUnlocked(
  course: UnderstandingHarmCourse,
  progress: CourseProgress,
  lessonIndex: number,
): boolean {
  if (lessonIndex === 0) return true;
  return progress.completedLessonIds.includes(
    course.sections[lessonIndex - 1].id,
  );
}

