alter table public.safety_plans enable row level security;
alter table public.safety_plan_versions enable row level security;
alter table public.safety_plan_participants enable row level security;
alter table public.safety_goals enable row level security;
alter table public.safety_actions enable row level security;
alter table public.safety_agreements enable row level security;
alter table public.safety_protective_factors enable row level security;
alter table public.safety_risk_factors enable row level security;
alter table public.safety_risk_assessments enable row level security;
alter table public.static_risk_assessment_items enable row level security;
alter table public.dynamic_risk_assessment_items enable row level security;
alter table public.safety_risk_indicators enable row level security;
alter table public.ai_risk_signals enable row level security;
alter table public.safety_alerts enable row level security;
alter table public.safety_incidents enable row level security;
alter table public.mandatory_notifications enable row level security;
alter table public.crisis_events enable row level security;
alter table public.crisis_audit_events enable row level security;
alter table public.weapon_risk_detections enable row level security;
alter table public.domestic_violence_indicators enable row level security;
alter table public.missing_child_events enable row level security;
alter table public.welfare_checks enable row level security;
alter table public.safety_emergency_contacts enable row level security;
alter table public.child_disclosures enable row level security;
alter table public.safety_escalation_levels enable row level security;
alter table public.safety_escalations enable row level security;

grant select, insert, update on
  public.safety_plans,
  public.safety_plan_versions,
  public.safety_plan_participants,
  public.safety_goals,
  public.safety_actions,
  public.safety_agreements,
  public.safety_protective_factors,
  public.safety_risk_factors,
  public.safety_risk_assessments,
  public.static_risk_assessment_items,
  public.dynamic_risk_assessment_items,
  public.safety_risk_indicators,
  public.ai_risk_signals,
  public.safety_alerts,
  public.safety_incidents,
  public.mandatory_notifications,
  public.crisis_events,
  public.crisis_audit_events,
  public.weapon_risk_detections,
  public.domestic_violence_indicators,
  public.missing_child_events,
  public.welfare_checks,
  public.safety_emergency_contacts,
  public.child_disclosures,
  public.safety_escalations
to authenticated;

grant select on public.safety_escalation_levels to authenticated;

drop policy if exists "Safety plans readable" on public.safety_plans;
create policy "Safety plans readable" on public.safety_plans for select to authenticated using (public.has_safety_access(case_id));
drop policy if exists "Safety plans manageable" on public.safety_plans;
create policy "Safety plans manageable" on public.safety_plans for all to authenticated using (public.can_manage_safety(case_id)) with check (public.can_manage_safety(case_id));

drop policy if exists "Safety plan versions readable" on public.safety_plan_versions;
create policy "Safety plan versions readable" on public.safety_plan_versions for select to authenticated using (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.has_safety_access(sp.case_id)));
drop policy if exists "Safety plan versions manageable" on public.safety_plan_versions;
create policy "Safety plan versions manageable" on public.safety_plan_versions for all to authenticated using (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.can_manage_safety(sp.case_id))) with check (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.can_manage_safety(sp.case_id)));

drop policy if exists "Safety participants readable" on public.safety_plan_participants;
create policy "Safety participants readable" on public.safety_plan_participants for select to authenticated using (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.has_safety_access(sp.case_id)));
drop policy if exists "Safety goals readable" on public.safety_goals;
create policy "Safety goals readable" on public.safety_goals for select to authenticated using (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.has_safety_access(sp.case_id)));
drop policy if exists "Safety actions readable" on public.safety_actions;
create policy "Safety actions readable" on public.safety_actions for select to authenticated using (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.has_safety_access(sp.case_id)));
drop policy if exists "Safety agreements readable" on public.safety_agreements;
create policy "Safety agreements readable" on public.safety_agreements for select to authenticated using (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.has_safety_access(sp.case_id)));

drop policy if exists "Safety goals manageable" on public.safety_goals;
create policy "Safety goals manageable" on public.safety_goals for all to authenticated using (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.can_manage_safety(sp.case_id))) with check (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.can_manage_safety(sp.case_id)));
drop policy if exists "Safety actions manageable" on public.safety_actions;
create policy "Safety actions manageable" on public.safety_actions for all to authenticated using (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.can_manage_safety(sp.case_id))) with check (exists (select 1 from public.safety_plans sp where sp.id = safety_plan_id and public.can_manage_safety(sp.case_id)));

drop policy if exists "Protective factors readable" on public.safety_protective_factors;
create policy "Protective factors readable" on public.safety_protective_factors for select to authenticated using (public.has_safety_access(case_id));
drop policy if exists "Risk factors readable" on public.safety_risk_factors;
create policy "Risk factors readable" on public.safety_risk_factors for select to authenticated using (public.has_safety_access(case_id));
drop policy if exists "Risk assessments readable" on public.safety_risk_assessments;
create policy "Risk assessments readable" on public.safety_risk_assessments for select to authenticated using (public.has_safety_access(case_id));
drop policy if exists "Risk indicators readable" on public.safety_risk_indicators;
create policy "Risk indicators readable" on public.safety_risk_indicators for select to authenticated using (public.has_safety_access(case_id));
drop policy if exists "AI risk signals readable" on public.ai_risk_signals;
create policy "AI risk signals readable" on public.ai_risk_signals for select to authenticated using (case_id is not null and public.has_safety_access(case_id));
drop policy if exists "Safety alerts readable" on public.safety_alerts;
create policy "Safety alerts readable" on public.safety_alerts for select to authenticated using (case_id is not null and public.has_safety_access(case_id));

drop policy if exists "Risk reviews manageable" on public.safety_risk_assessments;
create policy "Risk reviews manageable" on public.safety_risk_assessments for all to authenticated using (public.has_permission(tenant_id, 'risk.review') or public.can_manage_safety(case_id)) with check (public.has_permission(tenant_id, 'risk.review') or public.can_manage_safety(case_id));

drop policy if exists "Safety incidents readable" on public.safety_incidents;
create policy "Safety incidents readable" on public.safety_incidents for select to authenticated using (case_id is not null and public.has_safety_access(case_id));
drop policy if exists "Safety incidents createable" on public.safety_incidents;
create policy "Safety incidents createable" on public.safety_incidents for insert to authenticated with check (public.has_permission(tenant_id, 'incident.create') or (case_id is not null and public.can_manage_safety(case_id)));
drop policy if exists "Safety incidents reviewable" on public.safety_incidents;
create policy "Safety incidents reviewable" on public.safety_incidents for update to authenticated using (public.has_permission(tenant_id, 'incident.review')) with check (public.has_permission(tenant_id, 'incident.review'));

drop policy if exists "Weapon detections readable by safety users" on public.weapon_risk_detections;
create policy "Weapon detections readable by safety users" on public.weapon_risk_detections for select to authenticated using (case_id is not null and public.has_safety_access(case_id));
drop policy if exists "Weapon detections reviewable" on public.weapon_risk_detections;
create policy "Weapon detections reviewable" on public.weapon_risk_detections for update to authenticated using (public.can_review_weapon_detection(id)) with check (public.can_review_weapon_detection(id));

drop policy if exists "Child disclosures restricted readable" on public.child_disclosures;
create policy "Child disclosures restricted readable" on public.child_disclosures for select to authenticated using (public.can_review_child_disclosure(id));
drop policy if exists "Child disclosures createable by safety users" on public.child_disclosures;
create policy "Child disclosures createable by safety users" on public.child_disclosures for insert to authenticated with check (case_id is not null and public.can_manage_safety(case_id));

drop policy if exists "Crisis events readable" on public.crisis_events;
create policy "Crisis events readable" on public.crisis_events for select to authenticated using (case_id is not null and public.has_safety_access(case_id));
drop policy if exists "Crisis events manageable" on public.crisis_events;
create policy "Crisis events manageable" on public.crisis_events for all to authenticated using (public.has_permission(tenant_id, 'crisis.manage') or (case_id is not null and public.can_manage_safety(case_id))) with check (public.has_permission(tenant_id, 'crisis.manage') or (case_id is not null and public.can_manage_safety(case_id)));

drop policy if exists "Missing child events readable" on public.missing_child_events;
create policy "Missing child events readable" on public.missing_child_events for select to authenticated using (case_id is not null and public.has_safety_access(case_id));
drop policy if exists "Missing child events manageable" on public.missing_child_events;
create policy "Missing child events manageable" on public.missing_child_events for all to authenticated using (public.has_permission(tenant_id, 'missing_child.manage') or (case_id is not null and public.can_manage_safety(case_id))) with check (public.has_permission(tenant_id, 'missing_child.manage') or (case_id is not null and public.can_manage_safety(case_id)));

drop policy if exists "Emergency contacts readable" on public.safety_emergency_contacts;
create policy "Emergency contacts readable" on public.safety_emergency_contacts for select to authenticated using (case_id is not null and public.has_safety_access(case_id));

drop policy if exists "Escalation levels readable" on public.safety_escalation_levels;
create policy "Escalation levels readable" on public.safety_escalation_levels for select to authenticated using (active = true);
