import { courses } from "../curriculum/courses";
import {
  safestepsExpandedLessonCurriculum252To780,
  safestepsLessonCurriculum1To47,
  safestepsLessonCurriculum48To95,
} from "../curriculum/lessons";
import { appLessons } from "../lib/lessonContent";
import { resolveProgramCurriculum } from "../programs/curriculumComposition";

describe("canonical curriculum boundary", () => {
  it("exposes lessons and courses from the curriculum sections", () => {
    expect(safestepsLessonCurriculum1To47).toHaveLength(47);
    expect(safestepsLessonCurriculum48To95).toHaveLength(48);
    expect(safestepsExpandedLessonCurriculum252To780).toHaveLength(524);
    expect(courses.length).toBeGreaterThan(0);
  });

  it("excludes invalid and duplicate imported lesson records", () => {
    const ids = new Set(
      safestepsExpandedLessonCurriculum252To780.map((lesson) => lesson.id),
    );
    const titles = safestepsExpandedLessonCurriculum252To780.map(
      (lesson) => lesson.title,
    );

    expect(ids.has("SS-30-40-BATCH3-001")).toBe(false);
    expect(ids.has("SS-30-40-BATCH3-028")).toBe(false);
    expect(ids.has("SS-30-40-BATCH3-043")).toBe(false);
    expect(ids.has("SS-30-40-BATCH3-312")).toBe(false);
    expect(titles).not.toContain("Often Include");
    expect(titles).toContain("Recognising and Measuring Parenting Growth");
    expect(titles).toContain("Creating Safe Family Structure");
  });

  it("lets programs compose existing lessons and courses by identifier", () => {
    const lesson = appLessons[0];
    const course = courses[0];

    const resolved = resolveProgramCurriculum({
      lessonIds: [lesson.id],
      courseIds: [course.id],
    });

    expect(resolved.lessons).toEqual([lesson]);
    expect(resolved.courses).toEqual([course]);
  });

  it("rejects broken program curriculum references", () => {
    expect(() =>
      resolveProgramCurriculum({
        lessonIds: ["missing-lesson"],
        courseIds: ["missing-course"],
      }),
    ).toThrow(
      "Program references missing curriculum: lesson:missing-lesson, course:missing-course",
    );
  });
});
