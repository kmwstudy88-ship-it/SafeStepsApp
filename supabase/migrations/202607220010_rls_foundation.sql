alter table public.platform_tenants enable row level security;
alter table public.organisations enable row level security;
alter table public.profiles enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.permission_definitions enable row level security;
alter table public.role_definitions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.role_assignments enable row level security;
alter table public.audit_events enable row level security;

grant select on public.permission_definitions, public.role_definitions, public.role_permissions to authenticated;
grant select, insert, update on public.profiles, public.platform_tenants, public.organisations, public.tenant_memberships, public.role_assignments to authenticated;
grant select, insert on public.audit_events to authenticated;

drop policy if exists "Tenant members can read tenants" on public.platform_tenants;
create policy "Tenant members can read tenants"
on public.platform_tenants for select to authenticated
using (public.has_tenant_access(id));

drop policy if exists "Tenant administrators can manage tenants" on public.platform_tenants;
create policy "Tenant administrators can manage tenants"
on public.platform_tenants for all to authenticated
using (public.has_role(id, 'tenant_owner') or public.has_role(id, 'tenant_administrator'))
with check (public.has_role(id, 'tenant_owner') or public.has_role(id, 'tenant_administrator'));

drop policy if exists "Tenant members can read organisations" on public.organisations;
create policy "Tenant members can read organisations"
on public.organisations for select to authenticated
using (tenant_id is not null and public.has_tenant_access(tenant_id));

drop policy if exists "Tenant administrators can manage organisations" on public.organisations;
create policy "Tenant administrators can manage organisations"
on public.organisations for all to authenticated
using (tenant_id is not null and public.has_permission(tenant_id, 'organisation.manage'))
with check (tenant_id is not null and public.has_permission(tenant_id, 'organisation.manage'));

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can read own memberships" on public.tenant_memberships;
create policy "Users can read own memberships"
on public.tenant_memberships for select to authenticated
using (user_id = auth.uid() or public.has_permission(tenant_id, 'tenant.membership.read'));

drop policy if exists "Tenant administrators can manage memberships" on public.tenant_memberships;
create policy "Tenant administrators can manage memberships"
on public.tenant_memberships for all to authenticated
using (public.has_permission(tenant_id, 'tenant.membership.manage'))
with check (public.has_permission(tenant_id, 'tenant.membership.manage'));

drop policy if exists "Authenticated users can read active permission definitions" on public.permission_definitions;
create policy "Authenticated users can read active permission definitions"
on public.permission_definitions for select to authenticated
using (lifecycle_status = 'active');

drop policy if exists "Tenant members can read role definitions" on public.role_definitions;
create policy "Tenant members can read role definitions"
on public.role_definitions for select to authenticated
using (tenant_id is null or public.has_tenant_access(tenant_id));

drop policy if exists "Tenant members can read role permissions" on public.role_permissions;
create policy "Tenant members can read role permissions"
on public.role_permissions for select to authenticated
using (exists (
  select 1 from public.role_definitions rd
  where rd.id = role_definition_id
    and (rd.tenant_id is null or public.has_tenant_access(rd.tenant_id))
));

drop policy if exists "Users can read relevant role assignments" on public.role_assignments;
create policy "Users can read relevant role assignments"
on public.role_assignments for select to authenticated
using (user_id = auth.uid() or public.has_permission(tenant_id, 'role.assignment.read'));

drop policy if exists "Tenant administrators can manage role assignments" on public.role_assignments;
create policy "Tenant administrators can manage role assignments"
on public.role_assignments for all to authenticated
using (public.has_permission(tenant_id, 'role.assignment.manage'))
with check (public.has_permission(tenant_id, 'role.assignment.manage'));

drop policy if exists "Tenant audit readable by authorised users" on public.audit_events;
create policy "Tenant audit readable by authorised users"
on public.audit_events for select to authenticated
using (tenant_id is not null and public.has_permission(tenant_id, 'audit.read'));

drop policy if exists "Authenticated users can append audit events" on public.audit_events;
create policy "Authenticated users can append audit events"
on public.audit_events for insert to authenticated
with check (actor_user_id = auth.uid() or actor_service is not null);
