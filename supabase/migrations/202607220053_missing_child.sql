create table if not exists public.missing_child_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  event_reference text not null,
  last_seen_at timestamptz,
  last_seen_location text,
  reported_at timestamptz not null default now(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  police_reference text,
  photo_storage_path text,
  clothing_description text,
  medical_concerns text,
  risk_level text not null default 'HIGH',
  search_actions jsonb not null default '[]'::jsonb,
  event_status text not null default 'open',
  resolution_summary text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, event_reference)
);

create table if not exists public.welfare_checks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  check_reference text not null,
  requested_reason text not null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  check_status text not null default 'requested',
  outcome_summary text,
  created_at timestamptz not null default now(),
  unique (tenant_id, check_reference)
);
