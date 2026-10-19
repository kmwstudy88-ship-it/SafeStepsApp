import { saveMyProfile } from "../lib/engines/profileSelfServiceEngine";
import { supabase } from "../lib/supabase/client";

jest.mock("../lib/supabase/client", () => ({
  supabase: { auth: { getUser: jest.fn() }, from: jest.fn() },
}));

describe("profile self service boundary", () => {
  const getUser = supabase.auth.getUser as jest.Mock;
  const from = supabase.from as jest.Mock;
  beforeEach(() => jest.resetAllMocks());

  test("binds writes to the session and drops injected authority fields without clearing omitted values", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "session-user" } }, error: null });
    const upsert = jest.fn().mockResolvedValue({ error: null });
    const single = jest.fn().mockResolvedValue({ data: { id: "session-user", role: "worker" }, error: null });
    const eq = jest.fn().mockReturnValue({ select: () => ({ single }) });
    const update = jest.fn().mockReturnValue({ eq });
    from.mockReturnValue({ upsert, update });
    const result = await saveMyProfile({ story_goal: "Keep this", role: "admin", id: "other", onboarding_status: "onboarding_complete" } as never);
    expect(upsert).toHaveBeenCalledWith({ id: "session-user", story_goal: "Keep this", updated_at: expect.any(String) }, { onConflict: "id", ignoreDuplicates: true });
    expect(update).toHaveBeenCalledWith({ story_goal: "Keep this", updated_at: expect.any(String) });
    expect(eq).toHaveBeenCalledWith("id", "session-user");
    expect(result.role).toBe("worker");
  });

  test("does not write without a verified user", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(saveMyProfile({ display_name: "Name" })).rejects.toThrow("Sign in");
    expect(from).not.toHaveBeenCalled();
  });

  test("does not report success after a failed profile insert", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "session-user" } }, error: null });
    const update = jest.fn();
    from.mockReturnValue({ upsert: jest.fn().mockResolvedValue({ error: { message: "Denied" } }), update });
    await expect(saveMyProfile({ strengths: "Saved?" })).rejects.toThrow("Denied");
    expect(update).not.toHaveBeenCalled();
  });
});
