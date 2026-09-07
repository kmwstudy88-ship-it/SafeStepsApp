-- A professional link is derived from active case membership, never a client-set parent flag.

create or replace function public.case_has_linked_professional(target_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.safesteps_has_case_access(target_case_id)
    and exists (
      select 1
      from public.case_memberships membership
      where membership.case_id = target_case_id
        and membership.status = 'active'
        and membership.membership_role in ('facilitator', 'caseworker', 'clinician', 'advocate')
    );
$$;

revoke all on function public.case_has_linked_professional(uuid) from public;
grant execute on function public.case_has_linked_professional(uuid) to authenticated;

comment on function public.case_has_linked_professional(uuid) is
  'Returns true only when the caller can access the case and an active review-capable professional is linked.';
