create table if not exists public.court_bundles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  bundle_reference text not null,
  bundle_title text not null,
  bundle_status text not null default 'draft',
  court_name text,
  proceeding_reference text,
  export_format text,
  export_manifest jsonb not null default '{}'::jsonb,
  created_by_user_id uuid references auth.users(id) on delete set null,
  approved_by_user_id uuid references auth.users(id) on delete set null,
  exported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, bundle_reference)
);

create table if not exists public.court_bundle_exhibits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  court_bundle_id uuid not null references public.court_bundles(id) on delete cascade,
  evidence_record_id uuid not null references public.evidence_records(id) on delete restrict,
  exhibit_reference text not null,
  exhibit_index integer not null,
  exhibit_title text not null,
  redaction_required boolean not null default false,
  included_file_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  unique (court_bundle_id, exhibit_reference),
  unique (court_bundle_id, exhibit_index)
);
