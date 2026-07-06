import { buildParentChallengeTaskInput } from "../lib/engines/taskEngine";

describe("task engine", () => {
  test("builds a user task from a parent challenge", () => {
    const taskInput = buildParentChallengeTaskInput("SS-PC-001");

    expect(taskInput).toEqual(
      expect.objectContaining({
        title: "Connection Check-In",
        priority: "medium",
        category: "parent_challenge:Connection & Attachment",
        evidence_required: true,
      }),
    );
    expect(taskInput.description).toContain("Challenge steps:");
    expect(taskInput.description).toContain("Reflection questions:");
    expect(taskInput.description).toContain("Completion checklist:");
    expect(taskInput.description).toContain("Evidence task:");
    expect(taskInput.description).toContain("Safety note:");
  });

  test("rejects missing parent challenge ids", () => {
    expect(() => buildParentChallengeTaskInput("missing-challenge")).toThrow(
      "Parent challenge not found.",
    );
  });
});
