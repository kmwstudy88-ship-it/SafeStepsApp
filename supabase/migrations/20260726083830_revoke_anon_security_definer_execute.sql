-- Remove anonymous API execution from privileged public SECURITY DEFINER functions.
-- Keep authenticated execution for now because several helper functions are used
-- by signed-in workflows and RLS policy checks.
do $$
declare
  target_function regprocedure;
begin
  for target_function in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n
      on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
  loop
    execute format('revoke execute on function %s from public', target_function);
    execute format('revoke execute on function %s from anon', target_function);
    execute format('grant execute on function %s to authenticated', target_function);
  end loop;
end;
$$;

alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon;
alter default privileges in schema public grant execute on functions to authenticated;
