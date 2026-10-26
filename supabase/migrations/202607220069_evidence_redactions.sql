create table if not exists public.evidence_redactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  source_file_id uuid not null references public.evidence_files(id) on delete restrict,
  redacted_file_id uuid references public.evidence_files(id) on delete set null,
  redaction_reference text not null,
  redaction_type text not null,
  redaction_reason text not null,
  redaction_manifest jsonb not null default '{}'::jsonb,
  requested_by_user_id uuid references auth.users(id) on delete set null,
  approved_by_user_id uuid references auth.users(id) on delete set null,
  redaction_status text not null default 'draft',
  created_at timestamptz not null default now(),
  unique (tenant_id, redaction_reference),
  constraint evidence_redactions_original_check check (redacted_file_id is null or redacted_file_id <> source_file_id)
);
