# Master Build Document Reconciliation

Source reviewed: `ReunificationProgram_MasterBuildDocument.docx`

This document reconciles the external master build guide with the current SafeSteps app. The Word document is written as a new Firebase/Firestore project scaffold. SafeSteps is already an Expo SDK 56 app using Supabase, so the useful parts should be translated into the current stack rather than copied literally.

## Current SafeSteps Stack

| Area | Current SafeSteps state |
| --- | --- |
| Mobile app | Expo SDK 56 / React Native |
| Routing | Expo Router |
| Backend | Supabase |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| Storage/evidence | Supabase-backed evidence flows already started |
| Course data | Standalone course library in TypeScript data files |
| Testing | Jest, TypeScript, Expo lint |

## Master Document Stack Assumptions

| Area | Master document assumption | SafeSteps decision |
| --- | --- | --- |
| Expo version | SDK 51+ | Keep SDK 56; do not downgrade |
| Backend | Firebase / Firestore | Translate data models to Supabase tables and policies |
| Auth | Firebase Auth | Keep Supabase Auth |
| Storage | Firebase Storage | Use Supabase Storage/evidence tables |
| Server functions | Firebase Functions | Use Supabase Edge Functions or app/server routes where needed |
| Real-time dashboards | Firestore live dashboard | Use Supabase queries/realtime if needed |
| Setup scripts | New project scaffold in `C:\ReunificationProgram` | Do not create a separate app; integrate into `SafeStepsApp` |

## Already Added To SafeSteps

| Master area | SafeSteps status |
| --- | --- |
| Curriculum/course library | Added 12-course, 171-lesson complete course library |
| Existing standalone courses | 20 additional SafeSteps courses already present |
| Course inventory | Added `docs/COURSE_LIBRARY_INVENTORY.md` |
| Reunification assessment battery | Added `docs/REUNIFICATION_ASSESSMENT_BATTERY.md` |
| Financial evidence framework | Added `docs/FINANCIAL_STABILITY_EVIDENCE_FRAMEWORK.md` |
| Daily photo/video framework | Added `docs/DAILY_PHOTO_VIDEO_CHECKIN_FRAMEWORK.md` |
| Basic evidence engine | Existing `lib/engines/evidenceEngine.ts` |
| Daily evidence screen | Existing `app/daily-evidence.tsx` |
| Certificates | Existing certificate flow for program and standalone course completion |

## Master Document Components To Build In SafeSteps

### 1. Assessment Data Model

Translate Firestore `assessments` into Supabase tables:

- `assessment_tools`
- `assessment_events`
- `assessment_scores`
- `assessment_reports`
- `assessment_attachments`

Required fields:

- tool name and version
- assessment tier
- phase
- administrator
- administrator qualification
- platform used
- date administered
- score summary
- risk level
- recommendations
- report file path
- sharing restrictions

### 2. Program Phase Tracking

Add a structured 18-week reunification phase model:

- Pre-entry: Week 0
- Phase 1: Weeks 1-4, engagement and foundation
- Phase 2: Weeks 5-10, skill building and deep assessment
- Phase 3: Weeks 11-16, integration and generalisation
- Phase 4: Weeks 17-18, exit assessment and court-ready report

### 3. Rubric Scoring Tables

Build SafeSteps-native scoring for:

- protective capacity
- insight and accountability
- engagement and motivation
- emotional regulation
- parenting knowledge and skills
- environmental safety and stability
- risk factor reduction
- anti-gaming indicators

Each score uses the 1-4 anchored rubric.

### 4. Contradiction Log

Translate Firestore `contradictions` into Supabase:

- parent statement
- source of statement
- conflicting evidence
- contradiction type
- severity
- phase/week
- worker note
- follow-up action
- resolved/unresolved status

### 5. Daily Check-In Scoring

Extend the existing daily evidence work with:

- kitchen score
- bathroom score
- child room score
- living area score
- outdoor area score
- entry/exit score
- personal hygiene score
- worker review status
- GPS metadata if lawful and policy-approved
- random/varied submission windows if policy-approved
- continuous walkthrough video option

### 6. Financial Evidence Scoring

Build monthly/weekly financial evidence tracking for:

- rent/mortgage
- electricity
- gas
- water
- phone/internet
- food shopping
- child-specific purchases
- income/Centrelink
- budget plans
- debt support
- financial counselling

### 7. Collateral Reports

Translate Firestore `collaterals` into Supabase:

- source name
- role/service
- date received
- consent/legal basis
- summary
- alignment with parent self-report
- risk/protective notes
- attachment path

### 8. Session Recording and Transcription

Master document proposes Expo AV, Firebase Storage, and transcription. SafeSteps translation:

- use Expo-compatible recording only after consent/legal review
- store recording metadata and file path
- use approved transcription service only if privacy obligations permit
- add transcript review before using AI analysis
- never auto-generate forensic conclusions without professional review

### 9. Court-Ready Evidence Report

Build report sections:

1. Executive summary
2. Parent and child profile
3. Baseline assessment
4. Phase-by-phase progress
5. Longitudinal score graph
6. Daily check-in analysis
7. Financial stability analysis
8. Session themes or transcript review
9. Contradiction and consistency analysis
10. Collateral evidence
11. Parent-child interaction evidence
12. Anti-gaming analysis
13. Risk indicators remaining
14. Protective capacities demonstrated
15. Recommendation and evidence basis
16. Limits of report

## Tool Register From Master Document

| Tool | Phase | Administered by | SafeSteps role |
| --- | --- | --- | --- |
| PAI | Pre-entry | Psychologist | Store external report and summary |
| MCMI-IV | Pre-entry | Psychologist | Store external report and summary |
| AAI | Pre-entry | Psychologist or trained interviewer | Store attachment formulation/report |
| ACE structured interview | Pre-entry | Worker or psychologist | Store structured history summary |
| TSI-2 | Pre-entry | Psychologist/clinician | Store external report and summary |
| WAIS-IV | Pre-entry | Psychologist | Store external report and functional implications |
| SDM | Pre-entry and exit | Worker under agency policy | Store risk/safety score summary |
| AAPI-2 | Pre-entry and exit | Worker or licensed platform rules | Store score summary |
| PSI-4 | Phase 1 | Worker or licensed platform rules | Store score summary |
| PHQ-9 | Phase 1 and Phase 3 | Worker within policy | Can be app-native if policy-approved |
| GAD-7 | Phase 1 and Phase 3 | Worker within policy | Can be app-native if policy-approved |
| AUDIT | All phases | Worker within policy | Can be app-native if using authorised version |
| DAST-10 | All phases | Worker within policy | Can be app-native if using authorised version |
| NCFAS-G | Phase 2 and exit | Worker under licence/policy | Store licensed score summary |
| DPICS | Phase 2 | Trained observer | Store coded observation summary |
| EAS | Phase 2 | Trained observer | Store coded observation summary |
| CARE-Index | Phase 2 | Trained observer | Store coded observation summary |
| CAPI | Phase 1 and exit | Licensed/scored process | Store external report and summary |
| PCA | Exit | Forensic psychologist | Store forensic report and recommendations |

## Recommended Build Order

1. Supabase assessment schema migration
2. Assessment tool register data file
3. Worker assessment entry screen
4. Rubric scoring screen
5. Daily check-in worker scoring extension
6. Financial evidence tracking extension
7. Contradiction log
8. Collateral reports module
9. Longitudinal evidence report generator
10. Role-based access tightening

## Important Governance Notes

- Do not copy restricted test items, manuals, scoring keys, or interpretive algorithms into SafeSteps.
- Store licensed-tool results as external professional evidence unless SafeSteps has the required licence and qualified assessor workflow.
- GPS, video, audio, and transcript collection require clear consent/legal authority, retention rules, access controls, and safeguarding policy.
- Court-ready reports should identify evidence sources and limits. The app can assemble evidence, but professional conclusions should be reviewed by qualified staff.

