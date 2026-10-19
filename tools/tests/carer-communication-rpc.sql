-- Empty isolated PostgreSQL database only; never run this fixture on a connected project.
\set ON_ERROR_STOP on
\ir carer-journal-rpc.sql
create table auth.users(id uuid primary key);
insert into auth.users values ('11111111-1111-4111-8111-111111111111'),('44444444-4444-4444-8444-444444444444'),
 ('66666666-6666-4666-8666-666666666666'),('77777777-7777-4777-8777-777777777777');
insert into public.case_allocations values ('33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222',
 '66666666-6666-4666-8666-666666666666','active',null,'primary_worker',now()-interval '1 day');
create function public.has_permission(uuid,text) returns boolean language sql stable as $$
 select auth.uid()='66666666-6666-4666-8666-666666666666' and current_setting('test.reviewer',true)='true'
$$;
create table public.role_definitions(id uuid primary key,tenant_id uuid,lifecycle_status text);
create table public.permission_definitions(id uuid primary key,permission_code text,lifecycle_status text,requires_step_up_authentication boolean);
create table public.role_permissions(role_definition_id uuid,permission_definition_id uuid,permission_scope jsonb);
create table public.role_assignments(tenant_id uuid,user_id uuid,role_definition_id uuid,scope_type text,scope_reference uuid,
 assignment_status text,effective_from timestamptz,effective_to timestamptz);
insert into public.role_definitions values('abababab-abab-4bab-8bab-abababababab','33333333-3333-4333-8333-333333333333','active');
insert into public.permission_definitions values('acacacac-acac-4cac-8cac-acacacacacac','carer.communication.review','active',false),
 ('adadadad-adad-4dad-8dad-adadadadadad','carer.media.review','active',false);
insert into public.role_permissions select 'abababab-abab-4bab-8bab-abababababab',id,'{}' from public.permission_definitions;
insert into public.role_assignments values('33333333-3333-4333-8333-333333333333','66666666-6666-4666-8666-666666666666',
 'abababab-abab-4bab-8bab-abababababab','operational_case','22222222-2222-4222-8222-222222222222','active',now()-interval '1 day',null);
update public.cases set status='active';
update public.case_participants set allowed_actions=array['carer.portal.read','carer.journal.create',
 'carer.communication.read','carer.communication.send','carer.communication.manage'];
insert into public.case_participants values ('22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333',
 '44444444-4444-4444-8444-444444444444','parent','parent','active','active',now()-interval '1 day',null,
 now()-interval '1 day',null,array['parent.communication.read','parent.communication.send'],array[]::text[]);
insert into public.tenant_memberships values ('33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444',
 'active',now()-interval '1 day',null,null,null),('33333333-3333-4333-8333-333333333333','66666666-6666-4666-8666-666666666666',
 'active',now()-interval '1 day',null,null,null);
create table public.messaging_threads(id uuid primary key default gen_random_uuid(),created_at timestamptz default now(),
 created_by uuid not null,title text,owner_user_id uuid not null);
create table public.messaging_messages(id uuid primary key default gen_random_uuid(),thread_id uuid references public.messaging_threads(id) on delete cascade,
 created_at timestamptz default now(),created_by uuid not null,body text not null);
create table public.messaging_thread_summaries(id uuid primary key default gen_random_uuid(),thread_id uuid,summary text);
alter table public.messaging_threads enable row level security;
alter table public.messaging_messages enable row level security;
alter table public.messaging_thread_summaries enable row level security;
grant select,insert,update,delete on public.messaging_threads,public.messaging_messages,public.messaging_thread_summaries to authenticated;
create policy owner_threads on public.messaging_threads for all to authenticated
 using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy owner_messages_read on public.messaging_messages for select to authenticated
 using(exists(select 1 from public.messaging_threads t where t.id=thread_id and t.owner_user_id=auth.uid()));
create policy owner_messages_insert on public.messaging_messages for insert to authenticated
 with check(created_by=auth.uid() and exists(select 1 from public.messaging_threads t where t.id=thread_id and t.owner_user_id=auth.uid()));
create policy owner_messages_update on public.messaging_messages for update to authenticated
 using(created_by=auth.uid()) with check(created_by=auth.uid());
create policy owner_messages_delete on public.messaging_messages for delete to authenticated using(created_by=auth.uid());
create policy owner_summaries_read on public.messaging_thread_summaries for select to authenticated
 using(exists(select 1 from public.messaging_threads t where t.id=thread_id and t.owner_user_id=auth.uid()));
\ir ../../supabase/migrations/20261013110049_carer_monitored_communication.sql
create function public.fixture_assert(ok boolean,label text) returns void language plpgsql as $$
 begin if ok is distinct from true then raise exception 'Assertion failed: %',label; end if; end $$;

set role authenticated;
set test.reviewer='true';
set request.jwt.claim.sub='66666666-6666-4666-8666-666666666666';
select public.fixture_expect_error($q$select public.create_carer_message_channel('22222222-2222-4222-8222-222222222222',
 '11111111-1111-4111-8111-111111111111','77777777-7777-4777-8777-777777777777',now()+interval '7 day','Fixture care conversation','Reviewed participant links')$q$,'42501');
select public.create_carer_message_channel('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111',
 '44444444-4444-4444-8444-444444444444',now()+interval '7 day','Fixture care conversation','Reviewed participant links')->>'id' as channel \gset
reset role;
select thread_id as thread from public.carer_message_channels where id=:'channel' \gset
insert into public.messaging_thread_summaries(thread_id,summary) values(:'thread','Unreviewed summary must be hidden');
set role authenticated;
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
select public.fixture_assert((public.list_carer_message_channels()->0->>'enabled')::boolean=false,'starts paused');
select public.fixture_expect_error(format('select public.send_carer_channel_message(%L,%L,%L)',:'channel',
 '88888888-8888-4888-8888-888888888888','Carer observation'),'42501');
select public.set_carer_channel_enabled(:'channel',true);
select public.fixture_expect_error(format('insert into public.messaging_messages(id,thread_id,created_by,body) values(%L,%L,%L,%L)',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',:'thread','44444444-4444-4444-8444-444444444444','forged sender'),'42501');
insert into public.messaging_threads(id,created_by,owner_user_id,title) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
 '11111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','Existing personal thread');
insert into public.messaging_messages(id,thread_id,created_by,body) values('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','11111111-1111-4111-8111-111111111111','Personal owner message');
update public.messaging_messages set body='Personal owner edit' where id='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
select public.fixture_assert((select body from public.messaging_messages where id='cccccccc-cccc-4ccc-8ccc-cccccccccccc')='Personal owner edit','non-channel owner paths preserved');
select public.send_carer_channel_message(:'channel','88888888-8888-4888-8888-888888888888',' Carer observation ');
select public.fixture_assert(jsonb_array_length(public.get_carer_channel_messages(:'channel'))=1,'author sees pending');
select public.fixture_assert((select count(*) from public.messaging_thread_summaries where thread_id=:'thread')=0,'derived summary denied');
select public.fixture_expect_error(format('select public.send_carer_channel_message(%L,%L,%L)',:'channel',
 '88888888-8888-4888-8888-888888888888','duplicate'),'23505');
set request.jwt.claim.sub='44444444-4444-4444-8444-444444444444';
select public.fixture_assert(jsonb_array_length(public.get_carer_channel_messages(:'channel'))=0,'parent cannot see unreviewed carer text');
select public.fixture_assert((select count(*) from public.messaging_messages where id='88888888-8888-4888-8888-888888888888')=0,'raw Data API pending read denied');
select public.fixture_expect_error(format('select public.set_carer_channel_enabled(%L,false)',:'channel'),'42501');
select public.send_carer_channel_message(:'channel','99999999-9999-4999-8999-999999999999','Parent question');
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
select public.fixture_assert((select count(*) from public.messaging_messages where id='99999999-9999-4999-8999-999999999999')=0,'owner policy cannot leak pending parent message');
select public.fixture_expect_error(format('select public.review_carer_channel_message(%L,%L,%L,%L)',:'channel',
 '88888888-8888-4888-8888-888888888888','approved','self review'),'42501');
select public.fixture_expect_error($q$update public.messaging_messages set body='edited' where id='88888888-8888-4888-8888-888888888888'$q$,'42501');
select public.fixture_expect_error($q$delete from public.messaging_messages where id='88888888-8888-4888-8888-888888888888'$q$,'42501');
select public.fixture_expect_error(format('update public.messaging_threads set owner_user_id=%L where id=%L',
 '44444444-4444-4444-8444-444444444444',:'thread'),'42501');
select public.fixture_expect_error(format('delete from public.messaging_threads where id=%L',:'thread'),'42501');
select public.fixture_expect_error(format('update public.carer_message_channels set communication_enabled=false where id=%L',:'channel'),'42501');
set request.jwt.claim.sub='66666666-6666-4666-8666-666666666666';
select public.fixture_assert(jsonb_array_length(public.get_carer_channel_messages(:'channel'))=2,'assigned reviewer sees both pending messages');
select public.review_carer_channel_message(:'channel','88888888-8888-4888-8888-888888888888','approved','Reviewed for safe practical communication');
select public.review_carer_channel_message(:'channel','99999999-9999-4999-8999-999999999999','approved','Reviewed parent question');
set request.jwt.claim.sub='44444444-4444-4444-8444-444444444444';
select public.fixture_assert(jsonb_array_length(public.get_carer_channel_messages(:'channel'))=2,'parent sees approved transcript');
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
select public.set_carer_channel_enabled(:'channel',false);
select public.fixture_expect_error(format('select public.send_carer_channel_message(%L,%L,%L)',:'channel',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','paused carer'),'42501');
set request.jwt.claim.sub='44444444-4444-4444-8444-444444444444';
select public.fixture_expect_error(format('select public.send_carer_channel_message(%L,%L,%L)',:'channel',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','paused parent'),'42501');
select public.fixture_expect_error(format('insert into public.messaging_messages(id,thread_id,created_by,body) values(%L,%L,%L,%L)',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',:'thread','44444444-4444-4444-8444-444444444444','raw paused insert'),'42501');
set request.jwt.claim.sub='66666666-6666-4666-8666-666666666666';
select public.fixture_assert(jsonb_array_length(public.get_carer_channel_messages(:'channel'))=2,'care team retains paused history');
select public.fixture_expect_error(format('select public.review_carer_channel_message(%L,%L,%L,%L)',:'channel',
 '99999999-9999-4999-8999-999999999999','approved','Must not deliver while paused'),'42501');
select public.review_carer_channel_message(:'channel','88888888-8888-4888-8888-888888888888','rejected','Approval withdrawn after review');
set request.jwt.claim.sub='44444444-4444-4444-8444-444444444444';
select public.fixture_assert(jsonb_array_length(public.get_carer_channel_messages(:'channel'))=1,'recipient access removed on rejection');
set request.jwt.claim.sub='77777777-7777-4777-8777-777777777777';
select public.fixture_assert(jsonb_array_length(public.list_carer_message_channels())=0,'unrelated actor sees no channels');
select public.fixture_expect_error(format('select public.get_carer_channel_messages(%L)',:'channel'),'42501');
reset role;
update public.tenant_memberships set suspended_at=now() where user_id='44444444-4444-4444-8444-444444444444';
set role authenticated;
set request.jwt.claim.sub='44444444-4444-4444-8444-444444444444';
select public.fixture_expect_error(format('select public.get_carer_channel_messages(%L)',:'channel'),'42501');
reset role;
update public.tenant_memberships set suspended_at=null;
update public.carer_message_channels set created_at=now()-interval '2 day',expires_at=now()-interval '1 hour' where id=:'channel';
set role authenticated;
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
select public.fixture_expect_error(format('select public.set_carer_channel_enabled(%L,true)',:'channel'),'42501');
set request.jwt.claim.sub='66666666-6666-4666-8666-666666666666';
select public.fixture_assert(jsonb_array_length(public.get_carer_channel_messages(:'channel'))=2,'reviewer retains expired transcript');
select public.revoke_carer_message_channel(:'channel','Channel closed by care team');
select public.fixture_assert(jsonb_array_length(public.get_carer_channel_messages(:'channel'))=2,'reviewer retains revoked transcript');
reset role;
update public.case_allocations set ended_at=now();
set role authenticated;
select public.fixture_expect_error(format('select public.get_carer_channel_messages(%L)',:'channel'),'42501');
reset role;
update public.case_allocations set ended_at=null;
set role authenticated;
set test.reviewer='true'; -- Legacy tenant-only helper would still allow the wrong case scope.
reset role;
update public.role_assignments set scope_reference='77777777-7777-4777-8777-777777777777';
set role authenticated;
select public.fixture_expect_error(format('select public.get_carer_channel_messages(%L)',:'channel'),'42501');
reset role;
update public.role_assignments set scope_reference='22222222-2222-4222-8222-222222222222';
update public.permission_definitions set requires_step_up_authentication=true where permission_code='carer.communication.review';
set role authenticated;
select public.fixture_expect_error(format('select public.get_carer_channel_messages(%L)',:'channel'),'42501');
set test.jwt.aal='aal2';
select public.fixture_assert(jsonb_array_length(public.get_carer_channel_messages(:'channel'))=2,'step-up policy honored');
reset role;
update public.permission_definitions set requires_step_up_authentication=false;
set test.jwt.aal='aal1';
select public.fixture_assert((select count(*) from public.messaging_messages where thread_id=:'thread')=2,'original messages retained');
select public.fixture_assert((select count(*) from public.carer_channel_events where channel_id=:'channel' and event_type in ('approved','rejected'))=3,'review history retained');
select public.fixture_assert(not has_function_privilege('anon','public.send_carer_channel_message(uuid,uuid,text)','EXECUTE'),'anonymous RPC denied');
select public.fixture_assert(not has_function_privilege('authenticated','carer_communication_private.actor_allowed(uuid,uuid,text,text)','EXECUTE'),'arbitrary-actor predicate private');
select 'PASS: reviewer provisioning, default pause, pending privacy including owner-policy bypass, review/rejection, both-way pause, raw Data API controls, immutability, duplicate rejection, expiry, suspension, unrelated actors, reviewer retention and audit' as result;
