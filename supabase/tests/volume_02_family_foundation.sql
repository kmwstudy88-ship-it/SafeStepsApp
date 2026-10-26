begin;

select plan(20);

select has_table('public', 'families', 'families exists');
select has_table('public', 'family_members', 'family_members exists');
select has_table('public', 'adult_participants', 'adult_participants exists');
select has_table('public', 'children', 'children exists');
select has_table('public', 'family_relationships', 'family_relationships exists');
select has_table('public', 'households', 'households exists');
select has_table('public', 'household_memberships', 'household_memberships exists');
select has_table('public', 'guardianship_records', 'guardianship_records exists');
select has_table('public', 'care_arrangements', 'care_arrangements exists');
select has_table('public', 'child_privacy_settings', 'child_privacy_settings exists');
select has_table('public', 'child_sharing_grants', 'child_sharing_grants exists');
select has_function('public', 'current_family_member_ids', array[]::text[], 'current_family_member_ids exists');
select has_function('public', 'is_family_member', array['uuid'], 'is_family_member exists');
select has_function('public', 'is_child_subject', array['uuid'], 'is_child_subject exists');
select has_function('public', 'is_active_guardian', array['uuid'], 'is_active_guardian exists');
select has_function('public', 'can_manage_family', array['uuid', 'uuid'], 'can_manage_family exists');
select col_is_pk('public', 'families', 'id', 'families.id is primary key');
select col_is_fk('public', 'families', 'tenant_id', 'families.tenant_id is foreign key');
select col_is_fk('public', 'children', 'family_member_id', 'children.family_member_id is foreign key');
select col_is_fk('public', 'family_relationships', 'family_id', 'family_relationships.family_id is foreign key');

select * from finish();

rollback;
