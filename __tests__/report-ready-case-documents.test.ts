import {
  buildReportReadyDocumentAppendix,
  currentReportReadyVersion,
  isReportReadyCaseDocument,
  type ReportReadyCaseDocument,
} from "../lib/reportReadyCaseDocuments";

const baseDocument: ReportReadyCaseDocument = {
  id: "document-1",
  case_id: "case-1",
  current_version_id: "version-2",
  document_type: "service_letter",
  title: "Service letter",
  status: "accepted",
  expiry_date: null,
  court_report_include: true,
  notes: "Reviewed for report use.",
  updated_at: "2026-08-08T00:00:00.000Z",
  case_document_versions: [
    {
      id: "version-1",
      version_number: 1,
      file_name: "service-letter-v1.pdf",
      mime_type: "application/pdf",
      file_sha256: "a".repeat(64),
      uploaded_at: "2026-08-01T00:00:00.000Z",
      review_status: "needs_update",
      review_notes: "Older version.",
    },
    {
      id: "version-2",
      version_number: 2,
      file_name: "service-letter-v2.pdf",
      mime_type: "application/pdf",
      file_sha256: "b".repeat(64),
      uploaded_at: "2026-08-08T00:00:00.000Z",
      review_status: "accepted",
      review_notes: "Accepted current version.",
    },
  ],
};

describe("Evidence V1 report-ready case documents", () => {
  test("requires accepted status and explicit report inclusion", () => {
    expect(isReportReadyCaseDocument(baseDocument)).toBe(true);
    expect(isReportReadyCaseDocument({ ...baseDocument, status: "reviewed" })).toBe(false);
    expect(isReportReadyCaseDocument({ ...baseDocument, court_report_include: false })).toBe(false);
  });

  test("uses the explicitly selected current version", () => {
    expect(currentReportReadyVersion(baseDocument)?.id).toBe("version-2");
  });

  test("builds a tamper-checkable appendix from report-ready documents only", () => {
    const appendix = buildReportReadyDocumentAppendix([
      baseDocument,
      { ...baseDocument, id: "document-pending", status: "reviewed" },
      { ...baseDocument, id: "document-not-selected", court_report_include: false },
    ]);

    expect(appendix).toHaveLength(1);
    expect(appendix[0]).toMatchObject({
      appendixNumber: 1,
      documentId: "document-1",
      caseId: "case-1",
      title: "Service letter",
      versionNumber: 2,
      fileName: "service-letter-v2.pdf",
      fileSha256: "b".repeat(64),
      versionReviewStatus: "accepted",
    });
  });
});
