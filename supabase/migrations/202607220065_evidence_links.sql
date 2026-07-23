create table if not exists public.evidence_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  linked_table text not null,
  linked_record_id uuid not null,
  link_type text not null,
  link_summary text,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (tenant_id, evidence_record_id, linked_table, linked_record_id, link_type)
);

create table if not exists public.evidence_timeline_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  evidence_record_id uuid references public.evidence_records(id) on delete set null,
  event_type text not null,
  event_title text not null,
  event_summary text,
  event_occurred_at timestamptz not null,
  source_table text,
  source_record_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists evidence_timeline_case_time_idx
  on public.evidence_timeline_events(tenant_id, case_id, event_occurred_at desc);
