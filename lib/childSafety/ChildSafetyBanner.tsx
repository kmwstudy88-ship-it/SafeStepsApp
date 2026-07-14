import React from "react";
import { View, Text } from "react-native";

export default function ChildSafetyBanner() {
  return (
    <View
      style={{
        padding: 12,
        backgroundColor: "#ff7043",
        borderRadius: 8,
        marginBottom: 16
      }}
    >
      <Text style={{ color: "#fff", fontSize: 16 }}>
        🛡️ Child Safety Mode is ON
      </Text>
    </View>
  );
}
