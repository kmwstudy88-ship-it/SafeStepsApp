# SafeSteps Supabase Advisor Release Review - 2026-08-14

This review records the Supabase Security Advisor and Performance Advisor blocker for the production-readiness closeout branch.

## Current state

The local checkout is linked to the production Supabase project ref `yzxotxbwgxnxemkzigse`.

Do not run advisor, Auth-admin, migration, or database commands from that linked checkout for this closeout. Production must not be modified or probed as part of staging release verification.

## Required staging-only review

Before setting `SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT` or `SAFESTEPS_PERFORMANCE_ADVISOR_REVIEWED_AT`, run the Supabase Advisor review against a non-production staging project that has been rebuilt from the release candidate migrations and seeded only with synthetic data.

Supabase documents the Security Advisor and Performance Advisor as database checks for issues such as missing indexes, RLS configuration problems, exposed sensitive data, security-definer view/function risks, and performance bottlenecks.

## Minimum evidence before acceptance

Record the following without writing any secret values:

- the exact release candidate commit
- the staging Supabase project ref, confirming it is not `yzxotxbwgxnxemkzigse`
- the command, dashboard export, or management API evidence used for Security Advisor
- the command, dashboard export, or management API evidence used for Performance Advisor
- all open findings by severity, identifier, object name, and schema
- whether each finding is fixed, intentionally fail-closed, not applicable to the staged release, or accepted with a documented owner and due date
- final rerun timestamp after any remediation

## Required classification rules

Do not mark the Advisor review complete if any of these are unresolved:

- RLS disabled on an exposed table that can contain SafeSteps family, case, report, evidence, profile, consent, message, or operational data
- policies that grant broad authenticated access without case, tenant, owner, role, or relationship boundaries
- views exposed through the API that bypass RLS without a documented `security_invoker` or equivalent protection
- public or broadly executable `SECURITY DEFINER` functions that can read or change protected records
- public buckets or storage policies that expose private evidence, reports, child records, or family data
- unclassified sensitive columns exposed through an API-accessible schema
- performance findings on high-volume relationship, case, report, evidence, message, or audit tables that would materially degrade launch workflows

Findings that are intentional fail-closed controls must be documented with the expected denial behavior and the verification that proves real users still have the required positive access path.

Production release remains blocked until staging Advisor evidence is complete and reviewed.
