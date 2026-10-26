create or replace function public.safesteps_can_manage_ai_learning(
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
    or public.safesteps_can_manage_ai_operations(p_user_id, p_organisation_id)
    or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'ai_learning.manage')
    or public.has_resource_permission(p_user_id, 'global', null, 'ai_learning.manage'),
    false
  );
$$;

revoke all on function public.safesteps_can_manage_ai_learning(uuid, uuid) from public;
grant execute on function public.safesteps_can_manage_ai_learning(uuid, uuid) to authenticated;

create table if not exists public.ai_feedback_channels (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  channel_code text not null,
  channel_name text not null,
  audience_type text not null check (audience_type in ('parent', 'child', 'worker', 'supervisor', 'court', 'organisation', 'system')),
  age_appropriate_required boolean not null default false,
  assisted_submission_available boolean not null default true,
  anonymity_allowed boolean not null default false,
  child_safety_review_required boolean not null default false,
  status text not null default 'active' check (status in ('draft', 'active', 'suspended', 'retired')),
  created_at timestamptz not null default now(),
  unique (organisation_id, channel_code)
);

create table if not exists public.ai_feedback_signals (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  channel_id uuid references public.ai_feedback_channels(id) on delete set null,
  signal_reference text not null unique,
  signal_source text not null check (signal_source in ('parent_feedback', 'child_feedback', 'worker_feedback', 'supervisor_feedback', 'court_feedback', 'organisation_feedback', 'self_monitoring', 'complaint', 'appeal_outcome', 'correction_request', 'satisfaction_metric', 'feature_request')),
  submitted_by uuid references auth.users(id) on delete set null,
  subject_user_id uuid references auth.users(id) on delete set null,
  use_case_id uuid references public.ai_use_cases(id) on delete set null,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete set null,
  output_lineage_record_id uuid references public.ai_output_lineage_records(id) on delete set null,
  contestability_request_id uuid references public.ai_contestability_requests(id) on delete set null,
  incident_id uuid references public.ai_incidents(id) on delete set null,
  signal_summary text not null,
  signal_payload jsonb not null default '{}'::jsonb,
  sentiment_label text check (sentiment_label is null or sentiment_label in ('positive', 'neutral', 'negative', 'mixed', 'distress', 'safety_concern')),
  severity text not null default 'low' check (severity in ('low', 'moderate', 'high', 'critical')),
  learning_relevance text not null default 'unreviewed' check (learning_relevance in ('unreviewed', 'not_relevant', 'candidate_learning', 'systemic_issue', 'requires_incident_review')),
  privacy_review_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_feedback_trends (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  trend_reference text not null unique,
  trend_period_start timestamptz not null,
  trend_period_end timestamptz not null,
  signal_source text not null,
  use_case_id uuid references public.ai_use_cases(id) on delete set null,
  population_scope jsonb not null default '{}'::jsonb,
  signal_count integer not null default 0,
  complaint_count integer not null default 0,
  appeal_count integer not null default 0,
  correction_count integer not null default 0,
  satisfaction_average numeric(5,2),
  trend_summary text not null,
  systemic_review_required boolean not null default false,
  calculated_at timestamptz not null default now()
);

create table if not exists public.ai_human_correction_learning_records (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  correction_reference text not null unique,
  correction_source text not null check (correction_source in ('edited_summary', 'rewritten_report', 'corrected_citation', 'corrected_assessment', 'changed_recommendation', 'overridden_risk_score', 'rejected_explanation', 'human_review_edit', 'appeal_outcome')),
  correction_request_id uuid references public.ai_correction_requests(id) on delete set null,
  human_edit_id uuid references public.ai_human_edits(id) on delete set null,
  override_record_id uuid references public.ai_override_records(id) on delete set null,
  review_outcome_id uuid references public.ai_review_outcomes(id) on delete set null,
  before_payload jsonb not null default '{}'::jsonb,
  after_payload jsonb not null default '{}'::jsonb,
  change_summary text not null,
  change_reason text not null,
  corrected_by uuid references auth.users(id) on delete set null,
  expertise_level text not null check (expertise_level in ('worker', 'senior_worker', 'supervisor', 'clinician', 'legal_reviewer', 'cultural_reviewer', 'independent_expert', 'governance_reviewer')),
  confidence_level text not null check (confidence_level in ('low', 'moderate', 'high', 'requires_second_review')),
  supporting_evidence jsonb not null default '[]'::jsonb,
  eligible_for_learning boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_learning_example_candidates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  candidate_reference text not null unique,
  source_signal_id uuid references public.ai_feedback_signals(id) on delete set null,
  correction_learning_record_id uuid references public.ai_human_correction_learning_records(id) on delete set null,
  candidate_type text not null check (candidate_type in ('new_example', 'corrected_example', 'archived_example', 'removed_example', 'hard_negative', 'fairness_example', 'retrieval_example', 'evaluation_example')),
  target_dataset_id uuid references public.ai_training_datasets(id) on delete set null,
  input_payload jsonb not null default '{}'::jsonb,
  expected_output_payload jsonb not null default '{}'::jsonb,
  source_payload_hash text not null,
  child_data_present boolean not null default false,
  sensitive_data_present boolean not null default true,
  proposed_weight numeric(6,3),
  status text not null default 'proposed' check (status in ('proposed', 'quality_review', 'dataset_review', 'bias_review', 'privacy_review', 'evaluation', 'approved', 'rejected', 'archived')),
  proposed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_learning_example_quality_reviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.ai_learning_example_candidates(id) on delete cascade,
  review_type text not null check (review_type in ('quality', 'deduplication', 'representativeness', 'label_accuracy', 'bias', 'privacy', 'child_data', 'legal', 'cultural')),
  outcome text not null check (outcome in ('passed', 'failed', 'needs_changes', 'waived')),
  score numeric(5,2),
  findings jsonb not null default '[]'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_dataset_improvement_batches (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  batch_reference text not null unique,
  target_dataset_id uuid not null references public.ai_training_datasets(id) on delete cascade,
  batch_type text not null check (batch_type in ('new_examples', 'corrected_examples', 'removal', 'reweighting', 'deduplication', 'representativeness_rebalance', 'bias_mitigation')),
  candidate_ids uuid[] not null default '{}'::uuid[],
  quality_review_status text not null default 'pending' check (quality_review_status in ('pending', 'passed', 'failed', 'waived')),
  bias_review_status text not null default 'pending' check (bias_review_status in ('pending', 'passed', 'failed', 'waived')),
  privacy_review_status text not null default 'pending' check (privacy_review_status in ('pending', 'passed', 'failed', 'waived')),
  approval_status text not null default 'draft' check (approval_status in ('draft', 'under_review', 'approved', 'rejected', 'applied', 'withdrawn')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_learning_approval_workflows (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  workflow_reference text not null unique,
  workflow_type text not null check (workflow_type in ('dataset_improvement', 'prompt_change', 'model_candidate', 'knowledge_base_change', 'workflow_change', 'retirement')),
  subject_type text not null,
  subject_id uuid,
  current_stage text not null default 'feedback' check (current_stage in ('feedback', 'quality_review', 'dataset_review', 'bias_assessment', 'privacy_review', 'evaluation', 'governance_approval', 'candidate_model', 'validation', 'production_release', 'completed', 'rejected')),
  automatic_retraining_prohibited boolean not null default true,
  status text not null default 'open' check (status in ('open', 'paused', 'approved', 'rejected', 'released', 'withdrawn')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_learning_approval_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.ai_learning_approval_workflows(id) on delete cascade,
  stage text not null,
  required_role text not null,
  decision text not null default 'pending' check (decision in ('pending', 'approved', 'rejected', 'changes_required', 'waived')),
  decision_reason text,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  sequence_number integer not null,
  unique (workflow_id, sequence_number)
);

create table if not exists public.ai_continuous_evaluation_schedules (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  schedule_code text not null,
  schedule_name text not null,
  evaluation_type text not null check (evaluation_type in ('weekly_regression', 'monthly_fairness', 'monthly_hallucination', 'monthly_retrieval', 'quarterly_security', 'quarterly_accessibility', 'annual_independent_validation')),
  target_type text not null check (target_type in ('model', 'prompt', 'workflow', 'provider', 'organisation', 'lesson', 'assessment', 'agent')),
  target_id uuid,
  cadence text not null,
  next_due_at timestamptz not null,
  owner_role text not null,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'retired')),
  created_at timestamptz not null default now(),
  unique (organisation_id, schedule_code)
);

create table if not exists public.ai_continuous_evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.ai_continuous_evaluation_schedules(id) on delete set null,
  evaluation_run_id uuid references public.ai_evaluation_runs(id) on delete set null,
  run_reference text not null unique,
  evaluation_type text not null,
  window_start timestamptz not null,
  window_end timestamptz not null,
  outcome text not null check (outcome in ('passed', 'warning', 'failed', 'blocked', 'cancelled')),
  critical_failure_count integer not null default 0,
  fairness_failure_count integer not null default 0,
  hallucination_failure_count integer not null default 0,
  retrieval_failure_count integer not null default 0,
  security_failure_count integer not null default 0,
  accessibility_failure_count integer not null default 0,
  revalidation_required boolean not null default false,
  completed_at timestamptz not null default now()
);

create table if not exists public.ai_model_retirement_assessments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  model_version_id uuid references public.ai_model_versions(id) on delete cascade,
  provider_id uuid references public.ai_model_providers(id) on delete set null,
  assessment_reference text not null unique,
  retirement_trigger text not null check (retirement_trigger in ('obsolete_model', 'unsupported_provider', 'security_risk', 'excessive_drift', 'repeated_incidents', 'regulatory_change', 'better_replacement_available', 'contract_end')),
  evidence jsonb not null default '{}'::jsonb,
  retirement_recommended boolean not null default false,
  rollback_required boolean not null default false,
  evidence_preservation_required boolean not null default true,
  assessed_by uuid references auth.users(id) on delete set null,
  assessed_at timestamptz not null default now()
);

create table if not exists public.ai_model_retirement_plans (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  retirement_assessment_id uuid references public.ai_model_retirement_assessments(id) on delete set null,
  model_version_id uuid references public.ai_model_versions(id) on delete cascade,
  replacement_model_version_id uuid references public.ai_model_versions(id) on delete set null,
  retirement_reference text not null unique,
  retirement_mode text not null check (retirement_mode in ('graceful', 'immediate_suspension', 'phased_replacement', 'rollback_only', 'archive_only')),
  affected_deployments jsonb not null default '[]'::jsonb,
  preservation_manifest jsonb not null default '{}'::jsonb,
  rollback_plan text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'in_progress', 'completed', 'cancelled')),
  approved_by uuid references auth.users(id) on delete set null,
  effective_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_knowledge_base_sources (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  source_code text not null,
  source_name text not null,
  source_type text not null check (source_type in ('parenting_guidance', 'legislation', 'organisation_policy', 'child_protection_practice', 'research_evidence', 'support_service', 'lesson_content')),
  owning_team text,
  authority_level text not null check (authority_level in ('internal', 'provider', 'jurisdictional', 'court', 'peer_reviewed', 'community_reviewed')),
  status text not null default 'active' check (status in ('draft', 'active', 'superseded', 'retired')),
  created_at timestamptz not null default now(),
  unique (organisation_id, source_code)
);

create table if not exists public.ai_knowledge_base_versions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.ai_knowledge_base_sources(id) on delete cascade,
  version integer not null,
  content_reference text not null,
  content_hash text not null,
  change_summary text not null,
  effective_from timestamptz not null,
  supersedes_version_id uuid references public.ai_knowledge_base_versions(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (source_id, version)
);

create table if not exists public.ai_knowledge_change_impacts (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_version_id uuid not null references public.ai_knowledge_base_versions(id) on delete cascade,
  affected_area text not null check (affected_area in ('prompt', 'retrieval_policy', 'lesson', 'assessment', 'report_template', 'workflow', 'evaluation_suite', 'support_service_directory')),
  affected_resource_id uuid,
  impact_summary text not null,
  revalidation_required boolean not null default true,
  change_request_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_prompt_evolution_records (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  prompt_template_id uuid references public.ai_prompt_templates(id) on delete set null,
  current_prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  proposed_prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  evolution_reference text not null unique,
  change_type text not null check (change_type in ('improvement', 'rejected_change', 'ab_test', 'performance_comparison', 'rollback', 'safety_update', 'accessibility_update')),
  change_summary text not null,
  performance_comparison jsonb not null default '{}'::jsonb,
  rollback_available boolean not null default true,
  approval_status text not null default 'draft' check (approval_status in ('draft', 'under_review', 'approved', 'rejected', 'released', 'rolled_back')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_change_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  change_reference text not null unique,
  change_type text not null check (change_type in ('model', 'prompt', 'workflow', 'dataset', 'knowledge_base', 'retrieval', 'tool', 'provider', 'security_control', 'monitoring_threshold')),
  proposed_change text not null,
  business_justification text not null,
  affected_systems text[] not null default '{}'::text[],
  affected_populations jsonb not null default '{}'::jsonb,
  risk_assessment_summary text not null,
  security_review_required boolean not null default true,
  privacy_review_required boolean not null default true,
  bias_assessment_required boolean not null default true,
  evaluation_plan_id uuid references public.ai_evaluation_plans(id) on delete set null,
  deployment_approval_required boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'implemented', 'rolled_back', 'closed')),
  requested_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_change_request_reviews (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.ai_change_requests(id) on delete cascade,
  review_type text not null check (review_type in ('business', 'safety', 'security', 'privacy', 'bias', 'accessibility', 'legal', 'operations', 'governance')),
  outcome text not null check (outcome in ('approved', 'rejected', 'changes_required', 'waived')),
  findings jsonb not null default '[]'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_change_deployment_gates (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.ai_change_requests(id) on delete cascade,
  gate_name text not null,
  gate_status text not null default 'pending' check (gate_status in ('pending', 'passed', 'failed', 'waived')),
  blocking boolean not null default true,
  evidence jsonb not null default '{}'::jsonb,
  evaluated_by uuid references auth.users(id) on delete set null,
  evaluated_at timestamptz,
  unique (change_request_id, gate_name)
);

create table if not exists public.ai_quality_scorecards (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  scorecard_reference text not null unique,
  scorecard_type text not null check (scorecard_type in ('model', 'prompt', 'workflow', 'provider', 'organisation', 'lesson', 'assessment', 'agent')),
  subject_id uuid,
  period_start timestamptz not null,
  period_end timestamptz not null,
  quality_score numeric(5,2),
  safety_score numeric(5,2),
  fairness_score numeric(5,2),
  explainability_score numeric(5,2),
  reliability_score numeric(5,2),
  contestability_score numeric(5,2),
  score_payload jsonb not null default '{}'::jsonb,
  status text not null default 'generated' check (status in ('generated', 'reviewed', 'action_required', 'archived')),
  generated_at timestamptz not null default now()
);

create table if not exists public.ai_longitudinal_improvement_metrics (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  metric_reference text not null unique,
  subject_type text not null check (subject_type in ('model', 'prompt', 'workflow', 'provider', 'organisation', 'lesson', 'assessment', 'agent')),
  subject_id uuid,
  metric_code text not null,
  baseline_period_start timestamptz not null,
  current_period_end timestamptz not null,
  horizon text not null check (horizon in ('1_month', '3_months', '6_months', '12_months', '24_months')),
  baseline_value numeric,
  current_value numeric,
  absolute_change numeric,
  relative_change numeric,
  improvement_direction text not null check (improvement_direction in ('improved', 'declined', 'unchanged', 'insufficient_data')),
  confidence_level text not null default 'unassessed',
  calculated_at timestamptz not null default now()
);

create table if not exists public.ai_experiment_protocols (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  experiment_reference text not null unique,
  experiment_type text not null check (experiment_type in ('ab_test', 'shadow_deployment', 'canary_release', 'phased_rollout', 'offline_replay')),
  change_request_id uuid references public.ai_change_requests(id) on delete set null,
  hypothesis text not null,
  safety_boundaries jsonb not null default '{}'::jsonb,
  affected_populations jsonb not null default '{}'::jsonb,
  approval_gate_ids uuid[] not null default '{}'::uuid[],
  rollback_triggers jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'approved', 'running', 'paused', 'completed', 'stopped', 'rolled_back')),
  approved_by uuid references auth.users(id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_experiment_results (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.ai_experiment_protocols(id) on delete cascade,
  result_window_start timestamptz not null,
  result_window_end timestamptz not null,
  variant_code text not null,
  sample_size integer not null default 0,
  performance_results jsonb not null default '{}'::jsonb,
  safety_results jsonb not null default '{}'::jsonb,
  fairness_results jsonb not null default '{}'::jsonb,
  contestability_results jsonb not null default '{}'::jsonb,
  rollback_triggered boolean not null default false,
  recommendation text not null check (recommendation in ('continue', 'expand', 'pause', 'rollback', 'reject', 'needs_more_data')),
  calculated_at timestamptz not null default now()
);

create table if not exists public.ai_learning_governance_rules (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  rule_code text not null,
  rule_name text not null,
  rule_category text not null check (rule_category in ('self_reinforcing_bias', 'feedback_loop', 'popularity_bias', 'automation_bias', 'reviewer_drift', 'organisational_bias', 'regional_bias', 'child_data', 'privacy', 'safety')),
  rule_definition jsonb not null default '{}'::jsonb,
  enforcement_level text not null check (enforcement_level in ('advisory', 'review_required', 'blocking')),
  status text not null default 'active' check (status in ('draft', 'active', 'suspended', 'retired')),
  created_at timestamptz not null default now(),
  unique (organisation_id, rule_code)
);

create table if not exists public.ai_learning_governance_findings (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  rule_id uuid references public.ai_learning_governance_rules(id) on delete set null,
  finding_reference text not null unique,
  subject_type text not null,
  subject_id uuid,
  finding_summary text not null,
  severity text not null check (severity in ('low', 'moderate', 'high', 'critical')),
  corrective_action_required boolean not null default true,
  related_change_request_id uuid references public.ai_change_requests(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'investigating', 'actioned', 'closed', 'waived')),
  detected_at timestamptz not null default now()
);

create table if not exists public.ai_reviewer_drift_assessments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  assessment_period_start timestamptz not null,
  assessment_period_end timestamptz not null,
  review_domain text not null,
  agreement_rate numeric(5,2),
  override_rate numeric(5,2),
  escalation_rate numeric(5,2),
  drift_indicators jsonb not null default '[]'::jsonb,
  retraining_or_supervision_required boolean not null default false,
  assessed_at timestamptz not null default now()
);

create table if not exists public.ai_learning_pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  pipeline_reference text not null unique,
  workflow_id uuid references public.ai_learning_approval_workflows(id) on delete set null,
  pipeline_type text not null check (pipeline_type in ('feedback_ingestion', 'quality_review', 'dataset_build', 'evaluation', 'candidate_model_validation', 'scorecard_generation', 'retirement_review')),
  run_status text not null default 'queued' check (run_status in ('queued', 'running', 'completed', 'failed', 'cancelled', 'blocked')),
  input_manifest jsonb not null default '{}'::jsonb,
  output_manifest jsonb not null default '{}'::jsonb,
  failure_reason text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_learning_audit_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  event_reference text not null unique,
  event_type text not null,
  subject_type text not null,
  subject_id uuid,
  event_summary text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  service_identity text,
  previous_hash text,
  new_hash text,
  event_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_ai_feedback_signals_org_source on public.ai_feedback_signals(organisation_id, signal_source, created_at desc);
create index if not exists idx_ai_feedback_trends_org_period on public.ai_feedback_trends(organisation_id, trend_period_start, trend_period_end);
create index if not exists idx_ai_correction_learning_org on public.ai_human_correction_learning_records(organisation_id, created_at desc);
create index if not exists idx_ai_learning_candidates_org_status on public.ai_learning_example_candidates(organisation_id, status);
create index if not exists idx_ai_dataset_batches_org_status on public.ai_dataset_improvement_batches(organisation_id, approval_status);
create index if not exists idx_ai_learning_workflows_org_stage on public.ai_learning_approval_workflows(organisation_id, current_stage, status);
create index if not exists idx_ai_eval_schedules_due on public.ai_continuous_evaluation_schedules(organisation_id, next_due_at, status);
create index if not exists idx_ai_eval_runs_schedule on public.ai_continuous_evaluation_runs(schedule_id, completed_at desc);
create index if not exists idx_ai_retirement_assessments_org on public.ai_model_retirement_assessments(organisation_id, assessed_at desc);
create index if not exists idx_ai_retirement_plans_org_status on public.ai_model_retirement_plans(organisation_id, status);
create index if not exists idx_ai_kb_sources_org_type on public.ai_knowledge_base_sources(organisation_id, source_type, status);
create index if not exists idx_ai_prompt_evolution_org_status on public.ai_prompt_evolution_records(organisation_id, approval_status);
create index if not exists idx_ai_change_requests_org_status on public.ai_change_requests(organisation_id, status, change_type);
create index if not exists idx_ai_scorecards_org_period on public.ai_quality_scorecards(organisation_id, period_start, period_end);
create index if not exists idx_ai_longitudinal_metrics_org on public.ai_longitudinal_improvement_metrics(organisation_id, subject_type, horizon);
create index if not exists idx_ai_experiments_org_status on public.ai_experiment_protocols(organisation_id, status);
create index if not exists idx_ai_learning_findings_org_status on public.ai_learning_governance_findings(organisation_id, status, severity);
create index if not exists idx_ai_learning_audit_org_time on public.ai_learning_audit_events(organisation_id, occurred_at desc);

grant select, insert, update, delete on
  public.ai_feedback_channels,
  public.ai_feedback_signals,
  public.ai_feedback_trends,
  public.ai_human_correction_learning_records,
  public.ai_learning_example_candidates,
  public.ai_learning_example_quality_reviews,
  public.ai_dataset_improvement_batches,
  public.ai_learning_approval_workflows,
  public.ai_learning_approval_steps,
  public.ai_continuous_evaluation_schedules,
  public.ai_continuous_evaluation_runs,
  public.ai_model_retirement_assessments,
  public.ai_model_retirement_plans,
  public.ai_knowledge_base_sources,
  public.ai_knowledge_base_versions,
  public.ai_knowledge_change_impacts,
  public.ai_prompt_evolution_records,
  public.ai_change_requests,
  public.ai_change_request_reviews,
  public.ai_change_deployment_gates,
  public.ai_quality_scorecards,
  public.ai_longitudinal_improvement_metrics,
  public.ai_experiment_protocols,
  public.ai_experiment_results,
  public.ai_learning_governance_rules,
  public.ai_learning_governance_findings,
  public.ai_reviewer_drift_assessments,
  public.ai_learning_pipeline_runs,
  public.ai_learning_audit_events
to authenticated;

alter table public.ai_feedback_channels enable row level security;
alter table public.ai_feedback_signals enable row level security;
alter table public.ai_feedback_trends enable row level security;
alter table public.ai_human_correction_learning_records enable row level security;
alter table public.ai_learning_example_candidates enable row level security;
alter table public.ai_learning_example_quality_reviews enable row level security;
alter table public.ai_dataset_improvement_batches enable row level security;
alter table public.ai_learning_approval_workflows enable row level security;
alter table public.ai_learning_approval_steps enable row level security;
alter table public.ai_continuous_evaluation_schedules enable row level security;
alter table public.ai_continuous_evaluation_runs enable row level security;
alter table public.ai_model_retirement_assessments enable row level security;
alter table public.ai_model_retirement_plans enable row level security;
alter table public.ai_knowledge_base_sources enable row level security;
alter table public.ai_knowledge_base_versions enable row level security;
alter table public.ai_knowledge_change_impacts enable row level security;
alter table public.ai_prompt_evolution_records enable row level security;
alter table public.ai_change_requests enable row level security;
alter table public.ai_change_request_reviews enable row level security;
alter table public.ai_change_deployment_gates enable row level security;
alter table public.ai_quality_scorecards enable row level security;
alter table public.ai_longitudinal_improvement_metrics enable row level security;
alter table public.ai_experiment_protocols enable row level security;
alter table public.ai_experiment_results enable row level security;
alter table public.ai_learning_governance_rules enable row level security;
alter table public.ai_learning_governance_findings enable row level security;
alter table public.ai_reviewer_drift_assessments enable row level security;
alter table public.ai_learning_pipeline_runs enable row level security;
alter table public.ai_learning_audit_events enable row level security;

create policy "AI feedback channels managed by learning admins" on public.ai_feedback_channels for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI feedback signals managed by learning admins or submitter" on public.ai_feedback_signals for all to authenticated using (submitted_by = auth.uid() or public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (submitted_by = auth.uid() or public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI feedback trends managed by learning admins" on public.ai_feedback_trends for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI correction learning managed by learning admins" on public.ai_human_correction_learning_records for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI learning candidates managed by learning admins" on public.ai_learning_example_candidates for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI dataset improvement batches managed by learning admins" on public.ai_dataset_improvement_batches for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI learning workflows managed by learning admins" on public.ai_learning_approval_workflows for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI evaluation schedules managed by learning admins" on public.ai_continuous_evaluation_schedules for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI retirement assessments managed by learning admins" on public.ai_model_retirement_assessments for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI retirement plans managed by learning admins" on public.ai_model_retirement_plans for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI knowledge sources managed by learning admins" on public.ai_knowledge_base_sources for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI prompt evolution managed by learning admins" on public.ai_prompt_evolution_records for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI change requests managed by learning admins or requester" on public.ai_change_requests for all to authenticated using (requested_by = auth.uid() or public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (requested_by = auth.uid() or public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI quality scorecards managed by learning admins" on public.ai_quality_scorecards for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI longitudinal metrics managed by learning admins" on public.ai_longitudinal_improvement_metrics for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI experiments managed by learning admins" on public.ai_experiment_protocols for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI learning rules managed by learning admins" on public.ai_learning_governance_rules for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI learning findings managed by learning admins" on public.ai_learning_governance_findings for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI reviewer drift managed by learning admins" on public.ai_reviewer_drift_assessments for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI learning pipeline runs managed by learning admins" on public.ai_learning_pipeline_runs for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));

create policy "AI learning quality reviews managed through candidate" on public.ai_learning_example_quality_reviews for all to authenticated using (exists (select 1 from public.ai_learning_example_candidates c where c.id = candidate_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_learning_example_candidates c where c.id = candidate_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id)));
create policy "AI learning approval steps managed through workflow" on public.ai_learning_approval_steps for all to authenticated using (exists (select 1 from public.ai_learning_approval_workflows w where w.id = workflow_id and public.safesteps_can_manage_ai_learning(auth.uid(), w.organisation_id))) with check (exists (select 1 from public.ai_learning_approval_workflows w where w.id = workflow_id and public.safesteps_can_manage_ai_learning(auth.uid(), w.organisation_id)));
create policy "AI continuous evaluation runs managed through schedule" on public.ai_continuous_evaluation_runs for all to authenticated using (exists (select 1 from public.ai_continuous_evaluation_schedules s where s.id = schedule_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_continuous_evaluation_schedules s where s.id = schedule_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id)));
create policy "AI knowledge versions managed through source" on public.ai_knowledge_base_versions for all to authenticated using (exists (select 1 from public.ai_knowledge_base_sources s where s.id = source_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_knowledge_base_sources s where s.id = source_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id)));
create policy "AI knowledge impacts managed through version" on public.ai_knowledge_change_impacts for all to authenticated using (exists (select 1 from public.ai_knowledge_base_versions v join public.ai_knowledge_base_sources s on s.id = v.source_id where v.id = knowledge_base_version_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_knowledge_base_versions v join public.ai_knowledge_base_sources s on s.id = v.source_id where v.id = knowledge_base_version_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id)));
create policy "AI change reviews managed through request" on public.ai_change_request_reviews for all to authenticated using (exists (select 1 from public.ai_change_requests cr where cr.id = change_request_id and public.safesteps_can_manage_ai_learning(auth.uid(), cr.organisation_id))) with check (exists (select 1 from public.ai_change_requests cr where cr.id = change_request_id and public.safesteps_can_manage_ai_learning(auth.uid(), cr.organisation_id)));
create policy "AI change gates managed through request" on public.ai_change_deployment_gates for all to authenticated using (exists (select 1 from public.ai_change_requests cr where cr.id = change_request_id and public.safesteps_can_manage_ai_learning(auth.uid(), cr.organisation_id))) with check (exists (select 1 from public.ai_change_requests cr where cr.id = change_request_id and public.safesteps_can_manage_ai_learning(auth.uid(), cr.organisation_id)));
create policy "AI experiment results managed through experiment" on public.ai_experiment_results for all to authenticated using (exists (select 1 from public.ai_experiment_protocols e where e.id = experiment_id and public.safesteps_can_manage_ai_learning(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_experiment_protocols e where e.id = experiment_id and public.safesteps_can_manage_ai_learning(auth.uid(), e.organisation_id)));
create policy "AI learning audit readable by learning admins" on public.ai_learning_audit_events for select to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id) or public.has_resource_permission(auth.uid(), 'global', null, 'ai_audit.read'));
create policy "AI learning audit appendable by actor" on public.ai_learning_audit_events for insert to authenticated with check (actor_user_id = auth.uid() or public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));

create or replace function public.ai_learning_workflow_ready_for_governance(
  p_workflow_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_learning_approval_workflows w
    where w.id = p_workflow_id
      and w.automatic_retraining_prohibited = true
      and w.status = 'open'
      and not exists (
        select 1
        from public.ai_learning_approval_steps s
        where s.workflow_id = w.id
          and s.stage in ('quality_review', 'dataset_review', 'bias_assessment', 'privacy_review', 'evaluation')
          and s.decision not in ('approved', 'waived')
      )
  );
$$;

create or replace function public.can_include_ai_learning_candidate(
  p_candidate_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_learning_example_candidates c
    where c.id = p_candidate_id
      and c.status = 'approved'
      and not exists (
        select 1
        from public.ai_learning_example_quality_reviews r
        where r.candidate_id = c.id
          and r.outcome = 'failed'
      )
      and exists (
        select 1
        from public.ai_learning_example_quality_reviews r
        where r.candidate_id = c.id
          and r.review_type = 'privacy'
          and r.outcome in ('passed', 'waived')
      )
      and exists (
        select 1
        from public.ai_learning_example_quality_reviews r
        where r.candidate_id = c.id
          and r.review_type = 'bias'
          and r.outcome in ('passed', 'waived')
      )
  );
$$;

create or replace function public.can_approve_ai_change_request(
  p_change_request_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_change_requests cr
    where cr.id = p_change_request_id
      and cr.status in ('submitted', 'under_review')
      and not exists (
        select 1
        from public.ai_change_request_reviews rr
        where rr.change_request_id = cr.id
          and rr.outcome in ('rejected', 'changes_required')
      )
      and not exists (
        select 1
        from public.ai_change_deployment_gates g
        where g.change_request_id = cr.id
          and g.blocking = true
          and g.gate_status <> 'passed'
      )
  );
$$;

create or replace function public.should_block_ai_experiment(
  p_experiment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_experiment_protocols e
    where e.id = p_experiment_id
      and (
        e.status not in ('approved', 'running')
        or exists (
          select 1
          from public.ai_experiment_results r
          where r.experiment_id = e.id
            and (r.rollback_triggered = true or r.recommendation in ('pause', 'rollback', 'reject'))
        )
      )
  );
$$;

create or replace function public.ai_model_retirement_required(
  p_model_version_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_model_retirement_assessments a
    where a.model_version_id = p_model_version_id
      and a.retirement_recommended = true
      and a.retirement_trigger in ('unsupported_provider', 'security_risk', 'excessive_drift', 'repeated_incidents', 'regulatory_change')
  );
$$;

create or replace function public.ai_knowledge_change_requires_revalidation(
  p_knowledge_base_version_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_knowledge_change_impacts i
    where i.knowledge_base_version_id = p_knowledge_base_version_id
      and i.revalidation_required = true
  );
$$;

create or replace function public.ai_learning_has_blocking_governance_finding(
  p_subject_type text,
  p_subject_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_learning_governance_findings f
    where f.subject_type = p_subject_type
      and f.subject_id = p_subject_id
      and f.status in ('open', 'investigating')
      and f.severity in ('high', 'critical')
  );
$$;

create or replace function public.ai_continuous_evaluation_overdue_count(
  p_organisation_id uuid
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.ai_continuous_evaluation_schedules s
  where s.organisation_id = p_organisation_id
    and s.status = 'active'
    and s.next_due_at < now();
$$;

create or replace function public.ai_change_request_open_blocking_gate_count(
  p_change_request_id uuid
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.ai_change_deployment_gates g
  where g.change_request_id = p_change_request_id
    and g.blocking = true
    and g.gate_status not in ('passed', 'waived');
$$;

create or replace function public.can_release_ai_learning_change(
  p_change_request_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_approve_ai_change_request(p_change_request_id)
    and not public.ai_learning_has_blocking_governance_finding('change_request', p_change_request_id);
$$;

revoke all on function public.ai_learning_workflow_ready_for_governance(uuid) from public;
revoke all on function public.can_include_ai_learning_candidate(uuid) from public;
revoke all on function public.can_approve_ai_change_request(uuid) from public;
revoke all on function public.should_block_ai_experiment(uuid) from public;
revoke all on function public.ai_model_retirement_required(uuid) from public;
revoke all on function public.ai_knowledge_change_requires_revalidation(uuid) from public;
revoke all on function public.ai_learning_has_blocking_governance_finding(text, uuid) from public;
revoke all on function public.ai_continuous_evaluation_overdue_count(uuid) from public;
revoke all on function public.ai_change_request_open_blocking_gate_count(uuid) from public;
revoke all on function public.can_release_ai_learning_change(uuid) from public;

grant execute on function public.ai_learning_workflow_ready_for_governance(uuid) to authenticated;
grant execute on function public.can_include_ai_learning_candidate(uuid) to authenticated;
grant execute on function public.can_approve_ai_change_request(uuid) to authenticated;
grant execute on function public.should_block_ai_experiment(uuid) to authenticated;
grant execute on function public.ai_model_retirement_required(uuid) to authenticated;
grant execute on function public.ai_knowledge_change_requires_revalidation(uuid) to authenticated;
grant execute on function public.ai_learning_has_blocking_governance_finding(text, uuid) to authenticated;
grant execute on function public.ai_continuous_evaluation_overdue_count(uuid) to authenticated;
grant execute on function public.ai_change_request_open_blocking_gate_count(uuid) to authenticated;
grant execute on function public.can_release_ai_learning_change(uuid) to authenticated;

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_learning.manage', 'Manage AI continuous learning, safe improvement, change requests, experiments, scorecards, and retirement workflows.', 'organisation', 'manage_ai_learning', 'high_impact'),
  ('ai_change.approve', 'Approve AI model, prompt, workflow, dataset, knowledge-base, provider, monitoring, and security-control changes after required reviews.', 'organisation', 'approve_ai_change', 'high_impact'),
  ('ai_experiment.manage', 'Manage AI controlled experiments, canary releases, shadow deployments, rollback triggers, and safe rollout protocols.', 'organisation', 'manage_ai_experiment', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.security_roles (role_code, name, description, role_scope, high_privilege)
values
  ('ai_learning_manager', 'AI Learning Manager', 'Responsible for controlled learning, dataset improvement, change management, experiments, scorecards, and retirement decisions.', 'organisation', true)
on conflict (role_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_learning.manage',
  'ai_change.approve',
  'ai_experiment.manage',
  'ai_operations.manage',
  'ai_audit.read'
)
where r.role_code = 'ai_learning_manager'
on conflict do nothing;

insert into public.ai_learning_governance_rules (rule_code, rule_name, rule_category, rule_definition, enforcement_level, status)
values
  ('no_automatic_retraining', 'No automatic production retraining', 'safety', '{"rule":"feedback may not update production models without staged approval"}'::jsonb, 'blocking', 'active'),
  ('block_feedback_loop_bias', 'Block feedback-loop bias', 'feedback_loop', '{"rule":"learning batches must review whether previous AI outputs created the feedback being learned from"}'::jsonb, 'blocking', 'active'),
  ('child_data_learning_review', 'Child-data learning review', 'child_data', '{"rule":"child data cannot enter learning datasets without consent, minimisation, de-identification and governance approval"}'::jsonb, 'blocking', 'active'),
  ('reviewer_drift_monitoring', 'Reviewer drift monitoring', 'reviewer_drift', '{"rule":"material reviewer disagreement or override shifts require supervision review"}'::jsonb, 'review_required', 'active')
on conflict (organisation_id, rule_code) do nothing;
