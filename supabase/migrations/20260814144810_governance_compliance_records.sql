create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

create table public.governance_consents (
  id uuid primary key default extensions.gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete restrict,
  subject_user_id uuid not null references auth.users(id) on delete restrict,
  recorded_by_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  scope text[] not null check (cardinality(scope) > 0),
  status text not null check (status in ('active','withdrawn','expired','declined')),
  version integer not null check (version > 0),
  source text not null check (source in ('self','guardian','authorised_worker','court_order')),
  effective_at timestamptz not null default now(),
  expires_at timestamptz,
  supersedes_consent_id uuid references public.governance_consents(id) on delete restrict,
  reason_code text,
  attestation_reference text,
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at > effective_at),
  check (status <> 'withdrawn' or reason_code is not null)
);

create index governance_consents_case_subject_created_idx
  on public.governance_consents(case_id, subject_user_id, created_at desc);
create unique index governance_consents_case_subject_version_idx
  on public.governance_consents(case_id, subject_user_id, version);

create table public.governance_approvals (
  id uuid primary key default extensions.gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete restrict,
  requested_by_user_id uuid not null references auth.users(id) on delete restrict,
  decided_by_user_id uuid references auth.users(id) on delete restrict,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  status text not null check (status in ('requested','approved','denied','revoked','expired')),
  rationale_code text,
  expires_at timestamptz,
  supersedes_approval_id uuid references public.governance_approvals(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (status = 'requested' or decided_by_user_id is not null),
  check (status <> 'approved' or expires_at is not null)
);

create index governance_approvals_case_resource_created_idx
  on public.governance_approvals(case_id, resource_type, resource_id, created_at desc);

create table public.governance_legal_holds (
  id uuid primary key default extensions.gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete restrict,
  hold_key uuid not null,
  recorded_by_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  status text not null check (status in ('active','released')),
  scope text[] not null check (cardinality(scope) > 0),
  authority_reference text not null,
  reason_code text not null,
  effective_at timestamptz not null default now(),
  supersedes_hold_event_id uuid references public.governance_legal_holds(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index governance_legal_holds_case_key_created_idx
  on public.governance_legal_holds(case_id, hold_key, created_at desc);

create table public.governance_access_decisions (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  case_id uuid not null references public.reunification_cases(id) on delete restrict,
  action text not null,
  purpose text not null check (purpose in (
    'case_management','care_coordination','child_safety','service_referral',
    'legal_proceeding','quality_assurance','emergency'
  )),
  authority_basis text not null check (authority_basis in (
    'consent','authorised_by_law','child_safety_function','court_order','emergency'
  )),
  classification text not null check (classification in (
    'internal','confidential','restricted','child_private'
  )),
  outcome text not null check (outcome in ('allowed','denied')),
  reason_code text not null,
  resource_type text not null,
  resource_id uuid,
  consent_id uuid references public.governance_consents(id) on delete restrict,
  approval_id uuid references public.governance_approvals(id) on delete restrict,
  legal_hold_id uuid references public.governance_legal_holds(id) on delete restrict,
  request_id uuid not null,
  obligations text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (octet_length(metadata::text) <= 8192),
  check (not (metadata ?| array[
    'body','message_text','assessment_answers','answers','notes','file_content',
    'transcript','transcript_text','response','responses'
  ]))
);

create index governance_access_decisions_case_created_idx
  on public.governance_access_decisions(case_id, created_at desc);
create index governance_access_decisions_actor_created_idx
  on public.governance_access_decisions(actor_user_id, created_at desc);
create index governance_access_decisions_request_idx
  on public.governance_access_decisions(request_id);

create or replace function private.reject_governance_record_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'SafeSteps governance records are append-only';
end;
$$;

revoke all on function private.reject_governance_record_mutation() from public, anon, authenticated;

create trigger governance_consents_no_update_delete
  before update or delete on public.governance_consents
  for each row execute function private.reject_governance_record_mutation();
create trigger governance_approvals_no_update_delete
  before update or delete on public.governance_approvals
  for each row execute function private.reject_governance_record_mutation();
create trigger governance_legal_holds_no_update_delete
  before update or delete on public.governance_legal_holds
  for each row execute function private.reject_governance_record_mutation();
create trigger governance_access_decisions_no_update_delete
  before update or delete on public.governance_access_decisions
  for each row execute function private.reject_governance_record_mutation();

alter table public.governance_consents enable row level security;
alter table public.governance_approvals enable row level security;
alter table public.governance_legal_holds enable row level security;
alter table public.governance_access_decisions enable row level security;

create policy governance_consents_select
on public.governance_consents for select to authenticated
using (
  subject_user_id = (select auth.uid())
  or public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
);

create policy governance_consents_insert
on public.governance_consents for insert to authenticated
with check (
  recorded_by_user_id = (select auth.uid())
  and public.user_has_active_case_membership(case_id)
  and (
    subject_user_id = (select auth.uid())
    or public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
  )
);

create policy governance_approvals_select
on public.governance_approvals for select to authenticated
using (
  public.user_has_active_case_membership(case_id)
  and (
    requested_by_user_id = (select auth.uid())
    or public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
  )
);

create policy governance_approvals_insert
on public.governance_approvals for insert to authenticated
with check (
  public.user_has_active_case_membership(case_id)
  and (
    (status = 'requested' and requested_by_user_id = (select auth.uid()) and decided_by_user_id is null)
    or (
      status in ('approved','denied','revoked','expired')
      and decided_by_user_id = (select auth.uid())
      and public.user_has_case_role(case_id, array['supervisor','admin']::text[])
    )
  )
);

create policy governance_legal_holds_select
on public.governance_legal_holds for select to authenticated
using (public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[]));

create policy governance_legal_holds_insert
on public.governance_legal_holds for insert to authenticated
with check (
  recorded_by_user_id = (select auth.uid())
  and public.user_has_case_role(case_id, array['supervisor','admin']::text[])
);

create policy governance_access_decisions_select
on public.governance_access_decisions for select to authenticated
using (
  actor_user_id = (select auth.uid())
  or public.user_has_case_role(case_id, array['supervisor','admin']::text[])
);

create policy governance_access_decisions_insert
on public.governance_access_decisions for insert to authenticated
with check (
  actor_user_id = (select auth.uid())
  and public.user_has_active_case_membership(case_id)
);

revoke all on public.governance_consents from anon;
revoke all on public.governance_approvals from anon;
revoke all on public.governance_legal_holds from anon;
revoke all on public.governance_access_decisions from anon;

revoke all on public.governance_consents from authenticated;
revoke all on public.governance_approvals from authenticated;
revoke all on public.governance_legal_holds from authenticated;
revoke all on public.governance_access_decisions from authenticated;

grant select, insert on public.governance_consents to authenticated;
grant select, insert on public.governance_approvals to authenticated;
grant select, insert on public.governance_legal_holds to authenticated;
grant select, insert on public.governance_access_decisions to authenticated;
