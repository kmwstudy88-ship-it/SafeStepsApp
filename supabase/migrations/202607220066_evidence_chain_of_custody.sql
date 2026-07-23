create table if not exists public.evidence_chain_of_custody (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  evidence_file_id uuid references public.evidence_files(id) on delete set null,
  custody_action text not null,
  action_reason text,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_service text,
  device_fingerprint text,
  ip_address_hash text,
  digital_signature_hash text,
  previous_hash text,
  resulting_hash text,
  action_result text not null default 'success',
  occurred_at timestamptz not null default now()
);

create index if not exists evidence_chain_record_time_idx
  on public.evidence_chain_of_custody(evidence_record_id, occurred_at desc);

create or replace function public.reject_evidence_chain_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Evidence chain of custody is append-only';
end;
$$;

drop trigger if exists evidence_chain_no_update on public.evidence_chain_of_custody;
create trigger evidence_chain_no_update
before update on public.evidence_chain_of_custody
for each row execute function public.reject_evidence_chain_mutation();

drop trigger if exists evidence_chain_no_delete on public.evidence_chain_of_custody;
create trigger evidence_chain_no_delete
before delete on public.evidence_chain_of_custody
for each row execute function public.reject_evidence_chain_mutation();
