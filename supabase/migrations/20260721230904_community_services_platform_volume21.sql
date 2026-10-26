create extension if not exists pgcrypto;

alter table public.service_providers
  add column if not exists provider_reference text,
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists service_region_codes text[] not null default '{}',
  add column if not exists accessibility_features jsonb not null default '[]'::jsonb,
  add column if not exists cultural_support_features jsonb not null default '[]'::jsonb,
  add column if not exists crisis_access_available boolean not null default false;

create unique index if not exists service_providers_provider_reference_unique
  on public.service_providers(provider_reference)
  where provider_reference is not null;

alter table public.case_service_referrals
  add column if not exists community_service_id uuid,
  add column if not exists worker_user_id uuid references auth.users(id) on delete set null,
  add column if not exists due_date date,
  add column if not exists first_contact_at timestamptz,
  add column if not exists last_attended_at timestamptz,
  add column if not exists next_review_at timestamptz,
  add column if not exists consent_to_contact_provider boolean not null default false,
  add column if not exists attendance_verified boolean not null default false,
  add column if not exists linked_evidence_id uuid,
  add column if not exists linked_document_id uuid,
  add column if not exists review_notes text not null default '',
  add column if not exists alert_generated boolean not null default false,
  add column if not exists access_confirmed_at timestamptz,
  add column if not exists need_addressed_status text not null default 'unknown',
  add column if not exists barrier_summary jsonb not null default '[]'::jsonb,
  add column if not exists family_view_summary text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.case_service_referrals drop constraint if exists case_service_referrals_status_check;
alter table public.case_service_referrals
  add constraint case_service_referrals_status_check check (
    status in (
      'referred',
      'waiting',
      'intake_scheduled',
      'booked',
      'engaged',
      'completed',
      'declined',
      'discontinued',
      'missed',
      'needs_review',
      'access_confirmed',
      'need_addressed',
      'closed'
    )
  );

create table if not exists public.community_service_categories (
  id uuid primary key default gen_random_uuid(),
  category_code text not null unique,
  category_name text not null,
  category_description text not null,
  parent_category_id uuid references public.community_service_categories(id) on delete set null,
  child_friendly_name text,
  icon_reference text,
  sensitive_category boolean not null default false,
  emergency_relevant boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.community_service_providers (
  id uuid primary key default gen_random_uuid(),
  provider_reference text not null unique,
  provider_name text not null,
  legal_entity_name text,
  provider_type text not null,
  registration_number text,
  charity_registration_number text,
  organisation_id uuid references public.organisations(id) on delete set null,
  website_reference text,
  general_email text,
  general_phone text,
  primary_address jsonb,
  postal_address jsonb,
  jurisdiction_codes text[] not null default '{}',
  service_region_codes text[] not null default '{}',
  culturally_specific boolean not null default false,
  cultural_group_codes text[] not null default '{}',
  faith_based boolean not null default false,
  community_controlled boolean not null default false,
  verification_status text not null default 'unverified',
  verified_at timestamptz,
  provider_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_provider_contacts (
  id uuid primary key default gen_random_uuid(),
  community_service_provider_id uuid not null references public.community_service_providers(id) on delete cascade,
  contact_name text,
  contact_role text not null,
  phone_number text,
  email_address text,
  contact_purpose text not null,
  preferred_contact_method text,
  safe_for_sensitive_referrals boolean not null default false,
  after_hours_contact boolean not null default false,
  active boolean not null default true
);

create table if not exists public.community_provider_locations (
  id uuid primary key default gen_random_uuid(),
  community_service_provider_id uuid not null references public.community_service_providers(id) on delete cascade,
  location_reference text not null unique,
  location_name text not null,
  location_type text not null,
  address jsonb,
  latitude numeric,
  longitude numeric,
  service_region_code text,
  timezone_code text not null default 'Australia/Brisbane',
  public_transport_information text,
  parking_information text,
  wheelchair_accessible boolean,
  accessible_toilet_available boolean,
  child_friendly_space boolean,
  private_interview_space boolean,
  protected_location boolean not null default false,
  safety_notes text,
  active boolean not null default true
);

create table if not exists public.community_services (
  id uuid primary key default gen_random_uuid(),
  service_reference text not null unique,
  community_service_provider_id uuid not null references public.community_service_providers(id) on delete cascade,
  service_category_id uuid not null references public.community_service_categories(id) on delete restrict,
  service_name text not null,
  service_description text not null,
  child_friendly_description text,
  service_model text not null,
  delivery_modes text[] not null default '{}',
  target_population_codes text[] not null default '{}',
  supported_age_ranges jsonb not null default '[]'::jsonb,
  supported_language_codes text[] not null default '{}',
  interpreter_available boolean not null default false,
  accessibility_features jsonb not null default '[]'::jsonb,
  cultural_support_features jsonb not null default '[]'::jsonb,
  referral_required boolean not null default false,
  self_referral_allowed boolean not null default true,
  anonymous_access_allowed boolean not null default false,
  cost_type text not null default 'free',
  cost_details text,
  emergency_service boolean not null default false,
  crisis_access_available boolean not null default false,
  active_from date,
  active_until date,
  service_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.case_service_referrals
  drop constraint if exists case_service_referrals_community_service_id_fkey;
alter table public.case_service_referrals
  add constraint case_service_referrals_community_service_id_fkey
  foreign key (community_service_id) references public.community_services(id) on delete set null not valid;

create table if not exists public.community_service_delivery_sites (
  id uuid primary key default gen_random_uuid(),
  community_service_id uuid not null references public.community_services(id) on delete cascade,
  provider_location_id uuid references public.community_provider_locations(id) on delete cascade,
  delivery_mode text not null,
  operating_hours jsonb not null default '{}'::jsonb,
  appointment_required boolean not null default true,
  walk_in_available boolean not null default false,
  after_hours_available boolean not null default false,
  intake_phone text,
  intake_email text,
  booking_url text,
  capacity_status text not null default 'unknown',
  next_available_at timestamptz,
  waitlist_open boolean not null default false,
  active boolean not null default true
);

create table if not exists public.community_service_eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  community_service_id uuid not null references public.community_services(id) on delete cascade,
  rule_code text not null,
  rule_description text not null,
  eligibility_type text not null,
  rule_payload jsonb not null default '{}'::jsonb,
  explanation_text text not null,
  exclusionary boolean not null default false,
  active boolean not null default true,
  unique (community_service_id, rule_code)
);

create table if not exists public.community_service_suitability_rules (
  id uuid primary key default gen_random_uuid(),
  community_service_id uuid not null references public.community_services(id) on delete cascade,
  suitability_code text not null,
  suitability_description text not null,
  factor_type text not null,
  weighting numeric not null default 1,
  rule_payload jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  unique (community_service_id, suitability_code)
);

create table if not exists public.community_service_capacity_snapshots (
  id uuid primary key default gen_random_uuid(),
  community_service_id uuid not null references public.community_services(id) on delete cascade,
  delivery_site_id uuid references public.community_service_delivery_sites(id) on delete set null,
  capacity_status text not null,
  places_available integer,
  waitlist_length integer,
  estimated_wait_days integer,
  accepting_referrals boolean not null default true,
  snapshot_source text not null default 'provider',
  captured_at timestamptz not null default now()
);

create table if not exists public.community_service_information_reviews (
  id uuid primary key default gen_random_uuid(),
  community_service_id uuid not null references public.community_services(id) on delete cascade,
  reviewed_by_user_id uuid references auth.users(id) on delete set null,
  review_type text not null,
  information_current boolean not null default false,
  capacity_current boolean not null default false,
  contact_details_current boolean not null default false,
  review_notes text,
  reviewed_at timestamptz not null default now(),
  next_review_due_at timestamptz
);

create table if not exists public.community_service_search_requests (
  id uuid primary key default gen_random_uuid(),
  search_reference text not null unique,
  case_id uuid references public.cases(id) on delete set null,
  family_id uuid references public.families(id) on delete set null,
  requested_by_user_id uuid references auth.users(id) on delete set null,
  need_categories text[] not null default '{}',
  location_context jsonb not null default '{}'::jsonb,
  accessibility_needs jsonb not null default '[]'::jsonb,
  language_needs text[] not null default '{}',
  cultural_needs jsonb not null default '[]'::jsonb,
  urgency_level text not null default 'routine',
  safety_sensitive boolean not null default false,
  search_status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.community_service_match_results (
  id uuid primary key default gen_random_uuid(),
  search_request_id uuid not null references public.community_service_search_requests(id) on delete cascade,
  community_service_id uuid not null references public.community_services(id) on delete cascade,
  match_rank integer not null default 0,
  match_score numeric,
  eligibility_status text not null default 'unknown',
  suitability_status text not null default 'unknown',
  explanation_text text not null,
  barrier_warnings jsonb not null default '[]'::jsonb,
  alternatives_available boolean not null default false,
  selected_for_referral boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.community_service_referrals (
  id uuid primary key default gen_random_uuid(),
  referral_reference text not null unique,
  case_id uuid references public.cases(id) on delete set null,
  family_id uuid references public.families(id) on delete set null,
  parent_user_id uuid references auth.users(id) on delete set null,
  child_id uuid,
  legacy_case_service_referral_id uuid references public.case_service_referrals(id) on delete set null,
  community_service_id uuid not null references public.community_services(id) on delete restrict,
  referred_by_user_id uuid references auth.users(id) on delete set null,
  referral_reason text not null,
  need_summary text not null,
  minimum_necessary_information jsonb not null default '{}'::jsonb,
  safety_sensitive boolean not null default false,
  protected_contact_required boolean not null default false,
  consent_status text not null default 'not_recorded',
  referral_status text not null default 'draft',
  referred_at timestamptz,
  first_access_confirmed_at timestamptz,
  need_addressed_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.community_referral_consents (
  id uuid primary key default gen_random_uuid(),
  community_service_referral_id uuid not null references public.community_service_referrals(id) on delete cascade,
  consent_provider_type text not null,
  consent_provider_reference text,
  information_to_share jsonb not null default '[]'::jsonb,
  information_not_to_share jsonb not null default '[]'::jsonb,
  consent_explanation text not null,
  consent_status text not null default 'pending',
  consented_at timestamptz,
  withdrawn_at timestamptz,
  recorded_by_user_id uuid references auth.users(id) on delete set null
);

create table if not exists public.community_referral_waitlist_records (
  id uuid primary key default gen_random_uuid(),
  community_service_referral_id uuid not null references public.community_service_referrals(id) on delete cascade,
  waitlist_reference text,
  waitlist_status text not null default 'waiting',
  estimated_wait_days integer,
  priority_status text,
  added_at timestamptz not null default now(),
  last_checked_at timestamptz,
  removed_at timestamptz
);

create table if not exists public.community_referral_bookings (
  id uuid primary key default gen_random_uuid(),
  community_service_referral_id uuid not null references public.community_service_referrals(id) on delete cascade,
  delivery_site_id uuid references public.community_service_delivery_sites(id) on delete set null,
  booking_reference text,
  booking_type text not null,
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz,
  attendance_status text not null default 'scheduled',
  non_attendance_context text,
  transport_plan text,
  cost_plan text,
  accessibility_plan text,
  created_at timestamptz not null default now()
);

create table if not exists public.community_referral_engagement_events (
  id uuid primary key default gen_random_uuid(),
  community_service_referral_id uuid not null references public.community_service_referrals(id) on delete cascade,
  event_type text not null,
  event_summary text not null,
  provider_feedback text,
  family_view text,
  verified_fact boolean not null default false,
  occurred_at timestamptz not null default now(),
  recorded_by_user_id uuid references auth.users(id) on delete set null
);

create table if not exists public.community_referral_barriers (
  id uuid primary key default gen_random_uuid(),
  community_service_referral_id uuid not null references public.community_service_referrals(id) on delete cascade,
  barrier_type text not null,
  barrier_description text not null,
  responsible_system_context text,
  family_blame_prohibited boolean not null default true,
  mitigation_plan text,
  barrier_status text not null default 'open',
  recorded_at timestamptz not null default now()
);

create table if not exists public.community_referral_outcomes (
  id uuid primary key default gen_random_uuid(),
  community_service_referral_id uuid not null unique references public.community_service_referrals(id) on delete cascade,
  access_status text not null default 'unknown',
  need_addressed_status text not null default 'unknown',
  outcome_summary text,
  family_view_summary text,
  provider_view_summary text,
  worker_view_summary text,
  verified_outcome_evidence_ids uuid[] not null default '{}',
  further_referral_needed boolean not null default false,
  outcome_recorded_by_user_id uuid references auth.users(id) on delete set null,
  outcome_recorded_at timestamptz not null default now()
);

create table if not exists public.community_service_alternatives (
  id uuid primary key default gen_random_uuid(),
  source_community_service_id uuid not null references public.community_services(id) on delete cascade,
  alternative_community_service_id uuid not null references public.community_services(id) on delete cascade,
  alternative_reason text not null,
  suitability_notes text,
  active boolean not null default true,
  unique (source_community_service_id, alternative_community_service_id)
);

create table if not exists public.community_resource_guides (
  id uuid primary key default gen_random_uuid(),
  guide_reference text not null unique,
  guide_title text not null,
  guide_category_code text not null,
  jurisdiction_codes text[] not null default '{}',
  language_code text not null default 'en-AU',
  child_friendly boolean not null default false,
  plain_language_summary text not null,
  content_payload jsonb not null default '{}'::jsonb,
  lifecycle_status text not null default 'draft',
  reviewed_at timestamptz
);

create table if not exists public.community_service_feedback (
  id uuid primary key default gen_random_uuid(),
  community_service_id uuid not null references public.community_services(id) on delete cascade,
  community_service_referral_id uuid references public.community_service_referrals(id) on delete set null,
  feedback_source_type text not null,
  feedback_source_reference text,
  feedback_text text,
  rating integer,
  access_barriers jsonb not null default '[]'::jsonb,
  culturally_safe_feedback boolean,
  feedback_status text not null default 'received',
  created_at timestamptz not null default now()
);

create table if not exists public.community_service_audit_events (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,
  source_id uuid,
  event_type text not null,
  event_summary text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_community_services_category_status on public.community_services(service_category_id, service_status);
create index if not exists idx_community_services_provider_status on public.community_services(community_service_provider_id, service_status);
create index if not exists idx_community_service_capacity_status on public.community_service_capacity_snapshots(community_service_id, capacity_status, captured_at desc);
create index if not exists idx_community_referrals_case_status on public.community_service_referrals(case_id, referral_status, safety_sensitive);
create index if not exists idx_community_referrals_family_status on public.community_service_referrals(family_id, referral_status);
create index if not exists idx_community_bookings_referral_time on public.community_referral_bookings(community_service_referral_id, scheduled_start_at desc);
create index if not exists idx_community_barriers_referral_status on public.community_referral_barriers(community_service_referral_id, barrier_status);
create index if not exists idx_community_service_audit_source on public.community_service_audit_events(source_table, source_id, occurred_at desc);

create or replace function public.safesteps_can_manage_community_services(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_user_has_role('admin')
    or public.has_resource_permission(p_user_id, 'global', null, 'community_services.manage')
    or public.has_resource_permission(p_user_id, 'global', null, 'service_directory.manage'),
    false
  );
$$;

create or replace function public.safesteps_can_access_community_referral(p_user_id uuid, p_referral_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_service_referrals r
    where r.id = p_referral_id
      and (
        r.parent_user_id = p_user_id
        or r.referred_by_user_id = p_user_id
        or public.safesteps_can_manage_community_services(p_user_id)
        or (r.case_id is not null and public.safesteps_can_access_case_v19(p_user_id, r.case_id))
      )
  );
$$;

create or replace function public.can_send_community_referral(p_referral_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_service_referrals r
    join public.community_services s on s.id = r.community_service_id
    where r.id = p_referral_id
      and r.referral_status in ('draft', 'ready')
      and r.need_summary is not null
      and length(trim(r.need_summary)) > 0
      and r.consent_status in ('consented', 'not_required')
      and jsonb_typeof(r.minimum_necessary_information) = 'object'
      and s.service_status = 'active'
      and (
        r.safety_sensitive = false
        or r.protected_contact_required = true
      )
  );
$$;

create or replace function public.can_close_community_referral(p_referral_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_service_referrals r
    join public.community_referral_outcomes o on o.community_service_referral_id = r.id
    where r.id = p_referral_id
      and o.access_status in ('accessed', 'alternative_accessed', 'not_needed')
      and o.need_addressed_status in ('addressed', 'partly_addressed', 'alternative_needed')
      and o.family_view_summary is not null
      and not exists (
        select 1
        from public.community_referral_barriers b
        where b.community_service_referral_id = r.id
          and b.barrier_status in ('open', 'unresolved')
      )
  );
$$;

create or replace function public.community_referral_needs_follow_up(p_referral_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_service_referrals r
    where r.id = p_referral_id
      and r.referral_status not in ('closed', 'cancelled')
      and (
        r.first_access_confirmed_at is null
        or exists (
          select 1 from public.community_referral_barriers b
          where b.community_service_referral_id = r.id
            and b.barrier_status in ('open', 'unresolved')
        )
        or exists (
          select 1 from public.community_referral_waitlist_records w
          where w.community_service_referral_id = r.id
            and w.waitlist_status = 'waiting'
            and (w.last_checked_at is null or w.last_checked_at < now() - interval '14 days')
        )
      )
  );
$$;

revoke all on function public.safesteps_can_manage_community_services(uuid) from public;
revoke all on function public.safesteps_can_access_community_referral(uuid, uuid) from public;
revoke all on function public.can_send_community_referral(uuid) from public;
revoke all on function public.can_close_community_referral(uuid) from public;
revoke all on function public.community_referral_needs_follow_up(uuid) from public;
grant execute on function public.safesteps_can_manage_community_services(uuid) to authenticated;
grant execute on function public.safesteps_can_access_community_referral(uuid, uuid) to authenticated;
grant execute on function public.can_send_community_referral(uuid) to authenticated;
grant execute on function public.can_close_community_referral(uuid) to authenticated;
grant execute on function public.community_referral_needs_follow_up(uuid) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'community_service_categories',
    'community_service_providers',
    'community_provider_contacts',
    'community_provider_locations',
    'community_services',
    'community_service_delivery_sites',
    'community_service_eligibility_rules',
    'community_service_suitability_rules',
    'community_service_capacity_snapshots',
    'community_service_information_reviews',
    'community_service_search_requests',
    'community_service_match_results',
    'community_service_referrals',
    'community_referral_consents',
    'community_referral_waitlist_records',
    'community_referral_bookings',
    'community_referral_engagement_events',
    'community_referral_barriers',
    'community_referral_outcomes',
    'community_service_alternatives',
    'community_resource_guides',
    'community_service_feedback',
    'community_service_audit_events'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

grant select, insert, update on
  public.community_service_categories,
  public.community_service_providers,
  public.community_provider_contacts,
  public.community_provider_locations,
  public.community_services,
  public.community_service_delivery_sites,
  public.community_service_eligibility_rules,
  public.community_service_suitability_rules,
  public.community_service_capacity_snapshots,
  public.community_service_information_reviews,
  public.community_service_search_requests,
  public.community_service_match_results,
  public.community_service_referrals,
  public.community_referral_consents,
  public.community_referral_waitlist_records,
  public.community_referral_bookings,
  public.community_referral_engagement_events,
  public.community_referral_barriers,
  public.community_referral_outcomes,
  public.community_service_alternatives,
  public.community_resource_guides,
  public.community_service_feedback,
  public.community_service_audit_events
to authenticated;

create policy "Community service categories readable" on public.community_service_categories for select to authenticated using (active = true or public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community service categories managed" on public.community_service_categories for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid())) with check (public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community providers readable" on public.community_service_providers for select to authenticated using (provider_status = 'active' or public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community providers managed" on public.community_service_providers for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid())) with check (public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community provider contacts managed" on public.community_provider_contacts for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid())) with check (public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community provider locations readable" on public.community_provider_locations for select to authenticated using (active = true and protected_location = false or public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community provider locations managed" on public.community_provider_locations for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid())) with check (public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community services readable" on public.community_services for select to authenticated using (service_status = 'active' or public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community services managed" on public.community_services for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid())) with check (public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community service children readable" on public.community_service_delivery_sites for select to authenticated using (active = true or public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community service children managed" on public.community_service_delivery_sites for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid())) with check (public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community service rules readable" on public.community_service_eligibility_rules for select to authenticated using (active = true or public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community service suitability readable" on public.community_service_suitability_rules for select to authenticated using (active = true or public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community service operational info readable" on public.community_service_capacity_snapshots for select to authenticated using (true);
create policy "Community service operational info managed" on public.community_service_capacity_snapshots for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid())) with check (public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community service reviews managed" on public.community_service_information_reviews for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid()) or reviewed_by_user_id = auth.uid()) with check (public.safesteps_can_manage_community_services(auth.uid()) or reviewed_by_user_id = auth.uid());
create policy "Community searches accessible" on public.community_service_search_requests for all to authenticated using (requested_by_user_id = auth.uid() or public.safesteps_can_manage_community_services(auth.uid()) or (case_id is not null and public.safesteps_can_access_case_v19(auth.uid(), case_id))) with check (requested_by_user_id = auth.uid() or public.safesteps_can_manage_community_services(auth.uid()) or (case_id is not null and public.safesteps_can_access_case_v19(auth.uid(), case_id)));
create policy "Community matches through search" on public.community_service_match_results for all to authenticated using (exists (select 1 from public.community_service_search_requests s where s.id = search_request_id and (s.requested_by_user_id = auth.uid() or public.safesteps_can_manage_community_services(auth.uid()) or (s.case_id is not null and public.safesteps_can_access_case_v19(auth.uid(), s.case_id))))) with check (exists (select 1 from public.community_service_search_requests s where s.id = search_request_id and (s.requested_by_user_id = auth.uid() or public.safesteps_can_manage_community_services(auth.uid()) or (s.case_id is not null and public.safesteps_can_access_case_v19(auth.uid(), s.case_id)))));
create policy "Community referrals accessible" on public.community_service_referrals for all to authenticated using (public.safesteps_can_access_community_referral(auth.uid(), id)) with check (parent_user_id = auth.uid() or referred_by_user_id = auth.uid() or public.safesteps_can_manage_community_services(auth.uid()) or (case_id is not null and public.safesteps_can_access_case_v19(auth.uid(), case_id)));
create policy "Community referral consent access" on public.community_referral_consents for all to authenticated using (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id)) with check (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id));
create policy "Community referral child access" on public.community_referral_waitlist_records for all to authenticated using (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id)) with check (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id));
create policy "Community referral booking access" on public.community_referral_bookings for all to authenticated using (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id)) with check (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id));
create policy "Community referral engagement access" on public.community_referral_engagement_events for all to authenticated using (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id)) with check (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id));
create policy "Community referral barrier access" on public.community_referral_barriers for all to authenticated using (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id)) with check (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id));
create policy "Community referral outcome access" on public.community_referral_outcomes for all to authenticated using (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id)) with check (public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id));
create policy "Community alternatives readable" on public.community_service_alternatives for select to authenticated using (active = true or public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community alternatives managed" on public.community_service_alternatives for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid())) with check (public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community resource guides readable" on public.community_resource_guides for select to authenticated using (lifecycle_status = 'published' or public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community resource guides managed" on public.community_resource_guides for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid())) with check (public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community feedback access" on public.community_service_feedback for all to authenticated using (public.safesteps_can_manage_community_services(auth.uid()) or (community_service_referral_id is not null and public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id))) with check (public.safesteps_can_manage_community_services(auth.uid()) or (community_service_referral_id is not null and public.safesteps_can_access_community_referral(auth.uid(), community_service_referral_id)));
create policy "Community audit readable" on public.community_service_audit_events for select to authenticated using (public.safesteps_can_manage_community_services(auth.uid()));
create policy "Community audit appendable" on public.community_service_audit_events for insert to authenticated with check (actor_user_id = auth.uid() or public.safesteps_can_manage_community_services(auth.uid()));

create or replace view public.community_service_directory_view
with (security_invoker = true)
as
select
  s.id as community_service_id,
  s.service_reference,
  s.service_name,
  s.service_description,
  s.delivery_modes,
  s.cost_type,
  s.emergency_service,
  s.crisis_access_available,
  c.category_code,
  c.category_name,
  p.provider_name,
  p.verification_status,
  latest.capacity_status,
  latest.estimated_wait_days
from public.community_services s
join public.community_service_categories c on c.id = s.service_category_id
join public.community_service_providers p on p.id = s.community_service_provider_id
left join lateral (
  select cs.capacity_status, cs.estimated_wait_days
  from public.community_service_capacity_snapshots cs
  where cs.community_service_id = s.id
  order by cs.captured_at desc
  limit 1
) latest on true
where s.service_status = 'active'
  and p.provider_status = 'active';

create or replace view public.community_referral_follow_up_queue
with (security_invoker = true)
as
select
  r.id as community_service_referral_id,
  r.referral_reference,
  r.case_id,
  r.family_id,
  r.referral_status,
  r.safety_sensitive,
  r.first_access_confirmed_at,
  r.need_addressed_at,
  public.community_referral_needs_follow_up(r.id) as needs_follow_up
from public.community_service_referrals r
where r.referral_status not in ('closed', 'cancelled')
  and public.community_referral_needs_follow_up(r.id) = true;

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('community_services.manage', 'Manage community service directories, providers, categories, capacity, eligibility, suitability, resources, feedback, and audits.', 'community_services', 'manage', 'sensitive'),
  ('service_directory.manage', 'Maintain the service directory and current service access information.', 'community_services', 'manage_directory', 'sensitive'),
  ('community_referral.manage', 'Manage service navigation referrals, consent, bookings, waitlists, barriers, engagement, outcomes, and follow-up.', 'community_referral', 'manage', 'high_impact'),
  ('community_referral.sensitive', 'Manage safety-sensitive community referrals with protected communication requirements.', 'community_referral', 'manage_sensitive', 'high_impact')
on conflict (permission_code) do update
set description = excluded.description,
    resource_type = excluded.resource_type,
    action = excluded.action,
    risk_level = excluded.risk_level;
