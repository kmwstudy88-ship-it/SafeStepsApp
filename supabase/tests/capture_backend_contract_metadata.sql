-- Replace the project-ref placeholder with the approved target's Supabase ref.
-- Run as a catalog auditor with access to supabase_migrations.schema_migrations.
-- This exports metadata only, not case rows, identities, credentials or tokens.
begin isolation level repeatable read read only;

with relations as (
  select c.oid, c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'f')
),
payload as (
  select jsonb_build_object(
    'capture_schema_version', 1,
    'project_id', 'REPLACE_WITH_APPROVED_PROJECT_REF',
    'captured_at', current_timestamp,
    'scope', 'Public catalog metadata and migration versions only; no application rows.',
    'relations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'schema', 'public', 'name', relname, 'relkind', relkind,
        'relrowsecurity', relrowsecurity, 'relforcerowsecurity', relforcerowsecurity
      ) order by relname) from relations
    ), '[]'::jsonb),
    'columns', coalesce((
      select jsonb_agg(jsonb_build_object(
        'table_name', r.relname, 'column_name', a.attname,
        'ordinal_position', a.attnum, 'data_type', pg_catalog.format_type(a.atttypid, a.atttypmod),
        'udt_name', ty.typname,
        'is_nullable', case when a.attnotnull then 'NO' else 'YES' end,
        'column_default', pg_catalog.pg_get_expr(d.adbin, d.adrelid)
      ) order by r.relname, a.attnum)
      from relations r
      join pg_catalog.pg_attribute a on a.attrelid = r.oid
      join pg_catalog.pg_type ty on ty.oid = a.atttypid
      left join pg_catalog.pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
      where a.attnum > 0 and not a.attisdropped
    ), '[]'::jsonb),
    'constraints', coalesce((
      select jsonb_agg(jsonb_build_object(
        'table_name', r.relname, 'conname', c.conname, 'contype', c.contype,
        'definition', pg_catalog.pg_get_constraintdef(c.oid, true),
        'validated', c.convalidated
      ) order by r.relname, c.conname)
      from relations r join pg_catalog.pg_constraint c on c.conrelid = r.oid
    ), '[]'::jsonb),
    'policies', coalesce((
      select jsonb_agg(jsonb_build_object(
        'schemaname', schemaname, 'tablename', tablename, 'policyname', policyname,
        'permissive', permissive, 'roles', roles::text, 'cmd', cmd,
        'qual', qual, 'with_check', with_check
      ) order by tablename, policyname)
      from pg_catalog.pg_policies where schemaname = 'public'
    ), '[]'::jsonb),
    'views', coalesce((
      select jsonb_agg(jsonb_build_object(
        'relname', r.relname, 'reloptions', c.reloptions,
        'definition', pg_catalog.pg_get_viewdef(r.oid, true)
      ) order by r.relname)
      from relations r join pg_catalog.pg_class c on c.oid = r.oid
      where r.relkind in ('v', 'm')
    ), '[]'::jsonb),
    'helpers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'proname', p.proname, 'arguments', pg_catalog.pg_get_function_identity_arguments(p.oid),
        'prosecdef', p.prosecdef, 'proconfig', p.proconfig,
        'definition', pg_catalog.pg_get_functiondef(p.oid)
      ) order by p.proname, pg_catalog.pg_get_function_identity_arguments(p.oid))
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.prokind in ('f', 'p')
    ), '[]'::jsonb),
    'triggers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'table_name', r.relname, 'tgname', t.tgname,
        'definition', pg_catalog.pg_get_triggerdef(t.oid, true), 'enabled', t.tgenabled
      ) order by r.relname, t.tgname)
      from relations r join pg_catalog.pg_trigger t on t.tgrelid = r.oid
      where not t.tgisinternal
    ), '[]'::jsonb),
    'grants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'table_schema', 'public', 'table_name', r.relname,
        'grantee', case when a.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(a.grantee) end,
        'privilege_type', a.privilege_type, 'is_grantable', a.is_grantable
      ) order by r.relname, a.grantee, a.privilege_type)
      from relations r
      join pg_catalog.pg_class c on c.oid = r.oid
      cross join lateral pg_catalog.aclexplode(
        coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
      ) a
    ), '[]'::jsonb),
    'column_grants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'table_name', r.relname, 'column_name', c.attname,
        'grantee', case when a.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(a.grantee) end,
        'privilege_type', a.privilege_type, 'is_grantable', a.is_grantable
      ) order by r.relname, c.attname, a.grantee, a.privilege_type)
      from relations r join pg_catalog.pg_attribute c on c.attrelid = r.oid
      cross join lateral pg_catalog.aclexplode(c.attacl) a
      where c.attnum > 0 and not c.attisdropped
    ), '[]'::jsonb),
    'function_grants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'proname', p.proname, 'arguments', pg_catalog.pg_get_function_identity_arguments(p.oid),
        'grantee', case when a.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(a.grantee) end,
        'privilege_type', a.privilege_type, 'is_grantable', a.is_grantable
      ) order by p.proname, pg_catalog.pg_get_function_identity_arguments(p.oid), a.grantee)
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      cross join lateral pg_catalog.aclexplode(
        coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
      ) a
      where n.nspname = 'public' and p.prokind in ('f', 'p')
    ), '[]'::jsonb),
    'migrations', coalesce((
      select jsonb_agg(jsonb_build_object('version', version, 'name', name) order by version)
      from supabase_migrations.schema_migrations
    ), '[]'::jsonb)
  ) as metadata
)
select metadata from payload;

rollback;
