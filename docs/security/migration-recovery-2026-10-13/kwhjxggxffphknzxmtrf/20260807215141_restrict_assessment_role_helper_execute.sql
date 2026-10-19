-- RECOVERED READ-ONLY from kwhjxggxffphknzxmtrf migration history; review before replay.
revoke execute on function public.current_assessment_app_role() from public, anon;

revoke execute on function public.can_manage_assessments() from public, anon;

grant execute on function public.current_assessment_app_role() to authenticated, service_role;

grant execute on function public.can_manage_assessments() to authenticated, service_role;

