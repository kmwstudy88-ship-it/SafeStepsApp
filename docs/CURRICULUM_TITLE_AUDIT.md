# Curriculum Title Audit

Last checked: 2026-07-13

Command:

```powershell
npm run audit:curriculum-titles
```

Current result:

- 1,376 curriculum JSON source issues found.
- The UI lesson screens now read lesson titles from the canonical lesson/course/program data.
- This audit covers the source-data layer: records where the title or content itself is still generic.

Issue patterns currently detected:

- Generic titles such as `Lesson 1`, `Lesson 2`, and `Stage 1 - Week 1 - Lesson 1`.
- Placeholder content such as `Placeholder content for SafeSteps...`.
- Pending imported content such as `Content pending`.

Why this matters:

The themed lesson UI can display the correct title field, but it cannot turn a generic source title into a real learning topic. These records need curriculum cleanup before they should be treated as launch-ready lesson content.

Next cleanup target:

1. Replace generic JSON titles with the actual lesson topic being taught.
2. Replace placeholder or pending body/content fields with substantive lesson content.
3. Re-run `npm run audit:curriculum-titles`.
4. Continue until the audit passes.
