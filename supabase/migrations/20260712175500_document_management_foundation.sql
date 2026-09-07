create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  worker_user_id uuid,
  current_version_id uuid,
  linked_evidence_id uuid references public.evidence_items(id) on delete set null,
  linked_assessment_id uuid references public.assessment_records(id) on delete set null,
  document_type text not null,
  title text not null,
  status text not null default 'requested'
    check (status in ('requested', 'submitted', 'reviewed', 'accepted', 'needs_update', 'expired', 'excluded')),
  expiry_date date,
  court_report_include boolean not null default false,
  notes text not null default '',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.case_documents(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  file_path text not null,
  file_name text not null,
  mime_type text,
  file_sha256 text,
  uploaded_by uuid default auth.uid(),
  uploaded_at timestamptz not null default now(),
  review_status text not null default 'pending'
    check (review_status in ('pending', 'accepted', 'needs_update', 'excluded')),
  review_notes text not null default '',
  unique (document_id, version_number)
);

create table if not exists public.case_document_requests (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  document_id uuid references public.case_documents(id) on delete set null,
  parent_user_id uuid,
  requested_by uuid default auth.uid(),
  document_type text not null,
  title text not null,
  reason text not null default '',
  due_at timestamptz,
  status text not null default 'requested'
    check (status in ('requested', 'submitted', 'cancelled', 'overdue')),
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'case_documents_current_version_id_fkey'
      and conrelid = 'public.case_documents'::regclass
  ) then
    alter table public.case_documents
      add constraint case_documents_current_version_id_fkey
      foreign key (current_version_id)
      references public.case_document_versions(id)
      on delete set null;
  end if;
end $$;

alter table public.case_documents enable row level security;
alter table public.case_document_versions enable row level security;
alter table public.case_document_requests enable row level security;

drop policy if exists case_documents_select on public.case_documents;
create policy case_documents_select on public.case_documents
for select to authenticated
using (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_documents_insert on public.case_documents;
create policy case_documents_insert on public.case_documents
for insert to authenticated
with check (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_documents_update on public.case_documents;
create policy case_documents_update on public.case_documents
for update to authenticated
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

drop policy if exists case_document_versions_select on public.case_document_versions;
create policy case_document_versions_select on public.case_document_versions
for select to authenticated
using (
  exists (
    select 1 from public.case_documents d
    where d.id = document_id
      and (
        d.parent_user_id = (select auth.uid())
        or d.worker_user_id = (select auth.uid())
        or d.created_by = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

drop policy if exists case_document_versions_insert on public.case_document_versions;
create policy case_document_versions_insert on public.case_document_versions
for insert to authenticated
with check (
  uploaded_by = (select auth.uid())
  and exists (
    select 1 from public.case_documents d
    where d.id = document_id
      and (
        d.parent_user_id = (select auth.uid())
        or d.worker_user_id = (select auth.uid())
        or d.created_by = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

drop policy if exists case_document_versions_update on public.case_document_versions;
create policy case_document_versions_update on public.case_document_versions
for update to authenticated
using (
  uploaded_by = (select auth.uid())
  or exists (
    select 1 from public.case_documents d
    where d.id = document_id
      and (d.worker_user_id = (select auth.uid()) or public.can_manage_assessments())
  )
)
with check (
  uploaded_by = (select auth.uid())
  or exists (
    select 1 from public.case_documents d
    where d.id = document_id
      and (d.worker_user_id = (select auth.uid()) or public.can_manage_assessments())
  )
);

drop policy if exists case_document_requests_select on public.case_document_requests;
create policy case_document_requests_select on public.case_document_requests
for select to authenticated
using (
  parent_user_id = (select auth.uid())
  or requested_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_document_requests_insert on public.case_document_requests;
create policy case_document_requests_insert on public.case_document_requests
for insert to authenticated
with check (
  requested_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_document_requests_update on public.case_document_requests;
create policy case_document_requests_update on public.case_document_requests
for update to authenticated
using (
  parent_user_id = (select auth.uid())
  or requested_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  parent_user_id = (select auth.uid())
  or requested_by = (select auth.uid())
  or public.can_manage_assessments()
);

create index if not exists idx_case_documents_case_status
  on public.case_documents(case_id, status, updated_at desc);

create index if not exists idx_case_documents_expiry
  on public.case_documents(expiry_date)
  where expiry_date is not null;

create index if not exists idx_case_document_versions_document
  on public.case_document_versions(document_id, version_number desc);

create index if not exists idx_case_document_requests_case_due
  on public.case_document_requests(case_id, status, due_at);
