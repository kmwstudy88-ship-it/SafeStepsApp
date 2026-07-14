# SafeSteps Assessment Data Model and Scoring Engine

Last updated: 2026-07-13

SafeSteps uses assessments as structured decision support for parenting capacity, child safety, and reunification planning. The system must not treat one number as a reunification decision.

## Data Model

The main Supabase data model is in:

```text
supabase/migrations/20260701225859_assessment_data_model.sql
```

It covers:

- Reunification cases
- Assessment instruments, domains, items, response options, scoring bands, and critical overrides
- Assessment records, responses, domain scores, and final scores
- Contradictions and collateral information
- Service referrals, safety plans, court hearings, progress notes, visitations, milestones, and readiness indices
- RLS policies using owner/parent/worker access and assessment manager roles

## Scoring Engine

The TypeScript engine is in:

```text
lib/engines/assessmentScoringEngine.ts
```

It supports:

- Weighted item scoring
- Domain scoring
- Overall assessment scoring
- Scoring bands
- Critical-item overrides
- Supervisor-review flags
- Domain trend comparison
- Reunification readiness support calculation

Critical overrides deliberately prevent serious active safety findings from being averaged away by strengths in other domains.

## SafeSteps Instrument

The current SafeSteps protective-capacity instrument is in:

```text
lib/data/safeStepsAssessmentInstrument.ts
```

Domains:

- Child Safety
- Protective Capacity
- Parenting Routines
- Service Engagement
- Child Voice and Wellbeing
- Evidence Consistency

Critical examples:

- Active unmanaged safety concern
- Unmanaged AOD concern

## App Screens

Primary screens:

- `app/assessment-system/scoring.tsx`
- `app/assessment-system/readiness-index.tsx`
- `app/assessment-system/evidence-uploads.tsx`
- `app/assessment-system/case-setup.tsx`
- `app/assessment-system/records.tsx`

The scoring and readiness screens now use the real engine rather than placeholder averages or checkbox-only scoring.

## Safety Framing

The readiness index is decision support only. Supervisor and case-team review remain required before any reunification-level change.
