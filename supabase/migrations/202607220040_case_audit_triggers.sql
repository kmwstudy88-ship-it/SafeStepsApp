drop trigger if exists audit_cases on public.cases;
create trigger audit_cases after insert or update or delete on public.cases for each row execute function public.audit_row_change();

drop trigger if exists audit_case_participants on public.case_participants;
create trigger audit_case_participants after insert or update or delete on public.case_participants for each row execute function public.audit_row_change();

drop trigger if exists audit_case_allocations on public.case_allocations;
create trigger audit_case_allocations after insert or update or delete on public.case_allocations for each row execute function public.audit_row_change();

drop trigger if exists audit_case_plans on public.case_plans;
create trigger audit_case_plans after insert or update or delete on public.case_plans for each row execute function public.audit_row_change();

drop trigger if exists audit_case_plan_goals on public.case_plan_goals;
create trigger audit_case_plan_goals after insert or update or delete on public.case_plan_goals for each row execute function public.audit_row_change();

drop trigger if exists audit_case_plan_actions on public.case_plan_actions;
create trigger audit_case_plan_actions after insert or update or delete on public.case_plan_actions for each row execute function public.audit_row_change();

drop trigger if exists audit_case_reviews on public.case_reviews;
create trigger audit_case_reviews after insert or update or delete on public.case_reviews for each row execute function public.audit_row_change();

drop trigger if exists audit_case_notes on public.case_notes;
create trigger audit_case_notes after insert or update or delete on public.case_notes for each row execute function public.audit_row_change();

drop trigger if exists audit_case_legal_references on public.case_legal_references;
create trigger audit_case_legal_references after insert or update or delete on public.case_legal_references for each row execute function public.audit_row_change();

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at before update on public.cases for each row execute function public.set_updated_at();
drop trigger if exists case_participants_set_updated_at on public.case_participants;
create trigger case_participants_set_updated_at before update on public.case_participants for each row execute function public.set_updated_at();
drop trigger if exists case_notes_set_updated_at on public.case_notes;
create trigger case_notes_set_updated_at before update on public.case_notes for each row execute function public.set_updated_at();
