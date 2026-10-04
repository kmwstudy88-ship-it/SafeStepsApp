# SafeSteps Engine Implementation Roadmap

This roadmap separates executable logic from engine-shaped data, prompt catalogs, and database workflow foundations. It is an implementation plan, not evidence that every listed capability is clinically validated or ready for production decisions.

## Current inventory

| Capability | Current implementation | Status |
| --- | --- | --- |
| Document Intelligence | `backend/document-intelligence/` calls configured OpenAI or Anthropic providers for document analysis and comparison, formats structured results, and persists queued jobs. Fairness, evidence, timeline, contradiction, and risk findings are model outputs. | Operational backend path; outputs remain unverified decision support requiring human review. |
| Track C case risk | `backend/case-risk/engine.js`, `rules.js`, and `service.js` score structured signals and manage snapshots, alerts, and follow-up tasks. | Operational deterministic backend path with focused tests. |
| Forensic criteria assessment | `shared/forensicCriteriaModel.js` computes weighted concern, risk, protective, coverage, and reliability indicators. | Implemented model with tests; needs domain validation and careful limits on interpretation. |
| Named self-assessments | `assessmentDefinitions.ts` and `AssessmentRunnerScreen.tsx` provide four informal adapted check-ins. | Local reflection only; unsupported clinical bands and save/share claims were removed. Instrument sources, licensing, item fidelity, and scoring still require review before any validated-measure claims. |
| Scenario role-play | `lib/scenarios/scenarioEngine.ts` defines sample scenarios and scores selected choices for regulation, de-escalation, and connection. | Runnable local prototype. |
| Sequence questions | `lib/data/safeStepsSequenceAssessmentItems.ts` contains 157 ordered-step examples across 12 topics. `SequencePracticeScreen.tsx` exposes them as local, unscored practice with a learner-arranged order and supplied-sequence comparison. | Practice UI is implemented; items are not a validated knowledge or competency assessment. The data has no item-by-item reviewed safety rationale or verified licensing provenance. Treat answer keys as suggested examples, not authoritative directions. No persistence. |
| Protective-capacity rubric | `lib/data/safeStepsAssessmentInstrument.ts` defines the rubric and `lib/data/safeStepsProtectiveCapacityContent.ts` supplies respondent-facing prompts and domain guidance. `ProtectiveCapacityReflectionScreen.tsx` connects it to the shared scorer. | Local-only, non-persistent reflection flow implemented. It shows response coverage and human-support prompts, not scores or readiness bands. Content and rubric are unvalidated; case-linked administration remains blocked by the data and authorization gates below. |
| Child-safe response policy | `backend/personal-ai/child-safe-policy.js` and `support-handlers.js` provide deterministic risk classification and scripted responses with privacy filtering. `types/personalAiSupportApi.ts` now has its shared engine types. Confidence is an uncalibrated rule-match score, not a probability. | Handler layer is implemented and HTTP routes are fail-closed by default. Not launch-ready: the verified schema snapshot has no Personal AI tables, consent verifier/catalog adapter, active approved flows, or completed launch-gate evidence. No model, transcript, note, or handoff persistence is wired. |
| Skills catalog and orchestration | `backend/skills/registry.js`, `safety-gates.js`, and `orchestrator.js` provide metadata, safety evaluation, and handler-based orchestration. | Framework only: handlers are injected and the repository does not wire implementations for the registered skills. |
| Family meeting and rewards | `lib/data/familyMeetingPromptEngine.ts` includes prompt catalogs, safety/reward schemas, sample payloads, and helper getters. | Mostly content and architecture; no operational meeting/consensus service was found. |
| Reunification/contact progression | `lib/data/intensiveReunificationSupport.ts` and `lib/data/scenarioModules.ts` describe tasks, evidence prompts, stages, and proposed progression. | Domain specifications and workflow concepts; no complete progression engine was found. |
| Parenting/child-development learning | Supabase migrations define learning-course/challenge completion and certificate guard functions. | Database workflow foundation exists; end-to-end app service and user journey need verification before calling the engine complete. |
| Psychometric and unified assessment system | `lib/data/assessmentSystem.ts` lists intended routes and features, including a psychometric engine; corresponding `app/assessment-system/` screens were not found. | Planned surface, not a runnable engine. |

Assessment data and the Personal AI API now have their shared engine types/scoring dependencies. Personal AI remains disabled until trusted consent and approved-flow adapters are supplied and launch governance is complete.

## Delivery stages

### 1. Shared assessment scoring foundation

- **Progress:** Generic scoring module and focused tests added.
- Normalize each answered item against its configured maximum, apply item weights within a domain and domain weights across the assessment, and report unanswered-item coverage separately.
- Apply only configured score bands and critical overrides. Reject ambiguous or invalid scoring definitions and invalid responses.
- Keep all output advisory and require human review; do not infer safety, reunification, or placement decisions from a score.
- A local-only protective-capacity reflection UI is now available without case association or persistence. Case-linked staff administration remains blocked on the gates below.

#### Case-linked assessment gate

The staff-only, human-review-only protective-capacity workflow is blocked on verified data and access contracts:

- The canonical baseline records `assessment_records.case_id` as a foreign key to `reunification_cases.id`; the app's operational case routes use `cases.id`. The canonical schema establishes no equivalence or deployed crosswalk between those identifiers.
- The verified schema snapshot contains no mapping relation or row-level case data from which a mapping can be established. Do not join on matching UUIDs, names, or family labels, and do not write an assessment against a guessed case ID.
- Migration `20260721192516_assessment_evidence_reunification_framework_volume17.sql` uses `ADD COLUMN IF NOT EXISTS case_id ... REFERENCES cases(id)`. Because `case_id` already exists in the baseline, this statement does not change its existing FK.
- The verified snapshot lists seven permissive `assessment_records` policies, including broad parent/facilitator `ALL` policies and legacy profile/role paths, and grants `anon` and `authenticated` broad table privileges including `TRUNCATE`. A new permissive policy or UI-only staff check cannot establish staff-only access.
- Before implementation, verify the authoritative case-pair crosswalk and review a migration that reconciles all assessment policies and SQL grants with the trusted staff identity, active case assignment, and human-review lifecycle. Test permitted and denied actors against the target schema. Do not execute that migration as part of this roadmap update.

### 2. Assessment experience and evidence quality

- The protective-capacity rubric now has an explicit local-only reflection route with complete item prompts, response guidance, domain reflections, and non-persistence/decision-use limits. Its rubric, weights, and interpretation still require qualified domain review; case-linked use remains gated.
- The existing self-check-in screen no longer claims to save/share results or displays its unsupported clinical-band labels. Its adapted questions and scoring thresholds still require source, licensing, and domain validation before they can be presented as validated measures.
- The existing 157 sequence examples now have a local, unscored practice route. Its comparison is framed as a suggested example, not a single correct or officially safe answer; each item still needs a qualified content/safety review and the corpus needs licensing provenance before assessment use.
- The separate 1,000-item sequence universe and fill-in-the-blank quiz banks are not wired into this practice route. Their metadata and quiz keys must not be treated as evidence of review or validation; verify provenance, item quality, accessibility, age fit, and scoring before using them.
- Continue with scored sequence and knowledge assessment only after item content, licensing, scoring, intended audience, accessibility, and safety review are verified.
- Keep learning/quiz performance distinct from observed competency and case readiness.
- Define evidence provenance, source coverage, contradictions, reassessment comparisons, and reviewer checkpoints using existing product contracts.
- Validate score bands and interpretations with qualified domain reviewers before production use; do not add new thresholds by inference.

### 3. Safety and risk workflows

- Verify Track C scoring, trend handling, hard escalation, persistence, deduplication, and supervisor review as one end-to-end flow.
- Decide whether the forensic criteria model remains a separate review instrument or is retired/merged through an explicit domain decision; do not silently combine or double-count scores.
- Wire the deterministic Personal AI handler layer only to trusted server-side consent and approved-flow adapters after the Personal AI schema and launch governance are verified. Note storage, handoff queueing and model calls remain out of scope until their authorization and release contracts are deployed and reviewed.

### 4. Document intelligence and skills

- Add independently testable adapters for registered skills and wire only supported handlers to Document Intelligence or case workflows.
- Preserve evidence citations, uncertainty, model/version metadata, safety gates, and human-review requirements through each adapter.
- Mark unsupported skills unavailable rather than returning fabricated or success-shaped outputs.

### 5. Reunification, family meetings, and learning

- Convert the contact progression specifications into reviewable state transitions with evidence prerequisites, pause/step-back conditions, and supervisor approvals.
- Implement family meeting nominations, negotiation, circuit breakers, and reflections as explicit workflows, not as a UI-only score or gamified proxy for safety.
- Verify learning enrollment, lesson/challenge completion, certificates, and mobile/backend integration against the deployed schema and role boundaries.

### 6. Cross-engine assurance

- Add contract and regression tests across engine boundaries, version every decision-support model, verify auditability and access controls, and document known limitations.
- Require domain review for sensitive thresholds and an end-to-end staging journey before describing a safety-related workflow as production-ready.

## Guardrails

- Read `docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md` before any schema, migration, RLS, identity, case-relationship, storage-authorization, generated-type, or Supabase-query changes.
- Never treat a model, rubric, quiz score, risk tier, or missing-data default as an automated placement, contact, legal, custody, or reunification decision.
- Preserve the differences between operational code, seeded data, architecture specifications, and verified deployed behavior.
