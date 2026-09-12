-- Explicitly deny direct Data API access to document-intelligence internals.
-- Authenticated clients must use the Node backend, which verifies their Supabase JWT
-- and scopes every query by user_id before using the service role.

drop policy if exists document_analyses_backend_only on public.document_analyses;
create policy document_analyses_backend_only on public.document_analyses
for all to authenticated
using (false)
with check (false);

drop policy if exists document_comparisons_backend_only on public.document_comparisons;
create policy document_comparisons_backend_only on public.document_comparisons
for all to authenticated
using (false)
with check (false);

drop policy if exists document_analysis_jobs_backend_only on public.document_analysis_jobs;
create policy document_analysis_jobs_backend_only on public.document_analysis_jobs
for all to authenticated
using (false)
with check (false);
