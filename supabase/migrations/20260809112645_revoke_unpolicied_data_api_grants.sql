-- Remove legacy automatic Data API grants from public tables that are
-- intentionally deny-by-default: RLS is enabled and no policies exist.
--
-- These tables are already inaccessible through RLS. Revoking the grants
-- removes their unnecessary PostgREST surface without changing access to
-- tables that have explicit policies.

do $migration$
declare
  target record;
begin
  for target in
    select n.nspname as schema_name, c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relrowsecurity
      and not exists (
        select 1
        from pg_policies p
        where p.schemaname = n.nspname
          and p.tablename = c.relname
      )
  loop
    execute format(
      'revoke all privileges on table %I.%I from anon, authenticated',
      target.schema_name,
      target.table_name
    );
  end loop;
end
$migration$;
