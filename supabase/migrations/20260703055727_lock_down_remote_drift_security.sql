-- Lock down schema drift found in the linked Supabase project.
-- This intentionally removes the manual SQL-execution RPC and enables RLS
-- on public tables that were reachable through the exposed public schema.

drop function if exists public.execute_sql(text);

do $$
begin
  if to_regprocedure('public.handle_new_user()') is not null then
    alter function public.handle_new_user() set search_path = public, auth;
  end if;

  if to_regprocedure('public.set_updated_at()') is not null then
    alter function public.set_updated_at() set search_path = public;
  end if;

  if to_regprocedure('public.current_app_role()') is not null then
    alter function public.current_app_role() set search_path = public, auth;
  end if;

  if to_regprocedure('public.is_caseworker_or_admin()') is not null then
    alter function public.is_caseworker_or_admin() set search_path = public, auth;
  end if;

  if to_regprocedure('public.current_assessment_app_role()') is not null then
    alter function public.current_assessment_app_role() set search_path = public, auth;
  end if;

  if to_regprocedure('public.can_manage_assessments()') is not null then
    alter function public.can_manage_assessments() set search_path = public, auth;
  end if;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'activities',
    'casefiles',
    'children',
    'curriculum',
    'evidence',
    'forensic_scores',
    'parents',
    'progress',
    'user_settings'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
    end if;
  end loop;
end $$;
