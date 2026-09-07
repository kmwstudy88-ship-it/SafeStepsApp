CREATE OR REPLACE FUNCTION public.has_active_video_report_authority(target_parent_user_id uuid, target_user_id uuid, requested_scope text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select
    target_user_id = (select auth.uid())
    and exists (
      select 1
      from public.video_report_access_authorities authority
      where authority.parent_user_id = target_parent_user_id
        and authority.authorised_user_id = target_user_id
        and authority.active = true
        and authority.starts_at <= pg_catalog.now()
        and (authority.expires_at is null or authority.expires_at > pg_catalog.now())
        and (
          authority.access_scope = requested_scope
          or authority.access_scope = 'video_progress_and_evidence'
        )
    );
$function$
;
CREATE OR REPLACE FUNCTION public.can_access_video_report(target_parent_user_id uuid, requested_scope text DEFAULT 'video_progress'::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select (select auth.uid()) = target_parent_user_id
    or is_video_admin(array['super_admin'])
    or (
      exists (
        select 1 from video_report_access_grants grant_row
        where grant_row.parent_user_id = target_parent_user_id
          and grant_row.reviewer_user_id = (select auth.uid())
          and grant_row.active = true
          and grant_row.expires_at > now()
          and (grant_row.access_scope = requested_scope or grant_row.access_scope = 'video_progress_and_evidence')
      )
      and has_active_video_report_authority(target_parent_user_id, (select auth.uid()), requested_scope)
    );
$function$
;