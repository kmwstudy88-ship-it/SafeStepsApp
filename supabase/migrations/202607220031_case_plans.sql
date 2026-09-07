create table if not exists public.case_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  plan_reference text not null,
  plan_title text not null,
  plan_description text,
  plan_type text not null,
  plan_status text not null default 'draft',
  version_number integer not null default 1,
  effective_from date,
  review_due_date date,
  effective_to date,
  parent_participation_status text,
  child_participation_status text,
  approved_by_user_id uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  supersedes_plan_id uuid references public.case_plans(id) on delete set null,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_plans_dates_check check (
    effective_to is null or effective_from is null or effective_to >= effective_from
  )
);

alter table public.case_plans
  add column if not exists tenant_id uuid references public.platform_tenants(id) on delete restrict,
  add column if not exists case_id uuid references public.cases(id) on delete cascade,
  add column if not exists plan_reference text,
  add column if not exists plan_title text,
  add column if not exists plan_description text,
  add column if not exists plan_type text,
  add column if not exists plan_status text default 'draft',
  add column if not exists version_number integer default 1,
  add column if not exists effective_from date,
  add column if not exists review_due_date date,
  add column if not exists effective_to date,
  add column if not exists parent_participation_status text,
  add column if not exists child_participation_status text,
  add column if not exists approved_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists supersedes_plan_id uuid references public.case_plans(id) on delete set null,
  add column if not exists created_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

update public.case_plans cp
set tenant_id = coalesce(cp.tenant_id, c.tenant_id),
    plan_reference = coalesce(cp.plan_reference, 'CP-' || cp.id::text),
    plan_title = coalesce(cp.plan_title, 'Case plan'),
    plan_description = coalesce(cp.plan_description, cp.plan_purpose),
    plan_type = coalesce(cp.plan_type, 'case_plan'),
    plan_status = coalesce(cp.plan_status, cp.status, 'draft'),
    version_number = coalesce(cp.version_number, cp.plan_version, 1),
    review_due_date = coalesce(cp.review_due_date, cp.review_due_at::date)
from public.cases c
where c.id = cp.case_id
  and (
    cp.tenant_id is null
    or cp.plan_reference is null
    or cp.plan_title is null
    or cp.plan_description is null
    or cp.plan_type is null
    or cp.plan_status is null
    or cp.version_number is null
    or cp.review_due_date is null
  );

update public.case_plans
set plan_reference = coalesce(plan_reference, 'CP-' || id::text),
    plan_title = coalesce(plan_title, 'Case plan'),
    plan_type = coalesce(plan_type, 'case_plan'),
    plan_status = coalesce(plan_status, status, 'draft'),
    version_number = coalesce(version_number, plan_version, 1)
where plan_reference is null
   or plan_title is null
   or plan_type is null
   or plan_status is null
   or version_number is null;

create unique index if not exists case_plans_reference_unique_idx
  on public.case_plans (tenant_id, plan_reference);

create index if not exists case_plans_case_idx
  on public.case_plans (tenant_id, case_id, plan_status);

create unique index if not exists case_plans_one_active_idx
  on public.case_plans (case_id, plan_type)
  where plan_status = 'active' and effective_to is null;
