import { supabase } from "../supabase";
import { getOptionalUserId, getSignedInUserId } from "../authSession";

export type NotificationRecord = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  notification_type: string;
  due_at: string | null;
  read_at: string | null;
  related_table: string | null;
  related_id: string | null;
  created_at: string;
};

export function unreadNotifications(items: NotificationRecord[]) {
  return items.filter((item) => !item.read_at);
}

async function currentUserId() {
  return getSignedInUserId("using notifications");
}

export async function createReminder(input: {
  title: string;
  body?: string;
  dueAt?: string;
  relatedTable?: string;
  relatedId?: string;
}) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title: input.title,
      body: input.body ?? null,
      notification_type: "reminder",
      due_at: input.dueAt ?? null,
      related_table: input.relatedTable ?? null,
      related_id: input.relatedId ?? null,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as NotificationRecord;
}

export async function listMyNotifications() {
  const userId = await getOptionalUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as NotificationRecord[];
}

export async function markNotificationRead(id: string) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as NotificationRecord;
}

export async function markNotificationsRead(ids: string[]) {
  if (ids.length === 0) return { updatedCount: 0 };

  const userId = await currentUserId();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .in("id", ids);

  if (error) throw error;
  return { updatedCount: ids.length };
}
