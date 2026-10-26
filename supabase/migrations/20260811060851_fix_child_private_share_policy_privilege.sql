create or replace function public.user_has_active_child_record_share(target_record_id uuid)
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
      from public.child_record_shares crs
      where crs.child_private_record_id = target_record_id
        and crs.shared_with_user_id = (select auth.uid())
        and crs.revoked_at is null
        and (crs.ends_at is null or crs.ends_at > pg_catalog.now())
    );
$function$;

revoke all on function public.user_has_active_child_record_share(uuid) from public, anon;
grant execute on function public.user_has_active_child_record_share(uuid) to authenticated, service_role;

drop policy if exists child_private_record_shared_read on public.child_private_records;
create policy child_private_record_shared_read
on public.child_private_records
for select
to authenticated
using (public.user_has_active_child_record_share(id));