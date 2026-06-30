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
});
