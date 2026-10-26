create table if not exists public.parent_child_messages (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  parent_user_id uuid,
  caseworker_user_id uuid,
  sender_user_id uuid not null default auth.uid(),
  sender_role text not null
    check (sender_role in ('child', 'parent', 'caseworker')),
  message_text text not null check (length(trim(message_text)) > 0),
  share_audience text not null default 'parent'
    check (share_audience in ('private', 'parent', 'caseworker', 'both')),
  monitoring_status text not null default 'open'
    check (monitoring_status in ('open', 'reviewed', 'follow_up', 'closed')),
  monitoring_note text,
  visible_to_child boolean not null default true,
  visible_to_parent boolean not null default true,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.parent_child_messages to authenticated;

alter table public.parent_child_messages enable row level security;

drop trigger if exists set_parent_child_messages_updated_at on public.parent_child_messages;
create trigger set_parent_child_messages_updated_at
  before update on public.parent_child_messages
  for each row execute function public.set_updated_at();

drop policy if exists parent_child_messages_select on public.parent_child_messages;
create policy parent_child_messages_select
on public.parent_child_messages
for select
to authenticated
using (
  (
    child_user_id = (select auth.uid())
    and visible_to_child
  )
  or (
    parent_user_id = (select auth.uid())
    and visible_to_parent
    and share_audience in ('parent', 'both')
  )
  or (
    caseworker_user_id = (select auth.uid())
    and share_audience in ('caseworker', 'both')
  )
  or public.is_caseworker_or_admin()
);

drop policy if exists parent_child_messages_insert on public.parent_child_messages;
create policy parent_child_messages_insert
on public.parent_child_messages
for insert
to authenticated
with check (
  sender_user_id = (select auth.uid())
  and (
    (
      sender_role = 'child'
      and child_user_id = (select auth.uid())
    )
    or (
      sender_role = 'parent'
      and parent_user_id = (select auth.uid())
      and share_audience in ('parent', 'both')
    )
    or (
      sender_role = 'caseworker'
      and (
        caseworker_user_id = (select auth.uid())
        or public.is_caseworker_or_admin()
      )
      and share_audience in ('caseworker', 'both')
    )
  )
);

drop policy if exists parent_child_messages_update on public.parent_child_messages;
create policy parent_child_messages_update
on public.parent_child_messages
for update
to authenticated
using (
  parent_user_id = (select auth.uid())
  or caseworker_user_id = (select auth.uid())
  or public.is_caseworker_or_admin()
)
with check (
  parent_user_id = (select auth.uid())
  or caseworker_user_id = (select auth.uid())
  or public.is_caseworker_or_admin()
);

create index if not exists idx_parent_child_messages_child_user_id
on public.parent_child_messages(child_user_id, created_at desc);

create index if not exists idx_parent_child_messages_parent_user_id
on public.parent_child_messages(parent_user_id, created_at desc);

create index if not exists idx_parent_child_messages_caseworker_user_id
on public.parent_child_messages(caseworker_user_id, created_at desc);

create index if not exists idx_parent_child_messages_monitoring_status
on public.parent_child_messages(monitoring_status);
