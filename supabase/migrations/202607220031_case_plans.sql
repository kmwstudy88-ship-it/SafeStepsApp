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

create unique index if not exists case_plans_reference_unique_idx
  on public.case_plans (tenant_id, plan_reference);

create index if not exists case_plans_case_idx
  on public.case_plans (tenant_id, case_id, plan_status);

create unique index if not exists case_plans_one_active_idx
  on public.case_plans (case_id, plan_type)
  where plan_status = 'active' and effective_to is null;
