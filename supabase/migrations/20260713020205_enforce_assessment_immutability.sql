-- Assessment scoring records are append-only.
-- Corrections must create a new assessment_records row instead of mutating the
-- original responses, domain scores, or final assessment score.

create or replace function public.reject_assessment_scoring_mutation()
returns trigger
language plpgsql
security invoker
as $$
begin
  raise exception 'assessment scoring rows are append-only; create a new assessment record for corrections';
end;
$$;

drop trigger if exists assessment_responses_no_update on public.assessment_responses;
create trigger assessment_responses_no_update
  before update on public.assessment_responses
  for each row execute function public.reject_assessment_scoring_mutation();

drop trigger if exists assessment_responses_no_delete on public.assessment_responses;
create trigger assessment_responses_no_delete
  before delete on public.assessment_responses
  for each row execute function public.reject_assessment_scoring_mutation();

drop trigger if exists assessment_domain_scores_no_update on public.assessment_domain_scores;
create trigger assessment_domain_scores_no_update
  before update on public.assessment_domain_scores
  for each row execute function public.reject_assessment_scoring_mutation();

drop trigger if exists assessment_domain_scores_no_delete on public.assessment_domain_scores;
create trigger assessment_domain_scores_no_delete
  before delete on public.assessment_domain_scores
  for each row execute function public.reject_assessment_scoring_mutation();

drop trigger if exists assessment_scores_no_update on public.assessment_scores;
create trigger assessment_scores_no_update
  before update on public.assessment_scores
  for each row execute function public.reject_assessment_scoring_mutation();

drop trigger if exists assessment_scores_no_delete on public.assessment_scores;
create trigger assessment_scores_no_delete
  before delete on public.assessment_scores
  for each row execute function public.reject_assessment_scoring_mutation();
