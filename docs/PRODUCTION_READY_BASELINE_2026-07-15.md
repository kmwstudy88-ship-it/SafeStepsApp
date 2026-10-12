# SafeSteps Production-Ready Baseline

Date: 2026-07-15

This baseline records the current app state before the next expansion phase.

## Completed In This Pass

- Document Intelligence is wired as a first-class SafeSteps assessment feature.
- The local SafeSteps API starts with `/health`, exposes `/documents/intelligence/schema`, and handles `/documents/analyze`.
- Document Intelligence uses one structured OpenAI response contract instead of multiple parallel free-text calls.
- Backend tests and smoke checks cover the document-intelligence schema, envelope, and missing-key behavior.
- The Documents, Sessions, and Referrals screens no longer display invented case records.
- The assessment shell no longer shows a hard-coded person name.
- Scoring, readiness, and report-output screens are labelled as calibration previews until connected to live reviewed records.

## Validation Gate

The following passed:

- `npm test`
- `npm run test:backend`
- `npm run smoke:document-intelligence`
- `npm run audit:routes`
- `npx tsc --noEmit`
- `npx expo lint`

## Required Runtime Configuration

Live Document Intelligence requires:

- `OPENAI_KEY` or `OPENAI_API_KEY`

Optional:

- `EXPO_PUBLIC_SAFESTEPS_API_URL`
- `SAFESTEPS_DOCUMENT_INTELLIGENCE_MODEL`
- `SAFESTEPS_ALLOWED_ORIGIN`
- `PORT`

## Remaining Production Environment Work

- Deploy or host the SafeSteps API backend.
- Set production environment variables in the chosen host.
- Connect Documents, Sessions, and Referrals to live Supabase records.
- Replace calibration scoring/report previews with saved assessment records when the live case workflow is ready.
- Run native-device smoke testing before app-store release.

## Expansion Can Resume

The app is in a cleaner baseline for continuing feature expansion: fake operational records have been removed from the visible case-management surfaces, validation is passing, and the new AI-backed document review feature has a documented production contract.
