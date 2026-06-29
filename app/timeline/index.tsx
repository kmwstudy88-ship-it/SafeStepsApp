import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Redirect } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import { getProgramTitle, getReportSummary, type ReportSummary } from "../../lib/platformData";
import { globalStyles } from "../../lib/styles";

type TimelineItem = {
  id: string;
  at: string;
  title: string;
  detail: string;
  category: "Program" | "Reflection" | "Lesson" | "Check-in" | "Evidence" | "Task" | "Activity";
};

const emptySummary: ReportSummary = {
  tasks: [],
  evidence: [],
  reflections: [],
  dailyHomeEvidence: [],
  dailyHomeEvidenceHistory: { days: [], completeDays: 0, missingDays: 0 },
  enrollments: [],
  events: [],
  profile: null,
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function eventCategory(eventType: string): TimelineItem["category"] {
  if (eventType.includes("meaning_reflections")) return "Reflection";
  if (eventType.includes("lesson")) return "Lesson";
  if (eventType.includes("check_in")) return "Check-in";
  if (eventType.includes("program")) return "Program";
  if (eventType.includes("task")) return "Task";
  if (eventType.includes("evidence")) return "Evidence";
  return "Activity";
}

function buildTimeline(summary: ReportSummary): TimelineItem[] {
  const enrollmentItems: TimelineItem[] = summary.enrollments.map((item) => ({
    id: `enrollment-${item.id}`,
    at: item.started_at,
    title: `${getProgramTitle(item.program_id)} started`,
    detail: `Status: ${item.status}`,
    category: "Program",
  }));

  const eventItems: TimelineItem[] = summary.events.map((event) => ({
    id: `event-${event.id}`,
    at: event.created_at,
    title: event.label,
    detail: event.event_type.replace(/_/g, " "),
    category: eventCategory(event.event_type),
  }));

  const reflectionItems: TimelineItem[] = summary.reflections.map((item) => ({
    id: `reflection-${item.id}`,
    at: item.created_at,
    title: `${item.program_title} - ${item.reflection_type.replace(/_/g, " ")}`,
    detail: item.response || "Not answered yet",
    category: "Reflection",
  }));

  const evidenceItems: TimelineItem[] = summary.evidence.map((item) => ({
    id: `evidence-${item.id}`,
    at: item.created_at,
    title: item.title,
    detail: item.file_path ? "Evidence saved with media" : "Evidence note saved",
    category: "Evidence",
  }));

  const taskItems: TimelineItem[] = summary.tasks
    .filter((task) => task.completed_at)
    .map((task) => ({
      id: `task-${task.id}`,
      at: task.completed_at ?? "",
      title: task.title,
      detail: `Task completed: ${task.category}`,
      category: "Task",
    }));

  return [...enrollmentItems, ...eventItems, ...reflectionItems, ...evidenceItems, ...taskItems].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

export default function GrowthTimelineScreen() {
  const { initializing, user } = useAuth();
  const userId = user?.id;
  const [summary, setSummary] = useState<ReportSummary>(emptySummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    getReportSummary(userId).then((nextSummary) => {
      if (!active) return;
      setSummary(nextSummary);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const timeline = useMemo(() => buildTimeline(summary), [summary]);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Growth timeline</Text>
      <Text style={globalStyles.subtitle}>
        A chronological record of program starts, reflections, lessons, check-ins, tasks, and evidence. This is the Evidence of Change view.
      </Text>

      {loading ? <ActivityIndicator /> : null}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Timeline summary</Text>
        <Text style={globalStyles.cardText}>{timeline.length} recorded change point{timeline.length === 1 ? "" : "s"}</Text>
        <Text style={globalStyles.cardText}>
          Reflections: {timeline.filter((item) => item.category === "Reflection").length}
        </Text>
        <Text style={globalStyles.cardText}>
          Evidence: {timeline.filter((item) => item.category === "Evidence").length}
        </Text>
        <Text style={globalStyles.cardText}>
          Completed tasks: {timeline.filter((item) => item.category === "Task").length}
        </Text>
      </View>

      {timeline.length === 0 ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>No timeline records yet</Text>
          <Text style={globalStyles.cardText}>
            Start a program week, save meaning reflections, complete lessons, or add evidence to begin building the timeline.
          </Text>
        </View>
      ) : (
        timeline.map((item) => (
          <View key={item.id} style={globalStyles.card}>
            <View style={globalStyles.inlineRow}>
              <Text style={globalStyles.pill}>{item.category}</Text>
              <Text style={globalStyles.mutedText}>{formatDateTime(item.at)}</Text>
            </View>
            <Text style={globalStyles.cardTitle}>{item.title}</Text>
            <Text style={globalStyles.cardText}>{item.detail}</Text>
          </View>
        ))
      )}

      <AppBottomNav />
    </ScrollView>
  );
}
