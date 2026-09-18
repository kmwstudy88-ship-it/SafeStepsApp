# SafeStepsApp

SafeSteps is a mixed repository with three active concerns:

1. an Expo Router mobile app prototype in `app/` and `lib/`
2. a canonical curriculum/content library in root content folders
3. backend and Supabase delivery/security tooling in `backend/`, `supabase/`, and `tools/`

## Baseline app commands

- `npm install`
- `npm run start`
- `npm run backend`
- `npm run smoke:documents`
- `npm run validate`
- `npm run content:index`
- `npm run readiness` *(requires staging evidence environment variables)*

## Repository contract

### What this repo is

This repo is **both** a runnable app baseline and a content/backend repository. The app is currently a prototype shell around static or device-local features, while the content and Supabase layers carry most of the long-term product surface area.

### Canonical content source of truth

Hand-edited source content lives here:

- `lessons/` — canonical long-form parent/caregiver lesson content
- `modules/` — canonical practitioner/training modules
- `topics/` — canonical topic taxonomy and topic-to-module mapping stubs
- `storybooks/` — canonical storybook source assets and briefs

Compatibility and generated areas live here:

- `src/safesteps/` — compatibility exports and machine-readable indices for runtime/tooling use
- `src/safesteps/imports/` — generated imports produced by `tools/import-curriculum-source.js`
- `snapshots/`, `stage1/`, `proof-of-change/`, `sequence-knowledge/` — supporting or historical material, not the primary edit targets for curriculum changes

## App route audit

| Route | Backing screen | Current state | Data/backend dependency |
| --- | --- | --- | --- |
| `/` | `app/index.tsx` | navigation hub | none |
| `/scenarios` | `lib/scenarios/ScenarioSimulatorScreen.tsx` | local scenario prototype | none |
| `/storybooks` | `lib/storybooks/StorybookReaderScreen.tsx` | sample storybook content | none |
| `/assessments` | `lib/assessments/AssessmentRunnerScreen.tsx` | local scoring flow | none |
| `/evidence` | `lib/evidence/EvidenceVaultScreen.tsx` | device-local evidence prototype | none |
| `/reports` | `lib/reports/ReportGeneratorScreen.tsx` | local PDF generation | none |
| `/voice-coach` | `lib/voice/VoiceCalmingCoach.tsx` | device-local breathing tool | none |
| `/sos` | `lib/support/SOSQuickRelieverScreen.tsx` | static support scripts | none |
| `/fairness` | `lib/fairness/DocumentFairnessViewerScreen.tsx` | live fairness analyzer UI | Node API fairness endpoint |
| `/cases` | `app/cases/index.tsx` | authenticated case list | Supabase auth, case assignments, realtime |
| `/cases/[id]` | `app/cases/[id].tsx` | case detail + analysis status | Supabase cases/documents/analyses |
| `/documents/[id]` | `app/documents/[id].tsx` | document upload + processing | `expo-document-picker` + Node analysis API |
| `/contact-visit` | `lib/contactVisit/ContactVisitCompanionScreen.tsx` | static guidance UI | none |
| `/discreet` | `lib/privacy/DiscreetModeScreen.tsx` | device-local disguise prototype | none |

## Backend boundary

### Node backend

`backend/server.js` owns the lightweight local document endpoints:

- `GET /health`
- `GET /ready`
- `GET /documents/intelligence/schema`
- `POST /documents/text`
- `POST /documents/analyze`
- `POST /documents/analyze/fairness`
- `POST /documents/upload`
- `GET /documents/:id`
- `POST /documents/compare`
- `GET /documents/comparisons/:id`
- `POST /cases/:id/events`
- `POST /cases/:id/recompute-risk`
- `GET /cases/:id/risk-history`
- `GET /dashboard/supervisor`

Use this backend for local smoke testing and heuristic document-analysis development.

### Supabase

`supabase/` is the authoritative data/security layer for:

- authenticated case, evidence, and report-delivery workflows
- row-level security and audit controls
- migration history and schema tests
- edge functions such as private report delivery

Use Supabase for real data contracts and audited report access, not the local Node prototype server.

## Track C: risk assessment & case updates

Track C adds a deterministic safety-support workflow for case events, risk snapshots, escalation alerts, follow-up tasks, and supervisor monitoring.

### Risk scoring logic

- Inputs: structured `behavioral_cues`, `contextual_factors`, `protective_factors`, `doc_signals`, and `hard_flags` on case events
- Engine: weighted deterministic rules in `backend/case-risk/rules.js`
- Output: normalized `score` (0-100), `tier` (`low`, `moderate`, `high`, `critical`), `confidence`, factor breakdown, rationale, and `model_version`
- Trend boosts: repeated acute events in 7 days, repeated events in 30 days, repeated same signal, and multiple document-derived signals
- Hard escalation: `child_immediate_danger`, `credible_threat_to_life`, `weapon_access`, `missing_child`, and `suicidal_statement` force critical workflow regardless of score threshold

### Backend endpoints

- `POST /cases/:id/events` — persist a case event/note, recompute risk, create snapshot, evaluate alerts, and create/update follow-up tasks
- `POST /cases/:id/recompute-risk` — recompute and persist a new immutable risk snapshot without a new event
- `GET /cases/:id/risk-history` — return recent risk snapshots, timeline events, open escalations, and follow-up tasks
- `GET /dashboard/supervisor` — return highest-risk open cases, rising-risk cases, open escalations, and overdue follow-ups

### Trigger rules and task automation

- Threshold alerts: score `>= 60` creates a high alert, score `>= 75` creates a critical alert
- Delta alerts: score increase `>= 15` from the last snapshot creates a rising-risk alert
- Task templates: low/moderate/high/critical tiers map to increasing SLA urgency in `backend/case-risk/rules.js`
- Duplicate protection: active tasks are unique per `case_id + task_type` unless explicitly marked as allowing duplicates
- Snapshot history is immutable and append-only; every persisted result records factors, rationale, hard-escalation metadata, and rules version

### Operations runbook

- All Track C outputs are decision-support only; no irreversible or adverse action should be automated from these signals
- Review the latest `risk_snapshots.rationale`, `escalation_alerts.detail`, and case timeline before changing placement, contact, or legal status
- If a worker or supervisor overrides an automated recommendation, record a follow-up case event/note with the justification so the audit trail stays complete
- Resolve or dismiss escalation alerts only after a human review documents the outcome in case notes or a linked case event

## Readiness notes

- The root Expo manifest and lockfile are now restored so the mobile app can be installed and validated consistently.
- `src/safesteps/lessons/master-index.json` is generated by `npm run content:index` and documents canonical content sources.
- `schema/curriculum-schema.json` is now a real JSON Schema for curriculum records and the generated content index.
- `supabase/schema_dump.sql` is intentionally documented as a placeholder; the migration history remains the source of truth for database structure.
