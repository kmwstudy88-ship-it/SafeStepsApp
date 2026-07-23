# Stage 1 Canonical Data Model and Migration Consolidation

SafeSteps now treats the Volume 1-23 documents as architecture references, not as the final production execution order.

The canonical schema work starts with a consolidation map and preflight checks so Stage 2 can introduce executable foundation migrations without renaming, deleting or merging live tables in the same release.

## Canonical Domains

The production schema is organised into Platform, Identity, Organisations, Families, Cases, Child Experience, Learning, Assessments, Evidence, Safety, Visits, Community, Communications, Reports, Analytics, Integrations, Governance and Operations.

## Stage 1 Deliverables

- `docs/database/canonical-schema-map.json` defines canonical table names, overlapping existing names, migration actions and tenant-scope requirements.
- `supabase/tests/stage1_canonical_inventory.sql` generates inventory views for current tables, columns, foreign keys, indexes, RLS policies, functions and triggers.
- `SafeStepsTools/database/Export-CanonicalInventory.ps1` exports that inventory from the linked Supabase project.
- `lib/engines/canonicalDataModelEngine.ts` exposes the canonical domains, foundation order and drift checks to the app/test layer.
- `__tests__/canonical-data-model-engine.test.ts` prevents regressions in naming, tenant-boundary rules and milestone acceptance criteria.

## Non-Destructive Rule

Stage 1 does not drop legacy or overlapping tables. It classifies them and prepares the migration path:

1. Create canonical tables or compatibility columns.
2. Copy or transform existing data.
3. Validate counts, foreign keys and RLS.
4. Switch application reads.
5. Switch application writes.
6. Observe production.
7. Archive old tables.
8. Remove obsolete tables in a later release.

## Stage 2 Target

Stage 2 should create the executable foundation migrations only: tenants, organisations, profiles, tenant memberships, roles and permissions, families, family members, children, cases, case participants, case allocations, audit events, base RLS and foundational tests.

Analytics, billing, plugins, research, and advanced domain migrations remain blocked until the foundation isolation tests pass.
