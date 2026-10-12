import { workerCaseContextFromRow } from "../lib/workerCaseReview";

describe("worker case review target", () => {
  test("uses the selected case parent rather than the signed-in worker", () => {
    expect(
      workerCaseContextFromRow({
        id: "case-1",
        parent_user_id: "parent-1",
        parent_carer_name: "Parent One",
        case_number: "SS-001",
        family_label: "Family One",
        status: "active",
        program_stream: "Back on Track",
        review_due_date: "2026-09-01",
        court_date: "2026-09-15",
      }),
    ).toEqual({
      id: "case-1",
      parentUserId: "parent-1",
      parentCarerName: "Parent One",
      caseNumber: "SS-001",
      familyLabel: "Family One",
      status: "active",
      programStream: "Back on Track",
      reviewDueDate: "2026-09-01",
      courtDate: "2026-09-15",
    });
  });

  test("refuses a worker review when the case has no parent participant", () => {
    expect(() =>
      workerCaseContextFromRow({
        id: "case-2",
        parent_user_id: null,
        parent_carer_name: null,
        case_number: null,
        family_label: null,
        status: "active",
        program_stream: null,
        review_due_date: null,
        court_date: null,
      }),
    ).toThrow("does not have a parent participant assigned");
  });
});
