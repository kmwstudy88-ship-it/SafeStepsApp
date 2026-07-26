create or replace function public.safesteps_can_manage_ai_evaluation(
  p_user_id uuid,
  p_organisation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.safesteps_can_manage_ai_governance(p_user_id, p_organisation_id)
    or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'ai_evaluation.manage')
    or public.has_resource_permission(p_user_id, 'global', null, 'ai_evaluation.manage'),
    false
  );
$$;

revoke all on function public.safesteps_can_manage_ai_evaluation(uuid, uuid) from public;
grant execute on function public.safesteps_can_manage_ai_evaluation(uuid, uuid) to authenticated;

create table if not exists public.ai_evaluation_plans (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  evaluation_plan_code text not null,
  evaluation_plan_version integer not null,
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  model_version_id uuid references public.ai_model_versions(id) on delete restrict,
  deployment_id uuid references public.ai_model_deployments(id) on delete restrict,
  prompt_bundle_id uuid references public.ai_prompt_bundles(id) on delete restrict,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete restrict,
  evaluation_scope text not null check (evaluation_scope in ('component', 'workflow', 'human_system', 'operational', 'outcome', 'release')),
  risk_tier text not null check (risk_tier in ('low', 'medium', 'high', 'critical')),
  objectives jsonb not null default '{}'::jsonb,
  hypotheses jsonb not null default '[]'::jsonb,
  evaluation_categories text[] not null default '{}'::text[],
  target_populations jsonb not null default '[]'::jsonb,
  target_languages text[] not null default '{}'::text[],
  required_dataset_ids uuid[] not null default '{}'::uuid[],
  required_metric_ids uuid[] not null default '{}'::uuid[],
  baseline_definition text not null,
  acceptance_rule text not null,
  independent_validation_required boolean not null default false,
  human_factors_required boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'approved', 'running', 'completed', 'suspended', 'retired')),
  prepared_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  unique (organisation_id, evaluation_plan_code, evaluation_plan_version)
);

create table if not exists public.ai_evaluation_baselines (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  baseline_code text not null,
  baseline_version integer not null,
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  baseline_type text not null check (baseline_type in ('human_only', 'rule_based', 'current_production_model', 'previous_model_version', 'validated_instrument', 'keyword_detector', 'simple_retrieval', 'no_recommendation', 'operational_average')),
  description text not null,
  implementation_reference text,
  human_process_reference text,
  evaluation_dataset_ids uuid[] not null default '{}'::uuid[],
  known_limitations jsonb not null default '[]'::jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organisation_id, baseline_code, baseline_version)
);

create table if not exists public.ai_evaluation_metrics (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  metric_code text not null,
  metric_version integer not null,
  metric_name text not null,
  metric_category text not null check (metric_category in ('task_accuracy', 'evidence_grounding', 'citation_accuracy', 'completeness', 'contradiction_preservation', 'uncertainty', 'calibration', 'classification', 'fairness', 'cultural_safety', 'accessibility', 'multilingual', 'hallucination', 'prompt_injection', 'tool_safety', 'privacy', 'robustness', 'human_review', 'operational', 'user_comprehension')),
  definition text not null,
  calculation_method text not null,
  higher_is_better boolean,
  valid_minimum numeric,
  valid_maximum numeric,
  required_sample_size_rule jsonb not null default '{}'::jsonb,
  confidence_interval_required boolean not null default true,
  subgroup_reporting_required boolean not null default false,
  human_rating_metric boolean not null default false,
  automated_metric boolean not null default true,
  known_limitations text not null,
  created_at timestamptz not null default now(),
  unique (organisation_id, metric_code, metric_version)
);

create table if not exists public.ai_evaluation_thresholds (
  id uuid primary key default gen_random_uuid(),
  evaluation_plan_id uuid not null references public.ai_evaluation_plans(id) on delete cascade,
  metric_id uuid not null references public.ai_evaluation_metrics(id) on delete restrict,
  population_scope jsonb not null default '{}'::jsonb,
  language_code text,
  minimum_acceptable_value numeric,
  maximum_acceptable_value numeric,
  warning_threshold numeric,
  critical_threshold numeric,
  blocking boolean not null default false,
  rationale text not null,
  approved_before_test boolean not null default true,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_critical_failure_definitions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  failure_code text not null,
  failure_name text not null,
  applicable_risk_tiers text[] not null default '{}'::text[],
  applicable_use_case_types text[] not null default '{}'::text[],
  description text not null,
  detection_method text not null,
  release_blocking boolean not null default true,
  incident_required boolean not null default true,
  required_response jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organisation_id, failure_code)
);

create table if not exists public.ai_evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  evaluation_reference text not null unique,
  evaluation_plan_id uuid not null references public.ai_evaluation_plans(id) on delete restrict,
  evaluation_type text not null check (evaluation_type in ('functional', 'safety', 'policy', 'fairness', 'multilingual', 'accessibility', 'robustness', 'human_factors', 'pilot', 'independent_validation', 'regression', 'production_sample')),
  model_version_id uuid references public.ai_model_versions(id) on delete restrict,
  deployment_id uuid references public.ai_model_deployments(id) on delete restrict,
  prompt_bundle_id uuid references public.ai_prompt_bundles(id) on delete restrict,
  dataset_ids uuid[] not null default '{}'::uuid[],
  code_version_reference text not null,
  configuration_hash text not null,
  random_seed_reference text,
  environment_code text not null,
  status text not null default 'planned' check (status in ('planned', 'running', 'passed', 'failed', 'needs_review', 'cancelled')),
  total_items bigint,
  completed_items bigint not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  executed_by_service text,
  supervised_by uuid references auth.users(id) on delete set null
);

create table if not exists public.ai_evaluation_items (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  dataset_record_id uuid references public.ai_dataset_records(id) on delete restrict,
  test_case_reference text,
  input_manifest jsonb not null default '{}'::jsonb,
  expected_result_reference jsonb,
  output_payload jsonb,
  output_hash text,
  execution_status text not null check (execution_status in ('pending', 'completed', 'failed', 'refused', 'timeout', 'malformed_output', 'validation_failed', 'policy_rejected')),
  latency_milliseconds integer,
  critical_failure_detected boolean not null default false,
  critical_failure_codes text[] not null default '{}'::text[],
  completed_at timestamptz
);

create table if not exists public.ai_evaluation_metric_results (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  metric_id uuid not null references public.ai_evaluation_metrics(id) on delete restrict,
  population_scope jsonb not null default '{}'::jsonb,
  language_code text,
  sample_size bigint not null,
  measured_value numeric,
  confidence_interval_lower numeric,
  confidence_interval_upper numeric,
  threshold_id uuid references public.ai_evaluation_thresholds(id) on delete set null,
  threshold_outcome text not null check (threshold_outcome in ('passed', 'warning', 'blocking_failure', 'not_applicable', 'insufficient_sample')),
  calculation_reference text not null,
  calculated_at timestamptz not null default now()
);

create table if not exists public.ai_evaluation_errors (
  id uuid primary key default gen_random_uuid(),
  evaluation_item_id uuid not null references public.ai_evaluation_items(id) on delete cascade,
  error_category text not null check (error_category in ('false_positive', 'false_negative', 'unsupported_claim', 'incorrect_citation', 'incomplete_evidence', 'contradiction_omitted', 'outdated_source', 'uncertainty_overstated', 'uncertainty_omitted', 'cultural_misinterpretation', 'disability_misinterpretation', 'language_misunderstanding', 'privacy_disclosure', 'policy_violation', 'unsafe_recommendation', 'malformed_output', 'tool_misuse', 'human_review_bypass')),
  error_subcategory text,
  severity text not null check (severity in ('minor', 'major', 'critical')),
  description text not null,
  affected_output_path text,
  source_reference jsonb,
  machine_detected boolean not null default false,
  human_confirmed boolean not null default false,
  root_cause_status text not null default 'unassessed',
  remediation_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_calibration_assessments (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  output_type text not null,
  population_scope jsonb not null default '{}'::jsonb,
  calibration_method text not null,
  expected_calibration_error numeric,
  maximum_calibration_error numeric,
  brier_score numeric,
  calibration_curve jsonb not null default '{}'::jsonb,
  confidence_bins jsonb not null default '[]'::jsonb,
  overconfidence_rate numeric,
  underconfidence_rate numeric,
  outcome text not null check (outcome in ('passed', 'warning', 'failed', 'insufficient_sample')),
  recalibration_required boolean not null default false,
  completed_at timestamptz not null default now()
);

create table if not exists public.ai_evaluation_subgroups (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  subgroup_code text not null,
  subgroup_version integer not null,
  subgroup_name text not null,
  description text not null,
  attribute_sources jsonb not null default '{}'::jsonb,
  inclusion_rule jsonb not null default '{}'::jsonb,
  sensitive_attribute boolean not null default false,
  minimum_reporting_size integer not null default 20,
  privacy_protection_rule jsonb not null default '{}'::jsonb,
  approved_purposes text[] not null default '{}'::text[],
  prohibited_uses text[] not null default '{}'::text[],
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organisation_id, subgroup_code, subgroup_version)
);

create table if not exists public.ai_fairness_results (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  metric_id uuid not null references public.ai_evaluation_metrics(id) on delete restrict,
  reference_subgroup_id uuid references public.ai_evaluation_subgroups(id) on delete restrict,
  comparison_subgroup_id uuid references public.ai_evaluation_subgroups(id) on delete restrict,
  reference_value numeric not null,
  comparison_value numeric not null,
  absolute_difference numeric,
  relative_ratio numeric,
  confidence_interval_lower numeric,
  confidence_interval_upper numeric,
  disparity_threshold numeric,
  outcome text not null check (outcome in ('passed', 'warning', 'failed', 'insufficient_sample', 'needs_qualitative_review')),
  materiality_assessment text,
  remediation_required boolean not null default false,
  calculated_at timestamptz not null default now()
);

create table if not exists public.ai_cultural_evaluation_panels (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  panel_code text not null,
  panel_name text not null,
  cultural_scope text[] not null default '{}'::text[],
  language_scope text[] not null default '{}'::text[],
  required_expertise text[] not null default '{}'::text[],
  lived_experience_representation_required boolean not null default true,
  minimum_members integer not null default 3,
  quorum_rule jsonb not null default '{}'::jsonb,
  conflict_management_rule jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organisation_id, panel_code)
);

create table if not exists public.ai_cultural_review_findings (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  panel_id uuid references public.ai_cultural_evaluation_panels(id) on delete set null,
  finding_code text not null,
  cultural_scope text[] not null default '{}'::text[],
  finding_summary text not null,
  severity text not null check (severity in ('minor', 'major', 'critical')),
  remediation_required boolean not null default false,
  reviewer_notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_accessibility_evaluations (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  accessibility_domain text not null check (accessibility_domain in ('disability', 'neurodiversity', 'plain_language', 'screen_reader', 'cognitive_load', 'low_literacy', 'device_constraints')),
  population_scope jsonb not null default '{}'::jsonb,
  evaluation_method text not null,
  outcome text not null check (outcome in ('passed', 'warning', 'failed', 'needs_human_pathway')),
  barriers_identified jsonb not null default '[]'::jsonb,
  required_adjustments jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create table if not exists public.ai_language_evaluations (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  language_code text not null,
  interpreter_pathway_required boolean not null default true,
  test_population jsonb not null default '{}'::jsonb,
  comprehension_score numeric,
  task_accuracy_score numeric,
  safety_wording_score numeric,
  citation_quality_score numeric,
  outcome text not null check (outcome in ('approved_language', 'limited_language', 'human_language_pathway_required', 'failed')),
  limitations text,
  completed_at timestamptz not null default now()
);

create table if not exists public.ai_hallucination_grounding_results (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  unsupported_claim_rate numeric,
  fabricated_citation_count integer not null default 0,
  missing_citation_count integer not null default 0,
  contradiction_omission_count integer not null default 0,
  source_grounding_score numeric,
  challenging_evidence_recall numeric,
  release_blocking_failure boolean not null default false,
  findings jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now()
);

create table if not exists public.ai_robustness_test_runs (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  robustness_domain text not null check (robustness_domain in ('ambiguous_input', 'missing_records', 'provider_outage', 'latency_spike', 'prompt_injection', 'tool_abuse', 'schema_malformed', 'long_context', 'noisy_transcription', 'adversarial_user')),
  scenario_definition jsonb not null default '{}'::jsonb,
  pass_fail_outcome text not null check (pass_fail_outcome in ('passed', 'failed', 'needs_review')),
  failure_summary text,
  completed_at timestamptz not null default now()
);

create table if not exists public.ai_red_team_campaigns (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  campaign_code text not null,
  campaign_name text not null,
  target_scope jsonb not null default '{}'::jsonb,
  attack_categories text[] not null default '{}'::text[],
  rules_of_engagement jsonb not null default '{}'::jsonb,
  status text not null default 'planned' check (status in ('planned', 'running', 'completed', 'cancelled')),
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organisation_id, campaign_code)
);

create table if not exists public.ai_red_team_findings (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.ai_red_team_campaigns(id) on delete cascade,
  evaluation_run_id uuid references public.ai_evaluation_runs(id) on delete set null,
  finding_type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  exploit_summary text not null,
  successful_attack boolean not null default false,
  release_blocking boolean not null default true,
  remediation_status text not null default 'open' check (remediation_status in ('open', 'accepted_risk', 'fixed', 'waived')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_safety_scenario_results (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  scenario_code text not null,
  scenario_category text not null check (scenario_category in ('child_safety', 'dfv', 'suicide_safety', 'sexual_harm', 'court_report', 'protected_address', 'mandatory_review', 'prohibited_decision')),
  expected_behavior text not null,
  observed_behavior text not null,
  missed_escalation boolean not null default false,
  unnecessary_escalation boolean not null default false,
  outcome text not null check (outcome in ('passed', 'failed', 'needs_review')),
  completed_at timestamptz not null default now()
);

create table if not exists public.ai_human_factors_studies (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  study_code text not null,
  evaluation_plan_id uuid references public.ai_evaluation_plans(id) on delete cascade,
  study_method text not null,
  participant_roles text[] not null default '{}'::text[],
  automation_bias_measured boolean not null default true,
  comprehension_measured boolean not null default true,
  workload_measured boolean not null default true,
  status text not null default 'planned' check (status in ('planned', 'running', 'completed', 'cancelled')),
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organisation_id, study_code)
);

create table if not exists public.ai_human_factors_results (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.ai_human_factors_studies(id) on delete cascade,
  evaluation_run_id uuid references public.ai_evaluation_runs(id) on delete set null,
  reviewer_detection_rate numeric,
  reviewer_override_accuracy numeric,
  automation_bias_score numeric,
  average_review_time_seconds integer,
  workload_impact text,
  comprehension_findings jsonb not null default '{}'::jsonb,
  outcome text not null check (outcome in ('passed', 'conditions_required', 'failed', 'needs_more_testing')),
  completed_at timestamptz not null default now()
);

create table if not exists public.ai_pilot_evaluations (
  id uuid primary key default gen_random_uuid(),
  evaluation_plan_id uuid not null references public.ai_evaluation_plans(id) on delete cascade,
  deployment_id uuid not null references public.ai_model_deployments(id) on delete restrict,
  pilot_scope jsonb not null default '{}'::jsonb,
  start_at timestamptz not null,
  end_at timestamptz,
  maximum_traffic_percentage numeric(5,2) not null default 0 check (maximum_traffic_percentage >= 0 and maximum_traffic_percentage <= 100),
  monitoring_requirements jsonb not null default '{}'::jsonb,
  stop_conditions jsonb not null default '[]'::jsonb,
  outcome text not null default 'planned' check (outcome in ('planned', 'running', 'passed', 'conditions_required', 'failed', 'stopped')),
  completed_at timestamptz
);

create table if not exists public.ai_independent_validations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  evaluation_plan_id uuid not null references public.ai_evaluation_plans(id) on delete cascade,
  validator_role text not null,
  validation_method text not null,
  tests_reperformed jsonb not null default '[]'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  unresolved_findings jsonb not null default '[]'::jsonb,
  validation_outcome text not null check (validation_outcome in ('validated', 'validated_with_conditions', 'not_validated', 'inconclusive')),
  release_recommendation text not null check (release_recommendation in ('release', 'conditional_release', 'pilot_only', 'remediation_required', 'do_not_release')),
  completed_at timestamptz not null
);

create table if not exists public.ai_evaluation_exclusions (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete cascade,
  evaluation_item_id uuid references public.ai_evaluation_items(id) on delete cascade,
  exclusion_reason_code text not null,
  exclusion_reason text not null,
  predeclared_rule boolean not null default false,
  material_to_outcome boolean,
  approved_by uuid references auth.users(id) on delete set null,
  excluded_at timestamptz not null default now()
);

create table if not exists public.ai_regression_suites (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  suite_code text not null,
  suite_version integer not null,
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  dataset_ids uuid[] not null default '{}'::uuid[],
  metric_ids uuid[] not null default '{}'::uuid[],
  critical_scenario_ids uuid[] not null default '{}'::uuid[],
  maximum_allowed_metric_regression jsonb not null default '{}'::jsonb,
  zero_tolerance_failure_codes text[] not null default '{}'::text[],
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organisation_id, suite_code, suite_version)
);

create table if not exists public.ai_regression_results (
  id uuid primary key default gen_random_uuid(),
  regression_suite_id uuid not null references public.ai_regression_suites(id) on delete restrict,
  candidate_evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete restrict,
  baseline_evaluation_run_id uuid not null references public.ai_evaluation_runs(id) on delete restrict,
  metric_differences jsonb not null default '{}'::jsonb,
  subgroup_differences jsonb not null default '{}'::jsonb,
  new_failure_codes text[] not null default '{}'::text[],
  resolved_failure_codes text[] not null default '{}'::text[],
  critical_regression boolean not null default false,
  outcome text not null check (outcome in ('passed', 'warning', 'failed', 'blocked')),
  completed_at timestamptz not null default now()
);

create table if not exists public.ai_evaluation_residual_risks (
  id uuid primary key default gen_random_uuid(),
  evaluation_plan_id uuid not null references public.ai_evaluation_plans(id) on delete cascade,
  risk_code text not null,
  risk_description text not null,
  affected_populations jsonb not null default '[]'::jsonb,
  affected_languages text[] not null default '{}'::text[],
  likelihood text not null,
  impact text not null,
  detectability text not null,
  existing_controls jsonb not null default '[]'::jsonb,
  additional_controls jsonb not null default '[]'::jsonb,
  risk_owner_role text not null,
  acceptance_status text not null default 'unreviewed' check (acceptance_status in ('unreviewed', 'accepted', 'rejected', 'remediation_required', 'expired')),
  accepted_by uuid references auth.users(id) on delete set null,
  review_due_at timestamptz,
  unique (evaluation_plan_id, risk_code)
);

create table if not exists public.ai_release_assurance_packages (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  package_reference text not null unique,
  use_case_id uuid not null references public.ai_use_cases(id) on delete restrict,
  deployment_id uuid not null references public.ai_model_deployments(id) on delete restrict,
  evaluation_plan_id uuid not null references public.ai_evaluation_plans(id) on delete restrict,
  evaluation_run_ids uuid[] not null default '{}'::uuid[],
  independent_validation_id uuid references public.ai_independent_validations(id) on delete set null,
  evidence_manifest jsonb not null default '{}'::jsonb,
  critical_failures_open integer not null default 0,
  blocking_threshold_failures integer not null default 0,
  unresolved_high_risks integer not null default 0,
  recommended_release_scope jsonb not null default '{}'::jsonb,
  recommended_conditions jsonb not null default '[]'::jsonb,
  prepared_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz not null default now()
);

create table if not exists public.ai_release_decisions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  release_decision_reference text not null unique,
  assurance_package_id uuid not null references public.ai_release_assurance_packages(id) on delete restrict,
  governance_body_id uuid not null references public.ai_governance_bodies(id) on delete restrict,
  decision text not null check (decision in ('approved', 'approved_with_conditions', 'controlled_pilot_only', 'limited_population', 'limited_language', 'evaluation_only', 'remediation_required', 'failed', 'suspended_pending_investigation')),
  approved_scope jsonb not null default '{}'::jsonb,
  conditions jsonb not null default '[]'::jsonb,
  monitoring_requirements jsonb not null default '{}'::jsonb,
  stop_conditions jsonb not null default '[]'::jsonb,
  rationale text not null,
  effective_from timestamptz,
  expires_at timestamptz,
  review_due_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz not null default now()
);

create table if not exists public.ai_release_conditions (
  id uuid primary key default gen_random_uuid(),
  release_decision_id uuid not null references public.ai_release_decisions(id) on delete cascade,
  condition_code text not null,
  condition_type text not null check (condition_type in ('traffic', 'organisation', 'jurisdiction', 'worker_role', 'population', 'language', 'data_classification', 'operating_hours', 'daily_request_limit', 'review_staffing', 'report_type', 'workflow_stage')),
  condition_definition jsonb not null default '{}'::jsonb,
  enforcement_method text not null,
  monitoring_metric_reference text,
  breach_action text not null,
  effective_from timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active', 'breached', 'expired', 'retired')),
  unique (release_decision_id, condition_code)
);

create table if not exists public.ai_production_validation_samples (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  deployment_id uuid not null references public.ai_model_deployments(id) on delete restrict,
  sample_period_start timestamptz not null,
  sample_period_end timestamptz not null,
  sampling_method text not null,
  sample_size integer not null,
  included_output_ids uuid[] not null default '{}'::uuid[],
  subgroup_coverage jsonb not null default '{}'::jsonb,
  risk_based_oversampling jsonb not null default '{}'::jsonb,
  status text not null default 'selected' check (status in ('selected', 'in_review', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_evaluation_audit_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  evaluation_plan_id uuid references public.ai_evaluation_plans(id) on delete set null,
  evaluation_run_id uuid references public.ai_evaluation_runs(id) on delete set null,
  event_type text not null,
  event_description text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  service_identity text,
  previous_hash text,
  new_hash text,
  event_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_ai_evaluation_plans_org_status on public.ai_evaluation_plans(organisation_id, status);
create index if not exists idx_ai_evaluation_runs_plan_status on public.ai_evaluation_runs(evaluation_plan_id, status);
create index if not exists idx_ai_evaluation_items_run_status on public.ai_evaluation_items(evaluation_run_id, execution_status);
create index if not exists idx_ai_evaluation_metric_results_run on public.ai_evaluation_metric_results(evaluation_run_id, threshold_outcome);
create index if not exists idx_ai_evaluation_errors_item_severity on public.ai_evaluation_errors(evaluation_item_id, severity);
create index if not exists idx_ai_fairness_results_run_outcome on public.ai_fairness_results(evaluation_run_id, outcome);
create index if not exists idx_ai_red_team_findings_campaign_severity on public.ai_red_team_findings(campaign_id, severity);
create index if not exists idx_ai_release_assurance_org on public.ai_release_assurance_packages(organisation_id, submitted_at desc);
create index if not exists idx_ai_release_decisions_org on public.ai_release_decisions(organisation_id, decided_at desc);
create index if not exists idx_ai_evaluation_audit_org_time on public.ai_evaluation_audit_events(organisation_id, occurred_at desc);

alter table public.ai_evaluation_plans enable row level security;
alter table public.ai_evaluation_baselines enable row level security;
alter table public.ai_evaluation_metrics enable row level security;
alter table public.ai_evaluation_thresholds enable row level security;
alter table public.ai_critical_failure_definitions enable row level security;
alter table public.ai_evaluation_runs enable row level security;
alter table public.ai_evaluation_items enable row level security;
alter table public.ai_evaluation_metric_results enable row level security;
alter table public.ai_evaluation_errors enable row level security;
alter table public.ai_calibration_assessments enable row level security;
alter table public.ai_evaluation_subgroups enable row level security;
alter table public.ai_fairness_results enable row level security;
alter table public.ai_cultural_evaluation_panels enable row level security;
alter table public.ai_cultural_review_findings enable row level security;
alter table public.ai_accessibility_evaluations enable row level security;
alter table public.ai_language_evaluations enable row level security;
alter table public.ai_hallucination_grounding_results enable row level security;
alter table public.ai_robustness_test_runs enable row level security;
alter table public.ai_red_team_campaigns enable row level security;
alter table public.ai_red_team_findings enable row level security;
alter table public.ai_safety_scenario_results enable row level security;
alter table public.ai_human_factors_studies enable row level security;
alter table public.ai_human_factors_results enable row level security;
alter table public.ai_pilot_evaluations enable row level security;
alter table public.ai_independent_validations enable row level security;
alter table public.ai_evaluation_exclusions enable row level security;
alter table public.ai_regression_suites enable row level security;
alter table public.ai_regression_results enable row level security;
alter table public.ai_evaluation_residual_risks enable row level security;
alter table public.ai_release_assurance_packages enable row level security;
alter table public.ai_release_decisions enable row level security;
alter table public.ai_release_conditions enable row level security;
alter table public.ai_production_validation_samples enable row level security;
alter table public.ai_evaluation_audit_events enable row level security;

create policy "AI evaluation org tables managed by evaluation admins" on public.ai_evaluation_plans for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI evaluation baselines managed by evaluation admins" on public.ai_evaluation_baselines for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI evaluation metrics managed by evaluation admins" on public.ai_evaluation_metrics for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI critical failures managed by evaluation admins" on public.ai_critical_failure_definitions for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI evaluation runs managed by evaluation admins" on public.ai_evaluation_runs for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI evaluation subgroups managed by evaluation admins" on public.ai_evaluation_subgroups for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI cultural panels managed by evaluation admins" on public.ai_cultural_evaluation_panels for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI red team campaigns managed by evaluation admins" on public.ai_red_team_campaigns for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI human factors studies managed by evaluation admins" on public.ai_human_factors_studies for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI independent validations managed by evaluation admins" on public.ai_independent_validations for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI regression suites managed by evaluation admins" on public.ai_regression_suites for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI assurance packages managed by evaluation admins" on public.ai_release_assurance_packages for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI release decisions managed by evaluation admins" on public.ai_release_decisions for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI production samples managed by evaluation admins" on public.ai_production_validation_samples for all to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id));
create policy "AI evaluation audit readable by evaluation admins" on public.ai_evaluation_audit_events for select to authenticated using (public.safesteps_can_manage_ai_evaluation(auth.uid(), organisation_id) or public.has_resource_permission(auth.uid(), 'global', null, 'ai_audit.read'));
create policy "AI evaluation audit appendable by actor" on public.ai_evaluation_audit_events for insert to authenticated with check (actor_user_id = auth.uid());

create policy "AI thresholds managed through plan" on public.ai_evaluation_thresholds for all to authenticated using (exists (select 1 from public.ai_evaluation_plans p where p.id = evaluation_plan_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), p.organisation_id))) with check (exists (select 1 from public.ai_evaluation_plans p where p.id = evaluation_plan_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), p.organisation_id)));
create policy "AI evaluation items managed through run" on public.ai_evaluation_items for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI metric results managed through run" on public.ai_evaluation_metric_results for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI errors managed through item" on public.ai_evaluation_errors for all to authenticated using (exists (select 1 from public.ai_evaluation_items i join public.ai_evaluation_runs r on r.id = i.evaluation_run_id where i.id = evaluation_item_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_items i join public.ai_evaluation_runs r on r.id = i.evaluation_run_id where i.id = evaluation_item_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI calibration managed through run" on public.ai_calibration_assessments for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI fairness results managed through run" on public.ai_fairness_results for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI cultural findings managed through run" on public.ai_cultural_review_findings for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI accessibility evaluations managed through run" on public.ai_accessibility_evaluations for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI language evaluations managed through run" on public.ai_language_evaluations for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI grounding results managed through run" on public.ai_hallucination_grounding_results for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI robustness tests managed through run" on public.ai_robustness_test_runs for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI red team findings managed through campaign" on public.ai_red_team_findings for all to authenticated using (exists (select 1 from public.ai_red_team_campaigns c where c.id = campaign_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_red_team_campaigns c where c.id = campaign_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), c.organisation_id)));
create policy "AI safety scenario results managed through run" on public.ai_safety_scenario_results for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI human factors results managed through study" on public.ai_human_factors_results for all to authenticated using (exists (select 1 from public.ai_human_factors_studies s where s.id = study_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_human_factors_studies s where s.id = study_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), s.organisation_id)));
create policy "AI pilot evaluations managed through plan" on public.ai_pilot_evaluations for all to authenticated using (exists (select 1 from public.ai_evaluation_plans p where p.id = evaluation_plan_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), p.organisation_id))) with check (exists (select 1 from public.ai_evaluation_plans p where p.id = evaluation_plan_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), p.organisation_id)));
create policy "AI evaluation exclusions managed through run" on public.ai_evaluation_exclusions for all to authenticated using (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id))) with check (exists (select 1 from public.ai_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), r.organisation_id)));
create policy "AI regression results managed through suite" on public.ai_regression_results for all to authenticated using (exists (select 1 from public.ai_regression_suites s where s.id = regression_suite_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_regression_suites s where s.id = regression_suite_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), s.organisation_id)));
create policy "AI residual risks managed through plan" on public.ai_evaluation_residual_risks for all to authenticated using (exists (select 1 from public.ai_evaluation_plans p where p.id = evaluation_plan_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), p.organisation_id))) with check (exists (select 1 from public.ai_evaluation_plans p where p.id = evaluation_plan_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), p.organisation_id)));
create policy "AI release conditions managed through decision" on public.ai_release_conditions for all to authenticated using (exists (select 1 from public.ai_release_decisions d where d.id = release_decision_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), d.organisation_id))) with check (exists (select 1 from public.ai_release_decisions d where d.id = release_decision_id and public.safesteps_can_manage_ai_evaluation(auth.uid(), d.organisation_id)));

create or replace function public.can_release_ai_deployment(
  p_assurance_package_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_release_assurance_packages p
    join public.ai_evaluation_plans ep on ep.id = p.evaluation_plan_id
    join public.ai_model_deployments d on d.id = p.deployment_id
    where p.id = p_assurance_package_id
      and p.critical_failures_open = 0
      and p.blocking_threshold_failures = 0
      and p.unresolved_high_risks = 0
      and ep.status = 'approved'
      and d.deployment_status in ('planned', 'active')
      and (
        ep.independent_validation_required = false
        or p.independent_validation_id is not null
      )
      and not exists (
        select 1
        from public.ai_system_suspensions s
        where s.use_case_id = p.use_case_id
          and s.status = 'active'
      )
  );
$$;

revoke all on function public.can_release_ai_deployment(uuid) from public;
grant execute on function public.can_release_ai_deployment(uuid) to authenticated;

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_evaluation.manage', 'Manage AI evaluation plans, baselines, metrics, thresholds, runs, fairness testing, validation, residual risk, and release assurance.', 'organisation', 'manage_ai_evaluation', 'high_impact'),
  ('ai_release_assurance.approve', 'Approve AI release assurance packages, release decisions, conditional release scopes, and release conditions.', 'organisation', 'approve_ai_release_assurance', 'high_impact'),
  ('ai_independent_validation.manage', 'Manage independent AI validation records, findings, and release recommendations.', 'organisation', 'manage_ai_independent_validation', 'high_impact'),
  ('ai_red_team.manage', 'Manage AI red-team campaigns, findings, remediation, and release-blocking attack evidence.', 'organisation', 'manage_ai_red_team', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.security_roles (role_code, name, description, role_scope, high_privilege)
values
  ('ai_evaluation_manager', 'AI Evaluation Manager', 'Responsible for SafeSteps AI evaluation plans, validation, fairness testing, critical failures, residual risk, and release assurance.', 'organisation', true),
  ('ai_release_assurance_manager', 'AI Release Assurance Manager', 'Responsible for AI release packages, release decisions, conditional release limits, and post-release validation.', 'organisation', true)
on conflict (role_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_evaluation.manage',
  'ai_release_assurance.approve',
  'ai_independent_validation.manage',
  'ai_red_team.manage',
  'ai_audit.read'
)
where r.role_code in ('ai_evaluation_manager', 'ai_release_assurance_manager', 'ai_governance_lead')
on conflict do nothing;

insert into public.ai_critical_failure_definitions (
  failure_code,
  failure_name,
  applicable_risk_tiers,
  applicable_use_case_types,
  description,
  detection_method,
  release_blocking,
  incident_required,
  required_response,
  active
)
values
  ('cross_case_data_exposure', 'Cross-case data exposure', array['high','critical'], array['retrieval','reporting','case_summary'], 'AI output or context includes records from an unauthorised case.', 'citation and source-manifest verification plus access-audit correlation', true, true, '{"action":"block_release_and_open_incident"}'::jsonb, true),
  ('fabricated_citation', 'Fabricated citation', array['medium','high','critical'], array['court_output','reporting','evidence_summary'], 'AI output cites a source that does not exist or does not support the claim.', 'citation verifier and human evidence review', true, true, '{"action":"reject_output_and_revalidate"}'::jsonb, true),
  ('automatic_child_removal_recommendation', 'Automatic child-removal recommendation', array['critical'], array['safety','court_output'], 'AI attempts to recommend or decide child removal, placement, or legal outcome.', 'prohibited-decision scan and human review audit', true, true, '{"action":"block_output_and_escalate"}'::jsonb, true),
  ('protected_address_disclosure', 'Protected address disclosure', array['high','critical'], array['retrieval','communication','reporting'], 'AI output or tool call exposes a protected address or safety-plan location.', 'privacy leakage test and source classification audit', true, true, '{"action":"block_output_notify_privacy_lead"}'::jsonb, true),
  ('human_review_bypass', 'Mandatory human review bypass', array['high','critical'], array['workflow','release','tooling'], 'High-impact output proceeds without required human review checkpoint.', 'workflow trace and release-gate audit', true, true, '{"action":"suspend_workflow_until_reviewed"}'::jsonb, true)
on conflict (organisation_id, failure_code) do update
set failure_name = excluded.failure_name,
    applicable_risk_tiers = excluded.applicable_risk_tiers,
    applicable_use_case_types = excluded.applicable_use_case_types,
    description = excluded.description,
    detection_method = excluded.detection_method,
    release_blocking = excluded.release_blocking,
    incident_required = excluded.incident_required,
    required_response = excluded.required_response,
    active = excluded.active;
