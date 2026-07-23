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

function isCalendarRequest(request: ChildRequest) {
  const normalized = request.request_type.toLowerCase();
  return (
    normalized.includes("calendar") ||
    normalized.includes("visit") ||
    normalized.includes("activity") ||
    normalized.includes("task") ||
    normalized.includes("game")
  );
}

export default function ParentChildFamilyCalendarScreen() {
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
          setErrorMessage(error instanceof Error ? error.message : "Could not load family calendar requests.");
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

  const calendarRequests = useMemo(() => requests.filter(isCalendarRequest), [requests]);

  return (
    <ParentChildShell
      title="Family Calendar"
      subtitle="Child-shared upcoming visits, activities, family tasks, and future requested games appear here for parent review."
    >
      {loading ? <EmptyState message="Loading child-shared family calendar requests..." /> : null}
      {!loading && errorMessage ? <ErrorState message={errorMessage} /> : null}

      {!loading && !errorMessage && calendarRequests.length === 0 ? (
        <EmptyState message="No child-shared visits, activities, family tasks, or requested games are available yet." />
      ) : null}

      {!loading && !errorMessage && calendarRequests.map((request) => (
        <ParentChildCard
          key={request.id}
          title={request.request_type}
          description={request.message || "The child shared a family calendar item."}
          badge={request.status}
          href="/parent-child/requests"
        >
          <Text style={{ color: "#53665A", marginTop: 10 }}>
            Shared: {new Date(request.created_at).toLocaleString()}
          </Text>
        </ParentChildCard>
      ))}

      <ParentChildCard
        title="Respond or schedule"
        description="Open child requests to mark the item seen, save a parent response, or choose whether the child can see the reply."
        href="/parent-child/requests"
        badge="Requests"
      />

      <BackToParentChildHome />
    </ParentChildShell>
  );
}
