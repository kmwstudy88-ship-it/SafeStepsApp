# SafeSteps Production Pack

**Version:** 1.0.0  
**Status:** Production  
**Last Updated:** 2026-08-28

This document is the top-level index for the SafeSteps AI Skill Specification Pack. It links all components and defines the recommended rollout order.

---

## What is the SafeSteps Skill Specification Pack?

The Skill Specification Pack is the complete design-time contract for SafeSteps AI skills. It defines:
- What each skill does, takes as input, and produces as output
- The safety constraints and escalation conditions governing all outputs
- The shared taxonomy that ensures consistency across skills
- The machine-readable schemas that enable automated validation
- The policies that protect children, families, and practitioners
- The CI quality gates that prevent unsafe deployments

This pack is implementation-ready documentation. It does not include executable code — it defines the contracts against which code must be implemented and tested.

---

## Component Groups

### 1. Skill Architecture & Index

| File | Description |
|---|---|
| [`docs/skills/README.md`](skills/README.md) | Skill architecture, versioning, contract requirements, and full skill index |

---

### 2. Core Analytical Skill Specs

These skills form the analytical backbone of SafeSteps. Implement in this order:

| Order | File | Description |
|---|---|---|
| 1 | [`docs/skills/evidence-extraction.md`](skills/evidence-extraction.md) | Extract structured claims from unstructured documents |
| 2 | [`docs/skills/timeline-extraction.md`](skills/timeline-extraction.md) | Build chronological event sequences |
| 3 | [`docs/skills/requirement-extraction.md`](skills/requirement-extraction.md) | Extract obligations from orders and agreements |
| 4 | [`docs/skills/contradiction-detection.md`](skills/contradiction-detection.md) | Surface conflicting claims across documents |
| 5 | [`docs/skills/concern-classification.md`](skills/concern-classification.md) | Assign canonical concern categories |
| 6 | [`docs/skills/risk-assessment.md`](skills/risk-assessment.md) | Score risk across child safety domains |
| 7 | [`docs/skills/fairness-detection.md`](skills/fairness-detection.md) | Identify procedural fairness failures |
| 8 | [`docs/skills/multi-document-comparison.md`](skills/multi-document-comparison.md) | Align and diff claims across documents |
| 9 | [`docs/skills/unrealistic-expectation-detection.md`](skills/unrealistic-expectation-detection.md) | Flag clinically or legally implausible expectations |

---

### 3. Operational Skill Specs

| Order | File | Description |
|---|---|---|
| 10 | [`docs/skills/case-packet-builder.md`](skills/case-packet-builder.md) | Assemble audience-specific case summaries |
| 11 | [`docs/skills/escalation.md`](skills/escalation.md) | Trigger and route escalation actions |
| 12 | [`docs/skills/follow-up-scheduling.md`](skills/follow-up-scheduling.md) | Generate follow-up tasks with deadlines |
| 13 | [`docs/skills/case-update.md`](skills/case-update.md) | Incrementally update live case records |

---

### 4. Communication & Child-Safe Skill Specs

Mandatory for any user-facing or child-adjacent output paths.

| File | Description |
|---|---|
| [`docs/skills/disclosure-sensitive.md`](skills/disclosure-sensitive.md) | **Gate skill** — detect abuse/trauma disclosures; run first on all intake text |
| [`docs/skills/trauma-informed-communication.md`](skills/trauma-informed-communication.md) | Review/rewrite for trauma-safe language |
| [`docs/skills/child-safe-conversation.md`](skills/child-safe-conversation.md) | Validate content for child-facing contexts |
| [`docs/skills/safety-planning.md`](skills/safety-planning.md) | Generate safety plan components |
| [`docs/skills/emotion-labeling.md`](skills/emotion-labeling.md) | Identify emotional content in text |
| [`docs/skills/guided-discovery.md`](skills/guided-discovery.md) | Generate open-ended practitioner questions |
| [`docs/skills/behaviour-message-interpretation.md`](skills/behaviour-message-interpretation.md) | Interpret child behavioural signals |
| [`docs/skills/de-escalation-strategy.md`](skills/de-escalation-strategy.md) | Suggest de-escalation strategies |
| [`docs/skills/developmental-appropriateness.md`](skills/developmental-appropriateness.md) | Assess age-appropriateness of tasks/language |
| [`docs/skills/boundary-privacy.md`](skills/boundary-privacy.md) | Identify boundary violations and privacy risks |

---

### 5. Compliance & Safeguarding Skill Specs

| File | Description |
|---|---|
| [`docs/skills/child-safe-standards-compliance.md`](skills/child-safe-standards-compliance.md) | Check alignment with National Child Safe Standards |
| [`docs/skills/bias-discrimination-detection.md`](skills/bias-discrimination-detection.md) | Flag biased or discriminatory language |
| [`docs/skills/cultural-safety.md`](skills/cultural-safety.md) | Assess cultural safety and responsiveness |
| [`docs/skills/policy-interpretation.md`](skills/policy-interpretation.md) | Map case signals to policy obligations |

---

### 6. Shared Taxonomy

| File | Description |
|---|---|
| [`ontology/safesteps_taxonomy.yaml`](../ontology/safesteps_taxonomy.yaml) | Canonical enums and definitions for all SafeSteps concepts |

**Contains:** concern categories, risk levels, evidence quality, contradiction types, escalation tiers, confidence bands, audience types, developmental stages, fairness issue categories, disclosure types.

---

### 7. Machine-Readable Output Schemas

All schemas are JSON Schema draft 2020-12.

| File | Skill |
|---|---|
| [`schemas/common.schema.json`](../schemas/common.schema.json) | Shared definitions (`RunMeta`, `DocumentRef`, `SourceSpan`, etc.) |
| [`schemas/skills/evidence-extraction.output.schema.json`](../schemas/skills/evidence-extraction.output.schema.json) | Evidence Extraction |
| [`schemas/skills/timeline-extraction.output.schema.json`](../schemas/skills/timeline-extraction.output.schema.json) | Timeline Extraction |
| [`schemas/skills/requirement-extraction.output.schema.json`](../schemas/skills/requirement-extraction.output.schema.json) | Requirement Extraction |
| [`schemas/skills/contradiction-detection.output.schema.json`](../schemas/skills/contradiction-detection.output.schema.json) | Contradiction Detection |
| [`schemas/skills/fairness-detection.output.schema.json`](../schemas/skills/fairness-detection.output.schema.json) | Fairness Detection |
| [`schemas/skills/concern-classification.output.schema.json`](../schemas/skills/concern-classification.output.schema.json) | Concern Classification |
| [`schemas/skills/risk-assessment.output.schema.json`](../schemas/skills/risk-assessment.output.schema.json) | Risk Assessment |
| [`schemas/skills/multi-document-comparison.output.schema.json`](../schemas/skills/multi-document-comparison.output.schema.json) | Multi-Document Comparison |

---

### 8. Safety Policy

| File | Description |
|---|---|
| [`policies/safety_policy.md`](../policies/safety_policy.md) | Human-readable safety policy covering all constraints |
| [`policies/safety_rules.yaml`](../policies/safety_rules.yaml) | Machine-readable safety rules for runtime enforcement |

**Covers:** non-diagnostic constraints, disclaimer requirements, uncertainty disclosure thresholds, child disclosure handling, PII redaction, trauma-informed language, prohibited output patterns, escalation gates.

---

### 9. Escalation Matrix

| File | Description |
|---|---|
| [`policies/escalation_matrix.yaml`](../policies/escalation_matrix.yaml) | Deterministic trigger rules: signals → escalation actions |

**Contains:** Tier 1 (immediate, ≤15 min), Tier 2 (urgent, ≤4 hours), Tier 3 (standard, ≤24 hours) rules with notification roles, SLAs, and pipeline hold controls.

---

### 10. CI Quality Gates

| File | Description |
|---|---|
| [`quality/quality_gates.yaml`](../quality/quality_gates.yaml) | Gate definitions with blocking thresholds |
| [`.github/workflows/skill-quality-gates.yml`](../.github/workflows/skill-quality-gates.yml) | GitHub Actions workflow for automated gate enforcement |

**Gates include:** schema validation, run_meta presence, safety policy pattern scan, high-risk false negative rate (block at >2%), bias regression delta (block at >0.05), trauma tone pass rate (block at <90%), disclosure detection recall (block at <95%), taxonomy consistency.

---

### 11. Sample Outputs

Synthetic examples demonstrating schema-conformant skill outputs.

| File | Skill |
|---|---|
| [`examples/evidence-extraction-sample.json`](../examples/evidence-extraction-sample.json) | Evidence Extraction |
| [`examples/timeline-extraction-sample.json`](../examples/timeline-extraction-sample.json) | Timeline Extraction |
| [`examples/risk-assessment-sample.json`](../examples/risk-assessment-sample.json) | Risk Assessment |

---

## Recommended Rollout Order

### Phase 1 — Foundation (Weeks 1–4)
1. Implement Evidence Extraction + Timeline Extraction (skills 1–2)
2. Implement shared taxonomy and schema validation in CI
3. Implement safety rules runtime enforcement
4. Implement Disclosure Sensitive as a gate on all intake paths

### Phase 2 — Core Analysis (Weeks 5–8)
5. Implement Requirement Extraction (skill 3)
6. Implement Contradiction Detection (skill 4)
7. Implement Concern Classification (skill 5)
8. Implement Risk Assessment (skill 6)

### Phase 3 — Decisions & Communication (Weeks 9–12)
9. Implement Fairness Detection (skill 7)
10. Implement Escalation + Follow-Up Scheduling (skills 11–12)
11. Implement Trauma-Informed Communication gate on all outputs
12. Implement Case Packet Builder (skill 10)

### Phase 4 — Compliance & Full Production (Weeks 13–16)
13. Implement Multi-Document Comparison (skill 8)
14. Implement remaining communication skills (9 skills)
15. Implement compliance/safeguarding skills (4 skills)
16. Complete CI quality gate suite with full evaluation datasets
17. Human review process for high/critical risk outputs operational

---

## Key Assumptions

1. **Professional use only.** This system is designed for qualified professionals (social workers, lawyers, judicial officers). Skills that produce outputs for parents or children are always mediated by a professional.

2. **AI supports, not replaces.** No skill replaces statutory decision-making, legal advice, clinical assessment, or mandatory reporting obligations. All outputs require professional review.

3. **Australian jurisdiction default.** Policy references (e.g. mandatory reporting, emergency services number) default to Australian law and practice. Jurisdiction-specific configuration is required for other contexts.

4. **Synthetic examples only.** The `examples/` directory contains completely synthetic data. No real case information is included.

5. **Evaluation datasets required.** Quality gates reference evaluation datasets (`test/eval/*.jsonl`) that must be created by the implementation team before quality gates can be enforced in CI.

---

## Definition of Production-Ready

This pack reaches "production-ready" status when:
- Every skill has a passing schema validation in CI
- Every skill has an evaluation dataset and passes all quality gate thresholds
- The disclosure escalation path has been end-to-end tested
- Human review processes for high/critical risk outputs are operational
- A monitoring dashboard for drift, escalation rate, and disagreement rate is active
- An incident playbook for unsafe output has been tested with a simulation

---

*SafeSteps Skill Specification Pack — Version 1.0.0*  
*Maintaining consistency with trauma-informed, child-safe, and safeguarding principles.*
