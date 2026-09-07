begin;

select plan(24);

select has_table('public', 'platform_tenants', 'platform_tenants exists');
select has_table('public', 'organisations', 'organisations exists');
select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'tenant_memberships', 'tenant_memberships exists');
select has_table('public', 'permission_definitions', 'permission_definitions exists');
select has_table('public', 'role_definitions', 'role_definitions exists');
select has_table('public', 'role_permissions', 'role_permissions exists');
select has_table('public', 'role_assignments', 'role_assignments exists');
select has_table('public', 'audit_events', 'audit_events exists');

select col_is_pk('public', 'platform_tenants', 'id', 'platform_tenants.id is primary key');
select col_is_pk('public', 'profiles', 'id', 'profiles.id is primary key');
select col_is_fk('public', 'profiles', 'default_tenant_id', 'profiles.default_tenant_id is foreign key');
select col_is_fk('public', 'tenant_memberships', 'tenant_id', 'tenant_memberships.tenant_id is foreign key');
select col_is_fk('public', 'tenant_memberships', 'user_id', 'tenant_memberships.user_id is foreign key');
select col_is_fk('public', 'role_assignments', 'tenant_id', 'role_assignments.tenant_id is foreign key');
select col_is_fk('public', 'role_assignments', 'role_definition_id', 'role_assignments.role_definition_id is foreign key');
select col_is_fk('public', 'audit_events', 'tenant_id', 'audit_events.tenant_id is foreign key');

select has_function('public', 'current_user_id', array[]::text[], 'current_user_id exists');
select has_function('public', 'current_tenant_ids', array[]::text[], 'current_tenant_ids exists');
select has_function('public', 'has_tenant_access', array['uuid'], 'has_tenant_access exists');
select has_function('public', 'has_role', array['uuid', 'text', 'text', 'uuid'], 'has_role exists');
select has_function('public', 'has_permission', array['uuid', 'text'], 'has_permission exists');
select has_function('public', 'audit_row_change', array[]::text[], 'audit_row_change exists');
select has_function('public', 'bootstrap_platform_tenant', array['text', 'text', 'text', 'uuid'], 'bootstrap_platform_tenant exists');

select * from finish();

rollback;
