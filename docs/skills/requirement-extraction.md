# Skill: Requirement Extraction

**Version:** 1.0.0  
**Status:** Production  
**Schema:** `schemas/skills/requirement-extraction.output.schema.json`

---

## Purpose

Extract legally binding obligations, conditions, and procedural requirements from court orders, parenting plans, consent orders, and other formal agreements. Each extracted requirement is attributed to its source and assigned a responsible party, enabling compliance tracking and follow-up scheduling.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `documents` | array of `DocumentRef` | Yes | Formal documents containing requirements |
| `parties` | array of `PartyRef` | Yes | Named parties for obligation assignment |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `requirements` | array | Extracted requirement objects |
| `requirements[].requirement_id` | string | Unique requirement identifier |
| `requirements[].text` | string | Verbatim or near-verbatim requirement text |
| `requirements[].type` | string | `order_term`, `condition`, `prohibition`, `obligation`, `consent_term` |
| `requirements[].responsible_party` | string | Party ref ID |
| `requirements[].deadline` | string | ISO 8601 date or null |
| `requirements[].periodicity` | string | `once`, `weekly`, `fortnightly`, `monthly`, `ongoing`, null |
| `requirements[].status` | string | `active`, `expired`, `superseded`, `unknown` |
| `requirements[].source_doc_id` | string | Source document ID |
| `requirements[].source_span` | object | `{start, end}` character offsets |
| `requirements[].confidence` | number | 0.0–1.0 |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Focus extraction on imperative language ("must", "shall", "is required to", "is prohibited from").
2. Distinguish time-bound requirements from ongoing obligations.
3. Flag requirements that appear ambiguous as to which party is responsible.
4. Detect superseded requirements when an amendment order is present.

---

## Confidence Scoring Guidance

| Band | Range | Meaning |
|---|---|---|
| High | 0.80–1.00 | Clear imperative language with explicit party and scope |
| Medium | 0.50–0.79 | Implied obligation or partially explicit |
| Low | 0.20–0.49 | Inferred from context only |

---

## Safety Constraints

- Output MUST NOT constitute legal advice or interpretation of legal effect.
- Requirements of type `prohibition` affecting child contact MUST trigger a review flag.
- Deadline fields MUST use ISO 8601; ambiguous dates must be set to null with a quality flag.

---

## Escalation Conditions

- Any `prohibition` relating to child contact with `confidence >= 0.75`
- Any requirement with no identifiable `responsible_party`
- More than 10 requirements with `status: unknown` in a single document

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- Per-requirement `source_doc_id` and `source_span`

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Compound requirements | Single clause contains multiple obligations | Split at conjunction boundaries; flag for review |
| Conditional requirements | "If X then Y" — conditions not met, requirement inactive | Model condition state; mark `status: unknown` if state unknown |
| Amendment detection | Superseded terms extracted as active | Detect effective dates and order sequence |
| Party ambiguity | Pronoun reference unclear for obligation assignment | Flag `responsible_party: ambiguous` |
