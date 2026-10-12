# Skill: De-escalation Strategy

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Suggest evidence-based de-escalation strategies for high-tension situations in family law, child protection, or family support contexts. Outputs are communication and intervention strategies for professional use — they do not replace clinical crisis response protocols.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `situation_description` | string | Yes | Description of the current situation |
| `context.parties_involved` | array of string | No | Roles of people involved |
| `context.risk_level` | string | No | Current risk level from Risk Assessment |
| `context.history` | string | No | Relevant case history context |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `strategies` | array | Suggested de-escalation strategies |
| `strategies[].strategy_id` | string | Unique identifier |
| `strategies[].title` | string | Short strategy name |
| `strategies[].description` | string | Detailed strategy description |
| `strategies[].applicable_context` | string | When to apply this strategy |
| `strategies[].contraindications` | string | When NOT to use this strategy |
| `strategies[].evidence_base` | string | Supporting framework or evidence |
| `immediate_safety_concern` | boolean | True if situation requires emergency response |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Safety Constraints

- If `immediate_safety_concern: true`, output MUST direct the practitioner to call emergency services (000 in Australia) before applying any strategy.
- Strategies MUST NOT involve physical restraint suggestions.
- Output MUST include: "These strategies support professional practice and do not replace crisis response protocols."

---

## Escalation Conditions

- `immediate_safety_concern: true` — triggers tier_1 escalation

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Acute crisis not recognised | Safety concern not detected in description | Apply safety keyword detection as hard check |
| Strategy contraindication missed | Strategy suggested when contraindicated | Require contraindication check for every strategy |
