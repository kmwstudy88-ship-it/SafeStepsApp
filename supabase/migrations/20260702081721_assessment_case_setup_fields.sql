alter table public.reunification_cases
  add column if not exists parent_carer_name text,
  add column if not exists child_names text[] not null default array[]::text[],
  add column if not exists program_stream text,
  add column if not exists assessment_type text,
  add column if not exists case_goals text[] not null default array[]::text[],
  add column if not exists case_start_date date,
  add column if not exists assessment_date date,
  add column if not exists review_due_date date,
  add column if not exists court_date date,
  add column if not exists support_worker_name text,
  add column if not exists caseworker_name text,
  add column if not exists supervisor_name text,
  add column if not exists legal_contact_name text;

create index if not exists idx_reunification_cases_review_due
  on public.reunification_cases(owner_id, review_due_date)
  where review_due_date is not null;
