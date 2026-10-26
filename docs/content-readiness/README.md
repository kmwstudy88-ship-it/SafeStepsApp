# Content readiness audit

Status: incomplete; not approved for production import.
Repository: kmwstudy88-ship-it/SafeStepsApp
Source commit: f3c2997bdb9c7afd536e361262776108f5b046fa
Date: 2026-09-18
Evidence file: docs/content-readiness/evidence.json

## Current evidence summary
`node tools/validate-curriculum-readiness.mjs` now generates machine-readable evidence and currently reports 3 blocking issues:
- `module-required-fields-incomplete`
- `topics-missing-module-links`
- `external-source-files-unavailable`

Validated counts:
- lessons: 199
- modules: 83
- topics: 291

## Completed readiness work in this repository
- `schema/curriculum-schema.json` is a real Draft 2020-12 JSON Schema.
- `src/safesteps/lessons/master-index.json` is generated and non-empty.
- `shared/apiClient.js` and `shared/models.js` are non-empty and still used.
- Import pipeline now writes deterministic curriculum-seed outputs under `src/safesteps/imports/curriculum-seeds/`.
- Import pipeline now enforces explicit source versioning (`--version` or `source.version`).
- Import pipeline now preserves source provenance in `curriculumSource` metadata.
- Import pipeline now blocks learner-scoped fields in curriculum seed imports.
- Import pipeline now rejects duplicate output filenames and conflicting lesson variants for the same id in one source import.
- Production readiness gate now requires content-readiness evidence and fails closed when evidence is incomplete.

## Requested checks: current state
- Recover real external curriculum source files: not complete in this environment (`~/Downloads/NEW READY TO UPLOAD Courses &  Content` not present).
- Compare source files against repository content: implemented in validator when external files are present; currently blocked by unavailable external files.
- Preserve source provenance: complete in importer metadata (`sourceKind`, `sourceId`, `sourceTitle`, `sourceVersion`, `sourceDigest`, `sourceFile`, `sourcePath`, `contentHash`).
- Identify conflicting versions: implemented for imported curriculum-seed manifests.
- Validate stable lesson IDs: complete (no duplicate IDs, no lesson ID/file-name mismatches in canonical lessons).
- Validate duplicate lessons: complete (no duplicate canonical lesson content hashes).
- Validate lesson ordering: implemented; currently no out-of-order module lesson numbers, but most module lesson links are empty.
- Validate required text fields: implemented; 5 modules still fail required field checks.
- Validate topic-to-module links: implemented; all 291 topics currently have empty `modules` arrays.
- Validate referenced assets: implemented; no missing referenced assets detected from current JSON content.
- Repair/regenerate `src/safesteps/lessons/master-index.json`: complete (`node tools/build-content-index.mjs`).
- Convert `schema/curriculum-schema.json` into a real JSON Schema: complete.
- Inspect `topics/secure_attachment.json`: complete; `modules` is currently empty and contributes to blocking readiness.
- Determine whether empty `shared/apiClient.js` is still required: complete; file is non-empty and active.
- Determine whether empty `shared/models.js` is still required: complete; file is non-empty and active.
- Make importer fully repeatable: complete for identical source+version re-runs.
- Ensure duplicate filenames cannot overwrite content: complete (pre-write duplicate detection + non-matching overwrite refusal).
- Add explicit version handling: complete.
- Separate curriculum seeds from learner data: complete in import path + learner-data field guardrails.
- Validate import output in staging: not complete (requires staging credentials/environment).
- Run production readiness gate with real evidence: implemented and enforced; production pass remains blocked until evidence status is `ready`.

## Validation and limits
What was executed in this audit update:
- `node tools/build-content-index.mjs`
- `node tools/validate-curriculum-readiness.mjs`
- `node --test tools/tests/import-curriculum-source.test.mjs tools/tests/production-readiness-gate.test.mjs`

Not executed in this environment:
- External-source ingestion and reconciliation (external files absent).
- Staging import validation.
- Production readiness gate pass with fully complete evidence.
