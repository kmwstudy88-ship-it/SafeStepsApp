-- SafeSteps Stage 1 canonical schema inventory.
-- Run against the linked project before Stage 2 executable foundation migrations.

create schema if not exists safesteps_stage1_inventory;

create or replace view safesteps_stage1_inventory.current_tables as
select table_schema, table_name, table_type
from information_schema.tables
where table_schema in ('public', 'storage')
order by table_schema, table_name;

create or replace view safesteps_stage1_inventory.current_columns as
select table_schema, table_name, column_name, ordinal_position, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema in ('public', 'storage')
order by table_schema, table_name, ordinal_position;

create or replace view safesteps_stage1_inventory.current_foreign_keys as
select
  tc.constraint_schema,
  tc.constraint_name,
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema as foreign_table_schema,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.constraint_schema = kcu.constraint_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.constraint_schema = tc.constraint_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema in ('public', 'storage')
order by tc.table_schema, tc.table_name, tc.constraint_name;

create or replace view safesteps_stage1_inventory.current_indexes as
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname in ('public', 'storage')
order by schemaname, tablename, indexname;

create or replace view safesteps_stage1_inventory.current_rls_policies as
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

create or replace view safesteps_stage1_inventory.current_functions as
select
  n.nspname as function_schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  l.lanname as language,
  case p.prosecdef when true then 'security_definer' else 'security_invoker' end as security_mode
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_language l on l.oid = p.prolang
where n.nspname in ('public', 'storage')
order by n.nspname, p.proname, arguments;

create or replace view safesteps_stage1_inventory.current_triggers as
select event_object_schema as table_schema, event_object_table as table_name, trigger_name, action_timing, event_manipulation, action_statement
from information_schema.triggers
where event_object_schema in ('public', 'storage')
order by event_object_schema, event_object_table, trigger_name;

create or replace view safesteps_stage1_inventory.tenant_boundary_gaps as
with expected(table_name) as (
  values
    ('organisations'), ('families'), ('family_members'), ('children'), ('cases'), ('case_participants'),
    ('case_allocations'), ('case_plans'), ('case_plan_goals'), ('assessment_instances'),
    ('evidence_records'), ('community_service_referrals'), ('consent_records'), ('audit_events')
)
select
  e.table_name,
  case when t.table_name is null then 'missing_table' else 'missing_tenant_id' end as gap_type
from expected e
left join information_schema.tables t
  on t.table_schema = 'public'
 and t.table_name = e.table_name
left join information_schema.columns c
  on c.table_schema = 'public'
 and c.table_name = e.table_name
 and c.column_name = 'tenant_id'
where t.table_name is null
   or c.column_name is null
order by e.table_name;

create or replace view safesteps_stage1_inventory.blocked_legacy_names as
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'casefiles', 'case_files', 'client_cases', 'family_cases', 'service_case_records',
    'assessment_runs', 'assessment_sessions', 'tenant_users', 'account_tenants'
  )
order by table_name;
