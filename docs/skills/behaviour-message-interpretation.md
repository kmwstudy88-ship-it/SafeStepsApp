# Skill: Behaviour Message Interpretation

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Interpret behavioural signals observed in children within a family law or child protection context. Supports practitioners in understanding potential meanings behind child behaviour (e.g. regression, withdrawal, aggression) using evidence-based frameworks. Does not constitute a clinical diagnosis.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `behaviour_description` | string | Yes | Description of observed behaviour |
| `context.child_age_years` | number | No | Child's age |
| `context.duration` | string | No | How long the behaviour has been occurring |
| `context.setting` | string | No | Where the behaviour is observed (home, school, etc.) |
| `context.case_concerns` | array of string | No | Active concern categories |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `interpretations` | array | Possible behavioural interpretations |
| `interpretations[].interpretation_id` | string | Unique identifier |
| `interpretations[].interpretation` | string | Plain-language meaning |
| `interpretations[].framework` | string | Theoretical framework (e.g. `attachment`, `trauma_response`, `developmental`) |
| `interpretations[].confidence` | number | 0.0–1.0 |
| `interpretations[].professional_action` | string | Suggested next step for practitioner |
| `safety_concern_flag` | boolean | True if behaviour may indicate safety concern |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Generate multiple possible interpretations — behaviours are rarely monocausal.
2. Apply developmental norms for the child's age before flagging abnormality.
3. Note when behaviour is within normal developmental range vs. clinically significant.
4. Do not infer specific abuse or perpetrator from behaviour alone.

---

## Safety Constraints

- MUST NOT provide a psychiatric or psychological diagnosis.
- MUST NOT be used as sole evidence of abuse.
- `safety_concern_flag: true` MUST trigger practitioner review before any action.
- Output must include: "Behavioural interpretation requires professional clinical judgement."

---

## Escalation Conditions

- `safety_concern_flag: true` with `confidence >= 0.65`

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Cultural behaviour variation | Behaviour is culturally normative but flagged as atypical | Apply cultural safety review; flag for cultural consultation |
| Insufficient context | Behaviour described without sufficient context | Flag `context_insufficient: true`; request additional detail |
| Over-interpretation | Benign behaviour over-attributed to trauma | Require corroborating evidence before safety flagging |
