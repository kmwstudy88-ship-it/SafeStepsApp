-- Bind report access predicates to the authenticated session.
-- These helpers remain callable for RLS evaluation, but callers can no longer
-- probe permissions by supplying another user's UUID.

create or replace function public.can_read_report(
  p_report_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    p_user_id = (select auth.uid())
    and exists (
      select 1
      from public.reports r
      where r.id = p_report_id
        and (
          r.requested_by = p_user_id
          or r.primary_author_id = p_user_id
          or r.current_reviewer_id = p_user_id
          or r.approved_by = p_user_id
          or (
            r.case_id is not null
            and public.has_case_permission(p_user_id, r.case_id, 'report.read')
          )
          or exists (
            select 1
            from public.report_recipients rr
            where rr.report_id = r.id
              and rr.recipient_user_id = p_user_id
              and rr.released_at is not null
              and rr.revoked_at is null
              and (rr.access_expires_at is null or rr.access_expires_at > now())
          )
        )
    );
$function$;

create or replace function public.can_write_report(
  p_report_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    p_user_id = (select auth.uid())
    and exists (
      select 1
      from public.reports r
      where r.id = p_report_id
        and (
          r.primary_author_id = p_user_id
          or r.current_reviewer_id = p_user_id
          or (
            r.case_id is not null
            and public.has_case_permission(p_user_id, r.case_id, 'report.generate')
          )
        )
        and r.status not in ('released', 'withdrawn', 'superseded')
    );
$function$;

revoke execute on function public.can_read_report(uuid, uuid) from public, anon;
revoke execute on function public.can_write_report(uuid, uuid) from public, anon;
grant execute on function public.can_read_report(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_write_report(uuid, uuid) to authenticated, service_role;
