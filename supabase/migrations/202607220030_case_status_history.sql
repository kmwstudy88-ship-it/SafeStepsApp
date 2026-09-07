create table if not exists public.case_status_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  previous_status_code text,
  resulting_status_code text not null,
  change_reason text not null,
  change_summary text,
  changed_by_user_id uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists case_status_history_case_idx
  on public.case_status_history (case_id, changed_at desc);

create or replace function public.record_case_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.case_status_code is distinct from new.case_status_code then
    insert into public.case_status_history (
      tenant_id,
      case_id,
      previous_status_code,
      resulting_status_code,
      change_reason,
      changed_by_user_id
    )
    values (
      new.tenant_id,
      new.id,
      old.case_status_code,
      new.case_status_code,
      coalesce(current_setting('app.case_status_change_reason', true), 'Status changed'),
      auth.uid()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists cases_record_status_change on public.cases;
create trigger cases_record_status_change
after update of case_status_code on public.cases
for each row execute function public.record_case_status_change();
