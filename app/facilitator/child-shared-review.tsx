import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useSensitiveAccess } from "../../components/security/SensitiveRouteBoundary";
import {
  getParentChildMessages,
  getParentChildOverview,
  getParentChildRequests,
  getParentChildSharedItems,
  type ChildRequest,
  type ChildSharedItem,
  type ParentChildMessage,
  type ParentChildOverview,
} from "../../lib/parentChild/parentChildService";
import { globalStyles } from "../../lib/styles";

const emptyOverview: ParentChildOverview = {
  sharedItemCount: 0,
  requestCount: 0,
  openRequestCount: 0,
  messageCount: 0,
  openMessageCount: 0,
  latestSharedItem: null,
  latestRequest: null,
  latestMessage: null,
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(value: string | null | undefined) {
  return value ? value.replace(/_/g, " ") : "Not recorded";
}

export default function ChildSharedReviewScreen() {
  const access = useSensitiveAccess();
  const caseId = access?.caseId ?? null;
  const [overview, setOverview] = useState<ParentChildOverview>(emptyOverview);
  const [items, setItems] = useState<ChildSharedItem[]>([]);
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [messages, setMessages] = useState<ParentChildMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([
      getParentChildOverview("caseworker"),
      getParentChildSharedItems("caseworker"),
      getParentChildRequests("caseworker"),
      getParentChildMessages("caseworker"),
    ])
      .then(([overviewResult, itemResult, requestResult, messageResult]) => {
        if (!active) return;
        setOverview(overviewResult);
        setItems(itemResult);
        setRequests(requestResult);
        setMessages(messageResult);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load child-shared review records.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const riskPrompts = useMemo(() => {
    const prompts = [];

    if (overview.openRequestCount > 0) {
      prompts.push("Review open child requests and record whether a safe response or case action is needed.");
    }

    if (overview.openMessageCount > 0) {
      prompts.push("Review open monitored messages for follow-up, closure, or safeguarding escalation.");
    }

    if (overview.sharedItemCount === 0) {
      prompts.push("No child-shared material is available. Do not infer child views from parent evidence alone.");
    }

    if (prompts.length === 0) {
      prompts.push("Child-shared records are available for routine review; keep private child-only material out of parent-facing reporting.");
    }

    return prompts;
  }, [overview.openMessageCount, overview.openRequestCount, overview.sharedItemCount]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Child shared review</Text>
      <Text style={globalStyles.subtitle}>
        Staff-only review of child records explicitly shared to the assigned caseworker. Private child-only records are not loaded here.
      </Text>

      {loading ? <ActivityIndicator /> : null}
      {error ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Could not load child-shared records</Text>
          <Text style={globalStyles.cardText}>{error}</Text>
        </View>
      ) : null}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Caseworker review scope</Text>
        <Text style={globalStyles.cardText}>Case: {caseId || "Selected case from protected route context"}</Text>
        <Text style={globalStyles.cardText}>Read mode: caseworker recipient only</Text>
        <Text style={globalStyles.cardText}>Excluded: private child records and parent-only shares</Text>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Child-shared summary</Text>
        <View style={globalStyles.inlineRow}>
          <Text style={globalStyles.pill}>{overview.sharedItemCount} shared items</Text>
          <Text style={globalStyles.pill}>{overview.requestCount} requests</Text>
          <Text style={overview.openRequestCount > 0 ? globalStyles.priorityHigh : globalStyles.pill}>
            {overview.openRequestCount} open requests
          </Text>
          <Text style={overview.openMessageCount > 0 ? globalStyles.priorityHigh : globalStyles.pill}>
            {overview.openMessageCount} open messages
          </Text>
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Review prompts</Text>
        {riskPrompts.map((prompt) => (
          <Text key={prompt} style={globalStyles.cardText}>{prompt}</Text>
        ))}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Shared child items</Text>
        {items.length === 0 ? (
          <Text style={globalStyles.cardText}>No child-shared items are addressed to this caseworker.</Text>
        ) : (
          items.slice(0, 6).map((item) => (
            <View key={item.id} style={globalStyles.compactBlock}>
              <Text style={globalStyles.cardText}>{item.item_title || item.item_type}</Text>
              <Text style={globalStyles.mutedText}>{item.summary_text || "No summary recorded"}</Text>
              <Text style={globalStyles.mutedText}>Audience: {item.share_audience} · Shared: {formatDate(item.created_at)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Child requests</Text>
        {requests.length === 0 ? (
          <Text style={globalStyles.cardText}>No child requests are addressed to this caseworker.</Text>
        ) : (
          requests.slice(0, 6).map((request) => (
            <View key={request.id} style={globalStyles.compactBlock}>
              <Text style={globalStyles.cardText}>{request.request_type}</Text>
              <Text style={globalStyles.mutedText}>{request.message || "No message recorded"}</Text>
              <Text style={globalStyles.mutedText}>Status: {statusLabel(request.status)} · Created: {formatDate(request.created_at)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Monitored child messages</Text>
        {messages.length === 0 ? (
          <Text style={globalStyles.cardText}>No monitored messages are addressed to this caseworker.</Text>
        ) : (
          messages.slice(0, 6).map((message) => (
            <View key={message.id} style={globalStyles.compactBlock}>
              <Text style={globalStyles.cardText}>{message.sender_role}: {message.message_text}</Text>
              <Text style={globalStyles.mutedText}>Status: {statusLabel(message.monitoring_status)} · Created: {formatDate(message.created_at)}</Text>
              {message.monitoring_note ? <Text style={globalStyles.mutedText}>Note: {message.monitoring_note}</Text> : null}
            </View>
          ))
        )}
        <Link
          href={{ pathname: "/parent-child/messages", params: caseId ? { caseId } : {} }}
          style={globalStyles.link}
        >
          Open monitored-message workflow
        </Link>
      </View>

      <AppBottomNav />
    </ScrollView>
  );
}
