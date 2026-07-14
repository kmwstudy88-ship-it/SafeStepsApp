import { courses } from "../curriculum/courses";
import { appLessons } from "../lib/lessonContent";

type ProgramCurriculumReference = {
  lessonIds?: string[];
  courseIds?: string[];
};

export function resolveProgramCurriculum(reference: ProgramCurriculumReference) {
  const lessons = (reference.lessonIds ?? []).map((lessonId) => {
    const lesson = appLessons.find((candidate) => candidate.id === lessonId);
    return { id: lessonId, type: "lesson" as const, value: lesson };
  });

  const resolvedCourses = (reference.courseIds ?? []).map((courseId) => {
    const course = courses.find((candidate) => candidate.id === courseId);
    return { id: courseId, type: "course" as const, value: course };
  });

  const missing = [...lessons, ...resolvedCourses]
    .filter((entry) => !entry.value)
    .map((entry) => `${entry.type}:${entry.id}`);

  if (missing.length > 0) {
    throw new Error(`Program references missing curriculum: ${missing.join(", ")}`);
  }

  return {
    lessons: lessons.map((entry) => entry.value),
    courses: resolvedCourses.map((entry) => entry.value),
  };
}
