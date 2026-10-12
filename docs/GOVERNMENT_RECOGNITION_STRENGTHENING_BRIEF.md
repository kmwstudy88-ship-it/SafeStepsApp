# SafeSteps Government Recognition Strengthening Brief

Source pass completed against:

`C:\Users\SAFES\SafeStepsApp\CHILD PROTECTION MANUAL FRAMEWORK GUIDELINES`

Date: 2026-07-04.

## Read Status

The useful top-level source documents were read/extracted:

- 7 saved Child Protection Manual HTML pages.
- 17 PDFs, including the 88-page multiple and complex needs specialist resource.

The nested `.download`, `.css`, `.png`, and saved website support files were not treated as content sources because they are page assets, not practice guidance.

## Important Qualification

This material can strengthen SafeSteps for government-facing credibility, but it does not make SafeSteps a government-approved program by itself.

Government approval would require a separate evidence, governance, privacy, clinical/practice supervision, procurement, and evaluation pathway. The useful target is to make SafeSteps clearly align with recognised child protection practice concepts and produce auditable evidence that an agency can assess.

## Highest-Value Alignment Themes

### 1. SAFER Children Framework Alignment

The Practice Dictionary material identifies the SAFER children framework as the Victorian child protection risk assessment framework and describes it as a guided professional judgement model.

SafeSteps should explicitly map its assessment engine to SAFER-style practice activities:

- Seek, share, sort, and store information and evidence.
- Analyse information across child, parent/caregiver, family, culture, community, risk, strengths, protection, and safety domains.
- Form judgement using consequence of harm and probability of harm.
- Review risk assessment as new evidence arrives.

Recommended product change:

- Add a `SAFER alignment` assessment layer that labels each user-uploaded evidence item, reflection, case note, task completion, and professional observation against these categories.

### 2. Guided Professional Judgement, Not Automated Determination

The manual language supports professional judgement, reflective practice, reasoning skills, values, formal knowledge, and practice wisdom.

SafeSteps should avoid presenting itself as making final child protection decisions. It should present scores as structured decision-support evidence.

Recommended product change:

- Add decision-support disclaimers to assessment screens.
- Rename any hard decision language to `readiness indicators`, `risk review prompts`, or `professional judgement support`.
- Add practitioner review states: `draft`, `reviewed`, `contested`, `superseded`.

### 3. Consequence And Probability Of Harm

The source material separates risk judgement into severity/consequence of harm and likelihood/probability of harm.

Recommended product change:

- Extend assessment scoring to separate:
  - consequence/severity of harm
  - probability/likelihood of harm
  - protective factors
  - safety actions already demonstrated
  - unresolved evidence gaps

This would make the app stronger than a flat readiness score because it mirrors statutory risk reasoning more closely.

### 4. Strengths Are Not The Same As Safety

The Practice Dictionary material distinguishes strengths from protection and safety. Strengths may support change, but they do not automatically prove a child is safe.

Recommended product change:

- Split current positive progress indicators into:
  - strengths
  - protective capacities
  - demonstrated safety behaviours
  - verified safety outcomes

This is important for credibility because programs often overclaim parent strengths as safety proof.

### 5. Stability Planning

The manual material describes stability across legal, physical, cultural, and relational dimensions.

Recommended product change:

- Expand SafeSteps stability tracking into four scored dimensions:
  - legal stability
  - physical stability
  - cultural stability
  - relational stability

This should connect to `docs/STABILITY_PLAN.md` and the existing progress/certification logic.

### 6. Cultural Safety And Aboriginal Children

The saved manual pages repeatedly surface Aboriginal children, cultural plans, Aboriginal child and family services, family-led decision-making, and Aboriginal Child Placement Principle references.

Recommended product change:

- Add a cultural safety domain that is not optional when a child is identified as Aboriginal and/or Torres Strait Islander.
- Track cultural plan evidence separately from general parenting progress.
- Add prompts for connection to family, community, culture, language, identity, and Aboriginal-controlled service involvement.

This should be designed carefully and reviewed with appropriate Aboriginal practice expertise before being treated as program content.

### 7. Disability Rights And Accessible Participation

The Charter of Rights PDFs are directly relevant to parent-facing fairness, accessibility, and participation.

Recommended product change:

- Add an accessibility and reasonable-adjustment checklist to intake/profile setup.
- Track parent communication preferences, disability supports, plain-language needs, and support-person involvement.
- Include an `Easy Read` mode for key parent-facing obligations and next steps.

### 8. Interagency Collaboration And Care Teams

The manual material repeatedly references interagency collaboration, care teams, information sharing, and specialist services.

Recommended product change:

- Add a care-team evidence model:
  - service provider
  - role
  - consent basis
  - contact date
  - information shared
  - action required
  - follow-up status

This would support government-facing auditability because reunification work is rarely proven by parent self-report alone.

### 9. AOD, Mental Health, Family Violence, And Complex Needs

The source folder includes AOD treatment service material, drug screen references, complex needs material, and family violence/MARAM-related practice dictionary entries.

Recommended product change:

- Add specialist-domain flags for:
  - alcohol and other drugs
  - mental health
  - family violence/coercive control
  - disability
  - housing instability
  - social isolation
  - complex needs

Each flag should create targeted evidence prompts and referral tracking, not punitive scoring by itself.

### 10. Child Development And Trauma

The child development and trauma PDFs cover developmental stages from infancy through adolescence.

Recommended product change:

- Add age-banded child development expectations into parenting tasks and reflections.
- Connect each parent challenge to the child's developmental stage.
- Add trauma-informed prompts for attunement, co-regulation, predictability, repair, and safe routines.

## Recognition Pathway

To move SafeSteps toward government recognition, the next build should produce an auditable practice framework pack:

1. Practice model:
   - State the SafeSteps model, target population, exclusion criteria, and practitioner role.
2. Evidence matrix:
   - Map every course, task, assessment, and certificate to recognised practice domains.
3. Risk governance:
   - Show that SafeSteps supports professional judgement and does not replace statutory decision-making.
4. Cultural safety:
   - Add review requirements and culturally specific safeguards.
5. Accessibility:
   - Add reasonable-adjustment workflows and Easy Read materials.
6. Data governance:
   - Document privacy, consent, RLS, retention, export, audit logs, and role access.
7. Evaluation plan:
   - Define outcomes, measures, baseline/follow-up timing, adverse event tracking, and independent review.
8. Implementation manual:
   - Provide facilitator guidance, supervision requirements, escalation rules, and quality assurance checks.

## Concrete Backlog

Priority 1:

- Add SAFER-aligned assessment domains and evidence tags.
- Split strength, protection, safety, consequence, and probability scoring.
- Add practitioner review states for assessment outputs.

Priority 2:

- Add cultural safety, accessibility, and care-team modules.
- Add specialist flags for AOD, family violence, disability, mental health, and complex needs.
- Extend stability plan tracking to legal, physical, cultural, and relational stability.

Priority 3:

- Build a government-facing practice framework document set.
- Add outcome/evaluation exports.
- Add privacy, consent, and information-sharing documentation suitable for agency review.

## Existing SafeSteps Assets To Connect

- `docs/REUNIFICATION_ASSESSMENT_BATTERY.md`
- `docs/ASSESSMENT_TOOLS_IMPLEMENTATION_RECONCILIATION.md`
- `docs/STABILITY_PLAN.md`
- `docs/FOUND_MATERIAL_RECONCILIATION.md`
- `supabase/migrations/20260703061540_add_relationship_assessment_layer.sql`
- `lib/data/safestepsReflectionWorksheets.ts`
- `lib/data/safestepsParentChallenges.ts`
- `lib/data/strongFathersCourse.ts`
