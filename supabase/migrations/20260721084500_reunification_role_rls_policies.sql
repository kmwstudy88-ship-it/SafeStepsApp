-- SafeSteps role-based RLS for normalized reunification, quest, achievement, and contact tables.

create or replace function public.safesteps_auth_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid() or p.id = auth.uid()
  limit 1;
$$;

create or replace function public.safesteps_auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.auth_user_id = auth.uid() or p.id = auth.uid()
  limit 1;
$$;

create or replace function public.safesteps_has_case_access(target_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.safesteps_auth_role() = 'admin'
    or exists (
      select 1
      from public.profiles p
      where p.id = public.safesteps_auth_profile_id()
      and p.case_id = target_case_id
    )
    or exists (
      select 1
      from public.profile_cases pc
      where pc.profile_id = public.safesteps_auth_profile_id()
      and pc.case_id = target_case_id
    );
$$;

alter table public.profiles enable row level security;
alter table public.profile_cases enable row level security;
alter table public.cases enable row level security;
alter table public.contact_sessions enable row level security;
alter table public.facilitator_observations enable row level security;
alter table public.assessment_records enable row level security;
alter table public.quests enable row level security;
alter table public.quest_progress enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.reunification_recommendations enable row level security;
alter table public.reunification_overrides enable row level security;

-- Retire broad bootstrap policies from the schema migration before applying the
-- role-separated production policies below.
drop policy if exists cases_assigned_case_access on public.cases;
drop policy if exists profile_cases_assigned_access on public.profile_cases;
drop policy if exists contact_sessions_case_access on public.contact_sessions;
drop policy if exists facilitator_observations_session_access on public.facilitator_observations;
drop policy if exists quests_read_authenticated on public.quests;
drop policy if exists quests_manage_admin on public.quests;
drop policy if exists achievements_read_authenticated on public.achievements;
drop policy if exists achievements_manage_admin on public.achievements;
drop policy if exists quest_progress_case_access on public.quest_progress;
drop policy if exists user_achievements_case_access on public.user_achievements;
drop policy if exists user_achievements_manage_system on public.user_achievements;
drop policy if exists reunification_recommendations_case_access on public.reunification_recommendations;
drop policy if exists reunification_overrides_caseworker_access on public.reunification_overrides;

drop policy if exists parent_read_own_profile on public.profiles;
create policy parent_read_own_profile on public.profiles
for select to authenticated
using (id = public.safesteps_auth_profile_id());

drop policy if exists staff_read_assigned_profiles on public.profiles;
create policy staff_read_assigned_profiles on public.profiles
for select to authenticated
using (
  public.safesteps_auth_role() in ('facilitator', 'caseworker', 'admin')
  and (
    public.safesteps_auth_role() = 'admin'
    or public.safesteps_has_case_access(case_id)
  )
);

drop policy if exists caseworker_update_parent_stage_fields on public.profiles;
create policy caseworker_update_parent_stage_fields on public.profiles
for update to authenticated
using (
  public.safesteps_auth_role() in ('caseworker', 'admin')
  and (
    public.safesteps_auth_role() = 'admin'
    or public.safesteps_has_case_access(case_id)
  )
)
with check (
  public.safesteps_auth_role() in ('caseworker', 'admin')
  and (
    public.safesteps_auth_role() = 'admin'
    or public.safesteps_has_case_access(case_id)
  )
);

drop policy if exists read_own_or_admin_profile_cases on public.profile_cases;
create policy read_own_or_admin_profile_cases on public.profile_cases
for select to authenticated
using (
  profile_id = public.safesteps_auth_profile_id()
  or public.safesteps_auth_role() = 'admin'
);

drop policy if exists admin_manage_profile_cases on public.profile_cases;
create policy admin_manage_profile_cases on public.profile_cases
for all to authenticated
using (public.safesteps_auth_role() = 'admin')
with check (public.safesteps_auth_role() = 'admin');

drop policy if exists assigned_case_read on public.cases;
create policy assigned_case_read on public.cases
for select to authenticated
using (public.safesteps_has_case_access(id));

drop policy if exists admin_manage_cases on public.cases;
create policy admin_manage_cases on public.cases
for all to authenticated
using (public.safesteps_auth_role() = 'admin')
with check (public.safesteps_auth_role() = 'admin');

drop policy if exists parent_read_contact_sessions on public.contact_sessions;
create policy parent_read_contact_sessions on public.contact_sessions
for select to authenticated
using (parent_id = public.safesteps_auth_profile_id());

drop policy if exists facilitator_manage_contact_sessions on public.contact_sessions;
create policy facilitator_manage_contact_sessions on public.contact_sessions
for all to authenticated
using (
  public.safesteps_auth_role() in ('facilitator', 'admin')
  and public.safesteps_has_case_access(case_id)
)
with check (
  public.safesteps_auth_role() in ('facilitator', 'admin')
  and public.safesteps_has_case_access(case_id)
);

drop policy if exists caseworker_read_contact_sessions on public.contact_sessions;
create policy caseworker_read_contact_sessions on public.contact_sessions
for select to authenticated
using (
  public.safesteps_auth_role() in ('caseworker', 'admin')
  and public.safesteps_has_case_access(case_id)
);

drop policy if exists facilitator_manage_observations on public.facilitator_observations;
create policy facilitator_manage_observations on public.facilitator_observations
for all to authenticated
using (
  public.safesteps_auth_role() in ('facilitator', 'admin')
  and exists (
    select 1 from public.contact_sessions cs
    where cs.id = session_id
    and public.safesteps_has_case_access(cs.case_id)
  )
)
with check (
  public.safesteps_auth_role() in ('facilitator', 'admin')
  and exists (
    select 1 from public.contact_sessions cs
    where cs.id = session_id
    and public.safesteps_has_case_access(cs.case_id)
  )
);

drop policy if exists caseworker_read_observations on public.facilitator_observations;
create policy caseworker_read_observations on public.facilitator_observations
for select to authenticated
using (
  public.safesteps_auth_role() in ('caseworker', 'admin')
  and exists (
    select 1 from public.contact_sessions cs
    where cs.id = session_id
    and public.safesteps_has_case_access(cs.case_id)
  )
);

drop policy if exists parent_manage_own_assessment_records on public.assessment_records;
create policy parent_manage_own_assessment_records on public.assessment_records
for all to authenticated
using (user_id = public.safesteps_auth_profile_id())
with check (user_id = public.safesteps_auth_profile_id());

drop policy if exists facilitator_manage_case_assessment_records on public.assessment_records;
create policy facilitator_manage_case_assessment_records on public.assessment_records
for all to authenticated
using (
  public.safesteps_auth_role() in ('facilitator', 'admin')
  and public.safesteps_has_case_access(case_id)
)
with check (
  public.safesteps_auth_role() in ('facilitator', 'admin')
  and public.safesteps_has_case_access(case_id)
);

drop policy if exists caseworker_read_case_assessment_records on public.assessment_records;
create policy caseworker_read_case_assessment_records on public.assessment_records
for select to authenticated
using (
  public.safesteps_auth_role() in ('caseworker', 'admin')
  and public.safesteps_has_case_access(case_id)
);

drop policy if exists read_quests on public.quests;
create policy read_quests on public.quests
for select to authenticated
using (true);

drop policy if exists admin_manage_quests on public.quests;
create policy admin_manage_quests on public.quests
for all to authenticated
using (public.safesteps_auth_role() = 'admin')
with check (public.safesteps_auth_role() = 'admin');

drop policy if exists parent_manage_own_quest_progress on public.quest_progress;
create policy parent_manage_own_quest_progress on public.quest_progress
for all to authenticated
using (user_id = public.safesteps_auth_profile_id())
with check (user_id = public.safesteps_auth_profile_id());

drop policy if exists staff_read_case_quest_progress on public.quest_progress;
create policy staff_read_case_quest_progress on public.quest_progress
for select to authenticated
using (
  public.safesteps_auth_role() in ('facilitator', 'caseworker', 'admin')
  and public.safesteps_has_case_access(case_id)
);

drop policy if exists read_achievements on public.achievements;
create policy read_achievements on public.achievements
for select to authenticated
using (true);

drop policy if exists admin_manage_achievements on public.achievements;
create policy admin_manage_achievements on public.achievements
for all to authenticated
using (public.safesteps_auth_role() = 'admin')
with check (public.safesteps_auth_role() = 'admin');

drop policy if exists parent_read_own_user_achievements on public.user_achievements;
create policy parent_read_own_user_achievements on public.user_achievements
for select to authenticated
using (user_id = public.safesteps_auth_profile_id());

drop policy if exists staff_read_case_user_achievements on public.user_achievements;
create policy staff_read_case_user_achievements on public.user_achievements
for select to authenticated
using (
  public.safesteps_auth_role() in ('facilitator', 'caseworker', 'admin')
  and public.safesteps_has_case_access(case_id)
);

drop policy if exists admin_manage_user_achievements on public.user_achievements;
create policy admin_manage_user_achievements on public.user_achievements
for all to authenticated
using (public.safesteps_auth_role() = 'admin')
with check (public.safesteps_auth_role() = 'admin');

drop policy if exists facilitator_manage_recommendations on public.reunification_recommendations;
create policy facilitator_manage_recommendations on public.reunification_recommendations
for all to authenticated
using (
  public.safesteps_auth_role() in ('facilitator', 'admin')
  and facilitator_id = public.safesteps_auth_profile_id()
)
with check (
  public.safesteps_auth_role() in ('facilitator', 'admin')
  and public.safesteps_has_case_access(case_id)
);

drop policy if exists caseworker_read_recommendations on public.reunification_recommendations;
create policy caseworker_read_recommendations on public.reunification_recommendations
for select to authenticated
using (
  public.safesteps_auth_role() in ('caseworker', 'admin')
  and public.safesteps_has_case_access(case_id)
);

drop policy if exists caseworker_manage_overrides on public.reunification_overrides;
create policy caseworker_manage_overrides on public.reunification_overrides
for all to authenticated
using (
  public.safesteps_auth_role() in ('caseworker', 'admin')
  and caseworker_id = public.safesteps_auth_profile_id()
)
with check (
  public.safesteps_auth_role() in ('caseworker', 'admin')
  and public.safesteps_has_case_access(case_id)
);

drop policy if exists facilitator_read_overrides on public.reunification_overrides;
create policy facilitator_read_overrides on public.reunification_overrides
for select to authenticated
using (
  public.safesteps_auth_role() in ('facilitator', 'admin')
  and public.safesteps_has_case_access(case_id)
);
