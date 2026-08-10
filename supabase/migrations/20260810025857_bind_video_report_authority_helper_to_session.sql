-- Bind the video-report authority helper to the authenticated session.
--
-- The authority table is legacy production drift and may not exist in a clean
-- rebuild. When it exists, retain the same session-bound hardening.

do $migration$
begin
  if to_regclass('public.video_report_access_authorities') is not null then
    execute $sql$
      create or replace function public.has_active_video_report_authority(
        target_parent_user_id uuid,
        target_user_id uuid,
        requested_scope text
      )
      returns boolean
      language sql
      stable
      security definer
      set search_path = ''
      as $function$
        select
          target_user_id = (select auth.uid())
          and exists (
            select 1
            from public.video_report_access_authorities authority
            where authority.parent_user_id = target_parent_user_id
              and authority.authorised_user_id = target_user_id
              and authority.active = true
              and authority.starts_at <= pg_catalog.now()
              and (
                authority.expires_at is null
                or authority.expires_at > pg_catalog.now()
              )
              and (
                authority.access_scope = requested_scope
                or authority.access_scope = 'video_progress_and_evidence'
              )
          );
      $function$;
    $sql$;

    revoke all on function public.has_active_video_report_authority(
      uuid,
      uuid,
      text
    ) from public;
    revoke all on function public.has_active_video_report_authority(
      uuid,
      uuid,
      text
    ) from anon;
    grant execute on function public.has_active_video_report_authority(
      uuid,
      uuid,
      text
    ) to authenticated;
    grant execute on function public.has_active_video_report_authority(
      uuid,
      uuid,
      text
    ) to service_role;
  end if;
end
$migration$;
