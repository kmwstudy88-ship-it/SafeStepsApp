import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

type ReflectionRecord = {
  sessionId: string;
  playerId: string;
  gameId: string;
  text: string;
  shareSetting: string;
  hiddenFromWorker?: boolean;
  timestamp: number;
};

type ReflectionViewerProps = {
  sessionId: string;
};

export default function ReflectionViewer({ sessionId }: ReflectionViewerProps) {
  const [reflections, setReflections] = useState<ReflectionRecord[]>([]);

  useEffect(() => {
    let mounted = true;

    fetch(`http://localhost:3000/reflection/${sessionId}`)
      .then((response) => response.json())
      .then((data: { reflections?: ReflectionRecord[] }) => {
        if (mounted) setReflections(data.reflections ?? []);
      })
      .catch(() => {
        if (mounted) setReflections([]);
      });

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Reflections for {sessionId}</Text>

      {reflections.map((reflection) => (
        <View
          key={`${reflection.sessionId}-${reflection.gameId}-${reflection.playerId}-${reflection.timestamp}`}
          style={{
            padding: 16,
            backgroundColor: "#fafafa",
            marginTop: 16,
            borderRadius: 8,
          }}
        >
          <Text>Player: {reflection.playerId}</Text>
          <Text>Game: {reflection.gameId}</Text>
          <Text>Reflection: {reflection.hiddenFromWorker ? "[hidden]" : reflection.text}</Text>
          <Text>Share Setting: {reflection.shareSetting}</Text>
          <Text>Timestamp: {new Date(reflection.timestamp).toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
