import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { BackToParentChildHome, EmptyState, ErrorState, ParentChildCard, ParentChildShell } from "../../lib/parentChild/components";
import { getParentChildRequests, markChildRequestStatus, type ChildRequest } from "../../lib/parentChild/parentChildService";

export default function ParentChildRequestsScreen() {
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setErrorMessage("");

      const result = await getParentChildRequests();
      setRequests(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load child requests.");
    } finally {
      setLoading(false);
    }
  }

  async function markSeen(requestId: string) {
    try {
      setWorkingId(requestId);
      setErrorMessage("");

      await markChildRequestStatus(requestId, "seen");
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

      {!loading && !errorMessage && requests.map((request) => (
        <ParentChildCard
          key={request.id}
          title={request.request_type}
          description={request.message || "No message added."}
          badge={request.status}
        >
          <Text style={styles.meta}>
            Sent: {new Date(request.created_at).toLocaleString()}
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => markSeen(request.id)}
            disabled={workingId === request.id}
          >
            <Text style={styles.buttonText}>
              {workingId === request.id ? "Updating..." : "Mark as Seen"}
            </Text>
          </Pressable>
        </ParentChildCard>
      ))}

      <BackToParentChildHome />
    </ParentChildShell>
  );
}

const styles = StyleSheet.create({
  meta: {
    marginTop: 10,
    color: "#53665A",
  },
  button: {
    backgroundColor: "#20382B",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
  },
});