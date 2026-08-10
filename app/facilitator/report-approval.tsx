import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useSensitiveAccess } from "../../components/security/SensitiveRouteBoundary";
import {
  currentCaseReportVersion,
  currentReportPdf,
  decideCaseReportVersion,
  listCaseReports,
  listReportApprovalEvents,
  listReportReleaseEvents,
  releaseCaseReportVersion,
  type CaseReport,
  type ReportApprovalEvent,
  type ReportReleaseEvent,
  type ReportReviewDecision,
} from "../../lib/reportApproval";
import { globalStyles } from "../../lib/styles";

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(value));
}

export default function ReportApprovalScreen() {
  const access = useSensitiveAccess();
  const caseId = access?.caseId ?? null;
  const [reports, setReports] = useState<CaseReport[]>([]);
  const [approvals, setApprovals] = useState<ReportApprovalEvent[]>([]);
  const [releases, setReleases] = useState<ReportReleaseEvent[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [workingId, setWorkingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!caseId) {
      setError("Select an authorised case before reviewing reports.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const reportRows = await listCaseReports(caseId);
      const [approvalRows, releaseRows] = await Promise.all([
        listReportApprovalEvents(reportRows.map((report) => report.id)),
        listReportReleaseEvents(caseId),
      ]);
      setReports(reportRows);
      setApprovals(approvalRows);
      setReleases(releaseRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load report governance.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => { void load(); }, [load]);

  async function decide(report: CaseReport, decision: ReportReviewDecision) {
    if (!caseId) return;
    const version = currentCaseReportVersion(report);
    if (!version) return setError("The current report version is missing.");
    try {
      setWorkingId(report.id);
      setError("");
      await decideCaseReportVersion({
        caseId,
        reportId: report.id,
        reportVersionId: version.id,
        decision,
        decisionReason: notes[report.id] ?? "",
      });
      setNotes((current) => ({ ...current, [report.id]: "" }));
      await load();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "The decision could not be recorded.");
    } finally {
      setWorkingId("");
    }
  }

  async function release(report: CaseReport) {
    if (!caseId) return;
    const version = currentCaseReportVersion(report);
    const pdf = currentReportPdf(version);
    if (!version || !pdf) return setError("A hashed PDF for the approved current version is required.");
    try {
      setWorkingId(report.id);
      setError("");
      await releaseCaseReportVersion({
        caseId,
        reportId: report.id,
        reportVersionId: version.id,
        renderedFileId: pdf.id,
        releaseNotes: notes[report.id] ?? "",
      });
      await load();
    } catch (releaseError) {
      setError(releaseError instanceof Error ? releaseError.message : "The approved report could not be released.");
    } finally {
      setWorkingId("");
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Report approval and release</Text>
      <Text style={globalStyles.subtitle}>
        Independent human sign-off is mandatory. Released versions retain source and PDF hashes, verification code,
        watermark, reviewer decision and immutable release history.
      </Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Safety boundary</Text>
        <Text style={globalStyles.cardText}>Case: {caseId ?? "No case selected"}</Text>
        <Text style={globalStyles.cardText}>
          Approval confirms review of this version and its stated limitations. It does not automatically declare
          parenting capacity, resolved risk, a court outcome, or program success.
        </Text>
      </View>

      {loading ? <ActivityIndicator /> : null}
      {error ? <View style={globalStyles.card}><Text selectable style={styles.error}>{error}</Text></View> : null}

      {!loading && reports.length === 0 ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>No linked reports</Text>
          <Text style={globalStyles.cardText}>No report is currently linked to this reunification case.</Text>
        </View>
      ) : null}

      {reports.map((report) => {
        const version = currentCaseReportVersion(report);
        const pdf = currentReportPdf(version);
        const working = workingId === report.id;
        return (
          <View key={report.id} style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>{report.report_reference}</Text>
            <Text style={globalStyles.cardText}>{report.report_type.replace(/_/g, " ")} · {report.audience_type}</Text>
            <Text style={globalStyles.cardText}>Status: {report.status.replace(/_/g, " ")}</Text>
            <Text style={globalStyles.cardText}>Current version: {version ? `v${version.version_number}` : "Missing"}</Text>
            <Text selectable style={globalStyles.mutedText}>Snapshot SHA-256: {version?.content_hash || "Missing"}</Text>
            <Text selectable style={globalStyles.mutedText}>PDF SHA-256: {pdf?.file_hash_sha256 || "Not rendered"}</Text>
            <TextInput
              value={notes[report.id] ?? ""}
              onChangeText={(value) => setNotes((current) => ({ ...current, [report.id]: value }))}
              placeholder="Record source checks, uncertainty, limitations, corrections or release notes."
              placeholderTextColor="#718078"
              multiline
              style={styles.input}
            />
            <View style={styles.actions}>
              <Action label={working ? "Saving…" : "Approve"} disabled={working || !version} onPress={() => decide(report, "approved")} />
              <Action label="Return for correction" disabled={working || !version} secondary onPress={() => decide(report, "changes_requested")} />
              <Action label="Reject" disabled={working || !version} danger onPress={() => decide(report, "rejected")} />
              <Action label="Release approved PDF" disabled={working || report.status !== "approved" || !pdf} onPress={() => release(report)} />
            </View>
          </View>
        );
      })}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Approval history</Text>
        {approvals.length ? approvals.slice(0, 20).map((event) => (
          <View key={event.id} style={globalStyles.compactBlock}>
            <Text style={globalStyles.cardText}>v{event.report_version} — {event.decision.replace(/_/g, " ")}</Text>
            <Text style={globalStyles.mutedText}>{formatDate(event.approved_at ?? event.created_at)}</Text>
            {event.decision_reason ? <Text style={globalStyles.mutedText}>{event.decision_reason}</Text> : null}
          </View>
        )) : <Text style={globalStyles.cardText}>No approval decisions recorded.</Text>}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Immutable release history</Text>
        {releases.length ? releases.slice(0, 20).map((event) => (
          <View key={event.id} style={globalStyles.compactBlock}>
            <Text style={globalStyles.cardText}>v{event.report_version} — {event.verification_code}</Text>
            <Text selectable style={globalStyles.mutedText}>{event.watermark_text}</Text>
            <Text style={globalStyles.mutedText}>{formatDate(event.released_at)}</Text>
          </View>
        )) : <Text style={globalStyles.cardText}>No approved report versions released.</Text>}
      </View>

      <AppBottomNav />
    </ScrollView>
  );
}

function Action({ label, disabled, onPress, secondary = false, danger = false }: {
  label: string; disabled: boolean; onPress: () => void; secondary?: boolean; danger?: boolean;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[
      styles.button, secondary && styles.secondary, danger && styles.danger, disabled && styles.disabled,
    ]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  error: { color: "#B42318", lineHeight: 20 },
  input: {
    minHeight: 96, borderRadius: 10, borderWidth: 1, borderColor: "#C7D7CF",
    backgroundColor: "#FFFFFF", color: "#20382B", padding: 12, textAlignVertical: "top",
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: { borderRadius: 10, backgroundColor: "#2F6B50", paddingHorizontal: 13, paddingVertical: 10 },
  secondary: { backgroundColor: "#8A641D" },
  danger: { backgroundColor: "#A33A32" },
  disabled: { opacity: 0.5 },
  buttonText: { color: "#FFFFFF", fontWeight: "900" },
});
