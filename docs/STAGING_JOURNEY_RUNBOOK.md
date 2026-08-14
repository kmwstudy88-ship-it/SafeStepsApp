# SafeSteps controlled staging journey

This verification must run only against a separate Supabase staging project. The command refuses the connected live project `yzxotxbwgxnxemkzigse`.

## Controlled identities

Create synthetic staging-only accounts for:

- parent
- child
- assigned caseworker
- supervisor
- court viewer
- unrelated user

Never copy real family records, reports, evidence, contact information, tokens, files, or passwords into staging.

## Required environment

```
SAFESTEPS_STAGING_URL=https://<staging-ref>.supabase.co
SAFESTEPS_STAGING_PUBLISHABLE_KEY=<staging publishable key>
SAFESTEPS_STAGING_SERVICE_ROLE_KEY=<staging service-role key, only for bootstrap/reset>
SAFESTEPS_STAGING_CASE_ID=<synthetic case UUID>
SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON={"parent":{"email":"...","password":"..."},"child":{"email":"...","password":"..."},"caseworker":{"email":"...","password":"..."},"supervisor":{"email":"...","password":"..."},"court_viewer":{"email":"...","password":"..."},"unrelated":{"email":"...","password":"..."}}
```

Dry-run the guarded Auth bootstrap/reset first:

```
npm run bootstrap:staging-auth
```

Apply it only after the dry run shows the six synthetic staging identities:

```
SAFESTEPS_STAGING_AUTH_BOOTSTRAP_APPLY=true npm run bootstrap:staging-auth
```

The bootstrap utility uses Supabase Auth admin APIs, refuses the production project ref, refuses production service-role JWTs, and only touches controlled fixture emails containing `synthetic`, `staging`, `fixture`, or `test`.

Run `npm run verify:staging`.

## Journey completion evidence

Record a pass/fail and trace ID for:

1. registration, email verification, logout, relogin and session revocation
2. privacy, accessibility and specific information-sharing consent
3. all 12 intake sections with save/resume
4. recommendation, parent confirmation and worker review
5. program enrolment and lesson save/resume/completion
6. reflection, task and challenge completion
7. evidence and document upload
8. document analysis retrieval with source/interpretation separation
9. worker evidence review and report selection
10. independent report approval, immutable release and correction
11. authenticated private download and external delivery challenge
12. consent withdrawal, reassignment, expiry and unrelated-user denials

Production remains blocked until this matrix passes with synthetic staging data, the Security and Performance Advisors are reviewed, dependency-audit findings are classified, and exposed credentials are rotated. Set `SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT`, `SAFESTEPS_PERFORMANCE_ADVISOR_REVIEWED_AT`, `SAFESTEPS_STAGING_JOURNEY_VERIFIED_AT`, `SAFESTEPS_DEPENDENCY_AUDIT_REVIEWED_AT`, and `SAFESTEPS_CREDENTIAL_ROTATION_CONFIRMED_AT` only after that evidence is complete, then run `npm run release:gate`.
