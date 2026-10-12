import {
  evaluateProgramStartGate,
  programRequiresWorkerReview,
  type ProgramStartGateSnapshot,
} from "../lib/engines/programStartGatePolicy";

const completeSnapshot: ProgramStartGateSnapshot = {
  profileComplete: true,
  caseSetupComplete: true,
  intakeComplete: true,
  intakeCompletedAt: "2026-07-15T04:00:00.000Z",
  reviewerState: "approved",
  reviewerUserId: "worker-1",
  reviewedAt: "2026-07-15T05:00:00.000Z",
};

describe("program start gate", () => {
  test("blocks when profile is incomplete", () => {
    const decision = evaluateProgramStartGate({ ...completeSnapshot, profileComplete: false }, "low");
    expect(decision.allowed).toBe(false);
    expect(decision.blockers).toContain("profile_required");
  });

  test("blocks when case setup is incomplete", () => {
    const decision = evaluateProgramStartGate({ ...completeSnapshot, caseSetupComplete: false }, "medium");
    expect(decision.allowed).toBe(false);
    expect(decision.blockers).toContain("case_setup_required");
  });

  test("blocks when intake has no completion timestamp", () => {
    const decision = evaluateProgramStartGate({ ...completeSnapshot, intakeCompletedAt: null }, "low");
    expect(decision.allowed).toBe(false);
    expect(decision.blockers).toContain("intake_required");
  });

  test("high and very high pathways require worker review", () => {
    expect(programRequiresWorkerReview("high")).toBe(true);
    expect(programRequiresWorkerReview("very_high")).toBe(true);
    expect(programRequiresWorkerReview("medium")).toBe(false);
    expect(programRequiresWorkerReview("low")).toBe(false);
  });

  test("blocks high-risk pathway while review is pending", () => {
    const decision = evaluateProgramStartGate({ ...completeSnapshot, reviewerState: "pending" }, "high");
    expect(decision.allowed).toBe(false);
    expect(decision.blockers).toEqual(["worker_review_pending"]);
  });

  test("blocks high-risk pathway when reviewer requires changes", () => {
    const decision = evaluateProgramStartGate({ ...completeSnapshot, reviewerState: "changes_required" }, "very_high");
    expect(decision.allowed).toBe(false);
    expect(decision.blockers).toEqual(["worker_changes_required"]);
  });

  test("allows high-risk pathway after approval and complete prerequisites", () => {
    expect(evaluateProgramStartGate(completeSnapshot, "high").allowed).toBe(true);
  });

  test("allows low-risk pathway without worker review after required setup and intake", () => {
    const decision = evaluateProgramStartGate(
      { ...completeSnapshot, reviewerState: "not_required", reviewerUserId: null, reviewedAt: null },
      "low",
    );
    expect(decision.allowed).toBe(true);
    expect(decision.requiresWorkerReview).toBe(false);
  });
});
