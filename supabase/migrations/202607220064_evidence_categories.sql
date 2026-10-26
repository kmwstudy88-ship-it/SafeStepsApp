create table if not exists public.evidence_type_definitions (
  evidence_type_code text primary key,
  evidence_type_name text not null,
  media_group text not null,
  description text not null,
  active boolean not null default true
);

create table if not exists public.evidence_category_definitions (
  evidence_category_code text primary key,
  evidence_category_name text not null,
  description text not null,
  active boolean not null default true
);

create table if not exists public.evidence_record_categories (
  id uuid primary key default gen_random_uuid(),
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  evidence_category_code text not null references public.evidence_category_definitions(evidence_category_code) on delete restrict,
  created_at timestamptz not null default now(),
  unique (evidence_record_id, evidence_category_code)
);
