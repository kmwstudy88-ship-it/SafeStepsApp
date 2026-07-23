import { supabase } from "../supabase";
import type {
  AssessmentScoreResult,
  CompositeReadinessRiskResult,
  DomainScore,
  ScoreTrend,
} from "./assessmentScoringEngine";
import type {
  CourtReportCollateral,
  CourtReportContradiction,
  CourtReportDataSources,
} from "./courtReportBuilderEngine";
import type { AssessmentCaseSetup } from "./assessmentCaseEngine";
import { fetchLatestCourtReportSupervisorApproval } from "./courtReportSupervisorApprovalEngine";

type AssessmentRecordRow = {
  id: string;
  assessment_date: string;
  narrative_summary: string | null;
  administered_by: string | null;
  status: string;
};

type AssessmentScoreRow = {
  overall_score: number | string;
  band_id: string | null;
  band_label: string | null;
  override_triggered: boolean;
  requires_supervisor_review: boolean;
  recommendation: string | null;
};

type DomainScoreRow = {
  domain_id: string;
  raw_score: number | string;
  max_possible: number | string;
  normalized_score: number | string;
};

type ReadinessRow = {
  computed_at: string;
  assessment_signal: number | string | null;
  service_signal: number | string | null;
  visitation_signal: number | string | null;
  milestone_signal: number | string | null;
  composite_score: number | string | null;
  recommendation: string;
  flags: string[] | null;
  suppressed_by_override: boolean;
};

type ContradictionRow = {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  source_a: string | null;
  source_b: string | null;
  resolved_at: string | null;
};

type CollateralRow = {
  id: string;
  source_name: string;
  source_role: string | null;
  received_at: string;
  summary: string;
  alignment_with_self_report: "aligned" | "partially_aligned" | "contradictory" | "unclear" | null;
};

type CaseNoteRow = {
  id: string;
  note_type: string;
  title: string | null;
  body: string;
  created_at: string;
};

export type CourtReportLiveData = {
  assessment: AssessmentScoreResult | null;
  readiness: CompositeReadinessRiskResult | null;
  contradictions: CourtReportContradiction[];
  collaterals: CourtReportCollateral[];
  workerNarrative: {
    strengths?: string;
    concerns?: string;
    nextSteps?: string;
  } | null;
  supervisorReview: {
    approved: boolean;
    reviewedBy?: string;
    reviewedAt?: string;
    notes?: string;
  } | null;
  dataSources: Partial<CourtReportDataSources>;
  trends: ScoreTrend[];
  latestAssessmentDate?: string;
};

function numberOrZero(value: number | string | null | undefined) {
  if (value == null) return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function numberOrNull(value: number | string | null | undefined) {
  if (value == null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function buildAssessmentScore(score: AssessmentScoreRow, domainRows: DomainScoreRow[]): AssessmentScoreResult {
  const domainScores: DomainScore[] = domainRows.map((row) => ({
    domainId: row.domain_id,
    rawScore: numberOrZero(row.raw_score),
    maxPossible: numberOrZero(row.max_possible),
    normalizedScore: numberOrZero(row.normalized_score),
  }));

  return {
    domainScores,
    overallScore: numberOrZero(score.overall_score),
    band: score.band_label
      ? {
          id: score.band_id ?? score.band_label,
          label: score.band_label,
          minScore: 0,
          maxScore: 100,
          recommendation: score.recommendation ?? undefined,
          requiresSupervisorReview: score.requires_supervisor_review,
        }
      : null,
    overrideTriggered: score.override_triggered,
    override: null,
    requiresSupervisorReview: score.requires_supervisor_review,
    recommendation: score.recommendation ?? "No recommendation recorded.",
  };
}

function riskBandFromReadiness(row: ReadinessRow): CompositeReadinessRiskResult["riskBand"] {
  if (row.suppressed_by_override) return "Critical";
  const score = numberOrNull(row.composite_score);
  if (score == null) return "Moderate";
  if (score >= 80) return "Ready";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "High";
  return "Critical";
}

function buildReadiness(row: ReadinessRow): CompositeReadinessRiskResult {
  return {
    compositeScore: numberOrNull(row.composite_score),
    recommendation: row.recommendation,
    flags: row.flags ?? [],
    signals: [
      { label: "Assessment", score: numberOrNull(row.assessment_signal), weight: 0.4 },
      { label: "Service engagement", score: numberOrNull(row.service_signal), weight: 0.25 },
      { label: "Visitation quality", score: numberOrNull(row.visitation_signal), weight: 0.2 },
      { label: "Milestone progress", score: numberOrNull(row.milestone_signal), weight: 0.15 },
    ],
    suppressedByOverride: row.suppressed_by_override,
    riskBand: riskBandFromReadiness(row),
    direction: "unknown",
    workerOnly: true,
  };
}

function mapContradictions(rows: ContradictionRow[]): CourtReportContradiction[] {
  return rows.map((row) => ({
    id: row.id,
    severity: row.severity,
    summary: row.description,
    sourceA: row.source_a ?? "Source A not recorded",
    sourceB: row.source_b ?? "Source B not recorded",
    resolved: Boolean(row.resolved_at),
  }));
}

function mapCollateralAlignment(value: CollateralRow["alignment_with_self_report"]): CourtReportCollateral["alignment"] {
  if (value === "aligned") return "aligned";
  if (value === "partially_aligned") return "partial";
  if (value === "contradictory") return "conflicting";
  return "not_assessed";
}

function mapCollaterals(rows: CollateralRow[]): CourtReportCollateral[] {
  return rows.map((row) => ({
    id: row.id,
    source: row.source_role ? `${row.source_name} (${row.source_role})` : row.source_name,
    date: row.received_at,
    summary: row.summary,
    alignment: mapCollateralAlignment(row.alignment_with_self_report),
  }));
}

function buildWorkerNarrative(notes: CaseNoteRow[], latestAssessment: AssessmentRecordRow | null) {
  const strengthNotes = notes.filter((note) => note.note_type === "strength_note").map((note) => note.body);
  const riskNotes = notes.filter((note) => note.note_type === "risk_note").map((note) => note.body);
  const nextStepNotes = notes
    .filter((note) => note.note_type === "report_note" || note.note_type === "case_note")
    .map((note) => note.body);

  if (!strengthNotes.length && !riskNotes.length && !nextStepNotes.length && !latestAssessment?.narrative_summary) {
    return null;
  }

  return {
    strengths: strengthNotes.join("\n") || latestAssessment?.narrative_summary || undefined,
    concerns: riskNotes.join("\n") || undefined,
    nextSteps: nextStepNotes.join("\n") || undefined,
  };
}

function buildSupervisorReview(
  notes: CaseNoteRow[],
  caseRecord: AssessmentCaseSetup,
  approval: Awaited<ReturnType<typeof fetchLatestCourtReportSupervisorApproval>>,
) {
  if (approval) {
    return {
      approved: approval.approved,
      reviewedBy: approval.reviewer_name ?? caseRecord.supervisor_name ?? "Supervisor",
      reviewedAt: approval.created_at,
      notes: approval.review_notes || (approval.approved ? "Final supervisor approval recorded." : "Supervisor review recorded without approval."),
    };
  }

  const supervisionNote = notes.find((note) => note.note_type === "supervision_note");
  if (!supervisionNote) return null;

  return {
    approved: false,
    reviewedBy: caseRecord.supervisor_name ?? "Supervisor",
    reviewedAt: supervisionNote.created_at,
    notes: `Supervision note present but final report approval is not yet recorded. ${supervisionNote.body}`,
  };
}

export async function fetchCourtReportLiveData(caseRecord: AssessmentCaseSetup): Promise<CourtReportLiveData> {
  const { data: assessmentRows, error: assessmentError } = await supabase
    .from("assessment_records")
    .select("id, assessment_date, narrative_summary, administered_by, status")
    .eq("case_id", caseRecord.id)
    .eq("status", "completed")
    .order("assessment_date", { ascending: false })
    .limit(2);

  if (assessmentError) throw assessmentError;

  const latestAssessment = ((assessmentRows ?? []) as AssessmentRecordRow[])[0] ?? null;
  const previousAssessment = ((assessmentRows ?? []) as AssessmentRecordRow[])[1] ?? null;

  const [scoreResult, domainResult, previousDomainResult, readinessResult, contradictionsResult, collateralResult, notesResult, approval] =
    await Promise.all([
      latestAssessment
        ? supabase
            .from("assessment_scores")
            .select("overall_score, band_id, band_label, override_triggered, requires_supervisor_review, recommendation")
            .eq("assessment_id", latestAssessment.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      latestAssessment
        ? supabase
            .from("assessment_domain_scores")
            .select("domain_id, raw_score, max_possible, normalized_score")
            .eq("assessment_id", latestAssessment.id)
        : Promise.resolve({ data: [], error: null }),
      previousAssessment
        ? supabase
            .from("assessment_domain_scores")
            .select("domain_id, raw_score, max_possible, normalized_score")
            .eq("assessment_id", previousAssessment.id)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("reunification_readiness_indices")
        .select("computed_at, assessment_signal, service_signal, visitation_signal, milestone_signal, composite_score, recommendation, flags, suppressed_by_override")
        .eq("case_id", caseRecord.id)
        .order("computed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("assessment_contradictions")
        .select("id, severity, description, source_a, source_b, resolved_at")
        .eq("case_id", caseRecord.id)
        .eq("include_in_report", true)
        .order("detected_at", { ascending: false }),
      supabase
        .from("assessment_collaterals")
        .select("id, source_name, source_role, received_at, summary, alignment_with_self_report")
        .eq("case_id", caseRecord.id)
        .order("received_at", { ascending: false }),
      supabase
        .from("case_progress_notes")
        .select("id, note_type, title, body, created_at")
        .eq("case_id", caseRecord.id)
        .eq("include_in_report", true)
        .order("created_at", { ascending: false })
        .limit(20),
      fetchLatestCourtReportSupervisorApproval(caseRecord.id),
    ]);

  for (const result of [scoreResult, domainResult, previousDomainResult, readinessResult, contradictionsResult, collateralResult, notesResult]) {
    if (result.error) throw result.error;
  }

  const domainRows = (domainResult.data ?? []) as DomainScoreRow[];
  const previousDomainRows = (previousDomainResult.data ?? []) as DomainScoreRow[];
  const assessment = scoreResult.data ? buildAssessmentScore(scoreResult.data as AssessmentScoreRow, domainRows) : null;
  const previousScores = new Map(previousDomainRows.map((row) => [row.domain_id, numberOrZero(row.normalized_score)]));
  const trends = domainRows
    .filter((row) => previousScores.has(row.domain_id))
    .map<ScoreTrend>((row) => {
      const previousScore = previousScores.get(row.domain_id) ?? 0;
      const currentScore = numberOrZero(row.normalized_score);
      const change = Math.round((currentScore - previousScore) * 100) / 100;
      return {
        domainId: row.domain_id,
        previousScore,
        currentScore,
        change,
        direction: change > 0 ? "improving" : change < 0 ? "declining" : "stable",
      };
    });
  const notes = (notesResult.data ?? []) as CaseNoteRow[];
  const supervisorReview = buildSupervisorReview(notes, caseRecord, approval);

  return {
    assessment,
    readiness: readinessResult.data ? buildReadiness(readinessResult.data as ReadinessRow) : null,
    contradictions: mapContradictions((contradictionsResult.data ?? []) as ContradictionRow[]),
    collaterals: mapCollaterals((collateralResult.data ?? []) as CollateralRow[]),
    workerNarrative: buildWorkerNarrative(notes, latestAssessment),
    supervisorReview,
    dataSources: {
      assessment: assessment ? "live_reviewed" : "calibration",
      readiness: readinessResult.data ? "live_reviewed" : "calibration",
      collateral: collateralResult.data?.length ? "live_reviewed" : "calibration",
      workerNarrative: notes.length || latestAssessment?.narrative_summary ? "live_reviewed" : "calibration",
      supervisorReview: approval?.approved ? "live_reviewed" : supervisorReview ? "live_unreviewed" : "not_connected",
    },
    trends,
    latestAssessmentDate: latestAssessment?.assessment_date,
  };
}
