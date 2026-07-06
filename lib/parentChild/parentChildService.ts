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

export type ParentChildMessage = {
  id: string;
  child_user_id: string;
  parent_user_id: string | null;
  caseworker_user_id: string | null;
  sender_user_id: string;
  sender_role: "child" | "parent" | "caseworker";
  message_text: string;
  share_audience: "private" | "parent" | "caseworker" | "both";
  monitoring_status: "open" | "reviewed" | "follow_up" | "closed";
  monitoring_note: string | null;
  visible_to_child: boolean;
  visible_to_parent: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ParentChildOverview = {
  sharedItemCount: number;
  requestCount: number;
  openRequestCount: number;
  messageCount: number;
  openMessageCount: number;
  latestSharedItem: ChildSharedItem | null;
  latestRequest: ChildRequest | null;
  latestMessage: ParentChildMessage | null;
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

export async function getParentChildMessages() {
  const { data, error } = await supabase
    .from("parent_child_messages")
    .select("*")
    .in("share_audience", ["parent", "both"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ParentChildMessage[];
}

export async function getParentChildOverview(): Promise<ParentChildOverview> {
  const [sharedItems, requests, messages] = await Promise.all([
    getParentChildSharedItems(),
    getParentChildRequests(),
    getParentChildMessages(),
  ]);

  return {
    sharedItemCount: sharedItems.length,
    requestCount: requests.length,
    openRequestCount: requests.filter((request) => request.status !== "completed").length,
    messageCount: messages.length,
    openMessageCount: messages.filter((message) => message.monitoring_status !== "closed").length,
    latestSharedItem: sharedItems[0] ?? null,
    latestRequest: requests[0] ?? null,
    latestMessage: messages[0] ?? null,
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

export async function createParentChildMessage(input: {
  childUserId: string;
  parentUserId?: string | null;
  caseworkerUserId?: string | null;
  messageText: string;
  visibleToChild: boolean;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!userData.user?.id) {
    throw new Error("You need to be signed in before sending a monitored message.");
  }

  const { data, error } = await supabase
    .from("parent_child_messages")
    .insert({
      child_user_id: input.childUserId,
      parent_user_id: input.parentUserId ?? userData.user.id,
      caseworker_user_id: input.caseworkerUserId ?? null,
      sender_user_id: userData.user.id,
      sender_role: "parent",
      message_text: input.messageText.trim(),
      share_audience: "parent",
      visible_to_child: input.visibleToChild,
      visible_to_parent: true,
      monitoring_status: "open",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ParentChildMessage;
}

export async function updateParentChildMessageMonitoring(
  messageId: string,
  input: {
    monitoringStatus: ParentChildMessage["monitoring_status"];
    monitoringNote?: string;
  },
) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!userData.user?.id) {
    throw new Error("You need to be signed in before updating monitoring status.");
  }

  const { data, error } = await supabase
    .from("parent_child_messages")
    .update({
      monitoring_status: input.monitoringStatus,
      monitoring_note: input.monitoringNote?.trim() || null,
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ParentChildMessage;
}
