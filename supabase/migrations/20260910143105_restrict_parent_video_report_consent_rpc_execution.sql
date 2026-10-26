-- Restrict consent-management RPCs to signed-in users.
--
-- These functions are SECURITY DEFINER because they perform an atomic,
-- audited consent update. PostgreSQL grants EXECUTE to PUBLIC by default,
-- so remove that inherited grant explicitly and retain the intended
-- authenticated application access.

revoke execute on function public.grant_parent_video_report_consent(
  uuid,
  text,
  text,
  timestamptz
) from public, anon;

revoke execute on function public.withdraw_parent_video_report_consent(
  uuid,
  text
) from public, anon;

grant execute on function public.grant_parent_video_report_consent(
  uuid,
  text,
  text,
  timestamptz
) to authenticated;

grant execute on function public.withdraw_parent_video_report_consent(
  uuid,
  text
) to authenticated;
