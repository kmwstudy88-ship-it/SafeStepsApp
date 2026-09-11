-- Unify legacy document-intelligence storage into canonical relations.

create table if not exists public.document_entities (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.reunification_cases(id) on delete cascade,
  case_document_id uuid references public.case_documents(id) on delete cascade,
  document_version_id uuid references public.case_document_versions(id) on delete cascade,
  entity_type text not null,
  entity_value text not null,
  confidence_score numeric,
  source_table text not null default 'document_entities',
  source_record_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_document_entities_case_document
  on public.document_entities(case_document_id, document_version_id, detected_at desc);
create index if not exists idx_document_entities_case
  on public.document_entities(case_id, detected_at desc);

alter table public.document_entities enable row level security;

drop policy if exists document_entities_select on public.document_entities;
create policy document_entities_select on public.document_entities
for select to authenticated
using (
  exists (
    select 1
    from public.case_documents as document
    where document.id = document_entities.case_document_id
      and (
        document.parent_user_id = (select auth.uid())
        or document.worker_user_id = (select auth.uid())
        or document.created_by = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
  or exists (
    select 1
    from public.case_document_versions as version
    join public.case_documents as document
      on document.id = version.document_id
    where version.id = document_entities.document_version_id
      and (
        document.parent_user_id = (select auth.uid())
        or document.worker_user_id = (select auth.uid())
        or document.created_by = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
  or exists (
    select 1
    from public.case_documents as document
    where document_entities.case_document_id is null
      and document_entities.document_version_id is null
      and document.case_id = document_entities.case_id
      and (
        document.parent_user_id = (select auth.uid())
        or document.worker_user_id = (select auth.uid())
        or document.created_by = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

create or replace view public.document_text
with (security_invoker = true)
as
select
  version.id as id,
  document.id as case_document_id,
  version.id as document_version_id,
  document.case_id,
  document.document_type,
  document.title as document_title,
  document.status as document_status,
  version.version_number,
  version.file_name,
  version.file_path,
  version.mime_type,
  version.file_sha256,
  version.review_status,
  version.review_notes,
  document.notes as document_notes,
  coalesce(parsed_by_sha.extracted_text, parsed_by_path.extracted_text) as text_content,
  coalesce(parsed_by_sha.created_at, parsed_by_path.created_at, version.uploaded_at) as source_created_at
from public.case_document_versions as version
join public.case_documents as document
  on document.id = version.document_id
left join lateral (
  select
    d.extracted_text,
    d.created_at
  from public.documents as d
  where version.file_sha256 is not null
    and d.sha256 = version.file_sha256
  and (d.case_id is null or d.case_id = document.case_id)
  order by d.created_at desc
  limit 1
) as parsed_by_sha on true
left join lateral (
  select
    d.extracted_text,
    d.created_at
  from public.documents as d
  where parsed_by_sha.created_at is null
    and d.storage_path = version.file_path
    and (d.case_id is null or d.case_id = document.case_id)
  order by d.created_at desc
  limit 1
) as parsed_by_path on true;

create or replace view public.document_contradictions
with (security_invoker = true)
as
select
  contradiction.id,
  contradiction.case_id,
  'assessment_contradictions'::text as source_table,
  contradiction.id as source_record_id,
  contradiction.contradiction_type,
  contradiction.description as contradiction_summary,
  contradiction.source_a,
  contradiction.source_b,
  contradiction.severity as materiality,
  contradiction.detected_at,
  contradiction.include_in_report as requires_resolution,
  contradiction.resolved_at,
  contradiction.worker_notes as reviewer_notes,
  contradiction.created_by as reviewed_by,
  contradiction.created_at
from public.assessment_contradictions as contradiction
union all
select
  contradiction.id,
  coalesce(
    case
      when contradiction.source_a_type ilike '%version%' then (
        select document.case_id
        from public.case_document_versions as version
        join public.case_documents as document
          on document.id = version.document_id
        where version.id = contradiction.source_a_id
        limit 1
      )
      when contradiction.source_a_type ilike '%document%' then (
        select document.case_id
        from public.case_documents as document
        where document.id = contradiction.source_a_id
        limit 1
      )
      else null::uuid
    end,
    case
      when contradiction.source_b_type ilike '%version%' then (
        select document.case_id
        from public.case_document_versions as version
        join public.case_documents as document
          on document.id = version.document_id
        where version.id = contradiction.source_b_id
        limit 1
      )
      when contradiction.source_b_type ilike '%document%' then (
        select document.case_id
        from public.case_documents as document
        where document.id = contradiction.source_b_id
        limit 1
      )
      else null::uuid
    end
  ) as case_id,
  'ai_retrieval_contradictions'::text as source_table,
  contradiction.id as source_record_id,
  contradiction.contradiction_type,
  contradiction.contradiction_summary,
  coalesce(contradiction.source_a_reference, contradiction.source_a_type) as source_a,
  coalesce(contradiction.source_b_reference, contradiction.source_b_type) as source_b,
  contradiction.materiality,
  coalesce(contradiction.reviewed_at, contradiction.created_at) as detected_at,
  contradiction.requires_resolution,
  null::timestamptz as resolved_at,
  null::text as reviewer_notes,
  contradiction.reviewed_by,
  contradiction.created_at
from public.ai_retrieval_contradictions as contradiction;

create or replace view public.document_fairness
with (security_invoker = true)
as
select
  fairness.id,
  fairness.evaluation_run_id,
  fairness.metric_id,
  fairness.reference_subgroup_id,
  fairness.comparison_subgroup_id,
  fairness.reference_value,
  fairness.comparison_value,
  fairness.absolute_difference,
  fairness.relative_ratio,
  fairness.confidence_interval_lower,
  fairness.confidence_interval_upper,
  fairness.disparity_threshold,
  fairness.outcome,
  fairness.materiality_assessment,
  fairness.remediation_required,
  fairness.calculated_at
from public.ai_fairness_results as fairness;

create or replace view public.document_risks
with (security_invoker = true)
as
select
  risk.id,
  risk.tenant_id,
  risk.case_id,
  risk.child_id,
  risk.signal_reference as risk_reference,
  risk.signal_source as risk_source,
  risk.signal_type as risk_type,
  risk.severity_level,
  risk.confidence_score,
  risk.ai_explanation as summary,
  risk.linked_evidence_ids,
  risk.review_status,
  risk.reviewer_user_id,
  risk.detected_at,
  risk.created_at
from public.ai_risk_signals as risk;

create or replace view public.document_timeline
with (security_invoker = true)
as
select
  timeline.id,
  timeline.tenant_id,
  timeline.case_id,
  timeline.evidence_record_id,
  timeline.event_type,
  timeline.event_title,
  timeline.event_summary,
  timeline.event_occurred_at,
  timeline.source_table,
  timeline.source_record_id,
  timeline.created_at
from public.evidence_timeline_events as timeline;

create or replace view public.document_concerns
with (security_invoker = true)
as
select
  risk.id,
  risk.case_id,
  'risk_signal'::text as concern_category,
  risk.signal_type as concern_type,
  risk.severity_level as severity,
  coalesce(risk.ai_explanation, risk.signal_source) as concern_summary,
  risk.review_status as concern_status,
  true as requires_human_review,
  null::timestamptz as resolved_at,
  risk.detected_at,
  'ai_risk_signals'::text as source_table,
  risk.id as source_record_id,
  risk.created_at
from public.ai_risk_signals as risk
union all
select
  contradiction.id,
  contradiction.case_id,
  'assessment_contradiction'::text as concern_category,
  contradiction.contradiction_type as concern_type,
  contradiction.severity,
  contradiction.description as concern_summary,
  case when contradiction.resolved_at is null then 'open' else 'resolved' end as concern_status,
  contradiction.resolved_at is null as requires_human_review,
  contradiction.resolved_at,
  contradiction.detected_at,
  'assessment_contradictions'::text as source_table,
  contradiction.id as source_record_id,
  contradiction.created_at
from public.assessment_contradictions as contradiction
union all
select
  contradiction.id,
  coalesce(
    case
      when contradiction.source_a_type ilike '%version%' then (
        select document.case_id
        from public.case_document_versions as version
        join public.case_documents as document
          on document.id = version.document_id
        where version.id = contradiction.source_a_id
        limit 1
      )
      when contradiction.source_a_type ilike '%document%' then (
        select document.case_id
        from public.case_documents as document
        where document.id = contradiction.source_a_id
        limit 1
      )
      else null::uuid
    end,
    case
      when contradiction.source_b_type ilike '%version%' then (
        select document.case_id
        from public.case_document_versions as version
        join public.case_documents as document
          on document.id = version.document_id
        where version.id = contradiction.source_b_id
        limit 1
      )
      when contradiction.source_b_type ilike '%document%' then (
        select document.case_id
        from public.case_documents as document
        where document.id = contradiction.source_b_id
        limit 1
      )
      else null::uuid
    end
  ) as case_id,
  'retrieval_contradiction'::text as concern_category,
  contradiction.contradiction_type as concern_type,
  contradiction.materiality as severity,
  contradiction.contradiction_summary as concern_summary,
  case when contradiction.requires_resolution then 'open' else 'closed' end as concern_status,
  contradiction.requires_resolution as requires_human_review,
  case when contradiction.requires_resolution then null::timestamptz else contradiction.reviewed_at end as resolved_at,
  contradiction.created_at as detected_at,
  'ai_retrieval_contradictions'::text as source_table,
  contradiction.id as source_record_id,
  contradiction.created_at
from public.ai_retrieval_contradictions as contradiction;

revoke all on public.document_entities from public, anon, authenticated;
grant all on public.document_entities to service_role;

revoke all on
  public.document_text,
  public.document_contradictions,
  public.document_fairness,
  public.document_risks,
  public.document_timeline,
  public.document_concerns
from public, anon, authenticated;
grant select on
  public.document_text,
  public.document_contradictions,
  public.document_fairness,
  public.document_risks,
  public.document_timeline,
  public.document_concerns
to service_role;
