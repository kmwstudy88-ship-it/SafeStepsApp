create or replace function public.__archive_compatibility_relation(target_name text, archive_base_name text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  target_relkind "char";
  archived_name text;
begin
  select c.relkind
  into target_relkind
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = target_name;

  if target_relkind is null then
    return;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = archive_base_name
  ) then
    archived_name := archive_base_name;
  else
    archived_name := format(
      '%s_%s',
      archive_base_name,
      to_char(pg_catalog.clock_timestamp(), 'YYYYMMDDHH24MISSMS')
    );
  end if;

  if target_relkind in ('r', 'p') then
    execute format('alter table public.%I rename to %I', target_name, archived_name);
  elsif target_relkind = 'f' then
    execute format('alter foreign table public.%I rename to %I', target_name, archived_name);
  elsif target_relkind = 'v' then
    execute format('alter view public.%I rename to %I', target_name, archived_name);
  elsif target_relkind = 'm' then
    execute format('alter materialized view public.%I rename to %I', target_name, archived_name);
  else
    raise exception 'Cannot archive public.% with relation kind %', target_name, target_relkind;
  end if;
end;
$$;

select public.__archive_compatibility_relation('case_assignments', 'case_assignments_legacy');
select public.__archive_compatibility_relation('visits', 'visits_legacy');
select public.__archive_compatibility_relation('messages', 'messages_legacy');
select public.__archive_compatibility_relation('timeline_events', 'timeline_events_legacy');
select public.__archive_compatibility_relation('risk_indicators', 'risk_indicators_legacy');
select public.__archive_compatibility_relation('contradictions', 'contradictions_legacy');
select public.__archive_compatibility_relation('fairness_analysis', 'fairness_analysis_legacy');
select public.__archive_compatibility_relation('document_entities', 'document_entities_legacy');

create view public.case_assignments
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

create view public.visits
with (security_invoker = true)
as
select
  id,
  visit_reference,
  case_id,
  visit_type,
  visit_location_type,
  scheduled_at,
  actual_start_at,
  actual_end_at,
  worker_user_id,
  participants_present,
  factual_observations,
  family_responses,
  safety_context,
  follow_up_required,
  human_review_status,
  created_at
from public.case_visit_records_v19;

create view public.messages
with (security_invoker = true)
as
select
  id,
  thread_id,
  created_at,
  created_by,
  body
from public.messaging_messages;

create view public.timeline_events
with (security_invoker = true)
as
select
  id,
  tenant_id,
  case_id,
  evidence_record_id,
  event_type,
  event_title,
  event_summary,
  event_occurred_at,
  source_table,
  source_record_id,
  created_at
from public.evidence_timeline_events;

create view public.risk_indicators
with (security_invoker = true)
as
select
  id,
  tenant_id,
  case_id,
  child_id,
  signal_reference,
  signal_source,
  signal_type,
  severity_level,
  confidence_score,
  ai_explanation,
  linked_evidence_ids,
  review_status,
  reviewer_user_id,
  detected_at,
  created_at
from public.ai_risk_signals;

create view public.contradictions
with (security_invoker = true)
as
select
  id,
  case_id,
  parent_user_id,
  worker_user_id,
  detected_at,
  phase,
  contradiction_type,
  description,
  source_a,
  source_b,
  severity,
  include_in_report,
  supervisor_notified,
  worker_notes,
  resolved_at,
  created_by
from public.assessment_contradictions;

create view public.fairness_analysis
with (security_invoker = true)
as
select
  id,
  evaluation_run_id,
  metric_id,
  reference_subgroup_id,
  comparison_subgroup_id,
  reference_value,
  comparison_value,
  absolute_difference,
  relative_ratio,
  confidence_interval_lower,
  confidence_interval_upper,
  disparity_threshold,
  outcome,
  materiality_assessment,
  remediation_required,
  calculated_at
from public.ai_fairness_results;

do $migration$
declare
  ai_extracted_entities_columns text;
  ai_extracted_entities_relkind "char";
begin
  select c.relkind
  into ai_extracted_entities_relkind
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'ai_extracted_entities';

  if ai_extracted_entities_relkind in ('r', 'p', 'f', 'v', 'm') then
    select string_agg(format('  %I', a.attname), E',\n' order by a.attnum)
    into ai_extracted_entities_columns
    from pg_catalog.pg_attribute a
    join pg_catalog.pg_class c on c.oid = a.attrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'ai_extracted_entities'
      and a.attnum > 0
      and not a.attisdropped;

    execute format($sql$
      create view public.document_entities
      with (security_invoker = true)
      as
      select
%s
      from public.ai_extracted_entities
    $sql$, ai_extracted_entities_columns);
  elsif ai_extracted_entities_relkind is not null then
    raise exception 'public.ai_extracted_entities is not a selectable relation kind: %', ai_extracted_entities_relkind;
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
    if exists (
      select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'document_entities'
    ) then
      execute 'grant select on public.document_entities to authenticated';
    end if;
  end if;

  if exists (select 1 from pg_catalog.pg_roles where rolname = 'service_role') then
    execute 'grant select on public.case_assignments to service_role';
    execute 'grant select on public.visits to service_role';
    execute 'grant select on public.messages to service_role';
    execute 'grant select on public.timeline_events to service_role';
    execute 'grant select on public.risk_indicators to service_role';
    execute 'grant select on public.contradictions to service_role';
    execute 'grant select on public.fairness_analysis to service_role';
    if exists (
      select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'document_entities'
    ) then
      execute 'grant select on public.document_entities to service_role';
    end if;
  end if;
end
$migration$;

drop function public.__archive_compatibility_relation(text, text);
