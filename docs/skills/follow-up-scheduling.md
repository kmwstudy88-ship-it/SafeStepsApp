# Skill: Follow-Up Scheduling

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Generate a structured list of follow-up tasks and deadlines for a case, derived from extracted requirements, risk level, escalation status, and case timeline. Outputs are intended for professional review and task management systems — they do not autonomously schedule or take actions.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `requirements_output` | object | No | Requirement Extraction output |
| `risk_output` | object | No | Risk Assessment output |
| `escalations` | array | No | Active escalation records |
| `reference_date` | string | No | ISO 8601 date for relative deadline calculation (default: today) |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `tasks` | array | Follow-up task objects |
| `tasks[].task_id` | string | Unique task identifier |
| `tasks[].title` | string | Short task description |
| `tasks[].description` | string | Detailed task instruction |
| `tasks[].priority` | string | `immediate`, `high`, `standard`, `low` |
| `tasks[].due_date` | string | ISO 8601 deadline or null |
| `tasks[].assigned_role` | string | Suggested responsible role |
| `tasks[].source_requirement_id` | string | Linked requirement ID or null |
| `tasks[].source_escalation_id` | string | Linked escalation ID or null |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Generate a task for every active, unresolved requirement with an upcoming deadline.
2. Generate tasks for all active escalation records that require follow-up actions.
3. Generate risk-driven check-in tasks when `risk_level` is `high` or `critical` (suggest 48-hour follow-up).
4. Do not generate duplicate tasks for the same requirement/escalation.

---

## Safety Constraints

- Tasks of `priority: immediate` MUST be generated for all tier_1 escalations.
- Task descriptions MUST NOT contain PII — use role labels.
- MUST include disclaimer: tasks require professional review before action.

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- Task source linkage (`source_requirement_id`, `source_escalation_id`) for traceability

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| No deadline inferable | Requirement has no date; task due date is null | Flag task as `due_date_required: true` for manual assignment |
| Role ambiguity | Responsible role for requirement is unclear | Use generic `case_worker` role and flag for assignment |
