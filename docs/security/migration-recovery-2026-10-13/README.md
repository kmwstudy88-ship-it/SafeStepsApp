# Migration recovery and replay review — 13 October 2026

Status: recovery, lexical comparison and isolated schema-baseline verification complete.
The historical migration chain and production deployment remain blocked.

Production and staging were queried read-only. No migration was applied, repaired,
reset or pushed to either hosted project. The active `supabase/migrations` chain
was not changed. Prior caller-remediation work remains preserved on
`codex/production-access-callers`.

## Current evidence

| Item | Production | Staging |
| --- | --- | --- |
| Project | `yzxotxbwgxnxemkzigse` | `kwhjxggxffphknzxmtrf` |
| Recorded migrations | 197 | 233 |
| Repository-only versions | 28 | 34 |
| Target-only versions | 12 | 54 |
| Target-only SQL records recovered | 12 | 54 |
| Recovered records with lexical repository matches | 10 | 32 |
| Recorded migrations lacking SQL statement arrays | 13 | 3 |
| Public tables / views | 836 / 24 | 868 / 17 |
| Server version | 17.6 | 17.6 |

There are 213 repository migration files and no duplicate version identifiers in
this checkout. Three files are empty: `20260619125937_init_schema.sql`,
`20260619142937_rls_policies.sql` and `20260622181621_create_intake_forms.sql`.
Several other files are history placeholders containing comments only.

[manifest.json](manifest.json) records live history metadata and SHA256 hashes for
every recovered SQL file and every repository migration. [review.json](review.json)
records each version difference and lexical match. Recoveries are stored under
the exact project ID. They include SQL authored in migration history, including
seed statements where present; no application tables were exported.

The migration-history SQL recovery is **not a restorable schema dump**. Migration history can omit SQL,
and changes outside recorded migrations are not reconstructed by this export.
Table counts, matching versions and lexical matches do not establish schema or
authorization parity. The comparator ignores comments, ordinary token spacing
and empty statements; it preserves quoted literal/identifier/function-body
contents and does not perform semantic equivalence checking.

## Lesson-player grant discrepancy

Production's `20260807220851_production_lesson_player` initially revokes table
privileges from PUBLIC and anon, while the repository's
`20260808081500_production_lesson_player` also revokes authenticated privileges.
Production then records `20260807220915_restrict_lesson_responses_authenticated_grants`,
which revokes authenticated privileges and grants back SELECT/INSERT/UPDATE/DELETE.
The pair must be reviewed together; the difference is not evidence that the
final production grants are broader. The repository includes that hardening in
its lesson-player migration rather than as the separate deployed version.

## Required reconciliation

1. Preserve both recorded histories. Do not invent or repair timestamps solely
   to make counts match, and do not execute both sides of lexical-match pairs.
2. Recover SQL for history placeholders where possible; otherwise obtain a
   reviewed schema-only baseline and identify what remains unreconstructable.
3. Review the unmatched staging migrations individually. They include document
   intelligence, personal AI, media evidence, report-verification hardening and
   delivery-table prerequisites absent from the current repository version list.
4. Verify object prerequisites and order against the baseline, then replay the
   reviewed deployment plan in isolation. Recovered timestamps do not themselves
   prove replay order is valid on an empty database.
5. Complete case/identity mapping and signed multi-actor authorization checks
   before promoting the caller/assessment/profile candidates to deployment.

## Local rehearsal

The isolated workspace is
`C:\Users\Miss&MrRandomCunts\AppData\Local\Codex\SafeStepsReplay\20261013-550c8319`.
It has a separate project ID and a copied, unchanged repository migration chain.
Its database is local Docker only; it is not linked to either hosted project.
The local setup, historical replay failures and schema-baseline results are recorded below.

### Historical chain failures

The unchanged repository chain failed at `202607220035_case_notes.sql` with
SQLSTATE `42703`: `cn.family_id` does not exist. The backfill also references
legacy `note` and `user_id` columns. All three are added by the later
`20260810124731_baseline_legacy_compatibility_columns.sql` migration and were
confirmed in the production catalog. An isolated-copy trial added those existing
prerequisites before the backfill and passed that migration.

That trial then failed at `20260809113135_harden_video_function_search_paths.sql`
with SQLSTATE `42883`: `public.prevent_video_export_record_mutation()` is missing.
Its deployed definition exists, but the repository chain does not create it before
the ALTER FUNCTION statement. No guessed implementation or timestamp repair was
added to the active migration directory. All 213 source migration hashes remain
unchanged.

### Verified schema baseline alternative

Fresh CLI schema-only exports are in [schema-exports](schema-exports/manifest.json).
The public-only dumps failed isolated restore because a public trigger calls
`safesteps_private.advance_case_document_version()`. This is concrete evidence
that the public-only export is not independently restorable.

The expanded application-schema dumps include `public`, `api`, `private` and
`safesteps_private`; production also includes `safesteps_stage1_inventory`.
Both expanded dumps restored successfully, in single transactions, into separate
databases in a fresh local Supabase PostgreSQL 17.6 container. Managed schemas were
bootstrapped from the local Supabase instance, and the needed `citext`, `btree_gist`
and `pg_trgm` extensions were installed. Restore used the local `supabase_admin`
role to retain recorded ownership. These dumps require compatible managed schemas,
roles and extensions; they are not standalone whole-project backups.

The Auth-owned `on_auth_user_created` trigger is outside the exported application
schemas. Its deployed definition and public handler were verified on both targets,
saved as supplemental metadata, and restored explicitly before fixture tests.
This does not imply that every managed-schema customization has been inventoried.

Restored public counts matched the live bounded inventory: production 836 tables /
24 views, staging 868 / 17. With the proposed access and onboarding candidates
temporarily installed, all 16 access checks and 15 onboarding/profile-creation
checks passed on each baseline: **62/62 checks**. Every test transaction rolled
back. Candidate RPC absence and zero remaining fixture users/profile rows were
verified afterward. Results are in
[local-restore-verification.json](schema-exports/local-restore-verification.json).

All dump copies were SHA256 verified and scanned for recognized API-key/JWT/
credential-URL patterns before entering the review folder. Schema exports contain
no application-row INSERT/COPY export sections. Migration-history SQL may still
include migration-authored seed statements, as documented above.

These results support reviewing a baseline-and-forward-migrations strategy; they
do not approve a history rewrite, a staging reset, a production rollout or schema
parity. The original historic chain is still not clean-installable. Signed HTTP
sessions, cross-tenant/revoked-member coverage, case identity convergence, full
caller/Edge deployment and release evidence remain required.

The isolated `supabase_db_baseline-verify` container was stopped after verification.
Its databases and container are preserved for follow-up; no container or volume
was deleted. No hosted migration or application data was changed.
