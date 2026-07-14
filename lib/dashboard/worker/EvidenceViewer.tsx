import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import type { SafeStepsEvidenceRecord } from "../../games/engine/EvidenceModel";

type EvidenceViewerProps = {
  sessionId: string;
};

export default function EvidenceViewer({ sessionId }: EvidenceViewerProps) {
  const [records, setRecords] = useState<SafeStepsEvidenceRecord[]>([]);

  useEffect(() => {
    let mounted = true;

    fetch(`http://localhost:3000/evidence/${sessionId}`)
      .then((response) => response.json())
      .then((data: { records?: SafeStepsEvidenceRecord[] }) => {
        if (mounted) setRecords(data.records ?? []);
      })
      .catch(() => {
        if (mounted) setRecords([]);
      });

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Evidence for {sessionId}</Text>

      {records.map((record) => (
        <View
          key={`${record.sessionId}-${record.gameId}-${record.playerId}-${record.timestamp}`}
          style={{
            padding: 16,
            backgroundColor: "#fafafa",
            marginTop: 16,
            borderRadius: 8,
          }}
        >
          <Text>Game: {record.gameId}</Text>
          <Text>Player: {record.playerId}</Text>
          <Text>Action: {record.actionType}</Text>
          <Text>Data: {JSON.stringify(record.actionData)}</Text>
          <Text>Privacy: {record.privacy}</Text>
          <Text>Visible to Worker: {record.hiddenFromWorker ? "NO" : "YES"}</Text>
          <Text>Child Safety Mode: {record.childSafetyMode ? "ON" : "OFF"}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
