# Skill: Fairness Detection

**Version:** 1.0.0  
**Status:** Production  
**Schema:** `schemas/skills/fairness-detection.output.schema.json`

---

## Purpose

Identify procedural fairness failures in the handling of a family law or child protection case. This includes detecting asymmetric information sharing, denial of opportunity to respond, inadequate notice, and institutional bias indicators. Outputs support professionals in identifying whether parties received equitable treatment — it does not constitute legal advice or a ruling.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `documents` | array of `DocumentRef` | Yes | Source documents to analyse |
| `parties` | array of `PartyRef` | Yes | Named parties in the case |
| `context.jurisdiction` | string | No | Jurisdiction for procedural norms |

Schema ref: `schemas/common.schema.json#/$defs/DocumentRef`, `schemas/common.schema.json#/$defs/PartyRef`

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `fairness_issues` | array | List of detected fairness issues |
| `fairness_issues[].issue_id` | string | Unique issue identifier |
| `fairness_issues[].category` | string | One of: `procedural`, `informational`, `representational`, `institutional` |
| `fairness_issues[].description` | string | Plain-language description |
| `fairness_issues[].affected_party` | string | Party ref ID |
| `fairness_issues[].source_span` | object | `{doc_id, start, end}` |
| `fairness_issues[].confidence` | number | 0.0–1.0 |
| `overall_fairness_score` | number | Aggregate score 0 (very unfair) to 1 (fair) |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

Schema ref: `schemas/skills/fairness-detection.output.schema.json`

---

## Processing Notes

1. For each party, enumerate procedural steps where participation is expected (hearings, submissions, disclosure).
2. Check whether each step was completed symmetrically across parties.
3. Flag any step where evidence shows a party was excluded, uninformed, or given insufficient time to respond.
4. Score confidence based on explicitness of source evidence: explicit document evidence scores higher than inferred absence.

---

## Confidence Scoring Guidance

| Band | Range | Meaning |
|---|---|---|
| High | 0.80–1.00 | Direct textual evidence of the issue |
| Medium | 0.50–0.79 | Indirect or inferred evidence |
| Low | 0.20–0.49 | Weak signal, further review required |
| Uncertain | 0.00–0.19 | Insufficient evidence; flag for human review |

---

## Safety Constraints

- Output MUST NOT include diagnostic statements about a party's character or intent.
- Output MUST NOT constitute legal advice or a finding of law.
- Outputs with `confidence < 0.40` MUST include `uncertainty_disclosure: true`.
- PII must not appear in `description` fields beyond role labels (e.g. "mother", "respondent").

---

## Escalation Conditions

Trigger escalation per `policies/escalation_matrix.yaml` when:
- `overall_fairness_score < 0.30` — critical procedural fairness failure
- Any issue of category `institutional` with `confidence >= 0.70`
- Any detected exclusion of a vulnerable party (child, victim of DV)

---

## Audit Fields

All output records include:
- `run_meta.skill_version` — skill version that produced this output
- `run_meta.model` — AI model used
- `run_meta.timestamp_utc` — ISO 8601 UTC timestamp
- `fairness_issues[].source_span` — character-level source attribution

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Missing documents | Incomplete document set leads to false "fair" assessment | Require minimum document coverage check at input validation |
| Party name variation | Same party referred to by different names across docs | Apply party normalisation prior to skill execution |
| Implicit procedural norms | Jurisdiction-specific norms not encoded | Flag `context.jurisdiction` and apply default conservative norms |
| Low-quality OCR | Poor extraction from scanned documents reduces confidence | Cap confidence at 0.60 when source quality flag is `low` |
