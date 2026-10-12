# P0 deployment and access review — 13 October 2026

Status: **NOT READY FOR ROLLOUT**. Catalog verification, local verifier repair and rollback-only staging database-role tests are complete. Caller convergence, full migration replay, signed multi-actor API tests and staged deployment remain open. No persistent database changes or Edge deployments were made. See the staged reproduction and proposed remediation below.

## Source and evidence

Repository: `kmwstudy88-ship-it/SafeStepsApp`; current-main baseline `3996aca794921195560d9f6f389d46f97bfebc11`; work branch `codex/p0-schema-access`.

Main no longer contains the cited case-list screen, roadmap, canonical schema or September hardening review. Historical contract and review were inspected on `origin/copilot/audit-stabilize-document-intelligence-track-c-risk`, pinned at `13258acd2e23fe03abdebafe84b82c3c6a72a6a2`. The canonical contract is restored with its September observations explicitly marked historical. The obsolete screen and Track C schema were not silently reintroduced as current deployed features.

Live metadata is in [p0-deployment-evidence-2026-10-13.json](p0-deployment-evidence-2026-10-13.json). It contains full migration version/name lists, targeted relations, foreign keys, policies, grants, selected helper definitions and Edge deployment inventory. It excludes application rows and secrets and is not a restorable SQL dump. Queries are included for repeatability. This is a bounded P0 inventory, not a complete audit of every relation/function.

## Target comparison

| Contract | Production `yzxotxbwgxnxemkzigse` | Staging `kwhjxggxffphknzxmtrf` |
| --- | --- | --- |
| Latest migration recorded | `20260829181644` | `20260911074051` |
| Repository-only versions, including proposed P0 remediation | 29 | 35 |
| Target-only versions | 12 | 54 |
| Standalone document result/queue tables | All three absent | `document_analyses`, `document_comparisons`, `document_analysis_jobs` present with RLS |
| Historical Track C tables | `case_events`, `risk_snapshots`, `escalation_alerts`, `follow_up_tasks` absent | All four absent |
| Compatibility `case_assignments` | View, `security_invoker=true` | Absent |
| Risk calculation snapshots | `safety_risk_calculation_snapshots` present | Absent |
| September-reviewed Edge Functions | None of `audit-log-entry`, `escalate-risk`, `process-uploaded-document`, `case-report-governance` listed | No deployed Edge Functions listed |

Exact version differences are in [p0-migration-reconciliation-2026-10-13.json](p0-migration-reconciliation-2026-10-13.json), generated with `node SafeStepsTools/reconcile-p0-migration-history.mjs`. Matching versions do not prove matching statements. Do not repair timestamps or push the divergent chain to make counts agree. Recover target-only SQL and review ordering/dependencies against a schema baseline before isolated replay. Later repository migrations remain proposed for each environment unless its history and catalog verify them.

## Identity and case callers

Both targets verify these foreign-key boundaries:

- `case_allocations.case_id → cases.id`; allocated staff IDs reference `auth.users`.
- `case_memberships.case_id → reunification_cases.id`; membership user IDs reference `auth.users`.
- `assessment_records.case_id → reunification_cases.id`.
- `profiles.id → auth.users.id`; `profiles.case_id → cases.id` is NOT VALID.
- `documents.user_id → users.id` remains a legacy application-identity dependency in both targets.

The targeted FK inventory finds no direct FK between the two case roots. No durable crosswalk or row parity was established. This does not prove that no mapping exists elsewhere; it blocks assuming identity equivalence.

Current main callers must retain distinct domains until migration is verified:

| Caller | Current model | Required follow-up |
| --- | --- | --- |
| `lib/services/caseService.ts` | Canonical `cases` and `case_allocations` | Use canonical allocation/tenant authorization; do not pass membership case IDs as operational IDs. |
| `lib/security/caseAccess.ts` | `user_roles`, `case_memberships`, `get_my_case_access_grant` | RPC is verified to join `reunification_cases`; scope this adapter to that root. Migrate role/membership sources with policy dependencies and data. |
| `backend/lib/supabase.js` | `user_roles` plus active `case_memberships` | Returned memberships are legacy-root memberships. They cannot authorize operational `cases` without a verified mapping. |
| `lib/engines/assessmentCaseEngine.ts` | Reads/writes owner-filtered `reunification_cases` | Owner filtering does not establish staff-only assessment authorization. Preserve transitional records; do not simply rename its table. |
| `lib/services/riskService.ts` | `risk_trend_view` | This is not proof of the separate historical Track C persistence/escalation workflow. |

Historical Track C SQL targets canonical cases but its actor/creator/assignee FKs target deprecated `users`. It depends on `current_app_user_id`, `current_role_key` and `case_visible_to_current_user`, absent from the sampled helper inventory. It cannot be deployed unchanged or fixed by equating UUIDs. Restore/port the actual workflow deliberately, reconcile actor IDs and allocations to canonical contracts, then replay in isolation before enabling callers.

## Authorization findings

Both targets retain multiple permissive policies on `assessment_records`. In particular, `Assessment records case access` permits ALL operations for parent/completer identities (or admin), and `parent_manage_own_assessment_records` permits ALL for the matching profile user. These coexist with staff-role insert/update policies. Adding another restrictive-looking permissive policy does not remove those other paths. The required staff-only administration contract remains unverified and contradicted by the catalog policy surface; no authenticated exploit is claimed.

Both targets expose owner profile updates and use a `safesteps_auth_role()` helper reading `profiles.role`. The grant inventory must be considered together with protected-column restrictions and trigger behavior before claiming role escalation resistance. Do not treat owner row scope as proof that role/tenant fields are protected.

The deployed `safesteps_has_case_access` definitions differ: production delegates to the v19 access helper; staging still checks profile/profile-case links. A staging pass through that helper is not production parity.

Selected SECURITY DEFINER helpers, including `can_access_video_report`, retain `search_path=public` in both environments. The September empty-search-path hardening is not verified deployed. Review complete policy dependencies and EXECUTE grants before replacing helpers; do not revoke an RLS dependency blindly.

The four follow-up Edge Functions are absent from deployment inventories, so their deployed code cannot be reviewed or exercised here. Neither absence nor `verify_jwt` alone establishes safety. A future deployment must validate the caller session, derive actor identity server-side, enforce resource/tenant scope before privileged calls and exercise origin rejection. Preserve intentional public-delivery contracts through targeted tests.

## Checks completed and their limits

1. Live metadata-only queries against both targets; saved evidence above.
2. Staging-only transaction with `SET LOCAL ROLE authenticated` and synthetic unknown user/case UUIDs: canonical access was not true and legacy grant returned no row. Transaction rolled back. This is a database negative helper probe, not a signed JWT/Data API or positive fixture test.
3. Fixed `verify-staging-journey.mjs` so missing tables/columns, malformed responses and network errors fail denied-read checks. Only empty successful arrays or explicit SQLSTATE `42501` qualify. Error logs contain codes rather than potentially sensitive database messages.
4. `node --test SafeStepsTools/staging-boundary-result.test.mjs`: 2 tests passed, covering deployment/network failure rejection plus allowed and denied classification.
5. Node syntax and Git whitespace checks passed.

No controlled role credentials or fixture configuration were available in local environment variables or local `.env` files; only `.env.example` exists. Following user authorization, synthetic users and fixtures were created inside staging transactions and rolled back. No production test records were created. Current journey checks are reads only and do not cover Track C writes. A signed-session end-to-end run was not performed.

## Staging reproduction and proposed remediation

Results are saved in [p0-staging-authorization-results-2026-10-13.json](p0-staging-authorization-results-2026-10-13.json). The baseline reproduced three failures using the `authenticated` database role and synthetic claims: a parent updated an assessment, an owner changed `profiles.role` to `admin`, and that changed role allowed reading another synthetic user's assessment. This establishes the staging database authorization failure, not a production exploit or an HTTP-session result.

Proposed migration `20261012215912_p0_assessment_and_profile_write_boundaries.sql` adds restrictive staff-membership INSERT/UPDATE policies and prohibits client assessment deletion. Insert requires caller-bound `created_by`. It removes table and column INSERT/UPDATE privileges on profiles for PUBLIC, anon and authenticated, then permits only reviewed self-service fields (plus `id` on INSERT). Existing row-level checks remain required. Protected role, alternate auth identity, case, tenant and stage fields are excluded. Read policies are preserved. Active staff membership still refers to the legacy case root; this migration does not create a crosswalk or converge role models.

With the candidate temporarily installed inside the rollback transaction, all 13 checks passed: allocated-worker read/insert/update, cross-case worker denial, creator spoof denial, unrelated read/update denial, parent insert/update denial, safe owner profile edit, alternate-auth-ID denial, role-edit denial and other-case read denial. The candidate and fixtures were then rolled back. Follow-up checks found zero fixture users, zero fixture instruments and zero candidate policies; the original role UPDATE grant was restored. Therefore the staging vulnerabilities remain deployed until an approved persistent migration is applied.

Reproduce SQL with `node SafeStepsTools/prepare-p0-rollback-probe.mjs` for baseline, or add `--candidate` for the proposed fix. This command emits SQL and does not connect or deploy. Execute only against the explicit staging ref above. Test identities have no login passwords and never persist; this harness cannot produce real JWT sessions.

Before persistent deployment, migrate legitimate client role/tenant/case/stage updates to an authenticated, resource-authorized server workflow; direct client writes to those fields will be denied. Main's parent intake self-service fields were checked against the allowlist. Full caller coverage, supervisor/admin/revoked-member/cross-tenant tests, signed API journeys and isolated migration-chain replay are still required. The narrow remediation must not be called a complete P0 fix.

The restrictive-policy combination follows [PostgreSQL 17 row-security semantics](https://www.postgresql.org/docs/17/ddl-rowsecurity.html). The privilege changes remove broad table grants before adding limited column grants, following [Supabase column-level security guidance](https://supabase.com/docs/guides/database/postgres/column-level-security).

## Required staged completion

1. Recover target-only migration SQL and baseline schema; reconcile duplicate/renamed/dependency histories without production reset or blind db push. Replay reviewed migrations in an isolated nonproduction database.
2. Define and verify the retained-case crosswalk using reviewed source records, unmatched-case reporting, tenant consistency, provenance and row parity. Reconcile identity FKs without fabricated UUID equivalence.
3. Port the needed Track C workflow to current main with canonical actors, allocations and explicit case-domain adapters. Verify migration columns and helper contracts before activation.
4. Replace overlapping assessment write paths under a reviewed staff-only contract, preserving approved parent read behavior and audit history. Test protected identity/role/tenant fields through real caller sessions.
5. Run pgTAP on the reconciled deployment, including restored September hardening tests where applicable. Review actual table/function inventory and helper dependencies before grants change.
6. Use controlled synthetic fixtures across two tenants and two cases. Exercise anonymous, parent, child, allocated staff, supervisor, admin, unrelated staff and revoked/expired memberships. For each workflow verify allowed read/write, cross-case and cross-tenant denials, actor spoof denial, reassignment denial and persisted audit/provenance; distinguish permission rejection from zero-row writes and broken-schema errors.
7. Deploy required Edge Functions to staging with matching callers and test JWT/session, actor, origin and resource boundaries. Verify deployed hashes/configuration and repeat signed Data API/backend journeys before approving production rollout.

Production rollout remains blocked until these results exist. This review is not deployment approval.
