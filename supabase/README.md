# Supabase contract

`supabase/migrations/` is the authoritative schema history for this repository.

`supabase/tests/` contains SQL contract checks that validate the expected platform, family, case, safety, and evidence layers.

`supabase/schema_dump.sql` is retained as a documented placeholder only. It must not be treated as the source of truth unless it has been regenerated from a verified environment and reviewed alongside the migration history.

Edge functions under `supabase/functions/` own authenticated, audited delivery paths such as `secure-report-download`, `escalate-risk`, `audit-log-entry`, `process-uploaded-document`, and report-delivery challenge handling.

## Backend contract evidence (no deployment)

Before case-linked assessments or Track C reconciliation, follow the [canonical schema authority](../docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md). `tests/capture_backend_contract_metadata.sql` is a **read-only** catalog capture, unlike the older Stage 1 inventory script which creates views. It does not establish a case crosswalk, change grants/RLS, or test runtime actors.

An approved database administrator must replace `REPLACE_WITH_APPROVED_PROJECT_REF` in a private copy with the actual target project ref, verify the connection, and run the capture with catalog and migration-history visibility. For example, with an approved PostgreSQL service configured outside this repository:

```powershell
psql "service=safesteps-approved-audit" -X -q -A -t -v ON_ERROR_STOP=1 -f "<private-capture-copy.sql>" -o "<private-capture.json>"
node tools\reconcile-backend-contracts.mjs "<private-capture.json>" --project-ref "<approved-project-ref>"
node --test tools\tests\backend-contract-reconciliation.test.mjs
```

No credentials or case rows belong in the export. Definitions/defaults can contain sensitive literals; the administrator must inspect the private export before sharing it. Keep captures and reports outside the repository. A failed capture (including missing migration-history permission) is not evidence; do not continue with a partial export. The project ref is an administrator assertion, not a cryptographic verification of the connection.

The offline tool compares baseline-present catalog fields and deployed migration versions with repository filenames, including duplicate migration versions. The baseline dictionaries cover selected core objects only; additional fields, PostgreSQL type spellings, column privileges and function EXECUTE grants require manual review. Formatting differences in SQL definitions are reported conservatively. Equal versions do not establish SQL/checksum equivalence.

The report **always exits 1 with `status: blocked`**, even for identical metadata. It is an evidence/review gate, not a production readiness certificate. It rejects the historical snapshot as a live capture. It neither connects to a database nor applies migrations, generates case mappings, or certifies authorization. Review these prerequisites in order:

1. Verify protected identity/role/tenant fields and all effective table, column and helper grants, including inherited/PUBLIC privileges and privileged execution paths.
2. Establish an administrator-reviewed durable crosswalk with source provenance, explicit retained-case coverage, uniqueness or reviewed exceptions, tenant agreement, and unmatched/ambiguous-case rejection. Never infer pairs from UUID equality, names or labels; metadata cannot prove the pairs.
3. Reconcile every assessment policy (permissive policies combine with OR), SQL grants, canonical staff assignment, case scope, draft/review permissions and finalized-record protection. Preserve existing subject-read/privacy contracts; staff-only administration does not imply indiscriminate removal of subject access.
4. Compare live helpers/view definitions and actual migration SQL, resolve duplicate repository versions without rewriting deployed history, then prepare a bounded migration with recovery steps. Update canonical documentation, affected readers/writers, generated types and tests together. Do not author Track C aliases against guessed deployment.
5. Execute the report's allowed/denied authorization matrix using controlled staging actors and real database/API paths after reviewed reconciliation. Capture expected/actual outcomes, exact migration versions, fixture scope and reviewer approval privately. UI visibility and catalog flags are not substitutes.

The matrix covers assigned staff draft/read, scoped supervisor review, parent/child write denial, unrelated/cross-case/cross-tenant denial, revoked/expired authority, self-escalation, relationship reassignment, finalized mutation, anonymous access and view/RPC/storage/service-role boundaries. Each must be split into relevant SELECT/INSERT/UPDATE/DELETE and domain-specific tests with controlled fixtures once the target contract is reviewed. No actor tests are claimed to have run by this tooling.

`npm run readiness` also fails closed on these unresolved backend contracts, even when its existing staging, content and sign-off inputs pass. This is an explicit release blocker, not a check of a self-reported JSON status. There is no environment-variable bypass. Replace the blocker only in a reviewed code change accompanying verified contract reconciliation and executed allowed/denied actor evidence; metadata capture alone cannot clear it. Local prototype development and targeted offline tests remain available.
