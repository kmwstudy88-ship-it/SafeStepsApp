# SafeSteps Full System Summary

Date: 2026-07-15  
Workspace: `C:\Users\SAFES\SafeStepsApp`  
Status: production-readiness baseline after Document Intelligence wiring, fake-content cleanup, and validation.

## Current Production Baseline

SafeSteps is now structured as a court-aware, evidence-oriented parenting, assessment, and reunification platform. The current app separates curriculum delivery, program pathways, child and parent experiences, assessment-system operations, evidence handling, reporting, referrals, sessions, documents, and progress tracking.

Recent production hardening completed:

- Document Intelligence is wired through backend routes, a typed client, an app screen, navigation, smoke tests, backend tests, and production docs.
- Visible placeholder personal case data was removed from documents, sessions, referrals, assessment header state, and calibration/report screens.
- Document, session, and referral screens now start from production empty states and reviewer workflows instead of invented people, providers, or dates.
- Scoring/report preview language now uses neutral calibration wording rather than fake case examples.
- Missing OpenAI credentials are handled as an intentional `503` dependency state instead of an app crash.

Validation last run:

- `npx tsc --noEmit` passed.
- `npx expo lint` passed.
- `npm run smoke:document-intelligence` passed with expected `503` when no OpenAI key is configured.
- `npm run test:backend` passed: 1 backend suite, 3 tests.
- `npm test` passed: 36 suites, 206 tests.
- `npm run audit:routes` passed: 101 route candidates, 0 implementation route candidates.

## Primary App Surfaces

SafeSteps currently has 101 Expo Router route candidates. The main product surfaces are:

- Launch and access: welcome, login, register, create account, splash, settings.
- Parent dashboard and progress: dashboard, home, growth, progress, timeline, notifications.
- Curriculum: lessons, lesson player, courses, course detail, library, learning hub.
- Programs: program index, my programs, program detail, month/week/day lesson delivery, reflection.
- Challenges and tasks: challenge list/detail, task list, challenge-to-task task engine support.
- Evidence: evidence, evidence upload, daily evidence, child evidence, document vault work.
- Assessment System: case setup, parent identity, parent profiles, child development capacity, evidence uploads, document intelligence, scoring, rubric scoring, readiness index, records, report output, intensive reunification support.
- Operational case work: documents, sessions, referrals, reports, longitudinal reports.
- Child experience: child home, achievements, check-in, curriculum, lessons, my story, notifications, requests, safe people, safety rules, shared log, sharing, tasks, visit preparation, visit reflection.
- Parent-child communication: parent-child hub, messages, requests, shared items.
- Support roles: advocate, carer, facilitator, child protection, worker dashboard.
- Play and engagement: multiplayer games route and 120 game JSON assets.
- Admin and setup: admin content, bulk setup, certificates, resources, why SafeSteps.

## Frontend Engine Inventory

There are 27 TypeScript engine files under `lib/engines`. These are the first-class app-domain engines currently present:

- `assessmentCaseEngine.ts`: saves and fetches assessment case setup.
- `assessmentScoringEngine.ts`: scores assessment responses/domains, applies critical overrides, computes readiness and composite reunification risk/readiness.
- `authEngine.ts`: session, user, sign-in, registration, sign-out, profile fetch/upsert.
- `checkpointEngine.ts`: checkpoint rule definitions.
- `childDevelopmentCapacityEngine.ts`: scores child development capacity responses, summarizes domains, builds case-note/report language, selects review scenarios.
- `courtReportBuilderEngine.ts`: builds court-aware report drafts from evidence, contradictions, collateral, and case summary inputs.
- `dashboardEngine.ts`: fetches dashboard statistics.
- `documentManagementEngine.ts`: document types/status/versioning, storage path building, expiry alerts, summaries, Supabase document listing/request/version registration.
- `evidenceEngine.ts`: evidence item fetch/create, file upload, offline fallback, pending evidence sync, evidence status updates.
- `growthFeatureEngine.ts`: growth profile and reflection fetch/save.
- `growthTimelineEngine.ts`: daily lesson record fetch and growth statistics.
- `intensiveReunificationEngine.ts`: appointment load, contact progression, pre-return verification, planning summaries, report language.
- `lessonSaveEngine.ts`: daily lesson completion record saving.
- `offlineEvidenceVault.ts`: offline evidence queue, AES/SecureStore-backed vault behaviour, hash chain verification, sync failure tracking, security status.
- `parentProfileEngine.ts`: parent identities, protective capacities, risk indicators, parenting behaviours, engagement, profile fetch/save.
- `programEnrollmentEngine.ts`: program enrollment fetch, active enrollment lookup, enrollment start.
- `progressEngine.ts`: lesson completion calculation.
- `recognitionSupportEngine.ts`: cultural safety, accessibility, recognition support gaps and support-plan building.
- `reflectionEngine.ts`: monthly, weekly, lesson-start, and lesson-end reflection questions.
- `reflectionSaveEngine.ts`: reflection record save/fetch.
- `reflectionStatusEngine.ts`: reflection completion status checks.
- `saferAssessmentEngine.ts`: SAFER evidence classification, coverage, guided professional judgement.
- `safetyAlertEngine.ts`: safety alert rules and generated safety alert evaluation.
- `serviceReferralEngine.ts`: referral status, overdue/review alerts, summary, evidence note, Supabase list/create/update.
- `sessionManagementEngine.ts`: session status/types, agenda generation, missed-session alerts, Supabase schedule/list/complete.
- `taskEngine.ts`: user task list/create/complete and parent challenge task creation.
- `visitContactEngine.ts`: visit/contact record fetch/create.

## Backend Document Intelligence

Document Intelligence now has an Express backend entry point, environment loader, document routes, smoke script, backend Jest config, and service tests.

Backend endpoints:

- `GET /health`: backend health and service status.
- `GET /documents/intelligence/schema`: exposes available section keys, schema version, and maximum text size.
- `POST /documents/analyze`: accepts document text and returns structured document intelligence output.

Backend service files under `backend/Services/DocumentIntelligence` include 59 JavaScript files. The production orchestrator is `DocumentService.js`, which now performs one structured OpenAI JSON-schema analysis call and normalizes the result into the app contract.

Document Intelligence analysis areas:

- Action planning.
- Attachment quality.
- Behaviour patterns.
- Bias detection.
- Case complexity.
- Caseworker accountability, bias, follow-through, and omissions.
- Child safety indicators.
- Child voice extraction.
- Child wellbeing indicators.
- Communication skill.
- Concern classification.
- Contact visit analysis.
- Contradictions.
- Crisis history.
- Cultural context.
- Developmental appropriateness.
- Discrepancies.
- Document quality.
- Domestic violence patterns.
- Education stability.
- Emotional regulation support.
- Emotional state.
- Environmental risk.
- Evidence extraction and weighting.
- Fairness and procedural fairness.
- Financial stress.
- Health needs.
- Home management.
- Housing stability.
- Learning engagement.
- Legal summary.
- Mental health indicators.
- Missing evidence.
- Parent advocacy, capacity, insight, progress, summary, and parenting skill.
- Professional conduct.
- Requirements extraction.
- Risk assessment and safety-risk scoring.
- Routine management.
- Safety plan quality.
- Service engagement.
- Social connection.
- Strength extraction.
- Substance-use patterns.
- Support network.
- Text analysis.
- Timeline extraction.
- Unrealistic expectation detection.

## Programs

Program definitions live in `lib/data/programs.ts`. Current first-class pathways:

| Program ID | Program | Duration |
| --- | --- | --- |
| `intensive-reunification` | 24-Month Intensive Reunification Program | 24 months |
| `home-again` | Home Again Program | 12 months |
| `keeping-families-together` | Keeping Families Together | 18 months |
| `back-on-track` | Back on Track | 12 months |
| `build-stronger-families` | Build Stronger Families | 6 months |
| `child-safety-contact` | Child Safety Contact Program | 3 months |
| `custom-program` | Specialised Personal Custom Program | Custom |

Program delivery surfaces include program listing, program detail, month/week/day lessons, program reflections, active enrollments, and my-programs workflow. Intake and enrollment logic is handled separately from course content so programs can remain pathways over canonical courses and lessons.

## Course Library

The current complete Gold Standard library is defined in `curriculum/courses/completeCourseLibrary.ts`.

It contains 12 courses and 171 lessons:

| Course ID | Course | Lessons |
| --- | --- | ---: |
| `understanding-your-nervous-system` | Understanding Your Nervous System | 12 |
| `breaking-the-cycle-intergenerational-trauma` | Breaking the Cycle - Intergenerational Trauma | 12 |
| `your-child-s-brain-what-they-need-from-you` | Your Child's Brain - What They Need From You | 14 |
| `emotional-literacy` | Emotional Literacy | 14 |
| `healthy-relationships` | Healthy Relationships | 15 |
| `financial-literacy-and-life-skills` | Financial Literacy and Life Skills | 15 |
| `co-parenting-after-separation` | Co-Parenting After Separation | 15 |
| `seeing-through-your-child-s-eyes` | Seeing Through Your Child's Eyes | 14 |
| `self-compassion-and-shame-resilience` | Self-Compassion and Shame Resilience | 15 |
| `executive-functioning-in-family-life` | Executive Functioning in Family Life | 15 |
| `digital-safety-for-families` | Digital Safety for Families | 15 |
| `building-your-village` | Building Your Village | 15 |

Additional course assets:

- `curriculum/courses/courses.ts`
- `curriculum/courses/safestepsProductionCourses.ts`
- `curriculum/courses/strongFathersCourse.ts`
- `curriculum/courses/working_with_families/course.json`
- `curriculum/courses/working_with_families/lessons/*`

## Lesson Inventory

Lesson sources are split between structured TypeScript bundles and JSON content:

- `curriculum/lessons/index.ts` exports:
  - `safestepsLessonCurriculum1To47`
  - `safestepsLessonCurriculum48To95`
  - `safestepsExpandedLessonCurriculum252To780`
- `curriculum/lessons` contains 688 lesson JSON files.
- The canonical first-class Gold Standard course pathway currently surfaces 171 lessons through the 12-course library.

Lesson delivery features include:

- Lesson listing and detail routes.
- Lesson player route.
- Course-based lesson delivery.
- Program month/week/day lesson delivery.
- Lesson completion save engine.
- Growth timeline aggregation.
- Reflection prompts before and after lessons.
- Child lesson routes for the child-facing experience.

## Challenges, Tasks, and Games

Parent challenges:

- Source: `lib/data/safestepsParentChallenges.ts`
- Total: 104 parent challenges.
- Challenge route surfaces: challenge list and challenge detail.
- Challenge-to-task support: `taskEngine.ts` can build and create user tasks from parent challenges.

Challenge categories present:

- Connection & Attachment.
- Parent Self-Regulation.
- Communication.
- Discipline & Boundaries.
- Routines & Structure.
- Emotional Literacy.
- Child Voice.
- Safety & Stability.
- Co-Parenting.
- Practical Care.
- Teens & Adolescence.
- Babies & Toddlers.
- Progress Evidence.

Each challenge includes:

- ID and display title.
- Category and challenge type.
- Estimated time.
- Quick question before challenge.
- Purpose.
- Parent skill focus.
- Challenge steps.
- Reflection questions.
- Evidence task.
- Completion checklist.
- Safety note.
- Tags.

Tasks:

- User task creation, fetch, completion, and bulk completion are handled by `taskEngine.ts`.
- Parent challenges can be converted into task inputs.
- Task routes exist for parent and child-facing task experiences.

Games:

- Source: `curriculum/games`
- Total: 120 game JSON files.
- Multiplayer game route exists at `/games/multiplayer/[gameId]`.

## Evidence and Reporting

Evidence capability includes:

- Direct evidence creation and status updates.
- File upload support.
- Offline fallback evidence creation.
- Pending offline evidence fetch and sync.
- Offline vault hashing and chain verification.
- Evidence upload routes for parent/app and child flows.
- Daily evidence route.
- Assessment-system evidence upload route.

Reporting capability includes:

- Court-aware report draft generation.
- Assessment scoring and readiness-index reports.
- Report output route.
- Longitudinal reports route.
- SAFER-guided evidence classification and guided professional judgement.
- Recognition support planning for cultural safety and accessibility.
- Document Intelligence outputs intended for reviewer decision support, not autonomous court conclusions.

## Assessment System

The Assessment System is now a substantial operational hub. It includes:

- Case setup.
- Parent identity.
- Parent profiles.
- Child development capacity review.
- Evidence uploads.
- Document Intelligence.
- Records.
- Rubric scoring.
- Assessment scoring.
- Readiness index.
- Report output.
- Intensive reunification support.

Important framing:

- Assessment outputs are decision-support and reviewer tools.
- Critical findings should remain explicit and should not be averaged away.
- Court-facing wording should stay court-aware unless genuine approval evidence exists.
- Safety and clinician-facing workflows should preserve human review.

## Data and Backend Integration

Current backend/data patterns:

- Supabase-backed engines exist for auth, profiles, evidence, program enrollments, reflections, parent profiles, documents, sessions, referrals, and visit/contact records.
- Document Intelligence is currently served by an Express backend and OpenAI structured response call.
- Offline evidence vault behaviour is app-local first and can queue evidence for later sync.
- Backend production use requires `OPENAI_KEY` or `OPENAI_API_KEY`.

## Production-Ready Strengths

SafeSteps now has:

- Clear separation between programs, courses, lessons, challenges, tasks, and assessment workflows.
- A large structured curriculum base.
- A first-class 12-course Gold Standard pathway.
- Working task/challenge model.
- Evidence, vault, and report engines.
- Assessment-system operational modules.
- Child, parent, worker, facilitator, advocate, carer, and child-protection route surfaces.
- Backend Document Intelligence with a tested contract and graceful missing-key behaviour.
- Green TypeScript, lint, route audit, app test, backend test, and document-intelligence smoke validation.

## Remaining Production Work Before Public Launch

The app is in a stronger production baseline, but these items still need dedicated completion before a public launch claim:

- Configure production backend hosting for Document Intelligence.
- Add production environment secrets for OpenAI and Supabase in the chosen deployment environment.
- Connect live backend URL through `EXPO_PUBLIC_DOCUMENT_INTELLIGENCE_API_URL`.
- Apply and verify any pending Supabase migrations against the linked production project.
- Run a production web/native build pipeline, not only local validation.
- Perform device-level QA for parent, child, worker, and assessment-system flows.
- Add role-based access checks around sensitive case, child, evidence, and report routes.
- Add reviewer approval states for any document-intelligence output used in reports.
- Complete privacy, retention, consent, and export/delete workflows for real users.
- Replace any remaining calibration/demo copy only if it is visible outside reviewer-only contexts.

## Recommended Next Build Sections

Priority order:

1. Production environment and deployment pipeline.
2. Role-based access and case membership hardening.
3. Intake and enrollment gate enforcement across every program start path.
4. Evidence vault sync and attachment review workflow.
5. Report approval workflow with reviewer sign-off and immutable history.
6. Child/parent communication safety review workflow.
7. Admin curriculum management and content QA tools.
8. Expanded analytics for completion, risk signals, and support needs.

