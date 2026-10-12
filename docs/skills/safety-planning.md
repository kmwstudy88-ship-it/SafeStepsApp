# Skill: Safety Planning

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Generate structured safety plan components to support a child or family in identified risk situations. Safety plans are templates for professional adaptation — they are not delivered directly to clients without practitioner review and customisation. The skill draws on risk assessment outputs and identified protective factors.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `risk_output` | object | Yes | Risk Assessment output |
| `context.parties` | array of string | No | Roles involved in safety plan |
| `context.living_situation` | string | No | Brief description of current living situation |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `safety_plan_components` | array | Plan component objects |
| `safety_plan_components[].component_id` | string | Unique identifier |
| `safety_plan_components[].type` | string | `warning_sign`, `protective_action`, `safe_contact`, `emergency_contact`, `support_network`, `professional_support` |
| `safety_plan_components[].description` | string | Component description |
| `safety_plan_components[].instructions` | string | Plain-language instructions for practitioner to adapt |
| `safety_plan_components[].applicable_risk_domain` | string | Risk domain this addresses |
| `disclaimer` | string | Mandatory professional review disclaimer |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Map risk domain scores to relevant safety plan component types.
2. High `family_violence` scores MUST generate emergency contact and safe house components.
3. High `parenting_capacity` scores should generate professional support components.
4. Use plain language suitable for practitioner adaptation to client vocabulary.

---

## Safety Constraints

- MUST NOT produce a completed safety plan — only components for professional adaptation.
- MUST include disclaimer: "Safety plans must be developed collaboratively with the client by a qualified professional."
- Plans involving family violence MUST include emergency services contact (000 in Australia).

---

## Escalation Conditions

- `risk_output.risk_level: critical` — plan components generated but case escalated before use.

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Generic plan components | Components not contextualised to case | Require risk output as input for contextualisation |
| Missing emergency contacts | Contact details not available | Flag `emergency_contact_required: true` for practitioner to complete |
