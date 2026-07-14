import type {
  AssessmentScoreResult,
  CompositeReadinessRiskResult,
  ScoreTrend,
} from "./assessmentScoringEngine";

export type CourtReportEvidenceRecord = {
  id: string;
  title: string;
  type: "document" | "photo" | "video" | "reflection" | "visit_note" | "collateral" | "assessment" | "other";
  createdAt: string;
  status: "draft" | "stored" | "reviewed" | "accepted" | "needs_clarification" | "excluded";
  linkedDomains: string[];
  integrityHash?: string | null;
};

export type CourtReportContradiction = {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  summary: string;
  sourceA: string;
  sourceB: string;
  resolved: boolean;
};

export type CourtReportCollateral = {
  id: string;
  source: string;
  date: string;
  summary: string;
  alignment: "aligned" | "partial" | "conflicting" | "not_assessed";
};

export type CourtReportCaseSummary = {
  caseName: string;
  program: string;
  phase: string;
  assessmentPurpose: string;
  preparedBy: string;
  supervisor?: string;
  generatedAt: string;
};

export type CourtReportInput = {
  caseSummary: CourtReportCaseSummary;
  assessment: AssessmentScoreResult;
  readiness: CompositeReadinessRiskResult;
  evidence: CourtReportEvidenceRecord[];
  contradictions: CourtReportContradiction[];
  collaterals: CourtReportCollateral[];
  workerNarrative?: {
    strengths?: string;
    concerns?: string;
    nextSteps?: string;
  };
  supervisorReview?: {
    reviewedBy?: string;
    reviewedAt?: string;
    approved: boolean;
    notes?: string;
  };
  trends?: ScoreTrend[];
  previousVersionHash?: string | null;
};

export type CourtReportSection = {
  id: string;
  title: string;
  body: string;
  reviewRequired?: boolean;
};

export type CourtReportDraft = {
  title: string;
  versionLabel: string;
  status: "draft" | "supervisor_review_required" | "approved";
  generatedAt: string;
  sections: CourtReportSection[];
  evidenceList: CourtReportEvidenceRecord[];
  unresolvedContradictions: CourtReportContradiction[];
  supervisorReviewRequired: boolean;
  tamperEvidenceSummary: string;
};

function countByStatus(evidence: CourtReportEvidenceRecord[]) {
  return evidence.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {});
}

function buildEvidenceSummary(evidence: CourtReportEvidenceRecord[]) {
  if (evidence.length === 0) {
    return "No reviewed evidence records are attached to this report yet.";
  }

  const counts = countByStatus(evidence);
  const acceptedCount = counts.accepted ?? 0;
  const reviewedCount = counts.reviewed ?? 0;
  const clarificationCount = counts.needs_clarification ?? 0;
  const excludedCount = counts.excluded ?? 0;

  return [
    `${evidence.length} evidence records are linked to this report.`,
    `${acceptedCount + reviewedCount} records are accepted or reviewed.`,
    clarificationCount > 0 ? `${clarificationCount} records need clarification.` : "",
    excludedCount > 0 ? `${excludedCount} records are excluded from report reliance.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildContradictionSummary(contradictions: CourtReportContradiction[]) {
  const unresolved = contradictions.filter((item) => !item.resolved);
  if (unresolved.length === 0) {
    return "No unresolved contradiction records are currently attached to this report.";
  }

  return unresolved
    .map((item) => `${item.severity.toUpperCase()}: ${item.summary} (${item.sourceA} / ${item.sourceB})`)
    .join("\n");
}

function buildCollateralSummary(collaterals: CourtReportCollateral[]) {
  if (collaterals.length === 0) {
    return "No collateral records are attached yet.";
  }

  return collaterals
    .map((item) => `${item.date} - ${item.source}: ${item.summary} Alignment: ${item.alignment}.`)
    .join("\n");
}

function hasHighRiskUnresolvedContradiction(contradictions: CourtReportContradiction[]) {
  return contradictions.some(
    (item) => !item.resolved && (item.severity === "high" || item.severity === "critical"),
  );
}

function buildDomainScoreSummary(input: AssessmentScoreResult) {
  if (!input.domainScores.length) {
    return "No domain scores are attached to this report yet.";
  }

  return input.domainScores
    .map(
      (score) =>
        `${score.domainId}: ${score.normalizedScore}% (${score.rawScore}/${score.maxPossible})`,
    )
    .join("\n");
}

function buildOverrideSummary(input: AssessmentScoreResult) {
  if (!input.overrideTriggered || !input.override) {
    return "No critical override was triggered. The scoring band is based on the computed weighted score.";
  }

  return [
    "Critical override triggered.",
    `Reason: ${input.override.reason}`,
    `Forced band: ${input.band?.label ?? input.override.forcedBandId}`,
    "The computed weighted score is preserved, but it does not determine the final outcome.",
    input.requiresSupervisorReview ? "Supervisor review is required." : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildReadinessSignalSummary(input: CompositeReadinessRiskResult) {
  return input.signals
    .map((signal) => {
      const percentWeight = Math.round(signal.weight * 100);
      const value = signal.score == null ? "missing" : `${signal.score}%`;
      return `${signal.label}: ${value} (${percentWeight}% weight)`;
    })
    .join("\n");
}

function buildTrendSummary(trends: ScoreTrend[] | undefined) {
  if (!trends?.length) {
    return "No previous matching assessment is attached for trend comparison yet.";
  }

  return trends
    .map(
      (trend) =>
        `${trend.domainId}: ${trend.previousScore} -> ${trend.currentScore} (${trend.change >= 0 ? "+" : ""}${trend.change}, ${trend.direction})`,
    )
    .join("\n");
}

export function buildCourtReportDraft(input: CourtReportInput): CourtReportDraft {
  const unresolvedContradictions = input.contradictions.filter((item) => !item.resolved);
  const supervisorReviewRequired =
    input.assessment.requiresSupervisorReview ||
    input.readiness.suppressedByOverride ||
    input.readiness.riskBand === "Critical" ||
    hasHighRiskUnresolvedContradiction(input.contradictions) ||
    !input.supervisorReview?.approved;
  const status = input.supervisorReview?.approved
    ? "approved"
    : supervisorReviewRequired
      ? "supervisor_review_required"
      : "draft";

  const sections: CourtReportSection[] = [
    {
      id: "case-summary",
      title: "Case Summary",
      body: `${input.caseSummary.caseName}. Program: ${input.caseSummary.program}. Phase: ${input.caseSummary.phase}. Purpose: ${input.caseSummary.assessmentPurpose}.`,
    },
    {
      id: "rubric-score-summary",
      title: "Rubric Score Summary",
      body: `Assessment score: ${input.assessment.overallScore}%. Band: ${input.assessment.band?.label ?? "No band"}. Recommendation: ${input.assessment.recommendation}`,
      reviewRequired: input.assessment.requiresSupervisorReview,
    },
    {
      id: "domain-score-summary",
      title: "Domain Score Summary",
      body: buildDomainScoreSummary(input.assessment),
    },
    {
      id: "critical-override-summary",
      title: "Critical Override Check",
      body: buildOverrideSummary(input.assessment),
      reviewRequired: input.assessment.overrideTriggered || input.assessment.requiresSupervisorReview,
    },
    {
      id: "trend-summary",
      title: "Domain Trend Summary",
      body: buildTrendSummary(input.trends),
    },
    {
      id: "readiness-index",
      title: "Composite Readiness and Risk",
      body: `Worker-only readiness support: ${input.readiness.compositeScore == null ? "Review required" : `${input.readiness.compositeScore}%`}. Risk band: ${input.readiness.riskBand}. Direction: ${input.readiness.direction}.`,
      reviewRequired: input.readiness.suppressedByOverride || input.readiness.riskBand === "Critical",
    },
    {
      id: "readiness-signals",
      title: "Readiness Signals",
      body: buildReadinessSignalSummary(input.readiness),
    },
    {
      id: "readiness-flags",
      title: "Readiness Flags",
      body: input.readiness.flags.length
        ? input.readiness.flags.join("\n")
        : "No missing-signal or active critical-override flags are attached to this readiness calculation.",
      reviewRequired: input.readiness.flags.length > 0,
    },
    {
      id: "evidence-summary",
      title: "Evidence Summary",
      body: buildEvidenceSummary(input.evidence),
    },
    {
      id: "contradiction-summary",
      title: "Contradiction Summary",
      body: buildContradictionSummary(input.contradictions),
      reviewRequired: hasHighRiskUnresolvedContradiction(input.contradictions),
    },
    {
      id: "collateral-summary",
      title: "Collateral Evidence",
      body: buildCollateralSummary(input.collaterals),
    },
    {
      id: "strengths-and-protective-factors",
      title: "Strengths and Protective Factors",
      body: input.workerNarrative?.strengths?.trim() || "Worker narrative required before final export.",
    },
    {
      id: "risks-and-unresolved-concerns",
      title: "Risks and Unresolved Concerns",
      body: input.workerNarrative?.concerns?.trim() || "Worker narrative required before final export.",
      reviewRequired: supervisorReviewRequired,
    },
    {
      id: "recommended-next-steps",
      title: "Recommended Next Steps",
      body: input.workerNarrative?.nextSteps?.trim() || "Worker narrative required before final export.",
    },
    {
      id: "supervisor-review",
      title: "Supervisor Review",
      body: input.supervisorReview?.approved
        ? `Approved by ${input.supervisorReview.reviewedBy ?? "supervisor"} on ${input.supervisorReview.reviewedAt ?? "unrecorded date"}. ${input.supervisorReview.notes ?? ""}`.trim()
        : "Supervisor review and approval are required before final court-facing export.",
      reviewRequired: !input.supervisorReview?.approved,
    },
    {
      id: "decision-authority-boundary",
      title: "Decision Authority Boundary",
      body: "This report is decision-support for case review. It must not be used to auto-approve or auto-deny visitation, reunification, or court-level decisions.",
      reviewRequired: true,
    },
    {
      id: "immutability-and-audit-note",
      title: "Immutability and Audit Note",
      body: "Assessment responses, domain scores, assessment scores, and final exports should be treated as append-only records. Corrections require a new assessment or report version linked to the same case. Case-file views and exports should write explicit audit entries.",
    },
  ];

  return {
    title: "SafeSteps Court-Aware Progress Report",
    versionLabel: input.previousVersionHash ? "Draft revision" : "Initial draft",
    status,
    generatedAt: input.caseSummary.generatedAt,
    sections,
    evidenceList: input.evidence,
    unresolvedContradictions,
    supervisorReviewRequired,
    tamperEvidenceSummary: input.previousVersionHash
      ? `Report revision is linked to previous version hash ${input.previousVersionHash}.`
      : "Initial draft. Final exports should be versioned and linked to immutable report/audit records.",
  };
}
