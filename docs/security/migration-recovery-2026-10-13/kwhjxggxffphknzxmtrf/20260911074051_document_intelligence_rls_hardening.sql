-- RECOVERED READ-ONLY from kwhjxggxffphknzxmtrf migration history; review before replay.
drop policy if exists document_analyses_backend_only on public.document_analyses;
create policy document_analyses_backend_only on public.document_analyses for all to authenticated using (false) with check (false);
drop policy if exists document_comparisons_backend_only on public.document_comparisons;
create policy document_comparisons_backend_only on public.document_comparisons for all to authenticated using (false) with check (false);
drop policy if exists document_analysis_jobs_backend_only on public.document_analysis_jobs;
create policy document_analysis_jobs_backend_only on public.document_analysis_jobs for all to authenticated using (false) with check (false);;

