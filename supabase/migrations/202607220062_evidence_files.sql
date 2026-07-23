create table if not exists public.evidence_files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  file_reference text not null,
  bucket_name text not null,
  storage_path text not null,
  original_filename text not null,
  storage_filename text not null,
  file_extension text not null,
  file_size_bytes bigint not null,
  media_type text not null,
  sha256_hash text not null,
  encrypted_hash text,
  storage_checksum text,
  thumbnail_path text,
  encryption_key_reference text,
  integrity_status text not null default 'pending_verification',
  last_verified_at timestamptz,
  verification_count integer not null default 0,
  virus_scan_status text not null default 'pending',
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, file_reference),
  unique (tenant_id, storage_path),
  constraint evidence_files_size_check check (file_size_bytes >= 0),
  constraint evidence_files_hash_check check (length(sha256_hash) >= 32)
);

create index if not exists evidence_files_record_idx
  on public.evidence_files(evidence_record_id, created_at desc);

insert into storage.buckets (id, name, public)
values
  ('evidence-images', 'evidence-images', false),
  ('evidence-video', 'evidence-video', false),
  ('evidence-audio', 'evidence-audio', false),
  ('evidence-documents', 'evidence-documents', false),
  ('evidence-thumbnails', 'evidence-thumbnails', false),
  ('court-exports', 'court-exports', false),
  ('temporary-uploads', 'temporary-uploads', false),
  ('archived-evidence', 'archived-evidence', false)
on conflict (id) do nothing;
