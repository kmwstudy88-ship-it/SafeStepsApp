-- Restrict assessment-role helper execution to authenticated SafeSteps callers.
-- These helpers are invoker-security and are used by authenticated RLS policies.
-- Anonymous/Public execution is unnecessary and broadens the exposed RPC surface.

revoke execute on function public.current_assessment_app_role() from public, anon;
revoke execute on function public.can_manage_assessments() from public, anon;

grant execute on function public.current_assessment_app_role() to authenticated, service_role;
grant execute on function public.can_manage_assessments() to authenticated, service_role;
