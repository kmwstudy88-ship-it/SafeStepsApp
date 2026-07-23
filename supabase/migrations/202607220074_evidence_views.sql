create or replace view public.evidence_timeline_view
with (security_invoker = true)
as
select
  er.id as evidence_record_id,
  er.tenant_id,
  er.case_id,
  er.evidence_reference,
  er.evidence_title,
  er.evidence_type,
  er.evidence_status,
  er.privacy_level,
  er.uploaded_at as event_occurred_at,
  'evidence_upload'::text as event_type
from public.evidence_records er
where public.has_evidence_access(er.id)
union all
select
  ete.evidence_record_id,
  ete.tenant_id,
  ete.case_id,
  coalesce(er.evidence_reference, ete.id::text),
  ete.event_title,
  coalesce(er.evidence_type, ete.event_type),
  coalesce(er.evidence_status, 'timeline'),
  coalesce(er.privacy_level, 'worker_only'),
  ete.event_occurred_at,
  ete.event_type
from public.evidence_timeline_events ete
left join public.evidence_records er on er.id = ete.evidence_record_id
where ete.evidence_record_id is null or public.has_evidence_access(ete.evidence_record_id);

create or replace view public.evidence_vault_dashboard_view
with (security_invoker = true)
as
select
  er.tenant_id,
  er.case_id,
  count(*) as evidence_count,
  count(*) filter (where er.evidence_status = 'pending_review') as pending_verification_count,
  count(*) filter (where er.legal_hold = true) as legal_hold_count,
  count(*) filter (where exists (
    select 1 from public.evidence_ai_analyses aia
    where aia.evidence_record_id = er.id
      and aia.review_status = 'pending_human_review'
  )) as pending_ai_review_count,
  count(*) filter (where exists (
    select 1 from public.evidence_files ef
    where ef.evidence_record_id = er.id
      and ef.integrity_status not in ('verified', 'pending_verification')
  )) as integrity_warning_count
from public.evidence_records er
where public.has_evidence_access(er.id)
group by er.tenant_id, er.case_id;

grant select on public.evidence_timeline_view, public.evidence_vault_dashboard_view to authenticated;
