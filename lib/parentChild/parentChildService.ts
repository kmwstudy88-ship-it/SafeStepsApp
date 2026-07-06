import { supabase } from "../supabase";

export type ChildSharedItem = {
  id: string;
  child_user_id: string;
  item_type: string;
  item_id: string | null;
  item_title: string | null;
  summary_text: string | null;
  share_audience: "private" | "parent" | "caseworker" | "both";
  created_at: string;
};

export type ChildRequest = {
  id: string;
  child_user_id: string;
  request_type: string;
  message: string | null;
  parent_user_id: string | null;
  caseworker_user_id: string | null;
  share_audience: "private" | "parent" | "caseworker" | "both";
  status: string;
  created_at: string;
};

export type ChildRequestResponse = {
  id: string;
  request_id: string;
  child_user_id: string;
  parent_user_id: string | null;
  caseworker_user_id: string | null;
  responder_user_id: string;
  response_text: string;
  response_type: "parent_note" | "caseworker_note" | "action_update";
  visible_to_child: boolean;
  created_at: string;
};

export type ParentChildOverview = {
  sharedItemCount: number;
  requestCount: number;
  openRequestCount: number;
  latestSharedItem: ChildSharedItem | null;
  latestRequest: ChildRequest | null;
};

export async function getParentChildSharedItems() {
  const { data, error } = await supabase
    .from("child_shared_items")
    .select("*")
    .in("share_audience", ["parent", "both"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ChildSharedItem[];
}

export async function getParentChildRequests() {
  const { data, error } = await supabase
    .from("child_requests")
    .select("*")
    .in("share_audience", ["parent", "both"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ChildRequest[];
}

export async function getParentChildOverview(): Promise<ParentChildOverview> {
  const [sharedItems, requests] = await Promise.all([
    getParentChildSharedItems(),
    getParentChildRequests(),
  ]);

  return {
    sharedItemCount: sharedItems.length,
    requestCount: requests.length,
    openRequestCount: requests.filter((request) => request.status !== "completed").length,
    latestSharedItem: sharedItems[0] ?? null,
    latestRequest: requests[0] ?? null,
  };
}

export async function markChildRequestStatus(requestId: string, status: "seen" | "responded" | "completed") {
  const { data, error } = await supabase
    .from("child_requests")
    .update({ status })
    .eq("id", requestId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getChildRequestResponses(requestIds: string[]) {
  if (requestIds.length === 0) {
    return [] as ChildRequestResponse[];
  }

  const { data, error } = await supabase
    .from("child_request_responses")
    .select("*")
    .in("request_id", requestIds)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ChildRequestResponse[];
}

export async function createChildRequestResponse(input: {
  request: ChildRequest;
  responseText: string;
  visibleToChild: boolean;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!userData.user?.id) {
    throw new Error("You need to be signed in before responding to a child request.");
  }

  const { data, error } = await supabase
    .from("child_request_responses")
    .insert({
      request_id: input.request.id,
      child_user_id: input.request.child_user_id,
      parent_user_id: input.request.parent_user_id,
      caseworker_user_id: input.request.caseworker_user_id,
      responder_user_id: userData.user.id,
      response_text: input.responseText.trim(),
      response_type: "parent_note",
      visible_to_child: input.visibleToChild,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ChildRequestResponse;
}
