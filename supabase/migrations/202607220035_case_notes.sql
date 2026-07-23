create table if not exists public.case_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  note_reference text not null,
  note_type text not null,
  note_title text,
  note_body text not null,
  note_status text not null default 'draft',
  visibility_level text not null default 'worker_only',
  family_shared boolean not null default false,
  child_shared boolean not null default false,
  court_exportable boolean not null default false,
  legal_restricted boolean not null default false,
  author_user_id uuid references auth.users(id) on delete set null,
  finalised_at timestamptz,
  amended_note_id uuid references public.case_notes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, note_reference)
);

create table if not exists public.case_note_visibility_grants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_note_id uuid not null references public.case_notes(id) on delete cascade,
  grantee_user_id uuid references auth.users(id) on delete cascade,
  grantee_family_member_id uuid references public.family_members(id) on delete cascade,
  grant_scope text not null,
  grant_status text not null default 'active',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.prevent_final_case_note_update()
returns trigger
language plpgsql
as $$
begin
  if old.note_status = 'final' and new is distinct from old then
    raise exception 'Final case notes cannot be silently altered; create an amendment note';
  end if;
  return new;
end;
$$;

drop trigger if exists case_notes_prevent_final_update on public.case_notes;
create trigger case_notes_prevent_final_update
before update on public.case_notes
for each row execute function public.prevent_final_case_note_update();
