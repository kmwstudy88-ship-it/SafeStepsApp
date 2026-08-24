# SafeSteps Personal AI Support incident response v1.0

Status: operational draft requiring safeguarding, privacy, security, clinical, and Australian jurisdiction approval before production use.

## First response

Protect users first. Contain before root-cause analysis, preserve evidence, restrict access to the incident team, record every action, and never speculate or improvise a workaround that could increase risk. SafeSteps does not automatically dispatch emergency services.

Lifecycle: detect → triage → contain → assess → remediate → verify → close → post-incident review.

## Severity

- Sev 1: missed critical escalation, unsafe crisis advice, mishandled abuse disclosure, self-harm failure, unsafe intoxicated-caregiving or domestic-violence advice. Immediately force locked fallback wording, disable the affected version, notify safeguarding and engineering leads, assess current user risk, preserve evidence, and open an incident.
- Sev 2: wrong high-risk route, delayed handoff, dangerously stale referral, validator failure caught by fallback, or material privacy exposure. Contain promptly and assign accountable owners.
- Sev 3: outage, queue delay, dashboard error, minor classifier issue, or non-critical directory problem.
- Sev 4: low-impact copy, link, or administration issue.

## Evidence and privacy

Record identifiers and structured outputs only when necessary: request, conversation, flow and model-response IDs; classification and validator results; handoff/referral changes; timestamps; and staff actions. Do not duplicate raw disclosures into incident summaries. Apply legal hold when required and never destroy evidence during investigation.

## Specialist paths

- Unsafe output: capture securely, block display or replace it, determine whether the user saw it, extend validator rules, add a regression test, and obtain clinical/safeguarding review.
- Missed critical escalation: Sev 1; preserve classification evidence, patch the classifier–validator–orchestrator chain, add the exact phrase as a regression case, and require safeguarding sign-off.
- Referral failure: deactivate the entry immediately, remove it from results, notify its owner, verify a safer alternative, and require re-verification before activation.
- Privacy or breach: restrict access, preserve logs, identify scope and records, rotate affected credentials where necessary, review RLS/auth, and have the privacy/legal leads determine notification obligations.
- Safeguarding or mandatory reporting: escalate to the safeguarding lead, identify the applicable jurisdiction, record what was known and when, and obtain qualified legal/jurisdiction advice on required action.

## Closure gate

Sev 1 and Sev 2 require documented root cause, remediation, regression tests, reviewer sign-off, verified safety recovery, assigned follow-up actions, and a post-incident review. Roll back whenever critical misses or unsafe responses recur, validation repeatedly fails, referral safety is unreliable, or a release destabilizes safety behaviour.
