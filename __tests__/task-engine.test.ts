import {
  buildScenarioActivityTaskInput,
  buildParentChallengeTaskInput,
  evaluateTaskCompletionRequirement,
} from "../lib/engines/taskEngine";

describe("task engine", () => {
  test("builds a user task from a parent challenge", () => {
    const taskInput = buildParentChallengeTaskInput("SS-PC-001");

    expect(taskInput).toEqual(
      expect.objectContaining({
        title: "Connection Check-In",
        priority: "medium",
        category: "parent_challenge:Connection & Attachment",
        evidence_required: true,
        related_lesson_id: "challenge:SS-PC-001",
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

  test("blocks evidence-required challenge completion without linked evidence", () => {
    expect(
      evaluateTaskCompletionRequirement(
        {
          evidence_required: true,
          category: "parent_challenge:Connection & Attachment",
          related_lesson_id: "challenge:SS-PC-001",
        },
        0,
      ),
    ).toEqual({
      canComplete: false,
      linkedEvidenceCount: 0,
      reason: "Add or upload evidence for this challenge before marking it complete.",
    });
  });

  test("allows evidence-required challenge completion when linked evidence exists", () => {
    expect(
      evaluateTaskCompletionRequirement(
        {
          evidence_required: true,
          category: "parent_challenge:Connection & Attachment",
          related_lesson_id: "challenge:SS-PC-001",
        },
        1,
      ),
    ).toEqual({
      canComplete: true,
      linkedEvidenceCount: 1,
      reason: undefined,
    });
  });

  test("builds evidence-required tasks from scenario activity modules", () => {
    const taskInput = buildScenarioActivityTaskInput("parenting_response_meltdown_response_01");

    expect(taskInput).toEqual(
      expect.objectContaining({
        title: "Responding to a Child Meltdown",
        priority: "medium",
        category: "scenario_activity:parenting_response",
        evidence_required: true,
        related_lesson_id: "scenario:parenting_response_meltdown_response_01",
      }),
    );
    expect(taskInput.description).toContain("Scenario: Child has a loud meltdown in a supermarket.");
    expect(taskInput.description).toContain("Evidence requirement:");
  });

  test("blocks evidence-required scenario tasks without linked evidence", () => {
    expect(
      evaluateTaskCompletionRequirement(
        {
          evidence_required: true,
          category: "scenario_activity:parenting_response",
          related_lesson_id: "scenario:parenting_response_meltdown_response_01",
        },
        0,
      ),
    ).toEqual({
      canComplete: false,
      linkedEvidenceCount: 0,
      reason: "Add or upload evidence for this activity before marking it complete.",
    });
  });
});
