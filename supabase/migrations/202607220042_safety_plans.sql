create table if not exists public.safety_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  family_id uuid references public.families(id) on delete set null,
  plan_reference text not null,
  plan_title text not null,
  safety_level text not null default 'LOW',
  risk_summary text,
  child_safety_priorities jsonb not null default '[]'::jsonb,
  safe_people jsonb not null default '[]'::jsonb,
  safe_locations jsonb not null default '[]'::jsonb,
  review_frequency_days integer not null default 30,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  plan_status text not null default 'draft',
  created_by_user_id uuid references auth.users(id) on delete set null,
  approved_by_user_id uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, plan_reference),
  constraint safety_plans_level_check check (safety_level in ('SAFE','LOW','MODERATE','HIGH','CRITICAL','IMMINENT')),
  constraint safety_plans_review_frequency_check check (review_frequency_days > 0)
);

create unique index if not exists safety_plans_one_active_per_case_idx
  on public.safety_plans(case_id)
  where plan_status = 'active';

create index if not exists safety_plans_case_idx
  on public.safety_plans(tenant_id, case_id, plan_status);
