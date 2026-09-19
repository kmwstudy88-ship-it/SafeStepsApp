begin;

create schema if not exists safesteps_security;

create or replace view safesteps_security.function_security_inventory as
with catalogued_functions as (
  select
    p.oid,
    n.nspname as function_schema,
    p.proname as function_name,
    pg_catalog.pg_get_function_identity_arguments(p.oid) as identity_arguments,
    pg_catalog.oidvectortypes(p.proargtypes) as argument_types,
    format(
      '%I.%I(%s)',
      n.nspname,
      p.proname,
      pg_catalog.oidvectortypes(p.proargtypes)
    ) as function_signature,
    case
      when p.prosecdef then 'security_definer'
      else 'security_invoker'
    end as security_mode,
    pg_catalog.array_to_string(p.proconfig, ', ') as function_settings,
    pg_catalog.pg_get_function_result(p.oid) as return_type
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'private')
),
function_flags as (
  select
    cf.*,
    coalesce(
      cf.function_settings like '%search_path=""%',
      false
    ) or coalesce(
      cf.function_settings like '%search_path=''''%',
      false
    ) or coalesce(
      cf.function_settings like '%search_path=pg_catalog%',
      false
    ) as search_path_locked,
    coalesce(has_function_privilege('anon', cf.oid, 'EXECUTE'), false) as exposed_to_anon,
    coalesce(has_function_privilege('authenticated', cf.oid, 'EXECUTE'), false) as exposed_to_authenticated,
    coalesce(has_function_privilege('service_role', cf.oid, 'EXECUTE'), false) as exposed_to_service_role,
    pg_catalog.regexp_replace(
      cf.function_name,
      '([][(){}.*+?^$|\\-])',
      '\\\1',
      'g'
    ) as escaped_function_name
  from catalogued_functions cf
)
select
  ff.function_schema,
  ff.function_name,
  ff.identity_arguments,
  ff.argument_types,
  ff.function_signature,
  ff.security_mode,
  ff.return_type,
  coalesce(ff.function_settings, '') as function_settings,
  ff.search_path_locked,
  ff.exposed_to_anon,
  ff.exposed_to_authenticated,
  ff.exposed_to_service_role,
  case
    when ff.function_schema = 'private' then 'internal_service'
    when ff.function_signature in (
      'public.consume_case_report_delivery(text, text)',
      'public.verify_real_video_report_delivery(text, text)',
      'public.verify_video_report_public(text)'
    ) then 'public_delivery'
    when ff.function_signature in (
      'public.safesteps_can_admin_organisation(uuid, uuid)',
      'public.safesteps_can_manage_platform_tenant(uuid, uuid)',
      'public.safesteps_can_manage_community_services(uuid)',
      'public.safesteps_can_manage_ai_governance(uuid, uuid)',
      'public.safesteps_can_manage_ai_operations(uuid, uuid)',
      'public.safesteps_can_manage_ai_learning(uuid, uuid)',
      'public.safesteps_can_manage_ai_explainability(uuid, uuid)',
      'public.safesteps_can_manage_ai_prompt_workflow(uuid, uuid)',
      'public.safesteps_can_manage_ai_evaluation(uuid, uuid)',
      'public.safesteps_can_manage_ai_model_lifecycle(uuid, uuid)',
      'public.safesteps_can_manage_casework(uuid, uuid)',
      'public.can_manage_report_recipients(uuid)'
    ) then 'admin_only'
    when ff.function_signature in (
      'public.current_tenant_ids()',
      'public.has_tenant_access(uuid)',
      'public.has_permission(uuid, text)',
      'public.user_has_active_case_membership(uuid)',
      'public.user_has_case_role(uuid, text[])',
      'public.get_my_case_access_grant(uuid)',
      'public.has_case_access(uuid)',
      'public.can_view_case_note(uuid)',
      'public.safesteps_is_active_member(uuid, uuid)',
      'public.has_case_permission(uuid, uuid, text)',
      'public.has_resource_permission(uuid, text, uuid, text)',
      'public.safesteps_is_child_account_user_v20(uuid, uuid)',
      'public.safesteps_can_worker_access_child_v20(uuid, uuid)',
      'public.user_can_manage_child_private(uuid)',
      'public.user_can_view_child_private(uuid)',
      'public.child_case_id(uuid)',
      'public.can_access_video_report(uuid, text)',
      'public.has_active_video_report_authority(uuid, uuid, text)',
      'public.safesteps_can_access_case_v19(uuid, uuid)',
      'public.safesteps_can_access_community_referral(uuid, uuid)'
    ) then 'rls_helper'
    when ff.function_signature in (
      'public.prepare_case_report_delivery(uuid, uuid, uuid, integer, integer)',
      'public.request_case_report_export(uuid, uuid, uuid, text, text, integer)',
      'public.request_case_report_correction(uuid, uuid, text, text, boolean)',
      'public.decide_case_report_version(uuid, uuid, uuid, text, text)',
      'public.release_case_report_version(uuid, uuid, uuid, uuid, text)',
      'public.grant_parent_video_report_consent(uuid, text, text, timestamp with time zone)',
      'public.withdraw_parent_video_report_consent(uuid, text)',
      'public.acknowledge_video_report_delivery(uuid, text)'
    ) then 'authenticated_operation'
    when ff.return_type = 'trigger'
      or ff.function_name like 'reject_%'
      or ff.function_name like 'prevent_%'
      or ff.function_name like 'validate_%'
      or ff.function_name like 'sync_%'
      or ff.function_name like 'set_%'
    then 'internal_service'
    when ff.function_name in (
      'current_security_role',
      'current_user_id',
      'current_app_role',
      'current_assessment_app_role'
    ) then 'deprecated_candidate'
    when ff.exposed_to_authenticated then 'authenticated_operation'
    else 'internal_service'
  end as security_classification,
  case
    when ff.function_schema = 'private' then 'Service-owned execution only; keep browser callers out of this path.'
    when ff.function_signature in (
      'public.consume_case_report_delivery(text, text)',
      'public.verify_real_video_report_delivery(text, text)',
      'public.verify_video_report_public(text)'
    ) then 'Intentional anonymous delivery or verification surface with opaque-token validation and no broader data access.'
    when ff.function_signature in (
      'public.safesteps_can_admin_organisation(uuid, uuid)',
      'public.safesteps_can_manage_platform_tenant(uuid, uuid)',
      'public.safesteps_can_manage_community_services(uuid)',
      'public.safesteps_can_manage_ai_governance(uuid, uuid)',
      'public.safesteps_can_manage_ai_operations(uuid, uuid)',
      'public.safesteps_can_manage_ai_learning(uuid, uuid)',
      'public.safesteps_can_manage_ai_explainability(uuid, uuid)',
      'public.safesteps_can_manage_ai_prompt_workflow(uuid, uuid)',
      'public.safesteps_can_manage_ai_evaluation(uuid, uuid)',
      'public.safesteps_can_manage_ai_model_lifecycle(uuid, uuid)',
      'public.safesteps_can_manage_casework(uuid, uuid)',
      'public.can_manage_report_recipients(uuid)'
    ) then 'Admin-only helper: revoke browser execution and expose only through reviewed service or Edge Function paths.'
    when ff.function_signature in (
      'public.current_tenant_ids()',
      'public.has_tenant_access(uuid)',
      'public.has_permission(uuid, text)',
      'public.user_has_active_case_membership(uuid)',
      'public.user_has_case_role(uuid, text[])',
      'public.get_my_case_access_grant(uuid)',
      'public.has_case_access(uuid)',
      'public.can_view_case_note(uuid)',
      'public.safesteps_is_active_member(uuid, uuid)',
      'public.has_case_permission(uuid, uuid, text)',
      'public.has_resource_permission(uuid, text, uuid, text)',
      'public.safesteps_is_child_account_user_v20(uuid, uuid)',
      'public.safesteps_can_worker_access_child_v20(uuid, uuid)',
      'public.user_can_manage_child_private(uuid)',
      'public.user_can_view_child_private(uuid)',
      'public.child_case_id(uuid)',
      'public.can_access_video_report(uuid, text)',
      'public.has_active_video_report_authority(uuid, uuid, text)',
      'public.safesteps_can_access_case_v19(uuid, uuid)',
      'public.safesteps_can_access_community_referral(uuid, uuid)'
    ) then 'RLS helper: preserve dependent policies before changing grants or call signatures.'
    when ff.exposed_to_authenticated then 'Authenticated caller path; validate role, tenant, case, and child-private boundaries before browser exposure.'
    else 'Internal execution path or migration utility; do not expose without a documented access model.'
  end as access_model
from function_flags ff;

create or replace view safesteps_security.table_security_inventory as
with catalogued_tables as (
  select
    n.nspname as table_schema,
    c.relname as table_name,
    c.relrowsecurity as rls_enabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where c.relkind = 'r'
    and n.nspname in ('public', 'private')
),
table_columns as (
  select
    table_schema,
    table_name,
    bool_or(column_name = 'tenant_id') as has_tenant_id,
    bool_or(column_name = 'organisation_id') as has_organisation_id,
    bool_or(column_name = 'case_id') as has_case_id,
    bool_or(column_name = 'family_id') as has_family_id,
    bool_or(column_name in ('child_id', 'child_user_id', 'child_account_id', 'child_private_record_id')) as has_child_boundary,
    bool_or(column_name in ('user_id', 'profile_id', 'requested_by', 'created_by', 'recipient_user_id')) as has_user_owner
  from information_schema.columns
  where table_schema in ('public', 'private')
  group by table_schema, table_name
)
select
  ct.table_schema,
  ct.table_name,
  ct.rls_enabled,
  coalesce(tc.has_tenant_id, false) as has_tenant_id,
  coalesce(tc.has_organisation_id, false) as has_organisation_id,
  coalesce(tc.has_case_id, false) as has_case_id,
  coalesce(tc.has_family_id, false) as has_family_id,
  coalesce(tc.has_child_boundary, false) as has_child_boundary,
  coalesce(has_table_privilege('anon', format('%I.%I', ct.table_schema, ct.table_name), 'SELECT'), false) as anon_can_select,
  coalesce(has_table_privilege('authenticated', format('%I.%I', ct.table_schema, ct.table_name), 'SELECT'), false) as authenticated_can_select,
  case
    when ct.table_schema = 'private' then 'private_internal'
    when ct.table_name in (
      'users',
      'app_profiles',
      'user_profiles',
      'reunification_cases',
      'evidence',
      'evidence_items',
      'assessments',
      'case_allocations_v19',
      'case_plan_goals_v19',
      'case_plan_actions_v19',
      'user_roles',
      'security_roles',
      'security_permissions',
      'user_role_assignments',
      'platform_tenant_memberships',
      'casefiles'
    ) then 'deprecated_candidate'
    when ct.table_name in ('profiles', 'staff_profiles') then 'user_owned'
    when ct.table_name in (
      'families',
      'family_members',
      'households',
      'household_memberships',
      'family_relationships',
      'adult_participants',
      'parent_profiles'
    ) then 'family_scoped'
    when ct.table_name in (
      'children',
      'child_accounts',
      'child_profiles',
      'child_private_records',
      'child_record_safety_overrides'
    )
      or ct.table_name like 'child_%'
    then case
      when ct.table_name like '%_definitions'
        or ct.table_name in ('child_feeling_definitions', 'child_learning_games', 'child_achievement_definitions')
      then 'public_reference'
      else 'child_private'
    end
    when ct.table_name in (
      'platform_tenants',
      'tenant_memberships',
      'organisations',
      'organisation_units',
      'organisation_memberships',
      'platform_tenant_organisations',
      'worker_teams',
      'worker_team_memberships',
      'role_definitions',
      'permission_definitions',
      'role_assignments',
      'role_permissions'
    ) then case
      when ct.table_name like '%_definitions' then 'public_reference'
      else 'tenant_scoped'
    end
    when ct.table_name in (
      'cases',
      'case_participants',
      'case_allocations',
      'case_plans',
      'case_plan_goals',
      'case_plan_actions',
      'case_tasks',
      'case_status_history',
      'case_decision_records',
      'case_notes',
      'case_note_visibility_grants',
      'case_visit_records_v19',
      'case_transfer_records',
      'reports',
      'report_versions',
      'report_approvals',
      'report_recipients',
      'report_rendered_files',
      'report_withdrawals',
      'report_corrections',
      'case_report_release_events',
      'case_report_delivery_challenges',
      'case_report_delivery_attempts',
      'case_report_export_events',
      'documents',
      'document_analyses',
      'document_analysis_jobs',
      'document_analysis_runs',
      'case_documents',
      'case_document_versions',
      'case_document_review_events'
    ) then 'case_scoped'
    when ct.table_name in ('public_holidays')
      or ct.table_name like '%_definitions'
      or ct.table_name like '%_categories'
      or ct.table_name like '%_codes'
      or ct.table_name like '%_templates'
    then 'public_reference'
    when coalesce(tc.has_case_id, false) then 'case_scoped'
    when coalesce(tc.has_tenant_id, false) or coalesce(tc.has_organisation_id, false) then 'tenant_scoped'
    when coalesce(tc.has_family_id, false) then 'family_scoped'
    when coalesce(tc.has_child_boundary, false) then 'child_private'
    when coalesce(tc.has_user_owner, false) then 'user_owned'
    else 'private_internal'
  end as table_classification,
  case
    when ct.table_schema = 'private' then 'Service-only internal state; no client grants without a dedicated reviewed path.'
    when ct.table_name in ('profiles', 'staff_profiles') then 'Owner-readable identity records with tightly allowlisted self-service writes; privileged changes stay server-side.'
    when ct.table_name in (
      'families',
      'family_members',
      'households',
      'household_memberships',
      'family_relationships',
      'adult_participants',
      'parent_profiles'
    ) then 'Family-scoped records for directly related family participants and assigned staff only.'
    when ct.table_name in (
      'children',
      'child_accounts',
      'child_profiles',
      'child_private_records',
      'child_record_safety_overrides'
    )
      or ct.table_name like 'child_%'
    then case
      when ct.table_name like '%_definitions'
        or ct.table_name in ('child_feeling_definitions', 'child_learning_games', 'child_achievement_definitions')
      then 'Reference content remains read-mostly; never use it as a child-private write surface.'
      else 'Child-private or child-owned content: child self access and assigned safeguarding staff only, with parent access mediated through explicit share surfaces.'
    end
    when ct.table_name in (
      'cases',
      'case_participants',
      'case_allocations',
      'case_plans',
      'case_plan_goals',
      'case_plan_actions',
      'case_tasks',
      'case_status_history',
      'case_decision_records',
      'case_notes',
      'case_note_visibility_grants',
      'reports',
      'report_versions',
      'report_approvals',
      'report_recipients',
      'report_rendered_files',
      'report_withdrawals',
      'report_corrections',
      'case_report_release_events',
      'case_report_delivery_challenges',
      'case_report_delivery_attempts',
      'case_report_export_events'
    ) then 'Case-scoped records: require same-case membership, role-specific writes, and explicit cross-case denial.'
    when coalesce(tc.has_tenant_id, false) or coalesce(tc.has_organisation_id, false) then 'Tenant-scoped records: same-tenant access only unless an explicit auditable cross-tenant grant is added.'
    when ct.table_name in (
      'users',
      'app_profiles',
      'user_profiles',
      'reunification_cases',
      'evidence',
      'evidence_items',
      'assessments',
      'case_allocations_v19',
      'case_plan_goals_v19',
      'case_plan_actions_v19',
      'user_roles',
      'security_roles',
      'security_permissions',
      'user_role_assignments',
      'platform_tenant_memberships',
      'casefiles'
    ) then 'Deprecated or transitional table: preserve for compatibility and migrate deliberately rather than adding new policies or callers.'
    else 'Internal or reference table; document the intended audience before expanding grants or policies.'
  end as access_model
from catalogued_tables ct
left join table_columns tc
  on tc.table_schema = ct.table_schema
 and tc.table_name = ct.table_name;

create or replace view safesteps_security.policy_function_dependencies as
with policy_text as (
  select
    schemaname,
    tablename,
    policyname,
    coalesce(qual, '') || ' ' || coalesce(with_check, '') as policy_expression
  from pg_policies
  where schemaname = 'public'
)
select
  p.schemaname,
  p.tablename,
  p.policyname,
  fi.function_signature,
  fi.security_classification
from policy_text p
join safesteps_security.function_security_inventory fi
  on fi.function_schema = 'public'
 and p.policy_expression ~ format(
   '(^|[^a-zA-Z0-9_])%s\\s*\\(',
   pg_catalog.regexp_replace(
     fi.function_name,
     '([][(){}.*+?^$|\\-])',
     '\\\1',
     'g'
   )
 );

comment on view safesteps_security.function_security_inventory is
  'Security review inventory for public/private functions, including execute exposure, fixed search_path status and review classification.';
comment on view safesteps_security.table_security_inventory is
  'Security review inventory for public/private tables, including RLS, access-scope classification and intended access model notes.';
comment on view safesteps_security.policy_function_dependencies is
  'Best-effort mapping of public RLS policies to referenced helper functions to avoid unsafe grant changes.';

create or replace function public.can_access_video_report(
  target_parent_user_id uuid,
  requested_scope text default 'video_progress'::text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    (select auth.uid()) = target_parent_user_id
    or public.is_video_admin(array['super_admin'])
    or (
      exists (
        select 1
        from public.video_report_access_grants grant_row
        where grant_row.parent_user_id = target_parent_user_id
          and grant_row.reviewer_user_id = (select auth.uid())
          and grant_row.active is true
          and grant_row.expires_at > pg_catalog.now()
          and (
            grant_row.access_scope = requested_scope
            or grant_row.access_scope = 'video_progress_and_evidence'
          )
      )
      and public.has_active_video_report_authority(
        target_parent_user_id,
        (select auth.uid()),
        requested_scope
      )
    );
$function$;

revoke execute on function public.can_access_video_report(uuid, text)
  from public, anon;
grant execute on function public.can_access_video_report(uuid, text)
  to authenticated, service_role;

commit;
