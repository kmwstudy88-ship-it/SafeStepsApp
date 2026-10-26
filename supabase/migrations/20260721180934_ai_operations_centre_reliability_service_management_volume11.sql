create table if not exists public.ai_operational_services (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  service_code text not null,
  service_name text not null,
  service_type text not null check (service_type in ('model_endpoint', 'ai_gateway', 'prompt_service', 'retrieval_service', 'embedding_service', 'vector_index', 'workflow_engine', 'agent_runtime', 'tool_gateway', 'moderation_service', 'transcription_service', 'ocr_service', 'evidence_processor', 'explanation_service', 'monitoring_service', 'human_review_queue', 'notification_service', 'report_generation_service')),
  service_description text not null,
  ai_use_case_ids uuid[] not null default '{}'::uuid[],
  deployment_ids uuid[] not null default '{}'::uuid[],
  owning_team text not null,
  operational_owner_role text not null,
  technical_owner_role text not null,
  service_tier text not null,
  criticality text not null check (criticality in ('low', 'moderate', 'high', 'critical')),
  production_environment_codes text[] not null default '{}'::text[],
  supported_region_codes text[] not null default '{}'::text[],
  upstream_service_ids uuid[] not null default '{}'::uuid[],
  downstream_service_ids uuid[] not null default '{}'::uuid[],
  human_fallback_available boolean not null default false,
  offline_operation_supported boolean not null default false,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('draft', 'active', 'restricted', 'degraded', 'suspended', 'retired')),
  created_at timestamptz not null default now(),
  retired_at timestamptz,
  unique (organisation_id, service_code)
);

create table if not exists public.ai_service_dependencies (
  id uuid primary key default gen_random_uuid(),
  parent_service_id uuid not null references public.ai_operational_services(id) on delete cascade,
  dependency_service_id uuid not null references public.ai_operational_services(id) on delete restrict,
  dependency_type text not null,
  dependency_criticality text not null check (dependency_criticality in ('optional', 'degradable', 'required', 'critical')),
  failure_effect text not null,
  maximum_tolerable_outage interval,
  fallback_service_id uuid references public.ai_operational_services(id) on delete set null,
  manual_workaround_available boolean not null default false,
  manual_workaround_reference text,
  unique (parent_service_id, dependency_service_id, dependency_type)
);

create table if not exists public.ai_service_level_objectives (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.ai_operational_services(id) on delete cascade,
  slo_code text not null,
  slo_version integer not null,
  indicator_type text not null,
  measurement_method text not null,
  target_value numeric not null,
  target_unit text not null,
  measurement_window interval not null,
  minimum_sample_size integer,
  warning_threshold numeric,
  breach_threshold numeric,
  exclusion_rules jsonb not null default '[]'::jsonb,
  business_impact_on_breach text not null,
  automatic_action text,
  effective_from timestamptz not null,
  expires_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  unique (service_id, slo_code, slo_version)
);

create table if not exists public.ai_service_level_indicator_results (
  id uuid primary key default gen_random_uuid(),
  service_level_objective_id uuid not null references public.ai_service_level_objectives(id) on delete cascade,
  window_start timestamptz not null,
  window_end timestamptz not null,
  request_count bigint not null default 0,
  successful_request_count bigint not null default 0,
  failed_request_count bigint not null default 0,
  measured_value numeric,
  target_value numeric not null,
  compliance_status text not null check (compliance_status in ('met', 'warning', 'breach', 'insufficient_data')),
  error_budget_consumed_percentage numeric,
  calculated_at timestamptz not null default now()
);

create table if not exists public.ai_service_error_budgets (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.ai_operational_services(id) on delete cascade,
  budget_period_start timestamptz not null,
  budget_period_end timestamptz not null,
  permitted_failure_units numeric not null,
  consumed_failure_units numeric not null default 0,
  remaining_failure_units numeric generated always as (permitted_failure_units - consumed_failure_units) stored,
  budget_status text not null default 'healthy' check (budget_status in ('healthy', 'watch', 'restricted', 'exhausted', 'frozen')),
  release_freeze_threshold_percentage numeric not null default 80,
  mandatory_freeze_threshold_percentage numeric not null default 100,
  last_calculated_at timestamptz not null default now(),
  unique (service_id, budget_period_start, budget_period_end)
);

create table if not exists public.ai_service_health_events (
  id uuid primary key default gen_random_uuid(),
  event_reference text not null unique,
  service_id uuid not null references public.ai_operational_services(id) on delete cascade,
  environment_code text not null,
  region_code text,
  health_status text not null check (health_status in ('healthy', 'degraded', 'restricted', 'unavailable', 'failed', 'maintenance')),
  health_reason_code text,
  health_summary text not null,
  availability_percentage numeric,
  latency_p50_ms numeric,
  latency_p95_ms numeric,
  latency_p99_ms numeric,
  request_rate_per_minute numeric,
  failure_rate numeric,
  saturation_percentage numeric,
  dependency_status jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default now()
);

create or replace view public.ai_current_service_health
with (security_invoker = true) as
select distinct on (service_id, environment_code, coalesce(region_code, ''))
  service_id,
  environment_code,
  region_code,
  health_status,
  health_summary,
  availability_percentage,
  latency_p95_ms,
  failure_rate,
  saturation_percentage,
  observed_at
from public.ai_service_health_events
order by service_id, environment_code, coalesce(region_code, ''), observed_at desc;

create table if not exists public.ai_fleet_members (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  fleet_code text not null,
  fleet_environment text not null,
  deployment_id uuid references public.ai_model_deployments(id) on delete set null,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  model_version_id uuid references public.ai_model_versions(id) on delete restrict,
  provider_id uuid references public.ai_model_providers(id) on delete set null,
  region_code text,
  serving_priority integer not null default 100,
  traffic_weight numeric not null default 0,
  minimum_capacity_units numeric,
  maximum_capacity_units numeric,
  current_operational_state text not null default 'standby' check (current_operational_state in ('active', 'standby', 'degraded', 'suspended', 'retiring', 'retired')),
  entered_fleet_at timestamptz not null default now(),
  removed_from_fleet_at timestamptz,
  unique (fleet_code, fleet_environment, deployment_id, region_code)
);

create table if not exists public.ai_fleet_status_snapshots (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  fleet_code text not null,
  fleet_environment text not null,
  snapshot_at timestamptz not null default now(),
  active_deployment_count integer not null default 0,
  degraded_deployment_count integer not null default 0,
  suspended_deployment_count integer not null default 0,
  unavailable_deployment_count integer not null default 0,
  total_request_rate numeric,
  average_latency_ms numeric,
  failure_rate numeric,
  total_capacity_units numeric,
  used_capacity_units numeric,
  available_capacity_units numeric,
  estimated_hourly_cost numeric,
  overall_health_status text not null
);

create table if not exists public.ai_service_capacity_profiles (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.ai_operational_services(id) on delete cascade,
  profile_version integer not null,
  capacity_unit_name text not null,
  minimum_capacity_units numeric not null,
  normal_capacity_units numeric not null,
  maximum_capacity_units numeric not null,
  requests_per_capacity_unit numeric,
  tokens_per_capacity_unit numeric,
  concurrent_jobs_per_capacity_unit numeric,
  scale_up_threshold_percentage numeric not null,
  scale_down_threshold_percentage numeric not null,
  scale_up_cooldown interval not null,
  scale_down_cooldown interval not null,
  effective_from timestamptz not null,
  unique (service_id, profile_version)
);

create table if not exists public.ai_capacity_measurements (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.ai_operational_services(id) on delete cascade,
  environment_code text not null,
  region_code text,
  measurement_start timestamptz not null,
  measurement_end timestamptz not null,
  provisioned_capacity_units numeric not null,
  consumed_capacity_units numeric not null,
  peak_utilisation_percentage numeric,
  average_utilisation_percentage numeric,
  queued_work_count bigint not null default 0,
  rejected_work_count bigint not null default 0,
  scale_action_required text,
  forecast_exhaustion_at timestamptz
);

create table if not exists public.ai_capacity_forecasts (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.ai_operational_services(id) on delete cascade,
  forecast_generated_at timestamptz not null default now(),
  forecast_horizon interval not null,
  forecast_method text not null,
  expected_request_volume jsonb not null default '{}'::jsonb,
  expected_token_volume jsonb not null default '{}'::jsonb,
  expected_concurrency jsonb not null default '{}'::jsonb,
  expected_capacity_requirement jsonb not null default '{}'::jsonb,
  confidence_level text not null,
  assumptions jsonb not null default '[]'::jsonb,
  capacity_shortfall_predicted boolean not null default false,
  predicted_shortfall_at timestamptz,
  recommended_actions jsonb not null default '[]'::jsonb
);

create table if not exists public.ai_workload_classes (
  id uuid primary key default gen_random_uuid(),
  workload_code text not null unique,
  workload_name text not null,
  priority_level integer not null,
  maximum_queue_delay interval,
  maximum_execution_time interval,
  maximum_retry_count integer not null default 0,
  safety_critical boolean not null default false,
  user_interactive boolean not null default true,
  preemptible boolean not null default false,
  degradable boolean not null default false,
  permitted_fallback_modes text[] not null default '{}'::text[],
  rate_limit_policy jsonb not null default '{}'::jsonb
);

create table if not exists public.ai_workload_queue_snapshots (
  id uuid primary key default gen_random_uuid(),
  workload_class_id uuid not null references public.ai_workload_classes(id) on delete cascade,
  service_id uuid not null references public.ai_operational_services(id) on delete cascade,
  captured_at timestamptz not null default now(),
  queued_item_count bigint not null,
  oldest_item_age_seconds integer,
  average_item_age_seconds numeric,
  processing_item_count bigint not null default 0,
  failed_item_count bigint not null default 0,
  dead_letter_item_count bigint not null default 0,
  estimated_clear_time_seconds integer,
  queue_status text not null
);

create table if not exists public.ai_ops_human_review_queue_snapshots (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid references public.ai_human_review_queues(id) on delete cascade,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  captured_at timestamptz not null default now(),
  available_reviewer_count integer not null default 0,
  assigned_reviewer_count integer not null default 0,
  pending_standard_count integer not null default 0,
  pending_urgent_count integer not null default 0,
  pending_critical_count integer not null default 0,
  overdue_standard_count integer not null default 0,
  overdue_urgent_count integer not null default 0,
  overdue_critical_count integer not null default 0,
  oldest_pending_seconds integer,
  forecast_clear_seconds integer,
  queue_health_status text not null
);

create table if not exists public.ai_ops_human_review_capacity_plans (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid references public.ai_human_review_queues(id) on delete cascade,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  plan_period_start timestamptz not null,
  plan_period_end timestamptz not null,
  expected_review_volume integer not null,
  expected_urgent_volume integer not null default 0,
  expected_critical_volume integer not null default 0,
  expected_average_review_minutes numeric not null,
  required_reviewer_hours numeric not null,
  scheduled_reviewer_hours numeric not null,
  capacity_gap_hours numeric generated always as (required_reviewer_hours - scheduled_reviewer_hours) stored,
  contingency_plan jsonb not null default '{}'::jsonb,
  approved_by uuid references auth.users(id) on delete set null
);

create table if not exists public.ai_cost_centres (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  cost_centre_code text not null unique,
  cost_centre_name text not null,
  owning_team text not null,
  annual_budget numeric,
  monthly_budget numeric,
  warning_threshold_percentage numeric not null default 75,
  critical_threshold_percentage numeric not null default 90,
  currency_code text not null default 'AUD',
  active boolean not null default true
);

create table if not exists public.ai_cost_events (
  id uuid primary key default gen_random_uuid(),
  cost_event_reference text not null unique,
  cost_centre_id uuid references public.ai_cost_centres(id) on delete set null,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  deployment_id uuid references public.ai_model_deployments(id) on delete set null,
  provider_id uuid references public.ai_model_providers(id) on delete set null,
  ai_use_case_id uuid references public.ai_use_cases(id) on delete set null,
  event_date date not null,
  input_token_count bigint not null default 0,
  output_token_count bigint not null default 0,
  embedding_token_count bigint not null default 0,
  audio_seconds numeric not null default 0,
  image_count integer not null default 0,
  document_page_count integer not null default 0,
  compute_units numeric not null default 0,
  storage_gigabyte_hours numeric not null default 0,
  network_gigabytes numeric not null default 0,
  provider_cost numeric not null default 0,
  infrastructure_cost numeric not null default 0,
  licensing_cost numeric not null default 0,
  human_review_cost numeric not null default 0,
  total_cost numeric generated always as (provider_cost + infrastructure_cost + licensing_cost + human_review_cost) stored,
  currency_code text not null default 'AUD',
  recorded_at timestamptz not null default now()
);

create table if not exists public.ai_cost_allocations (
  id uuid primary key default gen_random_uuid(),
  cost_event_id uuid not null references public.ai_cost_events(id) on delete cascade,
  allocation_type text not null,
  allocation_reference text not null,
  allocation_percentage numeric not null check (allocation_percentage >= 0 and allocation_percentage <= 100),
  allocated_cost numeric not null,
  allocation_method text not null
);

create table if not exists public.ai_budget_status_snapshots (
  id uuid primary key default gen_random_uuid(),
  cost_centre_id uuid not null references public.ai_cost_centres(id) on delete cascade,
  budget_period_start date not null,
  budget_period_end date not null,
  budget_amount numeric not null,
  actual_cost numeric not null default 0,
  committed_cost numeric not null default 0,
  forecast_cost numeric,
  budget_consumed_percentage numeric,
  budget_status text not null check (budget_status in ('healthy', 'warning', 'critical', 'exceeded', 'suspended')),
  captured_at timestamptz not null default now()
);

create table if not exists public.ai_cost_anomalies (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  anomaly_reference text not null unique,
  cost_centre_id uuid references public.ai_cost_centres(id) on delete set null,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  anomaly_type text not null,
  anomaly_summary text not null,
  expected_cost numeric,
  observed_cost numeric,
  security_review_required boolean not null default true,
  misuse_review_required boolean not null default true,
  status text not null default 'open',
  detected_at timestamptz not null default now()
);

create table if not exists public.ai_unit_cost_metrics (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  service_id uuid references public.ai_operational_services(id) on delete cascade,
  metric_period_start timestamptz not null,
  metric_period_end timestamptz not null,
  cost_per_request numeric,
  cost_per_valid_output numeric,
  cost_per_human_review numeric,
  cost_per_court_report_section numeric,
  calculated_at timestamptz not null default now()
);

create table if not exists public.ai_provider_service_measurements (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.ai_model_providers(id) on delete cascade,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  measurement_window_start timestamptz not null,
  measurement_window_end timestamptz not null,
  availability_percentage numeric,
  latency_p95_ms numeric,
  failure_rate numeric,
  refusal_rate numeric,
  support_response_minutes numeric,
  provider_status_claim text,
  independently_measured boolean not null default true,
  captured_at timestamptz not null default now()
);

create table if not exists public.ai_provider_sla_assessments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.ai_model_providers(id) on delete cascade,
  assessment_period_start timestamptz not null,
  assessment_period_end timestamptz not null,
  sla_reference text,
  breach_count integer not null default 0,
  material_breach boolean not null default false,
  service_credit_applicable boolean not null default false,
  remediation_required boolean not null default false,
  assessment_summary text not null,
  assessed_at timestamptz not null default now()
);

create table if not exists public.ai_operational_regions (
  id uuid primary key default gen_random_uuid(),
  region_code text not null unique,
  region_name text not null,
  jurisdiction_code text not null,
  approved_data_classes text[] not null default '{}'::text[],
  child_data_approved boolean not null default false,
  failover_approved boolean not null default false,
  status text not null default 'active'
);

create table if not exists public.ai_service_failover_policies (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.ai_operational_services(id) on delete cascade,
  policy_version integer not null,
  primary_region_code text not null references public.ai_operational_regions(region_code) on delete restrict,
  failover_region_codes text[] not null default '{}'::text[],
  failover_trigger_rules jsonb not null default '[]'::jsonb,
  child_data_failover_allowed boolean not null default false,
  automatic_failback_allowed boolean not null default false,
  health_validation_required boolean not null default true,
  approved_by uuid references auth.users(id) on delete set null,
  effective_from timestamptz not null,
  unique (service_id, policy_version)
);

create table if not exists public.ai_service_failover_events (
  id uuid primary key default gen_random_uuid(),
  failover_reference text not null unique,
  service_id uuid references public.ai_operational_services(id) on delete cascade,
  from_region_code text,
  to_region_code text,
  trigger_reason text not null,
  automatic boolean not null default false,
  child_data_involved boolean not null default false,
  governance_approval_checked boolean not null default false,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.ai_service_fallback_configurations (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.ai_operational_services(id) on delete cascade,
  fallback_service_id uuid references public.ai_operational_services(id) on delete set null,
  fallback_mode text not null,
  allowed_workload_codes text[] not null default '{}'::text[],
  reduced_functionality_notice text not null,
  lineage_capture_required boolean not null default true,
  human_review_required boolean not null default true,
  status text not null default 'active'
);

create table if not exists public.ai_fallback_activations (
  id uuid primary key default gen_random_uuid(),
  activation_reference text not null unique,
  service_id uuid references public.ai_operational_services(id) on delete cascade,
  fallback_configuration_id uuid references public.ai_service_fallback_configurations(id) on delete set null,
  activation_reason text not null,
  automatic boolean not null default false,
  activated_by uuid references auth.users(id) on delete set null,
  activated_at timestamptz not null default now(),
  deactivated_at timestamptz,
  status text not null default 'active'
);

create table if not exists public.ai_operational_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_reference text not null unique,
  organisation_id uuid references public.organisations(id) on delete cascade,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  alert_category text not null,
  alert_severity text not null check (alert_severity in ('low', 'medium', 'high', 'critical', 'emergency')),
  alert_summary text not null,
  deduplication_key text,
  status text not null default 'open' check (status in ('open', 'acknowledged', 'grouped', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

create table if not exists public.ai_alert_routing_rules (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  rule_code text not null,
  alert_category text not null,
  minimum_severity text not null,
  assigned_role text not null,
  escalation_interval interval,
  notification_channels text[] not null default '{}'::text[],
  active boolean not null default true,
  unique (organisation_id, rule_code)
);

create table if not exists public.ai_alert_groups (
  id uuid primary key default gen_random_uuid(),
  group_reference text not null unique,
  organisation_id uuid references public.organisations(id) on delete cascade,
  group_key text not null,
  alert_ids uuid[] not null default '{}'::uuid[],
  representative_alert_id uuid references public.ai_operational_alerts(id) on delete set null,
  grouped_count integer not null default 0,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_operational_incident_links (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.ai_operational_alerts(id) on delete cascade,
  incident_id uuid references public.ai_incidents(id) on delete cascade,
  link_reason text not null,
  harm_possible boolean not null default false,
  linked_at timestamptz not null default now(),
  unique (alert_id, incident_id)
);

create table if not exists public.ai_operational_runbooks (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  runbook_code text not null,
  runbook_version integer not null,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  runbook_type text not null,
  title text not null,
  steps jsonb not null default '[]'::jsonb,
  safety_warnings jsonb not null default '[]'::jsonb,
  required_roles text[] not null default '{}'::text[],
  tested_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  status text not null default 'draft',
  unique (organisation_id, runbook_code, runbook_version)
);

create table if not exists public.ai_runbook_executions (
  id uuid primary key default gen_random_uuid(),
  execution_reference text not null unique,
  runbook_id uuid references public.ai_operational_runbooks(id) on delete set null,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  incident_id uuid references public.ai_incidents(id) on delete set null,
  deviation_recorded boolean not null default false,
  deviation_summary text,
  outcome text not null,
  executed_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_maintenance_windows (
  id uuid primary key default gen_random_uuid(),
  maintenance_reference text not null unique,
  organisation_id uuid references public.organisations(id) on delete cascade,
  affected_service_ids uuid[] not null default '{}'::uuid[],
  maintenance_type text not null,
  child_safety_impact_assessed boolean not null default false,
  fallback_plan text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled',
  approved_by uuid references auth.users(id) on delete set null
);

create table if not exists public.ai_maintenance_execution_events (
  id uuid primary key default gen_random_uuid(),
  maintenance_window_id uuid references public.ai_maintenance_windows(id) on delete cascade,
  event_type text not null,
  event_summary text not null,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  executed_by uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create table if not exists public.ai_release_operations (
  id uuid primary key default gen_random_uuid(),
  operation_reference text not null unique,
  organisation_id uuid references public.organisations(id) on delete cascade,
  change_request_id uuid references public.ai_change_requests(id) on delete set null,
  affected_service_ids uuid[] not null default '{}'::uuid[],
  release_window_start timestamptz not null,
  release_window_end timestamptz not null,
  active_incident_check_passed boolean not null default false,
  rollback_test_passed boolean not null default false,
  status text not null default 'planned',
  approved_by uuid references auth.users(id) on delete set null
);

create table if not exists public.ai_release_freezes (
  id uuid primary key default gen_random_uuid(),
  freeze_reference text not null unique,
  organisation_id uuid references public.organisations(id) on delete cascade,
  affected_service_ids uuid[] not null default '{}'::uuid[],
  freeze_reason text not null,
  active boolean not null default true,
  starts_at timestamptz not null,
  ends_at timestamptz,
  authorised_by uuid references auth.users(id) on delete set null
);

create table if not exists public.ai_disaster_recovery_plans (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  dr_plan_code text not null,
  dr_plan_version integer not null,
  service_id uuid references public.ai_operational_services(id) on delete cascade,
  recovery_time_objective interval not null,
  recovery_point_objective interval not null,
  human_fallback_plan text not null,
  model_prompt_workflow_restore_manifest jsonb not null default '{}'::jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  tested_at timestamptz,
  unique (organisation_id, dr_plan_code, dr_plan_version)
);

create table if not exists public.ai_disaster_recovery_exercises (
  id uuid primary key default gen_random_uuid(),
  exercise_reference text not null unique,
  dr_plan_id uuid references public.ai_disaster_recovery_plans(id) on delete cascade,
  exercise_type text not null,
  outcome text not null,
  recovery_time_actual interval,
  findings jsonb not null default '[]'::jsonb,
  remediation_required boolean not null default false,
  conducted_at timestamptz not null default now()
);

create table if not exists public.ai_backup_records (
  id uuid primary key default gen_random_uuid(),
  backup_reference text not null unique,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  backup_type text not null,
  content_manifest jsonb not null default '{}'::jsonb,
  encrypted boolean not null default true,
  integrity_hash text not null,
  storage_reference text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_backup_restore_tests (
  id uuid primary key default gen_random_uuid(),
  restore_test_reference text not null unique,
  backup_record_id uuid references public.ai_backup_records(id) on delete cascade,
  restore_target text not null,
  integrity_verified boolean not null default false,
  restore_successful boolean not null default false,
  findings jsonb not null default '[]'::jsonb,
  tested_at timestamptz not null default now()
);

create table if not exists public.ai_operational_readiness_reviews (
  id uuid primary key default gen_random_uuid(),
  review_reference text not null unique,
  service_id uuid references public.ai_operational_services(id) on delete cascade,
  deployment_id uuid references public.ai_model_deployments(id) on delete set null,
  monitoring_ready boolean not null,
  alerting_ready boolean not null,
  runbooks_ready boolean not null,
  fallback_ready boolean not null,
  rollback_ready boolean not null,
  capacity_ready boolean not null,
  cost_monitoring_ready boolean not null,
  incident_response_ready boolean not null,
  disaster_recovery_ready boolean not null,
  human_review_capacity_ready boolean not null,
  blocking_findings jsonb not null default '[]'::jsonb,
  conditions jsonb not null default '[]'::jsonb,
  readiness_decision text not null check (readiness_decision in ('approved', 'approved_with_conditions', 'rejected', 'deferred')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_operations_shift_handovers (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  handover_reference text not null unique,
  shift_start_at timestamptz not null,
  shift_end_at timestamptz not null,
  outgoing_lead_user_id uuid references auth.users(id) on delete set null,
  incoming_lead_user_id uuid references auth.users(id) on delete set null,
  active_alert_ids uuid[] not null default '{}'::uuid[],
  active_incident_ids uuid[] not null default '{}'::uuid[],
  suspended_deployment_ids uuid[] not null default '{}'::uuid[],
  degraded_service_ids uuid[] not null default '{}'::uuid[],
  planned_maintenance_ids uuid[] not null default '{}'::uuid[],
  priority_actions jsonb not null default '[]'::jsonb,
  known_risks jsonb not null default '[]'::jsonb,
  handover_notes text,
  acknowledged_at timestamptz
);

create table if not exists public.ai_operations_escalations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  escalation_reference text not null unique,
  escalation_type text not null,
  severity text not null,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  alert_id uuid references public.ai_operational_alerts(id) on delete set null,
  incident_id uuid references public.ai_incidents(id) on delete set null,
  escalation_reason text not null,
  assigned_role text not null,
  assigned_user_id uuid references auth.users(id) on delete set null,
  response_due_at timestamptz not null,
  status text not null default 'open',
  escalated_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

create table if not exists public.ai_operational_communications (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  communication_reference text not null unique,
  communication_type text not null,
  audience_type text not null,
  service_ids uuid[] not null default '{}'::uuid[],
  incident_id uuid references public.ai_incidents(id) on delete set null,
  title text not null,
  message_content_reference text not null,
  safe_public_summary text,
  internal_only boolean not null default true,
  delivery_channels text[] not null,
  language_codes text[] not null default '{}'::text[],
  approved_by uuid references auth.users(id) on delete set null,
  scheduled_at timestamptz,
  sent_at timestamptz
);

create table if not exists public.ai_operational_risks (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  risk_reference text not null unique,
  risk_title text not null,
  risk_description text not null,
  affected_service_ids uuid[] not null default '{}'::uuid[],
  affected_deployment_ids uuid[] not null default '{}'::uuid[],
  risk_category text not null,
  likelihood text not null,
  consequence text not null,
  inherent_risk_level text not null,
  existing_controls jsonb not null default '[]'::jsonb,
  control_effectiveness text not null,
  residual_risk_level text not null,
  treatment_actions jsonb not null default '[]'::jsonb,
  treatment_owner_role text not null,
  review_due_at timestamptz,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_provider_concentration_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  provider_id uuid not null references public.ai_model_providers(id) on delete cascade,
  request_percentage numeric not null,
  cost_percentage numeric not null,
  critical_service_percentage numeric not null,
  child_data_processing_percentage numeric not null,
  replacement_provider_available boolean not null default false,
  estimated_migration_days integer,
  concentration_risk_level text not null,
  unique (snapshot_date, provider_id)
);

create table if not exists public.ai_operations_audit_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  event_reference text not null unique,
  event_category text not null,
  event_action text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_service text,
  service_id uuid references public.ai_operational_services(id) on delete set null,
  deployment_id uuid references public.ai_model_deployments(id) on delete set null,
  target_reference text,
  previous_state_hash text,
  new_state_hash text,
  event_metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_ai_operational_services_org_status on public.ai_operational_services(organisation_id, lifecycle_status, criticality);
create index if not exists idx_ai_service_health_events_service_time on public.ai_service_health_events(service_id, observed_at desc);
create index if not exists idx_ai_fleet_members_org_state on public.ai_fleet_members(organisation_id, current_operational_state);
create index if not exists idx_ai_capacity_measurements_service on public.ai_capacity_measurements(service_id, measurement_end desc);
create index if not exists idx_ai_cost_events_date on public.ai_cost_events(event_date, service_id);
create index if not exists idx_ai_operational_alerts_org_status on public.ai_operational_alerts(organisation_id, status, alert_severity);
create index if not exists idx_ai_readiness_reviews_service on public.ai_operational_readiness_reviews(service_id, reviewed_at desc);
create index if not exists idx_ai_operations_audit_org_time on public.ai_operations_audit_events(organisation_id, occurred_at desc);

grant select on public.ai_current_service_health to authenticated;
grant select, insert, update, delete on
  public.ai_operational_services,
  public.ai_service_dependencies,
  public.ai_service_level_objectives,
  public.ai_service_level_indicator_results,
  public.ai_service_error_budgets,
  public.ai_service_health_events,
  public.ai_fleet_members,
  public.ai_fleet_status_snapshots,
  public.ai_service_capacity_profiles,
  public.ai_capacity_measurements,
  public.ai_capacity_forecasts,
  public.ai_workload_classes,
  public.ai_workload_queue_snapshots,
  public.ai_ops_human_review_queue_snapshots,
  public.ai_ops_human_review_capacity_plans,
  public.ai_cost_centres,
  public.ai_cost_events,
  public.ai_cost_allocations,
  public.ai_budget_status_snapshots,
  public.ai_cost_anomalies,
  public.ai_unit_cost_metrics,
  public.ai_provider_service_measurements,
  public.ai_provider_sla_assessments,
  public.ai_operational_regions,
  public.ai_service_failover_policies,
  public.ai_service_failover_events,
  public.ai_service_fallback_configurations,
  public.ai_fallback_activations,
  public.ai_operational_alerts,
  public.ai_alert_routing_rules,
  public.ai_alert_groups,
  public.ai_operational_incident_links,
  public.ai_operational_runbooks,
  public.ai_runbook_executions,
  public.ai_maintenance_windows,
  public.ai_maintenance_execution_events,
  public.ai_release_operations,
  public.ai_release_freezes,
  public.ai_disaster_recovery_plans,
  public.ai_disaster_recovery_exercises,
  public.ai_backup_records,
  public.ai_backup_restore_tests,
  public.ai_operational_readiness_reviews,
  public.ai_operations_shift_handovers,
  public.ai_operations_escalations,
  public.ai_operational_communications,
  public.ai_operational_risks,
  public.ai_provider_concentration_snapshots,
  public.ai_operations_audit_events
to authenticated;

alter table public.ai_operational_services enable row level security;
alter table public.ai_service_dependencies enable row level security;
alter table public.ai_service_level_objectives enable row level security;
alter table public.ai_service_level_indicator_results enable row level security;
alter table public.ai_service_error_budgets enable row level security;
alter table public.ai_service_health_events enable row level security;
alter table public.ai_fleet_members enable row level security;
alter table public.ai_fleet_status_snapshots enable row level security;
alter table public.ai_service_capacity_profiles enable row level security;
alter table public.ai_capacity_measurements enable row level security;
alter table public.ai_capacity_forecasts enable row level security;
alter table public.ai_workload_classes enable row level security;
alter table public.ai_workload_queue_snapshots enable row level security;
alter table public.ai_ops_human_review_queue_snapshots enable row level security;
alter table public.ai_ops_human_review_capacity_plans enable row level security;
alter table public.ai_cost_centres enable row level security;
alter table public.ai_cost_events enable row level security;
alter table public.ai_cost_allocations enable row level security;
alter table public.ai_budget_status_snapshots enable row level security;
alter table public.ai_cost_anomalies enable row level security;
alter table public.ai_unit_cost_metrics enable row level security;
alter table public.ai_provider_service_measurements enable row level security;
alter table public.ai_provider_sla_assessments enable row level security;
alter table public.ai_operational_regions enable row level security;
alter table public.ai_service_failover_policies enable row level security;
alter table public.ai_service_failover_events enable row level security;
alter table public.ai_service_fallback_configurations enable row level security;
alter table public.ai_fallback_activations enable row level security;
alter table public.ai_operational_alerts enable row level security;
alter table public.ai_alert_routing_rules enable row level security;
alter table public.ai_alert_groups enable row level security;
alter table public.ai_operational_incident_links enable row level security;
alter table public.ai_operational_runbooks enable row level security;
alter table public.ai_runbook_executions enable row level security;
alter table public.ai_maintenance_windows enable row level security;
alter table public.ai_maintenance_execution_events enable row level security;
alter table public.ai_release_operations enable row level security;
alter table public.ai_release_freezes enable row level security;
alter table public.ai_disaster_recovery_plans enable row level security;
alter table public.ai_disaster_recovery_exercises enable row level security;
alter table public.ai_backup_records enable row level security;
alter table public.ai_backup_restore_tests enable row level security;
alter table public.ai_operational_readiness_reviews enable row level security;
alter table public.ai_operations_shift_handovers enable row level security;
alter table public.ai_operations_escalations enable row level security;
alter table public.ai_operational_communications enable row level security;
alter table public.ai_operational_risks enable row level security;
alter table public.ai_provider_concentration_snapshots enable row level security;
alter table public.ai_operations_audit_events enable row level security;

create policy "AI operational services managed by operations admins" on public.ai_operational_services for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI fleet members managed by operations admins" on public.ai_fleet_members for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI fleet snapshots managed by operations admins" on public.ai_fleet_status_snapshots for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI cost centres managed by operations admins" on public.ai_cost_centres for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI cost anomalies managed by operations admins" on public.ai_cost_anomalies for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI unit cost metrics managed by operations admins" on public.ai_unit_cost_metrics for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI alert routing rules managed by operations admins" on public.ai_alert_routing_rules for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI operational alerts managed by operations admins" on public.ai_operational_alerts for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI alert groups managed by operations admins" on public.ai_alert_groups for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI runbooks managed by operations admins" on public.ai_operational_runbooks for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI maintenance windows managed by operations admins" on public.ai_maintenance_windows for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI release operations managed by operations admins" on public.ai_release_operations for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI release freezes managed by operations admins" on public.ai_release_freezes for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI DR plans managed by operations admins" on public.ai_disaster_recovery_plans for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI shift handovers managed by operations admins" on public.ai_operations_shift_handovers for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI escalations managed by operations admins" on public.ai_operations_escalations for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI communications managed by operations admins" on public.ai_operational_communications for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));
create policy "AI operational risks managed by operations admins" on public.ai_operational_risks for all to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI service children managed through service" on public.ai_service_dependencies for all to authenticated using (exists (select 1 from public.ai_operational_services s where s.id = parent_service_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_operational_services s where s.id = parent_service_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id)));
create policy "AI SLOs managed through service" on public.ai_service_level_objectives for all to authenticated using (exists (select 1 from public.ai_operational_services s where s.id = service_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_operational_services s where s.id = service_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id)));
create policy "AI SLI results managed through SLO" on public.ai_service_level_indicator_results for all to authenticated using (exists (select 1 from public.ai_service_level_objectives o join public.ai_operational_services s on s.id = o.service_id where o.id = service_level_objective_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_service_level_objectives o join public.ai_operational_services s on s.id = o.service_id where o.id = service_level_objective_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id)));
create policy "AI service-owned records managed through service" on public.ai_service_error_budgets for all to authenticated using (exists (select 1 from public.ai_operational_services s where s.id = service_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_operational_services s where s.id = service_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id)));
create policy "AI service health managed through service" on public.ai_service_health_events for all to authenticated using (exists (select 1 from public.ai_operational_services s where s.id = service_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_operational_services s where s.id = service_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id)));
create policy "AI capacity records managed through service" on public.ai_capacity_measurements for all to authenticated using (exists (select 1 from public.ai_operational_services s where s.id = service_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id))) with check (exists (select 1 from public.ai_operational_services s where s.id = service_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id)));
create policy "AI operational audit readable by operations admins" on public.ai_operations_audit_events for select to authenticated using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id) or public.has_resource_permission(auth.uid(), 'global', null, 'ai_audit.read'));
create policy "AI operational audit appendable by actor" on public.ai_operations_audit_events for insert to authenticated with check (actor_user_id = auth.uid() or public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create or replace function public.can_operationally_activate_ai_service(
  p_service_id uuid,
  p_deployment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_operational_services s
    join public.ai_operational_readiness_reviews r on r.service_id = s.id
    where s.id = p_service_id
      and s.lifecycle_status = 'active'
      and (r.deployment_id = p_deployment_id or p_deployment_id is null)
      and r.readiness_decision in ('approved', 'approved_with_conditions')
      and r.monitoring_ready = true
      and r.alerting_ready = true
      and r.runbooks_ready = true
      and r.fallback_ready = true
      and r.rollback_ready = true
      and r.capacity_ready = true
      and r.incident_response_ready = true
      and r.human_review_capacity_ready = true
      and not exists (
        select 1
        from public.ai_release_freezes rf
        where rf.active = true
          and now() >= rf.starts_at
          and (rf.ends_at is null or now() < rf.ends_at)
          and (p_service_id = any(rf.affected_service_ids) or cardinality(rf.affected_service_ids) = 0)
      )
  );
$$;

create or replace function public.can_route_ai_workload(
  p_service_id uuid,
  p_workload_class_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_operational_services s
    join public.ai_workload_classes wc on wc.id = p_workload_class_id
    join public.ai_current_service_health h on h.service_id = s.id
    where s.id = p_service_id
      and s.lifecycle_status = 'active'
      and (h.health_status = 'healthy' or (h.health_status in ('degraded', 'restricted') and wc.degradable = true))
      and not exists (
        select 1
        from public.ai_incidents i
        where i.status not in ('resolved', 'closed')
          and i.severity in ('high', 'critical')
          and (i.organisation_id = s.organisation_id)
      )
  );
$$;

create or replace function public.should_activate_ai_fallback(
  p_service_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_current_service_health h
    where h.service_id = p_service_id
      and (h.health_status in ('unavailable', 'failed') or h.failure_rate >= 0.20 or h.saturation_percentage >= 95)
  )
  or exists (
    select 1
    from public.ai_operational_alerts a
    where a.service_id = p_service_id
      and a.status = 'open'
      and a.alert_severity in ('critical', 'emergency')
  );
$$;

create or replace function public.is_ai_cost_centre_within_limit(
  p_cost_centre_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select b.budget_status not in ('exceeded', 'suspended')
      from public.ai_budget_status_snapshots b
      where b.cost_centre_id = p_cost_centre_id
      order by b.captured_at desc
      limit 1
    ),
    true
  );
$$;

revoke all on function public.can_operationally_activate_ai_service(uuid, uuid) from public;
revoke all on function public.can_route_ai_workload(uuid, uuid) from public;
revoke all on function public.should_activate_ai_fallback(uuid) from public;
revoke all on function public.is_ai_cost_centre_within_limit(uuid) from public;
grant execute on function public.can_operationally_activate_ai_service(uuid, uuid) to authenticated;
grant execute on function public.can_route_ai_workload(uuid, uuid) to authenticated;
grant execute on function public.should_activate_ai_fallback(uuid) to authenticated;
grant execute on function public.is_ai_cost_centre_within_limit(uuid) to authenticated;

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_operations_centre.manage', 'Manage AI operational services, fleet, SLOs, capacity, cost, failover, runbooks, maintenance, release operations, DR, readiness, risk, and audit.', 'organisation', 'manage_ai_operations_centre', 'high_impact'),
  ('ai_operations_centre.view', 'View AI operations centre dashboards, service health, fleet state, cost summaries, operational risks, and executive-safe operational reports.', 'organisation', 'view_ai_operations_centre', 'standard'),
  ('ai_reliability.manage', 'Manage AI reliability controls, SLOs, error budgets, fallback, failover, recovery, and operational readiness reviews.', 'organisation', 'manage_ai_reliability', 'high_impact'),
  ('ai_cost.manage', 'Manage AI cost centres, allocations, budgets, anomalies, and unit-cost metrics without exposing case-level detail.', 'organisation', 'manage_ai_cost', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.security_roles (role_code, name, description, role_scope, high_privilege)
values
  ('ai_operations_engineer', 'AI Operations Engineer', 'Manages AI production services, fleet health, SLOs, capacity, failover, fallback, runbooks, and recovery operations.', 'organisation', true),
  ('ai_operations_viewer', 'AI Operations Viewer', 'Views AI operations centre service health, alerts, cost summaries, and executive-safe operational reports.', 'organisation', false),
  ('ai_reliability_engineer', 'AI Reliability Engineer', 'Owns AI reliability, error budgets, readiness reviews, disaster recovery, and safe routing gates.', 'organisation', true),
  ('ai_cost_manager', 'AI Cost Manager', 'Manages AI cost governance, budgets, allocation, anomalies, and provider cost reporting.', 'organisation', true)
on conflict (role_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in ('ai_operations_centre.manage', 'ai_reliability.manage', 'ai_operations.manage', 'ai_audit.read')
where r.role_code in ('ai_operations_engineer', 'ai_reliability_engineer')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in ('ai_operations_centre.view', 'ai_audit.read')
where r.role_code = 'ai_operations_viewer'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in ('ai_cost.manage', 'ai_operations_centre.view', 'ai_audit.read')
where r.role_code = 'ai_cost_manager'
on conflict do nothing;
