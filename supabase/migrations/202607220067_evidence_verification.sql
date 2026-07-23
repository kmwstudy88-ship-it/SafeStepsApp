create table if not exists public.evidence_verifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  evidence_file_id uuid references public.evidence_files(id) on delete set null,
  verification_status text not null default 'pending_review',
  verification_reason text,
  verified_by_user_id uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  hash_valid boolean,
  metadata_valid boolean,
  duplicate_detected boolean not null default false,
  tamper_detected boolean not null default false,
  verification_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_digital_signatures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  signer_user_id uuid references auth.users(id) on delete set null,
  signer_type text not null,
  consent_summary text,
  signature_image_path text,
  signature_hash text not null,
  cryptographic_verification jsonb not null default '{}'::jsonb,
  signed_at timestamptz not null default now()
);
