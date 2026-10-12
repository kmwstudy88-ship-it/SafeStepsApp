jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from "../lib/supabase";
import {
  fetchLatestCourtReportSupervisorApproval,
  saveCourtReportSupervisorApproval,
} from "../lib/engines/courtReportSupervisorApprovalEngine";

function queryResult(data: unknown) {
  const resolved = { data, error: null };
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(resolved),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolved),
  };
}

describe("court report supervisor approval engine", () => {
  beforeEach(() => {
    (supabase.from as jest.Mock).mockReset();
  });

  test("fetches the latest approval for a case", async () => {
    const approval = {
      id: "approval-1",
      case_id: "case-1",
      snapshot_hash: "sha256:report",
      approved: true,
      reviewed_by: "supervisor-1",
      reviewer_name: "Supervisor",
      review_notes: "Approved.",
      approval_scope: "report_export",
      created_at: "2026-07-16T00:00:00.000Z",
    };
    const query = queryResult(approval);
    (supabase.from as jest.Mock).mockReturnValueOnce(query);

    await expect(fetchLatestCourtReportSupervisorApproval("case-1")).resolves.toEqual(approval);
    expect(supabase.from).toHaveBeenCalledWith("court_report_supervisor_approvals");
    expect(query.eq).toHaveBeenCalledWith("case_id", "case-1");
  });

  test("saves an immutable approval decision", async () => {
    const approval = {
      id: "approval-1",
      case_id: "case-1",
      snapshot_hash: "sha256:report",
      approved: true,
      reviewed_by: "supervisor-1",
      reviewer_name: "Supervisor",
      review_notes: "Approved.",
      approval_scope: "report_export",
      created_at: "2026-07-16T00:00:00.000Z",
    };
    const query = queryResult(approval);
    (supabase.from as jest.Mock).mockReturnValueOnce(query);

    await saveCourtReportSupervisorApproval({
      caseId: "case-1",
      snapshotHash: "sha256:report",
      approved: true,
      reviewerName: "Supervisor",
      reviewNotes: "Approved.",
    });

    expect(query.insert).toHaveBeenCalledWith({
      case_id: "case-1",
      snapshot_hash: "sha256:report",
      approved: true,
      reviewer_name: "Supervisor",
      review_notes: "Approved.",
      approval_scope: "report_export",
    });
  });
});
