# SafeSteps Backend Migration Workflow

SafeSteps database changes are product code. They must be reproducible, version-controlled, reviewable, and deployable from the repository.

Do not create a Supabase RPC function that executes arbitrary SQL. A remote SQL executor is an admin backdoor if it is exposed or granted incorrectly. Use Supabase migrations instead.

## Daily Commands

Check local versus remote migration state:

```powershell
npm run db:status
```

Create a new migration:

```powershell
npm run db:new add_case_note_tags
```

Edit the generated SQL file in:

```text
supabase/migrations/
```

Push pending migrations to the linked Supabase project:

```powershell
npm run db:push
```

Verify expected SafeSteps backend tables exist:

```powershell
npm run db:verify
```

Run database advisors:

```powershell
npm run db:advisors
```

## Rules

- Every table, policy, function, trigger, storage bucket, and seedable reference structure belongs in a migration.
- Manual Supabase Studio changes must be pulled back into migrations before they are treated as real.
- Public schema tables must have RLS enabled before app roles are granted access.
- Avoid `SECURITY DEFINER`. If it is truly required, place the function in a non-exposed schema, revoke public execution, and document why it bypasses RLS.
- Never commit Supabase service role keys, database passwords, or local `.env` files.

## Deployment Shape

The backend can be rebuilt by cloning the repo, installing dependencies, linking Supabase, and running:

```powershell
npm install
npm run db:status
npm run db:push
npm run db:verify
```

That gives SafeSteps a repeatable backend pipeline without relying on fragile manual Studio state.
