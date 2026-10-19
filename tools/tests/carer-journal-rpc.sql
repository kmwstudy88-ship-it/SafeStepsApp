-- Isolated PostgreSQL fixture, not a migration and never run against a connected project.
\set ON_ERROR_STOP on
create role authenticated;
create role anon;
create role service_role;
create schema auth;
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated, anon;
grant execute on function auth.uid() to authenticated, anon;
create function auth.jwt() returns jsonb language sql stable as $$
 select jsonb_build_object('role',coalesce(nullif(current_setting('request.jwt.claim.role',true),''),'authenticated'),
 'aal',coalesce(nullif(current_setting('test.jwt.aal',true),''),'aal1'))
$$;
create table public.platform_tenants(id uuid primary key,tenant_status text not null);
insert into public.platform_tenants values ('33333333-3333-4333-8333-333333333333','active');
create table public.cases (id uuid primary key, tenant_id uuid, status text, case_status_code text,
 title text default 'Fixture case',case_title text,current_stage text,target_review_at timestamptz);
create table public.case_allocations(tenant_id uuid,case_id uuid,allocated_user_id uuid,allocation_status text,
 ended_at timestamptz,allocation_role text,allocated_at timestamptz);
create function public.is_case_team_member(uuid) returns boolean language sql stable as $$select false$$;
create table public.tenant_memberships (tenant_id uuid, user_id uuid, membership_status text,
  effective_from timestamptz, effective_to timestamptz, revoked_at timestamptz, suspended_at timestamptz);
create table public.case_participants (case_id uuid, tenant_id uuid, user_id uuid, participant_role text, participant_type text,
  status text, participation_status text, effective_from timestamptz, effective_to timestamptz,
  participation_start_at timestamptz, participation_end_at timestamptz, allowed_actions text[], denied_actions text[]);
create table public.case_notes (id uuid primary key, tenant_id uuid, case_id uuid references public.cases(id),
  note_reference text, note_type text, note_title text, note_body text, note_status text, visibility_level text,
  family_shared boolean, child_shared boolean, court_exportable boolean, legal_restricted boolean, author_user_id uuid,
  created_at timestamptz default now(),updated_at timestamptz default now(),finalised_at timestamptz,amended_note_id uuid,
  user_id uuid,family_id uuid,note text);
alter table public.case_notes enable row level security;
grant select on public.platform_tenants, public.cases, public.tenant_memberships, public.case_participants to authenticated;
grant insert, select, update, delete on public.case_notes to authenticated;
create policy fixture_note_insert on public.case_notes for insert to authenticated with check
  (author_user_id = auth.uid() and current_setting('test.note_create', true) = 'true');
create policy fixture_old_draft_update on public.case_notes for update to authenticated using(author_user_id=auth.uid()) with check(author_user_id=auth.uid());
create policy fixture_case_note_read on public.case_notes for select to authenticated using(current_setting('test.legacy_read',true)='true');
insert into public.cases(id,tenant_id,status,case_status_code) values ('22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333','active',null);
insert into public.tenant_memberships values ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','active',now()-interval '1 day',null,null,null);
insert into public.case_participants values ('22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111',
  'carer','carer','active','active',now()-interval '1 day',null,now()-interval '1 day',null,
  array['carer.portal.read','carer.journal.create'],array[]::text[]);
\ir ../../supabase/migrations/20261012214207_carer_journal_submission.sql

create function public.fixture_submit() returns jsonb language sql security invoker as $$
  select public.submit_carer_journal('22222222-2222-4222-8222-222222222222',
    '55555555-5555-4555-8555-555555555555','achievement',' School ',' Progress ')
$$;
create function public.fixture_expect_error(command text, expected text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then
    if sqlstate = expected then return; end if;
    raise exception 'Expected SQLSTATE %, received %: %',expected,sqlstate,sqlerrm;
  end;
  raise exception 'Expected SQLSTATE %, command succeeded',expected;
end $$;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set test.note_create = 'true';
set role authenticated;
select public.fixture_submit();
select public.fixture_expect_error('select public.fixture_submit()', '23505');
reset role;
do $$ begin
  if not exists (select 1 from public.case_notes where author_user_id = '11111111-1111-4111-8111-111111111111'
    and note_body = 'Progress' and note_title = 'School' and note_status = 'draft' and visibility_level = 'worker_only'
    and not family_shared and not child_shared and not court_exportable and not legal_restricted) then
    raise exception 'Private submission provenance assertion failed';
  end if;
end $$;
truncate public.case_notes;
set role authenticated;
set test.note_create = 'false';
select public.fixture_submit(); -- Dedicated source authorization needs no general note-writer permission.
select public.fixture_expect_error($q$update public.case_notes set family_shared=true where id='55555555-5555-4555-8555-555555555555'$q$,'42501');
select public.fixture_expect_error($q$update public.case_notes set note_type='case_note' where id='55555555-5555-4555-8555-555555555555'$q$,'42501');
select public.fixture_expect_error($q$insert into public.case_notes(id,case_id,tenant_id,author_user_id,note_type,note_title,note_body)
 values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333',
 '11111111-1111-4111-8111-111111111111','case_note','Not a carer intake','No general writer grant')$q$,'42501');
reset role;
truncate public.case_notes;
set role authenticated;
set request.jwt.claim.sub = '';
select public.fixture_expect_error('select public.fixture_submit()', '42501');
set request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';
select public.fixture_expect_error('select public.fixture_submit()', '42501');
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select public.fixture_expect_error($cmd$select public.submit_carer_journal('22222222-2222-4222-8222-222222222222',
 '55555555-5555-4555-8555-555555555555','unknown','Title','Body')$cmd$, '22023');
reset role;
update public.tenant_memberships set suspended_at = now();
set role authenticated;
select public.fixture_expect_error('select public.fixture_submit()', '42501');
reset role;
update public.tenant_memberships set suspended_at = null, revoked_at = now();
set role authenticated;
select public.fixture_expect_error('select public.fixture_submit()', '42501');
reset role;
update public.tenant_memberships set revoked_at = null;
update public.platform_tenants set tenant_status='restricted_grace';
set role authenticated;
select public.fixture_expect_error('select public.fixture_submit()','42501');
reset role;
update public.platform_tenants set tenant_status='active';
update public.case_participants set effective_to = now()-interval '1 hour';
set role authenticated;
select public.fixture_expect_error('select public.fixture_submit()', '42501');
reset role;
update public.case_participants set effective_to = null, denied_actions = array['carer.journal.create'];
set role authenticated;
select public.fixture_expect_error('select public.fixture_submit()', '42501');
reset role;
update public.case_participants set denied_actions = array[]::text[], tenant_id = '44444444-4444-4444-8444-444444444444';
set role authenticated;
select public.fixture_expect_error('select public.fixture_submit()', '42501');
reset role;
update public.case_participants set tenant_id = '33333333-3333-4333-8333-333333333333';
update public.cases set status = 'closed';
set role authenticated;
select public.fixture_expect_error('select public.fixture_submit()', '42501');
reset role;
do $$ begin
  if exists (select 1 from public.case_notes) then raise exception 'Denied operations inserted notes'; end if;
  if has_function_privilege('anon','public.submit_carer_journal(uuid,uuid,text,text,text)','EXECUTE') then
    raise exception 'Anonymous execution was not revoked'; end if;
  if (select prosecdef from pg_proc where oid = 'public.submit_carer_journal(uuid,uuid,text,text,text)'::regprocedure) then
    raise exception 'RPC bypasses caller RLS'; end if;
end $$;
select 'PASS: private immutable source intake without a broad writer grant, sharing/type-change/generic-write denial, tenant-status gate, duplicate rejection, unauthenticated/other actor, invalid kind, suspended/revoked membership, expired/denied/mismatched assignment, closed case and invoker gateway' as result;
