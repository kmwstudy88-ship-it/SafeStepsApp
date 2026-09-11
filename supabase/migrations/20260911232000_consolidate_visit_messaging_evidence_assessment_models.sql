create extension if not exists pgcrypto;

-- 8. Case-management consolidation
create or replace view public.visits as
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
create or replace view public.messages as
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
with resolved_legacy_evidence as (
  select
    e.id,
    coalesce(e.case_id, d.case_id) as resolved_case_id,
    coalesce(c.tenant_id, c_from_document.tenant_id, fallback_tenant.id) as resolved_tenant_id,
    e.child_id,
    e.note,
    e.created_at,
    e.created_by,
    e.evidence_type,
    e.metadata,
    e.media_url,
    e.document_id
  from public.evidence e
  left join public.documents d on d.id = e.document_id
  left join public.cases c on c.id = e.case_id
  left join public.cases c_from_document on c_from_document.id = d.case_id
  left join lateral (
    select pt.id
    from public.platform_tenants pt
    order by pt.created_at asc
    limit 1
  ) fallback_tenant on true
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
  and not exists (
    select 1
    from public.evidence_records er
    where er.evidence_reference = format('legacy-evidence-%s', r.id::text)
  );

alter table public.evidence rename to evidence_legacy;

create or replace view public.evidence as
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
from public.evidence_legacy el;

-- 11. Assessment consolidation
alter table public.assessments rename to assessments_legacy;

create or replace view public.assessments as
select
  ar.id,
  coalesce(ar.assessment_reference, ar.assessment_status, format('assessment-%s', ar.id::text)) as name,
  nullif(ar.subject_reference, '') as description,
  coalesce(ar.assessment_started_at, ar.created_at, now())::timestamp without time zone as created_at
from public.assessment_records ar
union all
select
  al.id,
  al.name,
  al.description,
  al.created_at
from public.assessments_legacy al
where not exists (
  select 1
  from public.assessment_records ar
  where ar.id = al.id
);

grant select on public.visits to authenticated;
grant select on public.messages to authenticated;
grant select on public.evidence to authenticated;
grant select on public.assessments to authenticated;
