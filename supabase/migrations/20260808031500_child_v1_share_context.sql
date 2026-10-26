create or replace function public.get_child_case_share_context(target_child_user_id uuid default auth.uid())
returns table (
  case_id uuid,
  parent_user_id uuid,
  caseworker_user_id uuid
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    cp.case_id,
    rc.parent_user_id,
    coalesce(cp.caseworker_user_id, rc.worker_user_id) as caseworker_user_id
  from public.child_profiles cp
  left join public.reunification_cases rc on rc.id = cp.case_id
  where cp.child_user_id = target_child_user_id
    and cp.case_id is not null
    and (
      target_child_user_id = auth.uid()
      or public.user_has_case_role(
        cp.case_id,
        array['caseworker','supervisor','clinician','admin','super_admin']::text[]
      )
    )
  limit 1;
$$;

revoke all on function public.get_child_case_share_context(uuid) from public;
grant execute on function public.get_child_case_share_context(uuid) to authenticated;
