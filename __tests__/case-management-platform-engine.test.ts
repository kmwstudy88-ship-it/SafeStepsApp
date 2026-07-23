import {
  caseManagementPlatform,
  evaluateCaseClosureReadiness,
  evaluateCaseDecisionReadiness,
  evaluateCaseTransferReadiness,
  getCaseManagementReadinessSummary,
} from "../lib/engines/caseManagementPlatformEngine";

describe("caseManagementPlatformEngine", () => {
  it("tracks Volume 19 as implemented", () => {
    expect(getCaseManagementReadinessSummary()).toMatchObject({
      implemented: 1,
      total: 1,
      readyForRuntimeIntegration: true,
    });
    expect(caseManagementPlatform.modules).toEqual(
      expect.arrayContaining([
        "service_programs",
        "staff_profiles",
        "referrals",
        "intake_screening",
        "allocations",
        "handover",
        "case_plans",
        "family_disagreements",
        "tasks",
        "appointments",
        "visits",
        "supervision",
        "case_decisions",
        "case_transfers",
        "case_closure",
      ]),
    );
  });

  it("surfaces the production tables and runtime gates", () => {
    expect(caseManagementPlatform.tables).toEqual(
      expect.arrayContaining([
        "organisation_units",
        "service_programs",
        "staff_profiles",
        "case_referrals",
        "case_referral_screenings",
        "case_allocations_v19",
        "case_handover_records",
        "case_plans",
        "case_tasks",
        "case_appointments",
        "case_visit_records_v19",
        "case_supervision_reviews",
        "case_decision_records",
        "case_transfer_records",
        "case_closure_records",
        "case_operational_audit_events",
      ]),
    );
    expect(caseManagementPlatform.runtimeGates).toEqual(
      expect.arrayContaining([
        "High-impact case decisions require supervisor approval and cannot be finalised by AI alone.",
        "Family disagreement is preserved as a separate record and is not automatically coded as refusal or lack of insight.",
      ]),
    );
  });

  it("blocks high-impact AI-assisted decisions without evidence, participant views, approval, and audit reference", () => {
    const result = evaluateCaseDecisionReadiness({
      hasFactualBasis: false,
      hasParticipantViews: false,
      isHighImpact: true,
      hasSupervisorApproval: false,
      aiAssisted: true,
      hasAiReference: false,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Decision needs a factual basis.",
        "Participant views or disagreement context must be preserved.",
        "High-impact decisions require supervisor approval.",
        "AI-assisted decisions must keep the AI output reference for audit.",
      ]),
    );
  });

  it("allows decision, transfer, and closure when required human-review gates are satisfied", () => {
    expect(
      evaluateCaseDecisionReadiness({
        hasFactualBasis: true,
        hasParticipantViews: true,
        isHighImpact: true,
        hasSupervisorApproval: true,
        aiAssisted: true,
        hasAiReference: true,
      }),
    ).toMatchObject({ ready: true, blockers: [] });

    expect(
      evaluateCaseTransferReadiness({
        hasCompletedHandover: true,
        hasRecordsManifest: true,
        familyNotified: true,
        approved: true,
      }),
    ).toMatchObject({ ready: true, blockers: [] });

    expect(
      evaluateCaseClosureReadiness({
        hasClosureSummary: true,
        hasRecordsAccessSummary: true,
        hasSupervisorApproval: true,
        hasOpenCriticalTasks: false,
        hasUnfinalisedHighImpactDecision: false,
      }),
    ).toMatchObject({ ready: true, blockers: [] });
  });
});
