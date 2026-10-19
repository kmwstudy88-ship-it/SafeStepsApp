-- PROPOSED ONLY: ship with the caller changes after isolated replay and API tests.
-- This is the sole narrowly scoped exception to client workflow-column writes.
-- Definer privilege is needed because clients cannot UPDATE onboarding_status.
-- No target user, role, tenant, case or arbitrary profile payload is accepted.
create or replace function public.advance_parent_onboarding(requested_step text)
returns text language plpgsql security definer set search_path = ''
as $workflow$
declare
 actor_id uuid := auth.uid();
 current_step text;
 current_rank integer;
 requested_rank integer;
begin
 if actor_id is null then
  raise exception using errcode='42501', message='Authentication required';
 end if;
 requested_rank := case requested_step
  when 'account_protected' then 1 when 'consent_recorded' then 2
  when 'intake_in_progress' then 3 else null end;
 if requested_rank is null then
  raise exception using errcode='22023', message='Unsupported onboarding step';
 end if;
 select onboarding_status into current_step from public.profiles
 where id=actor_id and role='parent' and profile_status='active' for update;
 if not found then
  raise exception using errcode='42501', message='Active parent profile required';
 end if;
 current_rank := case current_step when 'not_started' then 0
  when 'account_protected' then 1 when 'consent_recorded' then 2
  when 'intake_in_progress' then 3 when 'onboarding_complete' then 4 else null end;
 if current_rank is null or requested_rank > current_rank+1 then
  raise exception using errcode='42501', message='Complete the preceding onboarding step';
 end if;
 if requested_rank <= current_rank then return current_step; end if;
 if requested_rank >= 2 and not (
  (select event_type='accepted' and document_version='2026-07-29.1'
    and choices @> '{"notice_read":true}'::jsonb
   from public.parent_onboarding_consent_events
   where user_id=actor_id and document_key='privacy_parent_rights'
   order by recorded_at desc, id desc limit 1) is true
  and (select event_type='accepted' and document_version='2026-07-29.1'
    and choices @> '{"terms_accepted":true}'::jsonb
   from public.parent_onboarding_consent_events
   where user_id=actor_id and document_key='terms_of_use'
   order by recorded_at desc, id desc limit 1) is true
 ) then
  raise exception using errcode='42501', message='Required consent records are missing';
 end if;
 update public.profiles set onboarding_status=requested_step, updated_at=now()
 where id=actor_id;
 return requested_step;
end $workflow$;
revoke all on function public.advance_parent_onboarding(text) from public, anon;
grant execute on function public.advance_parent_onboarding(text) to authenticated;
