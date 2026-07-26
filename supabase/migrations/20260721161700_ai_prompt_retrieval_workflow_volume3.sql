alter table public.ai_prompt_templates
  add column if not exists lifecycle_status text not null default 'draft',
  add column if not exists rollback_owner_role text,
  add column if not exists prompt_security_tier text not null default 'standard',
  add column if not exists secret_exposure_allowed boolean not null default false;

alter table public.ai_prompt_versions
  add column if not exists prompt_hash text,
  add column if not exists previous_prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  add column if not exists rollback_prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  add column if not exists retrieval_required boolean not null default false,
  add column if not exists structured_output_required boolean not null default true,
  add column if not exists max_context_tokens integer,
  add column if not exists approval_expires_at timestamptz;

create table if not exists public.ai_prompt_rollback_records (
  id uuid primary key default gen_random_uuid(),
  prompt_template_id uuid not null references public.ai_prompt_templates(id) on delete cascade,
  from_prompt_version_id uuid not null references public.ai_prompt_versions(id) on delete restrict,
  to_prompt_version_id uuid not null references public.ai_prompt_versions(id) on delete restrict,
  rollback_reason text not null,
  rollback_scope text not null check (rollback_scope in ('prompt_only', 'bundle', 'workflow', 'deployment', 'use_case', 'organisation')),
  affected_workflow_version_ids uuid[] not null default '{}'::uuid[],
  affected_deployment_ids uuid[] not null default '{}'::uuid[],
  initiated_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  initiated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_retrieval_policies (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  policy_code text not null,
  policy_version integer not null,
  use_case_id uuid references public.ai_use_cases(id) on delete cascade,
  name text not null,
  permitted_source_types text[] not null,
  prohibited_source_types text[] not null default '{}'::text[],
  permitted_classifications text[] not null default '{}'::text[],
  prohibited_classifications text[] not null default '{}'::text[],
  source_selection_rules jsonb not null default '{}'::jsonb,
  evidence_ranking_method text not null default 'recency_relevance_authority',
  contradictory_evidence_required boolean not null default true,
  citation_required boolean not null default true,
  maximum_sources integer not null default 12 check (maximum_sources > 0),
  maximum_context_tokens integer not null default 8000 check (maximum_context_tokens > 0),
  cross_tenant_isolation_required boolean not null default true,
  case_isolation_required boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'approved', 'suspended', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organisation_id, policy_code, policy_version)
);

create table if not exists public.ai_retrieval_source_manifests (
  id uuid primary key default gen_random_uuid(),
  inference_request_id uuid references public.ai_inference_requests(id) on delete cascade,
  retrieval_policy_id uuid references public.ai_retrieval_policies(id) on delete set null,
  source_resource_type text not null,
  source_resource_id uuid,
  source_reference text,
  source_version text,
  source_sequence integer not null,
  source_date timestamptz,
  source_classification text not null,
  transmitted_classification text not null,
  relevance_score numeric(6,4),
  authority_score numeric(6,4),
  contradiction_status text not null default 'not_checked' check (contradiction_status in ('not_checked', 'none_found', 'contradicts_included_source', 'contradicts_excluded_source', 'needs_human_review')),
  citation_label text,
  excerpt_hash text,
  identifiers_removed boolean not null default false,
  included_at timestamptz not null default now(),
  unique (inference_request_id, source_sequence)
);

create table if not exists public.ai_context_assembly_runs (
  id uuid primary key default gen_random_uuid(),
  inference_request_id uuid references public.ai_inference_requests(id) on delete cascade,
  retrieval_policy_id uuid references public.ai_retrieval_policies(id) on delete set null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  assembled_context_hash text not null,
  source_count integer not null default 0,
  estimated_tokens integer,
  truncation_applied boolean not null default false,
  truncation_summary text,
  material_omission_review_required boolean not null default false,
  citation_coverage_status text not null default 'pending' check (citation_coverage_status in ('pending', 'complete', 'incomplete', 'not_required')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_workflow_execution_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  workflow_version_id uuid not null references public.ai_workflow_versions(id) on delete restrict,
  inference_request_id uuid references public.ai_inference_requests(id) on delete set null,
  run_reference text not null unique,
  state text not null default 'queued' check (state in ('queued', 'running', 'waiting_for_tool', 'waiting_for_human', 'retrying', 'completed', 'failed', 'cancelled', 'blocked')),
  current_step_code text,
  retry_count integer not null default 0 check (retry_count >= 0),
  max_retries integer not null default 1 check (max_retries >= 0),
  timeout_at timestamptz,
  escalation_required boolean not null default false,
  escalation_reason text,
  correlation_id uuid not null default gen_random_uuid(),
  started_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_workflow_step_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_run_id uuid not null references public.ai_workflow_execution_runs(id) on delete cascade,
  workflow_step_id uuid references public.ai_workflow_steps(id) on delete set null,
  step_code text not null,
  step_order integer not null,
  step_status text not null default 'queued' check (step_status in ('queued', 'running', 'succeeded', 'failed', 'skipped', 'blocked', 'waiting_for_human')),
  attempt_number integer not null default 1 check (attempt_number > 0),
  input_hash text,
  output_hash text,
  failure_reason text,
  started_at timestamptz,
  completed_at timestamptz,
  unique (workflow_run_id, step_order, attempt_number)
);

create table if not exists public.ai_tool_registry (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  tool_code text not null,
  tool_name text not null,
  tool_category text not null check (tool_category in ('retrieval', 'document_read', 'evidence_write', 'notification', 'report_generation', 'translation', 'validation', 'case_lookup', 'external_api', 'internal_service')),
  execution_boundary text not null default 'server_only' check (execution_boundary in ('server_only', 'edge_function', 'worker', 'local_device', 'human_only')),
  data_access_level text not null default 'minimal',
  can_write_case_data boolean not null default false,
  can_contact_users boolean not null default false,
  can_release_external_output boolean not null default false,
  secret_reference_required boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'approved', 'suspended', 'retired')),
  created_at timestamptz not null default now(),
  unique (organisation_id, tool_code)
);

create table if not exists public.ai_tool_permission_grants (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.ai_tool_registry(id) on delete cascade,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete cascade,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete cascade,
  use_case_id uuid references public.ai_use_cases(id) on delete cascade,
  permitted_actions text[] not null default '{}'::text[],
  prohibited_actions text[] not null default '{}'::text[],
  permitted_resource_types text[] not null default '{}'::text[],
  maximum_risk_tier text not null default 'medium' check (maximum_risk_tier in ('low', 'medium', 'high', 'critical')),
  human_approval_required boolean not null default true,
  least_privilege_rationale text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'suspended', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint ai_tool_permission_target check (
    workflow_version_id is not null or prompt_version_id is not null or use_case_id is not null
  )
);

create table if not exists public.ai_tool_invocation_logs (
  id uuid primary key default gen_random_uuid(),
  workflow_run_id uuid references public.ai_workflow_execution_runs(id) on delete set null,
  inference_request_id uuid references public.ai_inference_requests(id) on delete set null,
  tool_id uuid references public.ai_tool_registry(id) on delete restrict,
  permission_grant_id uuid references public.ai_tool_permission_grants(id) on delete set null,
  invoked_by uuid references auth.users(id) on delete set null,
  action_name text not null,
  input_hash text not null,
  output_hash text,
  decision_status text not null check (decision_status in ('allowed', 'blocked', 'human_approval_required', 'failed')),
  denial_reason text,
  correlation_id uuid,
  invoked_at timestamptz not null default now()
);

create table if not exists public.ai_prompt_security_evaluations (
  id uuid primary key default gen_random_uuid(),
  inference_request_id uuid references public.ai_inference_requests(id) on delete cascade,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  workflow_run_id uuid references public.ai_workflow_execution_runs(id) on delete set null,
  evaluation_type text not null check (evaluation_type in ('prompt_injection', 'jailbreak', 'data_exfiltration', 'secret_exposure', 'cross_tenant_attempt', 'tool_abuse', 'policy_override')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  detection_status text not null check (detection_status in ('passed', 'flagged', 'blocked', 'needs_review')),
  matched_rules text[] not null default '{}'::text[],
  finding_summary text not null,
  action_taken text not null default 'logged',
  evaluated_at timestamptz not null default now()
);

create table if not exists public.ai_output_processing_policies (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  policy_code text not null,
  policy_version integer not null,
  use_case_id uuid references public.ai_use_cases(id) on delete cascade,
  response_schema jsonb not null default '{}'::jsonb,
  citation_validation_required boolean not null default true,
  contradiction_validation_required boolean not null default true,
  confidence_calibration_required boolean not null default true,
  prohibited_claim_rules jsonb not null default '[]'::jsonb,
  failure_behavior text not null default 'route_to_human_review' check (failure_behavior in ('allow_with_label', 'repair_once', 'route_to_human_review', 'block')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'suspended', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organisation_id, policy_code, policy_version)
);

create table if not exists public.ai_output_validation_results (
  id uuid primary key default gen_random_uuid(),
  inference_request_id uuid references public.ai_inference_requests(id) on delete cascade,
  processing_policy_id uuid references public.ai_output_processing_policies(id) on delete set null,
  validation_type text not null check (validation_type in ('schema', 'citation', 'contradiction', 'confidence', 'prohibited_claim', 'privacy', 'court_language')),
  validation_status text not null check (validation_status in ('passed', 'failed', 'needs_review', 'repaired', 'not_applicable')),
  severity text not null default 'major' check (severity in ('minor', 'major', 'critical')),
  finding_summary text not null,
  repair_attempted boolean not null default false,
  human_review_required boolean not null default true,
  evaluated_at timestamptz not null default now()
);

create table if not exists public.ai_prompt_evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  evaluation_set_id uuid references public.ai_evaluation_prompt_sets(id) on delete set null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete set null,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  dataset_id uuid references public.ai_training_datasets(id) on delete set null,
  run_reference text not null unique,
  evaluation_scope text not null check (evaluation_scope in ('prompt', 'workflow', 'model', 'bundle', 'retrieval', 'tooling', 'release')),
  total_items integer not null default 0,
  passed_items integer not null default 0,
  failed_items integer not null default 0,
  critical_failures integer not null default 0,
  pass_rate numeric(5,2),
  release_blocked boolean not null default true,
  run_status text not null default 'running' check (run_status in ('running', 'passed', 'failed', 'needs_review', 'cancelled')),
  started_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_prompt_evaluation_findings (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references public.ai_prompt_evaluation_runs(id) on delete cascade,
  evaluation_item_id uuid references public.ai_evaluation_prompt_items(id) on delete set null,
  finding_type text not null check (finding_type in ('quality', 'safety', 'privacy', 'fairness', 'citation', 'schema', 'retrieval', 'latency', 'tool_permission')),
  severity text not null check (severity in ('minor', 'major', 'critical')),
  finding_status text not null default 'open' check (finding_status in ('open', 'accepted_risk', 'fixed', 'waived')),
  summary text not null,
  expected_behavior text,
  observed_behavior text,
  corrective_action text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_prompt_telemetry_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  inference_request_id uuid references public.ai_inference_requests(id) on delete set null,
  workflow_run_id uuid references public.ai_workflow_execution_runs(id) on delete set null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete set null,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  event_type text not null,
  input_tokens integer,
  output_tokens integer,
  retrieval_tokens integer,
  latency_ms integer,
  retry_count integer not null default 0,
  failure_category text,
  cost_estimate numeric(14,6),
  correlation_id uuid,
  occurred_at timestamptz not null default now()
);

create table if not exists public.ai_prompt_bundles (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  bundle_code text not null,
  bundle_version integer not null,
  environment text not null check (environment in ('research_sandbox', 'development', 'automated_testing', 'security_testing', 'validation', 'controlled_pilot', 'staging', 'production', 'disaster_recovery', 'quarantine')),
  prompt_version_ids uuid[] not null default '{}'::uuid[],
  workflow_version_ids uuid[] not null default '{}'::uuid[],
  retrieval_policy_ids uuid[] not null default '{}'::uuid[],
  tool_permission_grant_ids uuid[] not null default '{}'::uuid[],
  output_processing_policy_ids uuid[] not null default '{}'::uuid[],
  bundle_hash text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'canary', 'active', 'rolled_back', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  promoted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organisation_id, bundle_code, bundle_version, environment)
);

create table if not exists public.ai_prompt_bundle_deployments (
  id uuid primary key default gen_random_uuid(),
  prompt_bundle_id uuid not null references public.ai_prompt_bundles(id) on delete restrict,
  deployment_id uuid references public.ai_model_deployments(id) on delete set null,
  release_reference text not null unique,
  rollout_strategy text not null check (rollout_strategy in ('internal_validation', 'shadow', 'canary', 'percentage', 'organisation', 'jurisdiction', 'opt_in_pilot', 'blue_green', 'full')),
  traffic_percentage numeric(5,2) not null default 0 check (traffic_percentage >= 0 and traffic_percentage <= 100),
  rollback_bundle_id uuid references public.ai_prompt_bundles(id) on delete set null,
  release_status text not null default 'planned' check (release_status in ('planned', 'validating', 'active', 'paused', 'rolled_back', 'failed', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_model_data_restrictions (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid not null references public.ai_model_versions(id) on delete cascade,
  restriction_code text not null,
  data_category text,
  classification_code text,
  restriction_type text not null check (restriction_type in ('allowed', 'allowed_with_minimisation', 'allowed_after_de_identification', 'allowed_with_explicit_authority', 'human_approval_required', 'pilot_only', 'synthetic_data_only', 'prohibited')),
  permitted_purpose_codes text[] not null default '{}'::text[],
  permitted_jurisdictions text[] not null default '{}'::text[],
  transformation_required text,
  identifier_removal_required boolean not null default false,
  maximum_payload_size_bytes bigint,
  maximum_retention_seconds integer,
  reason text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (model_version_id, restriction_code)
);

create table if not exists public.ai_hosting_decisions (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  model_version_id uuid not null references public.ai_model_versions(id) on delete restrict,
  decision_version integer not null,
  selected_hosting_type text not null,
  alternatives_considered jsonb not null default '[]'::jsonb,
  decision_rationale text not null,
  privacy_assessment text not null,
  security_assessment text not null,
  performance_assessment text not null,
  cost_assessment text,
  offline_requirement boolean not null default false,
  regional_processing_requirement text,
  residual_risks jsonb not null default '[]'::jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (use_case_id, model_version_id, decision_version)
);

create table if not exists public.ai_model_configurations (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid not null references public.ai_model_versions(id) on delete cascade,
  configuration_name text not null,
  configuration_version integer not null,
  inference_parameters jsonb not null default '{}'::jsonb,
  safety_parameters jsonb not null default '{}'::jsonb,
  moderation_parameters jsonb not null default '{}'::jsonb,
  timeout_milliseconds integer not null,
  retry_policy jsonb not null default '{}'::jsonb,
  rate_limit_policy jsonb not null default '{}'::jsonb,
  response_schema_reference text,
  prompt_bundle_version text,
  logging_policy_code text not null,
  retention_policy_code text not null,
  configuration_hash text not null,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (model_version_id, configuration_name, configuration_version)
);

create table if not exists public.ai_model_routing_policies (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  routing_policy_code text not null,
  version integer not null,
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  priority integer not null,
  match_conditions jsonb not null default '{}'::jsonb,
  primary_deployment_id uuid not null references public.ai_model_deployments(id) on delete restrict,
  fallback_deployment_ids uuid[] not null default '{}'::uuid[],
  fallback_mode text not null check (fallback_mode in ('fail_closed', 'human_workflow', 'rule_based_fallback', 'local_model_fallback', 'approved_secondary_provider', 'delayed_retry', 'no_output', 'generic_non_personalised_response')),
  deny_when_no_match boolean not null default true,
  human_fallback_required boolean not null default true,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (routing_policy_code, version, priority)
);

create table if not exists public.ai_model_routing_decisions (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid not null references public.ai_use_cases(id) on delete restrict,
  routing_policy_id uuid references public.ai_model_routing_policies(id) on delete set null,
  selected_deployment_id uuid references public.ai_model_deployments(id) on delete set null,
  fallback_used boolean not null default false,
  fallback_reason text,
  input_classification_codes text[] not null default '{}'::text[],
  jurisdiction_code text,
  requested_language text,
  decision_outcome text not null check (decision_outcome in ('selected', 'denied', 'fallback_selected', 'human_workflow_required', 'failed_closed')),
  denial_reason text,
  correlation_id uuid not null,
  decided_at timestamptz not null default now()
);

create table if not exists public.ai_provider_model_change_events (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.ai_model_providers(id) on delete restrict,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  detected_change_type text not null,
  provider_change_reference text,
  detected_at timestamptz not null default now(),
  provider_announced_at timestamptz,
  expected_change boolean not null default false,
  materiality_status text not null default 'unassessed' check (materiality_status in ('unassessed', 'not_material', 'material', 'critical', 'unknown')),
  affected_deployment_ids uuid[] not null default '{}'::uuid[],
  affected_use_case_ids uuid[] not null default '{}'::uuid[],
  immediate_action text,
  assessment_status text not null default 'pending' check (assessment_status in ('pending', 'in_review', 'approved', 'revalidation_required', 'suspended', 'closed')),
  assessment_outcome text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz
);

create table if not exists public.ai_system_suspensions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  suspension_scope text not null check (suspension_scope in ('provider', 'model_family', 'model_version', 'deployment', 'capability', 'use_case', 'jurisdiction', 'organisation', 'data_classification', 'population_group')),
  provider_id uuid references public.ai_model_providers(id) on delete set null,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  deployment_id uuid references public.ai_model_deployments(id) on delete set null,
  use_case_id uuid references public.ai_use_cases(id) on delete set null,
  capability_code text,
  jurisdiction_code text,
  data_classification text,
  population_group text,
  reason text not null,
  status text not null default 'active' check (status in ('active', 'lifted', 'expired')),
  issued_by uuid references auth.users(id) on delete set null,
  issued_at timestamptz not null default now(),
  lifted_by uuid references auth.users(id) on delete set null,
  lifted_at timestamptz
);

create index if not exists idx_ai_prompt_rollbacks_template_time on public.ai_prompt_rollback_records(prompt_template_id, initiated_at desc);
create index if not exists idx_ai_retrieval_policies_org_status on public.ai_retrieval_policies(organisation_id, status);
create index if not exists idx_ai_retrieval_source_manifests_request on public.ai_retrieval_source_manifests(inference_request_id, source_sequence);
create index if not exists idx_ai_context_assembly_runs_request on public.ai_context_assembly_runs(inference_request_id);
create index if not exists idx_ai_workflow_execution_runs_org_state on public.ai_workflow_execution_runs(organisation_id, state, started_at desc);
create index if not exists idx_ai_workflow_step_runs_run_order on public.ai_workflow_step_runs(workflow_run_id, step_order);
create index if not exists idx_ai_tool_registry_org_status on public.ai_tool_registry(organisation_id, status);
create index if not exists idx_ai_tool_permission_grants_tool on public.ai_tool_permission_grants(tool_id, status);
create index if not exists idx_ai_tool_invocation_logs_tool_time on public.ai_tool_invocation_logs(tool_id, invoked_at desc);
create index if not exists idx_ai_prompt_security_eval_request on public.ai_prompt_security_evaluations(inference_request_id, severity);
create index if not exists idx_ai_output_processing_policies_org_status on public.ai_output_processing_policies(organisation_id, status);
create index if not exists idx_ai_output_validation_results_request on public.ai_output_validation_results(inference_request_id, validation_status);
create index if not exists idx_ai_prompt_evaluation_runs_org_status on public.ai_prompt_evaluation_runs(organisation_id, run_status, started_at desc);
create index if not exists idx_ai_prompt_telemetry_org_time on public.ai_prompt_telemetry_events(organisation_id, occurred_at desc);
create index if not exists idx_ai_prompt_bundles_org_env_status on public.ai_prompt_bundles(organisation_id, environment, status);
create index if not exists idx_ai_model_data_restrictions_version_active on public.ai_model_data_restrictions(model_version_id, active);
create index if not exists idx_ai_model_routing_decisions_correlation on public.ai_model_routing_decisions(correlation_id);
create index if not exists idx_ai_provider_model_change_events_provider on public.ai_provider_model_change_events(provider_id, detected_at desc);
create index if not exists idx_ai_system_suspensions_status_scope on public.ai_system_suspensions(status, suspension_scope);

alter table public.ai_prompt_rollback_records enable row level security;
alter table public.ai_retrieval_policies enable row level security;
alter table public.ai_retrieval_source_manifests enable row level security;
alter table public.ai_context_assembly_runs enable row level security;
alter table public.ai_workflow_execution_runs enable row level security;
alter table public.ai_workflow_step_runs enable row level security;
alter table public.ai_tool_registry enable row level security;
alter table public.ai_tool_permission_grants enable row level security;
alter table public.ai_tool_invocation_logs enable row level security;
alter table public.ai_prompt_security_evaluations enable row level security;
alter table public.ai_output_processing_policies enable row level security;
alter table public.ai_output_validation_results enable row level security;
alter table public.ai_prompt_evaluation_runs enable row level security;
alter table public.ai_prompt_evaluation_findings enable row level security;
alter table public.ai_prompt_telemetry_events enable row level security;
alter table public.ai_prompt_bundles enable row level security;
alter table public.ai_prompt_bundle_deployments enable row level security;
alter table public.ai_model_data_restrictions enable row level security;
alter table public.ai_hosting_decisions enable row level security;
alter table public.ai_model_configurations enable row level security;
alter table public.ai_model_routing_policies enable row level security;
alter table public.ai_model_routing_decisions enable row level security;
alter table public.ai_provider_model_change_events enable row level security;
alter table public.ai_system_suspensions enable row level security;

create policy "AI prompt rollbacks managed through template" on public.ai_prompt_rollback_records for all to authenticated
using (exists (select 1 from public.ai_prompt_templates t where t.id = prompt_template_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)))
with check (exists (select 1 from public.ai_prompt_templates t where t.id = prompt_template_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)));

create policy "AI retrieval policies managed by prompt workflow admins" on public.ai_retrieval_policies for all to authenticated
using (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id));

create policy "AI retrieval manifests readable through request" on public.ai_retrieval_source_manifests for select to authenticated
using (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and (r.requested_by = auth.uid() or public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id))));

create policy "AI retrieval manifests insertable by operations admins" on public.ai_retrieval_source_manifests for insert to authenticated
with check (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id)));

create policy "AI context assembly runs readable through request" on public.ai_context_assembly_runs for select to authenticated
using (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and (r.requested_by = auth.uid() or public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id))));

create policy "AI context assembly runs insertable by operations admins" on public.ai_context_assembly_runs for insert to authenticated
with check (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id)));

create policy "AI workflow execution runs managed by prompt workflow admins" on public.ai_workflow_execution_runs for all to authenticated
using (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id));

create policy "AI workflow step runs managed through run" on public.ai_workflow_step_runs for all to authenticated
using (exists (select 1 from public.ai_workflow_execution_runs r where r.id = workflow_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id)))
with check (exists (select 1 from public.ai_workflow_execution_runs r where r.id = workflow_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id)));

create policy "AI tool registry managed by prompt workflow admins" on public.ai_tool_registry for all to authenticated
using (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id));

create policy "AI tool permission grants managed through tool" on public.ai_tool_permission_grants for all to authenticated
using (exists (select 1 from public.ai_tool_registry t where t.id = tool_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)))
with check (exists (select 1 from public.ai_tool_registry t where t.id = tool_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)));

create policy "AI tool invocation logs readable by operations or workflow admins" on public.ai_tool_invocation_logs for select to authenticated
using (
  exists (select 1 from public.ai_tool_registry t where t.id = tool_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id))
  or exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id))
);

create policy "AI tool invocation logs insertable by operations admins" on public.ai_tool_invocation_logs for insert to authenticated
with check (exists (select 1 from public.ai_tool_registry t where t.id = tool_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)));

create policy "AI prompt security evaluations readable through request" on public.ai_prompt_security_evaluations for select to authenticated
using (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and (r.requested_by = auth.uid() or public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id))));

create policy "AI prompt security evaluations insertable by operations admins" on public.ai_prompt_security_evaluations for insert to authenticated
with check (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id)));

create policy "AI output processing policies managed by prompt workflow admins" on public.ai_output_processing_policies for all to authenticated
using (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id));

create policy "AI output validation results readable through request" on public.ai_output_validation_results for select to authenticated
using (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and (r.requested_by = auth.uid() or public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id))));

create policy "AI output validation results insertable by operations admins" on public.ai_output_validation_results for insert to authenticated
with check (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id)));

create policy "AI prompt evaluation runs managed by prompt workflow admins" on public.ai_prompt_evaluation_runs for all to authenticated
using (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id));

create policy "AI prompt evaluation findings managed through run" on public.ai_prompt_evaluation_findings for all to authenticated
using (exists (select 1 from public.ai_prompt_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id)))
with check (exists (select 1 from public.ai_prompt_evaluation_runs r where r.id = evaluation_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id)));

create policy "AI prompt telemetry managed by operations admins" on public.ai_prompt_telemetry_events for all to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI prompt bundles managed by prompt workflow admins" on public.ai_prompt_bundles for all to authenticated
using (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id));

create policy "AI prompt bundle deployments managed through bundle" on public.ai_prompt_bundle_deployments for all to authenticated
using (exists (select 1 from public.ai_prompt_bundles b where b.id = prompt_bundle_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), b.organisation_id)))
with check (exists (select 1 from public.ai_prompt_bundles b where b.id = prompt_bundle_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), b.organisation_id)));

create policy "AI model data restrictions managed through model version" on public.ai_model_data_restrictions for all to authenticated
using (exists (select 1 from public.ai_model_versions mv join public.ai_models m on m.id = mv.model_id where mv.id = model_version_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)))
with check (exists (select 1 from public.ai_model_versions mv join public.ai_models m on m.id = mv.model_id where mv.id = model_version_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)));

create policy "AI hosting decisions managed through use case" on public.ai_hosting_decisions for all to authenticated
using (exists (select 1 from public.ai_use_cases u where u.id = use_case_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), u.organisation_id)))
with check (exists (select 1 from public.ai_use_cases u where u.id = use_case_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), u.organisation_id)));

create policy "AI model configurations managed through model version" on public.ai_model_configurations for all to authenticated
using (exists (select 1 from public.ai_model_versions mv join public.ai_models m on m.id = mv.model_id where mv.id = model_version_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)))
with check (exists (select 1 from public.ai_model_versions mv join public.ai_models m on m.id = mv.model_id where mv.id = model_version_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)));

create policy "AI model routing policies managed by lifecycle admins" on public.ai_model_routing_policies for all to authenticated
using (public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id));

create policy "AI model routing decisions readable through use case" on public.ai_model_routing_decisions for select to authenticated
using (exists (select 1 from public.ai_use_cases u where u.id = use_case_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), u.organisation_id)));

create policy "AI model routing decisions insertable through use case" on public.ai_model_routing_decisions for insert to authenticated
with check (exists (select 1 from public.ai_use_cases u where u.id = use_case_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), u.organisation_id)));

create policy "AI provider model change events managed through provider" on public.ai_provider_model_change_events for all to authenticated
using (exists (select 1 from public.ai_model_providers p where p.id = provider_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), p.organisation_id)))
with check (exists (select 1 from public.ai_model_providers p where p.id = provider_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), p.organisation_id)));

create policy "AI system suspensions managed by governance admins" on public.ai_system_suspensions for all to authenticated
using (
  public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id)
  or public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id)
)
with check (
  public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id)
  or public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id)
);

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_retrieval_policy.manage', 'Manage AI retrieval policies, source selection, context assembly, citation enforcement, and contradiction detection.', 'organisation', 'manage_ai_retrieval_policy', 'high_impact'),
  ('ai_tool_permission.manage', 'Manage AI tool registry, least-privilege grants, function-call boundaries, and tool invocation governance.', 'organisation', 'manage_ai_tool_permission', 'high_impact'),
  ('ai_prompt_security.review', 'Review prompt injection, jailbreak, data exfiltration, secret exposure, and cross-tenant prompt-security findings.', 'organisation', 'review_ai_prompt_security', 'high_impact'),
  ('ai_output_processing.manage', 'Manage structured output validation, schema enforcement, citation validation, contradiction detection, and confidence calibration.', 'organisation', 'manage_ai_output_processing', 'high_impact'),
  ('ai_prompt_bundle.release', 'Approve prompt bundles, environment promotion, canary rollout, and rollback for AI prompt/workflow releases.', 'organisation', 'release_ai_prompt_bundle', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_retrieval_policy.manage',
  'ai_tool_permission.manage',
  'ai_prompt_security.review',
  'ai_output_processing.manage',
  'ai_prompt_bundle.release',
  'ai_prompt_workflow.manage',
  'ai_audit.read'
)
where r.role_code in ('ai_prompt_workflow_manager', 'ai_governance_lead')
on conflict do nothing;

insert into public.ai_tool_registry (
  tool_code,
  tool_name,
  tool_category,
  execution_boundary,
  data_access_level,
  can_write_case_data,
  can_contact_users,
  can_release_external_output,
  secret_reference_required,
  status
)
values
  ('human_review_queue', 'Human review queue router', 'internal_service', 'server_only', 'review_metadata', true, false, false, false, 'approved'),
  ('citation_validator', 'Evidence citation validator', 'validation', 'server_only', 'source_manifest_only', false, false, false, false, 'approved'),
  ('contradiction_detector', 'Contradictory evidence detector', 'validation', 'server_only', 'source_manifest_only', false, false, false, false, 'approved'),
  ('retrieval_context_builder', 'Retrieval context builder', 'retrieval', 'server_only', 'approved_sources_only', false, false, false, false, 'approved')
on conflict (organisation_id, tool_code) do update
set tool_name = excluded.tool_name,
    tool_category = excluded.tool_category,
    execution_boundary = excluded.execution_boundary,
    data_access_level = excluded.data_access_level,
    can_write_case_data = excluded.can_write_case_data,
    can_contact_users = excluded.can_contact_users,
    can_release_external_output = excluded.can_release_external_output,
    secret_reference_required = excluded.secret_reference_required,
    status = excluded.status;
