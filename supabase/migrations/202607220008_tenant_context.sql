create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.current_tenant_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select tm.tenant_id
  from public.tenant_memberships tm
  join public.platform_tenants pt on pt.id = tm.tenant_id
  where tm.user_id = auth.uid()
    and tm.membership_status = 'active'
    and tm.revoked_at is null
    and tm.effective_from <= now()
    and (tm.effective_to is null or tm.effective_to > now())
    and pt.tenant_status in ('active', 'restricted_grace', 'migration');
$$;

create or replace function public.has_tenant_access(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.current_tenant_ids() tenant_id
    where tenant_id = p_tenant_id
  );
$$;

create or replace function public.has_role(
  p_tenant_id uuid,
  p_role_code text,
  p_scope_type text default null,
  p_scope_reference uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.role_assignments ra
    join public.role_definitions rd on rd.id = ra.role_definition_id
    where ra.tenant_id = p_tenant_id
      and ra.user_id = auth.uid()
      and rd.role_code = p_role_code
      and ra.assignment_status = 'active'
      and ra.effective_from <= now()
      and (ra.effective_to is null or ra.effective_to > now())
      and (p_scope_type is null or ra.scope_type = p_scope_type)
      and (p_scope_reference is null or ra.scope_reference = p_scope_reference)
  );
$$;

create or replace function public.has_permission(p_tenant_id uuid, p_permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.role_assignments ra
    join public.role_permissions rp on rp.role_definition_id = ra.role_definition_id
    join public.permission_definitions pd on pd.id = rp.permission_definition_id
    where ra.tenant_id = p_tenant_id
      and ra.user_id = auth.uid()
      and ra.assignment_status = 'active'
      and pd.permission_code = p_permission_code
      and pd.lifecycle_status = 'active'
      and ra.effective_from <= now()
      and (ra.effective_to is null or ra.effective_to > now())
  );
$$;
