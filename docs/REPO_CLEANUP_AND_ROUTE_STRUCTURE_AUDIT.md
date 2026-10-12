# SafeSteps Repo Cleanup and Route Structure Audit

Date: 2026-07-14

## Current launch runtime

SafeSteps is currently an Expo Router app. The launch runtime starts at `expo-router/entry`, then `app/_layout.tsx`, then the route files under `app/`.

Treat these as active launch surfaces:

- `app/`
- `components/`
- `lib/`
- `curriculum/`
- `supabase/`
- `__tests__/`
- `docs/`
- `assets/`
- `SafeStepsTools/`

## Route structure status

The route structure is currently valid enough for static web export. The latest verified route map includes:

- `/courses`
- `/courses/course`
- `/courses/video-series-pipeline`
- `/courses/video-series-pipeline/[seriesId]`
- `/assessment-system`
- `/assessment-system/*`
- `/games/*`
- `/dashboard/worker/*`
- `/parent-child/*`

Keep route changes inside `app/` and register nested screens in the nearest `_layout.tsx` where a nested layout exists.

Run `npm run audit:routes` before and after moving implementation files out of `app/`. It reports files that Expo Router can treat as routes even though their names or folders look like implementation code.

## Deleted legacy files already in the worktree

The following deleted tracked paths are legacy React Navigation / JS demo surfaces and should stay deleted unless a specific feature depends on them:

- `app/App.js`
- `app/prismaClient.js`
- `app/components/*.js`
- `app/messaging/**`
- `app/screens/child/ChildMessagingScreen.js`
- `app/screens/parent/ParentMessagingScreen.js`
- `app/screens/shared/ChannelStatusBanner.js`
- `app/shared/*.js`

Reason: the active app uses Expo Router under `app/`, shared typed services under `lib/`, and route-level screens rather than the old JS messaging/navigation demo structure.

## Active untracked product code to review and stage

These untracked paths look like current product work and should be reviewed, tested, then staged in small batches:

- `app/games/`
- `app/voice/`
- `app/reflection/`
- `app/childSafety/`
- `app/contactVisit/`
- `app/dashboard/worker/`
- `app/documents/`
- `app/sessions/`
- `app/referrals/`
- `app/visits/`
- `app/family-meeting/`
- `app/child-protection/`
- `app/carer/`
- `app/advocate/`
- `lib/data/*Assessment*.ts`
- `lib/data/familyMeetingPromptEngine.ts`
- `lib/data/intensiveReunificationSupport.ts`
- `lib/data/videoSeriesPipeline.ts`
- `lib/engines/*Engine.ts`
- `curriculum/games/`
- `supabase/migrations/202607*.sql`
- matching tests in `__tests__/`

Do not delete these as cleanup. They are part of the newer SafeSteps product surface unless a focused review proves otherwise.

## Ignored generated or experimental material

The following root-level folders/files are now ignored because they are source packs, generated patch outputs, or standalone experiments rather than launch runtime code:

- `AiCurriculumEngine/`
- `ChildSafetyEngine/`
- `activity_library/`
- `lesson-theme/`
- `evidence/`
- `tools/`
- `moduleLoader.js`
- `moduleRegistry.json`
- `readinessEngine.js`
- `scheduler.js`
- `server.js`
- `verificationEngine.js`
- `SafeSteps-*Patch.ps1`
- `Unified Production Pipeline Master Document video series/`
- `src/legacyMessagingDemo/`
- `src/messaging/`
- `src/modules/`
- `src/prisma/`
- `src/screens/child/`
- `src/screens/parent/`
- `src/screens/shared/`
- `src/shared/`
- `api.old`
- `generateReport.js`

If content from these folders is needed, extract it into typed app data under `lib/`, `curriculum/`, `docs/`, or `supabase/` and add tests before tracking.

## Next cleanup order

1. Stage the already-deleted legacy messaging and old JS route files as removals.
2. Stage the current app/product additions in domain batches: assessment, games, reflection, worker dashboard, documents/sessions/referrals, video-series pipeline.
3. Run `npx tsc --noEmit`, `npx expo lint`, focused tests, then `npx expo export --platform web` after each route batch.
4. Only after the active product batches are staged should physical deletion of ignored source-pack folders be considered.

## Completed route cleanup

- Moved voice implementation files from `app/voice/` to `lib/voice/` so Expo Router no longer exports `VoiceEngine`, `VoiceSignalingClient`, `VoiceChatControls`, or `voiceSafety` as routes.
- Moved `ReflectionClient` from `app/reflection/` to `lib/reflection/` so Expo Router no longer exports it as a route.
- Moved game implementation folders from `app/games/` to `lib/games/` so Expo Router no longer exports game engines, model files, worker overlays, lobby helpers, or shared game components as public routes.
- Moved child-safety, contact-visit, reflection, and worker-dashboard components from `app/` to `lib/`; added a clean `/dashboard/worker` route wrapper.

## Completed app-root cleanup

- Moved non-route tooling and backup artifacts out of `app/` and into the local ignored quarantine folder `SafeStepsTools/quarantine/app-root-20260714/`.
- The cleaned app root now contains route files only: `_layout.tsx`, `index.tsx`, `home.tsx`, `welcome.tsx`, `settings.tsx`, `check-in.tsx`, `daily-evidence.tsx`, `my-story.tsx`, `why-safesteps.tsx`, `create-account.tsx`, and `splash-screen.tsx`.
- Removed empty legacy route trees after confirming they contained no files: `app/components/`, `app/messaging/`, `app/reflection/`, `app/screens/`, `app/shared/`, `app/src/`, and `app/voice/`.
- The extensionless `app/lobby` component had no references and was quarantined with the other app-root artifacts rather than kept as a route-tree file.

## Completed game-route consolidation

- Replaced 120 generated static multiplayer game route files with one dynamic Expo Router file: `app/games/multiplayer/[gameId].tsx`.
- Existing public URLs such as `/games/multiplayer/game_31` still resolve through the dynamic route.
- Moved the generated static files into the ignored local quarantine folder `SafeStepsTools/quarantine/generated-game-routes-20260714/`.
- The dynamic route now reads from `lib/games/engine/GameRegistry.ts`, keeping game metadata in one source instead of duplicating placeholder route files.

## Completed physical deletion pass

- Deleted the ignored quarantine folders after the route and app-root cleanups were validated.
- Deleted ignored generated/experimental root copies that were not launch runtime code, including old engine, backend/frontend, package, module, script, runtime, evidence, and tool folders.
- Deleted route-conflict and timestamped `.bak_*` files under `app/` and `lib/`.
- Deleted generated build/runtime output folders and logs such as `dist/`, `.expo/`, and Expo web log files.
- Deleted disabled/backup migration folders while preserving active `supabase/migrations/`.
- Deleted the old tracked `src/` tree and root `App.tsx` fallback after confirming active `app/`, `lib/`, `components/`, tests, and package entrypoints did not import them.
- Narrowed `tsconfig.json` to the active Expo Router app and shared `lib/` code.
- Restored two narrow test-backed contracts as focused production files instead of restoring their old folders wholesale: `programs/curriculumComposition.ts` and `backend/security/weapon_risk/weaponRiskEvaluator.js`.
- Left active product code, environment files, `node_modules/`, source document archives, and current untracked feature modules in place.
- One ignored generated report file remains blocked by Windows permissions: `_generated_reports_20260629/SafeSteps_FolderSearch.txt`.
