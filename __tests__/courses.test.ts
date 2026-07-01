import { areAllCourseLessonsViewed, getCourseById } from "../lib/data/courses";

describe("standalone course helpers", () => {
  test("finds courses by id without falling back to another course", () => {
    expect(getCourseById("communication-skills")?.title).toBe("Communication Skills");
    expect(getCourseById("missing-course")).toBeNull();
  });

  test("checks whether every course lesson has been viewed", () => {
    const course = getCourseById("communication-skills");

    expect(course).toBeDefined();
    expect(areAllCourseLessonsViewed(course!, { 1: true, 2: true })).toBe(false);
    expect(
      areAllCourseLessonsViewed(course!, {
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
      }),
    ).toBe(true);
  });

  test("communication lessons include parent meaning prompts", () => {
    const course = getCourseById("communication-skills");

    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(5);
    for (const lesson of course!.lessons) {
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();
    }
  });

  test("child development lessons include parent meaning prompts", () => {
    const course = getCourseById("child-development-foundations");

    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(4);
    for (const lesson of course!.lessons) {
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();
    }
  });
});
