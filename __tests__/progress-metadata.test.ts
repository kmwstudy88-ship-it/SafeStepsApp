import {
  metadataEvidenceTitles,
  metadataLessonId,
  metadataQuizPassed,
  metadataTaskTitles,
  metadataVideoStepCount,
} from "../lib/progressMetadata";

describe("progress metadata helpers", () => {
  test("reads snake_case and camelCase task titles", () => {
    expect(
      metadataTaskTitles({
        task_titles: ["first task"],
        taskTitles: ["second task"],
      }),
    ).toEqual(["first task", "second task"]);
  });

  test("reads snake_case and camelCase evidence titles", () => {
    expect(
      metadataEvidenceTitles({
        evidence_titles: ["first evidence"],
        evidenceTitles: ["second evidence"],
      }),
    ).toEqual(["first evidence", "second evidence"]);
  });

  test("ignores non-string metadata values", () => {
    expect(
      metadataTaskTitles({
        task_titles: ["valid", 1, null],
        taskTitles: [false, "also valid"],
      }),
    ).toEqual(["valid", "also valid"]);
  });

  test("reads interactive video metadata", () => {
    const metadata = {
      lessonId: "strengthening-family-bond-v10",
      videoStepCount: 10,
      quizPassed: true,
    };

    expect(metadataLessonId(metadata)).toBe("strengthening-family-bond-v10");
    expect(metadataVideoStepCount(metadata)).toBe(10);
    expect(metadataQuizPassed(metadata)).toBe(true);
  });

  test("ignores malformed interactive video metadata", () => {
    expect(metadataLessonId({ lessonId: 123 })).toBeNull();
    expect(metadataVideoStepCount({ videoStepCount: "10" })).toBeNull();
    expect(metadataQuizPassed({ quizPassed: "true" })).toBeNull();
  });
});
