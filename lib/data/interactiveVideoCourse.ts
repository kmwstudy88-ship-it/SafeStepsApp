export type InteractiveVideoQuizOption = {
  id: number;
  label: string;
  correct: boolean;
};

export type InteractiveVideoQuiz = {
  question: string;
  options: InteractiveVideoQuizOption[];
};

export type InteractiveVideoStep = {
  id: number;
  lessonId?: string;
  title: string;
  subtitle: string;
  url: string;
  productionVideoUrl?: string;
  reflectionPrompt: string;
  quiz?: InteractiveVideoQuiz;
  overview?: string;
  videoGoal?: string;
  evidencePrompt?: string;
  assetManifest?: {
    videoScriptMarkdown?: string;
    captionFile?: string;
    lessonJson?: string;
    targetRuntime?: string;
    workbookPages?: string;
  };
};

export type InteractiveVideoCourse = {
  lessonId: string;
  title: string;
  description: string;
  placeholderVideoUrl: string;
  steps: InteractiveVideoStep[];
};

export function interactiveVideoCourseUsesPlaceholderVideos(course: InteractiveVideoCourse) {
  return course.steps.some((step) => step.url === course.placeholderVideoUrl);
}

export function getInteractiveVideoCourseAssetStatus(course: InteractiveVideoCourse) {
  const placeholderStepCount = course.steps.filter((step) => step.url === course.placeholderVideoUrl).length;
  const missingProductionVideoSteps = course.steps.filter((step) => !step.productionVideoUrl);
  const missingCaptionSteps = course.steps.filter((step) => !step.assetManifest?.captionFile);
  const missingScriptSteps = course.steps.filter((step) => !step.assetManifest?.videoScriptMarkdown);

  return {
    isProductionReady:
      placeholderStepCount === 0 &&
      missingProductionVideoSteps.length === 0 &&
      missingCaptionSteps.length === 0 &&
      missingScriptSteps.length === 0,
    placeholderStepCount,
    missingProductionVideoStepIds: missingProductionVideoSteps.map((step) => step.lessonId ?? String(step.id)),
    missingCaptionStepIds: missingCaptionSteps.map((step) => step.lessonId ?? String(step.id)),
    missingScriptStepIds: missingScriptSteps.map((step) => step.lessonId ?? String(step.id)),
  };
}

export function formatInteractiveVideoCourseAssetStatus(course: InteractiveVideoCourse) {
  const status = getInteractiveVideoCourseAssetStatus(course);

  if (status.isProductionReady) {
    return "Production video assets ready";
  }

  const issues = [
    status.placeholderStepCount > 0 ? `${status.placeholderStepCount} demo videos` : null,
    status.missingCaptionStepIds.length > 0 ? `${status.missingCaptionStepIds.length} captions missing` : null,
    status.missingScriptStepIds.length > 0 ? `${status.missingScriptStepIds.length} scripts missing` : null,
  ].filter(Boolean);

  return `Production asset review required: ${issues.join(", ")}`;
}

export function buildInteractiveVideoCourseCompletionPayload(
  course: InteractiveVideoCourse,
  input: {
    answers: Record<number, string>;
    selectedQuizAnswerId: number | null;
  },
) {
  const quizStep = course.steps.find((step) => step.quiz);
  const quizOption = quizStep?.quiz?.options.find((option) => option.id === input.selectedQuizAnswerId);

  return {
    lessonId: course.lessonId,
    completedAt: new Date().toISOString(),
    userAnswers: input.answers,
    quizPassed: quizStep ? Boolean(quizOption?.correct) : true,
    videoStepCount: course.steps.length,
  };
}
