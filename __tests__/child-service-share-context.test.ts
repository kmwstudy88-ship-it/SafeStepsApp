const getUserMock = jest.fn();
const rpcMock = jest.fn();
const fromMock = jest.fn();

jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: getUserMock,
    },
    rpc: rpcMock,
    from: fromMock,
  },
}));

function tableMock(returned: unknown = { id: "record-1" }) {
  const chain = {
    insert: jest.fn(() => chain),
    select: jest.fn(() => chain),
    single: jest.fn(async () => ({ data: returned, error: null })),
    eq: jest.fn(() => chain),
    order: jest.fn(async () => ({ data: [], error: null })),
  };
  return chain;
}

function mockSignedInChild() {
  getUserMock.mockResolvedValue({ data: { user: { id: "child-user-1" } }, error: null });
}

function mockShareContext() {
  rpcMock.mockResolvedValue({
    data: [{
      case_id: "case-1",
      parent_user_id: "parent-user-1",
      caseworker_user_id: "caseworker-user-1",
    }],
    error: null,
  });
}

describe("child service share context", () => {
  beforeEach(() => {
    jest.resetModules();
    getUserMock.mockReset();
    rpcMock.mockReset();
    fromMock.mockReset();
  });

  test("keeps private feeling check-ins private and does not resolve share context", async () => {
    mockSignedInChild();
    const checkInTable = tableMock({ id: "checkin-1" });
    fromMock.mockReturnValue(checkInTable);

    const { saveChildFeelingCheckIn } = await import("../lib/child/childService");

    await saveChildFeelingCheckIn({
      feeling: "Calm",
      bodySignal: "hands",
      note: "Quiet morning",
      shareAudience: "private",
    });

    expect(rpcMock).not.toHaveBeenCalled();
    expect(fromMock).toHaveBeenCalledWith("child_feelings_checkins");
    expect(checkInTable.insert).toHaveBeenCalledWith(expect.objectContaining({
      child_user_id: "child-user-1",
      feeling: "Calm",
      share_audience: "private",
    }));
  });

  test("adds parent and caseworker recipients to shared child items", async () => {
    mockSignedInChild();
    mockShareContext();
    const requestTable = tableMock({ id: "request-1" });
    const sharedItemTable = tableMock({ id: "shared-1" });
    fromMock
      .mockReturnValueOnce(requestTable)
      .mockReturnValueOnce(sharedItemTable);

    const { saveChildRequest } = await import("../lib/child/childService");

    await saveChildRequest({
      requestType: "Game Request",
      message: "Can we play a calm game?",
      shareAudience: "both",
    });

    expect(rpcMock).toHaveBeenCalledWith("get_child_case_share_context", {
      target_child_user_id: "child-user-1",
    });
    expect(requestTable.insert).toHaveBeenCalledWith(expect.objectContaining({
      child_user_id: "child-user-1",
      parent_user_id: "parent-user-1",
      caseworker_user_id: "caseworker-user-1",
      share_audience: "both",
    }));
    expect(sharedItemTable.insert).toHaveBeenCalledWith(expect.objectContaining({
      child_user_id: "child-user-1",
      parent_user_id: "parent-user-1",
      caseworker_user_id: "caseworker-user-1",
      shared_by: "child-user-1",
      share_audience: "both",
    }));
  });

  test("adds case id and recipient ids to monitored child messages", async () => {
    mockSignedInChild();
    mockShareContext();
    const messageTable = tableMock({ id: "message-1" });
    const sharedItemTable = tableMock({ id: "shared-message-1" });
    fromMock
      .mockReturnValueOnce(messageTable)
      .mockReturnValueOnce(sharedItemTable);

    const { sendChildMonitoredMessage } = await import("../lib/child/childService");

    await sendChildMonitoredMessage({
      messageText: "I want Dad to listen more.",
      shareAudience: "parent",
    });

    expect(messageTable.insert).toHaveBeenCalledWith(expect.objectContaining({
      case_id: "case-1",
      child_user_id: "child-user-1",
      parent_user_id: "parent-user-1",
      caseworker_user_id: null,
      sender_user_id: "child-user-1",
      sender_role: "child",
      share_audience: "parent",
      visible_to_child: true,
      visible_to_parent: true,
      monitoring_status: "open",
    }));
  });

  test("blocks parent sharing when the child case has no linked parent", async () => {
    mockSignedInChild();
    rpcMock.mockResolvedValue({
      data: [{ case_id: "case-1", parent_user_id: null, caseworker_user_id: "caseworker-user-1" }],
      error: null,
    });

    const { sendChildMonitoredMessage } = await import("../lib/child/childService");

    await expect(sendChildMonitoredMessage({
      messageText: "Please share this.",
      shareAudience: "parent",
    })).rejects.toThrow("linked parent");

    expect(fromMock).not.toHaveBeenCalled();
  });
});
