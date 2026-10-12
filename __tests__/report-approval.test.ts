import {
  currentCaseReportVersion,
  currentReportPdf,
  validateReportDecision,
  type CaseReport,
} from "../lib/reportApproval";

const report: CaseReport = {
  id: "report-1",
  reunification_case_id: "case-1",
  report_reference: "SSR-001",
  report_type: "progress",
  audience_type: "court",
  purpose: "Longitudinal progress summary",
  status: "approval_pending",
  current_version: 2,
  primary_author_id: "author-1",
  approved_by: null,
  approved_at: null,
  released_at: null,
  report_versions: [
    {
      id: "version-1",
      report_id: "report-1",
      version_number: 1,
      version_status: "superseded",
      content_hash: "a".repeat(64),
      created_by: "author-1",
      created_at: "2026-08-01T00:00:00.000Z",
    },
    {
      id: "version-2",
      report_id: "report-1",
      version_number: 2,
      version_status: "review",
      content_hash: "b".repeat(64),
      created_by: "author-1",
      created_at: "2026-08-10T00:00:00.000Z",
      report_rendered_files: [{
        id: "pdf-2",
        report_id: "report-1",
        report_version: 2,
        file_format: "pdf",
        storage_bucket: "private-reports",
        storage_path: "case-1/report-1/v2.pdf",
        file_hash_sha256: "c".repeat(64),
        generated_at: "2026-08-10T00:00:00.000Z",
      }],
    },
  ],
};

describe("Report approval and release V1", () => {
  test("locks review to the current version and matching PDF", () => {
    const version = currentCaseReportVersion(report);
    expect(version?.id).toBe("version-2");
    expect(currentReportPdf(version)?.id).toBe("pdf-2");
  });

  test("requires an independent reviewer", () => {
    expect(validateReportDecision({
      decision: "approved",
      decisionReason: "",
      reviewerId: "author-1",
      authorId: "author-1",
    })).toBe("Independent approval requires a reviewer who did not author this version.");
  });

  test("requires reasons for return and rejection", () => {
    expect(validateReportDecision({
      decision: "changes_requested",
      decisionReason: " ",
    })).toBe("A reason is required when returning or rejecting a report.");
  });

  test("allows an independent approval", () => {
    expect(validateReportDecision({
      decision: "approved",
      decisionReason: "Sources, limitations and current version checked.",
      reviewerId: "supervisor-1",
      authorId: "author-1",
    })).toBeNull();
  });
});
