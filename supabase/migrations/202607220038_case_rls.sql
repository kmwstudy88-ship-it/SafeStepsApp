alter table public.case_type_definitions enable row level security;
alter table public.case_status_definitions enable row level security;
alter table public.case_priority_definitions enable row level security;
alter table public.cases enable row level security;
alter table public.case_participants enable row level security;
alter table public.worker_teams enable row level security;
alter table public.worker_team_memberships enable row level security;
alter table public.case_allocations enable row level security;
alter table public.case_status_history enable row level security;
alter table public.case_plans enable row level security;
alter table public.case_plan_goals enable row level security;
alter table public.case_plan_actions enable row level security;
alter table public.case_milestones enable row level security;
alter table public.case_barriers enable row level security;
alter table public.case_strengths enable row level security;
alter table public.case_reviews enable row level security;
alter table public.case_notes enable row level security;
alter table public.case_note_visibility_grants enable row level security;
alter table public.case_legal_references enable row level security;
alter table public.case_orders enable row level security;

grant select on public.case_type_definitions, public.case_status_definitions, public.case_priority_definitions to authenticated;
grant select, insert, update on
  public.cases,
  public.case_participants,
  public.worker_teams,
  public.worker_team_memberships,
  public.case_allocations,
  public.case_status_history,
  public.case_plans,
  public.case_plan_goals,
  public.case_plan_actions,
  public.case_milestones,
  public.case_barriers,
  public.case_strengths,
  public.case_reviews,
  public.case_notes,
  public.case_note_visibility_grants,
  public.case_legal_references,
  public.case_orders
to authenticated;

drop policy if exists "Case definitions readable" on public.case_type_definitions;
create policy "Case definitions readable" on public.case_type_definitions for select to authenticated using (active = true);
drop policy if exists "Case statuses readable" on public.case_status_definitions;
create policy "Case statuses readable" on public.case_status_definitions for select to authenticated using (active = true);
drop policy if exists "Case priorities readable" on public.case_priority_definitions;
create policy "Case priorities readable" on public.case_priority_definitions for select to authenticated using (active = true);

drop policy if exists "Cases readable by authorised users" on public.cases;
create policy "Cases readable by authorised users"
on public.cases for select to authenticated
using (public.has_case_access(id));

drop policy if exists "Cases insertable by authorised users" on public.cases;
create policy "Cases insertable by authorised users"
on public.cases for insert to authenticated
with check (public.has_permission(tenant_id, 'case.create'));

drop policy if exists "Cases updateable by authorised users" on public.cases;
create policy "Cases updateable by authorised users"
on public.cases for update to authenticated
using (public.can_manage_case(id))
with check (public.can_manage_case(id));

drop policy if exists "Case participants readable" on public.case_participants;
create policy "Case participants readable" on public.case_participants for select to authenticated using (public.has_case_access(case_id));
drop policy if exists "Case participants manageable" on public.case_participants;
create policy "Case participants manageable" on public.case_participants for all to authenticated using (public.can_manage_case(case_id)) with check (public.can_manage_case(case_id));

drop policy if exists "Case allocations readable" on public.case_allocations;
create policy "Case allocations readable" on public.case_allocations for select to authenticated using (public.has_case_access(case_id) or public.has_permission(tenant_id, 'case.allocation.view'));
drop policy if exists "Case allocations manageable" on public.case_allocations;
create policy "Case allocations manageable" on public.case_allocations for all to authenticated using (public.has_permission(tenant_id, 'case.allocation.manage')) with check (public.has_permission(tenant_id, 'case.allocation.manage'));

drop policy if exists "Case plans readable" on public.case_plans;
create policy "Case plans readable" on public.case_plans for select to authenticated using (public.has_case_access(case_id));
drop policy if exists "Case plans manageable" on public.case_plans;
create policy "Case plans manageable" on public.case_plans for all to authenticated using (public.can_manage_case(case_id) or public.has_permission(tenant_id, 'case.plan.manage')) with check (public.can_manage_case(case_id) or public.has_permission(tenant_id, 'case.plan.manage'));

drop policy if exists "Case notes readable" on public.case_notes;
create policy "Case notes readable" on public.case_notes for select to authenticated using (public.can_view_case_note(id));
drop policy if exists "Case notes insertable by workers" on public.case_notes;
create policy "Case notes insertable by workers" on public.case_notes for insert to authenticated with check (author_user_id = auth.uid() and (public.is_case_worker(case_id) or public.is_case_team_member(case_id) or public.is_case_supervisor(case_id) or public.has_permission(tenant_id, 'case.note.create')));
drop policy if exists "Case note draft update by author" on public.case_notes;
create policy "Case note draft update by author" on public.case_notes for update to authenticated using (author_user_id = auth.uid() and note_status = 'draft') with check (author_user_id = auth.uid() and note_status in ('draft', 'final'));

drop policy if exists "Case child rows readable through case access" on public.case_plan_goals;
create policy "Case child rows readable through case access" on public.case_plan_goals for select to authenticated using (exists (select 1 from public.case_plans cp where cp.id = case_plan_id and public.has_case_access(cp.case_id)));
drop policy if exists "Case action rows readable through case access" on public.case_plan_actions;
create policy "Case action rows readable through case access" on public.case_plan_actions for select to authenticated using (exists (select 1 from public.case_plan_goals g join public.case_plans cp on cp.id = g.case_plan_id where g.id = case_plan_goal_id and public.has_case_access(cp.case_id)));
