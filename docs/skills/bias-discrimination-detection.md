# Skill: Bias & Discrimination Detection

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Flag potentially biased or discriminatory language in case documents, professional notes, and system outputs. Covers racial, cultural, gender, disability, and socioeconomic bias. Supports quality review processes and equity obligations. Does not determine intent — flags language for professional review.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Text to review |
| `context.document_type` | string | No | Type of document |
| `context.author_role` | string | No | Professional role of author |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `bias_flags` | array | Detected bias instances |
| `bias_flags[].flag_id` | string | Unique identifier |
| `bias_flags[].bias_type` | string | `racial`, `cultural`, `gender`, `disability`, `socioeconomic`, `age`, `religious` |
| `bias_flags[].text_span` | object | `{start, end}` |
| `bias_flags[].explanation` | string | Why this is a potential bias indicator |
| `bias_flags[].severity` | string | `low`, `moderate`, `high` |
| `bias_flags[].suggestion` | string | More equitable alternative |
| `bias_detected` | boolean | Any flag with `severity: moderate` or `high` |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Focus on language patterns associated with stereotyping, deficit framing, and unequal scrutiny.
2. Flag generalisations attributing behaviour to cultural/racial group membership.
3. Flag deficit language about disability, mental health, or socioeconomic status.
4. Apply intersectionality awareness — single sentence may carry multiple bias types.

---

## Safety Constraints

- MUST NOT accuse a specific author of intentional discrimination — flag language, not intent.
- Flags must be actionable: every `severity: high` flag MUST include a `suggestion`.
- `bias_detected: true` with `severity: high` in a court-filed document MUST trigger professional review before submission.

---

## Escalation Conditions

- `bias_detected: true` with `severity: high`
- Any `bias_type: racial` or `cultural` in a risk assessment or recommendation document

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `bias_flags[].text_span`

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| False positives on professional terminology | Clinical terms misread as bias | Maintain allowlist of professional/clinical terminology |
| Intersectional blindness | Multiple co-occurring bias signals not cross-referenced | Apply multi-label bias detection |
| Subtle institutional bias | Systemic patterns not captured at phrase level | Flag for periodic human audit of aggregate outputs |
