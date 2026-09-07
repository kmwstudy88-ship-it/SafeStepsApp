alter table public.evidence_items
  add column if not exists evidence_type text
    check (
      evidence_type is null or evidence_type in (
        'direct_observation',
        'collateral_report',
        'self_report_interview',
        'objective_measure'
      )
    ),
  add column if not exists purpose text,
  add column if not exists structured_data jsonb not null default '{}'::jsonb,
  add column if not exists review_status text not null default 'draft'
    check (review_status in ('draft', 'pending_review', 'reviewed', 'excluded')),
  add column if not exists dispute_status text not null default 'not_disputed'
    check (dispute_status in ('not_disputed', 'disputed', 'resolved', 'superseded')),
  add column if not exists source_reliability text
    check (
      source_reliability is null or source_reliability in (
        'pending_review',
        'direct_observation',
        'provider_record',
        'self_report',
        'validated_measure',
        'second_hand',
        'disputed'
      )
    );

create index if not exists evidence_items_owner_type_created_idx
  on public.evidence_items (owner_id, evidence_type, created_at desc);

create index if not exists evidence_items_structured_data_gin_idx
  on public.evidence_items using gin (structured_data);

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
    new.evidence_type is distinct from old.evidence_type or
    new.purpose is distinct from old.purpose or
    new.structured_data is distinct from old.structured_data or
    new.source_reliability is distinct from old.source_reliability or
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
