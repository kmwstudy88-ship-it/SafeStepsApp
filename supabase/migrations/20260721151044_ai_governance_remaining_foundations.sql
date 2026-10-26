create table if not exists public.ai_training_datasets (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  dataset_code text not null,
  name text not null,
  description text not null,
  dataset_category text not null check (dataset_category in ('evaluation', 'retrieval', 'fine_tuning', 'calibration', 'red_team', 'fairness_testing', 'monitoring_sample')),
  source_system text not null,
  provenance_summary text not null,
  contains_child_data boolean not null default false,
  contains_sensitive_data boolean not null default true,
  consent_basis text not null default 'not_applicable',
  de_identification_status text not null default 'not_assessed' check (de_identification_status in ('not_assessed', 'not_required', 'pending', 'completed', 'failed')),
  quality_status text not null default 'pending' check (quality_status in ('pending', 'approved', 'rejected', 'retired')),
  retention_classification text not null default 'governance_record',
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, dataset_code)
);

create table if not exists public.ai_dataset_records (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.ai_training_datasets(id) on delete cascade,
  source_record_type text not null,
  source_record_id uuid,
  source_reference text,
  included_at timestamptz not null default now(),
  inclusion_reason text not null,
  consent_record_id uuid,
  de_identified boolean not null default false,
  exclusion_required boolean not null default false,
  exclusion_reason text,
  unique (dataset_id, source_record_type, source_record_id, source_reference)
);

create table if not exists public.ai_dataset_quality_checks (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.ai_training_datasets(id) on delete cascade,
  check_type text not null check (check_type in ('provenance', 'consent', 'de_identification', 'bias', 'label_quality', 'duplication', 'child_data_restriction', 'retention')),
  check_status text not null check (check_status in ('passed', 'failed', 'needs_review', 'waived')),
  findings jsonb not null default '{}'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_inference_policies (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  policy_code text not null,
  name text not null,
  use_case_id uuid references public.ai_use_cases(id) on delete cascade,
  default_model_version_id uuid references public.ai_model_versions(id) on delete restrict,
  fallback_model_version_id uuid references public.ai_model_versions(id) on delete restrict,
  local_processing_required boolean not null default false,
  cloud_processing_allowed boolean not null default false,
  child_data_allowed boolean not null default false,
  max_retries integer not null default 1 check (max_retries >= 0 and max_retries <= 5),
  min_confidence numeric(5,2) not null default 0 check (min_confidence >= 0 and min_confidence <= 100),
  uncertainty_action text not null default 'route_to_human_review' check (uncertainty_action in ('allow_with_label', 'retry', 'fallback', 'route_to_human_review', 'block')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'suspended', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, policy_code)
);

create table if not exists public.ai_inference_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  use_case_id uuid references public.ai_use_cases(id) on delete set null,
  inference_policy_id uuid references public.ai_inference_policies(id) on delete set null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete set null,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  request_status text not null default 'queued' check (request_status in ('queued', 'running', 'completed', 'failed', 'blocked', 'cancelled')),
  input_classification text not null default 'sensitive',
  contains_child_data boolean not null default false,
  confidence numeric(5,2) check (confidence is null or (confidence >= 0 and confidence <= 100)),
  uncertainty_flags text[] not null default '{}'::text[],
  output_summary text,
  failure_reason text,
  correlation_id uuid,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_guardrail_sets (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  guardrail_code text not null,
  name text not null,
  description text not null,
  guardrail_category text not null check (guardrail_category in ('hallucination', 'prohibited_output', 'prompt_injection', 'jailbreak', 'sensitive_topic', 'child_safety', 'privacy', 'court_output')),
  enforcement_level text not null default 'blocking' check (enforcement_level in ('advisory', 'review_required', 'blocking')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'suspended', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, guardrail_code)
);

create table if not exists public.ai_guardrail_rules (
  id uuid primary key default gen_random_uuid(),
  guardrail_set_id uuid not null references public.ai_guardrail_sets(id) on delete cascade,
  rule_code text not null,
  rule_name text not null,
  rule_definition jsonb not null default '{}'::jsonb,
  blocked_output_message text,
  requires_human_review boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (guardrail_set_id, rule_code)
);

create table if not exists public.ai_guardrail_evaluations (
  id uuid primary key default gen_random_uuid(),
  inference_request_id uuid references public.ai_inference_requests(id) on delete cascade,
  guardrail_rule_id uuid references public.ai_guardrail_rules(id) on delete set null,
  evaluation_status text not null check (evaluation_status in ('passed', 'failed', 'needs_review', 'not_applicable')),
  severity text not null default 'major' check (severity in ('minor', 'major', 'critical')),
  finding_summary text not null,
  evidence jsonb not null default '{}'::jsonb,
  evaluated_at timestamptz not null default now()
);

create table if not exists public.ai_fairness_test_suites (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  suite_code text not null,
  name text not null,
  description text not null,
  fairness_domain text not null check (fairness_domain in ('culture', 'disability', 'neurodiversity', 'language', 'gender', 'age', 'socioeconomic', 'intersectional')),
  minimum_parity_threshold numeric(5,2) not null default 90 check (minimum_parity_threshold >= 0 and minimum_parity_threshold <= 100),
  status text not null default 'draft' check (status in ('draft', 'approved', 'retired')),
  created_at timestamptz not null default now(),
  unique (organisation_id, suite_code)
);

create table if not exists public.ai_fairness_test_results (
  id uuid primary key default gen_random_uuid(),
  suite_id uuid not null references public.ai_fairness_test_suites(id) on delete cascade,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete set null,
  parity_score numeric(5,2) check (parity_score is null or (parity_score >= 0 and parity_score <= 100)),
  result_status text not null check (result_status in ('passed', 'failed', 'needs_review', 'waived')),
  findings jsonb not null default '{}'::jsonb,
  mitigation_required boolean not null default false,
  tested_by uuid references auth.users(id) on delete set null,
  tested_at timestamptz not null default now()
);

create table if not exists public.ai_explanation_records (
  id uuid primary key default gen_random_uuid(),
  inference_request_id uuid references public.ai_inference_requests(id) on delete cascade,
  report_id uuid references public.reports(id) on delete set null,
  explanation_type text not null check (explanation_type in ('confidence', 'uncertainty', 'evidence_citation', 'reasoning_provenance', 'decision_trace', 'source_limitation')),
  explanation_text text not null,
  source_references jsonb not null default '[]'::jsonb,
  confidence numeric(5,2) check (confidence is null or (confidence >= 0 and confidence <= 100)),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_human_review_queues (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  queue_code text not null,
  name text not null,
  review_domain text not null check (review_domain in ('safety', 'privacy', 'fairness', 'reporting', 'model_risk', 'incident', 'general')),
  required_role_code text,
  second_review_required boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organisation_id, queue_code)
);

create table if not exists public.ai_human_review_items (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references public.ai_human_review_queues(id) on delete cascade,
  inference_request_id uuid references public.ai_inference_requests(id) on delete set null,
  subject_type text not null,
  subject_id uuid,
  priority text not null default 'standard' check (priority in ('low', 'standard', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'assigned', 'resolved', 'escalated', 'closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.ai_human_review_decisions (
  id uuid primary key default gen_random_uuid(),
  review_item_id uuid not null references public.ai_human_review_items(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  decision text not null check (decision in ('approve', 'reject', 'override', 'request_changes', 'escalate', 'second_review_required')),
  rationale text not null,
  override_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_model_monitoring_metrics (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  model_version_id uuid references public.ai_model_versions(id) on delete cascade,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete set null,
  metric_name text not null,
  metric_category text not null check (metric_category in ('accuracy', 'drift', 'latency', 'hallucination', 'calibration', 'safety', 'fairness', 'availability')),
  metric_value numeric not null,
  threshold_value numeric,
  threshold_status text not null default 'within_threshold' check (threshold_status in ('within_threshold', 'warning', 'breach')),
  measured_at timestamptz not null default now()
);

create table if not exists public.ai_monitoring_alerts (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  metric_id uuid references public.ai_model_monitoring_metrics(id) on delete set null,
  alert_type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'acknowledged', 'resolved', 'dismissed')),
  summary text not null,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.ai_incidents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  incident_reference text not null unique,
  incident_type text not null check (incident_type in ('harmful_output', 'model_failure', 'privacy_breach', 'bias_or_fairness', 'hallucination', 'security_attack', 'release_failure', 'provider_outage')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'investigating', 'contained', 'resolved', 'closed')),
  summary text not null,
  user_notification_required boolean not null default false,
  regulator_notification_required boolean not null default false,
  rollback_required boolean not null default false,
  opened_by uuid references auth.users(id) on delete set null,
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.ai_incident_actions (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.ai_incidents(id) on delete cascade,
  action_type text not null check (action_type in ('containment', 'rollback', 'user_notification', 'investigation', 'corrective_action', 'policy_update', 'monitoring_update')),
  action_status text not null default 'pending' check (action_status in ('pending', 'in_progress', 'completed', 'cancelled')),
  action_summary text not null,
  responsible_user_id uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_compliance_exports (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  export_reference text not null unique,
  export_type text not null check (export_type in ('regulator', 'court', 'internal_audit', 'incident', 'model_history', 'prompt_history', 'output_lineage')),
  scope jsonb not null default '{}'::jsonb,
  generated_by uuid references auth.users(id) on delete set null,
  generated_at timestamptz not null default now(),
  file_path text,
  checksum text,
  status text not null default 'generated' check (status in ('generated', 'released', 'withdrawn'))
);

create table if not exists public.ai_output_lineage_records (
  id uuid primary key default gen_random_uuid(),
  inference_request_id uuid references public.ai_inference_requests(id) on delete cascade,
  output_type text not null,
  output_subject_type text,
  output_subject_id uuid,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete set null,
  source_references jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_training_datasets_org_status on public.ai_training_datasets(organisation_id, quality_status);
create index if not exists idx_ai_dataset_records_dataset on public.ai_dataset_records(dataset_id);
create index if not exists idx_ai_inference_policies_org_status on public.ai_inference_policies(organisation_id, status);
create index if not exists idx_ai_inference_requests_org_time on public.ai_inference_requests(organisation_id, requested_at desc);
create index if not exists idx_ai_guardrail_sets_org_status on public.ai_guardrail_sets(organisation_id, status);
create index if not exists idx_ai_guardrail_evaluations_request on public.ai_guardrail_evaluations(inference_request_id);
create index if not exists idx_ai_fairness_results_suite on public.ai_fairness_test_results(suite_id, tested_at desc);
create index if not exists idx_ai_review_items_queue_status on public.ai_human_review_items(queue_id, status, priority);
create index if not exists idx_ai_monitoring_metrics_org_time on public.ai_model_monitoring_metrics(organisation_id, measured_at desc);
create index if not exists idx_ai_incidents_org_status on public.ai_incidents(organisation_id, status, severity);
create index if not exists idx_ai_output_lineage_request on public.ai_output_lineage_records(inference_request_id);

create or replace function public.safesteps_can_manage_ai_operations(
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
    or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'ai_operations.manage')
    or public.has_resource_permission(p_user_id, 'global', null, 'ai_operations.manage'),
    false
  );
$$;

revoke all on function public.safesteps_can_manage_ai_operations(uuid, uuid) from public;
grant execute on function public.safesteps_can_manage_ai_operations(uuid, uuid) to authenticated;

alter table public.ai_training_datasets enable row level security;
alter table public.ai_dataset_records enable row level security;
alter table public.ai_dataset_quality_checks enable row level security;
alter table public.ai_inference_policies enable row level security;
alter table public.ai_inference_requests enable row level security;
alter table public.ai_guardrail_sets enable row level security;
alter table public.ai_guardrail_rules enable row level security;
alter table public.ai_guardrail_evaluations enable row level security;
alter table public.ai_fairness_test_suites enable row level security;
alter table public.ai_fairness_test_results enable row level security;
alter table public.ai_explanation_records enable row level security;
alter table public.ai_human_review_queues enable row level security;
alter table public.ai_human_review_items enable row level security;
alter table public.ai_human_review_decisions enable row level security;
alter table public.ai_model_monitoring_metrics enable row level security;
alter table public.ai_monitoring_alerts enable row level security;
alter table public.ai_incidents enable row level security;
alter table public.ai_incident_actions enable row level security;
alter table public.ai_compliance_exports enable row level security;
alter table public.ai_output_lineage_records enable row level security;

create policy "AI datasets managed by operations admins" on public.ai_training_datasets for all to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI dataset records managed through dataset" on public.ai_dataset_records for all to authenticated
using (exists (select 1 from public.ai_training_datasets d where d.id = dataset_id and public.safesteps_can_manage_ai_operations(auth.uid(), d.organisation_id)))
with check (exists (select 1 from public.ai_training_datasets d where d.id = dataset_id and public.safesteps_can_manage_ai_operations(auth.uid(), d.organisation_id)));

create policy "AI dataset checks managed through dataset" on public.ai_dataset_quality_checks for all to authenticated
using (exists (select 1 from public.ai_training_datasets d where d.id = dataset_id and public.safesteps_can_manage_ai_operations(auth.uid(), d.organisation_id)))
with check (exists (select 1 from public.ai_training_datasets d where d.id = dataset_id and public.safesteps_can_manage_ai_operations(auth.uid(), d.organisation_id)));

create policy "AI inference policies managed by operations admins" on public.ai_inference_policies for all to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI inference requests readable by operations admins or requester" on public.ai_inference_requests for select to authenticated
using (requested_by = auth.uid() or public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI inference requests insertable by requester" on public.ai_inference_requests for insert to authenticated
with check (requested_by = auth.uid());

create policy "AI inference requests managed by operations admins" on public.ai_inference_requests for update to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI guardrail sets managed by operations admins" on public.ai_guardrail_sets for all to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI guardrail rules managed through set" on public.ai_guardrail_rules for all to authenticated
using (exists (select 1 from public.ai_guardrail_sets s where s.id = guardrail_set_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id)))
with check (exists (select 1 from public.ai_guardrail_sets s where s.id = guardrail_set_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id)));

create policy "AI guardrail evaluations managed through request" on public.ai_guardrail_evaluations for all to authenticated
using (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and (r.requested_by = auth.uid() or public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id))))
with check (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id)));

create policy "AI fairness suites managed by operations admins" on public.ai_fairness_test_suites for all to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI fairness results managed through suite" on public.ai_fairness_test_results for all to authenticated
using (exists (select 1 from public.ai_fairness_test_suites s where s.id = suite_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id)))
with check (exists (select 1 from public.ai_fairness_test_suites s where s.id = suite_id and public.safesteps_can_manage_ai_operations(auth.uid(), s.organisation_id)));

create policy "AI explanations readable through request" on public.ai_explanation_records for select to authenticated
using (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and (r.requested_by = auth.uid() or public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id))));

create policy "AI explanations insertable by operations admins" on public.ai_explanation_records for insert to authenticated
with check (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id)));

create policy "AI review queues managed by operations admins" on public.ai_human_review_queues for all to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI review items managed through queue" on public.ai_human_review_items for all to authenticated
using (exists (select 1 from public.ai_human_review_queues q where q.id = queue_id and public.safesteps_can_manage_ai_operations(auth.uid(), q.organisation_id)))
with check (exists (select 1 from public.ai_human_review_queues q where q.id = queue_id and public.safesteps_can_manage_ai_operations(auth.uid(), q.organisation_id)));

create policy "AI review decisions managed through queue" on public.ai_human_review_decisions for all to authenticated
using (exists (select 1 from public.ai_human_review_items i join public.ai_human_review_queues q on q.id = i.queue_id where i.id = review_item_id and public.safesteps_can_manage_ai_operations(auth.uid(), q.organisation_id)))
with check (exists (select 1 from public.ai_human_review_items i join public.ai_human_review_queues q on q.id = i.queue_id where i.id = review_item_id and public.safesteps_can_manage_ai_operations(auth.uid(), q.organisation_id)));

create policy "AI monitoring metrics managed by operations admins" on public.ai_model_monitoring_metrics for all to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI monitoring alerts managed by operations admins" on public.ai_monitoring_alerts for all to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI incidents managed by operations admins" on public.ai_incidents for all to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI incident actions managed through incident" on public.ai_incident_actions for all to authenticated
using (exists (select 1 from public.ai_incidents i where i.id = incident_id and public.safesteps_can_manage_ai_operations(auth.uid(), i.organisation_id)))
with check (exists (select 1 from public.ai_incidents i where i.id = incident_id and public.safesteps_can_manage_ai_operations(auth.uid(), i.organisation_id)));

create policy "AI compliance exports managed by operations admins" on public.ai_compliance_exports for all to authenticated
using (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id))
with check (public.safesteps_can_manage_ai_operations(auth.uid(), organisation_id));

create policy "AI output lineage readable through request" on public.ai_output_lineage_records for select to authenticated
using (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and (r.requested_by = auth.uid() or public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id))));

create policy "AI output lineage insertable by operations admins" on public.ai_output_lineage_records for insert to authenticated
with check (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id)));

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_operations.manage', 'Manage AI training data governance, inference routing, guardrails, fairness tests, human review, monitoring, incidents, and compliance exports.', 'organisation', 'manage_ai_operations', 'high_impact'),
  ('ai_inference.review', 'Review AI inference requests, uncertainty, guardrail findings, explanations, and output lineage.', 'organisation', 'review_ai_inference', 'high_impact'),
  ('ai_incident.manage', 'Manage AI incidents, containment actions, rollback coordination, notifications, and corrective actions.', 'organisation', 'manage_ai_incident', 'high_impact'),
  ('ai_compliance.export', 'Generate and release AI governance, model history, prompt history, incident, and output-lineage exports.', 'organisation', 'export_ai_compliance', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.security_roles (role_code, name, description, role_scope, high_privilege)
values
  ('ai_operations_manager', 'AI Operations Manager', 'Responsible for AI operational governance across data, inference, guardrails, fairness, review, monitoring, incidents, and compliance exports.', 'organisation', true),
  ('ai_incident_manager', 'AI Incident Manager', 'Responsible for AI incident response, containment, notification, rollback coordination, and corrective actions.', 'organisation', true)
on conflict (role_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_operations.manage',
  'ai_inference.review',
  'ai_compliance.export',
  'ai_audit.read'
)
where r.role_code = 'ai_operations_manager'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_incident.manage',
  'ai_model_deployment.approve',
  'ai_audit.read'
)
where r.role_code = 'ai_incident_manager'
on conflict do nothing;

insert into public.ai_guardrail_sets (guardrail_code, name, description, guardrail_category, enforcement_level, status)
values
  ('child_safety_blocking', 'Child safety blocking guardrails', 'Blocks autonomous child-safety decisions, private child disclosure, and unsafe normalisation of critical concerns.', 'child_safety', 'blocking', 'approved'),
  ('court_output_source_control', 'Court output source-control guardrails', 'Requires source separation, citations, uncertainty labels, and human approval before court-facing release.', 'court_output', 'blocking', 'approved'),
  ('prompt_injection_defense', 'Prompt injection defense guardrails', 'Detects instruction override attempts, hidden prompt extraction, and unsafe tool-use requests.', 'prompt_injection', 'blocking', 'approved'),
  ('hallucination_review', 'Hallucination review guardrails', 'Routes unsupported factual claims, missing citations, and overconfident summaries to human review.', 'hallucination', 'review_required', 'approved')
on conflict (organisation_id, guardrail_code) do update
set name = excluded.name,
    description = excluded.description,
    guardrail_category = excluded.guardrail_category,
    enforcement_level = excluded.enforcement_level,
    status = excluded.status,
    updated_at = now();
