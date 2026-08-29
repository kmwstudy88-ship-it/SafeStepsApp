# Skill: Evidence Extraction

**Version:** 1.0.0  
**Status:** Production  
**Schema:** `schemas/skills/evidence-extraction.output.schema.json`

---

## Purpose

Extract structured factual claims from unstructured case documents (affidavits, reports, notes, orders). Each claim is attributed to its source document and character span, enabling downstream skills (contradiction detection, risk assessment, timeline extraction) to operate on structured data rather than raw text.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `documents` | array of `DocumentRef` | Yes | Documents to process |
| `extraction_scope` | array of string | No | Limit to claim types: `factual_claim`, `allegation`, `observation`, `order_term`, `admission` |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `claims` | array | Extracted claim objects |
| `claims[].claim_id` | string | Unique claim identifier |
| `claims[].text` | string | Verbatim or near-verbatim extracted text |
| `claims[].type` | string | `factual_claim`, `allegation`, `observation`, `order_term`, `admission` |
| `claims[].date` | string | ISO 8601 date if stated or inferable, else null |
| `claims[].actors` | array of string | Named roles or parties referenced |
| `claims[].source_doc_id` | string | Document ID |
| `claims[].source_span` | object | `{start, end}` character offsets |
| `claims[].confidence` | number | 0.0–1.0 |
| `quality_flags` | array | Document-level quality warnings |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

Schema ref: `schemas/skills/evidence-extraction.output.schema.json`

---

## Processing Notes

1. Process each document independently; assign document-level quality flags (OCR quality, completeness, language).
2. Extract each discrete factual assertion as a separate claim.
3. Preserve verbatim text where possible; paraphrase only when source is unintelligible.
4. Infer actor roles from context (e.g. "the applicant", "the child's teacher") and normalise to party refs.
5. Assign `date` from explicit statements; infer from context only when confidence is high enough to warrant inclusion.

---

## Confidence Scoring Guidance

| Band | Range | Meaning |
|---|---|---|
| High | 0.80–1.00 | Explicit, unambiguous statement in source |
| Medium | 0.50–0.79 | Paraphrased or requires minor inference |
| Low | 0.20–0.49 | Heavily inferred or ambiguous |
| Uncertain | 0.00–0.19 | Near-illegible or contradictory source |

---

## Safety Constraints

- Claims of type `allegation` MUST be labelled as such and MUST NOT be presented as established facts in downstream outputs without professional verification.
- PII (full names, addresses, contact details) must be replaced with role labels unless a specific PII-inclusion permission flag is set on the request.
- Outputs MUST NOT include model-generated elaboration — extraction only, no synthesis.

---

## Escalation Conditions

- Any claim containing abuse, neglect, or violence indicators of `confidence >= 0.70`
- Any claim referencing imminent risk to a child
- Five or more `quality_flags` of severity `high` on a single document

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `claims[].source_doc_id` and `claims[].source_span` for every claim

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| OCR errors | Garbled text leads to missed or corrupted claims | Set `quality_flag: ocr_poor`; cap confidence at 0.50 |
| Dense legal prose | Complex nested sentences split into incorrect claim units | Apply sentence boundary detection tuned for legal text |
| Undated claims | No date inferable; downstream timeline fails | Return `date: null` and flag for manual date assignment |
| Role ambiguity | "She" references unclear across long documents | Apply coreference resolution; flag remaining ambiguities |
