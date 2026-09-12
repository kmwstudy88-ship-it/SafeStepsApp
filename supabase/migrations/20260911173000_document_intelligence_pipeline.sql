-- Track B: durable document intelligence pipeline.
-- AI outputs are decision-support material only and require human review.

alter table public.documents
  add column if not exists case_id uuid,
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists storage_path text,
  add column if not exists byte_size bigint,
  add column if not exists sha256 text,
  add column if not exists source_type text not null default 'upload',
  add column if not exists processing_status text not null default 'queued',
  add column if not exists extracted_text text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table public.documents drop constraint if exists documents_processing_status_check;
alter table public.documents add constraint documents_processing_status_check
  check (processing_status in ('queued','processing','completed','failed'));

create index if not exists documents_user_created_idx
  on public.documents (user_id, created_at desc);
create index if not exists documents_case_created_idx
  on public.documents (case_id, created_at desc) where case_id is not null;
create unique index if not exists documents_sha256_user_idx
  on public.documents (user_id, sha256) where user_id is not null and sha256 is not null;

create table if not exists public.document_analyses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null,
  provider text not null check (provider in ('openai','anthropic')),
  model text not null,
  schema_version text not null default 'document-intelligence-v1',
  status text not null default 'queued' check (status in ('queued','processing','completed','failed')),
  summary jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  contradictions jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  risk jsonb not null default '{}'::jsonb,
  bias jsonb not null default '{}'::jsonb,
  fairness jsonb not null default '{}'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  raw_output jsonb,
  usage jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists document_analyses_document_created_idx
  on public.document_analyses (document_id, created_at desc);
create index if not exists document_analyses_user_created_idx
  on public.document_analyses (user_id, created_at desc);

create table if not exists public.document_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  case_id uuid,
  document_ids uuid[] not null,
  provider text not null check (provider in ('openai','anthropic')),
  model text not null,
  schema_version text not null default 'document-comparison-v1',
  status text not null default 'queued' check (status in ('queued','processing','completed','failed')),
  result jsonb,
  usage jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint document_comparisons_minimum_documents check (cardinality(document_ids) between 2 and 10)
);

create index if not exists document_comparisons_user_created_idx
  on public.document_comparisons (user_id, created_at desc);
create index if not exists document_comparisons_case_created_idx
  on public.document_comparisons (case_id, created_at desc) where case_id is not null;

create table if not exists public.document_analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('document_analysis','document_comparison')),
  document_id uuid references public.documents(id) on delete cascade,
  comparison_id uuid references public.document_comparisons(id) on delete cascade,
  user_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','processing','completed','failed')),
  attempts integer not null default 0,
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  claimed_by text,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  constraint document_analysis_jobs_target_check check (
    (job_type = 'document_analysis' and document_id is not null and comparison_id is null)
    or (job_type = 'document_comparison' and comparison_id is not null and document_id is null)
  )
);

create index if not exists document_analysis_jobs_queue_idx
  on public.document_analysis_jobs (status, available_at, created_at)
  where status = 'queued';

alter table public.document_analyses enable row level security;
alter table public.document_comparisons enable row level security;
alter table public.document_analysis_jobs enable row level security;

-- The app reads these records through the authenticated backend. Direct writes stay service-role only.
revoke all on public.document_analyses from anon, authenticated;
revoke all on public.document_comparisons from anon, authenticated;
revoke all on public.document_analysis_jobs from anon, authenticated;
grant all on public.document_analyses to service_role;
grant all on public.document_comparisons to service_role;
grant all on public.document_analysis_jobs to service_role;

create or replace function public.claim_document_analysis_jobs(
  p_worker_id text,
  p_limit integer default 1
)
returns setof public.document_analysis_jobs
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with candidates as (
    select j.id
    from public.document_analysis_jobs j
    where j.status = 'queued'
      and j.available_at <= now()
      and j.attempts < j.max_attempts
    order by j.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 1), 10))
  ), updated as (
    update public.document_analysis_jobs j
    set status = 'processing',
        attempts = j.attempts + 1,
        claimed_at = now(),
        claimed_by = p_worker_id
    from candidates c
    where j.id = c.id
    returning j.*
  )
  select * from updated;
end;
$$;

revoke all on function public.claim_document_analysis_jobs(text, integer) from public, anon, authenticated;
grant execute on function public.claim_document_analysis_jobs(text, integer) to service_role;

insert into storage.buckets (id, name, public, file_size_limit)
values ('document-intelligence', 'document-intelligence', false, 26214400)
on conflict (id) do update
set public = false, file_size_limit = excluded.file_size_limit;

comment on table public.document_analyses is
  'Structured AI document-analysis outputs. These are support signals, not verified findings or automated case decisions.';
comment on table public.document_comparisons is
  'Cross-document AI comparison outputs for contradictions, timeline conflicts, evidence gaps and framing differences.';
comment on table public.document_analysis_jobs is
  'Service-role-only durable queue for document analysis and comparison work.';
