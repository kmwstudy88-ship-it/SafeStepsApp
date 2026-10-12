import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  buildStoragePath,
  canMutateFileObject,
  coreIntegrityRules,
  duplicateCanCorroborate,
  integrityPrinciples,
  integrityWorkflow,
  recommendedIntegrityBuildOrder,
  storageBuckets,
  summarizeIntegrityStatus,
  validateExportAccess,
  verifyFileHash,
  type EvidenceFileObject,
} from "../lib/engines/evidenceIntegrityFramework";

const originalFile: EvidenceFileObject = {
  id: "file-1",
  evidenceItemId: "evidence-1",
  objectRole: "original",
  storageBucket: "evidence-originals",
  storagePath: "/org/case/person/evidence/original/file-1.mp4",
  originalFilename: "morning-routine.mp4",
  detectedMimeType: "video/mp4",
  sizeBytes: 1200,
  sha256Hash: "abc123",
  immutable: true,
};

describe("evidenceIntegrityFramework", () => {
  it("defines the integrity workflow and storage buckets", () => {
    expect(integrityWorkflow[0]).toBe("evidence_capture");
    expect(integrityWorkflow.at(-1)).toBe("court_ready_export");
    expect(storageBuckets).toEqual([
      "evidence-quarantine",
      "evidence-originals",
      "evidence-derivatives",
      "evidence-redacted",
      "evidence-transcripts",
      "evidence-exports",
    ]);
  });

  it("verifies hashes without overstating authenticity", () => {
    expect(verifyFileHash({ expectedHash: "abc", calculatedHash: "abc" })).toBe("match");
    expect(verifyFileHash({ expectedHash: "abc", calculatedHash: "def" })).toBe("mismatch");
    expect(integrityPrinciples).toContain("Hash verification proves file integrity, not factual truth.");
  });

  it("prevents mutation of immutable original files", () => {
    expect(canMutateFileObject({ current: originalFile, attempted: { sizeBytes: 999 } })).toEqual({
      allowed: false,
      reason: "Original evidence files are immutable; create a derivative or superseding evidence record.",
    });
    expect(canMutateFileObject({ current: originalFile, attempted: { sizeBytes: 1200 } }).allowed).toBe(true);
  });

  it("builds privacy-safe storage paths without names or descriptions", () => {
    expect(
      buildStoragePath({
        organisationId: "org_001",
        caseId: "case_001",
        personId: "person_001",
        evidenceId: "evidence_001",
        role: "original",
        fileId: "file_001.mp4",
      }),
    ).toBe("/org_001/case_001/person_001/evidence_001/original/file_001.mp4");
  });

  it("blocks exports until every access control is satisfied", () => {
    const result = validateExportAccess({
      requesterAuthorised: true,
      purposePermitted: true,
      childOnlyEvidenceChecked: false,
      safetyRestrictionsChecked: true,
      redactionAppliedWhereRequired: true,
      legalHoldsResolved: false,
      privilegedMaterialChecked: true,
      thirdPartyInformationChecked: true,
      consentOrAuthorityConfirmed: true,
      approvalAuthorityReviewed: true,
    });

    expect(result.releasable).toBe(false);
    expect(result.failures).toEqual(["childOnlyEvidenceChecked", "legalHoldsResolved"]);
  });

  it("does not let duplicates inflate independent corroboration", () => {
    expect(duplicateCanCorroborate({ duplicateDetected: true, sameSourceChain: false })).toBe(false);
    expect(duplicateCanCorroborate({ duplicateDetected: false, sameSourceChain: true })).toBe(false);
    expect(duplicateCanCorroborate({ duplicateDetected: false, sameSourceChain: false })).toBe(true);
  });

  it("keeps integrity statuses separate and exposes the route", () => {
    expect(
      summarizeIntegrityStatus({
        fileIntegrity: "Verified",
        sourceIdentity: "Partially verified",
        captureProvenance: "Known",
        metadataConsistency: "Minor discrepancy resolved",
        contentAuthenticity: "Not independently confirmed",
        reviewStatus: "Accepted with limitations",
        competencyRelevance: "Moderate",
      }),
    ).toContain("Content authenticity: Not independently confirmed");
    expect(coreIntegrityRules).toContain("Authenticity, reliability and relevance remain separate.");
    expect(recommendedIntegrityBuildOrder).toHaveLength(5);
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/evidence-integrity"),
    ).toBe(true);
  });
});
