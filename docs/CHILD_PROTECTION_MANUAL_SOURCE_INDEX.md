# Child Protection Manual Source Index

Generated from local source folder:

`C:\Users\SAFES\SafeStepsApp\CHILD PROTECTION MANUAL FRAMEWORK GUIDELINES`

Inventory date: 2026-07-04.

## Repository Treatment

This folder is retained as local source/reference material, not committed as app runtime content.

Reason:

- The folder is a downloaded website/archive bundle with page assets, CSS, JavaScript downloads, images, PDFs, and duplicate support files.
- The current archive is about 32 MB across 382 files.
- Most files are support assets for saved Child Protection Manual pages, not SafeSteps-owned curriculum, code, database schema, or typed app data.
- App-facing content should be extracted into reviewed Markdown, TypeScript data, migrations, or assessment definitions before being committed.

## File Mix

| Type | Count | Treatment |
| --- | ---: | --- |
| `.download` | 254 | Saved web JavaScript/resource downloads. Do not import directly. |
| `.css` | 88 | Saved web styling assets. Do not import directly. |
| `.pdf` | 17 | Useful source references; extract relevant points manually. |
| `.html` | 7 | Saved Child Protection Manual pages; extract relevant policy/assessment concepts manually. |
| `.png` | 8 | Saved website imagery/assets. Do not import directly. |
| no extension | 8 | Saved website support assets. Do not import directly. |

## High-Value Source Documents

The most relevant files for SafeSteps product/curriculum reconciliation are:

- `Reunification assessment tool _ Child Protection Manual _ CP Manual Victoria.html`
- `Analysis and risk assessment snapshot 2976.pdf`
- `Administering Children's Court orders summary table.pdf`
- `Parenting assessment services including PASDS _ Child Protection Manual _ CP Manual Victoria.html`
- `Enacting a case plan _ Child Protection Manual _ CP Manual Victoria.html`
- `Interagency collaboration _ Child Protection Manual _ CP Manual Victoria.html`
- `Looking After Children _ Child Protection Manual _ CP Manual Victoria.html`
- `Practice Dictionary _ Child Protection Manual _ CP Manual Victoria.html`
- `Families with multiple & complex needs specialist resource 3016.pdf`
- `Practitioner_field_tool&genograms_2012.pdf`
- `Genogram Program User Guide.pdf`
- `2939.2 AOD treatment service for family reunification - CPP Fact Sheet v3 (1).pdf`

## Child Development And Trauma PDFs

These source files are relevant to curriculum and assessment language around child development, trauma, parental attunement, and reunification readiness:

- `child_development_&_trauma_intro_2012.pdf`
- `Child development trauma 0-12mths 2012 3006.pdf`
- `Development_trends_1_3_years_Child_Protection_Manual.pdf`
- `Child development trauma 3-5years 2012 3008.pdf`
- `Child development trauma 5-7years 2012 3009.pdf`
- `Child development trauma 7-9years 2012 3010.pdf`
- `Child development trauma 9-12years 2012 3011.pdf`
- `Child development trauma 12-18years 2012 3012.pdf`

## Rights, Accessibility, And Compliance References

These source files should be used when checking parent-facing language, accessibility, and rights notices:

- `3211 Charter Of Rights For Parents And Carers With Disabilities Involved With Child Protection In Victoria.pdf`
- `3212 Easy Read Version -Charter Of Rights For Parents And Carers With Disabilities Involved With Child Protection In Victoria.pdf`
- `ACL drug screen testing sites May 2026.pdf`

## Extraction Guidance

Use this material as evidence/reference only. Before anything from this folder becomes product behavior:

1. Extract the relevant principle, checklist, assessment domain, or workflow into a small Markdown note under `docs/`.
2. Map it to an existing SafeSteps engine, route, data file, or migration.
3. Convert it into typed app data or schema only after reconciling it with current SafeSteps terminology and Supabase RLS.
4. Add tests for any generated data, migration, or app behavior.
5. Keep copied wording short and attribute the source document in the implementation note.

## Current SafeSteps Mapping

Already related areas in the repository:

- `docs/REUNIFICATION_ASSESSMENT_BATTERY.md`
- `docs/ASSESSMENT_TOOLS_IMPLEMENTATION_RECONCILIATION.md`
- `docs/FOUND_MATERIAL_RECONCILIATION.md`
- `supabase/migrations/20260703061540_add_relationship_assessment_layer.sql`
- `lib/data/safestepsReflectionWorksheets.ts`
- `lib/data/safestepsParentChallenges.ts`
- `lib/data/strongFathersCourse.ts`
