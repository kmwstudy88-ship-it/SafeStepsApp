create or replace function public.safesteps_is_active_member(
  target_user_id uuid,
  target_organisation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select target_user_id is not null
    and target_user_id = auth.uid()
    and exists (
      select 1
      from public.organisation_memberships om
      where om.user_id = target_user_id
        and om.organisation_id = target_organisation_id
        and om.status = 'active'
        and (om.starts_at is null or om.starts_at <= now())
        and (om.ends_at is null or om.ends_at > now())
    );
$function$;

create or replace function public.safesteps_can_admin_organisation(
  p_user_id uuid,
  p_organisation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select p_user_id is not null
    and p_user_id = auth.uid()
    and (
      public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'organisation.manage')
      or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'security.manage')
      or exists (
        select 1
        from public.user_role_assignments ura
        join public.security_roles sr on sr.id = ura.role_id
        where ura.user_id = p_user_id
          and ura.organisation_id = p_organisation_id
          and ura.status = 'active'
          and sr.role_code in ('organisation_admin','security_admin')
          and (ura.starts_at is null or ura.starts_at <= now())
          and (ura.ends_at is null or ura.ends_at > now())
      )
    );
$function$;

create or replace function public.safesteps_can_manage_platform_tenant(
  p_user_id uuid,
  p_tenant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select p_user_id is not null
    and p_user_id = auth.uid()
    and (
      coalesce(public.current_user_has_role('admin'), false)
      or coalesce(public.has_resource_permission(p_user_id, 'tenant', p_tenant_id, 'tenant.manage'), false)
      or exists (
        select 1
        from public.platform_tenant_memberships tm
        where tm.tenant_id = p_tenant_id
          and tm.user_id = p_user_id
          and tm.membership_status = 'active'
          and tm.membership_role in ('tenant_admin','tenant_security_admin','tenant_platform_admin')
          and tm.effective_from <= now()
          and (tm.effective_to is null or tm.effective_to > now())
      )
      or exists (
        select 1
        from public.platform_tenant_organisations torg
        where torg.tenant_id = p_tenant_id
          and torg.status = 'active'
          and public.safesteps_can_admin_organisation(p_user_id, torg.organisation_id)
      )
    );
$function$;

create or replace function public.safesteps_can_access_platform_tenant_config(
  p_user_id uuid,
  p_tenant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select p_user_id is not null
    and p_user_id = auth.uid()
    and (
      public.safesteps_can_manage_platform_tenant(p_user_id, p_tenant_id)
      or coalesce(public.has_resource_permission(p_user_id, 'tenant', p_tenant_id, 'tenant_config.read'), false)
      or exists (
        select 1
        from public.platform_tenant_memberships tm
        where tm.tenant_id = p_tenant_id
          and tm.user_id = p_user_id
          and tm.membership_status = 'active'
          and tm.effective_from <= now()
          and (tm.effective_to is null or tm.effective_to > now())
      )
      or exists (
        select 1
        from public.platform_tenant_organisations torg
        where torg.tenant_id = p_tenant_id
          and torg.status = 'active'
          and public.safesteps_is_active_member(p_user_id, torg.organisation_id)
      )
    );
$function$;

create or replace function public.safesteps_can_manage_community_services(
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select p_user_id is not null
    and p_user_id = auth.uid()
    and coalesce(
      public.current_user_has_role('admin')
      or public.has_resource_permission(p_user_id, 'global', null, 'community_services.manage')
      or public.has_resource_permission(p_user_id, 'global', null, 'service_directory.manage'),
      false
    );
$function$;

create or replace function public.safesteps_can_access_community_referral(
  p_user_id uuid,
  p_referral_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select p_user_id is not null
    and p_user_id = auth.uid()
    and exists (
      select 1
      from public.community_service_referrals r
      where r.id = p_referral_id
        and (
          r.parent_user_id = p_user_id
          or r.referred_by_user_id = p_user_id
          or public.safesteps_can_manage_community_services(p_user_id)
          or (
            r.case_id is not null
            and public.safesteps_can_access_case_v19(p_user_id, r.case_id)
          )
        )
    );
$function$;

revoke all on function public.safesteps_is_active_member(uuid, uuid) from public, anon;
revoke all on function public.safesteps_can_admin_organisation(uuid, uuid) from public, anon;
revoke all on function public.safesteps_can_manage_platform_tenant(uuid, uuid) from public, anon;
revoke all on function public.safesteps_can_access_platform_tenant_config(uuid, uuid) from public, anon;
revoke all on function public.safesteps_can_manage_community_services(uuid) from public, anon;
revoke all on function public.safesteps_can_access_community_referral(uuid, uuid) from public, anon;

grant execute on function public.safesteps_is_active_member(uuid, uuid) to authenticated, service_role;
grant execute on function public.safesteps_can_admin_organisation(uuid, uuid) to authenticated, service_role;
grant execute on function public.safesteps_can_manage_platform_tenant(uuid, uuid) to authenticated, service_role;
grant execute on function public.safesteps_can_access_platform_tenant_config(uuid, uuid) to authenticated, service_role;
grant execute on function public.safesteps_can_manage_community_services(uuid) to authenticated, service_role;
grant execute on function public.safesteps_can_access_community_referral(uuid, uuid) to authenticated, service_role;
