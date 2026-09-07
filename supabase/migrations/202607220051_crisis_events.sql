create table if not exists public.crisis_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  incident_id uuid references public.safety_incidents(id) on delete set null,
  crisis_reference text not null,
  crisis_type text not null,
  crisis_level text not null,
  crisis_status text not null default 'active',
  timeline jsonb not null default '[]'::jsonb,
  participants jsonb not null default '[]'::jsonb,
  actions_taken jsonb not null default '[]'::jsonb,
  services_contacted jsonb not null default '[]'::jsonb,
  resolution_summary text,
  follow_up_required boolean not null default true,
  debrief_summary text,
  review_outcome text,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, crisis_reference)
);

create table if not exists public.crisis_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete set null,
  crisis_event_id uuid references public.crisis_events(id) on delete set null,
  event_type text not null,
  event_summary text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now()
);
