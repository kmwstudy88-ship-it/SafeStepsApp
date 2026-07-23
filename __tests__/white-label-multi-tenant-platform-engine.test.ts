import {
  evaluateTenantBrandingReadiness,
  evaluateTenantDataExportReadiness,
  evaluateTenantDeletionReadiness,
  evaluateTenantFeatureActivation,
  getWhiteLabelMultiTenantReadinessSummary,
  whiteLabelMultiTenantPlatform,
} from "../lib/engines/whiteLabelMultiTenantPlatformEngine";

describe("whiteLabelMultiTenantPlatformEngine", () => {
  it("tracks Volume 23 as implemented", () => {
    expect(getWhiteLabelMultiTenantReadinessSummary()).toMatchObject({
      implemented: 1,
      total: 1,
      readyForRuntimeIntegration: true,
    });
    expect(whiteLabelMultiTenantPlatform.modules).toEqual(
      expect.arrayContaining([
        "tenant_registry",
        "tenant_organisations",
        "data_isolation_registry",
        "cross_tenant_sharing",
        "branding_profiles",
        "jurisdiction_packs",
        "language_packs",
        "cultural_packs",
        "feature_flags",
        "licensing",
        "tenant_exports",
        "tenant_termination",
        "deployments",
        "audit",
      ]),
    );
  });

  it("surfaces the production tables and runtime gates", () => {
    expect(whiteLabelMultiTenantPlatform.tables.length).toBeGreaterThanOrEqual(40);
    expect(whiteLabelMultiTenantPlatform.tables).toEqual(
      expect.arrayContaining([
        "platform_tenants",
        "platform_tenant_memberships",
        "platform_tenant_data_registry",
        "platform_cross_tenant_sharing_agreements",
        "platform_branding_profiles",
        "platform_feature_definitions",
        "platform_tenant_feature_flags",
        "platform_tenant_license_plans",
        "platform_tenant_export_requests",
        "platform_tenant_deletion_requests",
        "platform_tenant_audit_events",
      ]),
    );
    expect(whiteLabelMultiTenantPlatform.runtimeGates).toEqual(
      expect.arrayContaining([
        "Tenant configuration never grants automatic case-content or child-record access.",
        "Safety-critical and child-privacy-critical features cannot be disabled by ordinary tenant controls.",
        "Tenant termination requires retention review, no active legal hold, export or archival completion, approval and a safety-record preservation plan.",
      ]),
    );
  });

  it("blocks disabling safety-critical or child-privacy-critical feature flags", () => {
    const result = evaluateTenantFeatureActivation({
      featureExists: true,
      licenseAllowsFeature: true,
      governanceApproved: true,
      safetyCritical: true,
      childPrivacyCritical: true,
      enablingFeature: false,
      childPrivacyProtected: false,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Safety-critical and child-privacy-critical features cannot be disabled by tenant configuration.",
        "Child privacy controls must remain active across every tenant.",
      ]),
    );
  });

  it("allows ordinary tenant feature activation when catalogue, licence, governance and child privacy are satisfied", () => {
    const result = evaluateTenantFeatureActivation({
      featureExists: true,
      licenseAllowsFeature: true,
      governanceApproved: true,
      safetyCritical: false,
      childPrivacyCritical: false,
      enablingFeature: true,
      childPrivacyProtected: true,
    });

    expect(result).toEqual({ ready: true, blockers: [] });
  });

  it("blocks tenant exports without approval, tenant scoping, legal basis, retention basis and child-privacy approval", () => {
    const result = evaluateTenantDataExportReadiness({
      purposeRecorded: true,
      approvalRecorded: false,
      tenantScopeVerified: false,
      legalBasisRecorded: false,
      retentionBasisRecorded: false,
      includesChildContent: true,
      childPrivacyApprovalRecorded: false,
      secureDeliveryConfigured: false,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Tenant export needs an approval record.",
        "Tenant export must be verified as tenant-scoped.",
        "Tenant export needs a legal basis.",
        "Tenant export needs a retention basis.",
        "Exports containing child content require child-privacy approval.",
        "Tenant export requires secure delivery configuration.",
      ]),
    );
  });

  it("blocks tenant deletion when retention, legal-hold, archival, approval or safety preservation checks fail", () => {
    const result = evaluateTenantDeletionReadiness({
      retentionReviewCompleted: false,
      legalHoldActive: true,
      exportOrArchiveCompleted: false,
      approvalRecorded: false,
      safetyRecordPreservationPlan: false,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Tenant deletion requires completed retention review.",
        "Tenant deletion cannot proceed while a legal hold is active.",
        "Tenant deletion requires completed export or archival.",
        "Tenant deletion requires approval.",
        "Tenant deletion requires a safety-record preservation plan.",
      ]),
    );
  });

  it("requires accessibility, safety messaging, child review, cultural review and support contact before tenant branding release", () => {
    const result = evaluateTenantBrandingReadiness({
      accessibleTheme: false,
      safetyMessagingPreserved: false,
      childExperienceReviewed: false,
      culturalReviewCompleted: false,
      supportContactConfigured: false,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Tenant branding requires an accessibility-validated theme.",
        "Tenant branding must preserve SafeSteps safety messaging.",
        "Child-facing branding requires child-experience review.",
        "Tenant branding requires cultural review before release.",
        "Tenant branding requires visible support contact configuration.",
      ]),
    );
  });
});
