# GitHub Cheat Sheet — SafeStepsApp

## Repo basics
- Remote: `kmwstudy88-ship-it/SafeStepsApp` (github.com)
- Default branch: `main`
- Worktree sessions: each session gets its own branch off `main` — commit directly to it, don't create new branches mid-session.

## Everyday git commands
```
git status
git add -A
git commit -m "message"
git log --oneline -10
git diff
git fetch origin
git pull origin main
git push origin <branch>
git switch -c <branch>        # create+switch
git switch <branch>
git stash / git stash pop
```

## PR workflow (this repo)
1. Branch off `main` (per-session worktree already handles this).
2. Commit changes with trailer:
   ```
   Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>
   ```
3. Use `.github/pull_request_template.md` sections when opening a PR:
   - **Summary** — what/why
   - **Validation** — exact commands run + results
   - **Migration Safety Checklist** — required only for DB migration PRs (lists grants, rollback, advisor warnings, "no prod data deleted" confirmation)
4. Push and open PR via `gh pr create` or the `create_pull_request` tool.

## gh CLI quick reference
```
gh pr create --fill
gh pr view <num> --web
gh pr diff <num>
gh pr checks <num>
gh pr merge <num> --squash
gh issue list
gh issue view <num>
gh repo view --web
```

## Schema/migration guardrail (critical for this repo)
Before touching schema, migrations, RLS, identity, case relationships, storage authorization, generated DB types, or Supabase query paths:
- Read `docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md` first — it's the single source of truth.
- Never assume `cases.id == reunification_cases.id`.
- Never write through compatibility aliases in new code.
- Schema changes require a reviewed migration + updates to the canonical doc, readers/writers, generated types, and checks together.

## Useful npm scripts (package.json)
```
npm start                 # expo start
npm run android|ios|web   # expo start --<platform>
npm run backend           # node backend/server.js
npm test:documents        # node --test (document intelligence tests)
npm run verify:documents  # node tools/verify-document-intelligence.mjs
npm run validate          # npx expo-doctor
npm run content:index     # node tools/build-content-index.mjs
npm run content:readiness # node tools/validate-curriculum-readiness.mjs
npm run readiness         # node tools/production-readiness-gate.mjs
```

## Tips
- Prefer the smallest test/validation command that covers your change; include exact command + pass/fail in PR "Validation" section.
- For migration PRs, fill out every checklist box in the template — don't skip it.
