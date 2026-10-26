# SafeSteps Complete Feature and Screen Register

**Version:** 1.0  
**Vision owner:** Katrina Watts  
**Source of truth:** `SafeSteps_Master_Vision_v1.md`  
**Purpose:** A stable, dependency-aware catalogue for product planning, specifications, code, tests and AI agents.

## Register rules

- Every implementation specification, issue, route, table and test should reference one or more stable IDs from this register.
- `Required` means required by the master vision; it does **not** mean implemented.
- `Needs code audit` means the current repository must be inspected before implementation status is changed.
- A screen is not complete until navigation, permissions, loading/empty/error states, accessibility, audit requirements and tests are verified.
- Parent, child and professional views must never share data merely because they display related information.
- Completion certificates confirm programme completion only; they are not parenting-capacity findings or legal conclusions.

## Status vocabulary

| Status | Meaning |
|---|---|
| Required | Approved vision requirement awaiting technical verification |
| Needs code audit | Prior work may exist but current completeness is unverified |
| Specified | Acceptance criteria and data/security rules completed |
| In progress | Actively implemented but not release-verified |
| Implemented | Code exists but full production verification may remain |
| Verified | Navigation, permissions, data, accessibility and tests passed |
| Deferred | Intentionally outside the current release |

## Priority vocabulary

| Priority | Meaning |
|---|---|
| P0 | Child safety, privacy, authentication, legal authority or data-integrity foundation |
| P1 | Required for one complete family journey and trustworthy pilot |
| P2 | Important expansion after the core journey is stable |
| P3 | Future enhancement |

---

## A. Platform shell, onboarding and authentication

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-PLAT-001 | Feature | Universal responsive app shell | All | Shared web/native navigation, safe-area, accessibility and offline state | P0 | Needs code audit |
| SS-PLAT-002 | Screen | Splash | Public | Branded startup and safe session restoration | P1 | Needs code audit |
| SS-PLAT-003 | Screen | Welcome | Public | Explain SafeSteps purpose without legal or clinical overclaiming | P1 | Needs code audit |
| SS-PLAT-004 | Screen | How SafeSteps works | Public | Explain learning, evidence, privacy and sharing | P1 | Required |
| SS-PLAT-005 | Screen | Privacy and family rights | Public | Plain-language rights, limits, complaints and emergency disclosure | P0 | Required |
| SS-PLAT-006 | Screen | Choose user pathway | Public | Parent, child, professional or organisation entry | P0 | Required |
| SS-AUTH-001 | Screen | Parent registration | Parent | Create parent account and preserve registration details | P0 | Needs code audit |
| SS-AUTH-002 | Screen | Parent sign-in | Parent | Secure parent authentication | P0 | Needs code audit |
| SS-AUTH-003 | Screen | Email verification | Parent | Web/native redirect, resend and recovery handling | P0 | Needs code audit |
| SS-AUTH-004 | Screen | Child access setup | Parent/authorised worker | Establish age-appropriate child access without exposing parent records | P0 | Needs code audit |
| SS-AUTH-005 | Screen | Child sign-in | Child | Age-appropriate restricted login | P0 | Needs code audit |
| SS-AUTH-006 | Screen | Professional registration | Professional | Apply with organisation, role and identity evidence | P0 | Required |
| SS-AUTH-007 | Screen | Professional sign-in and MFA | Professional | Strong authentication for sensitive roles | P0 | Required |
| SS-AUTH-008 | Workflow | Professional approval | Admin/organisation | Verify role, organisation, authority and expiry | P0 | Required |
| SS-AUTH-009 | Screen | PIN and biometrics | Parent/child/professional | Optional local access protection | P1 | Needs code audit |
| SS-AUTH-010 | Screen | Account recovery | All | Safe recovery without weakening role boundaries | P0 | Required |
| SS-AUTH-011 | Feature | Session and device management | All | View/revoke sessions and recognise suspicious access | P0 | Required |
| SS-AUTH-012 | Feature | Case membership enforcement | Parent/professional | Authorise every case-scoped read/write | P0 | Needs code audit |
| SS-AUTH-013 | Feature | Sensitive-route protection | All | Fail closed for child, evidence, assessment and report routes | P0 | Needs code audit |
| SS-PLAT-007 | Screen | Accessibility preferences | All | Text, audio, contrast, motion, reading and communication settings | P1 | Required |
| SS-PLAT-008 | Feature | Low-data and offline mode | Parent/child | Continue safe core activity with protected sync | P1 | Required |
| SS-PLAT-009 | Screen | Offline sync centre | Parent/child | Show pending, failed and completed sync without data loss | P1 | Required |
| SS-PLAT-010 | Screen | Help, complaints and crisis support | All | Support, feedback, complaints and jurisdiction-aware urgent help | P0 | Required |
| SS-PLAT-011 | Feature | Universal reading-mode choice | All | Offer Read it myself or Read aloud on every readable user surface | P0 | Required |
| SS-PLAT-012 | Feature | Persistent speech preferences | All | Save preferred mode, voice, speed, highlighting and cross-device choice per user | P1 | Required |
| SS-PLAT-013 | Component | Read-aloud controls | All | Play, pause, resume, stop, replay and skip without trapping navigation | P0 | Required |
| SS-PLAT-014 | Feature | Spoken-word highlighting | All | Highlight current words/sentence and follow reading position accessibly | P1 | Required |
| SS-PLAT-015 | Feature | Offline read aloud | All | Use an approved on-device voice for downloaded content where supported | P1 | Required |
| SS-PLAT-016 | Safeguard | Private speech playback | All | Never autoplay sensitive content or expose it through lock-screen controls or unauthorised speech services | P0 | Required |
| SS-PLAT-017 | Feature | Screen-reader semantic coverage | All | Accessible names, order, states and actions across controls, forms, tables, media and errors | P0 | Required |
| SS-PLAT-018 | Safeguard | Reading-mode neutrality | All | Audio/self-reading choice cannot affect completion, scoring, engagement or proof-of-change evaluation | P0 | Required |

## B. Parent and family workspace

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-PAR-001 | Screen | Parent dashboard | Parent | Today, deadlines, programmes, children, visits, concerns and progress | P1 | Needs code audit |
| SS-PAR-002 | Screen | Parent profile | Parent | Identity, accessibility, culture, language and communication preferences | P1 | Needs code audit |
| SS-PAR-003 | Screen | Family profile | Parent | Family composition, relationships, strengths and authorised connections | P1 | Required |
| SS-PAR-004 | Screen | Child summary cards | Parent | Permitted child information without exposing private entries | P0 | Required |
| SS-PAR-005 | Screen | My case overview | Parent | Stage, authority, workers, dates and current requirements | P1 | Required |
| SS-PAR-006 | Screen | Concerns register | Parent | Exact concern, source, evidence, status and required response | P0 | Required |
| SS-PAR-007 | Screen | Concern detail and right of reply | Parent | Respond, correct, dispute and attach contrary evidence | P0 | Required |
| SS-PAR-008 | Screen | Goals and required changes | Parent | Actions, success measures, owners, deadlines and reviews | P1 | Required |
| SS-PAR-009 | Screen | Strengths and protective factors | Parent | Preserve strengths alongside risks | P1 | Required |
| SS-PAR-010 | Screen | Daily/weekly check-in | Parent | Wellbeing, routines, progress, difficulties and support needs | P1 | Needs code audit |
| SS-PAR-011 | Screen | Routines and responsibilities | Parent | Track appropriate care routines, appointments and responsibilities | P2 | Required |
| SS-PAR-012 | Screen | Goals, reflections and achievements | Parent | Record insight, accountability and sustained change | P1 | Needs code audit |
| SS-PAR-013 | Screen | My story and timeline | Parent | View events, documents, progress and disputed information chronologically | P1 | Required |
| SS-PAR-014 | Screen | Deadlines and appointments | Parent | Court, visit, programme, service and review schedule | P1 | Required |
| SS-PAR-015 | Screen | Messages and submissions | Parent | Secure role-aware communication and formal submissions | P1 | Required |
| SS-PAR-016 | Screen | Notifications settings | Parent | Frequency, channel, lock-screen privacy and pause controls | P1 | Required |
| SS-PAR-017 | Screen | My support network | Parent | Nominated family, advocates and verified professionals | P1 | Required |
| SS-PAR-018 | Screen | Sharing and permissions | Parent | Approve, scope, schedule, revoke and review optional access | P0 | Required |
| SS-PAR-019 | Screen | Access history | Parent | Views, changes, downloads, exports and disclosures | P0 | Required |
| SS-PAR-020 | Screen | Data correction and review requests | Parent | Request correction and track resolution without erasing history | P0 | Required |
| SS-PAR-021 | Screen | Export my complete record | Parent | Download a readable, structured family record | P1 | Required |
| SS-PAR-022 | Screen | Post-case support plan | Parent | Maintain learning, services and relapse-prevention support after closure | P2 | Required |

### Separate Parent–Child Dashboard

This is a distinct relationship-and-connection workspace inside the parent account. It must not expose the child's private home, journal, check-ins, wishes, worries, visit reflections, messages, coach conversations or help requests. A parent sees only items deliberately shared by the child, mutually created family content, authorised visit/activity information and minimum-necessary information available under verified lawful authority.

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-PCD-001 | Screen | Parent–Child Dashboard | Parent | Separate child-connection home for games, activities and child-approved updates | P1 | Required |
| SS-PCD-002 | Component | Child relationship switcher | Parent | Move between authorised child workspaces without mixing records or permissions | P0 | Required |
| SS-PCD-003 | Screen | Child-shared updates feed | Parent | Show only current child-approved items with source, share date and scope | P0 | Required |
| SS-PCD-004 | Component | Newly shared update card | Parent | Present the child's words/content without rewriting or adult interpretation | P0 | Required |
| SS-PCD-005 | Screen | Shared item detail | Parent | View exact shared content, sharing context and permitted response actions | P0 | Required |
| SS-PCD-006 | Feature | Share-scope enforcement | Parent/child | Enforce item, recipient, purpose, duration and revocation on every view/query | P0 | Required |
| SS-PCD-007 | Feature | Revocation and expiry state | Parent/child | Remove ordinary visibility after withdrawal/expiry while retaining audit history | P0 | Required |
| SS-PCD-008 | Screen | Parent–child games hub | Parent/child | Access connection, communication, cooperation and visit-friendly games | P1 | Required |
| SS-PCD-009 | Screen | Shared activity planner | Parent/child | Choose, schedule and prepare activities together or for the next visit | P2 | Required |
| SS-PCD-010 | Screen | Invitations and turn centre | Parent/child | Manage safe game invitations, whose turn and agreed activity times | P2 | Required |
| SS-PCD-011 | Screen | Shared achievements and memories | Parent/child | Preserve mutually approved positive moments, milestones and creations | P2 | Required |
| SS-PCD-012 | Screen | Parent response to shared update | Parent | Send an age-appropriate acknowledgement without pressuring the child | P1 | Required |
| SS-PCD-013 | Safeguard | No-share-pressure protection | Parent/child | Prevent prompts, rewards, penalties or repeated requests that pressure child sharing | P0 | Required |
| SS-PCD-014 | Screen | Parent–child activity history | Parent/child | Show games, activities and separate reflections over time without punitive ranking | P2 | Required |
| SS-PCD-015 | State set | Dashboard privacy and availability states | Parent | Empty, not-shared, withdrawn, expired, offline, loading, error and access-denied states | P0 | Required |
| SS-PCD-016 | Screen | Shared connection plan | Parent/child | Voluntary relationship goals, preferred activities, communication and support choices | P1 | Required |
| SS-PCD-017 | Screen | Child-approved “What helps me” card | Parent/child | Share interests, calming strategies, communication needs and visit supports chosen by child | P1 | Required |
| SS-PCD-018 | Screen | Visit countdown and preparation | Parent | Next visit, agreed activity, items, transport and preparation tasks without private child detail | P1 | Required |
| SS-PCD-019 | Screen | Shared visit and family calendar | Parent/child | Authorised visits, birthdays, events and approved activities | P1 | Required |
| SS-PCD-020 | Screen | Visit activity builder | Parent/child | Build suitable activities from age, interests, location, duration, access and materials | P1 | Required |
| SS-PCD-021 | Screen | Child activity choices | Child/parent | Let child suggest or select visit activities without having to explain private reasons | P1 | Required |
| SS-PCD-022 | Feature | Connection suggestions | Parent/child | Offer safe age-, ability-, culture-, setting- and relationship-appropriate ideas | P2 | Required |
| SS-PCD-023 | Screen | Shared family goals | Parent/child | Agree voluntary listening, trust, routine and positive-time goals | P2 | Required |
| SS-PCD-024 | Screen | Parent visit-preparation checklist | Parent | Support punctuality, regulation, boundaries, attention and agreed practical preparation | P1 | Required |
| SS-PCD-025 | Screen | Positive-moment journal | Parent/child | Save positive moments separately and choose which become shared | P2 | Required |
| SS-PCD-026 | Screen | Shared family scrapbook | Parent/child | Mutually approved photos, drawings, certificates, stories and memories | P2 | Required |
| SS-PCD-027 | Feature | Family storybook creator | Parent/child | Co-create age-appropriate illustrated family or imaginary stories | P2 | Required |
| SS-PCD-028 | Feature | Cooperative creative space | Parent/child | Shared drawing, colouring, puzzles, music, storytelling and turn-taking | P2 | Required |
| SS-PCD-029 | Feature | Long-distance connection activities | Parent/child | Safe phone/video-compatible stories, questions, drawing and cooperative games | P2 | Required |
| SS-PCD-030 | Screen | Parent–child challenges | Parent/child | Voluntary connection and communication activities with no adverse non-participation effect | P2 | Required |
| SS-PCD-031 | Screen | Relationship strengths timeline | Parent/child/authorised reviewer | Source-linked positive interaction patterns without a good-parent score | P1 | Required |
| SS-PCD-032 | Screen | Child-approved celebration board | Parent/child | Celebrate approved birthdays, milestones, school progress and family moments | P2 | Required |
| SS-PCD-033 | Screen | Shared communication preferences | Child/parent | Child chooses talking, drawing, writing, audio, games, pacing and break preferences | P1 | Required |
| SS-PCD-034 | Screen | Repair-after-difficulty activity | Parent/child | Non-forced acknowledgement, listening, appropriate apology and next-time planning | P1 | Required |
| SS-PCD-035 | Feature | Safe conversation cards | Parent/child | Everyday connection prompts that never investigate allegations or pressure disclosure | P1 | Required |
| SS-PCD-036 | Component | “I need a break” control | Parent/child | Pause any activity without data loss, penalty or non-engagement inference | P0 | Required |
| SS-PCD-037 | Workflow | Trusted-person participation | Parent/child/trusted person | Authorised facilitation without child-private or unrelated case access | P1 | Required |
| SS-PCD-038 | Feature | Accessibility activity matching | Parent/child | Adapt to disability, sensory, communication, literacy, language and device needs | P0 | Required |
| SS-PCD-039 | Screen | Cultural connection space | Parent/child | Child-approved language, Country/community, traditions, stories and celebrations | P1 | Required |
| SS-PCD-040 | Screen | Sibling connection activities | Authorised siblings | Safeguarded sibling games and activities within verified contact permissions | P1 | Required |
| SS-PCD-041 | Screen | Shared request board | Parent/child | Propose activities or topics with accept, decline, later and no-pressure choices | P2 | Required |
| SS-PCD-042 | Component | Supportive acknowledgement templates | Parent | Age-appropriate responses that listen without interrogation, promises or pressure | P1 | Required |
| SS-PCD-043 | Screen | Separate after-activity reflections | Parent/child | Private reflections with optional item-level sharing and no forced comparison | P1 | Required |
| SS-PCD-044 | Screen | Downloadable connection packs | Parent/child | Low-data/offline games, visit plans and creative activities with sync-safe results | P2 | Required |
| SS-PCD-045 | Safeguard | No covert assessment or parenting score | Parent/child/professional | Games, sharing and activity outcomes cannot secretly assess allegation truth or parenting capacity | P0 | Required |
| SS-PCD-046 | Screen | Parent–child messaging home | Parent/child | Safeguarded direct communication within verified contact permissions | P0 | Required |
| SS-PCD-047 | Component | Visible monitoring notice | Parent/child | Explain who may review messages, why, what is analysed and current authority before messaging | P0 | Required |
| SS-PCD-048 | Workflow | Messaging consent/authority gate | Parent/child/authorised monitor | Verify contact order, consent/assent, monitor, purpose, start, expiry and restrictions | P0 | Required |
| SS-PCD-049 | Feature | Age-appropriate messaging modes | Child/parent | Text, approved audio, pictures, symbols, simple choices and accessible communication | P1 | Required |
| SS-PCD-050 | Feature | Immutable message provenance | Parent/child/monitor | Preserve sender, exact content, sent/received times, edits, withdrawals and delivery status | P0 | Required |
| SS-PCD-051 | Safeguard | Separate content, observation and inference | All authorised roles | Keep raw message, observable behaviour, AI suggestion and professional interpretation distinct | P0 | Required |
| SS-PCD-052 | Screen | Communication-skills reflection | Parent | Private coaching on listening, validation, clarity, boundaries, repair and child-focused response | P1 | Required |
| SS-PCD-053 | Feature | Transparent interaction indicators | Parent/child/assessor | Explain source-linked observable indicators and uncertainty without a hidden score | P0 | Required |
| SS-PCD-054 | Indicator | Listening and acknowledgement | Parent/child | Identify whether a response recognises the other person's message without claiming inner intent | P1 | Required |
| SS-PCD-055 | Indicator | Emotional validation | Parent/child | Identify respectful recognition of feelings without requiring agreement or forced disclosure | P1 | Required |
| SS-PCD-056 | Indicator | Child-focused responsiveness | Parent | Observe whether responses address the child's expressed needs, questions and preferences | P1 | Required |
| SS-PCD-057 | Indicator | Boundaries and respect | Parent/child | Observe age-appropriate boundaries, non-coercion, privacy and respectful language | P0 | Required |
| SS-PCD-058 | Indicator | Repair and accountability | Parent/child | Observe acknowledgement, appropriate apology, changed response and repair attempts over time | P1 | Required |
| SS-PCD-059 | Indicator | Reciprocity and shared enjoyment | Parent/child | Record balanced, voluntary participation and positive connection without penalising quiet children | P2 | Required |
| SS-PCD-060 | Screen | Source-linked communication summary | Parent/qualified reviewer | Longitudinal strengths, growth, concerns, context, examples, uncertainty and parent/child responses | P1 | Required |
| SS-PCD-061 | Safeguard | No automated attachment diagnosis | Parent/child/professional | Messaging alone cannot diagnose attachment style, disorder, bond, parenting capacity or relationship quality | P0 | Required |
| SS-PCD-062 | Workflow | Qualified attachment assessment referral | Parent/child/qualified practitioner | Formal opinion requires competent human assessment using multiple appropriate evidence sources | P0 | Required |
| SS-PCD-063 | Feature | Pre-send supportive coaching | Parent | Optional private prompts to slow down, validate, clarify or remove pressure before sending | P1 | Required |
| SS-PCD-064 | Safeguard | Coaching does not rewrite authorship | Parent/child | Suggestions remain optional and original/authored text is distinguishable from AI-assisted wording | P0 | Required |
| SS-PCD-065 | Component | Pause, mute and request-help controls | Parent/child | Stop interaction, mute non-urgent contact or seek trusted human support without penalty | P0 | Required |
| SS-PCD-066 | Workflow | Safety moderation and human escalation | Parent/child/monitor | Handle threats, coercion, grooming, unsafe contact or immediate harm through approved human rules | P0 | Required |
| SS-PCD-067 | Safeguard | No secret surveillance | Parent/child | Monitoring is always visible except a strictly verified legal exception, which is separately governed and audited | P0 | Required |
| SS-PCD-068 | Feature | Culture, disability and language fairness | Parent/child/reviewer | Prevent communication style, neurodivergence, literacy, translation or culture being treated as relational deficit | P0 | Required |
| SS-PCD-069 | Screen | Parent and child right of response | Parent/child | Correct context, dispute an indicator and add explanation without altering original messages | P0 | Required |
| SS-PCD-070 | Feature | Messaging access and review audit | Parent/child/monitor | Record views, searches, exports, moderation, analysis, professional review and disclosure | P0 | Required |

## C. Child experience and child voice

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-CHD-001 | Screen | Child home | Child | Safe, simple entry to check-ins, activities, visits and help | P0 | Needs code audit |
| SS-CHD-002 | Screen | Feelings check-in | Child | Age-appropriate repeated wellbeing capture | P0 | Needs code audit |
| SS-CHD-003 | Screen | My wishes and worries | Child | Record the child's own words separately from interpretation | P0 | Required |
| SS-CHD-004 | Screen | My story | Child | Private journal, drawing, audio and narrative | P1 | Required |
| SS-CHD-005 | Screen | Visit preparation | Child | Feelings, questions, boundaries and requested support | P1 | Required |
| SS-CHD-006 | Screen | Visit reflection | Child | Private post-visit experience and wellbeing | P0 | Required |
| SS-CHD-007 | Screen | Safe people | Child | Identify trusted people and ways to contact support | P0 | Needs code audit |
| SS-CHD-008 | Screen | Ask for help | Child | Create a request with appropriate safeguarding escalation | P0 | Needs code audit |
| SS-CHD-009 | Screen | My rights and safety learning | Child | Age-appropriate rights, boundaries and safety skills | P1 | Required |
| SS-CHD-010 | Screen | Feelings and regulation learning | Child | Developmentally appropriate emotional skills | P1 | Required |
| SS-CHD-011 | Screen | Creative activities and stories | Child | Games, drawing, storytelling and expressive tasks | P2 | Required |
| SS-CHD-012 | Screen | Child messages | Child/authorised professional | Role-aware, safeguarded communication | P0 | Needs code audit |
| SS-CHD-013 | Screen | Sharing choices | Child | Choose ordinary entries to share, with scope and preview | P0 | Required |
| SS-CHD-014 | Screen | Shared-items history | Child | See what was shared, with whom, when and why | P0 | Needs code audit |
| SS-CHD-015 | Workflow | Emergency disclosure | Child/safeguarding staff | Minimum-necessary escalation, notice and review | P0 | Required |
| SS-CHD-016 | Feature | Age/development presentation engine | Child | Pictures/audio/simple choice, child and teen modes | P0 | Required |
| SS-CHD-017 | Feature | Accessible communication modes | Child | Disability, language, cultural and communication adaptation | P0 | Required |
| SS-CHD-018 | Feature | Child-private data boundary | Child | Prevent parent/professional access without consent or lawful exception | P0 | Needs code audit |
| SS-CHD-019 | Screen | Facilitated child entry | Child/authorised facilitator | Supported entry while preserving authorship and influence warnings | P0 | Required |
| SS-CHD-020 | Screen | Child achievements | Child | Strengths, progress and positive memories | P2 | Required |

## D. Programmes, courses, lessons and activities

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-PRG-001 | Screen | Programme catalogue | Parent/professional | Browse assigned and optional programmes | P1 | Needs code audit |
| SS-PRG-002 | Screen | Programme recommendation | Parent/professional | Explain why a pathway was recommended and allow review | P1 | Required |
| SS-PRG-003 | Screen | Programme detail | Parent | Outcomes, duration, modules, evidence and completion criteria | P1 | Needs code audit |
| SS-PRG-004 | Workflow | Programme enrolment and start gate | Parent/professional | Consent, baseline, accessibility and safety prerequisites | P1 | Needs code audit |
| SS-PRG-005 | Screen | Programme progress | Parent/professional | Modules, completion, practice, evidence and review | P1 | Needs code audit |
| SS-PRG-006 | Feature | Personalised pathway engine | Parent | Assessment-, goal-, child- and document-informed pathway | P1 | Required |
| SS-PRG-007 | Feature | Programme intensity adjustment | Parent/professional | Extend, reduce or alter pathway with recorded rationale | P1 | Required |
| SS-PRG-008 | Screen | Course overview | Parent | Weekly structure, lessons, activities and progress | P1 | Needs code audit |
| SS-PRG-009 | Feature | Intensive pathway classification | Parent/professional | Identify high-intensity programmes using assessed needs, risks and outcomes | P1 | Required |
| SS-PRG-010 | Screen | Intensive programme schedule | Parent/professional | Daily 30–60 minute lessons, tasks, media evidence, reviews and family activities | P1 | Required |
| SS-PRG-011 | Screen | Intensive daily plan | Parent | Today's lesson, practical task/reflection and required evidence | P1 | Required |
| SS-PRG-012 | Screen | Intensive weekly summary | Parent/professional | Assessment, evidence, progress, barriers, support and next week | P1 | Required |
| SS-PRG-013 | Workflow | Intensive reviewer check-in | Parent/professional | Scheduled mentor/worker review with scope, notes and next actions | P1 | Required |
| SS-PRG-014 | Workflow | Missed-work recovery | Parent/professional | Barrier check, pause/extension, reschedule and catch-up without erased progress | P0 | Required |
| SS-PRG-015 | Feature | Intensive notification rules | Parent/professional | Notify workers only under agreed visible rules or verified safety need | P0 | Required |
| SS-PRG-016 | Feature | Offline intensive programme pack | Parent | Download authorised lessons, tasks, assessments and schedule for offline completion | P1 | Required |
| SS-PRG-017 | Screen | Programme download manager | Parent | Choose/download/update programme content and show storage/expiry | P1 | Required |
| SS-LIB-001 | Screen | Complete Course Library | Parent/child/carer/family | Browse all role- and age-appropriate learning beyond assigned programmes | P1 | Required |
| SS-LIB-002 | Screen | Course search | All learners | Search by topic, concern, skill, goal and title | P1 | Required |
| SS-LIB-003 | Screen | Course categories | All learners | Browse parent, child, adolescent, carer and family categories | P1 | Required |
| SS-LIB-004 | Feature | Age/development course filtering | Parent/child | Pregnancy, baby, early childhood, primary, adolescent and transition tracks | P0 | Required |
| SS-LIB-005 | Feature | Role-track filtering | All learners | Parent, child, adolescent, carer and shared-family tracks | P0 | Required |
| SS-LIB-006 | Feature | Course status labels | All learners | Assigned, recommended, optional, specialist-governed and completed | P0 | Required |
| SS-LIB-007 | Screen | Recommendation explanation | Learner | Show goal/evidence reason without diagnosis or proven-concern claim | P0 | Required |
| SS-LIB-008 | Feature | Optional self-enrolment | Learner | Add optional course without changing formal case plan | P1 | Required |
| SS-LIB-009 | Screen | Saved and learn-later courses | Learner | Favourites and future learning list | P2 | Required |
| SS-LIB-010 | Feature | Course duration/intensity/offline filters | Learner | Find suitable format and availability | P1 | Required |
| SS-LIB-011 | Feature | Accessibility/language/culture filters | Learner | Find adapted and accessible content | P0 | Required |
| SS-LIB-012 | Screen | Course governance details | Learner/professional | Sources, reviewers, limitations, version and review date | P0 | Required |
| SS-LIB-013 | Screen | Course feedback and safety report | Learner | Report content concern, error or accessibility issue | P0 | Required |
| SS-LIB-014 | Feature | Shared family course coordination | Parent/child | Coordinate activities while preserving separate private responses | P0 | Required |
| SS-LIB-015 | Feature | Specialist-governed course gate | Learner/professional | Enforce safety, qualification or supported-use prerequisites | P0 | Required |
| SS-LIB-016 | Feature | Course taxonomy and metadata engine | Admin/system | Stable categories, age tracks, roles, goals and versions | P1 | Required |
| SS-LIB-017 | Feature | Progressive learning depth | Learner | Move from Basic through Foundation, Complete, Applied, Intensive and Mastery | P1 | Required |
| SS-LIB-018 | Screen | Learning-depth selector | Learner | Show available depth, time, content, evidence, assessment and meaning | P1 | Required |
| SS-LIB-019 | Feature | Cross-depth progress preservation | Learner | Carry valid responses/progress forward without false completion | P0 | Required |
| SS-LIB-020 | Feature | Exact depth completion labels | Learner/professional | Prevent basic/foundation learning being represented as complete/applied | P0 | Required |
| SS-LIB-021 | Feature | Assigned minimum-depth requirement | Parent/professional | Tie required depth to defined goals and reviewed need with rationale | P0 | Required |
| SS-LIB-022 | Feature | Developmentally appropriate child depth | Child | Adapt learning design, not merely shorten adult content | P0 | Required |
| SS-LIB-023 | Feature | Exact-depth certificate/report wording | All | State depth completed and prohibit competency/capacity overclaiming | P0 | Required |
| SS-LESS-001 | Screen | Lesson definition/self-view | Parent | Define topic and capture starting understanding | P1 | Needs code audit |
| SS-LESS-019 | Feature | Mandatory opening-definition gate | Parent | Block teaching until parent explains what the lesson topic means to them | P0 | Required |
| SS-LESS-020 | Feature | Pre-teaching isolation | Parent | Hide SafeSteps definitions, video, examples, hints and AI suggestions before baseline | P0 | Required |
| SS-LESS-021 | Feature | Unassisted baseline preservation | Parent | Preserve exact answer, method, lesson version and timestamp without correction/grading | P0 | Required |
| SS-LESS-022 | Feature | Accessible definition response | Parent | Text, voice-to-text, audio or approved accessible communication method | P1 | Required |
| SS-LESS-023 | Feature | Honest uncertainty response | Parent | Accept meaningful “I do not know yet” as baseline without shame | P1 | Required |
| SS-LESS-024 | Screen | End-definition reflection | Parent | Explain current meaning and what changed after learning | P1 | Required |
| SS-LESS-025 | Screen | Before-and-after definition comparison | Parent | Show original and end response side by side | P1 | Required |
| SS-LESS-026 | Feature | Labelled definition-growth analysis | Parent/reviewer | Source-linked AI comparison with limitations and disagreement option | P0 | Required |
| SS-LESS-002 | Screen | Lesson introduction | Parent | Purpose, safety, duration and learning outcomes | P1 | Needs code audit |
| SS-LESS-003 | Screen | Teaching video | Parent | Captioned, transcribed, controllable skill modelling | P1 | Needs code audit |
| SS-LESS-004 | Screen | Teaching content | Parent | Plain-language evidence-informed instruction | P1 | Needs code audit |
| SS-LESS-005 | Screen | Understanding check | Parent | Validate comprehension before progression | P1 | Needs code audit |
| SS-LESS-006 | Screen | Interactive activity | Parent | Apply concepts in a low-risk scenario | P1 | Needs code audit |
| SS-LESS-007 | Screen | Scenario practice | Parent | Compare choices, consequences and safer responses | P1 | Needs code audit |
| SS-LESS-008 | Screen | Personal reflection | Parent | Insight without requiring unsafe disclosure | P1 | Needs code audit |
| SS-LESS-009 | Screen | Real-life practice task | Parent | Transfer learning into daily family life | P1 | Needs code audit |
| SS-LESS-010 | Screen | Action plan | Parent | Specific next action, support and success measure | P1 | Needs code audit |
| SS-LESS-011 | Screen | Follow-up evidence | Parent | Demonstrate appropriate continued application | P1 | Needs code audit |
| SS-LESS-012 | Screen | Formal assessment | Parent | Structured competency/knowledge measure | P1 | Needs code audit |
| SS-LESS-013 | Screen | Quiz | Parent | Knowledge and critical-safety pass rules | P1 | Needs code audit |
| SS-LESS-014 | Screen | End reflection | Parent | Compare starting and ending understanding | P1 | Needs code audit |
| SS-LESS-015 | Screen | Lesson completion summary | Parent | Results, practice, evidence, next steps and review | P1 | Needs code audit |
| SS-LESS-016 | Feature | Durable lesson response engine | Parent | Save/return, validation gates and immutable quiz history | P0 | Needs code audit |
| SS-LESS-017 | Feature | Trauma-informed pause/return | Parent | Pause without punishment or lost progress | P1 | Required |
| SS-LESS-018 | Screen | Certificate | Parent/professional | Confirm completion with explicit non-legal limitation | P1 | Needs code audit |
| SS-TASK-001 | Screen | Daily challenges | Parent | Short practical behaviour-change activities | P2 | Needs code audit |
| SS-TASK-002 | Screen | Challenge detail | Parent | Instructions, purpose, safety and evidence options | P2 | Needs code audit |
| SS-TASK-003 | Screen | Challenge history and streaks | Parent | Encourage consistency without punitive ranking | P2 | Needs code audit |
| SS-GAME-001 | Screen | Parent–child family games catalogue | Parent/child | Structured bonding and interaction activities | P2 | Required |
| SS-GAME-002 | Screen | Multiplayer family activity | Parent/child | Safe shared online/offline interaction | P2 | Required |
| SS-GAME-003 | Feature | Interaction reflection | Parent/child/professional | Separate perspectives and longitudinal relational indicators | P2 | Required |

### Programme families

| ID | Programme family | Priority | Status |
|---|---|---|---|
| SS-CURR-001 | Parenting skills and child development | P1 | Required |
| SS-CURR-002 | Reunification and family preservation | P1 | Needs code audit |
| SS-CURR-003 | Mental health, trauma and emotional regulation | P1 | Needs code audit |
| SS-CURR-004 | Alcohol and other drug recovery | P1 | Required |
| SS-CURR-005 | Domestic and family violence change and safety | P1 | Required |
| SS-CURR-006 | Parent–child connection and family activities | P1 | Required |

## E. Evidence, documents and document intelligence

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-EVD-001 | Screen | Evidence centre | Parent/professional | Uploads, requests, private items, shared items and review status | P0 | Needs code audit |
| SS-EVD-002 | Screen | Evidence upload | Parent/authorised professional | Purpose-bound upload with category and case link | P0 | Needs code audit |
| SS-EVD-003 | Feature | Sensitive-content restriction | All | Detect/restrict unsuitable identity, child or highly sensitive content | P0 | Required |
| SS-EVD-004 | Screen | Redaction and sharing preview | Parent | Remove unnecessary information before sharing | P0 | Required |
| SS-EVD-005 | Screen | Evidence detail | Parent/professional | Source, date, author, consent, access and linked goals | P0 | Required |
| SS-EVD-006 | Feature | Evidence versioning and integrity | Professional | Immutable versions, hashes and source metadata | P0 | Needs code audit |
| SS-EVD-007 | Workflow | Evidence review | Professional | Accept, query, reject or request context with reason | P0 | Needs code audit |
| SS-EVD-008 | Screen | Evidence dispute | Parent/professional | Record disagreement without deleting original material | P0 | Required |
| SS-EVD-009 | Screen | Support letters and certificates | Parent/professional | Organise formal achievements and independent support | P1 | Required |
| SS-EVD-010 | Feature | Offline evidence vault | Parent | Protected capture and later sync | P1 | Needs code audit |
| SS-EVD-011 | Screen | Daily photo evidence capture | Parent | Programme-specific, purpose-bound daily photo upload with safe-capture guidance | P1 | Required |
| SS-EVD-012 | Screen | Daily video evidence capture | Parent | Programme-specific, purpose-bound daily video upload with safe-capture guidance | P1 | Required |
| SS-EVD-013 | Feature | Media evidence safety gate | Parent | Prevent child/private/sensitive capture and check necessity/proportionality | P0 | Required |
| SS-EVD-014 | Screen | Alternative evidence request | Parent/professional | Use a suitable alternative where photo/video is unsafe, impossible or inaccessible | P0 | Required |
| SS-EVD-015 | Feature | Evidence quality over volume | Parent/professional | Prevent upload count being treated as proof of capacity or sustained change | P0 | Required |
| SS-EVD-016 | Feature | Offline media capture queue | Parent | Encrypt photo/video locally and resume upload safely when connected | P0 | Required |
| SS-EVD-017 | Screen | Tamper-Proof Evidence Vault | Authorised roles | Protected originals, versions, status, purpose, sharing and integrity | P0 | Required |
| SS-EVD-018 | Feature | Automatic vault intake | All evidence producers | Place every captured, created or received evidence item into the vault | P0 | Required |
| SS-EVD-019 | Feature | Evidence integrity fingerprint | All evidence | Hash at capture/receipt and verify after sync, transfer, export and retrieval | P0 | Required |
| SS-EVD-020 | Feature | Evidence chain of custody | Authorised roles | Source, author, device/method, timestamps, case, purpose and handling events | P0 | Required |
| SS-EVD-021 | Feature | Immutable original preservation | All evidence | Prevent silent edit, overwrite or replacement of the original | P0 | Required |
| SS-EVD-022 | Feature | Linked correction and redaction versions | Authorised roles | Preserve original while creating traceable corrected/shared derivatives | P0 | Required |
| SS-EVD-023 | Feature | Evidence status classification | Authorised roles | Submitted, unverified, verified, disputed, superseded, restricted or excluded | P0 | Required |
| SS-EVD-024 | Screen | Evidence integrity verification | Authorised roles | Show fingerprint result, version, provenance and any detected mismatch | P0 | Required |
| SS-EVD-025 | Screen | Chain-of-custody history | Authorised roles | Chronological capture, access, review, version, share, export and disclosure | P0 | Required |
| SS-EVD-026 | Workflow | Legal hold | Authorised legal/admin | Prevent disposition while a valid hold applies | P0 | Required |
| SS-EVD-027 | Workflow | Authorised evidence disposition | Privacy/legal/admin | Lawful deletion/expiry with authority, review and disposition audit | P0 | Required |
| SS-EVD-028 | Feature | Vault visibility boundary | All | Vault storage never grants case-wide visibility by itself | P0 | Required |
| SS-EVD-029 | Feature | Required live-capture-only mode | Parent | Disable gallery, file picker, paste and prior-media import for required evidence | P0 | Required |
| SS-EVD-030 | Screen | In-app required photo capture | Parent | Capture a new photo only within the active programme/task requirement | P0 | Required |
| SS-EVD-031 | Screen | In-app required video capture | Parent | Record a new video only within the active programme/task requirement | P0 | Required |
| SS-EVD-032 | Feature | Capture requirement binding | Parent | Bind media to user, programme, lesson, task, case and capture session | P0 | Required |
| SS-EVD-033 | Feature | Dual timestamp record | Authorised roles | Preserve device capture time/timezone/UTC and trusted server receipt time | P0 | Required |
| SS-EVD-034 | Feature | Clock anomaly detection | Authorised roles | Flag material clock differences without silent correction or automatic blame | P0 | Required |
| SS-EVD-035 | Feature | Signed offline capture receipt | Parent | Seal requirement, user/session, device time, timezone and media hash offline | P0 | Required |
| SS-EVD-036 | Feature | Required-media provenance metadata | Authorised roles | Capture method, session, app/device context, media properties, sync and custody | P0 | Required |
| SS-EVD-037 | Feature | Optional imported-evidence separation | Parent/professional | Keep non-live supporting uploads separate and truthfully source-labelled | P0 | Required |
| SS-EVD-038 | Feature | Location privacy gate | Parent | No default location; require necessity, explanation and consent/authority | P0 | Required |
| SS-DOC-001 | Screen | Document library | Parent/professional | Case plans, assessments, reports, orders and support records | P0 | Required |
| SS-DOC-002 | Screen | Document viewer | Authorised roles | Open exact source with version and access controls | P0 | Needs code audit |
| SS-DOC-003 | Feature | Document version history | Authorised roles | Preserve every version and review event | P0 | Needs code audit |
| SS-DOC-004 | Workflow | Document-intelligence analysis | Authorised roles | Extract structured information without making decisions | P1 | Needs code audit |
| SS-DOC-005 | Screen | Extracted concerns review | Parent/professional | Source-linked concerns, allegation labels and verification | P0 | Required |
| SS-DOC-006 | Screen | Extracted goals and requirements | Parent/professional | Source-linked actions, measures and deadlines | P1 | Required |
| SS-DOC-007 | Screen | Extracted services and barriers | Parent/professional | Offered/requested/unavailable assistance | P1 | Required |
| SS-DOC-008 | Screen | Contradictions and missing information | Parent/professional | Compare conflicting accounts and trigger review | P0 | Required |
| SS-DOC-009 | Screen | AI extraction correction | Parent/professional | Correct/dispute unverified extraction | P0 | Required |
| SS-DOC-010 | Feature | Source provenance | All | Exact document, version, page/section and extraction history | P0 | Required |

## F. Assessments, risk and progress

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-ASM-001 | Screen | Whole-family intake | Parent/professional | Baseline family strengths, needs, concerns and goals | P1 | Needs code audit |
| SS-ASM-002 | Screen | Parenting capacity assessment | Parent/qualified professional | Structured parenting capacity domains and evidence | P1 | Needs code audit |
| SS-ASM-003 | Screen | Child development assessment | Parent/qualified professional | Developmental understanding and child-specific needs | P1 | Needs code audit |
| SS-ASM-004 | Screen | Mental health, trauma and regulation evaluation | Parent/qualified professional | Needs and supports without automated diagnosis | P1 | Needs code audit |
| SS-ASM-005 | Screen | Alcohol and other drug evaluation | Parent/qualified professional | Pattern, impact, recovery and safety supports | P1 | Needs code audit |
| SS-ASM-006 | Screen | Domestic and family violence assessment | Qualified professional | Behaviour, victim safety, child impact and protective planning | P0 | Required |
| SS-ASM-007 | Screen | Housing, finance and practical stability | Parent/professional | Needs and barriers without equating poverty with neglect | P1 | Required |
| SS-ASM-008 | Screen | Relationships and support network | Parent/professional | Family dynamics, supports, isolation and protective people | P1 | Required |
| SS-ASM-009 | Screen | Assessment catalogue | Parent/professional | Assigned and optional authorised tools | P1 | Needs code audit |
| SS-ASM-010 | Workflow | Pre-entry assessment phase | Parent/professional | Baseline readiness and pathway selection | P1 | Needs code audit |
| SS-ASM-011 | Workflow | Phase 1 assessment | Parent/professional | Early change and safety review | P1 | Needs code audit |
| SS-ASM-012 | Workflow | Phase 2 assessment | Parent/professional | Application and stability review | P1 | Needs code audit |
| SS-ASM-013 | Workflow | Phase 3 assessment | Parent/professional | Sustained change and readiness review | P1 | Needs code audit |
| SS-ASM-014 | Workflow | Exit and follow-up assessment | Parent/professional | Outcomes, remaining support and longitudinal follow-up | P1 | Needs code audit |
| SS-ASM-015 | Screen | Assessment result detail | Parent/professional | Domains, evidence, limitations and result explanation | P0 | Required |
| SS-ASM-016 | Screen | Assessment comparison | Parent/professional | Compare repeated results over time | P1 | Needs code audit |
| SS-ASM-017 | Screen | Contradiction log | Professional/parent reply | Conflicts, sources, severity, review and resolution | P0 | Needs code audit |
| SS-ASM-018 | Screen | Collateral information register | Professional/parent reply | Authority, source, relevance, response and reliability | P0 | Needs code audit |
| SS-ASM-019 | Screen | Reviewer sign-off | Qualified professional | Confirm scope, evidence, limitations and competence | P0 | Required |
| SS-ASM-020 | Screen | Preliminary clinical screening centre | Parent/authorised requester | Run approved screening and assessment-support tools with clear non-diagnostic status | P1 | Required |
| SS-ASM-021 | Screen | Screening purpose and limitations | Parent/requester | Explain intended use, evidence limits, urgent-care boundaries and professional validation option | P0 | Required |
| SS-ASM-022 | Workflow | Assessment eligibility and safety gate | Parent/child/requester | Confirm population, age, language, accessibility, contraindications, crisis needs and authority | P0 | Required |
| SS-ASM-023 | Feature | Governed instrument catalogue | Parent/qualified professional | Offer only approved, licensed/public-domain, versioned and population-appropriate instruments | P0 | Required |
| SS-ASM-024 | Screen | Structured self-report administration | Parent/child | Complete permitted questions with save/pause, accessibility and distress support | P1 | Required |
| SS-ASM-025 | Feature | Deterministic instrument scoring | Parent/professional | Calculate only authorised published scoring for the exact tool/version without generative alteration | P0 | Required |
| SS-ASM-026 | Screen | Preliminary result and uncertainty | Parent/authorised requester | Show range, threshold, missing data, limitations and “not a diagnosis” status | P0 | Required |
| SS-ASM-027 | Feature | Possible-needs signal | Parent/professional | Identify areas that may warrant support or professional review without naming an unconfirmed diagnosis | P0 | Required |
| SS-ASM-028 | Workflow | Urgent clinical safety response | Parent/child/human support | Route immediate risk, severe symptoms or dangerous withdrawal to approved human/emergency pathways | P0 | Required |
| SS-ASM-029 | Screen | Draft clinical assessment bundle | Parent/qualified professional | Combine responses, scores, sources, history, context, contradictions and limitations for review | P1 | Required |
| SS-ASM-030 | Screen | Request professional validation | Parent/authorised requester | Ask an appropriately registered professional to review a selected preliminary assessment | P1 | Required |
| SS-ASM-031 | Feature | Requester authority verification | Caseworker/legal/court/service | Verify lawful authority, purpose and scope before requesting or accessing clinical review | P0 | Required |
| SS-ASM-032 | Screen | Professional review workspace | Qualified practitioner | Verify identity, administration, tool, scoring, context, validity, alternative explanations and sources | P0 | Required |
| SS-ASM-033 | Workflow | Accept, amend or reject preliminary output | Qualified practitioner | Record professional disposition and reasons without overwriting the original | P0 | Required |
| SS-ASM-034 | Status | Unreviewed preliminary result | Parent/authorised roles | Visibly distinguish system-generated screening from validated professional work | P0 | Required |
| SS-ASM-035 | Status | Professionally reviewed—not diagnostic | Qualified practitioner | Confirm review while explicitly withholding diagnosis where evidence/scope is insufficient | P0 | Required |
| SS-ASM-036 | Status | Professionally validated assessment | Qualified practitioner | Bind practitioner conclusion, scope, registration, date, sources, limitations and signed version | P0 | Required |
| SS-ASM-037 | Status | Rejected or invalid assessment | Qualified practitioner | Preserve why administration, data, tool, context or validity does not support use | P0 | Required |
| SS-ASM-038 | Screen | Parent factual correction and response | Parent/practitioner | Correct facts, explain context, dispute output and attach evidence without changing originals | P0 | Required |
| SS-ASM-039 | Workflow | Independent clinical second review | Parent/requester/new practitioner | Obtain a separate review without forcing agreement or replacing the first opinion | P1 | Required |
| SS-ASM-040 | Safeguard | Regulatory classification and release gate | Governance | Determine TGA/software-medical-device obligations before diagnostic or treatment functionality is supplied | P0 | Required |
| SS-SCORE-001 | Feature | Explainable progress scoring | Parent/professional | Transparent factors, weights, evidence and uncertainty | P0 | Needs code audit |
| SS-SCORE-002 | Feature | Explainable risk scoring | Qualified professional | Multi-factor risk and protective strengths; no automated decision | P0 | Needs code audit |
| SS-SCORE-003 | Screen | Score explanation | Parent/professional | Factor, weighting, source, verifier and correction route | P0 | Required |
| SS-SCORE-004 | Screen | Longitudinal trajectory | Parent/professional | Progress, stability, regression flags and context | P1 | Needs code audit |
| SS-SCORE-005 | Feature | Missing/disputed-data handling | All | Prevent uncertain information being treated as verified | P0 | Required |

## G. Visits, services and referrals

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-VIS-001 | Screen | Visit calendar | Parent/child/professional | Schedule, location, attendance and changes | P1 | Required |
| SS-VIS-002 | Screen | Visit detail | Parent/child/professional | Purpose, plan, people, conditions and support | P1 | Required |
| SS-VIS-003 | Screen | Parent visit preparation | Parent | Goals, activities, questions and regulation plan | P1 | Required |
| SS-VIS-004 | Screen | Parent visit reflection | Parent | Strengths, difficulties, learning and next action | P1 | Required |
| SS-VIS-005 | Screen | Child visit preparation/reflection | Child | Protected child perspective | P0 | Required |
| SS-VIS-006 | Screen | Worker visit observation | Professional | Dated behavioural observation separated from opinion | P0 | Required |
| SS-VIS-007 | Screen | Visit cancellation record | Professional/parent | Reason, responsibility, notice and effect | P0 | Required |
| SS-VIS-008 | Screen | Visit progress view | Authorised roles | Patterns across visits, not one snapshot | P1 | Required |
| SS-SVC-001 | Screen | Verified service directory | Parent/professional | Jurisdiction- and location-aware support search | P1 | Required |
| SS-SVC-002 | Screen | Service detail | Parent/professional | Eligibility, cost, waitlist, access and verification | P1 | Required |
| SS-REF-001 | Screen | Recommended services | Parent/professional | Explain assessment/goal match | P1 | Required |
| SS-REF-002 | Workflow | Referral creation and consent | Parent/professional | Scope, consent, provider and documents | P1 | Required |
| SS-REF-003 | Screen | Referral tracker | Parent/professional | Sent, received, waitlisted, accepted, declined and completed | P1 | Needs code audit |
| SS-REF-004 | Screen | Barriers and adjustments | Parent/professional | Cost, transport, disability, distance, eligibility and alternatives | P0 | Required |
| SS-REF-005 | Screen | Provider outcome and support letter | Provider/parent | Outcome, attendance, limitations and supporting document | P1 | Required |
| SS-REF-006 | Workflow | Non-engagement fairness review | Supervisor/parent | Distinguish unwillingness from inability before adverse label | P0 | Required |

## H. Professional, supervisory, legal and court portals

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-PRO-001 | Screen | Professional dashboard | Professional | Role-scoped cases, tasks, reviews and alerts | P0 | Required |
| SS-PRO-002 | Screen | Caseload | Caseworker/supervisor | Assigned families, stage, deadlines and priority | P1 | Required |
| SS-PRO-003 | Screen | Professional case overview | Professional | Family, authority, concerns, strengths, goals and progress | P0 | Required |
| SS-PRO-004 | Screen | Parent profile view | Professional | Only authorised shared and case-relevant information | P0 | Required |
| SS-PRO-005 | Screen | Child overview | Professional | Permitted wellbeing and shared items; private boundary enforced | P0 | Needs code audit |
| SS-PRO-006 | Screen | Case plan | Caseworker/parent | Concerns, goals, measures, actions, support and reviews | P1 | Required |
| SS-PRO-007 | Screen | Decision and reasons | Caseworker/supervisor | Evidence-linked decision, authority, rationale and limitations | P0 | Required |
| SS-PRO-008 | Screen | Parent submission review | Professional | Read and respond without overwriting parent authorship | P0 | Required |
| SS-PRO-009 | Screen | Evidence review queue | Reviewer | Case documents, versions, acceptance state and disputes | P0 | Needs code audit |
| SS-PRO-010 | Screen | Child request queue | Authorised worker | Complete request, safeguarding status and response | P0 | Needs code audit |
| SS-PRO-011 | Screen | Safety concern and plan | Authorised worker | Immediate actions, owners, review and minimum disclosure | P0 | Required |
| SS-PRO-012 | Screen | Professional notes | Professional | Dated, sourced notes clearly separated from verified facts | P0 | Required |
| SS-SUP-001 | Screen | Supervisor dashboard | Supervisor | Serious decisions, conflicts, overdue reviews and access anomalies | P0 | Required |
| SS-SUP-002 | Screen | Serious decision review | Supervisor | Evidence sufficiency, fairness, parent reply and outcome | P0 | Required |
| SS-SUP-003 | Screen | Conflict/contradiction resolution | Supervisor | Compare accounts, evidence and unresolved issues | P0 | Required |
| SS-SUP-004 | Screen | Worker transfer/handover | Supervisor | Preserve complete family history and accountability | P0 | Required |
| SS-LEG-001 | Screen | Lawyer dashboard | Lawyer | Authorised cases, chronology, evidence, disputes and reports | P1 | Required |
| SS-LEG-002 | Screen | Verified chronology | Lawyer/court | Source-linked case and family timeline | P0 | Required |
| SS-LEG-003 | Screen | Concern-by-concern progress | Lawyer/court | Original concern, evidence, response, change and status | P0 | Required |
| SS-LEG-004 | Screen | Disclosure and evidence bundle | Lawyer/registrar | Controlled, versioned selection with index and provenance | P0 | Required |
| SS-LEG-005 | Screen | Orders and legal deadlines | Lawyer/court/parent | Requirements, dates, source order and status | P0 | Required |
| SS-CRT-001 | Screen | Court read-only dashboard | Judicial/registrar | Minimum necessary verified case information | P0 | Required |
| SS-CRT-002 | Screen | Filed report snapshot | Court/lawyer | Immutable report version, attestations and disputes | P0 | Needs code audit |
| SS-CRT-003 | Feature | Time-limited legal access | Lawyer/court | Verified authority, scope, expiry and revocation | P0 | Required |
| SS-CRT-004 | Feature | Report delivery and receipt | Lawyer/court/parent | Secure delivery, challenge, receipt and audit | P0 | Needs code audit |

### Child carer portal

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-CAR-001 | Screen | Child Carer dashboard | Verified carer | Child, placement dates, daily records, visits, appointments and tasks | P0 | Required |
| SS-CAR-002 | Workflow | Carer identity and placement verification | Admin/caseworker | Verify foster, kinship, relative or residential carer authority | P0 | Required |
| SS-CAR-003 | Feature | Child/placement-scoped access | Carer | Restrict access to named child, placement, purpose, start and expiry | P0 | Required |
| SS-CAR-004 | Screen | Daily carer observation | Carer | Date, context, direct observation, child words, interpretation and response | P0 | Required |
| SS-CAR-005 | Screen | Child behaviour and wellbeing | Carer | Record pattern, intensity, context, duration and recovery without diagnosis | P1 | Required |
| SS-CAR-006 | Screen | Sleep, meals and routines | Carer | Daily care and pattern tracking | P1 | Required |
| SS-CAR-007 | Screen | Self-care and daily living | Carer | Age-appropriate daily functioning and support | P1 | Required |
| SS-CAR-008 | Screen | School record | Carer | Attendance, participation, changes, meetings and source documents | P1 | Required |
| SS-CAR-009 | Screen | Health and appointment record | Carer | Appointment, advice, follow-up and authorised document | P0 | Required |
| SS-CAR-010 | Screen | Medication administration record | Authorised carer | Medicine, dose, time, authorisation, omission and response | P0 | Required |
| SS-CAR-011 | Screen | Pre-visit observation | Carer | Child wellbeing and behaviour before family contact | P1 | Required |
| SS-CAR-012 | Screen | Post-visit observation | Carer | Child wellbeing, behaviour and recovery after contact | P1 | Required |
| SS-CAR-013 | Screen | Child's exact words | Carer | Preserve verbatim words separately from prompts and interpretation | P0 | Required |
| SS-CAR-014 | Screen | Strengths and achievements | Carer | Positive changes, interests, coping and milestones | P1 | Required |
| SS-CAR-015 | Screen | Strategies and supports that helped | Carer | Actions tried, response and recommended continuity | P1 | Required |
| SS-CAR-016 | Screen | Carer concern submission | Carer | Concern, urgency, direct evidence, action taken and requested response | P0 | Required |
| SS-CAR-017 | Screen | Carer evidence capture/upload | Carer | Dated writing, authorised live media and source documents | P0 | Required |
| SS-CAR-018 | Feature | Carer media safety gate | Carer | Verify authority/purpose and prevent private, distressed or unnecessary capture | P0 | Required |
| SS-CAR-019 | Screen | Carer submitted-record history | Carer | View entries, status, review and linked corrections | P1 | Required |
| SS-CAR-020 | Screen | Caseworker carer-record review | Caseworker | Review, query, classify and select relevant summary material | P0 | Required |
| SS-CAR-021 | Screen | Parent-approved relevant carer summary | Parent | View relevant authorised summary and submit response/contrary evidence | P0 | Required |
| SS-CAR-022 | Screen | Child age-appropriate carer summary | Child | View suitable relevant information without exposing adult case material | P0 | Required |
| SS-CAR-023 | Feature | Observation/child-words/interpretation separation | All | Prevent carer opinion being presented as child statement or verified fact | P0 | Required |
| SS-CAR-024 | Feature | No-leading/no-interrogation rule | Carer | Prevent forensic questioning, coaching, diagnosis or allegation conclusions | P0 | Required |
| SS-CAR-025 | Workflow | Placement end and access expiry | Carer/caseworker | Revoke access automatically while preserving records and audit | P0 | Required |
| SS-CAR-026 | Feature | Balanced carer reporting | All | Require strengths/positive changes and concerns to remain visible | P0 | Required |
| SS-CAR-027 | Feature | Carer record assessment provenance | Assessor | Source-linked extracts, limits, parent response and contrary evidence | P0 | Required |
| SS-CAR-028 | Screen | Positive carer observation | Carer | Connection, successful visits, regulation, routines, school, skills and milestones | P1 | Required |
| SS-CAR-029 | Feature | Balanced-observation prompt | Carer | Identify one-sided patterns and invite balanced input without inventing evidence | P0 | Required |
| SS-CAR-030 | Feature | Positive evidence report inclusion | All | Keep positive observations equally available to timelines, assessments and reports | P0 | Required |

## I. Reports, messaging and notifications

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-RPT-001 | Screen | Parent progress report | Parent | Understandable progress, barriers, evidence and next steps | P1 | Needs code audit |
| SS-RPT-002 | Screen | Professional progress report | Professional | Role-appropriate longitudinal review | P1 | Required |
| SS-RPT-003 | Screen | Family progress report builder | Authorised roles | Select scope without silently excluding disputes | P0 | Required |
| SS-RPT-004 | Feature | Immutable report snapshot | Authorised roles | Preserve exact evidence and version used | P0 | Needs code audit |
| SS-RPT-005 | Screen | Report source index | Authorised roles | Every claim mapped to supporting source | P0 | Required |
| SS-RPT-006 | Screen | Report dispute and attestation | Parent/professional | Record agreement, disagreement and reviewer statement | P0 | Needs code audit |
| SS-RPT-007 | Screen | Report export and delivery | Authorised roles | Controlled PDF/data export, recipients and expiry | P0 | Needs code audit |
| SS-RPT-008 | Screen | Longitudinal outcomes report | Parent/professional | Progress and regression across defined periods | P1 | Needs code audit |
| SS-MSG-001 | Screen | Role-aware inbox | All | Case-scoped secure communication | P1 | Needs code audit |
| SS-MSG-002 | Screen | Message thread | Authorised roles | Participants, case scope, attachments and safeguarding | P0 | Needs code audit |
| SS-NOT-001 | Feature | Notification engine | All | Deadlines, visits, referrals, sharing and review events | P1 | Needs code audit |
| SS-NOT-002 | Feature | Privacy-safe notification content | All | Prevent sensitive lock-screen disclosure | P0 | Required |
| SS-NOT-003 | Feature | Supportive missed-task response | Parent/child | Offer help rather than blame | P1 | Required |

## J. Administration, governance, safety and operations

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-ADM-001 | Screen | Organisation administration | Organisation admin | Staff, roles, verification, cases and policies | P0 | Required |
| SS-ADM-002 | Screen | Verified people directory | Admin/professional | Verified identities, roles, organisations and expiry | P0 | Needs code audit |
| SS-ADM-003 | Screen | Access grant administration | Admin | Authority, scope, start, expiry and revocation | P0 | Required |
| SS-ADM-004 | Screen | Audit explorer | Authorised auditor | Views, writes, downloads, exports and disclosures | P0 | Needs code audit |
| SS-ADM-005 | Screen | Content and curriculum administration | Content admin | Versioned programmes, lessons, sources and review | P1 | Required |
| SS-ADM-006 | Screen | Assessment-tool governance | Qualified admin | Tool owner, licence, validity, population and storage mode | P0 | Required |
| SS-ADM-007 | Screen | Jurisdiction configuration | Legal/admin | State/territory law, language, forms and emergency settings | P0 | Required |
| SS-ADM-008 | Screen | Service-directory moderation | Admin | Verify, review and expire provider records | P1 | Required |
| SS-ADM-009 | Screen | Safeguarding queue | Safeguarding staff | Triage, action, minimum disclosure and review | P0 | Required |
| SS-ADM-010 | Screen | Security incident centre | Security/admin | Sessions, anomalous access, breach response and notice | P0 | Required |
| SS-GOV-001 | Feature | Content evidence register | Governance | Sources, claims, reviewers, limitations and updates | P0 | Required |
| SS-GOV-002 | Feature | Lived-experience review | Governance | Parent and safely facilitated child participation | P1 | Required |
| SS-GOV-003 | Feature | Cultural-safety review | Governance | Aboriginal and Torres Strait Islander oversight and adaptation | P0 | Required |
| SS-GOV-004 | Feature | Accessibility and plain-language review | Governance | Tested accessible and understandable content | P0 | Required |
| SS-GOV-005 | Feature | Programme pilot and outcome validation | Governance | Measured pilot before reliability claims | P0 | Required |
| SS-GOV-006 | Screen | Content version history | All/authorised | Show material changes, evidence and review date | P1 | Required |
| SS-RSCH-001 | Screen | Research consent | Parent/eligible participant | Voluntary, informed, specific consent separate from services | P0 | Required |
| SS-RSCH-002 | Feature | De-identification pipeline | Research governance | Prevent identifiable family research use | P0 | Required |
| SS-RSCH-003 | Screen | Research withdrawal | Participant | Explain and action withdrawal rules | P0 | Required |
| SS-RSCH-004 | Screen | Community findings | Families/public | Explain what was learned without re-identification | P2 | Required |

## J1. AI Support Coach

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-AIC-001 | Screen | AI Support Coach home | Parent/adult user | Select support mode, privacy summary, urgent help and recent goals | P0 | Required |
| SS-AIC-002 | Screen | Coach recording and use notice | Adult/child | Explain recording, assessment use, sharing boundaries and safety exceptions | P0 | Required |
| SS-AIC-003 | Screen | Emotional Support Coach | Parent/adult user | Reflective listening, grounding and next-step support | P1 | Required |
| SS-AIC-004 | Screen | Mental Health and Regulation Coach | Parent/adult user | Coping, regulation, wellbeing and qualified-care connection | P0 | Required |
| SS-AIC-005 | Screen | DFV Support Coach | Parent/adult user | Device-safety check, survivor-led information, safety planning and referral | P0 | Required |
| SS-AIC-006 | Screen | Alcohol and Drug Recovery Coach | Parent/adult user | Goals, triggers, cravings, lapse/recovery reflection and referral | P0 | Required |
| SS-AIC-007 | Screen | Parenting and De-escalation Coach | Parent | Pause, regulate, respond and repair safely | P1 | Required |
| SS-AIC-008 | Screen | Programme Coach | Parent | Lessons, tasks, evidence purpose, appointments and barrier recovery | P1 | Required |
| SS-AIC-009 | Screen | Proof-of-Change Coach | Parent | Source-linked longitudinal engagement, practice and sustained-change summary | P0 | Required |
| SS-AIC-010 | Screen | Child AI Support Coach | Child | Age-appropriate support with child-private and safeguarding boundaries | P0 | Required |
| SS-AIC-011 | Feature | Coach mode boundary | All | Apply specialist prompt, content, escalation and referral policy by mode | P0 | Required |
| SS-AIC-012 | Feature | Complete conversation vaulting | All | Preserve exact user/AI messages, timestamps, versions, sources and safety events | P0 | Required |
| SS-AIC-013 | Feature | Authorship separation | All | Keep user words, AI words, summaries and interpretations visibly distinct | P0 | Required |
| SS-AIC-014 | Feature | Longitudinal pattern analysis | Parent/assessor | Analyse goals, coping, skill use, setbacks and recovery with limitations | P0 | Required |
| SS-AIC-015 | Screen | Coach memory and source review | User | View saved goals, plans, triggers, appointments, source and corrections | P0 | Required |
| SS-AIC-016 | Feature | Coach access-control policy | All | Full user view; assessor extracts; approved worker summary; formal legal share | P0 | Required |
| SS-AIC-017 | Screen | Approve caseworker coach summary | Parent | Preview, approve, scope, expire or revoke a summary | P0 | Required |
| SS-AIC-018 | Screen | Coach conversation detail | User/authorised assessor | Transcript, sources, safety events, interpretation and response | P0 | Required |
| SS-AIC-019 | Feature | No automatic adverse inference | All | Prevent conversation content becoming automatic diagnosis, admission or risk proof | P0 | Required |
| SS-AIC-020 | Workflow | Mental-health urgent escalation | User/supervisor | Immediate danger, suicide/self-harm or harm-to-others support and handoff | P0 | Required |
| SS-AIC-021 | Workflow | DFV urgent escalation | User/supervisor | Device-safety check, minimum text, 000/specialist pathway and safe exit | P0 | Required |
| SS-AIC-022 | Workflow | AOD urgent escalation | User/supervisor | Overdose, severe intoxication or dangerous withdrawal pathway | P0 | Required |
| SS-AIC-023 | Workflow | Child-safety escalation | Child/adult/safeguarding | Minimum-necessary authorised response and review | P0 | Required |
| SS-AIC-024 | Feature | Verified handoff status | All | Never claim emergency/service contact unless connection is confirmed | P0 | Required |
| SS-AIC-025 | Screen | Human support and service handoff | All | Direct connection to verified local and national services | P0 | Required |
| SS-AIC-026 | Feature | Child non-leading conversation policy | Child | No forensic interviewing, suggestion, secrecy promise or adult access leakage | P0 | Required |
| SS-AIC-027 | Feature | Offline support toolkit | All | Safety plan, contacts, grounding, coping, programme and urgent information offline | P0 | Required |
| SS-AIC-028 | Feature | Offline coach entry queue | All | Encrypt entries and show they have not yet been processed by AI | P0 | Required |
| SS-AIC-029 | Feature | Coach quality and safety evaluation | Governance | Test clinical/DFV/AOD/child safety, bias, escalation and unsupported claims | P0 | Required |

## J2. Forensic and psychological assessment provider system

| ID | Type | Name | Primary roles | Purpose | Priority | Status |
|---|---|---|---|---|---|---|
| SS-FOR-001 | Screen | Formal assessment request | Parent/service/caseworker/legal | Request forensic or psychological evaluation with referral question | P0 | Required |
| SS-FOR-002 | Screen | Registered provider search | Requester | Find verified providers by credentials, competence, availability, location and cost | P0 | Required |
| SS-FOR-003 | Workflow | AHPRA practitioner verification | Admin/system | Verify current psychologist registration and relevant public conditions | P0 | Required |
| SS-FOR-004 | Workflow | Area-of-practice endorsement verification | Admin/system | Verify claimed forensic/clinical/other endorsement separately | P0 | Required |
| SS-FOR-005 | Workflow | Service organisation verification | Admin/system | Verify entity, administrators, roster, insurance/accreditation and complaints contact | P0 | Required |
| SS-FOR-006 | Screen | Provider credential profile | Family/requester | Show verified credentials, source, date, limits and expiry | P0 | Required |
| SS-FOR-007 | Screen | Referral question and intended-use form | Requester/provider | Define scope without demanding a predetermined result | P0 | Required |
| SS-FOR-008 | Screen | Provider acceptance/decline | Provider | Declare competence, availability, conflict, fee and clarification needs | P0 | Required |
| SS-FOR-009 | Screen | Fees, funding and terms | Family/requester/provider | Transparent cost, funding, cancellation, rights and process | P1 | Required |
| SS-FOR-010 | Screen | Assessment consent and authority | Assessed person/requester/provider | Record informed consent or verified legal authority and limits | P0 | Required |
| SS-FOR-011 | Screen | Child assent | Child/provider | Developmentally appropriate participation assent and limits | P0 | Required |
| SS-FOR-012 | Screen | Conflict and independence declaration | Provider | Prior involvement, dual role, instructing party and independence | P0 | Required |
| SS-FOR-013 | Screen | Assessment plan | Provider | Participants, interviews, evidence, tools, accommodations and timeline | P0 | Required |
| SS-FOR-014 | Screen | Secure assessment appointments | Family/provider | Schedule in-person/video/hybrid sessions and reminders | P1 | Required |
| SS-FOR-015 | Screen | Assessment session record | Provider | Identity, attendance, authority, conditions, notes and status | P0 | Required |
| SS-FOR-016 | Screen | Structured interview workspace | Provider | Governed human-led interview and source-typed notes | P0 | Required |
| SS-FOR-017 | Screen | Behavioural observation workspace | Provider | Direct observations separated from inference/opinion | P0 | Required |
| SS-FOR-018 | Screen | Collateral interview register | Provider | Authority, identity, relationship, content, reliability and response | P0 | Required |
| SS-FOR-019 | Screen | Assessment tool library | Qualified provider | Governed original, public-domain and licensed instruments | P0 | Required |
| SS-FOR-020 | Feature | Tool licence and qualification gate | Provider | Enforce permitted edition, use, licence and practitioner qualification | P0 | Required |
| SS-FOR-021 | Feature | Test-security boundary | Assessed person/provider | Protect restricted items, manuals, keys, norms and raw data | P0 | Required |
| SS-FOR-022 | Screen | Secure assessment administration | Provider/assessed person | Conduct permitted tools with identity, timing and conditions | P0 | Required |
| SS-FOR-023 | Screen | Scoring and validity record | Provider | Inputs, version, norms, results, validity and accommodations | P0 | Required |
| SS-FOR-024 | Screen | Assessment evidence bundle | Provider | Select authorised vault evidence with full source index | P0 | Required |
| SS-FOR-025 | Screen | Conflicts and alternative explanations | Provider | Material contradictions, missing data and alternative hypotheses | P0 | Required |
| SS-FOR-026 | Screen | Professional report builder | Provider | Structured evidence-linked draft under practitioner control | P0 | Required |
| SS-FOR-027 | Feature | AI administrative assistance boundary | Provider | Scheduling, completeness and source indexing without official opinion | P0 | Required |
| SS-FOR-028 | Screen | Factual correction and assessed-person response | Assessed person/provider | Correct facts, add response and preserve resolution history | P0 | Required |
| SS-FOR-029 | Screen | Independent second-opinion request | Assessed person/requester | Request new independent provider assessment | P1 | Required |
| SS-FOR-030 | Workflow | Verified professional digital signing | Provider | Bind identity, registration snapshot, timestamp, version and fingerprint | P0 | Required |
| SS-FOR-031 | Feature | Immutable official report | Authorised roles | Preserve signed report; changes require addendum/new version | P0 | Required |
| SS-FOR-032 | Screen | Assessment report delivery | Authorised roles | Scope-limited delivery, receipt, expiry and audit | P0 | Required |
| SS-FOR-033 | Screen | Assessment complaints pathway | Assessed person/requester | Provider/service complaint and external-regulator information | P0 | Required |
| SS-FOR-034 | Feature | Credential expiry and recheck | Provider/system | Reverify at engagement, activity, signing and recurring intervals | P0 | Required |
| SS-FOR-035 | Feature | No predetermined conclusion | Provider/requester | Prevent commissioner control or desired-result optimisation | P0 | Required |
| SS-FOR-036 | Feature | Raw test data restricted access | Qualified provider | Separate raw/secure material from ordinary report access | P0 | Required |

## K. Core engines and cross-cutting technical capabilities

| ID | Type | Name | Purpose | Priority | Status |
|---|---|---|---|---|---|
| SS-ENG-001 | Engine | Parent–child relationship engine | Correct family relationships, custody/authority and privacy boundaries | P0 | Needs code audit |
| SS-ENG-002 | Engine | Role and permission engine | Parent, child, worker, reviewer, legal, court and admin enforcement | P0 | Needs code audit |
| SS-ENG-003 | Engine | Consent and lawful-authority engine | Purpose, scope, start, expiry, revocation and exception | P0 | Required |
| SS-ENG-004 | Engine | Audit and record-integrity engine | Append-only events, version history and tamper evidence | P0 | Needs code audit |
| SS-ENG-005 | Engine | Document-intelligence engine | Source-linked extraction and unverified output | P1 | Needs code audit |
| SS-ENG-006 | Engine | Assessment engine | Phases, rubric scoring, reassessment and sign-off | P1 | Needs code audit |
| SS-ENG-007 | Engine | Explainable risk/progress engine | Transparent factors, weights, uncertainty and strengths | P0 | Needs code audit |
| SS-ENG-008 | Engine | Referral lifecycle engine | Match, consent, referral, barrier and outcome | P1 | Required |
| SS-ENG-009 | Engine | Visit engine | Scheduling, preparation, observation, reflection and trend | P1 | Required |
| SS-ENG-010 | Engine | Curriculum and lesson engine | Versioned pathways, gates, activities, assessment and evidence | P1 | Needs code audit |
| SS-ENG-011 | Engine | Evidence engine | Purpose, metadata, versions, redaction, review and disputes | P0 | Needs code audit |
| SS-ENG-012 | Engine | Report engine | Snapshots, provenance, disputes, exports and delivery | P0 | Needs code audit |
| SS-ENG-013 | Engine | Notification engine | Role-, age-, urgency- and privacy-aware delivery | P1 | Needs code audit |
| SS-ENG-014 | Engine | Accessibility adaptation engine | Presentation and communication adjustments without bypassing safety | P0 | Required |
| SS-ENG-015 | Engine | Jurisdiction rules engine | Australian state/territory configuration and versioning | P0 | Required |
| SS-ENG-016 | Engine | Offline synchronisation engine | Encrypted queue, conflict handling and visible status | P0 | Required |
| SS-ENG-019 | Engine | Offline programme content engine | Encrypted programme packs, local completion, expiry and safe updates | P0 | Required |
| SS-ENG-020 | Engine | Resumable evidence upload engine | Chunked retry, deduplication, integrity checks and no false non-compliance | P0 | Required |
| SS-ENG-021 | Engine | Tamper-Proof Evidence Vault engine | Immutable originals, fingerprints, versions, retention and chain of custody | P0 | Required |
| SS-ENG-022 | Engine | Evidence disposition and legal-hold engine | Governed retention, holds, authorised deletion and audit | P0 | Required |
| SS-ENG-023 | Engine | Trusted capture and timestamp engine | Live capture, requirement binding, dual timestamps, signed offline receipt and anomaly flags | P0 | Required |
| SS-ENG-024 | Engine | AI Support Coach orchestration engine | Specialist modes, memory, sources, longitudinal patterns and user control | P0 | Required |
| SS-ENG-025 | Engine | AI crisis detection and handoff engine | Risk signal, jurisdiction routing, verified connection and minimum disclosure | P0 | Required |
| SS-ENG-026 | Engine | Child AI safety engine | Age adaptation, non-leading policy, privacy and safeguarding escalation | P0 | Required |
| SS-ENG-027 | Engine | Child carer observation engine | Placement scope, daily domains, source typing, review and summaries | P0 | Required |
| SS-ENG-028 | Engine | Provider credential verification engine | Registry checks, endorsement, competence, service roster, expiry and audit | P0 | Required |
| SS-ENG-029 | Engine | Forensic/psychological assessment workflow engine | Request, consent, plan, sessions, tools, report, signing and delivery | P0 | Required |
| SS-ENG-030 | Engine | Restricted assessment material engine | Licensing, qualifications, test security, raw data and authorised outputs | P0 | Required |
| SS-ENG-017 | Engine | Governance and compliance engine | Content review, retention, legal/privacy and release gates | P0 | Required |
| SS-ENG-018 | Engine | Research governance engine | Consent, de-identification, ethics, withdrawal and disclosure | P0 | Required |

## L. Minimum end-to-end release journeys

| ID | Journey | Required outcome | Priority | Status |
|---|---|---|---|---|
| SS-FLOW-001 | Parent voluntary entry | Register → assess → choose pathway → learn → practise → evidence → report | P1 | Needs code audit |
| SS-FLOW-002 | Parent active case | Link authority → import case plan → respond to concerns → services → progress report | P0 | Needs code audit |
| SS-FLOW-003 | Child private journey | Safe login → check-in → activity/request → sharing choice → safeguarded escalation | P0 | Needs code audit |
| SS-FLOW-004 | Caseworker review | Verified access → case overview → evidence/assessment → response → decision reason | P0 | Needs code audit |
| SS-FLOW-005 | Worker handover | End assignment → preserve history → revoke old access → verify new authority | P0 | Required |
| SS-FLOW-006 | Visit journey | Schedule → parent/child preparation → visit → separate reflections → trend | P1 | Required |
| SS-FLOW-007 | Referral journey | Need → matched provider → consent → referral → barriers → outcome | P1 | Required |
| SS-FLOW-008 | Document intelligence | Upload → scan → source-linked extraction → verification/dispute → timeline/pathway | P0 | Needs code audit |
| SS-FLOW-009 | Assessment lifecycle | Pre-entry → phases 1–3 → comparison → reviewer sign-off → exit/follow-up | P1 | Needs code audit |
| SS-FLOW-010 | Court-authorised report | Verify authority → select snapshot → disclose disputes → deliver → audit/expire | P0 | Needs code audit |
| SS-FLOW-011 | Access expiry | Authority ends → sessions/links revoked → family notified → audit retained | P0 | Required |
| SS-FLOW-012 | Research participation | Separate consent → de-identify → governed use → findings → withdrawal handling | P2 | Required |
| SS-FLOW-013 | Intensive programme | Classify → daily lesson/task → live evidence → weekly review → barrier recovery | P1 | Required |
| SS-FLOW-014 | Evidence vault lifecycle | Capture/receive → seal → review/dispute → version/share → hold/disposition | P0 | Required |
| SS-FLOW-015 | Post-reunification/post-case support | Close authority → retain family record → maintenance plan → optional support | P1 | Required |
| SS-FLOW-016 | AI Support Coach | Notice → mode → conversation → vault/patterns → user-controlled sharing or urgent handoff | P0 | Required |
| SS-FLOW-017 | Child carer documentation | Verify placement → observe/document → vault → caseworker review → fair summary/response | P0 | Required |
| SS-FLOW-018 | Registered-provider forensic/psychological assessment | Request → verify provider → consent/plan → evaluate → respond → sign/deliver | P0 | Required |

## M. Universal acceptance requirements

Every applicable item in the register must meet these release conditions:

1. **Authorisation:** authenticated role, active case relationship, purpose and lawful authority are enforced server-side.
2. **Child privacy:** child-private information is not exposed through parent, worker, reporting, search, notification or export paths.
3. **Procedural fairness:** claims retain source and status; parent replies and disputes remain visible.
4. **Evidence integrity:** versions, hashes, dates, authorship, consent and review events are preserved.
5. **AI limitations:** AI outputs are labelled, source-linked, reviewable and unable to make prohibited decisions.
6. **Accessibility:** screen-reader, keyboard, text scaling, contrast, reduced motion, plain language and relevant communication modes are verified.
7. **Trauma-informed use:** save/pause/return works; disclosure is not unnecessarily required; missed activity is not shamed.
8. **Operational states:** loading, empty, offline, stale, permission-denied and safe error states are implemented.
9. **Audit:** sensitive view, mutation, download, export, share, disclosure and administrative action are logged.
10. **Testing:** unit, integration, route/permission and end-to-end role-boundary tests pass.
11. **Jurisdiction:** law, terminology, services, emergency information and retention are configuration-driven and versioned.
12. **No overclaiming:** scores, certificates, AI results and programme outcomes state their limitations.

## N. Next register work

1. Audit the current SafeSteps repository against every ID.
2. Add file paths, routes, tables, APIs and tests to each implemented item.
3. Record dependencies and acceptance criteria for each P0/P1 item.
4. Select the first complete end-to-end parent journey as the stabilisation target.
5. Generate user-journey specifications using the `SS-FLOW-*` IDs.
6. Add this register and the master vision to the root `AGENTS.md` reading order.
