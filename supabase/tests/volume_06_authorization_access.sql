begin;

select plan(30);

select has_function('public', 'current_tenant_ids', array[]::text[], 'current_tenant_ids exists');
select has_function('public', 'has_tenant_access', array['uuid'], 'has_tenant_access exists');
select has_function('public', 'case_visible_to_current_user', array['uuid'], 'case_visible_to_current_user exists');
select has_function('public', 'has_case_permission', array['uuid', 'uuid', 'text'], 'has_case_permission exists');
select has_function('public', 'user_can_view_child_private', array['uuid'], 'user_can_view_child_private exists');
select has_function('public', 'user_can_manage_child_private', array['uuid'], 'user_can_manage_child_private exists');
select has_function('public', 'can_read_report', array['uuid', 'uuid'], 'can_read_report exists');
select has_function('public', 'can_write_report', array['uuid', 'uuid'], 'can_write_report exists');

select ok(
  coalesce(not has_function_privilege('anon', to_regprocedure('public.has_tenant_access(uuid)'), 'EXECUTE'), false),
  'anon cannot execute has_tenant_access'
);
select ok(
  coalesce(has_function_privilege('authenticated', to_regprocedure('public.has_tenant_access(uuid)'), 'EXECUTE'), false),
  'authenticated can execute has_tenant_access'
);
select ok(
  coalesce(not has_function_privilege('anon', to_regprocedure('public.has_case_permission(uuid, uuid, text)'), 'EXECUTE'), false),
  'anon cannot execute has_case_permission'
);
select ok(
  coalesce(has_function_privilege('authenticated', to_regprocedure('public.has_case_permission(uuid, uuid, text)'), 'EXECUTE'), false),
  'authenticated can execute has_case_permission'
);
select ok(
  coalesce(not has_function_privilege('anon', to_regprocedure('public.user_can_view_child_private(uuid)'), 'EXECUTE'), false),
  'anon cannot execute user_can_view_child_private'
);
select ok(
  coalesce(has_function_privilege('authenticated', to_regprocedure('public.user_can_view_child_private(uuid)'), 'EXECUTE'), false),
  'authenticated can execute user_can_view_child_private'
);
select ok(
  coalesce(not has_function_privilege('anon', to_regprocedure('public.can_read_report(uuid, uuid)'), 'EXECUTE'), false),
  'anon cannot execute can_read_report'
);
select ok(
  coalesce(has_function_privilege('authenticated', to_regprocedure('public.can_read_report(uuid, uuid)'), 'EXECUTE'), false),
  'authenticated can execute can_read_report'
);
select ok(
  coalesce(not has_function_privilege('anon', to_regprocedure('public.can_write_report(uuid, uuid)'), 'EXECUTE'), false),
  'anon cannot execute can_write_report'
);
select ok(
  coalesce(has_function_privilege('authenticated', to_regprocedure('public.can_write_report(uuid, uuid)'), 'EXECUTE'), false),
  'authenticated can execute can_write_report'
);

select ok(
  coalesce(
    replace(pg_get_functiondef(to_regprocedure('public.has_case_permission(uuid, uuid, text)')), ' ', '') like '%p_user_id=(selectauth.uid())%',
    false
  ),
  'has_case_permission is bound to auth.uid()'
);
select ok(
  coalesce(
    replace(pg_get_functiondef(to_regprocedure('public.can_read_report(uuid, uuid)')), ' ', '') like '%p_user_id=(selectauth.uid())%',
    false
  ),
  'can_read_report is bound to auth.uid()'
);
select ok(
  coalesce(
    replace(pg_get_functiondef(to_regprocedure('public.can_write_report(uuid, uuid)')), ' ', '') like '%p_user_id=(selectauth.uid())%',
    false
  ),
  'can_write_report is bound to auth.uid()'
);
select ok(
  coalesce(
    replace(pg_get_functiondef(to_regprocedure('public.user_can_view_child_private(uuid)')), ' ', '') like '%auth.uid()%'
    and replace(pg_get_functiondef(to_regprocedure('public.user_can_view_child_private(uuid)')), ' ', '') like '%user_has_case_role%',
    false
  ),
  'user_can_view_child_private checks auth.uid() and case role'
);
select ok(
  coalesce(
    replace(pg_get_functiondef(to_regprocedure('public.has_tenant_access(uuid)')), ' ', '') like '%frompublic.current_tenant_ids()%tenant_id%',
    false
  ),
  'has_tenant_access delegates to current_tenant_ids'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'reports'
      and policyname = 'report_case_authorised_read'
      and qual ilike '%has_case_permission%'
  ),
  'reports has report_case_authorised_read policy with case permission gate'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'reports'
      and policyname = 'report_recipient_read'
      and qual ilike '%report_recipients%'
  ),
  'reports has report_recipient_read policy for explicit recipients'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'report_versions'
      and policyname = 'report_versions_read'
      and qual ilike '%can_read_report%'
  ),
  'report_versions read policy is gated by can_read_report'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'child_private_records'
      and policyname = 'child_private_record_child_read'
  ),
  'child_private_records has child-private self-access policy'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'child_private_records'
      and policyname = 'child_private_record_shared_read'
      and (
        qual ilike '%user_has_active_child_record_share%'
        or qual ilike '%child_record_shares%'
      )
  ),
  'child_private_records has active share-based read policy'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'cases'
      and policyname = 'cases_access_by_assignment_or_parent'
      and qual ilike '%case_visible_to_current_user%'
  ),
  'cases read policy is gated by case_visible_to_current_user'
);

select * from finish();

rollback;
