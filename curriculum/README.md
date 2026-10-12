# SafeSteps Curriculum Library

This is the single canonical curriculum root for SafeSteps.

## Canonical folders

- `lessons/` is the main source of reusable learning curriculum.
- `modules/` stores complete module source files.
- `courses/` stores complete course source files.
- `programs/` stores complete program source files.
- `source-imports/` keeps raw legacy curriculum folders after consolidation.

Lessons stay canonical. Modules, courses, and programs should compose or reference
lessons wherever possible. When a full module, course, or program is added as a
JSON source, import it through:

```powershell
npm run import:curriculum-source -- course .\path\to\course.json
```

Use `module` or `program` instead of `course` for those source types. The importer
stores the full source file in the matching folder and extracts every nested
lesson into `curriculum/lessons/extracted/<source>/` with source metadata.
