# SafeSteps Dependency Audit Release Review - 2026-08-14

This review records the current `npm audit --audit-level=moderate` blocker for the production-readiness closeout branch.

## Current result

`npm audit --audit-level=moderate` still fails with 23 findings:

- 14 high severity findings
- 9 moderate severity findings

The remaining advisory roots are:

- `image-size`
- `uuid`

## Why this is still release-blocking

The remaining findings are pulled through Expo, React Native, Metro, and Expo config/prebuild tooling paths. They are not cleared by a non-forced lockfile remediation.

The npm-recommended forced fix is not acceptable for this release gate because it proposes breaking framework changes, including the current resolver path that would install:

- `expo@53.0.27`

SafeSteps is currently pinned to the Expo SDK 56 stack. Applying a forced audit fix would be a framework migration, not a safe patch-level remediation.

## Required release decision

Do not set `SAFESTEPS_DEPENDENCY_AUDIT_REVIEWED_AT` until one of these is true:

1. The findings are remediated through an Expo-compatible dependency update and the full validation suite passes.
2. The findings are formally risk-accepted for the exact release candidate, with scope, exploitability, affected runtime surface, compensating controls, and planned upgrade path recorded.

## Minimum evidence before acceptance

Before dependency audit review can be marked complete, record:

- the exact release candidate commit
- the current `npm audit --audit-level=moderate` output
- whether affected packages are production runtime, development tooling, build tooling, or unreachable in deployed runtime paths
- the Expo/React Native compatibility reason for rejecting `npm audit fix --force`
- the planned remediation route and owner
- final validation output after any dependency change

Production release remains blocked until this review is completed honestly.
