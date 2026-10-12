# SafeSteps Stability Plan

This is the practical path to getting SafeSteps stable.

## Current State

- Branch: `codex/stabilize-safesteps`
- Basic checks are passing:
  - `npx tsc --noEmit`
  - `npx expo-doctor`
  - `npx expo lint`
  - `npm test`
- The app is not release-stable yet because there are many uncommitted changes, new routes, new tests, Supabase migration changes, and backup files that need cleanup.

## Do First

1. Keep working on `codex/stabilize-safesteps`, not directly on `main`.
2. Review the changed files and separate them into clear groups:
   - Expo/app config
   - Route migrations from `.js` to `.tsx`
   - Child and parent-child features
   - Courses, programs, progress, tasks, evidence, certificates, and notifications
   - Supabase migrations and config
   - Tests
3. Remove or ignore local backup artifacts before release:
   - `*.bomfix_backup_*`
   - temporary Supabase backup folders
   - generated reports or local repair files that are not part of the app

## Validation Gates

Run these before committing or releasing:

```powershell
npx tsc --noEmit
npx expo lint
npx expo-doctor
npm test
```

Then validate the database:

```powershell
npx supabase db push --include-all --dry-run
```

If the dry run is clean, validate against a local or staging Supabase database before production.

## Manual Smoke Tests

Open the app and check these flows:

- Welcome / splash / home
- Create account
- Login and logout
- Dashboard
- Course list and course detail
- Lesson player
- Programs, week, and month views
- Progress
- Evidence upload and evidence list
- Certificates
- Notifications
- Tasks
- Timeline
- Child section
- Parent-child sharing section
- Facilitator view

## Release Readiness

SafeSteps is stable enough to release only when:

- The working tree is clean except for intentional files.
- All validation gates pass.
- Supabase migrations have been tested.
- Sensitive `.env` files are not tracked.
- Preview builds install and open on real devices.
- The main user flows have been smoke-tested manually.

