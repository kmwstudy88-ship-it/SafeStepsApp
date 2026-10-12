-- PROPOSED ONLY. Requires reconciled history, caller review and staged API tests.
-- Does not converge case roots: assessment_records still uses reunification_cases.
-- Restrictive write policies AND with all existing permissive policies.
drop policy if exists p0_assessment_staff_insert on public.assessment_records;
create policy p0_assessment_staff_insert on public.assessment_records as restrictive
for insert to authenticated with check (
 public.user_has_case_role(case_id,array['caseworker','supervisor','clinician','admin']::text[])
 and created_by=(select auth.uid())
);
drop policy if exists p0_assessment_staff_update on public.assessment_records;
create policy p0_assessment_staff_update on public.assessment_records as restrictive
for update to authenticated
using (public.user_has_case_role(case_id,array['caseworker','supervisor','clinician','admin']::text[]))
with check (public.user_has_case_role(case_id,array['caseworker','supervisor','clinician','admin']::text[]));
drop policy if exists p0_assessment_client_delete on public.assessment_records;
create policy p0_assessment_client_delete on public.assessment_records as restrictive
for delete to authenticated using (false);
-- Preserve RLS row checks, remove broad table and preexisting column write grants.
-- Staff stage/role/tenant updates require a separately authorized server workflow.
revoke insert,update on public.profiles from public,anon,authenticated;
do $privileges$
declare col record; safe_columns text;
begin
 for col in select column_name from information_schema.columns
 where table_schema='public' and table_name='profiles'
 loop
  execute format('revoke insert (%I), update (%I) on public.profiles from public, anon, authenticated',col.column_name,col.column_name);
 end loop;
 select string_agg(format('%I',column_name),', ' order by ordinal_position)
 into safe_columns from information_schema.columns
 where table_schema='public' and table_name='profiles'
 and column_name=any(array[
 'display_name','preferred_name','primary_email','primary_phone','avatar_url','avatar_storage_path',
 'story_goal','strengths','support_notes','representation_preferences',
 'preferred_language_code','preferred_timezone','accessibility_preferences',
 'notification_preferences','updated_at'
 ]::text[]);
 if safe_columns is null then raise exception 'No reviewed profile self-service columns found'; end if;
 execute 'grant update ('||safe_columns||') on public.profiles to authenticated';
 -- New profile rows cannot supply role, auth_user_id, case_id or tenant authority.
 execute 'grant insert (id, '||safe_columns||') on public.profiles to authenticated';
end $privileges$;
