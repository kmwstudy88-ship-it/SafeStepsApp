import {
  saveParentAccessibilityPreferences,
  saveParentAccessibilityPreferencesFromSettings,
} from "../lib/engines/onboardingEngine";
import { supabase } from "../lib/supabase/client";

jest.mock("../lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as unknown as {
  auth: { getUser: jest.Mock };
  from: jest.Mock;
};

function updateQuery() {
  const query = {
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ error: null }),
  };

  return query;
}

const preferences = {
  textSize: "large" as const,
  highContrast: true,
  reducedMotion: true,
  readAloud: false,
  captions: true,
  simpleLanguage: true,
};

describe("accessibility preference persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  test("settings update saves accessibility preferences without changing onboarding status", async () => {
    const query = updateQuery();
    mockSupabase.from.mockReturnValue(query);

    await saveParentAccessibilityPreferencesFromSettings(preferences);

    expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    expect(query.update).toHaveBeenCalledWith(
      expect.objectContaining({
        accessibility_preferences: preferences,
        updated_at: expect.any(String),
      }),
    );
    expect(query.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ onboarding_status: expect.any(String) }),
    );
    expect(query.eq).toHaveBeenCalledWith("id", "user-1");
  });

  test("onboarding save still advances parent onboarding to intake", async () => {
    const query = updateQuery();
    mockSupabase.from.mockReturnValue(query);

    await saveParentAccessibilityPreferences(preferences);

    expect(query.update).toHaveBeenCalledWith(
      expect.objectContaining({
        accessibility_preferences: preferences,
        onboarding_status: "intake_in_progress",
        updated_at: expect.any(String),
      }),
    );
  });
});
