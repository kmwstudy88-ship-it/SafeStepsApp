import { oneDriveLessonLibrary } from "../lib/data/oneDriveLessonLibrary";
import { appLessons, getLessonById } from "../lib/lessonContent";

describe("OneDrive lesson library import", () => {
  test("imports all lesson-prefixed OneDrive JSON files as flat lessons", () => {
    expect(oneDriveLessonLibrary).toHaveLength(227);
  });

  test("keeps stable unique ids and slugs", () => {
    const ids = new Set(oneDriveLessonLibrary.map((lesson) => lesson.id));
    const slugs = new Set(oneDriveLessonLibrary.map((lesson) => lesson.slug));

    expect(ids.size).toBe(oneDriveLessonLibrary.length);
    expect(slugs.size).toBe(oneDriveLessonLibrary.length);
    expect(oneDriveLessonLibrary.every((lesson) => lesson.id.startsWith("onedrive-"))).toBe(true);
  });

  test("keeps required lesson fields for app display", () => {
    for (const lesson of oneDriveLessonLibrary) {
      expect(lesson.title).toBeTruthy();
      expect(lesson.summary).toBeTruthy();
      expect(lesson.estimatedMinutes).toBeGreaterThan(0);
      expect(lesson.learningOutcomes.length).toBeGreaterThan(0);
      expect(lesson.practiceActivities.length).toBeGreaterThan(0);
    }
  });

  test("makes OneDrive lessons available in the app lesson flow", () => {
    const lesson = getLessonById("onedrive-active-listening");

    expect(lesson?.title).toBe("Active Listening");
    expect(lesson?.sections.length).toBeGreaterThan(0);
    expect(lesson?.actions.length).toBeGreaterThan(0);
    expect(appLessons.some((item) => item.id === "onedrive-trauma-informed-principles")).toBe(true);
  });
});
