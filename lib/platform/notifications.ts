import { supabase } from "../supabase";

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error("You must be signed in.");
  return data.user.id;
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
  return data;
}

export async function listMyNotifications() {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}