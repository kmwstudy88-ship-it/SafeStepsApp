create table if not exists public.child_request_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.child_requests(id) on delete cascade,
  child_user_id uuid not null,
  parent_user_id uuid,
  caseworker_user_id uuid,
  responder_user_id uuid not null default auth.uid(),
  response_text text not null check (length(trim(response_text)) > 0),
  response_type text not null default 'parent_note'
    check (response_type in ('parent_note', 'caseworker_note', 'action_update')),
  visible_to_child boolean not null default false,
  created_at timestamptz not null default now()
);

grant select, insert, update on public.child_request_responses to authenticated;

alter table public.child_request_responses enable row level security;

drop policy if exists child_request_responses_select on public.child_request_responses;
create policy child_request_responses_select
on public.child_request_responses
for select
to authenticated
using (
  (
    child_user_id = (select auth.uid())
    and visible_to_child
  )
  or parent_user_id = (select auth.uid())
  or caseworker_user_id = (select auth.uid())
  or public.is_caseworker_or_admin()
);

drop policy if exists child_request_responses_insert on public.child_request_responses;
create policy child_request_responses_insert
on public.child_request_responses
for insert
to authenticated
with check (
  responder_user_id = (select auth.uid())
  and (
    parent_user_id = (select auth.uid())
    or caseworker_user_id = (select auth.uid())
    or public.is_caseworker_or_admin()
  )
  and exists (
    select 1
    from public.child_requests request
    where request.id = child_request_responses.request_id
      and request.child_user_id = child_request_responses.child_user_id
      and request.parent_user_id is not distinct from child_request_responses.parent_user_id
      and request.caseworker_user_id is not distinct from child_request_responses.caseworker_user_id
      and (
        request.parent_user_id = (select auth.uid())
        or request.caseworker_user_id = (select auth.uid())
        or public.is_caseworker_or_admin()
      )
  )
);

drop policy if exists child_request_responses_update on public.child_request_responses;
create policy child_request_responses_update
on public.child_request_responses
for update
to authenticated
using (
  responder_user_id = (select auth.uid())
  or public.is_caseworker_or_admin()
)
with check (
  responder_user_id = (select auth.uid())
  or public.is_caseworker_or_admin()
);

create index if not exists idx_child_request_responses_request_id
on public.child_request_responses(request_id);

create index if not exists idx_child_request_responses_child_user_id
on public.child_request_responses(child_user_id);

create index if not exists idx_child_request_responses_parent_user_id
on public.child_request_responses(parent_user_id);
