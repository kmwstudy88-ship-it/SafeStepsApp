import React, { useEffect, useState } from "react";
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
  createChildRequestResponse,
  getChildRequestResponses,
  getParentChildRequests,
  markChildRequestStatus,
  type ChildRequest,
  type ChildRequestResponse,
} from "../../lib/parentChild/parentChildService";

export default function ParentChildRequestsScreen() {
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [responsesByRequest, setResponsesByRequest] = useState<Record<string, ChildRequestResponse[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [visibleToChild, setVisibleToChild] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setErrorMessage("");

      const result = await getParentChildRequests();
      const responses = await getChildRequestResponses(result.map((request) => request.id));
      const groupedResponses = responses.reduce<Record<string, ChildRequestResponse[]>>((groups, response) => {
        groups[response.request_id] = [...(groups[response.request_id] ?? []), response];
        return groups;
      }, {});

      setRequests(result);
      setResponsesByRequest(groupedResponses);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load child requests.");
    } finally {
      setLoading(false);
    }
  }

  async function sendResponse(request: ChildRequest) {
    const draft = drafts[request.id]?.trim();

    if (!draft) {
      setErrorMessage("Write a response note before saving.");
      return;
    }

    try {
      setWorkingId(request.id);
      setErrorMessage("");

      await createChildRequestResponse({
        request,
        responseText: draft,
        visibleToChild: visibleToChild[request.id] ?? false,
      });
      await markChildRequestStatus(request.id, "responded");
      setDrafts((current) => ({ ...current, [request.id]: "" }));
      await loadRequests();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save response.");
    } finally {
      setWorkingId("");
    }
  }

  async function updateStatus(requestId: string, status: "seen" | "responded" | "completed") {
    try {
      setWorkingId(requestId);
      setErrorMessage("");

      await markChildRequestStatus(requestId, status);
      await loadRequests();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not update request.");
    } finally {
      setWorkingId("");
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <ParentChildShell
      title="Child Requests"
      subtitle="Requests the child chose to share with the parent can appear here."
    >
      {loading ? <EmptyState message="Loading child requests..." /> : null}

      {!loading && errorMessage ? <ErrorState message={errorMessage} /> : null}

      {!loading && !errorMessage && requests.length === 0 ? (
        <EmptyState message="No child requests are available yet." />
      ) : null}

      {!loading && !errorMessage && requests.map((request) => {
        const responses = responsesByRequest[request.id] ?? [];

        return (
          <ParentChildCard
            key={request.id}
            title={request.request_type}
            description={request.message || "No message added."}
            badge={request.status}
          >
            <Text style={styles.meta}>
              Sent: {new Date(request.created_at).toLocaleString()}
            </Text>

            {responses.length > 0 ? (
              <View style={styles.responseList}>
                <Text style={styles.responseHeading}>Response history</Text>
                {responses.map((response) => (
                  <View key={response.id} style={styles.responseItem}>
                    <Text style={styles.responseText}>{response.response_text}</Text>
                    <Text style={styles.responseMeta}>
                      {response.visible_to_child ? "Visible to child" : "Parent record only"} -{" "}
                      {new Date(response.created_at).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.composer}>
              <Text style={styles.responseHeading}>Parent response</Text>
              <TextInput
                style={styles.input}
                value={drafts[request.id] ?? ""}
                onChangeText={(text) =>
                  setDrafts((current) => ({ ...current, [request.id]: text }))
                }
                placeholder="Write a calm note, action taken, or next step."
                placeholderTextColor="#7A8A80"
                multiline
              />

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Visible to child</Text>
                <Switch
                  value={visibleToChild[request.id] ?? false}
                  onValueChange={(value) =>
                    setVisibleToChild((current) => ({ ...current, [request.id]: value }))
                  }
                />
              </View>
            </View>

            <ParentChildActionRow>
              <ParentChildButton
                label={workingId === request.id ? "Saving..." : "Save Response"}
                onPress={() => sendResponse(request)}
                disabled={workingId === request.id}
              />
              <ParentChildButton
                label="Seen"
                onPress={() => updateStatus(request.id, "seen")}
                disabled={workingId === request.id || request.status === "seen"}
                variant="secondary"
              />
              <ParentChildButton
                label="Completed"
                onPress={() => updateStatus(request.id, "completed")}
                disabled={workingId === request.id || request.status === "completed"}
                variant="secondary"
              />
            </ParentChildActionRow>
          </ParentChildCard>
        );
      })}

      <BackToParentChildHome />
    </ParentChildShell>
  );
}

const styles = StyleSheet.create({
  meta: {
    marginTop: 10,
    color: "#53665A",
  },
  responseList: {
    marginTop: 14,
    gap: 8,
  },
  responseHeading: {
    color: "#20382B",
    fontSize: 14,
    fontWeight: "900",
  },
  responseItem: {
    backgroundColor: "#F7FAF8",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E2DA",
    padding: 12,
  },
  responseText: {
    color: "#20382B",
    lineHeight: 20,
    fontWeight: "700",
  },
  responseMeta: {
    color: "#53665A",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  composer: {
    marginTop: 14,
    gap: 10,
  },
  input: {
    minHeight: 88,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C4D7C8",
    backgroundColor: "#FFFFFF",
    color: "#20382B",
    padding: 12,
    textAlignVertical: "top",
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleLabel: {
    color: "#53665A",
    fontWeight: "800",
  },
});
