insert into public.permission_definitions (
  permission_code,
  permission_name,
  permission_description,
  permission_domain,
  action_type,
  sensitive_permission,
  tenant_assignable
)
values
  ('tenant.read', 'Read tenant', 'Read authorised tenant configuration.', 'tenant', 'read', true, true),
  ('tenant.manage', 'Manage tenant', 'Manage tenant configuration.', 'tenant', 'manage', true, false),
  ('tenant.membership.read', 'Read tenant memberships', 'Read tenant membership records.', 'tenant', 'read', true, true),
  ('tenant.membership.manage', 'Manage tenant memberships', 'Invite, suspend, and revoke tenant memberships.', 'tenant', 'manage', true, true),
  ('organisation.read', 'Read organisation', 'Read authorised organisation records.', 'organisation', 'read', true, true),
  ('organisation.manage', 'Manage organisation', 'Create and update authorised organisation records.', 'organisation', 'manage', true, true),
  ('role.assignment.read', 'Read role assignments', 'Read authorised role assignment records.', 'identity', 'read', true, true),
  ('role.assignment.manage', 'Manage role assignments', 'Create, update, and revoke role assignments.', 'identity', 'manage', true, true),
  ('audit.read', 'Read audit events', 'Read authorised audit events.', 'audit', 'read', true, true)
on conflict (permission_code) do update
set permission_name = excluded.permission_name,
    permission_description = excluded.permission_description,
    permission_domain = excluded.permission_domain,
    action_type = excluded.action_type,
    sensitive_permission = excluded.sensitive_permission,
    tenant_assignable = excluded.tenant_assignable;

insert into public.role_definitions (
  tenant_id,
  role_code,
  role_name,
  role_description,
  role_category,
  system_role,
  tenant_customisable
)
values
  (null, 'tenant_owner', 'Tenant Owner', 'Owns tenant administration and identity governance.', 'tenant_administration', true, false),
  (null, 'tenant_administrator', 'Tenant Administrator', 'Manages tenant setup, memberships, organisations, and roles.', 'tenant_administration', true, false),
  (null, 'organisation_member', 'Organisation Member', 'Uses SafeSteps within an authorised organisation.', 'organisation', true, true),
  (null, 'worker', 'Worker', 'Works with authorised families and cases.', 'casework', true, true),
  (null, 'supervisor', 'Supervisor', 'Reviews and supervises authorised workers and cases.', 'casework', true, true),
  (null, 'parent', 'Parent', 'Parent or carer participant.', 'family', true, true),
  (null, 'child_participant', 'Child Participant', 'Child participant with privacy-mediated access.', 'family', true, true),
  (null, 'auditor', 'Auditor', 'Reads authorised audit and compliance records.', 'audit', true, true)
on conflict (tenant_id, role_code) do update
set role_name = excluded.role_name,
    role_description = excluded.role_description,
    role_category = excluded.role_category,
    system_role = excluded.system_role,
    tenant_customisable = excluded.tenant_customisable,
    updated_at = now();

insert into public.role_permissions (
  role_id,
  permission_id,
  role_definition_id,
  permission_definition_id
)
select
  sr.id,
  sp.id,
  rd.id,
  pd.id
from public.role_definitions rd
join public.permission_definitions pd
  on (
    rd.role_code = 'tenant_owner'
    or (rd.role_code = 'tenant_administrator' and pd.permission_code <> 'tenant.manage')
    or (rd.role_code = 'auditor' and pd.permission_code = 'audit.read')
    or (rd.role_code in ('organisation_member', 'worker', 'supervisor') and pd.permission_code in ('tenant.read', 'organisation.read'))
  )
left join public.security_roles sr
  on sr.role_code = rd.role_code
left join public.security_permissions sp
  on sp.permission_code = pd.permission_code
where rd.tenant_id is null
  and sr.id is not null
  and sp.id is not null
on conflict do nothing;

create or replace function public.bootstrap_platform_tenant(
  p_tenant_reference text,
  p_tenant_slug text,
  p_tenant_name text,
  p_owner_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_owner_role_id uuid;
begin
  insert into public.platform_tenants (
    tenant_reference,
    tenant_slug,
    tenant_name,
    tenant_type,
    tenant_status,
    activated_at
  )
  values (
    p_tenant_reference,
    p_tenant_slug,
    p_tenant_name,
    'standard',
    'active',
    now()
  )
  on conflict (tenant_reference) do update
  set tenant_slug = excluded.tenant_slug,
      tenant_name = excluded.tenant_name,
      tenant_status = 'active',
      updated_at = now()
  returning id into v_tenant_id;

  select id into v_owner_role_id
  from public.role_definitions
  where tenant_id is null and role_code = 'tenant_owner';

  insert into public.tenant_memberships (
    tenant_id,
    user_id,
    membership_type,
    membership_status,
    accepted_at
  )
  values (v_tenant_id, p_owner_user_id, 'tenant_owner', 'active', now())
  on conflict do nothing;

  if v_owner_role_id is not null then
    insert into public.role_assignments (
      tenant_id,
      user_id,
      role_definition_id,
      scope_type,
      assignment_status,
      assignment_reason
    )
    values (
      v_tenant_id,
      p_owner_user_id,
      v_owner_role_id,
      'tenant',
      'active',
      'bootstrap tenant owner'
    )
    on conflict do nothing;
  end if;

  return v_tenant_id;
end;
$$;

revoke all on function public.bootstrap_platform_tenant(text, text, text, uuid) from public;
revoke all on function public.bootstrap_platform_tenant(text, text, text, uuid) from anon;
revoke all on function public.bootstrap_platform_tenant(text, text, text, uuid) from authenticated;
grant execute on function public.bootstrap_platform_tenant(text, text, text, uuid) to service_role;
