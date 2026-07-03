import { safestepsLessonCurriculum1To47 } from "../lib/data/safestepsLessonCurriculum1To47";
import { safestepsLessonCurriculum48To95 } from "../lib/data/safestepsLessonCurriculum48To95";
import { safestepsExpandedLessonCurriculum252To780 } from "../lib/data/safestepsExpandedLessonCurriculum252To780";
import { appLessons, getLessonById } from "../lib/lessonContent";

describe("SafeSteps lesson curriculum 1-47", () => {
  test("contains the complete foundation lesson range", () => {
    expect(safestepsLessonCurriculum1To47).toHaveLength(47);
    expect(safestepsLessonCurriculum1To47[0].id).toBe(1);
    expect(safestepsLessonCurriculum1To47[0].title).toBe("Active Listening");
    expect(safestepsLessonCurriculum1To47.at(-1)?.id).toBe(47);
    expect(safestepsLessonCurriculum1To47.at(-1)?.title).toBe("Communication Without Conflict");
  });

  test("makes the foundation lessons available in the app lesson flow", () => {
    expect(appLessons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "foundation-active-listening",
          week: 1,
          title: "Active Listening",
        }),
        expect.objectContaining({
          id: "foundation-communication-without-conflict",
          week: 47,
          title: "Communication Without Conflict",
        }),
      ]),
    );

    expect(getLessonById("foundation-active-listening")?.sections.length).toBeGreaterThan(0);
    expect(getLessonById("foundation-communication-without-conflict")?.actions.length).toBeGreaterThan(0);
  });
});

describe("SafeSteps lesson curriculum 48-95", () => {
  test("contains the complete lesson range without grouping into courses", () => {
    expect(safestepsLessonCurriculum48To95).toHaveLength(48);
    expect(safestepsLessonCurriculum48To95[0].lessonNumber).toBe(48);
    expect(safestepsLessonCurriculum48To95[0].title).toBe("Complex Trauma");
    expect(safestepsLessonCurriculum48To95.at(-1)?.lessonNumber).toBe(95);
    expect(safestepsLessonCurriculum48To95.at(-1)?.title).toBe("Ethics and Social Justice");
  });

  test("has unique slugs and continuous lesson numbers", () => {
    const slugs = new Set(safestepsLessonCurriculum48To95.map((lesson) => lesson.slug));

    expect(slugs.size).toBe(safestepsLessonCurriculum48To95.length);
    expect(safestepsLessonCurriculum48To95.map((lesson) => lesson.lessonNumber)).toEqual(
      Array.from({ length: 48 }, (_, index) => index + 48),
    );
  });

  test("keeps required lesson curriculum fields for later course building", () => {
    for (const lesson of safestepsLessonCurriculum48To95) {
      expect(lesson.slug).toBeTruthy();
      expect(lesson.beforeQuestion).toBeTruthy();
      expect(lesson.afterQuestion).toBeTruthy();
      expect(lesson.learningPurpose).toBeTruthy();
      expect(lesson.learningOutcomes.length).toBeGreaterThan(0);
      expect(lesson.teachingTranscript).toBeTruthy();
      expect(lesson.practiceActivity).toBeTruthy();
      expect(lesson.knowledgeCheck.question).toBeTruthy();
      expect(lesson.knowledgeCheck.suggestedAnswer).toBeTruthy();
      expect(lesson.evidenceTask).toBeTruthy();
      expect(lesson.completionRecordQuestions.length).toBeGreaterThan(0);
    }
  });

  test("makes the production curriculum lessons available in the app lesson flow", () => {
    expect(appLessons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "complex-trauma",
          week: 48,
          title: "Complex Trauma",
        }),
        expect.objectContaining({
          id: "ethics-and-social-justice",
          week: 95,
          title: "Ethics and Social Justice",
        }),
      ]),
    );
    expect(getLessonById("complex-trauma")?.sections.length).toBeGreaterThan(0);
    expect(getLessonById("ethics-and-social-justice")?.actions.length).toBeGreaterThan(0);
  });

  test("makes the uploaded expanded lessons available in the app lesson flow", () => {
    expect(safestepsExpandedLessonCurriculum252To780).toHaveLength(528);

    const firstLesson = safestepsExpandedLessonCurriculum252To780[0];
    expect(firstLesson.title).toBe("Communication roadblocks");
    expect(firstLesson.learningPurpose).toBeTruthy();
    expect(firstLesson.teachingTranscript).toBeTruthy();
    expect(firstLesson.evidenceTask).toBeTruthy();

    const appLesson = getLessonById(firstLesson.slug);
    expect(appLesson?.title).toBe(firstLesson.title);
    expect(appLesson?.sections.length).toBeGreaterThan(0);
    expect(appLesson?.actions.length).toBeGreaterThan(0);
  });
});
