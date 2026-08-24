create policy deny_all_public_documents on public.documents as PERMISSIVE for ALL to anon, authenticated using (false) with check (false);
create policy "messages: delete own in own threads" on public.messaging_messages as PERMISSIVE for DELETE to authenticated using (((created_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM messaging_threads t
  WHERE ((t.id = messaging_messages.thread_id) AND (t.owner_user_id = ( SELECT auth.uid() AS uid)))))));
create policy "messages: insert in own threads" on public.messaging_messages as PERMISSIVE for INSERT to authenticated with check (((created_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM messaging_threads t
  WHERE ((t.id = messaging_messages.thread_id) AND (t.owner_user_id = ( SELECT auth.uid() AS uid)))))));
create policy "messages: select in own threads" on public.messaging_messages as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM messaging_threads t
  WHERE ((t.id = messaging_messages.thread_id) AND (t.owner_user_id = ( SELECT auth.uid() AS uid))))));
create policy "messages: update own in own threads" on public.messaging_messages as PERMISSIVE for UPDATE to authenticated using (((created_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM messaging_threads t
  WHERE ((t.id = messaging_messages.thread_id) AND (t.owner_user_id = ( SELECT auth.uid() AS uid))))))) with check (((created_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM messaging_threads t
  WHERE ((t.id = messaging_messages.thread_id) AND (t.owner_user_id = ( SELECT auth.uid() AS uid)))))));
create policy "summaries: delete own" on public.messaging_thread_summaries as PERMISSIVE for DELETE to authenticated using ((EXISTS ( SELECT 1
   FROM messaging_threads t
  WHERE ((t.id = messaging_thread_summaries.thread_id) AND (t.owner_user_id = ( SELECT auth.uid() AS uid))))));
create policy "summaries: insert own" on public.messaging_thread_summaries as PERMISSIVE for INSERT to authenticated with check (((created_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM messaging_threads t
  WHERE ((t.id = messaging_thread_summaries.thread_id) AND (t.owner_user_id = ( SELECT auth.uid() AS uid)))))));
create policy "summaries: select own" on public.messaging_thread_summaries as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM messaging_threads t
  WHERE ((t.id = messaging_thread_summaries.thread_id) AND (t.owner_user_id = ( SELECT auth.uid() AS uid))))));
create policy "summaries: update own" on public.messaging_thread_summaries as PERMISSIVE for UPDATE to authenticated using ((EXISTS ( SELECT 1
   FROM messaging_threads t
  WHERE ((t.id = messaging_thread_summaries.thread_id) AND (t.owner_user_id = ( SELECT auth.uid() AS uid)))))) with check (((created_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM messaging_threads t
  WHERE ((t.id = messaging_thread_summaries.thread_id) AND (t.owner_user_id = ( SELECT auth.uid() AS uid)))))));
create policy "threads: delete own" on public.messaging_threads as PERMISSIVE for DELETE to authenticated using ((owner_user_id = ( SELECT auth.uid() AS uid)));
create policy "threads: insert own" on public.messaging_threads as PERMISSIVE for INSERT to authenticated with check ((owner_user_id = ( SELECT auth.uid() AS uid)));
create policy "threads: select own" on public.messaging_threads as PERMISSIVE for SELECT to authenticated using ((owner_user_id = ( SELECT auth.uid() AS uid)));
create policy "threads: update own" on public.messaging_threads as PERMISSIVE for UPDATE to authenticated using ((owner_user_id = ( SELECT auth.uid() AS uid))) with check ((owner_user_id = ( SELECT auth.uid() AS uid)));
create policy user_video_progress_owner_insert on public.user_video_progress as PERMISSIVE for INSERT to authenticated with check ((( SELECT auth.uid() AS uid) = user_id));
create policy user_video_progress_owner_select on public.user_video_progress as PERMISSIVE for SELECT to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy user_video_progress_owner_update on public.user_video_progress as PERMISSIVE for UPDATE to authenticated using ((( SELECT auth.uid() AS uid) = user_id)) with check ((( SELECT auth.uid() AS uid) = user_id));
create policy verified_people_directory_admin_select on public.verified_people_directory as PERMISSIVE for SELECT to authenticated using (is_video_admin(ARRAY['reviewer'::text, 'publisher'::text, 'super_admin'::text]));
create policy video_admin_audit_select_admins on public.video_admin_audit_events as PERMISSIVE for SELECT to authenticated using (is_video_admin(ARRAY['reviewer'::text, 'publisher'::text, 'super_admin'::text]));
create policy video_assessment_attempts_owner_insert on public.video_assessment_attempts as PERMISSIVE for INSERT to authenticated with check ((( SELECT auth.uid() AS uid) = user_id));
create policy video_assessment_attempts_owner_select on public.video_assessment_attempts as PERMISSIVE for SELECT to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy video_case_assignment_audit_select on public.video_case_assignment_audit_events as PERMISSIVE for SELECT to authenticated using ((is_video_admin(ARRAY['super_admin'::text]) OR (EXISTS ( SELECT 1
   FROM video_case_assignments assignment
  WHERE ((assignment.id = video_case_assignment_audit_events.assignment_id) AND ((assignment.parent_user_id = ( SELECT auth.uid() AS uid)) OR (assignment.worker_user_id = ( SELECT auth.uid() AS uid))))))));
create policy video_case_assignments_select on public.video_case_assignments as PERMISSIVE for SELECT to authenticated using (((parent_user_id = ( SELECT auth.uid() AS uid)) OR (worker_user_id = ( SELECT auth.uid() AS uid)) OR is_video_admin(ARRAY['super_admin'::text])));
create policy video_curriculum_mappings_select_for_published_resources on public.video_curriculum_mappings as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM video_resources
  WHERE ((video_resources.id = video_curriculum_mappings.video_resource_id) AND (video_resources.publication_status = 'published'::text)))));
create policy video_deployment_checks_select on public.video_deployment_checks as PERMISSIVE for SELECT to authenticated using (is_video_admin(ARRAY['reviewer'::text, 'publisher'::text, 'super_admin'::text]));
create policy video_feature_flags_select on public.video_feature_flags as PERMISSIVE for SELECT to authenticated using (is_video_admin(ARRAY['reviewer'::text, 'publisher'::text, 'super_admin'::text]));
create policy video_lesson_contents_select_for_published_resources on public.video_lesson_contents as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM video_resources
  WHERE ((video_resources.id = video_lesson_contents.video_resource_id) AND (video_resources.publication_status = 'published'::text)))));
create policy video_notification_delivery_attempts_owner_select on public.video_notification_delivery_attempts as PERMISSIVE for SELECT to authenticated using ((is_video_admin(ARRAY['super_admin'::text]) OR (EXISTS ( SELECT 1
   FROM video_notification_outbox outbox
  WHERE ((outbox.id = video_notification_delivery_attempts.outbox_id) AND (outbox.user_id = ( SELECT auth.uid() AS uid)))))));
create policy video_notification_outbox_owner_select on public.video_notification_outbox as PERMISSIVE for SELECT to authenticated using (((user_id = ( SELECT auth.uid() AS uid)) OR is_video_admin(ARRAY['super_admin'::text])));
create policy video_notification_devices_owner on public.video_notification_devices as PERMISSIVE for ALL to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy video_notification_preferences_owner on public.video_notification_preferences as PERMISSIVE for ALL to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy video_practice_tasks_owner_insert on public.video_practice_tasks as PERMISSIVE for INSERT to authenticated with check ((( SELECT auth.uid() AS uid) = user_id));
create policy video_practice_tasks_owner_select on public.video_practice_tasks as PERMISSIVE for SELECT to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy video_progress_report_snapshots_select on public.video_progress_report_snapshots as PERMISSIVE for SELECT to authenticated using (((parent_user_id = ( SELECT auth.uid() AS uid)) OR is_video_admin(ARRAY['super_admin'::text]) OR (EXISTS ( SELECT 1
   FROM video_report_access_grants grant_row
  WHERE ((grant_row.parent_user_id = video_progress_report_snapshots.parent_user_id) AND (grant_row.reviewer_user_id = ( SELECT auth.uid() AS uid)) AND (grant_row.active = true) AND (grant_row.expires_at > now()) AND (grant_row.access_scope = video_progress_report_snapshots.evidence_access_scope))))));
create policy video_providers_select_for_published_resources on public.video_providers as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM video_resources
  WHERE ((video_resources.provider_id = video_providers.id) AND (video_resources.publication_status = 'published'::text)))));
create policy video_reflections_owner_insert on public.video_reflections as PERMISSIVE for INSERT to authenticated with check ((( SELECT auth.uid() AS uid) = user_id));
create policy video_reflections_owner_select on public.video_reflections as PERMISSIVE for SELECT to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy video_release_records_select on public.video_release_records as PERMISSIVE for SELECT to authenticated using (is_video_admin(ARRAY['reviewer'::text, 'publisher'::text, 'super_admin'::text]));
create policy video_report_access_authorities_select on public.video_report_access_authorities as PERMISSIVE for SELECT to authenticated using (((parent_user_id = ( SELECT auth.uid() AS uid)) OR (authorised_user_id = ( SELECT auth.uid() AS uid)) OR is_video_admin(ARRAY['super_admin'::text])));
create policy video_report_access_grants_select on public.video_report_access_grants as PERMISSIVE for SELECT to authenticated using (((parent_user_id = ( SELECT auth.uid() AS uid)) OR (reviewer_user_id = ( SELECT auth.uid() AS uid)) OR is_video_admin(ARRAY['super_admin'::text])));
create policy video_report_attestations_select on public.video_report_attestations as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM video_progress_report_snapshots snapshot
  WHERE ((snapshot.id = video_report_attestations.snapshot_id) AND can_access_video_report(snapshot.parent_user_id, snapshot.evidence_access_scope)))));
create policy video_report_deliveries_select on public.video_report_deliveries as PERMISSIVE for SELECT to authenticated using (((internal_recipient_user_id = ( SELECT auth.uid() AS uid)) OR (created_by = ( SELECT auth.uid() AS uid)) OR is_video_admin(ARRAY['super_admin'::text])));
create policy video_report_delivery_acknowledgements_select on public.video_report_delivery_acknowledgements as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM video_report_deliveries delivery
  WHERE ((delivery.id = video_report_delivery_acknowledgements.delivery_id) AND ((delivery.internal_recipient_user_id = ( SELECT auth.uid() AS uid)) OR (delivery.created_by = ( SELECT auth.uid() AS uid)) OR is_video_admin(ARRAY['super_admin'::text]))))));
create policy video_report_delivery_events_select on public.video_report_delivery_events as PERMISSIVE for SELECT to authenticated using ((is_video_admin(ARRAY['super_admin'::text]) OR (EXISTS ( SELECT 1
   FROM video_report_deliveries d
  WHERE ((d.id = video_report_delivery_events.delivery_id) AND ((d.internal_recipient_user_id = ( SELECT auth.uid() AS uid)) OR (d.created_by = ( SELECT auth.uid() AS uid))))))));
create policy video_report_delivery_purposes_select on public.video_report_delivery_purposes as PERMISSIVE for SELECT to authenticated using (((active = true) OR is_video_admin(ARRAY['super_admin'::text])));
create policy video_report_dispute_responses_select on public.video_report_dispute_responses as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM video_report_disputes d
  WHERE ((d.id = video_report_dispute_responses.dispute_id) AND ((d.parent_user_id = ( SELECT auth.uid() AS uid)) OR can_access_video_report(d.parent_user_id, 'video_progress'::text) OR is_video_admin(ARRAY['super_admin'::text]))))));
create policy video_report_disputes_select on public.video_report_disputes as PERMISSIVE for SELECT to authenticated using (((parent_user_id = ( SELECT auth.uid() AS uid)) OR can_access_video_report(parent_user_id, 'video_progress'::text) OR is_video_admin(ARRAY['super_admin'::text])));
create policy video_report_export_audit_events_select on public.video_report_export_audit_events as PERMISSIVE for SELECT to authenticated using ((is_video_admin(ARRAY['super_admin'::text]) OR (EXISTS ( SELECT 1
   FROM video_progress_report_snapshots snapshot
  WHERE ((snapshot.id = video_report_export_audit_events.snapshot_id) AND can_access_video_report(snapshot.parent_user_id, snapshot.evidence_access_scope))))));
create policy video_report_export_files_select on public.video_report_export_files as PERMISSIVE for SELECT to authenticated using (((parent_user_id = ( SELECT auth.uid() AS uid)) OR (requested_by = ( SELECT auth.uid() AS uid)) OR can_access_video_report(parent_user_id, 'video_progress'::text)));
create policy video_report_legal_holds_select on public.video_report_legal_holds as PERMISSIVE for SELECT to authenticated using (((parent_user_id = ( SELECT auth.uid() AS uid)) OR is_video_admin(ARRAY['super_admin'::text])));
create policy video_report_retention_rules_select on public.video_report_retention_rules as PERMISSIVE for SELECT to authenticated using (is_video_admin(ARRAY['reviewer'::text, 'publisher'::text, 'super_admin'::text]));
create policy video_report_review_history_select on public.video_report_review_history as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM video_report_review_requests request
  WHERE ((request.id = video_report_review_history.review_request_id) AND ((request.submitted_by = ( SELECT auth.uid() AS uid)) OR (request.assigned_reviewer_id = ( SELECT auth.uid() AS uid)) OR can_access_video_report(request.parent_user_id, 'video_progress'::text) OR is_video_admin(ARRAY['super_admin'::text]))))));
create policy video_report_review_requests_select on public.video_report_review_requests as PERMISSIVE for SELECT to authenticated using (((submitted_by = ( SELECT auth.uid() AS uid)) OR (assigned_reviewer_id = ( SELECT auth.uid() AS uid)) OR can_access_video_report(parent_user_id, 'video_progress'::text) OR is_video_admin(ARRAY['super_admin'::text])));
create policy video_report_review_schedules_select on public.video_report_review_schedules as PERMISSIVE for SELECT to authenticated using (((parent_user_id = ( SELECT auth.uid() AS uid)) OR (assigned_reviewer_id = ( SELECT auth.uid() AS uid)) OR is_video_admin(ARRAY['super_admin'::text])));
create policy video_report_system_health_events_select on public.video_report_system_health_events as PERMISSIVE for SELECT to authenticated using (is_video_admin(ARRAY['super_admin'::text]));
create policy video_report_verification_codes_select on public.video_report_verification_codes as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM video_progress_report_snapshots snapshot
  WHERE ((snapshot.id = video_report_verification_codes.snapshot_id) AND can_access_video_report(snapshot.parent_user_id, snapshot.evidence_access_scope)))));
create policy video_resources_select_published on public.video_resources as PERMISSIVE for SELECT to authenticated using ((publication_status = 'published'::text));
create policy video_watch_events_owner_insert on public.video_watch_events as PERMISSIVE for INSERT to authenticated with check ((( SELECT auth.uid() AS uid) = user_id));
create policy video_watch_events_owner_select on public.video_watch_events as PERMISSIVE for SELECT to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy deny_all_public_weeks on public.weeks as PERMISSIVE for ALL to anon, authenticated using (false) with check (false);
