create or replace view public.worker_caseload_view
with (security_invoker = true)
as
select
  c.id as case_id,
  c.tenant_id,
  c.case_reference,
  c.case_title,
  c.case_type_code,
  c.case_status_code,
  c.priority_code,
  c.opened_at,
  c.target_review_at,
  f.id as family_id,
  f.family_display_name,
  ca.allocated_user_id,
  ca.allocation_role,
  ca.primary_allocation,
  (
    select count(*)
    from public.case_plan_actions cpa
    join public.case_plan_goals cpg on cpg.id = cpa.case_plan_goal_id
    join public.case_plans cp on cp.id = cpg.case_plan_id
    where cp.case_id = c.id
      and cpa.action_status not in ('completed', 'cancelled')
  ) as open_action_count,
  (
    select count(*)
    from public.case_barriers cb
    where cb.case_id = c.id and cb.barrier_status = 'active'
  ) as active_barrier_count
from public.cases c
join public.families f on f.id = c.family_id
join public.case_allocations ca
  on ca.case_id = c.id
 and ca.allocation_status = 'active'
 and ca.ended_at is null;

create or replace view public.supervisor_caseload_view
with (security_invoker = true)
as
select
  c.id as case_id,
  c.case_reference,
  c.case_status_code,
  c.priority_code,
  primary_worker.allocated_user_id as primary_worker_user_id,
  supervisor.allocated_user_id as supervisor_user_id,
  c.target_review_at,
  case when c.target_review_at < now() then true else false end as review_overdue
from public.cases c
left join public.case_allocations primary_worker
  on primary_worker.case_id = c.id
 and primary_worker.allocation_role = 'primary_worker'
 and primary_worker.allocation_status = 'active'
 and primary_worker.ended_at is null
left join public.case_allocations supervisor
  on supervisor.case_id = c.id
 and supervisor.allocation_role = 'primary_supervisor'
 and supervisor.allocation_status = 'active'
 and supervisor.ended_at is null;

grant select on public.worker_caseload_view, public.supervisor_caseload_view to authenticated;
