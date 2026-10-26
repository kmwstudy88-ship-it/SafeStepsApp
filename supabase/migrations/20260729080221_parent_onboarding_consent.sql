-- Immutable parent onboarding consent events.
-- Parents can record and read their own choices. Events cannot be updated or deleted.

create table if not exists public.parent_onboarding_consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('accepted', 'withdrawn')),
  document_key text not null check (document_key in ('privacy_parent_rights', 'terms_of_use', 'information_sharing')),
  document_version text not null,
  choices jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),
  client_recorded_at timestamptz,
  source text not null default 'parent_onboarding'
    check (source in ('parent_onboarding', 'settings', 'support_assisted'))
);

create index if not exists idx_parent_onboarding_consent_events_user_time
  on public.parent_onboarding_consent_events(user_id, recorded_at desc);

alter table public.parent_onboarding_consent_events enable row level security;

drop policy if exists parent_consent_events_select_own
  on public.parent_onboarding_consent_events;
create policy parent_consent_events_select_own
  on public.parent_onboarding_consent_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists parent_consent_events_insert_own
  on public.parent_onboarding_consent_events;
create policy parent_consent_events_insert_own
  on public.parent_onboarding_consent_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

grant select, insert on public.parent_onboarding_consent_events to authenticated;
revoke update, delete, truncate, references, trigger
  on public.parent_onboarding_consent_events
  from anon, authenticated;
