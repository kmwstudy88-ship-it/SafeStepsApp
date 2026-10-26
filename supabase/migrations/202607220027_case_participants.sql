alter table public.case_participants
  add column if not exists tenant_id uuid references public.platform_tenants(id) on delete restrict,
  add column if not exists case_id uuid references public.cases(id) on delete cascade,
  add column if not exists family_member_id uuid references public.family_members(id) on delete restrict,
  add column if not exists participant_role text,
  add column if not exists participation_status text not null default 'active',
  add column if not exists included_in_case_plan boolean not null default true,
  add column if not exists included_in_reporting boolean not null default true,
  add column if not exists participation_start_at timestamptz not null default now(),
  add column if not exists participation_end_at timestamptz,
  add column if not exists exclusion_reason text,
  add column if not exists updated_at timestamptz not null default now();

update public.case_participants
set participant_role = coalesce(participant_role, participant_type, relationship_to_case, 'participant'),
    participation_status = coalesce(participation_status, status, 'active')
where participant_role is null or participation_status is null;

create or replace function public.validate_case_participant()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_case_tenant uuid;
  v_case_family uuid;
  v_member_tenant uuid;
  v_member_family uuid;
begin
  select tenant_id, family_id into v_case_tenant, v_case_family from public.cases where id = new.case_id;
  select tenant_id, family_id into v_member_tenant, v_member_family from public.family_members where id = new.family_member_id;

  if v_case_tenant is distinct from new.tenant_id or v_member_tenant is distinct from new.tenant_id then
    raise exception 'Case participant tenant mismatch';
  end if;

  if v_case_family is distinct from v_member_family then
    raise exception 'Case participant must belong to the case family';
  end if;

  return new;
end;
$$;

drop trigger if exists case_participants_validate on public.case_participants;
create trigger case_participants_validate
before insert or update on public.case_participants
for each row execute function public.validate_case_participant();

create unique index if not exists case_participants_active_unique_idx
  on public.case_participants (case_id, family_member_id, participant_role)
  where participation_status = 'active' and participation_end_at is null;

create index if not exists case_participants_case_idx
  on public.case_participants (tenant_id, case_id, participation_status);

create index if not exists case_participants_member_idx
  on public.case_participants (family_member_id, participation_status);
