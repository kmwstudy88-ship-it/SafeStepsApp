-- Bind shared case, permission, and child-access predicates to the real session user.
-- These functions are used by RLS policies with auth.uid(); rejecting caller-supplied
-- identities prevents direct RPC callers from probing another user's access.

create or replace function public.has_resource_permission(
  p_user_id uuid,
  p_resource_type text,
  p_resource_id uuid,
  p_permission_code text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id = (select auth.uid())
    and exists (
      select 1
      from public.user_role_assignments ura
      join public.role_permissions rp on rp.role_id = ura.role_id
      join public.security_permissions p on p.id = rp.permission_id
      where ura.user_id = p_user_id
        and ura.resource_type = p_resource_type
        and ura.resource_id is not distinct from p_resource_id
        and ura.status = 'active'
        and p.permission_code = p_permission_code
        and (ura.starts_at is null or ura.starts_at <= now())
        and (ura.ends_at is null or ura.ends_at > now())
    );
$$;

create or replace function public.safesteps_can_access_case_v19(
  p_user_id uuid,
  p_case_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id = (select auth.uid())
    and exists (
      select 1
      from public.cases c
      where c.id = p_case_id
        and (
          public.safesteps_can_manage_casework(p_user_id, c.organisation_id)
          or c.primary_worker_id = p_user_id
          or exists (
            select 1
            from public.case_allocations_v19 a
            where a.case_id = c.id
              and a.status = 'active'
              and a.allocated_to_user_id = p_user_id
              and (a.effective_to is null or a.effective_to > now())
          )
          or exists (
            select 1
            from public.case_participants cp
            where cp.case_id = c.id
              and cp.user_id = p_user_id
              and cp.status = 'active'
          )
        )
    );
$$;

create or replace function public.safesteps_can_worker_access_child_v20(
  p_user_id uuid,
  p_child_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id = (select auth.uid())
    and (
      public.current_user_has_role('admin')
      or public.current_user_has_role('caseworker')
      or public.current_user_has_role('worker')
      or public.has_resource_permission(p_user_id, 'global', null, 'child_experience.review')
      or exists (
        select 1
        from public.child_profiles p
        where coalesce(p.child_id, p.id) = p_child_id
          and p.caseworker_user_id = p_user_id
      )
    );
$$;

create or replace function public.safesteps_is_child_account_user_v20(
  p_user_id uuid,
  p_child_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id = (select auth.uid())
    and (
      exists (
        select 1
        from public.child_accounts a
        where a.child_id = p_child_id
          and a.user_id = p_user_id
          and a.account_status in ('active', 'pending')
      )
      or exists (
        select 1
        from public.child_profiles p
        where coalesce(p.child_id, p.id) = p_child_id
          and p.child_user_id = p_user_id
      )
    );
$$;

revoke execute on function public.has_resource_permission(uuid, text, uuid, text) from public, anon;
revoke execute on function public.safesteps_can_access_case_v19(uuid, uuid) from public, anon;
revoke execute on function public.safesteps_can_worker_access_child_v20(uuid, uuid) from public, anon;
revoke execute on function public.safesteps_is_child_account_user_v20(uuid, uuid) from public, anon;

grant execute on function public.has_resource_permission(uuid, text, uuid, text) to authenticated, service_role;
grant execute on function public.safesteps_can_access_case_v19(uuid, uuid) to authenticated, service_role;
grant execute on function public.safesteps_can_worker_access_child_v20(uuid, uuid) to authenticated, service_role;
grant execute on function public.safesteps_is_child_account_user_v20(uuid, uuid) to authenticated, service_role;
