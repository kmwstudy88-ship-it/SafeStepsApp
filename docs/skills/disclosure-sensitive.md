# Skill: Disclosure Sensitive

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Detect indicators of abuse, trauma, or harm disclosure in text — whether direct disclosures, partial disclosures, or behavioural indicators of undisclosed abuse. This skill is a mandatory early-stage gate: any text containing disclosure indicators must be processed through this skill before other skills proceed. Detection triggers immediate escalation and mandatory reporting workflows.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Text to screen |
| `context.source_type` | string | No | `client_narrative`, `professional_note`, `intake_form`, `chat_message` |
| `context.speaker_role` | string | No | Role of author/speaker |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `disclosure_flags` | array | Detected disclosure indicators |
| `disclosure_flags[].flag_id` | string | Unique identifier |
| `disclosure_flags[].type` | string | `direct_disclosure`, `partial_disclosure`, `behavioural_indicator`, `third_party_report` |
| `disclosure_flags[].harm_category` | string | `physical_abuse`, `sexual_abuse`, `emotional_abuse`, `neglect`, `family_violence`, `exploitation` |
| `disclosure_flags[].text_span` | object | `{start, end}` |
| `disclosure_flags[].confidence` | number | 0.0–1.0 |
| `disclosure_detected` | boolean | True if any flag with `confidence >= 0.55` detected |
| `mandatory_report_indicated` | boolean | True if disclosure type and confidence meet mandatory reporting threshold |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Apply keyword and pattern detection for explicit disclosure language.
2. Apply contextual inference for implicit/behavioural indicators.
3. `mandatory_report_indicated` is determined by: `direct_disclosure` or `partial_disclosure` with `confidence >= 0.65`, or any `harm_category: sexual_abuse` with `confidence >= 0.55`.
4. This skill must not suppress or minimise any disclosure signal — err on the side of flagging.

---

## Safety Constraints

- `disclosure_detected: true` MUST immediately pause all other processing and trigger escalation.
- `mandatory_report_indicated: true` MUST generate a tier_1 escalation with mandatory notification to the responsible practitioner within 15 minutes.
- Disclosure content MUST be preserved verbatim in audit records — no redaction.
- This skill MUST NOT provide advice on whether to make a mandatory report — that is a professional decision.

---

## Escalation Conditions

- Any `disclosure_detected: true` — tier_1 escalation
- Any `harm_category: sexual_abuse` regardless of confidence level

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `disclosure_flags[].text_span` — verbatim source preservation
- Immutable audit record on every execution regardless of outcome

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Euphemistic language | Disclosure uses indirect or culturally specific language | Maintain culturally-aware disclosure lexicon |
| Child vocabulary | Young child's language not matched by patterns | Include simplified vocabulary patterns for developmental stages |
| False negative risk | Most dangerous failure mode | Set confidence threshold low (0.55); prefer false positive over false negative |
