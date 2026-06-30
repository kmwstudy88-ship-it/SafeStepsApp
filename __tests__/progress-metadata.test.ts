import { metadataEvidenceTitles, metadataTaskTitles } from "../lib/progressMetadata";

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
});
