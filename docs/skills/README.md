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
| Multi-Document Comparison | [multi-document-comparison.md](multi-document-comparison.md) | Align and diff claims across multiple source documents |

### Operational Skills

| Skill | File | Purpose |
|---|---|---|
| Case Packet Builder | [case-packet-builder.md](case-packet-builder.md) | Assemble audience-specific case summaries |
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

All skills are idempotent. Human-review checkpoints are mandatory at `high` and `critical` risk outcomes before downstream actions are taken.

## References

- Shared taxonomy: [`ontology/safesteps_taxonomy.yaml`](../../ontology/safesteps_taxonomy.yaml)
- Common schema: [`schemas/common.schema.json`](../../schemas/common.schema.json)
- Safety policy: [`policies/safety_policy.md`](../../policies/safety_policy.md)
- Escalation matrix: [`policies/escalation_matrix.yaml`](../../policies/escalation_matrix.yaml)
- Quality gates: [`quality/quality_gates.yaml`](../../quality/quality_gates.yaml)
