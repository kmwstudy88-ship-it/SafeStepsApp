# Assessment Tools Implementation Reconciliation

Source reviewed: `SafeSteps_AssessmentTools_PowerShell_Implementation (1).docx`

The source document provides a useful assessment-module blueprint, but it is written for a Firebase/Firestore project with `src/screens` navigation. The current SafeSteps app uses Expo SDK 56, Expo Router, Supabase Auth, Supabase Postgres, and Supabase Storage. This document translates the blueprint into the current app architecture.

## Do Not Apply Literally

Do not run the document's PowerShell scaffold directly in this repo because it would create parallel folders and a second backend model:

- `src/screens/...` conflicts with this repo's Expo Router `app/...` structure.
- `firebase/functions/...` conflicts with the current Supabase backend.
- `firebase/firestore/...` conflicts with Supabase migrations and RLS.
- `src/navigation/AssessmentNavigator.js` is not needed because Expo Router owns navigation.
- Firebase deploy commands are not relevant to this repo.

## Useful Concepts To Keep

The document's useful implementation concepts are:

- Parent profile and program status schema
- Intake assessment schema
- Domain scoring schema
- Anti-gaming and contradiction schema
- Phase-specific tool lists
- Automated score computation
- Contradiction/regression detection
- Longitudinal progress report generation
- Assessment screens
- Report screens
- Verification checklist

## Supabase Schema Translation

### Parent Program Status

Use a Supabase table instead of `safesteps_parents`.

Suggested table: `reunification_cases`

Fields:

- `id`
- `owner_id`
- `case_number`
- `assigned_worker_id`
- `program_start_date`
- `program_phase`
- `status`
- `intake_complete`
- `consent_signed`
- `consent_date`
- `informed_of`
- `baseline_complete`
- `overall_progress_score`
- `last_updated`

### Intake Assessment

Suggested table: `assessment_intakes`

Fields:

- `id`
- `case_id`
- `parent_id`
- `worker_id`
- `completed_at`
- `tools`
- `baseline_narrative`
- `primary_concerns`
- `protective_factors`
- `worker_recommendations`

Use JSONB for licensed-tool summaries, not copied test items or restricted scoring logic.

### Domain Scoring

Suggested table: `assessment_domain_scores`

Fields:

- `id`
- `case_id`
- `parent_id`
- `worker_id`
- `phase`
- `assessment_date`
- `session_id`
- `domains`
- `computed_domain_scores`
- `overall_session_score`
- `overall_narrative`
- `flagged_for_review`
- `supervisor_reviewed`

The `domains` JSONB shape should include:

- protective capacity
- insight and accountability
- emotional regulation
- parenting knowledge and skills
- environmental stability
- engagement
- anti-gaming indicators

### Contradiction Log

Suggested table: `assessment_contradictions`

Fields:

- `id`
- `case_id`
- `parent_id`
- `worker_id`
- `detected_at`
- `session_id`
- `phase`
- `contradiction_type`
- `description`
- `source_a`
- `source_b`
- `severity`
- `include_in_report`
- `supervisor_notified`
- `worker_notes`
- `resolved_at`

### Collateral Reports

Suggested table: `assessment_collaterals`

Fields:

- `id`
- `case_id`
- `parent_id`
- `worker_id`
- `source_name`
- `source_role`
- `received_at`
- `consent_or_authority`
- `summary`
- `alignment_with_self_report`
- `risk_notes`
- `protective_notes`
- `attachment_path`

### Longitudinal Reports

Suggested table: `assessment_reports`

Fields:

- `id`
- `case_id`
- `parent_id`
- `generated_by`
- `generated_at`
- `report_type`
- `status`
- `baseline_overall_score`
- `exit_overall_score`
- `score_change`
- `domain_trajectory`
- `high_severity_contradictions`
- `collateral_alignment_summary`
- `recommendation`
- `report_file_path`

## Phase Tool Register

### Phase 1: Weeks 1-4

- PHQ-9
- GAD-7
- PSI-4
- CAPI
- Worker Session Rubric
- Contradiction Log

### Phase 2: Weeks 5-10

- DPICS
- Emotional Availability Scales
- CARE-Index
- NCFAS-G
- Collateral contacts
- Home visit observation checklist

### Phase 3: Weeks 11-16

- NCFAS-G re-administration
- Structured scenario-based interview
- Short-notice or unannounced home visit observation where lawful and policy-approved
- AUDIT re-administration
- DAST-10 re-administration
- Change generalisation checklist

### Exit: Weeks 17-18

- Forensic Parenting Capacity Assessment
- PAI re-administration where clinically appropriate
- AAPI-2 re-administration
- SDM risk re-assessment
- Longitudinal evidence report
- Contradiction and consistency analysis
- Collateral evidence compilation

## App Screen Translation

Use Expo Router paths instead of `src/screens`.

Suggested routes:

- `app/assessments/index.tsx`
- `app/assessments/intake.tsx`
- `app/assessments/domain-scoring.tsx`
- `app/assessments/phase/[phase].tsx`
- `app/assessments/contradictions.tsx`
- `app/assessments/collaterals.tsx`
- `app/assessments/reports.tsx`
- `app/assessments/report/[reportId].tsx`

Suggested components:

- `components/assessments/AssessmentToolCard.tsx`
- `components/assessments/DomainScoreEditor.tsx`
- `components/assessments/RubricAnchorTable.tsx`
- `components/assessments/ContradictionForm.tsx`
- `components/assessments/CollateralForm.tsx`
- `components/assessments/TrajectorySummary.tsx`

## Scoring Logic Translation

The Firebase function `calculateAssessmentScore` should become one of:

- a pure TypeScript scoring engine in `lib/engines/assessmentScoringEngine.ts`
- a Supabase database function
- a Supabase Edge Function if server-only processing is required

Recommended first step: pure TypeScript engine with tests.

Functions:

- `calculateDomainScore(domainIndicators)`
- `calculateOverallAssessmentScore(domains)`
- `flagScoreRegression(previousScores, currentScore)`
- `summarizeDomainTrajectory(records)`

## Contradiction Detection Translation

The Firebase trigger should become a worker-facing SafeSteps process first:

1. Save assessment score.
2. Fetch previous scores for the same case.
3. Flag score drops greater than configured threshold.
4. Let worker confirm whether the flag is meaningful.
5. Store confirmed contradiction or regression in `assessment_contradictions`.

Do not auto-label a parent as deceptive. Use neutral language:

- inconsistency
- contradiction requiring review
- regression
- mismatch between self-report and observed behaviour
- collateral mismatch

## Build Order For This Repo

1. Add pure scoring engine and tests.
2. Add Supabase migration for assessment tables.
3. Add TypeScript data model for phase tool register.
4. Add assessment index and read-only phase screens.
5. Add domain scoring form.
6. Add contradiction log form.
7. Add collateral report form.
8. Add longitudinal report summary screen.
9. Add report-generation engine.
10. Tighten RLS and role-based visibility.

## Verification Checklist

- Assessment scoring engine has unit tests.
- Supabase migration applies locally/remotely.
- Assessment routes load without TypeScript errors.
- RLS prevents parents from viewing worker-only notes and forensic summaries.
- Restricted tools are metadata-only unless licence and assessor workflow are confirmed.
- Report output cites evidence sources and limits.
- No Firebase folders or Firestore deploy scripts are introduced into this repo.

