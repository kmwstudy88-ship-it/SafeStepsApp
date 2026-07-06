import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import {
  EmptyState,
  ErrorState,
  ParentChildCard,
  ParentChildMetric,
  ParentChildShell,
} from "../../lib/parentChild/components";
import { getParentChildOverview, type ParentChildOverview } from "../../lib/parentChild/parentChildService";

export default function ParentChildHomeScreen() {
  const [overview, setOverview] = useState<ParentChildOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOverview() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getParentChildOverview();

        if (mounted) {
          setOverview(result);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load parent-child overview.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ParentChildShell
      title="Parent-Child Section"
      subtitle="Review child-shared requests, reflections, and messages without entering the private child space."
    >
      {loading ? <EmptyState message="Loading parent-child overview..." /> : null}

      {!loading && errorMessage ? <ErrorState message={errorMessage} /> : null}

      {!loading && overview ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <ParentChildMetric label="Shared items" value={overview.sharedItemCount} />
          <ParentChildMetric label="Child requests" value={overview.requestCount} />
          <ParentChildMetric label="Still open" value={overview.openRequestCount} tone="alert" />
          <ParentChildMetric label="Messages open" value={overview.openMessageCount} tone="alert" />
        </View>
      ) : null}

      <ParentChildCard
        title="Shared Items"
        description="See feelings, lessons, visit reflections, messages, or tasks the child chose to share."
        badge={overview?.latestSharedItem ? "New activity" : "Shared"}
        href="/parent-child/shared-items"
      >
        {overview?.latestSharedItem ? (
          <Text style={{ color: "#53665A", fontWeight: "800", marginTop: 10 }}>
            Latest: {overview.latestSharedItem.item_title || overview.latestSharedItem.item_type}
          </Text>
        ) : null}
      </ParentChildCard>

      <ParentChildCard
        title="Child Requests"
        description="See game requests, talk requests, help requests, and parent improvement requests the child chose to send."
        badge={overview?.openRequestCount ? `${overview.openRequestCount} open` : "Requests"}
        href="/parent-child/requests"
      >
        {overview?.latestRequest ? (
          <Text style={{ color: "#53665A", fontWeight: "800", marginTop: 10 }}>
            Latest: {overview.latestRequest.request_type}
          </Text>
        ) : null}
      </ParentChildCard>

      <ParentChildCard
        title="Monitoring Messages"
        description="Review monitored messages between parent and child, add notes, and mark follow-up or closure."
        badge={overview?.openMessageCount ? `${overview.openMessageCount} open` : "Messages"}
        href="/parent-child/messages"
      >
        {overview?.latestMessage ? (
          <Text style={{ color: "#53665A", fontWeight: "800", marginTop: 10 }}>
            Latest: {overview.latestMessage.sender_role} message
          </Text>
        ) : null}
      </ParentChildCard>

      <ParentChildCard
        title="What parents cannot see"
        description="Parents cannot see private child feelings, child tasks, child evidence, child assessments, child progress, or child visit reflections unless the child chooses to share them."
        badge="Safety"
      />
    </ParentChildShell>
  );
}
