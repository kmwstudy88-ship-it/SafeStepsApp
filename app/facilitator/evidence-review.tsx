import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useSensitiveAccess } from "../../components/security/SensitiveRouteBoundary";
import {
  currentEvidenceReviewVersion,
  listEvidenceReviewDocuments,
  listEvidenceReviewEvents,
  reviewEvidenceDocument,
  type EvidenceReviewDecision,
  type EvidenceReviewDocument,
  type EvidenceReviewEvent,
} from "../../lib/evidenceReview";
import { globalStyles } from "../../lib/styles";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function EvidenceReviewScreen() {
  const access = useSensitiveAccess();
  const caseId = access?.caseId ?? null;
  const [documents, setDocuments] = useState<EvidenceReviewDocument[]>([]);
  const [events, setEvents] = useState<EvidenceReviewEvent[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [workingId, setWorkingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReview = useCallback(async () => {
    if (!caseId) {
      setDocuments([]);
      setEvents([]);
      setError("Select an authorised case before reviewing evidence.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [documentResult, eventResult] = await Promise.all([
        listEvidenceReviewDocuments(caseId),
        listEvidenceReviewEvents(caseId),
      ]);
      setDocuments(documentResult);
      setEvents(eventResult);
    } catch (loadError) {
      setDocuments([]);
      setEvents([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load the evidence review queue.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void loadReview();
  }, [loadReview]);

  async function submitDecision(
    document: EvidenceReviewDocument,
    decision: EvidenceReviewDecision,
    includeInReport: boolean,
  ) {
    if (!caseId) return;
    const version = currentEvidenceReviewVersion(document);

    if (!version) {
      setError("This document does not have a current file version to review.");
      return;
    }

    try {
      setWorkingId(document.id);
      setError("");
      await reviewEvidenceDocument({
        caseId,
        documentId: document.id,
        documentVersionId: version.id,
        decision,
        includeInReport,
        reviewNotes: notes[document.id] ?? "",
      });
      setNotes((current) => ({ ...current, [document.id]: "" }));
      await loadReview();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "The evidence decision could not be recorded.");
    } finally {
      setWorkingId("");
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Evidence review</Text>
      <Text style={globalStyles.subtitle}>
        Human review of the current file version for the selected case. A decision records the reviewer, time,
        notes, file version and report-selection choice in append-only history.
      </Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Review boundary</Text>
        <Text style={globalStyles.cardText}>Case: {caseId ?? "No case selected"}</Text>
        <Text style={globalStyles.cardText}>
          Accepting evidence confirms only that this file version is suitable for the stated purpose. It does not
          declare parenting capacity, resolve risk, determine a court outcome, or prove program success.
        </Text>
      </View>

      {loading ? <ActivityIndicator /> : null}
      {error ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Evidence review needs attention</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && documents.length === 0 ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>No evidence awaiting review</Text>
          <Text style={globalStyles.cardText}>This selected case does not currently have document records.</Text>
        </View>
      ) : null}

      {!loading && documents.map((document) => {
        const version = currentEvidenceReviewVersion(document);
        const isWorking = workingId === document.id;

        return (
          <View key={document.id} style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>{document.title}</Text>
            <Text style={globalStyles.cardText}>Type: {document.document_type.replace(/_/g, " ")}</Text>
            <Text style={globalStyles.cardText}>Document status: {document.status.replace(/_/g, " ")}</Text>
            <Text style={globalStyles.cardText}>
              Current version: {version ? `v${version.version_number} — ${version.file_name}` : "No current version"}
            </Text>
            <Text selectable style={globalStyles.mutedText}>
              SHA-256: {version?.file_sha256 || "Not recorded"}
            </Text>
            <Text style={globalStyles.mutedText}>
              Report selection: {document.court_report_include ? "Selected" : "Not selected"}
            </Text>

            <TextInput
              value={notes[document.id] ?? ""}
              onChangeText={(value) => setNotes((current) => ({ ...current, [document.id]: value }))}
              placeholder="Record evidence quality, limitations, source concerns, correction needed, or reason for exclusion."
              placeholderTextColor="#718078"
              multiline
              style={styles.notesInput}
            />

            <View style={styles.actions}>
              <ReviewButton
                label={isWorking ? "Saving..." : "Accept"}
                disabled={isWorking || !version}
                onPress={() => submitDecision(document, "accepted", false)}
              />
              <ReviewButton
                label="Accept + report"
                disabled={isWorking || !version}
                onPress={() => submitDecision(document, "accepted", true)}
              />
              <ReviewButton
                label="Return for update"
                disabled={isWorking || !version}
                onPress={() => submitDecision(document, "needs_update", false)}
                secondary
              />
              <ReviewButton
                label="Exclude"
                disabled={isWorking || !version}
                onPress={() => submitDecision(document, "excluded", false)}
                danger
              />
            </View>
          </View>
        );
      })}

      {!loading ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Immutable review history</Text>
          {events.length === 0 ? (
            <Text style={globalStyles.cardText}>No worker evidence decisions have been recorded for this case.</Text>
          ) : (
            events.slice(0, 20).map((event) => (
              <View key={event.id} style={globalStyles.compactBlock}>
                <Text style={globalStyles.cardText}>
                  {event.decision.replace(/_/g, " ")}
                  {event.include_in_report ? " — selected for report" : ""}
                </Text>
                <Text style={globalStyles.mutedText}>{formatDate(event.reviewed_at)}</Text>
                {event.review_notes ? <Text style={globalStyles.mutedText}>{event.review_notes}</Text> : null}
              </View>
            ))
          )}
        </View>
      ) : null}

      <AppBottomNav />
    </ScrollView>
  );
}

function ReviewButton({
  label,
  disabled,
  onPress,
  secondary = false,
  danger = false,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary ? styles.secondaryButton : null,
        danger ? styles.dangerButton : null,
        disabled ? styles.disabledButton : null,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  errorText: { color: "#B42318", lineHeight: 20 },
  notesInput: {
    minHeight: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C7D7CF",
    backgroundColor: "#FFFFFF",
    color: "#20382B",
    padding: 12,
    textAlignVertical: "top",
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: {
    borderRadius: 10,
    backgroundColor: "#2F6B50",
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  secondaryButton: { backgroundColor: "#8A641D" },
  dangerButton: { backgroundColor: "#A33A32" },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: "#FFFFFF", fontWeight: "900" },
});
