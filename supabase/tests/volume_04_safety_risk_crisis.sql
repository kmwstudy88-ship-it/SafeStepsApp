begin;

select plan(20);

select has_table('public', 'safety_plans', 'safety_plans exists');
select has_table('public', 'safety_plan_versions', 'safety_plan_versions exists');
select has_table('public', 'safety_goals', 'safety_goals exists');
select has_table('public', 'safety_actions', 'safety_actions exists');
select has_table('public', 'safety_protective_factors', 'safety_protective_factors exists');
select has_table('public', 'safety_risk_factors', 'safety_risk_factors exists');
select has_table('public', 'safety_risk_assessments', 'safety_risk_assessments exists');
select has_table('public', 'ai_risk_signals', 'ai_risk_signals exists');
select has_table('public', 'safety_alerts', 'safety_alerts exists');
select has_table('public', 'safety_incidents', 'safety_incidents exists');
select has_table('public', 'crisis_events', 'crisis_events exists');
select has_table('public', 'weapon_risk_detections', 'weapon_risk_detections exists');
select has_table('public', 'missing_child_events', 'missing_child_events exists');
select has_table('public', 'child_disclosures', 'child_disclosures exists');
select has_function('public', 'has_safety_access', array['uuid'], 'has_safety_access exists');
select has_function('public', 'can_manage_safety', array['uuid'], 'can_manage_safety exists');
select col_is_pk('public', 'safety_plans', 'id', 'safety_plans.id is primary key');
select col_is_fk('public', 'safety_plans', 'case_id', 'safety_plans.case_id is foreign key');
select col_is_fk('public', 'safety_incidents', 'case_id', 'safety_incidents.case_id is foreign key');
select col_is_fk('public', 'child_disclosures', 'child_id', 'child_disclosures.child_id is foreign key');

select * from finish();

rollback;
