-- Evidence V1: atomic worker review and append-only decision history.

create table if not exists public.case_document_review_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete restrict,
  document_id uuid not null references public.case_documents(id) on delete restrict,
  document_version_id uuid not null references public.case_document_versions(id) on delete restrict,
  decision text not null check (decision in ('accepted', 'needs_update', 'excluded')),
  include_in_report boolean not null default false,
  review_notes text not null default '',
  reviewed_by uuid not null references auth.users(id) on delete restrict,
  reviewed_at timestamptz not null default now(),
  constraint case_document_review_report_selection_check
    check (not include_in_report or decision = 'accepted')
);

alter table public.case_document_review_events enable row level security;

revoke all on table public.case_document_review_events from public, anon;
revoke update, delete on table public.case_document_review_events from authenticated;
grant select, insert on table public.case_document_review_events to authenticated;

drop policy if exists case_document_review_events_select on public.case_document_review_events;
create policy case_document_review_events_select
on public.case_document_review_events
for select
to authenticated
using (
  public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(
    case_id,
    array['caseworker', 'supervisor', 'clinician', 'admin']::text[]
  )
);

drop policy if exists case_document_review_events_insert on public.case_document_review_events;
create policy case_document_review_events_insert
on public.case_document_review_events
for insert
to authenticated
with check (
  reviewed_by = (select auth.uid())
  and public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(
    case_id,
    array['caseworker', 'supervisor', 'admin']::text[]
  )
);

create index if not exists case_document_review_events_case_reviewed_idx
  on public.case_document_review_events(case_id, reviewed_at desc);

create index if not exists case_document_review_events_document_reviewed_idx
  on public.case_document_review_events(document_id, reviewed_at desc);

create or replace function public.review_case_document_version(
  p_case_id uuid,
  p_document_id uuid,
  p_document_version_id uuid,
  p_decision text,
  p_include_in_report boolean default false,
  p_review_notes text default ''
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  review_event_id uuid;
  current_document_id uuid;
begin
  if p_decision not in ('accepted', 'needs_update', 'excluded') then
    raise exception 'Unsupported evidence review decision';
  end if;

  if p_include_in_report and p_decision <> 'accepted' then
    raise exception 'Only accepted evidence can be selected for report inclusion';
  end if;

  if p_decision in ('needs_update', 'excluded') and length(trim(coalesce(p_review_notes, ''))) = 0 then
    raise exception 'Review notes are required when evidence is returned or excluded';
  end if;

  if not public.user_has_active_case_membership(p_case_id)
    or not public.user_has_case_role(
      p_case_id,
      array['caseworker', 'supervisor', 'admin']::text[]
    ) then
    raise exception 'SafeSteps evidence review access denied';
  end if;

  select document.id
    into current_document_id
  from public.case_documents as document
  join public.case_document_versions as version
    on version.document_id = document.id
  where document.case_id = p_case_id
    and document.id = p_document_id
    and document.current_version_id = p_document_version_id
    and version.id = p_document_version_id
  for update of document, version;

  if current_document_id is null then
    raise exception 'The selected current document version could not be reviewed';
  end if;

  update public.case_document_versions
  set
    review_status = p_decision,
    review_notes = trim(coalesce(p_review_notes, ''))
  where id = p_document_version_id;

  update public.case_documents
  set
    status = p_decision,
    court_report_include = p_include_in_report,
    notes = trim(coalesce(p_review_notes, '')),
    updated_at = now()
  where id = p_document_id
    and case_id = p_case_id;

  insert into public.case_document_review_events (
    case_id,
    document_id,
    document_version_id,
    decision,
    include_in_report,
    review_notes,
    reviewed_by
  )
  values (
    p_case_id,
    p_document_id,
    p_document_version_id,
    p_decision,
    p_include_in_report,
    trim(coalesce(p_review_notes, '')),
    (select auth.uid())
  )
  returning id into review_event_id;

  return review_event_id;
end;
$$;

revoke all on function public.review_case_document_version(uuid, uuid, uuid, text, boolean, text)
  from public, anon;
grant execute on function public.review_case_document_version(uuid, uuid, uuid, text, boolean, text)
  to authenticated;
