# Supabase contract

`supabase/migrations/` is the authoritative schema history for this repository.

`supabase/tests/` contains SQL contract checks that validate the expected platform, family, case, safety, and evidence layers.

`supabase/schema_dump.sql` is retained as a documented placeholder only. It must not be treated as the source of truth unless it has been regenerated from a verified environment and reviewed alongside the migration history.

Edge functions under `supabase/functions/` own authenticated, audited delivery paths such as secure report download and report-delivery challenge handling.
