import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Redirect } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import {
  getProgramTitle,
  getReportSummary,
  safeStepsGrowthDimensions,
  safeStepsProgramEngines,
  type ReportSummary,
} from "../../lib/platformData";
import { globalStyles } from "../../lib/styles";

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

function formatDate(value: string | null) {
  if (!value) return "Not recorded";

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function reviewPriority(summary: ReportSummary) {
  const incompleteTasks = summary.tasks.filter((task) => task.status !== "completed").length;
  const reflectionCount = summary.reflections.length;
  const hasRecentCheckIn = summary.events.some((event) => event.event_type === "daily_check_in");

  if (incompleteTasks >= 5 || !hasRecentCheckIn) return "High";
  if (reflectionCount === 0 || summary.evidence.length === 0) return "Medium";
  return "Routine";
}

export default function FacilitatorWorkspaceScreen() {
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

  const completedTasks = summary.tasks.filter((task) => task.status === "completed");
  const openTasks = summary.tasks.filter((task) => task.status !== "completed");
  const meaningReflections = summary.reflections.filter((item) => item.reflection_type.endsWith("_meaning"));
  const weeklyGrowthNotes = summary.reflections.filter((item) =>
    ["weekly_family_win", "toolbox_skill", "child_future_letter"].includes(item.reflection_type),
  );
  const objectiveEvidence = summary.evidence;
  const priority = reviewPriority(summary);

  const followUps = useMemo(() => {
    const prompts = [];

    if (meaningReflections.length === 0) {
      prompts.push("Ask the parent what the current topic means to them before focusing on completion.");
    }

    if (weeklyGrowthNotes.length === 0) {
      prompts.push("Invite the parent to identify one family win and one skill for My Toolbox.");
    }

    if (objectiveEvidence.length === 0) {
      prompts.push("Clarify one practical evidence item that would fairly show action taken this week.");
    }

    if (openTasks.length > completedTasks.length) {
      prompts.push("Review open tasks and agree on the next smallest achievable step.");
    }

    if (prompts.length === 0) {
      prompts.push("Review the timeline for changes in language, confidence, and consistency.");
    }

    return prompts;
  }, [completedTasks.length, meaningReflections.length, objectiveEvidence.length, openTasks.length, weeklyGrowthNotes.length]);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Facilitator workspace</Text>
      <Text style={globalStyles.subtitle}>
        A review surface for progress, reflections, evidence, and next-session prompts. Private facilitator notes should be added after role-based storage is available.
      </Text>

      {loading ? <ActivityIndicator /> : null}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Participant overview</Text>
        <Text style={globalStyles.cardText}>Name: {summary.profile?.display_name || user.email || "Signed-in participant"}</Text>
        <Text style={globalStyles.cardText}>Role: {summary.profile?.role ?? "parent"}</Text>
        <Text style={globalStyles.cardText}>Goal: {summary.profile?.story_goal || "Not recorded yet"}</Text>
        <Text style={globalStyles.cardText}>Strengths: {summary.profile?.strengths || "Not recorded yet"}</Text>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Review priority</Text>
        <View style={globalStyles.inlineRow}>
          <Text style={priority === "High" ? globalStyles.priorityHigh : globalStyles.pill}>{priority}</Text>
          <Text style={globalStyles.pill}>{openTasks.length} open tasks</Text>
          <Text style={globalStyles.pill}>{objectiveEvidence.length} objective evidence</Text>
          <Text style={globalStyles.pill}>{meaningReflections.length + weeklyGrowthNotes.length} reflection records</Text>
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Platform review model</Text>
        <Text style={globalStyles.mutedText}>Engines in use</Text>
        <View style={globalStyles.inlineRow}>
          {safeStepsProgramEngines.map((engine) => (
            <Text key={engine} style={globalStyles.pill}>{engine}</Text>
          ))}
        </View>
        <Text style={globalStyles.mutedText}>Growth dimensions</Text>
        <View style={globalStyles.inlineRow}>
          {safeStepsGrowthDimensions.map((dimension) => (
            <Text key={dimension} style={globalStyles.pill}>{dimension}</Text>
          ))}
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Programs</Text>
        {summary.enrollments.length === 0 ? (
          <Text style={globalStyles.cardText}>No active program selected yet.</Text>
        ) : (
          summary.enrollments.map((item) => (
            <Text key={item.id} style={globalStyles.cardText}>
              {getProgramTitle(item.program_id)} - {item.status} since {formatDate(item.started_at)}
            </Text>
          ))
        )}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Reflection review queue</Text>
        {[...meaningReflections, ...weeklyGrowthNotes].length === 0 ? (
          <Text style={globalStyles.cardText}>No reflection records saved yet.</Text>
        ) : (
          [...meaningReflections, ...weeklyGrowthNotes].slice(0, 6).map((item) => (
            <View key={item.id} style={globalStyles.compactBlock}>
              <Text style={globalStyles.cardText}>{item.program_title} - {item.reflection_type.replace(/_/g, " ")}</Text>
              <Text style={globalStyles.mutedText}>{formatDate(item.created_at)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Evidence review queue</Text>
        {objectiveEvidence.length === 0 ? (
          <Text style={globalStyles.cardText}>No objective evidence saved yet.</Text>
        ) : (
          objectiveEvidence.slice(0, 6).map((item) => (
            <View key={item.id} style={globalStyles.compactBlock}>
              <Text style={globalStyles.cardText}>{item.title}</Text>
              <Text style={globalStyles.mutedText}>
                {formatDate(item.created_at)}{item.file_path ? " - media attached" : ""}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Suggested next conversation</Text>
        {followUps.map((prompt) => (
          <Text key={prompt} style={globalStyles.cardText}>{prompt}</Text>
        ))}
      </View>

      <AppBottomNav />
    </ScrollView>
  );
}
