import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useSensitiveAccess } from "../../components/security/SensitiveRouteBoundary";
import {
  evaluateSessionAlerts,
  generateSessionAgenda,
  listCaseSessions,
  type CaseSessionRecord,
} from "../../lib/engines/sessionManagementEngine";

export default function SessionsScreen() {
  const access = useSensitiveAccess();
  const caseId = access?.caseId ?? null;
  const [phase, setPhase] = useState("");
  const [courseContext, setCourseContext] = useState("");
  const [sessions, setSessions] = useState<CaseSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const agenda = useMemo(
    () =>
      generateSessionAgenda({
        phase: phase.trim() || "Current review phase",
        courseContext: courseContext.trim() || "Current program or course focus",
        currentRiskBand: "High",
      }),
    [courseContext, phase],
  );
  const alerts = evaluateSessionAlerts(sessions);
  const completedCount = sessions.filter((session) => session.status === "completed").length;
  const missedCount = sessions.filter((session) => session.status === "missed").length;

  const loadSessions = useCallback(async () => {
    if (!caseId) {
      setSessions([]);
      setErrorMessage("An authorised case must be selected before sessions can be loaded.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      setSessions(await listCaseSessions(caseId));
    } catch (error) {
      setSessions([]);
      setErrorMessage(error instanceof Error ? error.message : "Unable to load case sessions.");
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Session Management</Text>
      <Text style={styles.body}>
        Session records are loaded only from the authorised case selected for this account. Notes, consent, scores, and missed-session prompts remain tied to that case.
      </Text>

      <View style={styles.readyNotice}>
        <Text style={styles.noticeTitle}>Authorised case</Text>
        <Text style={styles.body}>{caseId ?? "No active case is available."}</Text>
        <Pressable style={styles.button} onPress={loadSessions} disabled={isLoading || !caseId}>
          <Text style={styles.buttonText}>{isLoading ? "Loading..." : "Refresh sessions"}</Text>
        </Pressable>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Generate session agenda</Text>
        <Input value={phase} onChangeText={setPhase} placeholder="Current phase" />
        <Input value={courseContext} onChangeText={setCourseContext} placeholder="Course or program focus" />
        {agenda.map((item) => (
          <View key={`${item.source}-${item.title}`} style={styles.agendaRow}>
            <Text style={styles.agendaSource}>{item.source}</Text>
            <Text style={styles.agendaTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.purpose}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live session records</Text>
        {sessions.length > 0 ? (
          <>
            <View style={styles.summaryGrid}>
              <Metric label="Total" value={sessions.length} />
              <Metric label="Completed" value={completedCount} />
              <Metric label="Missed" value={missedCount} />
              <Metric label="Alerts" value={alerts.length} />
            </View>
            {alerts.map((alert) => (
              <View key={`${alert.type}-${alert.title}`} style={styles.alertBox}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.body}>{alert.body}</Text>
              </View>
            ))}
            {sessions.map((session) => (
              <View key={session.id} style={styles.sessionRow}>
                <Text style={styles.agendaTitle}>{session.session_type}</Text>
                <Text style={styles.body}>
                  {session.status} - {new Date(session.scheduled_start_at).toLocaleString()}
                </Text>
                <Text style={styles.body}>
                  {session.audio_consent ? "Audio consent recorded." : "No audio consent recorded."}
                  {session.rubric_score !== null ? ` Rubric score: ${session.rubric_score}.` : ""}
                </Text>
              </View>
            ))}
          </>
        ) : !isLoading && !errorMessage ? (
          <Text style={styles.body}>No live session records are saved for this authorised case.</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} style={styles.input} placeholderTextColor="#66756E" />;
}

const styles = StyleSheet.create({
  container: { gap: 14, padding: 20, backgroundColor: "#EEF5EF" },
  title: { color: "#102033", fontSize: 28, fontWeight: "900" },
  body: { color: "#4B5D55", lineHeight: 21 },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D6E2D8",
    backgroundColor: "#FFFFFF",
  },
  readyNotice: {
    gap: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9FCBBA",
    backgroundColor: "#E7F3EE",
  },
  noticeTitle: { color: "#1F5A48", fontSize: 16, fontWeight: "900" },
  cardTitle: { color: "#102033", fontSize: 20, fontWeight: "900" },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#D6E2D8",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FBFDFB",
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#1F5A48",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  errorText: { color: "#B42318", fontSize: 14, fontWeight: "800" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { minWidth: 112, gap: 3, borderRadius: 8, backgroundColor: "#EEF5EF", padding: 10 },
  metricValue: { color: "#102033", fontSize: 22, fontWeight: "900" },
  metricLabel: { color: "#4B5D55", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  alertBox: { gap: 4, borderRadius: 8, backgroundColor: "#FFF7ED", padding: 10 },
  alertTitle: { color: "#9A3412", fontWeight: "900" },
  sessionRow: { gap: 5, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#EDF2F0" },
  agendaRow: { gap: 5, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#EDF2F0" },
  agendaSource: { alignSelf: "flex-start", color: "#1F5A48", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  agendaTitle: { color: "#102033", fontWeight: "900" },
});

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
