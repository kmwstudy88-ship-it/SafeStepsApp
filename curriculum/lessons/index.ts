export {
  safestepsLessonCurriculum1To47,
  type SafeStepsFoundationLesson,
} from "./safestepsLessonCurriculum1To47";
export {
  safestepsLessonCurriculum48To95,
  type SafeStepsCurriculumLesson,
} from "./safestepsLessonCurriculum48To95";
import {
  safestepsExpandedLessonCurriculum252To780 as expandedLessonSource,
  type SafeStepsExpandedLesson,
} from "./safestepsExpandedLessonCurriculum252To780";
import {
  cleanExpandedLessons,
  enrichExpandedLessons,
} from "./expandedLessonContentOverrides";

export type { SafeStepsExpandedLesson };
export const safestepsExpandedLessonCurriculum252To780 =
  cleanExpandedLessons(enrichExpandedLessons(expandedLessonSource));
