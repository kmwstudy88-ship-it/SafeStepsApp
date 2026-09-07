-- Durable ledger for the existing document-intelligence API pipeline.

create table if not exists public.document_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  document_id uuid references public.case_documents(id) on delete set null,
  document_version_id uuid references public.case_document_versions(id) on delete set null,
  requested_by uuid not null,
  source_mode text not null check (source_mode in ('text', 'file')),
  source_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'failed')),
  schema_version text not null,
  model text,
  result jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint document_analysis_run_document_version_consistency check (
    document_version_id is null or document_id is not null
  ),
  constraint document_analysis_run_completion_consistency check (
    (status = 'completed' and result is not null and completed_at is not null)
    or (status = 'failed' and completed_at is not null)
    or status in ('queued', 'processing')
  )
);

create index if not exists document_analysis_runs_case_created_idx
  on public.document_analysis_runs (case_id, created_at desc);

create index if not exists document_analysis_runs_document_created_idx
  on public.document_analysis_runs (document_id, created_at desc)
  where document_id is not null;

alter table public.document_analysis_runs enable row level security;

drop policy if exists document_analysis_runs_select on public.document_analysis_runs;
create policy document_analysis_runs_select on public.document_analysis_runs
for select to authenticated
using (public.safesteps_has_case_access(case_id));

drop policy if exists document_analysis_runs_insert on public.document_analysis_runs;
create policy document_analysis_runs_insert on public.document_analysis_runs
for insert to authenticated
with check (
  requested_by = (select auth.uid())
  and public.safesteps_has_case_access(case_id)
);

drop policy if exists document_analysis_runs_update on public.document_analysis_runs;
create policy document_analysis_runs_update on public.document_analysis_runs
for update to authenticated
using (
  requested_by = (select auth.uid())
  and public.safesteps_has_case_access(case_id)
)
with check (
  requested_by = (select auth.uid())
  and public.safesteps_has_case_access(case_id)
);

comment on table public.document_analysis_runs is
  'Human-reviewable AI analysis runs. Result JSON is generated support material, not a verified finding or automated decision.';
