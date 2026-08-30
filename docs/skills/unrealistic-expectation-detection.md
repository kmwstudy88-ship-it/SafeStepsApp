# Skill: Unrealistic Expectation Detection

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Identify stated expectations in case documents or party submissions that are clinically, developmentally, or legally implausible given the case context. This supports practitioners in preparing parties for realistic outcomes and identifying potential sources of future non-compliance or conflict.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `case_id` | string | Yes | Unique case identifier |
| `claims` | array of `ClaimRef` | Yes | Extracted claims and submissions |
| `context.child_age_years` | number | No | Child age for developmental calibration |
| `context.case_type` | string | No | `family_law`, `child_protection`, `both` |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `flagged_expectations` | array | Detected unrealistic expectations |
| `flagged_expectations[].expectation_id` | string | Unique identifier |
| `flagged_expectations[].text` | string | The stated expectation |
| `flagged_expectations[].unrealism_type` | string | `clinical`, `developmental`, `legal`, `logistical` |
| `flagged_expectations[].explanation` | string | Why this expectation is flagged |
| `flagged_expectations[].claim_id` | string | Source claim |
| `flagged_expectations[].confidence` | number | 0.0–1.0 |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Processing Notes

1. Check claims for outcome predictions, demands, or stated requirements from parties.
2. Compare against age-appropriate developmental norms, standard legal outcomes, and clinical evidence base.
3. Flag where the expectation contradicts established research, standard practice, or legal precedent.

---

## Confidence Scoring Guidance

- High (0.80–1.00): expectation directly contradicts established clinical or legal standard
- Medium (0.50–0.79): expectation is atypical but potentially achievable
- Low (0.20–0.49): expectation may be unusual but requires practitioner judgement

---

## Safety Constraints

- MUST NOT tell parties their expectations are wrong in user-facing outputs — outputs are for professional review only.
- MUST NOT cite specific cases or statutes without verified references.
- Outputs MUST include `disclaimer: "For professional review only. Does not constitute legal or clinical advice."`.

---

## Escalation Conditions

- Any expectation of type `legal` that implies a party believes they can circumvent a court order (confidence >= 0.70)

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `flagged_expectations[].claim_id` for source traceability

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Cultural context gap | Expectation is culturally normative but outside mainstream norms | Flag for cultural safety review before output |
| Evolving law | Legal position has changed recently | Pin knowledge base version; flag for practitioner verification |
