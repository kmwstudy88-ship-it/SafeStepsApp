import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { BackToParentChildHome, EmptyState, ErrorState, ParentChildCard, ParentChildShell } from "../../lib/parentChild/components";
import { getParentChildSharedItems, type ChildSharedItem } from "../../lib/parentChild/parentChildService";

export default function ParentChildSharedItemsScreen() {
  const [items, setItems] = useState<ChildSharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getParentChildSharedItems();

        if (mounted) {
          setItems(result);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load shared items.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ParentChildShell
      title="Shared Items"
      subtitle="Only items the child chose to share can appear here."
    >
      {loading ? <EmptyState message="Loading shared items..." /> : null}

      {!loading && errorMessage ? <ErrorState message={errorMessage} /> : null}

      {!loading && !errorMessage && items.length === 0 ? (
        <EmptyState message="No shared child items are available yet." />
      ) : null}

      {!loading && !errorMessage && items.map((item) => (
        <ParentChildCard
          key={item.id}
          title={item.item_title || item.item_type}
          description={item.summary_text || "Shared child item"}
          badge={item.share_audience}
        >
          <Text style={{ marginTop: 10, color: "#53665A", fontWeight: "700" }}>
            Type: {item.item_type}
          </Text>
          <Text style={{ marginTop: 4, color: "#53665A" }}>
            Shared: {new Date(item.created_at).toLocaleString()}
          </Text>
        </ParentChildCard>
      ))}

      <BackToParentChildHome />
    </ParentChildShell>
  );
}