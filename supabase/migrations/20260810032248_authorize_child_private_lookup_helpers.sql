
create or replace function public.child_case_id(target_child_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $function$
  select cp.case_id
  from public.child_profiles cp
  where cp.child_user_id = target_child_user_id
    and cp.case_id is not null
    and (
      target_child_user_id = auth.uid()
      or public.user_has_case_role(
        cp.case_id,
        array['caseworker','supervisor','clinician','admin']::text[]
      )
    )
  limit 1;
$function$;

create or replace function public.user_can_view_child_private(target_child_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select target_child_user_id = auth.uid()
  or exists (
    select 1
    from public.child_profiles cp
    where cp.child_user_id = target_child_user_id
      and cp.case_id is not null
      and public.user_has_case_role(
        cp.case_id,
        array['caseworker','supervisor','clinician','admin']::text[]
      )
  );
$function$;

create or replace function public.user_can_manage_child_private(target_child_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select target_child_user_id = auth.uid()
  or exists (
    select 1
    from public.child_profiles cp
    where cp.child_user_id = target_child_user_id
      and cp.case_id is not null
      and public.user_has_case_role(
        cp.case_id,
        array['caseworker','supervisor','clinician','admin']::text[]
      )
  );
$function$;

revoke all on function public.child_case_id(uuid) from public, anon;
revoke all on function public.user_can_view_child_private(uuid) from public, anon;
revoke all on function public.user_can_manage_child_private(uuid) from public, anon;

grant execute on function public.child_case_id(uuid) to authenticated, service_role;
grant execute on function public.user_can_view_child_private(uuid) to authenticated, service_role;
grant execute on function public.user_can_manage_child_private(uuid) to authenticated, service_role;
