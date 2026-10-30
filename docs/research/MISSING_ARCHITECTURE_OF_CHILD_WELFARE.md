# The Missing Architecture of Child Welfare: Systemic Gaps and SafeSteps Implementation Reference

> **Purpose**: Reference specification and architectural rationale for SafeSteps' family preservation, poverty-decoupling, relational coaching, peer mentorship, kinship equity, and post-reunification step-down modules.
> **Schema Authority**: All database mappings strictly follow [SAFESTEPS_CANONICAL_SCHEMA.md](../architecture/SAFESTEPS_CANONICAL_SCHEMA.md).

---

## 1. Foundational Research Summary

Modern parenting and reunification programs suffer from eight overlapping structural deficits:

1. **The Conflation of Poverty and Neglect**: Roughly 60% of foster care removals involve allegations of neglect rather than physical or sexual abuse. Material deprivation (eviction risk, utility shut-offs, food insecurity, lack of transportation) is routinely diagnosed as parental unfitness and scored as child-safety risk rather than stabilized with material aid.
2. **Racial Geography & Adversarial Family Regulation**: Hyper-surveillance of marginalized, Black, and Indigenous communities creates an adversarial dynamic where asking for help triggers investigation rather than support, and subjective caseworker framing goes uncontested.
3. **The Fallacy of Didactic Parenting Curricula**: Standardized classroom lectures and quizzes fail parents experiencing toxic stress, intergenerational trauma, and survival-level cognitive overload.
4. **Structural, Relational & Fatherhood Barriers**: Rigid operating hours, transit gaps, agency waitlists, and a "mother-oriented" bias exclude marginalized parents—and systematically marginalize fathers and paternal kin—from reunification.
5. **Monitored Visitation vs. Supportive Family Time**: Sterile surveillance during contact visits and unbuffered pre/post-visit transitions exacerbate separation trauma instead of providing in-the-moment relational coaching (such as ABC-EC and PCIT).
6. **The Void of Economic and Concrete Supports (ECS)**: Upstream legislation (such as FFPSA) omits direct cash transfers, housing vouchers, childcare subsidies, and flexible funds despite empirical evidence that ECS independently lowers maltreatment and placement rates.
7. **The Post-Reunification "Service Cliff"**: Treating physical return home as a binary legal finish line leads to 10%–33% foster care re-entry when subsidies, childcare, and casework abruptly terminate.
8. **Underutilization of Peer Mentorship ("Parent Partners") & Kinship Care Disparity**: Lived-experience Parent Partners increase reunification rates from ~37% to ~62%, while kinship caregivers (grandmothers, aunts) provide superior stability yet are denied financial stipends due to rigid middle-class housing licensing standards.

---

## 2. SafeSteps Architectural Implementation Matrix

| Systemic Deficit | SafeSteps Codebase Implementation | Canonical Schema Domain |
|---|---|---|
| **1. Poverty ≠ Neglect Decoupling** | [`backend/case-risk/rules.js`](../../backend/case-risk/rules.js), [`backend/case-risk/engine.js`](../../backend/case-risk/engine.js), [`backend/case-risk/service.js`](../../backend/case-risk/service.js) (`decoupleMaterialHardship`, `material_hardship_assessment`, `buildConcreteSupportTasks`) | `cases`, `risk_snapshots`, `follow_up_tasks` |
| **2. Procedural Fairness & Bias Detection** | [`lib/fairness/DocumentFairnessViewerScreen.tsx`](../../lib/fairness/DocumentFairnessViewerScreen.tsx), [`lib/concerns/concernsRegisterService.ts`](../../lib/concerns/concernsRegisterService.ts) (`flagMaterialHardshipConflation`) | `fairness_analysis`, `concerns`, `case_family_disagreements`, `report_subject_responses` |
| **3. Relational & Trauma-Informed Coaching** | [`lib/contactVisit/contactVisitService.ts`](../../lib/contactVisit/contactVisitService.ts) (`RELATIONAL_COACHING_PROMPTS` — ABC-EC & PCIT), [`lib/voice/VoiceCalmingCoach.tsx`](../../lib/voice/VoiceCalmingCoach.tsx) | `direct_observation_sessions`, `relationship_observations`, `case_visit_records_v19` |
| **4. Waitlist & Structural Barrier Protection** | [`lib/parentWorkspace/casePlanService.ts`](../../lib/parentWorkspace/casePlanService.ts) (`pauseActionComplianceTimer`), [`lib/reunification/reunificationArchitectureService.ts`](../../lib/reunification/reunificationArchitectureService.ts) (`recordServiceBarrierWithTimerPause`) | `case_plans`, `case_plan_actions`, `case_barriers`, `community_referral_waitlist_records` |
| **5. Quality Family Time & Transition Buffering** | [`lib/contactVisit/ContactVisitCompanionScreen.tsx`](../../lib/contactVisit/ContactVisitCompanionScreen.tsx) | `case_visit_records_v19`, `child_visit_preparations`, `child_visit_reflections` |
| **6. Economic & Concrete Supports (ECS)** | [`lib/reunification/reunificationArchitectureService.ts`](../../lib/reunification/reunificationArchitectureService.ts) (`requestConcreteSupport`, `approveAndDisburseConcreteSupport`) | `cases`, `community_service_referrals` (with required `tenant_id` boundary) |
| **7. Post-Reunification Step-Down Lifecycle** | [`lib/reunification/reunificationArchitectureService.ts`](../../lib/reunification/reunificationArchitectureService.ts) (`getPostReunificationPlan`, `logPostReunificationCheckIn`) | `cases`, `longitudinal_outcome_snapshots` |
| **8. Parent Partners, Fatherhood & Kinship Equity** | [`lib/reunification/reunificationArchitectureService.ts`](../../lib/reunification/reunificationArchitectureService.ts), [`lib/carers/carerPortalService.ts`](../../lib/carers/carerPortalService.ts) (`getKinshipSupportSummary`, `requestKinshipSupportAction`) | `role_definitions`, `case_participants`, `care_arrangements`, `guardianship_records` |
