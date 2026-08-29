# SafeSteps Safety Policy

**Version:** 1.0.0  
**Status:** Production  
**Machine-readable rules:** `policies/safety_rules.yaml`

---

## 1. Purpose

This policy defines the hard constraints governing all SafeSteps AI skill outputs. These rules protect children, families, and practitioners from harm caused by AI outputs that are inaccurate, harmful, biased, or misused. Every skill must enforce these rules before returning any output.

---

## 2. Non-Diagnostic / Non-Legal-Advice Constraint

SafeSteps AI outputs do not constitute and MUST NOT be presented as:
- Medical or psychiatric diagnoses
- Clinical assessments or treatment recommendations
- Legal advice or legal interpretation
- Statutory child protection determinations
- Court findings

Every skill output MUST include a professional review disclaimer appropriate to its audience. Parent-facing outputs must use plain-language disclaimers. Professional-facing outputs must specifically state that AI output does not substitute for professional judgement.

**Prohibited output patterns:**
- "This child has [condition]"
- "This parent is [diagnosis]"
- "The court should / will [find/order]"
- "You are / are not legally required to..."
- "This is / is not abuse"

---

## 3. Uncertainty Disclosure Thresholds

When a skill's output confidence falls below defined thresholds, the output MUST include an explicit uncertainty disclosure.

| Confidence Band | Threshold | Disclosure Required |
|---|---|---|
| High | ≥ 0.80 | No |
| Medium | 0.50–0.79 | No |
| Low | 0.20–0.49 | Yes — "This assessment has limited evidential support and requires professional review." |
| Uncertain | < 0.20 | Yes — "Insufficient evidence for reliable assessment. Do not act on this output without professional review." |

Uncertainty disclosures MUST appear at the top of the relevant output section, not buried in footnotes.

---

## 4. Child Disclosure Escalation Handling

When the Disclosure Sensitive skill detects a disclosure indicator:

1. **Immediately halt** all further processing of the input.
2. **Do not** process the disclosure content through any other skill until escalation is acknowledged.
3. **Generate a Tier 1 escalation** with notification to the responsible practitioner within 15 minutes.
4. **Preserve verbatim** all disclosure content in an immutable audit record.
5. **Do not** provide the AI system's interpretation of the disclosure to non-professional audiences.
6. When `mandatory_report_indicated: true`, the practitioner is notified that a mandatory reporting obligation may have been triggered. The AI system does not make the mandatory report — the practitioner does.

The SafeSteps system does not have discretion to suppress or deprioritise disclosure escalations.

---

## 5. PII Redaction Requirements

The following categories of PII must be handled per the rules below:

| PII Category | Default Treatment | Exception |
|---|---|---|
| Full names of children | Replace with role label ("child", "sibling") | Permitted when PII-inclusion flag is explicitly set by authorised practitioner |
| Residential addresses | Redact entirely in family violence contexts | May be included in lawyer/judicial_officer packets with authorisation |
| Contact details (phone, email) | Remove from all AI outputs | Store separately in case management system |
| Financial account details | Remove entirely from all outputs | No exception |
| Child identifiers (school enrolment IDs, Medicare numbers) | Remove from all AI outputs | No exception |
| Pseudonyms used in proceedings | Preserve — these are protective, not PII risk | |

PII redaction is applied as a post-processing pass on all outputs before delivery. Audit records retain the original unredacted content in a secured audit store.

---

## 6. Trauma-Informed Language Constraints

All outputs delivered to clients, families, or children must pass the Trauma-Informed Communication skill (`tone_score >= 0.70`) before delivery.

Language that is always prohibited in any output, regardless of audience:
- Language that blames a victim for violence or abuse
- Language that minimises or disbelieves a disclosure
- Pathologising or shaming language about a person's response to trauma
- Deficit-framing language about cultural practices without expert cultural consultation
- Diagnostic labels used as adjectives ("the unstable parent", "the borderline mother")

---

## 7. Prohibited Output Patterns

The following output patterns are unconditionally prohibited:

| Pattern | Reason |
|---|---|
| Stating a child is at risk of a specific named perpetrator | Libelous; requires court determination |
| Recommending removal of a child from a parent | Statutory decision; not an AI function |
| Recommending contact arrangements | Legal/clinical decision; not an AI function |
| Identifying a specific mandatory report recipient | Jurisdiction-specific practitioner decision |
| Claiming certainty about future events ("this child will...") | Predictive claims without basis |
| Comparing risk scores between cases | Cross-case comparisons without context are misleading |
| Producing outputs in child-directed language without passing Child-Safe Conversation check | Child safety gate |

---

## 8. Model Output Monitoring

- All skill outputs are logged to an immutable audit trail.
- A random sample of 5% of outputs is reviewed by a human reviewer weekly.
- Any output that triggers an escalation is reviewed within 24 hours.
- Bias regression testing runs on every deployment; see `quality/quality_gates.yaml`.

---

## 9. Incident Response

If an output is found to have violated this policy:
1. Immediately flag the output for practitioner review.
2. Log the incident with full run_meta details.
3. Assess whether the output has already been shared with a client or court.
4. If shared: notify the relevant professional to issue a correction.
5. Root-cause analyse the failure within 48 hours.
6. Update quality gates to prevent recurrence.

---

## 10. Policy Review

This policy is reviewed quarterly. Any skill deployment that introduces output patterns not covered by this policy requires a policy amendment before release.
