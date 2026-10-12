# Skill: Child Safe Standards Compliance

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Check organisational practice descriptions, case records, and policy documents for alignment with the National Child Safe Standards (Australia). Identifies gaps and compliance risks. Does not constitute a formal compliance audit — outputs support internal quality review by qualified staff.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Practice description or document to check |
| `context.standards_version` | string | No | Standards version (default: `NCSS_2019`) |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `compliance_checks` | array | Per-standard compliance results |
| `compliance_checks[].standard_id` | string | Standard identifier (e.g. `NCSS_1`) |
| `compliance_checks[].standard_description` | string | Standard description |
| `compliance_checks[].status` | string | `compliant`, `partial`, `non_compliant`, `not_assessed` |
| `compliance_checks[].evidence_text` | string | Supporting evidence from input |
| `compliance_checks[].gap_description` | string | Description of gap if not compliant |
| `compliance_checks[].confidence` | number | 0.0–1.0 |
| `overall_status` | string | `compliant`, `requires_attention`, `non_compliant` |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## National Child Safe Standards (NCSS 2019)

1. Child safety is embedded in organisational leadership, governance and culture
2. Children participate in decisions affecting their safety and wellbeing
3. Families and communities are informed and involved
4. Equity is upheld and diverse needs are taken into account
5. People working with children are suitable and supported
6. Processes to respond to complaints and concerns are child focused
7. Staff and volunteers are equipped with knowledge, skills and awareness
8. Physical and online environments minimise the opportunity for abuse
9. Implementation of the child safety policy is continuously reviewed and improved
10. Policies and procedures document how the organisation is child safe

---

## Safety Constraints

- Output MUST include: "This assessment does not constitute a formal compliance audit. Engage a qualified compliance professional for formal assessment."
- `overall_status: non_compliant` MUST flag for priority management review.

---

## Escalation Conditions

- `overall_status: non_compliant` on Standards 1, 5, 6, or 8

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Incomplete input | Only partial policy or practice described | Flag `assessment_scope_limited: true` |
| Standards version lag | Newer standards not yet incorporated | Pin standards version; alert on version mismatch |
