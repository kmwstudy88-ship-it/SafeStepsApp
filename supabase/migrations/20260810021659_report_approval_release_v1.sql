-- Report governance V1: independent approval and immutable release events.

alter table public.reports
  add column if not exists reunification_case_id uuid
    references public.reunification_cases(id) on delete restrict;

create index if not exists reports_reunification_case_idx
  on public.reports(reunification_case_id, requested_at desc);

create table if not exists public.case_report_release_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete restrict,
  report_id uuid not null references public.reports(id) on delete restrict,
  report_version_id uuid not null references public.report_versions(id) on delete restrict,
  report_version integer not null,
  approval_id uuid not null references public.report_approvals(id) on delete restrict,
  rendered_file_id uuid not null references public.report_rendered_files(id) on delete restrict,
  content_hash_sha256 text not null check (content_hash_sha256 ~ '^[0-9a-fA-F]{64}$'),
  file_hash_sha256 text not null check (file_hash_sha256 ~ '^[0-9a-fA-F]{64}$'),
  verification_code text not null unique,
  watermark_text text not null,
  release_notes text not null default '',
  released_by uuid not null references auth.users(id) on delete restrict,
  released_at timestamptz not null default now(),
  constraint case_report_release_unique unique (report_id, report_version)
);

alter table public.case_report_release_events enable row level security;

revoke all on table public.case_report_release_events from public, anon;
revoke update, delete on table public.case_report_release_events from authenticated;
grant select, insert on table public.case_report_release_events to authenticated;

drop policy if exists case_report_release_events_select on public.case_report_release_events;
create policy case_report_release_events_select
on public.case_report_release_events for select to authenticated
using (
  public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(
    case_id,
    array['caseworker','supervisor','clinician','court_viewer','admin']::text[]
  )
);

drop policy if exists case_report_release_events_insert on public.case_report_release_events;
create policy case_report_release_events_insert
on public.case_report_release_events for insert to authenticated
with check (
  released_by = (select auth.uid())
  and public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(case_id, array['supervisor','admin']::text[])
);

drop policy if exists reports_reunification_case_read on public.reports;
create policy reports_reunification_case_read
on public.reports for select to authenticated
using (
  reunification_case_id is not null
  and public.user_has_active_case_membership(reunification_case_id)
  and public.user_has_case_role(
    reunification_case_id,
    array['caseworker','supervisor','clinician','court_viewer','admin']::text[]
  )
);

drop policy if exists reports_reunification_case_review_update on public.reports;
create policy reports_reunification_case_review_update
on public.reports for update to authenticated
using (
  reunification_case_id is not null
  and public.user_has_active_case_membership(reunification_case_id)
  and public.user_has_case_role(reunification_case_id, array['supervisor','admin']::text[])
)
with check (
  reunification_case_id is not null
  and public.user_has_active_case_membership(reunification_case_id)
  and public.user_has_case_role(reunification_case_id, array['supervisor','admin']::text[])
);

drop policy if exists report_versions_reunification_case_read on public.report_versions;
create policy report_versions_reunification_case_read
on public.report_versions for select to authenticated
using (
  exists (
    select 1 from public.reports r
    where r.id = report_versions.report_id
      and r.reunification_case_id is not null
      and public.user_has_active_case_membership(r.reunification_case_id)
      and public.user_has_case_role(
        r.reunification_case_id,
        array['caseworker','supervisor','clinician','court_viewer','admin']::text[]
      )
  )
);

drop policy if exists report_versions_reunification_case_review_update on public.report_versions;
create policy report_versions_reunification_case_review_update
on public.report_versions for update to authenticated
using (
  exists (
    select 1 from public.reports r
    where r.id = report_versions.report_id
      and public.user_has_active_case_membership(r.reunification_case_id)
      and public.user_has_case_role(r.reunification_case_id, array['supervisor','admin']::text[])
  )
)
with check (
  exists (
    select 1 from public.reports r
    where r.id = report_versions.report_id
      and public.user_has_active_case_membership(r.reunification_case_id)
      and public.user_has_case_role(r.reunification_case_id, array['supervisor','admin']::text[])
  )
);

drop policy if exists report_approvals_reunification_case_insert on public.report_approvals;
create policy report_approvals_reunification_case_insert
on public.report_approvals for insert to authenticated
with check (
  approver_user_id = (select auth.uid())
  and exists (
    select 1 from public.reports r
    where r.id = report_approvals.report_id
      and public.user_has_active_case_membership(r.reunification_case_id)
      and public.user_has_case_role(r.reunification_case_id, array['supervisor','admin']::text[])
  )
);

grant select on public.reports, public.report_versions, public.report_approvals,
  public.report_rendered_files to authenticated;
grant update (status, approved_by, approved_at, released_at, record_version)
  on public.reports to authenticated;
grant update (version_status, released_at) on public.report_versions to authenticated;
grant insert on public.report_approvals to authenticated;

create or replace function public.decide_case_report_version(
  p_case_id uuid,
  p_report_id uuid,
  p_report_version_id uuid,
  p_decision text,
  p_decision_reason text default ''
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_report public.reports%rowtype;
  target_version public.report_versions%rowtype;
  approval_id uuid;
begin
  if p_decision not in ('approved','changes_requested','rejected') then
    raise exception 'Unsupported report review decision';
  end if;

  if p_decision in ('changes_requested','rejected')
    and length(trim(coalesce(p_decision_reason, ''))) = 0 then
    raise exception 'A reason is required when returning or rejecting a report';
  end if;

  if not public.user_has_active_case_membership(p_case_id)
    or not public.user_has_case_role(p_case_id, array['supervisor','admin']::text[]) then
    raise exception 'SafeSteps report approval access denied';
  end if;

  select * into target_report
  from public.reports
  where id = p_report_id and reunification_case_id = p_case_id
  for update;

  if target_report.id is null then
    raise exception 'Report not found for the selected case';
  end if;

  select * into target_version
  from public.report_versions
  where id = p_report_version_id
    and report_id = p_report_id
    and version_number = target_report.current_version
  for update;

  if target_version.id is null then
    raise exception 'Only the current report version can be reviewed';
  end if;

  if target_version.created_by = (select auth.uid())
    or target_report.primary_author_id = (select auth.uid()) then
    raise exception 'Independent approval requires a reviewer who did not author this version';
  end if;

  if target_report.status not in ('quality_review','approval_pending','information_requested','draft') then
    raise exception 'This report is not awaiting an approval decision';
  end if;

  insert into public.report_approvals (
    report_id, report_version, approval_stage, required_role,
    approver_user_id, decision, decision_reason,
    conflict_confirmed_clear, independence_confirmed, approved_at
  ) values (
    p_report_id, target_version.version_number, 'independent_review', 'supervisor',
    (select auth.uid()), p_decision, nullif(trim(coalesce(p_decision_reason, '')), ''),
    true, true, case when p_decision = 'approved' then now() else null end
  )
  returning id into approval_id;

  update public.report_versions
  set version_status = case when p_decision = 'approved' then 'approved' else 'review' end
  where id = target_version.id;

  update public.reports
  set status = case
      when p_decision = 'approved' then 'approved'
      else 'information_requested'
    end,
    approved_by = case when p_decision = 'approved' then (select auth.uid()) else null end,
    approved_at = case when p_decision = 'approved' then now() else null end,
    record_version = record_version + 1
  where id = target_report.id;

  return approval_id;
end;
$$;

revoke all on function public.decide_case_report_version(uuid,uuid,uuid,text,text)
  from public, anon;
grant execute on function public.decide_case_report_version(uuid,uuid,uuid,text,text)
  to authenticated;

create or replace function public.release_case_report_version(
  p_case_id uuid,
  p_report_id uuid,
  p_report_version_id uuid,
  p_rendered_file_id uuid,
  p_release_notes text default ''
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_report public.reports%rowtype;
  target_version public.report_versions%rowtype;
  target_file public.report_rendered_files%rowtype;
  target_approval public.report_approvals%rowtype;
  release_id uuid;
  release_code text;
begin
  if not public.user_has_active_case_membership(p_case_id)
    or not public.user_has_case_role(p_case_id, array['supervisor','admin']::text[]) then
    raise exception 'SafeSteps report release access denied';
  end if;

  select * into target_report
  from public.reports
  where id = p_report_id and reunification_case_id = p_case_id
  for update;

  select * into target_version
  from public.report_versions
  where id = p_report_version_id
    and report_id = p_report_id
    and version_number = target_report.current_version
  for update;

  if target_report.id is null or target_version.id is null then
    raise exception 'Current report version not found for the selected case';
  end if;

  if target_report.status <> 'approved' or target_version.version_status <> 'approved' then
    raise exception 'Only an independently approved current version can be released';
  end if;

  select * into target_approval
  from public.report_approvals
  where report_id = p_report_id
    and report_version = target_version.version_number
    and decision = 'approved'
    and independence_confirmed is true
    and conflict_confirmed_clear is true
  order by approved_at desc
  limit 1;

  if target_approval.id is null then
    raise exception 'Independent approval history is missing';
  end if;

  select * into target_file
  from public.report_rendered_files
  where id = p_rendered_file_id
    and report_id = p_report_id
    and report_version = target_version.version_number
    and lower(file_format) = 'pdf';

  if target_file.id is null then
    raise exception 'A traceable PDF for the approved version is required';
  end if;

  if target_version.content_hash !~ '^[0-9a-fA-F]{64}$'
    or target_file.file_hash_sha256 !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'Snapshot and PDF SHA-256 hashes are required before release';
  end if;

  release_code := upper(encode(gen_random_bytes(8), 'hex'));

  insert into public.case_report_release_events (
    case_id, report_id, report_version_id, report_version, approval_id,
    rendered_file_id, content_hash_sha256, file_hash_sha256,
    verification_code, watermark_text, release_notes, released_by
  ) values (
    p_case_id, p_report_id, target_version.id, target_version.version_number,
    target_approval.id, target_file.id, lower(target_version.content_hash),
    lower(target_file.file_hash_sha256), release_code,
    'SafeSteps • ' || target_report.report_reference || ' • v' || target_version.version_number
      || ' • ' || release_code,
    trim(coalesce(p_release_notes, '')), (select auth.uid())
  )
  returning id into release_id;

  update public.report_versions
  set version_status = 'released', released_at = now()
  where id = target_version.id;

  update public.reports
  set status = 'released', released_at = now(), record_version = record_version + 1
  where id = target_report.id;

  return release_id;
end;
$$;

revoke all on function public.release_case_report_version(uuid,uuid,uuid,uuid,text)
  from public, anon;
grant execute on function public.release_case_report_version(uuid,uuid,uuid,uuid,text)
  to authenticated;
