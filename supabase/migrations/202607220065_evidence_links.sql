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

alter table public.evidence_timeline_events
  add column if not exists tenant_id uuid references public.platform_tenants(id) on delete restrict,
  add column if not exists case_id uuid references public.cases(id) on delete cascade,
  add column if not exists evidence_record_id uuid references public.evidence_records(id) on delete set null,
  add column if not exists event_type text,
  add column if not exists event_title text,
  add column if not exists event_summary text,
  add column if not exists event_occurred_at timestamptz,
  add column if not exists source_table text,
  add column if not exists source_record_id uuid,
  add column if not exists created_at timestamptz not null default now();

update public.evidence_timeline_events ete
set tenant_id = coalesce(ete.tenant_id, c.tenant_id),
    event_type = coalesce(ete.event_type, 'evidence_event'),
    event_title = coalesce(ete.event_title, ete.timeline_reference, 'Evidence timeline event'),
    event_summary = coalesce(ete.event_summary, ''),
    event_occurred_at = coalesce(ete.event_occurred_at, ete.event_at, now()),
    source_record_id = coalesce(ete.source_record_id, ete.source_id)
from public.cases c
where c.id = ete.case_id
  and (
    ete.tenant_id is null
    or ete.event_type is null
    or ete.event_title is null
    or ete.event_summary is null
    or ete.event_occurred_at is null
    or ete.source_record_id is null
  );

update public.evidence_timeline_events
set event_type = coalesce(event_type, 'evidence_event'),
    event_title = coalesce(event_title, timeline_reference, 'Evidence timeline event'),
    event_summary = coalesce(event_summary, ''),
    event_occurred_at = coalesce(event_occurred_at, event_at, now()),
    source_record_id = coalesce(source_record_id, source_id)
where event_type is null
   or event_title is null
   or event_summary is null
   or event_occurred_at is null
   or source_record_id is null;

create index if not exists evidence_timeline_case_time_idx
  on public.evidence_timeline_events(tenant_id, case_id, event_occurred_at desc);
