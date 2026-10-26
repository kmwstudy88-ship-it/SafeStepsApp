create extension if not exists pgcrypto;

alter table public.evidence_items
  add column if not exists integrity_hash text,
  add column if not exists hash_algorithm text not null default 'sha256',
  add column if not exists vault_hash text,
  add column if not exists vault_previous_hash text,
  add column if not exists captured_at timestamptz,
  add column if not exists attachment_sha256 text,
  add column if not exists attachment_byte_size bigint,
  add column if not exists immutable_after timestamptz not null default now();

create table if not exists public.evidence_audit_log (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid references public.evidence_items(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'evidence_created',
      'offline_evidence_synced',
      'status_changed',
      'integrity_verified',
      'sync_failed'
    )
  ),
  event_payload jsonb not null default '{}'::jsonb,
  previous_audit_hash text not null,
  audit_hash text not null,
  hash_algorithm text not null default 'sha256',
  created_at timestamptz not null default now()
);

alter table public.evidence_audit_log enable row level security;

drop policy if exists "Evidence audit logs are visible to owners" on public.evidence_audit_log;
create policy "Evidence audit logs are visible to owners"
on public.evidence_audit_log for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Evidence audit logs can be created by owners" on public.evidence_audit_log;
create policy "Evidence audit logs can be created by owners"
on public.evidence_audit_log for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create or replace function public.reject_evidence_audit_log_mutation()
returns trigger
language plpgsql
security invoker
as $$
begin
  raise exception 'evidence_audit_log is append-only';
end;
$$;

drop trigger if exists evidence_audit_log_no_update on public.evidence_audit_log;
create trigger evidence_audit_log_no_update
  before update on public.evidence_audit_log
  for each row execute function public.reject_evidence_audit_log_mutation();

drop trigger if exists evidence_audit_log_no_delete on public.evidence_audit_log;
create trigger evidence_audit_log_no_delete
  before delete on public.evidence_audit_log
  for each row execute function public.reject_evidence_audit_log_mutation();

create or replace function public.reject_stored_evidence_immutable_fields()
returns trigger
language plpgsql
security invoker
as $$
begin
  if old.status in ('stored', 'shared') and (
    new.owner_id is distinct from old.owner_id or
    new.title is distinct from old.title or
    new.notes is distinct from old.notes or
    new.file_path is distinct from old.file_path or
    new.integrity_hash is distinct from old.integrity_hash or
    new.vault_hash is distinct from old.vault_hash or
    new.vault_previous_hash is distinct from old.vault_previous_hash or
    new.captured_at is distinct from old.captured_at or
    new.attachment_sha256 is distinct from old.attachment_sha256 or
    new.attachment_byte_size is distinct from old.attachment_byte_size
  ) then
    raise exception 'stored evidence content is immutable; create a new superseding record instead';
  end if;

  return new;
end;
$$;

drop trigger if exists evidence_items_stored_immutable_fields on public.evidence_items;
create trigger evidence_items_stored_immutable_fields
  before update on public.evidence_items
  for each row execute function public.reject_stored_evidence_immutable_fields();

create index if not exists evidence_audit_log_owner_created_idx
  on public.evidence_audit_log (owner_id, created_at desc);

create index if not exists evidence_audit_log_evidence_created_idx
  on public.evidence_audit_log (evidence_id, created_at desc);
