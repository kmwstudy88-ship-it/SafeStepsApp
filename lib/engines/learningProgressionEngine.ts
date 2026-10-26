/**
 * SafeSteps Learning & Curriculum Progression Engine
 *
 * Tracks educational curriculum progression across SafeSteps courses:
 *   - Active Listening, Nervous System Regulation, Family Conflict, Co-Parenting
 *
 * Key safety guardrails:
 *   - Explicitly keeps quiz/course scores distinct from in-person parental competency.
 *   - Verifies certificate issuance eligibility (lessons complete + reflection quality).
 *   - Prevents treating educational completion as automated reunification clearance.
 *
 * Decision-support only; human worker review required.
 */

export type LessonCompletionRecord = {
  lessonId: string;
  moduleId: string;
  completedAt: string;
  reflectionText?: string;
  quizScorePercent?: number;
  timeSpentSeconds: number;
};

export type CourseCurriculumDefinition = {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  requiredReflectionsCount: number;
  passQuizScoreThreshold: number; // e.g. 70
};

export type LearningProgressionInput = {
  userId: string;
  caseId?: string;
  course: CourseCurriculumDefinition;
  completedLessons: LessonCompletionRecord[];
  integrityDeclarationAccepted: boolean;
};

export type CourseCertificateEligibility = {
  eligible: boolean;
  blockers: string[];
  issuedAt: string | null;
  certificateId: string | null;
};

export type LearningProgressionResult = {
  userId: string;
  courseId: string;
  completionPercent: number; // 0-100
  lessonsCompletedCount: number;
  totalLessonsRequired: number;
  averageQuizScore: number;
  reflectionsSubmittedCount: number;
  certificate: CourseCertificateEligibility;
  educationalDisclaimer: string;
  decisionSupportOnly: true;
  humanReviewRequired: true;
};

export function evaluateLearningProgression(
  input: LearningProgressionInput,
): LearningProgressionResult {
  const uniqueCompletedLessonIds = new Set(input.completedLessons.map((l) => l.lessonId));
  const completedCount = uniqueCompletedLessonIds.size;
  const total = Math.max(1, input.course.totalLessons);
  const completionPercent = Math.min(100, Math.round((completedCount / total) * 100));

  const quizScores = input.completedLessons
    .map((l) => l.quizScorePercent)
    .filter((s): s is number => typeof s === "number" && !isNaN(s));

  const averageQuizScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((acc, curr) => acc + curr, 0) / quizScores.length)
    : 0;

  const reflections = input.completedLessons.filter(
    (l) => typeof l.reflectionText === "string" && l.reflectionText.trim().length >= 20,
  );
  const reflectionsCount = reflections.length;

  // Certificate eligibility evaluation
  const blockers: string[] = [];
  if (completedCount < input.course.totalLessons) {
    blockers.push(`Incomplete lessons: ${completedCount} of ${input.course.totalLessons} completed.`);
  }
  if (reflectionsCount < input.course.requiredReflectionsCount) {
    blockers.push(
      `Insufficient reflections: ${reflectionsCount} of ${input.course.requiredReflectionsCount} submitted with substantive content.`,
    );
  }
  if (quizScores.length > 0 && averageQuizScore < input.course.passQuizScoreThreshold) {
    blockers.push(
      `Average quiz score (${averageQuizScore}%) is below the required threshold (${input.course.passQuizScoreThreshold}%).`,
    );
  }
  if (!input.integrityDeclarationAccepted) {
    blockers.push("Learner must accept the academic integrity declaration before certificate issuance.");
  }

  const eligible = blockers.length === 0;
  const certificate: CourseCertificateEligibility = {
    eligible,
    blockers,
    issuedAt: eligible ? new Date().toISOString() : null,
    certificateId: eligible ? `CERT-${input.course.courseId.toUpperCase()}-${input.userId.slice(0, 8)}` : null,
  };

  const educationalDisclaimer =
    "Curriculum completion confirms participation in educational learning modules. It does NOT constitute a clinical assessment, legal finding, or automated reunification decision.";

  return {
    userId: input.userId,
    courseId: input.course.courseId,
    completionPercent,
    lessonsCompletedCount: completedCount,
    totalLessonsRequired: input.course.totalLessons,
    averageQuizScore,
    reflectionsSubmittedCount: reflectionsCount,
    certificate,
    educationalDisclaimer,
    decisionSupportOnly: true,
    humanReviewRequired: true,
  };
}
