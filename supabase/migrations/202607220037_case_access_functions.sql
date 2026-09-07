create or replace function public.is_case_worker(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.case_allocations ca
    where ca.case_id = p_case_id
      and ca.allocated_user_id = auth.uid()
      and ca.allocation_role in ('primary_worker', 'secondary_worker', 'family_support_worker', 'child_specialist', 'provider_coordinator')
      and ca.allocation_status = 'active'
      and ca.ended_at is null
  );
$$;

create or replace function public.is_case_supervisor(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.case_allocations ca
    where ca.case_id = p_case_id
      and ca.allocated_user_id = auth.uid()
      and ca.allocation_role in ('primary_supervisor', 'clinical_supervisor')
      and ca.allocation_status = 'active'
      and ca.ended_at is null
  );
$$;

create or replace function public.is_case_team_member(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.case_allocations ca
    join public.worker_team_memberships wtm on wtm.team_id = ca.allocated_team_id
    where ca.case_id = p_case_id
      and wtm.user_id = auth.uid()
      and ca.allocation_status = 'active'
      and ca.ended_at is null
      and wtm.membership_status = 'active'
      and wtm.effective_from <= now()
      and (wtm.effective_to is null or wtm.effective_to > now())
  );
$$;

create or replace function public.has_case_access(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cases c
    where c.id = p_case_id
      and (
        public.has_permission(c.tenant_id, 'case.view')
        or public.is_case_worker(c.id)
        or public.is_case_supervisor(c.id)
        or public.is_case_team_member(c.id)
        or public.is_family_member(c.family_id)
      )
  );
$$;

create or replace function public.can_manage_case(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cases c
    where c.id = p_case_id
      and (
        public.has_permission(c.tenant_id, 'case.update')
        or public.is_case_worker(c.id)
        or public.is_case_supervisor(c.id)
      )
  );
$$;

create or replace function public.can_view_case_note(p_case_note_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.case_notes cn
    where cn.id = p_case_note_id
      and (
        (cn.legal_restricted = true and public.has_permission(cn.tenant_id, 'case.legal_note.view'))
        or (cn.visibility_level = 'restricted' and public.has_permission(cn.tenant_id, 'case.restricted_note.view'))
        or public.is_case_worker(cn.case_id)
        or public.is_case_supervisor(cn.case_id)
        or public.is_case_team_member(cn.case_id)
        or (cn.family_shared = true and exists (
          select 1 from public.cases c
          where c.id = cn.case_id and public.is_family_member(c.family_id)
        ))
        or exists (
          select 1
          from public.case_note_visibility_grants g
          where g.case_note_id = cn.id
            and g.grant_status = 'active'
            and (g.expires_at is null or g.expires_at > now())
            and (
              g.grantee_user_id = auth.uid()
              or g.grantee_family_member_id in (select public.current_family_member_ids())
            )
        )
      )
  );
$$;
