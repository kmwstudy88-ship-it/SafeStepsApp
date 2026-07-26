# SafeSteps Dot-Point Feature Inventory

Date: 2026-07-15  
Purpose: a clear working list of what SafeSteps already has, what each area does, and what still needs work next.

## Big Picture

- SafeSteps is currently built as:
  - A parenting and reunification program app.
  - A course and lesson delivery platform.
  - A parent challenge and task system.
  - A child-facing support and safety experience.
  - A parent-child communication and shared-item space.
  - An assessment-system hub for case setup, evidence, scoring, documents, sessions, referrals, and reports.
  - A document-intelligence backend for reviewer decision support.
  - A Supabase-backed app with offline evidence support.
  - An Expo Router app with 101 route candidates.

- Validation status from the last production pass:
  - TypeScript passed.
  - Expo lint passed.
  - App tests passed: 36 suites, 206 tests.
  - Backend Document Intelligence tests passed: 1 suite, 3 tests.
  - Route audit passed: 101 route candidates, 0 implementation route candidates.
  - Document Intelligence smoke test passed with the expected missing-key `503`.

## Main Navigation Areas Built

- Launch and account:
  - Welcome.
  - Splash screen.
  - Login.
  - Register.
  - Create account.
  - Settings.

- Parent home and dashboard:
  - Home.
  - Dashboard.
  - Growth.
  - Progress.
  - Timeline.
  - Notifications.

- Curriculum:
  - Lessons list.
  - Lesson detail.
  - Lesson player.
  - Learning hub.
  - Courses list.
  - Course detail.
  - Library.
  - Video-series pipeline.

- Programs:
  - Program list.
  - Program detail.
  - My programs.
  - Program month.
  - Program week.
  - Program lesson.
  - Program reflection.
  - Program day lesson route.

- Challenges and tasks:
  - Challenges list.
  - Challenge detail.
  - Tasks list.
  - Parent challenge to task creation support.

- Evidence:
  - Evidence list.
  - Evidence upload.
  - Daily evidence.
  - Child evidence.
  - Assessment-system evidence uploads.
  - Offline evidence vault engine.

- Assessment System:
  - Assessment-system hub.
  - Case setup.
  - Parent identity.
  - Parent profiles.
  - Child development capacity.
  - Evidence uploads.
  - Document Intelligence.
  - Records.
  - Rubric scoring.
  - Scoring.
  - Readiness index.
  - Report output.
  - Intensive reunification support.

- Case operations:
  - Documents.
  - Sessions.
  - Referrals.
  - Reports.
  - Longitudinal reports.

- Child-facing app:
  - Child home.
  - Child achievements.
  - Child check-in.
  - Child curriculum.
  - Child lessons.
  - Child my story.
  - Child notifications.
  - Child requests.
  - Child safe people.
  - Child safety rules.
  - Child shared log.
  - Child sharing.
  - Child tasks.
  - Visit preparation.
  - Visit reflection.

- Parent-child section:
  - Parent-child hub.
  - Messages.
  - Requests.
  - Shared items.

- Worker and support roles:
  - Worker dashboard.
  - Advocate.
  - Carer.
  - Facilitator.
  - Child protection.

- Admin and setup:
  - Admin index.
  - Admin content.
  - Bulk setup.
  - Certificates.
  - Resources.
  - Why SafeSteps.

- Games:
  - Multiplayer game route.
  - Game engine modules.
  - 120 game JSON assets.

## Programs Built

- Program source:
  - `lib/data/programs.ts`

- Program pathways currently defined:
  - `intensive-reunification`
    - Name: 24-Month Intensive Reunification Program.
    - Duration: 24 months.
  - `home-again`
    - Name: Home Again Program.
    - Duration: 12 months.
  - `keeping-families-together`
    - Name: Keeping Families Together.
    - Duration: 18 months.
  - `back-on-track`
    - Name: Back on Track.
    - Duration: 12 months.
  - `build-stronger-families`
    - Name: Build Stronger Families.
    - Duration: 6 months.
  - `child-safety-contact`
    - Name: Child Safety Contact Program.
    - Duration: 3 months.
  - `custom-program`
    - Name: Specialised Personal Custom Program.
    - Duration: custom.

- Program functions available:
  - List programs.
  - Get program by ID.
  - Get program title.
  - Get week plan.
  - Get week plans.
  - Get week bulk plan.
  - Enroll in a program.
  - Fetch my program enrollments.
  - Fetch active program enrollment.
  - Start program enrollment.
  - Start program week.
  - Start program week with bulk task/evidence adds.
  - Save program meaning reflections.
  - Save weekly growth notes.
  - Save daily program lesson completion.

- Still needs work:
  - Hard enforcement that intake is complete before every program start path.
  - Role-based access checks around program visibility and case membership.
  - Production Supabase verification for enrollment records.
  - More polished program admin editing tools.

## Courses Built

- Course sources:
  - `curriculum/courses/completeCourseLibrary.ts`
  - `curriculum/courses/courses.ts`
  - `curriculum/courses/safestepsProductionCourses.ts`
  - `curriculum/courses/strongFathersCourse.ts`
  - `curriculum/courses/working_with_families/course.json`

- First-class Gold Standard course library:
  - Total: 12 courses.
  - Total: 171 course lessons.

- Gold Standard courses:
  - Understanding Your Nervous System.
    - 12 lessons.
  - Breaking the Cycle - Intergenerational Trauma.
    - 12 lessons.
  - Your Child's Brain - What They Need From You.
    - 14 lessons.
  - Emotional Literacy.
    - 14 lessons.
  - Healthy Relationships.
    - 15 lessons.
  - Financial Literacy and Life Skills.
    - 15 lessons.
  - Co-Parenting After Separation.
    - 15 lessons.
  - Seeing Through Your Child's Eyes.
    - 14 lessons.
  - Self-Compassion and Shame Resilience.
    - 15 lessons.
  - Executive Functioning in Family Life.
    - 15 lessons.
  - Digital Safety for Families.
    - 15 lessons.
  - Building Your Village.
    - 15 lessons.

- Extra course content available:
  - Strong Fathers course.
    - `strongFathersLessonCount = 48`.
  - Working with Families course JSON.
  - Working with Families lesson JSON files:
    - Emotional connection.
    - Family systems.
    - Healthy vs unhealthy dynamics.
    - Repairing ruptures.
    - Roles, rules, patterns.
    - Trust and safety.

- Course functions available:
  - Get course by ID.
  - Get course area by ID.
  - Get courses for area.
  - Get Gold Standard courses.
  - Check whether all course lessons are viewed.
  - List courses through platform data layer.
  - Save courses through platform admin data layer.

- Still needs work:
  - Decide which extra course sets should be first-class in the app versus stored as available library material.
  - Add production content QA workflow for lesson/course edits.
  - Add admin publishing states for draft/review/published/archived course content.

## Lessons Built

- Lesson sources:
  - `curriculum/lessons/index.ts`
  - `curriculum/lessons/safestepsLessonCurriculum1To47.ts`
  - `curriculum/lessons/safestepsLessonCurriculum48To95.ts`
  - `curriculum/lessons/safestepsExpandedLessonCurriculum252To780.ts`
  - `curriculum/lessons/expandedLessonContentOverrides.ts`
  - `curriculum/lessons/*.json`
  - `lib/lessonContent.ts`

- Lesson counts:
  - 688 lesson JSON files in `curriculum/lessons`.
  - 171 lessons surfaced in the first-class 12-course Gold Standard library.
  - Foundation curriculum bundles:
    - Lessons 1 to 47.
    - Lessons 48 to 95.
    - Expanded lessons 252 to 780.

- Lesson features available:
  - Lesson list.
  - Lesson detail.
  - Lesson player.
  - Learning hub.
  - Course lesson delivery.
  - Program month/week/day lesson delivery.
  - Child lesson delivery.
  - Lesson completion saving.
  - Lesson progress calculation.
  - Lesson lock/unlock support.
  - Lesson start reflection questions.
  - Lesson end reflection questions.
  - Checkpoint answer validation.
  - Lesson flow step navigation.
  - Completed lesson ID fetch.

- Still needs work:
  - Decide whether all 688 lesson JSON files should become visible, searchable, or stay staged content.
  - Add stronger duplicate/content-quality audits before exposing the full expanded library.
  - Add richer offline lesson access if needed for real users.

## Assessments Built

- Main assessment instrument:
  - Source: `lib/data/safeStepsAssessmentInstrument.ts`
  - Includes 11 weighted domains:
    - Child Safety.
    - Protective Capacity.
    - Insight and Accountability.
    - Emotional Regulation.
    - Parenting Knowledge and Skills.
    - Environmental Safety and Stability.
    - Parenting Routines.
    - Service Engagement.
    - Child Voice and Wellbeing.
    - Evidence Consistency.
    - Anti-Gaming and Generalisation.
  - Includes 44 ID entries across domains, items, score bands, overrides, and phases.
  - Includes score levels:
    - 0 - Immediate concern.
    - 1 - Major concern.
    - 2 - Emerging progress.
    - 3 - Mostly consistent.
    - 4 - Sustained safe practice.
  - Includes critical override logic:
    - Active unmanaged safety concern.
    - Drug test or unmanaged concern critical override.
  - Includes phase markers:
    - Pre-entry.
    - Foundation.
    - Deep assessment.
    - Generalisation.
    - Exit review.

- Child Development Capacity assessment:
  - Source: `lib/data/childDevelopmentCapacityAssessment.ts`
  - Concern domains:
    - Physical Abuse Risk & Emotional Regulation.
    - Neglect, Supervision, Hygiene & Medical Response.
    - Substance Misuse & Environmental Controls.
    - Domestic Safety & Safe Relationships.
    - Child Development, Learning & Daily Capability.
    - Digital Safety & Online Supervision.
  - Scenario count: 10.
  - Scenarios:
    - Crying Infant and Parent Overload.
    - Shopping Centre Meltdown.
    - Change Table and Doorbell.
    - Night Fever and Breathing Difficulty.
    - Medication in Reach.
    - Unsafe Adult at the Door.
    - Play-Based Development Check.
    - Teen Party Boundary.
    - Online Grooming Warning Signs.
    - No Food or Power.
  - Capacity skill lenses:
    - See the Risk.
    - Calm Yourself First.
    - Protect the Child.
    - Support Development.

- Parent Identity & Background assessment:
  - Source: `lib/data/parentIdentityBackgroundAssessment.ts`
  - Built title: Parent Identity & Background.
  - Section present: Background & History.
  - Subsection present: Reflection & Parenting Impact.
  - Includes scored indicators around school history, reflection capacity, protective intent, avoidance/limited insight, and parenting identity.

- Intake and progress check assessments:
  - Source: `lib/platformData.ts`
  - Intake assessment ID exists.
  - Progress check assessment ID exists.
  - Intake question list exists.
  - Functions exist to get intake/progress check assessments.
  - Functions exist to submit assessment responses.
  - Function exists to check whether intake is complete.

- Assessment-system screens:
  - Assessment hub.
  - Case setup.
  - Parent identity.
  - Parent profiles.
  - Child development capacity.
  - Evidence uploads.
  - Document Intelligence.
  - Records.
  - Rubric scoring.
  - Scoring.
  - Readiness index.
  - Report output.
  - Intensive reunification support.

- Still needs work:
  - Make reviewer sign-off mandatory before assessment outputs are used in final reports.
  - Add immutable assessment history and superseded-state display everywhere it matters.
  - Ensure critical overrides remain impossible to hide through average scoring.
  - Enforce access control around assessment records by role and case membership.

## Frontend Engines Built

- `assessmentCaseEngine.ts`
  - Fetch latest assessment case setup.
  - Save assessment case setup.

- `assessmentScoringEngine.ts`
  - Score individual responses.
  - Score domains.
  - Find triggered overrides.
  - Find scoring bands.
  - Score whole assessments.
  - Score trends.
  - Compute readiness index.
  - Classify composite risk band.
  - Calculate readiness direction.
  - Compute composite reunification readiness/risk.
  - Calculate service completion score.
  - Calculate visitation quality trend.
  - Calculate milestone progress score.
  - Compute readiness from signals.

- `authEngine.ts`
  - Get current session.
  - Get current user.
  - Sign in with email.
  - Register with email.
  - Sign out.
  - Fetch my profile.
  - Upsert profile.

- `checkpointEngine.ts`
  - Checkpoint rule definitions.

- `childDevelopmentCapacityEngine.ts`
  - Score capacity responses.
  - Summarize capacity assessment.
  - Build capacity report language.
  - Build evidence-based case notes.
  - Select capacity scenarios for review.

- `courtReportBuilderEngine.ts`
  - Build court-aware report drafts.
  - Use evidence, contradictions, collateral, and case-summary inputs.

- `dashboardEngine.ts`
  - Fetch dashboard stats.

- `documentManagementEngine.ts`
  - Calculate days until document expiry.
  - Detect expired documents.
  - Find next document version number.
  - Build document storage paths.
  - Evaluate document expiry alerts.
  - Create document management summaries.
  - List case documents.
  - Request case documents.
  - Register document versions.

- `evidenceEngine.ts`
  - Upload evidence files.
  - Fetch evidence items.
  - Create evidence items.
  - Create evidence with offline fallback.
  - Get pending offline evidence.
  - Sync pending offline evidence.
  - Update evidence statuses.

- `growthFeatureEngine.ts`
  - Fetch growth profile.
  - Save growth profile.
  - Save growth reflections.
  - Fetch growth reflections.

- `growthTimelineEngine.ts`
  - Fetch daily lesson records.
  - Calculate growth stats.

- `intensiveReunificationEngine.ts`
  - Assess appointment load.
  - Identify challenge flags.
  - Evaluate contact progression.
  - Evaluate pre-return verification.
  - Build intensive reunification plan summary.
  - Build planning report language.

- `lessonSaveEngine.ts`
  - Save daily lesson records.

- `offlineEvidenceVault.ts`
  - Create evidence vault hashes.
  - Get offline vault items.
  - Queue offline evidence.
  - Verify offline evidence hash chain.
  - Remove offline evidence item.
  - Mark offline sync failed.
  - Get vault security status.

- `parentProfileEngine.ts`
  - Build parent profile payloads.
  - Hydrate profile domains.
  - Fetch parent profiles.
  - Save parent profiles.
  - Get case owner ID.

- `programEnrollmentEngine.ts`
  - Fetch my program enrollments.
  - Fetch active program enrollment.
  - Start program enrollment.

- `progressEngine.ts`
  - Calculate lesson completion.

- `recognitionSupportEngine.ts`
  - Build cultural-safety and accessibility support plans.
  - Identify recognition support gaps.

- `reflectionEngine.ts`
  - Monthly reflection questions.
  - Weekly reflection questions.
  - Lesson start questions.
  - Lesson end questions.
  - Reflection worksheet exports.

- `reflectionSaveEngine.ts`
  - Save reflection records.
  - Fetch reflection records.

- `reflectionStatusEngine.ts`
  - Check if reflection record exists.

- `saferAssessmentEngine.ts`
  - Classify SAFER evidence.
  - Classify SAFER evidence batches.
  - Compute SAFER evidence coverage.
  - Compute SAFER guided judgement.

- `safetyAlertEngine.ts`
  - Safety alert rules.
  - Evaluate safety alerts.

- `serviceReferralEngine.ts`
  - Calculate days since referral.
  - Detect overdue referrals.
  - Detect referrals needing review.
  - Evaluate referral alerts.
  - Create referral summaries.
  - Build referral evidence notes.
  - List case service referrals.
  - Create case service referrals.
  - Update referral status.

- `sessionManagementEngine.ts`
  - Generate session agendas.
  - Detect missed sessions.
  - Evaluate session alerts.
  - Schedule case sessions.
  - List case sessions.
  - Complete case sessions.

- `taskEngine.ts`
  - Build parent-challenge task input.
  - Fetch parent challenge task.
  - Fetch user tasks.
  - Create user task.
  - Create task from parent challenge.
  - Complete single user task.
  - Complete multiple user tasks.

- `visitContactEngine.ts`
  - Fetch visit/contact records.
  - Create visit/contact records.

## Platform Functions Built

- Data and content:
  - Get my role.
  - List programs.
  - List courses.
  - List lessons.
  - Get lesson.
  - List resources.
  - Save program.
  - Save course.
  - Save lesson.
  - Save resource.
  - Save reflection.
  - Save facilitator note.

- Progress:
  - Compute lesson locks.
  - Get progress for enrollment.
  - Mark lesson in progress.
  - Complete lesson and unlock next.
  - Get completed lesson IDs.
  - Complete lesson.

- Permissions:
  - Can manage platform content.
  - Can create facilitator notes.
  - Can view private facilitator notes.
  - Can view court reports.
  - Can parent see a note.
  - Assert content management permission.
  - Assert facilitator-note permission.

- Notifications:
  - Filter unread notifications.
  - Create reminders.
  - Create safety alert notifications.
  - List my notifications.
  - Mark one notification read.
  - Mark multiple notifications read.

- Certificates:
  - Find matching certificate.
  - Make certificate number.
  - Issue certificate.
  - List my certificates.

- Analytics:
  - Compare snapshot metrics.
  - Save review snapshot.
  - List review snapshots.
  - Build longitudinal comparison.

- Dashboard/report data:
  - Get dashboard counts.
  - Get report summary.
  - Get evidence system summary.

- Evidence and daily home evidence:
  - Get evidence.
  - Get daily home evidence status.
  - Get daily home evidence history.
  - Get daily home evidence task templates.
  - Create daily home evidence tasks.
  - Add evidence note.
  - Add daily home evidence.
  - Set evidence status.
  - Bulk set evidence status.
  - Bulk add evidence notes.
  - Upload evidence media.
  - Upload evidence image.

- Bulk setup:
  - Starter tasks exist.
  - Task bulk templates exist.
  - Evidence bulk templates exist.
  - SafeSteps bulk setup bundles exist.

## Document Intelligence Built

- Backend files:
  - `backend/server.js`
  - `backend/env.js`
  - `backend/routes/documents/documentRoutes.js`
  - `backend/Services/DocumentIntelligence/DocumentService.js`
  - 58 additional document-intelligence module files.

- Backend routes:
  - `GET /health`
  - `GET /documents/intelligence/schema`
  - `POST /documents/analyze`

- App/client files:
  - `lib/documentIntelligenceApi.ts`
  - `app/assessment-system/document-intelligence.tsx`
  - `SafeStepsTools/smoke-document-intelligence-api.mjs`
  - `__tests__/backend/document-intelligence-service.test.mjs`

- Document Intelligence functions and analysis areas:
  - Generate action plan.
  - Analyze attachment quality.
  - Analyze behaviour patterns.
  - Detect bias.
  - Analyze case complexity.
  - Analyze caseworker accountability.
  - Detect caseworker bias.
  - Analyze caseworker follow-through.
  - Detect caseworker omissions.
  - Analyze child safety indicators.
  - Extract child voice.
  - Analyze child wellbeing.
  - Analyze communication skill.
  - Classify concerns.
  - Analyze contact visits.
  - Detect contradictions.
  - Analyze crisis history.
  - Analyze cultural context.
  - Analyze developmental appropriateness.
  - Detect discrepancies.
  - Analyze document quality.
  - Analyze domestic violence patterns.
  - Analyze education stability.
  - Analyze emotional regulation support.
  - Analyze emotional state.
  - Analyze environmental risk.
  - Extract evidence.
  - Weight evidence.
  - Analyze fairness.
  - Analyze financial stress.
  - Analyze health needs.
  - Analyze home management.
  - Analyze housing stability.
  - Analyze learning engagement.
  - Generate legal summary.
  - Analyze mental health indicators.
  - Detect missing evidence.
  - Analyze parent advocacy.
  - Analyze parent capacity.
  - Analyze parent insight.
  - Analyze parent progress.
  - Generate parent summary.
  - Analyze parenting skill.
  - Analyze procedural fairness.
  - Analyze professional conduct.
  - Extract requirements.
  - Assess risk.
  - Analyze routine management.
  - Analyze safety plan quality.
  - Score safety risk.
  - Analyze service engagement.
  - Analyze social connection.
  - Extract strengths.
  - Analyze substance use patterns.
  - Analyze support network.
  - Analyze text.
  - Extract timeline.
  - Detect unrealistic expectations.

- Still needs work:
  - Production backend hosting.
  - Production `OPENAI_KEY` or `OPENAI_API_KEY`.
  - Production `EXPO_PUBLIC_DOCUMENT_INTELLIGENCE_API_URL`.
  - Reviewer approval workflow for AI outputs before report inclusion.
  - Audit log that records who accepted/rejected document-intelligence findings.

## Parent Challenges Built

- Source:
  - `lib/data/safestepsParentChallenges.ts`

- Total:
  - 104 parent challenges.

- Categories:
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

- Every challenge includes:
  - ID.
  - Title.
  - Display title.
  - Category.
  - Challenge type.
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

- Challenge features built:
  - Challenge list route.
  - Challenge detail route.
  - Challenge recommendation tests.
  - Parent challenge task creation.
  - Challenge completion can connect into task completion.

- Still needs work:
  - Decide whether challenges should be assigned by program stage, assessment need, user choice, or worker selection.
  - Add challenge completion evidence review.
  - Add challenge progress analytics by category.

## Tasks Built

- Task sources:
  - `lib/engines/taskEngine.ts`
  - `lib/platformData.ts`

- Task capabilities:
  - Fetch tasks.
  - Create tasks.
  - Create tasks from parent challenges.
  - Complete tasks.
  - Complete multiple tasks.
  - Set task status.
  - Bulk set task status.
  - Bulk add tasks.
  - Starter tasks.
  - Task bulk templates.
  - Daily home evidence task templates.

- Task surfaces:
  - Parent tasks route.
  - Child tasks route.
  - Bulk setup route.
  - Program week bulk setup route support.

- Still needs work:
  - Stronger task assignment workflow for workers/facilitators.
  - Task due-date calendar view.
  - Escalation rules for missed safety-critical tasks.
  - Clear task-to-evidence linking in reports.

## Games Built

- Game content:
  - 120 game JSON files in `curriculum/games`.
  - Example game fields:
    - ID.
    - Title.
    - Category.
    - Minimum players.
    - Maximum players.
    - Recommended modes.
    - Duration.

- Game route:
  - `/games/multiplayer/[gameId]`

- Game engine modules:
  - Advanced gameplay features.
  - Child safety enforcer.
  - Child safety filter.
  - Component map.
  - Evidence client.
  - Evidence export.
  - Evidence model.
  - Final safety.
  - Game calendar.
  - Game engine.
  - Game logic.
  - Game registry.
  - Game socket client.
  - Privacy manager.
  - Record game action.
  - Record reflection.
  - Record turn action.
  - Room visibility.
  - Session summary.
  - Turn engine.

- Game UI modules:
  - Family game calendar.
  - Game card.
  - Co-play mode.
  - Family lobby.
  - Lobby screen.
  - Emotion thermometer.
  - Worker session overlay.
  - Turn indicator.
  - Turn manager.

- Still needs work:
  - Production multiplayer backend/session hosting verification.
  - Child safety review of every game mode.
  - Worker visibility settings.
  - Evidence export approval rules.
  - Clear game-to-skill mapping in the parent/child curriculum.

## Parent-Child Section Built

- Source:
  - `lib/parentChild/parentChildService.ts`
  - `lib/parentChild/components.tsx`

- Data types:
  - Child shared item.
  - Child request.
  - Child request response.
  - Parent-child message.
  - Parent-child overview.

- Functions:
  - Get parent-child shared items.
  - Get parent-child requests.
  - Get parent-child messages.
  - Get parent-child overview.
  - Mark child request status.
  - Get child request responses.
  - Create child request response.
  - Create parent-child message.
  - Update parent-child message monitoring.

- UI components:
  - Parent-child shell.
  - Parent-child card.
  - Parent-child metric.
  - Parent-child action row.
  - Parent-child button.
  - Back to parent-child home.
  - Empty state.
  - Error state.

- Still needs work:
  - Human review and moderation workflow for sensitive parent-child communication.
  - Better case-specific permissions.
  - Clear audit history for shared items and messages.

## Child Section Built

- Child source files:
  - `lib/child/childData.ts`
  - `lib/child/childService.ts`
  - `lib/child/components.tsx`

- Child features:
  - Child home.
  - Achievements.
  - Check-in.
  - Curriculum.
  - Evidence.
  - Lessons.
  - My story.
  - Notifications.
  - Requests.
  - Safe people.
  - Safety rules.
  - Shared log.
  - Sharing.
  - Tasks.
  - Visit preparation.
  - Visit reflection.

- Still needs work:
  - Stronger age-specific child experience review.
  - Guardian/worker visibility settings.
  - Clear consent model for child-entered material.
  - Child safety content review before public launch.

## Evidence, Documents, Sessions, Referrals Built

- Evidence:
  - Evidence upload.
  - Evidence media upload.
  - Evidence notes.
  - Daily home evidence.
  - Offline evidence fallback.
  - Offline vault hashing.
  - Vault chain verification.
  - Evidence status updates.
  - Evidence bulk templates.

- Documents:
  - Production empty state screen.
  - Document management engine.
  - Document requests.
  - Document versions.
  - Document expiry alerts.
  - Document Intelligence link.

- Sessions:
  - Production empty state screen.
  - Agenda generator.
  - Session scheduling engine.
  - Session listing.
  - Session completion.
  - Missed-session detection.
  - Session alerts.

- Referrals:
  - Production empty state screen.
  - Referral review checklist.
  - Referral listing.
  - Referral creation.
  - Referral status updates.
  - Overdue referral logic.
  - Needs-review logic.
  - Referral evidence note builder.

- Still needs work:
  - Production document upload and storage policies verified against live Supabase.
  - Attachment review and sealing workflow.
  - Case-level audit logs for document/session/referral changes.
  - User-facing export pack for reports and evidence.

## Reports Built

- Report sources:
  - `lib/engines/courtReportBuilderEngine.ts`
  - `app/reports/index.tsx`
  - `app/reports/longitudinal.tsx`
  - `app/assessment-system/report-output.tsx`

- Report capabilities:
  - Build report sections.
  - Include evidence records.
  - Include contradictions.
  - Include collateral.
  - Include case summary.
  - Generate assessment output language.
  - Generate child capacity report language.
  - Generate intensive reunification planning language.
  - Generate referral evidence notes.
  - Build longitudinal comparisons.

- Still needs work:
  - Report approval workflow.
  - Final report export format.
  - Immutable report versions.
  - Reviewer signature/attestation.
  - Clear separation between AI-assisted notes and human-approved report text.

## Safety, Permissions, and Alerts Built

- Safety alert engine:
  - Alert audience types.
  - Alert severity types.
  - Alert rule definitions.
  - Safety alert signal evaluation.

- Child safety modules:
  - Child safety banner.
  - Child safety filter UI.
  - Child safety toggle.
  - Game child safety enforcer.
  - Game child safety filter.
  - Voice safety check.

- Permissions:
  - Admin/content permissions.
  - Facilitator note permissions.
  - Court report visibility permissions.
  - Parent note visibility rules.

- Voice:
  - Voice engine types.
  - Voice signaling client.
  - Voice chat controls.
  - Voice safety review mode.

- Weapon-risk evaluator:
  - Backend weapon risk evaluator exists under `backend/security/weapon_risk`.

- Still needs work:
  - Full role-based route guard enforcement.
  - Case membership enforcement.
  - Live audit logs for sensitive views/actions.
  - Production review of child safety/voice/game systems before enabling for real families.

## Recognition, Cultural Safety, and Accessibility Built

- Recognition support engine:
  - Cultural safety input.
  - Accessibility input.
  - Recognition support plan input.
  - Recognition support gaps.
  - Recognition support plan builder.

- SAFER engine:
  - Information categories.
  - Judgement dimensions.
  - Specialist flags.
  - Review states.
  - Evidence source types.
  - Evidence classification.
  - Evidence coverage.
  - Guided judgement.

- Still needs work:
  - Make these visible in the workflows where practitioners actually need them.
  - Add prompts that prevent users from treating decision support as automatic conclusions.
  - Add jurisdiction-specific wording controls if SafeSteps expands outside the current context.

## Admin, Bulk Setup, Resources, Certificates Built

- Admin:
  - Admin index route.
  - Admin content route.
  - Platform data save functions for programs, courses, lessons, resources, reflections, and facilitator notes.

- Bulk setup:
  - Bulk setup route.
  - Starter tasks.
  - Task templates.
  - Evidence templates.
  - Program week bulk plan.
  - Bulk setup bundles.

- Resources:
  - Resources route.
  - SafeSteps resources data.
  - List resources.
  - Save resources.

- Certificates:
  - Certificates route.
  - Certificate matching.
  - Certificate number generation.
  - Certificate issuing.
  - Certificate listing.

- Still needs work:
  - Proper admin role guard coverage.
  - Publishing workflow.
  - Content approval workflow.
  - Certificate verification page or QR/code validation if required.

## Test Coverage Built

- Current test files include coverage for:
  - Assessment scoring.
  - Backend document intelligence service.
  - Bulk selection.
  - Certificates.
  - Challenge recommendations.
  - Child development capacity assessment.
  - Courses.
  - Court report builder.
  - Curriculum boundary.
  - Document management engine.
  - Family meeting prompt engine.
  - Intensive reunification support.
  - Lesson flow.
  - Notifications.
  - Offline evidence vault.
  - OneDrive lesson libraries.
  - Parent profile engine.
  - Platform permissions.
  - Program curation.
  - Program pathways.
  - Progress locking.
  - Progress metadata.
  - Recognition support engine.
  - Relationship migration.
  - Reunification assessment instrument.
  - SAFER assessment engine.
  - SafeSteps game final modules.
  - SafeSteps lesson curriculum.
  - Safety alert engine.
  - Service referral engine.
  - Session management engine.
  - Task engine.
  - Uploaded practice content.
  - Video-series pipeline.
  - Weapon-risk evaluator.

- Still needs work:
  - End-to-end user flow testing.
  - Device testing.
  - Real Supabase migration verification.
  - Backend deployment smoke tests.
  - Role-based access tests across sensitive routes.

## Best Next Additions

- Highest priority:
  - Production environment setup.
  - Supabase production verification.
  - Backend hosting for Document Intelligence.
  - Role-based route guards.
  - Case membership checks.
  - Intake gate before program start.

- Next product priority:
  - Evidence attachment review and report export pack.
  - Report approval/sign-off workflow.
  - Worker assignment of tasks/challenges.
  - Challenge-to-evidence analytics.
  - Parent-child message moderation and audit history.

- Next curriculum priority:
  - Decide what to expose from the 688 lesson JSON files.
  - Add content QA/publishing workflow.
  - Map games and challenges to course/program stages.
  - Add admin tools for safe curriculum expansion.

- Next child-safety priority:
  - Review every child-facing route.
  - Add child consent and visibility rules.
  - Add worker/guardian review flows.
  - Add safety settings for games, voice, sharing, and messaging.

