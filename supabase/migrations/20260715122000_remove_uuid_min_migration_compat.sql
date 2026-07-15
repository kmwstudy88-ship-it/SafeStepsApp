-- Remove the one-time UUID aggregate used only by the preceding backfill migration.

drop aggregate if exists public.min(uuid);
drop function if exists public.safesteps_uuid_min_state(uuid, uuid);
