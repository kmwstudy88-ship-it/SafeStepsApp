create table if not exists public.safety_risk_indicators (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  indicator_reference text not null,
  indicator_type text not null,
  indicator_summary text not null,
  severity_level text not null default 'moderate',
  observed_at timestamptz not null default now(),
  source_type text not null,
  reviewed boolean not null default false,
  reviewed_by_user_id uuid references auth.users(id) on delete set null,
  linked_evidence_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  unique (tenant_id, indicator_reference)
);

create table if not exists public.ai_risk_signals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  signal_reference text not null,
  signal_source text not null,
  signal_type text not null,
  severity_level text not null,
  confidence_score numeric not null default 0,
  ai_explanation text,
  linked_evidence_ids uuid[] not null default '{}'::uuid[],
  review_status text not null default 'pending_human_review',
  reviewer_user_id uuid references auth.users(id) on delete set null,
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (tenant_id, signal_reference),
  constraint ai_risk_signals_confidence_check check (confidence_score >= 0 and confidence_score <= 1)
);
