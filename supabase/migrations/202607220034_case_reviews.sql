create table if not exists public.case_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  review_reference text not null,
  review_type text not null,
  review_status text not null default 'scheduled',
  scheduled_for timestamptz,
  completed_at timestamptz,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  review_summary text,
  decisions jsonb not null default '[]'::jsonb,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, review_reference)
);
