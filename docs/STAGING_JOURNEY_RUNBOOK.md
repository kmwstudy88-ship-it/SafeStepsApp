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
SAFESTEPS_STAGING_CASE_ID=<synthetic case UUID>
SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON={"parent":{"email":"...","password":"..."},"child":{"email":"...","password":"..."},"caseworker":{"email":"...","password":"..."},"supervisor":{"email":"...","password":"..."},"court_viewer":{"email":"...","password":"..."},"unrelated":{"email":"...","password":"..."}}
```

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

Production remains blocked until this matrix passes with synthetic staging data and the Security and Performance Advisors are reviewed.
