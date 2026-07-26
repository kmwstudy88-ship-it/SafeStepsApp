create table if not exists public.case_plan_goals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_plan_id uuid not null references public.case_plans(id) on delete cascade,
  goal_reference text not null,
  goal_title text not null,
  goal_description text not null,
  goal_domain text not null,
  goal_status text not null default 'not_started',
  priority_level text not null default 'standard',
  baseline_summary text,
  success_definition text not null,
  target_date date,
  completed_at timestamptz,
  owner_type text not null,
  owner_reference uuid,
  child_voice_summary text,
  parent_view_summary text,
  worker_view_summary text,
  sequence_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, goal_reference)
);

alter table public.case_plan_goals
  add column if not exists tenant_id uuid references public.platform_tenants(id) on delete restrict,
  add column if not exists case_plan_id uuid references public.case_plans(id) on delete cascade,
  add column if not exists goal_reference text,
  add column if not exists goal_title text,
  add column if not exists goal_description text,
  add column if not exists goal_domain text,
  add column if not exists goal_status text not null default 'not_started',
  add column if not exists priority_level text not null default 'standard',
  add column if not exists baseline_summary text,
  add column if not exists success_definition text,
  add column if not exists target_date date,
  add column if not exists completed_at timestamptz,
  add column if not exists owner_type text not null default 'parent',
  add column if not exists owner_reference uuid,
  add column if not exists child_voice_summary text,
  add column if not exists parent_view_summary text,
  add column if not exists worker_view_summary text,
  add column if not exists sequence_order integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

with single_plan as (
  select case_id, (array_agg(id order by created_at nulls last, id::text))[1] as case_plan_id
  from public.case_plans
  where case_id is not null
  group by case_id
  having count(*) = 1
)
update public.case_plan_goals g
set case_plan_id = coalesce(g.case_plan_id, sp.case_plan_id),
    tenant_id = coalesce(g.tenant_id, cp.tenant_id, c.tenant_id),
    goal_reference = coalesce(g.goal_reference, 'G-' || g.id::text),
    goal_title = coalesce(g.goal_title, g.title, 'Case goal'),
    goal_description = coalesce(g.goal_description, g.description, g.title, 'Case goal'),
    goal_domain = coalesce(g.goal_domain, g.domain, 'general'),
    goal_status = coalesce(g.goal_status, g.status, 'not_started'),
    priority_level = coalesce(g.priority_level, 'standard'),
    success_definition = coalesce(g.success_definition, g.description, g.title, 'Progress is reviewed by the assigned worker.'),
    owner_type = coalesce(g.owner_type, 'parent'),
    owner_reference = coalesce(g.owner_reference, g.parent_user_id),
    sequence_order = coalesce(g.sequence_order, 0)
from single_plan sp
left join public.case_plans cp on cp.id = sp.case_plan_id
left join public.cases c on c.id = sp.case_id
where g.case_id = sp.case_id
  and (
    g.case_plan_id is null
    or g.tenant_id is null
    or g.goal_reference is null
    or g.goal_title is null
    or g.goal_description is null
    or g.goal_domain is null
    or g.goal_status is null
    or g.priority_level is null
    or g.success_definition is null
    or g.owner_type is null
    or g.owner_reference is null
    or g.sequence_order is null
  );

update public.case_plan_goals
set goal_reference = coalesce(goal_reference, 'G-' || id::text),
    goal_title = coalesce(goal_title, title, 'Case goal'),
    goal_description = coalesce(goal_description, description, title, 'Case goal'),
    goal_domain = coalesce(goal_domain, domain, 'general'),
    goal_status = coalesce(goal_status, status, 'not_started'),
    priority_level = coalesce(priority_level, 'standard'),
    success_definition = coalesce(success_definition, description, title, 'Progress is reviewed by the assigned worker.'),
    owner_type = coalesce(owner_type, 'parent'),
    owner_reference = coalesce(owner_reference, parent_user_id),
    sequence_order = coalesce(sequence_order, 0)
where goal_reference is null
   or goal_title is null
   or goal_description is null
   or goal_domain is null
   or goal_status is null
   or priority_level is null
   or success_definition is null
   or owner_type is null
   or owner_reference is null
   or sequence_order is null;

create unique index if not exists case_plan_goals_reference_unique_idx
  on public.case_plan_goals (tenant_id, goal_reference)
  where tenant_id is not null and goal_reference is not null;

create table if not exists public.case_plan_actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_plan_goal_id uuid not null references public.case_plan_goals(id) on delete cascade,
  action_reference text not null,
  action_title text not null,
  action_description text not null,
  action_type text not null,
  assigned_to_type text not null,
  assigned_to_reference uuid,
  action_status text not null default 'not_started',
  due_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  completion_evidence_required boolean not null default false,
  completion_evidence_summary text,
  sequence_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, action_reference)
);
