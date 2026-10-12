# Skill: Contradiction Detection

**Version:** 1.0.0  
**Status:** Production  
**Schema:** `schemas/skills/contradiction-detection.output.schema.json`

---

## Purpose

Surface conflicting statements and claims across multiple case documents. Contradictions may be temporal (different dates for the same event), factual (different accounts of the same event), source conflicts (two parties give incompatible versions), or omissions (a fact present in one document is absent in another where it would be expected). This skill produces structured contradiction records for professional review — it does not determine which version is true.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `documents` | array of `DocumentRef` | Yes | Documents to compare |
| `evidence_graph` | `EvidenceGraph` | No | Pre-extracted evidence items (from Evidence Extraction skill) |

Schema ref: `schemas/common.schema.json#/$defs/DocumentRef`, `schemas/common.schema.json#/$defs/EvidenceGraph`

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `contradictions` | array | Detected contradictions |
| `contradictions[].contradiction_id` | string | Unique identifier |
| `contradictions[].type` | string | `temporal`, `factual`, `source_conflict`, `omission` |
| `contradictions[].claim_a` | `ClaimRef` | First claim in the contradiction |
| `contradictions[].claim_b` | `ClaimRef` | Conflicting claim |
| `contradictions[].description` | string | Plain-language explanation of conflict |
| `contradictions[].significance` | string | `low`, `moderate`, `high`, `critical` |
| `contradictions[].confidence` | number | 0.0–1.0 |
| `summary_count` | object | Counts by type and significance |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

Schema ref: `schemas/skills/contradiction-detection.output.schema.json`

---

## Processing Notes

1. If `evidence_graph` is provided, use it as the primary input; otherwise extract claims internally.
2. For each pair of claims referencing the same event/entity, apply conflict detection:
   - Temporal: check date/time alignment
   - Factual: check description consistency
   - Source: compare actor-attributed statements
   - Omission: check for expected corroboration that is absent
3. Score significance based on: topic sensitivity (child safety > administrative), claim specificity, and number of corroborating/contradicting sources.

---

## Confidence Scoring Guidance

| Band | Range | Meaning |
|---|---|---|
| High | 0.80–1.00 | Claims are explicitly stated and directly contradict |
| Medium | 0.50–0.79 | Implied or partially overlapping contradiction |
| Low | 0.20–0.49 | Weak inference requiring professional judgement |
| Uncertain | 0.00–0.19 | Insufficient basis; flag for human review |

---

## Safety Constraints

- MUST NOT assign blame or determine credibility of parties.
- MUST NOT speculate on intent behind contradictions.
- `significance: critical` contradictions MUST trigger escalation review.
- Output MUST include `uncertainty_disclosure: true` when `confidence < 0.50`.

---

## Escalation Conditions

- Any `significance: critical` contradiction
- Any `type: omission` regarding child safety, medical, or abuse-related facts with `confidence >= 0.65`
- More than 3 `significance: high` contradictions in a single case

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `claim_a.source_span`, `claim_b.source_span` — character-level attribution for both sides

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| False positives from paraphrase | Semantically equivalent statements flagged as contradictions | Apply semantic similarity threshold before flagging |
| Cross-lingual documents | Documents in different languages not compared accurately | Require normalised language input or flag for manual review |
| Missing reference claim | One side of contradiction is implied, not stated | Mark as `type: omission` with lower confidence cap |
| Update/amendment confusion | Later document intentionally supersedes earlier — not a contradiction | Detect amendment markers and downgrade significance |
