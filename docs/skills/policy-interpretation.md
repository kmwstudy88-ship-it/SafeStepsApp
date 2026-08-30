# Skill: Policy Interpretation

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Map case signals, concern categories, and evidence items to applicable policy obligations and procedural requirements. Helps practitioners identify which policies, legislation, or guidelines are triggered by the current case circumstances. Does not provide legal advice or a legal interpretation — identifies applicable frameworks for practitioner consideration.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `concerns` | array | Yes | Classified concern output |
| `risk_output` | object | No | Risk Assessment output |
| `context.jurisdiction` | string | Yes | Jurisdiction (e.g. `VIC`, `NSW`, `QLD`, `national`) |
| `context.case_type` | string | No | `family_law`, `child_protection`, `both` |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `policy_triggers` | array | Applicable policies and obligations |
| `policy_triggers[].trigger_id` | string | Unique identifier |
| `policy_triggers[].policy_name` | string | Policy/legislation name |
| `policy_triggers[].policy_reference` | string | Section/clause reference |
| `policy_triggers[].obligation_description` | string | What the policy requires in this context |
| `policy_triggers[].triggered_by` | array | Concern or risk signal IDs that triggered this |
| `policy_triggers[].urgency` | string | `immediate`, `within_24h`, `within_week`, `ongoing` |
| `policy_triggers[].confidence` | number | 0.0–1.0 |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Map concern categories to policy triggers using jurisdiction-specific policy mappings.
2. Apply mandatory reporting thresholds specific to jurisdiction.
3. Flag when multiple policy frameworks intersect (e.g. child protection + family law).
4. Note when policy obligations have changed recently (require version date check).

---

## Safety Constraints

- MUST include disclaimer: "Policy mapping is indicative only. Practitioners must verify applicable obligations with their organisation's legal and compliance team."
- `urgency: immediate` obligations MUST be flagged at the top of output.
- MUST NOT cite policies that have been repealed without noting their status.

---

## Escalation Conditions

- Any `urgency: immediate` policy obligation triggered
- Mandatory reporting threshold met in any jurisdiction

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `policy_triggers[].triggered_by` for traceability

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Jurisdiction not specified | Cannot apply correct policy mappings | Require `context.jurisdiction` as mandatory input |
| Outdated policy version | Recent legislative changes not reflected | Pin policy knowledge base version; flag expiry |
| Cross-jurisdiction case | Party or child in different jurisdiction | Flag multi-jurisdiction issue for legal consultation |
