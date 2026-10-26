alter table public.cases
  add column if not exists tenant_id uuid references public.platform_tenants(id) on delete restrict,
  add column if not exists organisation_id uuid references public.organisations(id) on delete restrict,
  add column if not exists family_id uuid references public.families(id) on delete restrict,
  add column if not exists case_reference text,
  add column if not exists case_type_code text references public.case_type_definitions(case_type_code) on delete restrict,
  add column if not exists case_status_code text references public.case_status_definitions(case_status_code) on delete restrict,
  add column if not exists priority_code text references public.case_priority_definitions(priority_code) on delete restrict,
  add column if not exists case_title text,
  add column if not exists case_summary text,
  add column if not exists referral_source_type text,
  add column if not exists referral_source_reference text,
  add column if not exists presenting_concerns jsonb not null default '[]'::jsonb,
  add column if not exists identified_strengths jsonb not null default '[]'::jsonb,
  add column if not exists risk_pathway text,
  add column if not exists program_pathway text,
  add column if not exists primary_jurisdiction_code text,
  add column if not exists opened_at timestamptz not null default now(),
  add column if not exists target_review_at timestamptz,
  add column if not exists target_closure_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists closure_reason text,
  add column if not exists closure_summary text,
  add column if not exists created_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists updated_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.cases alter column organisation_id drop not null;
alter table public.cases alter column family_id drop not null;

update public.cases
set case_reference = coalesce(case_reference, 'LEGACY-CASE-' || id::text),
    case_type_code = coalesce(case_type_code, case_type, 'early_support'),
    case_status_code = coalesce(case_status_code, status, 'active'),
    priority_code = coalesce(priority_code, priority_level, 'standard'),
    case_title = coalesce(case_title, title)
where case_reference is null
   or case_type_code is null
   or case_status_code is null
   or priority_code is null;

create sequence if not exists public.case_reference_sequence start with 1 increment by 1;

create or replace function public.generate_case_reference()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  v_sequence bigint;
begin
  v_sequence := nextval('public.case_reference_sequence');
  return 'CASE-' || to_char(now(), 'YYYY') || '-' || lpad(v_sequence::text, 7, '0');
end;
$$;

create or replace function public.set_case_reference()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.case_reference is null or btrim(new.case_reference) = '' then
    new.case_reference := public.generate_case_reference();
  end if;
  return new;
end;
$$;

create or replace function public.validate_case_tenant_relationships()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_family_tenant uuid;
  v_org_tenant uuid;
begin
  if new.family_id is not null then
    select tenant_id into v_family_tenant from public.families where id = new.family_id;
    if v_family_tenant is distinct from new.tenant_id then
      raise exception 'Family tenant does not match case tenant';
    end if;
  end if;

  if new.organisation_id is not null then
    select tenant_id into v_org_tenant from public.organisations where id = new.organisation_id;
    if v_org_tenant is distinct from new.tenant_id then
      raise exception 'Organisation tenant does not match case tenant';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists cases_set_reference on public.cases;
create trigger cases_set_reference
before insert on public.cases
for each row execute function public.set_case_reference();

drop trigger if exists cases_validate_tenant on public.cases;
create trigger cases_validate_tenant
before insert or update on public.cases
for each row execute function public.validate_case_tenant_relationships();

create unique index if not exists cases_reference_unique_idx
  on public.cases (tenant_id, case_reference)
  where tenant_id is not null and case_reference is not null;

create index if not exists cases_tenant_idx on public.cases (tenant_id);
create index if not exists cases_family_idx on public.cases (tenant_id, family_id, case_status_code);
create index if not exists cases_org_status_idx on public.cases (tenant_id, organisation_id, case_status_code);
create index if not exists cases_priority_idx on public.cases (tenant_id, priority_code, opened_at desc);
