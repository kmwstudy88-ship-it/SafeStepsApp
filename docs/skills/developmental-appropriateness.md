# Skill: Developmental Appropriateness

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Assess whether tasks, expectations, communications, or arrangements described in case documents are appropriate for a child's developmental stage. Supports practitioners in identifying when demands placed on a child may be harmful due to developmental mismatch.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Text describing tasks, expectations, or arrangements |
| `context.child_age_years` | number | Yes | Child's current age |
| `context.developmental_stage` | string | No | Validated developmental stage |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `assessments` | array | Developmental appropriateness assessments |
| `assessments[].assessment_id` | string | Unique identifier |
| `assessments[].item_description` | string | The task or expectation assessed |
| `assessments[].is_appropriate` | boolean | Whether it is age-appropriate |
| `assessments[].developmental_concern` | string | Concern description if inappropriate |
| `assessments[].recommended_adjustment` | string | Suggested modification |
| `assessments[].text_span` | object | `{start, end}` |
| `assessments[].confidence` | number | 0.0–1.0 |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Apply established developmental milestone frameworks (e.g. Piaget, Erikson stages) for calibration.
2. Flag arrangements that require a child to manage adult-level responsibilities (e.g. facilitating parental contact independently, managing medication).
3. Consider both cognitive and emotional developmental appropriateness.

---

## Safety Constraints

- MUST NOT be used to minimise a child's capacity — only to protect them from over-burden.
- Assessments with concerns MUST include `recommended_adjustment`.
- Child age (`context.child_age_years`) is required; reject input if missing.

---

## Escalation Conditions

- `is_appropriate: false` for any arrangement involving child safety, medical care, or supervision

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `assessments[].text_span`

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Age not provided | Cannot calibrate without age | Require `child_age_years` as mandatory input |
| Advanced developmental capacity | Child is developmentally advanced for age | Apply conservative standards; note variation in output |
