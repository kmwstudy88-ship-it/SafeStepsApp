import { buildCourtReportDraft } from "../lib/engines/courtReportBuilderEngine";
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
        "rubric-score-summary",
        "domain-score-summary",
        "critical-override-summary",
        "trend-summary",
        "readiness-index",
        "readiness-signals",
        "readiness-flags",
        "evidence-summary",
        "supervisor-review",
        "decision-authority-boundary",
        "immutability-and-audit-note",
      ]),
    );
    expect(report.evidenceList).toHaveLength(1);
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
});
