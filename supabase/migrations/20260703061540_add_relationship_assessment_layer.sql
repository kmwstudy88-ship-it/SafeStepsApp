-- Relationship assessment layer for parent-child and co-parenting observations.
-- This complements the generic assessment tables with relationship-specific
-- narrative and scoring records that can be surfaced in case reviews.

create table if not exists public.relationship_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  owner_id uuid not null default auth.uid(),
  parent_profile_id uuid references public.parent_profiles(id) on delete set null,
  relationship_type text not null default 'parent_child'
    check (relationship_type in ('parent_child', 'co_parenting', 'family_system', 'support_network')),
  assessment_date date not null default current_date,
  context text,
  strengths text,
  concerns text,
  child_voice_summary text,
  repair_capacity_score integer check (repair_capacity_score between 0 and 4),
  attunement_score integer check (attunement_score between 0 and 4),
  emotional_safety_score integer check (emotional_safety_score between 0 and 4),
  boundary_score integer check (boundary_score between 0 and 4),
  reviewer_notes text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.relationship_observations (
  id uuid primary key default gen_random_uuid(),
  relationship_assessment_id uuid not null references public.relationship_assessments(id) on delete cascade,
  owner_id uuid not null default auth.uid(),
  observation_type text not null default 'session'
    check (observation_type in ('session', 'contact_visit', 'home_visit', 'collateral', 'child_shared_item', 'worker_note')),
  observed_at timestamptz not null default now(),
  setting text,
  observed_behavior text not null,
  child_response text,
  safety_or_risk_notes text,
  evidence_reference text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.relationship_assessments enable row level security;
alter table public.relationship_observations enable row level security;

create index if not exists idx_relationship_assessments_case
  on public.relationship_assessments(case_id, assessment_date desc);

create index if not exists idx_relationship_assessments_owner
  on public.relationship_assessments(owner_id);

create index if not exists idx_relationship_observations_assessment
  on public.relationship_observations(relationship_assessment_id, observed_at desc);

create index if not exists idx_relationship_observations_owner
  on public.relationship_observations(owner_id);

drop trigger if exists set_relationship_assessments_updated_at on public.relationship_assessments;
create trigger set_relationship_assessments_updated_at
  before update on public.relationship_assessments
  for each row execute function public.set_updated_at();

drop policy if exists relationship_assessments_select on public.relationship_assessments;
create policy relationship_assessments_select on public.relationship_assessments
  for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    or public.can_manage_assessments()
  );

drop policy if exists relationship_assessments_insert on public.relationship_assessments;
create policy relationship_assessments_insert on public.relationship_assessments
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    or public.can_manage_assessments()
  );

drop policy if exists relationship_assessments_update on public.relationship_assessments;
create policy relationship_assessments_update on public.relationship_assessments
  for update
  to authenticated
  using (
    (select auth.uid()) = owner_id
    or public.can_manage_assessments()
  )
  with check (
    (select auth.uid()) = owner_id
    or public.can_manage_assessments()
  );

drop policy if exists relationship_observations_select on public.relationship_observations;
create policy relationship_observations_select on public.relationship_observations
  for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    or public.can_manage_assessments()
  );

drop policy if exists relationship_observations_insert on public.relationship_observations;
create policy relationship_observations_insert on public.relationship_observations
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    or public.can_manage_assessments()
  );

drop policy if exists relationship_observations_update on public.relationship_observations;
create policy relationship_observations_update on public.relationship_observations
  for update
  to authenticated
  using (
    (select auth.uid()) = owner_id
    or public.can_manage_assessments()
  )
  with check (
    (select auth.uid()) = owner_id
    or public.can_manage_assessments()
  );
