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

  test("positive parenting lessons include parent meaning prompts", () => {
    const course = getCourseById("positive-parenting-foundations");

    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(3);
    for (const lesson of course!.lessons) {
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();
    }
  });

  test("attachment and bonding lessons include parent meaning prompts", () => {
    const course = getCourseById("attachment-and-bonding-foundations");

    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(3);
    for (const lesson of course!.lessons) {
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();
    }
  });

  test("behaviour management lessons include parent meaning prompts", () => {
    const course = getCourseById("behaviour-management-foundations");

    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(3);
    for (const lesson of course!.lessons) {
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();
    }
  });

  test("demonstrating change lessons include parent meaning prompts", () => {
    const course = getCourseById("demonstrating-change-self-managed-safety");

    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(4);
    for (const lesson of course!.lessons) {
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();
    }
  });

  test("child safety lessons include parent meaning prompts", () => {
    const course = getCourseById("child-safety-foundations");

    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(3);
    for (const lesson of course!.lessons) {
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();
    }
  });

  test("family routines lessons include parent meaning prompts", () => {
    const course = getCourseById("family-routines-and-structure");

    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(3);
    for (const lesson of course!.lessons) {
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();
    }
  });

  test.each([
    ["reunification-parenting-foundations", 3],
    ["trauma-informed-parenting-foundations", 3],
  ])("%s lessons include parent meaning prompts", (courseId, lessonCount) => {
    const course = getCourseById(courseId);

    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(lessonCount);
    for (const lesson of course!.lessons) {
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();
    }
  });
});
