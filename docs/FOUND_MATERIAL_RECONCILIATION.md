# SafeSteps Found Material Reconciliation

Generated after a read-only search of the SafeSteps workspace plus likely user folders on 2026-07-04.

## Priority 1 - Ready Curriculum Imports

Source folder:

`C:\Users\SAFES\Downloads\NEW READY TO UPLOAD Courses &  Content`

High-value subfolders:

- `COURSES`
- `LESSONS`
- `safesteps_parent_challenges_pack`
- `BLUEPRINTS`
- `GENERATE`

External lesson batches found:

| Source file | Records | Notes |
| --- | ---: | --- |
| `LESSONS\safesteps_lessons_1_to_47.json` | 47 | Structured under `lessons`; includes program metadata and standard reflection requirements. |
| `LESSONS\safesteps_lessons_30_to_40_min_batch_252_to_466.json` | 215 | Structured under `lessons`; single 30-40 minute lessons with activities, quiz, reflection, and evidence task. |
| `LESSONS\safesteps_lessons_30_to_40_min_batch_468_to_780.json` | 313 | Structured under `lessons`; newer July 4 batch with source numbers and full lesson objects. Needs review because some source titles look like pasted explanatory text rather than clean lesson titles. |
| `safesteps_parent_challenges_pack\safesteps_parent_challenges.json` | 104 | Array of parent challenge records with steps, reflection questions, evidence task, completion checklist, safety note, and tags. |

Course JSON files found:

- `COURSES\course - Building Your Village.json`
- `COURSES\course - Co-Parenting after Separation.json`
- `COURSES\course - Digital Safetuy for Families.json`
- `COURSES\course - Emotional Literacy.json`
- `COURSES\course - Healthy Relationships.json`
- `COURSES\course - Seeing Through Your Child's Experience.json`
- `COURSES\course - Self-Compassion and shame resilience.json`
- `COURSES\course - Understanding Your Nervous System.json`
- `COURSES\course - Your Child's Brain.json`
- `COURSES\course Executive Functioning in Family Life.json`
- `COURSES\course- Breaking the Cycle.json`
- `COURSES\course- Financial Literacy and Life Skills.json`
- `COURSES\safesteps_father_course_json.zip`

Current workspace already has related imported/generated files:

- `lib\data\safestepsLessonCurriculum1To47.ts`
- `lib\data\safestepsExpandedLessonCurriculum252To780.ts`
- `lib\data\safestepsParentChallenges.ts`
- `lib\data\safestepsReflectionWorksheets.ts`
- `lib\data\safestepsLessonCurriculum48To95.ts`
- `lib\data\completeCourseLibrary.ts`
- `lib\data\courses.ts`

Recommended next step:

Use `npm run audit:found-curriculum` to compare the external JSON record counts and identifiers against the workspace TypeScript exports before importing or regenerating data.

Current audit result:

- Lessons 1-47: 47 external records, 47 workspace records, 0 missing IDs.
- Lessons 252-466 and 468-780: 528 external records, 528 workspace records, 0 missing IDs.
- Parent challenges: 104 external records, 104 workspace records, 0 missing IDs.
- Reflection worksheets: 50 workspace records.

App integration status:

- Lessons 1-47 are available through `appLessons` with `foundation-` ID prefixes, such as `foundation-active-listening`, to avoid collisions with later uploaded lesson slugs.
- Lessons 48-95 and expanded lessons 252-780 are also available through `appLessons`.
- Parent challenges are available from the task screen and are converted into user task input through `buildParentChallengeTaskInput`, including challenge steps, reflection questions, completion checklist, evidence task, and safety note.

## Priority 2 - Assessment Schema

External schema found:

`C:\Users\SAFES\Downloads\schema.sql`

Important finding:

- `C:\Users\SAFES\Downloads\schema.sql` is populated and begins with a full reunification/parenting assessment data model.
- `C:\Users\SAFES\SafeStepsApp\supabase\schema_dump.sql` is currently empty.
- Several workspace migration files are also empty and should be reviewed before database work continues.

Empty workspace migration files observed:

- `supabase\migrations\20260619125937_init_schema.sql`
- `supabase\migrations\20260619142937_rls_policies.sql`
- `supabase\migrations\20260622181621_create_intake_forms.sql`
- `supabase\migrations\20260703061540_add_relationship_assessment_layer.sql`

Recommended next step:

Do not apply `Downloads\schema.sql` directly. Reconcile it with the current Supabase migrations and convert only missing parts into a new migration with RLS, role boundaries, immutable assessment records, and naming aligned to the current app.

Static comparison notes:

- The external file defines generic tables such as `programs`, `families`, `persons`, `staff`, `cases`, `assessment_instruments`, `assessment_domains`, `assessment_items`, `assessment_responses`, `domain_scores`, `assessment_scores`, `visitations`, `milestones`, `safety_plans`, `court_hearings`, `progress_notes`, and `reunification_readiness_index`.
- Current migrations already include many app-aligned equivalents, including `public.assessment_instruments`, `public.assessment_domains`, `public.assessment_items`, `public.assessment_responses`, `public.assessment_domain_scores`, `public.assessment_scores`, `public.reunification_cases`, `public.case_visitations`, `public.case_milestones`, `public.case_safety_plans`, `public.case_court_hearings`, `public.case_progress_notes`, and `public.reunification_readiness_indices`.
- The external schema did not show RLS, policy, auth helper, function, or view definitions in the static scan. Treat it as an assessment data-model reference only.
- Current migrations contain Supabase-specific security work that is absent from the external schema, including child-section RLS and remote drift lockdown.

## Priority 3 - Product Specs And Blueprints

External documents found:

- `C:\Users\SAFES\Downloads\SafeSteps_Master_Functional_Specification (1).docx`
- `C:\Users\SAFES\Downloads\SafeSteps Program Manuscript.docx`
- `C:\Users\SAFES\Downloads\SafeSteps Program Manuscript.pdf`
- `C:\Users\SAFES\Downloads\Home Again Program.pdf`
- `C:\Users\SAFES\Downloads\Home Again Program Overview.pdf`
- `C:\Users\SAFES\Downloads\ReunificationProgram_MasterBuildDocument.docx`
- `C:\Users\SAFES\Downloads\SafeSteps_AssessmentTools_PowerShell_Implementation (1).docx`
- `C:\Users\SAFES\OneDrive\Documents\SAFESTEPS MASTER BLUEPRINT.rtf`
- `C:\Users\SAFES\OneDrive\Documents\SafeSteps Core Workflow.rtf`
- `C:\Users\SAFES\OneDrive\Documents\why safesteps exists.txt`

Recommended next step:

Extract these into plain Markdown under `docs/source-reconciliation/` and mark each section as one of:

- already implemented
- partially implemented
- missing
- superseded by current Expo/Supabase architecture

## Priority 4 - Images And Branding

External images found:

`C:\Users\SAFES\OneDrive\Pictures\Safesteps images`

Workspace already has app assets in:

`C:\Users\SAFES\SafeStepsApp\assets`

Recommended next step:

Compare dimensions and usage for OneDrive images against current `assets\icon.png`, `assets\splash-icon.png`, and `assets\safesteps-course-background.png` before replacing anything.

## Priority 5 - Older Scripts And Modules

External script/module folders found:

- `C:\Users\SAFES\OneDrive\Documents\WindowsPowerShell\Modules\SafeStepsTools`
- `C:\Users\SAFES\Documents\PowerShell\Modules\SafeStepsCLI`
- `C:\Users\SAFES\Documents\PowerShell\Modules\SafeSteps`
- `C:\Users\SAFES\Downloads\safesteps_bulk_platform_build.ps1`

Workspace already has more complete-looking tool files:

- `SafeStepsTools`
- `SafeSteps.MasterEngine.psm1`
- `SafeSteps.Automation.psm1`
- root `safesteps-*.ps1` scripts

Recommended next step:

Treat external modules as historical references unless a specific function is missing from the workspace version. Do not replace workspace tools wholesale.

## Recommended Import Order

1. Reconcile lesson and challenge data counts.
2. Generate or update canonical curriculum TypeScript data files.
3. Add focused tests proving new lesson/challenge data loads and has required fields.
4. Reconcile `Downloads\schema.sql` into migrations only after reviewing current Supabase schema.
5. Extract blueprints/specs into Markdown and map them to existing routes, engines, migrations, and missing features.
6. Compare external branding assets before replacing app icons or splash assets.

## Risks

- Some generated lesson titles in the 468-780 batch appear to be raw source text rather than clean curriculum titles.
- Directly applying `schema.sql` would likely conflict with current Supabase migrations and RLS design.
- The repo already contains many generated and backup artifacts; imports should be staged into clearly named canonical files, not scattered through app routes.
- External PowerShell modules are older and smaller than workspace tools, so they should be mined selectively rather than copied over.
