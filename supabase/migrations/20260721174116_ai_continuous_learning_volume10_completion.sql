create table if not exists public.ai_learning_governance_policies (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  policy_code text not null,
  policy_version integer not null,
  policy_name text not null,
  description text not null,
  applicable_use_case_ids uuid[] not null default '{}'::uuid[],
  applicable_risk_tiers text[] not null default '{}'::text[],
  permitted_learning_modes text[] not null,
  prohibited_learning_modes text[] not null,
  human_validation_required boolean not null default true,
  privacy_review_required boolean not null default true,
  fairness_review_required boolean not null default true,
  child_safety_review_required boolean not null default false,
  minimum_evaluation_requirements jsonb not null default '{}'::jsonb,
  minimum_approval_roles text[] not null default '{}'::text[],
  production_self_learning_prohibited boolean not null default true,
  automatic_dataset_inclusion_prohibited boolean not null default true,
  lifecycle_status text not null default 'draft' check (lifecycle_status in ('draft', 'approved', 'active', 'suspended', 'retired')),
  effective_from timestamptz,
  expires_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organisation_id, policy_code, policy_version)
);

create table if not exists public.ai_learning_signals (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  signal_reference text not null unique,
  signal_type text not null,
  signal_source_type text not null,
  signal_source_reference text,
  ai_use_case_id uuid references public.ai_use_cases(id) on delete set null,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete set null,
  case_reference text,
  signal_summary text not null,
  signal_details jsonb not null default '{}'::jsonb,
  affected_output_paths text[] not null default '{}'::text[],
  affected_population_scope jsonb not null default '{}'::jsonb,
  severity text not null default 'low' check (severity in ('low', 'moderate', 'high', 'critical')),
  confidence_in_signal text not null default 'unverified' check (confidence_in_signal in ('unverified', 'reported', 'partially_verified', 'verified', 'disputed')),
  contains_personal_information boolean not null default false,
  contains_child_information boolean not null default false,
  contains_sensitive_information boolean not null default false,
  learning_use_authorised boolean not null default false,
  current_status text not null default 'received' check (current_status in ('received', 'triaged', 'excluded', 'candidate_created', 'closed', 'incident_referred')),
  received_at timestamptz not null default now(),
  triaged_at timestamptz,
  closed_at timestamptz
);

create table if not exists public.ai_learning_signal_triage (
  id uuid primary key default gen_random_uuid(),
  learning_signal_id uuid not null references public.ai_learning_signals(id) on delete cascade,
  signal_validity text not null check (signal_validity in ('valid', 'partially_valid', 'invalid', 'unverifiable', 'duplicate')),
  signal_materiality text not null check (signal_materiality in ('low', 'moderate', 'high', 'critical')),
  immediate_safety_issue boolean not null default false,
  incident_creation_required boolean not null default false,
  correction_required boolean not null default false,
  monitoring_alert_required boolean not null default false,
  potential_learning_target_types text[] not null default '{}'::text[],
  privacy_risk text not null,
  child_safety_risk text not null,
  fairness_risk text not null,
  security_risk text not null,
  eligible_for_learning_review boolean not null default false,
  exclusion_reason text,
  triaged_by uuid references auth.users(id) on delete set null,
  triaged_at timestamptz not null default now()
);

create table if not exists public.ai_feedback_records (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  feedback_reference text not null unique,
  output_lineage_record_id uuid references public.ai_output_lineage_records(id) on delete set null,
  explanation_id uuid references public.ai_explanations(id) on delete set null,
  submitted_by_user_id uuid references auth.users(id) on delete set null,
  submitter_role text not null,
  feedback_category text not null,
  feedback_text text,
  rating_accuracy integer check (rating_accuracy is null or rating_accuracy between 1 and 5),
  rating_clarity integer check (rating_clarity is null or rating_clarity between 1 and 5),
  rating_fairness integer check (rating_fairness is null or rating_fairness between 1 and 5),
  rating_helpfulness integer check (rating_helpfulness is null or rating_helpfulness between 1 and 5),
  rating_safety integer check (rating_safety is null or rating_safety between 1 and 5),
  source_evidence_reviewed boolean,
  correction_requested boolean not null default false,
  appeal_related boolean not null default false,
  learning_consent_status text not null default 'not_assessed',
  privacy_screen_status text not null default 'pending',
  verification_status text not null default 'unverified',
  submitted_at timestamptz not null default now()
);

create table if not exists public.ai_child_feedback_controls (
  id uuid primary key default gen_random_uuid(),
  feedback_record_id uuid not null references public.ai_feedback_records(id) on delete cascade,
  child_id uuid,
  developmental_format text not null,
  child_understood_purpose boolean,
  trusted_adult_support_used boolean not null default false,
  sharing_preference text not null default 'child_only' check (sharing_preference in ('child_only', 'worker_only', 'safe_adult', 'parent_allowed', 'do_not_share')),
  parent_access_permitted boolean not null default false,
  worker_access_permitted boolean not null default false,
  learning_use_prohibited boolean not null default true,
  deidentification_required boolean not null default true,
  child_safety_review_status text not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz
);

create table if not exists public.ai_learning_corrections (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  correction_reference text not null unique,
  source_human_edit_id uuid references public.ai_human_edits(id) on delete set null,
  source_override_id uuid references public.ai_override_records(id) on delete set null,
  source_correction_request_id uuid references public.ai_correction_requests(id) on delete set null,
  output_lineage_record_id uuid references public.ai_output_lineage_records(id) on delete set null,
  original_value jsonb,
  corrected_value jsonb,
  correction_category text not null,
  correction_reason text not null,
  supporting_evidence_references jsonb not null default '[]'::jsonb,
  corrector_user_id uuid references auth.users(id) on delete set null,
  corrector_role text,
  corrector_qualification_reference text,
  independently_verified boolean not null default false,
  verification_outcome text,
  eligible_for_dataset_use boolean not null default false,
  eligible_for_prompt_use boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_learning_correction_reviews (
  id uuid primary key default gen_random_uuid(),
  learning_correction_id uuid not null references public.ai_learning_corrections(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  reviewer_role text not null,
  evidence_supports_correction boolean,
  policy_supports_correction boolean,
  correction_generalises boolean,
  correction_context_specific boolean,
  potential_bias_detected boolean not null default false,
  reviewer_disagreement_detected boolean not null default false,
  review_outcome text not null check (review_outcome in ('approved', 'approved_context_specific', 'rejected', 'needs_second_review', 'excluded_from_learning')),
  review_notes text,
  approved_learning_targets text[] not null default '{}'::text[],
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_learning_candidates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  candidate_reference text not null unique,
  candidate_type text not null,
  title text not null,
  description text not null,
  ai_use_case_id uuid references public.ai_use_cases(id) on delete set null,
  source_signal_ids uuid[] not null default '{}'::uuid[],
  source_correction_ids uuid[] not null default '{}'::uuid[],
  source_incident_ids uuid[] not null default '{}'::uuid[],
  source_monitoring_alert_ids uuid[] not null default '{}'::uuid[],
  proposed_change_scope jsonb not null default '{}'::jsonb,
  expected_benefit text not null,
  potential_harms jsonb not null default '[]'::jsonb,
  affected_populations jsonb not null default '{}'::jsonb,
  affected_languages text[] not null default '{}'::text[],
  risk_tier text not null,
  urgency text not null default 'standard' check (urgency in ('low', 'standard', 'priority', 'urgent')),
  current_status text not null default 'proposed' check (current_status in ('proposed', 'under_review', 'approved', 'rejected', 'change_request_created', 'closed')),
  proposed_by uuid references auth.users(id) on delete set null,
  proposed_at timestamptz not null default now()
);

create table if not exists public.ai_learning_candidate_reviews (
  id uuid primary key default gen_random_uuid(),
  learning_candidate_id uuid not null references public.ai_learning_candidates(id) on delete cascade,
  review_type text not null,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  reviewer_role text not null,
  review_findings jsonb not null default '{}'::jsonb,
  blocking_issues jsonb not null default '[]'::jsonb,
  required_conditions jsonb not null default '[]'::jsonb,
  review_outcome text not null check (review_outcome in ('approved', 'rejected', 'changes_required', 'waived')),
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_dataset_change_sets (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  change_set_reference text not null unique,
  dataset_id uuid not null references public.ai_training_datasets(id) on delete cascade,
  source_dataset_version_reference text,
  proposed_dataset_version_label text not null,
  change_type text not null,
  change_summary text not null,
  source_learning_candidate_ids uuid[] not null default '{}'::uuid[],
  proposed_addition_count integer not null default 0,
  proposed_removal_count integer not null default 0,
  proposed_relabel_count integer not null default 0,
  privacy_review_status text not null default 'pending',
  licensing_review_status text not null default 'pending',
  fairness_review_status text not null default 'pending',
  quality_review_status text not null default 'pending',
  poisoning_review_status text not null default 'pending',
  current_status text not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_dataset_change_items (
  id uuid primary key default gen_random_uuid(),
  dataset_change_set_id uuid not null references public.ai_dataset_change_sets(id) on delete cascade,
  change_action text not null check (change_action in ('add', 'remove', 'relabel', 'reweight', 'archive')),
  source_resource_type text,
  source_resource_reference text,
  existing_dataset_record_id uuid references public.ai_dataset_records(id) on delete set null,
  proposed_content_reference text,
  proposed_content_hash text,
  proposed_label jsonb,
  previous_label jsonb,
  subgroup_metadata jsonb not null default '{}'::jsonb,
  language_code text,
  deidentification_status text not null default 'pending',
  duplication_status text not null default 'pending',
  quality_status text not null default 'pending',
  poisoning_status text not null default 'pending',
  human_review_count integer not null default 0,
  disagreement_status text not null default 'none',
  inclusion_status text not null default 'pending'
);

create table if not exists public.ai_dataset_representativeness_reviews (
  id uuid primary key default gen_random_uuid(),
  dataset_change_set_id uuid not null references public.ai_dataset_change_sets(id) on delete cascade,
  baseline_population_profile jsonb not null default '{}'::jsonb,
  proposed_population_profile jsonb not null default '{}'::jsonb,
  underrepresented_groups jsonb not null default '[]'::jsonb,
  overrepresented_groups jsonb not null default '[]'::jsonb,
  language_distribution jsonb not null default '{}'::jsonb,
  source_distribution jsonb not null default '{}'::jsonb,
  outcome_distribution jsonb not null default '{}'::jsonb,
  representation_risks jsonb not null default '[]'::jsonb,
  mitigation_actions jsonb not null default '[]'::jsonb,
  review_outcome text not null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_influenced_data_records (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  source_resource_type text not null,
  source_resource_id uuid,
  source_resource_reference text,
  source_resource_version integer,
  influencing_ai_output_ids uuid[] not null default '{}'::uuid[],
  influencing_explanation_ids uuid[] not null default '{}'::uuid[],
  influence_type text not null,
  influence_materiality text not null check (influence_materiality in ('low', 'moderate', 'high', 'critical')),
  human_independent_verification boolean not null default false,
  prohibited_from_training boolean not null default true,
  prohibited_from_evaluation boolean not null default true,
  restriction_reason text not null,
  identified_at timestamptz not null default now()
);

create table if not exists public.ai_knowledge_change_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  change_reference text not null unique,
  knowledge_source_id uuid references public.ai_knowledge_base_sources(id) on delete set null,
  change_type text not null,
  proposed_content_reference text not null,
  proposed_content_hash text not null,
  reason_for_change text not null,
  legal_or_policy_basis text,
  status text not null default 'draft',
  requested_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_knowledge_source_reviews (
  id uuid primary key default gen_random_uuid(),
  knowledge_change_request_id uuid not null references public.ai_knowledge_change_requests(id) on delete cascade,
  review_type text not null check (review_type in ('legal', 'practice', 'research', 'cultural', 'accessibility', 'safety', 'retrieval')),
  outcome text not null check (outcome in ('approved', 'rejected', 'changes_required', 'waived')),
  findings jsonb not null default '[]'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_knowledge_supersession_records (
  id uuid primary key default gen_random_uuid(),
  previous_knowledge_version_id uuid references public.ai_knowledge_base_versions(id) on delete set null,
  replacement_knowledge_version_id uuid references public.ai_knowledge_base_versions(id) on delete set null,
  supersession_reason text not null,
  affected_retrieval_indexes text[] not null default '{}'::text[],
  reindex_required boolean not null default true,
  revalidation_required boolean not null default true,
  recorded_at timestamptz not null default now()
);

create table if not exists public.ai_prompt_change_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  change_reference text not null unique,
  prompt_template_id uuid references public.ai_prompt_templates(id) on delete set null,
  current_prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  proposed_prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  source_learning_candidate_id uuid references public.ai_learning_candidates(id) on delete set null,
  change_summary text not null,
  safety_rationale text not null,
  status text not null default 'draft',
  requested_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_prompt_comparison_tests (
  id uuid primary key default gen_random_uuid(),
  prompt_change_request_id uuid not null references public.ai_prompt_change_requests(id) on delete cascade,
  baseline_prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  candidate_prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  test_suite_reference text not null,
  performance_delta jsonb not null default '{}'::jsonb,
  safety_delta jsonb not null default '{}'::jsonb,
  fairness_delta jsonb not null default '{}'::jsonb,
  language_delta jsonb not null default '{}'::jsonb,
  outcome text not null check (outcome in ('passed', 'failed', 'warning', 'inconclusive')),
  tested_at timestamptz not null default now()
);

create table if not exists public.ai_prompt_rollbacks (
  id uuid primary key default gen_random_uuid(),
  prompt_change_request_id uuid references public.ai_prompt_change_requests(id) on delete set null,
  rollback_reference text not null unique,
  rollback_from_prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  rollback_to_prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  rollback_reason text not null,
  executed_by uuid references auth.users(id) on delete set null,
  executed_at timestamptz not null default now()
);

create table if not exists public.ai_workflow_change_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  change_reference text not null unique,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete set null,
  proposed_workflow_manifest jsonb not null default '{}'::jsonb,
  human_review_change boolean not null default false,
  tool_permission_change boolean not null default false,
  change_summary text not null,
  risk_summary text not null,
  status text not null default 'draft',
  requested_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_change_impact_assessments (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.ai_change_requests(id) on delete cascade,
  impact_type text not null check (impact_type in ('safety', 'privacy', 'fairness', 'security', 'child_rights', 'court_reporting', 'operations', 'cost', 'accessibility')),
  impact_summary text not null,
  affected_populations jsonb not null default '{}'::jsonb,
  risk_level text not null check (risk_level in ('low', 'moderate', 'high', 'critical')),
  mitigation_required boolean not null default false,
  mitigation_plan text,
  assessed_by uuid references auth.users(id) on delete set null,
  assessed_at timestamptz not null default now()
);

create table if not exists public.ai_change_approvals (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.ai_change_requests(id) on delete cascade,
  approval_role text not null,
  approval_decision text not null check (approval_decision in ('approved', 'rejected', 'conditions_required', 'withdrawn')),
  conditions jsonb not null default '[]'::jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz not null default now()
);

create table if not exists public.ai_change_evaluation_plans (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.ai_change_requests(id) on delete cascade,
  evaluation_plan_id uuid references public.ai_evaluation_plans(id) on delete set null,
  required_regression_suites text[] not null default '{}'::text[],
  required_fairness_checks text[] not null default '{}'::text[],
  required_security_checks text[] not null default '{}'::text[],
  minimum_pass_criteria jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_controlled_experiments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  experiment_reference text not null unique,
  experiment_type text not null check (experiment_type in ('ab_test', 'shadow_deployment', 'canary_release', 'phased_rollout', 'offline_replay')),
  change_request_id uuid references public.ai_change_requests(id) on delete set null,
  experiment_protocol_id uuid references public.ai_experiment_protocols(id) on delete set null,
  safety_boundaries jsonb not null default '{}'::jsonb,
  stopping_rules jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  approved_by uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.ai_experiment_assignments (
  id uuid primary key default gen_random_uuid(),
  controlled_experiment_id uuid not null references public.ai_controlled_experiments(id) on delete cascade,
  assignment_reference text not null unique,
  subject_reference_hash text not null,
  variant_code text not null,
  assignment_method text not null,
  assigned_at timestamptz not null default now()
);

create table if not exists public.ai_experiment_safety_events (
  id uuid primary key default gen_random_uuid(),
  controlled_experiment_id uuid not null references public.ai_controlled_experiments(id) on delete cascade,
  event_reference text not null unique,
  event_type text not null,
  severity text not null check (severity in ('low', 'moderate', 'high', 'critical')),
  event_summary text not null,
  stopping_rule_triggered boolean not null default false,
  rollback_required boolean not null default false,
  detected_at timestamptz not null default now()
);

create table if not exists public.ai_shadow_deployments (
  id uuid primary key default gen_random_uuid(),
  controlled_experiment_id uuid references public.ai_controlled_experiments(id) on delete set null,
  shadow_reference text not null unique,
  baseline_model_version_id uuid references public.ai_model_versions(id) on delete set null,
  candidate_model_version_id uuid references public.ai_model_versions(id) on delete set null,
  write_to_case_records_allowed boolean not null default false,
  consequential_tool_execution_allowed boolean not null default false,
  comparison_manifest jsonb not null default '{}'::jsonb,
  status text not null default 'planned',
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.ai_shadow_comparison_results (
  id uuid primary key default gen_random_uuid(),
  shadow_deployment_id uuid not null references public.ai_shadow_deployments(id) on delete cascade,
  result_reference text not null unique,
  sample_count integer not null default 0,
  performance_comparison jsonb not null default '{}'::jsonb,
  safety_comparison jsonb not null default '{}'::jsonb,
  fairness_comparison jsonb not null default '{}'::jsonb,
  recommendation text not null,
  calculated_at timestamptz not null default now()
);

create table if not exists public.ai_canary_releases (
  id uuid primary key default gen_random_uuid(),
  controlled_experiment_id uuid references public.ai_controlled_experiments(id) on delete set null,
  canary_reference text not null unique,
  change_request_id uuid references public.ai_change_requests(id) on delete set null,
  rollout_scope jsonb not null default '{}'::jsonb,
  max_traffic_percentage numeric(5,2) not null default 0,
  rollback_triggers jsonb not null default '[]'::jsonb,
  status text not null default 'planned',
  approved_by uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.ai_canary_release_stages (
  id uuid primary key default gen_random_uuid(),
  canary_release_id uuid not null references public.ai_canary_releases(id) on delete cascade,
  stage_number integer not null,
  traffic_percentage numeric(5,2) not null,
  entry_criteria jsonb not null default '{}'::jsonb,
  exit_criteria jsonb not null default '{}'::jsonb,
  stage_status text not null default 'planned',
  started_at timestamptz,
  completed_at timestamptz,
  unique (canary_release_id, stage_number)
);

create table if not exists public.ai_change_rollback_plans (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.ai_change_requests(id) on delete cascade,
  rollback_reference text not null unique,
  rollback_scope jsonb not null default '{}'::jsonb,
  restore_prompt_versions uuid[] not null default '{}'::uuid[],
  restore_workflow_manifest jsonb not null default '{}'::jsonb,
  restore_tool_permissions jsonb not null default '{}'::jsonb,
  restore_monitoring_thresholds jsonb not null default '{}'::jsonb,
  rollback_tested boolean not null default false,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_change_release_decisions (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.ai_change_requests(id) on delete cascade,
  decision_reference text not null unique,
  decision text not null check (decision in ('release', 'release_with_conditions', 'reject', 'rollback', 'defer')),
  rationale text not null,
  release_conditions jsonb not null default '[]'::jsonb,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz not null default now()
);

create table if not exists public.ai_change_post_release_reviews (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.ai_change_requests(id) on delete cascade,
  review_period_start timestamptz not null,
  review_period_end timestamptz not null,
  outcome_summary text not null,
  safety_regression_detected boolean not null default false,
  subgroup_deterioration_detected boolean not null default false,
  rollback_recommended boolean not null default false,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_longitudinal_quality_snapshots (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  snapshot_reference text not null unique,
  subject_type text not null,
  subject_id uuid,
  snapshot_period_start timestamptz not null,
  snapshot_period_end timestamptz not null,
  horizon text not null check (horizon in ('1_month', '3_months', '6_months', '12_months', '24_months')),
  quality_payload jsonb not null default '{}'::jsonb,
  complaint_trend jsonb not null default '{}'::jsonb,
  appeal_trend jsonb not null default '{}'::jsonb,
  correction_trend jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

create table if not exists public.ai_improvement_scorecards (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  scorecard_reference text not null unique,
  subject_type text not null,
  subject_id uuid,
  improvement_score numeric(5,2),
  safety_regression_count integer not null default 0,
  fairness_regression_count integer not null default 0,
  rollback_count integer not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

create table if not exists public.ai_learning_contamination_findings (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  finding_reference text not null unique,
  contamination_type text not null check (contamination_type in ('evaluation_leakage', 'ai_output_as_ground_truth', 'feedback_loop', 'duplicate_train_test', 'prompt_example_leakage')),
  affected_dataset_id uuid references public.ai_training_datasets(id) on delete set null,
  affected_change_set_id uuid references public.ai_dataset_change_sets(id) on delete set null,
  severity text not null check (severity in ('low', 'moderate', 'high', 'critical')),
  release_impact_assessment_required boolean not null default true,
  finding_summary text not null,
  status text not null default 'open',
  detected_at timestamptz not null default now()
);

create table if not exists public.ai_model_improvement_projects (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  project_reference text not null unique,
  project_name text not null,
  ai_use_case_id uuid references public.ai_use_cases(id) on delete cascade,
  baseline_model_version_id uuid references public.ai_model_versions(id) on delete restrict,
  improvement_objectives jsonb not null default '{}'::jsonb,
  prohibited_tradeoffs jsonb not null default '[]'::jsonb,
  source_learning_candidate_ids uuid[] not null default '{}'::uuid[],
  dataset_change_set_ids uuid[] not null default '{}'::uuid[],
  prompt_change_request_ids uuid[] not null default '{}'::uuid[],
  target_metrics jsonb not null default '{}'::jsonb,
  required_subgroup_outcomes jsonb not null default '{}'::jsonb,
  required_language_outcomes jsonb not null default '{}'::jsonb,
  project_status text not null default 'planned',
  project_owner_id uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.ai_candidate_model_builds (
  id uuid primary key default gen_random_uuid(),
  model_improvement_project_id uuid not null references public.ai_model_improvement_projects(id) on delete cascade,
  build_reference text not null unique,
  base_model_version_id uuid references public.ai_model_versions(id) on delete restrict,
  training_dataset_version_refs text[] not null default '{}'::text[],
  validation_dataset_version_refs text[] not null default '{}'::text[],
  test_dataset_version_refs text[] not null default '{}'::text[],
  training_configuration jsonb not null default '{}'::jsonb,
  training_code_reference text not null,
  training_code_hash text not null,
  random_seed_reference text,
  environment_manifest jsonb not null default '{}'::jsonb,
  build_status text not null default 'planned',
  artefact_reference text,
  artefact_hash text,
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.ai_candidate_model_build_reviews (
  id uuid primary key default gen_random_uuid(),
  candidate_model_build_id uuid not null references public.ai_candidate_model_builds(id) on delete cascade,
  review_type text not null,
  dataset_governance_passed boolean,
  privacy_passed boolean,
  fairness_passed boolean,
  security_passed boolean,
  reproducibility_passed boolean,
  contamination_check_passed boolean,
  findings jsonb not null default '[]'::jsonb,
  review_outcome text not null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_machine_unlearning_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  request_reference text not null unique,
  subject_reference_hash text not null,
  source_resource_references jsonb not null default '[]'::jsonb,
  legal_or_policy_basis text not null,
  affected_dataset_refs text[] not null default '{}'::text[],
  affected_index_versions text[] not null default '{}'::text[],
  affected_model_version_ids uuid[] not null default '{}'::uuid[],
  exact_removal_possible boolean,
  retraining_required boolean,
  model_retirement_required boolean,
  verification_requirements jsonb not null default '{}'::jsonb,
  current_status text not null default 'received',
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_machine_unlearning_actions (
  id uuid primary key default gen_random_uuid(),
  machine_unlearning_request_id uuid not null references public.ai_machine_unlearning_requests(id) on delete cascade,
  action_type text not null,
  target_reference text not null,
  action_method text not null,
  action_status text not null default 'planned',
  before_hash text,
  after_hash text,
  completed_by_service text,
  completed_by_user_id uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  independently_verified boolean not null default false
);

create table if not exists public.ai_model_retirement_events (
  id uuid primary key default gen_random_uuid(),
  model_retirement_plan_id uuid not null references public.ai_model_retirement_plans(id) on delete cascade,
  event_type text not null,
  event_summary text not null,
  deployment_reference text,
  configuration_hash text,
  executed_by_service text,
  executed_by_user_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create table if not exists public.ai_emergency_changes (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  emergency_change_reference text not null unique,
  ai_change_request_id uuid references public.ai_change_requests(id) on delete set null,
  emergency_reason text not null,
  trigger_reference text not null,
  affected_scope jsonb not null default '{}'::jsonb,
  immediate_action jsonb not null default '{}'::jsonb,
  standard_approvals_bypassed text[] not null default '{}'::text[],
  compensating_controls jsonb not null default '{}'::jsonb,
  maximum_temporary_duration interval not null,
  authorised_by uuid references auth.users(id) on delete set null,
  executed_at timestamptz not null default now(),
  retrospective_review_due_at timestamptz not null,
  reverted_at timestamptz,
  formalised_at timestamptz
);

create table if not exists public.ai_learning_change_audit_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  event_reference text not null unique,
  event_category text not null,
  event_action text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_service text,
  target_type text not null,
  target_reference text not null,
  previous_state_hash text,
  new_state_hash text,
  event_metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_ai_learning_signals_org_status on public.ai_learning_signals(organisation_id, current_status, severity);
create index if not exists idx_ai_feedback_records_org_time on public.ai_feedback_records(organisation_id, submitted_at desc);
create index if not exists idx_ai_learning_candidates_org_status on public.ai_learning_candidates(organisation_id, current_status);
create index if not exists idx_ai_dataset_change_sets_org_status on public.ai_dataset_change_sets(organisation_id, current_status);
create index if not exists idx_ai_prompt_change_requests_org on public.ai_prompt_change_requests(organisation_id, status);
create index if not exists idx_ai_change_impacts_request on public.ai_change_impact_assessments(change_request_id);
create index if not exists idx_ai_controlled_experiments_org on public.ai_controlled_experiments(organisation_id, status);
create index if not exists idx_ai_canary_releases_status on public.ai_canary_releases(status);
create index if not exists idx_ai_contamination_findings_org on public.ai_learning_contamination_findings(organisation_id, status, severity);
create index if not exists idx_ai_unlearning_org_status on public.ai_machine_unlearning_requests(organisation_id, current_status);
create index if not exists idx_ai_learning_change_audit_org_time on public.ai_learning_change_audit_events(organisation_id, occurred_at desc);

grant select, insert, update, delete on
  public.ai_learning_governance_policies,
  public.ai_learning_signals,
  public.ai_learning_signal_triage,
  public.ai_feedback_records,
  public.ai_child_feedback_controls,
  public.ai_learning_corrections,
  public.ai_learning_correction_reviews,
  public.ai_learning_candidates,
  public.ai_learning_candidate_reviews,
  public.ai_dataset_change_sets,
  public.ai_dataset_change_items,
  public.ai_dataset_representativeness_reviews,
  public.ai_influenced_data_records,
  public.ai_knowledge_change_requests,
  public.ai_knowledge_source_reviews,
  public.ai_knowledge_supersession_records,
  public.ai_prompt_change_requests,
  public.ai_prompt_comparison_tests,
  public.ai_prompt_rollbacks,
  public.ai_workflow_change_requests,
  public.ai_change_impact_assessments,
  public.ai_change_approvals,
  public.ai_change_evaluation_plans,
  public.ai_controlled_experiments,
  public.ai_experiment_assignments,
  public.ai_experiment_safety_events,
  public.ai_shadow_deployments,
  public.ai_shadow_comparison_results,
  public.ai_canary_releases,
  public.ai_canary_release_stages,
  public.ai_change_rollback_plans,
  public.ai_change_release_decisions,
  public.ai_change_post_release_reviews,
  public.ai_longitudinal_quality_snapshots,
  public.ai_improvement_scorecards,
  public.ai_learning_contamination_findings,
  public.ai_model_improvement_projects,
  public.ai_candidate_model_builds,
  public.ai_candidate_model_build_reviews,
  public.ai_machine_unlearning_requests,
  public.ai_machine_unlearning_actions,
  public.ai_model_retirement_events,
  public.ai_emergency_changes,
  public.ai_learning_change_audit_events
to authenticated;

alter table public.ai_learning_governance_policies enable row level security;
alter table public.ai_learning_signals enable row level security;
alter table public.ai_learning_signal_triage enable row level security;
alter table public.ai_feedback_records enable row level security;
alter table public.ai_child_feedback_controls enable row level security;
alter table public.ai_learning_corrections enable row level security;
alter table public.ai_learning_correction_reviews enable row level security;
alter table public.ai_learning_candidates enable row level security;
alter table public.ai_learning_candidate_reviews enable row level security;
alter table public.ai_dataset_change_sets enable row level security;
alter table public.ai_dataset_change_items enable row level security;
alter table public.ai_dataset_representativeness_reviews enable row level security;
alter table public.ai_influenced_data_records enable row level security;
alter table public.ai_knowledge_change_requests enable row level security;
alter table public.ai_knowledge_source_reviews enable row level security;
alter table public.ai_knowledge_supersession_records enable row level security;
alter table public.ai_prompt_change_requests enable row level security;
alter table public.ai_prompt_comparison_tests enable row level security;
alter table public.ai_prompt_rollbacks enable row level security;
alter table public.ai_workflow_change_requests enable row level security;
alter table public.ai_change_impact_assessments enable row level security;
alter table public.ai_change_approvals enable row level security;
alter table public.ai_change_evaluation_plans enable row level security;
alter table public.ai_controlled_experiments enable row level security;
alter table public.ai_experiment_assignments enable row level security;
alter table public.ai_experiment_safety_events enable row level security;
alter table public.ai_shadow_deployments enable row level security;
alter table public.ai_shadow_comparison_results enable row level security;
alter table public.ai_canary_releases enable row level security;
alter table public.ai_canary_release_stages enable row level security;
alter table public.ai_change_rollback_plans enable row level security;
alter table public.ai_change_release_decisions enable row level security;
alter table public.ai_change_post_release_reviews enable row level security;
alter table public.ai_longitudinal_quality_snapshots enable row level security;
alter table public.ai_improvement_scorecards enable row level security;
alter table public.ai_learning_contamination_findings enable row level security;
alter table public.ai_model_improvement_projects enable row level security;
alter table public.ai_candidate_model_builds enable row level security;
alter table public.ai_candidate_model_build_reviews enable row level security;
alter table public.ai_machine_unlearning_requests enable row level security;
alter table public.ai_machine_unlearning_actions enable row level security;
alter table public.ai_model_retirement_events enable row level security;
alter table public.ai_emergency_changes enable row level security;
alter table public.ai_learning_change_audit_events enable row level security;

create policy "AI learning policies managed by learning admins" on public.ai_learning_governance_policies for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI learning signals managed by learning admins" on public.ai_learning_signals for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI feedback records managed by learning admins or submitter" on public.ai_feedback_records for all to authenticated using (submitted_by_user_id = auth.uid() or public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (submitted_by_user_id = auth.uid() or public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI learning corrections managed by learning admins" on public.ai_learning_corrections for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI learning candidates managed by learning admins" on public.ai_learning_candidates for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI dataset change sets managed by learning admins" on public.ai_dataset_change_sets for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI influenced records managed by learning admins" on public.ai_influenced_data_records for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI knowledge changes managed by learning admins" on public.ai_knowledge_change_requests for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI prompt changes managed by learning admins" on public.ai_prompt_change_requests for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI workflow changes managed by learning admins" on public.ai_workflow_change_requests for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI experiments managed by learning admins detailed" on public.ai_controlled_experiments for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI contamination findings managed by learning admins" on public.ai_learning_contamination_findings for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI model improvement projects managed by learning admins" on public.ai_model_improvement_projects for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI unlearning requests managed by learning admins" on public.ai_machine_unlearning_requests for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));
create policy "AI emergency changes managed by learning admins" on public.ai_emergency_changes for all to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));

create policy "AI learning signal triage managed through signal" on public.ai_learning_signal_triage for all to authenticated using (exists (select 1 from public.ai_learning_signals s where s.id = learning_signal_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_learning_signals s where s.id = learning_signal_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id)));
create policy "AI child feedback controls managed through feedback" on public.ai_child_feedback_controls for all to authenticated using (exists (select 1 from public.ai_feedback_records f where f.id = feedback_record_id and public.safesteps_can_manage_ai_learning(auth.uid(), f.organisation_id))) with check (exists (select 1 from public.ai_feedback_records f where f.id = feedback_record_id and public.safesteps_can_manage_ai_learning(auth.uid(), f.organisation_id)));
create policy "AI learning correction reviews managed through correction" on public.ai_learning_correction_reviews for all to authenticated using (exists (select 1 from public.ai_learning_corrections c where c.id = learning_correction_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_learning_corrections c where c.id = learning_correction_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id)));
create policy "AI learning candidate reviews managed through candidate" on public.ai_learning_candidate_reviews for all to authenticated using (exists (select 1 from public.ai_learning_candidates c where c.id = learning_candidate_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_learning_candidates c where c.id = learning_candidate_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id)));
create policy "AI dataset change items managed through set" on public.ai_dataset_change_items for all to authenticated using (exists (select 1 from public.ai_dataset_change_sets s where s.id = dataset_change_set_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_dataset_change_sets s where s.id = dataset_change_set_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id)));
create policy "AI dataset representativeness managed through set" on public.ai_dataset_representativeness_reviews for all to authenticated using (exists (select 1 from public.ai_dataset_change_sets s where s.id = dataset_change_set_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_dataset_change_sets s where s.id = dataset_change_set_id and public.safesteps_can_manage_ai_learning(auth.uid(), s.organisation_id)));
create policy "AI knowledge reviews managed through change" on public.ai_knowledge_source_reviews for all to authenticated using (exists (select 1 from public.ai_knowledge_change_requests c where c.id = knowledge_change_request_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_knowledge_change_requests c where c.id = knowledge_change_request_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id)));
create policy "AI prompt comparison tests managed through change" on public.ai_prompt_comparison_tests for all to authenticated using (exists (select 1 from public.ai_prompt_change_requests c where c.id = prompt_change_request_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_prompt_change_requests c where c.id = prompt_change_request_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id)));
create policy "AI change impact assessments managed through request" on public.ai_change_impact_assessments for all to authenticated using (exists (select 1 from public.ai_change_requests c where c.id = change_request_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_change_requests c where c.id = change_request_id and public.safesteps_can_manage_ai_learning(auth.uid(), c.organisation_id)));
create policy "AI controlled experiment children managed through experiment" on public.ai_experiment_safety_events for all to authenticated using (exists (select 1 from public.ai_controlled_experiments e where e.id = controlled_experiment_id and public.safesteps_can_manage_ai_learning(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_controlled_experiments e where e.id = controlled_experiment_id and public.safesteps_can_manage_ai_learning(auth.uid(), e.organisation_id)));
create policy "AI learning change audit readable by learning admins" on public.ai_learning_change_audit_events for select to authenticated using (public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id) or public.has_resource_permission(auth.uid(), 'global', null, 'ai_audit.read'));
create policy "AI learning change audit appendable by actor" on public.ai_learning_change_audit_events for insert to authenticated with check (actor_user_id = auth.uid() or public.safesteps_can_manage_ai_learning(auth.uid(), organisation_id));

create or replace function public.can_include_item_in_ai_dataset(
  p_dataset_change_item_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_dataset_change_items dci
    join public.ai_dataset_change_sets dcs on dcs.id = dci.dataset_change_set_id
    where dci.id = p_dataset_change_item_id
      and dci.deidentification_status = 'passed'
      and dci.duplication_status in ('unique', 'approved_duplicate')
      and dci.quality_status = 'passed'
      and dci.poisoning_status = 'passed'
      and dci.human_review_count >= 2
      and dci.disagreement_status in ('none', 'resolved')
      and dci.inclusion_status = 'approved'
      and dcs.current_status = 'approved'
      and dcs.privacy_review_status = 'approved'
      and dcs.fairness_review_status = 'approved'
      and dcs.quality_review_status = 'approved'
      and dcs.poisoning_review_status = 'approved'
  );
$$;

create or replace function public.is_online_learning_permitted(
  p_deployment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select false;
$$;

create or replace function public.can_export_ai_learning_data(
  p_dataset_change_set_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_dataset_change_sets dcs
    where dcs.id = p_dataset_change_set_id
      and dcs.current_status = 'approved'
      and dcs.privacy_review_status = 'approved'
      and dcs.licensing_review_status = 'approved'
      and dcs.fairness_review_status = 'approved'
      and dcs.quality_review_status = 'approved'
      and dcs.poisoning_review_status = 'approved'
      and not exists (
        select 1
        from public.ai_dataset_change_items dci
        where dci.dataset_change_set_id = dcs.id
          and not public.can_include_item_in_ai_dataset(dci.id)
      )
  );
$$;

create or replace function public.can_retire_ai_model_version(
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
    from public.ai_model_retirement_assessments ra
    join public.ai_model_retirement_plans rp on rp.retirement_assessment_id = ra.id
    where ra.model_version_id = p_model_version_id
      and ra.retirement_recommended = true
      and rp.status = 'approved'
      and rp.effective_at is not null
      and rp.preservation_manifest is not null
  );
$$;

create or replace function public.can_start_ai_canary_release(
  p_canary_release_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_canary_releases cr
    where cr.id = p_canary_release_id
      and cr.status = 'planned'
      and cr.approved_by is not null
      and exists (
        select 1
        from public.ai_change_rollback_plans rp
        where rp.change_request_id = cr.change_request_id
          and rp.rollback_tested = true
      )
      and not exists (
        select 1
        from public.ai_change_deployment_gates g
        where g.change_request_id = cr.change_request_id
          and g.blocking = true
          and g.gate_status <> 'passed'
      )
  );
$$;

revoke all on function public.can_include_item_in_ai_dataset(uuid) from public;
revoke all on function public.is_online_learning_permitted(uuid) from public;
revoke all on function public.can_export_ai_learning_data(uuid) from public;
revoke all on function public.can_retire_ai_model_version(uuid) from public;
revoke all on function public.can_start_ai_canary_release(uuid) from public;
grant execute on function public.can_include_item_in_ai_dataset(uuid) to authenticated;
grant execute on function public.is_online_learning_permitted(uuid) to authenticated;
grant execute on function public.can_export_ai_learning_data(uuid) to authenticated;
grant execute on function public.can_retire_ai_model_version(uuid) to authenticated;
grant execute on function public.can_start_ai_canary_release(uuid) to authenticated;

insert into public.ai_learning_governance_policies (
  policy_code,
  policy_version,
  policy_name,
  description,
  permitted_learning_modes,
  prohibited_learning_modes,
  minimum_evaluation_requirements,
  minimum_approval_roles,
  lifecycle_status,
  effective_from
)
values (
  'safe_continuous_improvement',
  1,
  'Safe continuous improvement policy',
  'Controls feedback, correction, dataset, prompt, workflow, model and retirement changes without online learning or autonomous self-modification.',
  array['feedback_collection', 'offline_analysis', 'curated_dataset_update', 'prompt_improvement', 'retrieval_improvement', 'fine_tuning_candidate'],
  array['continuous_online_learning', 'autonomous_self_modification', 'automatic_dataset_inclusion'],
  '{"regression":true,"fairness":true,"privacy":true,"child_safety":true,"security":true}'::jsonb,
  array['ai_learning_manager', 'ai_governance_lead'],
  'active',
  now()
)
on conflict (organisation_id, policy_code, policy_version) do nothing;
