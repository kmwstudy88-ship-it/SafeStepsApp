begin;

select plan(20);

select has_table('public', 'cases', 'cases exists');
select has_table('public', 'case_participants', 'case_participants exists');
select has_table('public', 'case_allocations', 'case_allocations exists');
select has_table('public', 'case_plans', 'case_plans exists');
select has_table('public', 'case_plan_goals', 'case_plan_goals exists');
select has_table('public', 'case_plan_actions', 'case_plan_actions exists');
select has_table('public', 'case_notes', 'case_notes exists');
select has_table('public', 'case_reviews', 'case_reviews exists');
select has_table('public', 'case_legal_references', 'case_legal_references exists');
select has_function('public', 'is_case_worker', array['uuid'], 'is_case_worker exists');
select has_function('public', 'is_case_supervisor', array['uuid'], 'is_case_supervisor exists');
select has_function('public', 'has_case_access', array['uuid'], 'has_case_access exists');
select has_function('public', 'can_view_case_note', array['uuid'], 'can_view_case_note exists');
select col_is_pk('public', 'cases', 'id', 'cases.id is primary key');
select col_is_fk('public', 'cases', 'family_id', 'cases.family_id is foreign key');
select col_is_fk('public', 'case_allocations', 'case_id', 'case_allocations.case_id is foreign key');
select col_is_fk('public', 'case_plans', 'case_id', 'case_plans.case_id is foreign key');
select col_is_fk('public', 'case_plan_goals', 'case_plan_id', 'case_plan_goals.case_plan_id is foreign key');
select col_is_fk('public', 'case_plan_actions', 'case_plan_goal_id', 'case_plan_actions.case_plan_goal_id is foreign key');
select col_is_fk('public', 'case_notes', 'case_id', 'case_notes.case_id is foreign key');

select * from finish();

rollback;
