# Skill: Case Packet Builder

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Assemble audience-specific case summary packets from structured skill outputs (evidence, timeline, risk assessment, requirements). The packet builder applies audience-appropriate language and detail levels for lawyers, social workers, parents, and judicial officers. It does not generate new analysis — it organises and presents existing skill outputs.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `audience` | string | Yes | `lawyer`, `social_worker`, `parent`, `judicial_officer` |
| `evidence_output` | object | Yes | Evidence Extraction output |
| `timeline_output` | object | No | Timeline Extraction output |
| `risk_output` | object | No | Risk Assessment output |
| `requirements_output` | object | No | Requirement Extraction output |
| `include_sections` | array of string | No | Override default sections for audience |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `packet` | object | Assembled case packet |
| `packet.audience` | string | Target audience |
| `packet.sections` | array | Ordered content sections |
| `packet.sections[].title` | string | Section heading |
| `packet.sections[].content` | string | Formatted content |
| `packet.sections[].source_skill_outputs` | array | Skills whose outputs contributed |
| `packet.generated_at` | string | ISO 8601 timestamp |
| `packet.disclaimer` | string | Mandatory professional review disclaimer |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Apply audience-specific templates:
   - `lawyer`: include full source spans, legal citations, and requirement compliance status
   - `social_worker`: emphasise risk domain scores, protective factors, and action items
   - `parent`: plain language, no jargon, no raw risk scores, no allegation details
   - `judicial_officer`: executive summary with evidence quality flags
2. Always include mandatory disclaimer.
3. Strip PII from parent-facing outputs unless PII inclusion is explicitly authorised.

---

## Safety Constraints

- Parent-facing packets MUST NOT include raw risk scores or allegation text without professional review approval.
- All packets MUST include: `disclaimer: "This summary is AI-assisted. It must be reviewed by a qualified professional before any action is taken."`.
- Outputs for `judicial_officer` audience MUST preserve source span references for every factual statement.

---

## Escalation Conditions

- If `risk_output.risk_level` is `high` or `critical`, packet generation is gated pending human review.

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `packet.sections[].source_skill_outputs` for traceability

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Missing key inputs | Critical section cannot be populated | Omit section and flag as `data_unavailable` |
| Audience mismatch | Wrong audience template selected | Validate `audience` enum at input |
| PII leakage | PII present in source claims surfaces in parent packet | Apply PII redaction pass before parent-facing rendering |
