# SafeSteps Curriculum Library

This directory is the canonical source for reusable SafeSteps curriculum.

## Sections

- `lessons/` contains standalone lesson definitions and the lesson catalogue.
- `courses/` contains standalone courses assembled from ordered lessons.

Programs do not live in this directory. Program definitions belong in
`/programs` and compose lesson or course identifiers from these catalogues
through `programs/curriculumComposition.ts`.

Application code should import from `curriculum/lessons` or
`curriculum/courses`, not from legacy curriculum copies under `lib/data`.
