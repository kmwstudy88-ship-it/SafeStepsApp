-- STAGING ONLY. Wrap this after both candidate SQL files in BEGIN/ROLLBACK.
create temporary table onboarding_fixture(name text primary key,id uuid default gen_random_uuid());
insert into onboarding_fixture(name) values ('parent'),('other');
create temporary table onboarding_results(probe text,passed boolean,observed text);
grant select on onboarding_fixture to authenticated;
grant insert,select on onboarding_results to authenticated;
insert into auth.users(id,email) select id,'onboarding-rollback-'||id||'@example.invalid' from onboarding_fixture;
create function pg_temp.check_step(label text, step text, expected text)
returns void language plpgsql security invoker as $test$
declare actual text;
begin
 begin
  actual:=public.advance_parent_onboarding(step);
 exception when others then actual:=sqlstate;
 end;
 insert into onboarding_results values(label,actual=expected,actual);
end $test$;
insert into onboarding_results select 'anonymous_execute_denied',not has_function_privilege('anon','public.advance_parent_onboarding(text)','execute'),'privilege check';
select set_config('request.jwt.claim.sub','',true);
set local role authenticated;
select pg_temp.check_step('missing_actor_denied','account_protected','42501');
reset role;
select set_config('request.jwt.claim.sub',(select id::text from onboarding_fixture where name='parent'),true);
set local role authenticated;
select pg_temp.check_step('cannot_complete_intake','onboarding_complete','22023');
select pg_temp.check_step('cannot_skip_protection','intake_in_progress','42501');
select pg_temp.check_step('account_protection_allowed','account_protected','account_protected');
select pg_temp.check_step('consent_required','consent_recorded','42501');
insert into public.parent_onboarding_consent_events(user_id,event_type,document_key,document_version,choices)
select id,'accepted','terms_of_use','2026-07-29.1','{"terms_accepted":true}'::jsonb from onboarding_fixture where name='parent';
select pg_temp.check_step('privacy_notice_required','consent_recorded','42501');
insert into public.parent_onboarding_consent_events(user_id,event_type,document_key,document_version,choices)
select id,'accepted','privacy_parent_rights','2026-07-29.1','{"notice_read":true}'::jsonb from onboarding_fixture where name='parent';
select pg_temp.check_step('consent_allowed','consent_recorded','consent_recorded');
select pg_temp.check_step('accessibility_step_allowed','intake_in_progress','intake_in_progress');
select pg_temp.check_step('repeat_does_not_regress','account_protected','intake_in_progress');
reset role;
insert into onboarding_results select 'other_profile_unchanged',onboarding_status='not_started',onboarding_status from public.profiles where id=(select id from onboarding_fixture where name='other');
update public.profiles set onboarding_status='account_protected' where id=(select id from onboarding_fixture where name='parent');
insert into public.parent_onboarding_consent_events(user_id,event_type,document_key,document_version,choices,recorded_at)
select id,'withdrawn','terms_of_use','2026-07-29.1','{}',now()+interval '1 second' from onboarding_fixture where name='parent';
set local role authenticated;
select pg_temp.check_step('withdrawn_consent_denied','consent_recorded','42501');
reset role;
update public.profiles set profile_status='inactive' where id=(select id from onboarding_fixture where name='parent');
set local role authenticated;
select pg_temp.check_step('inactive_profile_denied','account_protected','42501');
reset role;
-- Exercise the exact safe INSERT / DO NOTHING / UPDATE sequence used by callers.
delete from public.profiles where id=(select id from onboarding_fixture where name='other');
select set_config('request.jwt.claim.sub',(select id::text from onboarding_fixture where name='other'),true);
set local role authenticated;
do $profile$ declare n integer; begin
 insert into public.profiles(id,display_name,updated_at)
 select id,'Safe caller',now() from onboarding_fixture where name='other'
 on conflict(id) do nothing;
 insert into public.profiles(id,display_name,updated_at)
 select id,'Should not overwrite',now() from onboarding_fixture where name='other'
 on conflict(id) do nothing;
 update public.profiles set display_name='Safe updated caller',updated_at=now()
 where id=(select id from onboarding_fixture where name='other');
 get diagnostics n=row_count;
 insert into onboarding_results values('safe_profile_insert_conflict_update',n=1,n::text);
exception when others then
 insert into onboarding_results values('safe_profile_insert_conflict_update',false,sqlstate);
end $profile$;
reset role;
insert into onboarding_results select 'safe_profile_defaults_preserved',role='parent' and onboarding_status='not_started',role||':'||onboarding_status
 from public.profiles where id=(select id from onboarding_fixture where name='other');
select jsonb_agg(to_jsonb(r)) as results from onboarding_results r;
