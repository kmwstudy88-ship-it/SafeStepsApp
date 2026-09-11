create extension if not exists pgcrypto;

-- 8. Case-management consolidation
create or replace view public.visits with (security_invoker = true) as
select
  v.id,
  v.id as canonical_visit_id,
  'case_visit_records_v19'::text as source_table,
  v.id as source_id,
  v.case_id,
  v.visit_reference,
  v.visit_type,
  v.visit_location_type,
  v.scheduled_at,
  v.actual_start_at,
  v.actual_end_at,
  v.worker_user_id,
  null::uuid as parent_user_id,
  null::uuid as facilitator_user_id,
  v.participants_present,
  v.factual_observations,
  v.family_responses,
  v.safety_context,
  v.follow_up_required,
  v.human_review_status,
  v.created_at,
  jsonb_build_object('origin', 'case_visit_records_v19') as legacy_payload
from public.case_visit_records_v19 v
union all
select
  h.id,
  null::uuid as canonical_visit_id,
  'home_visit_records'::text as source_table,
  h.id as source_id,
  h.case_id,
  h.visit_reference,
  'home_visit'::text as visit_type,
  'home'::text as visit_location_type,
  h.visit_started_at as scheduled_at,
  h.visit_started_at as actual_start_at,
  h.visit_ended_at as actual_end_at,
  h.worker_user_id,
  h.parent_user_id,
  null::uuid as facilitator_user_id,
  '[]'::jsonb as participants_present,
  null::text as factual_observations,
  null::text as family_responses,
  null::text as safety_context,
  h.follow_up_required,
  'legacy'::text as human_review_status,
  h.visit_started_at as created_at,
  jsonb_build_object(
    'origin', 'home_visit_records',
    'home_environment_observations', h.home_environment_observations,
    'safety_observations', h.safety_observations,
    'strengths_observed', h.strengths_observed,
    'concerns_observed', h.concerns_observed
  ) as legacy_payload
from public.home_visit_records h
union all
select
  c.id,
  null::uuid as canonical_visit_id,
  'contact_sessions'::text as source_table,
  c.id as source_id,
  c.case_id,
  null::text as visit_reference,
  c.stage as visit_type,
  'supervised_contact'::text as visit_location_type,
  c.session_date as scheduled_at,
  c.session_date as actual_start_at,
  c.session_date + make_interval(mins => c.duration_minutes) as actual_end_at,
  null::uuid as worker_user_id,
  c.parent_id as parent_user_id,
  c.facilitator_id as facilitator_user_id,
  '[]'::jsonb as participants_present,
  c.notes as factual_observations,
  null::text as family_responses,
  null::text as safety_context,
  c.facilitator_unsafe_to_escalate as follow_up_required,
  'legacy'::text as human_review_status,
  c.created_at,
  jsonb_build_object(
    'origin', 'contact_sessions',
    'duration_minutes', c.duration_minutes,
    'child_comfort_score', c.child_comfort_score,
    'child_distress_score', c.child_distress_score,
    'parent_regulation_score', c.parent_regulation_score,
    'facilitator_intervention_count', c.facilitator_intervention_count,
    'risk_flags', c.risk_flags,
    'skill_evidence', c.skill_evidence
  ) as legacy_payload
from public.contact_sessions c
union all
select
  cv.id,
  null::uuid as canonical_visit_id,
  'case_visitations'::text as source_table,
  cv.id as source_id,
  cv.case_id,
  null::text as visit_reference,
  coalesce(cv.visit_type, 'legacy_case_visitation') as visit_type,
  'legacy_case_visitation'::text as visit_location_type,
  cv.visit_date::timestamptz as scheduled_at,
  cv.visit_date::timestamptz as actual_start_at,
  null::timestamptz as actual_end_at,
  cv.created_by as worker_user_id,
  cv.parent_user_id,
  null::uuid as facilitator_user_id,
  '[]'::jsonb as participants_present,
  cv.observation_summary as factual_observations,
  null::text as family_responses,
  null::text as safety_context,
  cv.incident_count > 0 as follow_up_required,
  'legacy'::text as human_review_status,
  cv.created_at,
  jsonb_build_object(
    'origin', 'case_visitations',
    'quality_score', cv.quality_score,
    'incident_count', cv.incident_count
  ) as legacy_payload
from public.case_visitations cv;

-- 9. Messaging consolidation
create or replace view public.messages with (security_invoker = true) as
select
  m.id,
  m.id as canonical_message_id,
  'messaging_messages'::text as source_table,
  m.id as source_id,
  m.thread_id,
  null::uuid as case_id,
  m.created_by as sender_user_id,
  null::text as sender_role,
  m.body,
  'thread_owner'::text as visibility,
  null::text as monitoring_status,
  m.created_by,
  m.created_at,
  m.created_at as updated_at,
  jsonb_build_object('origin', 'messaging_messages') as legacy_payload
from public.messaging_messages m
union all
select
  pcm.id,
  null::uuid as canonical_message_id,
  'parent_child_messages'::text as source_table,
  pcm.id as source_id,
  null::uuid as thread_id,
  null::uuid as case_id,
  pcm.sender_user_id,
  pcm.sender_role,
  pcm.message_text as body,
  pcm.share_audience as visibility,
  pcm.monitoring_status,
  pcm.sender_user_id as created_by,
  pcm.created_at,
  pcm.updated_at,
  jsonb_build_object(
    'origin', 'parent_child_messages',
    'child_user_id', pcm.child_user_id,
    'parent_user_id', pcm.parent_user_id,
    'caseworker_user_id', pcm.caseworker_user_id,
    'monitoring_note', pcm.monitoring_note,
    'visible_to_child', pcm.visible_to_child,
    'visible_to_parent', pcm.visible_to_parent,
    'reviewed_by', pcm.reviewed_by,
    'reviewed_at', pcm.reviewed_at
  ) as legacy_payload
from public.parent_child_messages pcm;

-- 10. Evidence consolidation
create table if not exists public.evidence_legacy (
  id uuid primary key,
  child_id uuid,
  activity_id uuid,
  note text,
  media_url text,
  created_at timestamptz,
  case_id uuid,
  document_id uuid,
  created_by uuid,
  evidence_type text,
  metadata jsonb
);

do $$
declare
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'evidence'
      and c.relkind = 'r'
  ) then
    if to_regclass('public.evidence_migration_source') is null then
      execute 'alter table public.evidence rename to evidence_migration_source';
    end if;
  end if;

  if to_regclass('public.evidence_migration_source') is not null then
    insert into public.evidence_legacy (
      id,
      child_id,
      activity_id,
      note,
      media_url,
      created_at,
      case_id,
      document_id,
      created_by,
      evidence_type,
      metadata
    )
    select
      id,
      child_id,
      activity_id,
      note,
      media_url,
      created_at,
      case_id,
      document_id,
      created_by,
      evidence_type,
      metadata
    from public.evidence_migration_source
    on conflict (id) do nothing;

    execute 'drop table public.evidence_migration_source';
  end if;
end
$$;

with resolved_legacy_evidence as (
  select
    e.id,
    coalesce(e.case_id, d.case_id) as resolved_case_id,
    coalesce(c.tenant_id, c_from_document.tenant_id) as resolved_tenant_id,
    e.child_id,
    e.note,
    e.created_at,
    e.created_by,
    e.evidence_type
  from public.evidence_legacy e
  left join public.documents d on d.id = e.document_id
  left join public.cases c on c.id = e.case_id
  left join public.cases c_from_document on c_from_document.id = d.case_id
)
insert into public.evidence_records (
  tenant_id,
  case_id,
  child_id,
  evidence_reference,
  evidence_title,
  evidence_description,
  evidence_type,
  evidence_source,
  evidence_status,
  privacy_level,
  uploader_user_id,
  captured_at,
  uploaded_at
)
select
  r.resolved_tenant_id,
  r.resolved_case_id,
  r.child_id,
  format('legacy-evidence-%s', r.id::text),
  coalesce(r.evidence_type, 'Legacy evidence'),
  coalesce(r.note, 'Migrated from public.evidence'),
  coalesce(r.evidence_type, 'legacy_note'),
  'legacy_evidence',
  'uploaded',
  'worker_only',
  r.created_by,
  r.created_at,
  r.created_at
from resolved_legacy_evidence r
where r.resolved_tenant_id is not null
  and r.resolved_case_id is not null
  and not exists (
    select 1
    from public.evidence_records er
    where er.evidence_reference = format('legacy-evidence-%s', r.id::text)
  );

create or replace view public.evidence with (security_invoker = true) as
select
  er.id,
  er.child_id,
  null::uuid as activity_id,
  coalesce(er.evidence_description, er.evidence_title) as note,
  null::text as media_url,
  er.uploaded_at as created_at,
  er.case_id,
  null::uuid as document_id,
  er.uploader_user_id as created_by,
  er.evidence_type,
  jsonb_build_object(
    'origin', 'evidence_records',
    'evidence_reference', er.evidence_reference,
    'evidence_source', er.evidence_source,
    'evidence_status', er.evidence_status,
    'privacy_level', er.privacy_level,
    'captured_at', er.captured_at,
    'legacy_source_evidence_item_id', er.source_evidence_item_id
  ) as metadata
from public.evidence_records er
where coalesce(er.deleted, false) = false
union all
select
  el.id,
  el.child_id,
  el.activity_id,
  el.note,
  el.media_url,
  el.created_at,
  el.case_id,
  el.document_id,
  el.created_by,
  el.evidence_type,
  coalesce(el.metadata, '{}'::jsonb) as metadata
from public.evidence_legacy el
where not exists (
  select 1
  from public.evidence_records er
  where er.evidence_reference = format('legacy-evidence-%s', el.id::text)
);

create or replace function public.evidence_view_compat_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  resolved_tenant_id uuid;
  resolved_case_id uuid;
  case_from_input uuid;
  case_from_document uuid;
  inserted_id uuid;
begin
  if tg_op = 'INSERT' then
    select
      c.id,
      d.case_id,
      coalesce(c.tenant_id, c_from_document.tenant_id)
    into case_from_input, case_from_document, resolved_tenant_id
    from (select 1) anchor
    left join public.documents d on d.id = new.document_id
    left join public.cases c on c.id = new.case_id
    left join public.cases c_from_document on c_from_document.id = d.case_id;

    if new.case_id is not null and case_from_input is null then
      raise exception 'Evidence write requires a valid case_id';
    end if;
    if new.document_id is not null and case_from_document is null then
      raise exception 'Evidence write requires a valid document_id linked to a case';
    end if;
    if case_from_input is not null
      and case_from_document is not null
      and case_from_input <> case_from_document
    then
      raise exception 'Evidence write requires case_id and document_id to reference the same case';
    end if;

    inserted_id := coalesce(new.id, gen_random_uuid());
    resolved_case_id := coalesce(case_from_input, case_from_document);

    if resolved_case_id is null or resolved_tenant_id is null then
      insert into public.evidence_legacy (
        id,
        child_id,
        activity_id,
        note,
        media_url,
        created_at,
        case_id,
        document_id,
        created_by,
        evidence_type,
        metadata
      )
      values (
        inserted_id,
        new.child_id,
        new.activity_id,
        new.note,
        new.media_url,
        coalesce(new.created_at, now()),
        new.case_id,
        new.document_id,
        new.created_by,
        new.evidence_type,
        new.metadata
      )
      returning * into new;
      return new;
    end if;

    if exists (select 1 from public.evidence_records er where er.id = inserted_id)
      or exists (select 1 from public.evidence_legacy el where el.id = inserted_id)
    then
      raise exception 'Evidence insert id % already exists', inserted_id;
    end if;

    insert into public.evidence_records (
      id,
      tenant_id,
      case_id,
      child_id,
      evidence_reference,
      evidence_title,
      evidence_description,
      evidence_type,
      evidence_source,
      evidence_status,
      privacy_level,
      uploader_user_id,
      captured_at,
      uploaded_at
    )
    values (
      inserted_id,
      resolved_tenant_id,
      resolved_case_id,
      new.child_id,
      format('legacy-evidence-%s', inserted_id::text),
      coalesce(new.evidence_type, 'Legacy evidence'),
      coalesce(new.note, ''),
      coalesce(new.evidence_type, 'legacy_note'),
      'legacy_evidence',
      'uploaded',
      'worker_only',
      new.created_by,
      coalesce(new.created_at, now()),
      coalesce(new.created_at, now())
    )
    returning
      id,
      child_id,
      null::uuid,
      evidence_description,
      null::text,
      uploaded_at,
      case_id,
      null::uuid,
      uploader_user_id,
      evidence_type,
      jsonb_build_object(
        'origin', 'evidence_records',
        'evidence_reference', evidence_reference,
        'evidence_source', evidence_source,
        'evidence_status', evidence_status,
        'privacy_level', privacy_level,
        'captured_at', captured_at,
        'legacy_source_evidence_item_id', source_evidence_item_id
      )
    into new;

    return new;
  elsif tg_op = 'UPDATE' then
    if exists (select 1 from public.evidence_records er where er.id = old.id) then
      if new.child_id is distinct from old.child_id
        or new.activity_id is distinct from old.activity_id
        or new.media_url is distinct from old.media_url
        or new.created_at is distinct from old.created_at
        or new.case_id is distinct from old.case_id
        or new.document_id is distinct from old.document_id
        or new.created_by is distinct from old.created_by
        or coalesce(new.metadata, '{}'::jsonb) is distinct from coalesce(old.metadata, '{}'::jsonb)
      then
        raise exception 'Canonical evidence updates only allow note and evidence_type; id, case/document linkage, actor, timestamps, and metadata are immutable';
      end if;

      update public.evidence_records
      set
        evidence_title = coalesce(new.note, evidence_title),
        evidence_description = new.note,
        evidence_type = coalesce(new.evidence_type, evidence_type),
        updated_at = now()
      where id = old.id
      returning
        id,
        child_id,
        null::uuid,
        evidence_description,
        null::text,
        uploaded_at,
        case_id,
        null::uuid,
        uploader_user_id,
        evidence_type,
        jsonb_build_object(
          'origin', 'evidence_records',
          'evidence_reference', evidence_reference,
          'evidence_source', evidence_source,
          'evidence_status', evidence_status,
          'privacy_level', privacy_level,
          'captured_at', captured_at,
          'legacy_source_evidence_item_id', source_evidence_item_id
        )
      into new;
      return new;
    end if;

    update public.evidence_legacy
    set
      child_id = new.child_id,
      activity_id = new.activity_id,
      note = new.note,
      media_url = new.media_url,
      created_at = coalesce(new.created_at, old.created_at),
      case_id = new.case_id,
      document_id = new.document_id,
      created_by = new.created_by,
      evidence_type = new.evidence_type,
      metadata = new.metadata
    where id = old.id
    returning * into new;
    return new;
  elsif tg_op = 'DELETE' then
    if exists (select 1 from public.evidence_records er where er.id = old.id) then
      update public.evidence_records
      set
        deleted = true,
        updated_at = now()
      where id = old.id;
      return old;
    end if;

    delete from public.evidence_legacy
    where id = old.id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists evidence_view_compat_write_trg on public.evidence;
create trigger evidence_view_compat_write_trg
instead of insert or update or delete on public.evidence
for each row execute function public.evidence_view_compat_write();

-- 11. Assessment consolidation
create table if not exists public.assessments_legacy (
  id uuid primary key,
  name text not null,
  description text,
  created_at timestamp without time zone default now()
);

do $$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'assessments'
      and c.relkind = 'r'
  ) then
    if to_regclass('public.assessments_migration_source') is null then
      execute 'alter table public.assessments rename to assessments_migration_source';
    end if;
  end if;

  if to_regclass('public.assessments_migration_source') is not null then
    insert into public.assessments_legacy (id, name, description, created_at)
    select id, name, description, created_at
    from public.assessments_migration_source
    on conflict (id) do nothing;

    execute 'drop table public.assessments_migration_source';
  end if;
end
$$;

create or replace view public.assessments with (security_invoker = true) as
select
  ar.id,
  coalesce(ar.assessment_reference, ar.assessment_status, format('assessment-%s', ar.id::text)) as name,
  nullif(ar.subject_reference, '') as description,
  coalesce(ar.assessment_started_at, ar.created_at)::timestamptz as created_at
from public.assessment_records ar
union all
select
  al.id,
  al.name,
  al.description,
  (al.created_at at time zone 'UTC')::timestamptz as created_at
from public.assessments_legacy al
where not exists (
  select 1
  from public.assessment_records ar
  where ar.id = al.id
);

grant select on public.visits to authenticated;
grant select on public.messages to authenticated;
grant select on public.evidence to authenticated;
grant insert, update, delete on public.evidence to authenticated;
grant select on public.assessments to authenticated;
