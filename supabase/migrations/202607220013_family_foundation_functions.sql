create or replace function public.generate_family_reference()
returns text
language sql
volatile
as $$
  select 'FAM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
$$;

create or replace function public.generate_family_member_reference()
returns text
language sql
volatile
as $$
  select 'FM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
$$;

create or replace function public.generate_adult_reference()
returns text
language sql
volatile
as $$
  select 'ADU-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
$$;

create or replace function public.generate_child_reference()
returns text
language sql
volatile
as $$
  select 'CHD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
$$;

create or replace function public.calculate_developmental_stage(p_date_of_birth date)
returns text
language sql
stable
as $$
  select case
    when p_date_of_birth is null then null
    when age(current_date, p_date_of_birth) < interval '3 years' then 'early_childhood'
    when age(current_date, p_date_of_birth) < interval '6 years' then 'preschool'
    when age(current_date, p_date_of_birth) < interval '13 years' then 'primary_school'
    when age(current_date, p_date_of_birth) < interval '18 years' then 'adolescent'
    else 'adult'
  end;
$$;

create or replace function public.current_family_member_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select fm.id
  from public.family_members fm
  where fm.profile_id = auth.uid()
     or fm.user_id = auth.uid();
$$;

create or replace function public.is_family_member(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = p_family_id
      and (fm.profile_id = auth.uid() or fm.user_id = auth.uid())
      and coalesce(fm.member_status, 'active') = 'active'
  );
$$;

create or replace function public.is_child_subject(p_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.children c
    join public.family_members fm on fm.id = c.family_member_id
    where c.id = p_child_id
      and (fm.profile_id = auth.uid() or fm.user_id = auth.uid())
  );
$$;

create or replace function public.is_active_guardian(p_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guardianship_records gr
    join public.family_members fm on fm.id = gr.guardian_family_member_id
    where gr.child_id = p_child_id
      and gr.guardianship_status in ('reported', 'verified', 'active')
      and (gr.effective_to is null or gr.effective_to > current_date)
      and (fm.profile_id = auth.uid() or fm.user_id = auth.uid())
  );
$$;

create or replace function public.can_manage_family(p_tenant_id uuid, p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_permission(p_tenant_id, 'family.update')
    or public.has_permission(p_tenant_id, 'family.create')
    or public.has_role(p_tenant_id, 'family_intake_worker')
    or public.has_role(p_tenant_id, 'assigned_worker', 'family', p_family_id)
    or public.has_role(p_tenant_id, 'supervisor');
$$;

create or replace function public.validate_family_member_tenant()
returns trigger
language plpgsql
as $$
declare
  v_family_tenant_id uuid;
begin
  select tenant_id into v_family_tenant_id from public.families where id = new.family_id;
  if v_family_tenant_id is distinct from new.tenant_id then
    raise exception 'Family member tenant does not match family tenant';
  end if;
  return new;
end;
$$;

create or replace function public.validate_child_member_type()
returns trigger
language plpgsql
as $$
declare
  v_member_type text;
begin
  select member_type into v_member_type from public.family_members where id = new.family_member_id;
  if v_member_type is distinct from 'child' then
    raise exception 'Child record must link to a child family member';
  end if;
  insert into public.child_privacy_settings (tenant_id, child_id)
  values (new.tenant_id, new.id)
  on conflict (child_id) do nothing;
  return new;
end;
$$;

create or replace function public.validate_adult_member_type()
returns trigger
language plpgsql
as $$
declare
  v_member_type text;
begin
  select member_type into v_member_type from public.family_members where id = new.family_member_id;
  if v_member_type = 'child' then
    raise exception 'Adult participant cannot link to a child family member';
  end if;
  return new;
end;
$$;

create or replace function public.validate_family_relationship_tenant()
returns trigger
language plpgsql
as $$
declare
  v_from_family uuid;
  v_to_family uuid;
  v_from_tenant uuid;
  v_to_tenant uuid;
begin
  select family_id, tenant_id into v_from_family, v_from_tenant
  from public.family_members where id = new.from_family_member_id;

  select family_id, tenant_id into v_to_family, v_to_tenant
  from public.family_members where id = new.to_family_member_id;

  if v_from_family is distinct from new.family_id or v_to_family is distinct from new.family_id then
    raise exception 'Relationship members must belong to the relationship family';
  end if;

  if v_from_tenant is distinct from new.tenant_id or v_to_tenant is distinct from new.tenant_id then
    raise exception 'Relationship members must belong to the relationship tenant';
  end if;

  return new;
end;
$$;

create or replace function public.validate_household_membership_family()
returns trigger
language plpgsql
as $$
declare
  v_household_family uuid;
  v_member_family uuid;
begin
  select family_id into v_household_family from public.households where id = new.household_id;
  select family_id into v_member_family from public.family_members where id = new.family_member_id;
  if v_household_family is distinct from v_member_family then
    raise exception 'Household member must belong to the same family as the household';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_family_member_tenant_trigger on public.family_members;
create trigger validate_family_member_tenant_trigger
before insert or update on public.family_members
for each row execute function public.validate_family_member_tenant();

drop trigger if exists validate_child_member_type_trigger on public.children;
create trigger validate_child_member_type_trigger
after insert or update on public.children
for each row execute function public.validate_child_member_type();

drop trigger if exists validate_adult_member_type_trigger on public.adult_participants;
create trigger validate_adult_member_type_trigger
before insert or update on public.adult_participants
for each row execute function public.validate_adult_member_type();

drop trigger if exists validate_family_relationship_tenant_trigger on public.family_relationships;
create trigger validate_family_relationship_tenant_trigger
before insert or update on public.family_relationships
for each row execute function public.validate_family_relationship_tenant();

drop trigger if exists validate_household_membership_family_trigger on public.household_memberships;
create trigger validate_household_membership_family_trigger
before insert or update on public.household_memberships
for each row execute function public.validate_household_membership_family();

create or replace function public.create_family_group(
  p_tenant_id uuid,
  p_family_display_name text,
  p_primary_adult jsonb,
  p_children jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_adult_member_id uuid;
  v_child jsonb;
  v_child_member_id uuid;
begin
  if not (
    public.has_role(p_tenant_id, 'family_intake_worker')
    or public.has_role(p_tenant_id, 'tenant_administrator')
  ) then
    raise exception 'Not authorised';
  end if;

  insert into public.families (
    tenant_id,
    family_reference,
    family_display_name,
    family_type,
    family_status,
    created_by_user_id
  )
  values (
    p_tenant_id,
    public.generate_family_reference(),
    p_family_display_name,
    'household',
    'active',
    auth.uid()
  )
  returning id into v_family_id;

  insert into public.family_members (
    tenant_id,
    family_id,
    member_reference,
    member_type,
    legal_first_name,
    legal_last_name,
    preferred_name,
    display_name,
    date_of_birth
  )
  values (
    p_tenant_id,
    v_family_id,
    public.generate_family_member_reference(),
    'parent',
    p_primary_adult ->> 'first_name',
    p_primary_adult ->> 'last_name',
    p_primary_adult ->> 'preferred_name',
    coalesce(p_primary_adult ->> 'display_name', trim(concat_ws(' ', p_primary_adult ->> 'first_name', p_primary_adult ->> 'last_name'))),
    nullif(p_primary_adult ->> 'date_of_birth', '')::date
  )
  returning id into v_adult_member_id;

  insert into public.adult_participants (
    tenant_id,
    family_member_id,
    adult_reference,
    participant_category
  )
  values (
    p_tenant_id,
    v_adult_member_id,
    public.generate_adult_reference(),
    'parent'
  );

  for v_child in select value from jsonb_array_elements(p_children)
  loop
    insert into public.family_members (
      tenant_id,
      family_id,
      member_reference,
      member_type,
      legal_first_name,
      legal_last_name,
      preferred_name,
      display_name,
      date_of_birth
    )
    values (
      p_tenant_id,
      v_family_id,
      public.generate_family_member_reference(),
      'child',
      v_child ->> 'first_name',
      v_child ->> 'last_name',
      v_child ->> 'preferred_name',
      coalesce(v_child ->> 'display_name', trim(concat_ws(' ', v_child ->> 'first_name', v_child ->> 'last_name'))),
      nullif(v_child ->> 'date_of_birth', '')::date
    )
    returning id into v_child_member_id;

    insert into public.children (
      tenant_id,
      family_member_id,
      child_reference,
      developmental_stage
    )
    values (
      p_tenant_id,
      v_child_member_id,
      public.generate_child_reference(),
      public.calculate_developmental_stage(nullif(v_child ->> 'date_of_birth', '')::date)
    );

    insert into public.family_relationships (
      tenant_id,
      family_id,
      from_family_member_id,
      to_family_member_id,
      relationship_type,
      biological_relationship,
      relationship_status,
      confidence_level
    )
    values (
      p_tenant_id,
      v_family_id,
      v_adult_member_id,
      v_child_member_id,
      'biological_parent',
      null,
      'reported',
      'reported'
    );
  end loop;

  return v_family_id;
end;
$$;

revoke all on function public.create_family_group(uuid, text, jsonb, jsonb) from public;
revoke all on function public.create_family_group(uuid, text, jsonb, jsonb) from anon;
grant execute on function public.create_family_group(uuid, text, jsonb, jsonb) to authenticated;
