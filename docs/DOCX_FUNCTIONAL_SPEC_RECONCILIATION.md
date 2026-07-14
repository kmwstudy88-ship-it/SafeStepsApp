# SafeSteps DOCX Functional Spec Reconciliation

Last checked: 2026-07-13

Source documents:

- `C:\Users\SAFES\Downloads\SafeSteps_CompleteCourseLibrary.docx`
- `C:\Users\SAFES\Downloads\SafeSteps_Master_Functional_Specification.docx`

Extracted working text:

- `docs/_docx_extracts/course-library.txt`
- `docs/_docx_extracts/functional-spec.txt`

## Course Library Status

The DOCX lists 12 SafeSteps courses and 171 lessons:

1. Understanding Your Nervous System
2. Breaking the Cycle - Intergenerational Trauma
3. Your Child's Brain - What They Need From You
4. Emotional Literacy
5. Healthy Relationships
6. Financial Literacy and Life Skills
7. Co-Parenting After Separation
8. Seeing Through Your Child's Eyes
9. Self-Compassion and Shame Resilience
10. Executive Functioning in Family Life
11. Digital Safety for Families
12. Building Your Village

Repo status:

- These 12 courses already exist in `curriculum/courses/completeCourseLibrary.ts`.
- `curriculum/courses/courses.ts` imports `completeCourseLibrary` into the active exported `courses` array.
- The course UI and Prisma curriculum API work already done can surface these courses through the current course/library screens.

Important note:

- The extracted DOCX text includes full detailed lesson content for the early course sections and an opening table for all 12 courses. The repo's `completeCourseLibrary.ts` is currently the richer app-ready source for the full 12-course library.

## Functional Spec Modules

The functional specification defines 21 major modules:

1. Authentication and User Management
2. Parent Portal
3. Child Portal
4. Support Worker Hub
5. Child Protection Portal
6. Admin Console
7. Foster/Kinship Carer Portal
8. Independent Advocate Access
9. Assessment and Scoring Engine
10. Program and Phase Engine
11. Visit and Contact Logistics
12. Legal and Court Timeline Integration
13. Multi-Agency Information Sharing
14. Relapse / Crisis Re-Entry Pathway
15. Evidence Report Generator
16. Predictive Risk and Trend Analysis
17. Bias and Equity Auditing
18. Family Strengths Repository
19. Notifications and Escalation
20. Data, Security and Compliance
21. Non-Functional Requirements

## Current Coverage

Substantial coverage already exists:

- Authentication: `lib/auth.ts`, auth routing, login/register/welcome flow.
- Parent portal basics: dashboard, programs, lessons, tasks, evidence, check-in, progress, reports.
- Child portal basics: `app/child/*`, child privacy, child lessons, child visit preparation/reflection, child evidence.
- Support/facilitator surfaces: `app/facilitator/index.tsx`, assessment system, reports, progress, evidence.
- Assessment and scoring: `app/assessment-system/*`, `lib/engines/assessmentScoringEngine.ts`, `lib/data/safeStepsAssessmentInstrument.ts`, Supabase assessment migrations.
- Course and lesson delivery: `curriculum/courses/*`, `app/courses/*`, `app/lessons/*`, themed lesson screens.
- Evidence: main evidence uploads, daily evidence, assessment evidence uploads, offline vault.
- Tasks: task engine, task screen, parent challenge tasks, bulk setup.
- Visit and contact logistics: `app/visits/index.tsx` records contact date, contact type, quality score, incident count and factual summary to the existing `case_visitations` assessment table through `lib/engines/visitContactEngine.ts`.
- Notifications: `app/notifications/index.tsx`, `lib/platform/notifications.ts`.
- Reports/progress/timeline: `app/reports`, `app/progress`, `app/timeline`.
- Data/security foundation: Supabase RLS migrations, storage policies, evidence bucket, assessment model.

## Priority Gaps

These are the highest-value gaps from the functional spec:

1. Role-specific portals and access rules
   - Child Protection Portal
   - Foster/Kinship Carer Portal
   - Independent Advocate access
   - Admin Console user/role management

2. Visit and contact logistics
   - Contact visit scheduling
   - Parent/worker/carer/child calendar coordination
   - Handover logs
   - Pre/post contact checks
   - Incident flags

3. Legal and court timeline
   - Court date tracker
   - Report deadline alerts
   - Locked evidence snapshots as at court date
   - Legal guardian/lawyer read-only access tier

4. Multi-agency sharing
   - Consent-tracked sharing log
   - Structured exports for police, health, education and linked agencies
   - Explicit authority/consent metadata

5. Relapse / crisis re-entry
   - Re-entry workflow for families returning after closure
   - Linked historical case records
   - Lighter-touch reassessment pathway

6. Evidence report generator hardening
   - Locked PDF/report snapshot
   - Report generation audit record
   - Baseline vs current scoring graphs
   - Contradiction/collateral/strengths sections

7. Bias and equity auditing
   - Aggregate de-identified fairness review
   - No individual score auto-adjustment
   - Admin-only rubric review workflow

8. Audit logging and admin visibility
   - Sensitive data access logs
   - Admin audit log viewer
   - User role/permission change history

## Recommended Next Build Order

1. Add role portal scaffolds for Child Protection, Carer, Advocate and Admin.
2. Add court timeline and locked evidence snapshot model.
3. Add audit log tables/functions for sensitive read/write events.
4. Add report snapshot generation using current evidence, scoring, tasks, and progress.
5. Extend visit/contact logistics with shared calendar coordination, pre/post checks, and handover-specific prompts.

This order lines up with the spec while protecting the most sensitive legal/evidence workflows first.
