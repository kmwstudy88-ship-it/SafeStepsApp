do $migration$
begin
  if exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'case_assignments'
      and c.relkind = 'r'
  ) then
    if to_regclass('public.case_assignments_legacy') is null then
      execute 'alter table public.case_assignments rename to case_assignments_legacy';
    else
      execute 'drop table public.case_assignments';
    end if;
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
begin
  if to_regclass('public.ai_extracted_entities') is not null then
    execute $sql$
      create or replace view public.document_entities
      with (security_invoker = true)
      as
      select *
      from public.ai_extracted_entities
    $sql$;
  else
    execute 'drop view if exists public.document_entities';
  end if;
end
$migration$;

grant select on public.case_assignments to authenticated, service_role;
grant select on public.visits to authenticated, service_role;
grant select on public.messages to authenticated, service_role;
grant select on public.timeline_events to authenticated, service_role;
grant select on public.risk_indicators to authenticated, service_role;
grant select on public.contradictions to authenticated, service_role;
grant select on public.fairness_analysis to authenticated, service_role;

do $migration$
begin
  if to_regclass('public.document_entities') is not null then
    execute 'grant select on public.document_entities to authenticated, service_role';
  end if;
end
$migration$;
