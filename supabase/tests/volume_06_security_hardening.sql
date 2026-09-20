begin;

select plan(30);

select ok(
  to_regclass('safesteps_security.function_security_inventory') is not null,
  'function security inventory view exists'
);
select ok(
  to_regclass('safesteps_security.table_security_inventory') is not null,
  'table security inventory view exists'
);
select ok(
  to_regclass('safesteps_security.policy_function_dependencies') is not null,
  'policy dependency inventory view exists'
);

select ok(
  exists (
    select 1
    from safesteps_security.function_security_inventory
    where function_signature = 'public.consume_case_report_delivery(text, text)'
      and security_classification = 'public_delivery'
      and search_path_locked
      and exposed_to_anon
  ),
  'anonymous case report delivery RPC remains intentionally exposed and hardened'
);
select ok(
  exists (
    select 1
    from safesteps_security.function_security_inventory
    where function_signature = 'public.verify_real_video_report_delivery(text, text)'
      and security_classification = 'public_delivery'
      and search_path_locked
      and exposed_to_anon
  ),
  'anonymous real video delivery verification remains intentionally exposed and hardened'
);
select ok(
  exists (
    select 1
    from safesteps_security.function_security_inventory
    where function_signature = 'public.verify_video_report_public(text)'
      and security_classification = 'public_delivery'
      and search_path_locked
      and exposed_to_anon
  ),
  'anonymous public video verification remains intentionally exposed and hardened'
);

select ok(
  (
    select count(*)
    from safesteps_security.function_security_inventory
    where security_classification = 'admin_only'
      and exposed_to_authenticated
  ) = 0,
  'authenticated role cannot execute admin-only helpers directly'
);
select ok(
  (
    select count(*)
    from safesteps_security.function_security_inventory
    where security_classification = 'admin_only'
      and exposed_to_service_role
  ) >= 1,
  'service role retains explicit access to admin-only helpers'
);

select ok(
  exists (
    select 1
    from safesteps_security.function_security_inventory
    where function_signature = 'public.can_access_video_report(uuid, text)'
      and security_classification = 'rls_helper'
      and search_path_locked
      and exposed_to_authenticated
  ),
  'video report RLS helper stays callable for policy evaluation and now has a locked search_path'
);
select ok(
  exists (
    select 1
    from safesteps_security.policy_function_dependencies
    where function_signature = 'public.can_access_video_report(uuid, text)'
      and tablename in ('video_report_disputes', 'video_report_review_requests')
  ),
  'video report helper dependency inventory captures policy usage before revoke decisions'
);
select ok(
  exists (
    select 1
    from safesteps_security.policy_function_dependencies
    where function_signature = 'public.user_can_view_child_private(uuid)'
      and tablename = 'child_private_records'
  ),
  'child-private helper dependency inventory captures shared child record policy usage'
);

select ok(
  exists (
    select 1
    from safesteps_security.table_security_inventory
    where table_name = 'case_report_release_events'
      and table_classification = 'case_scoped'
      and rls_enabled
      and access_model like '%role-specific writes%'
  ),
  'case report release events are documented as case-scoped with role-specific writes'
);
select ok(
  exists (
    select 1
    from safesteps_security.table_security_inventory
    where table_name = 'platform_tenants'
      and table_classification = 'tenant_scoped'
      and access_model like '%cross-tenant%'
  ),
  'tenant inventory documents cross-tenant denial by default'
);
select ok(
  exists (
    select 1
    from safesteps_security.table_security_inventory
    where table_name = 'child_private_records'
      and table_classification = 'child_private'
      and access_model like '%parent access mediated%'
  ),
  'child-private inventory documents mediated parent access only'
);
select ok(
  exists (
    select 1
    from safesteps_security.table_security_inventory
    where table_name = 'profiles'
      and table_classification = 'user_owned'
      and access_model like '%allowlisted self-service writes%'
  ),
  'authenticated self-service identity writes remain explicitly limited'
);
select ok(
  exists (
    select 1
    from safesteps_security.table_security_inventory
    where table_name = 'reunification_cases'
      and table_classification = 'deprecated_candidate'
  ),
  'transitional reunification_cases table remains marked deprecated_candidate'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'child_shared_items'
      and policyname = 'child_shared_items_select'
      and qual like '%share_audience%'
      and qual like '%parent_user_id%'
  ),
  'parent-facing child sharing policy remains mediated by explicit share_audience rules'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'child_accounts'
      and policyname = 'Child v20 accounts'
      and qual like '%user_id = auth.uid()%'
  ),
  'child role retains self-access policy on child_accounts'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'child_accounts'
      and policyname = 'Child v20 accounts'
      and qual like '%safesteps_can_worker_access_child_v20(auth.uid(), child_id)%'
  ),
  'worker role retains helper-bound child access policy on child_accounts'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'case_report_release_events'
      and policyname = 'case_report_release_events_insert'
      and with_check like '%supervisor%'
  ),
  'supervisor report-release policy remains documented in RLS'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'case_report_release_events'
      and policyname = 'case_report_release_events_insert'
      and with_check like '%admin%'
  ),
  'administrator report-release policy remains documented in RLS'
);

select ok(
  position(
    'public.current_tenant_ids()'
    in pg_get_functiondef('public.has_tenant_access(uuid)'::regprocedure)
  ) > 0,
  'cross-tenant access helper remains bound to the caller current tenant set'
);
select ok(
  position(
    'public.has_case_permission'
    in pg_get_functiondef('public.can_manage_report_recipients(uuid)'::regprocedure)
  ) > 0,
  'cross-case report recipient management remains case-bound'
);
select ok(
  exists (
    select 1
    from safesteps_security.function_security_inventory
    where function_signature = 'public.prepare_case_report_delivery(uuid, uuid, uuid, integer, integer)'
      and security_classification = 'authenticated_operation'
      and exposed_to_authenticated
      and not exposed_to_anon
  ),
  'authenticated report delivery preparation stays off the anonymous surface'
);
select ok(
  exists (
    select 1
    from safesteps_security.function_security_inventory
    where function_signature = 'public.request_case_report_export(uuid, uuid, uuid, text, text, integer)'
      and security_classification = 'authenticated_operation'
      and exposed_to_authenticated
      and not exposed_to_anon
  ),
  'authenticated private report export request stays off the anonymous surface'
);

select ok(
  exists (
    select 1
    from safesteps_security.function_security_inventory
    where function_signature = 'public.user_can_manage_child_private(uuid)'
      and security_classification = 'rls_helper'
      and exposed_to_authenticated
  ),
  'child-private management helper remains available to authenticated policy paths'
);
select ok(
  exists (
    select 1
    from safesteps_security.policy_function_dependencies
    where function_signature = 'public.user_has_case_role(uuid, text[])'
      and tablename = 'case_report_release_events'
  ),
  'case report release policies still depend on explicit case-role checks'
);
select ok(
  exists (
    select 1
    from safesteps_security.table_security_inventory
    where table_name = 'report_recipients'
      and table_classification = 'case_scoped'
      and access_model like '%cross-case denial%'
  ),
  'report recipients inventory documents explicit cross-case denial'
);
select ok(
  exists (
    select 1
    from safesteps_security.function_security_inventory
    where function_signature = 'public.grant_parent_video_report_consent(uuid, text, text, timestamp with time zone)'
      and security_classification = 'authenticated_operation'
      and exposed_to_authenticated
      and not exposed_to_anon
  ),
  'authenticated consent-grant RPC remains unavailable to anonymous callers'
);
select ok(
  exists (
    select 1
    from safesteps_security.function_security_inventory
    where function_signature = 'public.withdraw_parent_video_report_consent(uuid, text)'
      and security_classification = 'authenticated_operation'
      and exposed_to_authenticated
      and not exposed_to_anon
  ),
  'authenticated consent-withdrawal RPC remains unavailable to anonymous callers'
);

select * from finish();

rollback;
