import React, { useEffect, useMemo, useState } from "react";
import { Text } from "react-native";

import {
  BackToParentChildHome,
  EmptyState,
  ErrorState,
  ParentChildCard,
  ParentChildShell,
} from "../../lib/parentChild/components";
import { getParentChildRequests, type ChildRequest } from "../../lib/parentChild/parentChildService";

function isGameRequest(request: ChildRequest) {
  return request.request_type.toLowerCase().includes("game");
}

export default function ParentChildGamesScreen() {
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadRequests() {
      try {
        setLoading(true);
        setErrorMessage("");
        const result = await getParentChildRequests();
        if (mounted) {
          setRequests(result);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load game requests.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      mounted = false;
    };
  }, []);

  const gameRequests = useMemo(() => requests.filter(isGameRequest), [requests]);

  return (
    <ParentChildShell
      title="Parent-Child Games"
      subtitle="Game requests appear here only when the child shares them with the parent view."
    >
      {loading ? <EmptyState message="Loading child-shared game requests..." /> : null}
      {!loading && errorMessage ? <ErrorState message={errorMessage} /> : null}

      {!loading && !errorMessage && gameRequests.length === 0 ? (
        <EmptyState message="No child-shared game requests are available yet." />
      ) : null}

      {!loading && !errorMessage && gameRequests.map((request) => (
        <ParentChildCard
          key={request.id}
          title={request.request_type}
          description={request.message || "The child asked for a parent-child game or activity."}
          badge={request.status}
          href="/parent-child/requests"
        >
          <Text style={{ color: "#53665A", marginTop: 10 }}>
            Shared: {new Date(request.created_at).toLocaleString()}
          </Text>
        </ParentChildCard>
      ))}

      <ParentChildCard
        title="Monitored follow-up"
        description="Use monitored messages or child request responses to answer game requests. Child visibility must be selected deliberately."
        href="/parent-child/messages"
        badge="Message"
      />

      <BackToParentChildHome />
    </ParentChildShell>
  );
}
