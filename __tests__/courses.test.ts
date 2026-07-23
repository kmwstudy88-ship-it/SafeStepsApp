import {
  areAllCourseLessonsViewed,
  courseAreas,
  getCourseById,
  getCoursesForArea,
  getGoldStandardCourses,
} from "../curriculum/courses";

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
    ["emotional-regulation-for-parents", 3],
    ["parent-safety-and-stability", 3],
    ["co-parenting-foundations", 3],
    ["accountability-and-responsibility", 3],
    ["substance-use-and-parenting-stability", 3],
    ["mental-health-stress-and-parenting", 3],
    ["relationship-skills", 3],
    ["safe-conversations", 3],
    ["protective-parenting-foundations", 3],
    ["family-mental-health-curriculum", 14],
    ["understanding-your-nervous-system", 12],
    ["breaking-the-cycle-intergenerational-trauma", 12],
    ["your-child-s-brain-what-they-need-from-you", 14],
    ["emotional-literacy", 14],
    ["healthy-relationships", 15],
    ["financial-literacy-and-life-skills", 15],
    ["co-parenting-after-separation", 15],
    ["seeing-through-your-child-s-eyes", 14],
    ["self-compassion-and-shame-resilience", 15],
    ["executive-functioning-in-family-life", 15],
    ["digital-safety-for-families", 15],
    ["building-your-village", 15],
    ["safesteps-behaviour-guidance-foundations", 12],
    ["safesteps-child-development-and-wellbeing", 12],
    ["safesteps-connection-and-regulation", 6],
    ["safesteps-safety-separation-and-coparenting", 9],
    ["safesteps-communication-and-family-conversations", 8],
    ["safesteps-production-readiness-practice-pack", 4],
    ["strong-fathers-safe-children", 48],
  ])("%s lessons include parent meaning prompts", (courseId, lessonCount) => {
    const course = getCourseById(courseId);

    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(lessonCount);
    for (const lesson of course!.lessons) {
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();
    }
  });

  test("complete imported course library contains 171 lessons", () => {
    const courseIds = [
      "understanding-your-nervous-system",
      "breaking-the-cycle-intergenerational-trauma",
      "your-child-s-brain-what-they-need-from-you",
      "emotional-literacy",
      "healthy-relationships",
      "financial-literacy-and-life-skills",
      "co-parenting-after-separation",
      "seeing-through-your-child-s-eyes",
      "self-compassion-and-shame-resilience",
      "executive-functioning-in-family-life",
      "digital-safety-for-families",
      "building-your-village",
    ];

    const lessonCount = courseIds.reduce((total, courseId) => {
      return total + (getCourseById(courseId)?.lessons.length ?? 0);
    }, 0);

    expect(lessonCount).toBe(171);
  });

  test("gold standard course helper exposes the 12-course pathway in order", () => {
    const goldStandardCourses = getGoldStandardCourses();
    const lessonCount = goldStandardCourses.reduce((total, course) => total + course.lessons.length, 0);

    expect(goldStandardCourses).toHaveLength(12);
    expect(goldStandardCourses[0]?.id).toBe("understanding-your-nervous-system");
    expect(goldStandardCourses.at(-1)?.id).toBe("building-your-village");
    expect(lessonCount).toBe(171);
  });

  test("SafeSteps production courses contain all 47 source lessons", () => {
    const courseIds = [
      "safesteps-behaviour-guidance-foundations",
      "safesteps-child-development-and-wellbeing",
      "safesteps-connection-and-regulation",
      "safesteps-safety-separation-and-coparenting",
      "safesteps-communication-and-family-conversations",
    ];

    const lessonCount = courseIds.reduce((total, courseId) => {
      return total + (getCourseById(courseId)?.lessons.length ?? 0);
    }, 0);

    expect(lessonCount).toBe(47);
  });

  test("father pathway course is available as a standalone course", () => {
    const course = getCourseById("strong-fathers-safe-children");

    expect(course?.title).toBe("Strong Fathers, Safe Children");
    expect(course?.lessons).toHaveLength(48);
    expect(course?.lessons[0]).toEqual(
      expect.objectContaining({
        title: "What Children Need From Fathers",
        durationMinutes: 25,
      }),
    );
  });

  test("production readiness practice pack includes first-class tasks, assessments, tests, activities, and evidence", () => {
    const course = getCourseById("safesteps-production-readiness-practice-pack");

    expect(course?.description).toContain("tasks");
    expect(course?.lessons).toHaveLength(4);

    const requiredStepTitles = [
      /activity/i,
      /assessment|checkpoint/i,
      /knowledge|test/i,
      /task/i,
      /evidence/i,
    ];

    for (const lesson of course!.lessons) {
      const steps = lesson.content?.steps ?? [];
      const stepTitles = steps.map((step) => step.title).join(" ");
      const stepBodies = steps.map((step) => step.body).join(" ");

      expect(lesson.summary?.length).toBeGreaterThan(60);
      expect(lesson.content?.whyItMatters.length).toBeGreaterThan(200);
      expect(lesson.content?.parentMeaningPrompt).toBeTruthy();

      for (const titlePattern of requiredStepTitles) {
        expect(`${stepTitles} ${stepBodies}`).toMatch(titlePattern);
      }

      expect(stepBodies).toMatch(/upload|save|record/i);
    }
  });

  test("course areas map users to real structured course sets", () => {
    expect(courseAreas.length).toBeGreaterThanOrEqual(8);

    for (const area of courseAreas) {
      const areaCourses = getCoursesForArea(area.id);

      expect(areaCourses).toHaveLength(area.courseIds.length);
      expect(areaCourses.some((course) => course.id === area.suggestedStartCourseId)).toBe(true);
      expect(area.description.length).toBeGreaterThan(20);
    }
  });
});
