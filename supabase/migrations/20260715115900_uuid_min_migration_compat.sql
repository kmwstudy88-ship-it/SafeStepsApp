-- Compatibility helper used by the following one-time case-membership backfill.
-- PostgreSQL does not provide min(uuid) on every supported installation.

create or replace function public.safesteps_uuid_min_state(current_value uuid, next_value uuid)
returns uuid
language sql
immutable
parallel safe
as $$
  select case
    when current_value is null then next_value
    when next_value is null then current_value
    when current_value::text <= next_value::text then current_value
    else next_value
  end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'min'
      and p.prokind = 'a'
      and pg_get_function_identity_arguments(p.oid) = 'uuid'
  ) then
    create aggregate public.min(uuid) (
      sfunc = public.safesteps_uuid_min_state,
      stype = uuid
    );
  end if;
end $$;
