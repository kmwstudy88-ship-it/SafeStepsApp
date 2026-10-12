# Skill: Boundary & Privacy

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Identify boundary violations and privacy risks in case text, professional communications, and system outputs. This includes inappropriate sharing of third-party information about a child, role boundary violations by professionals, and privacy risks that could endanger a family's safety (e.g. location disclosure in a family violence context).

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Text to review |
| `context.case_concerns` | array of string | No | Active concern categories (especially `family_violence`) |
| `context.document_type` | string | No | Type of document being reviewed |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `violations` | array | Detected violations |
| `violations[].violation_id` | string | Unique identifier |
| `violations[].type` | string | `pii_exposure`, `location_risk`, `third_party_disclosure`, `role_boundary_violation`, `consent_absence` |
| `violations[].severity` | string | `low`, `moderate`, `high`, `critical` |
| `violations[].text_span` | object | `{start, end}` |
| `violations[].explanation` | string | Why this is a violation |
| `violations[].recommended_action` | string | How to remediate |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Flag any location information (addresses, suburb names) in family violence cases as `location_risk: critical`.
2. Flag professional disclosures of client information beyond case need as `role_boundary_violation`.
3. Detect third-party personal information shared without apparent consent basis.

---

## Safety Constraints

- `severity: critical` violations MUST block document sharing/export until remediated.
- Location information in family violence cases MUST be treated as `critical` regardless of context.
- MUST NOT attempt to redact content automatically — flag for professional action.

---

## Escalation Conditions

- Any `type: location_risk` with `severity: high` or `critical` in a family violence case
- Any `type: pii_exposure` affecting a child identifier

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `violations[].text_span`

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| PII in non-standard format | Phone numbers or addresses in unusual formats missed | Apply format-flexible PII detection patterns |
| Pseudonymised PII | Pseudonyms used consistently — real identity not exposed | Note: pseudonymous data is acceptable; only flag if re-identification risk exists |
