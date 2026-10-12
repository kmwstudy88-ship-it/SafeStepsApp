# SafeSteps First-Class Launch Content Plan

This plan turns the work already done in SafeSteps into a focused production launch path.

Related framework: `docs/SAFESTEPS_PROGRAM_AND_PROOF_OF_EVIDENCE_FRAMEWORK.md`.

## Launch Principle

The first public-ready SafeSteps release should feel coherent before it feels huge.

For launch, content is production-ready only when it is:

- Clear to a parent without developer explanation.
- Connected to the main parent journey.
- Free of fake names, fake progress, fake dates, and placeholder claims.
- Safe for court-aware, child-sensitive, and high-conflict family contexts.
- Backed by real app routes, data, and verification checks.
- Worded as court-relevant or court-aware unless formal court/statutory approval exists.

## V1 Launch Shape

V1 should focus on the parent-facing product:

1. Onboarding and disclaimer.
2. Dashboard.
3. Programs.
4. Courses and lessons.
5. Challenges and tasks.
6. Reflections.
7. Evidence uploads.
8. Progress and reports.
9. Assessment entry point.

Facilitator, caseworker, messaging, and child-facing tools should be treated as advanced modules until their safety, privacy, and database behavior is fully verified.

## Production Content Standards

### Copy

- Use plain language.
- Avoid promises that reunification, custody, or child-protection outcomes will occur.
- Avoid generic motivational claims when the screen is meant to record evidence.
- Avoid blaming or shaming language.
- Clearly separate support, documentation, and decision-making authority.

### Data

- Do not show invented people, fake appointment dates, fake completion percentages, or fake caseworker activity.
- Demo data must be clearly marked as demo mode.
- Empty states should explain what the user can do next.
- Counts and progress indicators should come from real records.


### Content Structure

- Programs are long-term pathways.
- Courses are standalone learning modules.
- Lessons teach and ask the parent what the material means for them.
- Challenges turn learning into practical action.
- Reflections capture insight.
- Evidence captures proof or supporting records.
- Reports summarize saved records; they should not invent conclusions.
- SafeSteps should be described as an intensive reunification, parenting, child-voice, and proof-of-evidence support system, not as a simple course app.

### Safety

- Child-facing or shared content must be reviewed before launch.
- Parent-child sharing must not expose child-only or private material to a parent by default.
- Assessment outputs must be framed as decision-support, not automated child-protection decisions.
- High-risk domains such as DFV, substance use, mental health, and child distress need explicit escalation language and supervisor review flows before production claims.
- Do not say "court approved" unless a specific authorised approval exists. Use "designed to support court-relevant documentation standards" instead.

## Ship In V1

| Area | Launch target | Status |
| --- | --- | --- |
| App config | App name, identifiers, icon, scheme, splash, web favicon | Present; verify assets and store metadata |
| Entry flow | Signup to Welcome, login to Dashboard | Present; smoke-test |
| Welcome | Plain disclaimer-gated starting point | Present; polish copy if needed |
| Dashboard | Real navigation hub with no fake personal data | Started cleanup |
| Library | Browse courses, programs, and lessons | Present; needs curation |
| Courses | Standalone lesson content | Present; needs content QA |
| Programs | Structured pathways | Present; needs official-vs-draft curation |
| Challenges | Standalone challenge section and task creation | Present; needs final category review |
| Evidence | Upload documents/media/live records | Present; needs Supabase storage verification |
| Progress | Saved activity summary | Present; needs consistency checks |
| Reports | Output from saved records | Present; needs no-fake-conclusion review |
| Assessment entry | Safe starting point for assessment system | Present; deeper workflow needs review |
| Program/proof framework | Official program and proof-of-evidence definition | Added; use as production model |

## Hold Back Or Label As Draft

| Area | Reason |
| --- | --- |
| Child section | Needs safety, privacy, and child UX review before launch |
| Parent-child sharing | Needs privacy boundary verification and smoke tests |
| Messaging | Needs moderation, audit, and role behavior verification |
| Caseworker dashboard | Looks like a separate/older module and should not be assumed production-ready |
| Advanced assessment tiers | Licensed-professional boundaries and report sign-off rules must be explicit |
| Automated court-ready conclusions | Must not ship until evidence, scoring, governance, and review gates are proven |

## First Launch Cleanup Batch

### Batch 1: Remove Placeholder Launch Content

- Dashboard: remove fake names, fake dates, fake percentage, and fake appointments.
- Program and course screens: remove draft wording and make status clear.
- Reports: ensure the app does not generate unsupported conclusions.
- Assessment screens: add clear decision-support framing where needed.

### Batch 2: Curate Launch Curriculum

- Mark official launch programs.
- Mark standalone launch courses.
- Structure standalone courses around areas of need so parents can build a path instead of browsing a flat list.
- Confirm every lesson includes a parent meaning/reflection prompt.
- Identify draft/generated content that should be hidden or labelled as draft.

### Course Structure Model

Courses should support two entry points:

- Structured course areas: curated groups around what the parent needs now.
- Full library: all standalone courses remain browsable for parents or workers who know what they need.

Launch course areas:

- Start here
- Child development and wellbeing
- Connection and regulation
- Behaviour, boundaries, and routines
- Safety, stability, and evidence
- Separation and co-parenting
- Healthy relationships and accountability
- Specialist support needs
- Father-focused pathway

Each area should have:

- Plain-language description
- Suggested starting course
- Short course set
- No fake progress or eligibility claims
- Clear separation from full programs

### Batch 3: Evidence And Reflection Integrity

- Confirm evidence uploads persist file path and metadata.
- Support offline evidence capture inside programs and evidence flows.
- Queue offline evidence in a local tamper-evident vault and sync it when the app can reach Supabase again.
- Confirm missing auth shows a useful empty state.
- Confirm reflection records are structured and reusable in timeline/report views.
- Confirm no screen asks for evidence that cannot be stored.

### Offline Evidence Vault Standard

Launch evidence behavior should be:

- A parent can capture evidence even when internet is unavailable.
- The app queues the record locally instead of losing it.
- Each queued item includes created time, attachment metadata, previous vault hash, and integrity hash.
- When sync succeeds, the uploaded evidence notes include the offline capture time and vault hash.
- Pending evidence remains visible until upload succeeds.

Current limitation:

- The first implementation stores the local attachment URI and tamper-evident metadata using existing app dependencies. A later hardening pass should add device-file copying, stronger cryptographic hashing, optional encryption-at-rest, and background network sync.

### Batch 4: Validation

Run:

```powershell
npx tsc --noEmit
npx expo lint
npx expo-doctor
npm test
```

Then smoke-test:

- Signup
- Login
- Welcome disclaimer
- Dashboard
- Open course
- Open lesson
- Start program
- Save reflection
- Create challenge task
- Upload evidence
- View progress
- Open report
- Open assessment entry

## Current Next Action

Finish Batch 1 first. Do not add more product areas until the launch-facing parent journey stops showing placeholders.
