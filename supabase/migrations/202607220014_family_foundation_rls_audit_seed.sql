alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.adult_participants enable row level security;
alter table public.children enable row level security;
alter table public.relationship_type_definitions enable row level security;
alter table public.family_relationships enable row level security;
alter table public.family_relationship_history enable row level security;
alter table public.households enable row level security;
alter table public.household_memberships enable row level security;
alter table public.guardianship_records enable row level security;
alter table public.care_arrangements enable row level security;
alter table public.family_contact_points enable row level security;
alter table public.family_addresses enable row level security;
alter table public.family_address_links enable row level security;
alter table public.child_privacy_settings enable row level security;
alter table public.child_sharing_grants enable row level security;
alter table public.child_privacy_decisions enable row level security;

grant select, insert, update on
  public.families,
  public.family_members,
  public.adult_participants,
  public.children,
  public.family_relationships,
  public.households,
  public.household_memberships,
  public.guardianship_records,
  public.care_arrangements,
  public.family_contact_points,
  public.family_addresses,
  public.family_address_links,
  public.child_privacy_settings,
  public.child_sharing_grants,
  public.child_privacy_decisions
to authenticated;

grant select on public.relationship_type_definitions to authenticated;

drop policy if exists "Families readable by tenant or family access" on public.families;
create policy "Families readable by tenant or family access"
on public.families for select to authenticated
using (public.has_permission(tenant_id, 'family.view') or public.is_family_member(id));

drop policy if exists "Families manageable by authorised users" on public.families;
create policy "Families manageable by authorised users"
on public.families for all to authenticated
using (public.can_manage_family(tenant_id, id))
with check (public.can_manage_family(tenant_id, id));

drop policy if exists "Family members readable by authorised users" on public.family_members;
create policy "Family members readable by authorised users"
on public.family_members for select to authenticated
using (public.has_permission(tenant_id, 'family.view') or public.is_family_member(family_id));

drop policy if exists "Family members manageable by authorised users" on public.family_members;
create policy "Family members manageable by authorised users"
on public.family_members for all to authenticated
using (public.can_manage_family(tenant_id, family_id))
with check (public.can_manage_family(tenant_id, family_id));

drop policy if exists "Children identity readable by authorised users" on public.children;
create policy "Children identity readable by authorised users"
on public.children for select to authenticated
using (
  public.has_permission(tenant_id, 'child.view_identity')
  or public.is_child_subject(id)
  or public.is_active_guardian(id)
);

drop policy if exists "Child identity manageable by authorised users" on public.children;
create policy "Child identity manageable by authorised users"
on public.children for all to authenticated
using (public.has_permission(tenant_id, 'child.manage_identity'))
with check (public.has_permission(tenant_id, 'child.manage_identity'));

drop policy if exists "Relationship types readable" on public.relationship_type_definitions;
create policy "Relationship types readable"
on public.relationship_type_definitions for select to authenticated
using (active = true);

drop policy if exists "Family relationships readable" on public.family_relationships;
create policy "Family relationships readable"
on public.family_relationships for select to authenticated
using (public.has_permission(tenant_id, 'family.view') or public.is_family_member(family_id));

drop policy if exists "Family relationships manageable" on public.family_relationships;
create policy "Family relationships manageable"
on public.family_relationships for all to authenticated
using (public.can_manage_family(tenant_id, family_id) or public.has_permission(tenant_id, 'relationship.manage'))
with check (public.can_manage_family(tenant_id, family_id) or public.has_permission(tenant_id, 'relationship.manage'));

drop policy if exists "Child privacy readable" on public.child_privacy_settings;
create policy "Child privacy readable"
on public.child_privacy_settings for select to authenticated
using (public.is_child_subject(child_id) or public.has_permission(tenant_id, 'child.privacy_review'));

drop policy if exists "Child privacy manageable" on public.child_privacy_settings;
create policy "Child privacy manageable"
on public.child_privacy_settings for all to authenticated
using (public.is_child_subject(child_id) or public.has_permission(tenant_id, 'child.privacy_review'))
with check (public.is_child_subject(child_id) or public.has_permission(tenant_id, 'child.privacy_review'));

drop policy if exists "Child sharing grants readable" on public.child_sharing_grants;
create policy "Child sharing grants readable"
on public.child_sharing_grants for select to authenticated
using (
  public.is_child_subject(child_id)
  or grantee_user_id = auth.uid()
  or public.has_permission(tenant_id, 'child.privacy_review')
);

drop policy if exists "Child sharing grants manageable" on public.child_sharing_grants;
create policy "Child sharing grants manageable"
on public.child_sharing_grants for all to authenticated
using (public.is_child_subject(child_id) or public.has_permission(tenant_id, 'child.privacy_review'))
with check (public.is_child_subject(child_id) or public.has_permission(tenant_id, 'child.privacy_review'));

drop policy if exists "Households readable" on public.households;
create policy "Households readable"
on public.households for select to authenticated
using (public.has_permission(tenant_id, 'family.view') or public.is_family_member(family_id));

drop policy if exists "Households manageable" on public.households;
create policy "Households manageable"
on public.households for all to authenticated
using (public.can_manage_family(tenant_id, family_id) or public.has_permission(tenant_id, 'household.manage'))
with check (public.can_manage_family(tenant_id, family_id) or public.has_permission(tenant_id, 'household.manage'));

insert into public.relationship_type_definitions (
  relationship_type_code,
  relationship_type_name,
  inverse_relationship_type_code,
  relationship_category,
  biological_possible,
  guardianship_possible,
  active
)
values
  ('biological_parent', 'Biological parent', 'child', 'parent_child', true, true, true),
  ('parent', 'Parent', 'child', 'parent_child', false, true, true),
  ('guardian', 'Guardian', 'child', 'care', false, true, true),
  ('carer', 'Carer', 'child', 'care', false, false, true),
  ('foster_carer', 'Foster carer', 'child', 'care', true, false, true),
  ('child', 'Child', null, 'parent_child', false, true, true),
  ('sibling', 'Sibling', 'sibling', 'sibling', false, true, true),
  ('half_sibling', 'Half sibling', 'half_sibling', 'sibling', false, true, true),
  ('step_sibling', 'Step sibling', 'step_sibling', 'sibling', false, false, true),
  ('grandparent', 'Grandparent', 'grandchild', 'extended_family', false, true, true),
  ('grandchild', 'Grandchild', 'grandparent', 'extended_family', false, true, true),
  ('partner', 'Partner', 'partner', 'adult_relationship', false, false, false),
  ('former_partner', 'Former partner', 'former_partner', 'adult_relationship', false, false, false),
  ('support_person', 'Support person', null, 'support', false, false, false)
on conflict (relationship_type_code) do nothing;

insert into public.role_definitions (
  tenant_id,
  role_code,
  role_name,
  role_description,
  role_category,
  system_role,
  tenant_customisable
)
values
  (null, 'family_intake_worker', 'Family Intake Worker', 'Creates family records and completes initial family intake.', 'casework', true, false),
  (null, 'assigned_worker', 'Assigned Worker', 'Works with an assigned family or case.', 'casework', true, false),
  (null, 'child_privacy_reviewer', 'Child Privacy Reviewer', 'Reviews child privacy and sharing decisions.', 'child_governance', true, false)
on conflict (tenant_id, role_code) do nothing;

insert into public.permission_definitions (
  permission_code,
  permission_name,
  permission_description,
  permission_domain,
  action_type,
  sensitive_permission,
  tenant_assignable
)
values
  ('family.view', 'View family', 'View an authorised family record.', 'family', 'read', true, true),
  ('family.create', 'Create family', 'Create a family and initial family members.', 'family', 'create', true, true),
  ('family.update', 'Update family', 'Update authorised family records.', 'family', 'update', true, true),
  ('child.view_identity', 'View child identity', 'View authorised child identity information.', 'child', 'read', true, true),
  ('child.manage_identity', 'Manage child identity', 'Create and update child identity information.', 'child', 'manage', true, true),
  ('child.privacy_review', 'Review child privacy', 'Review child privacy and sharing settings.', 'child', 'review', true, true),
  ('relationship.manage', 'Manage family relationships', 'Create and update family relationship records.', 'family', 'manage', true, true),
  ('household.manage', 'Manage households', 'Create and update household records.', 'family', 'manage', true, true)
on conflict (permission_code) do nothing;

drop trigger if exists audit_families on public.families;
create trigger audit_families after insert or update or delete on public.families
for each row execute function public.audit_row_change();

drop trigger if exists audit_family_members on public.family_members;
create trigger audit_family_members after insert or update or delete on public.family_members
for each row execute function public.audit_row_change();

drop trigger if exists audit_family_relationships on public.family_relationships;
create trigger audit_family_relationships after insert or update or delete on public.family_relationships
for each row execute function public.audit_row_change();

drop trigger if exists audit_child_privacy_settings on public.child_privacy_settings;
create trigger audit_child_privacy_settings after insert or update or delete on public.child_privacy_settings
for each row execute function public.audit_row_change();

drop trigger if exists audit_child_sharing_grants on public.child_sharing_grants;
create trigger audit_child_sharing_grants after insert or update or delete on public.child_sharing_grants
for each row execute function public.audit_row_change();
