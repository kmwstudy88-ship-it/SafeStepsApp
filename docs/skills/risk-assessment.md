# Skill: Risk Assessment

**Version:** 1.0.0  
**Status:** Production  
**Schema:** `schemas/skills/risk-assessment.output.schema.json`

---

## Purpose

Score current risk level across child safety and wellbeing domains based on extracted evidence, concern classifications, and timeline data. Output is structured for professional review and does not constitute a statutory risk determination or child protection decision. This skill supports — not replaces — qualified practitioner assessment.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `claims` | array of `ClaimRef` | Yes | Evidence extraction output |
| `concerns` | array | No | Concern classification output |
| `timeline` | object | No | Timeline extraction output |
| `context.child_age_years` | number | No | Child age for age-specific calibration |
| `context.supervision_status` | string | No | `active`, `none`, `voluntary`, `unknown` |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `risk_level` | string | `low`, `moderate`, `high`, `critical` |
| `risk_score` | number | 0.0–1.0 composite score |
| `domain_scores` | object | Per-domain scores |
| `domain_scores.physical_safety` | number | 0.0–1.0 |
| `domain_scores.emotional_wellbeing` | number | 0.0–1.0 |
| `domain_scores.parenting_capacity` | number | 0.0–1.0 |
| `domain_scores.family_violence` | number | 0.0–1.0 |
| `domain_scores.substance_use` | number | 0.0–1.0 |
| `domain_scores.support_network` | number | 0.0–1.0 |
| `contributing_factors` | array | Key signals driving risk score |
| `contributing_factors[].factor_id` | string | Unique identifier |
| `contributing_factors[].description` | string | Plain-language factor description |
| `contributing_factors[].domain` | string | Relevant domain |
| `contributing_factors[].claim_ids` | array | Supporting claim IDs |
| `contributing_factors[].weight` | number | Contribution weight 0.0–1.0 |
| `protective_factors` | array | Factors mitigating risk |
| `confidence` | number | 0.0–1.0 overall confidence |
| `uncertainty_disclosure` | boolean | True if confidence < 0.60 |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Weight risk signals by recency (events in last 30 days have 1.5× weight).
2. Apply age-specific calibration when `context.child_age_years` is provided (infants have higher baseline risk thresholds).
3. Protective factors reduce domain scores; absence of protective factors increases them.
4. Aggregate domain scores using a weighted average (family_violence and physical_safety carry highest weights: 0.25 each).
5. Set `risk_level` from `risk_score` thresholds: <0.30 low, 0.30–0.59 moderate, 0.60–0.79 high, ≥0.80 critical.

---

## Confidence Scoring Guidance

| Band | Range | Meaning |
|---|---|---|
| High | 0.80–1.00 | Multiple high-quality evidence items support score |
| Medium | 0.50–0.79 | Limited or partially corroborated evidence |
| Low | 0.20–0.49 | Sparse evidence; score provisional |

---

## Safety Constraints

- Outputs MUST include a disclaimer that the score supports professional review and does not constitute a statutory determination.
- `risk_level: critical` or `high` MUST trigger escalation before any case action.
- `uncertainty_disclosure: true` MUST be set when `confidence < 0.60`.
- This skill MUST NOT produce a diagnosis or clinical assessment.

---

## Escalation Conditions

- `risk_level: critical`
- `risk_level: high` with `domain_scores.family_violence >= 0.70`
- Any `contributing_factor` referencing imminent physical harm

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `contributing_factors[].claim_ids` for full source traceability

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Evidence sparsity | Too few claims to score reliably | Set `confidence < 0.40`; flag for manual assessment |
| Historical-only evidence | Old evidence inflates score inappropriately | Apply recency decay function |
| Confirmation bias | Model over-weights consistent narrative | Require counterbalancing protective factor scan |
| Missing child age | Age-specific calibration unavailable | Use conservative default calibration |
