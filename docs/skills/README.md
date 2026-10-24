# SafeSteps Skill Architecture

## Overview

SafeSteps AI skills are discrete, composable processing units that operate on case documents, intake data, and professional notes. Each skill has a strictly defined input schema, output schema, safety constraints, and escalation conditions. Skills do **not** replace professional legal, clinical, or child-protection judgment — they surface evidence-based signals to support qualified practitioners.

## Versioning Approach

- Each skill is independently versioned using [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).
- The `run_meta.skill_version` field in every output record declares the exact skill version that produced it.
- Breaking changes to output schema require a MAJOR version bump and are gated by CI schema-compatibility checks.
- Skills are promoted through environments: `dev → staging → production`. Promotion requires passing all quality gates defined in `quality/quality_gates.yaml`.

## Contract Requirements

Every skill MUST:
1. Declare explicit input and output JSON Schemas (`schemas/skills/*.schema.json`).
2. Emit a `run_meta` block containing `skill_version`, `model`, and `timestamp_utc`.
3. Attach `source_span` (character-level) to every extracted claim or evidence item.
4. Enforce safety constraints defined in `policies/safety_rules.yaml` before returning output.
5. Trigger escalation when conditions in `policies/escalation_matrix.yaml` are matched.
6. Be evaluable against the acceptance criteria in `quality/quality_gates.yaml`.

## Skill Taxonomy

### Core Analytical Skills

| Skill | File | Purpose |
|---|---|---|
| Fairness Detection | [fairness-detection.md](fairness-detection.md) | Identify procedural fairness failures in case handling |
| Contradiction Detection | [contradiction-detection.md](contradiction-detection.md) | Surface conflicting statements across documents |
| Evidence Extraction | [evidence-extraction.md](evidence-extraction.md) | Extract structured factual claims from unstructured text |
| Requirement Extraction | [requirement-extraction.md](requirement-extraction.md) | Extract legal/procedural obligations from orders and agreements |
| Timeline Extraction | [timeline-extraction.md](timeline-extraction.md) | Build a chronological event sequence from case materials |
| Risk Assessment | [risk-assessment.md](risk-assessment.md) | Score risk level across child safety and wellbeing domains |
| Concern Classification | [concern-classification.md](concern-classification.md) | Assign canonical concern categories to case signals |
| Unrealistic Expectation Detection | [unrealistic-expectation-detection.md](unrealistic-expectation-detection.md) | Flag stated expectations that are clinically or legally implausible |

### Operational Skills

| Skill | File | Purpose |
|---|---|---|
| Case Packet Builder | [case-packet-builder.md](case-packet-builder.md) | Assemble audience-specific case summaries |
| Multi-Document Comparison | [multi-document-comparison.md](multi-document-comparison.md) | Align and diff claims across multiple source documents |
| Case Update | [case-update.md](case-update.md) | Incrementally update a live case record |
| Escalation | [escalation.md](escalation.md) | Trigger and route escalation actions |
| Follow-Up Scheduling | [follow-up-scheduling.md](follow-up-scheduling.md) | Generate follow-up task lists with deadlines |

### Communication & Child-Safe Skills

| Skill | File | Purpose |
|---|---|---|
| Trauma-Informed Communication | [trauma-informed-communication.md](trauma-informed-communication.md) | Rewrite or validate messages for trauma sensitivity |
| Emotion Labeling | [emotion-labeling.md](emotion-labeling.md) | Identify and label emotional content in text |
| Guided Discovery | [guided-discovery.md](guided-discovery.md) | Generate open-ended questions for professional use |
| Behaviour Message Interpretation | [behaviour-message-interpretation.md](behaviour-message-interpretation.md) | Interpret behavioural signals in child context |
| De-escalation Strategy | [de-escalation-strategy.md](de-escalation-strategy.md) | Suggest de-escalation approaches for high-tension situations |
| Child-Safe Conversation | [child-safe-conversation.md](child-safe-conversation.md) | Flag or rewrite content unsuitable for child-facing contexts |
| Disclosure Sensitive | [disclosure-sensitive.md](disclosure-sensitive.md) | Detect and handle abuse/trauma disclosure indicators |
| Developmental Appropriateness | [developmental-appropriateness.md](developmental-appropriateness.md) | Assess whether language and tasks suit a child's developmental stage |
| Safety Planning | [safety-planning.md](safety-planning.md) | Generate structured safety plan components |
| Boundary & Privacy | [boundary-privacy.md](boundary-privacy.md) | Identify boundary violations and privacy risks in text |

### Compliance & Safeguarding Skills

| Skill | File | Purpose |
|---|---|---|
| Child Safe Standards Compliance | [child-safe-standards-compliance.md](child-safe-standards-compliance.md) | Check alignment with national Child Safe Standards |
| Bias & Discrimination Detection | [bias-discrimination-detection.md](bias-discrimination-detection.md) | Flag potentially biased or discriminatory language |
| Cultural Safety | [cultural-safety.md](cultural-safety.md) | Assess cultural safety and responsiveness of content |
| Policy Interpretation | [policy-interpretation.md](policy-interpretation.md) | Map case signals to applicable policy obligations |

## Processing Pipeline

```
ingest → normalize → [evidence | requirements | timeline] → [contradictions | fairness] → [risk | concerns] → packet builder → [escalation | follow-up] → case update
```

## Runtime Map and Current Limits

The authenticated, case-scoped `POST /agent-skills/run/:skillId` endpoint accepts `{ "caseId": "...", "input": { ... } }` and executes the catalog handler. Workflow-action and compliance/safeguarding skills are restricted to staff roles. The response includes the skill definition, decision-support output, `run_meta`, policy findings, and a mandatory human-review checkpoint. `GET /agent-skills/catalog` and `GET /agent-skills/catalog/:skillId` expose discovery. The existing document-specific endpoints (`/fairness-detect`, `/contradiction-detect`, `/evidence-extract`, `/requirement-extract`, `/timeline-extract`, `/risk-assess`, `/concern-classify`, and `/expectation-detect`) remain available and skip analysis when the disclosure preflight requires review.

| Skill group | Runtime implementation | Review boundary |
|---|---|---|
| Document intelligence (Fairness, Contradiction, Evidence, Requirement, Timeline, Risk, Concern, Unrealistic Expectation) | Eight handlers in `backend/skills/documentIntelligenceAdapter.js`; fairness and risk include deterministic signals, while several extractors use configured model engines. | Disclosure signals stop model analysis in the document pipeline, direct document routes, and non-disclosure orchestrator handlers. Extracted text is source-linked only when an evidence quote exactly matches supplied text. |
| Workflow actions (Case Packet, Multi-Document Comparison, Case Update, Escalation, Follow-Up Scheduling) | Draft-only handlers in `backend/skills/defaultHandlers.js`; shared endpoint: `/agent-skills/run/:skillId`. | These handlers do not update case records, send notifications, or create calendar tasks. Document comparison needs `input.documents` with text; unmatched statements are not asserted as contradictions. |
| Communication & de-escalation (Trauma-Informed, Emotion-Labeling, Guided Discovery, Behaviour-Message Interpretation, De-Escalation Strategy) | Rule-based communication and prompt handlers in `backend/skills/defaultHandlers.js`; shared endpoint: `/agent-skills/run/:skillId`. | Language signals do not diagnose or determine intent; generated prompts are optional and must be reviewed. |
| Child-safe interaction (Child-Safe Conversation, Disclosure-Sensitive, Developmental Appropriateness, Safety Planning, Boundary & Privacy) | `backend/personal-ai/child-safe-policy.js` powers child-safe responses, disclosure triage, developmental adaptation, and safety prompts; shared endpoint: `/agent-skills/run/:skillId`. | Disclosure/immediate-danger findings require human review and block other skill execution; local safeguarding/emergency procedures remain authoritative. |
| Compliance & safeguarding (Child Safe Standards, Bias & Discrimination, Cultural Safety, Policy Interpretation) | Fairness screening reuses `FairnessEngine`; cultural-safety and policy checks return review prompts; standards compliance reports unassessed dimensions in `backend/skills/defaultHandlers.js`; shared endpoint: `/agent-skills/run/:skillId`. | Text screening is not a legal interpretation, formal standards audit, or substitute for culturally informed review. |

The runtime validates required input fields, emits a versioned `run_meta` block, and adds character spans when an evidence quote can be matched exactly. If a handler does not report its model, `run_meta.model` is `model-not-reported`; upstream model provenance still needs to be wired through those engines. The per-skill output JSON Schemas are not yet enforced against handler results, and evaluation datasets / full CI quality gates described above remain follow-up work. Repeated calls create separate skill-result records; they are not idempotent. Legacy IDs `behavior_message_interpretation` and `disclosure_sensitive_handling` resolve to the canonical `behaviour_message_interpretation` and `disclosure_sensitive` IDs.

High- and critical-risk outcomes require human review before any downstream decision or action.

## References

- Shared taxonomy: [`ontology/safesteps_taxonomy.yaml`](../../ontology/safesteps_taxonomy.yaml)
- Common schema: [`schemas/common.schema.json`](../../schemas/common.schema.json)
- Safety policy: [`policies/safety_policy.md`](../../policies/safety_policy.md)
- Escalation matrix: [`policies/escalation_matrix.yaml`](../../policies/escalation_matrix.yaml)
- Quality gates: [`quality/quality_gates.yaml`](../../quality/quality_gates.yaml)
