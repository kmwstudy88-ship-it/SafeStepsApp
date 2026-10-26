create table if not exists public.safety_risk_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  assessment_reference text not null,
  assessment_type text not null,
  assessed_level text not null,
  risk_score numeric,
  protective_score numeric,
  assessment_summary text not null,
  human_review_required boolean not null default true,
  assessor_user_id uuid references auth.users(id) on delete set null,
  assessed_at timestamptz not null default now(),
  next_review_at timestamptz,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, assessment_reference),
  constraint safety_risk_assessments_type_check check (assessment_type in ('static','dynamic','ai_assisted','worker_review','supervisor_review')),
  constraint safety_risk_assessments_level_check check (assessed_level in ('SAFE','LOW','MODERATE','HIGH','CRITICAL','IMMINENT'))
);

create table if not exists public.static_risk_assessment_items (
  id uuid primary key default gen_random_uuid(),
  risk_assessment_id uuid not null references public.safety_risk_assessments(id) on delete cascade,
  item_type text not null,
  item_summary text not null,
  source_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.dynamic_risk_assessment_items (
  id uuid primary key default gen_random_uuid(),
  risk_assessment_id uuid not null references public.safety_risk_assessments(id) on delete cascade,
  item_type text not null,
  item_summary text not null,
  current_level text not null,
  changed_at timestamptz not null default now()
);
