-- Classify parent video report consent RPCs as admin-only function surfaces.
--
-- Client sessions (authenticated JWTs) must not call these SECURITY DEFINER
-- functions directly. Restrict execute privileges to trusted backend callers.

revoke all on function public.grant_parent_video_report_consent(
  uuid,
  text,
  text,
  timestamptz
) from public, anon, authenticated;

revoke all on function public.withdraw_parent_video_report_consent(
  uuid,
  text
) from public, anon, authenticated;

grant execute on function public.grant_parent_video_report_consent(
  uuid,
  text,
  text,
  timestamptz
) to service_role;

grant execute on function public.withdraw_parent_video_report_consent(
  uuid,
  text
) to service_role;
