create table if not exists public.safety_protective_factors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  factor_reference text not null,
  factor_type text not null,
  factor_summary text not null,
  source_type text not null,
  confidence_level text not null default 'reported',
  strength_level text not null default 'moderate',
  verified boolean not null default false,
  review_due_at timestamptz,
  linked_evidence_ids uuid[] not null default '{}'::uuid[],
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, factor_reference)
);
