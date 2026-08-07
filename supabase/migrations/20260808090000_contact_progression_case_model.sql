-- Align contact progression with the canonical SafeSteps case model used by
-- case_memberships, assessments, evidence, and document intelligence.

-- Refuse to retarget a populated legacy row unless its case already exists in
-- reunification_cases. This keeps the migration safe outside the current empty
-- production tables as well.
do $$
begin
  if exists (
    select 1 from public.contact_sessions cs
    left join public.reunification_cases rc on rc.id = cs.case_id
    where rc.id is null
  ) then
    raise exception 'contact_sessions contains case IDs not present in reunification_cases';
  end if;

  if exists (
    select 1 from public.reunification_recommendations rr
    left join public.reunification_cases rc on rc.id = rr.case_id
    where rc.id is null
  ) then
    raise exception 'reunification_recommendations contains case IDs not present in reunification_cases';
  end if;

  if exists (
    select 1 from public.reunification_overrides ro
    left join public.reunification_cases rc on rc.id = ro.case_id
    where rc.id is null
  ) then
    raise exception 'reunification_overrides contains case IDs not present in reunification_cases';
  end if;
end $$;

alter table public.contact_sessions
  drop constraint if exists contact_sessions_case_id_fkey,
  add constraint contact_sessions_case_id_fkey
    foreign key (case_id) references public.reunification_cases(id) on delete cascade;

alter table public.reunification_recommendations
  drop constraint if exists reunification_recommendations_case_id_fkey,
  add constraint reunification_recommendations_case_id_fkey
    foreign key (case_id) references public.reunification_cases(id) on delete cascade;

alter table public.reunification_overrides
  drop constraint if exists reunification_overrides_case_id_fkey,
  add constraint reunification_overrides_case_id_fkey
    foreign key (case_id) references public.reunification_cases(id) on delete cascade;

-- Contact sessions: facilitator/admin manage, caseworker/admin review, parent can
-- read only their own session records while actively assigned to the case.
drop policy if exists caseworker_read_contact_sessions on public.contact_sessions;
create policy caseworker_read_contact_sessions on public.contact_sessions
for select to authenticated
using (
  public.user_has_case_role(case_id, array['caseworker', 'admin']::text[])
);

drop policy if exists facilitator_manage_contact_sessions on public.contact_sessions;
create policy facilitator_manage_contact_sessions on public.contact_sessions
for all to authenticated
using (
  public.user_has_case_role(case_id, array['facilitator', 'admin']::text[])
)
with check (
  public.user_has_case_role(case_id, array['facilitator', 'admin']::text[])
);

drop policy if exists parent_read_contact_sessions on public.contact_sessions;
create policy parent_read_contact_sessions on public.contact_sessions
for select to authenticated
using (
  parent_id = public.safesteps_auth_profile_id()
  and public.user_has_active_case_membership(case_id)
);

-- Recommendations: facilitator/admin create/manage their own recommendations;
-- caseworker/admin can review recommendations for assigned cases.
drop policy if exists caseworker_read_recommendations on public.reunification_recommendations;
create policy caseworker_read_recommendations on public.reunification_recommendations
for select to authenticated
using (
  public.user_has_case_role(case_id, array['caseworker', 'admin']::text[])
);

drop policy if exists facilitator_manage_recommendations on public.reunification_recommendations;
create policy facilitator_manage_recommendations on public.reunification_recommendations
for all to authenticated
using (
  public.user_has_case_role(case_id, array['facilitator', 'admin']::text[])
  and facilitator_id = public.safesteps_auth_profile_id()
)
with check (
  public.user_has_case_role(case_id, array['facilitator', 'admin']::text[])
  and facilitator_id = public.safesteps_auth_profile_id()
);

-- Overrides: caseworker/admin manage their own override decisions; facilitators
-- can read overrides for cases they are actively assigned to.
drop policy if exists caseworker_manage_overrides on public.reunification_overrides;
create policy caseworker_manage_overrides on public.reunification_overrides
for all to authenticated
using (
  public.user_has_case_role(case_id, array['caseworker', 'admin']::text[])
  and caseworker_id = public.safesteps_auth_profile_id()
)
with check (
  public.user_has_case_role(case_id, array['caseworker', 'admin']::text[])
  and caseworker_id = public.safesteps_auth_profile_id()
);

drop policy if exists facilitator_read_overrides on public.reunification_overrides;
create policy facilitator_read_overrides on public.reunification_overrides
for select to authenticated
using (
  public.user_has_case_role(case_id, array['facilitator', 'admin']::text[])
);
