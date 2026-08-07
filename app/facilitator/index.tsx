import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useSensitiveAccess } from "../../components/security/SensitiveRouteBoundary";
import {
  getProgramTitle,
  safeStepsGrowthDimensions,
  safeStepsProgramEngines,
  type ReportSummary,
} from "../../lib/platformData";
import {
  buildReportReadyDocumentAppendix,
} from "../../lib/reportReadyCaseDocuments";
import { globalStyles } from "../../lib/styles";
import {
  loadWorkerCaseReview,
  type WorkerCaseContext,
} from "../../lib/workerCaseReview";

type ReportReadyAppendixItem = ReturnType<typeof buildReportReadyDocumentAppendix>[number];

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
  const access = useSensitiveAccess();
  const caseId = access?.caseId ?? null;
  const [summary, setSummary] = useState<ReportSummary>(emptySummary);
  const [caseContext, setCaseContext] = useState<WorkerCaseContext | null>(null);
  const [reportReadyDocuments, setReportReadyDocuments] = useState<ReportReadyAppendixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!caseId) return;

    let active = true;
    setLoading(true);
    setError("");

    loadWorkerCaseReview(caseId)
      .then((review) => {
        if (!active) return;
        setCaseContext(review.case);
        setSummary(review.parentSummary);
        setReportReadyDocuments(buildReportReadyDocumentAppendix(review.reportReadyDocuments));
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load the assigned SafeSteps case.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [caseId]);

  const completedTasks = summary.tasks.filter((task) => task.status === "completed");
  const openTasks = summary.tasks.filter((task) => task.status !== "completed");
  const draftEvidence = summary.evidence.filter((item) => item.status === "draft");
  const storedEvidence = summary.evidence.filter((item) => item.status === "stored");
  const sharedEvidence = summary.evidence.filter((item) => item.status === "shared");
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

    if (reportReadyDocuments.length === 0) {
      prompts.push("Check whether any reviewed case documents are ready to be included in formal reporting.");
    }

    if (prompts.length === 0) {
      prompts.push("Review the timeline for changes in language, confidence, consistency, and verified evidence.");
    }

    return prompts;
  }, [completedTasks.length, meaningReflections.length, objectiveEvidence.length, openTasks.length, reportReadyDocuments.length, weeklyGrowthNotes.length]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Worker case review</Text>
      <Text style={globalStyles.subtitle}>
        This workspace is restricted to authorised staff with active membership of the selected SafeSteps case.
      </Text>

      {loading ? <ActivityIndicator /> : null}
      {error ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Could not load case review</Text>
          <Text style={globalStyles.cardText}>{error}</Text>
        </View>
      ) : null}

      {caseContext ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Selected case</Text>
          <Text style={globalStyles.cardText}>Case: {caseContext.caseNumber || caseContext.id}</Text>
          <Text style={globalStyles.cardText}>Family: {caseContext.familyLabel || "Not recorded"}</Text>
          <Text style={globalStyles.cardText}>Parent/carer: {caseContext.parentCarerName || summary.profile?.display_name || "Not recorded"}</Text>
          <Text style={globalStyles.cardText}>Case status: {caseContext.status}</Text>
          <Text style={globalStyles.cardText}>Program stream: {caseContext.programStream || "Not recorded"}</Text>
          <Text style={globalStyles.cardText}>Review due: {formatDate(caseContext.reviewDueDate)}</Text>
          <Text style={globalStyles.cardText}>Court date: {formatDate(caseContext.courtDate)}</Text>
        </View>
      ) : null}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Contact progression evidence</Text>
        <Text style={globalStyles.cardText}>
          Log contact-session scores, child comfort, risk flags, and demonstrated skills for caseworker review.
        </Text>
        <Link
          href={{ pathname: "/facilitator/contact-session-log", params: caseId ? { caseId } : {} }}
          style={globalStyles.link}
        >
          Open contact session log
        </Link>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Review priority</Text>
        <View style={globalStyles.inlineRow}>
          <Text style={priority === "High" ? globalStyles.priorityHigh : globalStyles.pill}>{priority}</Text>
          <Text style={globalStyles.pill}>{openTasks.length} open tasks</Text>
          <Text style={globalStyles.pill}>{completedTasks.length} completed tasks</Text>
          <Text style={draftEvidence.length > 0 ? globalStyles.priorityHigh : globalStyles.pill}>
            {draftEvidence.length} draft evidence
          </Text>
          <Text style={globalStyles.pill}>{reportReadyDocuments.length} report-ready documents</Text>
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Completion review</Text>
        <Text style={globalStyles.cardText}>Tasks: {completedTasks.length} complete, {openTasks.length} open</Text>
        <Text style={globalStyles.cardText}>
          Legacy evidence: {draftEvidence.length} draft, {storedEvidence.length} stored, {sharedEvidence.length} shared
        </Text>
        <Text style={globalStyles.cardText}>
          Daily home evidence: {summary.dailyHomeEvidenceHistory.completeDays}/{summary.dailyHomeEvidenceHistory.days.length || 7} days complete
        </Text>
        <Text style={globalStyles.cardText}>Reviewed case documents ready for reporting: {reportReadyDocuments.length}</Text>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Report-ready case documents</Text>
        {reportReadyDocuments.length === 0 ? (
          <Text style={globalStyles.cardText}>No accepted documents are currently selected for report inclusion.</Text>
        ) : (
          reportReadyDocuments.slice(0, 6).map((document) => (
            <View key={document.documentId} style={globalStyles.compactBlock}>
              <Text style={globalStyles.cardText}>{document.title}</Text>
              <Text style={globalStyles.mutedText}>
                {document.fileName || "No current file"}{document.versionNumber ? ` - version ${document.versionNumber}` : ""}
              </Text>
              <Text style={globalStyles.mutedText}>SHA-256: {document.fileSha256 || "Not recorded"}</Text>
            </View>
          ))
        )}
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
          <Text style={globalStyles.cardText}>No participant evidence saved yet.</Text>
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
