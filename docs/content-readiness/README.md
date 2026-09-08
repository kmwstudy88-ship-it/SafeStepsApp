# Content readiness audit

Status: incomplete; not approved for production import.
Repository: kmwstudy88-ship-it/SafeStepsApp
Source commit: 6a0d0e4d39e7c55f507804b49ea6f297a1fc622b
Date: 2026-09-08

## Verified inventory
The complete, untruncated Git tree contains 5,475 files. inventory.json records paths, blob hashes, sizes, empty files and identical-blob groups.
There are 2,924 empty files; 2,912 are under snapshots. There are 896 identical-blob groups. Neither figure is a count of missing lessons; archived copies must not be automatically promoted or deleted.

## Verified gaps
- utils/loadContent.js imports data/lessons.json, data/topics.json, data/courses.json and data/programs.json. All four are absent from this commit.
- The root package.json is absent. tools/production-readiness-gate.mjs explicitly fails when it is missing. Recover the actual dependency manifest and lockfile from the working project; do not guess dependencies.
- src/safesteps/lessons/master-index.json is empty.
- schema/curriculum-schema.json is a shape example containing string placeholders, not a machine-enforced JSON Schema.
- topics/secure_attachment.json has an empty modules array. This is a sampled mapping gap, not evidence that all 291 topic files are incomplete.
- shared/apiClient.js, shared/models.js and shared/README.txt are empty.
- Three historical migrations and supabase/schema_dump.sql are empty. Do not rewrite applied migration history. Establish actual database state before making corrective migrations.
- tools/import-curriculum-source.js writes to curriculum/, which is absent in the inspected commit. The importer does not check for duplicate output filenames before writing; duplicate lesson slugs can overwrite earlier lessons.

## Located external source references
tools/audit-found-curriculum.js identifies Downloads/NEW READY TO UPLOAD Courses &  Content as an external source directory, with these files:
- LESSONS/safesteps_lessons_1_to_47.json
- LESSONS/safesteps_lessons_30_to_40_min_batch_252_to_466.json
- LESSONS/safesteps_lessons_30_to_40_min_batch_468_to_780.json
- safesteps_parent_challenges_pack/safesteps_parent_challenges.json

These paths are references in code, not confirmed existing files. Local execution failed before any files could be read. No external-to-repository comparison has been completed.

## Completion requirements
1. Recover and inspect the referenced external sources and actual app manifest; compare record IDs and content, preserving provenance and reporting conflicting versions.
2. Establish the canonical curriculum and actual database content contract using existing application readers and migrations.
3. Validate IDs, required text, lesson ordering, topic/module links, duplicate records and referenced assets.
4. Review and improve substantive teaching content, objectives, activities, assessments and accessibility. Verify factual claims using authoritative sources. Preserve distinctions between educational progress and professional assessment decisions.
5. Prepare a deterministic, repeatable import with stable identifiers, explicit version handling and no learner records mixed into curriculum seeds.
6. Test migration replay, import repetition, row counts, relationship integrity, access policies and application rendering in staging.
7. Run the existing production-readiness gate with real supporting evidence before calling the result production ready.

## Validation and limits
Inventory counts and missing-path checks were computed from GitHub's complete tree. Three content files and three existing tools were read. This is not a complete semantic review of every lesson.
No content import, database migration, local test, external-source recovery or live Supabase inspection was performed.
