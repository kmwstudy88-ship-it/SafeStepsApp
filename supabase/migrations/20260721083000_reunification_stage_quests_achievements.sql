-- SafeSteps stage-gated reunification, mini-quest, achievement, and evidence schema.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists auth_user_id uuid,
  add column if not exists avatar_url text,
  add column if not exists onboarding_status text not null default 'not_started',
  add column if not exists parenting_stage text,
  add column if not exists contact_stage text,
  add column if not exists risk_level text,
  add column if not exists case_id uuid,
  add column if not exists achievement_state jsonb,
  add column if not exists quest_state jsonb;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('parent', 'facilitator', 'caseworker', 'admin', 'worker'));

alter table public.profiles
  add constraint profiles_contact_stage_check
  check (
    contact_stage is null
    or contact_stage in ('no_contact', 'supervised', 'semi_supervised', 'unsupervised', 'overnight', 'return_home_trial')
  );

alter table public.profiles
  add constraint profiles_risk_level_check
  check (risk_level is null or risk_level in ('low', 'medium', 'high', 'critical'));

create unique index if not exists profiles_auth_user_id_unique
  on public.profiles(auth_user_id)
  where auth_user_id is not null;

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  court_reference text,
  status text not null default 'active',
  created_at timestamptz default now()
);

alter table public.profiles drop constraint if exists profiles_case_id_fkey;
alter table public.profiles
  add constraint profiles_case_id_fkey
  foreign key (case_id) references public.cases(id) not valid;

create table if not exists public.profile_cases (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique(profile_id, case_id)
);

create index if not exists idx_profile_cases_profile on public.profile_cases(profile_id);
create index if not exists idx_profile_cases_case on public.profile_cases(case_id);

create table if not exists public.contact_sessions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  parent_id uuid not null references public.profiles(id),
  facilitator_id uuid references public.profiles(id),
  stage text not null check (
    stage in ('no_contact', 'supervised', 'semi_supervised', 'unsupervised', 'overnight', 'return_home_trial')
  ),
  session_date timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0),
  child_comfort_score integer check (child_comfort_score between 1 and 5),
  child_distress_score integer check (child_distress_score between 1 and 5),
  parent_regulation_score integer check (parent_regulation_score between 1 and 5),
  facilitator_intervention_count integer not null default 0 check (facilitator_intervention_count >= 0),
  facilitator_unsafe_to_escalate boolean not null default false,
  notes text,
  risk_flags jsonb,
  skill_evidence jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_contact_sessions_case on public.contact_sessions(case_id);
create index if not exists idx_contact_sessions_parent on public.contact_sessions(parent_id);
create index if not exists idx_contact_sessions_case_stage_date on public.contact_sessions(case_id, stage, session_date desc);

create table if not exists public.facilitator_observations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.contact_sessions(id) on delete cascade,
  attunement_score integer check (attunement_score between 1 and 5),
  boundary_respect_score integer check (boundary_respect_score between 1 and 5),
  repair_attempts_score integer check (repair_attempts_score between 1 and 5),
  emotional_regulation_score integer check (emotional_regulation_score between 1 and 5),
  observation_payload jsonb,
  risk_flags jsonb,
  created_at timestamptz default now()
);

alter table public.assessment_records
  add column if not exists user_id uuid references public.profiles(id),
  add column if not exists lesson_id text,
  add column if not exists quest_id uuid,
  add column if not exists evidence_type text,
  add column if not exists evidence_payload jsonb,
  add column if not exists score numeric,
  add column if not exists risk_flags jsonb,
  add column if not exists validated_by uuid references public.profiles(id),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_assessment_records_user on public.assessment_records(user_id);
create index if not exists idx_assessment_records_case on public.assessment_records(case_id);
create index if not exists idx_assessment_records_quest on public.assessment_records(quest_id);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text not null,
  case_stage text,
  required_evidence jsonb not null,
  auto_validation_rules jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.quest_progress (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id),
  user_id uuid not null references public.profiles(id),
  case_id uuid not null references public.cases(id) on delete cascade,
  status text not null check (status in ('active', 'completed', 'failed')),
  progress_payload jsonb,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(quest_id, user_id, case_id)
);

create index if not exists idx_quest_progress_user on public.quest_progress(user_id);
create index if not exists idx_quest_progress_case on public.quest_progress(case_id);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text not null,
  criteria jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references public.achievements(id),
  user_id uuid not null references public.profiles(id),
  case_id uuid not null references public.cases(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  meta jsonb,
  unique(achievement_id, user_id, case_id)
);

create index if not exists idx_user_achievements_user on public.user_achievements(user_id);
create index if not exists idx_user_achievements_case on public.user_achievements(case_id);

create table if not exists public.reunification_recommendations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  parent_id uuid not null references public.profiles(id),
  facilitator_id uuid references public.profiles(id),
  current_stage text not null,
  recommended_stage text not null,
  risk_level text,
  reasons jsonb not null,
  hard_blocks jsonb,
  required_interventions jsonb,
  created_at timestamptz default now()
);

create table if not exists public.reunification_overrides (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  parent_id uuid not null references public.profiles(id),
  caseworker_id uuid not null references public.profiles(id),
  override_type text not null check (override_type in ('hold', 'force_escalation', 'force_regression')),
  target_stage text,
  reason text not null,
  created_at timestamptz default now()
);

alter table public.cases enable row level security;
alter table public.profile_cases enable row level security;
alter table public.contact_sessions enable row level security;
alter table public.facilitator_observations enable row level security;
alter table public.quests enable row level security;
alter table public.quest_progress enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.reunification_recommendations enable row level security;
alter table public.reunification_overrides enable row level security;

drop policy if exists cases_assigned_case_access on public.cases;
create policy cases_assigned_case_access on public.cases
for all to authenticated
using (
  exists (
    select 1 from public.profile_cases pc
    join public.profiles p on p.id = pc.profile_id
    where pc.case_id = cases.id
    and (p.id = auth.uid() or p.auth_user_id = auth.uid())
  )
  or public.can_manage_assessments()
)
with check (public.can_manage_assessments());

drop policy if exists profile_cases_assigned_access on public.profile_cases;
create policy profile_cases_assigned_access on public.profile_cases
for all to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_cases.profile_id
    and (p.id = auth.uid() or p.auth_user_id = auth.uid())
  )
  or public.can_manage_assessments()
)
with check (public.can_manage_assessments());

drop policy if exists contact_sessions_case_access on public.contact_sessions;
create policy contact_sessions_case_access on public.contact_sessions
for all to authenticated
using (
  parent_id = auth.uid()
  or facilitator_id = auth.uid()
  or exists (
    select 1 from public.profile_cases pc
    join public.profiles p on p.id = pc.profile_id
    where pc.case_id = contact_sessions.case_id
    and (p.id = auth.uid() or p.auth_user_id = auth.uid())
  )
  or public.can_manage_assessments()
)
with check (
  facilitator_id = auth.uid()
  or public.can_manage_assessments()
);

drop policy if exists facilitator_observations_session_access on public.facilitator_observations;
create policy facilitator_observations_session_access on public.facilitator_observations
for all to authenticated
using (
  exists (
    select 1 from public.contact_sessions cs
    where cs.id = facilitator_observations.session_id
    and (
      cs.facilitator_id = auth.uid()
      or exists (
        select 1 from public.profile_cases pc
        join public.profiles p on p.id = pc.profile_id
        where pc.case_id = cs.case_id
        and (p.id = auth.uid() or p.auth_user_id = auth.uid())
      )
      or public.can_manage_assessments()
    )
  )
)
with check (public.can_manage_assessments());

drop policy if exists quests_read_authenticated on public.quests;
create policy quests_read_authenticated on public.quests for select to authenticated using (true);
drop policy if exists quests_manage_admin on public.quests;
create policy quests_manage_admin on public.quests for all to authenticated using (public.can_manage_assessments()) with check (public.can_manage_assessments());

drop policy if exists achievements_read_authenticated on public.achievements;
create policy achievements_read_authenticated on public.achievements for select to authenticated using (true);
drop policy if exists achievements_manage_admin on public.achievements;
create policy achievements_manage_admin on public.achievements for all to authenticated using (public.can_manage_assessments()) with check (public.can_manage_assessments());

drop policy if exists quest_progress_case_access on public.quest_progress;
create policy quest_progress_case_access on public.quest_progress
for all to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profile_cases pc
    join public.profiles p on p.id = pc.profile_id
    where pc.case_id = quest_progress.case_id
    and (p.id = auth.uid() or p.auth_user_id = auth.uid())
  )
  or public.can_manage_assessments()
)
with check (user_id = auth.uid() or public.can_manage_assessments());

drop policy if exists user_achievements_case_access on public.user_achievements;
create policy user_achievements_case_access on public.user_achievements
for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profile_cases pc
    join public.profiles p on p.id = pc.profile_id
    where pc.case_id = user_achievements.case_id
    and (p.id = auth.uid() or p.auth_user_id = auth.uid())
  )
  or public.can_manage_assessments()
);

drop policy if exists user_achievements_manage_system on public.user_achievements;
create policy user_achievements_manage_system on public.user_achievements
for all to authenticated
using (public.can_manage_assessments())
with check (public.can_manage_assessments());

drop policy if exists reunification_recommendations_case_access on public.reunification_recommendations;
create policy reunification_recommendations_case_access on public.reunification_recommendations
for all to authenticated
using (
  parent_id = auth.uid()
  or facilitator_id = auth.uid()
  or exists (
    select 1 from public.profile_cases pc
    join public.profiles p on p.id = pc.profile_id
    where pc.case_id = reunification_recommendations.case_id
    and (p.id = auth.uid() or p.auth_user_id = auth.uid())
  )
  or public.can_manage_assessments()
)
with check (facilitator_id = auth.uid() or public.can_manage_assessments());

drop policy if exists reunification_overrides_caseworker_access on public.reunification_overrides;
create policy reunification_overrides_caseworker_access on public.reunification_overrides
for all to authenticated
using (
  caseworker_id = auth.uid()
  or public.can_manage_assessments()
)
with check (
  caseworker_id = auth.uid()
  or public.can_manage_assessments()
);
