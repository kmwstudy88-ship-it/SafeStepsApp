create table if not exists public.child_disclosures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  disclosure_reference text not null,
  child_words_exact text not null,
  worker_interpretation text,
  disclosure_environment text,
  prompting_present boolean not null default false,
  confidence_level text not null default 'reported',
  urgency_level text not null default 'review',
  safety_concern boolean not null default true,
  mandatory_report_generated boolean not null default false,
  linked_evidence_ids uuid[] not null default '{}'::uuid[],
  locked boolean not null default true,
  recorded_by_user_id uuid references auth.users(id) on delete set null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (tenant_id, disclosure_reference)
);

create or replace function public.prevent_child_disclosure_words_update()
returns trigger
language plpgsql
as $$
begin
  if old.child_words_exact is distinct from new.child_words_exact then
    raise exception 'Child disclosure exact wording cannot be overwritten';
  end if;
  return new;
end;
$$;

drop trigger if exists child_disclosures_lock_words on public.child_disclosures;
create trigger child_disclosures_lock_words
before update on public.child_disclosures
for each row execute function public.prevent_child_disclosure_words_update();
