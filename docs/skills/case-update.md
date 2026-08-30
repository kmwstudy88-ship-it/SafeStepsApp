# Skill: Case Update

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Incrementally update a live case record when new documents or events are added. Processes new inputs against the existing case state, identifies what has changed (new claims, modified risk scores, resolved requirements), and produces a structured diff for the case record.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `existing_case_snapshot` | object | Yes | Prior case state snapshot |
| `new_documents` | array of `DocumentRef` | No | Newly added documents |
| `new_events` | array | No | Manually recorded new events |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `case_diff` | object | Changes relative to previous snapshot |
| `case_diff.new_claims` | array | Claims not present in previous snapshot |
| `case_diff.resolved_requirements` | array | Requirements now marked resolved |
| `case_diff.risk_score_change` | object | `{previous, current, delta}` |
| `case_diff.new_concerns` | array | Newly classified concern categories |
| `case_diff.escalation_triggered` | boolean | Whether update triggers escalation |
| `updated_case_snapshot` | object | Full updated case state |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Run evidence extraction on new documents; merge into existing evidence graph.
2. Re-run concern classification and risk assessment on the merged graph.
3. Compare previous and current outputs to produce `case_diff`.
4. Preserve idempotency: re-running with the same inputs must produce an identical diff.

---

## Safety Constraints

- Case update MUST NOT overwrite previous snapshots — append-only audit trail.
- If `escalation_triggered: true`, update is held for human review before committing.

---

## Escalation Conditions

- New `risk_score_change.delta >= 0.20` (significant risk increase)
- Any new claim of type `abuse_incident` or `violence_indicator`

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `case_diff` is immutable once committed

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Stale snapshot | Snapshot out of sync with live record | Validate snapshot version hash before processing |
| Duplicate documents | Same document processed twice | Hash-based deduplication on document ingestion |
