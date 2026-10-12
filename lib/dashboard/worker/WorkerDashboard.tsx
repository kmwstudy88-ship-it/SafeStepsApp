import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";

type WorkerSession = {
  sessionId?: string;
  roomCode?: string;
  familyName?: string;
  players?: { id: string; name: string }[];
  privacy?: "family_only" | "worker_supported" | "contact_visit";
  childSafetyMode?: boolean;
  evidenceCount?: number;
};

export default function WorkerDashboard() {
  const [sessions, setSessions] = useState<WorkerSession[]>([]);

  useEffect(() => {
    let mounted = true;

    fetch("http://localhost:3000/sessions")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          setSessions(data.sessions ?? []);
        }
      })
      .catch(() => {
        if (mounted) {
          setSessions([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ color: "#173B45", fontSize: 24, fontWeight: "900" }}>SafeSteps Worker Dashboard</Text>
      <Text style={{ color: "#385C63", marginTop: 6 }}>
        Review active rooms, contact-visit privacy mode, child-safety status, and evidence counts.
      </Text>

      {sessions.map((session, index) => (
        <TouchableOpacity
          key={session.sessionId ?? session.roomCode ?? String(index)}
          style={{
            padding: 16,
            backgroundColor: "#F4F7F6",
            marginTop: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#D9E2DC",
          }}
        >
          <Text style={{ color: "#173B45", fontSize: 18, fontWeight: "900" }}>
            {session.sessionId ?? "Active room"}
          </Text>
          {session.familyName ? <Text>Family: {session.familyName}</Text> : null}
          <Text>Room Code: {session.roomCode ?? "Not assigned"}</Text>
          <Text>Players: {session.players?.length ?? 0}</Text>
          <Text>Privacy Mode: {session.privacy ?? "contact_visit"}</Text>
          <Text>Child Safety: {session.childSafetyMode ? "ON" : "OFF"}</Text>
          <Text>Evidence Count: {session.evidenceCount ?? 0}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
