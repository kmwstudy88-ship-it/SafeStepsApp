# Skill: Escalation

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Evaluate case state against the deterministic escalation matrix (`policies/escalation_matrix.yaml`) and trigger the appropriate escalation action. Escalation is non-negotiable when triggers are met — this skill does not apply probabilistic reasoning to escalation decisions.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `risk_output` | object | No | Risk Assessment output |
| `concerns` | array | No | Classified concerns |
| `contradictions` | array | No | Detected contradictions |
| `disclosure_flags` | array | No | Flags from Disclosure Sensitive skill |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `escalation_triggered` | boolean | Whether any escalation condition was met |
| `escalations` | array | Triggered escalation records |
| `escalations[].escalation_id` | string | Unique identifier |
| `escalations[].tier` | string | `tier_1_immediate`, `tier_2_urgent`, `tier_3_standard` |
| `escalations[].trigger_rule` | string | Rule ID from escalation matrix |
| `escalations[].trigger_signals` | array | Signals that activated the rule |
| `escalations[].required_action` | string | Specified action from matrix |
| `escalations[].deadline` | string | ISO 8601 deadline or null |
| `escalations[].notified_roles` | array | Roles to be notified |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Load current escalation matrix version from `policies/escalation_matrix.yaml`.
2. Evaluate each rule against the provided inputs in priority order (tier_1 first).
3. Apply ALL matching rules — do not short-circuit after first match.
4. Record which specific signals activated each rule for audit purposes.

---

## Safety Constraints

- Escalation MUST be triggered deterministically — no probabilistic suppression of tier_1 or tier_2 triggers.
- Escalation records are immutable once created.
- Tier_1 escalations MUST generate notifications within 15 minutes of case processing.

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `escalations[].trigger_signals` — full record of activating evidence

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Rule file unavailable | Escalation matrix cannot be loaded | Fail safe: treat as tier_1 escalation; alert operations |
| Conflicting rules | Multiple rules give conflicting required actions | Apply highest-tier rule; log conflict for review |
