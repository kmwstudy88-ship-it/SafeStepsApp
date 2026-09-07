create schema if not exists extensions;

grant usage on schema extensions to postgres;
grant usage on schema extensions to anon;
grant usage on schema extensions to authenticated;
grant usage on schema extensions to service_role;

alter extension citext set schema extensions;
alter extension pg_trgm set schema extensions;
alter extension btree_gist set schema extensions;
