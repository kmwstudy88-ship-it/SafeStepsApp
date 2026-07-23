import {
  blockedLegacyTableNames,
  canonicalDomains,
  canonicalTableMappings,
  evaluateStage1Readiness,
  findBlockedLegacyNames,
  foundationDependencyOrder,
  getCanonicalMapping,
  listTenantScopedCanonicalTables,
  milestone1AcceptanceTests,
  stage2FoundationMigrations,
} from "../lib/engines/canonicalDataModelEngine";

describe("canonicalDataModelEngine", () => {
  it("defines the 18 canonical production domains", () => {
    expect(canonicalDomains.map((domain) => domain.id)).toEqual([
      "platform",
      "identity",
      "organisations",
      "families",
      "cases",
      "child_experience",
      "learning",
      "assessments",
      "evidence",
      "safety",
      "visits",
      "community",
      "communications",
      "reports",
      "analytics",
      "integrations",
      "governance",
      "operations",
    ]);
  });

  it("keeps the foundation dependency order before advanced domains", () => {
    expect(foundationDependencyOrder.slice(0, 6)).toEqual([
      "extensions",
      "platform_tenants",
      "global_lookup_definitions",
      "organisations",
      "profiles",
      "tenant_memberships",
    ]);
    expect(foundationDependencyOrder.indexOf("cases")).toBeGreaterThan(foundationDependencyOrder.indexOf("children"));
    expect(foundationDependencyOrder.indexOf("rls_policies")).toBeGreaterThan(
      foundationDependencyOrder.indexOf("audit_events"),
    );
  });

  it("maps overlapping concepts into canonical table names", () => {
    expect(getCanonicalMapping("cases")).toMatchObject({
      canonicalTable: "cases",
      migrationAction: "merge",
      tenantScoped: true,
    });
    expect(getCanonicalMapping("assessment_instances")).toMatchObject({
      migrationAction: "transform",
      existingTables: expect.arrayContaining(["assessments", "assessment_records"]),
    });
    expect(getCanonicalMapping("community_service_referrals")).toMatchObject({
      existingTables: expect.arrayContaining(["case_service_referrals", "community_service_referrals"]),
    });
  });

  it("requires tenant scope on operational canonical tables but not global definitions", () => {
    expect(listTenantScopedCanonicalTables()).toEqual(
      expect.arrayContaining([
        "organisations",
        "families",
        "children",
        "cases",
        "assessment_instances",
        "evidence_records",
        "community_service_referrals",
        "consent_records",
        "audit_events",
      ]),
    );
    expect(getCanonicalMapping("platform_tenants")?.tenantScoped).toBe(false);
    expect(getCanonicalMapping("assessment_definitions")?.tenantScoped).toBe(false);
  });

  it("blocks known non-canonical table names from becoming new production targets", () => {
    expect(blockedLegacyTableNames).toEqual(
      expect.arrayContaining(["casefiles", "client_cases", "assessment_runs", "tenant_users"]),
    );
    expect(findBlockedLegacyNames(["cases", "casefiles", "assessment_runs"])).toEqual([
      "casefiles",
      "assessment_runs",
    ]);
  });

  it("defines the Stage 2 executable foundation migration package", () => {
    expect(stage2FoundationMigrations).toEqual([
      "0001_extensions.sql",
      "0002_platform_tenants.sql",
      "0003_organisations.sql",
      "0004_profiles_and_memberships.sql",
      "0005_roles_and_permissions.sql",
      "0006_families_and_members.sql",
      "0007_children.sql",
      "0008_cases_and_participants.sql",
      "0009_case_allocations.sql",
      "0010_audit_foundation.sql",
      "0011_foundation_rls.sql",
      "0012_foundation_tests.sql",
    ]);
  });

  it("does not allow Stage 2 until backup, inventory, mapping, boundary and tests are complete", () => {
    const blocked = evaluateStage1Readiness({
      backupRecorded: false,
      inventoryCaptured: false,
      mappingApproved: true,
      tenantBoundaryDefined: true,
      blockedNamesReviewed: false,
      stage2MigrationOrderDefined: true,
      foundationTestsDefined: true,
    });

    expect(blocked.readyForStage2).toBe(false);
    expect(blocked.blockers).toEqual(
      expect.arrayContaining([
        "Record a Supabase backup timestamp before executable consolidation migrations.",
        "Capture current tables, columns, foreign keys, indexes, RLS policies, functions and triggers.",
        "Review blocked legacy table names before adding new schema.",
      ]),
    );
  });

  it("records the Milestone 1 isolation and audit acceptance tests", () => {
    expect(milestone1AcceptanceTests).toEqual(
      expect.arrayContaining([
        "Tenant A user reads Tenant B family: denied.",
        "Tenant A administrator reads Tenant B case: denied.",
        "Assigned worker reads authorised case: allowed.",
        "Parent reads child-private journal: denied.",
        "Tenant export includes another tenant: test must fail.",
        "Service-role operation lacks tenant scope: rejected or audited exception.",
      ]),
    );
    expect(canonicalTableMappings.length).toBeGreaterThanOrEqual(15);
  });
});
