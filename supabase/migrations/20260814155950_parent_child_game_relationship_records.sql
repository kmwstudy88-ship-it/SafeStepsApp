create table public.relationship_game_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  relationship_assessment_id uuid not null references public.relationship_assessments(id) on delete cascade,
  child_game_session_id uuid references public.child_game_sessions(id) on delete set null,
  game_catalog_id text not null,
  context text not null,
  facilitator_user_id uuid references auth.users(id) on delete set null,
  privacy_mode text not null default 'family_only'
    check (privacy_mode in ('family_only','worker_supported')),
  participation_voluntary boolean not null default true,
  child_stop_or_pass_respected boolean not null default true,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_by_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (game_catalog_id ~ '^game_([1-9]|[1-9][0-9]|1[0-4][0-9]|150)$'),
  check (completed_at is null or completed_at >= started_at)
);

create table public.relationship_dimension_observations (
  id uuid primary key default extensions.gen_random_uuid(),
  relationship_assessment_id uuid not null references public.relationship_assessments(id) on delete cascade,
  relationship_game_session_id uuid references public.relationship_game_sessions(id) on delete set null,
  dimension text not null check (dimension in (
    'attunement','responsiveness','co_regulation','communication',
    'boundaries','repair','child_agency','shared_enjoyment'
  )),
  rating integer not null check (rating between 0 and 4),
  behaviour_anchor text not null check (length(trim(behaviour_anchor)) >= 10),
  observation_context text not null,
  observer_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  observer_role text not null,
  observed_at timestamptz not null default now(),
  evidence_reference text,
  shared_child_voice_reference uuid,
  child_private_content_included boolean not null default false
    check (child_private_content_included = false),
  created_at timestamptz not null default now()
);

create table public.relationship_review_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  relationship_assessment_id uuid not null references public.relationship_assessments(id) on delete cascade,
  analysis_version text not null,
  session_count integer not null check (session_count >= 0),
  context_count integer not null check (context_count >= 0),
  observation_count integer not null check (observation_count >= 0),
  analysis_snapshot jsonb not null,
  analysis_hash text generated always as (
    encode(extensions.digest(analysis_snapshot::text, 'sha256'), 'hex')
  ) stored,
  review_status text not null default 'draft'
    check (review_status in ('draft','reviewed','finalised','rejected')),
  reviewed_by_user_id uuid references auth.users(id) on delete restrict,
  reviewed_at timestamptz,
  professional_rationale text,
  automated_parenting_capacity_conclusion_permitted boolean not null default false
    check (automated_parenting_capacity_conclusion_permitted = false),
  decision_boundary text not null default
    'Observations describe patterns across contexts and time. They cannot independently determine parenting capacity, contact, removal, abuse, or case outcome.',
  created_by_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (
    review_status = 'draft'
    or (
      reviewed_by_user_id is not null
      and reviewed_at is not null
      and length(trim(coalesce(professional_rationale, ''))) >= 20
    )
  ),
  check (
    review_status <> 'finalised'
    or (session_count >= 3 and context_count >= 2)
  ),
  check (coalesce((analysis_snapshot ->> 'automatedParentingCapacityConclusionPermitted')::boolean, false) = false)
);

create index relationship_game_sessions_assessment_started_idx
  on public.relationship_game_sessions(relationship_assessment_id, started_at desc);
create index relationship_dimension_observations_assessment_observed_idx
  on public.relationship_dimension_observations(relationship_assessment_id, observed_at desc);
create index relationship_dimension_observations_session_idx
  on public.relationship_dimension_observations(relationship_game_session_id);
create index relationship_review_snapshots_assessment_created_idx
  on public.relationship_review_snapshots(relationship_assessment_id, created_at desc);

create or replace function private.reject_relationship_evidence_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'SafeSteps relationship observations and review snapshots are append-only';
end;
$$;

revoke all on function private.reject_relationship_evidence_mutation() from public, anon, authenticated;

create trigger relationship_dimension_observations_no_update_delete
  before update or delete on public.relationship_dimension_observations
  for each row execute function private.reject_relationship_evidence_mutation();
create trigger relationship_review_snapshots_no_update_delete
  before update or delete on public.relationship_review_snapshots
  for each row execute function private.reject_relationship_evidence_mutation();

alter table public.relationship_game_sessions enable row level security;
alter table public.relationship_dimension_observations enable row level security;
alter table public.relationship_review_snapshots enable row level security;

create policy relationship_game_sessions_select
on public.relationship_game_sessions for select to authenticated
using (
  exists (
    select 1 from public.relationship_assessments assessment
    where assessment.id = relationship_assessment_id
      and (
        assessment.owner_id = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

create policy relationship_game_sessions_insert
on public.relationship_game_sessions for insert to authenticated
with check (
  created_by_user_id = (select auth.uid())
  and exists (
    select 1 from public.relationship_assessments assessment
    where assessment.id = relationship_assessment_id
      and (
        assessment.owner_id = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

create policy relationship_game_sessions_update
on public.relationship_game_sessions for update to authenticated
using (
  created_by_user_id = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  created_by_user_id = (select auth.uid())
  or public.can_manage_assessments()
);

create policy relationship_dimension_observations_select
on public.relationship_dimension_observations for select to authenticated
using (
  exists (
    select 1 from public.relationship_assessments assessment
    where assessment.id = relationship_assessment_id
      and (
        assessment.owner_id = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

create policy relationship_dimension_observations_insert
on public.relationship_dimension_observations for insert to authenticated
with check (
  observer_user_id = (select auth.uid())
  and exists (
    select 1 from public.relationship_assessments assessment
    where assessment.id = relationship_assessment_id
      and (
        assessment.owner_id = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

create policy relationship_review_snapshots_select
on public.relationship_review_snapshots for select to authenticated
using (
  exists (
    select 1 from public.relationship_assessments assessment
    where assessment.id = relationship_assessment_id
      and (
        assessment.owner_id = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

create policy relationship_review_snapshots_insert
on public.relationship_review_snapshots for insert to authenticated
with check (
  created_by_user_id = (select auth.uid())
  and public.can_manage_assessments()
);

revoke all on public.relationship_game_sessions from anon;
revoke all on public.relationship_dimension_observations from anon;
revoke all on public.relationship_review_snapshots from anon;
revoke all on public.relationship_game_sessions from authenticated;
revoke all on public.relationship_dimension_observations from authenticated;
revoke all on public.relationship_review_snapshots from authenticated;

grant select, insert, update on public.relationship_game_sessions to authenticated;
grant select, insert on public.relationship_dimension_observations to authenticated;
grant select, insert on public.relationship_review_snapshots to authenticated;

comment on table public.relationship_game_sessions is
  'Links the 150-game relationship assessment library to structured parent-child observations; not curriculum.';
comment on column public.relationship_dimension_observations.child_private_content_included is
  'Must remain false. Private child reflections are never copied into relationship observations.';
