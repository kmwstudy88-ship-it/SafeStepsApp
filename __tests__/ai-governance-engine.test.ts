import {
  aiGovernanceVolumes,
  evaluateAiAutomationBoundary,
  getAiGovernanceReadinessSummary,
  prohibitedAiDecisionExamples,
} from "../lib/engines/aiGovernanceEngine";

describe("aiGovernanceEngine", () => {
  it("tracks the full AI governance volume set", () => {
    const summary = getAiGovernanceReadinessSummary();

    expect(summary).toMatchObject({
      implemented: 14,
      total: 14,
      readyForRuntimeIntegration: true,
    });
    expect(summary.tableCount).toBeGreaterThanOrEqual(35);
    expect(aiGovernanceVolumes.map((volume) => volume.id)).toEqual([
      "foundation",
      "model_lifecycle",
      "prompt_workflow",
      "data_governance",
      "inference",
      "guardrails",
      "fairness",
      "explainability",
      "human_review",
      "monitoring",
      "incident_response",
      "continuous_learning",
      "operations_centre",
      "audit_compliance",
    ]);
  });

  it("keeps prohibited AI decisions explicit and reviewable", () => {
    expect(prohibitedAiDecisionExamples).toContain("child removal or placement decision");
    expect(prohibitedAiDecisionExamples).toContain("report release or approval");
    expect(prohibitedAiDecisionExamples).toContain("safety risk final finding");

    const result = evaluateAiAutomationBoundary({
      proposedAction: "AI should make a child removal or placement decision",
      containsChildData: true,
      isSafetyCritical: true,
      hasHumanReviewer: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.requiredOversight).toBe("block_and_route_to_review");
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "AI cannot finalise child removal or placement decision.",
        "Child data use requires an accountable human reviewer.",
        "Safety-critical AI output requires human review before action.",
      ]),
    );
  });

  it("surfaces Volume 2 model assurance controls in the lifecycle volume", () => {
    const modelLifecycle = aiGovernanceVolumes.find((volume) => volume.id === "model_lifecycle");

    expect(modelLifecycle?.tables).toEqual(
      expect.arrayContaining([
        "ai_provider_assessments",
        "ai_provider_contract_controls",
        "ai_model_cards",
        "ai_model_capability_approvals",
        "ai_data_eligibility_rules",
        "ai_model_change_events",
      ]),
    );
    expect(modelLifecycle?.releaseGate).toContain("model card");
    expect(modelLifecycle?.releaseGate).toContain("data eligibility rule");
  });

  it("surfaces Volume 3 prompt, retrieval, tool, and workflow controls", () => {
    const promptWorkflow = aiGovernanceVolumes.find((volume) => volume.id === "prompt_workflow");

    expect(promptWorkflow?.tables).toEqual(
      expect.arrayContaining([
        "ai_prompt_rollback_records",
        "ai_prompt_variables",
        "ai_prompt_approval_requests",
        "ai_prompt_releases",
        "ai_retrieval_policies",
        "ai_retrieval_query_plans",
        "ai_retrieval_results",
        "ai_retrieval_contradictions",
        "ai_retrieval_source_manifests",
        "ai_output_citations",
        "ai_context_packages",
        "ai_context_items",
        "ai_context_assembly_runs",
        "ai_workflow_execution_runs",
        "ai_tool_registry",
        "ai_tool_permission_grants",
        "ai_tool_call_authorisations",
        "ai_tool_calls",
        "ai_prompt_security_evaluations",
        "ai_prompt_injection_scans",
        "ai_output_processing_policies",
        "ai_output_validation_results",
        "ai_prompt_evaluation_runs",
        "ai_prompt_bundles",
      ]),
    );
    expect(promptWorkflow?.releaseGate).toContain("retrieval and tool boundaries");
    expect(promptWorkflow?.releaseGate).toContain("structured-output validation");
  });

  it("surfaces Volume 5 evaluation, validation, and release assurance controls", () => {
    const fairness = aiGovernanceVolumes.find((volume) => volume.id === "fairness");
    const auditCompliance = aiGovernanceVolumes.find((volume) => volume.id === "audit_compliance");

    expect(fairness?.tables).toEqual(
      expect.arrayContaining([
        "ai_evaluation_plans",
        "ai_evaluation_baselines",
        "ai_evaluation_metrics",
        "ai_evaluation_thresholds",
        "ai_critical_failure_definitions",
        "ai_evaluation_runs",
        "ai_evaluation_items",
        "ai_evaluation_metric_results",
        "ai_evaluation_errors",
        "ai_calibration_assessments",
        "ai_evaluation_subgroups",
        "ai_fairness_results",
        "ai_cultural_evaluation_panels",
        "ai_accessibility_evaluations",
        "ai_language_evaluations",
        "ai_red_team_campaigns",
        "ai_human_factors_studies",
        "ai_independent_validations",
        "ai_regression_suites",
        "ai_evaluation_residual_risks",
      ]),
    );
    expect(fairness?.releaseGate).toContain("Critical failures");
    expect(fairness?.releaseGate).toContain("unaccepted high residual risk");

    expect(auditCompliance?.tables).toEqual(
      expect.arrayContaining([
        "ai_release_assurance_packages",
        "ai_release_decisions",
        "ai_release_conditions",
        "ai_production_validation_samples",
        "ai_evaluation_audit_events",
      ]),
    );
  });

  it("surfaces Volume 6 explainability, transparency, and contestability controls", () => {
    const explainability = aiGovernanceVolumes.find((volume) => volume.id === "explainability");
    const humanReview = aiGovernanceVolumes.find((volume) => volume.id === "human_review");
    const auditCompliance = aiGovernanceVolumes.find((volume) => volume.id === "audit_compliance");

    expect(explainability?.tables).toEqual(
      expect.arrayContaining([
        "ai_explanation_templates",
        "ai_explanations",
        "ai_explanation_versions",
        "ai_use_disclosures",
        "ai_decision_components",
        "ai_decision_decomposition_steps",
        "ai_evidence_lineage",
        "ai_explanation_evidence_links",
        "ai_evidence_assessments",
        "ai_contradiction_explanations",
        "ai_missing_information_records",
        "ai_confidence_explanations",
        "ai_uncertainty_assessments",
        "ai_explanation_validation_results",
        "ai_accessibility_variants",
        "ai_explanation_translations",
        "ai_cultural_reviews",
        "ai_child_explanations",
        "ai_child_explanation_responses",
        "ai_parent_explanations",
        "ai_worker_explanations",
        "ai_supervisor_explanations",
        "ai_explanation_quality_reviews",
      ]),
    );
    expect(explainability?.releaseGate).toContain("audience-appropriate explanations");

    expect(humanReview?.tables).toEqual(
      expect.arrayContaining([
        "ai_contestability_requests",
        "ai_contestability_evidence",
        "ai_contestability_triage",
        "ai_review_requests",
        "ai_review_conflicts",
        "ai_review_outcomes",
        "ai_appeals",
        "ai_appeal_panels",
        "ai_appeal_outcomes",
        "ai_correction_requests",
        "ai_correction_actions",
        "ai_explanation_withdrawals",
        "ai_human_reviews",
        "ai_human_edits",
        "ai_override_records",
        "ai_override_patterns",
        "ai_contestability_service_levels",
        "ai_contestability_notifications",
      ]),
    );
    expect(humanReview?.releaseGate).toContain("appeal pathway");

    expect(auditCompliance?.tables).toEqual(
      expect.arrayContaining([
        "ai_court_disclosures",
        "ai_transparency_packages",
        "ai_explainability_audit_events",
      ]),
    );
  });

  it("surfaces Volume 10 continuous learning and safe change-management controls", () => {
    const continuousLearning = aiGovernanceVolumes.find((volume) => volume.id === "continuous_learning");
    const auditCompliance = aiGovernanceVolumes.find((volume) => volume.id === "audit_compliance");

    expect(continuousLearning?.tables).toEqual(
      expect.arrayContaining([
        "ai_feedback_signals",
        "ai_learning_governance_policies",
        "ai_learning_signals",
        "ai_learning_signal_triage",
        "ai_feedback_records",
        "ai_child_feedback_controls",
        "ai_human_correction_learning_records",
        "ai_learning_corrections",
        "ai_learning_correction_reviews",
        "ai_learning_example_candidates",
        "ai_learning_candidates",
        "ai_learning_candidate_reviews",
        "ai_dataset_improvement_batches",
        "ai_dataset_change_sets",
        "ai_dataset_change_items",
        "ai_dataset_representativeness_reviews",
        "ai_influenced_data_records",
        "ai_learning_approval_workflows",
        "ai_continuous_evaluation_schedules",
        "ai_model_retirement_assessments",
        "ai_model_retirement_plans",
        "ai_model_retirement_events",
        "ai_knowledge_base_sources",
        "ai_knowledge_base_versions",
        "ai_knowledge_change_requests",
        "ai_knowledge_source_reviews",
        "ai_prompt_evolution_records",
        "ai_prompt_change_requests",
        "ai_prompt_comparison_tests",
        "ai_workflow_change_requests",
        "ai_change_requests",
        "ai_change_impact_assessments",
        "ai_change_deployment_gates",
        "ai_change_release_decisions",
        "ai_quality_scorecards",
        "ai_longitudinal_improvement_metrics",
        "ai_longitudinal_quality_snapshots",
        "ai_experiment_protocols",
        "ai_experiment_results",
        "ai_controlled_experiments",
        "ai_shadow_deployments",
        "ai_canary_releases",
        "ai_change_rollback_plans",
        "ai_learning_governance_rules",
        "ai_learning_governance_findings",
        "ai_learning_contamination_findings",
        "ai_model_improvement_projects",
        "ai_candidate_model_builds",
        "ai_machine_unlearning_requests",
        "ai_reviewer_drift_assessments",
        "ai_emergency_changes",
        "ai_learning_audit_events",
        "ai_learning_change_audit_events",
      ]),
    );
    expect(continuousLearning?.releaseGate).toContain("cannot retrain or alter production AI");
    expect(continuousLearning?.releaseGate).toContain("rollback");

    expect(auditCompliance?.tables).toEqual(expect.arrayContaining(["ai_learning_audit_events", "ai_learning_change_audit_events"]));
  });

  it("surfaces Volume 11 enterprise AI operations centre controls", () => {
    const operationsCentre = aiGovernanceVolumes.find((volume) => volume.id === "operations_centre");
    const auditCompliance = aiGovernanceVolumes.find((volume) => volume.id === "audit_compliance");

    expect(operationsCentre?.tables).toEqual(
      expect.arrayContaining([
        "ai_operational_services",
        "ai_service_dependencies",
        "ai_service_level_objectives",
        "ai_service_error_budgets",
        "ai_service_health_events",
        "ai_current_service_health",
        "ai_fleet_members",
        "ai_capacity_measurements",
        "ai_workload_classes",
        "ai_ops_human_review_queue_snapshots",
        "ai_cost_centres",
        "ai_cost_events",
        "ai_budget_status_snapshots",
        "ai_provider_service_measurements",
        "ai_operational_regions",
        "ai_service_failover_policies",
        "ai_service_fallback_configurations",
        "ai_operational_alerts",
        "ai_operational_runbooks",
        "ai_release_freezes",
        "ai_disaster_recovery_plans",
        "ai_backup_restore_tests",
        "ai_operational_readiness_reviews",
        "ai_operations_shift_handovers",
        "ai_operations_escalations",
        "ai_operational_communications",
        "ai_operational_risks",
        "ai_provider_concentration_snapshots",
        "ai_operations_audit_events",
      ]),
    );
    expect(operationsCentre?.releaseGate).toContain("operational readiness approval");
    expect(operationsCentre?.releaseGate).toContain("release-freeze checks");

    expect(auditCompliance?.tables).toContain("ai_operations_audit_events");
  });

  it("routes court-facing AI output to human review and source controls", () => {
    const missingCitationResult = evaluateAiAutomationBoundary({
      proposedAction: "draft court-facing case summary",
      isCourtFacing: true,
      hasHumanReviewer: true,
      hasSourceCitations: false,
    });

    expect(missingCitationResult.allowed).toBe(false);
    expect(missingCitationResult.blockers).toContain(
      "Court-facing AI output requires source citations and source separation.",
    );

    const citedDraftResult = evaluateAiAutomationBoundary({
      proposedAction: "draft court-facing case summary",
      isCourtFacing: true,
      hasHumanReviewer: true,
      hasSourceCitations: true,
    });

    expect(citedDraftResult.allowed).toBe(true);
    expect(citedDraftResult.requiredOversight).toBe("human_review_before_action");
    expect(citedDraftResult.reviewFlags).toContain("court-output release gate");
  });

  it("allows low-risk support only with standard audit", () => {
    const result = evaluateAiAutomationBoundary({
      proposedAction: "suggest next learning activity",
    });

    expect(result).toEqual({
      allowed: true,
      blockers: [],
      reviewFlags: [],
      requiredOversight: "standard_audit",
    });
  });
});
