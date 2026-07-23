import {
  assessmentEvidenceFramework,
  evaluateAssessmentFinalisation,
  getAssessmentEvidenceReadinessSummary,
} from "../lib/engines/assessmentEvidenceReunificationEngine";

describe("assessmentEvidenceReunificationEngine", () => {
  it("tracks Volume 17 as implemented", () => {
    expect(getAssessmentEvidenceReadinessSummary()).toMatchObject({
      implemented: 1,
      total: 1,
      readyForRuntimeIntegration: true,
    });
    expect(assessmentEvidenceFramework.modules).toEqual(
      expect.arrayContaining([
        "assessment_templates",
        "rubrics",
        "behaviour_ratings",
        "protective_factors",
        "risk_factors",
        "evidence_mapping",
        "timeline_builder",
        "court_reports",
        "reunification_readiness",
        "longitudinal_analytics",
      ]),
    );
  });

  it("surfaces the production tables and runtime gates", () => {
    expect(assessmentEvidenceFramework.tables).toEqual(
      expect.arrayContaining([
        "assessment_frameworks",
        "assessment_template_versions",
        "assessment_rubrics",
        "assessment_protective_factors",
        "assessment_risk_factors",
        "assessment_records",
        "assessment_scores",
        "assessment_score_overrides",
        "assessment_evidence_maps",
        "evidence_timeline_events",
        "worker_observation_records",
        "home_visit_records",
        "direct_observation_sessions",
        "collateral_report_records",
        "reunification_readiness_assessments_v17",
        "court_report_assessment_packages",
        "longitudinal_outcome_snapshots",
      ]),
    );
    expect(assessmentEvidenceFramework.runtimeGates).toEqual(
      expect.arrayContaining([
        "Court assessment package export requires source separation, supervisor approval, and a non-empty evidence manifest.",
        "Critical overrides are recorded separately so serious findings are not averaged away.",
      ]),
    );
  });

  it("blocks assessment finalisation when evidence, review, or court source separation is missing", () => {
    const result = evaluateAssessmentFinalisation({
      hasResponses: true,
      hasMappedEvidence: false,
      hasHumanReview: false,
      hasUnsupportedScores: true,
      isCourtFacing: true,
      hasSourceSeparation: false,
    });

    expect(result.canFinalize).toBe(false);
    expect(result.requiredAction).toBe("hold_for_review");
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Mapped evidence is missing.",
        "Human review approval is missing.",
        "Unsupported or insufficient-evidence scores must be resolved.",
        "Court-facing assessment output requires source separation.",
      ]),
    );
  });

  it("allows finalisation when all gates are met", () => {
    expect(
      evaluateAssessmentFinalisation({
        hasResponses: true,
        hasMappedEvidence: true,
        hasHumanReview: true,
        hasUnsupportedScores: false,
        isCourtFacing: true,
        hasSourceSeparation: true,
      }),
    ).toEqual({
      canFinalize: true,
      blockers: [],
      requiredAction: "finalize_with_audit",
    });
  });
});
