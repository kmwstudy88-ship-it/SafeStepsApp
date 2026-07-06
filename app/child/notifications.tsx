import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";
import {
  getChildMonitoredMessages,
  sendChildMonitoredMessage,
  type ChildMonitoredMessage,
  type ShareAudience,
} from "../../lib/child/childService";

const shareChoices: { label: string; value: Exclude<ShareAudience, "private"> }[] = [
  { label: "Parent", value: "parent" },
  { label: "Caseworker", value: "caseworker" },
  { label: "Both", value: "both" },
];

const statusLabels: Record<ChildMonitoredMessage["monitoring_status"], string> = {
  open: "Open",
  reviewed: "Reviewed",
  follow_up: "Follow up",
  closed: "Closed",
};

export default function ChildNotificationsScreen() {
  const [messages, setMessages] = useState<ChildMonitoredMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [shareAudience, setShareAudience] = useState<Exclude<ShareAudience, "private">>("parent");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadMessages() {
    try {
      setLoading(true);
      setMessage("");
      const result = await getChildMonitoredMessages();
      setMessages(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load messages.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    const text = messageText.trim();

    if (!text) {
      setMessage("Write a message before sending.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await sendChildMonitoredMessage({
        messageText: text,
        shareAudience,
      });

      setMessageText("");
      setShareAudience("parent");
      await loadMessages();
      setMessage("Message sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send message.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <ChildScreenShell
      title="Messages"
      subtitle="A monitored message space for things you choose to send to a parent or caseworker."
    >
      <PrivacyNotice />

      <SectionTitle>Send a monitored message</SectionTitle>

      <InfoCard
        title="Message"
        description="Write what you want the adult to understand. A parent or caseworker can review and respond."
      >
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Write your message..."
          placeholderTextColor="#7A8A80"
          multiline
        />
      </InfoCard>

      <SectionTitle>Who can see this?</SectionTitle>

      <View style={styles.grid}>
        {shareChoices.map((choice) => (
          <Pressable
            key={choice.value}
            style={[styles.choice, shareAudience === choice.value && styles.choiceSelected]}
            onPress={() => setShareAudience(choice.value)}
          >
            <Text style={[styles.choiceTitle, shareAudience === choice.value && styles.choiceTextSelected]}>
              {choice.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.saveButton} onPress={sendMessage} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Sending..." : "Send Message"}</Text>
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <SectionTitle>Message history</SectionTitle>

      {loading ? <InfoCard title="Loading messages" /> : null}

      {!loading && messages.length === 0 ? (
        <InfoCard title="No messages yet" description="Messages you choose to send will appear here." />
      ) : null}

      {!loading && messages.map((item) => (
        <InfoCard
          key={item.id}
          title={item.sender_role === "child" ? "You sent" : "Adult response"}
          description={item.message_text}
        >
          <Text style={styles.meta}>
            {statusLabels[item.monitoring_status]} | {new Date(item.created_at).toLocaleString()}
          </Text>
          {item.monitoring_note ? (
            <Text style={styles.monitoringNote}>{item.monitoring_note}</Text>
          ) : null}
        </InfoCard>
      ))}

      <BackToChildHome />
    </ChildScreenShell>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#F6FAF7",
    borderWidth: 1,
    borderColor: "#D7E2DA",
    borderRadius: 14,
    color: "#20382B",
    fontSize: 15,
    marginTop: 12,
    minHeight: 110,
    padding: 14,
    textAlignVertical: "top",
  },
  grid: {
    gap: 10,
    marginBottom: 14,
  },
  choice: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E2DA",
    borderRadius: 16,
    padding: 14,
  },
  choiceSelected: {
    backgroundColor: "#315D44",
    borderColor: "#315D44",
  },
  choiceTitle: {
    color: "#20382B",
    fontWeight: "900",
    fontSize: 15,
  },
  choiceTextSelected: {
    color: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: "#20382B",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 16,
  },
  message: {
    marginTop: 12,
    color: "#20382B",
    fontWeight: "700",
    textAlign: "center",
  },
  meta: {
    color: "#53665A",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  monitoringNote: {
    backgroundColor: "#F6FAF7",
    borderColor: "#D7E2DA",
    borderRadius: 12,
    borderWidth: 1,
    color: "#53665A",
    lineHeight: 20,
    marginTop: 10,
    padding: 10,
  },
});
