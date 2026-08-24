# SafeSteps Personal AI Support governance launch gate

Status: **NOT APPROVED FOR UNSUPERVISED PRODUCTION USE**

SafeSteps Personal AI Support is an AI support tool. It is not a counsellor, clinician, lawyer, child-protection authority, or emergency service. It does not diagnose, decide whether someone is safe, determine parenting capacity, make mandatory reports, or dispatch emergency services automatically.

## Required accountable reviewers

Each item requires a named reviewer, credentials/authority, jurisdiction, review date, findings, remediation owner, and written approval.

- Child and family clinician: pending
- Child safeguarding lead: pending
- Domestic and family violence specialist: pending
- Alcohol and other drug specialist: pending
- Suicide-prevention/mental-health crisis specialist: pending
- Australian privacy counsel or privacy officer: pending
- Mandatory-reporting counsel for every supported state and territory: pending
- Accessibility reviewer and users with lived experience: pending
- Aboriginal and Torres Strait Islander cultural safety review: pending
- Multicultural and language-access review: pending

No checklist item may be treated as clinical, legal, or safeguarding approval merely because automated tests pass.

Every recorded sign-off must be explicit, dated, attributable, tied to a release version, limited to a written scope, and linked to controlled evidence. The governed domains are safeguarding, clinical, domestic violence, substance use, privacy/security, jurisdiction/legal, and product/UX. “Looks fine” or another ambiguous comment is not approval.

Conditional approval is not release approval. It must record the condition, accountable owner, and due date and remains a launch blocker until a later explicit, dated approval supersedes it. Rejected decisions remain visible in the append-only review log.

## Mandatory-reporting and jurisdiction matrix

Before enabling a jurisdiction, record its child-protection agency, after-hours contact, emergency wording, who is a mandatory reporter, whether the service/operator falls within that class, documentation duties, information-sharing authority, and escalation procedure. The AI must never claim that it has completed a report. A qualified human owns every reporting decision and action.

Supported at initial review: Queensland only. Status: pending legal and safeguarding approval.

## Privacy impact assessment

Data inventory:

- AI processing consent: purpose-specific and revocable
- Conversation text: memory-only by default; stored only through separate consent
- Structured interaction note: minimum necessary, separately consented
- Safety event: signal identifiers and action shown; no automatic verbatim narrative
- Human handoff: separately consented minimum summary
- Audit event: action metadata only; never the conversation body

Controls:

- TLS in transit and Supabase encryption at rest
- Owner-scoped RLS; assigned-staff handoff access; admin governance access
- No client service-role key
- No automatic emergency dispatch
- No automatic copying of crisis disclosures into analytics or ordinary logs
- Legal hold and disabled-by-default retention deletion
- User export/deletion process required before launch, subject to lawful exceptions

Open decisions: lawful basis, final retention periods, legal-hold authority, breach notification owner, deletion exceptions, cross-border model processing, subprocessors, and whether any staffed handoff service operates outside business hours.

## Retention and deletion

Migration defaults are provisional: messages 30 days, notes 90 days, safety events and handoffs 365 days, audit records 730 days. Automated deletion remains disabled until privacy/legal approval. Enabling deletion requires documented approval, a restore test, a legal-hold test, and a dry-run count reviewed by the data owner.

## Incident response

Severities:

1. Critical: unsafe crisis response, unauthorized sensitive-data access, or incorrect emergency/referral instruction.
2. High: missed hard-risk trigger, prohibited advice reaching a user, or handoff access outside assignment.
3. Moderate: repeated false positive, broken referral, accessibility barrier, or failed deletion/export.

Immediate actions: preserve minimum audit evidence, disable the affected flow or model path, use the deterministic fallback, notify the incident lead and relevant specialist, assess user notification and regulatory duties, correct referral information, test the fix, and record approval before re-enabling. Do not retain unnecessary transcript content during investigation.

## Referral-directory ownership

Every referral requires: jurisdiction, service owner, authoritative source URL, phone/dial target, eligibility, operating hours, device/billing safety note, last verified date, next review date, and named SafeSteps owner. Emergency and crisis contacts must be verified at least monthly; other services at least quarterly. A failed verification removes the contact from automatic display until reviewed.

## Release evidence

- Deterministic classifier and multi-risk tests
- Model-output prohibition and fallback tests
- Prompt-injection tests
- RLS owner/assignee/admin tests against a disposable database
- Consent, revocation, deletion, retention, and legal-hold tests
- Screen-reader, keyboard, large-text, contrast, and reduced-motion review
- Offline emergency/referral fallback test
- Model and flow version recorded for every released configuration
- Named approvals above

Before review begins, administrators must prepare a versioned release package containing the change summary, prior-version diff, test results, known risks, rollback plan, jurisdiction notes, escalation and validator changes, referral updates, and controlled-memory changes. A missing, draft, or in-review package blocks launch.

Machine-enforced release records now exist for all 23 required readiness areas and eight independent specialist roles. Their current state is pending. The evaluator returns `no_go` for a missing, pending, or failed required check, a missing approval, or any unresolved Sev 1 incident. Database migrations must be applied and RLS-tested against a disposable Supabase instance before any database-related item can pass.

## Later-improvement controls

- Localization: human-reviewed translation; never machine-translate emergency numbers without verification
- De-identified metrics: aggregate counts only; minimum cohort thresholds; no message bodies
- Controlled family memory: implemented behind separate consent, allowlisted fields, sensitivity limits, monitored-device suppression, expiry, review/suppress/delete controls, and revocation; database and privacy verification pending
- Staff dashboard: assignment-scoped access, audited writes, session revalidation for sensitive actions
- Flow administration: immutable versions, reviewer approval, rollback, staged release
- Offline resources: signed/versioned bundle with visible verification date and online refresh when safe
