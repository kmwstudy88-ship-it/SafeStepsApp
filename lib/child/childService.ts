import { supabase } from "../supabase";

export type ShareAudience = "private" | "parent" | "caseworker" | "both";

export type ChildMonitoredMessage = {
  id: string;
  child_user_id: string;
  parent_user_id: string | null;
  caseworker_user_id: string | null;
  sender_user_id: string;
  sender_role: "child" | "parent" | "caseworker";
  message_text: string;
  share_audience: ShareAudience;
  monitoring_status: "open" | "reviewed" | "follow_up" | "closed";
  monitoring_note: string | null;
  visible_to_child: boolean;
  visible_to_parent: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

async function getCurrentChildUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user?.id) {
    throw new Error("You need to be signed in before saving child records.");
  }

  return data.user.id;
}

export async function saveChildFeelingCheckIn(input: {
  feeling: string;
  bodySignal?: string;
  note?: string;
  shareAudience: ShareAudience;
}) {
  const childUserId = await getCurrentChildUserId();

  const { data, error } = await supabase
    .from("child_feelings_checkins")
    .insert({
      child_user_id: childUserId,
      feeling: input.feeling,
      body_signal: input.bodySignal ?? null,
      note: input.note ?? null,
      share_audience: input.shareAudience,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (input.shareAudience !== "private") {
    await createChildSharedItem({
      itemType: "feeling_checkin",
      itemId: data.id,
      itemTitle: "Feeling check-in",
      summaryText: `Child shared feeling: ${input.feeling}`,
      shareAudience: input.shareAudience,
    });
  }

  return data;
}

export async function saveChildRequest(input: {
  requestType: string;
  message?: string;
  shareAudience: ShareAudience;
}) {
  const childUserId = await getCurrentChildUserId();

  const { data, error } = await supabase
    .from("child_requests")
    .insert({
      child_user_id: childUserId,
      request_type: input.requestType,
      message: input.message ?? null,
      share_audience: input.shareAudience,
      status: "sent",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (input.shareAudience !== "private") {
    await createChildSharedItem({
      itemType: "request",
      itemId: data.id,
      itemTitle: input.requestType,
      summaryText: input.message ?? input.requestType,
      shareAudience: input.shareAudience,
    });
  }

  return data;
}

export async function saveChildVisitReflection(input: {
  visitDate?: string;
  whatWentWell?: string;
  whatFeltUncomfortable?: string;
  whatMadeMeHappy?: string;
  whatMadeMeWorried?: string;
  parentWorkOn?: string;
  shareAudience: ShareAudience;
}) {
  const childUserId = await getCurrentChildUserId();

  const { data, error } = await supabase
    .from("child_visit_reflections")
    .insert({
      child_user_id: childUserId,
      visit_date: input.visitDate || null,
      what_went_well: input.whatWentWell || null,
      what_felt_uncomfortable: input.whatFeltUncomfortable || null,
      what_made_me_happy: input.whatMadeMeHappy || null,
      what_made_me_worried: input.whatMadeMeWorried || null,
      parent_work_on: input.parentWorkOn || null,
      share_audience: input.shareAudience,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (input.shareAudience !== "private") {
    await createChildSharedItem({
      itemType: "visit_reflection",
      itemId: data.id,
      itemTitle: "Visit reflection",
      summaryText: input.parentWorkOn || input.whatWentWell || "Visit reflection shared",
      shareAudience: input.shareAudience,
    });
  }

  return data;
}

export async function createChildSharedItem(input: {
  itemType: string;
  itemId?: string;
  itemTitle?: string;
  summaryText?: string;
  shareAudience: ShareAudience;
}) {
  const childUserId = await getCurrentChildUserId();

  const { data, error } = await supabase
    .from("child_shared_items")
    .insert({
      child_user_id: childUserId,
      item_type: input.itemType,
      item_id: input.itemId ?? null,
      item_title: input.itemTitle ?? null,
      summary_text: input.summaryText ?? null,
      share_audience: input.shareAudience,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getChildMonitoredMessages() {
  const childUserId = await getCurrentChildUserId();

  const { data, error } = await supabase
    .from("parent_child_messages")
    .select("*")
    .eq("child_user_id", childUserId)
    .eq("visible_to_child", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ChildMonitoredMessage[];
}

export async function sendChildMonitoredMessage(input: {
  messageText: string;
  shareAudience: Exclude<ShareAudience, "private">;
}) {
  const childUserId = await getCurrentChildUserId();

  const { data, error } = await supabase
    .from("parent_child_messages")
    .insert({
      child_user_id: childUserId,
      sender_user_id: childUserId,
      sender_role: "child",
      message_text: input.messageText.trim(),
      share_audience: input.shareAudience,
      visible_to_child: true,
      visible_to_parent: input.shareAudience === "parent" || input.shareAudience === "both",
      monitoring_status: "open",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await createChildSharedItem({
    itemType: "monitored_message",
    itemId: data.id,
    itemTitle: "Message to parent",
    summaryText: input.messageText.trim(),
    shareAudience: input.shareAudience,
  });

  return data as ChildMonitoredMessage;
}
