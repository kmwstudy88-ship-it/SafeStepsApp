# Supabase Security Inventory

## Scope

- Source scanned: `supabase/migrations/*.sql` (232 migrations).
- Function owner values come from explicit `ALTER FUNCTION ... OWNER TO ...` statements; when absent, owner remains the migration execution role (typically `postgres`).
- Intended callers are derived from final `GRANT/REVOKE EXECUTE` state, policy references, and function comments when present.

## RLS Coverage Findings

- Tables with RLS enabled: **729**
- RLS-enabled tables with no remaining policies: **162**

### RLS-Enabled Tables Without Policies

- `public.activities`
- `public.adult_participants`
- `public.ai_backup_records`
- `public.ai_backup_restore_tests`
- `public.ai_budget_status_snapshots`
- `public.ai_canary_release_stages`
- `public.ai_canary_releases`
- `public.ai_candidate_model_build_reviews`
- `public.ai_candidate_model_builds`
- `public.ai_capacity_forecasts`
- `public.ai_change_approvals`
- `public.ai_change_evaluation_plans`
- `public.ai_change_post_release_reviews`
- `public.ai_change_release_decisions`
- `public.ai_change_rollback_plans`
- `public.ai_cost_allocations`
- `public.ai_cost_events`
- `public.ai_disaster_recovery_exercises`
- `public.ai_experiment_assignments`
- `public.ai_fallback_activations`
- `public.ai_improvement_scorecards`
- `public.ai_knowledge_supersession_records`
- `public.ai_longitudinal_quality_snapshots`
- `public.ai_machine_unlearning_actions`
- `public.ai_maintenance_execution_events`
- `public.ai_operational_incident_links`
- `public.ai_operational_readiness_reviews`
- `public.ai_operational_regions`
- `public.ai_ops_human_review_capacity_plans`
- `public.ai_ops_human_review_queue_snapshots`
- `public.ai_prompt_rollbacks`
- `public.ai_provider_concentration_snapshots`
- `public.ai_provider_service_measurements`
- `public.ai_provider_sla_assessments`
- `public.ai_runbook_executions`
- `public.ai_service_capacity_profiles`
- `public.ai_service_failover_events`
- `public.ai_service_failover_policies`
- `public.ai_service_fallback_configurations`
- `public.ai_shadow_comparison_results`
- `public.ai_shadow_deployments`
- `public.ai_workload_classes`
- `public.ai_workload_queue_snapshots`
- `public.assessment_behaviour_rating_items`
- `public.assessment_responses_structured`
- `public.assessment_score_overrides`
- `public.care_arrangements`
- `public.case_barriers`
- `public.case_legal_references`
- `public.case_note_visibility_grants`
- `public.case_orders`
- `public.case_reviews`
- `public.case_status_history`
- `public.case_strengths`
- `public.casefiles`
- `public.child_privacy_decisions`
- `public.child_record_shares`
- `public.collateral_report_records`
- `public.court_bundle_exhibits`
- `public.court_report_assessment_packages`
- `public.crisis_audit_events`
- `public.curriculum`
- `public.delegated_authorities`
- `public.direct_observation_sessions`
- `public.domestic_violence_indicators`
- `public.dynamic_risk_assessment_items`
- `public.emergency_access_events`
- `public.evidence_digital_signatures`
- `public.evidence_links`
- `public.evidence_record_categories`
- `public.evidence_retention_events`
- `public.evidence_retention_policies`
- `public.evidence_timeline_events`
- `public.evidence_upload_batches`
- `public.evidence_verifications`
- `public.family_address_links`
- `public.family_addresses`
- `public.family_contact_points`
- `public.family_relationship_history`
- `public.forensic_scores`
- `public.guardianship_records`
- `public.home_visit_records`
- `public.household_memberships`
- `public.learning_activities`
- `public.learning_activity_responses`
- `public.learning_assignments`
- `public.learning_badges`
- `public.learning_certificate_requirements`
- `public.learning_certificates`
- `public.learning_challenge_completions`
- `public.learning_challenge_evidence_requirements`
- `public.learning_competency_levels`
- `public.learning_competency_progress`
- `public.learning_completion_events`
- `public.learning_content_blocks`
- `public.learning_content_outcome_links`
- `public.learning_course_frameworks`
- `public.learning_course_modules`
- `public.learning_course_progress`
- `public.learning_cultural_profiles`
- `public.learning_daily_challenges`
- `public.learning_enrolment_goals`
- `public.learning_evidence_reviews`
- `public.learning_evidence_tasks`
- `public.learning_family_activities`
- `public.learning_interactive_activities`
- `public.learning_journal_entries`
- `public.learning_knowledge_check_items`
- `public.learning_knowledge_checks`
- `public.learning_lesson_activities`
- `public.learning_lesson_competencies`
- `public.learning_lesson_evidence_tasks`
- `public.learning_lesson_quizzes`
- `public.learning_lesson_reflections`
- `public.learning_lesson_scenarios`
- `public.learning_lesson_screens`
- `public.learning_lesson_videos`
- `public.learning_module_weeks`
- `public.learning_modules`
- `public.learning_monthly_programs`
- `public.learning_paths`
- `public.learning_pathway_items`
- `public.learning_program_courses`
- `public.learning_program_progress`
- `public.learning_progression_rules`
- `public.learning_quiz_answers`
- `public.learning_quiz_attempts`
- `public.learning_quiz_questions`
- `public.learning_quizzes`
- `public.learning_reflection_prompts`
- `public.learning_reflection_responses`
- `public.learning_scenario_steps`
- `public.learning_scenarios`
- `public.learning_screen_content_blocks`
- `public.learning_screen_progress`
- `public.learning_storybooks`
- `public.learning_video_lessons`
- `public.learning_video_segments`
- `public.learning_videos`
- `public.learning_week_lessons`
- `public.learning_weekly_missions`
- `public.learning_weeks`
- `public.longitudinal_outcome_snapshots`
- `public.mandatory_notifications`
- `public.parents`
- `public.permission_decision_logs`
- `public.progress`
- `public.report_jurisdiction_rules`
- `public.report_template_sections`
- `public.report_templates`
- `public.reunification_readiness_assessments_v17`
- `public.reunification_readiness_panels`
- `public.safety_escalations`
- `public.security_permissions`
- `public.security_roles`
- `public.static_risk_assessment_items`
- `public.temporary_access_grants`
- `public.user_role_assignments`
- `public.user_settings`
- `public.welfare_checks`
- `public.worker_team_memberships`
- `public.worker_teams`

## Public endpoints

- Count: **3**

| Signature | Owner | search_path | Intended callers | Referenced by RLS policies | Source migration |
|---|---|---|---|---|---|
| `public.consume_case_report_delivery(p_token text, p_code text)` | `not explicitly set (defaults to migration role)` | `''` | anon; authenticated; service_role | No | `20260824104936_harden_public_report_verification_rpcs.sql` |
| `public.verify_real_video_report_delivery(raw_delivery_token text, raw_verification_code text)` | `not explicitly set (defaults to migration role)` | `''` | anon; authenticated; service_role | No | `20260824104936_harden_public_report_verification_rpcs.sql` |
| `public.verify_video_report_public(verification_code_input text)` | `not explicitly set (defaults to migration role)` | `''` | anon; authenticated; service_role | No | `20260824104936_harden_public_report_verification_rpcs.sql` |

## Authenticated user operations

- Count: **18**

| Signature | Owner | search_path | Intended callers | Referenced by RLS policies | Source migration |
|---|---|---|---|---|---|
| `public.assert_program_start_gate(target_case_id uuid, target_user_id uuid, target_program_id text)` | `not explicitly set (defaults to migration role)` | `''` | authenticated | No | `20260730120000_parent_program_recommendation.sql` |
| `public.can_finalise_case_decision_v19(p_decision_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | authenticated | No | `20260721200806_case_management_platform_volume19.sql` |
| `public.can_transfer_case_v19(p_transfer_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | authenticated | No | `20260721200806_case_management_platform_volume19.sql` |
| `public.case_has_linked_professional(target_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | authenticated | No | `20260826160000_professional_link_status.sql` |
| `public.community_referral_needs_follow_up(p_referral_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | authenticated | No | `20260721230904_community_services_platform_volume21.sql` |
| `public.complete_case_intake(target_case_id uuid, target_assessment_id uuid, intake_answers jsonb, completed_section_count integer, total_section_count integer)` | `not explicitly set (defaults to migration role)` | `''` | authenticated | No | `20260730120000_parent_program_recommendation.sql` |
| `public.complete_parent_intake(target_case_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated | No | `20260729104323_parent_intake_save_resume.sql` |
| `public.confirm_program_recommendation(target_case_id uuid, target_program_id text)` | `not explicitly set (defaults to migration role)` | `''` | authenticated | No | `20260730120000_parent_program_recommendation.sql` |
| `public.ensure_parent_intake_case()` | `not explicitly set (defaults to migration role)` | `''` | authenticated | No | `20260729104323_parent_intake_save_resume.sql` |
| `public.get_child_case_share_context(target_child_user_id uuid default auth.uid())` | `not explicitly set (defaults to migration role)` | `not set` | authenticated | No | `20260808031500_child_v1_share_context.sql` |
| `public.get_my_case_access_grant(target_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | authenticated | No | `20260715120000_sensitive_access_control_and_audit.sql` |
| `public.has_active_video_report_authority(target_parent_user_id uuid, target_user_id uuid, requested_scope text)` | `not explicitly set (defaults to migration role)` | `not set` | authenticated; service_role | No | `20260810124612_baseline_video_report_authority_helpers.sql` |
| `public.prepare_case_report_delivery(p_case_id uuid, p_release_event_id uuid, p_recipient_id uuid, p_expires_minutes integer default 60, p_max_downloads integer default 1)` | `not explicitly set (defaults to migration role)` | `public` | authenticated | No | `20260810043929_qualify_report_delivery_pgcrypto_calls.sql` |
| `public.review_case_intake(target_case_id uuid, next_reviewer_state text, next_reviewer_notes text default null)` | `not explicitly set (defaults to migration role)` | `public` | authenticated | No | `20260715140000_intake_program_start_gate.sql` |
| `public.save_co_occurring_assessment_v1(target_case_id uuid, target_stream text, target_subject_reference text, target_responses jsonb, target_response_notes jsonb, target_metadata jsonb)` | `not explicitly set (defaults to migration role)` | `public` | authenticated | No | `20260827090000_co_occurring_aod_mh_dfv_instrument.sql` |
| `public.save_parent_intake_step(target_case_id uuid, section_key text, section_answers jsonb, section_complete boolean, next_section_key text)` | `not explicitly set (defaults to migration role)` | `''` | authenticated | No | `20260729104323_parent_intake_save_resume.sql` |
| `public.start_program_enrollment(target_case_id uuid, target_program_id text)` | `not explicitly set (defaults to migration role)` | `public` | authenticated | No | `20260715140000_intake_program_start_gate.sql` |
| `public.withdraw_parent_video_report_consent(target_authority_id uuid, withdrawal_reason text)` | `not explicitly set (defaults to migration role)` | `''` | authenticated | No | `20260810132514_preserve_video_report_consent_withdrawal_reason.sql` |

## Admin-only functions

- Count: **0**

_None._

## RLS helper functions

- Count: **58**

| Signature | Owner | search_path | Intended callers | Referenced by RLS policies | Source migration |
|---|---|---|---|---|---|
| `public.can_access_video_report(target_parent_user_id uuid, requested_scope text default 'video_progress'::text)` | `not explicitly set (defaults to migration role)` | `not set` | authenticated; service_role; RLS policy engine | 8 (public.video_report_attestations:video_report_attestations_select; public.video_report_dispute_responses:video_report_dispute_responses_select …) | `20260810124612_baseline_video_report_authority_helpers.sql` |
| `public.can_manage_case(p_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 3 (public.case_participants:Case participants manageable; public.case_plans:Case plans manageable …) | `202607220037_case_access_functions.sql` |
| `public.can_manage_evidence(p_evidence_record_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 2 (public.evidence_files:Evidence files manageable; public.evidence_records:Evidence records manageable) | `202607220072_evidence_access.sql` |
| `public.can_manage_family(p_tenant_id uuid, p_family_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 4 (public.families:Families manageable by authorised users; public.family_members:Family members manageable by authorised users …) | `202607220013_family_foundation_functions.sql` |
| `public.can_manage_report_recipients(target_report_id uuid)` | `not explicitly set (defaults to migration role)` | `not set` | authenticated; service_role; RLS policy engine | 1 (public.report_recipients:report_recipients_user_read) | `20260811060802_fix_report_recipient_rls_recursion.sql` |
| `public.can_manage_safety(p_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 9 (public.child_disclosures:Child disclosures createable by safety users; public.crisis_events:Crisis events manageable …) | `202607220057_safety_access.sql` |
| `public.can_read_report(p_report_id uuid, p_user_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 15 (public.report_approvals:report_approvals_read; public.report_claim_evidence_links:report_claim_evidence_links_read …) | `20260810024925_bind_report_access_helpers_to_session.sql` |
| `public.can_review_child_disclosure(p_disclosure_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 1 (public.child_disclosures:Child disclosures restricted readable) | `202607220057_safety_access.sql` |
| `public.can_review_weapon_detection(p_detection_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 1 (public.weapon_risk_detections:Weapon detections reviewable) | `202607220057_safety_access.sql` |
| `public.can_view_case_note(p_case_note_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 1 (public.case_notes:Case notes readable) | `202607220037_case_access_functions.sql` |
| `public.can_write_report(p_report_id uuid, p_user_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 2 (public.report_claims:report_claims_write; public.report_versions:report_versions_author_insert) | `20260810024925_bind_report_access_helpers_to_session.sql` |
| `public.case_visible_to_current_user(target_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 16 (public.analyses:analyses_case_access; public.audit_logs:audit_logs_insert_only …) | `20260911074000_backend_case_infrastructure.sql` |
| `public.child_case_id(target_child_user_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 3 (public.child_requests:child_requests_select; public.child_requests:child_requests_update …) | `20260810032248_authorize_child_private_lookup_helpers.sql` |
| `public.current_app_user_id()` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 6 (public.audit_logs:audit_logs_insert_only; public.audit_logs:audit_logs_read_by_case_access …) | `20260911074000_backend_case_infrastructure.sql` |
| `public.current_role_key()` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 7 (public.audit_logs:audit_logs_read_by_case_access; public.case_assignments:case_assignments_manage_by_supervisors …) | `20260911074000_backend_case_infrastructure.sql` |
| `public.current_security_role()` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 2 (public.co_occurring_person_using_violence_assessments:co_occurring_puv_authorised_select; public.co_occurring_victim_survivor_assessments:co_occurring_vs_authorised_select) | `20260715120000_sensitive_access_control_and_audit.sql` |
| `public.current_user_can_view_program(target_program_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 15 (public.certificates:certificates_select; public.certificates:certificates_write_staff …) | `20260629195506_bulk_platform_tables.sql` |
| `public.current_user_has_role(role_name text)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 156 (public.app_profiles:app_profiles_select; public.assessment_evidence_maps:Assessment evidence maps linked record access …) | `20260629195506_bulk_platform_tables.sql` |
| `public.has_case_access(p_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 7 (public.case_allocations:Case allocations readable; public.case_participants:Case participants readable …) | `202607220037_case_access_functions.sql` |
| `public.has_case_permission(p_user_id uuid, p_case_id uuid, p_permission_code text)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 8 (public.case_participants:case_participants_case_read; public.case_transfers:case_transfers_case_authorised_insert …) | `20260810031816_bind_ai_casework_helpers_to_session.sql` |
| `public.has_evidence_access(p_evidence_record_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 8 (public.evidence_ai_analyses:Evidence AI analysis readable; public.evidence_chain_of_custody:Evidence chain appendable …) | `202607220072_evidence_access.sql` |
| `public.has_permission(p_tenant_id uuid, p_permission_code text)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 35 (public.audit_events:Tenant audit readable by authorised users; public.case_allocations:Case allocations manageable …) | `202607220008_tenant_context.sql` |
| `public.has_resource_permission(p_user_id uuid, p_resource_type text, p_resource_id uuid, p_permission_code text)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 13 (public.ai_contestability_service_levels:AI contestability service levels managed by global explainability admins; public.ai_evaluation_audit_events:AI evaluation audit readable by evaluation admins …) | `20260810030254_bind_case_permission_child_access_helpers_to_session.sql` |
| `public.has_role(p_tenant_id uuid, p_role_code text, p_scope_type text default null, p_scope_reference uuid default null)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 1 (public.platform_tenants:Tenant administrators can manage tenants) | `202607220008_tenant_context.sql` |
| `public.has_safety_access(p_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 17 (public.ai_risk_signals:AI risk signals readable; public.crisis_events:Crisis events readable …) | `202607220057_safety_access.sql` |
| `public.has_tenant_access(p_tenant_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 4 (public.organisations:Tenant members can read organisations; public.platform_tenants:Tenant members can read tenants …) | `202607220008_tenant_context.sql` |
| `public.is_active_guardian(p_child_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 1 (public.children:Children identity readable by authorised users) | `202607220013_family_foundation_functions.sql` |
| `public.is_case_supervisor(p_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 1 (public.case_notes:Case notes insertable by workers) | `202607220037_case_access_functions.sql` |
| `public.is_case_team_member(p_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 1 (public.case_notes:Case notes insertable by workers) | `202607220037_case_access_functions.sql` |
| `public.is_case_worker(p_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 1 (public.case_notes:Case notes insertable by workers) | `202607220037_case_access_functions.sql` |
| `public.is_child_subject(p_child_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 5 (public.child_privacy_settings:Child privacy manageable; public.child_privacy_settings:Child privacy readable …) | `202607220013_family_foundation_functions.sql` |
| `public.is_family_member(p_family_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 4 (public.families:Families readable by tenant or family access; public.family_members:Family members readable by authorised users …) | `202607220013_family_foundation_functions.sql` |
| `public.safesteps_auth_profile_id()` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 8 (public.assessment_records:parent_manage_own_assessment_records; public.contact_sessions:parent_read_contact_sessions …) | `20260721084500_reunification_role_rls_policies.sql` |
| `public.safesteps_auth_role()` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 20 (public.achievements:admin_manage_achievements; public.assessment_records:caseworker_read_case_assessment_records …) | `20260721084500_reunification_role_rls_policies.sql` |
| `public.safesteps_can_access_case_v19(p_user_id uuid, p_case_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 18 (public.case_allocation_history_v19:Case allocation history records; public.case_allocations_v19:Case operational records …) | `20260810030254_bind_case_permission_child_access_helpers_to_session.sql` |
| `public.safesteps_can_access_community_referral(p_user_id uuid, p_referral_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 8 (public.community_referral_barriers:Community referral barrier access; public.community_referral_bookings:Community referral booking access …) | `20260810031203_bind_organisation_tenant_community_helpers_to_session.sql` |
| `public.safesteps_can_access_platform_tenant_config(p_user_id uuid, p_tenant_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 27 (public.platform_branding_profiles:Platform branding profiles accessible; public.platform_cross_tenant_access_grants:Platform tenant access grants accessible …) | `20260810031203_bind_organisation_tenant_community_helpers_to_session.sql` |
| `public.safesteps_can_admin_organisation(p_user_id uuid, p_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 4 (public.access_review_campaigns:access_review_campaigns_admin_read; public.access_review_items:access_review_items_reviewer_read …) | `20260810031203_bind_organisation_tenant_community_helpers_to_session.sql` |
| `public.safesteps_can_manage_ai_evaluation(p_user_id uuid, p_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 34 (public.ai_accessibility_evaluations:AI accessibility evaluations managed through run; public.ai_calibration_assessments:AI calibration managed through run …) | `20260810031816_bind_ai_casework_helpers_to_session.sql` |
| `public.safesteps_can_manage_ai_explainability(p_user_id uuid, p_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 48 (public.ai_accessibility_variants:AI accessibility variants managed through version; public.ai_accessibility_versions:AI accessibility versions managed through version …) | `20260810031816_bind_ai_casework_helpers_to_session.sql` |
| `public.safesteps_can_manage_ai_governance(p_user_id uuid, p_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 16 (public.ai_governance_audit_events:AI audit events readable by auditors; public.ai_governance_bodies:AI governance bodies managed by AI governance admins …) | `20260810031816_bind_ai_casework_helpers_to_session.sql` |
| `public.safesteps_can_manage_ai_learning(p_user_id uuid, p_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 57 (public.ai_change_deployment_gates:AI change gates managed through request; public.ai_change_impact_assessments:AI change impact assessments managed through request …) | `20260810031816_bind_ai_casework_helpers_to_session.sql` |
| `public.safesteps_can_manage_ai_model_lifecycle(p_user_id uuid, p_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 24 (public.ai_data_eligibility_rules:AI data eligibility rules managed by lifecycle admins; public.ai_hosting_decisions:AI hosting decisions managed through use case …) | `20260810031816_bind_ai_casework_helpers_to_session.sql` |
| `public.safesteps_can_manage_ai_operations(p_user_id uuid, p_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 64 (public.ai_alert_groups:AI alert groups managed by operations admins; public.ai_alert_routing_rules:AI alert routing rules managed by operations admins …) | `20260810031816_bind_ai_casework_helpers_to_session.sql` |
| `public.safesteps_can_manage_ai_prompt_workflow(p_user_id uuid, p_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 35 (public.ai_context_items:AI context items managed through package; public.ai_context_packages:AI context packages managed through run or request …) | `20260810031816_bind_ai_casework_helpers_to_session.sql` |
| `public.safesteps_can_manage_casework(p_user_id uuid, p_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 11 (public.case_operational_audit_events:Case operational audit appendable; public.case_operational_audit_events:Case operational audit readable …) | `20260810031816_bind_ai_casework_helpers_to_session.sql` |
| `public.safesteps_can_manage_community_services(p_user_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 25 (public.community_provider_contacts:Community provider contacts managed; public.community_provider_locations:Community provider locations managed …) | `20260810031203_bind_organisation_tenant_community_helpers_to_session.sql` |
| `public.safesteps_can_manage_platform_tenant(p_user_id uuid, p_tenant_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 35 (public.platform_billing_events:Platform billing events accessible; public.platform_branding_profiles:Platform branding profiles accessible …) | `20260810031203_bind_organisation_tenant_community_helpers_to_session.sql` |
| `public.safesteps_can_worker_access_child_v20(p_user_id uuid, p_child_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 20 (public.child_accounts:Child v20 accounts; public.child_advocacy_requests:Child v20 advocacy access …) | `20260810030254_bind_case_permission_child_access_helpers_to_session.sql` |
| `public.safesteps_has_case_access(target_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 26 (public.assessment_records:caseworker_read_case_assessment_records; public.assessment_records:facilitator_manage_case_assessment_records …) | `20260721084500_reunification_role_rls_policies.sql` |
| `public.safesteps_is_active_member(target_user_id uuid, target_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 5 (public.case_referrals:Case management referrals; public.families:families_member_read …) | `20260810031203_bind_organisation_tenant_community_helpers_to_session.sql` |
| `public.safesteps_is_ai_governance_member(p_user_id uuid, p_governance_body_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 2 (public.ai_governance_bodies:AI governance bodies readable by admins or members; public.ai_governance_memberships:AI governance memberships readable by body members) | `20260810031816_bind_ai_casework_helpers_to_session.sql` |
| `public.safesteps_is_child_account_user_v20(p_user_id uuid, p_child_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 16 (public.child_advocacy_requests:Child v20 advocacy access; public.child_body_map_responses:Child v20 child-owned records body maps …) | `20260810030254_bind_case_permission_child_access_helpers_to_session.sql` |
| `public.user_can_manage_child_private(target_child_user_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 15 (public.child_achievements:child_achievements_insert; public.child_evidence:child_evidence_insert …) | `20260810032248_authorize_child_private_lookup_helpers.sql` |
| `public.user_can_view_child_private(target_child_user_id uuid)` | `not explicitly set (defaults to migration role)` | `''` | authenticated; service_role; RLS policy engine | 8 (public.child_achievements:child_achievements_select; public.child_evidence:child_evidence_select …) | `20260810032248_authorize_child_private_lookup_helpers.sql` |
| `public.user_has_active_case_membership(target_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 30 (public.assessment_records:assessment_records_select; public.case_document_review_events:case_document_review_events_insert …) | `20260715120000_sensitive_access_control_and_audit.sql` |
| `public.user_has_active_child_record_share(target_record_id uuid)` | `not explicitly set (defaults to migration role)` | `not set` | authenticated; service_role; RLS policy engine | 1 (public.child_private_records:child_private_record_shared_read) | `20260811060851_fix_child_private_share_policy_privilege.sql` |
| `public.user_has_case_role(target_case_id uuid, allowed_roles text[])` | `not explicitly set (defaults to migration role)` | `public` | RLS policy engine | 51 (public.assessment_records:assessment_records_insert; public.assessment_records:assessment_records_select …) | `20260715120000_sensitive_access_control_and_audit.sql` |

## Internal service functions

- Count: **14**

| Signature | Owner | search_path | Intended callers | Referenced by RLS policies | Source migration |
|---|---|---|---|---|---|
| `private.guard_personal_ai_family_memory()` | `not explicitly set (defaults to migration role)` | `pg_catalog,public,private` | no direct EXECUTE grant (trigger/internal only) | No | `20260823231258_controlled_family_memory.sql` |
| `private.purge_expired_personal_ai_records()` | `not explicitly set (defaults to migration role)` | `pg_catalog, public, private` | service_role | No | `20260823223509_personal_ai_support_persistence.sql` |
| `public.acknowledge_video_report_delivery(target_delivery_id uuid, acknowledgement_text text)` | `not explicitly set (defaults to migration role)` | `''` | no direct EXECUTE grant (trigger/internal only) | No | `20260810002517_enforce_video_delivery_acknowledgement_authorization.sql` |
| `public.apply_case_risk_workflow(p_case_id uuid, p_actor_user_id uuid, p_event_type text default null, p_event_source text default 'manual_note', p_event_note text default null, p_event_payload jsonb default '{}'::jsonb, p_event_idempotency_key text default null, p_snapshot jsonb default '{}'::jsonb, p_alerts jsonb default '[]'::jsonb, p_tasks jsonb default '[]'::jsonb, p_audit jsonb default '[]'::jsonb)` | `not explicitly set (defaults to migration role)` | `public` | service_role | No | `20260911230000_track_c_risk_case_updates.sql` |
| `public.bootstrap_platform_tenant(p_tenant_reference text, p_tenant_slug text, p_tenant_name text, p_owner_user_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | service_role | No | `202607220011_foundation_seed.sql` |
| `public.claim_document_analysis_jobs(p_worker_id text, p_limit integer default 1)` | `not explicitly set (defaults to migration role)` | `''` | service_role | No | `20260911173000_document_intelligence_pipeline.sql` |
| `public.current_user_id()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `202607220008_tenant_context.sql` |
| `public.generate_family_reference()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `202607220013_family_foundation_functions.sql` |
| `public.prevent_audit_log_mutation()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260911074000_backend_case_infrastructure.sql` |
| `public.prevent_case_event_mutation()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260911230000_track_c_risk_case_updates.sql` |
| `public.prevent_released_report_mutation()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721121000_identity_roles_permissions_reporting_foundation.sql` |
| `public.prevent_risk_snapshot_mutation()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260911230000_track_c_risk_case_updates.sql` |
| `public.reject_sensitive_audit_mutation()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260715120000_sensitive_access_control_and_audit.sql` |
| `public.validate_family_member_tenant()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `202607220013_family_foundation_functions.sql` |

## Deprecated candidates

- Count: **55**

| Signature | Owner | search_path | Intended callers | Referenced by RLS policies | Source migration |
|---|---|---|---|---|---|
| `public.ai_change_request_open_blocking_gate_count(p_change_request_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721173335_ai_continuous_learning_change_management_volume10.sql` |
| `public.ai_continuous_evaluation_overdue_count(p_organisation_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721173335_ai_continuous_learning_change_management_volume10.sql` |
| `public.ai_knowledge_change_requires_revalidation(p_knowledge_base_version_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721173335_ai_continuous_learning_change_management_volume10.sql` |
| `public.ai_learning_has_blocking_governance_finding(p_subject_type text, p_subject_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721173335_ai_continuous_learning_change_management_volume10.sql` |
| `public.ai_learning_workflow_ready_for_governance(p_workflow_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721173335_ai_continuous_learning_change_management_volume10.sql` |
| `public.ai_model_retirement_required(p_model_version_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721173335_ai_continuous_learning_change_management_volume10.sql` |
| `public.audit_assessment_edit_after_update()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260715121500_sensitive_action_audit_triggers.sql` |
| `public.audit_evidence_upload_after_insert()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260715121500_sensitive_action_audit_triggers.sql` |
| `public.audit_row_change()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `202607220009_audit_foundation.sql` |
| `public.bind_single_case_before_insert()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260715121500_sensitive_action_audit_triggers.sql` |
| `public.can_activate_platform_tenant_feature(p_feature_flag_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721232009_white_label_multi_tenant_platform_volume23.sql` |
| `public.can_approve_ai_change_request(p_change_request_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721173335_ai_continuous_learning_change_management_volume10.sql` |
| `public.can_close_case_v19(p_closure_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721200806_case_management_platform_volume19.sql` |
| `public.can_close_child_support_request(p_request_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721205718_child_experience_platform_volume20.sql` |
| `public.can_close_community_referral(p_referral_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721230904_community_services_platform_volume21.sql` |
| `public.can_complete_child_lesson(p_session_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721205718_child_experience_platform_volume20.sql` |
| `public.can_complete_learning_challenge(p_assignment_id uuid, p_user_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721184924_parenting_child_development_learning_engine_volume16.sql` |
| `public.can_complete_learning_course(p_enrolment_id uuid, p_course_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721190229_parenting_child_development_learning_engine_volume16_completion.sql` |
| `public.can_complete_learning_lesson(p_lesson_attempt_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721190229_parenting_child_development_learning_engine_volume16_completion.sql` |
| `public.can_delete_platform_tenant(p_deletion_request_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721232009_white_label_multi_tenant_platform_volume23.sql` |
| `public.can_export_ai_learning_data(p_dataset_change_set_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721174116_ai_continuous_learning_volume10_completion.sql` |
| `public.can_export_court_assessment_package(p_package_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721192516_assessment_evidence_reunification_framework_volume17.sql` |
| `public.can_export_evidence(p_evidence_record_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `202607220072_evidence_access.sql` |
| `public.can_export_platform_tenant_data(p_export_request_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721232009_white_label_multi_tenant_platform_volume23.sql` |
| `public.can_finalize_assessment_record(p_assessment_record_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721192516_assessment_evidence_reunification_framework_volume17.sql` |
| `public.can_include_ai_learning_candidate(p_candidate_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721173335_ai_continuous_learning_change_management_volume10.sql` |
| `public.can_include_item_in_ai_dataset(p_dataset_change_item_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721174116_ai_continuous_learning_volume10_completion.sql` |
| `public.can_issue_learning_certificate(p_requirement_id uuid, p_user_id uuid, p_enrolment_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721184924_parenting_child_development_learning_engine_volume16.sql` |
| `public.can_issue_structured_learning_certificate(p_enrolment_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721190229_parenting_child_development_learning_engine_volume16_completion.sql` |
| `public.can_operationally_activate_ai_service(p_service_id uuid, p_deployment_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721180934_ai_operations_centre_reliability_service_management_volume11.sql` |
| `public.can_override_child_sharing_for_safety(p_child_id uuid, p_source_type text, p_source_reference text)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721205718_child_experience_platform_volume20.sql` |
| `public.can_publish_learning_lesson(p_lesson_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721190229_parenting_child_development_learning_engine_volume16_completion.sql` |
| `public.can_release_ai_deployment(p_assurance_package_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721164446_ai_evaluation_validation_release_assurance_volume5.sql` |
| `public.can_release_ai_explanation(p_explanation_version_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721170458_ai_explainability_contestability_volume6_completion.sql` |
| `public.can_release_ai_learning_change(p_change_request_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721173335_ai_continuous_learning_change_management_volume10.sql` |
| `public.can_rely_on_reunification_readiness(p_readiness_assessment_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721192516_assessment_evidence_reunification_framework_volume17.sql` |
| `public.can_retire_ai_model_version(p_model_version_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721174116_ai_continuous_learning_volume10_completion.sql` |
| `public.can_route_ai_workload(p_service_id uuid, p_workload_class_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721180934_ai_operations_centre_reliability_service_management_volume11.sql` |
| `public.can_send_community_referral(p_referral_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721230904_community_services_platform_volume21.sql` |
| `public.can_share_child_content(p_child_id uuid, p_source_type text, p_source_reference text, p_recipient_type text, p_recipient_reference text)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721205718_child_experience_platform_volume20.sql` |
| `public.can_start_ai_canary_release(p_canary_release_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721174116_ai_continuous_learning_volume10_completion.sql` |
| `public.can_use_ai_learning_personalisation(p_profile_id uuid, p_user_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721184924_parenting_child_development_learning_engine_volume16.sql` |
| `public.case_setup_ready_for_program(target_case_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260715140000_intake_program_start_gate.sql` |
| `public.enforce_program_enrollment_gate()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260715140000_intake_program_start_gate.sql` |
| `public.handle_new_auth_user()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `202607220004_profiles.sql` |
| `public.is_ai_cost_centre_within_limit(p_cost_centre_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721180934_ai_operations_centre_reliability_service_management_volume11.sql` |
| `public.is_online_learning_permitted(p_deployment_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721174116_ai_continuous_learning_volume10_completion.sql` |
| `public.profile_ready_for_program(target_user_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260715140000_intake_program_start_gate.sql` |
| `public.record_case_status_change()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `202607220030_case_status_history.sql` |
| `public.should_activate_ai_fallback(p_service_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721180934_ai_operations_centre_reliability_service_management_volume11.sql` |
| `public.should_block_ai_experiment(p_experiment_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721173335_ai_continuous_learning_change_management_volume10.sql` |
| `public.should_escalate_child_request(p_request_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721205718_child_experience_platform_volume20.sql` |
| `public.should_pause_ai_output_reliance(p_output_lineage_record_id uuid)` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260721170458_ai_explainability_contestability_volume6_completion.sql` |
| `public.validate_parent_child_message_case()` | `not explicitly set (defaults to migration role)` | `public` | no direct EXECUTE grant (trigger/internal only) | No | `20260715121500_sensitive_action_audit_triggers.sql` |
| `safesteps_private.advance_case_document_version()` | `not explicitly set (defaults to migration role)` | `''` | no direct EXECUTE grant (trigger/internal only) | No | `20260730190000_final_backend_integration.sql` |

## Notes

- Functions are assigned to one primary group for triage even when they can fit multiple categories.
- `RLS helper functions` are those referenced by policy predicates in `CREATE POLICY` statements in migration history.
