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
- `npm run test:documents`
- `npm run smoke:documents:live` *(requires staging backend URL + access token env vars)*
- `npm run validate`
- `npm run content:index`
- `npm run content:readiness`
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

The legacy reader assets `curriculum/courses/lesson-videos/safesteps_nervous_system_course.json` and `definition matchup/safesteps_definition_matchup_{100,201_1200}.json` are restored unchanged from commits `16946fc2` and `f6c20a98`, respectively. They are historical runtime inputs, not alternate canonical authoring roots or evidence of content approval. The definition banks contain 1,100 questions (1-100 and 201-1200; 101-200 remain absent), and the video reader still uses demo footage. Restoration does not establish licensing, domain/safety review, assessment validity or production video readiness.

## App route audit

| Route | Backing screen | Current state | Data/backend dependency |
| --- | --- | --- | --- |
| `/` | `app/index.tsx` | navigation hub | none |
| `/scenarios` | `lib/scenarios/ScenarioSimulatorScreen.tsx` | local scenario prototype | none |
| `/storybooks` | `lib/storybooks/StorybookReaderScreen.tsx` | sample storybook content | none |
| `/assessments` | `lib/assessments/AssessmentRunnerScreen.tsx`, `ProtectiveCapacityReflectionScreen.tsx`, `SequencePracticeScreen.tsx`, and `ForensicCriteriaAssessmentScreen.tsx` | unvalidated local reflection/practice; answers are session-only; forensic score/confidence/court claims removed | none |
| `/evidence` | `lib/evidence/EvidenceVaultScreen.tsx` | session-only draft and photo-selection preview; no upload, case link, retention, or worker verification | none |
| `/reports` | `lib/reports/ReportGeneratorScreen.tsx` | export disabled; no court-ready, certified, verified, or cryptographically sealed report | none |
| `/voice-coach` | `lib/voice/VoiceCalmingCoach.tsx` | optional local breathing timer; not medical or crisis support | none |
| `/sos` | `lib/support/SOSQuickRelieverScreen.tsx` | static non-emergency calming suggestions; cannot contact or dispatch help | none |
| `/fairness` | `lib/fairness/DocumentFairnessViewerScreen.tsx` | live fairness analyzer UI | Node API fairness endpoint |
| `/cases` | `app/cases/index.tsx` | authenticated case list | Supabase auth, case assignments, realtime |
| `/cases/[id]` | `app/cases/[id].tsx` | case detail + analysis status | Supabase cases/documents/analyses |
| `/dashboard/supervisor` | `app/dashboard/supervisor.tsx` | unavailable: Track C endpoint is fail-closed pending schema and actor authorization reconciliation | verified canonical identity/allocation contract and allowed/denied database actor tests |
| `/family` | `lib/family/FamilyOverviewScreen.tsx` | honest unavailable state; no sample family or case data | parent access authorization and case crosswalk are not verified |
| `/parent` | `lib/parent/ParentCaregiverPortalScreen.tsx` | session-only guidance and workflow previews; drafts are not delivered or persisted | verified parent identity, case access, and domain service contracts |
| `/companion` | `lib/companion/TrustedCompanionScreen.tsx` | hard-disabled; does not collect consent or prompts | trusted consent/catalog adapters, safety review, and launch approval |
| `/documents/[id]` | `app/documents/[id].tsx` | document upload + processing | `expo-document-picker` + Node analysis API |
| `/safety-plan` | `lib/safety/SafetyPlanScreen.tsx` | blank, temporary on-screen notes only; no saved plan, contact, or emergency response | qualified local safety planning and verified storage/authorization contract |
| `/contact-visit` | `lib/contactVisit/ContactVisitCompanionScreen.tsx` | example visit guidance and session-only reflections; not an official visit record | none |
| `/settings` | `lib/settings/SettingsAccountScreen.tsx` | session-only profile/contact previews; local device recovery strings do not verify contacts or guarantee safety | verified identity, account, and trusted-contact service contracts |
| `/discreet` | `lib/privacy/DiscreetModeScreen.tsx` | calculator-style prototype; does not guarantee concealment or safety | Expo SecureStore for the local PIN and recovery strings only |

## Parent/caregiver feature inventory

The current parent/caregiver surface is narrower than the backend/domain footprint. The list below distinguishes what is already surfaced in the app from capabilities that only have partial foundations today.

| Capability | Current route/surface | Current state | Existing backend/domain basis |
| --- | --- | --- | --- |
| AI companion / counsellor access | `/companion` | route is present but chat is hard-disabled pending trusted consent/catalog adapters, safety review, and explicit launch approval; no consent or prompts are collected | repository migrations define Personal AI persistence/governance tables, but they are absent from the verified deployment snapshot |
| Case plan visibility | `/cases/[id]` | intentionally unavailable: no case-plan query is shown until the case-ID crosswalk, plan-data contract, and parent authorization rules are verified | case tasks, milestones, quest progress, and reunification data structures |
| Direct messaging with caseworker | `/parent` | unsent, in-memory draft preview only; no inbox, delivery, or persistence | consolidated `messages` view and `parent_child_messages` model |
| Scheduling & calendar | `/parent` | session-only agenda note preview; no calendar sync, case write, or reminders | case appointments plus consolidated visit records |
| Notifications | `/parent` | session-only preference preview; no account preference changes or notification delivery | notification preferences and notification-related backend infrastructure |
| Court & legal literacy | `/parent` | general hearing-preparation information with a not-legal-advice notice | no dedicated app surface yet |
| Financial / housing evidence upload | `/evidence`, `/documents/[id]` | partial: generic evidence and document upload only | evidence categories include housing and document/evidence pipelines exist |
| Substance-use self-tracking | `/parent` | session-only wellbeing check-in; not a clinical, sobriety, or treatment record | assessment/evidence foundations only |
| Peer / community support | `/parent` | guidance to find and verify local support; no directory, forum, or referral submission | community/referral foundations exist outside the parent app surface |
| Onboarding & consent | `/cases` sign-in; `/parent` status | sign-in exists, but identity verification and trusted consent are not implemented or collected | onboarding consent events and parent intake save/resume RPCs |
| Dispute / grievance path | `/parent` | unsent, in-memory draft only; no submission or supervisor-review request is created | governance and decision-review structures exist, but no parent UI |
| Emergency / crisis escalation | `/parent`, `/sos` | links to existing safety resources and tells users in immediate danger to call their local emergency number; app does not dispatch, monitor, or queue help | repository migrations define Personal AI safety/referral structures, but they are absent from the verified deployment snapshot |
| Data rights | `/parent` | explains that export/access-history requests are not connected; no data is exported | export and audit structures exist in backend domains, but not in the app surface |

The `/parent` workflow center is an honest local preview: drafts and selections stay in screen memory only, are not delivered or persisted, and are cleared when the screen is left. These previews do not replace official communications, case records, court notices, emergency services, or organizational privacy-request processes.

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
- `POST /documents/process` *(queues analysis for an existing uploaded document)*
- `GET /documents/:id`
- `DELETE /documents/:id`
- `POST /documents/compare`
- `GET /documents/comparisons/:id`
- `GET /analyses/:id` *(compatibility read path)*
- `POST /analyses/compare` *(compatibility alias of `/documents/compare`)*
- `POST /risk-assessment/compute` *(compatibility alias that returns latest recomputed Track C snapshot)*
- `POST /cases/:id/events`
- `POST /cases/:id/recompute-risk`
- `GET /cases/:id/risk-history`
- `GET /dashboard/supervisor`

Except for `/health` and `/ready`, backend routes require a valid Supabase bearer token and return decision-support outputs that require human review.

Use this backend for local smoke testing and heuristic document-analysis development.

### Supabase

`supabase/` is the authoritative data/security layer for:

- authenticated case, evidence, and report-delivery workflows
- row-level security and audit controls
- migration history and schema tests
- edge functions such as private report delivery

Use Supabase for real data contracts and audited report access, not the local Node prototype server.

Case-linked feature prerequisites remain unresolved. [Backend contract evidence tooling](supabase/README.md#backend-contract-evidence-no-deployment) captures catalog metadata read-only and compares it offline with the canonical baseline and repository migration versions. It does not create a case-ID crosswalk, reconcile authorization, execute migrations or enable parent workflows.

`npm run readiness` intentionally blocks production release until the case crosswalk, assessment authorization and Track C canonical identity/allocation contracts are reconciled and verified with allowed/denied database actors. Existing staging sign-offs alone cannot clear this blocker.

## Track C: risk assessment & case updates

Track C contains a deterministic safety-support implementation for case events, risk snapshots, escalation alerts, follow-up tasks, and supervisor monitoring. **Its HTTP endpoints are currently disabled:** authenticated requests return `503 SERVICE_UNAVAILABLE` before body parsing or risk-service/database access; unauthenticated requests return `401`. There is no environment flag or injected-service bypass. The engine and service remain available for isolated tests, not production use. Re-enable only in a reviewed change that reconciles canonical identity, allocation, persistence and authorization contracts with allowed/denied staging actor evidence.

### Risk scoring logic

- Inputs: structured `behavioral_cues`, `contextual_factors`, `protective_factors`, `doc_signals`, and `hard_flags` on case events
- Engine: weighted deterministic rules in `backend/case-risk/rules.js`
- Output: normalized `score` (0-100), `tier` (`low`, `moderate`, `high`, `critical`), `confidence`, factor breakdown, rationale, and `model_version`
- Trend boosts: repeated acute events in 7 days, repeated events in 30 days, repeated same signal, and multiple document-derived signals
- Hard escalation: `child_immediate_danger`, `credible_threat_to_life`, `weapon_access`, `missing_child`, and `suicidal_statement` force critical workflow regardless of score threshold

### Backend endpoints

The following contracts describe the intended workflow, not active database operations. Each route currently returns the unavailable response described above:

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

### Risk-model versioning process

- Treat `backend/case-risk/rules.js` `version` as the contract identifier for risk scoring behavior.
- For any rule/weight/threshold change, bump the `version` value in the same pull request as the rule edits and tests.
- Add or update tests in `tools/tests/case-risk-engine.test.mjs`, `tools/tests/case-risk-service.test.mjs`, and `tools/tests/case-risk-migration.test.mjs` to cover the changed behavior.
- Keep previous `risk_snapshots.model_version` values immutable so historical decisions remain reproducible.
- Require supervisor sign-off in code review for any risk-model version bump before release.

### Supervisor score interpretation

- `0-24` (`low`): maintain routine check-ins and monitor for new signals.
- `25-49` (`moderate`): increase follow-up cadence and confirm protective-factor stability.
- `50-74` (`high`): perform expedited supervisor review and verify safety-plan execution.
- `75-100` (`critical`) or any hard flag: immediate supervisor attention, urgent safety review, and documented human decision.
- Rising-risk deltas (`+15` or more) indicate acceleration risk and should be reviewed even when the tier does not change.

### Automation boundaries

- Automated workflow outputs must never directly change placement, contact arrangements, legal status, or custody outcomes.
- Any such change requires explicit human review and documented rationale in case notes/events.

## Skills foundation (family conflict + orchestration)

This repository now includes a first SafeSteps skills foundation that stays aligned to the existing document-analysis and Track C case-risk architecture.

### Canonical curriculum/program content

- `lessons/family_conflict_psychoeducation_program.json` — canonical Family Conflict Psychoeducation program configuration, including all 20 lessons, Basic/Developing/Mastery progression, safeguards, completion guidance, reusable assessments, and rubric details.
- `modules/module_family_conflict_psychoeducation_program.json` — canonical module wrapper for the program.
- `topics/family_conflict_psychoeducation_program.json` — canonical topic mapping to the module.
- `schema/family-conflict-psychoeducation-program-schema.json` — validation schema for the program structure.

### Backend skills registry and orchestration

- `backend/skills/registry.js` — grouped skill metadata for:
  - document intelligence
  - workflow/action
  - communication/de-escalation
  - child-safe interaction
  - compliance/safeguarding
- `backend/skills/safety-gates.js` — shared gating policy enforcing:
  - decision-support only outputs
  - no diagnosis/legal advice automation
  - privacy/boundary protections
  - no child messenger/side-taking patterns
  - participant pass/take-a-break support
  - escalation flags for possible immediate safety concerns
- `backend/skills/orchestrator.js` — typed orchestration envelope for structured skill inputs/outputs, policy evaluation, and integration hints to existing document and Track C workflows.
- `backend/skills/program-config.js` — canonical program loader + validator for the family conflict configuration.

### Explicit automation boundaries

- Skills outputs are advisory and require human review checkpoints.
- No automatic irreversible placement, custody, contact, or legal decisions are allowed.
- Escalation flags route to human review within existing case event/risk workflows.

## Readiness notes

- The root Expo manifest and lockfile are now restored so the mobile app can be installed and validated consistently.
- `src/safesteps/lessons/master-index.json` is generated by `npm run content:index` and documents canonical content sources.
- `schema/curriculum-schema.json` is now a real JSON Schema for curriculum records and the generated content index.
- `supabase/schema_dump.sql` is intentionally documented as a placeholder; the migration history remains the source of truth for database structure.
