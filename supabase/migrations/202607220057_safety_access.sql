create or replace function public.has_safety_access(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_case_access(p_case_id)
    or exists (
      select 1 from public.cases c
      where c.id = p_case_id
        and public.has_permission(c.tenant_id, 'safety.view')
    );
$$;

create or replace function public.can_manage_safety(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_case(p_case_id)
    or exists (
      select 1 from public.cases c
      where c.id = p_case_id
        and public.has_permission(c.tenant_id, 'safety.manage')
    );
$$;

create or replace function public.can_review_weapon_detection(p_detection_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.weapon_risk_detections wrd
    where wrd.id = p_detection_id
      and (public.has_permission(wrd.tenant_id, 'weapon.review') or (wrd.case_id is not null and public.is_case_supervisor(wrd.case_id)))
  );
$$;

create or replace function public.can_review_child_disclosure(p_disclosure_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.child_disclosures cd
    where cd.id = p_disclosure_id
      and (public.has_permission(cd.tenant_id, 'child_disclosure.review') or (cd.case_id is not null and public.is_case_supervisor(cd.case_id)))
  );
$$;
