# SafeSteps Personal AI Support — Launch Day Runbook v1.0

SafeSteps must remain **NO-GO** unless every evidence check passes, every required specialist approval is current, database RLS is proven, the safety suite passes, verified crisis referrals are current, rollback is ready, staff coverage is confirmed, and no unresolved Sev 1 or Sev 2 incident exists.

## Ownership

The Launch Commander owns the decision. Engineering owns deployment, monitoring, fallback and rollback. Safeguarding owns safety escalation. Clinical review covers tone and crisis behaviour. Privacy/Security owns access, RLS, retention and exposure. The Referral Owner verifies support contacts. The Support Lead owns human-handoff coverage.

## Checkpoints

- **T-24:** freeze non-essential changes; confirm tests, approvals, rollback instructions, roster and escalation contacts.
- **T-2:** verify production configuration, server-only secrets, migrations, verified referral data, analytics and alerts.
- **T0:** deploy, then test low-risk chat, each critical route, validator fallback, handoff, referral safe mode, quick exit and safer-device controls. Verify user ownership, staff role limits and audit creation.
- **T+1:** inspect errors, safety events, critical triggers, validator failures, handoffs and referral failures.
- **T+4:** re-check alerts and coverage; confirm no unresolved Sev 1 or Sev 2.
- **End of day:** record metrics and choose continue, patch, pause or rollback.
- **First 72 hours:** prioritize critical-flow correctness, validator blocks, handoff response, referral reliability, access logs and incidents over minor UX improvements.

## Immediate rollback triggers

Rollback or switch to the locked safe fallback if a critical flow misroutes, unsafe output reaches a user, RLS or authorization fails, stale crisis data is shown, handoff creation/processing fails, or quick exit fails. Preserve logs, notify safeguarding and engineering, restore the last safe release, rerun smoke tests, and document the reason. SafeSteps does not automatically contact emergency services.

Internal response phrase: **Pause. Contain. Review the exact flow. Switch to safe fallback if needed. Escalate to safeguarding and engineering.**

Temporary user copy: “We’re making this support experience safer. If you need immediate help, use the crisis or support options shown here.” For immediate danger: “Contact emergency services or a trusted safe adult now.”

## Required release-folder evidence

Release notes, safety test report, specialist sign-offs, rollback procedure, incident-response procedure, referral-owner list, on-call list and monitoring-dashboard link must be versioned and accessible to the launch team.

## 72-hour review

Review safety misses, classifier accuracy, validation rate, handoff turnaround, referral accuracy/failures, user feedback, incidents and access logs. Record owners and due dates for every corrective action before wider rollout.
