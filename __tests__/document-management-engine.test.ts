import {
  buildDocumentStoragePath,
  createDocumentManagementSummary,
  daysUntilDocumentExpiry,
  evaluateDocumentExpiryAlerts,
  nextDocumentVersionNumber,
  type CaseDocumentRecord,
  type CaseDocumentRequest,
} from "../lib/engines/documentManagementEngine";

const now = new Date("2026-07-12T00:00:00.000Z");

function documentFixture(overrides: Partial<CaseDocumentRecord>): CaseDocumentRecord {
  return {
    id: "document-1",
    case_id: "case-1",
    parent_user_id: null,
    worker_user_id: null,
    current_version_id: null,
    linked_evidence_id: null,
    linked_assessment_id: null,
    document_type: "financial",
    title: "Income statement",
    status: "submitted",
    expiry_date: null,
    court_report_include: false,
    notes: "",
    created_by: null,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

function requestFixture(overrides: Partial<CaseDocumentRequest>): CaseDocumentRequest {
  return {
    id: "request-1",
    case_id: "case-1",
    document_id: null,
    parent_user_id: null,
    requested_by: null,
    document_type: "financial",
    title: "Income statement",
    reason: "",
    due_at: null,
    status: "requested",
    created_at: "2026-07-01T00:00:00.000Z",
    fulfilled_at: null,
    ...overrides,
  };
}

describe("documentManagementEngine", () => {
  test("calculates version numbers from the highest existing version", () => {
    expect(nextDocumentVersionNumber([{ version_number: 1 }, { version_number: 4 }, { version_number: 2 }])).toBe(5);
    expect(nextDocumentVersionNumber([])).toBe(1);
  });

  test("normalizes app-controlled document storage paths", () => {
    expect(
      buildDocumentStoragePath({
        caseId: "case-1",
        documentId: "doc-1",
        versionNumber: 2,
        fileName: "signed tenancy renewal.pdf",
      }),
    ).toBe("case-documents/case-1/doc-1/v2-signed_tenancy_renewal.pdf");
  });

  test("creates moderate and high expiry alerts without escalating excluded documents", () => {
    const alerts = evaluateDocumentExpiryAlerts(
      [
        documentFixture({ id: "soon", title: "Tenancy agreement", expiry_date: "2026-07-20" }),
        documentFixture({ id: "expired", title: "Financial statement", expiry_date: "2026-07-10" }),
        documentFixture({ id: "excluded", status: "excluded", title: "Old document", expiry_date: "2026-07-10" }),
      ],
      now,
    );

    expect(alerts).toHaveLength(2);
    expect(alerts.map((alert) => alert.severity)).toEqual(["moderate", "high"]);
    expect(alerts.map((alert) => alert.notificationType)).toEqual(["document_expiry", "document_expiry"]);
  });

  test("summarizes document readiness for case review", () => {
    const summary = createDocumentManagementSummary(
      [
        documentFixture({ status: "accepted", court_report_include: true, expiry_date: "2026-07-20" }),
        documentFixture({ status: "needs_update" }),
      ],
      [requestFixture({ status: "requested" }), requestFixture({ status: "submitted" })],
      now,
    );

    expect(summary).toEqual({
      totalDocuments: 2,
      acceptedDocuments: 1,
      needsUpdate: 1,
      expiringOrExpired: 1,
      openRequests: 1,
      reportReadyDocuments: 1,
    });
  });

  test("uses whole-day UTC expiry math", () => {
    expect(daysUntilDocumentExpiry("2026-07-12", now)).toBe(0);
    expect(daysUntilDocumentExpiry("2026-07-13", now)).toBe(1);
    expect(daysUntilDocumentExpiry(null, now)).toBeNull();
  });
});
