export type AiGovernanceVolumeId =
  | "foundation"
  | "model_lifecycle"
  | "prompt_workflow"
  | "data_governance"
  | "inference"
  | "guardrails"
  | "fairness"
  | "explainability"
  | "human_review"
  | "monitoring"
  | "incident_response"
  | "continuous_learning"
  | "operations_centre"
  | "audit_compliance";

export type AiGovernanceControlStatus = "implemented" | "requires_configuration" | "requires_review";

export type AiGovernanceVolume = {
  id: AiGovernanceVolumeId;
  title: string;
  purpose: string;
  status: AiGovernanceControlStatus;
  tables: string[];
  releaseGate: string;
};

export type AiAutomationBoundaryCheck = {
  proposedAction: string;
  containsChildData?: boolean;
  isCourtFacing?: boolean;
  isSafetyCritical?: boolean;
  hasHumanReviewer?: boolean;
  hasSourceCitations?: boolean;
};

export type AiGovernanceLiveMetric = {
  label: string;
  table: string;
  count: number | null;
  available: boolean;
  error?: string;
};

export type AiGovernanceLiveSummary = {
  loadedAt: string;
  metrics: AiGovernanceLiveMetric[];
  unavailableCount: number;
};

export const aiGovernanceVolumes: AiGovernanceVolume[] = [
  {
    id: "foundation",
    title: "AI Governance Foundation",
    purpose: "Defines principles, governance bodies, approved use cases, prohibited decisions, oversight requirements, release gates, and audit events.",
    status: "implemented",
    tables: ["ai_governance_principles", "ai_use_cases", "ai_prohibited_decisions", "ai_human_oversight_requirements"],
    releaseGate: "Every AI workflow needs an approved use case and an explicit prohibited-decision check.",
  },
  {
    id: "model_lifecycle",
    title: "Model Registry & Lifecycle",
    purpose: "Tracks providers, provider due diligence, contract controls, models, model versions, model cards, capability approvals, data eligibility, deployments, rollback, retirement, and compatibility.",
    status: "implemented",
    tables: [
      "ai_model_providers",
      "ai_provider_assessments",
      "ai_provider_contract_controls",
      "ai_models",
      "ai_model_versions",
      "ai_model_cards",
      "ai_model_capability_approvals",
      "ai_data_eligibility_rules",
      "ai_model_deployments",
      "ai_model_change_events",
    ],
    releaseGate: "Production traffic requires an approved provider, model card, capability approval, data eligibility rule, rollout step, fallback plan, and rollback plan.",
  },
  {
    id: "prompt_workflow",
    title: "Prompt & Workflow Governance",
    purpose: "Controls prompt templates, immutable prompt versions, workflow versions, workflow execution runs, retrieval policies, tool permissions, prompt security, output validation, evaluation, bundles, approvals, and change requests.",
    status: "implemented",
    tables: [
      "ai_prompt_templates",
      "ai_prompt_versions",
      "ai_prompt_variables",
      "ai_prompt_approval_requests",
      "ai_prompt_rollback_records",
      "ai_prompt_releases",
      "ai_workflow_templates",
      "ai_workflow_steps",
      "ai_workflow_execution_runs",
      "ai_workflow_step_runs",
      "ai_retrieval_policies",
      "ai_retrieval_query_plans",
      "ai_retrieval_results",
      "ai_retrieval_contradictions",
      "ai_retrieval_source_manifests",
      "ai_output_citations",
      "ai_context_packages",
      "ai_context_items",
      "ai_context_assembly_runs",
      "ai_tool_registry",
      "ai_tool_permission_grants",
      "ai_tool_call_authorisations",
      "ai_tool_calls",
      "ai_tool_invocation_logs",
      "ai_prompt_security_evaluations",
      "ai_prompt_injection_scans",
      "ai_output_processing_policies",
      "ai_output_validation_results",
      "ai_prompt_evaluation_runs",
      "ai_prompt_bundles",
      "ai_prompt_bundle_deployments",
    ],
    releaseGate: "Prompt and workflow changes require versioned approval, retrieval and tool boundaries, security evaluation, structured-output validation, bundle promotion, and rollback coverage.",
  },
  {
    id: "data_governance",
    title: "Training Data Governance",
    purpose: "Records dataset provenance, consent basis, de-identification state, child-data restrictions, and quality checks.",
    status: "implemented",
    tables: ["ai_training_datasets", "ai_dataset_records", "ai_dataset_quality_checks"],
    releaseGate: "No dataset is approved until provenance, consent, de-identification, and child-data checks pass.",
  },
  {
    id: "inference",
    title: "Inference Routing",
    purpose: "Defines model selection, local/cloud routing, fallback behavior, retry limits, confidence thresholds, and uncertainty action.",
    status: "implemented",
    tables: ["ai_inference_policies", "ai_inference_requests", "ai_output_lineage_records"],
    releaseGate: "Uncertainty, child data, and low confidence must route to fallback, blocking, or human review.",
  },
  {
    id: "guardrails",
    title: "Safety Guardrails",
    purpose: "Evaluates hallucination, prohibited outputs, prompt injection, jailbreak, sensitive-topic, privacy, court-output, and child-safety rules.",
    status: "implemented",
    tables: ["ai_guardrail_sets", "ai_guardrail_rules", "ai_guardrail_evaluations"],
    releaseGate: "Blocking guardrail failures stop the workflow and create a review path.",
  },
  {
    id: "fairness",
    title: "Fairness & Bias",
    purpose: "Stores evaluation plans, baselines, metrics, thresholds, subgroup tests, cultural review, accessibility, language validation, red-team findings, fairness parity, and residual-risk records.",
    status: "implemented",
    tables: [
      "ai_fairness_test_suites",
      "ai_fairness_test_results",
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
      "ai_cultural_review_findings",
      "ai_accessibility_evaluations",
      "ai_language_evaluations",
      "ai_hallucination_grounding_results",
      "ai_robustness_test_runs",
      "ai_red_team_campaigns",
      "ai_red_team_findings",
      "ai_safety_scenario_results",
      "ai_human_factors_studies",
      "ai_human_factors_results",
      "ai_pilot_evaluations",
      "ai_independent_validations",
      "ai_evaluation_exclusions",
      "ai_regression_suites",
      "ai_regression_results",
      "ai_evaluation_residual_risks",
    ],
    releaseGate: "Critical failures, blocking threshold misses, missing subgroup/language validation, ineffective human review, and unaccepted high residual risk block release.",
  },
  {
    id: "explainability",
    title: "Explainability",
    purpose: "Preserves explanation templates, audience-specific explanation versions, decision decomposition, evidence lineage, confidence and uncertainty statements, source limitations, accessibility variants, and explanation quality reviews.",
    status: "implemented",
    tables: [
      "ai_explanation_records",
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
      "ai_explanation_requests",
      "ai_explanation_views",
      "ai_explanation_feedback",
      "ai_accessibility_versions",
      "ai_accessibility_variants",
      "ai_explanation_translations",
      "ai_cultural_reviews",
      "ai_child_explanations",
      "ai_child_explanation_responses",
      "ai_parent_explanations",
      "ai_worker_explanations",
      "ai_supervisor_explanations",
      "ai_explanation_quality_reviews",
      "ai_explanation_validation_results",
      "ai_output_lineage_records",
    ],
    releaseGate: "Court-facing or safety-relevant AI output requires audience-appropriate explanations, citations, uncertainty labels, source separation, and quality review.",
  },
  {
    id: "human_review",
    title: "Human Review",
    purpose: "Routes AI-supported outputs to review queues, reviewer decisions, contestability requests, corrections, overrides, escalation, second review, independent review, and appeal workflows.",
    status: "implemented",
    tables: [
      "ai_human_review_queues",
      "ai_human_review_items",
      "ai_human_review_decisions",
      "ai_human_reviews",
      "ai_human_edits",
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
      "ai_override_records",
      "ai_override_patterns",
      "ai_contestability_service_levels",
      "ai_contestability_notifications",
      "ai_contestability_metrics",
    ],
    releaseGate: "High-impact AI output cannot finalise without an accountable human decision record and a correction, review, and appeal pathway.",
  },
  {
    id: "monitoring",
    title: "Model Monitoring",
    purpose: "Tracks accuracy, drift, latency, hallucination, calibration, safety, fairness, availability, and alert thresholds.",
    status: "implemented",
    tables: ["ai_model_monitoring_metrics", "ai_monitoring_alerts"],
    releaseGate: "Threshold breaches create alerts and can trigger suspension, rollback, or incident response.",
  },
  {
    id: "incident_response",
    title: "AI Incident Response",
    purpose: "Records harmful output, model failure, privacy, bias, hallucination, security, release, and provider incidents plus corrective actions.",
    status: "implemented",
    tables: ["ai_incidents", "ai_incident_actions", "ai_model_rollback_events"],
    releaseGate: "Critical incidents require containment, notification assessment, rollback assessment, and corrective-action tracking.",
  },
  {
    id: "continuous_learning",
    title: "Continuous Learning & Change Management",
    purpose: "Controls feedback intelligence, human correction learning, dataset improvement, learning approvals, scheduled evaluation, model retirement, knowledge-base evolution, prompt evolution, formal AI change requests, quality scorecards, longitudinal improvement, controlled experiments, and learning-governance safeguards.",
    status: "implemented",
    tables: [
      "ai_feedback_channels",
      "ai_feedback_signals",
      "ai_feedback_trends",
      "ai_learning_governance_policies",
      "ai_learning_signals",
      "ai_learning_signal_triage",
      "ai_feedback_records",
      "ai_child_feedback_controls",
      "ai_human_correction_learning_records",
      "ai_learning_corrections",
      "ai_learning_correction_reviews",
      "ai_learning_example_candidates",
      "ai_learning_example_quality_reviews",
      "ai_learning_candidates",
      "ai_learning_candidate_reviews",
      "ai_dataset_improvement_batches",
      "ai_dataset_change_sets",
      "ai_dataset_change_items",
      "ai_dataset_representativeness_reviews",
      "ai_influenced_data_records",
      "ai_learning_approval_workflows",
      "ai_learning_approval_steps",
      "ai_continuous_evaluation_schedules",
      "ai_continuous_evaluation_runs",
      "ai_model_retirement_assessments",
      "ai_model_retirement_plans",
      "ai_model_retirement_events",
      "ai_knowledge_base_sources",
      "ai_knowledge_base_versions",
      "ai_knowledge_change_impacts",
      "ai_knowledge_change_requests",
      "ai_knowledge_source_reviews",
      "ai_knowledge_supersession_records",
      "ai_prompt_evolution_records",
      "ai_prompt_change_requests",
      "ai_prompt_comparison_tests",
      "ai_prompt_rollbacks",
      "ai_workflow_change_requests",
      "ai_change_requests",
      "ai_change_request_reviews",
      "ai_change_deployment_gates",
      "ai_change_impact_assessments",
      "ai_change_approvals",
      "ai_change_evaluation_plans",
      "ai_change_rollback_plans",
      "ai_change_release_decisions",
      "ai_change_post_release_reviews",
      "ai_quality_scorecards",
      "ai_longitudinal_improvement_metrics",
      "ai_longitudinal_quality_snapshots",
      "ai_improvement_scorecards",
      "ai_experiment_protocols",
      "ai_experiment_results",
      "ai_controlled_experiments",
      "ai_experiment_assignments",
      "ai_experiment_safety_events",
      "ai_shadow_deployments",
      "ai_shadow_comparison_results",
      "ai_canary_releases",
      "ai_canary_release_stages",
      "ai_learning_governance_rules",
      "ai_learning_governance_findings",
      "ai_reviewer_drift_assessments",
      "ai_learning_contamination_findings",
      "ai_model_improvement_projects",
      "ai_candidate_model_builds",
      "ai_candidate_model_build_reviews",
      "ai_machine_unlearning_requests",
      "ai_machine_unlearning_actions",
      "ai_emergency_changes",
      "ai_learning_pipeline_runs",
      "ai_learning_audit_events",
      "ai_learning_change_audit_events",
    ],
    releaseGate: "Feedback and corrections cannot retrain or alter production AI until quality, dataset, bias, privacy, evaluation, governance, validation, experiment, rollback, and release gates pass.",
  },
  {
    id: "operations_centre",
    title: "Enterprise AI Operations Centre",
    purpose: "Provides production service visibility, fleet management, SLOs, error budgets, capacity planning, workload priority, human-review operations, cost governance, provider monitoring, failover, fallback, alerting, runbooks, maintenance, release freezes, disaster recovery, backups, operational readiness, shift handover, escalation, communications, operational risk, concentration risk, and audit.",
    status: "implemented",
    tables: [
      "ai_operational_services",
      "ai_service_dependencies",
      "ai_service_level_objectives",
      "ai_service_level_indicator_results",
      "ai_service_error_budgets",
      "ai_service_health_events",
      "ai_current_service_health",
      "ai_fleet_members",
      "ai_fleet_status_snapshots",
      "ai_service_capacity_profiles",
      "ai_capacity_measurements",
      "ai_capacity_forecasts",
      "ai_workload_classes",
      "ai_workload_queue_snapshots",
      "ai_ops_human_review_queue_snapshots",
      "ai_ops_human_review_capacity_plans",
      "ai_cost_centres",
      "ai_cost_events",
      "ai_cost_allocations",
      "ai_budget_status_snapshots",
      "ai_cost_anomalies",
      "ai_unit_cost_metrics",
      "ai_provider_service_measurements",
      "ai_provider_sla_assessments",
      "ai_operational_regions",
      "ai_service_failover_policies",
      "ai_service_failover_events",
      "ai_service_fallback_configurations",
      "ai_fallback_activations",
      "ai_operational_alerts",
      "ai_alert_routing_rules",
      "ai_alert_groups",
      "ai_operational_incident_links",
      "ai_operational_runbooks",
      "ai_runbook_executions",
      "ai_maintenance_windows",
      "ai_maintenance_execution_events",
      "ai_release_operations",
      "ai_release_freezes",
      "ai_disaster_recovery_plans",
      "ai_disaster_recovery_exercises",
      "ai_backup_records",
      "ai_backup_restore_tests",
      "ai_operational_readiness_reviews",
      "ai_operations_shift_handovers",
      "ai_operations_escalations",
      "ai_operational_communications",
      "ai_operational_risks",
      "ai_provider_concentration_snapshots",
      "ai_operations_audit_events",
    ],
    releaseGate: "Production AI services require registered ownership, current health, SLO/error-budget controls, alerting, fallback, rollback, capacity, DR, human-review readiness, release-freeze checks, and operational readiness approval.",
  },
  {
    id: "audit_compliance",
    title: "AI Audit & Compliance",
    purpose: "Preserves model history, prompt history, governance audit events, output lineage, incident records, release assurance packages, release decisions, production samples, evaluation audit events, learning/change audit events, and regulator exports.",
    status: "implemented",
    tables: [
      "ai_governance_audit_events",
      "ai_model_lifecycle_audit_events",
      "ai_prompt_workflow_audit_events",
      "ai_release_assurance_packages",
      "ai_release_decisions",
      "ai_release_conditions",
      "ai_production_validation_samples",
      "ai_evaluation_audit_events",
      "ai_court_disclosures",
      "ai_transparency_packages",
      "ai_explainability_audit_events",
      "ai_learning_audit_events",
      "ai_learning_change_audit_events",
      "ai_operations_audit_events",
      "ai_compliance_exports",
    ],
    releaseGate: "Production release and court export require an assurance package, release decision, enforceable conditions, immutable evaluation evidence, transparency package, and exportable audit history.",
  },
];

export const prohibitedAiDecisionExamples = [
  "child removal or placement decision",
  "abuse or neglect determination",
  "emergency service dispatch",
  "clinical or legal advice",
  "report release or approval",
  "child-private disclosure",
  "eligibility or service denial",
  "safety risk final finding",
] as const;

export const aiHumanOversightLevels = [
  "human_review_before_action",
  "qualified_reviewer_required",
  "second_review_required",
  "committee_approval_required",
] as const;

export function evaluateAiAutomationBoundary(check: AiAutomationBoundaryCheck) {
  const blockers: string[] = [];
  const reviewFlags: string[] = [];
  const action = check.proposedAction.toLowerCase();

  for (const prohibited of prohibitedAiDecisionExamples) {
    if (action.includes(prohibited)) {
      blockers.push(`AI cannot finalise ${prohibited}.`);
    }
  }

  if (check.containsChildData && !check.hasHumanReviewer) {
    blockers.push("Child data use requires an accountable human reviewer.");
  }

  if (check.isCourtFacing && !check.hasSourceCitations) {
    blockers.push("Court-facing AI output requires source citations and source separation.");
  }

  if (check.isSafetyCritical && !check.hasHumanReviewer) {
    blockers.push("Safety-critical AI output requires human review before action.");
  }

  if (check.isCourtFacing) {
    reviewFlags.push("court-output release gate");
  }
  if (check.containsChildData) {
    reviewFlags.push("child-data minimisation review");
  }
  if (check.isSafetyCritical) {
    reviewFlags.push("safety escalation review");
  }

  return {
    allowed: blockers.length === 0,
    blockers,
    reviewFlags,
    requiredOversight: blockers.length > 0 ? "block_and_route_to_review" : reviewFlags.length > 0 ? "human_review_before_action" : "standard_audit",
  };
}

export function getAiGovernanceReadinessSummary() {
  const implemented = aiGovernanceVolumes.filter((volume) => volume.status === "implemented").length;
  const tableCount = new Set(aiGovernanceVolumes.flatMap((volume) => volume.tables)).size;

  return {
    implemented,
    total: aiGovernanceVolumes.length,
    tableCount,
    readyForRuntimeIntegration: implemented === aiGovernanceVolumes.length,
  };
}

const liveMetricTables: { label: string; table: string }[] = [
  { label: "AI use cases", table: "ai_use_cases" },
  { label: "Prohibited decisions", table: "ai_prohibited_decisions" },
  { label: "Model providers", table: "ai_model_providers" },
  { label: "Provider assessments", table: "ai_provider_assessments" },
  { label: "Provider contract controls", table: "ai_provider_contract_controls" },
  { label: "Model versions", table: "ai_model_versions" },
  { label: "Model cards", table: "ai_model_cards" },
  { label: "Capability approvals", table: "ai_model_capability_approvals" },
  { label: "Data eligibility rules", table: "ai_data_eligibility_rules" },
  { label: "Prompt templates", table: "ai_prompt_templates" },
  { label: "Workflow templates", table: "ai_workflow_templates" },
  { label: "Retrieval policies", table: "ai_retrieval_policies" },
  { label: "Retrieval results", table: "ai_retrieval_results" },
  { label: "Output citations", table: "ai_output_citations" },
  { label: "Explanations", table: "ai_explanations" },
  { label: "Contestability requests", table: "ai_contestability_requests" },
  { label: "Court disclosures", table: "ai_court_disclosures" },
  { label: "Tool registry", table: "ai_tool_registry" },
  { label: "Tool calls", table: "ai_tool_calls" },
  { label: "Workflow runs", table: "ai_workflow_execution_runs" },
  { label: "Prompt bundles", table: "ai_prompt_bundles" },
  { label: "Training datasets", table: "ai_training_datasets" },
  { label: "Inference policies", table: "ai_inference_policies" },
  { label: "Guardrail sets", table: "ai_guardrail_sets" },
  { label: "Evaluation plans", table: "ai_evaluation_plans" },
  { label: "Evaluation runs", table: "ai_evaluation_runs" },
  { label: "Critical failures", table: "ai_critical_failure_definitions" },
  { label: "Release packages", table: "ai_release_assurance_packages" },
  { label: "Human review queues", table: "ai_human_review_queues" },
  { label: "Monitoring alerts", table: "ai_monitoring_alerts" },
  { label: "AI incidents", table: "ai_incidents" },
  { label: "Learning signals", table: "ai_feedback_signals" },
  { label: "AI change requests", table: "ai_change_requests" },
  { label: "AI experiments", table: "ai_experiment_protocols" },
  { label: "Learning governance findings", table: "ai_learning_governance_findings" },
  { label: "Operational services", table: "ai_operational_services" },
  { label: "Operational alerts", table: "ai_operational_alerts" },
  { label: "Cost events", table: "ai_cost_events" },
  { label: "Operational risks", table: "ai_operational_risks" },
];

export async function getAiGovernanceLiveSummary(): Promise<AiGovernanceLiveSummary> {
  const metrics = await Promise.all(
    liveMetricTables.map(async (metric) => {
      try {
        const { count, error } = await supabase
          .from(metric.table)
          .select("id", { count: "exact", head: true });

        if (error) {
          return {
            ...metric,
            count: null,
            available: false,
            error: error.message,
          };
        }

        return {
          ...metric,
          count: count ?? 0,
          available: true,
        };
      } catch (error) {
        return {
          ...metric,
          count: null,
          available: false,
          error: error instanceof Error ? error.message : "Unable to load governance metric.",
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
import { supabase } from "../supabase";
