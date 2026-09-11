do $migration$
declare
  case_assignments_relkind "char";
  archived_case_assignments_name text;
begin
  select c.relkind
  into case_assignments_relkind
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'case_assignments';

  if case_assignments_relkind in ('r', 'p', 'f', 'm') then
    if to_regclass('public.case_assignments_legacy') is null then
      archived_case_assignments_name := 'case_assignments_legacy';
    else
      archived_case_assignments_name := format(
        'case_assignments_legacy_%s',
        to_char(pg_catalog.clock_timestamp(), 'YYYYMMDDHH24MISSMS')
      );
    end if;

    if case_assignments_relkind in ('r', 'p') then
      execute format(
        'alter table public.case_assignments rename to %I',
        archived_case_assignments_name
      );
    elsif case_assignments_relkind = 'f' then
      execute format(
        'alter foreign table public.case_assignments rename to %I',
        archived_case_assignments_name
      );
    elsif case_assignments_relkind = 'm' then
      execute format(
        'alter materialized view public.case_assignments rename to %I',
        archived_case_assignments_name
      );
    end if;
  elsif case_assignments_relkind is not null and case_assignments_relkind <> 'v' then
    raise exception 'Cannot replace public.case_assignments with relation kind %', case_assignments_relkind;
  end if;
end
$migration$;

create or replace view public.case_assignments
with (security_invoker = true)
as
select
  ca.id,
  ca.tenant_id,
  ca.case_id,
  u.id as user_id,
  ca.allocated_user_id as auth_user_id,
  ca.allocated_team_id as team_id,
  case
    when ca.allocation_role in ('primary_supervisor', 'clinical_supervisor') then 'supervisor'
    when ca.allocation_role in ('primary_worker', 'secondary_worker', 'family_support_worker', 'child_specialist', 'provider_coordinator') then 'case_worker'
    else ca.allocation_role
  end as assignment_role,
  ca.allocation_role,
  (ca.allocation_status = 'active' and ca.ended_at is null) as is_active,
  ca.allocation_status,
  ca.primary_allocation,
  ca.allocated_at as assigned_at,
  ca.allocated_at,
  ca.accepted_at,
  ca.ended_at,
  ca.allocation_reason,
  ca.end_reason,
  ca.allocated_by_user_id,
  ca.created_at,
  ca.updated_at
from public.case_allocations ca
left join public.users u on u.auth_user_id = ca.allocated_user_id;

create or replace view public.visits
with (security_invoker = true)
as
select *
from public.case_visit_records_v19;

create or replace view public.messages
with (security_invoker = true)
as
select *
from public.messaging_messages;

create or replace view public.timeline_events
with (security_invoker = true)
as
select *
from public.evidence_timeline_events;

create or replace view public.risk_indicators
with (security_invoker = true)
as
select *
from public.ai_risk_signals;

create or replace view public.contradictions
with (security_invoker = true)
as
select *
from public.assessment_contradictions;

create or replace view public.fairness_analysis
with (security_invoker = true)
as
select *
from public.ai_fairness_results;

do $migration$
declare
  document_entities_relkind "char";
  archived_document_entities_name text;
begin
  select c.relkind
  into document_entities_relkind
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'document_entities';

  if document_entities_relkind in ('r', 'p', 'f', 'v', 'm') then
    if to_regclass('public.document_entities_legacy') is null then
      archived_document_entities_name := 'document_entities_legacy';
    else
      archived_document_entities_name := format(
        'document_entities_legacy_%s',
        to_char(pg_catalog.clock_timestamp(), 'YYYYMMDDHH24MISSMS')
      );
    end if;

    if document_entities_relkind in ('r', 'p') then
      execute format(
        'alter table public.document_entities rename to %I',
        archived_document_entities_name
      );
    elsif document_entities_relkind = 'f' then
      execute format(
        'alter foreign table public.document_entities rename to %I',
        archived_document_entities_name
      );
    elsif document_entities_relkind = 'v' then
      execute format(
        'alter view public.document_entities rename to %I',
        archived_document_entities_name
      );
    elsif document_entities_relkind = 'm' then
      execute format(
        'alter materialized view public.document_entities rename to %I',
        archived_document_entities_name
      );
    end if;
  elsif document_entities_relkind is not null then
    raise exception 'Cannot replace public.document_entities with relation kind %', document_entities_relkind;
  end if;

  if to_regclass('public.ai_extracted_entities') is not null then
    if to_regclass('public.document_entities') is not null then
      raise exception 'public.document_entities still exists and cannot be replaced safely';
    end if;
    execute $sql$
      create or replace view public.document_entities
      with (security_invoker = true)
      as
      select *
      from public.ai_extracted_entities
    $sql$;
  end if;
end
$migration$;

do $migration$
begin
  if exists (select 1 from pg_catalog.pg_roles where rolname = 'authenticated') then
    execute 'grant select on public.case_assignments to authenticated';
    execute 'grant select on public.visits to authenticated';
    execute 'grant select on public.messages to authenticated';
    execute 'grant select on public.timeline_events to authenticated';
    execute 'grant select on public.risk_indicators to authenticated';
    execute 'grant select on public.contradictions to authenticated';
    execute 'grant select on public.fairness_analysis to authenticated';
  end if;

  if exists (select 1 from pg_catalog.pg_roles where rolname = 'service_role') then
    execute 'grant select on public.case_assignments to service_role';
    execute 'grant select on public.visits to service_role';
    execute 'grant select on public.messages to service_role';
    execute 'grant select on public.timeline_events to service_role';
    execute 'grant select on public.risk_indicators to service_role';
    execute 'grant select on public.contradictions to service_role';
    execute 'grant select on public.fairness_analysis to service_role';
  end if;
end
$migration$;

do $migration$
begin
  if to_regclass('public.document_entities') is not null then
    if exists (select 1 from pg_catalog.pg_roles where rolname = 'authenticated') then
      execute 'grant select on public.document_entities to authenticated';
    end if;
    if exists (select 1 from pg_catalog.pg_roles where rolname = 'service_role') then
      execute 'grant select on public.document_entities to service_role';
    end if;
  end if;
end
$migration$;
