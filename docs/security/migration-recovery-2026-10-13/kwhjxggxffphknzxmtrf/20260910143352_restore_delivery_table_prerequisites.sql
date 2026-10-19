-- RECOVERED READ-ONLY from kwhjxggxffphknzxmtrf migration history; review before replay.
-- Restores schema-only prerequisites missing from the historical migration chain.
-- Definitions recovered from production catalog metadata; no production data copied.
-- Foreign keys to legacy video tables are added after their key baseline is replayed.
create table if not exists public.video_report_deliveries (
 id uuid primary key default gen_random_uuid(),
 snapshot_id uuid not null,
 export_file_id uuid,
 recipient_type text not null check (recipient_type in ('internal','external')),
 internal_recipient_user_id uuid references auth.users(id) on delete set null,
 external_recipient_label text,
 external_recipient_contact_hash text,
 delivery_purpose_code text not null,
 delivery_status text not null default 'created' check (delivery_status in ('created','sent','opened','acknowledged','revoked')),
 delivery_token_hash text not null,
 token_expires_at timestamptz not null,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 revoked_at timestamptz,
 revocation_reason text,
 opaque_delivery_token_hash text,
 verification_code_hash text,
 verification_attempts integer not null default 0,
 max_verification_attempts integer not null default 5,
 download_count integer not null default 0,
 max_downloads integer not null default 3,
 verified_at timestamptz
);
create table if not exists public.video_report_delivery_acknowledgements (
 id uuid primary key default gen_random_uuid(),
 delivery_id uuid not null references public.video_report_deliveries(id) on delete cascade,
 acknowledged_by_label text not null,
 acknowledgement_text text not null,
 acknowledged_at timestamptz not null default now()
);
alter table public.video_report_deliveries enable row level security;
alter table public.video_report_delivery_acknowledgements enable row level security;
revoke all on public.video_report_deliveries,public.video_report_delivery_acknowledgements from public,anon,authenticated;
grant select on public.video_report_deliveries,public.video_report_delivery_acknowledgements to authenticated;
grant all on public.video_report_deliveries,public.video_report_delivery_acknowledgements to service_role;
drop policy if exists video_report_deliveries_select on public.video_report_deliveries;
create policy video_report_deliveries_select on public.video_report_deliveries for select to authenticated
using (internal_recipient_user_id=(select auth.uid()) or created_by=(select auth.uid()) or public.is_video_admin(array['super_admin']::text[]));
drop policy if exists video_report_delivery_acknowledgements_select on public.video_report_delivery_acknowledgements;
create policy video_report_delivery_acknowledgements_select on public.video_report_delivery_acknowledgements for select to authenticated
using (exists(select 1 from public.video_report_deliveries d where d.id=delivery_id and
(d.internal_recipient_user_id=(select auth.uid()) or d.created_by=(select auth.uid()) or public.is_video_admin(array['super_admin']::text[]))));
;

