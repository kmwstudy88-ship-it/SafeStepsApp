# Parent-First Release Slice

This document turns the repo-level stabilization plan into an active implementation baseline.

## Delivery slice

SafeSteps should treat the parent journey as the first release slice:

1. Entry, sign-in, and onboarding
2. Dashboard
3. Program recommendation and enrolment
4. Curriculum, lessons, and reflections
5. Challenges and tasks
6. Evidence capture and review-ready records
7. Assessments, readiness, and reports
8. Resources and support

Facilitator, child, parent-child, admin, and broader governance areas remain important, but they are secondary to the parent-first release path.

## Canonical journey

The canonical parent journey is:

1. `/`
2. `/welcome`
3. `/why-safesteps` or `/onboarding/how-safesteps-works`
4. `/login` or `/register`
5. `/onboarding/protect-account`
6. `/onboarding/consent-information-sharing`
7. `/onboarding/accessibility-preferences`
8. `/intake`
9. `/dashboard`
10. `/programs`
11. `/library`, `/challenges`, `/tasks`, `/evidence`, `/assessment-system`, `/reports`, `/resources`

The dashboard is the operational hub after sign-in.

## Active product surface

Treat these folders as the active product:

| Area | Active folder |
| --- | --- |
| Expo Router screens | `/home/runner/work/SafeStepsApp/SafeStepsApp/app` |
| Shared UI | `/home/runner/work/SafeStepsApp/SafeStepsApp/components` |
| Client logic, engines, and services | `/home/runner/work/SafeStepsApp/SafeStepsApp/lib` |
| Backend API | `/home/runner/work/SafeStepsApp/SafeStepsApp/backend` |
| Database schema and edge functions | `/home/runner/work/SafeStepsApp/SafeStepsApp/supabase` |
| Automated tests | `/home/runner/work/SafeStepsApp/SafeStepsApp/__tests__` |
| Product docs | `/home/runner/work/SafeStepsApp/SafeStepsApp/docs` |

Avoid treating large import, archive, curriculum-source, and generated-content folders as active app code unless the task is explicitly about import or reconciliation.

## Ownership boundaries

| Concern | Primary layer |
| --- | --- |
| Route structure and parent UX flow | `app/` + `components/` |
| Parent auth, onboarding, dashboard state, navigation policy | `lib/engines/`, `lib/navigation/`, `lib/auth.tsx` |
| Evidence, reports, and sensitive access checks | `lib/engines/`, `lib/security/`, `components/security/` |
| API contracts and protected server workflows | `backend/` |
| Source-of-truth permissions, tables, and RLS | `supabase/` |
| Regression coverage | `__tests__/` |

## Secondary areas

These areas are not removed, but they should be treated as secondary until the parent-first slice is stable:

- `/home/runner/work/SafeStepsApp/SafeStepsApp/app/child`
- `/home/runner/work/SafeStepsApp/SafeStepsApp/app/parent-child`
- `/home/runner/work/SafeStepsApp/SafeStepsApp/app/facilitator`
- `/home/runner/work/SafeStepsApp/SafeStepsApp/app/admin`
- deeper assessment blueprint and governance routes beyond the core workflow

## CI gate

Changes that affect the active product surface should pass the existing repository gate:

1. `npx tsc --noEmit`
2. `npx expo-doctor`
3. `npm run audit:routes`
4. relevant Jest tests
5. `npm run test:backend` when backend behavior changes
6. `npm run smoke:document-intelligence` when document-intelligence flow changes

## Current implementation decisions

- Public discovery now points to `/why-safesteps` instead of a dashboard route that requires authentication.
- Parent-facing navigation should use a smaller launch-focused route set instead of exposing every product area as a first-class path.
- The assessment system should distinguish between the core launch workflow and extended blueprint/governance surfaces.
