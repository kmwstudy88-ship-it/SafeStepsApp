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
  share_audience: "private" | "parent" | "caseworker" | "both";
  status: string;
  created_at: string;
};

export async function getParentChildSharedItems() {
  const { data, error } = await supabase
    .from("child_shared_items")
    .select("*")
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