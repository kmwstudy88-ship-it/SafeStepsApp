# Carer Portal integration

The connected /carers route supports assigned operational cases, private journals,
monitored messages and private photo/video review. It requires a signed-in account.
The original demonstration screen remains in source for reference.

## Behaviour

- Journal: daily behaviour, achievements and concerns; immutable private source
  notes, current author listing (latest 100), stable submission IDs and preserved
  screen-memory drafts on errors. Parent publication of journal text is not built.
- Messages: care-team-provisioned case channels, pending/approved/rejected delivery,
  staff reasons and retained audit. Carer pause/resume blocks sends in both
  directions and new delivery approvals. Existing approved history is retained.
- Media: one original at a time, private direct upload, bounded 25 MiB supported
  image/video formats, immutable storage, backend size/signature/hash verification,
  and staff approval for a specific current parent with 7/14/30-day UI expiry.
  Approval requires an explicit original-metadata disclosure acknowledgement.
  Withdrawal removes new parent access while retaining the original and audit.
- Screens isolate account changes and refresh access on foreground. Drafts are
  held in screen memory, not persistent device storage. API responses use no-store.

## Authorization and canonical records

See section 7.3 of docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md for the contract.
Operational cases.id and reunification_cases.id remain separate roots. No links
are inferred from names. Child-specific person selection and a verified crosswalk
remain integration work.

Current tenant, membership, participant dates/statuses and explicit actions are
checked on every request. Carers require carer.portal.read and the applicable
journal/media/message action. Active denials win. No broad note writer grant is
needed for the narrow journal intake policy. No new roles or participants are
created automatically. Reviewers need exact operational-case/tenant permission
scope and current case allocation; step-up permissions require AAL2. Parent media
recipients come from explicit case-linked family-member references, not aliases.

## API and configuration

All /carers routes verify the bearer token. Ordinary database/storage calls use
the publishable key and user token. The only privileged carer database call is the
media byte finalizer after the backend downloads and verifies the private object;
its actor is taken from verified authentication, never the request body.

Routes cover /carers/cases, case journal, /carers/channels with message/review/
enabled/revoke actions, /carers/media, case media reservation and media completion,
preview, recipients and review. Staff channel provisioning requires explicit
participant IDs, a label, expiry and reason. There is no end-user self-link form;
staff provisioning currently has an API but no dedicated UI.

The app uses EXPO_PUBLIC_BACKEND_URL or Expo extra.backendUrl. The backend needs
its existing Supabase configuration and SUPABASE_PUBLISHABLE_KEY (anon fallback).
Keep private implementation schemas out of Data API exposed schemas. Public
wrappers are invoker functions; implementations use explicit execution grants.

## Review and rollout boundary

The three carer SQL migrations are LOCAL REVIEW CANDIDATES ONLY. No remote
migration, role provisioning, message, upload or application-row read was performed.
Connected staging inspection was schema/catalog-only. Reconcile divergent target
migration history before considering deployment; do not push these blindly.

Before rollout, review the full schema, legacy privileged readers and direct Data
API paths; run real allowed/denied multi-actor journeys against the named target,
including private Storage upload and signed previews, revoked/expired access,
MFA and scoped reviewer permissions. Native device smoke testing remains required.
The SQL fixture is intentionally empty and partial, not a full migration replay.

File signature/hash checks do not perform malware scanning, content safety review,
authenticity verification or legal admissibility certification. Scan status stays
pending. Originals may include embedded location/metadata; automatic redaction is
not built. New preview URLs require authorization and last at most 60 seconds,
clamped to known grant expiry; already issued links may remain valid briefly after
withdrawal and downloaded copies cannot be recalled. Retention policy rollout and
full legal-hold lifecycle require separate operational review.

## Local verification

- 27 Node API/service tests pass, covering forged fields, user-token calls, denied
  assignments, tenant status, trusted byte completion and bounded preview access.
- All three isolated PostgreSQL suites pass for source immutability, actor/scope/
  MFA boundaries, pending-message privacy, pause, private media, parent approval,
  withdrawal, canonical identity separation, legal holds and anonymous denial.
- Targeted portal TypeScript checks pass; 37 document regression tests pass.
- Repository-wide TypeScript remains blocked by an unrelated non-exported
  AssessmentResponse type and three missing curriculum JSON imports.

Run the Node carer tests with node --test tools/tests/carer-*.test.mjs. Run
carer-media-rpc.sql only against an empty isolated PostgreSQL fixture; it includes
the communication and journal fixtures. Never run test SQL against a live project.
