import {
  communityServicesPlatform,
  evaluateCommunityReferralClosure,
  evaluateCommunityReferralSendReadiness,
  evaluateCommunityServiceMatch,
  getCommunityServicesReadinessSummary,
} from "../lib/engines/communityServicesPlatformEngine";

describe("communityServicesPlatformEngine", () => {
  it("tracks Volume 21 as implemented", () => {
    expect(getCommunityServicesReadinessSummary()).toMatchObject({
      implemented: 1,
      total: 1,
      readyForRuntimeIntegration: true,
    });
    expect(communityServicesPlatform.modules).toEqual(
      expect.arrayContaining([
        "service_categories",
        "service_providers",
        "provider_locations",
        "eligibility_rules",
        "capacity_snapshots",
        "service_search",
        "service_matching",
        "referral_consent",
        "waitlists",
        "bookings",
        "barrier_tracking",
        "outcomes",
        "alternatives",
      ]),
    );
  });

  it("surfaces the production tables and runtime gates", () => {
    expect(communityServicesPlatform.tables.length).toBeGreaterThanOrEqual(20);
    expect(communityServicesPlatform.tables).toEqual(
      expect.arrayContaining([
        "community_service_categories",
        "community_service_providers",
        "community_services",
        "community_service_eligibility_rules",
        "community_service_capacity_snapshots",
        "community_service_search_requests",
        "community_service_match_results",
        "community_service_referrals",
        "community_referral_consents",
        "community_referral_waitlist_records",
        "community_referral_bookings",
        "community_referral_barriers",
        "community_referral_outcomes",
      ]),
    );
    expect(communityServicesPlatform.runtimeGates).toEqual(
      expect.arrayContaining([
        "Referral closure requires service access, need-addressed status, and the family view.",
        "Provider feedback remains separate from verified fact.",
      ]),
    );
  });

  it("blocks safety-sensitive referrals without consent, minimum information, active service, and protected contact", () => {
    const result = evaluateCommunityReferralSendReadiness({
      hasNeedSummary: true,
      consentRecorded: false,
      minimumNecessaryInformationOnly: false,
      serviceActive: false,
      safetySensitive: true,
      protectedContactConfigured: false,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Referral needs consent or a documented no-consent-required basis.",
        "Referral information must be minimum necessary.",
        "Selected service must be active before referral is sent.",
        "Safety-sensitive referrals require protected contact configuration.",
      ]),
    );
  });

  it("does not close referrals until access, need outcome, family view, and barrier handling are complete", () => {
    const result = evaluateCommunityReferralClosure({
      accessConfirmed: false,
      needAddressed: false,
      familyViewRecorded: false,
      openBarriers: true,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Service access must be confirmed before referral closure.",
        "The relevant need must be addressed or an alternative plan recorded.",
        "Family view must be recorded before closure.",
        "Open access barriers must be resolved or transferred before closure.",
      ]),
    );
  });

  it("treats service matches as non-actionable when capacity and barriers are unknown", () => {
    const result = evaluateCommunityServiceMatch({
      eligibilityKnown: true,
      suitabilityExplained: true,
      capacityKnown: false,
      alternativesOffered: false,
      barrierWarningsRecorded: false,
    });

    expect(result.actionable).toBe(false);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        "Capacity or waitlist status is unknown.",
        "Alternatives should be offered when access is uncertain.",
        "Transport, cost, accessibility, language, safety, or cultural barriers should be recorded.",
      ]),
    );
  });
});
