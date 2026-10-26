# Curriculum Title Audit

Last checked: 2026-10-19

Commands:

```powershell
node tools/audit-curriculum-titles.js
node tools/audit-found-curriculum.js
npm run content:readiness
```

Current result:

- **0 curriculum JSON or TypeScript source issues found (`audit-curriculum-titles.js`, `audit-found-curriculum.js`, and `content:readiness` passed).**
- All canonical lessons (`lessons/*.json`, `src/safesteps/lessons/**/*.json`), modules, topics, courses, and programs have been cleaned and verified.
- All generic titles (`Lesson 1`, `Stage 1 - Week 1 - Lesson 1`, `snake_case` slugs, `Section N for ...`) and placeholder content (`Placeholder content for SafeSteps...`, `Content pending`, `Lesson content goes here.`) have been replaced with trauma-informed, topic-specific SafeSteps curriculum content.
