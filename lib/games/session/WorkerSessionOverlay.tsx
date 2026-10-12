import React from "react";
import { Text, View } from "react-native";

export type WorkerSessionOverlayProps = {
  workerName: string;
};

export default function WorkerSessionOverlay({ workerName }: WorkerSessionOverlayProps) {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        padding: 10,
        backgroundColor: "#B85934",
        borderBottomLeftRadius: 8,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "900" }}>Worker present: {workerName}</Text>
    </View>
  );
}
