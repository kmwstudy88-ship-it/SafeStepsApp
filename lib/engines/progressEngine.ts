export function calculateLessonComplete(progress: {
  startReflection: boolean;
  lessonViewed: boolean;
  knowledgeCheckpoint: boolean;
  scenarioCheckpoint: boolean;
  practicalActivity: boolean;
  endReflection: boolean;
}) {
  return (
    progress.startReflection &&
    progress.lessonViewed &&
    progress.knowledgeCheckpoint &&
    progress.scenarioCheckpoint &&
    progress.practicalActivity &&
    progress.endReflection
  );
}
