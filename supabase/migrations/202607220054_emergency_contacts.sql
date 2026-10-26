create table if not exists public.safety_emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  contact_reference text not null,
  contact_type text not null,
  display_name text not null,
  relationship_summary text,
  phone_number text,
  email_address text,
  service_details jsonb not null default '{}'::jsonb,
  available_24_7 boolean not null default false,
  priority_order integer not null default 0,
  contact_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, contact_reference)
);
