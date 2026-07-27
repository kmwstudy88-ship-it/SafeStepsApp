# SafeSteps video-system repository integration

This branch adds a repository-specific installer for the completed Stages 1–20 video-learning system.

## Repository findings

- SafeSteps is a single Expo Router application at the repository root.
- The Supabase client is `lib/supabaseClient.ts`.
- The generated video services were remapped to import that client.
- Generated `frontend/app`, `frontend/components` and `frontend/lib` paths were remapped to root `app`, `components` and `lib` paths.
- Existing root providers and route boundaries are preserved.
- Canonical video migrations are not copied by default because the repository already contains an active migration history.

## Required local payload

Download `SafeStepsApp_VideoSystem_RepoAdapted_Payload.zip` from the associated ChatGPT delivery and place it outside the repository or in a temporary local folder.

## Plan only

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\SafeStepsTools\Install-VideoSystemIntegration.ps1 `
  -PayloadZip C:\Path\SafeStepsApp_VideoSystem_RepoAdapted_Payload.zip `
  -Mode Plan
```

The plan is written under `_video_integration_work` and does not change the repository.

## Apply safe new files

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\SafeStepsTools\Install-VideoSystemIntegration.ps1 `
  -PayloadZip C:\Path\SafeStepsApp_VideoSystem_RepoAdapted_Payload.zip `
  -Mode Apply `
  -InstallDependencies
```

Conflicting files and migrations are skipped. The required Expo-compatible dependencies are resolved with:

```powershell
npx expo install react-native-webview expo-notifications
```

## Migration review

Use `-CopyMigrations` only after comparing existing Supabase migration history and canonical object overlap. Do not use automatic migration repair or push these migrations directly to production.

## Validation

```powershell
npx tsc --noEmit
npm test -- --runInBand
npx expo-doctor
npx expo install --check
supabase migration list
```

Database and Edge Function deployment must occur in staging before any production rollout. All video-system feature flags should remain disabled until role, RLS, PDF, notification and secure-delivery tests pass.
