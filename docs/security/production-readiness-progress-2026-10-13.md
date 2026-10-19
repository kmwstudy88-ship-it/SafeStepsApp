# Production readiness progress — 13 October 2026

Status: local caller remediation verified; production rollout remains blocked.
Checkout baseline: `550c8319`, branch `codex/production-access-callers`.

Follow-up: target-only migration SQL was recovered (12 production / 54 staging),
and expanded application-schema snapshots were restored in isolation. Both
restored baselines passed all 31 candidate rollback checks (62 total). The original
historical chain still fails at missing case-note prerequisites and then a missing
video helper in an isolated prerequisite trial. No source migration history was
changed. See [migration recovery and baseline review](migration-recovery-2026-10-13/README.md)
for snapshots, hashes, prerequisites and the remaining reconciliation decisions.

## Changes completed

- Signup and growth profile saves use a session-bound field allowlist. Omitted fields are preserved, and client saves no longer assign a role or overwrite the legacy auth email field.
- Profile creation uses database role/workflow defaults. The candidate adds an own-identity INSERT policy plus a restrictive identity boundary; missing-trigger profile creation was tested against staging rather than assumed from grants.
- Onboarding callers no longer write `onboarding_status` directly. The proposed `advance_parent_onboarding` RPC binds its target to `auth.uid()`, rejects skipped steps and intake completion, requires current privacy/terms consent, rejects inactive profiles and preserves later progress on retries. Account protection remains a device/user preference, not server attestation of a secure device.
- Quest and achievement results continue to use their dedicated persistence tables; the duplicate writes into protected profile fields were removed.
- The dependency lockfile now matches the manifest. CI uses `npm ci` directly so it detects lockfile drift instead of repairing it during validation.
- Non-forced dependency fixes reduced the audit from 59 findings (including two critical) to 54: 49 high and five moderate, zero critical. Remaining advisories need an SDK-compatible resolution or documented acceptance; no framework downgrade or forced audit fix was used. These are affected-package counts, not counts of distinct vulnerabilities or proof of runtime exploitability.

## Verification

- Actual clean dependency install (`npm ci --ignore-scripts --no-audit --no-fund`): passed after lockfile repair. Package lifecycle scripts were disabled for this local install.
- TypeScript: passed.
- Application Jest: 113 suites, 706 tests passed.
- Backend Jest: 16 suites, 98 tests passed.
- Application/component lint: no errors, four existing hook-dependency warnings. Changed-code lint: no errors; the existing game-test import layout produces two warnings.
- Route hygiene audit: passed.
- Expo Doctor: 21/21 checks passed.
- Document-intelligence smoke: passed the expected no-provider-key HTTP 503 behavior. Successful live AI analysis remains unverified.
- Staging candidate tests: all 16 assessment/profile boundary checks and all 15 onboarding/profile creation checks passed. Each transaction rolled back; no production writes or persistent staging deployment occurred. The RPC was also confirmed absent after rollback.

Results: [candidate verification](p0-caller-verification-2026-10-13.json), [original dependency audit](dependency-audit-2026-10-13.json), [audit after fixes](dependency-audit-after-fixes-2026-10-13.json).

## Deployment boundary and remaining work

Both SQL candidates remain outside `supabase/migrations`. The changed onboarding client requires the new RPC, so these branch changes must not be released separately from the reviewed database change. This branch is not a deployment-ready release.

1. Recover and reconcile target-only migrations and schema dependencies; replay the complete reviewed history in an isolated environment. Do not push the divergent migration chain blindly.
2. Verify the retained case/identity mapping with tenant consistency and provenance. The candidate intentionally retains the assessment legacy case root.
3. Complete supervisor/admin, revoked/expired membership, cross-tenant, signed Auth/Data API and backend tests using controlled synthetic fixture credentials. Existing rollback tests use database roles and claims, not signed HTTP sessions.
4. Reconcile trusted staff profile administration and all required assessment/Track C callers before activation. Dedicated quest progress authorization also requires deployment-level verification; removing profile caches does not establish that contract.
5. Resolve or explicitly accept current staging advisor findings. Security: 203 tables with RLS and no policies (informational), two anonymous definer-function warnings and 74 authenticated definer-function warnings. Performance: 1,380 unindexed foreign keys, 470 RLS initialization warnings, 391 unused indexes, 178 multiple-permissive-policy warnings, two duplicate indexes and one Auth connection configuration observation. Preserve intentional public delivery behavior while reviewing grants; do not revoke all definer functions indiscriminately.
6. Verify historical credential rotation and server-side provider configuration without committing secrets. Configure the controlled staging credentials and required release evidence in the appropriate environment.
7. Deploy required Edge/backend workflows to staging, verify deployed code/configuration, complete parent content/device/offline/report journeys and operational recovery checks, then repeat production-target verification before rollout approval.

Advisor evidence: [security](staging-security-advisors-2026-10-13.json), [performance](staging-performance-advisors-2026-10-13.json). The release gate remains blocked; advisor collection alone is not review acceptance.
