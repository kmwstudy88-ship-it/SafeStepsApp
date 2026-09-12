# SafeSteps agent instructions

Before changing database schema, migrations, RLS, identity, case relationships, storage authorization, generated database types or Supabase query paths, read [the SafeSteps Canonical Schema Document](docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md).

That document is the single schema decision authority. Preserve its distinctions between required target behavior, verified deployed structures, compatibility views and transitional/deprecated tables. Its companion snapshot is baseline evidence, not an alternate contract.

Do not create parallel identity/case/evidence/assessment models, assume `cases.id` equals `reunification_cases.id`, or write through compatibility aliases in new code. Use a reviewed migration to resolve deployment differences and update the canonical document, affected readers/writers, generated types and relevant checks together.

Do not execute database migrations merely because this document is present. Follow the user's authorized task scope. Other SafeSteps repositories should reference this authority instead of maintaining competing schema definitions.


