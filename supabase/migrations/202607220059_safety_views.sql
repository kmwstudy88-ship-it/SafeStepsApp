create or replace view public.safety_dashboard_view
with (security_invoker = true)
as
select
  c.id as case_id,
  c.tenant_id,
  c.case_reference,
  sp.id as safety_plan_id,
  sp.safety_level,
  sp.next_review_at,
  count(distinct sa.id) filter (where sa.alert_status = 'open') as open_alert_count,
  count(distinct si.id) filter (where si.incident_status = 'open') as open_incident_count,
  count(distinct wrd.id) filter (where wrd.review_status = 'pending_review') as pending_weapon_alert_count,
  count(distinct mce.id) filter (where mce.event_status = 'open') as open_missing_child_count,
  count(distinct srf.id) filter (where srf.current_status = 'active') as active_risk_factor_count,
  count(distinct spf.id) filter (where spf.active = true) as active_protective_factor_count
from public.cases c
left join public.safety_plans sp on sp.case_id = c.id and sp.plan_status = 'active'
left join public.safety_alerts sa on sa.case_id = c.id
left join public.safety_incidents si on si.case_id = c.id
left join public.weapon_risk_detections wrd on wrd.case_id = c.id
left join public.missing_child_events mce on mce.case_id = c.id
left join public.safety_risk_factors srf on srf.case_id = c.id
left join public.safety_protective_factors spf on spf.case_id = c.id
where public.has_safety_access(c.id)
group by c.id, c.tenant_id, c.case_reference, sp.id, sp.safety_level, sp.next_review_at;

create or replace view public.risk_trend_view
with (security_invoker = true)
as
select
  case_id,
  tenant_id,
  assessed_at,
  assessed_level,
  risk_score,
  protective_score,
  assessment_type
from public.safety_risk_assessments
where public.has_safety_access(case_id);

grant select on public.safety_dashboard_view, public.risk_trend_view to authenticated;
