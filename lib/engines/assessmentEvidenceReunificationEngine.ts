import { supabase } from "../supabase";

export type AssessmentEvidenceFrameworkStatus = "implemented" | "requires_configuration" | "requires_review";

export type AssessmentEvidenceFramework = {
  id: "assessment_evidence_reunification";
  title: string;
  purpose: string;
  status: AssessmentEvidenceFrameworkStatus;
  modules: string[];
  tables: string[];
  runtimeGates: string[];
};

export type AssessmentFinalisationCheck = {
  hasResponses?: boolean;
  hasMappedEvidence?: boolean;
  hasHumanReview?: boolean;
  hasUnsupportedScores?: boolean;
  isCourtFacing?: boolean;
  hasSourceSeparation?: boolean;
};

export const assessmentEvidenceFramework: AssessmentEvidenceFramework = {
  id: "assessment_evidence_reunification",
  title: "Assessment, Evidence & Reunification Framework",
  purpose:
    "Provides the production assessment backbone for templates, rubrics, ratings, protective factors, risk factors, evidence mapping, uploads, timelines, parent progress, child progress, worker observations, home visits, direct observation, collateral reports, court report packages, reunification readiness, and longitudinal analytics.",
  status: "implemented",
  modules: [
    "assessment_templates",
    "rubrics",
    "behaviour_ratings",
    "protective_factors",
    "risk_factors",
    "evidence_mapping",
    "evidence_uploads",
    "timeline_builder",
    "parent_progress",
    "child_progress",
    "worker_observations",
    "home_visit_records",
    "direct_observation",
    "collateral_reports",
    "court_reports",
    "reunification_readiness",
    "longitudinal_analytics",
  ],
  tables: [
    "assessment_frameworks",
    "assessment_template_versions",
    "assessment_rubrics",
    "assessment_behaviour_rating_items",
    "assessment_protective_factors",
    "assessment_risk_factors",
    "assessment_records",
    "assessment_responses_structured",
    "assessment_scores",
    "assessment_score_overrides",
    "assessment_evidence_maps",
    "evidence_upload_batches",
    "evidence_timeline_events",
    "parent_progress_assessments",
    "child_progress_assessments",
    "worker_observation_records",
    "home_visit_records",
    "direct_observation_sessions",
    "collateral_report_records",
    "reunification_readiness_assessments_v17",
    "reunification_readiness_panels",
    "court_report_assessment_packages",
    "longitudinal_outcome_snapshots",
    "assessment_framework_audit_events",
  ],
  runtimeGates: [
    "Assessment finalisation requires responses, mapped evidence when required, supported scores, and human review approval.",
    "Court assessment package export requires source separation, supervisor approval, and a non-empty evidence manifest.",
    "Reunification readiness cannot be relied on while critical barriers remain or the assessment is unreviewed.",
    "Critical overrides are recorded separately so serious findings are not averaged away.",
  ],
};

export function evaluateAssessmentFinalisation(check: AssessmentFinalisationCheck) {
  const blockers: string[] = [];

  if (!check.hasResponses) blockers.push("Assessment responses are missing.");
  if (!check.hasMappedEvidence) blockers.push("Mapped evidence is missing.");
  if (!check.hasHumanReview) blockers.push("Human review approval is missing.");
  if (check.hasUnsupportedScores) blockers.push("Unsupported or insufficient-evidence scores must be resolved.");
  if (check.isCourtFacing && !check.hasSourceSeparation) {
    blockers.push("Court-facing assessment output requires source separation.");
  }

  return {
    canFinalize: blockers.length === 0,
    blockers,
    requiredAction: blockers.length > 0 ? "hold_for_review" : "finalize_with_audit",
  };
}

export function getAssessmentEvidenceReadinessSummary() {
  return {
    implemented: assessmentEvidenceFramework.status === "implemented" ? 1 : 0,
    total: 1,
    tableCount: assessmentEvidenceFramework.tables.length,
    moduleCount: assessmentEvidenceFramework.modules.length,
    readyForRuntimeIntegration: assessmentEvidenceFramework.status === "implemented",
  };
}

const liveMetricTables = [
  { label: "Assessment records", table: "assessment_records" },
  { label: "Assessment evidence maps", table: "assessment_evidence_maps" },
  { label: "Evidence timeline events", table: "evidence_timeline_events" },
  { label: "Parent progress assessments", table: "parent_progress_assessments" },
  { label: "Worker observations", table: "worker_observation_records" },
  { label: "Readiness assessments", table: "reunification_readiness_assessments_v17" },
  { label: "Court assessment packages", table: "court_report_assessment_packages" },
  { label: "Longitudinal snapshots", table: "longitudinal_outcome_snapshots" },
];

export async function getAssessmentEvidenceLiveSummary() {
  const metrics = await Promise.all(
    liveMetricTables.map(async (metric) => {
      try {
        const { count, error } = await supabase.from(metric.table).select("id", { count: "exact", head: true });

        if (error) return { ...metric, count: null, available: false, error: error.message };
        return { ...metric, count: count ?? 0, available: true };
      } catch (error) {
        return {
          ...metric,
          count: null,
          available: false,
          error: error instanceof Error ? error.message : "Unable to load assessment metric.",
        };
      }
    }),
  );

  return {
    loadedAt: new Date().toISOString(),
    metrics,
    unavailableCount: metrics.filter((metric) => !metric.available).length,
  };
}
