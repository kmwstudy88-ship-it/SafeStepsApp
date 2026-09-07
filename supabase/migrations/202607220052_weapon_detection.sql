create table if not exists public.weapon_risk_detections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  detection_reference text not null,
  weapon_type text not null,
  detection_source text not null,
  confidence_score numeric not null default 0,
  audio_sample_path text,
  transcript text,
  location_summary text,
  ai_reasoning text,
  review_status text not null default 'pending_review',
  worker_confirmation text,
  reviewed_by_user_id uuid references auth.users(id) on delete set null,
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (tenant_id, detection_reference),
  constraint weapon_risk_detections_confidence_check check (confidence_score >= 0 and confidence_score <= 1)
);

create table if not exists public.domestic_violence_indicators (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  indicator_type text not null,
  indicator_summary text not null,
  severity_level text not null default 'moderate',
  source_type text not null,
  observed_at timestamptz not null default now(),
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);
