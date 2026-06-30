import { draftEvidenceMatchingTemplates, tasksMatchingTemplates } from "../lib/bulkSelection";
import type { EvidenceItem, SafeStepsTask } from "../lib/platformData";

const baseTask: SafeStepsTask = {
  id: "task-1",
  title: "Selected task",
  description: "Selected",
  status: "ready",
  completed_at: null,
  due_at: null,
  priority: "medium",
  related_lesson_id: null,
  evidence_required: false,
  category: "test",
};

const baseEvidence: EvidenceItem = {
  id: "evidence-1",
  title: "Selected evidence",
  notes: "Selected",
  file_path: null,
  status: "draft",
  created_at: "2026-06-30T00:00:00.000Z",
};

describe("bulk setup selection helpers", () => {
  test("selects only tasks whose titles belong to the selected templates", () => {
    expect(
      tasksMatchingTemplates(
        [
          baseTask,
          { ...baseTask, id: "task-2", title: "Unrelated task" },
        ],
        [
          {
            title: "Selected task",
            description: "Selected",
            priority: "medium",
            related_lesson_id: null,
            evidence_required: false,
            category: "test",
            dueInDays: null,
          },
        ],
      ),
    ).toEqual([baseTask]);
  });

  test("selects only draft evidence whose titles belong to the selected templates", () => {
    expect(
      draftEvidenceMatchingTemplates(
        [
          baseEvidence,
          { ...baseEvidence, id: "evidence-2", title: "Selected evidence", status: "stored" },
          { ...baseEvidence, id: "evidence-3", title: "Unrelated evidence" },
        ],
        [{ title: "Selected evidence", notes: "Selected" }],
      ),
    ).toEqual([baseEvidence]);
  });
});
