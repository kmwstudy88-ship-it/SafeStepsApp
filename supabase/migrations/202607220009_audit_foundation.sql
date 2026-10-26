create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete set null,
  audit_reference text not null unique,
  event_category text not null,
  event_type text not null,
  target_table text not null,
  target_record_id uuid,
  actor_type text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_service text,
  action_reason text,
  purpose text,
  request_reference text,
  correlation_reference text,
  source_ip_hash text,
  user_agent_hash text,
  previous_state jsonb,
  resulting_state jsonb,
  previous_state_hash text,
  resulting_state_hash text,
  occurred_at timestamptz not null default now(),
  constraint audit_events_actor_check check (actor_user_id is not null or actor_service is not null)
);

create index if not exists audit_events_tenant_time_idx
  on public.audit_events (tenant_id, occurred_at desc);

create index if not exists audit_events_target_idx
  on public.audit_events (target_table, target_record_id);

create index if not exists audit_events_actor_idx
  on public.audit_events (actor_user_id, occurred_at desc);

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_record_id uuid;
  v_previous jsonb;
  v_resulting jsonb;
  v_event_type text;
begin
  if tg_op = 'INSERT' then
    v_resulting := to_jsonb(new);
    v_previous := null;
    v_event_type := 'record_created';
    v_record_id := new.id;
    v_tenant_id := nullif(v_resulting ->> 'tenant_id', '')::uuid;
  elsif tg_op = 'UPDATE' then
    v_previous := to_jsonb(old);
    v_resulting := to_jsonb(new);
    v_event_type := 'record_updated';
    v_record_id := new.id;
    v_tenant_id := coalesce(nullif(v_resulting ->> 'tenant_id', '')::uuid, nullif(v_previous ->> 'tenant_id', '')::uuid);
  elsif tg_op = 'DELETE' then
    v_previous := to_jsonb(old);
    v_resulting := null;
    v_event_type := 'record_deleted';
    v_record_id := old.id;
    v_tenant_id := nullif(v_previous ->> 'tenant_id', '')::uuid;
  end if;

  insert into public.audit_events (
    audit_reference,
    tenant_id,
    event_category,
    event_type,
    target_table,
    target_record_id,
    actor_type,
    actor_user_id,
    actor_service,
    previous_state,
    resulting_state,
    previous_state_hash,
    resulting_state_hash
  )
  values (
    'AUD-' || gen_random_uuid()::text,
    v_tenant_id,
    'database_change',
    v_event_type,
    tg_table_schema || '.' || tg_table_name,
    v_record_id,
    case when auth.uid() is not null then 'user' else 'service' end,
    auth.uid(),
    case when auth.uid() is null then current_user else null end,
    v_previous,
    v_resulting,
    case when v_previous is null then null else encode(digest(v_previous::text, 'sha256'), 'hex') end,
    case when v_resulting is null then null else encode(digest(v_resulting::text, 'sha256'), 'hex') end
  );

  return coalesce(new, old);
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists audit_platform_tenants on public.platform_tenants;
create trigger audit_platform_tenants after insert or update or delete on public.platform_tenants
for each row execute function public.audit_row_change();

drop trigger if exists audit_organisations on public.organisations;
create trigger audit_organisations after insert or update or delete on public.organisations
for each row execute function public.audit_row_change();

drop trigger if exists audit_tenant_memberships on public.tenant_memberships;
create trigger audit_tenant_memberships after insert or update or delete on public.tenant_memberships
for each row execute function public.audit_row_change();

drop trigger if exists audit_role_assignments on public.role_assignments;
create trigger audit_role_assignments after insert or update or delete on public.role_assignments
for each row execute function public.audit_row_change();
