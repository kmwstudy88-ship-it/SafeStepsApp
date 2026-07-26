create table if not exists public.ai_model_providers (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  provider_code text not null,
  name text not null,
  provider_type text not null check (provider_type in ('cloud_api', 'self_hosted', 'local_device', 'rules_engine', 'human_only')),
  data_processing_region text,
  data_residency_notes text,
  child_data_allowed boolean not null default false,
  sensitive_data_allowed boolean not null default false,
  retention_policy text not null default 'no_training_no_retention',
  contract_reference text,
  status text not null default 'under_review' check (status in ('under_review', 'approved', 'suspended', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, provider_code)
);

create table if not exists public.ai_models (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  provider_id uuid not null references public.ai_model_providers(id) on delete restrict,
  model_code text not null,
  display_name text not null,
  model_family text not null,
  modality text[] not null default array['text']::text[],
  intended_use text not null,
  prohibited_use text not null,
  child_data_allowed boolean not null default false,
  safety_critical_allowed boolean not null default false,
  court_output_allowed boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'under_review', 'approved', 'suspended', 'retired')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, model_code)
);

create table if not exists public.ai_model_versions (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.ai_models(id) on delete cascade,
  version_label text not null,
  provider_version text,
  release_notes text,
  context_window_tokens integer,
  input_modalities text[] not null default array['text']::text[],
  output_modalities text[] not null default array['text']::text[],
  training_cutoff text,
  known_limitations text,
  safety_profile jsonb not null default '{}'::jsonb,
  evaluation_summary jsonb not null default '{}'::jsonb,
  status text not null default 'candidate' check (status in ('candidate', 'approved', 'deployed', 'deprecated', 'rolled_back', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (model_id, version_label)
);

create table if not exists public.ai_model_use_case_approvals (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid not null references public.ai_model_versions(id) on delete cascade,
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'blocked', 'suspended', 'retired')),
  approval_scope text not null default 'assistive_only',
  required_guardrails text[] not null default '{}'::text[],
  fallback_required boolean not null default true,
  human_review_required boolean not null default true,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (model_version_id, use_case_id)
);

create table if not exists public.ai_model_deployments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  model_version_id uuid not null references public.ai_model_versions(id) on delete restrict,
  deployment_code text not null,
  environment text not null check (environment in ('development', 'staging', 'production')),
  endpoint_reference text,
  traffic_percentage numeric(5,2) not null default 0 check (traffic_percentage >= 0 and traffic_percentage <= 100),
  deployment_status text not null default 'planned' check (deployment_status in ('planned', 'active', 'paused', 'rolled_back', 'retired')),
  deployed_by uuid references auth.users(id) on delete set null,
  deployed_at timestamptz,
  rollback_version_id uuid references public.ai_model_versions(id) on delete restrict,
  rollback_plan text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, deployment_code, environment)
);

create table if not exists public.ai_model_rollout_steps (
  id uuid primary key default gen_random_uuid(),
  deployment_id uuid not null references public.ai_model_deployments(id) on delete cascade,
  step_order integer not null,
  target_percentage numeric(5,2) not null check (target_percentage >= 0 and target_percentage <= 100),
  entry_criteria text not null,
  exit_criteria text not null,
  monitoring_window interval not null default interval '24 hours',
  gate_status text not null default 'pending' check (gate_status in ('pending', 'passed', 'failed', 'waived', 'blocked')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (deployment_id, step_order)
);

create table if not exists public.ai_model_compatibility_records (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid not null references public.ai_model_versions(id) on delete cascade,
  compatible_with_type text not null check (compatible_with_type in ('prompt_template', 'workflow_template', 'use_case', 'guardrail_set', 'evaluation_suite', 'client_app')),
  compatible_with_id uuid,
  compatible_with_code text,
  compatibility_status text not null default 'untested' check (compatibility_status in ('untested', 'compatible', 'compatible_with_limits', 'incompatible', 'deprecated')),
  notes text,
  tested_by uuid references auth.users(id) on delete set null,
  tested_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_model_retirement_events (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid not null references public.ai_model_versions(id) on delete restrict,
  retirement_type text not null check (retirement_type in ('planned_retirement', 'provider_deprecation', 'safety_retirement', 'performance_retirement', 'replacement')),
  reason text not null,
  replacement_model_version_id uuid references public.ai_model_versions(id) on delete set null,
  effective_at timestamptz not null,
  user_notification_required boolean not null default false,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_model_rollback_events (
  id uuid primary key default gen_random_uuid(),
  deployment_id uuid not null references public.ai_model_deployments(id) on delete restrict,
  from_model_version_id uuid not null references public.ai_model_versions(id) on delete restrict,
  to_model_version_id uuid references public.ai_model_versions(id) on delete restrict,
  rollback_reason text not null,
  trigger_type text not null check (trigger_type in ('manual', 'release_gate_failure', 'incident', 'monitoring_alert', 'provider_issue')),
  impact_summary text,
  initiated_by uuid references auth.users(id) on delete set null,
  initiated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_model_lifecycle_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  organisation_id uuid references public.organisations(id) on delete set null,
  event_type text not null,
  model_id uuid references public.ai_models(id) on delete set null,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  deployment_id uuid references public.ai_model_deployments(id) on delete set null,
  event_payload jsonb not null default '{}'::jsonb,
  correlation_id uuid,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_ai_model_providers_org_status on public.ai_model_providers(organisation_id, status);
create index if not exists idx_ai_models_org_status on public.ai_models(organisation_id, status);
create index if not exists idx_ai_model_versions_model_status on public.ai_model_versions(model_id, status);
create index if not exists idx_ai_model_use_case_approvals_use_case on public.ai_model_use_case_approvals(use_case_id, approval_status);
create index if not exists idx_ai_model_deployments_org_env on public.ai_model_deployments(organisation_id, environment, deployment_status);
create index if not exists idx_ai_model_rollout_steps_deployment on public.ai_model_rollout_steps(deployment_id, step_order);
create index if not exists idx_ai_model_compatibility_records_version on public.ai_model_compatibility_records(model_version_id, compatibility_status);
create index if not exists idx_ai_model_lifecycle_audit_org_time on public.ai_model_lifecycle_audit_events(organisation_id, occurred_at desc);

create or replace function public.safesteps_can_manage_ai_model_lifecycle(
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
    or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'ai_model_lifecycle.manage')
    or public.has_resource_permission(p_user_id, 'global', null, 'ai_model_lifecycle.manage'),
    false
  );
$$;

revoke all on function public.safesteps_can_manage_ai_model_lifecycle(uuid, uuid) from public;
grant execute on function public.safesteps_can_manage_ai_model_lifecycle(uuid, uuid) to authenticated;

alter table public.ai_model_providers enable row level security;
alter table public.ai_models enable row level security;
alter table public.ai_model_versions enable row level security;
alter table public.ai_model_use_case_approvals enable row level security;
alter table public.ai_model_deployments enable row level security;
alter table public.ai_model_rollout_steps enable row level security;
alter table public.ai_model_compatibility_records enable row level security;
alter table public.ai_model_retirement_events enable row level security;
alter table public.ai_model_rollback_events enable row level security;
alter table public.ai_model_lifecycle_audit_events enable row level security;

create policy "AI model providers managed by lifecycle admins"
  on public.ai_model_providers
  for all
  to authenticated
  using (public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id))
  with check (public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id));

create policy "AI models managed by lifecycle admins"
  on public.ai_models
  for all
  to authenticated
  using (public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id))
  with check (public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id));

create policy "AI model versions managed through parent model"
  on public.ai_model_versions
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_models m
      where m.id = model_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_models m
      where m.id = model_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)
    )
  );

create policy "AI model use case approvals managed through use case"
  on public.ai_model_use_case_approvals
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), u.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), u.organisation_id)
    )
  );

create policy "AI model deployments managed by lifecycle admins"
  on public.ai_model_deployments
  for all
  to authenticated
  using (public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id))
  with check (public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id));

create policy "AI rollout steps managed through deployment"
  on public.ai_model_rollout_steps
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_model_deployments d
      where d.id = deployment_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), d.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_model_deployments d
      where d.id = deployment_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), d.organisation_id)
    )
  );

create policy "AI compatibility records managed through model version"
  on public.ai_model_compatibility_records
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_model_versions mv
      join public.ai_models m on m.id = mv.model_id
      where mv.id = model_version_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_model_versions mv
      join public.ai_models m on m.id = mv.model_id
      where mv.id = model_version_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)
    )
  );

create policy "AI retirement events managed through model version"
  on public.ai_model_retirement_events
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_model_versions mv
      join public.ai_models m on m.id = mv.model_id
      where mv.id = model_version_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_model_versions mv
      join public.ai_models m on m.id = mv.model_id
      where mv.id = model_version_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)
    )
  );

create policy "AI rollback events managed through deployment"
  on public.ai_model_rollback_events
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_model_deployments d
      where d.id = deployment_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), d.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_model_deployments d
      where d.id = deployment_id
        and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), d.organisation_id)
    )
  );

create policy "AI model lifecycle audit readable by lifecycle admins"
  on public.ai_model_lifecycle_audit_events
  for select
  to authenticated
  using (
    public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id)
    or public.has_resource_permission(auth.uid(), 'global', null, 'ai_audit.read')
  );

create policy "AI model lifecycle audit appendable by actor"
  on public.ai_model_lifecycle_audit_events
  for insert
  to authenticated
  with check (actor_user_id = auth.uid());

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_model_lifecycle.manage', 'Manage AI providers, model registry, versions, deployments, rollback, retirement, and compatibility records.', 'organisation', 'manage_ai_model_lifecycle', 'high_impact'),
  ('ai_model_deployment.approve', 'Approve AI model deployments, rollout steps, rollback plans, and production release changes.', 'organisation', 'approve_ai_model_deployment', 'high_impact'),
  ('ai_model_compatibility.review', 'Review AI model compatibility against use cases, prompt templates, workflows, guardrails, and client releases.', 'organisation', 'review_ai_model_compatibility', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.security_roles (role_code, name, description, role_scope, high_privilege)
values
  ('ai_model_lifecycle_manager', 'AI Model Lifecycle Manager', 'Responsible for SafeSteps model registry, version approvals, deployments, rollback, retirement, and compatibility tracking.', 'organisation', true)
on conflict (role_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_model_lifecycle.manage',
  'ai_model_deployment.approve',
  'ai_model_compatibility.review',
  'ai_risk_assessment.review',
  'ai_audit.read'
)
where r.role_code = 'ai_model_lifecycle_manager'
on conflict do nothing;

insert into public.ai_model_providers (
  provider_code,
  name,
  provider_type,
  data_processing_region,
  data_residency_notes,
  child_data_allowed,
  sensitive_data_allowed,
  retention_policy,
  status
)
values
  ('human_only', 'Human-only workflow', 'human_only', 'not_applicable', 'Used when a workflow must not invoke model inference.', false, false, 'no_model_processing', 'approved'),
  ('local_rules_engine', 'SafeSteps local rules engine', 'rules_engine', 'local_application', 'Deterministic SafeSteps policy and boundary checks without external model processing.', true, true, 'no_external_retention', 'approved')
on conflict (organisation_id, provider_code) do update
set name = excluded.name,
    provider_type = excluded.provider_type,
    data_processing_region = excluded.data_processing_region,
    data_residency_notes = excluded.data_residency_notes,
    child_data_allowed = excluded.child_data_allowed,
    sensitive_data_allowed = excluded.sensitive_data_allowed,
    retention_policy = excluded.retention_policy,
    status = excluded.status,
    updated_at = now();
