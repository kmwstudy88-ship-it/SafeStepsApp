import {
  familyReunificationSafetyAndRewardsEngine,
  familyMeetingPromptAndReflectionEngine,
  getAllFamilyMeetingPromptCards,
  getCircuitBreakerTools,
  getClinicianDashboardWidgets,
  getFamilyMeetingFrontendFlows,
  getFamilyMeetingApiEndpoints,
  getFamilyMeetingImplementationRoadmap,
  getFamilyMeetingSecurityGuardrails,
  getFamilyMeetingPromptCardsByPhase,
  getNominationPromptCardsForRole,
  getWeeklyMeetingUxSteps,
} from "../lib/data/familyMeetingPromptEngine";

describe("family meeting prompt engine", () => {
  it("keeps prompt IDs unique across all prompt cards", () => {
    const ids = getAllFamilyMeetingPromptCards().map((card) => card.prompt_id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("provides prompt cards for each meeting phase", () => {
    expect(getFamilyMeetingPromptCardsByPhase("nomination").length).toBeGreaterThanOrEqual(5);
    expect(getFamilyMeetingPromptCardsByPhase("negotiation").length).toBe(3);
    expect(getFamilyMeetingPromptCardsByPhase("reflection").length).toBe(3);
  });

  it("separates child and parent nomination prompts", () => {
    expect(getNominationPromptCardsForRole("Child").every((card) => card.target_role === "Child")).toBe(true);
    expect(getNominationPromptCardsForRole("Parent").every((card) => card.target_role === "Parent")).toBe(true);
  });

  it("includes a structured sample meeting payload", () => {
    expect(familyMeetingPromptAndReflectionEngine.version).toBe("3.1.0");
    expect(familyMeetingPromptAndReflectionEngine.sample_meeting_session_payload.negotiation_outcome.consensus_type).toBe(
      "Unanimous",
    );
  });

  it("defines phase 4 circuit-breaker timing and tools", () => {
    expect(familyReunificationSafetyAndRewardsEngine.version).toBe("4.0.0");
    expect(familyReunificationSafetyAndRewardsEngine.circuit_breaker_protocols.consensus_timer_seconds).toBe(600);
    expect(familyReunificationSafetyAndRewardsEngine.circuit_breaker_protocols.pause_reset_seconds).toBe(300);
    expect(getCircuitBreakerTools().map((tool) => tool.tool_id)).toEqual(["DE-01", "DE-02"]);
  });

  it("keeps clinician oversight framed as review telemetry", () => {
    const telemetry = familyReunificationSafetyAndRewardsEngine.case_manager_oversight_telemetry;

    expect(telemetry.overall_health_score).toBe(88);
    expect(telemetry.clinical_summary_export.average_conflict_level).toBe("Low");
    expect(telemetry.flags_and_alerts.some((alert) => alert.alert_type === "CIRCUIT_BREAKER")).toBe(true);
  });

  it("defines the family meeting API and database architecture contracts", () => {
    expect(getFamilyMeetingApiEndpoints().map((endpoint) => endpoint.endpoint)).toContain(
      "/api/v1/sessions/circuit-breaker",
    );
    expect(getClinicianDashboardWidgets()).toHaveLength(4);
    expect(familyReunificationSafetyAndRewardsEngine.database_schema_blueprint.map((table) => table.table_name)).toEqual([
      "families",
      "family_members",
      "member_relationships",
      "activity_library",
      "weekly_sessions",
      "session_reflections",
    ]);
  });

  it("defines separated child, parent, and clinician frontend flows", () => {
    const flows = getFamilyMeetingFrontendFlows();
    const childFlow = flows.find((flow) => flow.flow_id === "ChildFlow");

    expect(flows.map((flow) => flow.flow_id)).toEqual(["ChildFlow", "ParentFlow", "ClinicianDashboardFlow"]);
    expect(childFlow?.screens.map((screen) => screen.screen)).toEqual([
      "ActivityDiscovery",
      "NominationCard",
      "FamilyVoteRoom",
      "SundayMemoryCapture",
    ]);
    expect(childFlow?.screens.some((screen) => screen.purpose.toLowerCase().includes("clinical notes"))).toBe(true);
  });

  it("models the weekly meeting UX as four ordered steps", () => {
    expect(getWeeklyMeetingUxSteps().map((step) => step.step_id)).toEqual([
      "STEP-01",
      "STEP-02",
      "STEP-03",
      "STEP-04",
    ]);
  });

  it("keeps privacy and compliance controls as implementation targets", () => {
    const guardrails = getFamilyMeetingSecurityGuardrails();

    expect(guardrails.map((guardrail) => guardrail.domain)).toContain("Child Privacy");
    expect(guardrails.every((guardrail) => guardrail.target_standard.toLowerCase().includes("target"))).toBe(true);
  });

  it("defines a four-sprint engineering implementation roadmap", () => {
    expect(getFamilyMeetingImplementationRoadmap().map((sprint) => sprint.sprint_id)).toEqual([
      "SPRINT-01",
      "SPRINT-02",
      "SPRINT-03",
      "SPRINT-04",
    ]);
  });
});
