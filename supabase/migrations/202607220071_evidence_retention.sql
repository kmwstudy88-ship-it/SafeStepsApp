create table if not exists public.evidence_retention_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete cascade,
  jurisdiction_code text,
  evidence_type text not null,
  retention_label text not null,
  minimum_retention_days integer,
  permanent_retention boolean not null default false,
  policy_basis text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, jurisdiction_code, evidence_type)
);

create table if not exists public.evidence_legal_holds (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  hold_reference text not null,
  hold_reason text not null,
  legal_authority text,
  placed_by_user_id uuid references auth.users(id) on delete set null,
  placed_at timestamptz not null default now(),
  released_by_user_id uuid references auth.users(id) on delete set null,
  released_at timestamptz,
  hold_status text not null default 'active',
  unique (tenant_id, hold_reference)
);

create table if not exists public.evidence_retention_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  retention_policy_id uuid references public.evidence_retention_policies(id) on delete set null,
  scheduled_action text not null,
  scheduled_for timestamptz,
  action_status text not null default 'scheduled',
  blocked_by_legal_hold boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.sync_evidence_record_legal_hold()
returns trigger
language plpgsql
as $$
begin
  update public.evidence_records
  set legal_hold = exists (
    select 1
    from public.evidence_legal_holds h
    where h.evidence_record_id = coalesce(new.evidence_record_id, old.evidence_record_id)
      and h.hold_status = 'active'
      and h.released_at is null
  )
  where id = coalesce(new.evidence_record_id, old.evidence_record_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists evidence_legal_holds_sync_record on public.evidence_legal_holds;
create trigger evidence_legal_holds_sync_record
after insert or update or delete on public.evidence_legal_holds
for each row execute function public.sync_evidence_record_legal_hold();
