# Skill: Timeline Extraction

**Version:** 1.0.0  
**Status:** Production  
**Schema:** `schemas/skills/timeline-extraction.output.schema.json`

---

## Purpose

Construct a chronological sequence of events from case documents. A reliable timeline enables practitioners to identify gaps, spot inconsistencies in reported sequences, and prepare case summaries. Events are sourced from extracted claims and attributed to their origin documents.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `claims` | array of `ClaimRef` | No | Pre-extracted claims (Evidence Extraction output) |
| `documents` | array of `DocumentRef` | No | Raw documents (processed if `claims` not provided) |

At least one of `claims` or `documents` must be supplied.

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `events` | array | Ordered event objects (ascending date) |
| `events[].event_id` | string | Unique event identifier |
| `events[].description` | string | Plain-language event description |
| `events[].date` | string | ISO 8601 date |
| `events[].date_precision` | string | `exact`, `approximate`, `inferred` |
| `events[].actors` | array of string | Party roles involved |
| `events[].claim_ids` | array of string | Supporting claim IDs |
| `events[].source_spans` | array | `[{doc_id, start, end}]` |
| `events[].confidence` | number | 0.0–1.0 |
| `gaps` | array | Detected temporal gaps in the timeline |
| `gaps[].gap_id` | string | Unique gap identifier |
| `gaps[].period_start` | string | ISO 8601 |
| `gaps[].period_end` | string | ISO 8601 |
| `gaps[].significance` | string | `low`, `moderate`, `high` |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Sort all dated claims chronologically; cluster events within a 24-hour window.
2. For `date_precision: approximate`, use mid-point of stated range.
3. Detect gaps longer than 30 days in cases involving minors; flag as `significance: high`.
4. Events without dates are appended to an `undated_events` list and excluded from gap analysis.

---

## Confidence Scoring Guidance

| Band | Range | Meaning |
|---|---|---|
| High | 0.80–1.00 | Explicit date stated in source |
| Medium | 0.50–0.79 | Date inferred from adjacent context |
| Low | 0.20–0.49 | Date estimated from document metadata only |

---

## Safety Constraints

- Undated events MUST NOT be silently dropped — they must appear in `undated_events`.
- Timeline outputs used in hearing preparation packets MUST display `date_precision` for every event.
- Do not reorder events when dates are equal — preserve document order.

---

## Escalation Conditions

- Gap of more than 90 days during an active supervision order period
- Any event of type `abuse_incident` or `medical_emergency` with `confidence >= 0.70`

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `events[].source_spans` for every event

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Date format variation | "5th March", "05/03", "March 5" all need normalisation | Apply date normalisation pipeline |
| Retroactive entries | Entries written about past events without clear distinction | Flag `date_precision: inferred` with lower confidence |
| Duplicate events | Same event extracted from two documents twice | Deduplicate on (date ± 1 day, actor set, event type) |
| Relative dates | "Three weeks ago" without document date anchor | Resolve against document creation date; flag as `approximate` |
