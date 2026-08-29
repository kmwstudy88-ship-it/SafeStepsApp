# Skill: Trauma-Informed Communication

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Review and rewrite professional communications and case-facing outputs to ensure they meet trauma-informed language standards. This skill validates tone, avoids re-traumatising language, and ensures outputs do not blame, shame, or minimise the experiences of individuals affected by trauma. For use by professionals — not for direct delivery to clients without professional review.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Text to review or rewrite |
| `context.audience` | string | No | `client`, `professional`, `child` |
| `context.trauma_type` | array of string | No | Relevant trauma context (e.g. `domestic_violence`, `child_abuse`, `loss`) |
| `mode` | string | No | `review` (flag issues only) or `rewrite` (suggest improved version) |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `issues` | array | Detected language issues |
| `issues[].issue_id` | string | Unique identifier |
| `issues[].text_span` | object | `{start, end}` in input text |
| `issues[].issue_type` | string | `blaming`, `shaming`, `minimising`, `clinical_jargon`, `triggering`, `passive_voice_obscuring_agency` |
| `issues[].explanation` | string | Why this is problematic |
| `issues[].suggestion` | string | Alternative phrasing |
| `rewritten_text` | string | Improved version (only when `mode: rewrite`) |
| `tone_score` | number | 0.0–1.0 (1 = fully trauma-informed) |
| `passed` | boolean | Whether text meets minimum threshold (>= 0.70) |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Apply trauma-informed language checklist: avoid blame, shame, pathologising terms, minimising language.
2. Prefer person-first language ("person experiencing homelessness" not "homeless person").
3. Prefer active voice that preserves agency.
4. Flag clinical or legal jargon unsuitable for client-facing text.
5. In `rewrite` mode, preserve factual content — only improve tone and framing.

---

## Confidence Scoring Guidance

`tone_score` reflects the proportion of text that meets trauma-informed standards.

---

## Safety Constraints

- Rewritten text MUST preserve factual accuracy — no synthesis or omission of facts.
- `mode: rewrite` outputs MUST be reviewed by a qualified professional before delivery to clients.
- MUST NOT rewrite statutory notices or legal orders.

---

## Escalation Conditions

- If input text contains a disclosure indicator (from Disclosure Sensitive skill), halt and escalate before reviewing tone.

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `issues[].text_span` for all flagged issues

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Over-sanitisation | Rewrite removes important factual nuance | Require factual consistency check after rewrite |
| Jargon detection gap | Domain-specific trauma language missed | Maintain updated jargon dictionary per domain |
| False positives | Clinical terms flagged in professional-to-professional context | Apply audience context to calibrate thresholds |
