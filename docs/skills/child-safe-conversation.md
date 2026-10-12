# Skill: Child-Safe Conversation

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Review and validate content intended for child-facing contexts to ensure it is age-appropriate, trauma-safe, non-harmful, and consistent with child-safe communication standards. This skill flags or rewrites content that fails child-safe standards before delivery.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Content to review |
| `context.child_age_years` | number | No | Target child's age |
| `context.developmental_stage` | string | No | Developmental stage |
| `mode` | string | No | `review` or `rewrite` |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `issues` | array | Child-safe issues detected |
| `issues[].issue_id` | string | Unique identifier |
| `issues[].issue_type` | string | `age_inappropriate`, `trauma_unsafe`, `frightening`, `confusing`, `boundary_violating`, `adult_burden` |
| `issues[].text_span` | object | `{start, end}` |
| `issues[].explanation` | string | Why this is an issue |
| `issues[].suggestion` | string | Recommended fix |
| `rewritten_text` | string | Safe version (only when `mode: rewrite`) |
| `passed` | boolean | True if content meets child-safe standards |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Apply age-appropriate language check against developmental norms.
2. Check for adult emotional burden being placed on child (parentification signals).
3. Check for content that could be frightening or confusing for the target age.
4. Apply trauma-safe language principles from Trauma-Informed Communication skill.

---

## Safety Constraints

- Content with `passed: false` MUST NOT be delivered to children without professional review and correction.
- `adult_burden` issues MUST always trigger a human review flag.
- MUST NOT rewrite legally required notices or formal communications.

---

## Escalation Conditions

- Any `boundary_violating` issue detected

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `issues[].text_span` for all issues

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Developmental stage unknown | Calibration not possible without age | Default to most conservative (youngest) standards |
| Rewrite changes meaning | Simplified text loses important information | Apply meaning-preservation check after rewrite |
