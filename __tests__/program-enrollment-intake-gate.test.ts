import { supabase } from "../lib/supabase/client";
import { hasCompletedIntakeAssessment } from "../lib/platformData";
import { startProgramEnrollment } from "../lib/engines/programEnrollmentEngine";

jest.mock("../lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock("../lib/platformData", () => ({
  hasCompletedIntakeAssessment: jest.fn(),
}));

const mockSupabase = supabase as unknown as {
  auth: { getUser: jest.Mock };
  from: jest.Mock;
};
const mockHasCompletedIntakeAssessment = hasCompletedIntakeAssessment as jest.Mock;

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
    const createEnrollmentQuery = queryResult(createdEnrollment);
    const progressEventQuery = queryResult(null);

    mockHasCompletedIntakeAssessment.mockResolvedValue(true);
    mockSupabase.from
      .mockReturnValueOnce(activeEnrollmentQuery)
      .mockReturnValueOnce(createEnrollmentQuery)
      .mockReturnValueOnce(progressEventQuery);

    await expect(startProgramEnrollment("home-again", "Home Again")).resolves.toEqual(createdEnrollment);

    expect(mockHasCompletedIntakeAssessment).toHaveBeenCalledWith("user-1");
    expect(mockSupabase.from).toHaveBeenNthCalledWith(1, "program_enrollments");
    expect(mockSupabase.from).toHaveBeenNthCalledWith(2, "program_enrollments");
    expect(mockSupabase.from).toHaveBeenNthCalledWith(3, "progress_events");
  });
});
