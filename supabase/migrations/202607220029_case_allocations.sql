create table if not exists public.case_allocations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  allocated_user_id uuid references auth.users(id) on delete set null,
  allocated_team_id uuid references public.worker_teams(id) on delete set null,
  allocation_role text not null,
  allocation_status text not null default 'active',
  primary_allocation boolean not null default false,
  allocated_at timestamptz not null default now(),
  accepted_at timestamptz,
  ended_at timestamptz,
  allocation_reason text,
  end_reason text,
  allocated_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_allocations_subject_check check (allocated_user_id is not null or allocated_team_id is not null),
  constraint case_allocations_dates_check check (ended_at is null or ended_at >= allocated_at)
);

create index if not exists case_allocations_case_idx
  on public.case_allocations (tenant_id, case_id, allocation_status);

create index if not exists case_allocations_user_idx
  on public.case_allocations (allocated_user_id, allocation_status);

create unique index if not exists case_allocations_primary_worker_idx
  on public.case_allocations (case_id)
  where allocation_role = 'primary_worker'
    and allocation_status = 'active'
    and primary_allocation = true
    and ended_at is null;

create unique index if not exists case_allocations_primary_supervisor_idx
  on public.case_allocations (case_id)
  where allocation_role = 'primary_supervisor'
    and allocation_status = 'active'
    and primary_allocation = true
    and ended_at is null;
