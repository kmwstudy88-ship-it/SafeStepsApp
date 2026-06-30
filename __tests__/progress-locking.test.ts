import { computeLessonLocks } from "../lib/platform/progress";

describe("progress locking", () => {
  test("unlocks first lesson only when nothing is complete", () => {
    const result = computeLessonLocks([
      { id: "lesson-2", day_number: 2 },
      { id: "lesson-1", day_number: 1 },
      { id: "lesson-3", day_number: 3 },
    ], []);

    expect(result).toEqual([
      { lessonId: "lesson-1", status: "unlocked", locked: false },
      { lessonId: "lesson-2", status: "locked", locked: true },
      { lessonId: "lesson-3", status: "locked", locked: true },
    ]);
  });

  test("unlocks next lesson after completion", () => {
    const result = computeLessonLocks([
      { id: "lesson-1", day_number: 1 },
      { id: "lesson-2", day_number: 2 },
    ], ["lesson-1"]);

    expect(result).toEqual([
      { lessonId: "lesson-1", status: "completed", locked: false },
      { lessonId: "lesson-2", status: "unlocked", locked: false },
    ]);
  });
});