# Identity client-write regression tests

Run `npm ci --ignore-scripts --prefix tools/identity-security`, then
`npm test --prefix tools/identity-security` from the repository root.

The pinned PGlite runtime executes PostgreSQL SQL in memory without a production
connection. The fixture reproduces owner-ALL RLS and broad table/column grants;
it proves the initial self-promotion paths work before applying the migration.
It uses physical columns from the canonical snapshot and verifies denied client
writes, preserved presentation updates, actor isolation, view protection,
service-role writes, reapplication and protection of future columns.

This is a focused privilege regression suite, not a complete Supabase deployment
rehearsal. It does not reproduce every production policy, trigger, foreign key,
RPC, Auth lifecycle or external application. PG-01 remains open until staging
and provisioning/administration compatibility checks pass.

## Deployment contract

`20260912092748_identity_client_write_boundaries.sql` removes direct client
INSERT/DELETE and protected-column UPDATE privileges on profiles, staff profiles
and platform tenant memberships. Profile presentation fields and staff display
name remain updateable, subject to existing RLS. The workers compatibility view
becomes read-only for clients. Independent column grants are revoked as well as
table grants, and inherited privileges that defeat the boundary abort migration.

Trusted service-role and security-definer operations retain their privileges.
No new privileged RPC is introduced. Existing RPC authorization must be audited
separately; this change cannot certify those paths.

Before deployment, verify Auth-trigger provisioning and intake completion,
administrative staff/membership workflows, and any external clients that insert,
upsert or edit protected profile fields. Direct authenticated administrator writes
are intentionally blocked too: trusted administration must enforce actor identity,
resource scope and audit provenance. Do not deploy until that path is available.

The inspected SafeStepsApp app/lib/backend/src/shared sources had no direct
writers for these three tables. This does not certify the separate parent-app
repository or other consumers.

Capture effective table/column grants before deployment. If compatibility fails,
halt rollout and repair the trusted path. Restoring broad self-service grants
reopens the demonstrated vulnerability and is not a routine rollback. No rows
are changed by this migration. Do not mark the canonical production gate closed
merely because this isolated suite passes.
