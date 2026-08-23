import { getOptionalUserId } from "../lib/authSession";
import {
  calculateGrowthStats,
  fetchDailyLessonRecords,
} from "../lib/engines/growthTimelineEngine";
import { supabase } from "../lib/supabase/client";

jest.mock("../lib/authSession", () => ({
  getOptionalUserId: jest.fn(),
}));

jest.mock("../lib/supabase/client", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockGetOptionalUserId = getOptionalUserId as jest.Mock;
const mockSupabase = supabase as unknown as { from: jest.Mock };

function queryResult(data: unknown, error: { message: string } | null = null) {
  const result = { data, error };
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: jest.fn((resolve: (value: typeof result) => unknown) => Promise.resolve(resolve(result))),
  };

  return query;
}

describe("growth timeline engine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches only the recent daily lesson record columns that the UI needs", async () => {
    const rows = [
      {
        id: "newer",
        owner_id: "user-1",
        event_type: "daily_lesson_completed",
        label: "Newer",
        metadata: {},
        created_at: "2026-08-18T00:00:00.000Z",
      },
      {
        id: "older",
        owner_id: "user-1",
        event_type: "daily_lesson_completed",
        label: "Older",
        metadata: {},
        created_at: "2026-08-17T00:00:00.000Z",
      },
    ];
    const query = queryResult(rows);

    mockGetOptionalUserId.mockResolvedValue("user-1");
    mockSupabase.from.mockReturnValue(query);

    await expect(fetchDailyLessonRecords()).resolves.toEqual(rows.reverse());

    expect(mockSupabase.from).toHaveBeenCalledWith("progress_events");
    expect(query.select).toHaveBeenCalledWith("id,owner_id,event_type,label,metadata,created_at");
    expect(query.eq).toHaveBeenCalledWith("owner_id", "user-1");
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(query.limit).toHaveBeenCalledWith(1000);
  });

  test("calculates counts and confidence averages in one result set", () => {
    expect(
      calculateGrowthStats([
        {
          id: "1",
          owner_id: "user-1",
          event_type: "daily_lesson_completed",
          label: "Lesson 1",
          metadata: { confidence_before: 2, confidence_after: 4 },
          created_at: "2026-08-17T00:00:00.000Z",
        },
        {
          id: "2",
          owner_id: "user-1",
          event_type: "practical_activity_recorded",
          label: "Practice",
          metadata: {},
          created_at: "2026-08-17T01:00:00.000Z",
        },
        {
          id: "3",
          owner_id: "user-1",
          event_type: "knowledge_checkpoint_completed",
          label: "Knowledge",
          metadata: {},
          created_at: "2026-08-17T02:00:00.000Z",
        },
        {
          id: "4",
          owner_id: "user-1",
          event_type: "scenario_checkpoint_completed",
          label: "Scenario",
          metadata: {},
          created_at: "2026-08-17T03:00:00.000Z",
        },
      ]),
    ).toEqual({
      totalLessonsSaved: 4,
      completedLessons: 1,
      practicalActivities: 1,
      knowledgeCheckpoints: 1,
      scenarioCheckpoints: 1,
      averageConfidenceBefore: 2,
      averageConfidenceAfter: 4,
      confidenceChange: 2,
    });
  });
});
