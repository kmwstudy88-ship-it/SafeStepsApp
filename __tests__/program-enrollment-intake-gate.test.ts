import { supabase } from "../lib/supabase/client";
import { hasCompletedIntakeAssessment } from "../lib/platformData";
import { resolveSingleActiveCaseId } from "../lib/security/caseAccess";
import { assertProgramCanStart } from "../lib/engines/programStartGateEngine";
import { startProgramEnrollment } from "../lib/engines/programEnrollmentEngine";

jest.mock("../lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

jest.mock("../lib/platformData", () => ({
  hasCompletedIntakeAssessment: jest.fn(),
}));

jest.mock("../lib/security/caseAccess", () => ({
  resolveSingleActiveCaseId: jest.fn(),
}));

jest.mock("../lib/engines/programStartGateEngine", () => ({
  assertProgramCanStart: jest.fn(),
}));

const mockSupabase = supabase as unknown as {
  auth: { getUser: jest.Mock };
  from: jest.Mock;
  rpc: jest.Mock;
};
const mockHasCompletedIntakeAssessment = hasCompletedIntakeAssessment as jest.Mock;
const mockResolveSingleActiveCaseId = resolveSingleActiveCaseId as jest.Mock;
const mockAssertProgramCanStart = assertProgramCanStart as jest.Mock;

function queryResult(data: unknown, error: { message: string } | null = null) {
  const result = { data, error };
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    then: jest.fn((resolve: (value: typeof result) => unknown) => Promise.resolve(resolve(result))),
  };

  return query;
}

describe("program enrollment intake gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockResolveSingleActiveCaseId.mockResolvedValue("case-1");
    mockAssertProgramCanStart.mockResolvedValue({
      caseId: "case-1",
      intakeCompletedAt: "2026-07-21T00:00:00.000Z",
      reviewerState: "ready",
    });
  });

  test("blocks program start before querying or creating enrollment records when intake is incomplete", async () => {
    mockHasCompletedIntakeAssessment.mockResolvedValue(false);

    await expect(startProgramEnrollment("home-again", "Home Again")).rejects.toThrow(
      "Complete the SafeSteps intake assessment before starting or continuing a program.",
    );

    expect(mockHasCompletedIntakeAssessment).toHaveBeenCalledWith("user-1");
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  test("allows enrollment creation only after intake is complete", async () => {
    const activeEnrollmentQuery = queryResult([]);
    const createdEnrollment = {
      id: "enrollment-1",
      owner_id: "user-1",
      program_id: "home-again",
      status: "active",
      started_at: "2026-07-21T00:00:00.000Z",
      completed_at: null,
    };
    const progressEventQuery = queryResult(null);

    mockHasCompletedIntakeAssessment.mockResolvedValue(true);
    mockSupabase.rpc.mockResolvedValue({ data: createdEnrollment, error: null });
    mockSupabase.from
      .mockReturnValueOnce(activeEnrollmentQuery)
      .mockReturnValueOnce(progressEventQuery);

    await expect(startProgramEnrollment("home-again", "Home Again")).resolves.toEqual(createdEnrollment);

    expect(mockHasCompletedIntakeAssessment).toHaveBeenCalledWith("user-1");
    expect(mockSupabase.from).toHaveBeenNthCalledWith(1, "program_enrollments");
    expect(mockResolveSingleActiveCaseId).toHaveBeenCalled();
    expect(mockAssertProgramCanStart).toHaveBeenCalledWith("home-again");
    expect(mockSupabase.rpc).toHaveBeenCalledWith("start_program_enrollment", {
      target_case_id: "case-1",
      target_program_id: "home-again",
    });
    expect(mockSupabase.from).toHaveBeenNthCalledWith(2, "progress_events");
  });
});
