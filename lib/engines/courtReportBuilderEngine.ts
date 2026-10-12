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
  provenance?: "parent_family_submitted" | "worker_observed" | "collateral_provider" | "system_generated" | "unknown";
  reviewAvailability?: "linked_worker_available" | "no_linked_worker" | "unknown_case_linkage";
  relianceLimitations?: string[];
  linkedDomains: string[];
  integrityHash?: string | null;
};

export type StructuredEvidenceForReportInput = {
  id: string;
  title: string;
  notes?: string | null;
  evidence_type?: string | null;
  structured_data?: Record<string, unknown> | null;
  review_status?: "draft" | "pending_review" | "reviewed" | "excluded" | null;
  status?: "draft" | "stored" | "shared" | null;
  file_path?: string | null;
  created_at: string;
  integrity_hash?: string | null;
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

export type CourtReportDataSourceStatus = "live_reviewed" | "live_unreviewed" | "calibration" | "not_connected";

export type CourtReportDataSources = {
  assessment: CourtReportDataSourceStatus;
  readiness: CourtReportDataSourceStatus;
  evidence: CourtReportDataSourceStatus;
  collateral: CourtReportDataSourceStatus;
  workerNarrative: CourtReportDataSourceStatus;
  supervisorReview: CourtReportDataSourceStatus;
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
  dataSources?: Partial<CourtReportDataSources>;
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
  exportReadinessBlockers: string[];
  tamperEvidenceSummary: string;
};

export type CourtReportSnapshotPayload = {
  title: string;
  versionLabel: string;
  status: CourtReportDraft["status"];
  generatedAt: string;
  sections: CourtReportSection[];
  evidenceList: CourtReportEvidenceRecord[];
  unresolvedContradictions: CourtReportContradiction[];
  exportReadinessBlockers: string[];
  tamperEvidenceSummary: string;
};

export type CourtReportSnapshotDraft = {
  caseId: string;
  ownerId?: string;
  reportTitle: string;
  versionLabel: string;
  reportStatus: CourtReportDraft["status"];
  snapshotPayload: CourtReportSnapshotPayload;
  snapshotHashInput: string;
  previousSnapshotHash?: string | null;
  readyForFinalExport: boolean;
  exportReadinessBlockers: string[];
};

function countByStatus(evidence: CourtReportEvidenceRecord[]) {
  return evidence.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {});
}

function stableSortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableSortObject);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = stableSortObject((value as Record<string, unknown>)[key]);
        return sorted;
      }, {});
  }

  return value;
}

export function stableStringifyReportSnapshot(value: CourtReportSnapshotPayload) {
  return JSON.stringify(stableSortObject(value));
}

export function buildCourtReportSnapshotDraft(
  report: CourtReportDraft,
  metadata: {
    caseId: string;
    ownerId?: string;
    previousSnapshotHash?: string | null;
  },
): CourtReportSnapshotDraft {
  const snapshotPayload: CourtReportSnapshotPayload = {
    title: report.title,
    versionLabel: report.versionLabel,
    status: report.status,
    generatedAt: report.generatedAt,
    sections: report.sections,
    evidenceList: report.evidenceList,
    unresolvedContradictions: report.unresolvedContradictions,
    exportReadinessBlockers: report.exportReadinessBlockers,
    tamperEvidenceSummary: report.tamperEvidenceSummary,
  };

  return {
    caseId: metadata.caseId,
    ownerId: metadata.ownerId,
    reportTitle: report.title,
    versionLabel: report.versionLabel,
    reportStatus: report.status,
    snapshotPayload,
    snapshotHashInput: stableStringifyReportSnapshot(snapshotPayload),
    previousSnapshotHash: metadata.previousSnapshotHash ?? null,
    readyForFinalExport: report.status === "approved" && report.exportReadinessBlockers.length === 0,
    exportReadinessBlockers: report.exportReadinessBlockers,
  };
}

function buildEvidenceSummary(evidence: CourtReportEvidenceRecord[]) {
  if (evidence.length === 0) {
    return "No reviewed evidence records are attached to this report yet.";
  }

  const counts = countByStatus(evidence);
  const acceptedCount = counts.accepted ?? 0;
  const reviewedCount = counts.reviewed ?? 0;
  const draftCount = counts.draft ?? 0;
  const storedCount = counts.stored ?? 0;
  const clarificationCount = counts.needs_clarification ?? 0;
  const excludedCount = counts.excluded ?? 0;
  const parentSubmittedCount = evidence.filter((item) => item.provenance === "parent_family_submitted").length;
  const unreviewedParentSubmittedCount = evidence.filter(
    (item) =>
      item.provenance === "parent_family_submitted" &&
      (item.status === "draft" || item.status === "stored" || item.reviewAvailability === "no_linked_worker"),
  ).length;

  return [
    `${evidence.length} evidence records are linked to this report.`,
    `${acceptedCount + reviewedCount} records are accepted or reviewed.`,
    parentSubmittedCount > 0 ? `${parentSubmittedCount} records are parent/family-submitted supportive evidence.` : "",
    draftCount + storedCount > 0 ? `${draftCount + storedCount} records are saved but not yet reviewed or accepted.` : "",
    unreviewedParentSubmittedCount > 0
      ? `${unreviewedParentSubmittedCount} parent/family-submitted records must not be labelled worker-reviewed or professionally verified.`
      : "",
    clarificationCount > 0 ? `${clarificationCount} records need clarification.` : "",
    excludedCount > 0 ? `${excludedCount} records are excluded from report reliance.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildEvidenceRelianceBoundary(evidence: CourtReportEvidenceRecord[]) {
  if (evidence.length === 0) {
    return "No evidence can be relied on for conclusions until records are attached and reviewed for relevance, source, limitations, and contradictions.";
  }

  const warnings = evidence.flatMap((item) => {
    const itemWarnings: string[] = [];

    if (item.status === "draft" || item.status === "stored") {
      itemWarnings.push(`${item.title}: saved but not reviewed or accepted.`);
    }

    if (item.status === "needs_clarification") {
      itemWarnings.push(`${item.title}: needs clarification before reliance.`);
    }

    if (item.status === "excluded") {
      itemWarnings.push(`${item.title}: excluded from report reliance.`);
    }

    if (item.provenance === "parent_family_submitted" && item.reviewAvailability !== "linked_worker_available") {
      itemWarnings.push(
        `${item.title}: parent/family-submitted supportive evidence; not worker-reviewed or professionally verified.`,
      );
    }

    if (item.relianceLimitations?.length) {
      itemWarnings.push(`${item.title}: ${item.relianceLimitations.join("; ")}`);
    }

    return itemWarnings;
  });

  if (warnings.length === 0) {
    return "All linked evidence records are reviewed or accepted, and no reliance limitations are currently attached.";
  }

  return warnings.join("\n");
}

function hasEvidenceRelianceWarnings(evidence: CourtReportEvidenceRecord[]) {
  return evidence.some(
    (item) =>
      item.status === "draft" ||
      item.status === "stored" ||
      item.status === "needs_clarification" ||
      item.status === "excluded" ||
      Boolean(item.relianceLimitations?.length) ||
      (item.provenance === "parent_family_submitted" && item.reviewAvailability !== "linked_worker_available"),
  );
}

function reportEvidenceTypeFromStructuredType(
  type: StructuredEvidenceForReportInput["evidence_type"],
  filePath?: string | null,
): CourtReportEvidenceRecord["type"] {
  if (type === "direct_observation") return "visit_note";
  if (type === "collateral_report") return "collateral";
  if (type === "self_report_interview") return "reflection";
  if (type === "objective_measure") return "assessment";
  if (filePath) return "document";
  return "other";
}

function reportEvidenceStatusFromStructuredStatus(
  input: Pick<StructuredEvidenceForReportInput, "review_status" | "status">,
): CourtReportEvidenceRecord["status"] {
  if (input.review_status === "reviewed") return "reviewed";
  if (input.review_status === "excluded") return "excluded";
  if (input.review_status === "pending_review") return "needs_clarification";
  if (input.review_status === "draft") return "draft";
  if (input.status === "shared") return "accepted";
  if (input.status === "stored") return "stored";
  return "draft";
}

function stringListFromUnknown(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

function reviewAvailabilityFromStructuredData(value: unknown): CourtReportEvidenceRecord["reviewAvailability"] {
  if (!value || typeof value !== "object") return "unknown_case_linkage";
  const status = (value as { status?: unknown }).status;
  return status === "linked_worker_available" || status === "no_linked_worker" || status === "unknown_case_linkage"
    ? status
    : "unknown_case_linkage";
}

export function structuredEvidenceToCourtReportEvidence(
  item: StructuredEvidenceForReportInput,
): CourtReportEvidenceRecord {
  const structuredData = item.structured_data ?? {};
  const reviewAvailability = reviewAvailabilityFromStructuredData(structuredData.review_availability);
  const reliability = typeof structuredData.source_reliability === "string" ? structuredData.source_reliability : null;
  const relianceWarnings =
    structuredData.review_readiness &&
    typeof structuredData.review_readiness === "object" &&
    Array.isArray((structuredData.review_readiness as { warnings?: unknown }).warnings)
      ? stringListFromUnknown((structuredData.review_readiness as { warnings?: unknown }).warnings)
      : [];

  const limitations = [
    ...stringListFromUnknown(structuredData.limitations),
    ...relianceWarnings,
  ];

  return {
    id: item.id,
    title: item.title,
    type: reportEvidenceTypeFromStructuredType(item.evidence_type, item.file_path),
    createdAt: item.created_at,
    status: reportEvidenceStatusFromStructuredStatus(item),
    provenance:
      reliability === "direct_observation"
        ? "worker_observed"
        : item.evidence_type === "collateral_report"
          ? "collateral_provider"
          : "parent_family_submitted",
    reviewAvailability,
    relianceLimitations: limitations,
    linkedDomains: stringListFromUnknown(structuredData.linked_domains),
    integrityHash: item.integrity_hash ?? null,
  };
}

function buildAssessmentFrameworkMethodology() {
  return [
    "This report has been generated through the SafeSteps Assessment and Evaluation Framework, a structured methodology designed to support professional, legal, and statutory decision-making.",
    "Findings in this document are derived from the information available at the time of evaluation, including verified inputs where available, parent/family-submitted evidence, cross-checked records, documented interactions, structured behavioural indicators, and risk/protective-factor analysis.",
    "SafeSteps applies a multi-stage evaluation process that includes verification of factual information against available records; consistency and contradiction analysis across parties' statements; identification of risk factors, protective factors, and safety-relevant behaviours; timeline reconstruction and event-pattern mapping; assessment of compliance with child-safety expectations and case-plan requirements; and review of professional notes, observations, documented interventions, collateral information, and structured evidence submissions.",
    "Parent/family evidence remains valid as supportive evidence for progress, barriers, routines, effort, and legal proceedings. Where no caseworker or support worker is linked to the family case file, evidence must be labelled as parent/family-submitted or unreviewed and must not be described as worker-reviewed, professionally verified, or agency-endorsed unless that review has actually occurred.",
    "Where child-voice or child-originated content is included, SafeSteps applies privacy-controlled integration and fairness safeguards to ensure the child's perspective is represented accurately, proportionately, and without distortion.",
    "All conclusions are decision-support findings rather than automatic legal, statutory, visitation, safety, or reunification determinations. They are intended to support caseworkers, support services, legal representatives, and decision-making bodies in forming an evidence-informed understanding of the circumstances presented.",
  ].join("\n\n");
}

const defaultDataSources: CourtReportDataSources = {
  assessment: "calibration",
  readiness: "calibration",
  evidence: "calibration",
  collateral: "calibration",
  workerNarrative: "calibration",
  supervisorReview: "not_connected",
};

const dataSourceLabels: Record<CourtReportDataSourceStatus, string> = {
  live_reviewed: "live reviewed",
  live_unreviewed: "live unreviewed",
  calibration: "calibration preview",
  not_connected: "not connected",
};

function buildDataSourceSummary(dataSources: CourtReportDataSources) {
  return [
    `Assessment scoring: ${dataSourceLabels[dataSources.assessment]}.`,
    `Readiness calculation: ${dataSourceLabels[dataSources.readiness]}.`,
    `Evidence records: ${dataSourceLabels[dataSources.evidence]}.`,
    `Collateral records: ${dataSourceLabels[dataSources.collateral]}.`,
    `Worker narrative: ${dataSourceLabels[dataSources.workerNarrative]}.`,
    `Supervisor review: ${dataSourceLabels[dataSources.supervisorReview]}.`,
    "Any calibration or unconnected area must be replaced with live reviewed records before court-ready export.",
  ].join("\n");
}

function hasUnreadyDataSources(dataSources: CourtReportDataSources) {
  return Object.values(dataSources).some((status) => status !== "live_reviewed");
}

function buildDataSourceBlockers(dataSources: CourtReportDataSources) {
  return Object.entries(dataSources)
    .filter(([, status]) => status !== "live_reviewed")
    .map(([source, status]) => `${source}: ${dataSourceLabels[status]} must be replaced with live reviewed records.`);
}

function buildEvidenceRelianceBlockers(evidence: CourtReportEvidenceRecord[]) {
  if (!hasEvidenceRelianceWarnings(evidence)) return [];

  return buildEvidenceRelianceBoundary(evidence)
    .split("\n")
    .map((item) => `evidence: ${item}`);
}

function buildExportReadinessBlockers(input: CourtReportInput, dataSources: CourtReportDataSources) {
  return [
    ...buildDataSourceBlockers(dataSources),
    ...buildEvidenceRelianceBlockers(input.evidence),
    input.assessment.requiresSupervisorReview ? "assessment: supervisor review is required by the scoring result." : "",
    input.assessment.overrideTriggered ? "assessment: critical override must be explicitly reviewed." : "",
    input.readiness.suppressedByOverride ? "readiness: readiness reliance is suppressed by an active critical override." : "",
    input.readiness.riskBand === "Critical" ? "readiness: critical risk band requires review." : "",
    hasHighRiskUnresolvedContradiction(input.contradictions)
      ? "contradictions: high or critical unresolved contradictions remain."
      : "",
    !input.supervisorReview?.approved ? "supervisor: final supervisor approval is not recorded." : "",
  ].filter(Boolean);
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
  const dataSources = { ...defaultDataSources, ...input.dataSources };
  const exportReadinessBlockers = buildExportReadinessBlockers(input, dataSources);
  const supervisorReviewRequired =
    input.assessment.requiresSupervisorReview ||
    input.readiness.suppressedByOverride ||
    input.readiness.riskBand === "Critical" ||
    hasHighRiskUnresolvedContradiction(input.contradictions) ||
    hasEvidenceRelianceWarnings(input.evidence) ||
    hasUnreadyDataSources(dataSources) ||
    !input.supervisorReview?.approved ||
    exportReadinessBlockers.length > 0;
  const status = input.supervisorReview?.approved && !supervisorReviewRequired
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
      id: "assessment-evaluation-framework",
      title: "SafeSteps Assessment and Evaluation Framework",
      body: buildAssessmentFrameworkMethodology(),
      reviewRequired: true,
    },
    {
      id: "report-data-source-status",
      title: "Report Data Source Status",
      body: buildDataSourceSummary(dataSources),
      reviewRequired: hasUnreadyDataSources(dataSources),
    },
    {
      id: "export-readiness-gate",
      title: "Export Readiness Gate",
      body: exportReadinessBlockers.length
        ? exportReadinessBlockers.join("\n")
        : "No export blockers are currently detected. Final export still requires the configured immutable report and audit process.",
      reviewRequired: exportReadinessBlockers.length > 0,
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
      reviewRequired: hasEvidenceRelianceWarnings(input.evidence),
    },
    {
      id: "evidence-reliance-boundary",
      title: "Evidence Reliance Boundary",
      body: buildEvidenceRelianceBoundary(input.evidence),
      reviewRequired: hasEvidenceRelianceWarnings(input.evidence),
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
    exportReadinessBlockers,
    tamperEvidenceSummary: input.previousVersionHash
      ? `Report revision is linked to previous version hash ${input.previousVersionHash}.`
      : "Initial draft. Final exports should be versioned and linked to immutable report/audit records.",
  };
}
