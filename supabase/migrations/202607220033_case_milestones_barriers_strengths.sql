create table if not exists public.case_milestones (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  milestone_reference text not null,
  milestone_title text not null,
  milestone_description text,
  milestone_status text not null default 'planned',
  target_date date,
  achieved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, milestone_reference)
);

create table if not exists public.case_barriers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  barrier_reference text not null,
  barrier_title text not null,
  barrier_description text not null,
  barrier_category text not null,
  barrier_status text not null default 'active',
  external_factor boolean not null default false,
  mitigation_plan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, barrier_reference)
);

create table if not exists public.case_strengths (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  strength_reference text not null,
  strength_title text not null,
  strength_description text not null,
  strength_domain text not null,
  source_type text not null default 'worker_observed',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, strength_reference)
);
