create index if not exists idx_user_tasks_owner_created
  on public.user_tasks(owner_id, created_at desc);

create index if not exists idx_evidence_items_owner_created
  on public.evidence_items(owner_id, created_at desc);

create index if not exists idx_progress_events_owner_created
  on public.progress_events(owner_id, created_at desc);

create index if not exists idx_progress_events_owner_type_created
  on public.progress_events(owner_id, event_type, created_at desc);

create index if not exists idx_program_enrollments_owner_started
  on public.program_enrollments(owner_id, started_at desc);

create index if not exists idx_program_enrollments_owner_status_started
  on public.program_enrollments(owner_id, status, started_at desc);

create index if not exists idx_case_intake_status_parent_case
  on public.case_intake_status(parent_user_id, case_id);
