# Skill: Cultural Safety

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Assess the cultural safety and responsiveness of case content, professional communications, and organisational practice descriptions. Particular focus on First Nations children and families, CALD (Culturally and Linguistically Diverse) communities, and families from minority cultural backgrounds. Outputs support cultural consultation and adaptation — they do not replace community-led cultural advice.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Text to assess |
| `context.cultural_background` | array of string | No | Relevant cultural backgrounds (e.g. `first_nations`, `cald`, `refugee`) |
| `context.document_type` | string | No | Type of document |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `cultural_safety_issues` | array | Detected cultural safety concerns |
| `cultural_safety_issues[].issue_id` | string | Unique identifier |
| `cultural_safety_issues[].type` | string | `cultural_blindness`, `deficit_framing`, `assimilation_assumption`, `protocol_omission`, `interpreter_not_noted`, `community_consultation_absent` |
| `cultural_safety_issues[].text_span` | object | `{start, end}` |
| `cultural_safety_issues[].explanation` | string | Why this is a cultural safety concern |
| `cultural_safety_issues[].recommendation` | string | Suggested improvement |
| `cultural_safety_issues[].severity` | string | `low`, `moderate`, `high` |
| `requires_cultural_consultation` | boolean | True if cultural expert consultation is recommended |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Flag absence of interpreter usage notation in documents involving CALD families.
2. Flag absence of First Nations cultural liaison or community consultation in child protection decisions.
3. Apply deficit framing detection tuned to cultural contexts.
4. Note when Western parenting norms are applied without cultural contextualisation.

---

## Safety Constraints

- MUST NOT make determinations about cultural practices being harmful without expert cultural consultation.
- Output must include: "Cultural safety assessment requires verification by a qualified cultural consultant or community representative."
- `requires_cultural_consultation: true` is mandatory for any First Nations case involving child removal.

---

## Escalation Conditions

- Any `type: community_consultation_absent` in a First Nations case with `severity: high`
- Any decision document that lacks cultural consideration for a CALD family with `severity: high`

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `cultural_safety_issues[].text_span`

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Cultural background not specified | Cannot apply targeted assessment | Apply general cultural safety checks; flag `cultural_background_unknown: true` |
| AI cultural knowledge gaps | Model does not have accurate knowledge of specific cultural practices | Flag for community consultation; do not speculate |
