const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  },
}));

const {
  getParentChildSharedItems,
  getParentChildRequests,
  getParentChildMessages,
  getParentChildOverview,
} = require("../lib/parentChild/parentChildService");

function queryMock(data: unknown[] = []) {
  const chain = {
    select: jest.fn(() => chain),
    in: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    order: jest.fn(async () => ({ data, error: null })),
  };
  return chain;
}

function signedInAs(userId: string) {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
}

describe("child shared review service", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
  });

  test("parent shared-item review is scoped to parent audience and signed-in parent", async () => {
    signedInAs("parent-user-1");
    const sharedItemsQuery = queryMock();
    mockFrom.mockReturnValue(sharedItemsQuery);

    await getParentChildSharedItems();

    expect(mockFrom).toHaveBeenCalledWith("child_shared_items");
    expect(sharedItemsQuery.in).toHaveBeenCalledWith("share_audience", ["parent", "both"]);
    expect(sharedItemsQuery.eq).toHaveBeenCalledWith("parent_user_id", "parent-user-1");
    expect(sharedItemsQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  test("caseworker shared-item review is scoped to caseworker audience and signed-in caseworker", async () => {
    signedInAs("caseworker-user-1");
    const sharedItemsQuery = queryMock();
    mockFrom.mockReturnValue(sharedItemsQuery);

    await getParentChildSharedItems("caseworker");

    expect(mockFrom).toHaveBeenCalledWith("child_shared_items");
    expect(sharedItemsQuery.in).toHaveBeenCalledWith("share_audience", ["caseworker", "both"]);
    expect(sharedItemsQuery.eq).toHaveBeenCalledWith("caseworker_user_id", "caseworker-user-1");
  });

  test("parent message review only returns parent-visible messages addressed to the parent", async () => {
    signedInAs("parent-user-1");
    const messagesQuery = queryMock();
    mockFrom.mockReturnValue(messagesQuery);

    await getParentChildMessages("parent");

    expect(mockFrom).toHaveBeenCalledWith("parent_child_messages");
    expect(messagesQuery.in).toHaveBeenCalledWith("share_audience", ["parent", "both"]);
    expect(messagesQuery.eq).toHaveBeenCalledWith("parent_user_id", "parent-user-1");
    expect(messagesQuery.eq).toHaveBeenCalledWith("visible_to_parent", true);
  });

  test("caseworker message review uses caseworker recipient without parent visibility filter", async () => {
    signedInAs("caseworker-user-1");
    const messagesQuery = queryMock();
    mockFrom.mockReturnValue(messagesQuery);

    await getParentChildMessages("caseworker");

    expect(mockFrom).toHaveBeenCalledWith("parent_child_messages");
    expect(messagesQuery.in).toHaveBeenCalledWith("share_audience", ["caseworker", "both"]);
    expect(messagesQuery.eq).toHaveBeenCalledWith("caseworker_user_id", "caseworker-user-1");
    expect(messagesQuery.eq).not.toHaveBeenCalledWith("visible_to_parent", true);
  });

  test("caseworker overview passes caseworker scope to shared items, requests, and messages", async () => {
    signedInAs("caseworker-user-1");
    const sharedItemsQuery = queryMock([{ id: "shared-1", created_at: "2026-01-01" }]);
    const requestsQuery = queryMock([{ id: "request-1", status: "sent", created_at: "2026-01-01" }]);
    const messagesQuery = queryMock([{ id: "message-1", monitoring_status: "open", created_at: "2026-01-01" }]);
    mockFrom
      .mockReturnValueOnce(sharedItemsQuery)
      .mockReturnValueOnce(requestsQuery)
      .mockReturnValueOnce(messagesQuery);

    const overview = await getParentChildOverview("caseworker");

    expect(mockFrom).toHaveBeenNthCalledWith(1, "child_shared_items");
    expect(mockFrom).toHaveBeenNthCalledWith(2, "child_requests");
    expect(mockFrom).toHaveBeenNthCalledWith(3, "parent_child_messages");
    expect(sharedItemsQuery.eq).toHaveBeenCalledWith("caseworker_user_id", "caseworker-user-1");
    expect(requestsQuery.eq).toHaveBeenCalledWith("caseworker_user_id", "caseworker-user-1");
    expect(messagesQuery.eq).toHaveBeenCalledWith("caseworker_user_id", "caseworker-user-1");
    expect(overview).toEqual(expect.objectContaining({
      sharedItemCount: 1,
      requestCount: 1,
      openRequestCount: 1,
      messageCount: 1,
      openMessageCount: 1,
    }));
  });

  test("review reads require a signed-in user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(getParentChildRequests()).rejects.toThrow("signed in");
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
