# Firebase → Supabase migration notes

SafeSteps now uses Supabase for authentication, database access, and storage integration.

## Environment variables

Use these server-side variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

For Expo runtime, keep using the `EXPO_PUBLIC_SUPABASE_*` variables in `.env.example`.

## Removed Firebase operational usage

- `testConnection.js` now validates Supabase connectivity instead of Firebase Realtime Database.
- Legacy Firebase inventory ignore pattern (`firebase-*.txt`) was removed from `.gitignore`.

## Manual follow-up checks

- Confirm Supabase tables and RLS policies are applied (`supabase/migrations`).
- Ensure server-only contexts use service role credentials and client apps use anon/publishable keys only.
