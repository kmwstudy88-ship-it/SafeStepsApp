
create or replace function public.has_case_permission(p_user_id uuid,p_case_id uuid,p_permission_code text)
returns boolean language sql stable security definer set search_path=''
as $f$
select p_user_id is not null and p_user_id=auth.uid() and (
 exists(select 1 from public.case_participants cp join public.cases c on c.id=cp.case_id
 join public.user_role_assignments ura on ura.user_id=cp.user_id and (ura.case_id=cp.case_id or ura.organisation_id=c.organisation_id)
 join public.role_permissions rp on rp.role_id=ura.role_id join public.security_permissions p on p.id=rp.permission_id
 where cp.case_id=p_case_id and cp.user_id=p_user_id and cp.status='active' and ura.status='active'
 and p.permission_code=p_permission_code and (cp.effective_to is null or cp.effective_to>now())
 and (ura.starts_at is null or ura.starts_at<=now()) and (ura.ends_at is null or ura.ends_at>now())
 and (c.organisation_id is null or public.safesteps_is_active_member(p_user_id,c.organisation_id)))
 or exists(select 1 from public.temporary_access_grants tag where tag.user_id=p_user_id and tag.case_id=p_case_id
 and p_permission_code=any(tag.permission_codes) and tag.revoked_at is null and tag.starts_at<=now() and tag.expires_at>now())
); $f$;

create or replace function public.safesteps_can_manage_ai_governance(p_user_id uuid,p_organisation_id uuid)
returns boolean language sql stable security definer set search_path=''
as $f$ select p_user_id is not null and p_user_id=auth.uid() and coalesce(
 public.safesteps_can_admin_organisation(p_user_id,p_organisation_id)
 or public.has_resource_permission(p_user_id,'organisation',p_organisation_id,'ai_governance.manage'),false); $f$;

create or replace function public.safesteps_can_manage_ai_operations(p_user_id uuid,p_organisation_id uuid)
returns boolean language sql stable security definer set search_path=''
as $f$ select p_user_id is not null and p_user_id=auth.uid() and coalesce(
 public.safesteps_can_manage_ai_governance(p_user_id,p_organisation_id)
 or public.has_resource_permission(p_user_id,'organisation',p_organisation_id,'ai_operations.manage')
 or public.has_resource_permission(p_user_id,'global',null,'ai_operations.manage'),false); $f$;

create or replace function public.safesteps_can_manage_ai_learning(p_user_id uuid,p_organisation_id uuid)
returns boolean language sql stable security definer set search_path=''
as $f$ select p_user_id is not null and p_user_id=auth.uid() and coalesce(
 public.safesteps_can_manage_ai_governance(p_user_id,p_organisation_id)
 or public.safesteps_can_manage_ai_operations(p_user_id,p_organisation_id)
 or public.has_resource_permission(p_user_id,'organisation',p_organisation_id,'ai_learning.manage')
 or public.has_resource_permission(p_user_id,'global',null,'ai_learning.manage'),false); $f$;

create or replace function public.safesteps_can_manage_ai_explainability(p_user_id uuid,p_organisation_id uuid)
returns boolean language sql stable security definer set search_path=''
as $f$ select p_user_id is not null and p_user_id=auth.uid() and coalesce(
 public.safesteps_can_manage_ai_governance(p_user_id,p_organisation_id)
 or public.has_resource_permission(p_user_id,'organisation',p_organisation_id,'ai_explainability.manage')
 or public.has_resource_permission(p_user_id,'global',null,'ai_explainability.manage'),false); $f$;

create or replace function public.safesteps_can_manage_ai_prompt_workflow(p_user_id uuid,p_organisation_id uuid)
returns boolean language sql stable security definer set search_path=''
as $f$ select p_user_id is not null and p_user_id=auth.uid() and coalesce(
 public.safesteps_can_manage_ai_governance(p_user_id,p_organisation_id)
 or public.has_resource_permission(p_user_id,'organisation',p_organisation_id,'ai_prompt_workflow.manage')
 or public.has_resource_permission(p_user_id,'global',null,'ai_prompt_workflow.manage'),false); $f$;

create or replace function public.safesteps_can_manage_ai_evaluation(p_user_id uuid,p_organisation_id uuid)
returns boolean language sql stable security definer set search_path=''
as $f$ select p_user_id is not null and p_user_id=auth.uid() and coalesce(
 public.safesteps_can_manage_ai_governance(p_user_id,p_organisation_id)
 or public.has_resource_permission(p_user_id,'organisation',p_organisation_id,'ai_evaluation.manage')
 or public.has_resource_permission(p_user_id,'global',null,'ai_evaluation.manage'),false); $f$;

create or replace function public.safesteps_can_manage_ai_model_lifecycle(p_user_id uuid,p_organisation_id uuid)
returns boolean language sql stable security definer set search_path=''
as $f$ select p_user_id is not null and p_user_id=auth.uid() and coalesce(
 public.safesteps_can_manage_ai_governance(p_user_id,p_organisation_id)
 or public.has_resource_permission(p_user_id,'organisation',p_organisation_id,'ai_model_lifecycle.manage')
 or public.has_resource_permission(p_user_id,'global',null,'ai_model_lifecycle.manage'),false); $f$;

create or replace function public.safesteps_can_manage_casework(p_user_id uuid,p_organisation_id uuid)
returns boolean language sql stable security definer set search_path=''
as $f$ select p_user_id is not null and p_user_id=auth.uid() and coalesce(
 public.safesteps_can_admin_organisation(p_user_id,p_organisation_id)
 or public.has_resource_permission(p_user_id,'organisation',p_organisation_id,'case_management.manage')
 or public.has_resource_permission(p_user_id,'organisation',p_organisation_id,'casework.manage')
 or public.has_resource_permission(p_user_id,'global',null,'case_management.manage'),false); $f$;

create or replace function public.safesteps_is_ai_governance_member(p_user_id uuid,p_governance_body_id uuid)
returns boolean language sql stable security definer set search_path=''
as $f$ select p_user_id is not null and p_user_id=auth.uid() and exists(
 select 1 from public.ai_governance_memberships m where m.governance_body_id=p_governance_body_id
 and m.user_id=p_user_id and m.status='active' and (m.ends_at is null or m.ends_at>now())); $f$;

revoke all on function public.has_case_permission(uuid,uuid,text) from public,anon;
revoke all on function public.safesteps_can_manage_ai_governance(uuid,uuid) from public,anon;
revoke all on function public.safesteps_can_manage_ai_operations(uuid,uuid) from public,anon;
revoke all on function public.safesteps_can_manage_ai_learning(uuid,uuid) from public,anon;
revoke all on function public.safesteps_can_manage_ai_explainability(uuid,uuid) from public,anon;
revoke all on function public.safesteps_can_manage_ai_prompt_workflow(uuid,uuid) from public,anon;
revoke all on function public.safesteps_can_manage_ai_evaluation(uuid,uuid) from public,anon;
revoke all on function public.safesteps_can_manage_ai_model_lifecycle(uuid,uuid) from public,anon;
revoke all on function public.safesteps_can_manage_casework(uuid,uuid) from public,anon;
revoke all on function public.safesteps_is_ai_governance_member(uuid,uuid) from public,anon;

grant execute on function public.has_case_permission(uuid,uuid,text) to authenticated,service_role;
grant execute on function public.safesteps_can_manage_ai_governance(uuid,uuid) to authenticated,service_role;
grant execute on function public.safesteps_can_manage_ai_operations(uuid,uuid) to authenticated,service_role;
grant execute on function public.safesteps_can_manage_ai_learning(uuid,uuid) to authenticated,service_role;
grant execute on function public.safesteps_can_manage_ai_explainability(uuid,uuid) to authenticated,service_role;
grant execute on function public.safesteps_can_manage_ai_prompt_workflow(uuid,uuid) to authenticated,service_role;
grant execute on function public.safesteps_can_manage_ai_evaluation(uuid,uuid) to authenticated,service_role;
grant execute on function public.safesteps_can_manage_ai_model_lifecycle(uuid,uuid) to authenticated,service_role;
grant execute on function public.safesteps_can_manage_casework(uuid,uuid) to authenticated,service_role;
grant execute on function public.safesteps_is_ai_governance_member(uuid,uuid) to authenticated,service_role;
