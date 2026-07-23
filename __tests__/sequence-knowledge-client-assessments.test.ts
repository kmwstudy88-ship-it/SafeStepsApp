import {
  buildSequenceKnowledgeSubmission,
  getSequenceKnowledgeClientAssessment,
} from "../lib/data/sequenceKnowledgeClientAssessments";

describe("sequence knowledge client assessments", () => {
  it("exposes a display-only sequence activity", () => {
    const assessment = getSequenceKnowledgeClientAssessment();

    expect(assessment.id).toBe("SEQ-0001");
    expect(assessment.items).toHaveLength(6);
    expect(assessment.items.filter((item) => item.kind === "ordered_step")).toHaveLength(5);
    expect(assessment.items.filter((item) => item.kind === "leave_out")).toHaveLength(1);
  });

  it("does not expose answer keys or distractor explanations to the client payload", () => {
    const assessment = getSequenceKnowledgeClientAssessment();
    const serialized = JSON.stringify(assessment);

    expect(serialized).not.toContain("correct_position");
    expect(serialized).not.toContain("distractor_reason");
    expect(serialized).not.toContain("critical");
  });

  it("builds the minimal submission envelope for trusted scoring", () => {
    const assessment = getSequenceKnowledgeClientAssessment();
    const orderedItems = assessment.items.filter((item) => item.kind === "ordered_step");
    const excludedItems = assessment.items.filter((item) => item.kind === "leave_out");

    expect(
      buildSequenceKnowledgeSubmission(
        assessment.id,
        orderedItems,
        excludedItems,
        "2026-07-22T00:00:00.000Z",
      ),
    ).toEqual({
      assessmentId: "SEQ-0001",
      orderedStepIds: orderedItems.map((item) => item.id),
      excludedStepIds: excludedItems.map((item) => item.id),
      submittedAt: "2026-07-22T00:00:00.000Z",
    });
  });
});
