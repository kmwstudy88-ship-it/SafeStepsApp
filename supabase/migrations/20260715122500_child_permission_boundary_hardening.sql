-- SafeSteps child permission boundary hardening.
-- Parents never receive raw child-private table access. Staff access requires case assignment.

alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check check (role in (
  'child','parent','facilitator','admin','super_admin','caseworker','supervisor','clinician',
  'court_viewer','carer','advocate'
));

create or replace function public.child_case_id(target_child_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select cp.case_id
  from public.child_profiles cp
  where cp.child_user_id = target_child_user_id
    and cp.case_id is not null
  limit 1;
$$;

create or replace function public.user_can_manage_child_private(target_child_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_child_user_id = auth.uid()
  or exists (
    select 1 from public.child_profiles cp
    where cp.child_user_id = target_child_user_id
      and cp.case_id is not null
      and public.user_has_case_role(cp.case_id, array['caseworker','supervisor','clinician','admin']::text[])
  );
$$;

-- Child profile case assignment is staff-controlled; a child cannot reassign their own family/case.
drop policy if exists child_profiles_select on public.child_profiles;
create policy child_profiles_select on public.child_profiles for select to authenticated using (
  child_user_id = (select auth.uid())
  or (case_id is not null and public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[]))
);
drop policy if exists child_profiles_insert on public.child_profiles;
create policy child_profiles_insert on public.child_profiles for insert to authenticated with check (
  case_id is not null and public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
);
drop policy if exists child_profiles_update on public.child_profiles;
create policy child_profiles_update on public.child_profiles for update to authenticated using (
  case_id is not null and public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
) with check (
  case_id is not null and public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
);

-- Child-private tables: self or assigned safeguarding staff only.
drop policy if exists child_feelings_insert on public.child_feelings_checkins;
create policy child_feelings_insert on public.child_feelings_checkins for insert to authenticated with check (public.user_can_manage_child_private(child_user_id));
drop policy if exists child_feelings_update on public.child_feelings_checkins;
create policy child_feelings_update on public.child_feelings_checkins for update to authenticated using (public.user_can_manage_child_private(child_user_id)) with check (public.user_can_manage_child_private(child_user_id));

drop policy if exists child_tasks_insert on public.child_tasks;
create policy child_tasks_insert on public.child_tasks for insert to authenticated with check (public.user_can_manage_child_private(child_user_id));
drop policy if exists child_tasks_update on public.child_tasks;
create policy child_tasks_update on public.child_tasks for update to authenticated using (public.user_can_manage_child_private(child_user_id)) with check (public.user_can_manage_child_private(child_user_id));

drop policy if exists child_evidence_insert on public.child_evidence;
create policy child_evidence_insert on public.child_evidence for insert to authenticated with check (public.user_can_manage_child_private(child_user_id));
drop policy if exists child_evidence_update on public.child_evidence;
create policy child_evidence_update on public.child_evidence for update to authenticated using (public.user_can_manage_child_private(child_user_id)) with check (public.user_can_manage_child_private(child_user_id));

drop policy if exists child_lessons_progress_insert on public.child_lessons_progress;
create policy child_lessons_progress_insert on public.child_lessons_progress for insert to authenticated with check (public.user_can_manage_child_private(child_user_id));
drop policy if exists child_lessons_progress_update on public.child_lessons_progress;
create policy child_lessons_progress_update on public.child_lessons_progress for update to authenticated using (public.user_can_manage_child_private(child_user_id)) with check (public.user_can_manage_child_private(child_user_id));

drop policy if exists child_visit_preparations_insert on public.child_visit_preparations;
create policy child_visit_preparations_insert on public.child_visit_preparations for insert to authenticated with check (public.user_can_manage_child_private(child_user_id));
drop policy if exists child_visit_preparations_update on public.child_visit_preparations;
create policy child_visit_preparations_update on public.child_visit_preparations for update to authenticated using (public.user_can_manage_child_private(child_user_id)) with check (public.user_can_manage_child_private(child_user_id));

drop policy if exists child_visit_reflections_insert on public.child_visit_reflections;
create policy child_visit_reflections_insert on public.child_visit_reflections for insert to authenticated with check (public.user_can_manage_child_private(child_user_id));
drop policy if exists child_visit_reflections_update on public.child_visit_reflections;
create policy child_visit_reflections_update on public.child_visit_reflections for update to authenticated using (public.user_can_manage_child_private(child_user_id)) with check (public.user_can_manage_child_private(child_user_id));

drop policy if exists child_safe_people_insert on public.child_safe_people;
create policy child_safe_people_insert on public.child_safe_people for insert to authenticated with check (public.user_can_manage_child_private(child_user_id));
drop policy if exists child_safe_people_update on public.child_safe_people;
create policy child_safe_people_update on public.child_safe_people for update to authenticated using (public.user_can_manage_child_private(child_user_id)) with check (public.user_can_manage_child_private(child_user_id));

drop policy if exists child_achievements_select on public.child_achievements;
create policy child_achievements_select on public.child_achievements for select to authenticated using (public.user_can_view_child_private(child_user_id));
drop policy if exists child_achievements_insert on public.child_achievements;
create policy child_achievements_insert on public.child_achievements for insert to authenticated with check (public.user_can_manage_child_private(child_user_id));

-- Requests preserve the child's audience choice and require a relationship through the same case.
drop policy if exists child_requests_select on public.child_requests;
create policy child_requests_select on public.child_requests for select to authenticated using (
  child_user_id = (select auth.uid())
  or (
    share_audience in ('parent','both')
    and parent_user_id = (select auth.uid())
    and public.user_has_case_role(public.child_case_id(child_user_id), array['case_owner','parent']::text[])
  )
  or (
    share_audience in ('caseworker','both')
    and public.user_has_case_role(public.child_case_id(child_user_id), array['caseworker','supervisor','clinician','admin']::text[])
  )
);
drop policy if exists child_requests_insert on public.child_requests;
create policy child_requests_insert on public.child_requests for insert to authenticated with check (child_user_id = (select auth.uid()));
drop policy if exists child_requests_update on public.child_requests;
create policy child_requests_update on public.child_requests for update to authenticated using (
  child_user_id = (select auth.uid())
  or public.user_has_case_role(public.child_case_id(child_user_id), array['caseworker','supervisor','admin']::text[])
) with check (
  child_user_id = (select auth.uid())
  or public.user_has_case_role(public.child_case_id(child_user_id), array['caseworker','supervisor','admin']::text[])
);

-- Shared items are the only normal parent-facing child content surface.
drop policy if exists child_shared_items_select on public.child_shared_items;
create policy child_shared_items_select on public.child_shared_items for select to authenticated using (
  child_user_id = (select auth.uid())
  or (
    share_audience in ('parent','both')
    and parent_user_id = (select auth.uid())
    and public.user_has_case_role(public.child_case_id(child_user_id), array['case_owner','parent']::text[])
  )
  or (
    share_audience in ('caseworker','both')
    and public.user_has_case_role(public.child_case_id(child_user_id), array['caseworker','supervisor','clinician','admin']::text[])
  )
);
drop policy if exists child_shared_items_insert on public.child_shared_items;
create policy child_shared_items_insert on public.child_shared_items for insert to authenticated with check (child_user_id = (select auth.uid()));
drop policy if exists child_shared_items_update on public.child_shared_items;
create policy child_shared_items_update on public.child_shared_items for update to authenticated using (child_user_id = (select auth.uid())) with check (child_user_id = (select auth.uid()));
