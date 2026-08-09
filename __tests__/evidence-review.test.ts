import {
  currentEvidenceReviewVersion,
  validateEvidenceReviewDecision,
  type EvidenceReviewDocument,
} from "../lib/evidenceReview";

const document: EvidenceReviewDocument = {
  id: "document-1",
  case_id: "case-1",
  current_version_id: "version-2",
  document_type: "service_letter",
  title: "Service letter",
  status: "submitted",
  court_report_include: false,
  notes: "",
  updated_at: "2026-08-09T00:00:00.000Z",
  case_document_versions: [
    {
      id: "version-1",
      document_id: "document-1",
      version_number: 1,
      file_name: "letter-v1.pdf",
      mime_type: "application/pdf",
      file_sha256: "a".repeat(64),
      uploaded_at: "2026-08-01T00:00:00.000Z",
      review_status: "needs_update",
      review_notes: "Superseded.",
    },
    {
      id: "version-2",
      document_id: "document-1",
      version_number: 2,
      file_name: "letter-v2.pdf",
      mime_type: "application/pdf",
      file_sha256: "b".repeat(64),
      uploaded_at: "2026-08-09T00:00:00.000Z",
      review_status: "pending",
      review_notes: "",
    },
  ],
};

describe("Evidence V1 worker review", () => {
  test("reviews the explicitly selected current version", () => {
    expect(currentEvidenceReviewVersion(document)?.id).toBe("version-2");
  });

  test("allows accepted evidence to be selected for reporting", () => {
    expect(validateEvidenceReviewDecision({
      decision: "accepted",
      includeInReport: true,
      reviewNotes: "Current version and source checked.",
    })).toBeNull();
  });

  test("does not allow returned or excluded evidence into reports", () => {
    expect(validateEvidenceReviewDecision({
      decision: "needs_update",
      includeInReport: true,
      reviewNotes: "Updated date required.",
    })).toBe("Only accepted evidence can be selected for report inclusion.");
  });

  test("requires a human explanation when returning or excluding evidence", () => {
    expect(validateEvidenceReviewDecision({
      decision: "excluded",
      includeInReport: false,
      reviewNotes: "   ",
    })).toBe("Review notes are required when evidence is returned or excluded.");
  });
});
