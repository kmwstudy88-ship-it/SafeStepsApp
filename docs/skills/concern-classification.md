# Skill: Concern Classification

**Version:** 1.0.0  
**Status:** Production  
**Schema:** `schemas/skills/concern-classification.output.schema.json`

---

## Purpose

Assign one or more canonical concern categories from the SafeSteps taxonomy to each extracted claim or case signal. Consistent classification enables cross-case analytics, escalation routing, and structured reporting. Classification is based on evidence content and does not constitute a statutory determination.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `claims` | array of `ClaimRef` | Yes | Claims to classify (from Evidence Extraction) |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `classified_concerns` | array | Classification results |
| `classified_concerns[].claim_id` | string | Source claim identifier |
| `classified_concerns[].categories` | array of string | One or more categories from taxonomy |
| `classified_concerns[].primary_category` | string | Highest-confidence category |
| `classified_concerns[].confidence` | number | 0.0–1.0 |
| `classified_concerns[].rationale` | string | Brief explanation of classification |
| `concern_summary` | object | Count of concerns by category |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Valid Concern Categories (from taxonomy)

- `safety` — imminent or ongoing physical safety risk
- `wellbeing` — emotional, developmental, or social wellbeing concern
- `parenting_capacity` — concerns about a parent's ability to meet child's needs
- `violence_indicator` — evidence of family or domestic violence
- `neglect` — failure to provide basic needs
- `substance_use` — substance use affecting parenting or safety
- `mental_health` — mental health concerns affecting parenting or child
- `compliance` — non-compliance with orders or requirements
- `housing` — housing instability affecting child welfare
- `education` — educational access or engagement concern

See full definitions in `ontology/safesteps_taxonomy.yaml`.

---

## Processing Notes

1. Apply multi-label classification — a single claim may receive multiple categories.
2. Primary category is the highest-confidence single category.
3. Use taxonomy definitions as grounding; do not invent categories.
4. Apply minimum confidence threshold of 0.30 before assigning any category.

---

## Confidence Scoring Guidance

| Band | Range | Meaning |
|---|---|---|
| High | 0.80–1.00 | Clear match to taxonomy definition |
| Medium | 0.50–0.79 | Partially matching or context-dependent |
| Low | 0.20–0.49 | Marginal — flag for review |

---

## Safety Constraints

- MUST NOT assign a category without a rationale.
- Categories of `safety`, `violence_indicator`, or `neglect` with `confidence >= 0.65` MUST trigger escalation check.
- Output MUST NOT combine classification with a recommendation or action directive.

---

## Escalation Conditions

- Any `safety` or `violence_indicator` classification with `confidence >= 0.65`
- Five or more `neglect` classifications in a single case

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `classified_concerns[].claim_id` links back to source evidence

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Category proliferation | Too many marginal categories assigned | Enforce minimum confidence threshold (0.30) |
| Taxonomy drift | New concern types not in taxonomy | Require taxonomy version pin in `run_meta` |
| Ambiguous claims | Claim could fit multiple categories equally | Assign all above threshold; flag for professional review |
