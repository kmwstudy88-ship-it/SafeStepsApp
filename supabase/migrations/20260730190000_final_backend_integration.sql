-- SafeSteps final backend integration:
-- authenticated role-aware sessions, durable document analysis results,
-- and automatic case-document version advancement.

create extension if not exists pgcrypto;

create schema if not exists safesteps_private;
revoke all on schema safesteps_private from public;
revoke all on schema safesteps_private from anon, authenticated;

create unique index if not exists user_security_sessions_auth_reference_unique
  on public.user_security_sessions(auth_session_reference);

drop policy if exists user_security_sessions_self_insert
  on public.user_security_sessions;
create policy user_security_sessions_self_insert
on public.user_security_sessions
for insert
to authenticated
with check (user_id = (select auth.uid()));

grant select, insert, update
  on public.user_security_sessions
  to authenticated;

create table if not exists public.document_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null
    references public.reunification_cases(id)
    on delete cascade,
  document_id uuid
    references public.case_documents(id)
    on delete set null,
  document_version_id uuid
    references public.case_document_versions(id)
    on delete set null,
  requested_by uuid not null
    references auth.users(id)
    on delete restrict,
  source_mode text not null
    check (source_mode in ('text', 'file')),
  source_metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(source_metadata) = 'object'),
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'failed')),
  schema_version text not null,
  model text,
  result jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint document_analysis_completed_result_required
    check (status <> 'completed' or result is not null),
  constraint document_analysis_failed_error_required
    check (status <> 'failed' or error_code is not null)
);

alter table public.document_analysis_runs enable row level security;

drop policy if exists document_analysis_runs_select
  on public.document_analysis_runs;
create policy document_analysis_runs_select
on public.document_analysis_runs
for select
to authenticated
using (
  public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(
    case_id,
    array[
      'case_owner',
      'parent',
      'facilitator',
      'caseworker',
      'supervisor',
      'clinician',
      'admin'
    ]::text[]
  )
);

drop policy if exists document_analysis_runs_insert
  on public.document_analysis_runs;
create policy document_analysis_runs_insert
on public.document_analysis_runs
for insert
to authenticated
with check (
  requested_by = (select auth.uid())
  and public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(
    case_id,
    array[
      'case_owner',
      'parent',
      'facilitator',
      'caseworker',
      'supervisor',
      'clinician',
      'admin'
    ]::text[]
  )
);

drop policy if exists document_analysis_runs_update
  on public.document_analysis_runs;
create policy document_analysis_runs_update
on public.document_analysis_runs
for update
to authenticated
using (
  requested_by = (select auth.uid())
  and public.user_has_active_case_membership(case_id)
)
with check (
  requested_by = (select auth.uid())
  and public.user_has_active_case_membership(case_id)
);

grant select, insert, update
  on public.document_analysis_runs
  to authenticated;

create index if not exists document_analysis_runs_case_created_idx
  on public.document_analysis_runs(case_id, created_at desc);
create index if not exists document_analysis_runs_document_created_idx
  on public.document_analysis_runs(document_id, created_at desc)
  where document_id is not null;
create index if not exists document_analysis_runs_requester_created_idx
  on public.document_analysis_runs(requested_by, created_at desc);

create or replace function safesteps_private.advance_case_document_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_case_id uuid;
begin
  select document.case_id
  into target_case_id
  from public.case_documents as document
  where document.id = new.document_id;

  if target_case_id is null then
    raise exception 'SafeSteps case document not found';
  end if;

  if new.uploaded_by is distinct from (select auth.uid()) then
    raise exception 'SafeSteps document uploader does not match the authenticated user';
  end if;

  if not public.user_has_case_role(
    target_case_id,
    array[
      'case_owner',
      'parent',
      'facilitator',
      'caseworker',
      'supervisor',
      'clinician',
      'admin'
    ]::text[]
  ) then
    raise exception 'SafeSteps case document access denied';
  end if;

  update public.case_documents
  set
    current_version_id = new.id,
    status = 'submitted',
    updated_at = now()
  where id = new.document_id;

  return new;
end;
$$;

revoke all
  on function safesteps_private.advance_case_document_version()
  from public;
revoke all
  on function safesteps_private.advance_case_document_version()
  from anon, authenticated;

drop trigger if exists case_document_version_advance
  on public.case_document_versions;
create trigger case_document_version_advance
after insert
on public.case_document_versions
for each row
execute function safesteps_private.advance_case_document_version();
