jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from "../lib/supabase";
import { fetchCourtReportLiveData } from "../lib/engines/courtReportLiveDataEngine";
import type { AssessmentCaseSetup } from "../lib/engines/assessmentCaseEngine";

const caseRecord: AssessmentCaseSetup = {
  id: "case-1",
  owner_id: "owner-1",
  family_label: "Smith family",
  parent_carer_name: "Parent",
  child_names: ["Child"],
  program_stream: "24 Month Reunification Program",
  assessment_type: "Protective capacity",
  case_goals: [],
  case_start_date: "2026-07-01",
  assessment_date: "2026-07-10",
  review_due_date: null,
  court_date: null,
  support_worker_name: "Support worker",
  caseworker_name: "Caseworker",
  supervisor_name: "Supervisor",
  legal_contact_name: null,
  status: "active",
  program_phase: 1,
  opened_date: "2026-07-01",
  updated_at: "2026-07-16T00:00:00.000Z",
};

function queryResult(data: unknown) {
  const resolved = { data, error: null };
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(resolved),
    then: jest.fn((resolve: (value: typeof resolved) => unknown) => Promise.resolve(resolve(resolved))),
  };
}

describe("court report live data engine", () => {
  beforeEach(() => {
    (supabase.from as jest.Mock).mockReset();
  });

  test("maps live assessment, readiness, contradictions, collateral, and notes", async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(queryResult([
        { id: "assessment-2", assessment_date: "2026-07-16T00:00:00.000Z", narrative_summary: "Latest summary.", administered_by: "Worker", status: "completed" },
        { id: "assessment-1", assessment_date: "2026-07-01T00:00:00.000Z", narrative_summary: "Previous summary.", administered_by: "Worker", status: "completed" },
      ]))
      .mockReturnValueOnce(queryResult({
        overall_score: 82,
        band_id: "ready",
        band_label: "Supported Readiness",
        override_triggered: false,
        requires_supervisor_review: false,
        recommendation: "Continue supports.",
      }))
      .mockReturnValueOnce(queryResult([
        { domain_id: "domain-1", raw_score: 8, max_possible: 10, normalized_score: 80 },
      ]))
      .mockReturnValueOnce(queryResult([
        { domain_id: "domain-1", raw_score: 6, max_possible: 10, normalized_score: 60 },
      ]))
      .mockReturnValueOnce(queryResult({
        computed_at: "2026-07-16T00:00:00.000Z",
        assessment_signal: 82,
        service_signal: 75,
        visitation_signal: 70,
        milestone_signal: 65,
        composite_score: 76,
        recommendation: "Moderate readiness.",
        flags: ["Review before progression."],
        suppressed_by_override: false,
      }))
      .mockReturnValueOnce(queryResult([
        {
          id: "contradiction-1",
          severity: "high",
          description: "Parent report conflicts with collateral.",
          source_a: "Parent report",
          source_b: "Collateral",
          resolved_at: null,
        },
      ]))
      .mockReturnValueOnce(queryResult([
        {
          id: "collateral-1",
          source_name: "Service provider",
          source_role: "Counsellor",
          received_at: "2026-07-15T00:00:00.000Z",
          summary: "Attendance confirmed.",
          alignment_with_self_report: "aligned",
        },
      ]))
      .mockReturnValueOnce(queryResult([
        { id: "note-1", note_type: "strength_note", title: null, body: "Routines improving.", created_at: "2026-07-15T00:00:00.000Z" },
        { id: "note-2", note_type: "risk_note", title: null, body: "Generalisation still needs review.", created_at: "2026-07-15T01:00:00.000Z" },
        { id: "note-3", note_type: "supervision_note", title: null, body: "Supervisor discussed draft.", created_at: "2026-07-15T02:00:00.000Z" },
      ]))
      .mockReturnValueOnce(queryResult({
        id: "approval-1",
        case_id: "case-1",
        snapshot_hash: "sha256:report",
        approved: true,
        reviewed_by: "supervisor-1",
        reviewer_name: "Supervisor",
        review_notes: "Approved for export.",
        approval_scope: "report_export",
        created_at: "2026-07-16T00:00:00.000Z",
      }));

    const liveData = await fetchCourtReportLiveData(caseRecord);

    expect(liveData.assessment?.overallScore).toBe(82);
    expect(liveData.readiness?.compositeScore).toBe(76);
    expect(liveData.contradictions[0]).toMatchObject({ severity: "high", resolved: false });
    expect(liveData.collaterals[0]).toMatchObject({ source: "Service provider (Counsellor)", alignment: "aligned" });
    expect(liveData.workerNarrative?.strengths).toContain("Routines improving.");
    expect(liveData.supervisorReview).toMatchObject({ approved: true, reviewedBy: "Supervisor" });
    expect(liveData.dataSources).toMatchObject({
      assessment: "live_reviewed",
      readiness: "live_reviewed",
      collateral: "live_reviewed",
      workerNarrative: "live_reviewed",
      supervisorReview: "live_reviewed",
    });
    expect(liveData.trends).toEqual([
      {
        domainId: "domain-1",
        previousScore: 60,
        currentScore: 80,
        change: 20,
        direction: "improving",
      },
    ]);
  });

  test("returns calibration source statuses when live assessment rows are absent", async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(queryResult([]))
      .mockReturnValueOnce(queryResult(null))
      .mockReturnValueOnce(queryResult([]))
      .mockReturnValueOnce(queryResult([]))
      .mockReturnValueOnce(queryResult([]))
      .mockReturnValueOnce(queryResult(null));

    const liveData = await fetchCourtReportLiveData(caseRecord);

    expect(liveData.assessment).toBeNull();
    expect(liveData.readiness).toBeNull();
    expect(liveData.dataSources).toMatchObject({
      assessment: "calibration",
      readiness: "calibration",
      collateral: "calibration",
      workerNarrative: "calibration",
      supervisorReview: "not_connected",
    });
  });
});
