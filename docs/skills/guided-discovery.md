# Skill: Guided Discovery

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Generate open-ended, trauma-informed questions to support professionals in exploratory conversations with children and families. Questions are calibrated to developmental stage and context. This skill produces question suggestions for professional use — questions must be adapted by the practitioner and are not for automated delivery.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `topic` | string | Yes | Topic area for exploration |
| `context.audience_age_years` | number | No | Target child's age |
| `context.developmental_stage` | string | No | `infant`, `toddler`, `early_childhood`, `middle_childhood`, `adolescent` |
| `context.trauma_context` | array of string | No | Relevant trauma context |
| `context.session_type` | string | No | `initial_assessment`, `ongoing_support`, `review` |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `questions` | array | Generated question objects |
| `questions[].question_id` | string | Unique identifier |
| `questions[].text` | string | Question text |
| `questions[].type` | string | `open_ended`, `clarifying`, `reflective`, `exploratory` |
| `questions[].developmental_suitability` | string | Developmental stage this is suited for |
| `questions[].trauma_sensitivity_check` | boolean | True if trauma-safe review passed |
| `questions[].usage_note` | string | Guidance for professional use |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. All questions must be open-ended by default (no yes/no).
2. Calibrate vocabulary complexity to developmental stage.
3. Avoid leading questions, suggestive language, or questions that imply a specific answer.
4. Apply trauma-sensitivity check: avoid questions that require re-living traumatic detail.

---

## Safety Constraints

- Questions MUST NOT be delivered directly to children without professional mediation.
- MUST NOT generate questions that solicit specific abuse disclosures in a non-forensic context.
- Questions for children under 5 must use simple, concrete language only.

---

## Escalation Conditions

- If topic involves a disclosure context, route to Disclosure Sensitive skill first.

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Age under-specification | Questions generated for wrong developmental level | Default to youngest applicable stage when age unknown |
| Topic specificity gap | Topic too broad to generate useful questions | Prompt practitioner to narrow topic |
