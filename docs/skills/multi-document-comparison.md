# Skill: Multi-Document Comparison

**Version:** 1.0.0  
**Status:** Production  
**Schema:** `schemas/skills/multi-document-comparison.output.schema.json`

---

## Purpose

Align claims and facts across multiple source documents to identify points of agreement, disagreement, and omission. Outputs a structured comparison matrix that supports practitioners in understanding how different reports, orders, and submissions relate to each other.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `documents` | array of `DocumentRef` | Yes | At least 2 documents |
| `comparison_scope` | array of string | No | Limit to topics: `facts`, `orders`, `allegations`, `timelines` |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `comparisons` | array | Per-topic comparison results |
| `comparisons[].topic` | string | Topic or event being compared |
| `comparisons[].document_positions` | array | Each document's position on the topic |
| `comparisons[].document_positions[].doc_id` | string | Document identifier |
| `comparisons[].document_positions[].position` | string | Verbatim or summarised position |
| `comparisons[].document_positions[].source_span` | object | `{start, end}` |
| `comparisons[].alignment` | string | `agreed`, `conflicted`, `omission`, `partial` |
| `comparisons[].significance` | string | `low`, `moderate`, `high` |
| `comparisons[].confidence` | number | 0.0–1.0 |
| `summary` | object | Counts by alignment type |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Extract claims from all documents (or use pre-extracted claims).
2. Cluster claims by semantic topic using canonical taxonomy categories.
3. For each topic, compare all document positions and determine alignment.
4. Flag omissions where a topic covered in one document is entirely absent from another.

---

## Confidence Scoring Guidance

- High (0.80–1.00): explicit statements in all documents; alignment is unambiguous
- Medium (0.50–0.79): some documents implicit or indirect
- Low (0.20–0.49): comparison requires significant inference

---

## Safety Constraints

- Comparisons involving child safety allegations MUST be reviewed by a professional before being shared externally.
- MUST NOT produce a verdict on which document version is correct.

---

## Escalation Conditions

- `alignment: conflicted` on any topic with `significance: high` and `confidence >= 0.70`
- `alignment: omission` on any child safety topic

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- Per-position `source_span` for every document

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Document type mismatch | Comparing incompatible document types | Validate document types are comparable before execution |
| Topic proliferation | Too many micro-topics fragment the comparison | Apply topic consolidation using taxonomy hierarchy |
| One-sided inputs | Only one document provided | Require minimum 2 documents at input validation |
