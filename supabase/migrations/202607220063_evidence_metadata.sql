create table if not exists public.evidence_metadata (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  evidence_file_id uuid not null unique references public.evidence_files(id) on delete cascade,
  gps_location jsonb,
  timezone text,
  camera_device text,
  operating_system text,
  app_version text,
  capture_device_id text,
  metadata_payload jsonb not null default '{}'::jsonb,
  extracted_at timestamptz not null default now(),
  metadata_hash text,
  created_at timestamptz not null default now()
);
