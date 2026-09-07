create table if not exists public.case_legal_references (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  legal_reference text not null,
  reference_type text not null,
  jurisdiction_code text,
  court_name text,
  proceeding_reference text,
  order_reference text,
  order_status text,
  effective_from date,
  effective_to date,
  summary text,
  confidential boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, legal_reference)
);

create table if not exists public.case_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_legal_reference_id uuid not null references public.case_legal_references(id) on delete cascade,
  order_type text not null,
  order_summary text not null,
  order_status text not null default 'active',
  made_at date,
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
