# SafeSteps Feature And Content Inventory - 2026-07-13

This inventory is based on the current app, data, and launch docs in `C:\Users\SAFES\SafeStepsApp`.

## What Is Left To Do

1. Freeze the launch shape. Do not add more major product areas until the current parent journey is coherent.
2. Finish parent-facing V1 first: onboarding, dashboard, programs, courses, lessons, challenges, tasks, reflections, evidence, progress, reports, and assessment entry.
3. Treat facilitator, caseworker, messaging, parent-child sharing, and child-facing tools as advanced or draft until safety, privacy, role access, and database behavior are verified.
4. Curate programs into launch, structured draft, and custom pathway status. Current launch programs are `intensive-reunification` and `home-again`.
5. Curate courses and lessons. Confirm every launch lesson has a useful `parentMeaningPrompt` and hide or label generated/template content that is not ready.
6. Finish evidence verification: Supabase storage, RLS, file metadata, missing-auth empty states, offline vault sync, and report linkage.
7. Remove or clearly label fake/demo data in assessment records, evidence cards, dashboard-style summaries, reports, and any case-facing surface.
8. Smoke-test the full user path: signup, login, welcome disclaimer, dashboard, course, lesson, program, reflection, task/challenge, evidence upload, progress, report, assessment.
9. Run validation before release: `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor`, and `npm test`.

## Main Feature Areas

- App shell and routing: Expo Router app with 93 TSX route files under `app/`; main stack is `app/_layout.tsx`.
- Auth and onboarding: `app/index.tsx`, `app/login/index.tsx`, `app/register/index.tsx`, `app/welcome.tsx`.
- Dashboard: `app/dashboard/index.tsx`, backed by dashboard/progress/evidence/task data.
- Library: `app/library/index.tsx`, the main curriculum hub.
- Courses: `app/courses/index.tsx`, `app/courses/course.tsx`, `curriculum/courses/`.
- Lessons: `app/lessons/index.tsx`, `app/lessons/[lessonId].tsx`, `app/lesson-player/[lessonId].tsx`, `curriculum/lessons/`.
- Programs: `app/programs/`, `app/program-lessons/[programId]/[weekId]/[dayId].tsx`, `lib/data/programs.ts`.
- Challenges and tasks: `app/challenges/`, `app/tasks/index.tsx`, `lib/data/safestepsParentChallenges.ts`, `lib/engines/taskEngine.ts`.
- Reflections: `app/programs/reflection.tsx`, `lib/data/safestepsReflectionWorksheets.ts`, program reflection save functions in `lib/platformData.ts`.
- Evidence: `app/evidence/index.tsx`, `app/daily-evidence.tsx`, `app/evidence-upload/index.tsx`, evidence engines and storage helpers.
- Assessments: `app/assessment-system/`, `lib/data/assessmentSystem.ts`, scoring engines and tests.
- Progress, timeline, reports: `app/progress/index.tsx`, `app/timeline/index.tsx`, `app/reports/index.tsx`, `app/reports/longitudinal.tsx`.
- Parent-child and child tools: `app/parent-child/`, `app/child/`, `lib/parentChild/`.
- Operational modules: `app/facilitator/index.tsx`, `app/sessions/index.tsx`, `app/documents/index.tsx`, `app/referrals/index.tsx`, `app/notifications/index.tsx`, `app/certificates/index.tsx`, `app/bulk-setup/index.tsx`.

## Programs

Current count: 7.

- `intensive-reunification`: 24-Month Intensive Reunification Program. Launch program.
- `home-again`: Home Again Program. Launch program.
- `keeping-families-together`: Keeping Families Together. Structured draft.
- `back-on-track`: Back on Track. Structured draft.
- `build-stronger-families`: Build Stronger Families. Structured draft.
- `child-safety-contact`: Child Safety Contact Program. Structured draft.
- `custom-program`: Specialised Personal Custom Program. Custom assessment-led pathway.

Program structure:

- Month topic.
- Four weekly subtopics.
- Five 30-minute daily lessons per week.
- Start and end reflections.
- Knowledge checkpoint.
- Scenario checkpoint.
- Practical activity.
- End reflection.
- Task, reflection, evidence, and progress review flow.

## Courses And Course Areas

Current guided course areas: 9.

- Start here.
- Child development and wellbeing.
- Connection and regulation.
- Behaviour, boundaries, and routines.
- Safety, stability, and evidence.
- Separation and co-parenting.
- Healthy relationships and accountability.
- Specialist support needs.
- Father-focused pathway.

Gold Standard course library currently exposes these 12 course IDs:

- `understanding-your-nervous-system`
- `breaking-the-cycle-intergenerational-trauma`
- `your-child-s-brain-what-they-need-from-you`
- `emotional-literacy`
- `healthy-relationships`
- `financial-literacy-and-life-skills`
- `co-parenting-after-separation`
- `seeing-through-your-child-s-eyes`
- `self-compassion-and-shame-resilience`
- `executive-functioning-in-family-life`
- `digital-safety-for-families`
- `building-your-village`

Additional standalone course records visible in `curriculum/courses/courses.ts`:

- Communication Skills.
- Child Development Foundations.
- Positive Parenting Foundations.
- Attachment and Bonding Foundations.
- Behaviour Management Foundations.
- Demonstrating Change and Self-Managed Safety.
- Child Safety Foundations.
- Family Routines and Structure.
- Reunification Parenting Foundations.
- Trauma-Informed Parenting Foundations.
- Emotional Regulation for Parents.
- Parent Safety and Stability.
- Co-Parenting Foundations.
- Accountability and Responsibility.
- Substance Use and Parenting Stability.
- Mental Health, Stress, and Parenting.
- Family Mental Health: Children, Parents, and the Parent-Child Relationship.
- Relationship Skills.
- Safe Conversations.
- Protective Parenting Foundations.

## Lessons

Canonical lesson locations:

- `curriculum/lessons/safestepsLessonCurriculum1To47.ts`
- `curriculum/lessons/safestepsLessonCurriculum48To95.ts`
- `curriculum/lessons/safestepsExpandedLessonCurriculum252To780.ts`
- `curriculum/lessons/expandedLessonContentOverrides.ts`
- JSON lesson files in `curriculum/lessons/`

Known lesson work remaining:

- Confirm launch lessons have non-generic parent meaning prompts.
- Review expanded/generated lesson records before making them launch-visible.
- Keep Lessons and Courses as canonical sources used to build Programs.
- Do not move ambiguous lesson records into Challenges without evidence and approval.

## Challenges

Current count: 104 parent challenges.

Challenge categories:

- Connection & Attachment: 8.
- Parent Self-Regulation: 8.
- Communication: 8.
- Discipline & Boundaries: 8.
- Routines & Structure: 8.
- Emotional Literacy: 8.
- Child Voice: 8.
- Safety & Stability: 8.
- Co-Parenting: 8.
- Practical Care: 8.
- Teens & Adolescence: 8.
- Babies & Toddlers: 8.
- Progress Evidence: 8.

Each challenge includes:

- ID and display title.
- Category.
- Daily, weekly, or monthly type.
- Estimated time.
- Quick question before starting.
- Purpose.
- Parent skill focus.
- Challenge steps.
- Reflection questions.
- Evidence task.
- Completion checklist.
- Safety note.
- Tags.

## Tasks

Task-related functions are concentrated in:

- `app/tasks/index.tsx`
- `lib/engines/taskEngine.ts`
- `lib/platformData.ts`

Task capabilities:

- Load user tasks.
- Create user tasks.
- Create tasks from parent challenges.
- Mark tasks complete.
- Set task status.
- Bulk set task status.
- Bulk add task templates.
- Add contextual challenge tasks without duplicating stable challenge references.

## Reflections

Current count: 50 reflection worksheets.

Reflection worksheet titles:

- Self-awareness snapshot.
- Values alignment check.
- Strengths inventory.
- Parenting wins tracker.
- Emotional regulation reflection.
- Communication audit.
- Boundary setting.
- Stress mapping.
- Relationship reflection (co-parenting).
- Future self vision.
- Triggers and choices.
- Safety mindset check.
- Coping skills review.
- Parenting identity statement.
- Repair after conflict.
- Listening habits.
- Routine stability check.
- Support network map.
- Risk awareness reflection.
- Self-care reality check.
- Boundaries with substances.
- Crisis response reflection.
- Trust building with child.
- Emotional literacy practice.
- Discipline reflection.
- Parenting under stress.
- Hope and motivation.
- Boundaries with family of origin.
- Digital safety reflection.
- Consistency check.
- Attachment and connection.
- Apology and accountability.
- Parenting beliefs check.
- Safety planning micro-steps.
- Co-parenting communication.
- Child's perspective.
- Boundaries with conflict.
- Parenting goals for this week.
- Gratitude towards child.
- Emotional safety at home.
- Boundaries with technology (parent).
- Parenting under shame.
- Learning from your child.
- Safety with new partners.
- Emotional check-in routine.
- Parenting under financial stress.
- Safety with extended contact.
- Celebrating progress.
- Parenting under grief or loss.
- Commitment statement.

## Assessments And Quizzes

Assessment routes:

- Case Setup: `/assessment-system/case-setup`.
- Assessment Records: `/assessment-system/records`.
- Parent Identity & Background: `/assessment-system/parent-identity`.
- Protective Capacity Scoring: `/assessment-system/scoring`.
- Evidence Uploads: `/assessment-system/evidence-uploads`.
- Report Output: `/assessment-system/report-output`.

Assessment data areas:

- Program streams.
- Assessment types.
- Case goals.
- Assigned people.
- Assessment records.
- Rubric scale.
- Rubric domains.
- Suggested domains.
- Evidence types.
- Linked domains.
- Privacy levels.
- Evidence cards.
- Evidence statuses.
- Report types.
- Report sections.

Lesson quiz/checkpoint behavior is in `components/SafeStepsLessonExperience.tsx` and program lesson definitions. Program lessons require knowledge checkpoints and scenario checkpoints.

## Important Functions And Engines

Program functions:

- `getProgramMonths`
- `getProgramMonth`
- `getProgramWeek`
- `getProgramById`
- `getLaunchPrograms`
- `getStructuredDraftPrograms`
- `getCustomProgramPathways`
- `getProgramWeekPlan`
- `getProgramWeekPlans`
- `getProgramWeekBulkPlan`
- `startProgramWeek`
- `startProgramWeekWithBulkAdds`
- `saveProgramMeaningReflections`
- `saveDailyProgramLessonCompletion`

Course and lesson functions:

- `getLessonById`
- `getLearningCourses`
- `completeLesson`
- `getCompletedLessonIds`
- `getNextLessonStep`
- `getPreviousLessonStep`
- `normaliseAnswer`
- `isCheckpointCorrect`
- `stepLabel`

Task and challenge functions:

- `getTasks`
- `setTaskCompleted`
- `setTaskStatus`
- `bulkSetTaskStatus`
- `bulkAddTasks`
- `createUserTaskFromParentChallenge`
- Challenge recommendation helpers in `lib/challenges/recommendations.ts`

Evidence functions:

- `getEvidence`
- `addEvidenceNote`
- `uploadEvidenceMedia`
- `uploadEvidenceImage`
- `addDailyHomeEvidence`
- `getDailyHomeEvidenceStatus`
- `getDailyHomeEvidenceHistory`
- `getDailyHomeEvidenceTaskTemplates`
- `createDailyHomeEvidenceTasks`
- `setEvidenceStatus`
- `bulkSetEvidenceStatus`
- `bulkAddEvidenceNotes`
- Offline vault sync functions in the evidence engine.

Assessment functions:

- `getProgressCheckAssessment`
- `getIntakeAssessment`
- `getAssessmentResponses`
- `hasCompletedIntakeAssessment`
- `submitAssessmentResponse`
- `submitIntakeAssessmentResponse`
- Scoring helpers in `lib/engines/assessmentScoringEngine.ts`
- SAFER helpers in `lib/engines/saferAssessmentEngine.ts`

Progress and report functions:

- `getDashboardCounts`
- `getReportSummary`
- `saveWeeklyGrowthNotes`
- `saveDailyCheckIn`
- `listMetadataStrings`
- `metadataTaskTitles`
- `metadataEvidenceTitles`
- `computeLessonLocks`
- `getProgressForEnrolment`
- `markLessonInProgress`
- `completeLessonAndUnlockNext`
- `saveReviewSnapshot`
- `listReviewSnapshots`
- `buildLongitudinalComparison`

Parent-child functions:

- `getParentChildOverview`
- `getParentChildSharedItems`
- `getParentChildRequests`
- `getParentChildMessages`
- `markChildRequestStatus`
- `getChildRequestResponses`
- `createChildRequestResponse`
- `createParentChildMessage`
- `updateParentChildMessageMonitoring`

Platform/admin functions:

- `getMyRole`
- `listPrograms`
- `listCourses`
- `listLessons`
- `getLesson`
- `listResources`
- `listMyEnrolments`
- `saveProgram`
- `saveCourse`
- `saveLesson`
- `saveResource`
- `saveReflection`
- `saveFacilitatorNote`
- Permission helpers for content management, facilitator notes, private notes, court reports, and learner note visibility.

Certificates and notifications:

- `findMatchingCertificate`
- `makeCertificateNumber`
- `issueCertificate`
- `listMyCertificates`
- `createReminder`
- `createSafetyAlertNotification`
- `listMyNotifications`
- `markNotificationRead`
- `markNotificationsRead`

## Release Priority

The next highest-value sequence is:

1. Parent dashboard cleanup and smoke test.
2. Launch program/course curation.
3. Lesson prompt QA.
4. Evidence storage and offline vault verification.
5. Assessment demo-data cleanup.
6. Reports/progress consistency check.
7. Parent-child and child areas safety review before release labeling.
