# SafeSteps Canonical Schema Document

Version: 1.1.0  
Defined: 12 September 2026 (Australia/Brisbane)  
Authority path: `docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md`  
Repository: `kmwstudy88-ship-it/SafeStepsApp`  
Verified database: `yzxotxbwgxnxemkzigse` — Reunification and Parenting Project  
Source commit: `1c7b1864d26f4cbfe975ae9f46637742b9b57abb`

## 1. Authority, scope and interpretation

This document is the single schema decision source for SafeSteps GitHub agents. It defines canonical ownership, compatibility boundaries and the required access contract. Database migrations implement it; generated types describe a deployed version. Neither an old migration, an application reader nor an existing table name independently overrides this contract.

**This is a convergence contract with a verified deployment baseline, not a claim that convergence has already been deployed.** “Required” means normative behavior defined here. “Observed” means catalog or repository evidence inspected on the date above. A table can be canonical for its domain while its foreign keys or policies still require migration.

For runtime implementation, inspect the actual target database and migration history. Where deployment differs, preserve existing data, record the difference and implement a reviewed migration. Do not silently rename a table, equate two UUIDs, create a parallel domain model or bypass authorization to make code run.

Scope includes identity, organizations/tenancy, cases, documents and document intelligence, messaging, evidence, assessments and their supporting governance records. Appendix A inventories every public relation observed. Specialized AI, curriculum, child experience, reporting, community service and safety tables remain owned extensions unless explicitly classified otherwise; existence alone does not make them substitutes for a core table.

No application rows, case contents, personal records or secrets were retrieved for this document.

### 1.1 Evidence baseline

The catalog inspection found **835 public base tables, 24 public views and 197 migration-history entries**. All 835 public base tables have RLS enabled. All 24 public views have `security_invoker=true`. Neither fact proves that the policies provide the required authorization.

The live inventory check reports:

| Object | Observed gap | Contract treatment |
|---|---|---|
| `assessment_instances` | Missing table | Do not create it as a second assessment-run model. Use `assessment_records`; update the inventory expectation in a separate migration/tooling change. |
| `consent_records` | Missing table | Do not invent a generic replacement. Existing `governance_consents` and domain consent tables remain authoritative within their scopes. |
| `community_service_referrals` | Missing `tenant_id` | Resolve its case/organization tenant boundary before claiming complete tenant enforcement. |

The latest recorded migration version is `20260829181644`. Catalog objects can exist without a matching repository filename; migration timestamps alone are not deployment evidence. The September document-intelligence queue/result tables are absent from this project.

### 1.2 Agent rules

1. Read this document before changing schema, RLS, storage, database types or Supabase query paths.
2. Use the canonical table for the intended domain. Use compatibility views only to support existing callers; new writes target base tables or authorized domain services.
3. Treat legacy and deployed transitional tables as existing contracts that must be migrated, not deleted on sight.
4. Never treat `auth.users.id`, a family member ID, a child ID, a staff-profile ID, a `cases.id` and a `reunification_cases.id` as interchangeable.
5. Change this document, migrations, application readers/writers, generated types and relevant security checks together when the contract changes.
6. Do not run new migrations against this project merely because this document names target behavior. Documentation adoption does not itself execute migrations.
7. Keep schema decisions here. Other repositories, including `parent-app`, should link to a pinned version or release of this document instead of maintaining competing copies.
8. If a new environment contains an unlisted relation, classify it explicitly before using it. Never infer that an unlisted table is safe to delete.

## 2. Canonical tables and ownership

All names below are in `public` unless qualified. The exact observed column types, defaults, keys, checks and policies are recorded in the companion metadata snapshot. This section defines domain ownership; the model sections state known deployment limitations.

| Domain | Canonical root | Canonical supporting records |
|---|---|---|
| Authentication | `auth.users` | Supabase-managed identities/sessions; application code must not duplicate password or session storage. |
| Application identity | `profiles` | `staff_profiles`; family/person records are separate from login identity. |
| Family/person | `families`, `family_members`, `children`, `adult_participants` | `households`, `household_memberships`, `family_relationships`, `child_accounts`; privacy and guardianship records remain domain extensions. |
| Tenant | `platform_tenants` | `tenant_memberships`; platform configuration tables remain distinct administrative extensions. |
| Organization | `organisations` | `organisation_units`, `organisation_memberships`, `platform_tenant_organisations`, `worker_teams`, `worker_team_memberships`. |
| Authorization | `role_definitions`, `permission_definitions`, `role_assignments` | `role_permissions`; existing security-role adapters remain transitional. |
| Operational case | `cases` | `case_participants`, `case_allocations`, `case_plans`, `case_plan_goals`, `case_plan_actions`, `case_tasks`, `case_status_history`, `case_decision_records`, `case_notes`, `case_note_visibility_grants`, `case_visit_records_v19`, `case_transfer_records`. |
| Case document | `case_documents` | `case_document_versions`, `case_document_review_events`, `document_entities`, `document_analysis_runs`. |
| Standalone document intelligence | `documents` intake, `document_analyses` results | `document_comparisons`, `document_analysis_jobs`. Repository-defined pipeline; required columns/results/queue are not deployed in the inspected project. |
| Messaging | `messaging_threads`, `messaging_messages` | `messaging_thread_summaries`; `parent_child_messages` is a separate restricted workflow. |
| Evidence vault | `evidence_records` | `evidence_files`, `evidence_metadata`, `evidence_links`, `evidence_verifications`, `evidence_chain_of_custody`, `evidence_digital_signatures`, `evidence_sharing_grants`, `evidence_redactions`, `evidence_legal_holds`, `evidence_retention_policies`, `evidence_retention_events`, `evidence_timeline_events`, `evidence_ai_analyses`, `evidence_audit_log`, `evidence_upload_batches`. |
| Assessment definition | `assessment_instruments`, `assessment_template_versions` | `assessment_domains`, `assessment_items`, `assessment_item_response_options`, `assessment_rubrics`, `assessment_frameworks`, `assessment_scoring_bands`. |
| Assessment administration | `assessment_records` | `assessment_responses`, `assessment_responses_structured`, `assessment_domain_scores`, `assessment_scores`, `assessment_score_overrides`, `assessment_evidence_maps`, `assessment_contradictions`, `assessment_critical_overrides`. |
| Readiness synthesis | `reunification_readiness_assessments_v17`, `reunification_readiness_indices` | Panels, recommendations and overrides remain reviewed synthesis, never substitutes for source assessments. |
| Governance/provenance | `audit_events`, `sensitive_action_audit_log`, `governance_consents`, `governance_legal_holds` | Report versions/snapshots and claim-to-evidence links preserve released outputs and their sources. |

### 2.1 Common contract

New case-scoped records must carry an unambiguous canonical case relationship and tenant boundary. UUID is the identifier type for canonical entity keys. Use `timestamptz` for new event timestamps; preserve historical `timestamp` or `date` values with documented timezone semantics when migrating.

Every new relationship must have a foreign key unless a documented external/polymorphic relationship requires an explicit validation mechanism. Required tenant relationships must not depend on client-supplied IDs alone. Enforce tenant agreement across parent/child links through validated composite keys or trusted validation code with tests.

Null tenant IDs and `NOT VALID` constraints observed in the baseline are migration debt. They are not permission to admit unscoped records into new workflows. Keep semantic status fields separate: deployment aliases such as `status`/`case_status_code` or `assessment_status`/`human_review_status` are not automatically equivalent.

Do not use cascading deletion to implement evidence retention, legal holds, assessment history or case closure. Existing cascade constraints are observed behavior to review before introducing deletion flows.

## 3. Compatibility views

These seven observed views are compatibility aliases. Preserve their existing projection for old readers; new code uses the underlying domain tables. All seven currently specify `security_invoker=true`.

| View | Base table | Exact renamed columns; other selected columns retain their names |
|---|---|---|
| `workers` | `staff_profiles` | `staff_reference → worker_reference`, `staff_role → role`, `employment_status → status`. The view's `id` is a staff-profile ID; `user_id` is the login identity. |
| `case_assignments` | `case_allocations` | `allocated_user_id → worker_id`, `allocated_team_id → team_id`, `allocation_role → role`, `allocation_status → status`, `allocated_at → created_at`. |
| `messages` | `messaging_messages` | `created_by → sender_id`, `body → content`. No recipient or case columns are added. |
| `contradictions` | `assessment_contradictions` | `worker_notes → resolution_notes`, `detected_at → created_at`. This is assessment contradiction data, not standalone AI document comparisons. |
| `risk_indicators` | `safety_risk_indicators` | No aliases in the selected projection; it is not the risk JSON held on a parent profile. |
| `timeline_events` | `evidence_timeline_events` | `child_user_id → child_id`, `event_title → title`, `event_summary → description`, `event_occurred_at → occurred_at`. The alias does **not** convert a login user ID into `children.id`. |
| `visits` | `case_visit_records_v19` | `worker_user_id → worker_id`, `visit_location_type → location_type`, `factual_observations → notes`. |

The remaining 17 views are reporting, queue or dashboard projections, not compatibility table replacements. Their definitions are in the snapshot.

**Required view policy:** compatibility APIs are read-only for new development. PostgreSQL can make simple views automatically updatable, and the inspected grants include more than SELECT on many objects; read-only intent is not proof of enforced read-only access. Enforce SELECT-only grants in a dedicated change if needed. A view must preserve base-table RLS and must not expose protected fields by projection. Never create an independent `messages`, `workers`, `visits` or other alias-named base table.

## 4. Deprecated tables and transitional models

“Deprecated for new development” is a decision in this contract. It does not assert that the table is empty, unused, migrated or safe to drop. No row-level usage or row-count audit was performed.

| Existing table/model | Classification | Replacement or migration rule |
|---|---|---|
| `casefiles` | Deprecated, blocked legacy name | Text `case_id` is not a canonical UUID relationship. Explicitly map retained records into `cases`; do not cast arbitrary IDs. |
| `users` | Deprecated application identity model | `auth_user_id` relates conceptually to login identity; `id` is a separate UUID with no inspected FK. Migrate consumers to `auth.users.id`/`profiles.id` through a verified map. |
| `app_profiles`, `user_profiles` | Deprecated parallel general-profile stores | Consolidate common identity attributes into `profiles`; reconcile conflicting values and preserve source provenance. Do not drop until readers and writers are migrated. |
| `reunification_cases` | Transitional case root; deprecated as a second general case model | `cases` is the convergence root. Existing assessments, memberships, parent/child profiles, evidence items and case documents still depend on this table. No equivalence to `cases.id` is established. |
| `evidence` | Deprecated generic evidence store | Preserve source material and map to the relevant learning/child domain or `evidence_records` with provenance. Do not promote an activity upload to verified evidence automatically. |
| `evidence_items` | Transitional legacy vault input | Existing immutable payloads and case memberships remain valid within their deployed contract. `evidence_records.source_evidence_item_id` is the observed bridge to the vault. It is not a case-ID conversion. |
| `assessments` | Deprecated generic catalog for new assessment architecture | Use `assessment_instruments` and versioned templates for definitions; `assessment_records` for administrations. Do not reinterpret catalog IDs as administration IDs. |
| `case_allocations_v19` | Transitional competing allocation store | Converge allocations on `case_allocations`. Existing `safesteps_can_access_case_v19` still reads the v19 table, so migrate helper logic with data and callers. |
| `case_plan_goals_v19`, `case_plan_actions_v19` | Transitional planning variants | Converge on unsuffixed canonical planning tables only after reconciling columns, references and permissions. |
| `user_roles`, `security_roles`, `security_permissions`, `user_role_assignments` | Transitional authorization family | Existing helpers still read these. New tenant authorization uses canonical role/permission definitions and assignments; preserve adapters until every policy/helper is reconciled. |
| `platform_tenant_memberships` | Transitional platform-configuration membership | `tenant_memberships` is canonical application tenant access. Configuration helpers still use this separate table; no silent synchronization or interchangeable membership assumption. |

Reserved/blocked legacy names from the repository inventory: `casefiles`, `case_files`, `client_cases`, `family_cases`, `service_case_records`, `assessment_runs`, `assessment_sessions`, `tenant_users`, `account_tenants`. Only `casefiles` was observed in the public relation inventory. Do not create the absent names.

`documents`, `parent_profiles`, `child_profiles`, `parent_child_messages` and version-suffixed domain tables are **not** automatically deprecated just because their names resemble another model. Follow their explicit domain contract below.

## 5. Identity model

### 5.1 Identity invariants

The canonical signed-in actor is `auth.uid() = auth.users.id`. The canonical application profile is `profiles.id`, whose observed primary relationship references `auth.users(id)` with cascade deletion. Do not use email, display name, phone, `profiles.role` or client metadata as a stable identity key.

`profiles.auth_user_id` is a nullable legacy alias. The live helpers `safesteps_auth_profile_id()` and `safesteps_auth_role()` query `auth_user_id = auth.uid() OR id = auth.uid()` with `LIMIT 1`. This is transitional lookup behavior, not permission to create a second profile for an existing login. Reconcile duplicates/alias conflicts before simplifying helpers.

A person can exist without a login. `family_members` represents membership in a family; `children` represents a child person record; `adult_participants` represents adult participation. Optional user/profile relationships connect a person to an account, not the reverse. `staff_profiles.id` is a staff record; `staff_profiles.user_id` references `auth.users.id`.

`parent_profiles` contains case-specific parent information and currently references `reunification_cases`; it is not the shared identity profile. `child_profiles.child_user_id`, `child_profiles.child_id`, `child_profiles.id` and `children.id` must remain distinguishable. An absent child FK must not be “resolved” by matching names.

### 5.2 Authorization identity

A profile's display role is not the authority for newly introduced sensitive operations. Membership, effective dates, status, tenant and explicit permissions determine access. Clients may edit approved presentation/preferences fields only. Role, tenant, account status and case authorization fields require trusted administration.

The baseline has owner UPDATE policies on `profiles`, while `safesteps_auth_role()` reads `profiles.role`. No profile trigger was found in the inspected public trigger inventory. Treat mutable role-bearing columns as a concrete authorization review item; inspect column grants and all trusted update paths before claiming escalation is prevented.

Account deactivation must revoke domain memberships/access in addition to changing profile presentation state. Service accounts must use their own scoped execution identity and audit trail; never impersonate an arbitrary user ID in a privileged query.

## 6. Organization model

An organization is an operating entity; a tenant is the data-isolation boundary. Persist the existing British spelling: `organisations`, `organisation_id`, `organisation_memberships`. Do not introduce parallel American-spelled database tables.

Canonical chain:

`platform_tenants → organisations → organisation_units`

User access is represented by `tenant_memberships` plus `organisation_memberships`, with explicit tenant-scoped `role_assignments`. Teams use `worker_teams` and `worker_team_memberships`; a staff profile does not itself grant access to all organizational cases.

Observed `current_tenant_ids()` reads active, unrevoked, effective `tenant_memberships` joined to tenants in `active`, `restricted_grace` or `migration` status. `has_tenant_access()` delegates to it. The target must define allowed operations per tenant status; read access during restricted operation must not imply full write permission.

`platform_tenant_organisations` records platform organization links. Where it and `organisations.tenant_id` coexist, require consistency. `organisations.tenant_id` is currently nullable with an unvalidated FK; tenant completeness has not been established.

Cross-tenant access requires an explicit, time-bounded, resource-scoped grant and auditable purpose. Organizational hierarchy, a global-looking role name or a user's membership in two tenants is not a sharing authorization.

## 7. Case model

### 7.1 Canonical ownership

`cases` owns operational case identity, tenant, organization, family, lifecycle, priority and referral context. Case participants describe involved people; allocations describe worker/team responsibility; neither implies unrestricted access to every sensitive child or evidence record.

`case_plans → case_plan_goals → case_plan_actions` is the canonical planning hierarchy. `case_tasks` tracks operational work. Decisions, visits, notes, transfers, status history and closure records are separate facts linked to the case.

Prefer `case_title`, `case_type_code`, `case_status_code` and `priority_code` for new canonical operational readers where populated and supported. Historical `title`, `status`, `case_type` and `priority_level` remain stored columns; no automatic synchronization was verified. Backfill and define write ownership before making newer fields mandatory. Keep the current required `title` satisfied until its migration changes the physical contract.

### 7.2 The two-case-root boundary

Observed foreign keys establish two distinct domains:

| Case root | Representative children |
|---|---|
| `cases.id` | `case_participants`, operational allocations/plans, `evidence_records.case_id`, `profiles.case_id` |
| `reunification_cases.id` | `case_memberships.case_id`, `parent_profiles.case_id`, `child_profiles.case_id`, `assessment_records.case_id`, `evidence_items.case_id`, `document_analysis_runs.case_id` |

A generic `case_id: string` API type hides this distinction. During transition, use explicit domain types/names and validate the referenced root. Existing `case_memberships` helpers must not be reused with `cases.id` by assumption.

Required migration sequence:

1. Inventory records, all inbound FKs, helper functions, views, storage references and application consumers.
2. Establish a durable one-to-one or explicitly reconciled mapping from each retained reunification case to its operational case. Do not join on family labels, names or coincidental equal UUIDs.
3. Preserve case owners, memberships, assessment history, evidence provenance, sharing restrictions and audit identity.
4. Migrate in dependency order with dual-read/adapter behavior defined explicitly. Avoid indefinite independent dual writes.
5. Validate row parity, unmatched mappings, tenant consistency and both permitted/denied access paths before switching clients.
6. Retire the old root only after all dependent contracts are satisfied. This document does not create or populate a mapping table.

## 8. Document-intelligence model

SafeSteps has two document workflows. Their records have different identities and cannot be merged by renaming a table.

### 8.1 Deployed case-document lane

`case_documents` is the case document record; `case_document_versions` preserves versioned source files; `case_document_review_events` records review activity. `document_entities.document_id` references `case_documents.id`.

`document_analysis_runs` stores a case-scoped analysis request with:

- `id`, `case_id`, `requested_by`;
- optional `document_id → case_documents.id` and `document_version_id → case_document_versions.id`;
- `source_mode`, `source_metadata`, `schema_version`, `model`;
- `status`, `result`, error fields and start/completion/creation timestamps.

Its case FK currently targets `reunification_cases`. Exact enum/check values must come from the snapshot, not from the standalone queue's state machine.

### 8.2 Repository-defined standalone lane

Repository migrations `20260911173000_document_intelligence_pipeline.sql` and `20260911174500_document_intelligence_rls_hardening.sql` define:

| Table | Contract |
|---|---|
| `documents` | Uploaded source metadata, storage location, SHA-256, extracted text and processing state. |
| `document_analyses` | Document FK, actor, provider/model/schema version, structured summary/evidence/contradiction/timeline/risk/bias/fairness/limitation outputs, usage, raw output and job state. |
| `document_comparisons` | Actor, optional case, 2–10 document IDs, provider/model/version, structured result and processing state. |
| `document_analysis_jobs` | Durable queue; exactly one analysis-document or comparison target, attempts, claim data, availability, completion and errors. |

The queue's state values are `queued`, `processing`, `completed`, `failed`. The claim function uses row locks with `SKIP LOCKED`, bounded batch size and bounded attempts. Results and queue are intended for service-role backend access; direct client access is revoked in the repository migrations.

**Deployment gap:** the inspected `documents` table has only `id`, `user_id`, `family_id`, `file_url` and `created_at`. It still has `user_id → public.users.id`. The backend's `authenticateBearer` verifies a Supabase user and its pipeline uses that user's ID. Applying the September ALTER alone does not retarget that legacy FK. Resolve the identity mapping and FK before enabling upload writes. `document_analyses`, `document_comparisons` and `document_analysis_jobs` are absent.

The standalone migration adds a nullable `case_id` without an FK and stores comparison document IDs in an array. Required target behavior is explicit canonical case validation and ownership/resource authorization for every document in a comparison. Neither an array of valid UUIDs nor a verified JWT is sufficient.

### 8.3 Provenance, review and storage

Every analysis must identify the exact source/version or immutable content hash, provider/model, schema version, requester and execution state. Derived entities and assertions need source locations where available; confidence is uncertainty metadata, not verification.

AI output remains decision support. It must not silently become evidence verification, an assessment score, a safety determination or a case decision. Human review and explicit provenance links are required for promotion into professional records.

The proposed `document-intelligence` bucket is private and capped at 25 MiB by the repository migration. Its deployment was not verified through bucket metadata. Use authorized short-lived file delivery and server-generated storage references; avoid exposing permanent public URLs. Backend queries using service role must enforce ownership, tenant/case access and every requested resource explicitly because that role bypasses RLS.

Do not duplicate the source file into both lanes without an explicit source-link/version contract. Do not substitute `document_entities.document_id` with a `documents.id`.

## 9. Messaging model

`messaging_threads` owns a conversation with `id`, `created_at`, `created_by`, optional `title` and `owner_user_id`. `messaging_messages` owns messages with `id`, `thread_id`, `created_at`, `created_by` and `body`. Its FK references `messaging_threads` with cascade deletion.

Observed access is an **owner-only thread model**:

- Thread SELECT/INSERT/UPDATE/DELETE checks `owner_user_id = auth.uid()`.
- Message SELECT requires ownership of the parent thread.
- Message INSERT/UPDATE/DELETE additionally requires `created_by = auth.uid()`.

There is no observed thread-members table, case FK, organization FK or recipient list on these roots. They must not be described as deployed multi-party case messaging. The thread `created_by` field is not constrained to the session by the observed INSERT policy; validate author provenance in any new trusted write path.

`messaging_thread_summaries` is derived material. `parent_child_messages` is a separate domain with child-safety and sharing requirements; it is not an alias of the thread tables.

For future shared messaging, first define participants, effective/revoked access, case/tenant binding, attachment authorization, moderation/review and retention. Do not expand owner-only RLS with a blanket authenticated-user policy. Existing DELETE paths are observed behavior, not a suitable evidence-retention policy. Promoting a message into evidence requires a preserved snapshot with author/time/source provenance.

## 10. Evidence model

`evidence_records` is the canonical vault root. It carries required `tenant_id`, reference/title/type/source/status/privacy, uploader, timestamps and legal-hold/deletion flags, with optional case/family/child links and an optional legacy source-item link.

Observed keys include:

- `tenant_id → platform_tenants.id`;
- `case_id → cases.id`;
- `family_id → families.id`, `child_id → children.id`;
- `source_evidence_item_id → evidence_items.id`;
- `uploader_user_id → auth.users.id`.

Files, metadata, links, verification, custody, signatures, redactions, sharing grants and retention events remain separate records. Preserve original bytes and hashes; a redaction is a derived version with its own provenance, not an overwrite of the original. A checksum verifies byte consistency; it does not by itself prove authenticity, truth, legal admissibility or chain-of-custody completeness.

The observed `evidence_items` table holds legacy hashes, storage references, source data and review/dispute state. Its update trigger `reject_stored_evidence_immutable_fields()` protects selected stored fields. Do not infer that every vault table or file is immutable from that one trigger.

Required access combines tenant authority, explicit resource/case scope, privacy/sharing rules, expiry/revocation and deletion/hold status. The observed `has_evidence_access()` accepts tenant permission, case access, uploader identity or a valid sharing grant and excludes `deleted=true`; it does not directly inspect `privacy_level`. Thus broad case access must not be represented as proven child/private-evidence protection.

Retention must honor active legal holds across records, original files, redactions, exports and derived intelligence. Deletion is an audited workflow, never a cascading client operation. Evidence uploads, verification, changes, sharing and exports need attributable audit records.

Repository media-evidence migrations additionally define media analysis/integrity structures, including `media_files`, `media_hashes` and `media_evidence`; these names were not observed in this project. They remain a separate undeployed extension contract and must be integrated with vault provenance before deployment, not silently recreated under alternate names.

## 11. Assessment model

Separate four layers:

1. **Definition:** instrument, framework, versioned template, domain, item, response options, rubric and scoring bands.
2. **Administration:** `assessment_records` identifies a particular administration for a subject/case, instrument/template version, phase, date, creator and review state.
3. **Observed responses and calculated results:** raw/structured responses, domain scores, scores, evidence maps and explicit overrides.
4. **Professional synthesis:** readiness assessments/indices, panels, recommendations and reviewed case decisions.

`assessment_records.instrument_id` references `assessment_instruments`; `template_version_id` references `assessment_template_versions`; `supersedes_assessment_id` references a prior record. `case_id` currently references `reunification_cases`. A template version must be compatible with the selected instrument; do not assume two independent FKs enforce that relationship.

Raw answers, score calculations and human interpretation must remain distinguishable. Keep the instrument/template/scoring version and evidence inputs sufficient to reproduce a score. Finalized administrations require versioned correction/supersession; an audit event alone is not immutability.

Both `status` and `assessment_status` exist, alongside `human_review_status`. Define the authoritative write path and reconcile states before introducing lifecycle transitions. Do not treat a completed questionnaire as a completed human review. Observed assessment triggers include an UPDATE audit trigger, but no general finalized-record immutability trigger was found in the inspected public trigger inventory.

A completed learning activity, automated risk flag or AI result must not become a professional capacity finding without the applicable instrument and human review. Readiness synthesis must preserve limitations, critical overrides, missing evidence and disagreement.

`assessment_instances`, `assessment_runs` and `assessment_sessions` are not alternative canonical administration tables. The inventory's missing `assessment_instances` expectation must be reconciled with `assessment_records`, not fulfilled through duplication.

## 12. RLS rules

### 12.1 Required security contract

SQL grants and RLS are separate controls. Every exposed base table requires RLS and least-privilege grants. Restrict views and RPCs independently. Session identity must be verified; do not authorize from user-editable metadata. See the [Supabase RLS reference](https://supabase.com/docs/guides/database/postgres/row-level-security).

| Resource | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Profile | Self or explicitly authorized scoped staff projection | Trusted provisioning | Self presentation fields; protected identity/role/case fields through administration | Controlled account lifecycle |
| Tenant/org memberships and roles | Self or authorized scoped administrator | Authorized administrator | Authorized administrator, including role/status/scope changes | Revocation/history workflow |
| Operational cases | Active tenant and case/resource permission | Tenant `case.create` plus valid organization/family relationships | Scoped manage permission; protect tenant/owner reassignment | Controlled closure/retention process |
| Case-private records | Case authority plus record-specific restrictions | Authorized domain actor | Authorized domain actor and valid new relationships | Domain retention workflow |
| Case documents/analysis | Case access plus source-specific privacy | Authorized request; source and version belong to permitted case | Trusted processing/review; requester cannot forge verified results | Retention and legal-hold workflow |
| Standalone intelligence internals | Authorized backend resource read | Authorized backend queue request | Worker/review service | Controlled retention service |
| Owner messaging | Thread owner | Thread owner; author equals session | Thread owner and message author | Existing owner model until retention redesign |
| Evidence | Tenant/case/resource access plus privacy and grants | Authorized uploader; validate all related scopes | Separate metadata, review and verification permissions | Audited retention service; holds deny |
| Assessment definitions | Authorized catalog audience | Instrument administrator | Versioned authoring | Retire definitions referenced by history |
| Assessment administrations | Authorized subject/staff with case and privacy rules | Authorized administration workflow | Draft response/review permissions; finalized content superseded | Controlled retention process |
| Audit/custody/released snapshots | Explicit auditor/resource permission | Trusted append-only event producer | No ordinary client mutation | Authorized retention only |

Required policy mechanics:

- SELECT/DELETE use `USING`; INSERT uses `WITH CHECK`; UPDATE must validate both the existing and proposed row. UPDATE also needs appropriate SELECT access.
- Validate immutable ownership and tenant/case relationships through column privileges, triggers or trusted RPCs; row ownership alone does not protect sensitive columns.
- Canonical permission evaluation includes active tenant membership, effective role assignment, permission and resource scope. The live `has_permission()` checks role assignment dates and permission state but does not inspect `scope_type`/`scope_reference` or require a `tenant_memberships` join. Do not claim full scope enforcement from that helper alone.
- Reconcile **all** policies on a relation. Permissive policies combine with OR; adding a permissive `USING(false)` policy does not override another allowing policy. SQL privileges, restrictive policies, functions and triggers must also be considered.
- Security-definer functions need a controlled search path, explicit authorization and restricted EXECUTE grants. Do not grant broad execution to resolve errors.
- Private child material requires its specific grants/restrictions; family membership or a staff label alone is insufficient.
- Signed file delivery must recheck access and expiry. RLS on metadata does not secure a public storage URL.
- Service-role workers must implement the same resource boundary in trusted code and log the true actor.

### 12.2 Observed policy behavior and limitations

The snapshot contains exact selected policies and grants. These observations are not security certifications.

| Area | Verified baseline | Required reconciliation |
|---|---|---|
| `profiles` | Multiple self/staff policies; owner UPDATE; role helper reads `profiles.role` | Protect role, tenant and case authorization fields from self-editing. |
| `cases` | Permission-based SELECT/INSERT/UPDATE plus `admin_manage_cases` and `assigned_case_read` | Evaluate combined paths; remove dependence on mutable/global role shortcuts. |
| `assessment_records` | Seven policies including broad parent/completer/admin ALL, case-role paths and legacy profile-based ALL paths | A restrictive-looking case policy alone does not secure the table. Reconcile all policies and finalization writes. |
| `document_analysis_runs` | Case-role SELECT/INSERT; requester with active membership can UPDATE | Restrict worker-controlled result/status fields; requester identity is not permission to approve AI output. |
| `document_entities` | ALL policy joins case documents to `case_participants` | Verify case-root consistency with the document's actual FK; do not assume operational and reunification cases align. |
| `documents` | RLS with false ALL policy | September standalone fields and internals absent; backend service-role behavior must be checked separately. |
| `evidence_records` | SELECT through `has_evidence_access`, INSERT requires uploader and upload permission, UPDATE through `can_manage_evidence` | Enforce privacy, tenant agreement, immutable originals and separation of upload versus verification. |
| `staff_profiles` | ALL allows self or casework management | Prevent self-editing of organization, role and employment authority fields. |
| `platform_tenant_memberships` | ALL policy includes `user_id = auth.uid()` in both predicates | Self path can authorize membership changes if grants permit; do not treat this as trusted tenant admission. |
| `assessments`, `users` | Allowing SELECT policies coexist with false ALL policies | False permissive policies do not establish denial. |
| Messaging | Owner-only paths described in section 9 | No deployed shared-case messaging model. |

No authenticated multi-user execution tests were run and no policies were changed while producing this artifact. Catalog evidence establishes definitions, not end-to-end security outcomes.

## 13. Migration and release gates

Adopt this document without changing data. Implement convergence in reviewed, bounded changes:

1. Resolve identity/protected-column authorization and tenant membership authority.
2. Establish and verify the two-case-root mapping.
3. Reconcile canonical organization/tenant/role relationships and unvalidated constraints.
4. Migrate dependent assessments, case documents and legacy evidence with preserved provenance.
5. Deploy standalone document intelligence only after its legacy user FK and case/resource boundaries are fixed.
6. Reconcile all permissive policy paths, view grants, privileged helpers and private storage access.
7. Retire deprecated tables only after dependency/usage checks, validation and a recovery plan.

For each schema change require relevant tests for allowed and denied actors, cross-tenant and cross-case access, revoked/expired membership, self-escalation, ownership reassignment, view/RPC/storage routes and service-role endpoints. For provenance changes test immutable originals, finalized assessment corrections, legal holds and source-version integrity.

Record the migration versions and target project, regenerate database types, update this document's baseline and keep unresolved differences explicit. A passing migration or enabled RLS flag alone is not a release gate.

## 14. Source references and maintenance

Primary project evidence:

- [SafeStepsApp source commit](https://github.com/kmwstudy88-ship-it/SafeStepsApp/tree/1c7b1864d26f4cbfe975ae9f46637742b9b57abb)
- [Stage 1 catalog inventory](https://github.com/kmwstudy88-ship-it/SafeStepsApp/blob/1c7b1864d26f4cbfe975ae9f46637742b9b57abb/supabase/tests/stage1_canonical_inventory.sql)
- [Sensitive access and case-membership migration](https://github.com/kmwstudy88-ship-it/SafeStepsApp/blob/1c7b1864d26f4cbfe975ae9f46637742b9b57abb/supabase/migrations/20260715120000_sensitive_access_control_and_audit.sql)
- [Standalone document-intelligence migration](https://github.com/kmwstudy88-ship-it/SafeStepsApp/blob/1c7b1864d26f4cbfe975ae9f46637742b9b57abb/supabase/migrations/20260911173000_document_intelligence_pipeline.sql)
- [Standalone intelligence RLS migration](https://github.com/kmwstudy88-ship-it/SafeStepsApp/blob/1c7b1864d26f4cbfe975ae9f46637742b9b57abb/supabase/migrations/20260911174500_document_intelligence_rls_hardening.sql)
- [Document backend identity verification](https://github.com/kmwstudy88-ship-it/SafeStepsApp/blob/1c7b1864d26f4cbfe975ae9f46637742b9b57abb/backend/document-intelligence/supabase.js)
- [Document backend persistence](https://github.com/kmwstudy88-ship-it/SafeStepsApp/blob/1c7b1864d26f4cbfe975ae9f46637742b9b57abb/backend/document-intelligence/pipeline.js)
- [Supabase project](https://supabase.com/dashboard/project/yzxotxbwgxnxemkzigse)
- [Catalog snapshot](./safesteps-schema-snapshot.json): machine-readable metadata for this baseline; this document remains the decision authority.

The Supabase changelog markdown fetch was unavailable during review; no implementation changes were made based on an assumed API version. Current RLS documentation was inspected.

Maintain semantic versions: major for breaking identity/ownership changes, minor for compatible domain additions, patch for corrections that do not change the contract. Every material change must include rationale, deployment state, migration references and affected readers/writers.

## 15. Production acceptance and change control

Document status: **maintained master contract**. Database readiness status: **not yet demonstrated**. No release may cite adoption of this document as proof that the implementation is production ready. Each gate below needs executable evidence against the release candidate and the named target environment.

### 15.1 Decision register

| ID | Binding decision | Implementation boundary |
|---|---|---|
| SC-001 | `auth.users.id` identifies an authenticated actor; `profiles.id` is its application profile. | Reconcile legacy aliases and protect authorization columns before simplifying identity helpers. |
| SC-002 | `cases` is the operational case convergence root. | Existing `reunification_cases` foreign keys remain valid until an explicit, verified mapping migrates them. |
| SC-003 | `evidence_records` owns vault metadata and provenance. | Preserve legacy originals and source-item links; do not infer case equivalence through an evidence link. |
| SC-004 | `assessment_records` owns assessment administrations. | Version instruments, responses, calculations and reviewed outcomes separately. |
| SC-005 | The seven compatibility views preserve old projections. | New writes use canonical base-table/domain contracts; deployed grants still require review. |
| SC-006 | Case-document and standalone intelligence are separate source domains. | Join them only through a documented source/version mapping; the standalone pipeline has unresolved deployment and identity prerequisites. |
| SC-007 | Tenant membership, effective resource scope and permission jointly authorize access. | Existing permissive policies and legacy helper paths must be reconciled, not assumed to implement this decision. |
| SC-008 | No table retirement follows automatically from deprecation. | Require dependency discovery, mapped data validation, consumer migration and recoverability. |

### 15.2 Blocking implementation register

Owners below are responsibility roles, not assignments to named people or agents. Status is OPEN unless release evidence explicitly closes it. Priorities describe release gates for the affected workflow, not proven exploit severity.

| ID | Gate | Accountable role | Closure evidence |
|---|---|---|---|
| PG-01 | Identity and protected-column authority | Identity/security maintainer | Tests deny self-assigned roles, tenant membership and staff organization changes through direct tables, views and RPCs; trusted provisioning remains functional. |
| PG-02 | Two-case-root convergence | Case/data migration maintainer | Complete retained-record mapping, unmatched/duplicate report, validated inbound references, preserved memberships and cross-case denial tests. |
| PG-03 | Tenant/resource isolation | Security/data maintainer | Effective membership and assignment scope enforced on every relevant access path; missing/null tenant and unvalidated FK exceptions resolved or quarantined. |
| PG-04 | Standalone document pipeline deployment | Document/backend maintainer | Legacy user FK reconciled, source/case authorization validated, migrations and types aligned, private storage verified, worker retries and failed-job recovery tested. |
| PG-05 | Evidence integrity and retention | Evidence/security maintainer | Original-byte integrity, custody, restricted access, redaction lineage and legal-hold protection tested across storage and exports. |
| PG-06 | Assessment finalization and review | Assessment maintainer | Instrument/version consistency, reproducible scoring and immutable finalization/supersession tested; AI cannot finalize professional findings. |
| PG-07 | Complete authorization-path reconciliation | Security maintainer | All applicable permissive/restrictive policies, grants, helper execution rights and privileged backend routes evaluated; role-based negative tests pass. |
| PG-08 | Recoverability and deployment verification | Release maintainer | Restore rehearsal, migration rehearsal, recovery procedure, target-project check and post-deploy smoke evidence attached to the release. |

Changes to unrelated retained extensions do not require implementing every convergence gate. They must prove that the affected workflow meets applicable gates and does not widen access or introduce a competing core model. A platform-wide production-readiness claim requires all relevant gates to close.

### 15.3 Required release evidence

For each release, retain a versioned record containing the application commit, canonical schema version, target project/environment, applied migration versions, schema comparison, generated-type version, relevant test results, unresolved exceptions, recovery procedure and accountable reviewer. Evidence must identify what was actually executed and when; a proposed test plan is not a passing result.

Run authorization tests as distinct authenticated actors, not solely as `postgres` or service role. At minimum cover a permitted actor, another actor in the same tenant without resource permission, an actor in another tenant, revoked/expired membership, an unauthenticated client and the actual privileged backend route. Include denied inserts, updates and deletes as well as reads. Assert protected-column reassignment and source-document substitution fail.

Use disposable fixtures or an isolated representative environment for destructive tests. Compare pre/post migration counts, unique mappings, orphan references and source hashes where applicable. Every exception must identify its affected workflow and compensating restriction; do not record a broad “accepted risk” as a substitute for an access boundary.

### 15.4 Operational contract

Long-running jobs need idempotent request identity, bounded attempts, an explicit stale-claim recovery policy and observable failure states. The repository's queue claim function alone does not demonstrate recovery of abandoned processing jobs. A retry must not duplicate a finalized analysis, assessment or evidence event.

Record processing/audit identifiers and safe error categories in logs; exclude raw document content, access tokens and unnecessary personal data. Monitor denied-access anomalies, processing failures, queue age, integrity failures and migration errors. Thresholds and retention periods must be explicitly defined by the operating team before launch; this document does not invent legal or service commitments.

Case closure, membership revocation and consent withdrawal must have defined effects on in-flight work, cached access, signed URLs and downstream exports. Test the actual enforcement latency. Backups and exports must preserve the same access and retention restrictions as source records, and a restore rehearsal must verify both data and authorization behavior.

### 15.5 Review and compatibility policy

Every contract-changing pull request must state the decision IDs it changes, its data migration strategy, affected readers/writers, rollout order, verification evidence and recovery approach. A breaking change requires a major contract version or an explicitly bounded compatibility period. During that period, identify the single authoritative writer and the adapter's retirement condition.

Maintain a change history here rather than creating competing schema masters. Other repositories should reference an immutable commit or released version and upgrade deliberately. Changes to this document do not silently update those repositories or their deployed code.

| Version | Change |
|---|---|
| 1.0.0 | Defined canonical ownership, deployed baseline, model boundaries, compatibility mappings, deprecations and RLS requirements. |
| 1.1.0 | Added binding decision IDs, implementation gates, release evidence, operational requirements and cross-repository version control. |

### 15.6 PG-01 implementation progress

Repository migration `20260912092748_identity_client_write_boundaries.sql`
implements the direct-client privilege boundary for `profiles`,
`staff_profiles`, `platform_tenant_memberships` and the `workers` compatibility
view. It removes direct client provisioning/deletion and permits only an explicit
presentation-field UPDATE allowlist. Independent column grants are removed;
unexpected inherited privileges abort the migration. Existing RLS remains in place.

The isolated PostgreSQL suite in `tools/identity-security` reproduces the original
self-promotion behavior and tests the corrected boundary. Its CI workflow runs
on migration and test changes. Trusted backend/definer writes remain privileged
and require separate authorization review.

**PG-01 remains OPEN.** This is repository implementation, not evidence of
production deployment. Before release, verify Auth provisioning, intake and
administrative workflows in staging, inspect external consumers and audit
privileged RPCs. The catalog snapshot remains the original baseline and must not
be rewritten to imply that this migration has been applied.

## Appendix A. Complete observed public relation registry

Classification is exhaustive for the inspected public schema. “Canonical/domain” means a named core or supporting table in this contract; “Transitional/deprecated” means section 4 applies; “Retained extension” means preserve its existing specialized domain contract and do not substitute it for a core model. All base tables below had RLS enabled; all views were security invoker. Supabase-managed schemas are outside this public registry.


| Relation | Kind | Classification |
|---|---|---|
| `access_review_campaigns` | Table | Retained extension |
| `access_review_items` | Table | Retained extension |
| `account_recovery_events` | Table | Retained extension |
| `achievements` | Table | Retained extension |
| `activities` | Table | Retained extension |
| `adult_participants` | Table | Canonical/domain |
| `ai_accessibility_evaluations` | Table | Retained extension |
| `ai_accessibility_variants` | Table | Retained extension |
| `ai_accessibility_versions` | Table | Retained extension |
| `ai_alert_groups` | Table | Retained extension |
| `ai_alert_routing_rules` | Table | Retained extension |
| `ai_appeal_outcomes` | Table | Retained extension |
| `ai_appeal_panels` | Table | Retained extension |
| `ai_appeals` | Table | Retained extension |
| `ai_automation_boundary_rules` | Table | Retained extension |
| `ai_backup_records` | Table | Retained extension |
| `ai_backup_restore_tests` | Table | Retained extension |
| `ai_budget_status_snapshots` | Table | Retained extension |
| `ai_calibration_assessments` | Table | Retained extension |
| `ai_canary_release_stages` | Table | Retained extension |
| `ai_canary_releases` | Table | Retained extension |
| `ai_candidate_model_build_reviews` | Table | Retained extension |
| `ai_candidate_model_builds` | Table | Retained extension |
| `ai_capacity_forecasts` | Table | Retained extension |
| `ai_capacity_measurements` | Table | Retained extension |
| `ai_change_approvals` | Table | Retained extension |
| `ai_change_deployment_gates` | Table | Retained extension |
| `ai_change_evaluation_plans` | Table | Retained extension |
| `ai_change_impact_assessments` | Table | Retained extension |
| `ai_change_post_release_reviews` | Table | Retained extension |
| `ai_change_release_decisions` | Table | Retained extension |
| `ai_change_request_reviews` | Table | Retained extension |
| `ai_change_requests` | Table | Retained extension |
| `ai_change_rollback_plans` | Table | Retained extension |
| `ai_child_explanation_responses` | Table | Retained extension |
| `ai_child_explanations` | Table | Retained extension |
| `ai_child_feedback_controls` | Table | Retained extension |
| `ai_compliance_exports` | Table | Retained extension |
| `ai_confidence_explanations` | Table | Retained extension |
| `ai_contestability_evidence` | Table | Retained extension |
| `ai_contestability_metrics` | Table | Retained extension |
| `ai_contestability_notifications` | Table | Retained extension |
| `ai_contestability_requests` | Table | Retained extension |
| `ai_contestability_service_levels` | Table | Retained extension |
| `ai_contestability_triage` | Table | Retained extension |
| `ai_context_assembly_runs` | Table | Retained extension |
| `ai_context_items` | Table | Retained extension |
| `ai_context_packages` | Table | Retained extension |
| `ai_continuous_evaluation_runs` | Table | Retained extension |
| `ai_continuous_evaluation_schedules` | Table | Retained extension |
| `ai_contradiction_explanations` | Table | Retained extension |
| `ai_controlled_experiments` | Table | Retained extension |
| `ai_correction_actions` | Table | Retained extension |
| `ai_correction_requests` | Table | Retained extension |
| `ai_cost_allocations` | Table | Retained extension |
| `ai_cost_anomalies` | Table | Retained extension |
| `ai_cost_centres` | Table | Retained extension |
| `ai_cost_events` | Table | Retained extension |
| `ai_court_disclosures` | Table | Retained extension |
| `ai_critical_failure_definitions` | Table | Retained extension |
| `ai_cultural_evaluation_panels` | Table | Retained extension |
| `ai_cultural_review_findings` | Table | Retained extension |
| `ai_cultural_reviews` | Table | Retained extension |
| `ai_current_service_health` | View | Derived projection |
| `ai_data_eligibility_rules` | Table | Retained extension |
| `ai_dataset_change_items` | Table | Retained extension |
| `ai_dataset_change_sets` | Table | Retained extension |
| `ai_dataset_improvement_batches` | Table | Retained extension |
| `ai_dataset_quality_checks` | Table | Retained extension |
| `ai_dataset_records` | Table | Retained extension |
| `ai_dataset_representativeness_reviews` | Table | Retained extension |
| `ai_decision_components` | Table | Retained extension |
| `ai_decision_decomposition_steps` | Table | Retained extension |
| `ai_disaster_recovery_exercises` | Table | Retained extension |
| `ai_disaster_recovery_plans` | Table | Retained extension |
| `ai_emergency_changes` | Table | Retained extension |
| `ai_evaluation_audit_events` | Table | Retained extension |
| `ai_evaluation_baselines` | Table | Retained extension |
| `ai_evaluation_errors` | Table | Retained extension |
| `ai_evaluation_exclusions` | Table | Retained extension |
| `ai_evaluation_items` | Table | Retained extension |
| `ai_evaluation_metric_results` | Table | Retained extension |
| `ai_evaluation_metrics` | Table | Retained extension |
| `ai_evaluation_plans` | Table | Retained extension |
| `ai_evaluation_prompt_items` | Table | Retained extension |
| `ai_evaluation_prompt_sets` | Table | Retained extension |
| `ai_evaluation_residual_risks` | Table | Retained extension |
| `ai_evaluation_runs` | Table | Retained extension |
| `ai_evaluation_subgroups` | Table | Retained extension |
| `ai_evaluation_thresholds` | Table | Retained extension |
| `ai_evidence_assessments` | Table | Retained extension |
| `ai_evidence_lineage` | Table | Retained extension |
| `ai_experiment_assignments` | Table | Retained extension |
| `ai_experiment_protocols` | Table | Retained extension |
| `ai_experiment_results` | Table | Retained extension |
| `ai_experiment_safety_events` | Table | Retained extension |
| `ai_explainability_audit_events` | Table | Retained extension |
| `ai_explanation_evidence_links` | Table | Retained extension |
| `ai_explanation_feedback` | Table | Retained extension |
| `ai_explanation_quality_reviews` | Table | Retained extension |
| `ai_explanation_records` | Table | Retained extension |
| `ai_explanation_requests` | Table | Retained extension |
| `ai_explanation_templates` | Table | Retained extension |
| `ai_explanation_translations` | Table | Retained extension |
| `ai_explanation_validation_results` | Table | Retained extension |
| `ai_explanation_versions` | Table | Retained extension |
| `ai_explanation_views` | Table | Retained extension |
| `ai_explanation_withdrawals` | Table | Retained extension |
| `ai_explanations` | Table | Retained extension |
| `ai_fairness_results` | Table | Retained extension |
| `ai_fairness_test_results` | Table | Retained extension |
| `ai_fairness_test_suites` | Table | Retained extension |
| `ai_fallback_activations` | Table | Retained extension |
| `ai_feedback_channels` | Table | Retained extension |
| `ai_feedback_records` | Table | Retained extension |
| `ai_feedback_signals` | Table | Retained extension |
| `ai_feedback_trends` | Table | Retained extension |
| `ai_fleet_members` | Table | Retained extension |
| `ai_fleet_status_snapshots` | Table | Retained extension |
| `ai_governance_audit_events` | Table | Retained extension |
| `ai_governance_bodies` | Table | Retained extension |
| `ai_governance_decisions` | Table | Retained extension |
| `ai_governance_memberships` | Table | Retained extension |
| `ai_governance_principles` | Table | Retained extension |
| `ai_guardrail_evaluations` | Table | Retained extension |
| `ai_guardrail_rules` | Table | Retained extension |
| `ai_guardrail_sets` | Table | Retained extension |
| `ai_hallucination_grounding_results` | Table | Retained extension |
| `ai_hosting_decisions` | Table | Retained extension |
| `ai_human_correction_learning_records` | Table | Retained extension |
| `ai_human_edits` | Table | Retained extension |
| `ai_human_factors_results` | Table | Retained extension |
| `ai_human_factors_studies` | Table | Retained extension |
| `ai_human_oversight_requirements` | Table | Retained extension |
| `ai_human_review_decisions` | Table | Retained extension |
| `ai_human_review_items` | Table | Retained extension |
| `ai_human_review_queues` | Table | Retained extension |
| `ai_human_reviews` | Table | Retained extension |
| `ai_improvement_scorecards` | Table | Retained extension |
| `ai_incident_actions` | Table | Retained extension |
| `ai_incidents` | Table | Retained extension |
| `ai_independent_validations` | Table | Retained extension |
| `ai_inference_policies` | Table | Retained extension |
| `ai_inference_requests` | Table | Retained extension |
| `ai_influenced_data_records` | Table | Retained extension |
| `ai_knowledge_base_sources` | Table | Retained extension |
| `ai_knowledge_base_versions` | Table | Retained extension |
| `ai_knowledge_change_impacts` | Table | Retained extension |
| `ai_knowledge_change_requests` | Table | Retained extension |
| `ai_knowledge_source_reviews` | Table | Retained extension |
| `ai_knowledge_supersession_records` | Table | Retained extension |
| `ai_language_evaluations` | Table | Retained extension |
| `ai_learning_approval_steps` | Table | Retained extension |
| `ai_learning_approval_workflows` | Table | Retained extension |
| `ai_learning_audit_events` | Table | Retained extension |
| `ai_learning_candidate_reviews` | Table | Retained extension |
| `ai_learning_candidates` | Table | Retained extension |
| `ai_learning_change_audit_events` | Table | Retained extension |
| `ai_learning_contamination_findings` | Table | Retained extension |
| `ai_learning_correction_reviews` | Table | Retained extension |
| `ai_learning_corrections` | Table | Retained extension |
| `ai_learning_example_candidates` | Table | Retained extension |
| `ai_learning_example_quality_reviews` | Table | Retained extension |
| `ai_learning_governance_findings` | Table | Retained extension |
| `ai_learning_governance_policies` | Table | Retained extension |
| `ai_learning_governance_rules` | Table | Retained extension |
| `ai_learning_pipeline_runs` | Table | Retained extension |
| `ai_learning_signal_triage` | Table | Retained extension |
| `ai_learning_signals` | Table | Retained extension |
| `ai_longitudinal_improvement_metrics` | Table | Retained extension |
| `ai_longitudinal_quality_snapshots` | Table | Retained extension |
| `ai_machine_unlearning_actions` | Table | Retained extension |
| `ai_machine_unlearning_requests` | Table | Retained extension |
| `ai_maintenance_execution_events` | Table | Retained extension |
| `ai_maintenance_windows` | Table | Retained extension |
| `ai_missing_information_records` | Table | Retained extension |
| `ai_model_capability_approvals` | Table | Retained extension |
| `ai_model_cards` | Table | Retained extension |
| `ai_model_change_events` | Table | Retained extension |
| `ai_model_compatibility_records` | Table | Retained extension |
| `ai_model_configurations` | Table | Retained extension |
| `ai_model_data_restrictions` | Table | Retained extension |
| `ai_model_deployments` | Table | Retained extension |
| `ai_model_improvement_projects` | Table | Retained extension |
| `ai_model_lifecycle_audit_events` | Table | Retained extension |
| `ai_model_monitoring_metrics` | Table | Retained extension |
| `ai_model_providers` | Table | Retained extension |
| `ai_model_retirement_assessments` | Table | Retained extension |
| `ai_model_retirement_events` | Table | Retained extension |
| `ai_model_retirement_plans` | Table | Retained extension |
| `ai_model_rollback_events` | Table | Retained extension |
| `ai_model_rollout_steps` | Table | Retained extension |
| `ai_model_routing_decisions` | Table | Retained extension |
| `ai_model_routing_policies` | Table | Retained extension |
| `ai_model_use_case_approvals` | Table | Retained extension |
| `ai_model_versions` | Table | Retained extension |
| `ai_models` | Table | Retained extension |
| `ai_monitoring_alerts` | Table | Retained extension |
| `ai_operational_alerts` | Table | Retained extension |
| `ai_operational_communications` | Table | Retained extension |
| `ai_operational_incident_links` | Table | Retained extension |
| `ai_operational_readiness_reviews` | Table | Retained extension |
| `ai_operational_regions` | Table | Retained extension |
| `ai_operational_risks` | Table | Retained extension |
| `ai_operational_runbooks` | Table | Retained extension |
| `ai_operational_services` | Table | Retained extension |
| `ai_operations_audit_events` | Table | Retained extension |
| `ai_operations_escalations` | Table | Retained extension |
| `ai_operations_shift_handovers` | Table | Retained extension |
| `ai_ops_human_review_capacity_plans` | Table | Retained extension |
| `ai_ops_human_review_queue_snapshots` | Table | Retained extension |
| `ai_output_citations` | Table | Retained extension |
| `ai_output_lineage_records` | Table | Retained extension |
| `ai_output_processing_policies` | Table | Retained extension |
| `ai_output_validation_results` | Table | Retained extension |
| `ai_override_patterns` | Table | Retained extension |
| `ai_override_records` | Table | Retained extension |
| `ai_parent_explanations` | Table | Retained extension |
| `ai_pilot_evaluations` | Table | Retained extension |
| `ai_policy_versions` | Table | Retained extension |
| `ai_production_validation_samples` | Table | Retained extension |
| `ai_prohibited_decisions` | Table | Retained extension |
| `ai_prompt_approval_records` | Table | Retained extension |
| `ai_prompt_approval_requests` | Table | Retained extension |
| `ai_prompt_bundle_deployments` | Table | Retained extension |
| `ai_prompt_bundles` | Table | Retained extension |
| `ai_prompt_change_requests` | Table | Retained extension |
| `ai_prompt_comparison_tests` | Table | Retained extension |
| `ai_prompt_evaluation_findings` | Table | Retained extension |
| `ai_prompt_evaluation_runs` | Table | Retained extension |
| `ai_prompt_evolution_records` | Table | Retained extension |
| `ai_prompt_injection_scans` | Table | Retained extension |
| `ai_prompt_releases` | Table | Retained extension |
| `ai_prompt_rollback_records` | Table | Retained extension |
| `ai_prompt_rollbacks` | Table | Retained extension |
| `ai_prompt_security_evaluations` | Table | Retained extension |
| `ai_prompt_telemetry_events` | Table | Retained extension |
| `ai_prompt_templates` | Table | Retained extension |
| `ai_prompt_variables` | Table | Retained extension |
| `ai_prompt_versions` | Table | Retained extension |
| `ai_prompt_workflow_audit_events` | Table | Retained extension |
| `ai_prompt_workflow_change_requests` | Table | Retained extension |
| `ai_prompt_workflow_compatibility` | Table | Retained extension |
| `ai_provider_assessments` | Table | Retained extension |
| `ai_provider_concentration_snapshots` | Table | Retained extension |
| `ai_provider_contract_controls` | Table | Retained extension |
| `ai_provider_model_change_events` | Table | Retained extension |
| `ai_provider_service_measurements` | Table | Retained extension |
| `ai_provider_sla_assessments` | Table | Retained extension |
| `ai_quality_scorecards` | Table | Retained extension |
| `ai_red_team_campaigns` | Table | Retained extension |
| `ai_red_team_findings` | Table | Retained extension |
| `ai_regression_results` | Table | Retained extension |
| `ai_regression_suites` | Table | Retained extension |
| `ai_release_assurance_packages` | Table | Retained extension |
| `ai_release_conditions` | Table | Retained extension |
| `ai_release_decisions` | Table | Retained extension |
| `ai_release_freezes` | Table | Retained extension |
| `ai_release_gates` | Table | Retained extension |
| `ai_release_operations` | Table | Retained extension |
| `ai_retrieval_contradictions` | Table | Retained extension |
| `ai_retrieval_policies` | Table | Retained extension |
| `ai_retrieval_query_plans` | Table | Retained extension |
| `ai_retrieval_results` | Table | Retained extension |
| `ai_retrieval_source_manifests` | Table | Retained extension |
| `ai_review_conflicts` | Table | Retained extension |
| `ai_review_outcomes` | Table | Retained extension |
| `ai_review_requests` | Table | Retained extension |
| `ai_reviewer_drift_assessments` | Table | Retained extension |
| `ai_risk_assessments` | Table | Retained extension |
| `ai_risk_signals` | Table | Retained extension |
| `ai_robustness_test_runs` | Table | Retained extension |
| `ai_runbook_executions` | Table | Retained extension |
| `ai_safety_scenario_results` | Table | Retained extension |
| `ai_service_capacity_profiles` | Table | Retained extension |
| `ai_service_dependencies` | Table | Retained extension |
| `ai_service_error_budgets` | Table | Retained extension |
| `ai_service_failover_events` | Table | Retained extension |
| `ai_service_failover_policies` | Table | Retained extension |
| `ai_service_fallback_configurations` | Table | Retained extension |
| `ai_service_health_events` | Table | Retained extension |
| `ai_service_level_indicator_results` | Table | Retained extension |
| `ai_service_level_objectives` | Table | Retained extension |
| `ai_shadow_comparison_results` | Table | Retained extension |
| `ai_shadow_deployments` | Table | Retained extension |
| `ai_supervisor_explanations` | Table | Retained extension |
| `ai_system_suspensions` | Table | Retained extension |
| `ai_tool_call_authorisations` | Table | Retained extension |
| `ai_tool_calls` | Table | Retained extension |
| `ai_tool_invocation_logs` | Table | Retained extension |
| `ai_tool_permission_grants` | Table | Retained extension |
| `ai_tool_registry` | Table | Retained extension |
| `ai_training_datasets` | Table | Retained extension |
| `ai_transparency_packages` | Table | Retained extension |
| `ai_uncertainty_assessments` | Table | Retained extension |
| `ai_unit_cost_metrics` | Table | Retained extension |
| `ai_use_case_prohibited_decision_checks` | Table | Retained extension |
| `ai_use_cases` | Table | Retained extension |
| `ai_use_disclosures` | Table | Retained extension |
| `ai_worker_explanations` | Table | Retained extension |
| `ai_workflow_change_requests` | Table | Retained extension |
| `ai_workflow_execution_runs` | Table | Retained extension |
| `ai_workflow_step_runs` | Table | Retained extension |
| `ai_workflow_steps` | Table | Retained extension |
| `ai_workflow_templates` | Table | Retained extension |
| `ai_workflow_versions` | Table | Retained extension |
| `ai_workload_classes` | Table | Retained extension |
| `ai_workload_queue_snapshots` | Table | Retained extension |
| `app_profiles` | Table | Transitional/deprecated |
| `assessment_behaviour_rating_items` | Table | Retained extension |
| `assessment_collaterals` | Table | Retained extension |
| `assessment_contradictions` | Table | Canonical/domain |
| `assessment_critical_overrides` | Table | Canonical/domain |
| `assessment_domain_scores` | Table | Canonical/domain |
| `assessment_domains` | Table | Canonical/domain |
| `assessment_evidence_maps` | Table | Canonical/domain |
| `assessment_framework_audit_events` | Table | Retained extension |
| `assessment_frameworks` | Table | Canonical/domain |
| `assessment_instruments` | Table | Canonical/domain |
| `assessment_item_response_options` | Table | Canonical/domain |
| `assessment_items` | Table | Canonical/domain |
| `assessment_protective_factors` | Table | Retained extension |
| `assessment_questions` | Table | Retained extension |
| `assessment_records` | Table | Canonical/domain |
| `assessment_responses` | Table | Canonical/domain |
| `assessment_responses_structured` | Table | Canonical/domain |
| `assessment_risk_factors` | Table | Retained extension |
| `assessment_rubrics` | Table | Canonical/domain |
| `assessment_score_overrides` | Table | Canonical/domain |
| `assessment_scores` | Table | Canonical/domain |
| `assessment_scoring_bands` | Table | Canonical/domain |
| `assessment_sequence_steps` | Table | Retained extension |
| `assessment_template_versions` | Table | Canonical/domain |
| `assessments` | Table | Transitional/deprecated |
| `audit_events` | Table | Canonical/domain |
| `bundle_items` | Table | Retained extension |
| `bundles` | Table | Retained extension |
| `care_arrangements` | Table | Retained extension |
| `case_allocation_history_v19` | Table | Retained extension |
| `case_allocations` | Table | Canonical/domain |
| `case_allocations_v19` | Table | Transitional/deprecated |
| `case_appointments` | Table | Retained extension |
| `case_assignments` | View | Compatibility view |
| `case_barriers` | Table | Retained extension |
| `case_closure_records` | Table | Retained extension |
| `case_court_hearings` | Table | Retained extension |
| `case_decision_records` | Table | Canonical/domain |
| `case_document_requests` | Table | Retained extension |
| `case_document_review_events` | Table | Canonical/domain |
| `case_document_versions` | Table | Canonical/domain |
| `case_documents` | Table | Canonical/domain |
| `case_family_disagreements` | Table | Retained extension |
| `case_handover_records` | Table | Retained extension |
| `case_intake_status` | Table | Retained extension |
| `case_legal_references` | Table | Retained extension |
| `case_management_work_queue` | View | Derived projection |
| `case_memberships` | Table | Canonical/domain |
| `case_milestones` | Table | Retained extension |
| `case_note_visibility_grants` | Table | Canonical/domain |
| `case_notes` | Table | Canonical/domain |
| `case_operational_audit_events` | Table | Retained extension |
| `case_orders` | Table | Retained extension |
| `case_participants` | Table | Canonical/domain |
| `case_plan_actions` | Table | Canonical/domain |
| `case_plan_actions_v19` | Table | Transitional/deprecated |
| `case_plan_goals` | Table | Canonical/domain |
| `case_plan_goals_v19` | Table | Transitional/deprecated |
| `case_plan_objectives` | Table | Retained extension |
| `case_plans` | Table | Canonical/domain |
| `case_priority_definitions` | Table | Retained extension |
| `case_progress_notes` | Table | Retained extension |
| `case_referral_decisions` | Table | Retained extension |
| `case_referral_documents` | Table | Retained extension |
| `case_referral_screenings` | Table | Retained extension |
| `case_referrals` | Table | Retained extension |
| `case_report_delivery_attempts` | Table | Retained extension |
| `case_report_delivery_challenges` | Table | Retained extension |
| `case_report_export_events` | Table | Retained extension |
| `case_report_release_events` | Table | Retained extension |
| `case_reviews` | Table | Retained extension |
| `case_safety_plans` | Table | Retained extension |
| `case_service_referrals` | Table | Retained extension |
| `case_sessions` | Table | Retained extension |
| `case_status_definitions` | Table | Retained extension |
| `case_status_history` | Table | Canonical/domain |
| `case_strengths` | Table | Retained extension |
| `case_supervision_reviews` | Table | Retained extension |
| `case_tasks` | Table | Canonical/domain |
| `case_team_memberships` | Table | Retained extension |
| `case_teams` | Table | Retained extension |
| `case_transfer_readiness_queue` | View | Derived projection |
| `case_transfer_records` | Table | Canonical/domain |
| `case_transfers` | Table | Retained extension |
| `case_type_definitions` | Table | Retained extension |
| `case_visit_records_v19` | Table | Canonical/domain |
| `case_visitations` | Table | Retained extension |
| `casefiles` | Table | Transitional/deprecated |
| `cases` | Table | Canonical/domain |
| `certificates` | Table | Retained extension |
| `child_accounts` | Table | Canonical/domain |
| `child_achievement_awards_v20` | Table | Retained extension |
| `child_achievement_definitions` | Table | Retained extension |
| `child_achievements` | Table | Retained extension |
| `child_activity_responses` | Table | Retained extension |
| `child_advocacy_requests` | Table | Retained extension |
| `child_body_map_responses` | Table | Retained extension |
| `child_choice_records` | Table | Retained extension |
| `child_complaint_responses` | Table | Retained extension |
| `child_complaints` | Table | Retained extension |
| `child_consent_assent_records` | Table | Retained extension |
| `child_content_safety_reviews` | Table | Retained extension |
| `child_content_sharing_requests` | Table | Retained extension |
| `child_daily_tasks` | Table | Retained extension |
| `child_dashboard_configurations` | Table | Retained extension |
| `child_dashboard_summary` | View | Derived projection |
| `child_decision_explanations` | Table | Retained extension |
| `child_development_profiles_v20` | Table | Retained extension |
| `child_disclosures` | Table | Retained extension |
| `child_evidence` | Table | Retained extension |
| `child_experience_safety_review_queue` | View | Derived projection |
| `child_experience_safety_signal_reviews` | Table | Retained extension |
| `child_experience_safety_signals` | Table | Retained extension |
| `child_feeling_definitions` | Table | Retained extension |
| `child_feelings_checkins` | Table | Retained extension |
| `child_friendly_safety_plans` | Table | Retained extension |
| `child_game_session_participants` | Table | Retained extension |
| `child_game_sessions` | Table | Retained extension |
| `child_goal_progress_records` | Table | Retained extension |
| `child_interface_profiles` | Table | Retained extension |
| `child_journal_entries` | Table | Retained extension |
| `child_journals` | Table | Retained extension |
| `child_learning_enrolments` | Table | Retained extension |
| `child_learning_games` | Table | Retained extension |
| `child_lesson_sessions` | Table | Retained extension |
| `child_lessons_progress` | Table | Retained extension |
| `child_notifications` | Table | Retained extension |
| `child_personal_goals` | Table | Retained extension |
| `child_platform_sessions` | Table | Retained extension |
| `child_privacy_decisions` | Table | Retained extension |
| `child_privacy_profiles` | Table | Retained extension |
| `child_privacy_settings` | Table | Retained extension |
| `child_private_records` | Table | Retained extension |
| `child_profiles` | Table | Canonical/domain |
| `child_progress_assessments` | Table | Retained extension |
| `child_record_corrections` | Table | Retained extension |
| `child_record_safety_overrides` | Table | Retained extension |
| `child_record_shares` | Table | Retained extension |
| `child_request_responses` | Table | Retained extension |
| `child_requests` | Table | Retained extension |
| `child_safe_people` | Table | Retained extension |
| `child_safe_places` | Table | Retained extension |
| `child_session_support_events` | Table | Retained extension |
| `child_shared_items` | Table | Retained extension |
| `child_sharing_audit_view` | View | Derived projection |
| `child_sharing_grants` | Table | Retained extension |
| `child_sharing_preferences` | Table | Retained extension |
| `child_storybook_pages` | Table | Retained extension |
| `child_storybooks` | Table | Retained extension |
| `child_strength_records` | Table | Retained extension |
| `child_support_request_responses` | Table | Retained extension |
| `child_support_requests` | Table | Retained extension |
| `child_task_responses` | Table | Retained extension |
| `child_tasks` | Table | Retained extension |
| `child_visit_experience_reflections` | Table | Retained extension |
| `child_visit_preferences` | Table | Retained extension |
| `child_visit_preparations` | Table | Retained extension |
| `child_visit_reflections` | Table | Retained extension |
| `child_wishes_views` | Table | Retained extension |
| `children` | Table | Canonical/domain |
| `collateral_report_records` | Table | Retained extension |
| `community_provider_contacts` | Table | Retained extension |
| `community_provider_locations` | Table | Retained extension |
| `community_referral_barriers` | Table | Retained extension |
| `community_referral_bookings` | Table | Retained extension |
| `community_referral_consents` | Table | Retained extension |
| `community_referral_engagement_events` | Table | Retained extension |
| `community_referral_follow_up_queue` | View | Derived projection |
| `community_referral_outcomes` | Table | Retained extension |
| `community_referral_waitlist_records` | Table | Retained extension |
| `community_resource_guides` | Table | Retained extension |
| `community_service_alternatives` | Table | Retained extension |
| `community_service_audit_events` | Table | Retained extension |
| `community_service_capacity_snapshots` | Table | Retained extension |
| `community_service_categories` | Table | Retained extension |
| `community_service_delivery_sites` | Table | Retained extension |
| `community_service_directory_view` | View | Derived projection |
| `community_service_eligibility_rules` | Table | Retained extension |
| `community_service_feedback` | Table | Retained extension |
| `community_service_information_reviews` | Table | Retained extension |
| `community_service_match_results` | Table | Retained extension |
| `community_service_providers` | Table | Retained extension |
| `community_service_referrals` | Table | Retained extension |
| `community_service_search_requests` | Table | Retained extension |
| `community_service_suitability_rules` | Table | Retained extension |
| `community_services` | Table | Retained extension |
| `concerns` | Table | Retained extension |
| `contact_sessions` | Table | Retained extension |
| `contradictions` | View | Compatibility view |
| `courses` | Table | Retained extension |
| `court_bundle_exhibits` | Table | Retained extension |
| `court_bundles` | Table | Retained extension |
| `court_report_assessment_packages` | Table | Retained extension |
| `court_report_snapshots` | Table | Retained extension |
| `court_report_supervisor_approvals` | Table | Retained extension |
| `crisis_audit_events` | Table | Retained extension |
| `crisis_events` | Table | Retained extension |
| `curriculum` | Table | Retained extension |
| `data_classifications` | Table | Retained extension |
| `delegated_authorities` | Table | Retained extension |
| `direct_observation_sessions` | Table | Retained extension |
| `document_analysis_runs` | Table | Canonical/domain |
| `document_entities` | Table | Canonical/domain |
| `documents` | Table | Canonical/domain |
| `domestic_violence_indicators` | Table | Retained extension |
| `dynamic_risk_assessment_items` | Table | Retained extension |
| `emergency_access_events` | Table | Retained extension |
| `enrolments` | Table | Retained extension |
| `evidence` | Table | Transitional/deprecated |
| `evidence_ai_analyses` | Table | Canonical/domain |
| `evidence_audit_log` | Table | Canonical/domain |
| `evidence_category_definitions` | Table | Retained extension |
| `evidence_chain_of_custody` | Table | Canonical/domain |
| `evidence_digital_signatures` | Table | Canonical/domain |
| `evidence_files` | Table | Canonical/domain |
| `evidence_items` | Table | Transitional/deprecated |
| `evidence_legal_holds` | Table | Canonical/domain |
| `evidence_links` | Table | Canonical/domain |
| `evidence_metadata` | Table | Canonical/domain |
| `evidence_record_categories` | Table | Retained extension |
| `evidence_records` | Table | Canonical/domain |
| `evidence_redactions` | Table | Canonical/domain |
| `evidence_retention_events` | Table | Canonical/domain |
| `evidence_retention_policies` | Table | Canonical/domain |
| `evidence_sharing_grants` | Table | Canonical/domain |
| `evidence_timeline_events` | Table | Canonical/domain |
| `evidence_timeline_view` | View | Derived projection |
| `evidence_type_definitions` | Table | Retained extension |
| `evidence_upload_batches` | Table | Canonical/domain |
| `evidence_vault_dashboard_view` | View | Derived projection |
| `evidence_verifications` | Table | Canonical/domain |
| `facilitator_notes` | Table | Retained extension |
| `facilitator_observations` | Table | Retained extension |
| `fairness_analysis` | Table | Retained extension |
| `families` | Table | Canonical/domain |
| `family_address_links` | Table | Retained extension |
| `family_addresses` | Table | Retained extension |
| `family_contact_points` | Table | Retained extension |
| `family_members` | Table | Canonical/domain |
| `family_relationship_history` | Table | Retained extension |
| `family_relationships` | Table | Canonical/domain |
| `forensic_scores` | Table | Retained extension |
| `governance_access_decisions` | Table | Retained extension |
| `governance_approvals` | Table | Retained extension |
| `governance_consents` | Table | Canonical/domain |
| `governance_legal_holds` | Table | Canonical/domain |
| `guardianship_records` | Table | Retained extension |
| `home_visit_records` | Table | Retained extension |
| `household_memberships` | Table | Canonical/domain |
| `households` | Table | Canonical/domain |
| `learning_accessibility_profiles` | Table | Retained extension |
| `learning_activities` | Table | Retained extension |
| `learning_activity_completions` | Table | Retained extension |
| `learning_activity_responses` | Table | Retained extension |
| `learning_assignments` | Table | Retained extension |
| `learning_audit_events` | Table | Retained extension |
| `learning_badge_awards` | Table | Retained extension |
| `learning_badges` | Table | Retained extension |
| `learning_catalogues` | Table | Retained extension |
| `learning_categories` | Table | Retained extension |
| `learning_certificate_eligibility` | Table | Retained extension |
| `learning_certificate_requirements` | Table | Retained extension |
| `learning_certificates` | Table | Retained extension |
| `learning_challenge_assignments` | Table | Retained extension |
| `learning_challenge_completions` | Table | Retained extension |
| `learning_challenge_evidence_requirements` | Table | Retained extension |
| `learning_challenge_templates` | Table | Retained extension |
| `learning_competencies` | Table | Retained extension |
| `learning_competency_levels` | Table | Retained extension |
| `learning_competency_progress` | Table | Retained extension |
| `learning_completion_events` | Table | Retained extension |
| `learning_content_adaptations` | Table | Retained extension |
| `learning_content_blocks` | Table | Retained extension |
| `learning_content_outcome_links` | Table | Retained extension |
| `learning_course_frameworks` | Table | Retained extension |
| `learning_course_modules` | Table | Retained extension |
| `learning_course_progress` | Table | Retained extension |
| `learning_courses` | Table | Retained extension |
| `learning_cultural_profiles` | Table | Retained extension |
| `learning_daily_challenges` | Table | Retained extension |
| `learning_enrolment_goals` | Table | Retained extension |
| `learning_enrolments` | Table | Retained extension |
| `learning_evidence_reviews` | Table | Retained extension |
| `learning_evidence_submissions` | Table | Retained extension |
| `learning_evidence_tasks` | Table | Retained extension |
| `learning_family_activities` | Table | Retained extension |
| `learning_frameworks` | Table | Retained extension |
| `learning_interactive_activities` | Table | Retained extension |
| `learning_journal_entries` | Table | Retained extension |
| `learning_journals` | Table | Retained extension |
| `learning_knowledge_check_attempts` | Table | Retained extension |
| `learning_knowledge_check_items` | Table | Retained extension |
| `learning_knowledge_checks` | Table | Retained extension |
| `learning_lesson_activities` | Table | Retained extension |
| `learning_lesson_attempts` | Table | Retained extension |
| `learning_lesson_competencies` | Table | Retained extension |
| `learning_lesson_evidence_tasks` | Table | Retained extension |
| `learning_lesson_quality_reviews` | Table | Retained extension |
| `learning_lesson_quizzes` | Table | Retained extension |
| `learning_lesson_reflections` | Table | Retained extension |
| `learning_lesson_scenarios` | Table | Retained extension |
| `learning_lesson_screens` | Table | Retained extension |
| `learning_lesson_videos` | Table | Retained extension |
| `learning_lessons` | Table | Retained extension |
| `learning_module_weeks` | Table | Retained extension |
| `learning_modules` | Table | Retained extension |
| `learning_monthly_programs` | Table | Retained extension |
| `learning_outcomes` | Table | Retained extension |
| `learning_paths` | Table | Retained extension |
| `learning_pathway_items` | Table | Retained extension |
| `learning_pathways` | Table | Retained extension |
| `learning_personalisation_profiles` | Table | Retained extension |
| `learning_personalisation_recommendations` | Table | Retained extension |
| `learning_program_courses` | Table | Retained extension |
| `learning_program_progress` | Table | Retained extension |
| `learning_programs` | Table | Retained extension |
| `learning_progress_snapshots` | Table | Retained extension |
| `learning_progression_rules` | Table | Retained extension |
| `learning_quiz_answers` | Table | Retained extension |
| `learning_quiz_attempts` | Table | Retained extension |
| `learning_quiz_questions` | Table | Retained extension |
| `learning_quizzes` | Table | Retained extension |
| `learning_recommendations` | Table | Retained extension |
| `learning_reflection_journals` | Table | Retained extension |
| `learning_reflection_prompts` | Table | Retained extension |
| `learning_reflection_responses` | Table | Retained extension |
| `learning_review_notes` | Table | Retained extension |
| `learning_safety_reviews` | Table | Retained extension |
| `learning_scenario_attempts` | Table | Retained extension |
| `learning_scenario_steps` | Table | Retained extension |
| `learning_scenarios` | Table | Retained extension |
| `learning_screen_content_blocks` | Table | Retained extension |
| `learning_screen_progress` | Table | Retained extension |
| `learning_storybooks` | Table | Retained extension |
| `learning_streaks` | Table | Retained extension |
| `learning_video_lessons` | Table | Retained extension |
| `learning_video_progress` | Table | Retained extension |
| `learning_video_segments` | Table | Retained extension |
| `learning_videos` | Table | Retained extension |
| `learning_week_lessons` | Table | Retained extension |
| `learning_weekly_missions` | Table | Retained extension |
| `learning_weeks` | Table | Retained extension |
| `lesson_progress` | Table | Retained extension |
| `lesson_responses` | Table | Retained extension |
| `lessons` | Table | Retained extension |
| `longitudinal_outcome_snapshots` | Table | Retained extension |
| `mandatory_notifications` | Table | Retained extension |
| `messages` | View | Compatibility view |
| `messaging_messages` | Table | Canonical/domain |
| `messaging_thread_summaries` | Table | Canonical/domain |
| `messaging_threads` | Table | Canonical/domain |
| `missing_child_events` | Table | Retained extension |
| `notifications` | Table | Retained extension |
| `organisation_memberships` | Table | Canonical/domain |
| `organisation_units` | Table | Canonical/domain |
| `organisations` | Table | Canonical/domain |
| `parent_child_messages` | Table | Canonical/domain |
| `parent_onboarding_consent_events` | Table | Retained extension |
| `parent_profiles` | Table | Canonical/domain |
| `parent_progress_assessments` | Table | Retained extension |
| `parents` | Table | Retained extension |
| `permission_decision_logs` | Table | Retained extension |
| `permission_definitions` | Table | Canonical/domain |
| `platform_billing_events` | Table | Retained extension |
| `platform_branding_profiles` | Table | Retained extension |
| `platform_configuration_schemas` | Table | Retained extension |
| `platform_cross_tenant_access_grants` | Table | Retained extension |
| `platform_cross_tenant_sharing_agreements` | Table | Retained extension |
| `platform_cultural_content_packs` | Table | Retained extension |
| `platform_feature_definitions` | Table | Retained extension |
| `platform_feature_rollout_cohorts` | Table | Retained extension |
| `platform_jurisdiction_packs` | Table | Retained extension |
| `platform_language_packs` | Table | Retained extension |
| `platform_regional_configurations` | Table | Retained extension |
| `platform_tenant_api_credentials` | Table | Retained extension |
| `platform_tenant_audit_events` | Table | Retained extension |
| `platform_tenant_compliance_attestations` | Table | Retained extension |
| `platform_tenant_configuration_summary` | View | Derived projection |
| `platform_tenant_configurations` | Table | Retained extension |
| `platform_tenant_cultural_pack_assignments` | Table | Retained extension |
| `platform_tenant_data_registry` | Table | Retained extension |
| `platform_tenant_data_retention_policies` | Table | Retained extension |
| `platform_tenant_deletion_requests` | Table | Retained extension |
| `platform_tenant_deployment_releases` | Table | Retained extension |
| `platform_tenant_domains` | Table | Retained extension |
| `platform_tenant_environments` | Table | Retained extension |
| `platform_tenant_export_requests` | Table | Retained extension |
| `platform_tenant_feature_flags` | Table | Retained extension |
| `platform_tenant_form_templates` | Table | Retained extension |
| `platform_tenant_integration_endpoints` | Table | Retained extension |
| `platform_tenant_jurisdiction_assignments` | Table | Retained extension |
| `platform_tenant_language_assignments` | Table | Retained extension |
| `platform_tenant_license_plans` | Table | Retained extension |
| `platform_tenant_memberships` | Table | Transitional/deprecated |
| `platform_tenant_operational_status_events` | Table | Retained extension |
| `platform_tenant_organisations` | Table | Canonical/domain |
| `platform_tenant_permission_grants` | Table | Retained extension |
| `platform_tenant_release_readiness_queue` | View | Derived projection |
| `platform_tenant_report_templates` | Table | Retained extension |
| `platform_tenant_role_definitions` | Table | Retained extension |
| `platform_tenant_storage_policies` | Table | Retained extension |
| `platform_tenant_subscriptions` | Table | Retained extension |
| `platform_tenant_theme_assignments` | Table | Retained extension |
| `platform_tenant_workflow_templates` | Table | Retained extension |
| `platform_tenants` | Table | Canonical/domain |
| `platform_terminology_packs` | Table | Retained extension |
| `platform_theme_definitions` | Table | Retained extension |
| `profile_cases` | Table | Retained extension |
| `profiles` | Table | Canonical/domain |
| `program_enrollments` | Table | Retained extension |
| `program_pathway_rules` | Table | Retained extension |
| `program_recommendations` | Table | Retained extension |
| `program_reflections` | Table | Retained extension |
| `programs` | Table | Retained extension |
| `progress` | Table | Retained extension |
| `progress_events` | Table | Retained extension |
| `quest_progress` | Table | Retained extension |
| `quests` | Table | Retained extension |
| `referring_parties` | Table | Retained extension |
| `reflections` | Table | Retained extension |
| `relationship_assessments` | Table | Retained extension |
| `relationship_dimension_observations` | Table | Retained extension |
| `relationship_game_sessions` | Table | Retained extension |
| `relationship_observations` | Table | Retained extension |
| `relationship_review_snapshots` | Table | Retained extension |
| `relationship_type_definitions` | Table | Retained extension |
| `report_access_events` | Table | Retained extension |
| `report_approvals` | Table | Retained extension |
| `report_claim_evidence_links` | Table | Canonical/domain |
| `report_claim_quality_checks` | Table | Retained extension |
| `report_claims` | Table | Retained extension |
| `report_corrections` | Table | Retained extension |
| `report_evidence_manifest_items` | Table | Retained extension |
| `report_findings` | Table | Retained extension |
| `report_jurisdiction_rules` | Table | Retained extension |
| `report_language_flags` | Table | Retained extension |
| `report_observation_blocks` | Table | Retained extension |
| `report_recipients` | Table | Retained extension |
| `report_recommendations` | Table | Retained extension |
| `report_rendered_files` | Table | Retained extension |
| `report_snapshots` | Table | Canonical/domain |
| `report_subject_responses` | Table | Retained extension |
| `report_template_sections` | Table | Retained extension |
| `report_templates` | Table | Retained extension |
| `report_versions` | Table | Canonical/domain |
| `report_withdrawals` | Table | Retained extension |
| `reports` | Table | Retained extension |
| `resources` | Table | Retained extension |
| `reunification_cases` | Table | Transitional/deprecated |
| `reunification_overrides` | Table | Retained extension |
| `reunification_readiness_assessments_v17` | Table | Canonical/domain |
| `reunification_readiness_indices` | Table | Canonical/domain |
| `reunification_readiness_panels` | Table | Retained extension |
| `reunification_recommendations` | Table | Retained extension |
| `review_snapshots` | Table | Retained extension |
| `risk_indicators` | View | Compatibility view |
| `risk_trend_view` | View | Derived projection |
| `role_assignments` | Table | Canonical/domain |
| `role_definitions` | Table | Canonical/domain |
| `role_permissions` | Table | Canonical/domain |
| `safety_actions` | Table | Retained extension |
| `safety_agreements` | Table | Retained extension |
| `safety_alerts` | Table | Retained extension |
| `safety_dashboard_view` | View | Derived projection |
| `safety_emergency_contacts` | Table | Retained extension |
| `safety_escalation_levels` | Table | Retained extension |
| `safety_escalations` | Table | Retained extension |
| `safety_goals` | Table | Retained extension |
| `safety_incidents` | Table | Retained extension |
| `safety_plan_participants` | Table | Retained extension |
| `safety_plan_versions` | Table | Retained extension |
| `safety_plans` | Table | Retained extension |
| `safety_protective_factors` | Table | Retained extension |
| `safety_risk_assessments` | Table | Retained extension |
| `safety_risk_calculation_snapshots` | Table | Retained extension |
| `safety_risk_factors` | Table | Retained extension |
| `safety_risk_indicators` | Table | Retained extension |
| `security_access_alerts` | Table | Retained extension |
| `security_permissions` | Table | Transitional/deprecated |
| `security_roles` | Table | Transitional/deprecated |
| `sensitive_action_audit_log` | Table | Canonical/domain |
| `service_accounts` | Table | Retained extension |
| `service_programs` | Table | Retained extension |
| `service_providers` | Table | Retained extension |
| `signed_resource_access` | Table | Retained extension |
| `staff_offboarding_events` | Table | Retained extension |
| `staff_profiles` | Table | Canonical/domain |
| `static_risk_assessment_items` | Table | Retained extension |
| `supervisor_caseload_view` | View | Derived projection |
| `temporary_access_grants` | Table | Retained extension |
| `tenant_memberships` | Table | Canonical/domain |
| `timeline_events` | View | Compatibility view |
| `user_achievements` | Table | Retained extension |
| `user_profiles` | Table | Transitional/deprecated |
| `user_role_assignments` | Table | Transitional/deprecated |
| `user_roles` | Table | Transitional/deprecated |
| `user_security_sessions` | Table | Retained extension |
| `user_settings` | Table | Retained extension |
| `user_tasks` | Table | Retained extension |
| `user_video_progress` | Table | Retained extension |
| `users` | Table | Transitional/deprecated |
| `verified_people_directory` | Table | Retained extension |
| `video_admin_audit_events` | Table | Retained extension |
| `video_admin_memberships` | Table | Retained extension |
| `video_assessment_attempts` | Table | Retained extension |
| `video_case_assignment_audit_events` | Table | Retained extension |
| `video_case_assignments` | Table | Retained extension |
| `video_curriculum_mappings` | Table | Retained extension |
| `video_deployment_checks` | Table | Retained extension |
| `video_feature_flags` | Table | Retained extension |
| `video_lesson_contents` | Table | Retained extension |
| `video_notification_delivery_attempts` | Table | Retained extension |
| `video_notification_devices` | Table | Retained extension |
| `video_notification_outbox` | Table | Retained extension |
| `video_notification_preferences` | Table | Retained extension |
| `video_practice_tasks` | Table | Retained extension |
| `video_progress_report_snapshots` | Table | Retained extension |
| `video_providers` | Table | Retained extension |
| `video_reflections` | Table | Retained extension |
| `video_release_records` | Table | Retained extension |
| `video_report_access_authorities` | Table | Retained extension |
| `video_report_access_grants` | Table | Retained extension |
| `video_report_attestations` | Table | Retained extension |
| `video_report_deliveries` | Table | Retained extension |
| `video_report_delivery_acknowledgements` | Table | Retained extension |
| `video_report_delivery_events` | Table | Retained extension |
| `video_report_delivery_purposes` | Table | Retained extension |
| `video_report_dispute_responses` | Table | Retained extension |
| `video_report_disputes` | Table | Retained extension |
| `video_report_export_audit_events` | Table | Retained extension |
| `video_report_export_files` | Table | Retained extension |
| `video_report_legal_holds` | Table | Retained extension |
| `video_report_retention_rules` | Table | Retained extension |
| `video_report_review_history` | Table | Retained extension |
| `video_report_review_requests` | Table | Retained extension |
| `video_report_review_schedules` | Table | Retained extension |
| `video_report_system_health_events` | Table | Retained extension |
| `video_report_verification_codes` | Table | Retained extension |
| `video_resources` | Table | Retained extension |
| `video_watch_events` | Table | Retained extension |
| `visits` | View | Compatibility view |
| `weapon_risk_detections` | Table | Retained extension |
| `weeks` | Table | Retained extension |
| `welfare_checks` | Table | Retained extension |
| `worker_caseload_view` | View | Derived projection |
| `worker_child_voice_queue` | View | Derived projection |
| `worker_observation_records` | Table | Retained extension |
| `worker_team_memberships` | Table | Canonical/domain |
| `worker_teams` | Table | Canonical/domain |
| `workers` | View | Compatibility view |

## Appendix B. Observed core key dictionary

This is the physical baseline, not target DDL. Exact column/default/check/policy details are in the snapshot. A missing FK is not inferred from a column name. `NOT VALID` is preserved where present.

### `profiles`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `email: text?`, `display_name: text?`, `role: text`, `created_at: timestamptz`, `updated_at: timestamptz`, `story_goal: text`, `strengths: text`, `support_notes: text`, `representation_preferences: jsonb`, `auth_user_id: uuid?`, `avatar_url: text?`, `onboarding_status: text`, `parenting_stage: text?`, `contact_stage: text?`, `risk_level: text?`, `case_id: uuid?`, `achievement_state: jsonb?`, `quest_state: jsonb?`, `preferred_name: text?`, `primary_email: citext?`, `primary_phone: text?`, `avatar_storage_path: text?`, `default_tenant_id: uuid?`, `preferred_language_code: text`, `preferred_timezone: text`, `accessibility_preferences: jsonb`, `notification_preferences: jsonb`, `profile_status: text`, `last_active_at: timestamptz?`.

Keys:

- `FOREIGN KEY (case_id) REFERENCES cases(id) NOT VALID`
- `FOREIGN KEY (default_tenant_id) REFERENCES platform_tenants(id) ON DELETE SET NULL`
- `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`

### `staff_profiles`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `user_id: uuid`, `organisation_id: uuid`, `organisation_unit_id: uuid?`, `staff_reference: text`, `display_name: text`, `staff_role: text`, `professional_registration: text?`, `qualification_summary: jsonb`, `specialist_capabilities: _text`, `language_capabilities: _text`, `employment_status: text`, `availability_status: text`, `maximum_active_cases: int4?`, `started_at: date?`, `ended_at: date?`, `created_at: timestamptz`.

Keys:

- `FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE`
- `FOREIGN KEY (organisation_unit_id) REFERENCES organisation_units(id) ON DELETE SET NULL`
- `PRIMARY KEY (id)`
- `UNIQUE (staff_reference)`
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`
- `UNIQUE (user_id)`

### `families`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `name: text`, `created_at: timestamptz?`, `organisation_id: uuid?`, `family_reference: text?`, `display_name: text?`, `status: text`, `closed_at: timestamptz?`, `family_display_name: text?`, `primary_language_code: text`, `interpreter_required: bool`, `cultural_identity_preferences: jsonb`, `accessibility_requirements: jsonb`, `primary_contact_method: text?`, `unsafe_contact_methods: _text`, `household_summary: jsonb`, `tenant_id: uuid?`, `family_type: text`, `family_status: text`, `preferred_contact_method: text?`, `cultural_context: jsonb`, `family_summary: text?`, `created_by_user_id: uuid?`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE RESTRICT`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE SET NULL NOT VALID`

### `family_members`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `family_id: uuid?`, `user_id: uuid?`, `created_at: timestamptz?`, `child_profile_id: uuid?`, `relationship_type: text?`, `relationship_description: text?`, `parental_responsibility_status: text?`, `lives_in_household: bool?`, `contact_status: text?`, `effective_from: date?`, `effective_to: date?`, `person_type: text?`, `person_reference: text?`, `family_role: text?`, `household_member: bool`, `legal_parent_or_guardian: bool`, `decision_making_authority: text?`, `contact_restrictions: jsonb`, `active_from: date?`, `active_until: date?`, `tenant_id: uuid?`, `profile_id: uuid?`, `member_reference: text?`, `member_type: text?`, `legal_first_name: text?`, `legal_middle_names: text?`, `legal_last_name: text?`, `preferred_name: text?`, `display_name: text?`, `date_of_birth: date?`, `primary_language_code: text?`, `interpreter_required: bool`, `member_status: text`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (child_profile_id) REFERENCES child_profiles(id) ON DELETE SET NULL`
- `FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE SET NULL`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE RESTRICT`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

### `children`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `family_id: uuid`, `first_name: text`, `last_name: text?`, `date_of_birth: date?`, `created_at: timestamptz?`, `tenant_id: uuid?`, `family_member_id: uuid?`, `child_reference: text?`, `developmental_stage: text?`, `school_year_level: text?`, `child_status: text`, `communication_preferences: jsonb`, `sensory_preferences: jsonb`, `accessibility_requirements: jsonb`, `child_account_status: text`, `child_voice_enabled: bool`, `independent_login_allowed: bool`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE RESTRICT`

### `platform_tenants`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `tenant_reference: text`, `tenant_slug: text`, `tenant_name: text`, `legal_entity_name: text?`, `tenant_type: text`, `primary_jurisdiction_code: text?`, `supported_jurisdiction_codes: _text`, `data_residency_region: text`, `primary_timezone: text`, `default_language_code: text`, `tenant_status: text`, `activated_at: timestamptz?`, `suspended_at: timestamptz?`, `terminated_at: timestamptz?`, `created_at: timestamptz`, `updated_at: timestamptz`.

Keys:

- `PRIMARY KEY (id)`
- `UNIQUE (tenant_reference)`
- `UNIQUE (tenant_slug)`

### `tenant_memberships`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `tenant_id: uuid`, `user_id: uuid`, `organisation_id: uuid?`, `membership_type: text`, `access_scope: jsonb`, `membership_status: text`, `effective_from: timestamptz`, `effective_to: timestamptz?`, `invited_by_user_id: uuid?`, `accepted_at: timestamptz?`, `suspended_at: timestamptz?`, `revoked_at: timestamptz?`, `created_at: timestamptz`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (invited_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE SET NULL`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE`
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`

### `organisations`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `organisation_code: text`, `name: text`, `organisation_type: text`, `status: text`, `parent_organisation_id: uuid?`, `jurisdiction_code: text?`, `timezone: text`, `data_region: text?`, `settings: jsonb`, `created_at: timestamptz`, `updated_at: timestamptz`, `organisation_name: text?`, `legal_entity_name: text?`, `registration_number: text?`, `jurisdiction_codes: _text`, `service_regions: _text`, `contact_email: text?`, `contact_phone: text?`, `website_reference: text?`, `primary_address: jsonb?`, `operating_hours: jsonb`, `active: bool`, `tenant_id: uuid?`, `tenant_region_code: text?`, `tenant_business_unit_code: text?`, `organisation_reference: text?`, `legal_name: text?`, `region_code: text?`, `primary_email: citext?`, `primary_phone: text?`, `website_url: text?`, `organisation_status: text`.

Keys:

- `UNIQUE (organisation_code)`
- `FOREIGN KEY (parent_organisation_id) REFERENCES organisations(id) ON DELETE RESTRICT`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE SET NULL NOT VALID`

### `organisation_memberships`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `organisation_id: uuid`, `user_id: uuid`, `membership_type: text`, `status: text`, `employee_reference: text?`, `external_identity_reference: text?`, `starts_at: timestamptz?`, `ends_at: timestamptz?`, `invited_by: uuid?`, `approved_by: uuid?`, `created_at: timestamptz`.

Keys:

- `FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`
- `UNIQUE (organisation_id, user_id)`
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`

### `cases`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `title: text`, `court_reference: text?`, `status: text`, `created_at: timestamptz?`, `organisation_id: uuid?`, `family_id: uuid?`, `case_reference: text?`, `case_type: text?`, `opened_at: timestamptz`, `closed_at: timestamptz?`, `current_stage: text?`, `primary_worker_id: uuid?`, `record_version: int4`, `organisation_unit_id: uuid?`, `service_program_id: uuid?`, `source_referral_id: uuid?`, `case_purpose: text?`, `jurisdiction_code: text?`, `legal_status: text?`, `priority_level: text`, `expected_end_at: timestamptz?`, `closure_reason: text?`, `tenant_id: uuid?`, `case_type_code: text?`, `case_status_code: text?`, `priority_code: text?`, `case_title: text?`, `case_summary: text?`, `referral_source_type: text?`, `referral_source_reference: text?`, `presenting_concerns: jsonb`, `identified_strengths: jsonb`, `risk_pathway: text?`, `program_pathway: text?`, `primary_jurisdiction_code: text?`, `target_review_at: timestamptz?`, `target_closure_at: timestamptz?`, `closure_summary: text?`, `created_by_user_id: uuid?`, `updated_by_user_id: uuid?`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (case_status_code) REFERENCES case_status_definitions(case_status_code) ON DELETE RESTRICT`
- `FOREIGN KEY (case_type_code) REFERENCES case_type_definitions(case_type_code) ON DELETE RESTRICT`
- `FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE RESTRICT`
- `FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE RESTRICT`
- `FOREIGN KEY (organisation_unit_id) REFERENCES organisation_units(id) ON DELETE SET NULL NOT VALID`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (primary_worker_id) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (priority_code) REFERENCES case_priority_definitions(priority_code) ON DELETE RESTRICT`
- `FOREIGN KEY (service_program_id) REFERENCES service_programs(id) ON DELETE SET NULL NOT VALID`
- `FOREIGN KEY (source_referral_id) REFERENCES case_referrals(id) ON DELETE SET NULL NOT VALID`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE SET NULL NOT VALID`
- `FOREIGN KEY (updated_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL`

### `reunification_cases`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `owner_id: uuid`, `parent_user_id: uuid?`, `worker_user_id: uuid?`, `case_number: text?`, `family_label: text?`, `program_phase: int4`, `status: text`, `opened_date: date`, `closed_date: date?`, `consent_signed: bool`, `consent_date: date?`, `informed_of: _text`, `baseline_complete: bool`, `overall_progress_score: numeric?`, `created_at: timestamptz`, `updated_at: timestamptz`, `parent_carer_name: text?`, `child_names: _text`, `program_stream: text?`, `assessment_type: text?`, `case_goals: _text`, `case_start_date: date?`, `assessment_date: date?`, `review_due_date: date?`, `court_date: date?`, `support_worker_name: text?`, `caseworker_name: text?`, `supervisor_name: text?`, `legal_contact_name: text?`.

Keys:

- `PRIMARY KEY (id)`

### `case_participants`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `case_id: uuid`, `user_id: uuid?`, `child_profile_id: uuid?`, `participant_type: text`, `relationship_to_case: text?`, `status: text`, `visibility_level: text`, `allowed_actions: _text`, `denied_actions: _text`, `effective_from: timestamptz`, `effective_to: timestamptz?`, `added_by: uuid?`, `created_at: timestamptz`, `tenant_id: uuid?`, `family_member_id: uuid?`, `participant_role: text?`, `participation_status: text`, `included_in_case_plan: bool`, `included_in_reporting: bool`, `participation_start_at: timestamptz`, `participation_end_at: timestamptz?`, `exclusion_reason: text?`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (added_by) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE`
- `FOREIGN KEY (child_profile_id) REFERENCES child_profiles(id) ON DELETE CASCADE`
- `FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE RESTRICT`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE RESTRICT`
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`

### `case_memberships`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `case_id: uuid`, `user_id: uuid`, `membership_role: text`, `status: text`, `granted_by: uuid?`, `granted_at: timestamptz`, `revoked_at: timestamptz?`, `metadata: jsonb`.

Keys:

- `FOREIGN KEY (case_id) REFERENCES reunification_cases(id) ON DELETE CASCADE`
- `UNIQUE (case_id, user_id, membership_role)`
- `FOREIGN KEY (granted_by) REFERENCES auth.users(id)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`

### `case_allocations`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `tenant_id: uuid`, `case_id: uuid`, `allocated_user_id: uuid?`, `allocated_team_id: uuid?`, `allocation_role: text`, `allocation_status: text`, `primary_allocation: bool`, `allocated_at: timestamptz`, `accepted_at: timestamptz?`, `ended_at: timestamptz?`, `allocation_reason: text?`, `end_reason: text?`, `allocated_by_user_id: uuid?`, `created_at: timestamptz`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (allocated_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (allocated_team_id) REFERENCES worker_teams(id) ON DELETE SET NULL`
- `FOREIGN KEY (allocated_user_id) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE RESTRICT`

### `case_plans`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `family_id: uuid?`, `goals: jsonb?`, `created_at: timestamp?`, `plan_reference: text?`, `case_id: uuid?`, `plan_version: int4`, `plan_title: text?`, `plan_purpose: text?`, `current_strengths: jsonb`, `identified_needs: jsonb`, `current_risks: jsonb`, `family_priorities: jsonb`, `child_priorities: jsonb`, `worker_priorities: jsonb`, `planned_outcomes: jsonb`, `created_with_family: bool`, `family_disagreement_recorded: bool`, `effective_from: date?`, `review_due_at: timestamptz?`, `status: text`, `approved_by_user_id: uuid?`, `tenant_id: uuid?`, `plan_description: text?`, `plan_type: text?`, `plan_status: text?`, `version_number: int4?`, `review_due_date: date?`, `effective_to: date?`, `parent_participation_status: text?`, `child_participation_status: text?`, `approved_at: timestamptz?`, `supersedes_plan_id: uuid?`, `created_by_user_id: uuid?`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (approved_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE`
- `FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (family_id) REFERENCES families(id)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (supersedes_plan_id) REFERENCES case_plans(id) ON DELETE SET NULL`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE RESTRICT`

### `case_plan_goals`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `case_id: uuid`, `parent_user_id: uuid?`, `title: text`, `description: text?`, `domain: text?`, `target_date: date?`, `status: text`, `progress_score: numeric?`, `created_by: uuid`, `created_at: timestamptz`, `updated_at: timestamptz`, `tenant_id: uuid?`, `case_plan_id: uuid?`, `goal_reference: text?`, `goal_title: text?`, `goal_description: text?`, `goal_domain: text?`, `goal_status: text`, `priority_level: text`, `baseline_summary: text?`, `success_definition: text?`, `completed_at: timestamptz?`, `owner_type: text`, `owner_reference: uuid?`, `child_voice_summary: text?`, `parent_view_summary: text?`, `worker_view_summary: text?`, `sequence_order: int4`.

Keys:

- `FOREIGN KEY (case_id) REFERENCES reunification_cases(id) ON DELETE CASCADE`
- `FOREIGN KEY (case_plan_id) REFERENCES case_plans(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE RESTRICT`

### `case_plan_actions`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `tenant_id: uuid`, `case_plan_goal_id: uuid`, `action_reference: text`, `action_title: text`, `action_description: text`, `action_type: text`, `assigned_to_type: text`, `assigned_to_reference: uuid?`, `action_status: text`, `due_at: timestamptz?`, `started_at: timestamptz?`, `completed_at: timestamptz?`, `completion_evidence_required: bool`, `completion_evidence_summary: text?`, `sequence_order: int4`, `created_at: timestamptz`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (case_plan_goal_id) REFERENCES case_plan_goals(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`
- `UNIQUE (tenant_id, action_reference)`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE RESTRICT`

### `case_documents`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `case_id: uuid`, `parent_user_id: uuid?`, `worker_user_id: uuid?`, `current_version_id: uuid?`, `linked_evidence_id: uuid?`, `linked_assessment_id: uuid?`, `document_type: text`, `title: text`, `status: text`, `expiry_date: date?`, `court_report_include: bool`, `notes: text`, `created_by: uuid?`, `created_at: timestamptz`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (case_id) REFERENCES reunification_cases(id) ON DELETE CASCADE`
- `FOREIGN KEY (current_version_id) REFERENCES case_document_versions(id) ON DELETE SET NULL`
- `FOREIGN KEY (linked_assessment_id) REFERENCES assessment_records(id) ON DELETE SET NULL`
- `FOREIGN KEY (linked_evidence_id) REFERENCES evidence_items(id) ON DELETE SET NULL`
- `PRIMARY KEY (id)`

### `case_document_versions`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `document_id: uuid`, `version_number: int4`, `file_path: text`, `file_name: text`, `mime_type: text?`, `file_sha256: text?`, `uploaded_by: uuid?`, `uploaded_at: timestamptz`, `review_status: text`, `review_notes: text`.

Keys:

- `FOREIGN KEY (document_id) REFERENCES case_documents(id) ON DELETE CASCADE`
- `UNIQUE (document_id, version_number)`
- `PRIMARY KEY (id)`

### `document_analysis_runs`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `case_id: uuid`, `document_id: uuid?`, `document_version_id: uuid?`, `requested_by: uuid`, `source_mode: text`, `source_metadata: jsonb`, `status: text`, `schema_version: text`, `model: text?`, `result: jsonb?`, `error_code: text?`, `error_message: text?`, `started_at: timestamptz?`, `completed_at: timestamptz?`, `created_at: timestamptz`.

Keys:

- `FOREIGN KEY (case_id) REFERENCES reunification_cases(id) ON DELETE CASCADE`
- `FOREIGN KEY (document_id) REFERENCES case_documents(id) ON DELETE SET NULL`
- `FOREIGN KEY (document_version_id) REFERENCES case_document_versions(id) ON DELETE SET NULL`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (requested_by) REFERENCES auth.users(id) ON DELETE RESTRICT`

### `document_entities`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `document_id: uuid`, `entity_type: text`, `entity_text: text`, `normalized_value: text?`, `confidence: numeric?`, `source_page: int4?`, `metadata: jsonb`, `created_at: timestamptz`, `updated_at: timestamptz`.

Keys:

- `UNIQUE (document_id, entity_type, entity_text, source_page)`
- `FOREIGN KEY (document_id) REFERENCES case_documents(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`

### `documents`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `user_id: uuid?`, `family_id: uuid?`, `file_url: text?`, `created_at: timestamp?`.

Keys:

- `FOREIGN KEY (family_id) REFERENCES families(id)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`

### `messaging_threads`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `created_at: timestamptz`, `created_by: uuid`, `title: text?`, `owner_user_id: uuid`.

Keys:

- `PRIMARY KEY (id)`

### `messaging_messages`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `thread_id: uuid`, `created_at: timestamptz`, `created_by: uuid`, `body: text`.

Keys:

- `PRIMARY KEY (id)`
- `FOREIGN KEY (thread_id) REFERENCES messaging_threads(id) ON DELETE CASCADE`

### `messaging_thread_summaries`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `thread_id: uuid`, `created_at: timestamptz`, `updated_at: timestamptz`, `created_by: uuid`, `summary: text`, `last_message_id: uuid?`.

Keys:

- `FOREIGN KEY (last_message_id) REFERENCES messaging_messages(id) ON DELETE SET NULL`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (thread_id) REFERENCES messaging_threads(id) ON DELETE CASCADE`
- `UNIQUE (thread_id)`

### `parent_child_messages`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `child_user_id: uuid`, `parent_user_id: uuid?`, `caseworker_user_id: uuid?`, `sender_user_id: uuid`, `sender_role: text`, `message_text: text`, `share_audience: text`, `monitoring_status: text`, `monitoring_note: text?`, `visible_to_child: bool`, `visible_to_parent: bool`, `reviewed_by: uuid?`, `reviewed_at: timestamptz?`, `created_at: timestamptz`, `updated_at: timestamptz`, `case_id: uuid?`.

Keys:

- `FOREIGN KEY (case_id) REFERENCES reunification_cases(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`

### `evidence_records`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `tenant_id: uuid`, `case_id: uuid?`, `family_id: uuid?`, `child_id: uuid?`, `source_evidence_item_id: uuid?`, `evidence_reference: text`, `evidence_title: text`, `evidence_description: text?`, `evidence_type: text`, `evidence_source: text`, `evidence_status: text`, `privacy_level: text`, `uploader_user_id: uuid?`, `captured_at: timestamptz?`, `uploaded_at: timestamptz`, `legal_hold: bool`, `deleted: bool`, `created_at: timestamptz`, `updated_at: timestamptz`.

Keys:

- `FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE`
- `FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE SET NULL`
- `FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE SET NULL`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (source_evidence_item_id) REFERENCES evidence_items(id) ON DELETE SET NULL`
- `UNIQUE (tenant_id, evidence_reference)`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE RESTRICT`
- `FOREIGN KEY (uploader_user_id) REFERENCES auth.users(id) ON DELETE SET NULL`

### `evidence_files`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `tenant_id: uuid`, `evidence_record_id: uuid`, `file_reference: text`, `bucket_name: text`, `storage_path: text`, `original_filename: text`, `storage_filename: text`, `file_extension: text`, `file_size_bytes: int8`, `media_type: text`, `sha256_hash: text`, `encrypted_hash: text?`, `storage_checksum: text?`, `thumbnail_path: text?`, `encryption_key_reference: text?`, `integrity_status: text`, `last_verified_at: timestamptz?`, `verification_count: int4`, `virus_scan_status: text`, `deleted: bool`, `created_at: timestamptz`.

Keys:

- `FOREIGN KEY (evidence_record_id) REFERENCES evidence_records(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`
- `UNIQUE (tenant_id, file_reference)`
- `FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE RESTRICT`
- `UNIQUE (tenant_id, storage_path)`

### `evidence_items`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `owner_id: uuid`, `title: text`, `notes: text`, `file_path: text?`, `status: text`, `created_at: timestamptz`, `integrity_hash: text?`, `hash_algorithm: text`, `vault_hash: text?`, `vault_previous_hash: text?`, `captured_at: timestamptz?`, `attachment_sha256: text?`, `attachment_byte_size: int8?`, `immutable_after: timestamptz`, `evidence_type: text?`, `purpose: text?`, `structured_data: jsonb`, `review_status: text`, `dispute_status: text`, `source_reliability: text?`, `case_id: uuid?`.

Keys:

- `FOREIGN KEY (case_id) REFERENCES reunification_cases(id) ON DELETE CASCADE`
- `FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`

### `assessment_instruments`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `slug: text`, `name: text`, `version: text`, `description: text?`, `instrument_type: text`, `scoring_method: text`, `restricted_tool: bool`, `requires_licensed_assessor: bool`, `is_active: bool`, `created_at: timestamptz`.

Keys:

- `PRIMARY KEY (id)`
- `UNIQUE (slug)`

### `assessment_template_versions`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `framework_id: uuid?`, `template_code: text`, `template_version: int4`, `template_name: text`, `assessment_type: text`, `target_subject: text`, `domains: jsonb`, `scoring_model: jsonb`, `evidence_requirements: jsonb`, `lifecycle_status: text`, `approved_by: uuid?`, `effective_from: timestamptz?`.

Keys:

- `UNIQUE (template_code, template_version)`
- `FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (framework_id) REFERENCES assessment_frameworks(id) ON DELETE CASCADE`
- `PRIMARY KEY (id)`

### `assessment_records`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `case_id: uuid`, `parent_user_id: uuid?`, `worker_user_id: uuid?`, `instrument_id: uuid`, `phase: int4`, `assessment_date: timestamptz`, `session_id: uuid?`, `administered_by: text?`, `administrator_qualification: text?`, `platform: text?`, `source_type: text`, `narrative_summary: text?`, `report_file_path: text?`, `status: text`, `supersedes_assessment_id: uuid?`, `created_by: uuid`, `created_at: timestamptz`, `user_id: uuid?`, `lesson_id: text?`, `quest_id: uuid?`, `evidence_type: text?`, `evidence_payload: jsonb?`, `score: numeric?`, `risk_flags: jsonb?`, `validated_by: uuid?`, `updated_at: timestamptz`, `assessment_reference: text?`, `template_version_id: uuid?`, `child_user_id: uuid?`, `subject_type: text`, `subject_reference: text?`, `assessment_status: text`, `assessment_started_at: timestamptz`, `assessment_completed_at: timestamptz?`, `completed_by: uuid?`, `human_review_status: text`.

Keys:

- `FOREIGN KEY (case_id) REFERENCES reunification_cases(id) ON DELETE CASCADE`
- `FOREIGN KEY (completed_by) REFERENCES auth.users(id) ON DELETE SET NULL`
- `FOREIGN KEY (instrument_id) REFERENCES assessment_instruments(id)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (session_id) REFERENCES case_sessions(id) ON DELETE SET NULL`
- `FOREIGN KEY (supersedes_assessment_id) REFERENCES assessment_records(id)`
- `FOREIGN KEY (template_version_id) REFERENCES assessment_template_versions(id) ON DELETE RESTRICT`
- `FOREIGN KEY (user_id) REFERENCES profiles(id)`
- `FOREIGN KEY (validated_by) REFERENCES profiles(id)`

### `assessment_responses`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `assessment_id: uuid?`, `user_id: uuid?`, `responses: jsonb?`, `created_at: timestamp?`, `created_by: uuid?`.

Keys:

- `FOREIGN KEY (assessment_id) REFERENCES assessments(id)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`

### `assessment_responses_structured`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `assessment_record_id: uuid`, `item_id: uuid?`, `response_value: jsonb`, `response_text: text?`, `confidence_level: text`, `evidence_item_ids: _uuid`, `recorded_by: uuid?`, `recorded_at: timestamptz`.

Keys:

- `FOREIGN KEY (assessment_record_id) REFERENCES assessment_records(id) ON DELETE CASCADE`
- `FOREIGN KEY (item_id) REFERENCES assessment_behaviour_rating_items(id) ON DELETE SET NULL`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (recorded_by) REFERENCES auth.users(id) ON DELETE SET NULL`

### `assessment_evidence_maps`

Columns (`?` = nullable; PostgreSQL internal type names):

`id: uuid`, `assessment_record_id: uuid`, `evidence_item_id: uuid?`, `linked_learning_evidence_submission_id: uuid?`, `evidence_role: text`, `supports_domain: text?`, `supports_factor_code: text?`, `evidence_strength: text`, `reliability_status: text`, `contradiction_flag: bool`, `mapped_by: uuid?`, `mapped_at: timestamptz`.

Keys:

- `FOREIGN KEY (assessment_record_id) REFERENCES assessment_records(id) ON DELETE CASCADE`
- `FOREIGN KEY (evidence_item_id) REFERENCES evidence_items(id) ON DELETE SET NULL`
- `FOREIGN KEY (linked_learning_evidence_submission_id) REFERENCES learning_evidence_submissions(id) ON DELETE SET NULL`
- `FOREIGN KEY (mapped_by) REFERENCES auth.users(id) ON DELETE SET NULL`
- `PRIMARY KEY (id)`


