alter table public.case_service_referrals
  add column if not exists worker_user_id uuid,
  add column if not exists due_date date,
  add column if not exists first_contact_at timestamptz,
  add column if not exists last_attended_at timestamptz,
  add column if not exists next_review_at timestamptz,
  add column if not exists consent_to_contact_provider boolean not null default false,
  add column if not exists attendance_verified boolean not null default false,
  add column if not exists linked_evidence_id uuid references public.evidence_items(id) on delete set null,
  add column if not exists linked_document_id uuid references public.case_documents(id) on delete set null,
  add column if not exists review_notes text not null default '',
  add column if not exists alert_generated boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.case_service_referrals
  drop constraint if exists case_service_referrals_status_check;

alter table public.case_service_referrals
  add constraint case_service_referrals_status_check
  check (status in ('referred', 'waiting', 'engaged', 'completed', 'declined', 'discontinued', 'missed', 'needs_review'));

drop policy if exists case_referrals_case_rows on public.case_service_referrals;
create policy case_referrals_case_rows on public.case_service_referrals
for all to authenticated
using (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

create index if not exists idx_case_referrals_due_review
  on public.case_service_referrals(case_id, status, due_date, next_review_at);

create index if not exists idx_case_referrals_worker
  on public.case_service_referrals(worker_user_id, status, updated_at desc);

create index if not exists idx_case_referrals_evidence
  on public.case_service_referrals(linked_evidence_id)
  where linked_evidence_id is not null;
