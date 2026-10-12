# SafeSteps Build Map

This is the plain-English map for the current SafeSteps app. Use this when the repo feels confusing.

## The Short Version

SafeSteps is an Expo Router app for court-aware parenting support. The product is built around:

- Programs: longer structured pathways with month, week, day, and reflection flow.
- Courses: standalone learning modules that do not need the full program structure.
- Lessons: parent-facing learning content with meaning-making prompts.
- Challenges: practical tasks that can stand alone or be recommended inside programs and courses.
- Evidence: uploaded documents, images, videos, and live capture linked to parenting progress.
- Assessments: structured court-aware assessment, scoring, records, readiness, and report outputs.
- Child and parent-child areas: child-safe content, shared items, requests, and mediated parent visibility.
- Reports and progress: longitudinal evidence of learning, reflection, completion, and growth.

## The Real App

The active app lives in these folders:

| Area | Use this |
| --- | --- |
| App screens and routes | `app/` |
| Shared UI components | `components/` |
| Product data and engines | `lib/` |
| Supabase migrations and config | `supabase/` |
| Tests | `__tests__/` |
| Product docs | `docs/` |
| App assets | `assets/` |

The app entrypoint is `expo-router/entry` in `package.json`.

The main route map is `app/_layout.tsx`.

## Do Not Treat Every Folder As The App

This repo contains a lot of source material, older generated files, imports, experiments, and archive-like folders. These are useful, but they are not all active product code.

Examples of folders to treat carefully:

- `SafeSteps Curriculum`
- `safesteps-curriculum`
- `curriculum_clean`
- `challenges_clean`
- `Programs`
- `Content`
- `SafeStepsLibrary`
- `caseworker-dashboard`
- `casefiles`
- `_CAN_DELETE_REVIEW`
- `_legacy_root_20260629`
- generated report or audit folders

Do not build from these directly unless you are intentionally importing or reconciling content into `app/`, `lib/`, `supabase/`, or `__tests__/`.

## Main User Journey

The clean product journey should be:

1. Create account or login.
2. New signup goes to Welcome.
3. Welcome explains the disclaimer and sends the parent to assessment.
4. Login goes straight to Dashboard.
5. Dashboard sends the parent to the right program, courses, tasks, evidence, and progress.
6. Lessons ask the parent what the material means for them.
7. Challenges turn learning into practical action.
8. Evidence stores documents, media, and live records.
9. Progress, timeline, facilitator, and reports reuse the structured records.

## Main Screens

| Product area | Main route files |
| --- | --- |
| Entry and auth | `app/index.tsx`, `app/login/index.tsx`, `app/register/index.tsx`, `app/welcome.tsx` |
| Dashboard | `app/dashboard/index.tsx` |
| Curriculum hub | `app/library/index.tsx` |
| Courses | `app/courses/index.tsx`, `app/courses/course.tsx` |
| Lessons | `app/lessons/index.tsx`, `app/lessons/[lessonId].tsx`, `app/lesson-player/[lessonId].tsx` |
| Programs | `app/programs/index.tsx`, `app/programs/[programId]/index.tsx`, `app/programs/[programId]/[weekId].tsx` |
| Daily program lessons | `app/program-lessons/[programId]/[weekId]/[dayId].tsx` |
| Challenges | `app/challenges/index.tsx`, `app/challenges/[challengeId].tsx`, `app/tasks/index.tsx` |
| Reflections | `app/programs/reflection.tsx` |
| Evidence | `app/evidence/index.tsx`, `app/daily-evidence.tsx`, `app/evidence-upload/index.tsx` |
| Assessment system | `app/assessment-system/` |
| Progress and reports | `app/progress/index.tsx`, `app/timeline/index.tsx`, `app/reports/index.tsx` |
| Parent-child | `app/parent-child/` |
| Child section | `app/child/` |
| Facilitator | `app/facilitator/index.tsx` |
| Settings | `app/settings.tsx` |

## Main Data And Logic Files

| Product area | Main files |
| --- | --- |
| Programs | `lib/data/programs.ts`, `lib/engines/programEnrollmentEngine.ts` |
| Course and lesson content | `lib/lessonContent.ts`, `lib/data/oneDriveLessonLibrary.ts`, `lib/data/oneDriveDeepLessonLibrary.ts` |
| Challenges | `lib/data/safestepsParentChallenges.ts`, `lib/challenges/recommendations.ts` |
| Reflection worksheets | `lib/data/safestepsReflectionWorksheets.ts` |
| Tasks | `lib/engines/taskEngine.ts` |
| Evidence | `lib/engines/evidenceEngine.ts`, `lib/platformData.ts` |
| Assessment | `lib/data/assessmentSystem.ts`, `lib/engines/assessmentScoringEngine.ts`, `lib/engines/saferAssessmentEngine.ts` |
| Dashboard | `lib/engines/dashboardEngine.ts` |
| Progress | `lib/engines/progressEngine.ts`, `lib/progressMetadata.ts` |
| Parent-child | `lib/parentChild/parentChildService.ts`, `lib/parentChild/components.tsx` |
| Auth | `lib/auth.tsx`, `lib/authSession.ts`, `lib/engines/authEngine.ts`, `lib/supabaseClient.ts` |

## What Looks Built Or Partly Built

| Area | Current status |
| --- | --- |
| Expo Router shell | Built. Main route stack exists in `app/_layout.tsx`. |
| Welcome/login/dashboard flow | Built but should be smoke-tested end to end. |
| Course library | Built with many courses and lessons imported. Needs UX polish and final content review. |
| Programs | Built as structured pathways. Needs product cleanup around which programs are official and which are draft/generated. |
| Parent meaning prompts | Important rule: every lesson should keep a parent meaning/reflection prompt. |
| Challenges | Built as standalone section and reusable recommendations. Needs final curation. |
| Evidence uploads | Built for documents, images, videos, and live capture. Needs Supabase/storage verification before release. |
| Assessment system | Built as a substantial scaffold. Needs final data-model reconciliation and workflow testing. |
| Parent-child | Partly built. Needs privacy, sharing, and request flows tested carefully. |
| Child section | Partly built. Needs safety review and clear boundaries before release. |
| Reports/timeline/progress | Built or partly built. Needs consistency checks against real saved records. |
| Messaging/caseworker areas | Present, but should be reviewed before being treated as production-ready. |

## What To Do Next

### Step 1: Freeze The Shape

Do not add more major sections until the current app is easier to use. SafeSteps already has enough product surface to become confusing.

Immediate decision:

- Main parent app first.
- Facilitator/caseworker tools second.
- Child tools third, after safety and privacy review.

### Step 2: Clean The Navigation

Make the Dashboard the one clear starting place after login.

Dashboard should clearly show:

- My Program
- Courses
- Challenges
- Evidence
- Progress
- Assessments
- Parent-child
- Reports

### Step 3: Curate Programs And Courses

Decide which programs are official SafeSteps pathways and which content belongs only in the standalone course library.

Keep this rule:

- Programs are long-term structured pathways.
- Courses are standalone learning modules.
- Challenges are practice tasks.
- Evidence is proof and reflection support.

### Step 4: Stabilize The Current Build

Before release work, run these checks:

```powershell
npx tsc --noEmit
npx expo lint
npx expo-doctor
npm test
```

If these fail, fix them before adding more features.

### Step 5: Database And Evidence Verification

Supabase work needs a separate pass:

- Check migrations.
- Check RLS policies.
- Check evidence storage bucket file types.
- Check that missing auth is handled as an empty state, not a fatal app error.
- Avoid applying old external schemas directly.

### Step 6: Manual Smoke Test

Open the app and test:

- Create account
- Login
- Welcome disclaimer
- Dashboard
- Open a course
- Open a lesson
- Start a program
- Complete a daily reflection
- Create a challenge task
- Upload evidence
- View progress
- Open assessment system
- Open parent-child section
- Generate or view report

## Beginner Rule

When you feel unsure, do not start from the folder list. Start from this question:

What part of the parent journey am I improving?

Then use this map to find the matching route and data file.

## Current Practical Priority

The next best build priority is not more content. It is making the existing product feel coherent:

1. Dashboard clarity.
2. Program/course/challenge separation.
3. Evidence and reflection consistency.
4. Assessment workflow cleanup.
5. Supabase and release validation.

For the production launch content pass, use `docs/FIRST_CLASS_LAUNCH_CONTENT_PLAN.md` as the working checklist.

For the official program model and proof-of-evidence framing, use `docs/SAFESTEPS_PROGRAM_AND_PROOF_OF_EVIDENCE_FRAMEWORK.md`.
