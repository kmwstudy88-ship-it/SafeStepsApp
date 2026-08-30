import { getReportSummary } from "../lib/platformData";
import { supabase } from "../lib/supabaseClient";

jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as unknown as { from: jest.Mock };

function queryResult(data: unknown, error: { message: string } | null = null) {
  const result = { data, error };
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: jest.fn((resolve: (value: typeof result) => unknown) => Promise.resolve(resolve(result))),
  };

  return query;
}

function maybeSingleResult(data: unknown, error: { message: string } | null = null) {
  const result = { data, error };
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };

  return query;
}

describe("report summary queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("caps large summary queries while keeping recent data ordered", async () => {
    const tasksQuery = queryResult([]);
    const evidenceQuery = queryResult([]);
    const reflectionsQuery = queryResult([]);
    const enrollmentsQuery = queryResult([]);
    const eventsQuery = queryResult([]);
    const profileQuery = maybeSingleResult(null);
    const historyEvidenceQuery = queryResult([]);

    const queryMap = {
      user_tasks: [tasksQuery],
      evidence_items: [evidenceQuery, historyEvidenceQuery],
      program_reflections: [reflectionsQuery],
      program_enrollments: [enrollmentsQuery],
      progress_events: [eventsQuery],
      profiles: [profileQuery],
    } as Record<string, unknown[]>;

    mockSupabase.from.mockImplementation((table: string) => {
      const next = queryMap[table]?.shift();
      if (!next) {
        throw new Error(`Unexpected table ${table}`);
      }
      return next;
    });

    await expect(getReportSummary("user-1")).resolves.toMatchObject({
      tasks: [],
      evidence: [],
      reflections: [],
      enrollments: [],
      events: [],
      profile: null,
    });

    expect(tasksQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(tasksQuery.limit).toHaveBeenCalledWith(500);
    expect(evidenceQuery.limit).toHaveBeenCalledWith(500);
    expect(reflectionsQuery.limit).toHaveBeenCalledWith(250);
    expect(enrollmentsQuery.limit).toHaveBeenCalledWith(100);
    expect(eventsQuery.limit).toHaveBeenCalledWith(20);
  });
});
