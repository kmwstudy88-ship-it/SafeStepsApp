begin;
alter table public.personal_ai_consents drop constraint if exists personal_ai_consents_purpose_check;
alter table public.personal_ai_consents add constraint personal_ai_consents_purpose_check check (purpose in ('ai_support','conversation_storage','human_handoff','mood_trends'));
create table if not exists public.personal_ai_mood_observations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.personal_ai_conversations(id) on delete set null,
  consent_id uuid not null references public.personal_ai_consents(id) on delete cascade,
  dominant_emotion text not null check (dominant_emotion in ('neutral','anxiety','sadness','anger','joy')),
  confidence_score numeric(4,3) not null check (confidence_score between 0 and 1),
  positive_score numeric(4,3) not null check (positive_score between 0 and 1), negative_score numeric(4,3) not null check (negative_score between 0 and 1), neutral_score numeric(4,3) not null check (neutral_score between 0 and 1),
  anger_score numeric(4,3) not null check (anger_score between 0 and 1), sadness_score numeric(4,3) not null check (sadness_score between 0 and 1), anxiety_score numeric(4,3) not null check (anxiety_score between 0 and 1), joy_score numeric(4,3) not null check (joy_score between 0 and 1),
  analysis_version text not null, created_at timestamptz not null default now(), expires_at timestamptz not null default (now() + interval '90 days'), check (expires_at > created_at)
);
comment on table public.personal_ai_mood_observations is 'Opt-in, non-diagnostic communication cues only. Raw message text is intentionally excluded.';
create index if not exists personal_ai_mood_observations_owner_time_idx on public.personal_ai_mood_observations(user_id, created_at desc);
alter table public.personal_ai_mood_observations enable row level security;
revoke all on public.personal_ai_mood_observations from public, anon, authenticated;
grant select, insert, delete on public.personal_ai_mood_observations to authenticated;
create policy personal_ai_mood_observations_owner_select on public.personal_ai_mood_observations for select to authenticated using ((select auth.uid()) = user_id);
create policy personal_ai_mood_observations_owner_insert on public.personal_ai_mood_observations for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.personal_ai_consents c where c.id = consent_id and c.user_id = (select auth.uid()) and c.purpose = 'mood_trends' and c.revoked_at is null and (c.expires_at is null or c.expires_at > now())));
create policy personal_ai_mood_observations_owner_delete on public.personal_ai_mood_observations for delete to authenticated using ((select auth.uid()) = user_id);
commit;
