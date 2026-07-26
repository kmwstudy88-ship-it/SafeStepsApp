create table if not exists public.ai_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  prompt_code text not null,
  name text not null,
  description text not null,
  prompt_category text not null check (prompt_category in ('system', 'developer', 'user_task', 'evaluation', 'safety_guardrail', 'explanation', 'report_drafting', 'translation_accessibility', 'workflow_control')),
  owner_team text,
  use_case_id uuid references public.ai_use_cases(id) on delete set null,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  child_data_allowed boolean not null default false,
  court_output_allowed boolean not null default false,
  safety_critical_allowed boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'under_review', 'approved', 'suspended', 'retired')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, prompt_code)
);

create table if not exists public.ai_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_template_id uuid not null references public.ai_prompt_templates(id) on delete cascade,
  version integer not null,
  prompt_body text not null,
  variable_schema jsonb not null default '{}'::jsonb,
  output_contract jsonb not null default '{}'::jsonb,
  prohibited_content_rules text[] not null default '{}'::text[],
  required_citations boolean not null default false,
  uncertainty_statement_required boolean not null default true,
  human_review_required boolean not null default true,
  change_summary text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'deprecated', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  effective_from timestamptz,
  retired_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (prompt_template_id, version)
);

create table if not exists public.ai_prompt_approval_records (
  id uuid primary key default gen_random_uuid(),
  prompt_version_id uuid not null references public.ai_prompt_versions(id) on delete cascade,
  approval_stage text not null check (approval_stage in ('content_owner', 'safety_review', 'privacy_review', 'fairness_review', 'legal_review', 'model_risk_review', 'release_approval')),
  decision text not null check (decision in ('approved', 'rejected', 'needs_changes', 'waived')),
  rationale text not null,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (prompt_version_id, approval_stage)
);

create table if not exists public.ai_workflow_templates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  workflow_code text not null,
  name text not null,
  description text not null,
  use_case_id uuid references public.ai_use_cases(id) on delete set null,
  workflow_category text not null check (workflow_category in ('content_support', 'case_summary', 'report_drafting', 'risk_triage_support', 'translation_accessibility', 'education_personalisation', 'quality_assurance', 'administration')),
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  human_review_required boolean not null default true,
  second_review_required boolean not null default false,
  appeal_path_required boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'under_review', 'approved', 'suspended', 'retired')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, workflow_code)
);

create table if not exists public.ai_workflow_versions (
  id uuid primary key default gen_random_uuid(),
  workflow_template_id uuid not null references public.ai_workflow_templates(id) on delete cascade,
  version integer not null,
  workflow_spec jsonb not null default '{}'::jsonb,
  input_contract jsonb not null default '{}'::jsonb,
  output_contract jsonb not null default '{}'::jsonb,
  required_release_gates text[] not null default '{}'::text[],
  required_guardrails text[] not null default '{}'::text[],
  fallback_strategy text not null,
  change_summary text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'deprecated', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  effective_from timestamptz,
  retired_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (workflow_template_id, version)
);

create table if not exists public.ai_workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_version_id uuid not null references public.ai_workflow_versions(id) on delete cascade,
  step_order integer not null,
  step_code text not null,
  step_name text not null,
  step_type text not null check (step_type in ('input_validation', 'prompt_call', 'rules_check', 'retrieval', 'redaction', 'human_review', 'output_validation', 'audit_write', 'fallback', 'notification')),
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete restrict,
  model_version_id uuid references public.ai_model_versions(id) on delete restrict,
  required boolean not null default true,
  step_config jsonb not null default '{}'::jsonb,
  failure_behavior text not null default 'stop_and_route_to_review' check (failure_behavior in ('continue', 'retry', 'fallback', 'stop_and_route_to_review', 'block')),
  created_at timestamptz not null default now(),
  unique (workflow_version_id, step_order),
  unique (workflow_version_id, step_code)
);

create table if not exists public.ai_evaluation_prompt_sets (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  evaluation_code text not null,
  name text not null,
  description text not null,
  evaluation_type text not null check (evaluation_type in ('regression', 'safety', 'hallucination', 'fairness', 'privacy', 'explainability', 'court_output', 'accessibility')),
  minimum_pass_rate numeric(5,2) not null default 95 check (minimum_pass_rate >= 0 and minimum_pass_rate <= 100),
  critical_failure_blocks_release boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'approved', 'retired')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, evaluation_code)
);

create table if not exists public.ai_evaluation_prompt_items (
  id uuid primary key default gen_random_uuid(),
  evaluation_set_id uuid not null references public.ai_evaluation_prompt_sets(id) on delete cascade,
  item_key text not null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  test_input jsonb not null default '{}'::jsonb,
  expected_behavior text not null,
  prohibited_behavior text not null,
  severity text not null default 'major' check (severity in ('minor', 'major', 'critical')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (evaluation_set_id, item_key)
);

create table if not exists public.ai_prompt_workflow_compatibility (
  id uuid primary key default gen_random_uuid(),
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete cascade,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete cascade,
  model_version_id uuid references public.ai_model_versions(id) on delete cascade,
  compatibility_status text not null default 'untested' check (compatibility_status in ('untested', 'compatible', 'compatible_with_limits', 'incompatible', 'deprecated')),
  constraints_summary text,
  tested_by uuid references auth.users(id) on delete set null,
  tested_at timestamptz,
  created_at timestamptz not null default now(),
  constraint ai_prompt_workflow_compatibility_target check (
    prompt_version_id is not null or workflow_version_id is not null or model_version_id is not null
  )
);

create table if not exists public.ai_prompt_workflow_change_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  change_reference text not null unique,
  subject_type text not null check (subject_type in ('prompt_template', 'prompt_version', 'workflow_template', 'workflow_version', 'evaluation_set')),
  subject_id uuid not null,
  requested_change text not null,
  reason text not null,
  risk_assessment_required boolean not null default true,
  status text not null default 'open' check (status in ('open', 'accepted', 'rejected', 'implemented', 'closed')),
  requested_by uuid references auth.users(id) on delete set null,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_prompt_workflow_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  organisation_id uuid references public.organisations(id) on delete set null,
  event_type text not null,
  subject_type text not null,
  subject_id uuid,
  event_payload jsonb not null default '{}'::jsonb,
  correlation_id uuid,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_ai_prompt_templates_org_status on public.ai_prompt_templates(organisation_id, status);
create index if not exists idx_ai_prompt_templates_use_case on public.ai_prompt_templates(use_case_id);
create index if not exists idx_ai_prompt_versions_template_status on public.ai_prompt_versions(prompt_template_id, status);
create index if not exists idx_ai_workflow_templates_org_status on public.ai_workflow_templates(organisation_id, status);
create index if not exists idx_ai_workflow_versions_template_status on public.ai_workflow_versions(workflow_template_id, status);
create index if not exists idx_ai_workflow_steps_version_order on public.ai_workflow_steps(workflow_version_id, step_order);
create index if not exists idx_ai_evaluation_sets_org_status on public.ai_evaluation_prompt_sets(organisation_id, status);
create index if not exists idx_ai_prompt_workflow_audit_org_time on public.ai_prompt_workflow_audit_events(organisation_id, occurred_at desc);

create or replace function public.safesteps_can_manage_ai_prompt_workflow(
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
    or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'ai_prompt_workflow.manage')
    or public.has_resource_permission(p_user_id, 'global', null, 'ai_prompt_workflow.manage'),
    false
  );
$$;

revoke all on function public.safesteps_can_manage_ai_prompt_workflow(uuid, uuid) from public;
grant execute on function public.safesteps_can_manage_ai_prompt_workflow(uuid, uuid) to authenticated;

alter table public.ai_prompt_templates enable row level security;
alter table public.ai_prompt_versions enable row level security;
alter table public.ai_prompt_approval_records enable row level security;
alter table public.ai_workflow_templates enable row level security;
alter table public.ai_workflow_versions enable row level security;
alter table public.ai_workflow_steps enable row level security;
alter table public.ai_evaluation_prompt_sets enable row level security;
alter table public.ai_evaluation_prompt_items enable row level security;
alter table public.ai_prompt_workflow_compatibility enable row level security;
alter table public.ai_prompt_workflow_change_requests enable row level security;
alter table public.ai_prompt_workflow_audit_events enable row level security;

create policy "AI prompt templates managed by prompt workflow admins"
  on public.ai_prompt_templates
  for all
  to authenticated
  using (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id))
  with check (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id));

create policy "AI prompt versions managed through template"
  on public.ai_prompt_versions
  for all
  to authenticated
  using (
    exists (
      select 1 from public.ai_prompt_templates t
      where t.id = prompt_template_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)
    )
  )
  with check (
    exists (
      select 1 from public.ai_prompt_templates t
      where t.id = prompt_template_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)
    )
  );

create policy "AI prompt approvals managed through prompt"
  on public.ai_prompt_approval_records
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_prompt_versions pv
      join public.ai_prompt_templates pt on pt.id = pv.prompt_template_id
      where pv.id = prompt_version_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), pt.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_prompt_versions pv
      join public.ai_prompt_templates pt on pt.id = pv.prompt_template_id
      where pv.id = prompt_version_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), pt.organisation_id)
    )
  );

create policy "AI workflow templates managed by prompt workflow admins"
  on public.ai_workflow_templates
  for all
  to authenticated
  using (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id))
  with check (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id));

create policy "AI workflow versions managed through template"
  on public.ai_workflow_versions
  for all
  to authenticated
  using (
    exists (
      select 1 from public.ai_workflow_templates t
      where t.id = workflow_template_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)
    )
  )
  with check (
    exists (
      select 1 from public.ai_workflow_templates t
      where t.id = workflow_template_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)
    )
  );

create policy "AI workflow steps managed through version"
  on public.ai_workflow_steps
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_workflow_versions wv
      join public.ai_workflow_templates wt on wt.id = wv.workflow_template_id
      where wv.id = workflow_version_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), wt.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_workflow_versions wv
      join public.ai_workflow_templates wt on wt.id = wv.workflow_template_id
      where wv.id = workflow_version_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), wt.organisation_id)
    )
  );

create policy "AI evaluation sets managed by prompt workflow admins"
  on public.ai_evaluation_prompt_sets
  for all
  to authenticated
  using (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id))
  with check (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id));

create policy "AI evaluation items managed through set"
  on public.ai_evaluation_prompt_items
  for all
  to authenticated
  using (
    exists (
      select 1 from public.ai_evaluation_prompt_sets s
      where s.id = evaluation_set_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), s.organisation_id)
    )
  )
  with check (
    exists (
      select 1 from public.ai_evaluation_prompt_sets s
      where s.id = evaluation_set_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), s.organisation_id)
    )
  );

create policy "AI prompt workflow compatibility managed by admins"
  on public.ai_prompt_workflow_compatibility
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_prompt_versions pv
      join public.ai_prompt_templates pt on pt.id = pv.prompt_template_id
      where pv.id = prompt_version_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), pt.organisation_id)
    )
    or exists (
      select 1
      from public.ai_workflow_versions wv
      join public.ai_workflow_templates wt on wt.id = wv.workflow_template_id
      where wv.id = workflow_version_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), wt.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_prompt_versions pv
      join public.ai_prompt_templates pt on pt.id = pv.prompt_template_id
      where pv.id = prompt_version_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), pt.organisation_id)
    )
    or exists (
      select 1
      from public.ai_workflow_versions wv
      join public.ai_workflow_templates wt on wt.id = wv.workflow_template_id
      where wv.id = workflow_version_id
        and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), wt.organisation_id)
    )
  );

create policy "AI prompt workflow change requests managed by admins"
  on public.ai_prompt_workflow_change_requests
  for all
  to authenticated
  using (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id))
  with check (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id));

create policy "AI prompt workflow audit readable by admins"
  on public.ai_prompt_workflow_audit_events
  for select
  to authenticated
  using (
    public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), organisation_id)
    or public.has_resource_permission(auth.uid(), 'global', null, 'ai_audit.read')
  );

create policy "AI prompt workflow audit appendable by actor"
  on public.ai_prompt_workflow_audit_events
  for insert
  to authenticated
  with check (actor_user_id = auth.uid());

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_prompt_workflow.manage', 'Manage AI prompt templates, prompt versions, workflow templates, evaluation prompts, approvals, and change requests.', 'organisation', 'manage_ai_prompt_workflow', 'high_impact'),
  ('ai_prompt.approve', 'Approve SafeSteps AI prompt versions after content, safety, privacy, fairness, and release review.', 'organisation', 'approve_ai_prompt', 'high_impact'),
  ('ai_workflow.approve', 'Approve AI workflow versions, workflow steps, fallback behavior, and release gates.', 'organisation', 'approve_ai_workflow', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.security_roles (role_code, name, description, role_scope, high_privilege)
values
  ('ai_prompt_workflow_manager', 'AI Prompt Workflow Manager', 'Responsible for prompt registry, prompt versioning, workflow templates, evaluation prompts, and approval workflow governance.', 'organisation', true)
on conflict (role_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_prompt_workflow.manage',
  'ai_prompt.approve',
  'ai_workflow.approve',
  'ai_model_compatibility.review',
  'ai_audit.read'
)
where r.role_code = 'ai_prompt_workflow_manager'
on conflict do nothing;
