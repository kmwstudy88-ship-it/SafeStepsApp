-- STAGING ONLY: execute against kwhjxggxffphknzxmtrf, never production.
-- Synthetic database-role probes, not signed Auth/API sessions. Always rollback.
begin;
create temporary table p0_fixture (name text primary key, id uuid not null default gen_random_uuid());
insert into p0_fixture(name) values ('parent'),('worker'),('unrelated'),('case_a'),('case_b'),('instrument'),('assessment_a'),('assessment_b');
create temporary table p0_results (probe text, expected text, observed text, passed boolean);
grant select on p0_fixture to authenticated;
grant insert,select on p0_results to authenticated;
insert into auth.users(id,email,raw_user_meta_data)
select id,'p0-synthetic-'||id::text||'@example.invalid','{"display_name":"P0 synthetic rollback fixture"}'::jsonb
from p0_fixture where name in ('parent','worker','unrelated');
update public.profiles set role='caseworker' where id=(select id from p0_fixture where name='worker');
insert into public.user_roles(user_id,role)
select id,case when name='worker' then 'caseworker' else 'parent' end from p0_fixture where name in ('parent','worker','unrelated');
insert into public.reunification_cases(id,owner_id,family_label)
select c.id,(select id from p0_fixture where name=case when c.name='case_a' then 'parent' else 'unrelated' end),'P0 synthetic rollback case'
from p0_fixture c where c.name in ('case_a','case_b');
insert into public.assessment_instruments(id,slug,name,instrument_type)
select id,'p0-synthetic-'||id::text,'P0 synthetic rollback instrument','custom' from p0_fixture where name='instrument';
insert into public.case_memberships(case_id,user_id,membership_role)
values ((select id from p0_fixture where name='case_a'),(select id from p0_fixture where name='worker'),'caseworker');
insert into public.assessment_records(id,case_id,parent_user_id,instrument_id,created_by,status)
select a.id,c.id,(select id from p0_fixture where name=case when c.name='case_a' then 'parent' else 'unrelated' end),(select id from p0_fixture where name='instrument'),(select id from p0_fixture where name='worker'),'draft'
from p0_fixture a join p0_fixture c on (a.name='assessment_a' and c.name='case_a') or (a.name='assessment_b' and c.name='case_b');
select set_config('request.jwt.claim.sub',(select id::text from p0_fixture where name='worker'),true);
set local role authenticated;
insert into p0_results select 'allocated_worker_read','one fixture',count(*)::text,count(*)=1 from public.assessment_records where id=(select id from p0_fixture where name='assessment_a');
do $probe$ declare n integer; begin
 update public.assessment_records set created_by=(select id from p0_fixture where name='unrelated') where id=(select id from p0_fixture where name='assessment_a');
 get diagnostics n=row_count;
 insert into p0_results values ('worker_update_creator_spoof','denied',n::text,n=0);
exception when insufficient_privilege then insert into p0_results values ('worker_update_creator_spoof','denied','42501',true);
when others then insert into p0_results values ('worker_update_creator_spoof','denied',sqlstate,false); end $probe$;
do $probe$ declare n integer; begin
 insert into public.assessment_records(case_id,parent_user_id,instrument_id,created_by,status) values ((select id from p0_fixture where name='case_a'),(select id from p0_fixture where name='parent'),(select id from p0_fixture where name='instrument'),(select id from p0_fixture where name='worker'),'draft');
 get diagnostics n=row_count;
 insert into p0_results values ('allocated_worker_insert','one changed fixture',n::text,n=1);
exception when insufficient_privilege then insert into p0_results values ('allocated_worker_insert','one changed fixture','42501',false);
when others then insert into p0_results values ('allocated_worker_insert','one changed fixture',sqlstate,false); end $probe$;
do $probe$ declare n integer; begin
 insert into public.assessment_records(case_id,parent_user_id,instrument_id,created_by,status) values ((select id from p0_fixture where name='case_a'),(select id from p0_fixture where name='parent'),(select id from p0_fixture where name='instrument'),(select id from p0_fixture where name='unrelated'),'draft');
 get diagnostics n=row_count;
 insert into p0_results values ('worker_creator_spoof','denied',n::text,n=0);
exception when insufficient_privilege then insert into p0_results values ('worker_creator_spoof','denied','42501',true);
when others then insert into p0_results values ('worker_creator_spoof','denied',sqlstate,false); end $probe$;
do $probe$ declare n integer; begin
 update public.assessment_records set narrative_summary='P0 synthetic worker edit' where id=(select id from p0_fixture where name='assessment_a');
 get diagnostics n=row_count;
 insert into p0_results values ('allocated_worker_update','one updated fixture',n::text,n=1);
exception when others then insert into p0_results values ('allocated_worker_update','one updated fixture',sqlstate,false); end $probe$;
do $probe$ declare n integer; begin
 update public.assessment_records set narrative_summary='P0 synthetic forbidden edit' where id=(select id from p0_fixture where name='assessment_b');
 get diagnostics n=row_count;
 insert into p0_results values ('worker_other_case_update','zero updated fixtures',n::text,n=0);
exception when insufficient_privilege then insert into p0_results values ('worker_other_case_update','denied','42501',true);
when others then insert into p0_results values ('worker_other_case_update','denied',sqlstate,false); end $probe$;
reset role;
select set_config('request.jwt.claim.sub',(select id::text from p0_fixture where name='unrelated'),true);
set local role authenticated;
insert into p0_results select 'unrelated_read','zero fixtures',count(*)::text,count(*)=0 from public.assessment_records where id=(select id from p0_fixture where name='assessment_a');
do $probe$ declare n integer; begin
 update public.assessment_records set narrative_summary='P0 synthetic unrelated edit' where id=(select id from p0_fixture where name='assessment_a');
 get diagnostics n=row_count;
 insert into p0_results values ('unrelated_update','zero updated fixtures',n::text,n=0);
exception when insufficient_privilege then insert into p0_results values ('unrelated_update','denied','42501',true);
when others then insert into p0_results values ('unrelated_update','denied',sqlstate,false); end $probe$;
reset role;
select set_config('request.jwt.claim.sub',(select id::text from p0_fixture where name='parent'),true);
set local role authenticated;
do $probe$ declare n integer; begin
 update public.assessment_records set narrative_summary='P0 synthetic parent edit' where id=(select id from p0_fixture where name='assessment_a');
 get diagnostics n=row_count;
 insert into p0_results values ('parent_staff_only_update','zero updated fixtures',n::text,n=0);
exception when insufficient_privilege then insert into p0_results values ('parent_staff_only_update','denied','42501',true);
when others then insert into p0_results values ('parent_staff_only_update','denied',sqlstate,false); end $probe$;
do $probe$ declare n integer; begin
 update public.profiles set display_name='P0 synthetic edited name' where id=(select id from p0_fixture where name='parent');
 get diagnostics n=row_count;
 insert into p0_results values ('owner_safe_profile_update','one changed fixture',n::text,n=1);
exception when insufficient_privilege then insert into p0_results values ('owner_safe_profile_update','one changed fixture','42501',false);
when others then insert into p0_results values ('owner_safe_profile_update','one changed fixture',sqlstate,false); end $probe$;
do $probe$ declare n integer; begin
 update public.profiles set auth_user_id=(select id from p0_fixture where name='unrelated') where id=(select id from p0_fixture where name='parent');
 get diagnostics n=row_count;
 insert into p0_results values ('owner_identity_alias_update','denied',n::text,n=0);
exception when insufficient_privilege then insert into p0_results values ('owner_identity_alias_update','denied','42501',true);
when others then insert into p0_results values ('owner_identity_alias_update','denied',sqlstate,false); end $probe$;
do $probe$ declare n integer; begin
 insert into public.assessment_records(case_id,parent_user_id,instrument_id,created_by,status) values ((select id from p0_fixture where name='case_a'),(select id from p0_fixture where name='parent'),(select id from p0_fixture where name='instrument'),(select id from p0_fixture where name='parent'),'draft');
 get diagnostics n=row_count;
 insert into p0_results values ('parent_staff_only_insert','denied',n::text,n=0);
exception when insufficient_privilege then insert into p0_results values ('parent_staff_only_insert','denied','42501',true);
when others then insert into p0_results values ('parent_staff_only_insert','denied',sqlstate,false); end $probe$;
do $probe$ declare n integer; begin
 update public.profiles set role='admin' where id=(select id from p0_fixture where name='parent');
 get diagnostics n=row_count;
 insert into p0_results values ('owner_role_escalation','zero updated fixtures',n::text,n=0);
exception when insufficient_privilege then insert into p0_results values ('owner_role_escalation','denied','42501',true);
when others then insert into p0_results values ('owner_role_escalation','denied',sqlstate,false); end $probe$;
insert into p0_results select 'escalated_owner_other_case_read','zero fixtures',count(*)::text,count(*)=0 from public.assessment_records where id=(select id from p0_fixture where name='assessment_b');
reset role;
-- Check effective destructive privileges without truncating any existing table.
insert into p0_results
select 'assessment_client_truncate','no client TRUNCATE grant',bool_or(has_table_privilege(r,'public.assessment_records','TRUNCATE'))::text,not bool_or(has_table_privilege(r,'public.assessment_records','TRUNCATE'))
from unnest(array['anon','authenticated']::text[]) r;
insert into p0_results
select 'profile_client_truncate','no client TRUNCATE grant',bool_or(has_table_privilege(r,'public.profiles','TRUNCATE'))::text,not bool_or(has_table_privilege(r,'public.profiles','TRUNCATE'))
from unnest(array['anon','authenticated']::text[]) r;
select probe,expected,observed,passed from p0_results order by probe;
rollback;
