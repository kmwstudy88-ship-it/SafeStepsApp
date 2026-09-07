create table if not exists public.evidence_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  family_id uuid references public.families(id) on delete set null,
  child_id uuid references public.children(id) on delete set null,
  source_evidence_item_id uuid references public.evidence_items(id) on delete set null,
  evidence_reference text not null,
  evidence_title text not null,
  evidence_description text,
  evidence_type text not null,
  evidence_source text not null,
  evidence_status text not null default 'uploaded',
  privacy_level text not null default 'worker_only',
  uploader_user_id uuid references auth.users(id) on delete set null,
  captured_at timestamptz,
  uploaded_at timestamptz not null default now(),
  legal_hold boolean not null default false,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, evidence_reference)
);

create index if not exists evidence_records_case_idx
  on public.evidence_records(tenant_id, case_id, uploaded_at desc);

create index if not exists evidence_records_child_idx
  on public.evidence_records(tenant_id, child_id, uploaded_at desc)
  where child_id is not null;

create or replace function public.prevent_evidence_record_immutable_update()
returns trigger
language plpgsql
as $$
begin
  if old.evidence_reference is distinct from new.evidence_reference
    or old.tenant_id is distinct from new.tenant_id
    or old.case_id is distinct from new.case_id
    or old.family_id is distinct from new.family_id
    or old.child_id is distinct from new.child_id
    or old.uploader_user_id is distinct from new.uploader_user_id
    or old.uploaded_at is distinct from new.uploaded_at
  then
    raise exception 'Evidence record immutable metadata cannot be changed';
  end if;

  if old.legal_hold = true and new.deleted = true then
    raise exception 'Evidence on legal hold cannot be deleted';
  end if;

  return new;
end;
$$;

drop trigger if exists evidence_records_immutable_update on public.evidence_records;
create trigger evidence_records_immutable_update
before update on public.evidence_records
for each row execute function public.prevent_evidence_record_immutable_update();
