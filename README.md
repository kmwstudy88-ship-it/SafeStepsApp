# SafeSteps

SafeSteps is an Expo and Supabase application for evidence-based family support, reunification work, child participation, professional review, and transparent reporting.

## Supported development baseline

- Node.js 22 LTS
- npm
- Expo SDK 57
- A separate Supabase staging project
- PowerShell 7 for the database helper commands

Do not use the production Supabase project for development or staging verification. The release tooling intentionally refuses the production project reference.

## Install and validate

From the repository root:

```powershell
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run test:backend
npm run smoke:document-intelligence
npx expo-doctor
```

Start the app with:

```powershell
npm start
```

## Configure local environment

Copy `.env.example` to a local `.env` file and populate it with the staging project values. Never commit `.env`, passwords, service-role keys, access tokens, or production credentials.

Use only publishable/anonymous Supabase credentials in the Expo client. Privileged keys must remain in trusted server-side environments.

## Prepare a clean staging database

SafeSteps has an extensive migration history. Always prove that the complete migration chain succeeds on a new, empty staging project before considering a release.

```powershell
npm run db:status
npm run db:push
npm run db:verify
npm run db:advisors
npm run db:security
```

Stop if any migration, verification, security-advisor, or performance-advisor check fails. Do not repair production data as part of staging setup.

## Required controlled staging accounts

Create synthetic accounts with no real family or child information for these roles:

- parent
- child
- caseworker
- supervisor
- court viewer
- unrelated user

Create a synthetic case and record its ID. The unrelated account must not be assigned to that case.

Provide the controlled credentials to the staging verification process through the protected `SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON` secret. Do not place credentials in source files, workflow logs, issues, pull requests, or test fixtures.

Expected structure:

```json
{
  "parent": { "email": "synthetic-parent@example.invalid", "password": "stored-in-secret-manager" },
  "child": { "email": "synthetic-child@example.invalid", "password": "stored-in-secret-manager" },
  "caseworker": { "email": "synthetic-worker@example.invalid", "password": "stored-in-secret-manager" },
  "supervisor": { "email": "synthetic-supervisor@example.invalid", "password": "stored-in-secret-manager" },
  "court_viewer": { "email": "synthetic-court@example.invalid", "password": "stored-in-secret-manager" },
  "unrelated": { "email": "synthetic-unrelated@example.invalid", "password": "stored-in-secret-manager" }
}
```

The example addresses above are placeholders only; use working staging-only accounts.

## Verify role boundaries

Set these environment variables locally or as protected GitHub environment secrets:

- `SAFESTEPS_STAGING_URL`
- `SAFESTEPS_STAGING_PUBLISHABLE_KEY`
- `SAFESTEPS_STAGING_CASE_ID`
- `SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON`

Then run:

```powershell
npm run verify:staging
```

This verifies allowed and denied access for parent, child, caseworker, supervisor, court-viewer, unrelated, and anonymous access. A passing result is necessary but does not replace manual end-to-end testing.

## Manual staging journey

Complete this journey using synthetic data:

1. Register and verify a parent account.
2. Accept consent and privacy settings.
3. Complete intake and create the family profile.
4. Enrol in a program.
5. Complete one production lesson, task, reflection, and assessment.
6. Upload evidence and confirm it is stored against the correct case.
7. Sign in as the assigned worker and review the submission.
8. Submit or approve the review through the appropriate workflow.
9. Generate a report from live staging records.
10. Confirm the report distinguishes self-report, child voice, uploaded evidence, observations, assessment results, conflicts, missing evidence, and human conclusions.
11. Confirm the unrelated and anonymous users cannot access the case.
12. Confirm protected child records remain private unless an authorised sharing or safety workflow applies.

Record the date only after the entire journey passes.

## Production-readiness evidence

The production gate requires the staging values above plus ISO UTC timestamps for:

- `SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT`
- `SAFESTEPS_PERFORMANCE_ADVISOR_REVIEWED_AT`
- `SAFESTEPS_STAGING_JOURNEY_VERIFIED_AT`
- `SAFESTEPS_DEPENDENCY_AUDIT_REVIEWED_AT`
- `SAFESTEPS_CREDENTIAL_ROTATION_CONFIRMED_AT`

Run the local gate with the same protected environment values:

```powershell
npm run release:gate
```

The gate must fail when evidence is missing, malformed, or points to the live Supabase project.

## Curriculum safety

Content under an archive or placeholder directory is not approved production curriculum. Only content that has passed the content registry, clinical/safeguarding review, import validation, and application rendering checks may be exposed to users.

## Release rule

A successful unit-test workflow is not a production approval. Release only after:

- CI passes on the exact release commit
- clean-database migrations pass
- staging role-boundary verification passes
- the manual parent-to-worker-to-report journey passes
- accessibility, privacy, safeguarding, and security reviews are recorded
- an Android preview build passes real-device testing
- production-readiness gate evidence is complete
