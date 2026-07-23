import {
  buildCourtReportSnapshotDraft,
  buildCourtReportDraft,
  structuredEvidenceToCourtReportEvidence,
} from "../lib/engines/courtReportBuilderEngine";
import type {
  AssessmentScoreResult,
  CompositeReadinessRiskResult,
} from "../lib/engines/assessmentScoringEngine";

const assessment: AssessmentScoreResult = {
  domainScores: [
    { domainId: "protective-capacity", rawScore: 8, maxPossible: 10, normalizedScore: 80 },
    { domainId: "service-engagement", rawScore: 6, maxPossible: 10, normalizedScore: 60 },
  ],
  overallScore: 74,
  band: {
    id: "emerging",
    label: "Emerging Readiness",
    minScore: 60,
    maxScore: 79.99,
    recommendation: "Continue monitoring.",
  },
  overrideTriggered: false,
  override: null,
  requiresSupervisorReview: false,
  recommendation: "Continue monitoring.",
};

const readiness: CompositeReadinessRiskResult = {
  compositeScore: 72,
  recommendation: "Emerging progress shown.",
  flags: [],
  signals: [],
  suppressedByOverride: false,
  riskBand: "Moderate",
  direction: "improving",
  workerOnly: true,
};

function makeReportInput() {
  return {
    caseSummary: {
      caseName: "Sample family case",
      program: "24 Month Reunification Program",
      phase: "Foundation",
      assessmentPurpose: "Progress review",
      preparedBy: "Worker",
      generatedAt: "2026-07-13T00:00:00.000Z",
    },
    assessment,
    readiness,
    evidence: [
      {
        id: "evidence-1",
        title: "Home routine",
        type: "document" as const,
        createdAt: "2026-07-01T00:00:00.000Z",
        status: "reviewed" as const,
        provenance: "worker_observed" as const,
        reviewAvailability: "linked_worker_available" as const,
        linkedDomains: ["Routines"],
        integrityHash: "sha256:test",
      },
    ],
    contradictions: [],
    collaterals: [],
    workerNarrative: {
      strengths: "Consistent engagement.",
      concerns: "Needs more generalisation evidence.",
      nextSteps: "Continue monitoring.",
    },
    supervisorReview: {
      approved: true,
      reviewedBy: "Supervisor",
      reviewedAt: "2026-07-13T01:00:00.000Z",
    },
    dataSources: {
      assessment: "live_reviewed" as const,
      readiness: "live_reviewed" as const,
      evidence: "live_reviewed" as const,
      collateral: "live_reviewed" as const,
      workerNarrative: "live_reviewed" as const,
      supervisorReview: "live_reviewed" as const,
    },
    trends: [
      {
        domainId: "protective-capacity",
        previousScore: 55,
        currentScore: 80,
        change: 25,
        direction: "improving" as const,
      },
    ],
  };
}

describe("court report builder", () => {
  test("builds a structured report draft from assessment and evidence inputs", () => {
    const report = buildCourtReportDraft(makeReportInput());

    expect(report.title).toBe("SafeSteps Court-Aware Progress Report");
    expect(report.status).toBe("approved");
    expect(report.sections.map((section) => section.id)).toEqual(
      expect.arrayContaining([
        "case-summary",
        "assessment-evaluation-framework",
        "report-data-source-status",
        "export-readiness-gate",
        "rubric-score-summary",
        "domain-score-summary",
        "critical-override-summary",
        "trend-summary",
        "readiness-index",
        "readiness-signals",
        "readiness-flags",
        "evidence-summary",
        "evidence-reliance-boundary",
        "supervisor-review",
        "decision-authority-boundary",
        "immutability-and-audit-note",
      ]),
    );
    expect(report.evidenceList).toHaveLength(1);
  });

  test("includes assessment methodology and parent-submitted evidence boundary", () => {
    const report = buildCourtReportDraft(makeReportInput());
    const methodology = report.sections.find((section) => section.id === "assessment-evaluation-framework");

    expect(methodology?.body).toContain("SafeSteps Assessment and Evaluation Framework");
    expect(methodology?.body).toContain("professional, legal, and statutory decision-making");
    expect(methodology?.body).toContain("Parent/family evidence remains valid as supportive evidence");
    expect(methodology?.body).toContain("legal proceedings");
    expect(methodology?.body).toContain("must not be described as worker-reviewed");
    expect(methodology?.body).toContain("decision-support findings");
    expect(methodology?.reviewRequired).toBe(true);
  });

  test("surfaces report data source status and blocks court-ready approval for calibration inputs", () => {
    const report = buildCourtReportDraft({
      ...makeReportInput(),
      dataSources: {
        assessment: "calibration",
        readiness: "calibration",
        evidence: "live_unreviewed",
        collateral: "not_connected",
        workerNarrative: "not_connected",
        supervisorReview: "not_connected",
      },
    });
    const dataSourceSection = report.sections.find((section) => section.id === "report-data-source-status");

    expect(report.status).toBe("supervisor_review_required");
    expect(report.supervisorReviewRequired).toBe(true);
    expect(dataSourceSection?.body).toContain("Assessment scoring: calibration preview.");
    expect(dataSourceSection?.body).toContain("Evidence records: live unreviewed.");
    expect(dataSourceSection?.body).toContain("Supervisor review: not connected.");
    expect(dataSourceSection?.reviewRequired).toBe(true);
    expect(report.exportReadinessBlockers).toEqual(
      expect.arrayContaining([
        "assessment: calibration preview must be replaced with live reviewed records.",
        "evidence: live unreviewed must be replaced with live reviewed records.",
        "supervisorReview: not connected must be replaced with live reviewed records.",
      ]),
    );
  });

  test("allows approved status when all data sources are live reviewed", () => {
    const report = buildCourtReportDraft({
      ...makeReportInput(),
      dataSources: {
        assessment: "live_reviewed",
        readiness: "live_reviewed",
        evidence: "live_reviewed",
        collateral: "live_reviewed",
        workerNarrative: "live_reviewed",
        supervisorReview: "live_reviewed",
      },
    });

    expect(report.status).toBe("approved");
    expect(report.supervisorReviewRequired).toBe(false);
    expect(report.exportReadinessBlockers).toEqual([]);
  });

  test("builds a stable immutable snapshot draft for approved reports", () => {
    const report = buildCourtReportDraft(makeReportInput());
    const snapshot = buildCourtReportSnapshotDraft(report, {
      caseId: "case-1",
      ownerId: "owner-1",
      previousSnapshotHash: "sha256:previous",
    });

    expect(snapshot).toMatchObject({
      caseId: "case-1",
      ownerId: "owner-1",
      reportTitle: "SafeSteps Court-Aware Progress Report",
      reportStatus: "approved",
      previousSnapshotHash: "sha256:previous",
      readyForFinalExport: true,
      exportReadinessBlockers: [],
    });
    expect(snapshot.snapshotPayload.sections.map((section) => section.id)).toContain("export-readiness-gate");
    expect(snapshot.snapshotHashInput).toBe(
      buildCourtReportSnapshotDraft(report, {
        caseId: "case-1",
        ownerId: "owner-1",
        previousSnapshotHash: "sha256:previous",
      }).snapshotHashInput,
    );
  });

  test("keeps blocked reports out of final export snapshots", () => {
    const report = buildCourtReportDraft({
      ...makeReportInput(),
      supervisorReview: { approved: false },
      dataSources: {
        assessment: "calibration",
        readiness: "live_reviewed",
        evidence: "live_reviewed",
        collateral: "live_reviewed",
        workerNarrative: "live_reviewed",
        supervisorReview: "not_connected",
      },
    });
    const snapshot = buildCourtReportSnapshotDraft(report, { caseId: "case-1" });

    expect(snapshot.readyForFinalExport).toBe(false);
    expect(snapshot.reportStatus).toBe("supervisor_review_required");
    expect(snapshot.snapshotPayload.exportReadinessBlockers).toEqual(report.exportReadinessBlockers);
    expect(snapshot.snapshotHashInput).toContain("assessment: calibration preview");
  });

  test("adds an export readiness gate with concrete blockers", () => {
    const report = buildCourtReportDraft({
      ...makeReportInput(),
      supervisorReview: { approved: false },
      dataSources: {
        assessment: "live_reviewed",
        readiness: "live_reviewed",
        evidence: "live_unreviewed",
        collateral: "live_reviewed",
        workerNarrative: "live_reviewed",
        supervisorReview: "not_connected",
      },
      evidence: [
        {
          id: "stored-parent-evidence",
          title: "Parent routine log",
          type: "reflection",
          createdAt: "2026-07-05T00:00:00.000Z",
          status: "stored",
          provenance: "parent_family_submitted",
          reviewAvailability: "no_linked_worker",
          linkedDomains: ["Routines"],
        },
      ],
    });
    const gate = report.sections.find((section) => section.id === "export-readiness-gate");

    expect(gate?.reviewRequired).toBe(true);
    expect(gate?.body).toContain("evidence: live unreviewed must be replaced with live reviewed records.");
    expect(gate?.body).toContain("supervisor: final supervisor approval is not recorded.");
    expect(gate?.body).toContain("Parent routine log: saved but not reviewed or accepted.");
    expect(report.exportReadinessBlockers.length).toBeGreaterThan(2);
  });

  test("surfaces critical overrides and preserves computed score context", () => {
    const report = buildCourtReportDraft({
      ...makeReportInput(),
      assessment: {
        ...assessment,
        overallScore: 82,
        overrideTriggered: true,
        requiresSupervisorReview: true,
        override: {
          id: "dv-override",
          itemId: "dfv-risk",
          triggerOptionId: "active-untreated",
          forcedBandId: "critical-review",
          reason: "Active untreated domestic violence risk.",
          requiresSupervisorReview: true,
        },
        band: {
          id: "critical-review",
          label: "Critical Review Required",
          minScore: 0,
          maxScore: 39.99,
          recommendation: "Supervisor review required.",
          requiresSupervisorReview: true,
        },
      },
      supervisorReview: { approved: false },
    });

    const overrideSection = report.sections.find((section) => section.id === "critical-override-summary");

    expect(report.status).toBe("supervisor_review_required");
    expect(overrideSection?.body).toContain("Critical override triggered.");
    expect(overrideSection?.body).toContain("computed weighted score is preserved");
    expect(overrideSection?.reviewRequired).toBe(true);
  });

  test("requires supervisor review for critical unresolved contradictions", () => {
    const report = buildCourtReportDraft({
      ...makeReportInput(),
      supervisorReview: { approved: false },
      contradictions: [
        {
          id: "contradiction-1",
          severity: "critical",
          summary: "Collateral conflicts with parent report.",
          sourceA: "Parent report",
          sourceB: "Collateral",
          resolved: false,
        },
      ],
    });

    expect(report.status).toBe("supervisor_review_required");
    expect(report.supervisorReviewRequired).toBe(true);
    expect(report.unresolvedContradictions).toHaveLength(1);
  });

  test("labels parent-family submitted evidence without linked worker review as supportive but not verified", () => {
    const report = buildCourtReportDraft({
      ...makeReportInput(),
      supervisorReview: {
        approved: true,
        reviewedBy: "Supervisor",
        reviewedAt: "2026-07-13T01:00:00.000Z",
      },
      evidence: [
        {
          id: "parent-evidence-1",
          title: "Parent routine log",
          type: "reflection",
          createdAt: "2026-07-05T00:00:00.000Z",
          status: "stored",
          provenance: "parent_family_submitted",
          reviewAvailability: "no_linked_worker",
          relianceLimitations: ["No linked worker review attached."],
          linkedDomains: ["Routines"],
        },
      ],
    });
    const evidenceSummary = report.sections.find((section) => section.id === "evidence-summary");
    const relianceBoundary = report.sections.find((section) => section.id === "evidence-reliance-boundary");

    expect(report.status).toBe("supervisor_review_required");
    expect(report.supervisorReviewRequired).toBe(true);
    expect(evidenceSummary?.body).toContain("parent/family-submitted supportive evidence");
    expect(evidenceSummary?.body).toContain("must not be labelled worker-reviewed");
    expect(evidenceSummary?.reviewRequired).toBe(true);
    expect(relianceBoundary?.body).toContain("not worker-reviewed or professionally verified");
    expect(relianceBoundary?.reviewRequired).toBe(true);
  });

  test("maps structured evidence rows into court-report evidence records", () => {
    const evidence = structuredEvidenceToCourtReportEvidence({
      id: "structured-1",
      title: "Direct observation: Contact visit repair",
      evidence_type: "direct_observation",
      review_status: "reviewed",
      status: "stored",
      file_path: null,
      created_at: "2026-07-16T00:00:00.000Z",
      integrity_hash: "sha256:structured",
      structured_data: {
        source_reliability: "direct_observation",
        linked_domains: ["Repair", "Child response"],
        limitations: ["Scheduled contact centre visit."],
        review_availability: {
          status: "linked_worker_available",
        },
      },
    });

    expect(evidence).toEqual({
      id: "structured-1",
      title: "Direct observation: Contact visit repair",
      type: "visit_note",
      createdAt: "2026-07-16T00:00:00.000Z",
      status: "reviewed",
      provenance: "worker_observed",
      reviewAvailability: "linked_worker_available",
      relianceLimitations: ["Scheduled contact centre visit."],
      linkedDomains: ["Repair", "Child response"],
      integrityHash: "sha256:structured",
    });
  });

  test("maps parent-family structured evidence warnings into report reliance limitations", () => {
    const evidence = structuredEvidenceToCourtReportEvidence({
      id: "structured-2",
      title: "Self-report or interview: Weekly barrier check-in",
      evidence_type: "self_report_interview",
      review_status: "draft",
      status: "stored",
      file_path: null,
      created_at: "2026-07-16T01:00:00.000Z",
      structured_data: {
        review_availability: {
          status: "no_linked_worker",
        },
        review_readiness: {
          warnings: ["No linked case or support worker is currently attached to this family case file."],
        },
      },
    });

    expect(evidence.type).toBe("reflection");
    expect(evidence.status).toBe("draft");
    expect(evidence.provenance).toBe("parent_family_submitted");
    expect(evidence.reviewAvailability).toBe("no_linked_worker");
    expect(evidence.relianceLimitations).toContain(
      "No linked case or support worker is currently attached to this family case file.",
    );
  });
});
