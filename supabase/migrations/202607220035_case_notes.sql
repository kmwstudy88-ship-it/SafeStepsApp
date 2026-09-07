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

alter table public.case_notes
  add column if not exists tenant_id uuid references public.platform_tenants(id) on delete restrict,
  add column if not exists case_id uuid references public.cases(id) on delete cascade,
  add column if not exists note_reference text,
  add column if not exists note_type text,
  add column if not exists note_title text,
  add column if not exists note_body text,
  add column if not exists note_status text not null default 'draft',
  add column if not exists visibility_level text not null default 'worker_only',
  add column if not exists family_shared boolean not null default false,
  add column if not exists child_shared boolean not null default false,
  add column if not exists court_exportable boolean not null default false,
  add column if not exists legal_restricted boolean not null default false,
  add column if not exists author_user_id uuid references auth.users(id) on delete set null,
  add column if not exists finalised_at timestamptz,
  add column if not exists amended_note_id uuid references public.case_notes(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

with family_case as (
  select family_id, (array_agg(id order by created_at nulls last, id::text))[1] as case_id
  from public.cases
  where family_id is not null
  group by family_id
  having count(*) = 1
)
update public.case_notes cn
set case_id = coalesce(cn.case_id, fc.case_id),
    tenant_id = coalesce(cn.tenant_id, c.tenant_id),
    note_reference = coalesce(cn.note_reference, 'CN-' || cn.id::text),
    note_type = coalesce(cn.note_type, 'case_note'),
    note_body = coalesce(cn.note_body, cn.note, ''),
    note_status = coalesce(cn.note_status, 'draft'),
    visibility_level = coalesce(cn.visibility_level, 'worker_only'),
    family_shared = coalesce(cn.family_shared, false),
    child_shared = coalesce(cn.child_shared, false),
    court_exportable = coalesce(cn.court_exportable, false),
    legal_restricted = coalesce(cn.legal_restricted, false),
    author_user_id = coalesce(cn.author_user_id, cn.user_id)
from family_case fc
left join public.cases c on c.id = fc.case_id
where cn.family_id = fc.family_id
  and (
    cn.case_id is null
    or cn.tenant_id is null
    or cn.note_reference is null
    or cn.note_type is null
    or cn.note_body is null
    or cn.note_status is null
    or cn.visibility_level is null
    or cn.family_shared is null
    or cn.child_shared is null
    or cn.court_exportable is null
    or cn.legal_restricted is null
    or cn.author_user_id is null
  );

update public.case_notes
set note_reference = coalesce(note_reference, 'CN-' || id::text),
    note_type = coalesce(note_type, 'case_note'),
    note_body = coalesce(note_body, note, ''),
    note_status = coalesce(note_status, 'draft'),
    visibility_level = coalesce(visibility_level, 'worker_only'),
    family_shared = coalesce(family_shared, false),
    child_shared = coalesce(child_shared, false),
    court_exportable = coalesce(court_exportable, false),
    legal_restricted = coalesce(legal_restricted, false),
    author_user_id = coalesce(author_user_id, user_id)
where note_reference is null
   or note_type is null
   or note_body is null
   or note_status is null
   or visibility_level is null
   or family_shared is null
   or child_shared is null
   or court_exportable is null
   or legal_restricted is null
   or author_user_id is null;

create unique index if not exists case_notes_reference_unique_idx
  on public.case_notes (tenant_id, note_reference)
  where tenant_id is not null and note_reference is not null;

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
