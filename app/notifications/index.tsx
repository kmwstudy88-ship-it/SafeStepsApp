import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  createReminder,
  listMyNotifications,
  markNotificationRead,
  markNotificationsRead,
  NotificationRecord,
  unreadNotifications,
} from "../../lib/platform/notifications";

export default function NotificationsScreen() {
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Daily lesson reminder");
  const [body, setBody] = useState("Complete today's SafeSteps lesson and reflection.");
  const [dueAt, setDueAt] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setItems(await listMyNotifications());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveReminder() {
    if (!title.trim()) {
      Alert.alert("Title required", "Add a reminder title before saving.");
      return;
    }

    try {
      await createReminder({ title: title.trim(), body: body.trim(), dueAt: dueAt.trim() || undefined });
      await load();
      Alert.alert("Reminder saved", "The reminder was saved in the notifications table.");
    } catch (error) {
      Alert.alert("Could not save", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async function markAllRead() {
    const unreadIds = unreadNotifications(items).map((item) => item.id);
    if (unreadIds.length === 0 || bulkUpdating) return;

    setBulkUpdating(true);
    try {
      await markNotificationsRead(unreadIds);
      await load();
    } catch (error) {
      Alert.alert("Could not update", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setBulkUpdating(false);
    }
  }

  const unreadCount = unreadNotifications(items).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Notifications and reminders</Text>
      <Text style={styles.body}>This adds in-app reminders now. Expo push notifications can be connected later without changing the database shape.</Text>

      <Pressable
        disabled={unreadCount === 0 || bulkUpdating}
        style={[styles.secondaryButton, (unreadCount === 0 || bulkUpdating) && styles.disabled]}
        onPress={markAllRead}
      >
        <Text style={styles.secondaryButtonText}>
          {bulkUpdating ? "Updating..." : `Mark all unread read (${unreadCount})`}
        </Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create reminder</Text>
        <Input value={title} onChangeText={setTitle} placeholder="Title" />
        <Input value={body} onChangeText={setBody} placeholder="Body" multiline />
        <Input value={dueAt} onChangeText={setDueAt} placeholder="Due date ISO, optional: 2026-07-01T09:00:00+10:00" />
        <Pressable style={styles.button} onPress={saveReminder}>
          <Text style={styles.buttonText}>Save reminder</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator />}
      {!loading && items.map((item) => (
        <Pressable key={item.id} style={styles.card} onPress={async () => { await markNotificationRead(item.id); await load(); }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {!!item.body && <Text>{item.body}</Text>}
          <Text>{item.due_at ? new Date(item.due_at).toLocaleString() : "No due date"}</Text>
          <Text>{item.read_at ? "Read" : "Unread"}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} style={[styles.input, props.multiline && styles.multiline]} placeholderTextColor="#67736a" />;
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, backgroundColor: "#eef5ef" },
  title: { fontSize: 28, fontWeight: "800" },
  body: { fontSize: 16, lineHeight: 23 },
  card: { backgroundColor: "white", padding: 16, borderRadius: 18, gap: 10, borderWidth: 1, borderColor: "#d6e2d8" },
  cardTitle: { fontSize: 18, fontWeight: "800" },
  input: { borderWidth: 1, borderColor: "#d6e2d8", borderRadius: 14, padding: 12, backgroundColor: "#fbfdfb", fontSize: 15 },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  button: { backgroundColor: "#2f5f4a", padding: 15, borderRadius: 16, alignItems: "center" },
  secondaryButton: { backgroundColor: "#dcefe8", padding: 15, borderRadius: 16, alignItems: "center" },
  secondaryButtonText: { color: "#102033", fontWeight: "800" },
  disabled: { opacity: 0.65 },
  buttonText: { color: "white", fontWeight: "800" },
});
