# Supabase security hardening review (September 2026)

## Inventory

### Function inventory approach

- Canonical schema authority reviewed first: `docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md`.
- New live-review inventory views are added in `safesteps_security`:
  - `function_security_inventory`
  - `table_security_inventory`
  - `policy_function_dependencies`

### Function classifications reviewed in this change set

| Classification | Functions |
| --- | --- |
| `public_delivery` | `public.consume_case_report_delivery(text, text)`, `public.verify_real_video_report_delivery(text, text)`, `public.verify_video_report_public(text)` |
| `authenticated_operation` | `public.prepare_case_report_delivery(uuid, uuid, uuid, integer, integer)`, `public.request_case_report_export(uuid, uuid, uuid, text, text, integer)`, `public.request_case_report_correction(uuid, uuid, text, text, boolean)`, `public.decide_case_report_version(uuid, uuid, uuid, text, text)`, `public.release_case_report_version(uuid, uuid, uuid, uuid, text)`, `public.grant_parent_video_report_consent(uuid, text, text, timestamp with time zone)`, `public.withdraw_parent_video_report_consent(uuid, text)`, `public.acknowledge_video_report_delivery(uuid, text)` |
| `admin_only` | `public.safesteps_can_admin_organisation(uuid, uuid)`, `public.safesteps_can_manage_platform_tenant(uuid, uuid)`, `public.safesteps_can_manage_community_services(uuid)`, `public.safesteps_can_manage_ai_governance(uuid, uuid)`, `public.safesteps_can_manage_ai_operations(uuid, uuid)`, `public.safesteps_can_manage_ai_learning(uuid, uuid)`, `public.safesteps_can_manage_ai_explainability(uuid, uuid)`, `public.safesteps_can_manage_ai_prompt_workflow(uuid, uuid)`, `public.safesteps_can_manage_ai_evaluation(uuid, uuid)`, `public.safesteps_can_manage_ai_model_lifecycle(uuid, uuid)`, `public.safesteps_can_manage_casework(uuid, uuid)`, `public.can_manage_report_recipients(uuid)` |
| `rls_helper` | `public.current_tenant_ids()`, `public.has_tenant_access(uuid)`, `public.has_permission(uuid, text)`, `public.user_has_active_case_membership(uuid)`, `public.user_has_case_role(uuid, text[])`, `public.get_my_case_access_grant(uuid)`, `public.has_case_access(uuid)`, `public.can_view_case_note(uuid)`, `public.safesteps_is_active_member(uuid, uuid)`, `public.has_case_permission(uuid, uuid, text)`, `public.has_resource_permission(uuid, text, uuid, text)`, `public.safesteps_is_child_account_user_v20(uuid, uuid)`, `public.safesteps_can_worker_access_child_v20(uuid, uuid)`, `public.user_can_manage_child_private(uuid)`, `public.user_can_view_child_private(uuid)`, `public.child_case_id(uuid)`, `public.can_access_video_report(uuid, text)`, `public.has_active_video_report_authority(uuid, uuid, text)` |
| `internal_service` / `deprecated_candidate` | Derived live from the inventory views for private-schema functions, trigger helpers, and transitional helpers |

### Table classifications reviewed in this change set

| Classification | Representative tables |
| --- | --- |
| `user_owned` | `profiles`, `staff_profiles` |
| `tenant_scoped` | `platform_tenants`, `tenant_memberships`, `organisations`, `organisation_memberships`, `worker_teams`, `worker_team_memberships`, `role_assignments` |
| `case_scoped` | `cases`, `reports`, `report_versions`, `report_approvals`, `report_recipients`, `case_report_release_events`, `case_report_delivery_challenges`, `case_report_export_events`, `case_documents`, `documents`, `document_analysis_runs` |
| `family_scoped` | `families`, `family_members`, `households`, `household_memberships`, `family_relationships`, `adult_participants`, `parent_profiles` |
| `child_private` | `child_private_records`, `child_record_safety_overrides`, `child_accounts`, `child_profiles`, non-reference `child_*` records |
| `public_reference` | `role_definitions`, `permission_definitions`, `child_feeling_definitions`, `child_learning_games`, `child_achievement_definitions`, `*_definitions`, `*_categories`, `*_codes`, `*_templates` |
| `private_internal` | private-schema service tables and uncategorised internal operational tables |
| `deprecated_candidate` | `users`, `reunification_cases`, `evidence`, `evidence_items`, `assessments`, `user_roles`, `security_roles`, `security_permissions`, `user_role_assignments`, `platform_tenant_memberships`, `casefiles` |

## Migrations

### Added

- `supabase/migrations/20260915105500_security_inventory_and_video_helper_hardening.sql`

### What it does

1. Adds reviewable inventory views for functions, tables, and policy/helper dependencies.
2. Documents the intended access model in-database before any new policy expansion.
3. Re-hardens retained `SECURITY DEFINER` helper `public.can_access_video_report(uuid, text)` with:
   - fixed `search_path = ''`
   - fully qualified object references
   - no broadened grants

## Database tests

### Added

- `supabase/tests/volume_06_security_hardening.sql`
- `supabase/functions/case-report-governance/handler.test.mjs`

### Coverage

- anonymous access stays limited to the three preserved public-delivery RPCs
- authenticated users do not receive `admin_only` helper execution
- `service_role` retains explicit admin-helper execution
- child-private helper dependencies are inventoried before grant changes
- parent, child, worker, supervisor, administrator, cross-tenant, cross-case, and child-private boundaries are asserted through pgTAP metadata checks
- Edge Function routing coverage checks `decide_version`, `release_version`, and unsupported-action rejection for `case-report-governance`

## Edge Functions

### Added

- `supabase/functions/case-report-governance/index.ts`

### Purpose

- Moves privileged report-governance mutations behind an authenticated Edge Function instead of direct browser RPC usage.
- Supported actions:
  - `decide_version`
  - `release_version`

### Security notes

- requires authenticated caller context
- uses the caller session when invoking database RPCs
- keeps service secrets server-side
- rejects unsupported actions and disallowed origins

## Unresolved warnings

1. Several legacy `SECURITY DEFINER` helpers still use older `search_path = public` conventions outside the narrowly hardened video helper in this change set; they should be reviewed incrementally with policy dependency checks from `safesteps_security.policy_function_dependencies`.
2. Existing Edge Functions such as `audit-log-entry`, `escalate-risk`, and `process-uploaded-document` remain worth a follow-up audit for actor-field trust and origin restrictions, but were left unchanged here to keep this PR incremental.
3. This change set documents intended access models but does not add new permissive policies.

## Deployment prerequisites

1. Apply migrations in order in a non-production environment first.
2. Run the Supabase pgTAP contract tests, including `supabase/tests/volume_06_security_hardening.sql`.
3. Update application callers to use the new `case-report-governance` Edge Function before considering any future direct-RPC revokes for those privileged report operations.
4. Review inventory output from `safesteps_security.function_security_inventory` and `safesteps_security.table_security_inventory` against the target environment before additional privilege changes.

## Rollback notes

1. Drop the `safesteps_security` views and schema only if reverting the inventory layer intentionally.
2. Restore the previous `public.can_access_video_report(uuid, text)` body if a rollback requires the prior helper definition.
3. Remove the `case-report-governance` Edge Function from the deployment set if clients must revert to the earlier direct RPC path.
