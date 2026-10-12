import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import {
  BackToParentChildHome,
  EmptyState,
  ErrorState,
  ParentChildActionRow,
  ParentChildButton,
  ParentChildCard,
  ParentChildShell,
} from "../../lib/parentChild/components";
import {
  createParentChildMessage,
  getParentChildMessages,
  getParentChildRequests,
  updateParentChildMessageMonitoring,
  type ChildRequest,
  type ParentChildMessage,
} from "../../lib/parentChild/parentChildService";

const statusLabels: Record<ParentChildMessage["monitoring_status"], string> = {
  open: "Open",
  reviewed: "Reviewed",
  follow_up: "Follow up",
  closed: "Closed",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ParentChildMessagesScreen() {
  const params = useLocalSearchParams<{ caseId?: string | string[]; viewerRole?: string | string[] }>();
  const caseId = firstParam(params.caseId) ?? null;
  const viewerRole = firstParam(params.viewerRole) === "caseworker" ? "caseworker" : "parent";
  const [messages, setMessages] = useState<ParentChildMessage[]>([]);
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [draft, setDraft] = useState("");
  const [monitoringNote, setMonitoringNote] = useState<Record<string, string>>({});
  const [visibleToChild, setVisibleToChild] = useState(true);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const messageTarget = useMemo(() => {
    return messages[0] ?? requests[0] ?? null;
  }, [messages, requests]);

  async function loadMessages() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [messageResult, requestResult] = await Promise.all([
        getParentChildMessages(viewerRole, caseId),
        getParentChildRequests(viewerRole, caseId),
      ]);

      setMessages(messageResult);
      setRequests(requestResult);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load monitored messages.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    const messageText = draft.trim();

    if (!messageText) {
      setErrorMessage("Write a message before sending.");
      return;
    }

    if (!messageTarget) {
      setErrorMessage("A child-shared item or request is needed before starting a monitored message thread.");
      return;
    }

    try {
      setWorkingId("new");
      setErrorMessage("");

      await createParentChildMessage({
        childUserId: messageTarget.child_user_id,
        parentUserId: "parent_user_id" in messageTarget ? messageTarget.parent_user_id : null,
        caseworkerUserId: "caseworker_user_id" in messageTarget ? messageTarget.caseworker_user_id : null,
        messageText,
        visibleToChild,
      });

      setDraft("");
      setVisibleToChild(true);
      await loadMessages();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not send monitored message.");
    } finally {
      setWorkingId("");
    }
  }

  async function updateMonitoringStatus(
    message: ParentChildMessage,
    monitoringStatus: ParentChildMessage["monitoring_status"],
  ) {
    try {
      setWorkingId(message.id);
      setErrorMessage("");

      await updateParentChildMessageMonitoring(message.id, {
        monitoringStatus,
        monitoringNote: monitoringNote[message.id] ?? message.monitoring_note ?? "",
      });
      await loadMessages();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not update monitoring status.");
    } finally {
      setWorkingId("");
    }
  }

  useEffect(() => {
    loadMessages();
  }, [caseId, viewerRole]);

  return (
    <ParentChildShell
      title="Monitoring Messages"
      subtitle={
        viewerRole === "caseworker"
          ? "Case-scoped child messages explicitly shared with the assigned caseworker."
          : "A monitored parent-child message space with visibility controls and review status."
      }
    >
      {loading ? <EmptyState message="Loading monitored messages..." /> : null}

      {!loading && errorMessage ? <ErrorState message={errorMessage} /> : null}

      {!loading && viewerRole === "parent" ? (
        <ParentChildCard
          title="Send monitored message"
          description="Write a message connected to the child-shared parent-child record. Choose whether the child can see it."
          badge={messageTarget ? "Available" : "Needs child context"}
        >
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a calm, specific message or next step."
            placeholderTextColor="#7A8A80"
            multiline
          />

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Visible to child</Text>
            <Switch value={visibleToChild} onValueChange={setVisibleToChild} />
          </View>

          <ParentChildButton
            label={workingId === "new" ? "Sending..." : "Send Message"}
            onPress={sendMessage}
            disabled={workingId === "new" || !messageTarget}
          />
        </ParentChildCard>
      ) : null}

      {!loading && !errorMessage && messages.length === 0 ? (
        <EmptyState message="No monitored messages are available yet." />
      ) : null}

      {!loading && !errorMessage && messages.map((message) => (
        <ParentChildCard
          key={message.id}
          title={message.sender_role === "child" ? "Child message" : "Parent message"}
          description={message.message_text}
          badge={statusLabels[message.monitoring_status]}
        >
          <Text style={styles.meta}>
            Sent: {new Date(message.created_at).toLocaleString()} |{" "}
            {message.visible_to_child ? "Visible to child" : "Parent record only"}
          </Text>

          {message.monitoring_note ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Monitoring note</Text>
              <Text style={styles.noteText}>{message.monitoring_note}</Text>
            </View>
          ) : null}

          <TextInput
            style={[styles.input, styles.noteInput]}
            value={monitoringNote[message.id] ?? message.monitoring_note ?? ""}
            onChangeText={(text) => setMonitoringNote((current) => ({ ...current, [message.id]: text }))}
            placeholder="Add monitoring note, action taken, or follow-up needed."
            placeholderTextColor="#7A8A80"
            multiline
          />

          <ParentChildActionRow>
            <ParentChildButton
              label="Reviewed"
              onPress={() => updateMonitoringStatus(message, "reviewed")}
              disabled={workingId === message.id}
              variant="secondary"
            />
            <ParentChildButton
              label="Follow Up"
              onPress={() => updateMonitoringStatus(message, "follow_up")}
              disabled={workingId === message.id}
              variant="secondary"
            />
            <ParentChildButton
              label="Close"
              onPress={() => updateMonitoringStatus(message, "closed")}
              disabled={workingId === message.id}
            />
          </ParentChildActionRow>
        </ParentChildCard>
      ))}

      {viewerRole === "parent" ? <BackToParentChildHome /> : null}
    </ParentChildShell>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C4D7C8",
    backgroundColor: "#FFFFFF",
    color: "#20382B",
    padding: 12,
    textAlignVertical: "top",
    marginTop: 12,
  },
  noteInput: {
    minHeight: 72,
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginVertical: 12,
  },
  toggleLabel: {
    color: "#53665A",
    fontWeight: "800",
  },
  meta: {
    color: "#53665A",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  noteBox: {
    backgroundColor: "#F7FAF8",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E2DA",
    marginTop: 12,
    padding: 12,
  },
  noteLabel: {
    color: "#20382B",
    fontWeight: "900",
  },
  noteText: {
    color: "#53665A",
    lineHeight: 20,
    marginTop: 4,
  },
});
