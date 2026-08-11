create or replace function public.can_manage_report_recipients(target_report_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.reports r
      where r.id = target_report_id
        and r.case_id is not null
        and public.has_case_permission(
          (select auth.uid()),
          r.case_id,
          'report.release'
        )
    );
$function$;

revoke all on function public.can_manage_report_recipients(uuid) from public, anon;
grant execute on function public.can_manage_report_recipients(uuid) to authenticated, service_role;

drop policy if exists report_recipients_user_read on public.report_recipients;
create policy report_recipients_user_read
on public.report_recipients
for select
to authenticated
using (
  recipient_user_id = (select auth.uid())
  or public.can_manage_report_recipients(report_id)
);