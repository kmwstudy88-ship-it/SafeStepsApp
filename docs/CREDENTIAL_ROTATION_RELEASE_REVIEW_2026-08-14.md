# SafeSteps Credential Rotation Release Review - 2026-08-14

This review records the credential-rotation blocker for the production-readiness closeout branch.

## Current repository state

Tracked secret-looking values were removed from:

- `ai/Safesteps- API Key, Firbebase, ect details.txt`
- `upload.ps1`

The repository cleanup reduces future exposure risk, but cleanup is not the same as rotating credentials that may already have been exposed in Git history, logs, local terminals, screenshots, or copied files.

## Why this is still release-blocking

Any real credential that was previously committed or visible in operational logs must be treated as compromised. Production release remains blocked until affected credentials are rotated in the provider dashboard and downstream environments are updated to the new values.

## Required rotation scope

Before setting `SAFESTEPS_CREDENTIAL_ROTATION_CONFIRMED_AT`, review and rotate any previously exposed real values for:

- Supabase anon or publishable keys
- Supabase service-role keys
- Supabase database connection strings or database passwords
- OpenAI or Azure OpenAI keys
- storage service keys
- email, SMS, notification, or realtime service keys
- Stripe secret keys and webhook secrets
- any SafeSteps engine, assessment, evidence, document, fairness, or curriculum service keys

If a listed service was never configured with a real credential, record that as not applicable for the exact release candidate.

## Minimum evidence before acceptance

Before credential rotation can be marked complete, record:

- the exact release candidate commit
- every provider checked
- every credential rotated, without writing the secret value
- the rotation timestamp for each provider
- where the replacement value was installed, such as GitHub Environment secret, staging deployment secret, production deployment secret, or local-only development secret
- confirmation that old credentials were revoked or disabled
- confirmation that no replacement credential was committed to the repository
- final Secret Scan result after the rotation documentation is complete

Production release remains blocked until this review is completed without exposing any secret values.
