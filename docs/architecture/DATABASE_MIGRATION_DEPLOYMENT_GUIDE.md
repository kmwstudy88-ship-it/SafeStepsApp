# SafeSteps Production Database Migration & Deployment Guide
**Target System**: Supabase Production Reference `yzxotxbwgxnxemkzigse`  
**Governing Authority**: [`docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md`](file:///G:/SafeStepsApp/docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md)  
**Schema Date**: October 2026  
**Status**: Ready for Production Release

---

## 1. Overview & Statutory Safeguards

SafeSteps requires strict multi-tenant boundary isolation, child-private data protection, and immutable audit logging. When deploying database migrations to the production environment, the following non-negotiable principles apply:

1. **Immutable Decision Support Principle**:
   - Automated algorithms, risk calculation models, and caseworker actions **cannot alter legal custody status**.
   - Custody changes strictly require an enforceable order issued by a judicial officer of the competent Children's Court.
   - All AI insights and recommendations are saved with `human_review_required = true`.

2. **Forensic Child Voice Separation (`SS-CAR-001`, `SS-LEG-002`)**:
   - Minor child words must be recorded verbatim in dedicated columns (`verbatim_child_words`, `child_words`).
   - Verbatim child quotes must never be paraphrased, conflated with adult editorial comments, or altered.

3. **Child-Private Boundary (`SS-CHD-018`)**:
   - Minor children's private diaries, feelings logs, and creative journals in `child_private_records` are strictly sealed from parents and caseworkers unless the child explicitly grants sharing consent or an acute safeguarding emergency threshold is triggered.

4. **Canonical Entity Independence**:
   - Never equate `cases.id` with `reunification_cases.id`.
   - Never equate `evidence.id` with `evidence_items.id`.
   - Compatibility views in `supabase/migrations/20260911232000_compatibility_views.sql` provide safe read mapping without compromising canonical normalization.

---

## 2. Migration Sequence & Pipeline Catalog

The migrations located in `supabase/migrations/` must be applied in strict chronological order:

### Phase A: Foundational Schemas & Multi-Tenant Boundaries
1. `20260619124944_init_schema.sql` - Core tenant and profile structures
2. `20260627135113_safesteps_core_platform.sql` - Cases, families, and participants
3. `20260627140522_evidence_storage.sql` - Storage buckets for media and receipts
4. `20260629195506_bulk_platform_tables.sql` - Platform entity tables
5. `20260630140347_child_section_privacy.sql` - Child private boundaries & RLS
6. `20260701225859_assessment_data_model.sql` - Assessment instruments and questions

### Phase B: Protective Capacity & Forensic Evidence
7. `20260712143553_seed_safesteps_protective_capacity_assessment.sql` - Protective capacity rubric
8. `20260712171004_forensic_evidence_audit.sql` - SHA-256 fingerprinting & chain of custody
9. `20260713020205_enforce_assessment_immutability.sql` - Immutable assessment snapshot tables
10. `20260715120000_sensitive_access_control_and_audit.sql` - Access audit logging

### Phase C: Personal AI Support & Controlled Memory
11. `20260823223509_personal_ai_support_persistence.sql` - AI support session persistence
12. `20260823231233_personal_ai_incident_response.sql` - De-escalation & incident protocols
13. `20260823231258_controlled_family_memory.sql` - Privacy-preserving memory scopes
14. `20260823231702_personal_ai_launch_readiness_gate.sql` - Safety policy gates
15. `20260823235408_personal_ai_atomic_chat_persistence.sql` - Chat persistence
16. `20260824113000_personal_ai_flow_version_governance.sql` - Version governance

### Phase D: Document Intelligence & Storage Unification
17. `20260911074000_backend_case_infrastructure.sql` - Case infrastructure & triage tables
18. `20260911173000_document_intelligence_pipeline.sql` - Document intelligence tables
19. `20260911174500_document_intelligence_rls_hardening.sql` - Strict document RLS
20. `20260911200000_document_intelligence_storage_unification.sql` - Storage bucket integration
21. `20260911230000_track_c_risk_case_updates.sql` - Immutable risk snapshot history
22. `20260911232000_compatibility_views.sql` - Zero-loss compatibility views
23. `20260915105500_security_inventory_and_video_helper_hardening.sql` - Security inventory views

---

## 3. Pre-Flight Verification Checklist

Before executing migrations on `yzxotxbwgxnxemkzigse`:

- [x] All 272 automated unit and integration tests passing (`npm test`).
- [x] Content readiness verified at 100% (`npm run content:readiness`).
- [x] Route hygiene audited with 0 route candidate issues (`npm run audit:routes`).
- [x] Curriculum titles audited with zero generic titles (`npm run audit:curriculum-titles`).
- [x] Production fail-closed gate tested (`tools/production-readiness-gate.mjs`).

---

## 4. Execution Procedures

### Option 1: Supabase CLI Linked Push (Recommended)
```bash
# 1. Authenticate with Supabase CLI
npx supabase login

# 2. Link to production project
npx supabase link --project-ref yzxotxbwgxnxemkzigse

# 3. Dry-run migration diff
npx supabase db push --dry-run

# 4. Apply migrations
npx supabase db push
```

### Option 2: Direct Migration Verification via pgTAP
```bash
# Run PostgreSQL automated assertions
npx supabase test db
```

---

## 5. Post-Deployment Verification & Smoke Testing

Immediately after migration application, execute:

1. **Verify Live Document Intelligence & OCR Server**:
   ```bash
   node tools/verify-document-intelligence.mjs
   ```

2. **Verify 5-Persona Journeys & Telemetry**:
   ```bash
   node --test tools/tests/e2e-persona-journeys-and-telemetry.test.mjs
   ```

3. **Verify Security Inventory Views**:
   Query `safesteps_security.function_security_inventory` and `safesteps_security.table_security_inventory` to ensure zero unintended public function exposures.
