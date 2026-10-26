-- SC-001 / SC-007, PG-01: restrict direct client writes independently of permissive RLS.
-- Trusted provisioning and administration must use an authorized backend/RPC.
-- This does not certify existing SECURITY DEFINER functions or deploy itself.
begin;

do $$
declare
  relation_name text;
  column_list text;
begin
  foreach relation_name in array array[
    'profiles', 'staff_profiles', 'platform_tenant_memberships'
  ] loop
    if to_regclass(format('public.%I', relation_name)) is null then
      raise exception 'Required identity table public.% is missing', relation_name;
    end if;
    -- Removing a table grant does not remove independent column grants.
    select string_agg(format('%I', a.attname), ', ' order by a.attnum)
      into column_list
    from pg_attribute a
    where a.attrelid = to_regclass(format('public.%I', relation_name))
      and a.attnum > 0 and not a.attisdropped;

    execute format('revoke all privileges on table public.%I from public, anon', relation_name);
    execute format(
      'revoke insert, update, delete, truncate, references, trigger on table public.%I from authenticated',
      relation_name
    );
    execute format(
      'revoke insert (%s), update (%s), references (%s) on table public.%I from public, anon, authenticated',
      column_list, column_list, column_list, relation_name
    );
  end loop;
end;
$$;

-- Existing SELECT grants and RLS still decide which rows a client may access.
-- New columns are protected by default: this allowlist must be reviewed to expand it.
grant update (
  display_name, preferred_name, avatar_url, avatar_storage_path,
  story_goal, strengths, representation_preferences,
  primary_phone, preferred_language_code, preferred_timezone,
  accessibility_preferences, notification_preferences, updated_at
) on public.profiles to authenticated;

grant update (display_name) on public.staff_profiles to authenticated;

-- The legacy projection must not supply an alternate write API.
revoke insert, update, delete, truncate, references, trigger
  on public.workers from public, anon, authenticated;
do $$
declare columns_sql text;
begin
  select string_agg(format('%I', attname), ', ' order by attnum)
    into columns_sql
  from pg_attribute
  where attrelid = 'public.workers'::regclass and attnum > 0 and not attisdropped;
  execute format(
    'revoke insert (%s), update (%s), references (%s) on public.workers from public, anon, authenticated',
    columns_sql, columns_sql, columns_sql
  );
end;
$$;

-- Abort if inherited grants or unexpected role configuration defeat the boundary.
do $$
declare
  t text;
  c record;
  allowed text[];
begin
  foreach t in array array['profiles','staff_profiles','platform_tenant_memberships'] loop
    allowed := case t
      when 'profiles' then array[
        'display_name','preferred_name','avatar_url','avatar_storage_path',
        'story_goal','strengths','representation_preferences','primary_phone',
        'preferred_language_code','preferred_timezone','accessibility_preferences',
        'notification_preferences','updated_at'
      ]
      when 'staff_profiles' then array['display_name']
      else array[]::text[]
    end;
    if has_table_privilege('authenticated', format('public.%I',t), 'DELETE')
       or has_table_privilege('authenticated', format('public.%I',t), 'TRUNCATE') then
      raise exception 'Inherited destructive client privilege remains on %', t;
    end if;
    for c in select attname from pg_attribute
      where attrelid = to_regclass(format('public.%I',t))
        and attnum > 0 and not attisdropped
    loop
      if has_column_privilege('authenticated', format('public.%I',t), c.attname, 'INSERT')
         or (not (c.attname = any(allowed))
             and has_column_privilege('authenticated', format('public.%I',t), c.attname, 'UPDATE'))
         or has_column_privilege('anon', format('public.%I',t), c.attname, 'INSERT')
         or has_column_privilege('anon', format('public.%I',t), c.attname, 'UPDATE') then
        raise exception 'Unexpected client write privilege remains on %.%', t, c.attname;
      end if;
    end loop;
  end loop;
end;
$$;

commit;
