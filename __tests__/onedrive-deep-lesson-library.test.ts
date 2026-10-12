import { oneDriveDeepLessonLibrary } from "../lib/data/oneDriveDeepLessonLibrary";
import { appLessons, getLessonById } from "../lib/lessonContent";

describe("OneDrive deep lesson library import", () => {
  test("imports all non-prefixed OneDrive lesson JSON files as flat deep lessons", () => {
    expect(oneDriveDeepLessonLibrary).toHaveLength(65);
  });

  test("keeps stable unique ids and slugs", () => {
    const ids = new Set(oneDriveDeepLessonLibrary.map((lesson) => lesson.id));
    const slugs = new Set(oneDriveDeepLessonLibrary.map((lesson) => lesson.slug));

    expect(ids.size).toBe(oneDriveDeepLessonLibrary.length);
    expect(slugs.size).toBe(oneDriveDeepLessonLibrary.length);
    expect(oneDriveDeepLessonLibrary.every((lesson) => lesson.id.startsWith("onedrive-deep-"))).toBe(true);
  });

  test("keeps required deep lesson content for app display", () => {
    for (const lesson of oneDriveDeepLessonLibrary) {
      expect(lesson.title).toBeTruthy();
      expect(lesson.summary).toBeTruthy();
      expect(lesson.estimatedMinutes).toBeGreaterThan(0);
      expect(lesson.sections.length).toBeGreaterThan(0);
      expect(lesson.sections[0].overview).toBeTruthy();
      expect(lesson.sections[0].learningGoals.length).toBeGreaterThan(0);
      expect(lesson.sections[0].practiceIdeas.length).toBeGreaterThan(0);
    }
  });

  test("makes deep lessons available in the app lesson flow", () => {
    const lesson = getLessonById("onedrive-deep-active-listening");

    expect(lesson?.title).toBe("Active Listening");
    expect(lesson?.sections.length).toBeGreaterThan(0);
    expect(lesson?.actions.length).toBeGreaterThan(0);
    expect(appLessons.some((item) => item.id === "onedrive-deep-understanding-child-trauma")).toBe(true);
  });
});
