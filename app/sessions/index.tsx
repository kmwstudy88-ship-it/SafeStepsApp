import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
  generateSessionAgenda,
  sessionIsMissed,
  type CaseSessionRecord,
} from "../../lib/engines/sessionManagementEngine";

const sampleSessions: CaseSessionRecord[] = [
  {
    id: "session-foundation-1",
    case_id: "sample-case",
    parent_user_id: null,
    worker_user_id: null,
    session_type: "worker_session",
    scheduled_start_at: "2026-07-08T09:00:00.000Z",
    scheduled_end_at: "2026-07-08T10:00:00.000Z",
    status: "completed",
    phase: "Foundation",
    course_context: "Reunification Parenting Foundations",
    agenda: generateSessionAgenda({
      phase: "Foundation",
      courseContext: "Reunification Parenting Foundations",
      currentRiskBand: "Moderate",
    }),
    notes: "Reviewed accountability reflection and home routine evidence.",
    parent_confirmed_at: "2026-07-07T20:00:00.000Z",
    audio_consent: false,
    audio_file_path: null,
    transcript_text: null,
    transcript_metadata: {},
    rubric_score: 3,
    missed_reason: null,
    alert_generated: false,
    created_at: "2026-07-07T00:00:00.000Z",
  },
  {
    id: "session-risk-review",
    case_id: "sample-case",
    parent_user_id: null,
    worker_user_id: null,
    session_type: "contact_review",
    scheduled_start_at: "2026-07-10T09:00:00.000Z",
    scheduled_end_at: "2026-07-10T10:00:00.000Z",
    status: "scheduled",
    phase: "Generalisation",
    course_context: "Safe Contact and Repair",
    agenda: generateSessionAgenda({
      phase: "Generalisation",
      courseContext: "Safe Contact and Repair",
      currentRiskBand: "High",
    }),
    notes: "",
    parent_confirmed_at: null,
    audio_consent: false,
    audio_file_path: null,
    transcript_text: null,
    transcript_metadata: {},
    rubric_score: null,
    missed_reason: null,
    alert_generated: false,
    created_at: "2026-07-06T00:00:00.000Z",
  },
];

export default function SessionsScreen() {
  const [phase, setPhase] = useState("Foundation");
  const [courseContext, setCourseContext] = useState("Reunification Parenting Foundations");
  const agenda = useMemo(
    () => generateSessionAgenda({ phase, courseContext, currentRiskBand: "High" }),
    [courseContext, phase],
  );
  const missedSessions = sampleSessions.filter((session) => sessionIsMissed(session, new Date("2026-07-13T00:00:00.000Z")));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Session Management</Text>
      <Text style={styles.body}>
        Schedule worker sessions, generate phase-based agendas, record notes, capture consented transcript details, score the session, and flag missed sessions.
      </Text>

      <View style={styles.demoNotice}>
        <Text style={styles.demoTitle}>Example records only</Text>
        <Text style={styles.body}>
          The records below are sample data for checking agenda and missed-session logic. Live session records should be loaded from the case database before this screen is used in production.
        </Text>
      </View>

      <View style={missedSessions.length > 0 ? styles.alertCard : styles.card}>
        <Text style={styles.cardTitle}>Example missed-session monitoring</Text>
        <Text style={styles.body}>
          {missedSessions.length > 0
            ? `${missedSessions.length} scheduled session needs worker/supervisor review.`
            : "No missed scheduled sessions in the current view."}
        </Text>
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
        <Text style={styles.cardTitle}>Example session records</Text>
        {sampleSessions.map((session) => (
          <View key={session.id} style={styles.sessionRow}>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={styles.sessionTitle}>{session.phase} - {session.session_type.replace(/_/g, " ")}</Text>
              <Text style={styles.body}>{new Date(session.scheduled_start_at).toLocaleString()}</Text>
              <Text style={styles.statusText}>Status: {session.status}</Text>
              <Text style={styles.body}>Agenda items: {session.agenda.length}</Text>
              <Text style={styles.body}>Audio consent: {session.audio_consent ? "Yes" : "No"}</Text>
              <Text style={styles.body}>Rubric score: {session.rubric_score ?? "Not scored"}</Text>
            </View>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Open</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} style={styles.input} placeholderTextColor="#66756E" />;
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 20,
    backgroundColor: "#EEF5EF",
  },
  title: {
    color: "#102033",
    fontSize: 28,
    fontWeight: "900",
  },
  body: {
    color: "#4B5D55",
    lineHeight: 21,
  },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6E2D8",
    backgroundColor: "#FFFFFF",
  },
  demoNotice: {
    gap: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B45309",
    backgroundColor: "#FFFBEB",
  },
  demoTitle: {
    color: "#92400E",
    fontSize: 16,
    fontWeight: "900",
  },
  alertCard: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D56A4D",
    backgroundColor: "#FFF2ED",
  },
  cardTitle: {
    color: "#102033",
    fontSize: 20,
    fontWeight: "900",
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#D6E2D8",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FBFDFB",
  },
  agendaRow: {
    gap: 5,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F0",
  },
  agendaSource: {
    alignSelf: "flex-start",
    color: "#1F5A48",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  agendaTitle: {
    color: "#102033",
    fontWeight: "900",
  },
  sessionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F0",
  },
  sessionTitle: {
    color: "#102033",
    fontWeight: "900",
    textTransform: "capitalize",
  },
  statusText: {
    color: "#1F5A48",
    fontWeight: "900",
    textTransform: "capitalize",
  },
  button: {
    minHeight: 40,
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#2F5F4A",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});
